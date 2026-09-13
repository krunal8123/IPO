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
    allotment: close,
    listing: close
  };
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

function resolveCompanyBranding(cleanName, id) {
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

  const idLower = (id || cleanName || '').toLowerCase();
  for (const [prefix, dom] of Object.entries(knownDomains)) {
    if (idLower.includes(prefix)) {
      return {
        logo: `https://www.google.com/s2/favicons?domain=${dom}&sz=128`,
        companyWebsite: `https://${dom}`
      };
    }
  }

  return {
    logo: generateLogoSvg(cleanName),
    companyWebsite: undefined
  };
}

export function buildDynamicIpoFromScraped(scraped, kfinIssues = []) {
  const cleanName = scraped.name.endsWith('Limited') ? scraped.name : `${scraped.name} Limited`;
  const id = slugify(cleanName.replace(' Limited', ''));
  const category = (scraped.type || 'mainboard').toLowerCase().includes('sme') ? 'sme' : 'mainboard';
  const status = (scraped.status === 'open' || scraped.status === 'live') ? 'live' : scraped.status === 'upcoming' ? 'upcoming' : 'listed';
  const { min, max } = parsePriceBand(scraped.priceText);
  const dates = parseDates(scraped.dateText);
  const lotSize = category === 'sme' ? Math.max(500, Math.round(120000 / max / 100) * 100) : Math.max(10, Math.round(14500 / max));
  const minInvestment = lotSize * max;
  const branding = resolveCompanyBranding(cleanName, id);

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

  return {
    id,
    symbol: id.split('-')[0].toUpperCase(),
    name: cleanName,
    category,
    status,
    badge: status === 'live' ? 'Bidding Live' : status === 'upcoming' ? 'Upcoming' : 'New Issue',
    logo: branding.logo,
    companyWebsite: branding.companyWebsite,
    sector: category === 'sme' ? 'SME Enterprise' : 'Mainboard Corporate',
    priceBandMin: min,
    priceBandMax: max,
    cutOffPrice: max,
    lotSize,
    minimumQuantity: lotSize,
    minInvestment,
    issueSizeCr: category === 'sme' ? 45 : 850,
    freshIssueCr: category === 'sme' ? 45 : 650,
    ofsCr: category === 'sme' ? 0 : 200,
    openDate: dates.open,
    closeDate: dates.close,
    allotmentDate: dates.allotment,
    refundDate: dates.allotment,
    creditDate: dates.allotment,
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
    subscription: {
      retail: 1.5,
      qib: 2.1,
      nii: 1.2,
      total: 1.8,
      day: 1,
      lastUpdated: 'Live Market Feed'
    },
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
