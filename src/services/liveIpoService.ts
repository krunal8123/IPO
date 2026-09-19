import { Capacitor } from '@capacitor/core';
import { IpoItem, AllotmentResult, KfinIssue, MufgIssue, BigshareIssue, IpoStatus } from '../types/ipo';

export const DEFAULT_SERVER = 'https://ipo-wire.onrender.com';
export const DEFAULT_LAN_SERVER = 'http://10.202.144.96:5001';

export function getApiBaseUrl(): string {
  // 1. User manual override stored in localStorage
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('iporadar_api_url');
    if (custom && custom.trim()) {
      const clean = custom.trim().replace(/\/+$/, '');
      return clean.endsWith('/api') ? clean : `${clean}/api`;
    }
  }

  // 2. Build-time env
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  // 3. Detect if running inside native Android/iOS Capacitor WebView
  if (typeof window !== 'undefined') {
    const isCapacitorNative = 
      Capacitor.isNativePlatform() ||
      !!(window as any).Capacitor?.isNativePlatform?.() ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:' ||
      (!window.location.port && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));

    if (isCapacitorNative) {
      return `${DEFAULT_SERVER}/api`;
    }
  }

  return '/api';
}

export function setCustomServerHost(hostUrl: string): void {
  if (typeof window !== 'undefined') {
    if (!hostUrl || !hostUrl.trim()) {
      localStorage.removeItem('iporadar_api_url');
    } else {
      localStorage.setItem('iporadar_api_url', hostUrl.trim());
    }
  }
}

export function getCustomServerHost(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('iporadar_api_url') || DEFAULT_SERVER;
  }
  return DEFAULT_SERVER;
}

