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
    id: "ka-hotel",
    code: "KA",
    name: "K A Hotel",
    tagline: "Off-Market Opportunity",
    location: "Bur Dubai",
    subLocation: "Dubai",
    mandate: "Direct Mandate • 2026",
    heroImage: hotelBuilding,
    locationImage: kaHotelLocation,
    highlight: "6%",
    highlightLabel: "Guaranteed ROI",
    keys: 132,
    roi: "6%",
    sqft: "17K",
    heroDescription:
      "A full-service hospitality asset on Rolla Street, Al Raffa, Bur Dubai, featuring 132 rooms and 10+ entertainment & F&B outlets across B+G+6 floors with rooftop wellness.",
    structure: "B + G + 6 Floors + Roof",
    status: "Price on Request",
    revenueOutlets: 10,
    spaRooms: 2,
    entertainmentVenues: 8,
    ownership: "GCC Only",
    transaction: "Asset Sale",
    locationBadge: {
      title: "Rolla Street\nBur Dubai",
      subtitle: "Dubai • UAE",
    },
    metrics: [
      { icon: "key", label: "Keys / Rooms", value: "132", sublabel: "60 Two-Bed + 72 One-Bed" },
      { icon: "building2", label: "Property Type", value: "Full-Service", sublabel: "Hotel" },
      { icon: "trending", label: "Guaranteed ROI", value: "6%", sublabel: "Valid contract" },
      { icon: "square", label: "Plot Size", value: "17,286", sublabel: "Square feet" },
      { icon: "calendar", label: "Structure", value: "B+G+6+R", sublabel: "Floors" },
      { icon: "users", label: "Status", value: "Operational", sublabel: "Immediate takeover" },
    ],
    floors: [
      {
        label: "Ground Floor",
        outlets: [
          { name: "Al Maha Restaurant", desc: "All-day dining" },
          { name: "Majlis", desc: "Arabic lounge" },
          { name: "Business Center", desc: "Corporate services" },
          { name: "Silk Dance Bar", desc: "Entertainment venue" },
          { name: "Adda Night Club", desc: "Night entertainment" },
          { name: "Layali Night Club", desc: "Night entertainment" },
          { name: "Taal Night Club", desc: "Night entertainment" },
          { name: "Murjana Night Club", desc: "Night entertainment" },
          { name: "Mast Mehfil Dance Bar", desc: "Dance bar" },
          { name: "Adhira Dance Bar", desc: "South Indian dance bar" },
        ],
      },
      {
        label: "Mezzanine Floor",
        outlets: [
          { name: "Shisha Outlet", desc: "Traditional lounge" },
          { name: "Second Kitchen", desc: "F&B production" },
        ],
      },
      {
        label: "Rooftop",
        outlets: [
          { name: "Sauna & Spa", desc: "Premium wellness" },
          { name: "Swimming Pool", desc: "Rooftop pool deck" },
          { name: "Shisha Outlet", desc: "Rooftop lounge" },
          { name: "Gym", desc: "Fitness center" },
        ],
      },
    ],
    investmentMetrics: [
      { label: "Guaranteed ROI", value: "6%" },
      { label: "Hotel Rooms", value: "132" },
      { label: "Sq Ft Plot", value: "17", suffix: "K" },
    ],
    competitivePositioning: [
      "One of the highest entertainment outlet concentrations in the Bur Dubai corridor",
      "132-room inventory with a mix of two-bed and one-bed configurations for flexible demand",
      "Rooftop wellness amenities (pool, spa, gym) in high-demand segment",
      "10+ F&B and entertainment venues driving exceptional ancillary revenue",
    ],
    proximities: [
      { icon: "plane", label: "Dubai International Airport", distance: "12 min" },
      { icon: "building", label: "Dubai Creek & Waterfront", distance: "5 min" },
      { icon: "landmark", label: "Al Fahidi Historic District", distance: "7 min" },
    ],
    locationDescription:
      "Situated on Rolla Street in the Al Raffa area of Bur Dubai, this asset benefits from exceptional footfall, creek proximity, and established tourism demand in one of Dubai's most vibrant districts.",
    locationOverlay: {
      tag: "Rolla Street",
      title: "Al Raffa, Bur Dubai",
      description: "High-traffic commercial corridor with creek proximity and dense hospitality demand.",
    },
    locationAdvantages: [
      {
        title: "Rolla Street Hub",
        description: "Prime position on Rolla Street, one of Bur Dubai's busiest commercial and entertainment corridors.",
      },
      {
        title: "Transport Connectivity",
        description: "Al Ghubaiba Metro & Bus Station nearby. Direct links to Deira, Downtown, and Dubai Marina.",
      },
    ],
    whyInvest: [
      { icon: "trending", title: "Entertainment Corridor", description: "Rolla Street is a proven nightlife and entertainment hub attracting consistent high-spend footfall" },
      { icon: "briefcase", title: "Diversified Revenue", description: "10+ outlets across dining, nightlife, and wellness ensure resilient multi-stream income" },
      { icon: "globe", title: "Heritage Tourism", description: "Proximity to Al Fahidi and Dubai Creek drives year-round cultural and leisure tourism" },
      { icon: "gem", title: "Rooftop Premium", description: "Pool, spa, and gym on rooftop command premium rates and attract destination guests" },
    ],
    whyInvestTitle: "Why Invest in Bur Dubai?",
    whyInvestSubtitle: "A historic district with proven entertainment demand and strong hospitality fundamentals.",
    strategies: [
      { icon: "refresh", title: "Entertainment Flagship", desc: "Position as the premier nightlife and entertainment hotel in the Rolla corridor" },
      { icon: "trending", title: "Room Mix Optimization", desc: "132 rooms with two-bed/one-bed mix allows flexible pricing for corporate and leisure segments" },
      { icon: "shield", title: "Stable Income Base", desc: "10+ outlets and rooftop amenities provide diversified, recession-resistant revenue" },
      { icon: "users", title: "Operational Efficiency", desc: "Consolidated kitchen facilities (GF + Mezzanine) reduce operational costs and improve margins" },
    ],
    targetProfile: "Ideal for hospitality operators and investors seeking high-yield entertainment-driven assets with rooftop premium.",
    holdPeriod: "5-7 Years",
    exitStrategy: "Operator Sale",
    dueDiligence: "Immediate",
  },
  {
    id: "rt-hotel",
    code: "RT",
    name: "R T Hotel",
    tagline: "Off-Market Opportunity",
    location: "Bur Dubai",
    subLocation: "Dubai",
    mandate: "Direct Mandate • 2026",
    heroImage: hotelBuilding,
    locationImage: rtHotelLocation,
    highlight: "6%",
    highlightLabel: "Guaranteed ROI",
    keys: 119,
    roi: "6%",
    sqft: "18K",
    heroDescription:
      "A prime hospitality asset on Rolla Street, Al Raffa, Bur Dubai, featuring 119 rooms (including 14 suites) and diversified F&B outlets across 2B+G+7 floors with rooftop spa.",
    structure: "2B + G + 7 Floors + Roof",
    status: "Price on Request",
    revenueOutlets: 6,
    spaRooms: 1,
    entertainmentVenues: 2,
    ownership: "GCC Only",
    transaction: "Asset Sale",
    locationBadge: {
      title: "Rolla Street\nBur Dubai",
      subtitle: "Dubai • UAE",
    },
    metrics: [
      { icon: "key", label: "Keys / Rooms", value: "119", sublabel: "14 Suites + 98 Executive + 7 Deluxe" },
      { icon: "building2", label: "Property Type", value: "Full-Service", sublabel: "Hotel" },
      { icon: "trending", label: "Guaranteed ROI", value: "6%", sublabel: "Valid contract" },
      { icon: "square", label: "Plot Size", value: "18,353", sublabel: "Square feet" },
      { icon: "calendar", label: "Structure", value: "2B+G+7+R", sublabel: "Floors" },
      { icon: "users", label: "Status", value: "Operational", sublabel: "Immediate takeover" },
    ],
    floors: [
      {
        label: "Ground Floor",
        outlets: [
          { name: "Banchara Restaurant", desc: "Signature dining" },
          { name: "Red Pub", desc: "Premium pub & lounge" },
          { name: "Miracle Dance Bar", desc: "Entertainment venue" },
          { name: "Board Room", desc: "Corporate meeting facility" },
        ],
      },
      {
        label: "Mezzanine Floor",
        outlets: [
          { name: "Main Kitchen", desc: "Central F&B production" },
          { name: "Mistry Dance Club", desc: "Night entertainment" },
        ],
      },
      {
        label: "Rooftop",
        outlets: [
          { name: "Spa", desc: "Premium wellness center" },
          { name: "Gym", desc: "Fitness center" },
        ],
      },
    ],
    investmentMetrics: [
      { label: "Guaranteed ROI", value: "6%" },
      { label: "Hotel Rooms", value: "119" },
      { label: "Sq Ft Plot", value: "18", suffix: "K" },
    ],
    competitivePositioning: [
      "Premium room mix with 14 suites and 98 executive rooms commanding higher ADR",
      "Strategic Rolla Street location in Bur Dubai's established hospitality corridor",
      "Dual basement parking and service infrastructure supporting operational efficiency",
      "Rooftop spa and gym positioned in high-demand wellness segment",
    ],
    proximities: [
      { icon: "plane", label: "Dubai International Airport", distance: "10 min" },
      { icon: "building", label: "Dubai Creek & Waterfront", distance: "5 min" },
      { icon: "landmark", label: "Al Fahidi Historic District", distance: "7 min" },
    ],
    locationDescription:
      "Located on Rolla Street in the Al Raffa area of Bur Dubai, this asset commands exceptional visibility on Plot P515 with dual basement infrastructure and proximity to Dubai Creek.",
    locationOverlay: {
      tag: "Rolla Street",
      title: "Al Raffa, Bur Dubai",
      description: "Established hospitality corridor with creek proximity, metro access, and high tourist footfall.",
    },
    locationAdvantages: [
      {
        title: "Rolla Corridor",
        description: "Prime plot (P515) on Rolla Street, Bur Dubai's most established hotel and entertainment strip.",
      },
      {
        title: "Transport Hub",
        description: "Al Ghubaiba Metro & Bus Station nearby. Direct ferry links to Deira and Dubai Marina.",
      },
    ],
    whyInvest: [
      { icon: "trending", title: "Premium Room Mix", description: "14 suites and 98 executive rooms enable higher average daily rates versus standard inventory" },
      { icon: "briefcase", title: "Corporate & Leisure", description: "Board room and F&B outlets serve both business travelers and entertainment seekers" },
      { icon: "globe", title: "Creek Waterfront Revival", description: "Major government investment in Dubai Creek waterfront regeneration boosting area asset values" },
      { icon: "gem", title: "Dual Basement Advantage", description: "Two basement levels provide ample parking and back-of-house, rare for this corridor" },
    ],
    whyInvestTitle: "Why Invest in Bur Dubai?",
    whyInvestSubtitle: "A historic district undergoing renaissance with strong fundamentals and waterfront premium.",
    strategies: [
      { icon: "refresh", title: "Suite-Led Positioning", desc: "Leverage 14 suites to position as the premium option on Rolla Street for extended stays" },
      { icon: "trending", title: "F&B Revenue Growth", desc: "Expand restaurant and pub concepts to maximize ground floor revenue per sqft" },
      { icon: "shield", title: "Operational Scale", desc: "119 rooms with dual basement infrastructure provide efficient full-service operations" },
      { icon: "users", title: "Wellness Destination", desc: "Rooftop spa and gym attract premium guests and command higher nightly rates" },
    ],
    targetProfile: "Ideal for hospitality operators and investors seeking premium-positioned assets with suite inventory upside.",
    holdPeriod: "5-7 Years",
    exitStrategy: "Operator Sale",
    dueDiligence: "Immediate",
  },
];
