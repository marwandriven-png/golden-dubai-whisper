import { motion, AnimatePresence } from "framer-motion";
import { type HotelData } from "@/data/hotelData";

interface HeroSectionProps {
  hotel: HotelData;
}

const HeroSection = ({ hotel }: HeroSectionProps) => {
  return (
    <section className="min-h-screen grid grid-rows-[auto_1fr_auto]">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm font-display">{hotel.code}</span>
          </div>
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Confidential Investment
            </div>
            <div className="text-xs text-muted-foreground/60">{hotel.location} • {hotel.subLocation}</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground/60 tracking-widest uppercase">
          {hotel.mandate}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2">
        {/* Left: Typography */}
        <AnimatePresence mode="wait">
          <motion.div
            key={hotel.id + "-hero-left"}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center px-8 lg:px-16 py-12 bg-background relative"
          >
            <div className="mb-8">
              <div className="section-tag">{hotel.tagline}</div>
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
              {hotel.heroDescription}
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <div className="stat-pill">
                <span className="text-2xl font-bold font-display">{hotel.keys}</span>
                <span className="text-xs uppercase tracking-wider opacity-80">Keys</span>
              </div>
              <div className="stat-pill">
                <span className="text-2xl font-bold font-display">{hotel.roi}</span>
                <span className="text-xs uppercase tracking-wider opacity-80">{hotel.highlightLabel}</span>
              </div>
              <div className="stat-pill">
                <span className="text-2xl font-bold font-display">{hotel.sqft}</span>
                <span className="text-xs uppercase tracking-wider opacity-80">SqFt</span>
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <div className="text-muted-foreground/60 text-xs uppercase tracking-wider mb-1">
                    Structure
                  </div>
                  <div className="font-semibold">{hotel.structure}</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <div className="text-muted-foreground/60 text-xs uppercase tracking-wider mb-1">
                    Status
                  </div>
                  <div className="font-semibold text-accent">{hotel.status}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right: Hotel Photo */}
        <AnimatePresence mode="wait">
          <motion.div
            key={hotel.id + "-hero-right"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-muted overflow-hidden"
          >
            <img
              src={hotel.heroImage}
              alt={`${hotel.name} - ${hotel.location} ${hotel.subLocation}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />

            {/* Confidential Badge */}
            <div className="confidential-badge">
              <div className="text-xs text-primary-foreground/60 uppercase tracking-wider mb-1">
                Asset Location
              </div>
              <div className="font-display font-bold text-lg leading-tight whitespace-pre-line">
                {hotel.locationBadge.title}
              </div>
              <div className="text-xs text-primary-foreground/40 mt-2">{hotel.locationBadge.subtitle}</div>
            </div>

            {/* Bottom Stats Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              <div className="flex gap-8 text-primary-foreground">
                <div>
                  <div className="text-3xl font-bold font-display">{hotel.revenueOutlets}</div>
                  <div className="text-xs uppercase tracking-wider opacity-70">Revenue Outlets</div>
                </div>
                <div>
                  <div className="text-3xl font-bold font-display">{hotel.spaRooms}</div>
                  <div className="text-xs uppercase tracking-wider opacity-70">SPA Rooms</div>
                </div>
                <div>
                  <div className="text-3xl font-bold font-display">{hotel.entertainmentVenues}</div>
                  <div className="text-xs uppercase tracking-wider opacity-70">Entertainment Venues</div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
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
