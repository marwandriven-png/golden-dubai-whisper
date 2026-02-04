import HeroSection from "@/components/teaser/HeroSection";
import InvestmentSnapshot from "@/components/teaser/InvestmentSnapshot";
import LocationIntelligence from "@/components/teaser/LocationIntelligence";
import AssetHighlights from "@/components/teaser/AssetHighlights";
import InvestmentThesis from "@/components/teaser/InvestmentThesis";
import DisclaimerFooter from "@/components/teaser/DisclaimerFooter";
import PdfDownloadButton from "@/components/teaser/PdfDownloadButton";

const Index = () => {
  return (
    <>
      <main id="teaser-content" className="min-h-screen">
        <HeroSection />
        <InvestmentSnapshot />
        <LocationIntelligence />
        <AssetHighlights />
        <InvestmentThesis />
        <DisclaimerFooter />
      </main>
      <PdfDownloadButton />
    </>
  );
};

export default Index;
