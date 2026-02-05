 import { useEffect, useState } from "react";
 import { Navigate } from "react-router-dom";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 
 interface ProtectedTeaserRouteProps {
   children: React.ReactNode;
 }
 
 const ProtectedTeaserRoute = ({ children }: ProtectedTeaserRouteProps) => {
   const [isLoading, setIsLoading] = useState(true);
   const [isApproved, setIsApproved] = useState(false);
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const { toast } = useToast();
 
   useEffect(() => {
     checkAccess();
   }, []);
 
   const checkAccess = async () => {
     const { data: { session } } = await supabase.auth.getSession();
     
     if (!session) {
       setIsAuthenticated(false);
       setIsLoading(false);
       return;
     }
 
     setIsAuthenticated(true);
 
     const { data: adminRole } = await supabase
       .from("user_roles")
       .select("role")
       .eq("user_id", session.user.id)
       .eq("role", "admin")
       .maybeSingle();
 
     if (adminRole) {
       setIsApproved(true);
       setIsLoading(false);
       return;
     }
 
     const { data: registration } = await supabase
       .from("investor_registrations")
       .select("approval_status")
       .eq("email", session.user.email)
       .maybeSingle();
 
     if (registration?.approval_status === "approved") {
       setIsApproved(true);
       await supabase.rpc("update_investor_last_login", {
         _email: session.user.email,
       });
     } else {
       toast({
         title: "Access pending",
         description: "Your registration is still under review.",
         variant: "destructive",
       });
     }
 
     setIsLoading(false);
   };
 
   if (isLoading) {
     return (
       <div className="min-h-screen bg-secondary flex items-center justify-center">
         <div className="text-center">
           <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
           <p className="text-muted-foreground">Verifying access...</p>
         </div>
       </div>
     );
   }
 
   if (!isAuthenticated) {
     return <Navigate to="/auth" replace />;
   }
 
   if (!isApproved) {
     return <Navigate to="/" replace />;
   }
 
   return <>{children}</>;
 };
 
 export default ProtectedTeaserRoute;