import { motion } from "framer-motion";
import { Building2, MapPin, Key, TrendingUp, CheckCircle } from "lucide-react";
import { hotels, type HotelData } from "@/data/hotelData";

interface HotelSwitcherProps {
  activeHotel: HotelData;
  onSelect: (hotel: HotelData) => void;
}

const HotelSwitcher = ({ activeHotel, onSelect }: HotelSwitcherProps) => {
  return (
    <section className="sticky top-0 z-50 bg-primary border-b-2 border-accent/30 shadow-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-4 sm:py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-accent" />
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-accent font-bold">
              Investment Portfolio — Select Property
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-primary-foreground/40 uppercase tracking-wider">
            {hotels.findIndex(h => h.id === activeHotel.id) + 1} of {hotels.length}
          </span>
        </div>

        {/* Hotel Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {hotels.map((hotel) => {
            const isActive = hotel.id === activeHotel.id;
            return (
              <motion.button
                key={hotel.id}
                onClick={() => onSelect(hotel)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`relative text-left rounded-lg overflow-hidden transition-all duration-300 outline-none ${
                  isActive
                    ? "ring-2 ring-accent shadow-[0_0_20px_hsl(var(--accent)/0.3)]"
                    : "ring-1 ring-primary-foreground/10 hover:ring-primary-foreground/30 opacity-60 hover:opacity-90"
                }`}
              >
                {/* Card content */}
                <div className={`p-3 sm:p-4 transition-colors duration-300 ${
                  isActive
                    ? "bg-accent/15"
                    : "bg-primary-foreground/5 hover:bg-primary-foreground/8"
                }`}>
                  {/* Active indicator / Hotel code */}
                  <div className="flex items-center justify-between mb-2">
                    <div className={`flex items-center gap-1.5 ${
                      isActive ? "text-accent" : "text-primary-foreground/50"
                    }`}>
                      {isActive ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                      ) : (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-primary-foreground/20" />
                      )}
                      <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                        isActive ? "text-accent" : "text-primary-foreground/40"
                      }`}>
                        {isActive ? "Viewing" : "View"}
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono ${
                      isActive ? "text-accent/70" : "text-primary-foreground/30"
                    }`}>
                      {hotel.code}
                    </span>
                  </div>

                  {/* Hotel Name */}
                  <h3 className={`font-display font-bold text-xs sm:text-sm leading-tight mb-1.5 ${
                    isActive ? "text-primary-foreground" : "text-primary-foreground/70"
                  }`}>
                    {hotel.name}
                  </h3>

                  {/* Location */}
                  <div className={`flex items-center gap-1 mb-2 ${
                    isActive ? "text-primary-foreground/60" : "text-primary-foreground/35"
                  }`}>
                    <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                    <span className="text-[9px] sm:text-[11px] uppercase tracking-wider truncate">
                      {hotel.location}, {hotel.subLocation}
                    </span>
                  </div>

                  {/* Quick metrics */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`w-3 h-3 ${isActive ? "text-accent" : "text-primary-foreground/40"}`} />
                      <span className={`text-sm sm:text-base font-bold font-display ${
                        isActive ? "text-accent" : "text-primary-foreground/50"
                      }`}>
                        {hotel.highlight}
                      </span>
                    </div>
                    <span className={`text-[9px] ${isActive ? "text-primary-foreground/20" : "text-primary-foreground/15"}`}>|</span>
                    <div className="flex items-center gap-1">
                      <Key className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isActive ? "text-primary-foreground/50" : "text-primary-foreground/30"}`} />
                      <span className={`text-[10px] sm:text-xs font-semibold ${
                        isActive ? "text-primary-foreground/60" : "text-primary-foreground/40"
                      }`}>
                        {hotel.keys} Keys
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active bottom accent bar */}
                {isActive && (
                  <motion.div
                    layoutId="hotel-active-bar"
                    className="h-[3px] bg-accent w-full"
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