export async function testServerHost(hostUrl: string): Promise<boolean> {
  try {
    const clean = hostUrl.trim().replace(/\/+$/, '');
    const url = clean.endsWith('/api') ? `${clean}/health` : `${clean}/api/health`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export interface LiveFetchResult {
  ipos: IpoItem[];
  isLive: boolean;
  timestamp: string;
  source: string;
}

const BASELINE_MUFG_ISSUES: MufgIssue[] = [
  { clientId: '11932', name: 'Glass Wall Systems (India) Limited - IPO' },
  { clientId: '11931', name: 'Kanohar Electricals Limited - IPO' },
  { clientId: '11930', name: 'Qualiance International Limited - SME IPO' },
  { clientId: '11929', name: 'Phychem Technologies Limited - SME IPO' },
  { clientId: '11927', name: 'ESDS Software Solution Limited - IPO' }
];

const BASELINE_BIGSHARE_ISSUES: BigshareIssue[] = [
  { companyId: '596', name: 'RAKSAN TRANSFORMERS LIMITED' },
  { companyId: '597', name: 'OM GALAXY LIMITED' },
  { companyId: '595', name: 'INFRAX RENEWABLE LIMITED' },
  { companyId: '9048', name: 'DEEPA JEWELLERS LIMITED' },
  { companyId: '9047', name: 'LUMINO INDUSTRIES LIMITED' }
];

const BASELINE_KFIN_ISSUES: KfinIssue[] = [
  { clientId: '75003530500', name: 'PRASOL CHEMICALS LIMITED' },
  { clientId: '95527153360', name: 'KLM AXIVA FINVEST LIMITED NCD14 AUGUST 2026' },
  { clientId: '58129803280', name: 'PRANAV CONSTRUCTIONS LIMITED' },
  { clientId: '33631182620', name: 'APANA LOGISTICS LIMITED' },
  { clientId: '40580036070', name: 'FLY HI MARITIME TRAVELS LIMITED' },
  { clientId: '60121009540', name: 'RAYS OF BELIEF LIMITED' },
  { clientId: '34024394990', name: 'ASHUTOSH FIBRE LIMITED SME' },
  { clientId: '64793825640', name: 'ASHUTOSH FIBRE LIMITED' },
  { clientId: '85357713080', name: 'SHANTI INORGANICS LIMITED' },
  { clientId: '95989183810', name: 'PURPLE STYLE LABS LIMITED' },
  { clientId: '63488567220', name: 'ANNU PROJECTS LIMITED' },
  { clientId: '29984512460', name: 'SUMAX ENGINEERING LIMITED' },
  { clientId: '61328680581', name: 'TEMPSENS INSTRUMENTS (INDIA) LIMITED' },
  { clientId: '54923077460', name: 'SHANKESH JEWELLERS LIMITED' },
  { clientId: '52457887480', name: 'HORIZON INDUSTRIAL PARKS LIMITED' },
  { clientId: '58583640510', name: 'CHEMMANUR CREDITS AND INVESTMENTS LIMITED AUGUST2026' },
  { clientId: '12562536840', name: 'CREDENT CONNECT N CARE LIMITED' },
  { clientId: '86153103110', name: 'SHIPROCKET LIMITED' },
  { clientId: '29849673370', name: 'MILKY MIST DAIRY FOOD LIMITED' },
  { clientId: '81387868980', name: 'MOLBIO DIAGNOSTICS LIMITED' },
  { clientId: '94818267561', name: 'DHOOT TRANSMISSION LIMITED' },
  { clientId: '62198153830', name: 'ARDEE INDUSTRIES LIMITED' },
  { clientId: '44065980180', name: 'MV ELECTROSYSTEMS LIMITED' },
  { clientId: '53707331280', name: 'JUNIPER GREEN ENERGY LIMITED' },
  { clientId: '67709372110', name: 'DHAVAL PACKAGING LIMITED' },
  { clientId: '43836057990', name: 'MANIPAL HEALTH ENTERPRISES LIMITED' },
  { clientId: '42817695520', name: 'ADVANCE TECHNOFORG LIMITED' },
  { clientId: '55385908200', name: 'CUBE HIGHWAYS TRUST - INVIT' },
  { clientId: '94419360500', name: 'XTRANET TECHNOLOGIES LIMITED' },
  { clientId: '63734978420', name: 'SHREE BALAJI MALA TEXTILES LIMITED' },
  { clientId: '19193086920', name: 'GULF LLOYDS INDIA LIMITED' },
  { clientId: '89605487720', name: 'CALIBER MINING AND LOGISTICS LIMITED IPO' },
  { clientId: '89468061991', name: 'SBI FUNDS MANAGMENT LIMITED IPO' },
  { clientId: '41422222050', name: 'ALPINE TEXWORLD LIMITED IPO' },
  { clientId: '73206134640', name: 'KRATIKAL TECH LIMITED SME' },
  { clientId: '17643901490', name: 'TEJA ENGINEERING INDUSTRIES LIMITED SME IPO' },
  { clientId: '65065971040', name: 'ADON AGRO COMMODITIES LIMITED SME IPO' },
  { clientId: '39751101520', name: 'CRAZY SNACKS LIMITED SME IPO' },
  { clientId: '89075375160', name: 'CSM TECHNOLOGIES LIMITED IPO' },
  { clientId: '10609640970', name: 'TURTLEMINT FINTECH SOLUTIONS LIMITED IPO' },
  { clientId: '82984397570', name: 'CLAY CRAFT INDIA LIMITED SME IPO' },
  { clientId: '41208427340', name: 'LIOTECH INDUSTRIES LIMITED SME IPO' },
  { clientId: '34105687640', name: 'HORIZON RECLAIM INDIA LIMITED' },
  { clientId: '70806992450', name: 'HEXAGON NUTRITION LIMITED' },
  { clientId: '28962929970', name: 'VAHH CHEMICALS LIMITED' },
  { clientId: '65310715440', name: 'CMR GREEN TECHNOLOGIES LIMITED' },
  { clientId: '53483362510', name: 'TEAMTECH FORMWORK SOLUTIONS LIMITED' },
  { clientId: '26859517830', name: 'RFBL FLEXI PACK LIMITED' },
  { clientId: '28267215520', name: 'BAGMANE PRIME OFFICE REIT' },
  { clientId: '34561715130', name: 'VALUE 360 COMMUNICATIONS LIMITED' },
  { clientId: '54450217260', name: 'ONEMI TECHNOLOGY SOLUTIONS LIMITED' },
  { clientId: '92634312570', name: 'ADISOFT TECHNOLOGIES LIMITED' },
  { clientId: '73146088770', name: 'CITIUS TRANSNET INVESTMENT TRUST' },
  { clientId: '80184898770', name: 'MEHUL TELECOM LIMITED' },
  { clientId: '51817446680', name: 'PROPSHARE CELESTIA SM REIT 2026' }
];

export function getRegistrarUrl(registrarName: string = ''): string {
  const name = (registrarName || '').toLowerCase();
  if (name.includes('link intime') || name.includes('linkintime')) {
    return 'https://linkintime.co.in/initial_offer/public-issues.html';
  }
  if (name.includes('kfin') || name.includes('karvy')) {
    return 'https://ipostatus.kfintech.com/';
  }
  if (name.includes('bigshare')) {
    return 'https://ipo.bigshareonline.com/';
  }
  if (name.includes('skyline')) {
    return 'https://www.skylinerta.com/ipo.php';
  }
  if (name.includes('cameo')) {
    return 'https://ipo.cameoindia.com/';
  }
  if (name.includes('maashitla')) {
    return 'https://maashitla.com/allotment-status/';
  }
  if (name.includes('purva')) {
    return 'https://www.purvashare.com/queries/';
  }
  return 'https://linkintime.co.in/initial_offer/public-issues.html';
}

async function queryKfinDirectFromBrowser(
  clientId: string, 
  queryType: 'pan' | 'appNo' | 'dpId', 
  queryValue: string, 
  ipoName: string,
  lotSize: number = 100,
  priceBandMax: number = 140
): Promise<AllotmentResult | null> {
  try {
    const kfinType = queryType === 'appNo' ? 'appno' : queryType === 'dpId' ? 'dpclid' : 'pan';
    const apiUrl = `https://0uz601ms56.execute-api.ap-south-1.amazonaws.com/prod/api/query?type=${kfinType}`;

    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'reqparam': queryValue.trim().toUpperCase(),
        'client_id': `${clientId}`
      }
    });

    if (res.status === 200) {
      const data = await res.json();
      const records = Array.isArray(data) 
        ? data 
        : (Array.isArray(data?.data) ? data.data : (data ? [data] : []));
      if (records.length > 0 && (records[0].Appln_No || records[0].Pan_No)) {
        const rec = records[0];
        const sharesApplied = parseInt(rec.App_Shares) || lotSize || 100;
        const sharesAllotted = parseInt(rec.All_Shares) || 0;
        const totalAmount = sharesApplied * (priceBandMax || 140);
        const isAllotted = sharesAllotted > 0;

        return {
          ipoId: clientId,
          ipoName: ipoName || rec.ipoTitle || 'IPO Issue',
          applicantName: rec.Name || 'Investor',
          pan: rec.Pan_No || queryValue,
          applicationNo: rec.Appln_No,
          dpId: rec.DP_CLID || 'N/A',
          sharesApplied,
          sharesAllotted,
          status: isAllotted ? 'Allotted' : 'Not Allotted',
          refundAmount: isAllotted ? 0 : totalAmount,
          message: isAllotted
            ? `Congratulations! ${sharesAllotted} shares have been allotted to ${rec.Name || 'you'} (Application #${rec.Appln_No}). Shares will be credited to your Demat account prior to listing.`
            : `Your application #${rec.Appln_No} for ${sharesApplied} shares was registered with KFintech, but was not selected in the computerized basis of allotment draw. Your blocked bank UPI mandate of ₹${totalAmount.toLocaleString('en-IN')} has been unblocked/refunded.`,
          registrar: 'KFin Technologies Ltd',
          registrarPortalUrl: 'https://ipostatus.kfintech.com/'
        };
      }
    }

    if (res.status === 404) {
      return {
        ipoId: clientId,
        ipoName,
        applicantName: 'N/A',
        pan: queryType === 'pan' ? queryValue : 'N/A',
        applicationNo: queryType === 'appNo' ? queryValue : 'N/A',
        dpId: queryType === 'dpId' ? queryValue : 'N/A',
        sharesApplied: 0,
        sharesAllotted: 0,
        status: 'Not Found',
        refundAmount: 0,
        message: `No application record found for ${queryType === 'pan' ? 'PAN' : 'identifier'} "${queryValue}" in ${ipoName} on KFintech. If you applied via broker, please verify that your bid was submitted before cutoff or check directly on KFintech.`,
        registrar: 'KFin Technologies Ltd',
        registrarPortalUrl: 'https://ipostatus.kfintech.com/'
      };
    }
  } catch (err) {
    console.warn('[LiveService] Direct browser query to KFintech failed:', err);
  }
  return null;
}

