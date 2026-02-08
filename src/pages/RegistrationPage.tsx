import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, FileText, User, CheckCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const registrationSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  phoneNumber: z.string().trim().min(5, "Phone number is required").max(50),
});

function generateNdaText(email: string): string {
  const domain = email.split("@")[1] || "";
  const companyName = domain.split(".")[0] || "the Recipient";
  const capitalized = companyName.charAt(0).toUpperCase() + companyName.slice(1);
  const now = new Date();
  const expiryDate = new Date(now.getTime() + 2 * 365 * 24 * 60 * 60 * 1000);

  return `CONFIDENTIALITY AND NON-DISCLOSURE AGREEMENT

This Confidentiality and Non-Disclosure Agreement ("Agreement") is entered into as of ${now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.

PARTIES:
Disclosing Party: The Investment Sponsor ("Sponsor")
Receiving Party: ${capitalized} ("Recipient")

PROJECT: Confidential Hotel Investment Opportunity
ASSET LOCATION: Deira, Dubai, United Arab Emirates
ASSET TYPE: Full-Service Hospitality Asset (120 Keys, 12 Floors)

1. CONFIDENTIAL INFORMATION
The Recipient acknowledges that all information regarding the above-referenced investment opportunity ("Property"), including but not limited to financial data, tenant information, property specifications, valuation reports, and any other materials provided, constitutes Confidential Information.

2. NON-DISCLOSURE OBLIGATION
The Recipient agrees to:
a) Maintain strict confidentiality of all Confidential Information
b) Not disclose any Confidential Information to any third party without prior written consent
c) Use the Confidential Information solely for evaluating the investment opportunity
d) Not copy, reproduce, or distribute any Confidential Information
e) Not contact the property, tenants, or operators directly

3. RETURN OF MATERIALS
Upon request or upon deciding not to proceed, the Recipient shall return or destroy all Confidential Information received within 5 business days.

4. NO OBLIGATION
This Agreement does not obligate either party to complete any transaction relating to the Property.

5. TERM AND EXPIRY
This Agreement shall remain in effect until ${expiryDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.

6. GOVERNING LAW
This Agreement shall be governed by the laws of the DIFC, Dubai, UAE.

ACCEPTANCE TIMESTAMP: ${now.toISOString()}
RECIPIENT IDENTIFIER: ${email}

By accepting below, you acknowledge that you have read, understood, and agree to be bound by the terms of this Agreement.`;
}

const RegistrationPage = () => {
  const [step, setStep] = useState(1);
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoApproved, setAutoApproved] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleNdaAccept = () => {
    if (!ndaAccepted) {
      toast({
        title: "Please accept the NDA",
        description: "You must accept the confidentiality agreement to proceed.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const validateForm = () => {
    try {
      registrationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("register-investor", {
        body: {
          email: formData.email.trim().toLowerCase(),
          phoneNumber: formData.phoneNumber.trim(),
          ndaAcceptedAt: new Date().toISOString(),
        },
      });

      if (error) throw error;

      if (data.error === "already_registered") {
        toast({
          title: "Already registered",
          description: "This email is already registered. Please check your email or wait for approval.",
          variant: "destructive",
        });
        return;
      }

      if (!data.success) {
        throw new Error(data.message || "Registration failed");
      }

      setAutoApproved(data.autoApproved === true);
      setStep(3);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ndaText = generateNdaText(formData.email || "investor@company.com");

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-0.5 mx-2 ${step > s ? "bg-accent" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            {step === 1 && "Step 1 of 3"}
            {step === 2 && "Step 2 of 3"}
            {step === 3 && "Complete"}
          </div>
          <h1 className="text-2xl font-display font-bold">
            {step === 1 && "Non-Disclosure Agreement"}
            {step === 2 && "Your Details"}
            {step === 3 && (autoApproved ? "Access Granted" : "Registration Complete")}
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-background border border-border p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-accent" />
                <h2 className="font-semibold">Confidentiality Agreement</h2>
              </div>

              <div className="bg-muted p-4 h-64 overflow-y-auto text-sm leading-relaxed mb-6 font-mono">
                <pre className="whitespace-pre-wrap">{ndaText}</pre>
              </div>

              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <input
                  type="checkbox"
                  checked={ndaAccepted}
                  onChange={(e) => setNdaAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-accent"
                />
                <span className="text-sm">
                  I have read and agree to the terms of this Non-Disclosure Agreement.
                  I understand that all information shared is confidential and proprietary.
                </span>
              </label>

              <button
                onClick={handleNdaAccept}
                disabled={!ndaAccepted}
                className="w-full bg-accent text-accent-foreground py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
              >
                <span>Accept & Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-background border border-border p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-accent" />
                <h2 className="font-semibold">Your Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="john@company.com"
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mobile Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className="w-full border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="+971 50 123 4567"
                  />
                  {errors.phoneNumber && (
                    <p className="text-destructive text-xs mt-1">{errors.phoneNumber}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll receive the investment teaser link via WhatsApp on this number
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-border hover:bg-muted transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-accent text-accent-foreground py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-accent/90 transition-colors"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Submit Registration</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-background border border-border p-8 text-center"
            >
              <div className={`w-16 h-16 ${autoApproved ? "bg-green-100" : "bg-accent/10"} rounded-full flex items-center justify-center mx-auto mb-6`}>
                {autoApproved ? (
                  <Sparkles className="w-8 h-8 text-green-600" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-accent" />
                )}
              </div>

              <h2 className="text-2xl font-display font-bold mb-4">
                {autoApproved ? "Access Granted!" : "Thank You for Registering"}
              </h2>

              {autoApproved ? (
                <>
                  <p className="text-muted-foreground mb-6">
                    Your registration has been automatically verified. Check your email for a secure link to access the investment teaser.
                  </p>
                  <div className="bg-green-50 border border-green-200 p-4 text-sm text-left mb-6">
                    <div className="font-semibold text-green-800 mb-2">✅ Instant Access</div>
                    <ul className="space-y-1 text-green-700">
                      <li>• A secure, device-bound link has been sent to your email</li>
                      <li>• The link expires in 24 hours for security</li>
                      <li>• All information is subject to the NDA you accepted</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-6">
                    Your registration has been submitted and is under review. Our team
                    will verify your credentials and you'll receive an email and WhatsApp
                    notification once your access has been approved.
                  </p>
                  <div className="bg-muted p-4 text-sm text-left mb-6">
                    <div className="font-semibold mb-2">What happens next?</div>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>1. Our team reviews your registration (typically 24-48 hours)</li>
                      <li>2. You'll receive a notification upon approval</li>
                      <li>3. Access the full investment teaser via the secure link provided</li>
                    </ul>
                  </div>
                </>
              )}

              <button
                onClick={() => navigate("/")}
                className="bg-primary text-primary-foreground px-8 py-3 font-semibold hover:bg-primary/90 transition-colors"
              >
                Return to Home
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RegistrationPage;
