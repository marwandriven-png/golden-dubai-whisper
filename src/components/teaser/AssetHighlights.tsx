import { motion, AnimatePresence } from "framer-motion";
import { type HotelData } from "@/data/hotelData";

interface AssetHighlightsProps {
  hotel: HotelData;
}

const AssetHighlights = ({ hotel }: AssetHighlightsProps) => {
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

        <AnimatePresence mode="wait">
          <motion.div
            key={hotel.id + "-outlets"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-2 gap-12"
          >
            {/* Left: Outlet Tables */}
            <div className="space-y-8">
              {hotel.floors.map((floor, fi) => (
                <motion.div
                  key={floor.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: fi * 0.1 }}
                >
                  <div className="floor-header">{floor.label}</div>
                  <table className="w-full text-sm">
                    <tbody>
                      {floor.outlets.map((item) => (
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
              ))}
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
                  {hotel.investmentMetrics.map((m) => (
                    <div key={m.label}>
                      <div className="metric-large">
                        {m.value}
                        {m.suffix && <span className="text-4xl">{m.suffix}</span>}
                      </div>
                      <div className="text-sm text-muted-foreground uppercase tracking-wider mt-2">
                        {m.label}
                      </div>
                    </div>
                  ))}
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
                  {hotel.competitivePositioning.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="text-accent">●</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AssetHighlights;
