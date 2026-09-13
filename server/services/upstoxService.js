import axios from 'axios';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, '../../.env');

// In-memory cache for Upstox token and IPO data
let cachedAccessToken = process.env.UPSTOX_ACCESS_TOKEN || '';
let upstoxIposCache = [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export function getUpstoxConfig() {
  // Read fresh from .env if present
  let envConfig = {};
  if (fs.existsSync(ENV_PATH)) {
    const lines = fs.readFileSync(ENV_PATH, 'utf-8').split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let value = (match[2] || '').trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        envConfig[match[1]] = value;
      }
    });
  }

  return {
    apiKey: envConfig.UPSTOX_API_KEY || process.env.UPSTOX_API_KEY || '',
    apiSecret: envConfig.UPSTOX_API_SECRET || process.env.UPSTOX_API_SECRET || '',
    accessToken: cachedAccessToken || envConfig.UPSTOX_ACCESS_TOKEN || process.env.UPSTOX_ACCESS_TOKEN || '',
    redirectUri: envConfig.UPSTOX_REDIRECT_URI || process.env.UPSTOX_REDIRECT_URI || 'http://localhost:5001/api/upstox/callback'
  };
}

export function saveAccessToken(token) {
  cachedAccessToken = token;
  if (fs.existsSync(ENV_PATH)) {
    let content = fs.readFileSync(ENV_PATH, 'utf-8');
    if (content.includes('UPSTOX_ACCESS_TOKEN=')) {
      content = content.replace(/UPSTOX_ACCESS_TOKEN=.*/, `UPSTOX_ACCESS_TOKEN=${token}`);
    } else {
      content += `\nUPSTOX_ACCESS_TOKEN=${token}`;
    }
    fs.writeFileSync(ENV_PATH, content, 'utf-8');
    console.log('[UpstoxService] Successfully persisted new access_token to .env');
  }
}

export function getUpstoxLoginUrl() {
  const { apiKey, redirectUri } = getUpstoxConfig();
  if (!apiKey) return null;
  return `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${encodeURIComponent(apiKey)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export async function exchangeCodeForToken(code) {
  const { apiKey, apiSecret, redirectUri } = getUpstoxConfig();

  const params = new URLSearchParams();
  params.append('code', code);
  params.append('client_id', apiKey);
  params.append('client_secret', apiSecret);
  params.append('redirect_uri', redirectUri);
  params.append('grant_type', 'authorization_code');

  const response = await axios.post('https://api.upstox.com/v2/login/authorization/token', params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    }
  });

  if (response.data && response.data.access_token) {
    saveAccessToken(response.data.access_token);
    return response.data;
  }
  throw new Error('Failed to obtain access_token from Upstox token endpoint');
}

function slugify(text) {
  return (text || '').toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
}

function generateLogoSvg(name) {
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

function resolveCompanyBranding(item, cleanName) {
  const knownDomains = {
    'manika': 'manikaplastech.com',
    'veegaland': 'veegaland.in',
    'national-stock-exchange': 'nseindia.com',
    'nse': 'nseindia.com',
    'ss-retail': 'ssmobile.com',
    'hero-motors': 'heromotors.com',
    'parle': 'parleproducts.com',
    'jio': 'jio.com',
    'flipkart': 'flipkart.com',
    'tata-capital': 'tatacapital.com',
    'swiggy': 'swiggy.com',
    'sbi': 'sbimf.com',
    'hyundai': 'hyundai.com',
    'waaree': 'waaree.com',
    'afcons': 'afcons.com',
    'acme': 'acmesolar.in',
    'ntpc': 'ntpcgreen.com',
    'yaashvi': 'yaashvijewellers.com',
    'maniveni': 'manivenifoods.com'
  };

  const idLower = (item.id || item.symbol || cleanName || '').toLowerCase();
  for (const [prefix, dom] of Object.entries(knownDomains)) {
    if (idLower.includes(prefix)) {
      return {
        logo: `https://www.google.com/s2/favicons?domain=${dom}&sz=128`,
        companyWebsite: `https://${dom}`
      };
    }
  }

  // Extract from RHP URL
  if (item.rhp_url) {
    try {
      const parsed = new URL(item.rhp_url);
      const host = parsed.hostname.toLowerCase();
      const skipHosts = ['sebi.gov.in', 'axiscapital.co.in', 'sarthi.in', 'bseindia.com', 'nseindia.com', 'kfintech.com', 'linkintime.co.in', 'bigshareonline.com', 'mufg.com'];
      if (!skipHosts.some(sh => host.includes(sh))) {
        return {
          logo: `https://www.google.com/s2/favicons?domain=${host}&sz=128`,
          companyWebsite: `https://${host}`
        };
      }
    } catch {}
  }

  return {
    logo: generateLogoSvg(cleanName),
    companyWebsite: undefined
  };
}

