import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, RefreshCw, Shield, Users, type LucideIcon } from "lucide-react";
import { type HotelData } from "@/data/hotelData";

const strategyIconMap: Record<string, LucideIcon> = {
  refresh: RefreshCw,
  trending: TrendingUp,
  shield: Shield,
  users: Users,
};

interface InvestmentThesisProps {
  hotel: HotelData;
}

const InvestmentThesis = ({ hotel }: InvestmentThesisProps) => {
  return (
    <section className="py-24 px-8 lg:px-16 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="editorial-grid">
          {/* Left: Strategy Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={hotel.id + "-strategies"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div>
                <div className="section-tag">Investment Angle</div>
                <h2 className="text-4xl font-display font-bold mb-4">
                  Opportunity Thesis
                </h2>
              </div>

              {hotel.strategies.map((strategy, index) => {
                const Icon = strategyIconMap[strategy.icon];
                return (
                  <motion.div
                    key={strategy.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-6 bg-secondary border border-border"
                  >
                    <div className="w-12 h-12 bg-primary flex items-center justify-center flex-shrink-0">
                      {Icon && <Icon className="w-6 h-6 text-primary-foreground" />}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{strategy.title}</h3>
                      <p className="text-sm text-muted-foreground">{strategy.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Right: Target Profile */}
          <AnimatePresence mode="wait">
            <motion.div
              key={hotel.id + "-profile"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="bg-primary text-primary-foreground p-8">
                <div className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-4">
                  Target Investor Profile
                </div>
                <div className="font-display text-2xl font-bold mb-6 leading-relaxed">
                  {hotel.targetProfile}
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-primary-foreground/80">
                  <div>
                    <span className="block text-primary-foreground/50 text-xs mb-1">Hold Period</span>
                    <span className="font-semibold">{hotel.holdPeriod}</span>
                  </div>
                  <div>
                    <span className="block text-primary-foreground/50 text-xs mb-1">Exit Strategy</span>
                    <span className="font-semibold">{hotel.exitStrategy}</span>
                  </div>
                  <div>
                    <span className="block text-primary-foreground/50 text-xs mb-1">Due Diligence</span>
                    <span className="font-semibold">{hotel.dueDiligence}</span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary p-8 border border-border">
                <h3 className="font-display font-semibold mb-4">Suitable For</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {["Hospitality Operators", "Family Offices", "Institutional Funds", "HNWI Investors", "Hotel REITs", "Private Equity"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 border-2 border-accent bg-accent/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-accent rounded-full" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                    Process Note
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This is a direct mandate with no broker chain. Qualified investors
                  may proceed directly to due diligence upon execution of NDA and
                  submission of proof of funds.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default InvestmentThesis;
