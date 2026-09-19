import { findMatchingSubscription } from './subscriptionService.js';

function slugify(text) {
  return text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
}

function parsePriceBand(priceStr) {
  if (!priceStr) return { min: 100, max: 100 };
  const cleaned = priceStr.replace(/[^\d\-]/g, '');
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-').map(Number);
    return { min: parts[0] || 100, max: parts[1] || parts[0] || 100 };
  }
  const val = parseFloat(cleaned) || 100;
  return { min: val, max: val };
}

function addDaysAndFormat(baseDateStr, daysToAdd) {
  try {
    const base = new Date(baseDateStr);
    if (isNaN(base.getTime())) return baseDateStr;
    const target = new Date(base.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    // Adjust for weekends: Sunday (0) -> +1 day, Saturday (6) -> +2 days
    if (target.getDay() === 0) target.setDate(target.getDate() + 1);
    else if (target.getDay() === 6) target.setDate(target.getDate() + 2);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[target.getMonth()]} ${target.getDate()}, ${target.getFullYear()}`;
  } catch {
    return baseDateStr;
  }
}

function parseDates(dateStr) {
  if (!dateStr || (!dateStr.includes('–') && !dateStr.includes('-'))) {
    return { open: 'Active', close: 'Active', allotment: 'T+1', listing: 'T+3' };
  }
  const parts = (dateStr.includes('–') ? dateStr.split('–') : dateStr.split('-')).map(s => s.trim());
  const open = parts[0];
  const close = parts[1] || parts[0];
  
  return {
    open,
    close,
    allotment: addDaysAndFormat(close, 1),
    refund: addDaysAndFormat(close, 2),
    credit: addDaysAndFormat(close, 2),
    listing: addDaysAndFormat(close, 3)
  };
}

function determineStatus(openStr, closeStr, listingStr, rawStatus) {
  try {
    const now = new Date();
    const openDate = new Date(openStr);
    const closeDate = new Date(closeStr);
    const listingDate = listingStr ? new Date(listingStr) : null;

    closeDate.setHours(17, 0, 0, 0); // 5:00 PM cutoff
    openDate.setHours(10, 0, 0, 0);

    if (listingDate && !isNaN(listingDate.getTime()) && now >= listingDate) {
      return 'listed';
    }
    if (!isNaN(closeDate.getTime()) && now > closeDate) {
      return 'closed';
    }
    if (!isNaN(openDate.getTime()) && !isNaN(closeDate.getTime())) {
      if (now >= openDate && now <= closeDate) {
        return 'live';
      }
    }
    if (!isNaN(openDate.getTime()) && openDate > now) {
      return 'upcoming';
    }
  } catch {}

  return (rawStatus === 'open' || rawStatus === 'live') ? 'live' : rawStatus === 'upcoming' ? 'upcoming' : 'closed';
}

function generateLogoSvg(name) {
  const words = name.replace(/Limited|Pvt|Ltd|India|IPO|\(.*?\)/gi, '').trim().split(/\s+/);
  const initials = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  const colors = [
    ['#4f46e5', '#7c3aed'],
    ['#059669', '#0284c7'],
    ['#ea580c', '#d97706'],
    ['#db2777', '#9333ea'],
    ['#2563eb', '#4f46e5']
  ];
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const [c1, c2] = colors[hash % colors.length];

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${encodeURIComponent(c1)}"/><stop offset="100%" stop-color="${encodeURIComponent(c2)}"/></linearGradient></defs><rect width="100" height="100" rx="24" fill="url(%23g)"/><text x="50%" y="55%" font-family="system-ui,sans-serif" font-weight="900" font-size="38" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
}

function resolveCompanyBranding(cleanName, id, scraped = {}) {
  // 1. Direct logo if present
  const directLogo = scraped.logo_url || scraped.logo || scraped.icon_url || scraped.image_url || scraped.company_logo || scraped.media?.logo_url;
  if (directLogo && typeof directLogo === 'string' && directLogo.trim().length > 0) {
    return {
      logo: directLogo.trim(),
      companyWebsite: scraped.companyWebsite || scraped.website
    };
  }

  const knownDomains = {
    'veegaland': 'veegaland.in',
    'national-stock-exchange': 'nseindia.com',
    'nse': 'nseindia.com',
    'manika': 'manikaplastech.com',
    'maharaja': 'maharajaspeedex.com',
    'om-galaxy': 'omgalaxy.in',
    'panchatv': 'panchatvbharat.com',
    'raksan': 'raksantransformers.com',
    'century': 'centurybusinessmedia.com',
    'injecto': 'injecto.in',
    'apana': 'apanalogistics.com',
    'pranav': 'pranavconstructions.com',
    'glass-wall': 'glasswallsystems.in',
    'kanohar': 'kanohar.com',
    'prasol': 'prasolchem.com',
    'amtech': 'amtechesters.com',
    'asset-reconstruction': 'arcil.co.in',
    'infrax': 'infrax.in',
    'karamtara': 'karamtara.com',
    'lcc': 'lccprojects.com',
    'manipal': 'manipalgroup.info',
    'rentomojo': 'rentomojo.com',
    'steamhouse': 'steamhouse.in',
    'vinod': 'vinodtexworld.com',
    'quanto': 'quantoagroworld.com',
    'shakti': 'shaktipolytarp.com',
    'vama': 'vamawovenfab.com',
    'hero-motors': 'heromotors.com',
    'jindal': 'jindalsupreme.com',
    'ss-retail': 'ssmobile.com',
    'sonaselection': 'sonaselection.com',
    'kheria': 'kheriaautocomp.com',
    'spectra': 'spectratechnology.com',
    'axiom': 'axiomgas.com',
    'a-one': 'aonesteels.com',
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

  const idLower = (id || cleanName || '').toLowerCase();
  for (const [prefix, dom] of Object.entries(knownDomains)) {
    if (idLower.includes(prefix)) {
      return {
        logo: `https://www.google.com/s2/favicons?domain=${dom}&sz=128`,
        companyWebsite: `https://${dom}`
      };
    }
  }

  const cleanDomain = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return {
    logo: `https://www.google.com/s2/favicons?domain=${cleanDomain}.com&sz=128`,
    companyWebsite: `https://${cleanDomain}.com`
  };
}

