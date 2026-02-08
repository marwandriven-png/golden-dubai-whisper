import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Shield, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuditEntry {
  id: string;
  token_id: string | null;
  investor_id: string | null;
  event_type: string;
  device_fingerprint: string | null;
  ip_address: string | null;
  user_agent: string | null;
  original_email: string | null;
  attempted_email: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

const eventLabels: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  access_granted: { label: "Access Granted", color: "text-green-600", icon: CheckCircle },
  link_forwarded: { label: "Forwarded Link", color: "text-destructive", icon: AlertTriangle },
  device_mismatch: { label: "Device Mismatch", color: "text-destructive", icon: Shield },
  token_expired: { label: "Token Expired", color: "text-amber-500", icon: Clock },
  token_revoked: { label: "Token Revoked", color: "text-destructive", icon: XCircle },
  token_invalid: { label: "Invalid Token", color: "text-muted-foreground", icon: XCircle },
  access_extended: { label: "Access Extended", color: "text-accent", icon: CheckCircle },
  access_revoked: { label: "Access Revoked", color: "text-destructive", icon: XCircle },
  auto_approved: { label: "Auto-Approved", color: "text-amber-500", icon: CheckCircle },
};

const SecurityAuditLog = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    const { data, error } = await (supabase as any)
      .from("access_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      toast({ title: "Error loading audit logs", description: error.message, variant: "destructive" });
    } else {
      setLogs((data || []) as AuditEntry[]);
    }
    setIsLoading(false);
  };

  const handleExtendAccess = async (investorId: string) => {
    // Find the latest token for this investor
    const { data: tokens } = await (supabase as any)
      .from("access_tokens")
      .select("id, expires_at")
      .eq("investor_id", investorId)
      .eq("is_revoked", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (tokens && tokens.length > 0) {
      const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await (supabase as any)
        .from("access_tokens")
        .update({ expires_at: newExpiry })
        .eq("id", tokens[0].id);

      toast({ title: "Access extended by 24 hours" });
      fetchLogs();
    } else {
      toast({ title: "No active token found", variant: "destructive" });
    }
  };

  const handleRevokeFromLog = async (investorId: string) => {
    await (supabase as any)
      .from("access_tokens")
      .update({ is_revoked: true })
      .eq("investor_id", investorId)
      .eq("is_revoked", false);

    toast({ title: "All access revoked for this investor" });
    fetchLogs();
  };

  const filteredLogs = filter === "all"
    ? logs
    : filter === "security"
      ? logs.filter(l => ["link_forwarded", "device_mismatch", "token_revoked"].includes(l.event_type))
      : logs.filter(l => l.event_type === filter);

  const securityAlerts = logs.filter(l => ["link_forwarded", "device_mismatch"].includes(l.event_type)).length;

  return (
    <div>
      {/* Security Alert Banner */}
      {securityAlerts > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 mb-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <div className="font-semibold text-destructive text-sm">{securityAlerts} Security Alert{securityAlerts > 1 ? "s" : ""}</div>
            <div className="text-xs text-muted-foreground">Forwarded links or device mismatches detected</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {[
          { key: "all", label: "All Events" },
          { key: "security", label: "Security Alerts" },
          { key: "access_granted", label: "Granted" },
          { key: "link_forwarded", label: "Forwarded" },
          { key: "token_expired", label: "Expired" },
          { key: "token_revoked", label: "Revoked" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-xs font-medium ${
              filter === f.key
                ? "bg-accent text-accent-foreground"
                : "bg-background border border-border hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
        <button onClick={fetchLogs} disabled={isLoading} className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-background border border-border hover:bg-muted text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Log Table */}
      <div className="bg-background border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No events found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Event</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Device</th>
                  <th className="text-left px-4 py-3 font-medium">Time</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const info = eventLabels[log.event_type] || { label: log.event_type, color: "text-muted-foreground", icon: Shield };
                  const Icon = info.icon;
                  const isAlert = ["link_forwarded", "device_mismatch"].includes(log.event_type);

                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-t border-border ${isAlert ? "bg-destructive/5" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${info.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {info.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs">{log.original_email || "—"}</div>
                        {log.attempted_email && log.attempted_email !== log.original_email && (
                          <div className="text-[10px] text-destructive">Attempted: {log.attempted_email}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {log.device_fingerprint || "—"}
                        </div>
                        {log.ip_address && (
                          <div className="text-[10px] text-muted-foreground">{log.ip_address}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isAlert && log.investor_id && (
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleExtendAccess(log.investor_id!)}
                              className="px-2 py-1 bg-green-600 text-primary-foreground text-[10px] font-medium hover:bg-green-700"
                            >
                              Extend 24h
                            </button>
                            <button
                              onClick={() => handleRevokeFromLog(log.investor_id!)}
                              className="px-2 py-1 bg-destructive text-destructive-foreground text-[10px] font-medium hover:bg-destructive/90"
                            >
                              Revoke All
                            </button>
                          </div>
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
    </div>
  );
};

export default SecurityAuditLog;
