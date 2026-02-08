import HeroSection from "@/components/teaser/HeroSection";
import InvestmentSnapshot from "@/components/teaser/InvestmentSnapshot";
import LocationIntelligence from "@/components/teaser/LocationIntelligence";
import WhyInvestDeira from "@/components/teaser/WhyInvestDeira";
import AssetHighlights from "@/components/teaser/AssetHighlights";
import InvestmentThesis from "@/components/teaser/InvestmentThesis";
import DisclaimerFooter from "@/components/teaser/DisclaimerFooter";

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
    </main>
  );
};

export default TeaserPage;