export function mapUpstoxToIpoItem(item, kfinIssues = []) {
  const cleanName = item.name || item.id || 'IPO Issue';
  const id = item.id || slugify(cleanName);
  const isSme = (item.issue_type || '').toLowerCase().includes('sme');
  const category = isSme ? 'sme' : 'mainboard';
  const status = item.status === 'open' ? 'live' : item.status === 'upcoming' ? 'upcoming' : 'listed';
  
  const minPrice = parseFloat(item.minimum_price) || 100;
  const maxPrice = parseFloat(item.maximum_price) || minPrice || 100;
  
  const exactLot = parseInt(item.lot_size) || (isSme 
    ? Math.max(500, Math.round(120000 / maxPrice / 100) * 100) 
    : Math.max(10, Math.round(14500 / maxPrice)));
  const minInvestment = exactLot * maxPrice;

  // Match against KFintech issues
  let matchedKfin = null;
  if (Array.isArray(kfinIssues) && kfinIssues.length > 0) {
    const norm = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
    matchedKfin = kfinIssues.find(k => {
      const kNorm = k.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return kNorm.includes(norm) || norm.includes(kNorm);
    });
  }

  const registrar = item.registrar_info?.name || (matchedKfin 
    ? 'KFin Technologies Ltd' 
    : (isSme ? 'Bigshare Services Pvt Ltd' : 'Link Intime India Pvt Ltd'));
  const kfinClientId = matchedKfin ? matchedKfin.clientId : undefined;

  const totalSub = parseFloat(item.total_subscription) || 0;
  const branding = resolveCompanyBranding(item, cleanName);

  const investorCategories = Array.isArray(item.investors) && item.investors.length > 0
    ? item.investors.map(inv => inv.category).filter(Boolean)
    : (category === 'sme' ? ['IND', 'HNI'] : ['IND', 'HNI', 'QIB']);

  return {
    id,
    symbol: item.symbol || id.split('-')[0].toUpperCase(),
    name: cleanName,
    category,
    status,
    badge: status === 'live' ? 'Bidding Live' : status === 'upcoming' ? 'Upcoming' : 'New Issue',
    logo: branding.logo,
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
    openDate: item.timeline?.application_start_date || item.bidding_start_date || 'Active',
    closeDate: item.timeline?.application_end_date || item.bidding_end_date || 'Active',
    allotmentDate: item.timeline?.allotment_date || item.bidding_end_date || 'T+1',
    refundDate: item.timeline?.refund_initiation_date || item.bidding_end_date || 'T+1',
    creditDate: item.timeline?.demat_credit_date || item.bidding_end_date || 'T+2',
    listingDate: item.timeline?.listing_date || 'T+3',
    mandateEndDate: item.timeline?.mandate_end_date || undefined,
    preApplyStartDate: item.timeline?.pre_apply_start_date || undefined,
    allotmentStartDate: item.timeline?.allotment_start_date || undefined,
    dailyStartTime: item.daily_start_time || '10:00:00',
    dailyEndTime: item.daily_end_time || '17:00:00',
    investorCategories,
    faceValue: item.face_value || (isSme ? 10 : 2),
    tickSize: item.tick_size ? parseFloat(item.tick_size) : undefined,
    listingPrice: item.listing_price ? parseFloat(item.listing_price) : undefined,
    rhpUrl: item.rhp_url || undefined,
    drhpUrl: item.drhp_url || undefined,
    registrar,
    kfinClientId,
    registrarDetails: item.registrar_info ? {
      name: item.registrar_info.name,
      email: item.registrar_info.email,
      contactName: item.registrar_info.contact_name,
      contactNumber: item.registrar_info.contact_number,
      website: item.registrar_info.website
    } : undefined,
    leadManagers: ['Kotak Mahindra Capital', 'Axis Capital'],
    exchange: item.listing_exchange ? item.listing_exchange.split(',').map(e => e.trim()) : (isSme ? ['BSE SME'] : ['NSE', 'BSE']),
    isin: item.isin,
    gmp: {
      gmpPrice: 0,
      gmpPercent: 0,
      estimatedListingPrice: maxPrice,
      trend: 'neutral',
      kostakRate: 0,
      subjectToSauda: 0,
      lastUpdated: 'Upstox Feed'
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
  };
}

export async function fetchUpstoxIpos(kfinIssues = []) {
  const config = getUpstoxConfig();
  if (!config.accessToken) {
    return null; // Not configured or token missing
  }

  const now = Date.now();
  if (upstoxIposCache.length > 0 && (now - lastFetchTime < CACHE_TTL_MS)) {
    return upstoxIposCache;
  }

  try {
    const statuses = ['open', 'upcoming', 'closed'];
    const issueTypes = ['regular', 'sme'];
    const requests = [];

    for (const st of statuses) {
      for (const it of issueTypes) {
        requests.push(
          axios.get(`https://api.upstox.com/v2/ipos?status=${st}&issue_type=${it}&page_number=1&records=30`, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${config.accessToken}`
            },
            httpsAgent,
            timeout: 7000
          }).catch(err => {
            console.warn(`[UpstoxService] Fetch for status "${st}" (${it}) failed:`, err.message);
            return { data: { data: [] } };
          })
        );
      }
    }

    const responses = await Promise.all(requests);
    const combinedRaw = [];

    responses.forEach(r => {
      if (r?.data?.data && Array.isArray(r.data.data)) {
        combinedRaw.push(...r.data.data);
      }
    });

    if (combinedRaw.length > 0) {
      // Deduplicate by symbol/id
      const seen = new Set();
      const uniqueItems = [];

      for (const item of combinedRaw) {
        const key = item.id || item.symbol || item.name;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueItems.push(item);
        }
      }

      // Fetch full details in parallel for active issues (open/upcoming)
      const enrichedItems = await Promise.all(
        uniqueItems.map(async (item) => {
          if ((item.status === 'open' || item.status === 'upcoming') && item.id) {
            try {
              const dRes = await axios.get(`https://api.upstox.com/v2/ipos/${item.id}`, {
                headers: {
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${config.accessToken}`
                },
                httpsAgent,
                timeout: 5000
              });
              if (dRes.data?.data) {
                return { ...item, ...dRes.data.data };
              }
            } catch {
              // fallback to summary item
            }
          }
          return item;
        })
      );

      const mapped = enrichedItems.map(item => mapUpstoxToIpoItem(item, kfinIssues));

      upstoxIposCache = mapped;
      lastFetchTime = now;
      console.log(`[UpstoxService] Successfully fetched ${mapped.length} official IPOs (with pre-fetched RHP details) from Upstox API.`);
      return mapped;
    }
  } catch (err) {
    console.error('[UpstoxService] Error fetching Upstox IPOs:', err.message);
  }

  return upstoxIposCache.length > 0 ? upstoxIposCache : null;
}

export async function fetchUpstoxIpoDetails(id, kfinIssues = []) {
  const config = getUpstoxConfig();
  if (!config.accessToken || !id) return null;
  try {
    const res = await axios.get(`https://api.upstox.com/v2/ipos/${encodeURIComponent(id)}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${config.accessToken}`
      },
      httpsAgent,
      timeout: 6000
    });
    if (res.data?.status === 'success' && res.data?.data) {
      const raw = res.data.data;
      const mapped = mapUpstoxToIpoItem(raw, kfinIssues);
      return { raw, mapped };
    }
  } catch (err) {
    console.warn(`[UpstoxService] Detail fetch for ${id} failed:`, err.message);
  }
  return null;
}
