import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// In-memory cache for KFintech IPO issues list
let kfinIssuesCache = [];
let lastKfinFetchTime = 0;
const KFIN_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Static baseline fallback containing confirmed KFintech issues
const BASELINE_KFIN_ISSUES = [
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

export async function fetchKfinIssues() {
  const now = Date.now();
  if (kfinIssuesCache.length > 0 && (now - lastKfinFetchTime < KFIN_CACHE_TTL_MS)) {
    return kfinIssuesCache;
  }

  try {
    const indexRes = await axios.get('https://ipostatus.kfintech.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html'
      },
      httpsAgent,
      timeout: 6000
    });

    const scriptMatch = indexRes.data.match(/static\/js\/main\.[a-z0-9]+\.js/);
    if (scriptMatch) {
      const scriptUrl = `https://ipostatus.kfintech.com/${scriptMatch[0]}`;
      const jsRes = await axios.get(scriptUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        httpsAgent,
        timeout: 10000
      });

      const rfMatch = jsRes.data.match(/const\s+rf\s*=\s*JSON\.parse\('([^']+)'\)/);
      if (rfMatch && rfMatch[1]) {
        const liveList = JSON.parse(rfMatch[1]);
        if (Array.isArray(liveList) && liveList.length > 0) {
          kfinIssuesCache = liveList;
          lastKfinFetchTime = now;
          console.log(`[KFintechService] Synchronized ${liveList.length} live issues from KFintech.`);
          return liveList;
        }
      }
    }
  } catch (err) {
    console.warn('[KFintechService] Could not fetch live bundle from KFintech, using verified baseline list:', err.message);
  }

  kfinIssuesCache = BASELINE_KFIN_ISSUES;
  lastKfinFetchTime = now;
  return BASELINE_KFIN_ISSUES;
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

export async function findKfinIssue(ipoName = '', symbol = '') {
  const issues = await fetchKfinIssues();
  const cleanTarget = normalizeIssueName(ipoName);
  if (!cleanTarget) return null;

  // 1. Exact cleaned match first
  for (const issue of issues) {
    const cleanIssue = normalizeIssueName(issue.name);
    if (cleanIssue === cleanTarget) {
      return issue;
    }
  }

  // 2. Distinct non-generic token matching
  const targetTokens = getDistinctTokens(ipoName);
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

  // 3. Symbol check (only if symbol is distinct)
  if (!bestMatch && symbol && symbol.length >= 3 && !STOP_WORDS.has(symbol.toLowerCase())) {
    const cleanSym = symbol.toLowerCase().trim();
    bestMatch = issues.find(i => normalizeIssueName(i.name).startsWith(cleanSym)) || null;
  }

  return bestMatch;
}

export async function queryKfintechAllotment({ clientId, queryType, queryValue, ipoName = 'IPO Issue', lotSize = 100, priceBandMax = 140 }) {
  const query = (queryValue || '').trim().toUpperCase();
  const regUrl = 'https://ipostatus.kfintech.com/';

  // Map query type to KFintech API parameter
  let kfinType = 'pan';
  let reqParam = query;

  if (queryType === 'appNo') {
    kfinType = 'appno';
    reqParam = query;
  } else if (queryType === 'dpId') {
    kfinType = 'dpclid';
    reqParam = query;
  } else {
    kfinType = 'pan';
    reqParam = query;
  }

  const apiUrl = `https://0uz601ms56.execute-api.ap-south-1.amazonaws.com/prod/api/query?type=${kfinType}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'reqparam': reqParam,
        'client_id': `${clientId}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      httpsAgent,
      timeout: 8000,
      validateStatus: (status) => status === 200 || status === 404 || status === 429
    });

    if (response.status === 200) {
      const raw = response.data;
      const records = Array.isArray(raw)
        ? raw
        : (Array.isArray(raw?.data) ? raw.data : (raw ? [raw] : []));

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
          pan: rec.Pan_No || query,
          applicationNo: rec.Appln_No,
          dpId: rec.DP_CLID || 'N/A',
          sharesApplied,
          sharesAllotted,
          status: isAllotted ? 'Allotted' : 'Not Allotted',
          refundAmount: isAllotted ? 0 : totalAmount,
          message: isAllotted
            ? `Congratulations! ${sharesAllotted} shares have been allotted to ${rec.Name || 'you'} (Application #${rec.Appln_No}). Shares will be credited to Demat account prior to listing.`
            : `Your application #${rec.Appln_No} for ${sharesApplied} shares was registered with KFintech, but was not selected in the computerized basis of allotment draw. Your blocked bank UPI mandate of ₹${totalAmount.toLocaleString('en-IN')} has been unblocked/refunded.`,
          registrar: 'KFin Technologies Ltd',
          registrarPortalUrl: regUrl
        };
      }
    }

    if (response.status === 404) {
      return {
        ipoId: clientId,
        ipoName,
        applicantName: 'N/A',
        pan: queryType === 'pan' ? query : 'N/A',
        applicationNo: queryType === 'appNo' ? query : 'N/A',
        dpId: queryType === 'dpId' ? query : 'N/A',
        sharesApplied: 0,
        sharesAllotted: 0,
        status: 'Not Found',
        refundAmount: 0,
        message: `No application record found for ${queryType === 'pan' ? 'PAN' : 'identifier'} "${query}" in ${ipoName} on KFintech. If you applied via your broker (Zerodha, Groww, AngelOne, etc.), verify that your bid was accepted before the closing cutoff or verify directly on KFintech.`,
        registrar: 'KFin Technologies Ltd',
        registrarPortalUrl: regUrl
      };
    }

    if (response.status === 429) {
      return {
        ipoId: clientId,
        ipoName,
        applicantName: 'N/A',
        pan: query,
        applicationNo: 'N/A',
        dpId: 'N/A',
        sharesApplied: 0,
        sharesAllotted: 0,
        status: 'Under Process',
        refundAmount: 0,
        message: `KFintech server is experiencing high traffic. Please check back in a few moments or open the official portal directly.`,
        registrar: 'KFin Technologies Ltd',
        registrarPortalUrl: regUrl
      };
    }
  } catch (err) {
    console.error('[KFintechService] Query error:', err.message);
  }

  // Fallback if network fails
  return {
    ipoId: clientId,
    ipoName,
    applicantName: 'N/A',
    pan: query,
    applicationNo: 'N/A',
    dpId: 'N/A',
    sharesApplied: 0,
    sharesAllotted: 0,
    status: 'Under Process',
    refundAmount: 0,
    message: `Unable to establish live connection to KFintech's API right now. Please verify directly on the official KFintech Allotment Status portal below.`,
    registrar: 'KFin Technologies Ltd',
    registrarPortalUrl: regUrl
  };
}
