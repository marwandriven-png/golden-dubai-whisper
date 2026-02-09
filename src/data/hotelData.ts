import hotelBuilding from "@/assets/hotel-building.jpeg";
import locationSatellite from "@/assets/location-satellite.jpeg";
import kaHotelLocation from "@/assets/ka-hotel-location.png";
import rtHotelLocation from "@/assets/rt-hotel-location.png";

export interface HotelOutlet {
  name: string;
  desc: string;
}

export interface HotelFloor {
  label: string;
  outlets: HotelOutlet[];
}

export interface HotelProximity {
  icon: "plane" | "building" | "landmark";
  label: string;
  distance: string;
}

export interface HotelStrategy {
  icon: "refresh" | "trending" | "shield" | "users";
  title: string;
  desc: string;
}

export interface HotelMetric {
  icon: "key" | "building2" | "trending" | "square" | "calendar" | "users";
  label: string;
  value: string;
  sublabel: string;
}

export interface HotelWhyInvest {
  icon: "trending" | "briefcase" | "globe" | "gem";
  title: string;
  description: string;
}

export interface HotelData {
  id: string;
  code: string;
  name: string;
  tagline: string;
  location: string;
  subLocation: string;
  mandate: string;
  heroImage: string;
  locationImage: string;
  highlight: string;
  highlightLabel: string;
  keys: number;
  roi: string;
  sqft: string;
  heroDescription: string;
  structure: string;
  status: string;
  revenueOutlets: number;
  spaRooms: number;
  entertainmentVenues: number;
  ownership: string;
  transaction: string;
  locationBadge: {
    title: string;
    subtitle: string;
  };
  metrics: HotelMetric[];
  floors: HotelFloor[];
  investmentMetrics: { label: string; value: string; suffix?: string }[];
  competitivePositioning: string[];
  proximities: HotelProximity[];
  locationDescription: string;
  locationOverlay: {
    tag: string;
    title: string;
    description: string;
  };
  locationAdvantages: { title: string; description: string }[];
  whyInvest: HotelWhyInvest[];
  whyInvestTitle: string;
  whyInvestSubtitle: string;
  strategies: HotelStrategy[];
  targetProfile: string;
  holdPeriod: string;
  exitStrategy: string;
  dueDiligence: string;
}

