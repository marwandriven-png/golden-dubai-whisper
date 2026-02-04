import { motion } from "framer-motion";
import hotelBuilding from "@/assets/hotel-building.jpeg";
import locationSatellite from "@/assets/location-satellite.jpeg";

const HeroSection = () => {
  return (
    <section className="min-h-screen grid grid-rows-[auto_1fr_auto]">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm font-display">CI</span>
          </div>
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Confidential Investment
            </div>
            <div className="text-xs text-muted-foreground/60">Deira • Dubai</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground/60 tracking-widest uppercase">
          Direct Mandate • 2026
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2">
        {/* Left: Typography */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center px-8 lg:px-16 py-12 bg-background relative"
        >
          <div className="mb-8">
            <div className="section-tag">Off-Market Opportunity</div>
            <h1 className="mega-type text-primary mb-2">
              CONFIDENTIAL
              <br />
              <span className="text-muted-foreground/30">HOTEL</span>
              <br />
              INVESTMENT
            </h1>
          </div>

          <div className="divider" />

          <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-md">
            A landmark full-service hospitality asset opposite Deira City Centre,
            featuring 120 keys and 11 diversified revenue outlets across 12 floors.
          </p>

          <div className="flex flex-wrap gap-3 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="stat-pill"
            >
              <span className="text-2xl font-bold font-display">120</span>
              <span className="text-xs uppercase tracking-wider opacity-80">Keys</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="stat-pill"
            >
              <span className="text-2xl font-bold font-display">7%</span>
              <span className="text-xs uppercase tracking-wider opacity-80">ROI</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="stat-pill"
            >
              <span className="text-2xl font-bold font-display">21K</span>
              <span className="text-xs uppercase tracking-wider opacity-80">SqFt</span>
            </motion.div>
          </div>

          <div className="mt-auto">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <div className="text-muted-foreground/60 text-xs uppercase tracking-wider mb-1">
                  Structure
                </div>
                <div className="font-semibold">B2 + G + 10 Floors</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="text-muted-foreground/60 text-xs uppercase tracking-wider mb-1">
                  Status
                </div>
                <div className="font-semibold text-accent">Price on Request</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Hotel Photo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative bg-muted overflow-hidden"
        >
          <img
            src={hotelBuilding}
            alt="Confidential Hotel Asset - Deira Dubai"
            className="w-full h-full object-cover"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />

          {/* Location Inset */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-8 left-8 w-48 h-36 border-[3px] border-background shadow-2xl overflow-hidden z-20"
          >
            <img
              src={locationSatellite}
              alt="Location"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <div className="relative">
                <div className="w-3 h-3 bg-destructive rounded-full border-2 border-background" />
                <div className="absolute inset-0 w-3 h-3 bg-destructive rounded-full animate-pulse-ring" />
              </div>
            </div>
          </motion.div>

          {/* Confidential Badge */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="confidential-badge"
          >
            <div className="text-xs text-primary-foreground/60 uppercase tracking-wider mb-1">
              Asset Location
            </div>
            <div className="font-display font-bold text-lg leading-tight">
              Opposite Deira
              <br />
              City Centre
            </div>
            <div className="text-xs text-primary-foreground/40 mt-2">Dubai • UAE</div>
          </motion.div>

          {/* Bottom Stats Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
            <div className="flex gap-8 text-primary-foreground">
              <div>
                <div className="text-3xl font-bold font-display">11</div>
                <div className="text-xs uppercase tracking-wider opacity-70">
                  Revenue Outlets
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold font-display">8</div>
                <div className="text-xs uppercase tracking-wider opacity-70">SPA Rooms</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-display">3</div>
                <div className="text-xs uppercase tracking-wider opacity-70">
                  Entertainment Venues
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="bg-primary text-primary-foreground px-8 py-4 flex justify-between items-center">
        <div className="flex gap-6 text-xs tracking-widest uppercase text-primary-foreground/40">
          <span>Direct Mandate</span>
          <span>•</span>
          <span>Immediate DD Available</span>
          <span>•</span>
          <span>No Broker Chain</span>
        </div>
        <div className="text-xs text-primary-foreground/30">Page 01</div>
      </div>
    </section>
  );
};

export default HeroSection;
