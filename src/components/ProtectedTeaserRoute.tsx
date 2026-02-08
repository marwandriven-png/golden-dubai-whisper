import { useEffect, useState } from "react";
import { Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProtectedTeaserRouteProps {
  children: React.ReactNode;
}

type BlockReason = "device_mismatch" | "expired" | "revoked" | "invalid" | "pending" | null;

const ProtectedTeaserRoute = ({ children }: ProtectedTeaserRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [blockReason, setBlockReason] = useState<BlockReason>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
  }, []);

  const notifySecurityEvent = async (eventType: string, details: Record<string, unknown>) => {
    try {
      await supabase.functions.invoke("notify-security-event", {
        body: { eventType, ...details },
      });
    } catch (err) {
      console.error("Failed to send security notification:", err);
    }
  };

  const checkAccess = async () => {
    try {
      // 1. Check for URL token-based access
      const urlToken = searchParams.get("token");
      if (urlToken) {
        const fingerprint = getBrowserFingerprint();
        console.log("[Access] Validating token, fingerprint:", fingerprint);

        const { data, error } = await supabase.rpc("validate_access_token", {
          token_str: urlToken,
          current_fingerprint: fingerprint,
          current_ip: null,
          current_user_agent: navigator.userAgent,
        });

        console.log("[Access] RPC result:", { data, error });

        if (error) {
          console.error("[Access] RPC error:", error);
          setBlockReason("invalid");
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0 && data[0].is_valid) {
          setIsAllowed(true);
          setIsLoading(false);
          return;
        }

        const errorMsg = data?.[0]?.error_message || "Invalid access link";

        // Detect device mismatch (forwarded link)
        if (errorMsg === "DEVICE_MISMATCH") {
          setBlockReason("device_mismatch");

          const tokenData = data?.[0];
          notifySecurityEvent("link_forwarded", {
            originalEmail: "unknown",
            attemptedFingerprint: fingerprint,
            attemptedUserAgent: navigator.userAgent,
            investorId: tokenData?.investor_id,
          });

          setIsLoading(false);
          return;
        }

        if (errorMsg.includes("expired")) {
          setBlockReason("expired");
        } else if (errorMsg.includes("revoked")) {
          setBlockReason("revoked");
        } else {
          setBlockReason("invalid");
        }

        setIsLoading(false);
        return;
      }

      // 2. Check authenticated session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setRedirectTo("/auth");
        setIsLoading(false);
        return;
      }

      // 3. Check admin role
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminRole) {
        setIsAllowed(true);
        setIsLoading(false);
        return;
      }

      // 4. Check approved registration with valid access token
      const { data: registration } = await supabase
        .from("investor_registrations")
        .select("id, approval_status, access_token_id")
        .eq("email", session.user.email || "")
        .maybeSingle();

      if (!registration || registration.approval_status !== "approved") {
        setBlockReason("pending");
        setIsLoading(false);
        return;
      }

      // Check if access token is still valid
      if (registration.access_token_id) {
        const { data: tokenData } = await (supabase as any)
          .from("access_tokens")
          .select("expires_at, is_revoked")
          .eq("id", registration.access_token_id)
          .maybeSingle();

        if (tokenData) {
          if (tokenData.is_revoked) {
            setBlockReason("revoked");
            setIsLoading(false);
            return;
          }
          if (new Date(tokenData.expires_at) < new Date()) {
            setBlockReason("expired");
            setIsLoading(false);
            return;
          }
        }
      }

      // Approved with valid token
      setIsAllowed(true);
      await supabase.rpc("update_investor_last_login", {
        _email: session.user.email || "",
      });
      setIsLoading(false);
    } catch (err) {
      console.error("[Access] Unexpected error in checkAccess:", err);
      setBlockReason("invalid");
      setIsLoading(false);
    }
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

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!isAllowed && blockReason) {
    return <AccessBlockedScreen reason={blockReason} />;
  }

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AccessBlockedScreen({ reason }: { reason: BlockReason }) {
  const navigate = useNavigate();

  const content = {
    device_mismatch: {
      icon: <Shield className="w-10 h-10 text-accent" />,
      title: "Access Restricted",
      message: "For confidentiality reasons, this access link is restricted to a single approved device. Please request new approval.",
      showRequestButton: true,
    },
    expired: {
      icon: <Lock className="w-10 h-10 text-muted-foreground" />,
      title: "Access Expired",
      message: "Your access link has expired after the allowed time period. For continued access, please submit a new request.",
      showRequestButton: true,
    },
    revoked: {
      icon: <AlertTriangle className="w-10 h-10 text-destructive" />,
      title: "Access Revoked",
      message: "Your access to this investment opportunity has been revoked. If you believe this is an error, please request new approval.",
      showRequestButton: true,
    },
    invalid: {
      icon: <Lock className="w-10 h-10 text-muted-foreground" />,
      title: "Invalid Access Link",
      message: "This access link is not valid. Please use the link provided in your approval email or request new access.",
      showRequestButton: true,
    },
    pending: {
      icon: <Lock className="w-10 h-10 text-accent" />,
      title: "Access Pending",
      message: "Your registration is still under review. Our team will notify you once access has been approved.",
      showRequestButton: false,
    },
  };

  const c = content[reason || "invalid"];

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-background border border-border p-10 text-center"
      >
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          {c.icon}
        </div>

        <h1 className="text-2xl font-display font-bold mb-3">{c.title}</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">{c.message}</p>

        <div className="space-y-3">
          {c.showRequestButton && (
            <button
              onClick={() => navigate("/register")}
              className="w-full bg-accent text-accent-foreground py-3 font-semibold hover:bg-accent/90 transition-colors"
            >
              Request New Approval
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            className="w-full border border-border py-3 text-sm hover:bg-muted transition-colors"
          >
            Return to Home
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-8 leading-relaxed">
          All access is monitored and logged for security purposes.
          Unauthorized distribution of access links is prohibited under the NDA.
        </p>
      </motion.div>
    </div>
  );
}

function getBrowserFingerprint(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("fp", 2, 2);
  }
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset().toString(),
    canvas.toDataURL(),
  ];
  let hash = 0;
  const str = components.join("|");
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export default ProtectedTeaserRoute;
