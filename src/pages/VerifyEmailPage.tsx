import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "already" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-email", {
          body: { token },
        });

        if (error) throw error;

        if (data.success) {
          setStatus(data.alreadyVerified ? "already" : "success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-background border border-border p-8 text-center"
      >
        {status === "loading" && (
          <>
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
            <h2 className="text-xl font-display font-bold mb-2">Verifying Your Email</h2>
            <p className="text-muted-foreground text-sm">Please wait while we verify your email address...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-display font-bold mb-4">Email Verified!</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="bg-muted p-4 text-sm text-left mb-6">
              <div className="font-semibold mb-2">What happens next?</div>
              <ul className="space-y-2 text-muted-foreground">
                <li>1. Our admin team has been notified of your request</li>
                <li>2. They will review your registration (typically 24–48 hours)</li>
                <li>3. You'll receive an email with a secure access link once approved</li>
              </ul>
            </div>
            <button
              onClick={() => navigate("/")}
              className="bg-accent text-accent-foreground px-8 py-3 font-semibold hover:bg-accent/90 transition-colors"
            >
              Return to Home
            </button>
          </>
        )}

        {status === "already" && (
          <>
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-xl font-display font-bold mb-4">Already Verified</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-accent text-accent-foreground px-8 py-3 font-semibold hover:bg-accent/90 transition-colors"
            >
              Return to Home
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-display font-bold mb-4">Verification Failed</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <button
              onClick={() => navigate("/register")}
              className="bg-accent text-accent-foreground px-8 py-3 font-semibold hover:bg-accent/90 transition-colors"
            >
              Register Again
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
