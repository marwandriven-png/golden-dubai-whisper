 import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
 import {
   Users,
   Clock,
   CheckCircle,
   XCircle,
   LogOut,
   RefreshCw,
   Building2,
 } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 import type { Database } from "@/integrations/supabase/types";
 
 type InvestorRegistration = Database["public"]["Tables"]["investor_registrations"]["Row"];
 
 const investorTypeLabels: Record<string, string> = {
   family_office: "Family Office",
   institutional: "Institutional",
   private_investor: "Private Investor",
   operator: "Hotel Operator",
   other: "Other",
 };
 
 const capacityLabels: Record<string, string> = {
   under_5m: "< $5M",
   "5m_to_10m": "$5-10M",
   "10m_to_25m": "$10-25M",
   "25m_to_50m": "$25-50M",
   over_50m: "> $50M",
 };
 
 const AdminDashboard = () => {
   const [registrations, setRegistrations] = useState<InvestorRegistration[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
   const [isAdmin, setIsAdmin] = useState(false);
   const { toast } = useToast();
   const navigate = useNavigate();
 
   useEffect(() => {
     checkAdminAccess();
   }, []);
 
   useEffect(() => {
     if (isAdmin) {
       fetchRegistrations();
     }
   }, [isAdmin]);
 
   const checkAdminAccess = async () => {
     const { data: { session } } = await supabase.auth.getSession();
     if (!session) {
       navigate("/auth");
       return;
     }
 
     const { data } = await supabase
       .from("user_roles")
       .select("role")
       .eq("user_id", session.user.id)
       .eq("role", "admin")
       .maybeSingle();
 
     if (!data) {
       toast({
         title: "Access denied",
         description: "You don't have admin privileges.",
         variant: "destructive",
       });
       navigate("/");
       return;
     }
 
     setIsAdmin(true);
   };
 
   const fetchRegistrations = async () => {
     setIsLoading(true);
     const { data, error } = await supabase
       .from("investor_registrations")
       .select("*")
       .order("created_at", { ascending: false });
 
     if (error) {
       toast({
         title: "Error loading registrations",
         description: error.message,
         variant: "destructive",
       });
     } else {
       setRegistrations(data || []);
     }
     setIsLoading(false);
   };
 
    const sendNotification = async (investorId: string, action: "approved" | "rejected") => {
      try {
        const { error } = await supabase.functions.invoke("notify-investor", {
          body: { investorId, action },
        });
        if (error) {
          console.error("Notification error:", error);
          toast({
            title: "Notification failed",
            description: "Status updated but email notification could not be sent.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Notification error:", err);
      }
    };

    const handleApprove = async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase
        .from("investor_registrations")
        .update({
          approval_status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: session?.user.id,
        })
        .eq("id", id);

      if (error) {
        toast({
          title: "Error approving investor",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Investor approved",
          description: "The investor can now access the investment memorandum.",
        });
        sendNotification(id, "approved");
        fetchRegistrations();
      }
    };

    const handleReject = async (id: string) => {
      const { error } = await supabase
        .from("investor_registrations")
        .update({
          approval_status: "rejected",
        })
        .eq("id", id);

      if (error) {
        toast({
          title: "Error rejecting investor",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Investor rejected" });
        sendNotification(id, "rejected");
        fetchRegistrations();
      }
    };
 
   const handleRevoke = async (id: string) => {
     const { error } = await supabase
       .from("investor_registrations")
       .update({
         approval_status: "pending",
         approved_at: null,
         approved_by: null,
       })
       .eq("id", id);
 
     if (error) {
       toast({
         title: "Error revoking access",
         description: error.message,
         variant: "destructive",
       });
     } else {
       toast({ title: "Access revoked" });
       fetchRegistrations();
     }
   };
 
   const handleLogout = async () => {
     await supabase.auth.signOut();
     navigate("/");
   };
 
   const filteredRegistrations = registrations.filter(
     (r) => r.approval_status === activeTab
   );
 
   const stats = {
     total: registrations.length,
     pending: registrations.filter((r) => r.approval_status === "pending").length,
     approved: registrations.filter((r) => r.approval_status === "approved").length,
     rejected: registrations.filter((r) => r.approval_status === "rejected").length,
   };
 
   if (!isAdmin) {
     return (
       <div className="min-h-screen bg-secondary flex items-center justify-center">
         <div className="text-center">
           <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
           <p className="text-muted-foreground">Checking access...</p>
         </div>
       </div>
     );
   }
 
   return (
     <div className="min-h-screen bg-secondary">
       <header className="bg-primary text-primary-foreground px-8 py-4">
         <div className="max-w-6xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary-foreground/10 flex items-center justify-center">
               <Building2 className="w-5 h-5" />
             </div>
             <div>
               <div className="font-display font-bold">Admin Dashboard</div>
               <div className="text-xs text-primary-foreground/60">
                 Investor Management
               </div>
             </div>
           </div>
           <button
             onClick={handleLogout}
             className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
           >
             <LogOut className="w-4 h-4" />
             <span>Logout</span>
           </button>
         </div>
       </header>
 
       <div className="max-w-6xl mx-auto px-8 py-8">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
           <div className="bg-background p-4 border border-border">
             <div className="text-sm text-muted-foreground mb-1">Total</div>
             <div className="text-3xl font-bold font-display">{stats.total}</div>
           </div>
           <div className="bg-background p-4 border border-border">
             <div className="text-sm text-muted-foreground mb-1">Pending</div>
             <div className="text-3xl font-bold font-display text-amber-500">
               {stats.pending}
             </div>
           </div>
           <div className="bg-background p-4 border border-border">
             <div className="text-sm text-muted-foreground mb-1">Approved</div>
             <div className="text-3xl font-bold font-display text-green-500">
               {stats.approved}
             </div>
           </div>
           <div className="bg-background p-4 border border-border">
             <div className="text-sm text-muted-foreground mb-1">Rejected</div>
             <div className="text-3xl font-bold font-display text-red-500">
               {stats.rejected}
             </div>
           </div>
         </div>
 
         <div className="flex items-center gap-2 mb-6">
           <button
             onClick={() => setActiveTab("pending")}
             className={`flex items-center gap-2 px-4 py-2 font-medium ${
               activeTab === "pending"
                 ? "bg-accent text-accent-foreground"
                 : "bg-background border border-border hover:bg-muted"
             }`}
           >
             <Clock className="w-4 h-4" />
             <span>Pending ({stats.pending})</span>
           </button>
           <button
             onClick={() => setActiveTab("approved")}
             className={`flex items-center gap-2 px-4 py-2 font-medium ${
               activeTab === "approved"
                 ? "bg-accent text-accent-foreground"
                 : "bg-background border border-border hover:bg-muted"
             }`}
           >
             <CheckCircle className="w-4 h-4" />
             <span>Approved ({stats.approved})</span>
           </button>
           <button
             onClick={() => setActiveTab("rejected")}
             className={`flex items-center gap-2 px-4 py-2 font-medium ${
               activeTab === "rejected"
                 ? "bg-accent text-accent-foreground"
                 : "bg-background border border-border hover:bg-muted"
             }`}
           >
             <XCircle className="w-4 h-4" />
             <span>Rejected ({stats.rejected})</span>
           </button>
           <button
             onClick={fetchRegistrations}
             disabled={isLoading}
             className="ml-auto flex items-center gap-2 px-4 py-2 bg-background border border-border hover:bg-muted"
           >
             <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
             <span>Refresh</span>
           </button>
         </div>
 
         <div className="bg-background border border-border overflow-hidden">
           {isLoading ? (
             <div className="p-8 text-center text-muted-foreground">Loading...</div>
           ) : filteredRegistrations.length === 0 ? (
             <div className="p-8 text-center text-muted-foreground">
               No {activeTab} registrations
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-sm">
                 <thead className="bg-muted">
                   <tr>
                     <th className="text-left px-4 py-3 font-medium">Investor</th>
                     <th className="text-left px-4 py-3 font-medium">Type</th>
                     <th className="text-left px-4 py-3 font-medium">Capacity</th>
                     <th className="text-left px-4 py-3 font-medium">Registered</th>
                     {activeTab === "approved" && (
                       <th className="text-left px-4 py-3 font-medium">Last Login</th>
                     )}
                     <th className="text-right px-4 py-3 font-medium">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {filteredRegistrations.map((reg) => (
                     <motion.tr
                       key={reg.id}
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       className="border-t border-border"
                     >
                       <td className="px-4 py-3">
                         <div className="font-medium">{reg.full_name}</div>
                         <div className="text-xs text-muted-foreground">
                           {reg.email}
                         </div>
                         {reg.company_name && (
                           <div className="text-xs text-muted-foreground">
                             {reg.company_name}
                           </div>
                         )}
                       </td>
                       <td className="px-4 py-3">
                         {investorTypeLabels[reg.investor_type] || reg.investor_type}
                       </td>
                       <td className="px-4 py-3">
                         {capacityLabels[reg.investment_capacity] ||
                           reg.investment_capacity}
                       </td>
                       <td className="px-4 py-3 text-muted-foreground">
                         {new Date(reg.created_at).toLocaleDateString()}
                       </td>
                       {activeTab === "approved" && (
                         <td className="px-4 py-3 text-muted-foreground">
                           {reg.last_login_at
                             ? new Date(reg.last_login_at).toLocaleDateString()
                             : "Never"}
                         </td>
                       )}
                       <td className="px-4 py-3 text-right">
                         {activeTab === "pending" && (
                           <div className="flex justify-end gap-2">
                             <button
                               onClick={() => handleApprove(reg.id)}
                               className="px-3 py-1 bg-green-500 text-white text-xs font-medium hover:bg-green-600"
                             >
                               Approve
                             </button>
                             <button
                               onClick={() => handleReject(reg.id)}
                               className="px-3 py-1 bg-red-500 text-white text-xs font-medium hover:bg-red-600"
                             >
                               Reject
                             </button>
                           </div>
                         )}
                         {activeTab === "approved" && (
                           <button
                             onClick={() => handleRevoke(reg.id)}
                             className="px-3 py-1 bg-amber-500 text-white text-xs font-medium hover:bg-amber-600"
                           >
                             Revoke
                           </button>
                         )}
                         {activeTab === "rejected" && (
                           <button
                             onClick={() => handleApprove(reg.id)}
                             className="px-3 py-1 bg-green-500 text-white text-xs font-medium hover:bg-green-600"
                           >
                             Re-approve
                           </button>
                         )}
                       </td>
                     </motion.tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </div>
       </div>
     </div>
   );
 };
 
 export default AdminDashboard;