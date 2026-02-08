import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  RefreshCw,
  Building2,
  Sheet,
  ExternalLink,
  Settings,
  Shield,
  Timer,
  FileCheck,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PreApprovedContacts from "@/components/admin/PreApprovedContacts";

interface Registration {
  id: string;
  email: string;
  full_name: string;
  company_name: string | null;
  company_domain: string | null;
  phone_number: string | null;
  investor_type: string;
  investment_capacity: string;
  approval_status: string;
  approval_source: string | null;
  approved_at: string | null;
  nda_accepted_at: string;
  access_token_id: string | null;
  last_login_at: string | null;
  created_at: string;
  email_reputation_score: number | null;
}

interface AccessToken {
  id: string;
  expires_at: string;
  is_revoked: boolean;
  access_count: number;
  last_accessed_at: string | null;
  first_accessed_at: string | null;
}

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

function getExpiryInfo(expiresAt: string): { label: string; isExpired: boolean; color: string } {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return { label: "Expired", isExpired: true, color: "text-destructive" };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return { label: `${hours}h ${minutes}m left`, isExpired: false, color: hours < 4 ? "text-amber-500" : "text-green-600" };
  return { label: `${minutes}m left`, isExpired: false, color: "text-amber-500" };
}

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [accessTokens, setAccessTokens] = useState<Record<string, AccessToken>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [activeSection, setActiveSection] = useState<"registrations" | "contacts">("registrations");
  const [isAdmin, setIsAdmin] = useState(false);
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
    if (!session) { navigate("/auth"); return; }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!data) {
      toast({ title: "Access denied", description: "Admin privileges required.", variant: "destructive" });
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
      toast({ title: "Error loading registrations", description: error.message, variant: "destructive" });
    } else {
      const regs = (data || []) as unknown as Registration[];
      setRegistrations(regs);

      // Fetch access tokens for approved registrations
      const tokenIds = regs
        .filter((r) => r.access_token_id)
        .map((r) => r.access_token_id!);

      if (tokenIds.length > 0) {
        const { data: tokens } = await (supabase as any)
          .from("access_tokens")
          .select("id, expires_at, is_revoked, access_count, last_accessed_at, first_accessed_at")
          .in("id", tokenIds);

        if (tokens) {
          const tokenMap: Record<string, AccessToken> = {};
          tokens.forEach((t: AccessToken) => { tokenMap[t.id] = t; });
          setAccessTokens(tokenMap);
        }
      }
    }
    setIsLoading(false);
  };

  const fetchSheetsConfig = async () => {
    const { data } = await (supabase as any)
      .from("google_sheets_config")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (data) {
      setSheetsConfig(data);
      setSheetUrl(data.sheet_url);
    }
  };

  const handleSheetsSync = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-google-sheets", {
        body: { forceSync: true },
      });
      if (error) throw error;
      toast({ title: "Sync completed", description: `Synced ${data?.contactsSynced || 0} contacts` });
      await fetchSheetsConfig();
      await fetchRegistrations();
    } catch (error: any) {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveSheetsConfig = async () => {
    try {
      const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) throw new Error("Invalid Google Sheets URL");
      const sheetId = match[1];

      if (sheetsConfig) {
        const { error } = await (supabase as any)
          .from("google_sheets_config")
          .update({ sheet_url: sheetUrl, sheet_id: sheetId })
          .eq("id", sheetsConfig.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("google_sheets_config")
          .insert({ sheet_url: sheetUrl, sheet_id: sheetId, is_active: true });
        if (error) throw error;
      }

      toast({ title: "Configuration saved" });
      setIsEditingSheets(false);
      await fetchSheetsConfig();
    } catch (error: any) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
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
      toast({ title: "Error approving investor", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Investor approved", description: "Sending notification email with teaser link..." });
      // Notify generates token + sends email
      supabase.functions.invoke("notify-investor", { body: { investorId: id, action: "approved" } }).catch(console.error);
      setTimeout(fetchRegistrations, 2000);
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("investor_registrations")
      .update({ approval_status: "rejected" })
      .eq("id", id);

    if (error) {
      toast({ title: "Error rejecting investor", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Investor rejected" });
      supabase.functions.invoke("notify-investor", { body: { investorId: id, action: "rejected" } }).catch(console.error);
      fetchRegistrations();
    }
  };

  const handleRevokeAccess = async (id: string, tokenId: string | null) => {
    // Revoke token if exists
    if (tokenId) {
      await (supabase as any)
        .from("access_tokens")
        .update({ is_revoked: true })
        .eq("id", tokenId);
    }
    // Set back to pending
    const { error } = await supabase
      .from("investor_registrations")
      .update({ approval_status: "pending", approved_at: null, approved_by: null })
      .eq("id", id);

    if (!error) {
      toast({ title: "Access revoked" });
      fetchRegistrations();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredRegistrations = registrations.filter((r) => r.approval_status === activeTab);

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
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/10 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold">Admin Dashboard</div>
              <div className="text-xs text-primary-foreground/60">Investor Management</div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Google Sheets Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-background border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                {!sheetsConfig ? <Settings className="w-5 h-5 text-muted-foreground" />
                  : sheetsConfig.sync_status === "success" ? <CheckCircle className="w-5 h-5 text-green-600" />
                  : sheetsConfig.sync_status === "error" ? <XCircle className="w-5 h-5 text-destructive" />
                  : sheetsConfig.sync_status === "syncing" ? <RefreshCw className="w-5 h-5 text-accent animate-spin" />
                  : <Clock className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <h3 className="font-semibold">Google Sheets Auto-Approval</h3>
                <p className="text-xs text-muted-foreground">
                  {!sheetsConfig ? "Not configured" : sheetsConfig.sync_status === "success" ? `Synced • ${sheetsConfig.total_contacts_synced || 0} contacts` : sheetsConfig.sync_status === "error" ? "Sync failed" : "Pending sync"}
                </p>
              </div>
            </div>
            <button onClick={() => setIsEditingSheets(!isEditingSheets)} className="text-xs text-accent hover:underline">
              {isEditingSheets ? "Cancel" : "Configure"}
            </button>
          </div>

          {isEditingSheets ? (
            <div className="space-y-3">
              <input type="url" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              <p className="text-xs text-muted-foreground">Sheet must be publicly accessible. Must have "email" or "phone" column headers.</p>
              <button onClick={handleSaveSheetsConfig} className="w-full bg-accent text-accent-foreground py-2 text-sm font-semibold hover:bg-accent/90 transition-colors">Save Configuration</button>
            </div>
          ) : sheetsConfig ? (
            <div className="space-y-3">
              <div className="bg-muted p-3 text-sm flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Sheet:</span>
                    <a href={sheetsConfig.sheet_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {sheetsConfig.last_synced_at && (
                    <div className="text-muted-foreground">Last synced: {new Date(sheetsConfig.last_synced_at).toLocaleString()}</div>
                  )}
                </div>
                <button onClick={handleSheetsSync} disabled={isSyncing} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Syncing..." : "Sync Now"}
                </button>
              </div>
              {sheetsConfig.sync_error && (
                <div className="bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  <strong>Error:</strong> {sheetsConfig.sync_error}
                </div>
              )}
            </div>
          ) : null}
        </motion.div>

        {/* Section Toggle */}
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setActiveSection("registrations")} className={`flex items-center gap-2 px-4 py-2 font-medium text-sm ${activeSection === "registrations" ? "bg-primary text-primary-foreground" : "bg-background border border-border hover:bg-muted"}`}>
            <Users className="w-4 h-4" />
            Registrations ({stats.total})
          </button>
          <button onClick={() => setActiveSection("contacts")} className={`flex items-center gap-2 px-4 py-2 font-medium text-sm ${activeSection === "contacts" ? "bg-primary text-primary-foreground" : "bg-background border border-border hover:bg-muted"}`}>
            <Shield className="w-4 h-4" />
            Pre-Approved Contacts
          </button>
        </div>

        {activeSection === "contacts" ? (
          <PreApprovedContacts />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-background p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Total</div>
                <div className="text-3xl font-bold font-display">{stats.total}</div>
              </div>
              <div className="bg-background p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Pending</div>
                <div className="text-3xl font-bold font-display text-amber-500">{stats.pending}</div>
              </div>
              <div className="bg-background p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Approved</div>
                <div className="text-3xl font-bold font-display text-green-600">{stats.approved}</div>
              </div>
              <div className="bg-background p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Rejected</div>
                <div className="text-3xl font-bold font-display text-destructive">{stats.rejected}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6">
              {(["pending", "approved", "rejected"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-4 py-2 font-medium text-sm ${activeTab === tab ? "bg-accent text-accent-foreground" : "bg-background border border-border hover:bg-muted"}`}>
                  {tab === "pending" && <Clock className="w-4 h-4" />}
                  {tab === "approved" && <CheckCircle className="w-4 h-4" />}
                  {tab === "rejected" && <XCircle className="w-4 h-4" />}
                  <span className="capitalize">{tab} ({stats[tab]})</span>
                </button>
              ))}
              <button onClick={fetchRegistrations} disabled={isLoading} className="ml-auto flex items-center gap-2 px-4 py-2 bg-background border border-border hover:bg-muted text-sm">
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {/* Table */}
            <div className="bg-background border border-border overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No {activeTab} registrations</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Investor</th>
                        <th className="text-left px-4 py-3 font-medium">Source</th>
                        <th className="text-left px-4 py-3 font-medium">NDA</th>
                        {activeTab === "approved" && (
                          <>
                            <th className="text-left px-4 py-3 font-medium">Access Expiry</th>
                            <th className="text-left px-4 py-3 font-medium">Views</th>
                          </>
                        )}
                        <th className="text-left px-4 py-3 font-medium">Registered</th>
                        <th className="text-right px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map((reg) => {
                        const token = reg.access_token_id ? accessTokens[reg.access_token_id] : null;
                        const expiryInfo = token ? getExpiryInfo(token.expires_at) : null;

                        return (
                          <motion.tr key={reg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-border">
                            <td className="px-4 py-3">
                              <div className="font-medium">{reg.email}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                {reg.company_name && <span>{reg.company_name}</span>}
                                {reg.company_domain && <span className="text-accent">@{reg.company_domain}</span>}
                              </div>
                              {reg.phone_number && (
                                <div className="text-xs text-muted-foreground">{reg.phone_number}</div>
                              )}
                              {reg.email_reputation_score !== null && (
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                  Rep: {reg.email_reputation_score}/100
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {reg.approval_source === "google_sheets" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium"><Sheet className="w-3 h-3" />Sheets</span>
                              ) : reg.approval_source === "local_db" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium"><Shield className="w-3 h-3" />Whitelist</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Manual</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 text-xs">
                                <FileCheck className="w-3 h-3 text-green-600" />
                                {new Date(reg.nda_accepted_at).toLocaleDateString()}
                              </span>
                            </td>
                            {activeTab === "approved" && (
                              <>
                                <td className="px-4 py-3">
                                  {token && !token.is_revoked ? (
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${expiryInfo?.color}`}>
                                      <Timer className="w-3 h-3" />
                                      {expiryInfo?.label}
                                    </span>
                                  ) : token?.is_revoked ? (
                                    <span className="text-xs text-destructive font-medium">Revoked</span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">No token</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground text-xs">
                                  {token ? token.access_count : 0}
                                </td>
                              </>
                            )}
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                              {new Date(reg.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {activeTab === "pending" && (
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleApprove(reg.id)} className="px-3 py-1 bg-green-600 text-primary-foreground text-xs font-medium hover:bg-green-700 transition-colors">Approve</button>
                                  <button onClick={() => handleReject(reg.id)} className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 transition-colors">Reject</button>
                                </div>
                              )}
                              {activeTab === "approved" && (
                                <button onClick={() => handleRevokeAccess(reg.id, reg.access_token_id)} className="px-3 py-1 bg-amber-500 text-primary-foreground text-xs font-medium hover:bg-amber-600 transition-colors">Revoke</button>
                              )}
                              {activeTab === "rejected" && (
                                <button onClick={() => handleApprove(reg.id)} className="px-3 py-1 bg-green-600 text-primary-foreground text-xs font-medium hover:bg-green-700 transition-colors">Re-approve</button>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
