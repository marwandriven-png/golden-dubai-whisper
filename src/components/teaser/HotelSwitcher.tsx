import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { hotels, type HotelData } from "@/data/hotelData";

interface HotelSwitcherProps {
  activeHotel: HotelData;
  onSelect: (hotel: HotelData) => void;
}

const HotelSwitcher = ({ activeHotel, onSelect }: HotelSwitcherProps) => {
  return (
    <section className="bg-secondary border-b border-border">
      <div className="max-w-6xl mx-auto px-8 lg:px-16 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-accent" />
          <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
            Select Property
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hotels.map((hotel) => {
            const isActive = hotel.id === activeHotel.id;
            return (
              <motion.button
                key={hotel.id}
                onClick={() => onSelect(hotel)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative text-left p-5 border transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-accent/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="hotel-indicator"
                    className="absolute top-0 left-0 w-1 h-full bg-accent"
                  />
                )}
                <div className="flex items-start justify-between mb-2">
                  <div
                    className={`w-8 h-8 flex items-center justify-center text-xs font-bold font-display ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "bg-primary/5 text-primary"
                    }`}
                  >
                    {hotel.code}
                  </div>
                  <span
                    className={`text-xs uppercase tracking-wider ${
                      isActive ? "text-primary-foreground/60" : "text-muted-foreground"
                    }`}
                  >
                    {hotel.location}
                  </span>
                </div>
                <div className="font-display font-semibold text-sm mb-1">
                  {hotel.name}
                </div>
                <div className="flex items-baseline gap-3">
                  <span
                    className={`text-lg font-bold font-display ${
                      isActive ? "text-accent" : "text-primary"
                    }`}
                  >
                    {hotel.highlight}
                  </span>
                  <span
                    className={`text-xs ${
                      isActive ? "text-primary-foreground/50" : "text-muted-foreground"
                    }`}
                  >
                    {hotel.highlightLabel}
                  </span>
                  <span className="text-xs text-muted-foreground/60">•</span>
                  <span
                    className={`text-xs ${
                      isActive ? "text-primary-foreground/50" : "text-muted-foreground"
                    }`}
                  >
                    {hotel.keys} Keys
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HotelSwitcher;
