export type IpoCategory = 'mainboard' | 'sme';
export type IpoStatus = 'live' | 'upcoming' | 'closed' | 'listed';

export interface SubscriptionBreakdown {
  qib: number;        // Qualified Institutional
  nii: number;        // Non-institutional / HNI
  bNii?: number;      // Big HNI (> 10L)
  sNii?: number;      // Small HNI (2L - 10L)
  retail: number;     // Retail individual
  employee?: number;  // Employee quota
  total: number;      // Overall times
  day: number;        // Current bidding day (1, 2, 3)
  lastUpdated: string;
  applications?: number; // Total applications received
}

export interface GmpDetail {
  gmpPrice: number;       // In INR, e.g. +45
  gmpPercent: number;     // e.g. +38.5%
  estimatedListingPrice: number;
  trend: 'up' | 'down' | 'neutral';
  kostakRate: number;     // In INR
  subjectToSauda: number; // In INR
  lastUpdated: string;
}

export interface FinancialYear {
  year: string;
  revenue: number; // in Cr
  expense: number; // in Cr
  pat: number;     // Profit after tax in Cr
  netWorth: number;// in Cr
}

export interface IpoItem {
  id: string;
  symbol: string;
  name: string;
  category: IpoCategory;
  status: IpoStatus;
  badge?: string;
  logo: string;
  logo_url?: string;
  sector: string;
  priceBandMin: number;
  priceBandMax: number;
  lotSize: number;
  minInvestment: number;
  issueSizeCr: number;
  freshIssueCr: number;
  ofsCr: number;
  openDate: string;
  closeDate: string;
  allotmentDate: string;
  refundDate: string;
  creditDate: string;
  listingDate: string;
  listingPrice?: number;
  currentPrice?: number;
  listingGainPercent?: number;
  registrar: string;
  leadManagers: string[];
  exchange: string[];
  gmp: GmpDetail;
  subscription: SubscriptionBreakdown;
  financials: FinancialYear[];
  about: string;
  objectives: string[];
  pros: string[];
  cons: string[];
  analystRating: 'Apply' | 'Avoid' | 'Neutral' | 'Apply for Listing Gain';
  ratingScore: number; // out of 5
  kfinClientId?: string;
  mufgClientId?: string;
  bigshareCompanyId?: string;
  isin?: string;
  rhpUrl?: string;
  drhpUrl?: string;
  faceValue?: number;
  mandateEndDate?: string;
  cutOffPrice?: number;
  tickSize?: number;
  dailyStartTime?: string;
  dailyEndTime?: string;
  preApplyStartDate?: string;
  allotmentStartDate?: string;
  minimumQuantity?: number;
  investorCategories?: string[];
  companyWebsite?: string;
  registrarDetails?: {
    name: string;
    email?: string;
    contactName?: string;
    contactNumber?: string;
    website?: string;
  };
}

export interface RegistrarDetails {
  name: string;
  email?: string;
  contactName?: string;
  contactNumber?: string;
  website?: string;
}

export interface KfinIssue {
  clientId: string;
  name: string;
}

export interface MufgIssue {
  clientId: string;
  name: string;
}

export interface BigshareIssue {
  companyId: string;
  name: string;
}

export type BigshareServerId = 'server1' | 'server2' | 'server3';

export interface BigshareServerInfo {
  id: BigshareServerId;
  name: string;
  url: string;
  portalUrl: string;
  status: 'online' | 'offline' | 'degraded';
  latencyMs?: number;
  error?: string;
}

export interface BigshareCaptchaResponse {
  success: boolean;
  token?: string;
  image?: string;
  serverId?: BigshareServerId;
  serverName?: string;
  serverUrl?: string;
  portalUrl?: string;
  error?: string;
}

export interface AllotmentResult {
  ipoId: string;
  ipoName: string;
  applicantName: string;
  pan: string;
  applicationNo: string;
  dpId: string;
  sharesApplied: number;
  sharesAllotted: number;
  status: 'Allotted' | 'Not Allotted' | 'Under Process' | 'Not Found' | 'CAPTCHA_INVALID' | 'CAPTCHA_REQUIRED';
  finalizedDate?: string;
  registrarPortalUrl?: string;
  refundAmount: number;
  message: string;
  registrar: string;
}

