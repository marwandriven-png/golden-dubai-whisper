 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { useNavigate } from "react-router-dom";
 import { Check, ChevronRight, FileText, User, CheckCircle } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 import { z } from "zod";
 
 const investorSchema = z.object({
   fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
   email: z.string().trim().email("Invalid email address").max(255),
   companyName: z.string().trim().max(200).optional(),
   phoneNumber: z.string().trim().max(50).optional(),
   investorType: z.enum(["family_office", "institutional", "private_investor", "operator", "other"]),
   investmentCapacity: z.enum(["under_5m", "5m_to_10m", "10m_to_25m", "25m_to_50m", "over_50m"]),
   referralSource: z.string().trim().max(500).optional(),
 });
 
 const NDA_TEXT = `CONFIDENTIALITY AND NON-DISCLOSURE AGREEMENT
 
 This Confidentiality and Non-Disclosure Agreement ("Agreement") is entered into as of the date of acceptance below.
 
 1. CONFIDENTIAL INFORMATION
 The undersigned acknowledges that all information regarding the confidential hotel investment opportunity in Deira, Dubai ("Property"), including but not limited to financial data, tenant information, property specifications, and any other materials provided, constitutes Confidential Information.
 
 2. NON-DISCLOSURE OBLIGATION
 The undersigned agrees to:
 a) Maintain the confidentiality of all Confidential Information
 b) Not disclose any Confidential Information to any third party without prior written consent
 c) Use the Confidential Information solely for the purpose of evaluating the investment opportunity
 d) Not copy, reproduce, or distribute any Confidential Information
 
 3. RETURN OF MATERIALS
 Upon request or upon deciding not to proceed with the investment, the undersigned shall return or destroy all Confidential Information received.
 
 4. NO OBLIGATION
 This Agreement does not obligate either party to complete any transaction relating to the Property.
 
 5. TERM
 This Agreement shall remain in effect for a period of two (2) years from the date of acceptance.
 
 By accepting below, you acknowledge that you have read, understood, and agree to be bound by the terms of this Agreement.`;
 
 const investorTypes = [
   { value: "family_office", label: "Family Office" },
   { value: "institutional", label: "Institutional Investor" },
   { value: "private_investor", label: "Private Investor / HNWI" },
   { value: "operator", label: "Hotel Operator" },
   { value: "other", label: "Other" },
 ];
 
 const investmentCapacities = [
   { value: "under_5m", label: "Under $5M" },
   { value: "5m_to_10m", label: "$5M - $10M" },
   { value: "10m_to_25m", label: "$10M - $25M" },
   { value: "25m_to_50m", label: "$25M - $50M" },
   { value: "over_50m", label: "Over $50M" },
 ];
 
 const RegistrationPage = () => {
   const [step, setStep] = useState(1);
   const [ndaAccepted, setNdaAccepted] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [formData, setFormData] = useState({
     fullName: "",
     email: "",
     companyName: "",
     phoneNumber: "",
     investorType: "" as string,
     investmentCapacity: "" as string,
     referralSource: "",
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
       investorSchema.parse({
         ...formData,
         investorType: formData.investorType || undefined,
         investmentCapacity: formData.investmentCapacity || undefined,
       });
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
       const { error } = await supabase.from("investor_registrations").insert({
         full_name: formData.fullName.trim(),
         email: formData.email.trim().toLowerCase(),
         company_name: formData.companyName?.trim() || null,
         phone_number: formData.phoneNumber?.trim() || null,
         investor_type: formData.investorType as any,
         investment_capacity: formData.investmentCapacity as any,
         referral_source: formData.referralSource?.trim() || null,
         nda_accepted_at: new Date().toISOString(),
       });
 
       if (error) {
         if (error.code === "23505") {
           toast({
             title: "Already registered",
             description: "This email is already registered. Please wait for approval.",
             variant: "destructive",
           });
         } else {
           throw error;
         }
         return;
       }
 
       setStep(3);
     } catch (error) {
       console.error("Registration error:", error);
       toast({
         title: "Registration failed",
         description: "There was an error submitting your registration. Please try again.",
         variant: "destructive",
       });
     } finally {
       setIsSubmitting(false);
     }
   };
 
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
                   className={`w-16 h-0.5 mx-2 ${
                     step > s ? "bg-accent" : "bg-muted"
                   }`}
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
             {step === 2 && "Investor Profile"}
             {step === 3 && "Registration Complete"}
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
                 <pre className="whitespace-pre-wrap">{NDA_TEXT}</pre>
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
                   I understand that all information shared is confidential and
                   proprietary.
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
                 <div className="grid md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-1">
                       Full Name <span className="text-destructive">*</span>
                     </label>
                     <input
                       type="text"
                       value={formData.fullName}
                       onChange={(e) =>
                         setFormData({ ...formData, fullName: e.target.value })
                       }
                       className="w-full border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                       placeholder="John Smith"
                     />
                     {errors.fullName && (
                       <p className="text-destructive text-xs mt-1">{errors.fullName}</p>
                     )}
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">
                       Email <span className="text-destructive">*</span>
                     </label>
                     <input
                       type="email"
                       value={formData.email}
                       onChange={(e) =>
                         setFormData({ ...formData, email: e.target.value })
                       }
                       className="w-full border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                       placeholder="john@company.com"
                     />
                     {errors.email && (
                       <p className="text-destructive text-xs mt-1">{errors.email}</p>
                     )}
                   </div>
                 </div>
 
                 <div className="grid md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-1">
                       Company Name
                     </label>
                     <input
                       type="text"
                       value={formData.companyName}
                       onChange={(e) =>
                         setFormData({ ...formData, companyName: e.target.value })
                       }
                       className="w-full border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                       placeholder="ABC Capital"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">
                       Phone Number
                     </label>
                     <input
                       type="tel"
                       value={formData.phoneNumber}
                       onChange={(e) =>
                         setFormData({ ...formData, phoneNumber: e.target.value })
                       }
                       className="w-full border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                       placeholder="+971 50 123 4567"
                     />
                   </div>
                 </div>
 
                 <div>
                   <label className="block text-sm font-medium mb-1">
                     Investor Type <span className="text-destructive">*</span>
                   </label>
                   <select
                     value={formData.investorType}
                     onChange={(e) =>
                       setFormData({ ...formData, investorType: e.target.value })
                     }
                     className="w-full border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                   >
                     <option value="">Select investor type</option>
                     {investorTypes.map((type) => (
                       <option key={type.value} value={type.value}>
                         {type.label}
                       </option>
                     ))}
                   </select>
                   {errors.investorType && (
                     <p className="text-destructive text-xs mt-1">{errors.investorType}</p>
                   )}
                 </div>
 
                 <div>
                   <label className="block text-sm font-medium mb-1">
                     Investment Capacity <span className="text-destructive">*</span>
                   </label>
                   <select
                     value={formData.investmentCapacity}
                     onChange={(e) =>
                       setFormData({ ...formData, investmentCapacity: e.target.value })
                     }
                     className="w-full border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                   >
                     <option value="">Select investment capacity</option>
                     {investmentCapacities.map((cap) => (
                       <option key={cap.value} value={cap.value}>
                         {cap.label}
                       </option>
                     ))}
                   </select>
                   {errors.investmentCapacity && (
                     <p className="text-destructive text-xs mt-1">
                       {errors.investmentCapacity}
                     </p>
                   )}
                 </div>
 
                 <div>
                   <label className="block text-sm font-medium mb-1">
                     How did you hear about this opportunity?
                   </label>
                   <input
                     type="text"
                     value={formData.referralSource}
                     onChange={(e) =>
                       setFormData({ ...formData, referralSource: e.target.value })
                     }
                     className="w-full border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                     placeholder="Referral, LinkedIn, etc."
                   />
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
               <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle className="w-8 h-8 text-accent" />
               </div>
 
               <h2 className="text-2xl font-display font-bold mb-4">
                 Thank You for Registering
               </h2>
 
               <p className="text-muted-foreground mb-6">
                 Your registration has been submitted and is under review. Our team
                 will verify your credentials and you'll receive an email once your
                 access has been approved.
               </p>
 
               <div className="bg-muted p-4 text-sm text-left mb-6">
                 <div className="font-semibold mb-2">What happens next?</div>
                 <ul className="space-y-2 text-muted-foreground">
                   <li>1. Our team reviews your registration (typically 24-48 hours)</li>
                   <li>2. You'll receive an email notification upon approval</li>
                   <li>3. Login to access the full investment memorandum</li>
                 </ul>
               </div>
 
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