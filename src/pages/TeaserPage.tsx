import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Printer } from "lucide-react";
import HotelSwitcher from "@/components/teaser/HotelSwitcher";
import HeroSection from "@/components/teaser/HeroSection";
import InvestmentSnapshot from "@/components/teaser/InvestmentSnapshot";
import LocationIntelligence from "@/components/teaser/LocationIntelligence";
import WhyInvestDeira from "@/components/teaser/WhyInvestDeira";
import AssetHighlights from "@/components/teaser/AssetHighlights";
import InvestmentThesis from "@/components/teaser/InvestmentThesis";
import DisclaimerFooter from "@/components/teaser/DisclaimerFooter";
import PdfDownloadButton from "@/components/teaser/PdfDownloadButton";
import { hotels, type HotelData } from "@/data/hotelData";

const TeaserPage = () => {
  const [activeHotel, setActiveHotel] = useState<HotelData>(hotels[0]);

  const handleSelect = (hotel: HotelData) => {
    if (hotel.id !== activeHotel.id) {
      setActiveHotel(hotel);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <main id="teaser-content" className="min-h-screen">
        <HotelSwitcher activeHotel={activeHotel} onSelect={handleSelect} />
        <HeroSection hotel={activeHotel} />
        <InvestmentSnapshot hotel={activeHotel} />
        <LocationIntelligence hotel={activeHotel} />
        <WhyInvestDeira hotel={activeHotel} />
        <AssetHighlights hotel={activeHotel} />
        <InvestmentThesis hotel={activeHotel} />
        <DisclaimerFooter />
      </main>

      {/* Floating action buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 print:hidden">
        <PdfDownloadButton />
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-semibold shadow-lg hover:bg-primary/90 transition-all"
        >
          <Printer className="w-5 h-5" />
          <span>Print</span>
        </button>
      </div>
    </>
  );
};

export default TeaserPage;