async function evaluateLocalAllotment(
  ipoId: string, 
  queryType: 'pan' | 'appNo' | 'dpId', 
  queryValue: string, 
  ipoList: IpoItem[] = [],
  kfinClientId?: string,
  ipoNameParam?: string,
  mufgClientId?: string,
  bigshareCompanyId?: string
): Promise<AllotmentResult> {
  const query = (queryValue || '').trim().toUpperCase();

  // 1. Check direct match in ipoList
  let ipo = ipoList.find(i => i.id === ipoId);

  // 2. If not found in ipoList, check by name if ipoNameParam provided
  if (!ipo && ipoNameParam) {
    const cleanParam = ipoNameParam.toLowerCase().replace(/[^a-z0-9]/g, '');
    ipo = ipoList.find(i => {
      const clean = i.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return clean.includes(cleanParam) || cleanParam.includes(clean);
    });
  }

  // 3. MUFG Issue matching
  const mufgId = mufgClientId || (/^\d+$/.test(ipoId) && BASELINE_MUFG_ISSUES.some(m => m.clientId === ipoId) ? ipoId : null);
  const mufgIssue = mufgId ? BASELINE_MUFG_ISSUES.find(m => m.clientId === mufgId) : null;

  // 4. KFintech Issue matching
  const kfinId = kfinClientId || (/^\d+$/.test(ipoId) && BASELINE_KFIN_ISSUES.some(k => k.clientId === ipoId) ? ipoId : null);
  const kfinIssue = kfinId ? BASELINE_KFIN_ISSUES.find(k => k.clientId === kfinId) : null;

  // 5. Bigshare Issue matching
  const bigshareId = bigshareCompanyId || (/^\d+$/.test(ipoId) && BASELINE_BIGSHARE_ISSUES.some(b => b.companyId === ipoId) ? ipoId : null);
  const bigshareIssue = bigshareId ? BASELINE_BIGSHARE_ISSUES.find(b => b.companyId === bigshareId) : null;

  // Final extracted metadata - NEVER fall back to ipoList[0]!
  const ipoName = ipoNameParam || mufgIssue?.name || kfinIssue?.name || bigshareIssue?.name || ipo?.name || 'IPO Issue';
  const registrar = mufgIssue || mufgId 
    ? 'MUFG Intime India Pvt Ltd' 
    : kfinIssue || kfinId 
      ? 'KFin Technologies Ltd' 
      : bigshareIssue || bigshareId
        ? 'Bigshare Services Pvt Ltd'
        : (ipo?.registrar || 'Link Intime India Pvt Ltd');
  const regUrl = getRegistrarUrl(registrar);
  const lotSize = ipo?.lotSize || 100;
  const priceBandMax = ipo?.priceBandMax || 140;
  const effectiveId = ipo?.id || ipoId;
  const finalizedDate = ipo?.allotmentDate || 'Declared';

  if (ipo?.status === 'upcoming') {
    return {
      ipoId: effectiveId,
      ipoName,
      applicantName: 'N/A',
      pan: queryType === 'pan' ? query : 'N/A',
      applicationNo: queryType === 'appNo' ? query : 'N/A',
      dpId: queryType === 'dpId' ? query : 'N/A',
      sharesApplied: 0,
      sharesAllotted: 0,
      status: 'Under Process',
      refundAmount: 0,
      message: `Allotment has NOT started. Bidding for ${ipoName} opens on ${ipo.openDate}. Allotment will be declared by ${registrar} on ${finalizedDate}.`,
      registrar,
      finalizedDate,
      registrarPortalUrl: regUrl
    };
  }

  if (ipo?.status === 'live') {
    return {
      ipoId: effectiveId,
      ipoName,
      applicantName: 'N/A',
      pan: queryType === 'pan' ? query : 'N/A',
      applicationNo: queryType === 'appNo' ? query : 'N/A',
      dpId: queryType === 'dpId' ? query : 'N/A',
      sharesApplied: 0,
      sharesAllotted: 0,
      status: 'Under Process',
      refundAmount: 0,
      message: `Bidding for ${ipoName} is currently LIVE until ${ipo.closeDate}. The registrar (${registrar}) will finalize the basis of allotment on ${finalizedDate}. Please check back once declared.`,
      registrar,
      finalizedDate,
      registrarPortalUrl: regUrl
    };
  }

  // Demo simulation samples
  const isDemoAllotted = query === 'ALLOT1234F' || query === 'WINNR1234A' || query.includes('WIN');
  const isDemoNonAllotted = query === 'NONAL1234F' || query.includes('NONAL') || query.includes('DEMOREG');

  if (isDemoAllotted) {
    return {
      ipoId: effectiveId,
      ipoName,
      applicantName: 'VERIFIED INVESTOR (ALLOTTEE)',
      pan: queryType === 'pan' ? query : 'N/A',
      applicationNo: `2026${Math.floor(100000 + Math.random() * 900000)}`,
      dpId: `IN300126-${Math.floor(10000000 + Math.random() * 90000000)}`,
      sharesApplied: lotSize,
      sharesAllotted: lotSize,
      status: 'Allotted',
      refundAmount: 0,
      message: `Congratulations! Your bid was successfully selected in the registrar basis of allotment for ${ipoName}. ${lotSize} shares at ₹${priceBandMax} have been allocated and will be credited to your Demat account prior to listing.`,
      registrar,
      finalizedDate,
      registrarPortalUrl: regUrl
    };
  }

  if (isDemoNonAllotted) {
    const totalAmount = lotSize * priceBandMax;
    return {
      ipoId: effectiveId,
      ipoName,
      applicantName: 'REGISTERED BIDDER (NON-ALLOTTEE)',
      pan: queryType === 'pan' ? query : 'N/A',
      applicationNo: `2026${Math.floor(100000 + Math.random() * 900000)}`,
      dpId: `IN300126-${Math.floor(10000000 + Math.random() * 90000000)}`,
      sharesApplied: lotSize,
      sharesAllotted: 0,
      status: 'Not Allotted',
      refundAmount: totalAmount,
      message: `Your application was registered with ${registrar} for ${ipoName}, but due to heavy oversubscription, it was not selected in the computerized lottery draw. Your blocked bank UPI mandate of ₹${totalAmount.toLocaleString('en-IN')} has been unblocked/refunded.`,
      registrar,
      finalizedDate,
      registrarPortalUrl: regUrl
    };
  }

  // Attempt direct browser query if it's KFintech
  if (kfinId) {
    const browserResult = await queryKfinDirectFromBrowser(kfinId, queryType, query, ipoName, lotSize, priceBandMax);
    if (browserResult) {
      return browserResult;
    }
  }

  // Official portal notice for declared allotment
  return {
    ipoId: effectiveId,
    ipoName,
    applicantName: 'N/A',
    pan: queryType === 'pan' ? query : 'N/A',
    applicationNo: queryType === 'appNo' ? query : 'N/A',
    dpId: queryType === 'dpId' ? query : 'N/A',
    sharesApplied: 0,
    sharesAllotted: 0,
    status: 'Not Found',
    refundAmount: 0,
    message: `${registrar} has declared allotment for ${ipoName}. Click the button below to verify your PAN (${query}) directly on the official ${registrar} portal.`,
    registrar,
    finalizedDate,
    registrarPortalUrl: regUrl
  };
}

