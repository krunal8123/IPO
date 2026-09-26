import { Capacitor } from '@capacitor/core';
import { IpoItem, AllotmentResult, KfinIssue, MufgIssue, BigshareIssue, IpoStatus, BigshareServerId, BigshareServerInfo } from '../types/ipo';
import {
  getStoredUpstoxToken,
  setStoredUpstoxToken,
  getStoredUpstoxApiKey,
  setStoredUpstoxApiKey,
  fetchUpstoxDirectIpos,
  getCachedUpstoxIpos,
  setCachedUpstoxIpos,
  testUpstoxToken
} from './upstoxDirectService';

export const DEFAULT_LAN_SERVER = 'http://10.202.144.96:5001';

// GitHub Pages CDN base — always has the latest scraped JSON baked by GitHub Actions
const GITHUB_PAGES_BASE = 'https://krunal8123.github.io/IPO';

// Fetch fresh data from the GitHub Pages CDN (cache-busted). Returns null on failure.
async function fetchFromGithubPages(filename: string): Promise<{ json: unknown } | null> {
  try {
    const url = `${GITHUB_PAGES_BASE}/data/${filename}?t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && contentType.includes('text/html')) return null;
    const json = await res.json();
    return { json };
  } catch {
    return null;
  }
}

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

  // 3. Localhost dev server
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api';
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
    return localStorage.getItem('iporadar_api_url') || DEFAULT_LAN_SERVER;
  }
  return DEFAULT_LAN_SERVER;
}

export function getStaticDataUrl(filename: string): string {
  if (typeof window === 'undefined') return `./data/${filename}`;
  if (window.location.protocol === 'capacitor:' || window.location.protocol === 'file:') {
    return `./data/${filename}`;
  }
  const pathname = window.location.pathname;
  const basePath = pathname.endsWith('/') ? pathname : (pathname + '/');
  return `${window.location.origin}${basePath}data/${filename}`;
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

  // 3. Registrar IDs from params or IPO
  const mufgId = mufgClientId || ipo?.mufgClientId;
  const kfinId = kfinClientId || ipo?.kfinClientId;
  const bigshareId = bigshareCompanyId || ipo?.bigshareCompanyId;

  // Final extracted metadata - NEVER fall back to ipoList[0]!
  const ipoName = ipoNameParam || ipo?.name || 'IPO Issue';
  const registrar = mufgId 
    ? 'MUFG Intime India Pvt Ltd' 
    : kfinId 
      ? 'KFin Technologies Ltd' 
      : bigshareId
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

// Re-export shared SEBI sanitizer and status evaluators
export { parseDateBoundary, evaluateIpoStatus, sanitizeIpoData } from './ipoSanitizer';
import { sanitizeIpoData } from './ipoSanitizer';

export const liveIpoService = {
  // Fetch real-time IPOs directly from Upstox API / backend
  async getLiveIpos(): Promise<LiveFetchResult> {
    // 1. Direct browser fetch to api.upstox.com if Upstox token is present (zero server in between)
    const storedToken = getStoredUpstoxToken();
    if (storedToken) {
      try {
        const directResult = await fetchUpstoxDirectIpos(storedToken);
        if (directResult.success && directResult.data.length > 0) {
          return {
            ipos: directResult.data,
            isLive: true,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            source: directResult.source
          };
        }
      } catch (err) {
        console.warn('[LiveService] Direct Upstox API fetch failed, falling back:', err);
      }
    }

    // 2. Try primary API endpoint (local dev server on localhost or configured backend)
    try {
      const res = await fetch(`${getApiBaseUrl()}/ipos`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const sanitized = json.data.map(sanitizeIpoData);
            setCachedUpstoxIpos(sanitized);
            return {
              ipos: sanitized,
              isLive: true,
              timestamp: new Date(json.timestamp || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              source: json.source || 'Live Upstox Feed'
            };
          }
        }
      }
    } catch (err) {
      // Direct API unreachable, fall through
    }

    // 3. Fetch fresh JSON from GitHub Pages CDN (cache-busted) — always reflects the latest
    //    GitHub Actions scraper run, regardless of what was bundled at APK build time.
    const remoteResult = await fetchFromGithubPages('ipos.json');
    if (remoteResult) {
      const json = remoteResult.json as { success?: boolean; data?: unknown[]; timestamp?: string; source?: string };
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const sanitized = (json.data as IpoItem[]).map(sanitizeIpoData);
        setCachedUpstoxIpos(sanitized);
        return {
          ipos: sanitized,
          isLive: true,
          timestamp: new Date(json.timestamp || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          source: json.source || 'Upstox Verified Market Feed'
        };
      }
    }

    // 4. Try static/bundled data on GitHub Pages / mobile assets (same origin, cached copy)
    try {
      const staticRes = await fetch(getStaticDataUrl('ipos.json'), { cache: 'no-cache' });
      if (staticRes.ok) {
        const contentType = staticRes.headers.get('content-type') || '';
        // Guard against Vite index.html SPA fallback
        if (contentType.includes('application/json') || !contentType.includes('text/html')) {
          const json = await staticRes.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const sanitized = json.data.map(sanitizeIpoData);
            setCachedUpstoxIpos(sanitized);
            return {
              ipos: sanitized,
              isLive: true,
              timestamp: new Date(json.timestamp || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              source: json.source || 'Upstox Verified Market Feed'
            };
          }
        }
      }
    } catch {
      // Fall through
    }

    // 5. Try local cached IPOs from previous fetch
    const cached = getCachedUpstoxIpos();
    if (cached.length > 0) {
      return {
        ipos: cached,
        isLive: true,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        source: 'Cached Market Feed'
      };
    }

    return {
      ipos: [],
      isLive: false,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      source: 'Direct API Disconnected'
    };
  },

  // Fetch all active KFintech issues (static cache first for mobile/web, then backend)
  async getKfinIssues(): Promise<KfinIssue[]> {
    // 1. Try GitHub Pages CDN (cache-busted)
    const remote = await fetchFromGithubPages('kfin.json');
    if (remote) {
      const json = remote.json as { success?: boolean; data?: KfinIssue[] };
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }

    // 2. Try static data on app assets
    try {
      const staticRes = await fetch(getStaticDataUrl('kfin.json'), { cache: 'no-cache' });
      if (staticRes.ok) {
        const contentType = staticRes.headers.get('content-type') || '';
        if (contentType.includes('application/json') || !contentType.includes('text/html')) {
          const json = await staticRes.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            return json.data;
          }
        }
      }
    } catch {}

    // 3. Try backend API
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
    } catch {}

    return [];
  },

  // Fetch all active MUFG Intime issues (static cache first for mobile/web, then backend)
  async getMufgIssues(): Promise<MufgIssue[]> {
    // 1. Try GitHub Pages CDN (cache-busted)
    const remote = await fetchFromGithubPages('mufg.json');
    if (remote) {
      const json = remote.json as { success?: boolean; data?: MufgIssue[] };
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }

    // 2. Try static data on app assets
    try {
      const staticRes = await fetch(getStaticDataUrl('mufg.json'), { cache: 'no-cache' });
      if (staticRes.ok) {
        const contentType = staticRes.headers.get('content-type') || '';
        if (contentType.includes('application/json') || !contentType.includes('text/html')) {
          const json = await staticRes.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            return json.data;
          }
        }
      }
    } catch {}

    // 3. Try backend API
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
    } catch {}

    return [];
  },

  // Fetch all active Bigshare issues (static cache first, then backend API)
  async getBigshareIssues(): Promise<BigshareIssue[]> {
    // 1. Try GitHub Pages CDN (cache-busted)
    const remote = await fetchFromGithubPages('bigshare.json');
    if (remote) {
      const json = remote.json as { success?: boolean; data?: BigshareIssue[] };
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }

    // 2. Try static data on app assets
    try {
      const staticRes = await fetch(getStaticDataUrl('bigshare.json'), { cache: 'no-cache' });
      if (staticRes.ok) {
        const contentType = staticRes.headers.get('content-type') || '';
        if (contentType.includes('application/json') || !contentType.includes('text/html')) {
          const json = await staticRes.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            return json.data;
          }
        }
      }
    } catch {}

    // 3. Try backend API
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
    } catch {}

    return [];
  },

  // Fetch real-time health and latency across Bigshare servers
  async getBigshareServers(): Promise<BigshareServerInfo[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${getApiBaseUrl()}/allotment/bigshare-servers`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {
      // Fall through
    }
    return [
      { id: 'server1', name: 'Server 1', url: 'https://ipo.bigshareonline.com', portalUrl: 'https://ipo.bigshareonline.com/', status: 'online' },
      { id: 'server2', name: 'Server 2', url: 'https://ipo1.bigshareonline.com', portalUrl: 'https://ipo1.bigshareonline.com/ipo_status.html', status: 'online' },
      { id: 'server3', name: 'Server 3', url: 'https://ipo2.bigshareonline.com', portalUrl: 'https://ipo2.bigshareonline.com/ipo_status.html', status: 'online' }
    ];
  },

  // Fetch fresh Bigshare CAPTCHA challenge
  async getBigshareCaptcha(preferredServerId?: BigshareServerId): Promise<{
    token: string;
    image: string;
    serverId?: BigshareServerId;
    serverName?: string;
    serverUrl?: string;
    portalUrl?: string;
  } | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const url = preferredServerId
        ? `${getApiBaseUrl()}/allotment/bigshare-captcha?server=${preferredServerId}`
        : `${getApiBaseUrl()}/allotment/bigshare-captcha`;

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.token && json.image) {
          return {
            token: json.token,
            image: json.image,
            serverId: json.serverId,
            serverName: json.serverName,
            serverUrl: json.serverUrl,
            portalUrl: json.portalUrl
          };
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
    captchaAnswer?: string,
    bigshareServerId?: BigshareServerId
  ): Promise<AllotmentResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${getApiBaseUrl()}/allotment/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipoId,
          queryType,
          queryValue,
          kfinClientId,
          mufgClientId,
          bigshareCompanyId,
          captchaToken,
          captchaAnswer,
          ipoName,
          bigshareServerId
        }),
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
    const token = getStoredUpstoxToken();
    const apiKey = getStoredUpstoxApiKey();
    if (token) {
      return { success: true, hasAccessToken: true, hasApiKey: !!apiKey, hasApiSecret: false, source: 'Upstox Official Direct API' };
    }
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      try {
        const res = await fetch(`${getApiBaseUrl()}/upstox/status`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) return await res.json();
      } catch {}
    }
    return { success: false, hasAccessToken: false, hasApiKey: false, hasApiSecret: false, source: 'Token Required' };
  },

  // Save Upstox credentials directly into browser localStorage (and local dev server if on localhost)
  async saveUpstoxCredentials(creds: { accessToken?: string; apiKey?: string; apiSecret?: string }): Promise<boolean> {
    if (creds.accessToken) setStoredUpstoxToken(creds.accessToken);
    if (creds.apiKey) setStoredUpstoxApiKey(creds.apiKey);
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      try {
        await fetch(`${getApiBaseUrl()}/upstox/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(creds),
          signal: AbortSignal.timeout(2000)
        });
      } catch {}
    }
    return true;
  },

  // Fetch live buyback data across backend API, GitHub Pages CDN, and local static cache
  async fetchBuybacks(): Promise<import('../types/ipo').BuybackItem[]> {
    // 1. Try backend API
    try {
      const res = await fetch(`${getApiBaseUrl()}/buybacks`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {}

    // 2. Try GitHub Pages CDN
    const remote = await fetchFromGithubPages('buybacks.json');
    if (remote) {
      const json = remote.json as { success?: boolean; data?: import('../types/ipo').BuybackItem[] };
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }

    // 3. Try static bundled data
    try {
      const staticRes = await fetch(getStaticDataUrl('buybacks.json'), { cache: 'no-cache' });
      if (staticRes.ok) {
        const json = await staticRes.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {}

    return [];
  }
};
