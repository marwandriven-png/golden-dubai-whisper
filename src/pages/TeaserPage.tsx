import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HotelSwitcher from "@/components/teaser/HotelSwitcher";
import HeroSection from "@/components/teaser/HeroSection";
import InvestmentSnapshot from "@/components/teaser/InvestmentSnapshot";
import LocationIntelligence from "@/components/teaser/LocationIntelligence";
import WhyInvestDeira from "@/components/teaser/WhyInvestDeira";
import AssetHighlights from "@/components/teaser/AssetHighlights";
import InvestmentThesis from "@/components/teaser/InvestmentThesis";
import DisclaimerFooter from "@/components/teaser/DisclaimerFooter";
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
  );
};

export default TeaserPage;
