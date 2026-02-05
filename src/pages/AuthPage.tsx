 import { useState, useEffect } from "react";
 import { useNavigate, Link } from "react-router-dom";
 import { motion } from "framer-motion";
 import { LogIn, Mail, Lock, ArrowLeft } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 import { z } from "zod";
 
 const loginSchema = z.object({
   email: z.string().trim().email("Invalid email address"),
   password: z.string().min(6, "Password must be at least 6 characters"),
 });
 
 const AuthPage = () => {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [errors, setErrors] = useState<Record<string, string>>({});
   const { toast } = useToast();
   const navigate = useNavigate();
 
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       (event, session) => {
         if (session?.user) {
           checkAdminAndRedirect(session.user.id);
         }
       }
     );
 
     supabase.auth.getSession().then(({ data: { session } }) => {
       if (session?.user) {
         checkAdminAndRedirect(session.user.id);
       }
     });
 
     return () => subscription.unsubscribe();
   }, []);
 
   const checkAdminAndRedirect = async (userId: string) => {
     const { data } = await supabase
       .from("user_roles")
       .select("role")
       .eq("user_id", userId)
       .eq("role", "admin")
       .maybeSingle();
 
     if (data) {
       navigate("/admin");
     } else {
       navigate("/teaser");
     }
   };
 
   const validateForm = () => {
     try {
       loginSchema.parse({ email, password });
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
 
   const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!validateForm()) return;
 
     setIsLoading(true);
     try {
       const { error } = await supabase.auth.signInWithPassword({
         email: email.trim().toLowerCase(),
         password,
       });
 
       if (error) {
         toast({
           title: "Login failed",
           description: error.message,
           variant: "destructive",
         });
       }
     } catch (error) {
       toast({
         title: "Login failed",
         description: "An unexpected error occurred.",
         variant: "destructive",
       });
     } finally {
       setIsLoading(false);
     }
   };
 
   return (
     <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="w-full max-w-md"
       >
         <div className="bg-background border border-border p-8">
           <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 bg-primary flex items-center justify-center">
               <span className="text-primary-foreground font-bold text-sm font-display">CI</span>
             </div>
             <div>
               <div className="font-display font-bold">Investor Login</div>
               <div className="text-xs text-muted-foreground">Approved investors only</div>
             </div>
           </div>
 
           <form onSubmit={handleLogin} className="space-y-4">
             <div>
               <label className="block text-sm font-medium mb-1">Email</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full border border-border bg-background pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                   placeholder="your@email.com"
                 />
               </div>
               {errors.email && (
                 <p className="text-destructive text-xs mt-1">{errors.email}</p>
               )}
             </div>
 
             <div>
               <label className="block text-sm font-medium mb-1">Password</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full border border-border bg-background pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                   placeholder="••••••••"
                 />
               </div>
               {errors.password && (
                 <p className="text-destructive text-xs mt-1">{errors.password}</p>
               )}
             </div>
 
             <button
               type="submit"
               disabled={isLoading}
               className="w-full bg-accent text-accent-foreground py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-accent/90 transition-colors"
             >
               {isLoading ? (
                 <span>Signing in...</span>
               ) : (
                 <>
                   <LogIn className="w-5 h-5" />
                   <span>Sign In</span>
                 </>
               )}
             </button>
           </form>
 
           <div className="mt-6 pt-6 border-t border-border">
             <p className="text-sm text-muted-foreground text-center">
               Don't have access yet?{" "}
               <Link to="/register" className="text-accent hover:underline">
                 Request Access
               </Link>
             </p>
           </div>
         </div>
 
         <Link
           to="/"
           className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors"
         >
           <ArrowLeft className="w-4 h-4" />
           <span>Back to Home</span>
         </Link>
       </motion.div>
     </div>
   );
 };
 
 export default AuthPage;