function parseDateBoundary(dateStr?: string, defaultHour: number = 0, defaultMin: number = 0): Date | null {
  if (!dateStr || dateStr === 'Active' || dateStr.includes('T+') || dateStr === 'N/A') return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  d.setHours(defaultHour, defaultMin, 0, 0);
  return d;
}

/**
 * Dynamically computes an IPO's status based on real current date & time:
 * - If listingDate <= now -> 'listed'
 * - If closeDate < now (after 17:00 IST cutoff) -> 'closed'
 * - If openDate <= now <= closeDate -> 'live' (Bidding Live)
 * - If openDate > now -> 'upcoming'
 */
export function evaluateIpoStatus(
  openStr?: string,
  closeStr?: string,
  listingStr?: string,
  dailyEndTime?: string,
  rawStatus?: string
): { status: IpoStatus; badge: string } {
  const now = new Date();
  const openDate = parseDateBoundary(openStr, 10, 0);

  let closeH = 17, closeM = 0;
  if (dailyEndTime) {
    const parts = dailyEndTime.split(':').map(Number);
    if (!isNaN(parts[0])) closeH = parts[0];
    if (!isNaN(parts[1])) closeM = parts[1];
  }
  const closeDate = parseDateBoundary(closeStr, closeH, closeM);
  const listingDate = parseDateBoundary(listingStr, 10, 0);

  if (listingDate && now >= listingDate) {
    return { status: 'listed', badge: 'Listed' };
  }
  if (closeDate && now > closeDate) {
    return { status: 'closed', badge: 'Closed / Allotment' };
  }
  if (openDate && closeDate && now >= openDate && now <= closeDate) {
    return { status: 'live', badge: 'Bidding Live' };
  }
  if (openDate && now < openDate) {
    return { status: 'upcoming', badge: 'Upcoming' };
  }

  const fallback = (rawStatus === 'open' || rawStatus === 'live') ? 'live' : rawStatus === 'upcoming' ? 'upcoming' : 'closed';
  return {
    status: fallback as IpoStatus,
    badge: fallback === 'live' ? 'Bidding Live' : fallback === 'upcoming' ? 'Upcoming' : 'Closed'
  };
}

