 import { motion } from "framer-motion";
 import { Link } from "react-router-dom";
 import { Lock, Building2, TrendingUp, MapPin } from "lucide-react";
 import hotelBuilding from "@/assets/hotel-building.jpeg";
 
 const LandingPage = () => {
   return (
     <div className="min-h-screen bg-background">
       {/* Hero Section with blurred background */}
       <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
         {/* Blurred background image */}
         <div className="absolute inset-0">
           <img
             src={hotelBuilding}
             alt="Hotel Asset"
             className="w-full h-full object-cover blur-lg scale-110 opacity-30"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
         </div>
 
         {/* Content */}
         <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
           {/* Badge */}
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 mb-8"
           >
             <Lock className="w-4 h-4 text-accent" />
             <span className="text-sm font-medium text-primary">
               Off-Market Investment Opportunity
             </span>
           </motion.div>
 
           {/* Title */}
           <motion.h1
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="mega-type text-primary mb-6"
           >
             CONFIDENTIAL
             <br />
             <span className="text-muted-foreground/40">HOTEL</span>
             <br />
             INVESTMENT
           </motion.h1>
 
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="flex items-center justify-center gap-2 text-muted-foreground mb-8"
           >
             <MapPin className="w-4 h-4 text-accent" />
             <span className="text-lg">Deira, Dubai • UAE</span>
           </motion.div>
 
           {/* Key Stats */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex flex-wrap justify-center gap-4 mb-12"
           >
             <div className="stat-pill">
               <span className="text-2xl font-bold font-display">120</span>
               <span className="text-xs uppercase tracking-wider opacity-80">Keys</span>
             </div>
             <div className="stat-pill">
               <span className="text-2xl font-bold font-display">7%</span>
               <span className="text-xs uppercase tracking-wider opacity-80">ROI</span>
             </div>
             <div className="stat-pill">
               <span className="text-2xl font-bold font-display">21K</span>
               <span className="text-xs uppercase tracking-wider opacity-80">SqFt</span>
             </div>
           </motion.div>
 
           {/* Description */}
           <motion.p
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.4 }}
             className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12"
           >
             A landmark full-service hospitality asset opposite Deira City Centre,
             featuring 120 keys and 11 diversified revenue outlets across 12 floors.
           </motion.p>
 
           {/* CTA Button */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
           >
             <Link
               to="/register"
               className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-8 py-4 font-semibold text-lg hover:bg-accent/90 transition-colors"
             >
               <Lock className="w-5 h-5" />
               <span>Request Access</span>
             </Link>
             <p className="text-sm text-muted-foreground mt-4">
               NDA acceptance required to view full investment details
             </p>
           </motion.div>
         </div>
       </div>
 
       {/* Features Preview */}
       <div className="bg-secondary py-16 px-8">
         <div className="max-w-4xl mx-auto">
           <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
             What's Included in the Investment Memorandum
           </h2>
           <div className="grid md:grid-cols-3 gap-6">
             <div className="bg-background p-6 border border-border">
               <Building2 className="w-8 h-8 text-accent mb-4" />
               <h3 className="font-semibold mb-2">Asset Details</h3>
               <p className="text-sm text-muted-foreground">
                 Full property specifications, outlet mix, and amenities breakdown
               </p>
             </div>
             <div className="bg-background p-6 border border-border">
               <TrendingUp className="w-8 h-8 text-accent mb-4" />
               <h3 className="font-semibold mb-2">Investment Thesis</h3>
               <p className="text-sm text-muted-foreground">
                 ROI analysis, value-add opportunities, and exit strategies
               </p>
             </div>
             <div className="bg-background p-6 border border-border">
               <MapPin className="w-8 h-8 text-accent mb-4" />
               <h3 className="font-semibold mb-2">Location Intelligence</h3>
               <p className="text-sm text-muted-foreground">
                 Strategic positioning, proximity analysis, and market drivers
               </p>
             </div>
           </div>
         </div>
       </div>
 
       {/* Footer */}
       <footer className="bg-primary text-primary-foreground px-8 py-8">
         <div className="max-w-4xl mx-auto text-center">
           <div className="text-xs text-primary-foreground/50 leading-relaxed">
             <strong>Confidentiality Notice:</strong> This opportunity is being offered
             on a confidential basis to qualified investors only. All information is
             proprietary and subject to NDA execution.
           </div>
           <div className="mt-4 text-xs text-primary-foreground/30">
             © 2026 Confidential Investment • Direct Mandate
           </div>
         </div>
       </footer>
     </div>
   );
 };
 
 export default LandingPage;