import HeroSection from "@/components/teaser/HeroSection";
import InvestmentSnapshot from "@/components/teaser/InvestmentSnapshot";
import LocationIntelligence from "@/components/teaser/LocationIntelligence";
import WhyInvestDeira from "@/components/teaser/WhyInvestDeira";
import AssetHighlights from "@/components/teaser/AssetHighlights";
import InvestmentThesis from "@/components/teaser/InvestmentThesis";
import DisclaimerFooter from "@/components/teaser/DisclaimerFooter";
import PdfDownloadButton from "@/components/teaser/PdfDownloadButton";
import { Printer } from "lucide-react";

const TeaserPage = () => {
  return (
    <main id="teaser-content" className="min-h-screen">
      <HeroSection />
      <InvestmentSnapshot />
      <LocationIntelligence />
      <WhyInvestDeira />
      <AssetHighlights />
      <InvestmentThesis />
      <DisclaimerFooter />

      {/* Print & Save Actions */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 print:hidden">
        <PdfDownloadButton />
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-semibold shadow-lg hover:bg-primary/90 transition-all"
        >
          <Printer className="w-5 h-5" />
          <span>Print</span>
        </button>
      </div>
    </main>
  );
};

export default TeaserPage;