import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plane, Building, Landmark, type LucideIcon } from "lucide-react";
import { type HotelData } from "@/data/hotelData";

const proximityIconMap: Record<string, LucideIcon> = {
  plane: Plane,
  building: Building,
  landmark: Landmark,
};

interface LocationIntelligenceProps {
  hotel: HotelData;
}

const LocationIntelligence = ({ hotel }: LocationIntelligenceProps) => {
  return (
    <section className="py-24 px-8 lg:px-16 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="editorial-grid">
          {/* Left: Map */}
          <AnimatePresence mode="wait">
            <motion.div
              key={hotel.id + "-location-map"}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5 }}
              className="relative h-[500px] bg-muted overflow-hidden"
            >
              <img
                src={hotel.locationImage}
                alt={`${hotel.name} Location`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />

              {/* Location Marker */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-6 h-6 bg-destructive rounded-full border-4 border-background shadow-lg" />
                  <div className="absolute inset-0 w-6 h-6 bg-destructive rounded-full animate-pulse-ring" />
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-background px-3 py-1 whitespace-nowrap shadow-lg">
                    <span className="text-xs font-bold text-primary">ASSET LOCATION</span>
                  </div>
                </div>
              </div>

              {/* Map Overlay */}
              <div className="map-overlay">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-destructive rounded-full" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {hotel.locationOverlay.tag}
                  </span>
                </div>
                <div className="font-display font-bold text-xl mb-2">
                  {hotel.locationOverlay.title}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {hotel.locationOverlay.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right: Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={hotel.id + "-location-content"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div>
                <div className="section-tag">Location Intelligence</div>
                <h2 className="text-4xl font-display font-bold mb-4">
                  Strategic Positioning
                </h2>
                <p className="text-muted-foreground">
                  {hotel.locationDescription}
                </p>
              </div>

              {/* Proximity Cards */}
              <div className="bg-secondary p-6 border border-border">
                <h3 className="font-display font-semibold mb-4">Proximity Highlights</h3>
                <div className="space-y-4">
                  {hotel.proximities.map((item) => {
                    const Icon = proximityIconMap[item.icon];
                    return (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <span className="font-semibold text-primary">{item.distance}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Advantages */}
              <div className="space-y-4">
                {hotel.locationAdvantages.map((adv) => (
                  <div key={adv.title} className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/5 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{adv.title}</h4>
                      <p className="text-sm text-muted-foreground">{adv.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default LocationIntelligence;
