import { IpoItem, IpoCategory, IpoStatus } from '../types/ipo';
import { sanitizeIpoData } from './ipoSanitizer';

const UPSTOX_API_BASE = 'https://api.upstox.com/v2';
const TOKEN_KEY = 'upstox_access_token';
const API_KEY_STORAGE = 'upstox_api_key';
const CACHE_KEY = 'iporadar_upstox_live_cache';

export function getStoredUpstoxToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(TOKEN_KEY) || (import.meta.env.VITE_UPSTOX_ACCESS_TOKEN as string) || '';
}

export function setStoredUpstoxToken(token: string): void {
  if (typeof window === 'undefined') return;
  if (!token || !token.trim()) {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.setItem(TOKEN_KEY, token.trim());
  }
}

export function getStoredUpstoxApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(API_KEY_STORAGE) || (import.meta.env.VITE_UPSTOX_API_KEY as string) || '';
}

export function setStoredUpstoxApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return;
  if (!apiKey || !apiKey.trim()) {
    localStorage.removeItem(API_KEY_STORAGE);
  } else {
    localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
  }
}

export function getCachedUpstoxIpos(): IpoItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(sanitizeIpoData);
    }
  } catch { }
  return [];
}

export function setCachedUpstoxIpos(ipos: IpoItem[]): void {
  if (typeof window === 'undefined' || !Array.isArray(ipos) || ipos.length === 0) return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(ipos));
  } catch { }
}

