import axios from 'axios';
import https from 'https';
import crypto from 'crypto';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const BASE_URL = 'https://in.mpms.mufg.com/Initial_Offer';
const PORTAL_URL = 'https://in.mpms.mufg.com/Initial_Offer/public-issues.html';

// In-memory cache for MUFG IPO issues list
let mufgIssuesCache = [];
let lastMufgFetchTime = 0;
const MUFG_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Static baseline fallback containing confirmed MUFG issues
const BASELINE_MUFG_ISSUES = [
  { clientId: '11932', name: 'Glass Wall Systems (India) Limited - IPO' },
  { clientId: '11931', name: 'Kanohar Electricals Limited - IPO' },
  { clientId: '11930', name: 'Qualiance International Limited - SME IPO' },
  { clientId: '11929', name: 'Phychem Technologies Limited - SME IPO' },
  { clientId: '11927', name: 'ESDS Software Solution Limited - IPO' }
];

/**
 * Encrypts raw token using AES-128-CBC with key/iv '8080808080808080' as required by MUFG portal
 */
export function encryptToken(plainToken) {
  const key = Buffer.from('8080808080808080', 'utf8');
  const iv = Buffer.from('8080808080808080', 'utf8');
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encrypted = cipher.update(String(plainToken), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

/**
 * Fetches available company list with clientId from MUFG Intime
 */
export async function fetchMufgIssues() {
  const now = Date.now();
  if (mufgIssuesCache.length > 0 && (now - lastMufgFetchTime < MUFG_CACHE_TTL_MS)) {
    return mufgIssuesCache;
  }

  const defaultHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': PORTAL_URL,
    'Origin': 'https://in.mpms.mufg.com'
  };

  try {
    const res = await axios.post(`${BASE_URL}/IPO.aspx/GetDetails`, {}, {
      headers: defaultHeaders,
      httpsAgent,
      timeout: 8000
    });

    const xml = res.data?.d;
    if (typeof xml === 'string' && xml.includes('<Table>')) {
      const matches = [...xml.matchAll(/<Table>[\s\S]*?<company_id>(\d+)<\/company_id>[\s\S]*?<companyname>([^<]+)<\/companyname>[\s\S]*?<\/Table>/gi)];
      if (matches.length > 0) {
        const issues = matches.map(m => ({
          clientId: m[1].trim(),
          name: m[2].trim()
        }));
        mufgIssuesCache = issues;
        lastMufgFetchTime = now;
        console.log(`[MUFG Service] Loaded ${issues.length} live issues from MUFG Intime portal`);
        return issues;
      }
    }
  } catch (error) {
    console.warn('[MUFG Service] Live fetch failed, using baseline issues:', error.message);
  }

  if (mufgIssuesCache.length === 0) {
    mufgIssuesCache = BASELINE_MUFG_ISSUES;
  }
  return mufgIssuesCache;
}

/**
 * Normalizes issue name for fuzzy comparison
 */
const STOP_WORDS = new Set([
  'limited', 'ltd', 'pvt', 'private', 'ipo', 'sme', 'india',
  'industries', 'technologies', 'technology', 'solutions', 'enterprises',
  'logistics', 'chemicals', 'pharma', 'finance', 'financial', 'capital',
  'international', 'systems', 'infra', 'infrastructure', 'electricals',
  'services', 'holdings', 'group', 'corp', 'corporation', 'company', 'co',
  'labs', 'projects', 'ventures', 'engineering', 'products', 'retail',
  'power', 'securities', 'energy', 'global', 'reit', 'sm', 'trust', 'invit'
]);

function normalizeIssueName(name = '') {
  return name
    .toLowerCase()
    .replace(/-(ipo|sme|reit|invit)/g, '')
    .replace(/\b(limited|ltd|pvt|private|ipo|sme|india)\b/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getDistinctTokens(name = '') {
  return name
    .toLowerCase()
    .replace(/-(ipo|sme|reit|invit)/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

/**
 * Match IPO name / symbol against MUFG issues
 */
export async function findMufgIssue(targetName = '', symbol = '') {
  const issues = await fetchMufgIssues();
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
 * Parses XML response from MUFG SearchOnPan endpoint
 */
function parseMufgXml(xmlStr) {
  if (!xmlStr || typeof xmlStr !== 'string') return null;

  // Check Table1 Msg
  const msgMatch = xmlStr.match(/<Msg>([^<]+)<\/Msg>/i);
  if (msgMatch) {
    return { error: msgMatch[1].trim() };
  }

  // Find Table
  const tableMatches = [...xmlStr.matchAll(/<Table>([\s\S]*?)<\/Table>/gi)];
  if (tableMatches.length === 0) {
    return { notFound: true };
  }

  // Find record that has NAME1 populated
  for (const t of tableMatches) {
    const content = t[1];
    const nameMatch = content.match(/<NAME1>([^<]+)<\/NAME1>/i);
    if (nameMatch && nameMatch[1].trim()) {
      const getField = (tag) => {
        const m = content.match(new RegExp(`<${tag}>([^<]*)<\\/${tag}>`, 'i'));
        return m ? m[1].trim() : '';
      };

      const sharesAllotted = parseInt(getField('ALLOT')) || 0;
      const sharesApplied = parseInt(getField('SHARES')) || 0;
      const offerPrice = parseFloat(getField('offer_price')) || 0;
      const refundAmount = parseFloat(getField('RFNDAMT')) || 0;

      return {
        applicantName: nameMatch[1].trim(),
        companyName: getField('companyname'),
        dpId: getField('DPCLITID') || 'N/A',
        refundNo: getField('RFNDNO') || 'N/A',
        refundAmount,
        offerPrice,
        sharesApplied,
        sharesAllotted,
        category: getField('PEMNDG') || 'Retail',
        status: sharesAllotted > 0 ? 'Allotted' : 'Not Allotted'
      };
    }
  }

  return { notFound: true };
}

/**
 * Queries MUFG Intime Allotment Status using the 3-step ASP.NET WebMethod API
 */
export async function queryMufgAllotment({
  clientId,
  queryType = 'pan',
  queryValue = '',
  ipoName = 'IPO Issue',
  lotSize = 100,
  priceBandMax = 140
}) {
  const query = (queryValue || '').trim().toUpperCase();
  const defaultHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': PORTAL_URL,
    'Origin': 'https://in.mpms.mufg.com'
  };

  // CHKVAL: 1 = PAN, 2 = Application No, 3 = DPID/Client ID
  let chkVal = '1';
  if (queryType === 'appNo') {
    chkVal = '2';
  } else if (queryType === 'dpId') {
    chkVal = '3';
  }

  try {
    // Step 1: Optional CheckCaptcha API
    try {
      await axios.post(`${BASE_URL}/CaptchaImage.aspx/CheckCaptcha`, {}, {
        headers: defaultHeaders,
        httpsAgent,
        timeout: 5000
      });
    } catch {
      // Non-blocking step
    }

    // Step 2: Generate Token API
    const tokenRes = await axios.post(`${BASE_URL}/IPO.aspx/generateToken`, {}, {
      headers: defaultHeaders,
      httpsAgent,
      timeout: 8000
    });

    const rawToken = tokenRes.data?.d;
    if (!rawToken) {
      throw new Error('MUFG did not return a security token');
    }

    const encryptedToken = encryptToken(rawToken);

    // Step 3: SearchOnPan API
    const searchPayload = {
      clientid: String(clientId),
      PAN: query,
      IFSC: '',
      CHKVAL: chkVal,
      token: encryptedToken
    };

    const searchRes = await axios.post(`${BASE_URL}/IPO.aspx/SearchOnPan`, searchPayload, {
      headers: defaultHeaders,
      httpsAgent,
      timeout: 10000
    });

    const parsed = parseMufgXml(searchRes.data?.d);

    if (parsed && !parsed.notFound && !parsed.error && parsed.applicantName) {
      const isAllotted = parsed.sharesAllotted > 0;
      const applied = parsed.sharesApplied || lotSize || 100;
      const allotted = parsed.sharesAllotted;
      const refund = parsed.refundAmount || (isAllotted ? 0 : (applied * (parsed.offerPrice || priceBandMax)));

      return {
        ipoId: String(clientId),
        ipoName: parsed.companyName || ipoName,
        applicantName: parsed.applicantName,
        pan: queryType === 'pan' ? query : 'N/A',
        applicationNo: parsed.refundNo !== 'N/A' ? parsed.refundNo : (queryType === 'appNo' ? query : 'N/A'),
        dpId: parsed.dpId,
        sharesApplied: applied,
        sharesAllotted: allotted,
        status: isAllotted ? 'Allotted' : 'Not Allotted',
        refundAmount: refund,
        message: isAllotted
          ? `Congratulations! ${allotted} shares have been allotted to ${parsed.applicantName} in ${parsed.companyName || ipoName} at ₹${parsed.offerPrice || priceBandMax}/share. Shares will be credited to Demat account prior to listing.`
          : `Your bid for ${applied} shares was registered under ${parsed.category || 'Retail'} category, but no shares were allotted. Refund of ₹${refund.toLocaleString('en-IN')} has been credited/unblocked.`,
        registrar: 'MUFG Intime India Pvt Ltd',
        finalizedDate: 'Declared',
        registrarPortalUrl: PORTAL_URL
      };
    }

    if (parsed?.error) {
      return {
        ipoId: String(clientId),
        ipoName,
        applicantName: 'N/A',
        pan: queryType === 'pan' ? query : 'N/A',
        applicationNo: queryType === 'appNo' ? query : 'N/A',
        dpId: queryType === 'dpId' ? query : 'N/A',
        sharesApplied: 0,
        sharesAllotted: 0,
        status: 'Not Found',
        refundAmount: 0,
        message: `MUFG Portal Response: ${parsed.error}`,
        registrar: 'MUFG Intime India Pvt Ltd',
        registrarPortalUrl: PORTAL_URL
      };
    }

    // Record not found
    return {
      ipoId: String(clientId),
      ipoName,
      applicantName: 'N/A',
      pan: queryType === 'pan' ? query : 'N/A',
      applicationNo: queryType === 'appNo' ? query : 'N/A',
      dpId: queryType === 'dpId' ? query : 'N/A',
      sharesApplied: 0,
      sharesAllotted: 0,
      status: 'Not Found',
      refundAmount: 0,
      message: `No allotment record found for ${query} in ${ipoName} with registrar MUFG Intime. Please check if the PAN/Application No was entered correctly or if the bid was submitted through another account.`,
      registrar: 'MUFG Intime India Pvt Ltd',
      registrarPortalUrl: PORTAL_URL
    };
  } catch (err) {
    console.error(`[MUFG Service] Error querying allotment for ${clientId}:`, err.message);
    return {
      ipoId: String(clientId),
      ipoName,
      applicantName: 'N/A',
      pan: queryType === 'pan' ? query : 'N/A',
      applicationNo: queryType === 'appNo' ? query : 'N/A',
      dpId: queryType === 'dpId' ? query : 'N/A',
      sharesApplied: 0,
      sharesAllotted: 0,
      status: 'Not Found',
      refundAmount: 0,
      message: `Failed to query MUFG registrar API (${err.message}). You can also verify directly on the official portal.`,
      registrar: 'MUFG Intime India Pvt Ltd',
      registrarPortalUrl: PORTAL_URL
    };
  }
}