export interface PanCard {
  id: string;
  pan: string;        // e.g. ABCDE1234F
  name?: string;      // optional applicant name
  nickname?: string;  // optional label e.g. "Dad", "Wife"
}

export interface BatchAllotmentResult {
  panCard: PanCard;
  result: AllotmentResult | null;
  loading: boolean;
  error?: string;
}

export interface BuybackItem {
  id: string;
  companyName: string;
  symbol: string;
  logoUrl?: string;
  status: 'open' | 'upcoming' | 'closed';
  buybackPrice: number;
  currentMarketPrice: number;
  premiumPercent: number;
  recordDate: string;
  issueDate?: string;
  closeDate?: string;
  issueSizeCr: number;
  type: 'Tender Offer' | 'Open Market';
}

export interface CalendarEvent {
  date: string;
  events: {
    ipoName: string;
    category: IpoCategory;
    type: 'Open' | 'Close' | 'Allotment' | 'Refund' | 'Credit' | 'Listing';
  }[];
}

// ─── Advanced Feature Types ─────────────────────────────────────────────────

// Anchor Lock-In Expiry Tracker
export interface AnchorLockIn {
  ipoId: string;
  ipoName: string;
  symbol: string;
  logo?: string;
  listingDate: string;
  anchorAllotmentDate?: string;
  lockIn30DayDate: string;  // listing + 30 days
  lockIn90DayDate: string;  // listing + 90 days
  anchorInvestors?: string[];
  issueSizeCr: number;
  category: IpoCategory;
  currentPrice?: number;
  listingPrice?: number;
}

// GMP Historical Snapshot
export interface GmpHistoryPoint {
  date: string;         // YYYY-MM-DD
  gmpPrice: number;     // INR
  gmpPercent: number;   // %
  source?: string;
}

// Health Scorecard
export type RedFlagSeverity = 'high' | 'medium' | 'low';
export interface HealthFlag {
  id: string;
  type: 'red' | 'green';
  severity: RedFlagSeverity;
  title: string;
  description: string;
  value?: string;
}
export interface HealthScorecard {
  totalScore: number;        // 0–100
  valuationScore: number;    // 0–25
  growthScore: number;       // 0–25
  financialHealthScore: number; // 0–25
  demandScore: number;       // 0–25
  flags: HealthFlag[];
  verdict: 'Strong Buy' | 'Buy' | 'Neutral' | 'Avoid' | 'High Risk';
  peRatio?: number;
  pbRatio?: number;
  revenueCagr?: number;
  patMargin?: number;
  debtToEquity?: number;
  ofsPercent?: number;
}

// Family Bidding Hub
export type MandateStatus = 'Requested' | 'Authorized' | 'Blocked' | 'Released' | 'Pending';
export type BrokerName = 'Zerodha' | 'Groww' | 'Upstox' | 'Angel One' | 'Dhan' | 'HDFC Securities' | 'ICICI Direct' | 'SBI Securities' | 'Other';

export interface FamilyBid {
  id: string;
  panId: string;            // references PanCard.id
  panNumber: string;        // denormalized for display
  applicantName: string;
  nickname?: string;
  ipoId: string;
  ipoName: string;
  broker: BrokerName;
  lotsApplied: number;
  priceApplied: number;     // cut-off or specific price
  capitalBlocked: number;   // INR
  mandateStatus: MandateStatus;
  applicationNo?: string;
  upiRefNo?: string;
  appliedAt: string;        // ISO timestamp
  category: 'Retail' | 'sHNI' | 'bHNI';
}

// Family P&L Ledger Entry
export interface FamilyPnlEntry {
  id: string;
  panId: string;
  panNumber: string;
  applicantName: string;
  nickname?: string;
  ipoId: string;
  ipoName: string;
  ipoSymbol: string;
  appliedDate: string;
  listingDate: string;
  lotsApplied: number;
  lotsAllotted: number;
  applicationPrice: number;
  listingPrice: number;
  currentPrice?: number;
  capitalInvested: number;
  refundReceived: number;
  listingDayProfit: number;
  overallProfit?: number;
  status: 'Allotted' | 'Not Allotted' | 'Pending';
  broker: BrokerName;
  fiscalYear: string;       // e.g. '2025-26'
}