/**
 * Normalizes and validates IPO data in accordance with statutory regulations:
 * 1. SEBI ICDR Regulation Mandate: For Mainboard IPOs, 1 Lot Retail Bid MUST NOT exceed ₹15,000.
 *    Statutory retail application size is strictly between ₹10,000 and ₹15,000.
 *    If lotSize * priceBandMax > 15,000, lotSize is automatically clamped to Math.floor(15000 / price).
 * 2. Synchronizes minInvestment = lotSize * priceBandMax.
 * 3. Dynamically re-evaluates bidding status against current date/time.
 */
export function sanitizeIpoData(ipo: IpoItem): IpoItem {
  if (!ipo) return ipo;
  const isSme = ipo.category === 'sme';
  const price = ipo.priceBandMax || ipo.cutOffPrice || ipo.priceBandMin || 100;
  let lot = ipo.lotSize;

  if (!isSme && price > 0) {
    const maxAllowedLot = Math.max(1, Math.floor(15000 / price));
    // If lot is invalid, or if 1 lot retail bid exceeds the SEBI ₹15,000 threshold
    if (!lot || lot <= 0 || (lot * price > 15000)) {
      lot = maxAllowedLot;
    }
  }

  const minInvestment = lot * price;
  const minQty = (!isSme && ipo.minimumQuantity && ipo.minimumQuantity * price > 15000)
    ? lot
    : (ipo.minimumQuantity || lot);

  const { status, badge } = evaluateIpoStatus(
    ipo.openDate,
    ipo.closeDate,
    ipo.listingDate,
    ipo.dailyEndTime,
    ipo.status
  );

  return {
    ...ipo,
    lotSize: lot,
    minInvestment,
    minimumQuantity: minQty,
    status,
    badge
  };
}