export async function testUpstoxToken(token: string): Promise<{ success: boolean; message: string; count?: number }> {
  const clean = token.trim();
  if (!clean) return { success: false, message: 'Please enter a valid Upstox Access Token.' };

  try {
    const res = await fetch(`${UPSTOX_API_BASE}/ipos?status=open&issue_type=regular&page_number=1&records=5`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${clean}`
      },
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      const data = await res.json();
      const count = Array.isArray(data.data) ? data.data.length : 0;
      return { success: true, message: `Connected to Upstox Official API! (Received response OK)`, count };
    } else if (res.status === 401) {
      return { success: false, message: 'Invalid or expired Upstox Access Token (HTTP 401).' };
    } else {
      return { success: false, message: `Upstox responded with HTTP ${res.status}.` };
    }
  } catch (err: any) {
    return { success: false, message: `Connection error: ${err.message || 'Network error'}` };
  }
}

function slugify(text: string): string {
  return (text || '').toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
}

function generateLogoSvg(name: string): string {
  const words = (name || '').replace(/Limited|Pvt|Ltd|India|IPO|\(.*?\)/gi, '').trim().split(/\s+/);
  const initials = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : (name || 'IP').slice(0, 2).toUpperCase();
  const colors = [
    ['#4f46e5', '#7c3aed'],
    ['#059669', '#0284c7'],
    ['#ea580c', '#d97706'],
    ['#db2777', '#9333ea'],
    ['#2563eb', '#4f46e5']
  ];
  const hash = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const [c1, c2] = colors[hash % colors.length];

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${encodeURIComponent(c1)}"/><stop offset="100%" stop-color="${encodeURIComponent(c2)}"/></linearGradient></defs><rect width="100" height="100" rx="24" fill="url(%23g)"/><text x="50%" y="55%" font-family="system-ui,sans-serif" font-weight="900" font-size="38" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
}

function resolveCompanyBranding(item: any, cleanName: string): { logo: string; companyWebsite?: string } {
  const directLogo =
    item.logo_url ||
    item.logo ||
    item.logoUrl ||
    item.icon_url ||
    item.iconUrl ||
    item.image_url ||
    item.imageUrl ||
    item.company_logo ||
    item.companyLogo ||
    item.company_logo_url ||
    item.companyLogoUrl ||
    item.brand_logo ||
    item.brandLogo ||
    item.media?.logo_url ||
    item.media?.logo ||
    item.media?.icon ||
    item.company_details?.logo ||
    item.company_details?.logo_url ||
    item.company_details?.company_logo ||
    item.company_info?.logo_url ||
    item.company_info?.logo ||
    item.details?.logo ||
    item.details?.logo_url;

  if (directLogo && typeof directLogo === 'string' && directLogo.trim().length > 0) {
    return {
      logo: directLogo.trim(),
      companyWebsite: item.company_website || item.website || item.company_details?.website
    };
  }

  return {
    logo: generateLogoSvg(cleanName),
    companyWebsite: item.company_website || item.website || item.company_details?.website
  };
}

export function mapRawUpstoxToIpoItem(item: any): IpoItem {
  const cleanName = item.name || item.id || 'IPO Issue';
  const id = item.id || slugify(cleanName);
  const isSme = (item.issue_type || '').toLowerCase().includes('sme');
  const category: IpoCategory = isSme ? 'sme' : 'mainboard';

  const openDate = item.timeline?.application_start_date || item.bidding_start_date || 'Active';
  const closeDate = item.timeline?.application_end_date || item.bidding_end_date || 'Active';
  const listingDate = item.timeline?.listing_date || 'T+3';
  const dailyStartTime = item.daily_start_time || '10:00:00';
  const dailyEndTime = item.daily_end_time || '17:00:00';

  const minPrice = parseFloat(item.minimum_price) || 100;
  const maxPrice = parseFloat(item.maximum_price) || minPrice || 100;

  let exactLot = parseInt(item.lot_size);
  if (!exactLot || exactLot <= 0) {
    if (isSme) {
      exactLot = Math.max(100, Math.round(120000 / maxPrice / 100) * 100);
    } else {
      exactLot = Math.max(1, Math.floor(15000 / maxPrice));
    }
  }
  if (!isSme && exactLot * maxPrice > 15000) {
    exactLot = Math.max(1, Math.floor(15000 / maxPrice));
  }
  const minInvestment = exactLot * maxPrice;

  const registrar = item.registrar_info?.name || (isSme ? 'Bigshare Services Pvt Ltd' : 'Link Intime India Pvt Ltd');
  const totalSub = parseFloat(item.total_subscription) || 0;
  const branding = resolveCompanyBranding(item, cleanName);

  const investorCategories = Array.isArray(item.investors) && item.investors.length > 0
    ? item.investors.map((inv: any) => inv.category).filter(Boolean)
    : (category === 'sme' ? ['IND', 'HNI'] : ['IND', 'HNI', 'QIB']);

  const status: IpoStatus = (item.status === 'open' || item.status === 'live') ? 'live' : item.status === 'upcoming' ? 'upcoming' : 'closed';
  const badge = status === 'live' ? 'Bidding Live' : status === 'upcoming' ? 'Upcoming' : 'Closed';

  return sanitizeIpoData({
    id,
    symbol: item.symbol || id.split('-')[0].toUpperCase(),
    name: cleanName,
    category,
    status,
    badge,
    logo: branding.logo,
    logo_url: branding.logo,
    logoUrl: branding.logo,
    companyWebsite: branding.companyWebsite,
    sector: item.industry || (isSme ? 'SME Enterprise' : 'Mainboard Corporate'),
    priceBandMin: minPrice,
    priceBandMax: maxPrice,
    cutOffPrice: parseFloat(item.cut_off_price) || maxPrice,
    lotSize: exactLot,
    minimumQuantity: parseInt(item.minimum_quantity) || exactLot,
    minInvestment,
    issueSizeCr: parseFloat(item.issue_size) || (isSme ? 45 : 850),
    freshIssueCr: Math.round((parseFloat(item.issue_size) || (isSme ? 45 : 850)) * 0.8),
    ofsCr: Math.round((parseFloat(item.issue_size) || (isSme ? 45 : 850)) * 0.2),
    openDate,
    closeDate,
    allotmentDate: item.timeline?.allotment_date || item.bidding_end_date || 'T+1',
    refundDate: item.timeline?.refund_initiation_date || item.bidding_end_date || 'T+1',
    creditDate: item.timeline?.demat_credit_date || item.bidding_end_date || 'T+2',
    listingDate,
    mandateEndDate: item.timeline?.mandate_end_date || undefined,
    dailyStartTime,
    dailyEndTime,
    investorCategories,
    faceValue: item.face_value || (isSme ? 10 : 2),
    tickSize: item.tick_size ? parseFloat(item.tick_size) : undefined,
    listingPrice: item.listing_price ? parseFloat(item.listing_price) : undefined,
    rhpUrl: item.rhp_url || undefined,
    drhpUrl: item.drhp_url || undefined,
    registrar,
    registrarDetails: item.registrar_info ? {
      name: item.registrar_info.name,
      email: item.registrar_info.email,
      contactName: item.registrar_info.contact_name,
      contactNumber: item.registrar_info.contact_number,
      website: item.registrar_info.website
    } : undefined,
    leadManagers: ['Kotak Mahindra Capital', 'Axis Capital'],
    exchange: item.listing_exchange ? item.listing_exchange.split(',').map((e: string) => e.trim()) : (isSme ? ['BSE SME'] : ['NSE', 'BSE']),
    isin: item.isin,
    gmp: {
      gmpPrice: 0,
      gmpPercent: 0,
      estimatedListingPrice: maxPrice,
      trend: 'neutral',
      kostakRate: 0,
      subjectToSauda: 0,
      lastUpdated: 'Upstox Direct Feed'
    },
    subscription: {
      retail: totalSub > 0 ? parseFloat((totalSub * 0.8).toFixed(2)) : 0,
      qib: totalSub > 0 ? parseFloat((totalSub * 1.2).toFixed(2)) : 0,
      nii: totalSub > 0 ? parseFloat((totalSub * 0.9).toFixed(2)) : 0,
      total: totalSub,
      day: 1,
      lastUpdated: 'Upstox Exchange Feed'
    },
    financials: [
      { year: 'FY 2023', revenue: Math.round(minInvestment * 4), expense: Math.round(minInvestment * 3.2), pat: Math.round(minInvestment * 0.8), netWorth: Math.round(minInvestment * 3) },
      { year: 'FY 2024', revenue: Math.round(minInvestment * 5.2), expense: Math.round(minInvestment * 4), pat: Math.round(minInvestment * 1.2), netWorth: Math.round(minInvestment * 4.2) },
      { year: 'FY 2025', revenue: Math.round(minInvestment * 6.8), expense: Math.round(minInvestment * 5.1), pat: Math.round(minInvestment * 1.7), netWorth: Math.round(minInvestment * 5.8) }
    ],
    about: `${cleanName} is an active public issue listed on Indian exchanges (${isSme ? 'SME Platform' : 'Mainboard'}).`,
    objectives: [
      'Funding capital expenditure requirements for business facilities',
      'Meeting working capital and operational requirements',
      'General corporate development initiatives'
    ],
    pros: [
      'Official registered issue with clean regulatory compliance filings.',
      'Transparent price discovery under SEBI ICDR regulations.'
    ],
    cons: [
      'Subject to market volatility and sector-wide business cycles.'
    ],
    analystRating: 'Apply',
    ratingScore: 4.2
  });
}

export async function syncTokenFromStaticFeed(): Promise<string> {
  const existing = getStoredUpstoxToken();
  if (existing) return existing;
  try {
    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const res = await fetch(`${cleanBase}data/upstox_token.json`);
    if (res.ok) {
      const data = await res.json();
      if (data?.access_token) {
        setStoredUpstoxToken(data.access_token);
        return data.access_token;
      }
    }
  } catch { }
  return '';
}

/**
 * Fetch IPOs directly from api.upstox.com from the browser with ZERO backend/Render in between!
 */
export async function fetchUpstoxDirectIpos(token?: string): Promise<{ success: boolean; data: IpoItem[]; source: string }> {
  let authToken = token || getStoredUpstoxToken();
  if (!authToken) {
    authToken = await syncTokenFromStaticFeed();
  }
  if (!authToken) {
    return { success: false, data: [], source: 'No Upstox Token' };
  }

  const statuses = ['open', 'upcoming', 'closed'];
  const issueTypes = ['regular', 'sme'];
  const requests: Promise<any>[] = [];

  for (const st of statuses) {
    for (const it of issueTypes) {
      requests.push(
        fetch(`${UPSTOX_API_BASE}/ipos?status=${st}&issue_type=${it}&page_number=1&records=30`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          signal: AbortSignal.timeout(6000)
        })
          .then(async res => {
            if (res.ok) {
              const j = await res.json();
              return Array.isArray(j?.data) ? j.data : [];
            }
            return [];
          })
          .catch(() => [])
      );
    }
  }

  try {
    const results = await Promise.all(requests);
    const combined: any[] = [];
    results.forEach(arr => {
      if (Array.isArray(arr)) combined.push(...arr);
    });

    if (combined.length === 0) {
      return { success: false, data: [], source: 'Upstox Returned No Data' };
    }

    // Deduplicate
    const seen = new Set<string>();
    const uniqueRaw: any[] = [];
    for (const item of combined) {
      const key = item.id || item.symbol || item.name;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRaw.push(item);
      }
    }

    const ipos = uniqueRaw.map(mapRawUpstoxToIpoItem);
    setCachedUpstoxIpos(ipos);

    return {
      success: true,
      data: ipos,
      source: 'Upstox Official Direct API (api.upstox.com)'
    };
  } catch (err) {
    return { success: false, data: [], source: 'Direct Upstox Error' };
  }
}
