import { motion } from "framer-motion";
import { Building2, MapPin, Key, TrendingUp } from "lucide-react";
import { hotels, type HotelData } from "@/data/hotelData";

interface HotelSwitcherProps {
  activeHotel: HotelData;
  onSelect: (hotel: HotelData) => void;
}

const HotelSwitcher = ({ activeHotel, onSelect }: HotelSwitcherProps) => {
  return (
    <section className="sticky top-0 z-50 bg-primary border-b border-border shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
              Investment Portfolio
            </span>
          </div>
          <span className="text-xs text-primary-foreground/40 uppercase tracking-wider hidden sm:block">
            Select a property to view details
          </span>
        </div>

        {/* Hotel Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {hotels.map((hotel) => {
            const isActive = hotel.id === activeHotel.id;
            return (
              <motion.button
                key={hotel.id}
                onClick={() => onSelect(hotel)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative text-left p-3 sm:p-5 border-2 transition-all duration-300 overflow-hidden ${
                  isActive
                    ? "bg-accent text-accent-foreground border-accent shadow-[0_0_20px_hsl(var(--accent)/0.3)]"
                    : "bg-primary-foreground/5 border-primary-foreground/10 hover:border-accent/40 hover:bg-primary-foreground/10"
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="hotel-active-bar"
                    className="absolute top-0 left-0 right-0 h-1 bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Code badge + Location */}
                <div className="flex items-start justify-between mb-1 sm:mb-2">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-bold font-display transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent/20 text-accent"
                    }`}
                  >
                    {hotel.code}
                  </div>
                  <div className={`flex items-center gap-1 ${isActive ? "text-primary/60" : "text-primary-foreground/40"}`}>
                    <MapPin className="w-3 h-3" />
                    <span className="text-[10px] sm:text-xs uppercase tracking-wider">
                      {hotel.location}
                    </span>
                  </div>
                </div>

                {/* Hotel Name */}
                <div className={`font-display font-bold text-sm sm:text-base mb-1 sm:mb-2 ${
                  isActive ? "text-primary" : "text-primary-foreground"
                }`}>
                  {hotel.name}
                </div>

                {/* Key metrics row */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`w-3 h-3 ${isActive ? "text-primary/70" : "text-accent"}`} />
                    <span className={`text-sm sm:text-lg font-bold font-display ${
                      isActive ? "text-primary" : "text-accent"
                    }`}>
                      {hotel.highlight}
                    </span>
                  </div>
                  <span className={`text-[10px] sm:text-xs ${isActive ? "text-primary/50" : "text-primary-foreground/30"}`}>•</span>
                  <div className="flex items-center gap-1">
                    <Key className={`w-3 h-3 ${isActive ? "text-primary/70" : "text-primary-foreground/40"}`} />
                    <span className={`text-xs sm:text-sm font-semibold ${
                      isActive ? "text-primary/70" : "text-primary-foreground/50"
                    }`}>
                      {hotel.keys} Rooms
                    </span>
                  </div>
                </div>

                {/* Active label */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 sm:mt-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary/50"
                  >
                    ● Currently Viewing
                  </motion.div>
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
