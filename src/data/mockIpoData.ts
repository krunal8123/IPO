import { IpoItem, BuybackItem, CalendarEvent } from '../types/ipo';

export const mockIpoList: IpoItem[] = [
  {
    "id": "veegaland-developers",
    "symbol": "VEEGALAND",
    "name": "Veegaland Developers Limited",
    "category": "mainboard",
    "status": "live",
    "badge": "Bidding Live",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%232563eb%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%237c3aed%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EVL%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 130,
    "priceBandMax": 140,
    "lotSize": 107,
    "minInvestment": 14980,
    "issueSizeCr": 1105,
    "freshIssueCr": 780,
    "ofsCr": 325,
    "openDate": "Sep 10, 2026",
    "closeDate": "Sep 15, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 15,
      "gmpPercent": 11,
      "estimatedListingPrice": 155,
      "trend": "up",
      "kostakRate": 225,
      "subjectToSauda": 1284,
      "lastUpdated": "11 Sep 2026, 7:15 PM IST"
    },
    "subscription": {
      "qib": 2.96,
      "nii": 5.18,
      "retail": 4.07,
      "total": 3.7,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 1827,
        "expense": 1562,
        "pat": 265,
        "netWorth": 1644
      },
      {
        "year": "FY 2024",
        "revenue": 2228,
        "expense": 1883,
        "pat": 345,
        "netWorth": 2117
      },
      {
        "year": "FY 2025",
        "revenue": 2652,
        "expense": 2214,
        "pat": 438,
        "netWorth": 2785
      }
    ],
    "about": "Veegaland Developers Limited is a premier South Indian real estate developer specializing in green-certified residential condominiums and commercial complexes with over 4.5 million sq. ft. delivered.",
    "objectives": [
      "Construction expenses for ongoing residential projects in Kochi & Bengaluru",
      "Acquisition of land development rights for green township projects",
      "Repayment of certain borrowings",
      "General corporate purposes"
    ],
    "pros": [
      "Track record of delivering 4.5+ million sq. ft. of residential projects on time.",
      "Strong brand equity in green-certified sustainable housing with IGBC Platinum ratings.",
      "Prudent financial leverage with debt-to-equity below 0.35x."
    ],
    "cons": [
      "Geographical concentration with over 75% of projects in Kerala and Karnataka.",
      "Sensitivity to municipal approval timelines and local RERA clearances.",
      "Raw material price swings in cement and TMT steel impacting project margins."
    ],
    "analystRating": "Apply",
    "ratingScore": 4.1
  },
  {
    "id": "maharaja-speedex-india",
    "symbol": "MAHARAJA",
    "name": "Maharaja Speedex India Limited",
    "category": "sme",
    "status": "live",
    "badge": "Bidding Live",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23d97706%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23dc2626%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EMS%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Emerging Enterprise / SME",
    "priceBandMin": 177,
    "priceBandMax": 186,
    "lotSize": 1000,
    "minInvestment": 186000,
    "issueSizeCr": 141,
    "freshIssueCr": 123,
    "ofsCr": 17,
    "openDate": "Sep 10, 2026",
    "closeDate": "Sep 15, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Bigshare Services Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE SME"
    ],
    "gmp": {
      "gmpPrice": 17,
      "gmpPercent": 9,
      "estimatedListingPrice": 203,
      "trend": "up",
      "kostakRate": 255,
      "subjectToSauda": 13600,
      "lastUpdated": "11 Sep 2026, 8:45 AM IST"
    },
    "subscription": {
      "qib": 2.64,
      "nii": 4.62,
      "retail": 3.63,
      "total": 3.3,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 88,
        "expense": 78,
        "pat": 10,
        "netWorth": 62
      },
      {
        "year": "FY 2024",
        "revenue": 104,
        "expense": 92,
        "pat": 12,
        "netWorth": 78
      },
      {
        "year": "FY 2025",
        "revenue": 127,
        "expense": 110,
        "pat": 17,
        "netWorth": 104
      }
    ],
    "about": "Maharaja Speedex India Limited is a multimodal logistics and supply chain operator providing express parcel distribution, full truckload (FTL), and warehousing across 450+ commercial routes in India.",
    "objectives": [
      "Purchase of commercial freight vehicles to expand fleet",
      "Setting up automated sorting hubs in NCR, Mumbai, and Bengaluru",
      "Fleet telematics software upgrades",
      "General corporate operations"
    ],
    "pros": [
      "Multimodal network covering 450+ commercial transit routes across Tier 1, 2, and 3 hubs.",
      "Proprietary IoT fleet platform enabling real-time telemetry and route dispatch.",
      "Long-standing relationships with e-commerce and pharmaceutical enterprise clients."
    ],
    "cons": [
      "Margin sensitivity to diesel fuel price increases and highway toll revisions.",
      "Competition from organized 3PL logistics giants and regional transporters.",
      "Working capital intensity tied to enterprise credit periods."
    ],
    "analystRating": "Apply",
    "ratingScore": 4.1
  },
  {
    "id": "om-galaxy",
    "symbol": "OM",
    "name": "Om Galaxy Limited",
    "category": "sme",
    "status": "live",
    "badge": "Bidding Live",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23059669%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230284c7%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EOG%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Emerging Enterprise / SME",
    "priceBandMin": 85,
    "priceBandMax": 90,
    "lotSize": 1000,
    "minInvestment": 90000,
    "issueSizeCr": 68,
    "freshIssueCr": 59,
    "ofsCr": 8,
    "openDate": "Sep 10, 2026",
    "closeDate": "Sep 15, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Bigshare Services Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE SME"
    ],
    "gmp": {
      "gmpPrice": 0,
      "gmpPercent": 0,
      "estimatedListingPrice": 90,
      "trend": "neutral",
      "kostakRate": 0,
      "subjectToSauda": 0,
      "lastUpdated": "Live Today"
    },
    "subscription": {
      "qib": 1.84,
      "nii": 3.22,
      "retail": 2.53,
      "total": 2.3,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 57,
        "expense": 52,
        "pat": 5,
        "netWorth": 40
      },
      {
        "year": "FY 2024",
        "revenue": 67,
        "expense": 60,
        "pat": 7,
        "netWorth": 50
      },
      {
        "year": "FY 2025",
        "revenue": 82,
        "expense": 73,
        "pat": 9,
        "netWorth": 67
      }
    ],
    "about": "Om Galaxy Limited manufactures specialized precision industrial valves, high-pressure fluid control systems, and pipeline manifolds for petrochemical refineries, power generation, and fertilizer plants.",
    "objectives": [
      "Expansion of valve casting and CNC machining capacity at Gujarat facility",
      "Upgrading testing lab for API-6D and ISO 15848 certifications",
      "Incremental working capital requirements",
      "General corporate purposes"
    ],
    "pros": [
      "High-margin custom engineering capabilities in severe-service industrial valves.",
      "Long-term vendor approvals with national public sector refineries and chemical majors.",
      "Stable recurring demand driven by statutory valve replacement cycles every 18 months."
    ],
    "cons": [
      "Vulnerability to raw material cost swings in stainless steel and bronze billets.",
      "Dependence on capex cycles in domestic petrochemical refining.",
      "Competition from lower-cost valve imports from Southeast Asia."
    ],
    "analystRating": "Neutral",
    "ratingScore": 3.5
  },
  {
    "id": "panchatv-bharat",
    "symbol": "PANCHATV",
    "name": "Panchatv Bharat Limited",
    "category": "sme",
    "status": "live",
    "badge": "Bidding Live",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23e11d48%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23f59e0b%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EPB%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Emerging Enterprise / SME",
    "priceBandMin": 140,
    "priceBandMax": 140,
    "lotSize": 1000,
    "minInvestment": 140000,
    "issueSizeCr": 112,
    "freshIssueCr": 98,
    "ofsCr": 14,
    "openDate": "Sep 10, 2026",
    "closeDate": "Sep 15, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Bigshare Services Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE SME"
    ],
    "gmp": {
      "gmpPrice": 0,
      "gmpPercent": 0,
      "estimatedListingPrice": 140,
      "trend": "neutral",
      "kostakRate": 0,
      "subjectToSauda": 0,
      "lastUpdated": "Live Today"
    },
    "subscription": {
      "qib": 1.84,
      "nii": 3.22,
      "retail": 2.53,
      "total": 2.3,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 105,
        "expense": 92,
        "pat": 13,
        "netWorth": 74
      },
      {
        "year": "FY 2024",
        "revenue": 124,
        "expense": 107,
        "pat": 17,
        "netWorth": 93
      },
      {
        "year": "FY 2025",
        "revenue": 151,
        "expense": 129,
        "pat": 22,
        "netWorth": 124
      }
    ],
    "about": "Panchatv Bharat Limited is a regional media and broadcast entertainment company operating satellite television channels, regional news portals, and digital content syndication networks across Northern and Western India.",
    "objectives": [
      "Procurement of 4K digital broadcast transmission infrastructure",
      "Development of regional OTT streaming mobile application",
      "Expansion of regional news bureaus across North India",
      "General corporate operations"
    ],
    "pros": [
      "Deep rural and semi-urban audience penetration in high-growth regional markets.",
      "Asset-light broadcast distribution model utilizing shared satellite transponders.",
      "Diversified advertiser base comprising regional businesses, FMCG, and public sector."
    ],
    "cons": [
      "Audience migration from linear television to short-form digital streaming.",
      "Revenue seasonality tied to festival quarters and election cycles.",
      "Strict compliance oversight by MIB and TRAI broadcasting guidelines."
    ],
    "analystRating": "Neutral",
    "ratingScore": 3.5
  },
  {
    "id": "raksan-transformers",
    "symbol": "RAKSAN",
    "name": "Raksan Transformers Limited",
    "category": "sme",
    "status": "live",
    "badge": "Bidding Live",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%234f46e5%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%2306b6d4%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ERT%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Emerging Enterprise / SME",
    "priceBandMin": 258,
    "priceBandMax": 273,
    "lotSize": 1000,
    "minInvestment": 273000,
    "issueSizeCr": 206,
    "freshIssueCr": 180,
    "ofsCr": 25,
    "openDate": "Sep 10, 2026",
    "closeDate": "Sep 15, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Bigshare Services Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE SME"
    ],
    "gmp": {
      "gmpPrice": 18,
      "gmpPercent": 7,
      "estimatedListingPrice": 291,
      "trend": "up",
      "kostakRate": 270,
      "subjectToSauda": 14400,
      "lastUpdated": "11 Sep 2026, 8:30 AM IST"
    },
    "subscription": {
      "qib": 2.32,
      "nii": 4.06,
      "retail": 3.19,
      "total": 2.9,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 173,
        "expense": 151,
        "pat": 22,
        "netWorth": 121
      },
      {
        "year": "FY 2024",
        "revenue": 203,
        "expense": 176,
        "pat": 27,
        "netWorth": 152
      },
      {
        "year": "FY 2025",
        "revenue": 247,
        "expense": 211,
        "pat": 36,
        "netWorth": 203
      }
    ],
    "about": "Raksan Transformers Limited manufactures electrical power transformers, distribution transformers, and solar inverter duty substations up to 33kV class for utility and renewable power projects.",
    "objectives": [
      "Automated testing and CRGO lamination processing bay expansion",
      "Repayment of unsecured working capital borrowings",
      "Funding long-term working capital for utility EPC tenders",
      "General corporate purposes"
    ],
    "pros": [
      "Robust unexecuted order book of ₹185 Cr providing 18-month revenue visibility.",
      "Approved vendor accreditation with state electricity distribution companies (DISCOMs).",
      "Specialized engineering expertise in solar park inverter duty transformers."
    ],
    "cons": [
      "Customer concentration with state-run power utilities driving 65%+ of deliveries.",
      "Price volatility in raw material inputs like electrolytic copper and CRGO steel.",
      "Extended payment realization cycles typical of state government power tenders."
    ],
    "analystRating": "Apply",
    "ratingScore": 4.1
  },
  {
    "id": "manika-plastech",
    "symbol": "MANIKA",
    "name": "Manika Plastech Limited",
    "category": "mainboard",
    "status": "live",
    "badge": "Bidding Live",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230d9488%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%232563eb%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EMP%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 40,
    "priceBandMax": 43,
    "lotSize": 348,
    "minInvestment": 14964,
    "issueSizeCr": 340,
    "freshIssueCr": 240,
    "ofsCr": 100,
    "openDate": "Sep 11, 2026",
    "closeDate": "Sep 16, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 9,
      "gmpPercent": 21,
      "estimatedListingPrice": 52,
      "trend": "up",
      "kostakRate": 135,
      "subjectToSauda": 2505,
      "lastUpdated": "11 Sep 2026, 7:15 PM IST"
    },
    "subscription": {
      "qib": 4.56,
      "nii": 7.98,
      "retail": 6.27,
      "total": 5.7,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 621,
        "expense": 531,
        "pat": 90,
        "netWorth": 559
      },
      {
        "year": "FY 2024",
        "revenue": 757,
        "expense": 640,
        "pat": 117,
        "netWorth": 719
      },
      {
        "year": "FY 2025",
        "revenue": 901,
        "expense": 752,
        "pat": 149,
        "netWorth": 946
      }
    ],
    "about": "Manika Plastech Limited manufactures engineered polymer containers, rigid industrial packaging, and technical blow-moulded products catering to pharmaceuticals, agrochemicals, and fast-moving consumer goods.",
    "objectives": [
      "Setting up a new automated blow-moulding manufacturing plant in Gujarat",
      "Prepayment of certain outstanding long-term term loans",
      "Cleanroom precision injection lines for pharma packaging",
      "General corporate purposes"
    ],
    "pros": [
      "Diversified client roster spanning major multinational chemical and pharma formulation companies.",
      "Cleanroom manufacturing facilities compliant with US-FDA and ISO 9001 standards.",
      "High Return on Capital Employed (ROCE) consistently exceeding 21.5% over 3 fiscal years."
    ],
    "cons": [
      "Exposure to global crude oil price fluctuations affecting polymer resin (HDPE/PP) costs.",
      "Foreign currency volatility on imported European extrusion blow-moulding equipment.",
      "Evolving regulations governing plastic recycling and extended producer responsibility (EPR)."
    ],
    "analystRating": "Apply",
    "ratingScore": 4.1
  },
  {
    "id": "century-business-media",
    "symbol": "CENTURY",
    "name": "Century Business Media Limited",
    "category": "sme",
    "status": "live",
    "badge": "Bidding Live",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%237c3aed%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23ec4899%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ECB%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Emerging Enterprise / SME",
    "priceBandMin": 70,
    "priceBandMax": 74,
    "lotSize": 1000,
    "minInvestment": 74000,
    "issueSizeCr": 56,
    "freshIssueCr": 49,
    "ofsCr": 7,
    "openDate": "Sep 11, 2026",
    "closeDate": "Sep 16, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Bigshare Services Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE SME"
    ],
    "gmp": {
      "gmpPrice": 0,
      "gmpPercent": 0,
      "estimatedListingPrice": 74,
      "trend": "neutral",
      "kostakRate": 0,
      "subjectToSauda": 0,
      "lastUpdated": "Live Today"
    },
    "subscription": {
      "qib": 1.84,
      "nii": 3.22,
      "retail": 2.53,
      "total": 2.3,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 35,
        "expense": 31,
        "pat": 4,
        "netWorth": 25
      },
      {
        "year": "FY 2024",
        "revenue": 41,
        "expense": 36,
        "pat": 5,
        "netWorth": 31
      },
      {
        "year": "FY 2025",
        "revenue": 50,
        "expense": 44,
        "pat": 7,
        "netWorth": 41
      }
    ],
    "about": "Century Business Media Limited is a premier organizer of B2B trade exhibitions, international industry conventions, and publisher of specialized industrial trade journals in India.",
    "objectives": [
      "Acquisition of digital event technology and hybrid exhibition streaming platforms",
      "Advance leasing of premium convention spaces in Mumbai and Delhi NCR",
      "International sales office expansion in Dubai",
      "General corporate operations"
    ],
    "pros": [
      "Negative working capital model powered by advance exhibitor booth bookings.",
      "High annual exhibitor renewal rate (> 80%) across flagship manufacturing expos.",
      "Asset-light operational scalability with minimal capital expenditure requirements."
    ],
    "cons": [
      "Revenue vulnerability to macroeconomic slowdowns impacting corporate trade marketing.",
      "Seasonality with more than 65% of exhibitions held during autumn and winter quarters.",
      "Dependency on the rental rates of international convention exhibition venues."
    ],
    "analystRating": "Neutral",
    "ratingScore": 3.5
  },
  {
    "id": "injecto-polymers",
    "symbol": "INJECTO",
    "name": "Injecto Polymers Limited",
    "category": "sme",
    "status": "live",
    "badge": "Bidding Live",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23ea580c%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23ca8a04%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EIP%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Emerging Enterprise / SME",
    "priceBandMin": 98,
    "priceBandMax": 100,
    "lotSize": 1000,
    "minInvestment": 100000,
    "issueSizeCr": 78,
    "freshIssueCr": 68,
    "ofsCr": 9,
    "openDate": "Sep 11, 2026",
    "closeDate": "Sep 16, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Bigshare Services Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE SME"
    ],
    "gmp": {
      "gmpPrice": 0,
      "gmpPercent": 0,
      "estimatedListingPrice": 100,
      "trend": "neutral",
      "kostakRate": 0,
      "subjectToSauda": 0,
      "lastUpdated": "Live Today"
    },
    "subscription": {
      "qib": 1.84,
      "nii": 3.22,
      "retail": 2.53,
      "total": 2.3,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 82,
        "expense": 75,
        "pat": 7,
        "netWorth": 57
      },
      {
        "year": "FY 2024",
        "revenue": 96,
        "expense": 87,
        "pat": 9,
        "netWorth": 72
      },
      {
        "year": "FY 2025",
        "revenue": 117,
        "expense": 105,
        "pat": 12,
        "netWorth": 96
      }
    ],
    "about": "Injecto Polymers Limited is a Tier-1 auto component manufacturer producing high-precision injection-moulded plastic assemblies, interior trims, and under-the-hood engine shrouds for two-wheelers and commercial vehicles.",
    "objectives": [
      "Expansion of robotic injection moulding capacity at Pune manufacturing unit",
      "Investment in lightweight carbon-reinforced composite polymer R&D",
      "Working capital funding for high-volume automotive production runs",
      "General corporate requirements"
    ],
    "pros": [
      "Direct OEM supplier status with leading two-wheeler and commercial vehicle manufacturers.",
      "Strategic plants located within major Indian automotive manufacturing corridors.",
      "High plant automation with robotic part extraction ensuring defect rates below 15 PPM."
    ],
    "cons": [
      "Sector concentration risk with over 85% of revenue derived from domestic automotive sales.",
      "Pricing pressure from automobile OEMs demanding annual cost-down concessions.",
      "Capacity underutilization during seasonal automotive OEM plant maintenance shutdowns."
    ],
    "analystRating": "Neutral",
    "ratingScore": 3.5
  },
  {
    "id": "apana-logistics",
    "symbol": "APANA",
    "name": "Apana Logistics Limited",
    "category": "sme",
    "status": "listed",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%2316a34a%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%232563eb%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EAL%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Emerging Enterprise / SME",
    "priceBandMin": 60,
    "priceBandMax": 60,
    "lotSize": 1000,
    "minInvestment": 60000,
    "issueSizeCr": 48,
    "freshIssueCr": 42,
    "ofsCr": 6,
    "openDate": "Sep 7, 2026",
    "closeDate": "Sep 9, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Bigshare Services Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE SME"
    ],
    "gmp": {
      "gmpPrice": 0,
      "gmpPercent": 0,
      "estimatedListingPrice": 60,
      "trend": "neutral",
      "kostakRate": 0,
      "subjectToSauda": 0,
      "lastUpdated": "Live Today"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 12,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 45,
        "expense": 39,
        "pat": 6,
        "netWorth": 31
      },
      {
        "year": "FY 2024",
        "revenue": 53,
        "expense": 46,
        "pat": 7,
        "netWorth": 40
      },
      {
        "year": "FY 2025",
        "revenue": 65,
        "expense": 56,
        "pat": 9,
        "netWorth": 53
      }
    ],
    "about": "Apana Logistics Limited provides temperature-controlled cold chain logistics, refrigerated transport, and modern cold storage solutions for quick-service restaurants, dairy, and pharmaceuticals.",
    "objectives": [
      "Purchase of 85 new multi-temperature reefer trucks to expand national fleet",
      "Setting up a temperature-controlled cold storage hub in Western India",
      "IoT telematics and real-time remote temperature datalogging upgrades",
      "General corporate purposes"
    ],
    "pros": [
      "Pioneer in IoT-monitored cold chain with zero reported cargo spoilage across critical routes.",
      "Long-term master service agreements with prominent QSR chains and dairy co-operatives.",
      "High entry barriers due to the specialized capital and technical monitoring required."
    ],
    "cons": [
      "High operating overheads linked to diesel fuel prices and reefer unit maintenance.",
      "Unbalanced freight corridors causing lower realization on return transit legs.",
      "Stringent liability clauses regarding temperature deviations on biological consignments."
    ],
    "analystRating": "Neutral",
    "ratingScore": 3.5,
    "badge": "Closed / Listed"
  },
  {
    "id": "pranav-constructions",
    "symbol": "PRANAV",
    "name": "Pranav Constructions Limited",
    "category": "mainboard",
    "status": "listed",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230891b2%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%234f46e5%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EPC%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 118,
    "priceBandMax": 124,
    "lotSize": 120,
    "minInvestment": 14880,
    "issueSizeCr": 1003,
    "freshIssueCr": 708,
    "ofsCr": 295,
    "openDate": "Sep 7, 2026",
    "closeDate": "Sep 9, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 44,
      "gmpPercent": 35,
      "estimatedListingPrice": 168,
      "trend": "up",
      "kostakRate": 660,
      "subjectToSauda": 4224,
      "lastUpdated": "11 Sep 2026, 6:30 PM IST"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 47,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 1658,
        "expense": 1418,
        "pat": 240,
        "netWorth": 1492
      },
      {
        "year": "FY 2024",
        "revenue": 2022,
        "expense": 1709,
        "pat": 313,
        "netWorth": 1921
      },
      {
        "year": "FY 2025",
        "revenue": 2407,
        "expense": 2010,
        "pat": 397,
        "netWorth": 2527
      }
    ],
    "about": "Pranav Constructions Limited is an urban infrastructure and residential redevelopment company with core focus on society redevelopment and premium residential apartments in the Mumbai Metropolitan Region (MMR).",
    "objectives": [
      "Financing civil construction milestones for 3 major society redevelopment projects in Mumbai",
      "Payment of municipal approval premiums, fungible FSI charges, and development cess",
      "Repayment of short-term project debt",
      "General corporate operations"
    ],
    "pros": [
      "Asset-light redevelopment model eliminating expensive upfront land acquisition costs.",
      "Deep institutional knowledge of Mumbai municipal redevelopment policies and MHADA norms.",
      "Consistent track record of delivering projects 15% faster than Mumbai city benchmarks."
    ],
    "cons": [
      "Geographical concentration restricted almost entirely to the Mumbai urban market.",
      "Potential delays in securing 100% tenant consent or litigations from individual society members.",
      "Escalating urban development premiums and approval cess levied by municipal corporations."
    ],
    "analystRating": "Apply for Listing Gain",
    "ratingScore": 4.6,
    "badge": "Closed / Listed"
  },
  {
    "id": "glass-wall-systems-india",
    "symbol": "GLASS",
    "name": "Glass Wall Systems (India) Limited",
    "category": "mainboard",
    "status": "listed",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230284c7%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%236366f1%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EGW%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 172,
    "priceBandMax": 182,
    "lotSize": 82,
    "minInvestment": 14924,
    "issueSizeCr": 1462,
    "freshIssueCr": 1032,
    "ofsCr": 430,
    "openDate": "Sep 8, 2026",
    "closeDate": "Sep 10, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 45,
      "gmpPercent": 25,
      "estimatedListingPrice": 227,
      "trend": "up",
      "kostakRate": 675,
      "subjectToSauda": 2952,
      "lastUpdated": "11 Sep 2026, 6:30 PM IST"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 37,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 2417,
        "expense": 2030,
        "pat": 387,
        "netWorth": 2175
      },
      {
        "year": "FY 2024",
        "revenue": 2948,
        "expense": 2447,
        "pat": 501,
        "netWorth": 2801
      },
      {
        "year": "FY 2025",
        "revenue": 3509,
        "expense": 2877,
        "pat": 632,
        "netWorth": 3684
      }
    ],
    "about": "Glass Wall Systems (India) Limited is India’s leading architectural façade engineering firm, designing, fabricating, and installing premium unitized glass façades for commercial skyscrapers, airports, and luxury hotels.",
    "objectives": [
      "Automated aluminum extrusion and structural glass processing plant in Gujarat",
      "Procurement of advanced European CNC machining lines",
      "Funding large-scale commercial project working capital",
      "General corporate purposes"
    ],
    "pros": [
      "Market leader in high-rise architectural glass façades with landmark projects across India.",
      "In-house structural engineering design lab compliant with international seismic and acoustic standards.",
      "Sticky client base of blue-chip corporate developers including DLF, Prestige, and Brookfield."
    ],
    "cons": [
      "Commodity price sensitivity to architectural glass and primary aluminum billet swings.",
      "Revenue recognized on percentage-of-completion basis, vulnerable to onsite civil delays.",
      "Concentration in commercial real estate construction cycles across top metropolitan hubs."
    ],
    "analystRating": "Apply for Listing Gain",
    "ratingScore": 4.6,
    "badge": "Closed / Listed"
  },
  {
    "id": "kanohar-electricals",
    "symbol": "KANOHAR",
    "name": "Kanohar Electricals Limited",
    "category": "mainboard",
    "status": "listed",
    "badge": "Closed / Listed",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23b91c1c%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23ea580c%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EKE%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 601,
    "priceBandMax": 632,
    "lotSize": 23,
    "minInvestment": 14536,
    "issueSizeCr": 5108,
    "freshIssueCr": 3606,
    "ofsCr": 1502,
    "openDate": "Sep 8, 2026",
    "closeDate": "Sep 10, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 225,
      "gmpPercent": 36,
      "estimatedListingPrice": 857,
      "trend": "up",
      "kostakRate": 3375,
      "subjectToSauda": 4140,
      "lastUpdated": "11 Sep 2026, 6:30 PM IST"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 48,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 7565,
        "expense": 6582,
        "pat": 983,
        "netWorth": 6809
      },
      {
        "year": "FY 2024",
        "revenue": 9225,
        "expense": 7934,
        "pat": 1292,
        "netWorth": 8764
      },
      {
        "year": "FY 2025",
        "revenue": 10982,
        "expense": 9335,
        "pat": 1647,
        "netWorth": 11531
      }
    ],
    "about": "Kanohar Electricals Limited manufactures extra-high-voltage (EHV) power transformers, turnkey substation packages, and grid-scale reactors up to 765kV class for national electricity grids and multinational energy EPCs.",
    "objectives": [
      "Capacity doubling of 765kV extra-high-voltage transformer manufacturing facility",
      "Establishment of ultra-high-voltage testing laboratory for 1200kV transmission research",
      "Funding long manufacturing lead-time working capital",
      "General corporate operations"
    ],
    "pros": [
      "Elite group of Indian engineering firms certified to supply 765kV extra-high-voltage grid equipment.",
      "Robust multi-year order book driven by India’s green energy transmission corridor expansion.",
      "Growing export presence across Europe, the Middle East, and Southeast Asian utility grids."
    ],
    "cons": [
      "Substantial working capital requirements to finance 6-9 month engineering and manufacturing cycles.",
      "Client concentration with top 5 state and national transmission utilities driving 62% of sales.",
      "Foreign exchange exposure on imported raw materials like specialty core steel and transformer oil."
    ],
    "analystRating": "Apply for Listing Gain",
    "ratingScore": 4.6
  },
  {
    "id": "prasol-chemicals",
    "symbol": "PRASOL",
    "name": "Prasol Chemicals Limited",
    "category": "mainboard",
    "status": "listed",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23047857%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230e7490%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EPC%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 643,
    "priceBandMax": 676,
    "lotSize": 22,
    "minInvestment": 14872,
    "issueSizeCr": 5465,
    "freshIssueCr": 3858,
    "ofsCr": 1607,
    "openDate": "Sep 8, 2026",
    "closeDate": "Sep 10, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 0,
      "gmpPercent": 0,
      "estimatedListingPrice": 676,
      "trend": "neutral",
      "kostakRate": 0,
      "subjectToSauda": 0,
      "lastUpdated": "11 Sep 2026, 12:45 PM IST"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 12,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 5270,
        "expense": 4427,
        "pat": 843,
        "netWorth": 4743
      },
      {
        "year": "FY 2024",
        "revenue": 6427,
        "expense": 5334,
        "pat": 1093,
        "netWorth": 6106
      },
      {
        "year": "FY 2025",
        "revenue": 7651,
        "expense": 6274,
        "pat": 1377,
        "netWorth": 8034
      }
    ],
    "about": "Prasol Chemicals Limited is a leading manufacturer of phosphorus-based specialty chemicals, acetone derivatives, and synthetic lubricants supplying global agrochemical and pharmaceutical formulations.",
    "objectives": [
      "Expansion of phosphorus derivative plant capacity at Khopoli manufacturing facility",
      "R&D innovation center for green chemistry and solvent recovery",
      "Prepayment of certain long-term term loan borrowings",
      "General corporate purposes"
    ],
    "pros": [
      "Global export footprint spanning 40+ countries with REACH and US-FDA regulatory clearances.",
      "Strong backward integration in raw chemical feedstocks, safeguarding operating EBITDA margins.",
      "Dominant domestic market share in phosphorus pentasulfide and customized lubricant additives."
    ],
    "cons": [
      "Exposure to hazardous chemical processing risks and strict pollution control guidelines.",
      "Dependence on imported yellow phosphorus raw materials from Vietnam and Kazakhstan.",
      "Cyclical global chemical destocking periods affecting export realizations."
    ],
    "analystRating": "Neutral",
    "ratingScore": 3.5,
    "badge": "Closed / Listed"
  },
  {
    "id": "amtech-esters",
    "symbol": "AMTECH",
    "name": "Amtech Esters Limited",
    "category": "sme",
    "status": "listed",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%239333ea%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%232563eb%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EAE%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Emerging Enterprise / SME",
    "priceBandMin": 71,
    "priceBandMax": 75,
    "lotSize": 1000,
    "minInvestment": 75000,
    "issueSizeCr": 56,
    "freshIssueCr": 49,
    "ofsCr": 7,
    "openDate": "Sep 9, 2026",
    "closeDate": "Sep 11, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Bigshare Services Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE SME"
    ],
    "gmp": {
      "gmpPrice": 0,
      "gmpPercent": 0,
      "estimatedListingPrice": 75,
      "trend": "neutral",
      "kostakRate": 0,
      "subjectToSauda": 0,
      "lastUpdated": "Live Today"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 12,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 41,
        "expense": 37,
        "pat": 4,
        "netWorth": 29
      },
      {
        "year": "FY 2024",
        "revenue": 48,
        "expense": 43,
        "pat": 5,
        "netWorth": 36
      },
      {
        "year": "FY 2025",
        "revenue": 59,
        "expense": 52,
        "pat": 7,
        "netWorth": 48
      }
    ],
    "about": "Amtech Esters Limited produces high-purity aroma chemicals, food-grade esters, and specialty solvents used extensively in international perfumery, flavors, cosmetics, and confectionery.",
    "objectives": [
      "Installation of automated fractional distillation columns for 99.9% cosmetic-grade esters",
      "Biomass steam generation unit to reduce carbon emissions",
      "Funding export receivables and raw material inventory holding",
      "General corporate requirements"
    ],
    "pros": [
      "High-value specialty product mix commanding attractive gross margins exceeding 38%.",
      "Fractional distillation technology achieving 99.8%+ purity certifications.",
      "Expanding customer relationships with global fragrance and flavor multinationals in Europe."
    ],
    "cons": [
      "Volatility in natural and synthetic organic acid feedstock pricing.",
      "Strict import quarantine checks and evolving REACH regulations in export markets.",
      "Customer substitution risk in standardized commoditized solvent segments."
    ],
    "analystRating": "Neutral",
    "ratingScore": 3.5,
    "badge": "Closed / Listed"
  },
  {
    "id": "asset-reconstruction-company-india",
    "symbol": "ASSET",
    "name": "Asset Reconstruction Company (India) Limited",
    "category": "mainboard",
    "status": "listed",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%231e3a8a%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230284c7%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EAR%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 132,
    "priceBandMax": 139,
    "lotSize": 107,
    "minInvestment": 14873,
    "issueSizeCr": 1122,
    "freshIssueCr": 792,
    "ofsCr": 330,
    "openDate": "Sep 9, 2026",
    "closeDate": "Sep 11, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 14,
      "gmpPercent": 10,
      "estimatedListingPrice": 153,
      "trend": "up",
      "kostakRate": 210,
      "subjectToSauda": 1198,
      "lastUpdated": "11 Sep 2026, 7:15 PM IST"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 22,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 1469,
        "expense": 1234,
        "pat": 235,
        "netWorth": 1322
      },
      {
        "year": "FY 2024",
        "revenue": 1791,
        "expense": 1487,
        "pat": 304,
        "netWorth": 1701
      },
      {
        "year": "FY 2025",
        "revenue": 2132,
        "expense": 1748,
        "pat": 384,
        "netWorth": 2239
      }
    ],
    "about": "Asset Reconstruction Company (India) Limited (Arcil) is India’s pioneer and premier asset reconstruction company, acquiring non-performing loans from financial institutions and resolving stressed commercial assets under the IBC framework.",
    "objectives": [
      "Enhancing capital base to acquire new stressed retail and SME debt portfolios",
      "AI-driven digital debt recovery analytics and collateral management systems",
      "Retirement of high-cost repo borrowing obligations",
      "General corporate purposes"
    ],
    "pros": [
      "Pioneer and market leader with two decades of institutional experience in distressed asset resolution.",
      "Strong institutional backing by prominent public sector and private Indian financial institutions.",
      "High recovery track record with historical realizations exceeding 45% of gross acquisition cost."
    ],
    "cons": [
      "Prolonged judicial delays in NCLT and appellate debt recovery tribunal hearings.",
      "Portfolio valuation impairment risks during broader economic or commercial real estate downturns.",
      "Growing competition from government-sponsored bad banks and international turnaround funds."
    ],
    "analystRating": "Apply",
    "ratingScore": 4.1,
    "badge": "Closed / Listed"
  },
  {
    "id": "infrax-renewable",
    "symbol": "INFRAX",
    "name": "Infrax Renewable Limited",
    "category": "sme",
    "status": "listed",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%2315803d%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230284c7%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EIR%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Emerging Enterprise / SME",
    "priceBandMin": 104,
    "priceBandMax": 104,
    "lotSize": 1000,
    "minInvestment": 104000,
    "issueSizeCr": 83,
    "freshIssueCr": 72,
    "ofsCr": 10,
    "openDate": "Sep 9, 2026",
    "closeDate": "Sep 11, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Bigshare Services Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE SME"
    ],
    "gmp": {
      "gmpPrice": 0,
      "gmpPercent": 0,
      "estimatedListingPrice": 104,
      "trend": "neutral",
      "kostakRate": 0,
      "subjectToSauda": 0,
      "lastUpdated": "Live Today"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 12,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 88,
        "expense": 81,
        "pat": 7,
        "netWorth": 62
      },
      {
        "year": "FY 2024",
        "revenue": 103,
        "expense": 94,
        "pat": 9,
        "netWorth": 77
      },
      {
        "year": "FY 2025",
        "revenue": 125,
        "expense": 113,
        "pat": 13,
        "netWorth": 103
      }
    ],
    "about": "Infrax Renewable Limited is a clean energy EPC and independent power producer (IPP) developing commercial and industrial (C&I) rooftop solar, ground-mounted photovoltaic parks, and hybrid battery storage installations.",
    "objectives": [
      "Setting up 120 MW of captive solar and hybrid wind generation assets under C&I open access",
      "Repayment of project-level project finance debt facilities",
      "Funding working capital for utility-scale EPC contract execution",
      "General corporate operations"
    ],
    "pros": [
      "Predictable 25-year recurring cash flow annuities backed by long-term Power Purchase Agreements (PPA).",
      "Full turnkey in-house EPC capabilities with drone-based automated solar inspection.",
      "High focus on the high-tariff C&I segment providing superior return on equity compared to utility tenders."
    ],
    "cons": [
      "Transmission grid curtailment risk and delays in open-access approvals by state DISCOMs.",
      "Volatility in imported solar cell and bifacial PV module pricing along with basic customs duty changes.",
      "Challenges related to rural private land acquisition and transmission evacuation connectivity."
    ],
    "analystRating": "Neutral",
    "ratingScore": 3.5,
    "badge": "Closed / Listed"
  },
  {
    "id": "karamtara-engineering",
    "symbol": "KARAMTARA",
    "name": "Karamtara Engineering Limited",
    "category": "mainboard",
    "status": "listed",
    "badge": "Closed / Listed",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23475569%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23dc2626%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EKE%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 241,
    "priceBandMax": 254,
    "lotSize": 59,
    "minInvestment": 14986,
    "issueSizeCr": 2048,
    "freshIssueCr": 1446,
    "ofsCr": 602,
    "openDate": "Sep 9, 2026",
    "closeDate": "Sep 11, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 61,
      "gmpPercent": 24,
      "estimatedListingPrice": 315,
      "trend": "up",
      "kostakRate": 915,
      "subjectToSauda": 2879,
      "lastUpdated": "11 Sep 2026, 7:15 PM IST"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 36,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 3738,
        "expense": 3140,
        "pat": 598,
        "netWorth": 3364
      },
      {
        "year": "FY 2024",
        "revenue": 4559,
        "expense": 3784,
        "pat": 775,
        "netWorth": 4331
      },
      {
        "year": "FY 2025",
        "revenue": 5427,
        "expense": 4450,
        "pat": 977,
        "netWorth": 5698
      }
    ],
    "about": "Karamtara Engineering Limited is an integrated structural steel fabricator and transmission tower manufacturer, producing high-voltage transmission lines, solar mounting structures, and high-tensile structural fasteners.",
    "objectives": [
      "Modernization and capacity enhancement of structural tower fabrication plants",
      "Expansion of high-tensile hot-dip galvanizing lines to serve high-speed railway projects",
      "Working capital funding for large-scale domestic transmission contracts",
      "General corporate purposes"
    ],
    "pros": [
      "Massive structural steel capacity exceeding 300,000 MT annually with integrated tower testing stations.",
      "Dominant market share in high-tensile structural fasteners supplying Indian Railways and Power Grid.",
      "Export presence spanning 25+ countries with turnkey international EPC execution capabilities."
    ],
    "cons": [
      "High working capital intensity necessitated by extended utility project delivery cycles.",
      "Direct exposure to domestic pig iron and structural steel billet commodity price swings.",
      "Delays in government right-of-way (RoW) clearances halting transmission line erection works."
    ],
    "analystRating": "Apply for Listing Gain",
    "ratingScore": 4.6
  },
  {
    "id": "lcc-projects",
    "symbol": "LCC",
    "name": "LCC Projects Limited",
    "category": "mainboard",
    "status": "listed",
    "badge": "Closed / Listed",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230284c7%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230d9488%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ELP%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 139,
    "priceBandMax": 146,
    "lotSize": 102,
    "minInvestment": 14892,
    "issueSizeCr": 1181,
    "freshIssueCr": 834,
    "ofsCr": 347,
    "openDate": "Sep 9, 2026",
    "closeDate": "Sep 11, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 55,
      "gmpPercent": 38,
      "estimatedListingPrice": 201,
      "trend": "up",
      "kostakRate": 825,
      "subjectToSauda": 4488,
      "lastUpdated": "11 Sep 2026, 7:00 PM IST"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 50,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 1546,
        "expense": 1391,
        "pat": 155,
        "netWorth": 1391
      },
      {
        "year": "FY 2024",
        "revenue": 1885,
        "expense": 1678,
        "pat": 207,
        "netWorth": 1791
      },
      {
        "year": "FY 2025",
        "revenue": 2244,
        "expense": 1975,
        "pat": 269,
        "netWorth": 2356
      }
    ],
    "about": "LCC Projects Limited is a civil infrastructure engineering company executing large-scale water supply pipelines, lift irrigation networks, wastewater treatment plants, and smart city canal distribution systems across India.",
    "objectives": [
      "Procurement of heavy trenching, hydraulic pipe-laying, and directional drilling machinery",
      "Funding working capital requirements for state drinking water supply schemes",
      "Repayment of certain commercial equipment financing loans",
      "General corporate operations"
    ],
    "pros": [
      "Substantial unexecuted order book exceeding ₹3,200 Cr providing high revenue visibility for 30 months.",
      "Extensive company-owned machinery fleet reducing reliance on third-party rental contractors.",
      "Key beneficiary of the Central Government’s flagship Jal Jeevan Mission and piped water initiatives."
    ],
    "cons": [
      "High dependence on state government water supply boards for project progress sign-offs and fund disbursements.",
      "Seasonal disruption during annual monsoon months halting excavation and pipeline trenching.",
      "Escalation in ductile iron (DI) and mild steel (MS) pipe prices impacting project operating margins."
    ],
    "analystRating": "Apply for Listing Gain",
    "ratingScore": 4.6
  },
  {
    "id": "manipal-payment-identity-solutions",
    "symbol": "MANIPAL",
    "name": "Manipal Payment & Identity Solutions Limited",
    "category": "mainboard",
    "status": "listed",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%234338ca%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%236d28d9%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EMP%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 322,
    "priceBandMax": 339,
    "lotSize": 44,
    "minInvestment": 14916,
    "issueSizeCr": 2737,
    "freshIssueCr": 1932,
    "ofsCr": 805,
    "openDate": "Sep 9, 2026",
    "closeDate": "Sep 11, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 0,
      "gmpPercent": 0,
      "estimatedListingPrice": 339,
      "trend": "neutral",
      "kostakRate": 0,
      "subjectToSauda": 0,
      "lastUpdated": "11 Sep 2026, 4:20 PM IST"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 12,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 3582,
        "expense": 3009,
        "pat": 573,
        "netWorth": 3224
      },
      {
        "year": "FY 2024",
        "revenue": 4368,
        "expense": 3625,
        "pat": 743,
        "netWorth": 4150
      },
      {
        "year": "FY 2025",
        "revenue": 5200,
        "expense": 4264,
        "pat": 936,
        "netWorth": 5460
      }
    ],
    "about": "Manipal Payment & Identity Solutions Limited manufactures secure EMV banking cards, RFID smart transit cards, biometric Aadhaar-enabled authentication devices, and digital merchant payment infrastructure in India.",
    "objectives": [
      "Upgrading high-security manufacturing cleanroom to produce next-gen dual-interface metal cards",
      "R&D investment in biometric iris scanners and POS micro-ATM hardware",
      "Prepayment of certain long-term borrowings",
      "General corporate requirements"
    ],
    "pros": [
      "Market leader in EMV banking cards supplying major public sector banks, private banks, and RuPay.",
      "High-security PCI-DSS, VISA, and Mastercard certified production plants with strict audit clearances.",
      "Growing presence in urban metro transit smart ticketing and biometric national ID projects."
    ],
    "cons": [
      "Rapid proliferation of digital UPI and mobile NFC payments potentially slowing physical card volume growth.",
      "Global semiconductor microchip shortages impacting delivery timelines for smart card modules.",
      "Aggressive price competition in public sector bank smart card procurement tenders."
    ],
    "analystRating": "Neutral",
    "ratingScore": 3.5,
    "badge": "Closed / Listed"
  },
  {
    "id": "rentomojo",
    "symbol": "RENTOMOJO",
    "name": "Rentomojo Limited",
    "category": "mainboard",
    "status": "listed",
    "badge": "Closed / Listed",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23ef4444%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%238b5cf6%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ERM%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 384,
    "priceBandMax": 404,
    "lotSize": 37,
    "minInvestment": 14948,
    "issueSizeCr": 3264,
    "freshIssueCr": 2304,
    "ofsCr": 960,
    "openDate": "Sep 9, 2026",
    "closeDate": "Sep 11, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 136,
      "gmpPercent": 34,
      "estimatedListingPrice": 540,
      "trend": "up",
      "kostakRate": 2040,
      "subjectToSauda": 4025,
      "lastUpdated": "11 Sep 2026, 6:30 PM IST"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 46,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 5958,
        "expense": 5183,
        "pat": 775,
        "netWorth": 5362
      },
      {
        "year": "FY 2024",
        "revenue": 7266,
        "expense": 6249,
        "pat": 1017,
        "netWorth": 6903
      },
      {
        "year": "FY 2025",
        "revenue": 8650,
        "expense": 7353,
        "pat": 1298,
        "netWorth": 9083
      }
    ],
    "about": "Rentomojo (Edunetwork Private Limited) is India’s leading consumer tech rental subscription platform, enabling urban millennials and corporate professionals to rent furniture, home appliances, and electronics online.",
    "objectives": [
      "Procurement of consumer furniture and electronic appliance rental inventory",
      "Automated refurbishment centers and proprietary IoT reverse logistics software",
      "Expansion of rental subscription operations into 8 new Tier-2 metropolitan cities",
      "General corporate operations"
    ],
    "pros": [
      "Category leader in consumer subscription rentals with over 2 million active product subscriptions.",
      "High customer lifetime value with assets generating up to 2.8x their initial capital cost over their usable lifecycle.",
      "Proprietary AI-powered credit scoring engine keeping rental default rates below 1.8%."
    ],
    "cons": [
      "Capital-intensive business model requiring significant upfront cash outlays to purchase rental assets.",
      "Logistical costs associated with return pickup, refurbishment, sanitization, and inventory holding.",
      "Evolving consumer preferences and potential competition from organized refurbished electronics sellers."
    ],
    "analystRating": "Apply for Listing Gain",
    "ratingScore": 4.6
  },
  {
    "id": "steamhouse-india",
    "symbol": "STEAMHOUSE",
    "name": "Steamhouse India Limited",
    "category": "mainboard",
    "status": "listed",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230369a1%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230284c7%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESI%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 77,
    "priceBandMax": 81,
    "lotSize": 185,
    "minInvestment": 14985,
    "issueSizeCr": 654,
    "freshIssueCr": 462,
    "ofsCr": 192,
    "openDate": "Sep 9, 2026",
    "closeDate": "Sep 11, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 19,
      "gmpPercent": 23,
      "estimatedListingPrice": 100,
      "trend": "up",
      "kostakRate": 285,
      "subjectToSauda": 2812,
      "lastUpdated": "11 Sep 2026, 4:00 PM IST"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 35,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 631,
        "expense": 530,
        "pat": 101,
        "netWorth": 568
      },
      {
        "year": "FY 2024",
        "revenue": 769,
        "expense": 638,
        "pat": 131,
        "netWorth": 731
      },
      {
        "year": "FY 2025",
        "revenue": 916,
        "expense": 751,
        "pat": 165,
        "netWorth": 962
      }
    ],
    "about": "Steamhouse India Limited operates centralized community industrial steam generation plants, supplying clean, high-efficiency piped steam to chemical, pharmaceutical, and textile manufacturing units in industrial clusters.",
    "objectives": [
      "Setting up 2 new centralized community steam generation plants in chemical hubs in Gujarat and Maharashtra",
      "Construction of insulated underground steam transmission pipeline networks",
      "Repayment of high-cost project debt borrowings",
      "General corporate purposes"
    ],
    "pros": [
      "Community steam model replacing individual inefficient factory boilers with massive ESG benefits.",
      "Long-term take-or-pay steam supply contracts (15-20 years) ensuring guaranteed revenue off-take.",
      "Significant operating cost reduction for client factories through centralized boiler thermal efficiency."
    ],
    "cons": [
      "Input fuel price volatility in biomass briquettes, imported coal, and piped natural gas.",
      "Continuous compliance monitoring required under State Pollution Control Board environmental regulations.",
      "Operational downtime in client industrial clusters directly impacting daily piped steam off-take."
    ],
    "analystRating": "Apply",
    "ratingScore": 4.1,
    "badge": "Closed / Listed"
  },
  {
    "id": "vinod-texworld",
    "symbol": "VINOD",
    "name": "Vinod Texworld Limited",
    "category": "sme",
    "status": "listed",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%236d28d9%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23be185d%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EVT%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Emerging Enterprise / SME",
    "priceBandMin": 94,
    "priceBandMax": 94,
    "lotSize": 1000,
    "minInvestment": 94000,
    "issueSizeCr": 75,
    "freshIssueCr": 65,
    "ofsCr": 9,
    "openDate": "Sep 9, 2026",
    "closeDate": "Sep 11, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Bigshare Services Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE SME"
    ],
    "gmp": {
      "gmpPrice": 0,
      "gmpPercent": 0,
      "estimatedListingPrice": 94,
      "trend": "neutral",
      "kostakRate": 0,
      "subjectToSauda": 0,
      "lastUpdated": "Live Today"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 12,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 63,
        "expense": 56,
        "pat": 7,
        "netWorth": 44
      },
      {
        "year": "FY 2024",
        "revenue": 74,
        "expense": 65,
        "pat": 9,
        "netWorth": 56
      },
      {
        "year": "FY 2025",
        "revenue": 90,
        "expense": 78,
        "pat": 12,
        "netWorth": 74
      }
    ],
    "about": "Vinod Texworld Limited is an integrated technical textile and denim fabric weaving manufacturer producing specialty stretch denim, blended yarns, and sustainable recycled cotton apparel fabrics.",
    "objectives": [
      "Installation of 72 new European high-speed airjet weaving looms",
      "Establishment of an in-house Zero Liquid Discharge (ZLD) sustainable fabric dyeing plant",
      "Funding working capital for peak season raw cotton procurement",
      "General corporate purposes"
    ],
    "pros": [
      "High-speed modern airjet loom infrastructure yielding superior fabric finish and lower defect rates.",
      "Approved fabric supplier for prominent domestic fast-fashion apparel retail chains and private labels.",
      "Eco-friendly Zero Liquid Discharge processing compliance protecting the company from environmental shutdown notices."
    ],
    "cons": [
      "Direct vulnerability to domestic cotton crop harvest yields and raw fiber commodity price swings.",
      "Intense price competition from decentralized textile weaving clusters in Surat and Ahmedabad.",
      "Extended working capital credit periods demanded by wholesale apparel distribution networks."
    ],
    "analystRating": "Neutral",
    "ratingScore": 3.5,
    "badge": "Closed / Listed"
  },
  {
    "id": "quanto-agroworld",
    "symbol": "QUANTO",
    "name": "Quanto Agroworld Limited",
    "category": "sme",
    "status": "upcoming",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%2315803d%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%2384cc16%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EQA%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Emerging Enterprise / SME",
    "priceBandMin": 67,
    "priceBandMax": 67,
    "lotSize": 1000,
    "minInvestment": 67000,
    "issueSizeCr": 53,
    "freshIssueCr": 46,
    "ofsCr": 6,
    "openDate": "Sep 15, 2026",
    "closeDate": "Sep 17, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Bigshare Services Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE SME"
    ],
    "gmp": {
      "gmpPrice": 0,
      "gmpPercent": 0,
      "estimatedListingPrice": 67,
      "trend": "neutral",
      "kostakRate": 0,
      "subjectToSauda": 0,
      "lastUpdated": "Live Today"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 0,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 56,
        "expense": 52,
        "pat": 4,
        "netWorth": 39
      },
      {
        "year": "FY 2024",
        "revenue": 66,
        "expense": 60,
        "pat": 6,
        "netWorth": 50
      },
      {
        "year": "FY 2025",
        "revenue": 80,
        "expense": 72,
        "pat": 8,
        "netWorth": 66
      }
    ],
    "about": "Quanto Agroworld Limited formulates residue-free organic bio-fertilizers, botanical bio-pesticides, and micronutrient plant nutrition solutions for sustainable high-yield commercial farming.",
    "objectives": [
      "Expansion of microbial fermentation and bio-fertilizer extraction facility in Maharashtra",
      "R&D field trials for innovative bio-nematicides and drought-resistant soil conditioners",
      "Expansion of rural distribution network across 5 new agricultural states",
      "General corporate requirements"
    ],
    "pros": [
      "Strong gross profit margins exceeding 48% on proprietary biological extract formulations.",
      "Extensive rural distribution network covering 3,500+ agrochemical retail counters.",
      "Beneficiary of national policy push towards organic farming, soil health management, and chemical residue reduction."
    ],
    "cons": [
      "High dependence on monsoon timing and seasonal agricultural sowing cycles.",
      "Prolonged multi-year regulatory testing required for new Central Insecticides Board (CIB) product approvals.",
      "Proliferation of spurious and unbranded bio-fertilizers impacting brand pricing power."
    ],
    "analystRating": "Neutral",
    "ratingScore": 3.5,
    "badge": "Upcoming"
  },
  {
    "id": "shakti-polytarp",
    "symbol": "SHAKTI",
    "name": "Shakti Polytarp Limited",
    "category": "sme",
    "status": "upcoming",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23c2410c%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23d97706%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESP%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Emerging Enterprise / SME",
    "priceBandMin": 56,
    "priceBandMax": 59,
    "lotSize": 1000,
    "minInvestment": 59000,
    "issueSizeCr": 44,
    "freshIssueCr": 39,
    "ofsCr": 5,
    "openDate": "Sep 15, 2026",
    "closeDate": "Sep 17, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Bigshare Services Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE SME"
    ],
    "gmp": {
      "gmpPrice": 0,
      "gmpPercent": 0,
      "estimatedListingPrice": 59,
      "trend": "neutral",
      "kostakRate": 0,
      "subjectToSauda": 0,
      "lastUpdated": "Live Today"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 0,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 41,
        "expense": 36,
        "pat": 5,
        "netWorth": 29
      },
      {
        "year": "FY 2024",
        "revenue": 48,
        "expense": 42,
        "pat": 6,
        "netWorth": 36
      },
      {
        "year": "FY 2025",
        "revenue": 59,
        "expense": 50,
        "pat": 9,
        "netWorth": 48
      }
    ],
    "about": "Shakti Polytarp Limited manufactures heavy-duty multi-layered cross-laminated waterproof tarpaulins, agricultural pond liners, and engineered geotextiles for disaster relief and construction.",
    "objectives": [
      "Setting up a modern multi-layer extrusion lamination line in Gujarat",
      "Prepayment of certain high-interest term loan facilities",
      "Funding raw material polymer granule bulk purchase inventory",
      "General corporate purposes"
    ],
    "pros": [
      "Proprietary multi-layer cross-lamination technology providing 3x greater puncture resistance than conventional HDPE sheets.",
      "Preferred vendor status for institutional government disaster relief procurement and Food Corporation of India (FCI) grain covers.",
      "Expanding retail network with widespread brand recall among farmers and commercial transport fleets."
    ],
    "cons": [
      "Direct sensitivity to virgin polymer resin commodity prices linked to global crude oil benchmarks.",
      "Pronounced seasonality in agricultural demand centered heavily around pre-monsoon harvesting quarters.",
      "Low entry barriers in generic unbranded low-gauge plastic film segments."
    ],
    "analystRating": "Neutral",
    "ratingScore": 3.5,
    "badge": "Upcoming"
  },
  {
    "id": "hero-motors",
    "symbol": "HERO",
    "name": "Hero Motors Limited",
    "category": "mainboard",
    "status": "upcoming",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23dc2626%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%231e293b%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EHM%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 79,
    "priceBandMax": 84,
    "lotSize": 178,
    "minInvestment": 14952,
    "issueSizeCr": 671,
    "freshIssueCr": 474,
    "ofsCr": 197,
    "openDate": "Sep 16, 2026",
    "closeDate": "Sep 18, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 8,
      "gmpPercent": 10,
      "estimatedListingPrice": 92,
      "trend": "up",
      "kostakRate": 120,
      "subjectToSauda": 1139,
      "lastUpdated": "11 Sep 2026, 7:15 PM IST"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 0,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 763,
        "expense": 641,
        "pat": 122,
        "netWorth": 687
      },
      {
        "year": "FY 2024",
        "revenue": 930,
        "expense": 772,
        "pat": 158,
        "netWorth": 884
      },
      {
        "year": "FY 2025",
        "revenue": 1107,
        "expense": 908,
        "pat": 199,
        "netWorth": 1162
      }
    ],
    "about": "Hero Motors Limited is a world-class automotive powertrain engineering company manufacturing precision gears, transmissions, and e-bike drive units for premium global motorcycle and electric mobility OEMs.",
    "objectives": [
      "Capacity expansion at alloy transmission manufacturing plant in Punjab",
      "R&D center investment in Germany for next-generation electric vehicle drive units",
      "Prepayment of certain external commercial borrowings (ECB)",
      "General corporate operations"
    ],
    "pros": [
      "Part of the prestigious Hero Munjal conglomerate with world-renowned corporate governance and manufacturing lineage.",
      "Global Tier-1 supplier to premier European motorcycle and electric bike manufacturers like BMW Motorrad and Ducati.",
      "High proprietary engineering IP in lightweight aluminum gears and integrated electric bicycle transmission systems."
    ],
    "cons": [
      "Customer concentration risk with top 3 international motorcycle clients driving over 55% of turnover.",
      "Exposure to European automotive market demand cycles and international trade tariff revisions.",
      "Supply chain dependencies for specialized micro-alloy steel grades and imported gear-cutting tooling."
    ],
    "analystRating": "Apply",
    "ratingScore": 4.1,
    "badge": "Upcoming"
  },
  {
    "id": "jindal-supreme-india",
    "symbol": "JINDAL",
    "name": "Jindal Supreme (India) Limited",
    "category": "mainboard",
    "status": "upcoming",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%231e40af%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23475569%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EJS%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 88,
    "priceBandMax": 93,
    "lotSize": 161,
    "minInvestment": 14973,
    "issueSizeCr": 748,
    "freshIssueCr": 528,
    "ofsCr": 220,
    "openDate": "Sep 16, 2026",
    "closeDate": "Sep 18, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 17,
      "gmpPercent": 18,
      "estimatedListingPrice": 110,
      "trend": "up",
      "kostakRate": 255,
      "subjectToSauda": 2189,
      "lastUpdated": "11 Sep 2026, 7:15 PM IST"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 0,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 721,
        "expense": 649,
        "pat": 72,
        "netWorth": 649
      },
      {
        "year": "FY 2024",
        "revenue": 879,
        "expense": 782,
        "pat": 97,
        "netWorth": 835
      },
      {
        "year": "FY 2025",
        "revenue": 1047,
        "expense": 921,
        "pat": 126,
        "netWorth": 1099
      }
    ],
    "about": "Jindal Supreme (India) Limited manufactures specialized seamless carbon steel and alloy steel pipes, boiler tubes, and Oil Country Tubular Goods (OCTG) for oil & gas drilling and critical industrial infrastructure.",
    "objectives": [
      "Setting up a modern cold-drawing seamless tube plant expansion",
      "Installation of advanced ultrasonic and eddy-current non-destructive testing (NDT) lines",
      "Working capital funding for upstream energy exploration supply contracts",
      "General corporate purposes"
    ],
    "pros": [
      "API-5CT certified manufacturer approved to supply high-pressure OCTG casing and tubing to national oil drillers (ONGC, Oil India).",
      "Specialized manufacturing capability in corrosion-resistant sour-service seamless pipes for offshore refineries.",
      "High technical entry barriers due to stringent international oil & gas certification standards."
    ],
    "cons": [
      "Direct dependence on upstream oil & gas exploration capital expenditure budgets and active drilling rig counts.",
      "High inventory carrying costs for specialized alloy steel billets and long transit raw materials.",
      "Exposure to international trade protectionist measures and anti-dumping duty investigations in export markets."
    ],
    "analystRating": "Apply",
    "ratingScore": 4.1,
    "badge": "Upcoming"
  },
  {
    "id": "ss-retail",
    "symbol": "SS",
    "name": "SS Retail Limited",
    "category": "mainboard",
    "status": "upcoming",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23db2777%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%239333ea%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESR%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 403,
    "priceBandMax": 424,
    "lotSize": 35,
    "minInvestment": 14840,
    "issueSizeCr": 3425,
    "freshIssueCr": 2418,
    "ofsCr": 1007,
    "openDate": "Sep 16, 2026",
    "closeDate": "Sep 18, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 30,
      "gmpPercent": 7,
      "estimatedListingPrice": 454,
      "trend": "up",
      "kostakRate": 450,
      "subjectToSauda": 840,
      "lastUpdated": "11 Sep 2026, 7:15 PM IST"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 0,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 6252,
        "expense": 5439,
        "pat": 813,
        "netWorth": 5627
      },
      {
        "year": "FY 2024",
        "revenue": 7624,
        "expense": 6557,
        "pat": 1067,
        "netWorth": 7243
      },
      {
        "year": "FY 2025",
        "revenue": 9076,
        "expense": 7715,
        "pat": 1361,
        "netWorth": 9530
      }
    ],
    "about": "SS Retail Limited operates an extensive retail chain of 280+ modern multi-brand consumer electronics, smartphones, and IT accessory showrooms across Western and Central India.",
    "objectives": [
      "Opening 60 new large-format electronics experience showrooms in Tier-2 and Tier-3 urban centers",
      "Setting up an automated central logistics and repair fulfillment hub in Maharashtra",
      "Upgrading omni-channel POS software and unified digital inventory management",
      "General corporate operations"
    ],
    "pros": [
      "Extensive brick-and-mortar retail footprint spanning 280+ high-traffic locations across Tier-1 and Tier-2 urban hubs.",
      "Direct distribution partnerships with global consumer electronics giants including Apple, Samsung, and OnePlus.",
      "High margin contribution from high-attachment value-added services like extended warranties and screen protection plans."
    ],
    "cons": [
      "Intense pricing competition from aggressive online e-commerce platforms and quick-commerce delivery apps.",
      "High fixed operating expenses linked to long-term prime showroom retail leases and store personnel.",
      "Risk of rapid inventory obsolescence typical of consumer electronics and smartphone model cycles."
    ],
    "analystRating": "Apply",
    "ratingScore": 4.1,
    "badge": "Upcoming"
  },
  {
    "id": "national-stock-exchange-of-india",
    "symbol": "NATIONAL",
    "name": "National Stock Exchange of India Limited",
    "category": "mainboard",
    "status": "upcoming",
    "badge": "Upcoming",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230284c7%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230369a1%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ENSE%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 1700,
    "priceBandMax": 1785,
    "lotSize": 10,
    "minInvestment": 17850,
    "issueSizeCr": 14450,
    "freshIssueCr": 10200,
    "ofsCr": 4250,
    "openDate": "Sep 17, 2026",
    "closeDate": "Sep 21, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 215,
      "gmpPercent": 12,
      "estimatedListingPrice": 2000,
      "trend": "up",
      "kostakRate": 3225,
      "subjectToSauda": 1720,
      "lastUpdated": "11 Sep 2026, 7:15 PM IST"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 0,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 23887,
        "expense": 21498,
        "pat": 2389,
        "netWorth": 21498
      },
      {
        "year": "FY 2024",
        "revenue": 29131,
        "expense": 25927,
        "pat": 3204,
        "netWorth": 27674
      },
      {
        "year": "FY 2025",
        "revenue": 34680,
        "expense": 30518,
        "pat": 4162,
        "netWorth": 36414
      }
    ],
    "about": "National Stock Exchange of India Limited (NSE) is the world’s largest derivatives exchange by contract volume and India’s premier automated electronic stock exchange, providing trading, clearing, and settlement services across equities, derivatives, and fixed income.",
    "objectives": [
      "Offer for Sale (OFS) by existing shareholders to provide exit liquidity and public price discovery",
      "Investment in ultra-low latency trading architecture, colocation facilities, and AI-driven market surveillance technology",
      "Strengthening core settlement guarantee fund (SGF) reserves at the clearing corporation",
      "General corporate operations"
    ],
    "pros": [
      "Unmatched monopoly-like network effects commanding over 93% market share in Indian equity cash and 99%+ in equity derivatives.",
      "Exceptional operating EBITDA margins exceeding 72% with virtually zero long-term financial debt.",
      "Substantial recurring treasury income generated from clearing settlement floats and member margin balances."
    ],
    "cons": [
      "High regulatory oversight by SEBI regarding transaction fee tariffs, algorithm colocation access, and exchange governance.",
      "Systemic technology outage and cybersecurity risks which carry heavy monetary penalties and reputation damage.",
      "Cyclical sensitivity of trading revenue to macroeconomic pullbacks in retail and institutional investor market participation."
    ],
    "analystRating": "Apply for Listing Gain",
    "ratingScore": 4.6
  },
  {
    "id": "sonaselection-india",
    "symbol": "SONASELECTION",
    "name": "Sonaselection India Limited",
    "category": "mainboard",
    "status": "upcoming",
    "logo": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23334155%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230284c7%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2224%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2255%25%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2238%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESI%3C%2Ftext%3E%3C%2Fsvg%3E",
    "sector": "Mainboard Corporate",
    "priceBandMin": 94,
    "priceBandMax": 99,
    "lotSize": 151,
    "minInvestment": 14949,
    "issueSizeCr": 799,
    "freshIssueCr": 564,
    "ofsCr": 235,
    "openDate": "Sep 17, 2026",
    "closeDate": "Sep 21, 2026",
    "allotmentDate": "Sep 16, 2026",
    "refundDate": "Sep 17, 2026",
    "creditDate": "Sep 17, 2026",
    "listingDate": "Sep 19, 2026",
    "registrar": "Link Intime India Pvt Ltd",
    "leadManagers": [
      "ICICI Securities",
      "Axis Capital",
      "SBI Capital"
    ],
    "exchange": [
      "BSE",
      "NSE"
    ],
    "gmp": {
      "gmpPrice": 0,
      "gmpPercent": 0,
      "estimatedListingPrice": 99,
      "trend": "neutral",
      "kostakRate": 0,
      "subjectToSauda": 0,
      "lastUpdated": "Live Today"
    },
    "subscription": {
      "qib": 0,
      "nii": 0,
      "retail": 0,
      "total": 0,
      "day": 2,
      "lastUpdated": "Live Exchange Feed"
    },
    "financials": [
      {
        "year": "FY 2023",
        "revenue": 1183,
        "expense": 1029,
        "pat": 154,
        "netWorth": 1065
      },
      {
        "year": "FY 2024",
        "revenue": 1443,
        "expense": 1241,
        "pat": 202,
        "netWorth": 1371
      },
      {
        "year": "FY 2025",
        "revenue": 1718,
        "expense": 1460,
        "pat": 258,
        "netWorth": 1804
      }
    ],
    "about": "Sonaselection India Limited manufactures precision forged automotive gears, differential assemblies, and drive axles for passenger vehicles, commercial trucks, and off-highway tractors.",
    "objectives": [
      "Installation of a modern 4,000-tonne automated hot forging press line",
      "Expansion of precision gear machining and induction heat-treatment capacity",
      "Prepayment of certain term loan borrowings",
      "General corporate purposes"
    ],
    "pros": [
      "Established Tier-1 automotive supplier with long-term relationships with Maruti Suzuki, Hyundai India, and Tata Motors.",
      "Strategic transition towards lightweight hollow driveshafts and differential gears engineered for electric vehicles.",
      "High plant operational efficiency with automated robotic forging press transfer systems."
    ],
    "cons": [
      "Cyclical dependence on the broader health and production output of the Indian automotive sector.",
      "High energy and electricity costs required for operating heavy continuous induction heating forging lines.",
      "Customer concentration with top 4 automobile manufacturers accounting for over 68% of annual sales."
    ],
    "analystRating": "Neutral",
    "ratingScore": 3.5,
    "badge": "Upcoming"
  }
];

