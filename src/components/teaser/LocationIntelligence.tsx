import { motion } from "framer-motion";
import { MapPin, Plane, Building, Landmark } from "lucide-react";
import locationSatellite from "@/assets/location-satellite.jpeg";

const proximities = [
  { icon: Plane, label: "Dubai International Airport", distance: "12 min" },
  { icon: Building, label: "DIFC / Downtown Dubai", distance: "18 min" },
  { icon: Landmark, label: "Gold Souk & Heritage District", distance: "5 min" },
];

const LocationIntelligence = () => {
  return (
    <section className="py-24 px-8 lg:px-16 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="editorial-grid">
          {/* Left: Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[500px] bg-muted overflow-hidden"
          >
            <img
              src={locationSatellite}
              alt="Asset Location Satellite View"
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
                  Prime Position
                </span>
              </div>
              <div className="font-display font-bold text-xl mb-2">
                Deira City Centre District
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Highway intersection location with direct mall access. High
                visibility and footfall.
              </p>
            </div>
          </motion.div>

          {/* Right: Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="section-tag">Location Intelligence</div>
              <h2 className="text-4xl font-display font-bold mb-4">
                Strategic Positioning
              </h2>
              <p className="text-muted-foreground">
                Positioned at the intersection of Dubai's historic trading district
                and modern commercial hub, this asset benefits from exceptional
                connectivity and established tourism demand.
              </p>
            </motion.div>

            {/* Proximity Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-secondary p-6 border border-border"
            >
              <h3 className="font-display font-semibold mb-4">Proximity Highlights</h3>
              <div className="space-y-4">
                {proximities.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="font-semibold text-primary">{item.distance}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Advantages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Prime Positioning</h4>
                  <p className="text-sm text-muted-foreground">
                    Directly opposite Deira City Centre, Dubai's established retail
                    and leisure hub with 340+ stores.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/5 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Metro Connectivity</h4>
                  <p className="text-sm text-muted-foreground">
                    Direct access to Dubai Metro Green Line. Connected to 47 stations
                    across the city network.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationIntelligence;
