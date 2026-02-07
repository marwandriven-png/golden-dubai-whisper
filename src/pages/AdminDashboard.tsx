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
  Database as DatabaseIcon,
  Sheet,
  ExternalLink,
  Settings,
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

  // Google Sheets sync panel state
  const [sheetsConfig, setSheetsConfig] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEditingSheets, setIsEditingSheets] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchRegistrations();
      fetchSheetsConfig();
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

  const fetchSheetsConfig = async () => {
    const { data, error } = await supabase
      .from("google_sheets_config")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (!error && data) {
      setSheetsConfig(data);
      setSheetUrl(data.sheet_url);
    }
  };

  const handleSheetsSync = async () => {
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("sync-google-sheets", {
        body: { forceSync: true },
      });

      if (error) throw error;

      toast({
        title: "Sync completed",
        description: `Successfully synced ${data.contactsSynced || 0} contacts from Google Sheets`,
      });

      await fetchSheetsConfig();
      await fetchRegistrations();
    } catch (error: any) {
      console.error("Sync error:", error);
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync Google Sheets",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveSheetsConfig = async () => {
    try {
      const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        throw new Error("Invalid Google Sheets URL");
      }

      const sheetId = match[1];

      if (sheetsConfig) {
        const { error } = await supabase
          .from("google_sheets_config")
          .update({ sheet_url: sheetUrl, sheet_id: sheetId })
          .eq("id", sheetsConfig.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("google_sheets_config")
          .insert({ sheet_url: sheetUrl, sheet_id: sheetId, is_active: true });
        if (error) throw error;
      }

      toast({
        title: "Configuration saved",
        description: "Google Sheets configuration updated successfully",
      });

      setIsEditingSheets(false);
      await fetchSheetsConfig();
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    }
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
        {/* Google Sheets Sync Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background border border-border p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                {!sheetsConfig ? (
                  <Settings className="w-5 h-5 text-muted-foreground" />
                ) : sheetsConfig.sync_status === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : sheetsConfig.sync_status === "error" ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : sheetsConfig.sync_status === "syncing" ? (
                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">Google Sheets Auto-Approval</h3>
                <p className="text-xs text-muted-foreground">
                  {!sheetsConfig
                    ? "Not configured"
                    : sheetsConfig.sync_status === "success"
                      ? "Synced successfully"
                      : sheetsConfig.sync_status === "error"
                        ? "Sync failed"
                        : sheetsConfig.sync_status === "syncing"
                          ? "Syncing..."
                          : "Pending sync"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditingSheets(!isEditingSheets)}
              className="text-xs text-accent hover:underline"
            >
              {isEditingSheets ? "Cancel" : "Configure"}
            </button>
          </div>

          {isEditingSheets ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Google Sheets URL
                </label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste the full URL of your Google Sheet containing pre-approved contacts
                </p>
              </div>
              <button
                onClick={handleSaveSheetsConfig}
                className="w-full bg-accent text-accent-foreground py-2 text-sm font-semibold hover:bg-accent/90 transition-colors"
              >
                Save Configuration
              </button>
            </div>
          ) : sheetsConfig ? (
            <div className="space-y-3">
              <div className="bg-muted p-3 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Sheet URL:</span>
                  <a
                    href={sheetsConfig.sheet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline flex items-center gap-1"
                  >
                    <span className="max-w-[200px] truncate">View Sheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {sheetsConfig.last_synced_at && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Last Synced:</span>
                    <span className="font-medium">
                      {new Date(sheetsConfig.last_synced_at).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contacts Synced:</span>
                  <span className="font-medium">{sheetsConfig.total_contacts_synced || 0}</span>
                </div>
              </div>

              {sheetsConfig.sync_error && (
                <div className="bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  <strong>Error:</strong> {sheetsConfig.sync_error}
                </div>
              )}

              <button
                onClick={handleSheetsSync}
                disabled={isSyncing}
                className="w-full bg-primary text-primary-foreground py-2 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              <p>No Google Sheets configuration found.</p>
              <p className="mt-2">Click "Configure" to set up auto-approval from Google Sheets.</p>
            </div>
          )}
        </motion.div>

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
            className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === "pending"
              ? "bg-accent text-accent-foreground"
              : "bg-background border border-border hover:bg-muted"
              }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending ({stats.pending})</span>
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === "approved"
              ? "bg-accent text-accent-foreground"
              : "bg-background border border-border hover:bg-muted"
              }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approved ({stats.approved})</span>
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === "rejected"
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
                    <th className="text-left px-4 py-3 font-medium">Source</th>
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
                        {reg.approval_source === 'google_sheets' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium">
                            <Sheet className="w-3 h-3" />
                            Sheets
                          </span>
                        ) : reg.approval_source === 'local_db' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium">
                            <DatabaseIcon className="w-3 h-3" />
                            Local
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium">
                            Manual
                          </span>
                        )}
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
