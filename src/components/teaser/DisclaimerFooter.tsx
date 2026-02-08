import { motion } from "framer-motion";

const DisclaimerFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Contact CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="border-b border-primary-foreground/10 px-8 lg:px-16 py-16"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary-foreground/50 mb-2">
              Inquiries & Due Diligence
            </div>
            <div className="text-2xl md:text-3xl font-display font-bold">
              Ready to proceed?
            </div>
          </div>
          <a
            href="https://wa.me/971547619887?text=Hello%20Marwan,%20I%20would%20like%20to%20request%20access%20to%20the%20CONFIDENTIAL%20HOTEL%20INVESTMENT%20information%20package.%20I%20understand%20this%20is%20subject%20to%20approval%20and%20NDA."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-8 py-4 font-semibold hover:bg-accent/90 transition-colors"
          >
            <span>Request Information Package</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <div className="px-8 lg:px-16 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="max-w-2xl">
              <div className="text-xs text-primary-foreground/50 mb-2 uppercase tracking-wider">
                Confidentiality Notice
              </div>
              <p className="text-xs text-primary-foreground/60 leading-relaxed">
                This document contains proprietary information intended solely for
                qualified investors. All measurements are approximate and subject to
                verification. Financial projections are illustrative and based on
                management estimates. Past performance is not indicative of future
                results. This material does not constitute an offer to sell or
                solicitation to buy any security or investment product. Recipients
                agree to maintain strict confidentiality regarding all information
                contained herein.
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-primary-foreground/10 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs font-display">
                    CI
                  </span>
                </div>
                <div className="font-display font-bold text-lg">
                  CONFIDENTIAL INVESTMENT
                </div>
              </div>
              <div className="text-sm text-primary-foreground/50">
                Deira • Dubai • UAE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10 px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-xs text-primary-foreground/40">
          <div className="flex gap-6">
            <span>Direct Mandate</span>
            <span>•</span>
            <span>No Broker Chain</span>
            <span>•</span>
            <span>DD Available</span>
          </div>
          <div>© 2026 Confidential Investment</div>
        </div>
      </div>
    </footer>
  );
};

export default DisclaimerFooter;