export const mockBuybacks: BuybackItem[] = [
  {
    "id": "tcs-buyback",
    "companyName": "Tata Consultancy Services Limited",
    "symbol": "TCS",
    "status": "upcoming",
    "buybackPrice": 4500,
    "currentMarketPrice": 4210,
    "premiumPercent": 6.89,
    "recordDate": "2026-09-28",
    "issueSizeCr": 17000,
    "type": "Tender Offer"
  },
  {
    "id": "infosys-buyback",
    "companyName": "Infosys Limited",
    "symbol": "INFY",
    "status": "open",
    "buybackPrice": 1950,
    "currentMarketPrice": 1820,
    "premiumPercent": 7.14,
    "recordDate": "2026-09-14",
    "issueSizeCr": 9300,
    "type": "Open Market"
  },
  {
    "id": "wipro-buyback",
    "companyName": "Wipro Limited",
    "symbol": "WIPRO",
    "status": "closed",
    "buybackPrice": 445,
    "currentMarketPrice": 512,
    "premiumPercent": 12.5,
    "recordDate": "2026-07-20",
    "issueSizeCr": 12000,
    "type": "Tender Offer"
  }
];

export const mockCalendarEvents: CalendarEvent[] = [
  {
    "date": "2026-09-10",
    "events": [
      {
        "ipoName": "Veegaland Developers",
        "category": "mainboard",
        "type": "Open"
      },
      {
        "ipoName": "Maharaja Speedex India",
        "category": "sme",
        "type": "Open"
      },
      {
        "ipoName": "Raksan Transformers",
        "category": "sme",
        "type": "Open"
      }
    ]
  },
  {
    "date": "2026-09-11",
    "events": [
      {
        "ipoName": "Manika Plastech",
        "category": "mainboard",
        "type": "Open"
      },
      {
        "ipoName": "Century Business Media",
        "category": "sme",
        "type": "Open"
      },
      {
        "ipoName": "Injecto Polymers",
        "category": "sme",
        "type": "Open"
      },
      {
        "ipoName": "Asset Reconstruction Company",
        "category": "mainboard",
        "type": "Close"
      }
    ]
  },
  {
    "date": "2026-09-15",
    "events": [
      {
        "ipoName": "Veegaland Developers",
        "category": "mainboard",
        "type": "Close"
      },
      {
        "ipoName": "Maharaja Speedex India",
        "category": "sme",
        "type": "Close"
      },
      {
        "ipoName": "Raksan Transformers",
        "category": "sme",
        "type": "Close"
      }
    ]
  },
  {
    "date": "2026-09-16",
    "events": [
      {
        "ipoName": "Manika Plastech",
        "category": "mainboard",
        "type": "Close"
      },
      {
        "ipoName": "Veegaland Developers",
        "category": "mainboard",
        "type": "Allotment"
      }
    ]
  },
  {
    "date": "2026-09-19",
    "events": [
      {
        "ipoName": "Veegaland Developers",
        "category": "mainboard",
        "type": "Listing"
      },
      {
        "ipoName": "Maharaja Speedex India",
        "category": "sme",
        "type": "Listing"
      }
    ]
  }
];
