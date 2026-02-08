import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Lock, MapPin } from "lucide-react";
import hotelBuilding from "@/assets/hotel-building.jpeg";

const LandingPage = () => {
  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Full-screen blurred hotel background */}
      <div className="absolute inset-0">
        <img
          src={hotelBuilding}
          alt="Hotel Asset"
          className="w-full h-full object-cover blur-md scale-105"
        />
        <div className="absolute inset-0 bg-primary/70" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Lock icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center mb-8"
        >
          <Lock className="w-10 h-10 text-accent" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-4 tracking-tight"
        >
          CONFIDENTIAL
          <br />
          <span className="text-primary-foreground/40">HOTEL</span> INVESTMENT
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-primary-foreground/70 mb-8"
        >
          <MapPin className="w-4 h-4 text-accent" />
          <span className="text-lg">Deira, Dubai • UAE</span>
        </motion.div>

        {/* Key stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-6 mb-12"
        >
          {[
            { value: "120", label: "Keys" },
            { value: "7%", label: "ROI" },
            { value: "21K", label: "SqFt" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold font-display text-primary-foreground">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-primary-foreground/50">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-10 py-4 font-semibold text-lg hover:bg-accent/90 transition-colors shadow-lg"
          >
            <Lock className="w-5 h-5" />
            <span>Request Full Details</span>
          </Link>
          <p className="text-sm text-primary-foreground/40 mt-4">
            NDA acceptance required to view full investment details
          </p>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 px-8 py-4 flex justify-between items-center border-t border-primary-foreground/10">
        <div className="flex gap-6 text-xs tracking-widest uppercase text-primary-foreground/30">
          <span>Off-Market</span>
          <span>•</span>
          <span>Direct Mandate</span>
          <span>•</span>
          <span>Confidential</span>
        </div>
        <div className="text-xs text-primary-foreground/20">
          © 2026
        </div>
      </div>
    </div>
  );
};

export default LandingPage;