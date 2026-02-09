import { motion, AnimatePresence } from "framer-motion";
import { Building2, Key, TrendingUp, Square, Calendar, Users, type LucideIcon } from "lucide-react";
import { type HotelData } from "@/data/hotelData";

const iconMap: Record<string, LucideIcon> = {
  key: Key,
  building2: Building2,
  trending: TrendingUp,
  square: Square,
  calendar: Calendar,
  users: Users,
};

interface InvestmentSnapshotProps {
  hotel: HotelData;
}

const InvestmentSnapshot = ({ hotel }: InvestmentSnapshotProps) => {
  return (
    <section className="py-24 px-8 lg:px-16 bg-secondary">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="section-tag">Investment Summary</div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Investment Snapshot
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Key financial and operational metrics for qualified investors reviewing
            this opportunity.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={hotel.id + "-metrics"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {hotel.metrics.map((metric, index) => {
                const Icon = iconMap[metric.icon];
                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-background p-6 border border-border"
                  >
                    <div className="w-12 h-12 bg-primary/5 flex items-center justify-center mb-4">
                      {Icon && <Icon className="w-6 h-6 text-primary" />}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                      {metric.label}
                    </div>
                    <div className="text-3xl font-bold font-display text-primary mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{metric.sublabel}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Price Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-8 bg-primary text-primary-foreground p-8 flex flex-col md:flex-row md:items-center justify-between"
            >
              <div>
                <div className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-2">
                  Asking Price
                </div>
                <div className="text-3xl md:text-4xl font-display font-bold">
                  Price on Request
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex gap-4">
                <div className="border-l border-primary-foreground/20 pl-4">
                  <div className="text-xs text-primary-foreground/60">Ownership</div>
                  <div className="font-semibold">{hotel.ownership}</div>
                </div>
                <div className="border-l border-primary-foreground/20 pl-4">
                  <div className="text-xs text-primary-foreground/60">Transaction</div>
                  <div className="font-semibold">{hotel.transaction}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default InvestmentSnapshot;