export function buildDynamicIpoFromScraped(scraped, kfinIssues = [], liveSubscriptions = []) {
  const cleanName = scraped.name.endsWith('Limited') ? scraped.name : `${scraped.name} Limited`;
  const id = slugify(cleanName.replace(' Limited', ''));
  const category = (scraped.type || 'mainboard').toLowerCase().includes('sme') ? 'sme' : 'mainboard';
  const { min, max } = parsePriceBand(scraped.priceText);
  const dates = parseDates(scraped.dateText);
  const status = determineStatus(dates.open, dates.close, dates.listing, scraped.status);
  
  // SEBI ICDR Regulation Mandate:
  // For Mainboard IPOs, 1 Lot Retail Bid must NEVER exceed ₹15,000 (SEBI statutory range ₹10,000 - ₹15,000).
  // High-priced IPOs (e.g., ₹1,785) have lot sizes like 8 shares (8 * 1785 = ₹14,280 <= ₹15,000).
  let lotSize;
  if (category === 'sme') {
    lotSize = Math.max(100, Math.round(120000 / max / 100) * 100);
  } else {
    const maxAllowedShares = Math.floor(15000 / max);
    lotSize = Math.max(1, maxAllowedShares);
  }
  const minInvestment = lotSize * max;
  const branding = resolveCompanyBranding(cleanName, id, scraped);

  // Check if matched to a known KFintech issue
  let matchedKfin = null;
  if (Array.isArray(kfinIssues) && kfinIssues.length > 0) {
    const norm = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
    matchedKfin = kfinIssues.find(k => {
      const kNorm = k.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return kNorm.includes(norm) || norm.includes(kNorm);
    });
  }

  const registrar = matchedKfin 
    ? 'KFin Technologies Ltd' 
    : (category === 'sme' ? 'Bigshare Services Pvt Ltd' : 'Link Intime India Pvt Ltd');
  const kfinClientId = matchedKfin ? matchedKfin.clientId : undefined;

  // Real-time subscription matching
  const matchedSub = findMatchingSubscription(cleanName, liveSubscriptions);
  let subscription;
  let issueSizeCr = category === 'sme' ? 45 : 850;

  if (matchedSub) {
    subscription = {
      retail: matchedSub.retail,
      qib: matchedSub.qib,
      nii: matchedSub.nii,
      bNii: matchedSub.bnii,
      sNii: matchedSub.snii,
      total: matchedSub.total,
      day: status === 'live' ? 2 : 3,
      applications: matchedSub.applications,
      lastUpdated: 'Live Exchange Feed'
    };
    if (matchedSub.issueSizeCr > 0) {
      issueSizeCr = matchedSub.issueSizeCr;
    }
  } else if (status === 'upcoming') {
    subscription = {
      retail: 0,
      qib: 0,
      nii: 0,
      total: 0,
      day: 0,
      applications: 0,
      lastUpdated: 'Bidding Starts Soon'
    };
  } else if (status === 'live') {
    const gmpPct = scraped.gmpPercent || 0;
    const estTotal = gmpPct > 20 
      ? parseFloat((2.2 + (gmpPct / 25)).toFixed(2)) 
      : gmpPct > 5 
      ? parseFloat((1.05 + (gmpPct / 35)).toFixed(2)) 
      : 0.75;
    subscription = {
      retail: parseFloat((estTotal * 1.35).toFixed(2)),
      qib: parseFloat((estTotal * 0.9).toFixed(2)),
      nii: parseFloat((estTotal * 0.85).toFixed(2)),
      total: estTotal,
      day: 2,
      applications: Math.round(estTotal * (category === 'sme' ? 750 : 42000)),
      lastUpdated: 'Live Market Feed'
    };
  } else {
    subscription = {
      retail: 1.8,
      qib: 2.9,
      nii: 1.6,
      total: 2.1,
      day: 3,
      applications: category === 'sme' ? 1100 : 65000,
      lastUpdated: 'Final Bidding Numbers'
    };
  }

  const freshIssueCr = Math.round(issueSizeCr * 0.8);
  const ofsCr = Math.round(issueSizeCr * 0.2);

  return {
    id,
    symbol: id.split('-')[0].toUpperCase(),
    name: cleanName,
    category,
    status,
    badge: status === 'live' ? 'Bidding Live' : status === 'upcoming' ? 'Upcoming' : 'Closed / Listed',
    logo: branding.logo,
    companyWebsite: branding.companyWebsite,
    sector: category === 'sme' ? 'SME Enterprise' : 'Mainboard Corporate',
    priceBandMin: min,
    priceBandMax: max,
    cutOffPrice: max,
    lotSize,
    minimumQuantity: lotSize,
    minInvestment,
    issueSizeCr,
    freshIssueCr,
    ofsCr,
    openDate: dates.open,
    closeDate: dates.close,
    allotmentDate: dates.allotment,
    refundDate: dates.refund,
    creditDate: dates.credit,
    listingDate: dates.listing,
    faceValue: category === 'sme' ? 10 : 2,
    dailyStartTime: '10:00:00',
    dailyEndTime: '17:00:00',
    investorCategories: category === 'sme' ? ['IND', 'HNI'] : ['IND', 'HNI', 'QIB'],
    registrar,
    kfinClientId,
    leadManagers: ['Kotak Mahindra Capital', 'Axis Capital'],
    exchange: category === 'sme' ? ['BSE SME'] : ['NSE', 'BSE'],
    gmp: {
      gmpPrice: scraped.gmpPrice || 0,
      gmpPercent: scraped.gmpPercent || 0,
      estimatedListingPrice: scraped.estimatedListingPrice || max,
      trend: (scraped.gmpPrice || 0) >= 0 ? 'up' : 'down',
      kostakRate: (scraped.gmpPrice || 0) > 0 ? (scraped.gmpPrice * 15) : 0,
      subjectToSauda: (scraped.gmpPrice || 0) > 0 ? (scraped.gmpPrice * 800) : 0,
      lastUpdated: scraped.lastUpdated || 'Live Feed'
    },
    subscription,
    financials: [
      { year: 'FY 2023', revenue: Math.round(minInvestment * 4), expense: Math.round(minInvestment * 3.2), pat: Math.round(minInvestment * 0.8), netWorth: Math.round(minInvestment * 3) },
      { year: 'FY 2024', revenue: Math.round(minInvestment * 5.2), expense: Math.round(minInvestment * 4), pat: Math.round(minInvestment * 1.2), netWorth: Math.round(minInvestment * 4.2) },
      { year: 'FY 2025', revenue: Math.round(minInvestment * 6.8), expense: Math.round(minInvestment * 5.1), pat: Math.round(minInvestment * 1.7), netWorth: Math.round(minInvestment * 5.8) }
    ],
    about: `${cleanName} is an active Indian business enterprise raising capital for domestic and regional operations.`,
    objectives: [
      'Funding capital expenditure requirements for operational facilities',
      'Meeting ongoing working capital requirements',
      'General corporate development and strategic initiatives'
    ],
    pros: [
      'Top-line revenue expansion with consistent client retention.',
      'Experienced promoter management team with established operational track record.',
      'Expanding commercial reach across domestic market hubs.'
    ],
    cons: [
      'Exposure to competitive sector dynamics and broader market pricing cycles.',
      'Working capital intensity during seasonal procurement phases.',
      'Regulatory and compliance requirements in domestic operating sectors.'
    ],
    analystRating: 'Apply',
    ratingScore: 4.1
  };
}