export const hotels: HotelData[] = [
  {
    id: "deira-hotel",
    code: "CI",
    name: "Deira Hotel",
    tagline: "Off-Market Opportunity",
    location: "Deira",
    subLocation: "Dubai",
    mandate: "Direct Mandate • 2026",
    heroImage: hotelBuilding,
    locationImage: locationSatellite,
    highlight: "6%",
    highlightLabel: "Guaranteed ROI",
    keys: 120,
    roi: "6%",
    sqft: "21K",
    heroDescription:
      "A landmark full-service hospitality asset opposite Deira City Centre, featuring 120 keys and 11 diversified revenue outlets across 12 floors.",
    structure: "B2 + G + 10 Floors",
    status: "Price on Request",
    revenueOutlets: 11,
    spaRooms: 8,
    entertainmentVenues: 3,
    ownership: "GCC Only",
    transaction: "Asset Sale",
    locationBadge: {
      title: "Opposite Deira\nCity Centre",
      subtitle: "Dubai • UAE",
    },
    metrics: [
      { icon: "key", label: "Keys / Rooms", value: "120", sublabel: "Hotel rooms" },
      { icon: "building2", label: "Property Type", value: "Full-Service", sublabel: "Hotel" },
      { icon: "trending", label: "Guaranteed ROI", value: "6%", sublabel: "Valid contract" },
      { icon: "square", label: "Plot Size", value: "21,000", sublabel: "Square feet" },
      { icon: "calendar", label: "Structure", value: "B2+G+10", sublabel: "Floors" },
      { icon: "users", label: "Status", value: "Operational", sublabel: "Immediate takeover" },
    ],
    floors: [
      {
        label: "Ground Floor",
        outlets: [
          { name: "Board Room", desc: "Snooker & leisure lounge" },
          { name: "Karaoke Bar", desc: "Private entertainment suites" },
          { name: "Moscow (Jalsa)", desc: "Dance bar & nightclub" },
          { name: "Emerald", desc: "All-day coffee shop" },
        ],
      },
      {
        label: "Mezzanine Floor",
        outlets: [
          { name: "Chick Boy", desc: "Dance bar & entertainment" },
          { name: "The Old Bull Pub", desc: "Chick Boy Club lounge" },
          { name: "Chill Restaurant", desc: "Inasal dining concept" },
          { name: "Shisha Corner", desc: "Traditional lounge" },
          { name: "Gym", desc: "Fitness center" },
          { name: "Main Kitchen", desc: "Central F&B production" },
        ],
      },
      {
        label: "Health Club Floor",
        outlets: [
          { name: "SPA & Massage", desc: "8 treatment rooms • Premium wellness" },
        ],
      },
    ],
    investmentMetrics: [
      { label: "Guaranteed ROI", value: "6%" },
      { label: "Hotel Keys", value: "120" },
      { label: "Sq Ft Plot", value: "21", suffix: "K" },
    ],
    competitivePositioning: [
      "One of few full-service hotels with integrated entertainment licensing in Deira",
      "Established brand presence with loyal corporate and leisure clientele",
      "SPA & wellness offering positioned in underserved market segment",
      "Multiple F&B concepts driving ancillary revenue above market average",
    ],
    proximities: [
      { icon: "plane", label: "Dubai International Airport", distance: "12 min" },
      { icon: "building", label: "DIFC / Downtown Dubai", distance: "18 min" },
      { icon: "landmark", label: "Gold Souk & Heritage District", distance: "5 min" },
    ],
    locationDescription:
      "Positioned at the intersection of Dubai's historic trading district and modern commercial hub, this asset benefits from exceptional connectivity and established tourism demand.",
    locationOverlay: {
      tag: "Prime Position",
      title: "Deira City Centre District",
      description: "Highway intersection location with direct mall access. High visibility and footfall.",
    },
    locationAdvantages: [
      {
        title: "Prime Positioning",
        description: "Directly opposite Deira City Centre, Dubai's established retail and leisure hub with 340+ stores.",
      },
      {
        title: "Metro Connectivity",
        description: "Direct access to Dubai Metro Green Line. Connected to 47 stations across the city network.",
      },
    ],
    whyInvest: [
      { icon: "trending", title: "High Occupancy Rates", description: "Deira maintains 85%+ hotel occupancy year-round due to business and tourist traffic" },
      { icon: "briefcase", title: "Business Hub", description: "Major commercial district with international companies and trade centers" },
      { icon: "globe", title: "Tourist Destination", description: "Historic souks and cultural sites attract millions of visitors annually" },
      { icon: "gem", title: "Proven Track Record", description: "Established area with consistent property appreciation and rental yields" },
    ],
    whyInvestTitle: "Why Invest in Deira?",
    whyInvestSubtitle: "One of Dubai's most established districts with proven demand drivers and strong fundamentals.",
    strategies: [
      { icon: "refresh", title: "Repositioning Opportunity", desc: "Convert to boutique lifestyle brand or international chain flag to capture premium ADR" },
      { icon: "trending", title: "Value-Add Potential", desc: "Room renovation and F&B concept refresh to drive rate growth and occupancy" },
      { icon: "shield", title: "Stable Income Profile", desc: "Diversified revenue base with 11 outlets reduces reliance on room revenue alone" },
      { icon: "users", title: "Operational Upside", desc: "Opportunity to implement professional management and improve operational efficiency" },
    ],
    targetProfile: "Ideal for hospitality operators, family offices, and institutional investors seeking yield with upside potential.",
    holdPeriod: "5-7 Years",
    exitStrategy: "Operator Sale",
    dueDiligence: "Immediate",
  },
  {
    id: "karama-hotel",
    code: "KA",
    name: "Karama Hotel",
    tagline: "Off-Market Opportunity",
    location: "Al Karama",
    subLocation: "Dubai",
    mandate: "Direct Mandate • 2026",
    heroImage: hotelBuilding,
    locationImage: kaHotelLocation,
    highlight: "7%",
    highlightLabel: "Projected ROI",
    keys: 85,
    roi: "7%",
    sqft: "15K",
    heroDescription:
      "A strategically located hospitality asset in the heart of Al Karama, featuring 85 keys and 7 revenue outlets across 8 floors with strong corporate demand.",
    structure: "B1 + G + 7 Floors",
    status: "Price on Request",
    revenueOutlets: 7,
    spaRooms: 4,
    entertainmentVenues: 2,
    ownership: "GCC Only",
    transaction: "Asset Sale",
    locationBadge: {
      title: "Heart of\nAl Karama",
      subtitle: "Dubai • UAE",
    },
    metrics: [
      { icon: "key", label: "Keys / Rooms", value: "85", sublabel: "Hotel rooms" },
      { icon: "building2", label: "Property Type", value: "Business", sublabel: "Hotel" },
      { icon: "trending", label: "Projected ROI", value: "7%", sublabel: "Market estimate" },
      { icon: "square", label: "Plot Size", value: "15,000", sublabel: "Square feet" },
      { icon: "calendar", label: "Structure", value: "B1+G+7", sublabel: "Floors" },
      { icon: "users", label: "Status", value: "Operational", sublabel: "Turnkey ready" },
    ],
    floors: [
      {
        label: "Ground Floor",
        outlets: [
          { name: "Café Lounge", desc: "All-day dining & coffee bar" },
          { name: "Business Center", desc: "Meeting rooms & co-work space" },
          { name: "Lobby Bar", desc: "Premium cocktails & snacks" },
        ],
      },
      {
        label: "First Floor",
        outlets: [
          { name: "Fusion Restaurant", desc: "Pan-Asian dining concept" },
          { name: "Banquet Hall", desc: "Events & private dining" },
          { name: "Main Kitchen", desc: "Central F&B production" },
        ],
      },
      {
        label: "Wellness Floor",
        outlets: [
          { name: "SPA & Sauna", desc: "4 treatment rooms • Steam & sauna" },
        ],
      },
    ],
    investmentMetrics: [
      { label: "Projected ROI", value: "7%" },
      { label: "Hotel Keys", value: "85" },
      { label: "Sq Ft Plot", value: "15", suffix: "K" },
    ],
    competitivePositioning: [
      "High corporate demand from nearby DWTC and business district offices",
      "Strong repeat clientele from regional business travelers and consultants",
      "Wellness offering with growing demand in mid-market segment",
      "F&B concepts tailored to diverse expatriate community preferences",
    ],
    proximities: [
      { icon: "plane", label: "Dubai International Airport", distance: "15 min" },
      { icon: "building", label: "DWTC / Sheikh Zayed Road", distance: "10 min" },
      { icon: "landmark", label: "Karama Market & Shopping", distance: "3 min" },
    ],
    locationDescription:
      "Located in Dubai's vibrant Karama district, this asset enjoys strong demand from corporate travelers and proximity to key business and retail centers.",
    locationOverlay: {
      tag: "Central Location",
      title: "Al Karama District",
      description: "Dense residential and commercial hub with excellent metro access and high foot traffic.",
    },
    locationAdvantages: [
      {
        title: "Corporate Demand",
        description: "Surrounded by corporate offices and minutes from Dubai World Trade Centre and DIFC.",
      },
      {
        title: "Metro Access",
        description: "Al Karama Metro Station on the Green Line providing direct connectivity across Dubai.",
      },
    ],
    whyInvest: [
      { icon: "trending", title: "Strong Corporate Demand", description: "Al Karama's central location ensures steady business traveler occupancy year-round" },
      { icon: "briefcase", title: "Mixed-Use District", description: "Vibrant blend of retail, dining, and commercial activity driving consistent footfall" },
      { icon: "globe", title: "Cultural Melting Pot", description: "Diverse community attracts international visitors seeking authentic Dubai experiences" },
      { icon: "gem", title: "Affordable Entry Point", description: "Lower acquisition cost compared to premium areas with strong yield potential" },
    ],
    whyInvestTitle: "Why Invest in Al Karama?",
    whyInvestSubtitle: "A central, high-demand district with excellent connectivity and growing corporate traffic.",
    strategies: [
      { icon: "refresh", title: "Brand Affiliation", desc: "Partner with mid-scale international brand to capture higher ADR and distribution" },
      { icon: "trending", title: "Room Upgrade Program", desc: "Modernize room inventory to attract premium corporate rates and extended stays" },
      { icon: "shield", title: "Steady Cash Flow", desc: "Strong occupancy base with 7 revenue outlets ensuring diversified income" },
      { icon: "users", title: "Management Optimization", desc: "Implement revenue management systems to maximize yield per available room" },
    ],
    targetProfile: "Ideal for mid-market operators and investors seeking strong cash flow with brand conversion upside.",
    holdPeriod: "4-6 Years",
    exitStrategy: "Brand Sale",
    dueDiligence: "Immediate",
  },
  {
    id: "rolla-hotel",
    code: "RT",
    name: "Rolla Hotel",
    tagline: "Off-Market Opportunity",
    location: "Bur Dubai",
    subLocation: "Dubai",
    mandate: "Direct Mandate • 2026",
    heroImage: hotelBuilding,
    locationImage: rtHotelLocation,
    highlight: "8%",
    highlightLabel: "Target ROI",
    keys: 150,
    roi: "8%",
    sqft: "28K",
    heroDescription:
      "A prime hospitality asset in the Rolla-Bur Dubai corridor, featuring 150 keys and 14 revenue outlets across 15 floors with exceptional waterfront proximity.",
    structure: "B2 + G + 13 Floors",
    status: "Price on Request",
    revenueOutlets: 14,
    spaRooms: 6,
    entertainmentVenues: 4,
    ownership: "GCC Only",
    transaction: "Asset Sale",
    locationBadge: {
      title: "Rolla Square\nBur Dubai",
      subtitle: "Dubai • UAE",
    },
    metrics: [
      { icon: "key", label: "Keys / Rooms", value: "150", sublabel: "Hotel rooms" },
      { icon: "building2", label: "Property Type", value: "Full-Service", sublabel: "Hotel" },
      { icon: "trending", label: "Target ROI", value: "8%", sublabel: "Projected yield" },
      { icon: "square", label: "Plot Size", value: "28,000", sublabel: "Square feet" },
      { icon: "calendar", label: "Structure", value: "B2+G+13", sublabel: "Floors" },
      { icon: "users", label: "Status", value: "Operational", sublabel: "Full operations" },
    ],
    floors: [
      {
        label: "Ground Floor",
        outlets: [
          { name: "Grand Lobby Café", desc: "All-day dining & patisserie" },
          { name: "Heritage Bar", desc: "Themed cocktail lounge" },
          { name: "Creek View Restaurant", desc: "Fine dining with waterfront views" },
          { name: "Shisha Terrace", desc: "Outdoor lounge & hookah" },
        ],
      },
      {
        label: "Mezzanine Floor",
        outlets: [
          { name: "Bollywood Lounge", desc: "Live entertainment & dance" },
          { name: "Sports Bar", desc: "Screens & pub-style dining" },
          { name: "Asian Kitchen", desc: "Pan-Asian cuisine" },
          { name: "Banquet Hall", desc: "Events capacity 200 pax" },
          { name: "Conference Center", desc: "3 meeting rooms" },
          { name: "Central Kitchen", desc: "F&B production hub" },
        ],
      },
      {
        label: "Rooftop & Wellness",
        outlets: [
          { name: "Rooftop Pool Bar", desc: "Pool deck & sundowners" },
          { name: "SPA & Hammam", desc: "6 rooms • Traditional hammam" },
          { name: "Fitness Center", desc: "Full gym & yoga studio" },
          { name: "Sky Lounge", desc: "Private members club" },
        ],
      },
    ],
    investmentMetrics: [
      { label: "Target ROI", value: "8%" },
      { label: "Hotel Keys", value: "150" },
      { label: "Sq Ft Plot", value: "28", suffix: "K" },
    ],
    competitivePositioning: [
      "Largest full-service hotel with entertainment licensing in the Bur Dubai corridor",
      "Waterfront proximity to Dubai Creek enhances guest experience and branding",
      "14 revenue outlets provide maximum income diversification across segments",
      "Rooftop amenities command premium rates and attract destination dining traffic",
    ],
    proximities: [
      { icon: "plane", label: "Dubai International Airport", distance: "10 min" },
      { icon: "building", label: "Dubai Creek & Waterfront", distance: "5 min" },
      { icon: "landmark", label: "Al Fahidi Historic District", distance: "7 min" },
    ],
    locationDescription:
      "Situated in the thriving Rolla-Bur Dubai corridor with Dubai Creek proximity, this asset commands exceptional visibility and benefits from both tourism and corporate demand.",
    locationOverlay: {
      tag: "Waterfront District",
      title: "Rolla Square, Bur Dubai",
      description: "Historic commercial hub with creek proximity, metro access, and high tourist footfall.",
    },
    locationAdvantages: [
      {
        title: "Creek Proximity",
        description: "Minutes from Dubai Creek waterfront, Al Seef heritage district, and traditional souks.",
      },
      {
        title: "Transport Hub",
        description: "Al Ghubaiba Metro & Bus Station nearby. Direct ferry links to Deira and Dubai Marina.",
      },
    ],
    whyInvest: [
      { icon: "trending", title: "Tourism Growth Corridor", description: "Bur Dubai sees 20M+ visitors annually with consistent growth in heritage tourism" },
      { icon: "briefcase", title: "Commercial Center", description: "Dense concentration of offices, consulates, and trade companies driving weekday demand" },
      { icon: "globe", title: "Creek Waterfront Revival", description: "Major government investment in Dubai Creek waterfront regeneration boosting asset values" },
      { icon: "gem", title: "Highest Yield Potential", description: "Largest asset with 14 outlets offering maximum revenue diversification and scale advantages" },
    ],
    whyInvestTitle: "Why Invest in Bur Dubai?",
    whyInvestSubtitle: "A historic district undergoing renaissance with strong fundamentals and waterfront premium.",
    strategies: [
      { icon: "refresh", title: "Heritage Brand Play", desc: "Position as boutique heritage hotel leveraging creek-side location and cultural assets" },
      { icon: "trending", title: "Revenue Maximization", desc: "14 outlets provide exceptional scope for F&B and entertainment revenue growth" },
      { icon: "shield", title: "Scale Advantage", desc: "150 keys and diversified outlets provide resilient income across market cycles" },
      { icon: "users", title: "Destination Dining", desc: "Rooftop and waterfront venues can command premium rates as destination experiences" },
    ],
    targetProfile: "Ideal for large-scale operators and institutional investors seeking premium yield with heritage positioning.",
    holdPeriod: "5-8 Years",
    exitStrategy: "Portfolio Sale",
    dueDiligence: "Immediate",
  },
];
