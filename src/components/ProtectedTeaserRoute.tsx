import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProtectedTeaserRouteProps {
  children: React.ReactNode;
}

const ProtectedTeaserRoute = ({ children }: ProtectedTeaserRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/auth");
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    // 1. Check for URL token-based access
    const urlToken = searchParams.get("token");
    if (urlToken) {
      const { data, error } = await supabase.rpc("validate_access_token", {
        token_str: urlToken,
        current_fingerprint: getBrowserFingerprint(),
        current_ip: null,
        current_user_agent: navigator.userAgent,
      });

      if (!error && data && data.length > 0 && data[0].is_valid) {
        setIsAllowed(true);
        setIsLoading(false);
        return;
      }

      // Token invalid or expired
      const errorMsg = data?.[0]?.error_message || "Invalid access link";
      toast({
        title: "Access denied",
        description: errorMsg,
        variant: "destructive",
      });
      setRedirectTo("/");
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
      toast({
        title: "Access pending",
        description: "Your registration is still under review.",
        variant: "destructive",
      });
      setRedirectTo("/");
      setIsLoading(false);
      return;
    }

    // Check if access token is still valid (not expired)
    if (registration.access_token_id) {
      const { data: tokenData } = await (supabase as any)
        .from("access_tokens")
        .select("expires_at, is_revoked")
        .eq("id", registration.access_token_id)
        .maybeSingle();

      if (tokenData) {
        if (tokenData.is_revoked || new Date(tokenData.expires_at) < new Date()) {
          toast({
            title: "Access expired",
            description: "Your access link has expired. Please request new access.",
            variant: "destructive",
          });
          setRedirectTo("/");
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

  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

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
  // Simple hash
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
