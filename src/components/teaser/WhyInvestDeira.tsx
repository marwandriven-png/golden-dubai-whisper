import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Briefcase, Globe, Gem, type LucideIcon } from "lucide-react";
import { type HotelData } from "@/data/hotelData";

const whyIconMap: Record<string, LucideIcon> = {
  trending: TrendingUp,
  briefcase: Briefcase,
  globe: Globe,
  gem: Gem,
};

interface WhyInvestDeiraProps {
  hotel: HotelData;
}

const WhyInvestDeira = ({ hotel }: WhyInvestDeiraProps) => {
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
            {hotel.whyInvestTitle}
          </h2>
          <p className="text-muted-foreground max-w-xl">
            {hotel.whyInvestSubtitle}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={hotel.id + "-why"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {hotel.whyInvest.map((reason, index) => {
              const Icon = whyIconMap[reason.icon];
              return (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-secondary p-8 border border-border flex gap-6"
                >
                  <div className="w-14 h-14 bg-primary/5 flex items-center justify-center flex-shrink-0">
                    {Icon && <Icon className="w-7 h-7 text-accent" />}
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
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default WhyInvestDeira;
