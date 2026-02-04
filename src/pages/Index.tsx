import HeroSection from "@/components/teaser/HeroSection";
import InvestmentSnapshot from "@/components/teaser/InvestmentSnapshot";
import LocationIntelligence from "@/components/teaser/LocationIntelligence";
import AssetHighlights from "@/components/teaser/AssetHighlights";
import InvestmentThesis from "@/components/teaser/InvestmentThesis";
import DisclaimerFooter from "@/components/teaser/DisclaimerFooter";

const Index = () => {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <InvestmentSnapshot />
      <LocationIntelligence />
      <AssetHighlights />
      <InvestmentThesis />
      <DisclaimerFooter />
    </main>
  );
};

export default Index;
