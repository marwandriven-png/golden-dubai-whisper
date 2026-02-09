import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Key, TrendingUp, CheckCircle } from "lucide-react";
import { hotels, type HotelData } from "@/data/hotelData";
import xEstateLogo from "@/assets/x-estate-logo.svg";

interface HotelSwitcherProps {
  activeHotel: HotelData;
  onSelect: (hotel: HotelData) => void;
}

const HotelSwitcher = ({ activeHotel, onSelect }: HotelSwitcherProps) => {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setVisible(currentY < 50 || currentY < lastScrollY.current);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.section
      initial={{ y: 0 }}
      animate={{ y: visible ? 0 : "-100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="sticky top-0 z-50 bg-primary border-b border-primary-foreground/10 shadow-lg"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-3">
        {/* Logo row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-3">
            <img src={xEstateLogo} alt="X Estate" className="h-6 w-auto brightness-200" />
            <div className="h-4 w-px bg-primary-foreground/10" />
            <span className="text-[10px] uppercase tracking-[0.15em] text-primary-foreground/50 font-medium">
              Select Property
            </span>
          </div>
          <span className="text-[10px] text-primary-foreground/25 font-mono tracking-wider">
            {hotels.findIndex(h => h.id === activeHotel.id) + 1}/{hotels.length}
          </span>
        </div>

        {/* Hotel Cards */}
        <div className="grid grid-cols-3 gap-2">
          {hotels.map((hotel) => {
            const isActive = hotel.id === activeHotel.id;
            return (
              <motion.button
                key={hotel.id}
                onClick={() => onSelect(hotel)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`relative text-left overflow-hidden transition-all duration-200 outline-none border ${
                  isActive
                    ? "border-accent/40 bg-accent/10"
                    : "border-primary-foreground/5 bg-primary-foreground/3 hover:bg-primary-foreground/5 opacity-50 hover:opacity-80"
                }`}
              >
                <div className="px-3 py-2.5 sm:px-4 sm:py-3">
                  {/* Hotel name + status */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-display font-bold text-xs sm:text-sm leading-tight ${
                      isActive ? "text-primary-foreground" : "text-primary-foreground/70"
                    }`}>
                      {hotel.name}
                    </h3>
                    {isActive && <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />}
                  </div>

                  {/* Location */}
                  <div className={`flex items-center gap-1 mb-2 ${
                    isActive ? "text-primary-foreground/50" : "text-primary-foreground/30"
                  }`}>
                    <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider truncate">
                      {hotel.location}, {hotel.subLocation}
                    </span>
                  </div>

                  {/* Metrics row */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm sm:text-base font-bold font-display ${
                      isActive ? "text-accent" : "text-primary-foreground/40"
                    }`}>
                      {hotel.highlight}
                    </span>
                    <span className="text-primary-foreground/10">·</span>
                    <span className={`text-[10px] sm:text-xs ${
                      isActive ? "text-primary-foreground/50" : "text-primary-foreground/30"
                    }`}>
                      {hotel.keys} Keys
                    </span>
                  </div>
                </div>

                {/* Active accent bar */}
                {isActive && (
                  <motion.div
                    layoutId="hotel-active-bar"
                    className="h-0.5 bg-accent w-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default HotelSwitcher;
