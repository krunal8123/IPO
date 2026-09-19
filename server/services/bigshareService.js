import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const BASE_URL = 'https://ipo.bigshareonline.com';

// In-memory cache for Bigshare IPO issues list
let bigshareIssuesCache = [];
let lastBigshareFetchTime = 0;
const BIGSHARE_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Static baseline fallback containing confirmed Bigshare issues
const BASELINE_BIGSHARE_ISSUES = [
  { companyId: '596', name: 'RAKSAN TRANSFORMERS LIMITED' },
  { companyId: '597', name: 'OM GALAXY LIMITED' },
  { companyId: '595', name: 'INFRAX RENEWABLE LIMITED' },
  { companyId: '9048', name: 'DEEPA JEWELLERS LIMITED' },
  { companyId: '9047', name: 'LUMINO INDUSTRIES LIMITED' }
];

const defaultHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': `${BASE_URL}/`,
  'Origin': BASE_URL
};


/**
 * Fetches available company list with companyId from Bigshare portal
 */
export async function fetchBigshareIssues() {
  const now = Date.now();
  if (bigshareIssuesCache.length > 0 && (now - lastBigshareFetchTime < BIGSHARE_CACHE_TTL_MS)) {
    return bigshareIssuesCache;
  }

  try {
    const res = await axios.get(BASE_URL, {
      headers: defaultHeaders,
      httpsAgent,
      timeout: 8000
    });

    const html = res.data;
    if (typeof html === 'string') {
      const selectMatch = html.match(/<select[^>]+id="ddlCompany"[\s\S]*?<\/select>/i) ||
                          html.match(/<select[^>]+name="ddlCompany"[\s\S]*?<\/select>/i);
      if (selectMatch) {
        const matches = [...selectMatch[0].matchAll(/<option[^>]+value="([^"]+)"[^>]*>([^<]+)<\/option>/gi)];
        const issues = [];
        for (const m of matches) {
          const val = m[1].trim();
          const label = m[2].trim();
          if (val && val !== '0' && val !== '' && !label.toLowerCase().includes('select company')) {
            issues.push({ companyId: val, name: label });
          }
        }

        if (issues.length > 0) {
          bigshareIssuesCache = issues;
          lastBigshareFetchTime = now;
          console.log(`[Bigshare Service] Loaded ${issues.length} live issues from Bigshare portal`);
          return issues;
        }
      }
    }
  } catch (error) {
    console.warn('[Bigshare Service] Live fetch failed, using baseline issues:', error.message);
  }

  if (bigshareIssuesCache.length === 0) {
    bigshareIssuesCache = BASELINE_BIGSHARE_ISSUES;
  }
  return bigshareIssuesCache;
}

const STOP_WORDS = new Set([
  'limited', 'ltd', 'pvt', 'private', 'ipo', 'sme', 'india',
  'industries', 'technologies', 'technology', 'solutions', 'enterprises',
  'logistics', 'chemicals', 'pharma', 'finance', 'financial', 'capital',
  'international', 'systems', 'infra', 'infrastructure', 'electricals',
  'services', 'holdings', 'group', 'corp', 'corporation', 'company', 'co',
  'labs', 'projects', 'ventures', 'engineering', 'products', 'retail',
  'power', 'securities', 'energy', 'global', 'reit', 'sm', 'trust'
]);

