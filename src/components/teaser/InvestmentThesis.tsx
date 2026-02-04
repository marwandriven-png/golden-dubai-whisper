import { motion } from "framer-motion";
import { TrendingUp, RefreshCw, Shield, Users } from "lucide-react";

const strategies = [
  {
    icon: RefreshCw,
    title: "Repositioning Opportunity",
    desc: "Convert to boutique lifestyle brand or international chain flag to capture premium ADR",
  },
  {
    icon: TrendingUp,
    title: "Value-Add Potential",
    desc: "Room renovation and F&B concept refresh to drive rate growth and occupancy",
  },
  {
    icon: Shield,
    title: "Stable Income Profile",
    desc: "Diversified revenue base with 11 outlets reduces reliance on room revenue alone",
  },
  {
    icon: Users,
    title: "Operational Upside",
    desc: "Opportunity to implement professional management and improve operational efficiency",
  },
];

const InvestmentThesis = () => {
  return (
    <section className="py-24 px-8 lg:px-16 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="editorial-grid">
          {/* Left: Strategy Cards */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="section-tag">Investment Angle</div>
              <h2 className="text-4xl font-display font-bold mb-4">
                Opportunity Thesis
              </h2>
            </motion.div>

            {strategies.map((strategy, index) => (
              <motion.div
                key={strategy.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-6 bg-secondary border border-border"
              >
                <div className="w-12 h-12 bg-primary flex items-center justify-center flex-shrink-0">
                  <strategy.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{strategy.title}</h3>
                  <p className="text-sm text-muted-foreground">{strategy.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Target Profile */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-primary text-primary-foreground p-8"
            >
              <div className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-4">
                Target Investor Profile
              </div>
              <div className="font-display text-2xl font-bold mb-6 leading-relaxed">
                Ideal for hospitality operators, family offices, and institutional
                investors seeking yield with upside potential.
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-primary-foreground/80">
                <div>
                  <span className="block text-primary-foreground/50 text-xs mb-1">
                    Hold Period
                  </span>
                  <span className="font-semibold">5-7 Years</span>
                </div>
                <div>
                  <span className="block text-primary-foreground/50 text-xs mb-1">
                    Exit Strategy
                  </span>
                  <span className="font-semibold">Operator Sale</span>
                </div>
                <div>
                  <span className="block text-primary-foreground/50 text-xs mb-1">
                    Due Diligence
                  </span>
                  <span className="font-semibold">Immediate</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-secondary p-8 border border-border"
            >
              <h3 className="font-display font-semibold mb-4">Suitable For</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Hospitality Operators</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Family Offices</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Institutional Funds</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>HNWI Investors</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Hotel REITs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Private Equity</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-8 border-2 border-accent bg-accent/5"
            >
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
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestmentThesis;