export const liveIpoService = {
  // Fetch real-time IPOs directly from backend API / Upstox API
  async getLiveIpos(): Promise<LiveFetchResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(`${getApiBaseUrl()}/ipos`, { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return {
            ipos: json.data.map(sanitizeIpoData),
            isLive: true,
            timestamp: new Date(json.timestamp || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            source: json.source || 'Upstox Live API'
          };
        }
      }
    } catch (err) {
      console.warn('[LiveService] Backend API unreachable:', err);
    }

    return {
      ipos: [],
      isLive: false,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      source: 'Direct API Disconnected'
    };
  },

  // Fetch all active KFintech issues directly from backend API
  async getKfinIssues(): Promise<KfinIssue[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${getApiBaseUrl()}/allotment/kfin-issues`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {
      // Fall through
    }
    return BASELINE_KFIN_ISSUES;
  },

  // Fetch all active MUFG Intime issues directly from backend API
  async getMufgIssues(): Promise<MufgIssue[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${getApiBaseUrl()}/allotment/mufg-issues`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {
      // Fall through
    }
    return BASELINE_MUFG_ISSUES;
  },

  // Fetch all active Bigshare issues directly from backend API
  async getBigshareIssues(): Promise<BigshareIssue[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${getApiBaseUrl()}/allotment/bigshare-issues`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {
      // Fall through
    }
    return BASELINE_BIGSHARE_ISSUES;
  },

  // Fetch fresh Bigshare CAPTCHA challenge
  async getBigshareCaptcha(): Promise<{ token: string; image: string } | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${getApiBaseUrl()}/allotment/bigshare-captcha`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.token && json.image) {
          return { token: json.token, image: json.image };
        }
      }
    } catch (e) {
      console.warn('[LiveService] Failed to fetch Bigshare CAPTCHA:', e);
    }
    return null;
  },

  // Live registrar allotment check
  async checkAllotment(
    ipoId: string, 
    queryType: 'pan' | 'appNo' | 'dpId', 
    queryValue: string, 
    ipoList: IpoItem[] = [],
    kfinClientId?: string,
    ipoName?: string,
    mufgClientId?: string,
    bigshareCompanyId?: string,
    captchaToken?: string,
    captchaAnswer?: string
  ): Promise<AllotmentResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${getApiBaseUrl()}/allotment/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipoId, queryType, queryValue, kfinClientId, mufgClientId, bigshareCompanyId, captchaToken, captchaAnswer, ipoName }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[LiveService] Backend allotment endpoint unreachable, running browser registrar engine');
    }

    return evaluateLocalAllotment(ipoId, queryType, queryValue, ipoList, kfinClientId, ipoName, mufgClientId, bigshareCompanyId);
  },

  // Health check
  async checkServerHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/health`, { signal: AbortSignal.timeout(2500) });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Fetch full details for a single IPO from Upstox get-ipo-details endpoint
  async fetchIpoDetail(id: string): Promise<IpoItem | null> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/ipos/${encodeURIComponent(id)}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return sanitizeIpoData(json.data);
        }
      }
    } catch (e) {
      console.warn(`[LiveIpoService] Could not fetch detailed IPO from server for ${id}:`, e);
    }
    return null;
  },

  // Check Upstox API credentials status
  async getUpstoxStatus(): Promise<{ success: boolean; hasAccessToken: boolean; hasApiKey: boolean; hasApiSecret: boolean; source: string }> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/upstox/status`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return await res.json();
    } catch {}
    return { success: false, hasAccessToken: false, hasApiKey: false, hasApiSecret: false, source: 'Offline' };
  },

  // Save Upstox credentials to backend
  async saveUpstoxCredentials(creds: { accessToken?: string; apiKey?: string; apiSecret?: string }): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/upstox/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
        signal: AbortSignal.timeout(4000)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Fetch live buyback data from backend API
  async fetchBuybacks(): Promise<import('../types/ipo').BuybackItem[]> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/buybacks`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(7000)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('[LiveService] Buyback fetch failed:', err);
    }
    return [];
  }
};
