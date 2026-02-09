import { motion } from "framer-motion";
import { Building2, MapPin, Key, TrendingUp, ChevronRight } from "lucide-react";
import { hotels, type HotelData } from "@/data/hotelData";

interface HotelSwitcherProps {
  activeHotel: HotelData;
  onSelect: (hotel: HotelData) => void;
}

const HotelSwitcher = ({ activeHotel, onSelect }: HotelSwitcherProps) => {
  return (
    <section className="sticky top-0 z-50 bg-primary border-b border-border shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-3 sm:py-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
              Select Property
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-primary-foreground/50">
            <ChevronRight className="w-3 h-3" />
            <span className="text-[10px] sm:text-xs uppercase tracking-wider hidden sm:block">
              Click to switch view
            </span>
          </div>
        </div>

        {/* Hotel Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {hotels.map((hotel, index) => {
            const isActive = hotel.id === activeHotel.id;
            return (
              <motion.button
                key={hotel.id}
                onClick={() => onSelect(hotel)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative text-left rounded-lg overflow-hidden transition-all duration-300 ${
                  isActive
                    ? "ring-2 ring-accent shadow-[0_0_24px_hsl(var(--accent)/0.35)]"
                    : "ring-1 ring-primary-foreground/10 hover:ring-accent/50"
                }`}
              >
                {/* Background */}
                <div className={`p-3 sm:p-4 transition-colors duration-300 ${
                  isActive
                    ? "bg-accent"
                    : "bg-primary-foreground/5 hover:bg-primary-foreground/10"
                }`}>
                  {/* Top: number badge + location */}
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-md flex items-center justify-center text-xs sm:text-sm font-bold font-display ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent/20 text-accent"
                    }`}>
                      {index + 1}
                    </div>
                    <div className={`flex items-center gap-1 ${isActive ? "text-primary/60" : "text-primary-foreground/40"}`}>
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="text-[9px] sm:text-[11px] uppercase tracking-wider leading-tight text-right max-w-[80px] sm:max-w-none">
                        {hotel.location}
                      </span>
                    </div>
                  </div>

                  {/* Hotel Name */}
                  <div className={`font-display font-bold text-xs sm:text-sm leading-tight mb-2 ${
                    isActive ? "text-primary" : "text-primary-foreground"
                  }`}>
                    {hotel.name}
                  </div>

                  {/* Key metrics */}
                  <div className="flex items-center gap-1.5 sm:gap-2.5">
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`w-3 h-3 ${isActive ? "text-primary/70" : "text-accent"}`} />
                      <span className={`text-sm sm:text-base font-bold font-display ${
                        isActive ? "text-primary" : "text-accent"
                      }`}>
                        {hotel.highlight}
                      </span>
                    </div>
                    <span className={`text-[9px] ${isActive ? "text-primary/40" : "text-primary-foreground/20"}`}>|</span>
                    <div className="flex items-center gap-1">
                      <Key className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isActive ? "text-primary/70" : "text-primary-foreground/40"}`} />
                      <span className={`text-[11px] sm:text-xs font-semibold ${
                        isActive ? "text-primary/70" : "text-primary-foreground/50"
                      }`}>
                        {hotel.keys} Rooms
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active bottom bar */}
                {isActive && (
                  <motion.div
                    layoutId="hotel-active-bar"
                    className="h-1 bg-primary w-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HotelSwitcher;
