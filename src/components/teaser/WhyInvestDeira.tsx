import { motion } from "framer-motion";
import { TrendingUp, Briefcase, Globe, Gem } from "lucide-react";

const reasons = [
  {
    icon: TrendingUp,
    title: "High Occupancy Rates",
    description:
      "Deira maintains 85%+ hotel occupancy year-round due to business and tourist traffic",
  },
  {
    icon: Briefcase,
    title: "Business Hub",
    description:
      "Major commercial district with international companies and trade centers",
  },
  {
    icon: Globe,
    title: "Tourist Destination",
    description:
      "Historic souks and cultural sites attract millions of visitors annually",
  },
  {
    icon: Gem,
    title: "Proven Track Record",
    description:
      "Established area with consistent property appreciation and rental yields",
  },
];

const WhyInvestDeira = () => {
  return (
    <section className="py-24 px-8 lg:px-16 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="section-tag">Market Fundamentals</div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Why Invest in Deira?
          </h2>
          <p className="text-muted-foreground max-w-xl">
            One of Dubai's most established districts with proven demand drivers
            and strong fundamentals.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-secondary p-8 border border-border flex gap-6"
            >
              <div className="w-14 h-14 bg-primary/5 flex items-center justify-center flex-shrink-0">
                <reason.icon className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-2">
                  {reason.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyInvestDeira;
