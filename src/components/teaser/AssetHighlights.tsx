import { motion } from "framer-motion";

const groundFloor = [
  { name: "Board Room", desc: "Snooker & leisure lounge" },
  { name: "Karaoke Bar", desc: "Private entertainment suites" },
  { name: "Moscow (Jalsa)", desc: "Dance bar & nightclub" },
  { name: "Emerald", desc: "All-day coffee shop" },
];

const mezzanine = [
  { name: "Chick Boy", desc: "Dance bar & entertainment" },
  { name: "The Old Bull Pub", desc: "Chick Boy Club lounge" },
  { name: "Chill Restaurant", desc: "Inasal dining concept" },
  { name: "Shisha Corner", desc: "Traditional lounge" },
  { name: "Gym", desc: "Fitness center" },
  { name: "Main Kitchen", desc: "Central F&B production" },
];

const healthClub = [
  { name: "SPA & Massage", desc: "8 treatment rooms • Premium wellness" },
];

const AssetHighlights = () => {
  return (
    <section className="py-24 px-8 lg:px-16 bg-secondary">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="section-tag">Revenue Centers</div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Outlet Mix
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Diversified income streams across F&B, entertainment, and wellness
            segments minimize revenue concentration risk.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Outlet Tables */}
          <div className="space-y-8">
            {/* Ground Floor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="floor-header">Ground Floor</div>
              <table className="w-full text-sm">
                <tbody>
                  {groundFloor.map((item) => (
                    <tr key={item.name} className="border-b border-border last:border-0">
                      <td className="py-3 w-1/3 text-muted-foreground font-medium">
                        {item.name}
                      </td>
                      <td className="py-3">{item.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Mezzanine */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="floor-header">Mezzanine Floor</div>
              <table className="w-full text-sm">
                <tbody>
                  {mezzanine.map((item) => (
                    <tr key={item.name} className="border-b border-border last:border-0">
                      <td className="py-3 w-1/3 text-muted-foreground font-medium">
                        {item.name}
                      </td>
                      <td className="py-3">{item.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Health Club */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="floor-header">Health Club Floor</div>
              <table className="w-full text-sm">
                <tbody>
                  {healthClub.map((item) => (
                    <tr key={item.name} className="border-b border-border last:border-0">
                      <td className="py-3 w-1/3 text-muted-foreground font-medium">
                        {item.name}
                      </td>
                      <td className="py-3">{item.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>

          {/* Right: Metrics */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-background p-8 border border-border"
            >
              <h3 className="font-display font-semibold mb-6">Investment Metrics</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="metric-large">7%</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider mt-2">
                    Current ROI
                  </div>
                </div>
                <div>
                  <div className="metric-large">120</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider mt-2">
                    Hotel Keys
                  </div>
                </div>
                <div>
                  <div className="metric-large">
                    21<span className="text-4xl">K</span>
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider mt-2">
                    Sq Ft Plot
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-background p-8 border border-border"
            >
              <h3 className="font-display font-semibold mb-4">Competitive Positioning</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="text-accent">●</span>
                  <span>
                    One of few full-service hotels with integrated entertainment
                    licensing in Deira
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">●</span>
                  <span>
                    Established brand presence with loyal corporate and leisure
                    clientele
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">●</span>
                  <span>
                    SPA & wellness offering positioned in underserved market segment
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">●</span>
                  <span>
                    Multiple F&B concepts driving ancillary revenue above market
                    average
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssetHighlights;