function normalizeIssueName(name = '') {
  return name
    .toLowerCase()
    .replace(/\b(limited|ltd|pvt|private|ipo|sme|india)\b/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getDistinctTokens(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

/**
 * Match IPO name / symbol against Bigshare issues
 */
export async function findBigshareIssue(targetName = '', symbol = '') {
  const issues = await fetchBigshareIssues();
  if (!issues || issues.length === 0) return null;

  const cleanTarget = normalizeIssueName(targetName);
  if (!cleanTarget) return null;

  // 1. Exact cleaned match first
  for (const issue of issues) {
    const cleanIssue = normalizeIssueName(issue.name);
    if (cleanIssue === cleanTarget) {
      return issue;
    }
  }

  // 2. Distinct non-generic token matching
  const targetTokens = getDistinctTokens(targetName);
  if (targetTokens.length === 0) return null;

  let bestMatch = null;
  let maxScore = 0;

  for (const issue of issues) {
    const issueTokens = getDistinctTokens(issue.name);
    if (issueTokens.length === 0) continue;

    let matched = 0;
    for (const t of targetTokens) {
      if (issueTokens.includes(t)) matched++;
    }

    const ratio = matched / Math.max(targetTokens.length, issueTokens.length);
    if (matched > 0 && ratio >= 0.5 && ratio > maxScore) {
      maxScore = ratio;
      bestMatch = issue;
    }
  }

  // 3. Symbol check
  if (!bestMatch && symbol && symbol.length >= 3 && !STOP_WORDS.has(symbol.toLowerCase())) {
    const cleanSym = symbol.toLowerCase().trim();
    bestMatch = issues.find(i => normalizeIssueName(i.name).startsWith(cleanSym)) || null;
  }

  return bestMatch;
}

/**
 * Fetches fresh CAPTCHA token and base64 image challenge from Bigshare
 */
export async function fetchBigshareCaptcha() {
  try {
    const res = await axios.get(`${BASE_URL}/Captcha.ashx`, {
      headers: {
        ...defaultHeaders,
        'Accept': 'application/json, text/javascript, */*; q=0.01'
      },
      httpsAgent,
      timeout: 8000
    });

    const token = res.data?.token || res.data?.Token;
    const image = res.data?.image || res.data?.Image;

    if (token && image) {
      return { success: true, token, image };
    }
    return { success: false, error: 'Could not generate Bigshare CAPTCHA' };
  } catch (error) {
    console.error('[Bigshare Service] Error fetching CAPTCHA:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Queries Bigshare Allotment Status using Data.aspx/FetchIpodetails
 */
export async function queryBigshareAllotment({
  companyId,
  queryType = 'pan',
  queryValue = '',
  captchaToken = '',
  captchaAnswer = '',
  ipoName = 'IPO Issue',
  lotSize = 100,
  priceBandMax = 140
}) {
  const query = (queryValue || '').trim().toUpperCase();
  const regUrl = `${BASE_URL}/`;

  if (!captchaToken || !captchaAnswer) {
    return {
      ipoId: String(companyId),
      ipoName,
      applicantName: 'N/A',
      pan: queryType === 'pan' ? query : 'N/A',
      applicationNo: queryType === 'appNo' ? query : 'N/A',
      dpId: queryType === 'dpId' ? query : 'N/A',
      sharesApplied: 0,
      sharesAllotted: 0,
      status: 'CAPTCHA_REQUIRED',
      refundAmount: 0,
      message: 'CAPTCHA verification is required to view allotment on Bigshare Services.',
      registrar: 'Bigshare Services Pvt Ltd',
      registrarPortalUrl: regUrl
    };
  }

  // Exact Bigshare Form Field Mapping:
  // - SelectionType: 'PN' for PAN, 'AP' for Application No, 'BN' for Beneficiary/DPID
  // - ddlType: '0' for AP and PN, 'NSDL' or 'CDSL' for BN
  let selectionType = 'PN';
  let panNo = '';
  let appNo = '';
  let dpid = '';
  let clid = '';
  let csdl = '';
  let ddlType = '0';

  if (queryType === 'appNo') {
    selectionType = 'AP';
    appNo = query;
    ddlType = '0';
  } else if (queryType === 'dpId') {
    selectionType = 'BN';
    if (query.startsWith('IN') || query.startsWith('in')) {
      ddlType = 'NSDL';
      dpid = query.slice(0, 8);
      clid = query.slice(8);
    } else {
      ddlType = 'CDSL';
      csdl = query;
    }
  } else {
    selectionType = 'PN';
    panNo = query;
    ddlType = '0';
  }

  try {
    const payload = {
      Applicationno: appNo,
      Company: String(companyId),
      SelectionType: selectionType,
      PanNo: panNo,
      txtcsdl: csdl,
      txtDPID: dpid,
      txtClId: clid,
      ddlType: ddlType,
      lang: 'en',
      CaptchaToken: captchaToken,
      CaptchaAnswer: captchaAnswer.trim(),
      ResultToken: ''
    };

    const res = await axios.post(`${BASE_URL}/Data.aspx/FetchIpodetails`, payload, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...defaultHeaders
      },
      httpsAgent,
      timeout: 10000,
      validateStatus: () => true
    });

    if (res.status === 200 && res.data?.d) {
      const d = res.data.d;
      const status = d.Status || '';

      if (status === 'CAPTCHA') {
        return {
          ipoId: String(companyId),
          ipoName,
          applicantName: 'N/A',
          pan: panNo || query,
          applicationNo: appNo || 'N/A',
          dpId: dpid || 'N/A',
          sharesApplied: 0,
          sharesAllotted: 0,
          status: 'CAPTCHA_INVALID',
          refundAmount: 0,
          message: d.Message || 'Invalid CAPTCHA code. Please try again with the new code.',
          registrar: 'Bigshare Services Pvt Ltd',
          registrarPortalUrl: regUrl
        };
      }

      if (status === 'RATELIMIT' || status === 'WARMING') {
        return {
          ipoId: String(companyId),
          ipoName,
          applicantName: 'N/A',
          pan: panNo || query,
          applicationNo: appNo || 'N/A',
          dpId: dpid || 'N/A',
          sharesApplied: 0,
          sharesAllotted: 0,
          status: 'Under Process',
          refundAmount: 0,
          message: d.Message || 'Bigshare server is busy. Please wait a moment and try again.',
          registrar: 'Bigshare Services Pvt Ltd',
          registrarPortalUrl: regUrl
        };
      }

      if (status === 'NOTFOUND') {
        return {
          ipoId: String(companyId),
          ipoName,
          applicantName: 'N/A',
          pan: panNo || query,
          applicationNo: appNo || 'N/A',
          dpId: dpid || 'N/A',
          sharesApplied: 0,
          sharesAllotted: 0,
          status: 'Not Found',
          refundAmount: 0,
          message: `No application or allotment record found for ${query} in ${ipoName} with registrar Bigshare Services.`,
          registrar: 'Bigshare Services Pvt Ltd',
          registrarPortalUrl: regUrl
        };
      }

      if (status === 'OK' || (d.APPLICATION_NO && d.Name) || d.Records) {
        // Handle multiple records if present in d.Records
        const records = Array.isArray(d.Records) && d.Records.length > 0 ? d.Records : [d];
        let activeRec = d;
        if (queryType === 'appNo' && records.length > 0) {
          const match = records.find(r => (r.APPLICATION_NO || '').trim().toUpperCase() === query);
          if (match) activeRec = match;
        } else if (records.length > 0 && (!activeRec.APPLICATION_NO && records[0].APPLICATION_NO)) {
          activeRec = records[0];
        }

        const applied = parseInt(activeRec.APPLIED || d.APPLIED) || lotSize || 100;
        const allotted = parseInt(activeRec.ALLOTED || d.ALLOTED) || 0;
        const isAllotted = allotted > 0;
        const refund = isAllotted ? 0 : applied * priceBandMax;
        const applicantName = activeRec.Name || d.Name || 'Investor';
        const applicationNo = activeRec.APPLICATION_NO || d.APPLICATION_NO || appNo || 'N/A';
        const dpId = activeRec.DPID || d.DPID || dpid || 'N/A';

        return {
          ipoId: String(companyId),
          ipoName,
          applicantName,
          pan: panNo || query,
          applicationNo,
          dpId,
          sharesApplied: applied,
          sharesAllotted: allotted,
          status: isAllotted ? 'Allotted' : 'Not Allotted',
          refundAmount: refund,
          message: isAllotted
            ? `Congratulations! ${allotted} shares have been allotted to ${applicantName} in ${ipoName}. Shares will be credited to Demat account prior to listing date.`
            : `Your application #${applicationNo} for ${applied} shares was registered with Bigshare Services, but was not selected in the computerized basis of allotment draw. Your blocked bank UPI mandate of ₹${refund.toLocaleString('en-IN')} has been unblocked/refunded.`,
          registrar: 'Bigshare Services Pvt Ltd',
          finalizedDate: 'Declared',
          registrarPortalUrl: regUrl
        };
      }
    }

    return {
      ipoId: String(companyId),
      ipoName,
      applicantName: 'N/A',
      pan: panNo || query,
      applicationNo: appNo || 'N/A',
      dpId: dpid || 'N/A',
      sharesApplied: 0,
      sharesAllotted: 0,
      status: 'Not Found',
      refundAmount: 0,
      message: `Bigshare Services returned an unexpected response (Status: ${res.status}). You can also verify on their portal directly.`,
      registrar: 'Bigshare Services Pvt Ltd',
      registrarPortalUrl: regUrl
    };
  } catch (err) {
    console.error(`[Bigshare Service] Query error for ${companyId}:`, err.message);
    return {
      ipoId: String(companyId),
      ipoName,
      applicantName: 'N/A',
      pan: panNo || query,
      applicationNo: appNo || 'N/A',
      dpId: dpid || 'N/A',
      sharesApplied: 0,
      sharesAllotted: 0,
      status: 'Not Found',
      refundAmount: 0,
      message: `Failed to query Bigshare API (${err.message}).`,
      registrar: 'Bigshare Services Pvt Ltd',
      registrarPortalUrl: regUrl
    };
  }
}
