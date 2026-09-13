import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

let subscriptionCache = [];
let lastSubFetchTime = 0;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes live cache

export async function fetchLiveSubscription() {
  const now = Date.now();
  if (subscriptionCache && subscriptionCache.length > 0 && (now - lastSubFetchTime < CACHE_TTL_MS)) {
    return subscriptionCache;
  }

  try {
    const response = await axios.get('https://www.ipoji.com/ipo-subscription-status', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://www.ipoji.com/'
      },
      httpsAgent,
      timeout: 8000
    });

    const $ = cheerio.load(response.data);
    const results = [];

    $('table').first().find('tr').slice(1).each((_, element) => {
      const row = $(element);
      const tds = row.find('td');
      if (tds.length < 10) return;

      const companyRaw = tds.eq(0).text().replace(/\s+/g, ' ').trim();
      if (!companyRaw) return;

      const closeDate = tds.eq(1).text().replace(/\s+/g, ' ').trim();
      const qib = parseFloat(tds.eq(2).text().replace(/[^0-9.]/g, '')) || 0;
      const snii = parseFloat(tds.eq(3).text().replace(/[^0-9.]/g, '')) || 0;
      const bnii = parseFloat(tds.eq(4).text().replace(/[^0-9.]/g, '')) || 0;
      const nii = parseFloat(tds.eq(5).text().replace(/[^0-9.]/g, '')) || 0;
      const retail = parseFloat(tds.eq(6).text().replace(/[^0-9.]/g, '')) || 0;
      const employee = parseFloat(tds.eq(7).text().replace(/[^0-9.]/g, '')) || 0;
      const total = parseFloat(tds.eq(9).text().replace(/[^0-9.]/g, '')) || 0;
      
      const appText = tds.eq(10).text().replace(/[^0-9]/g, '');
      const applications = appText ? parseInt(appText, 10) : 0;

      const sizeText = tds.eq(11).text().replace(/\s+/g, ' ').trim();
      const sizeMatch = sizeText.match(/([0-9.]+)/);
      const issueSizeCr = sizeMatch ? parseFloat(sizeMatch[1]) : 0;

      // Clean name for matching: strip exchanges like BSE, NSE, SME
      const cleanName = companyRaw.replace(/\b(BSE|NSE|SME|IPO)\b/gi, '').trim();

      results.push({
        name: cleanName,
        rawName: companyRaw,
        closeDate,
        qib,
        snii,
        bnii,
        nii: nii || (snii && bnii ? parseFloat(((snii + bnii) / 2).toFixed(2)) : 0),
        retail,
        employee,
        total,
        applications,
        issueSizeCr,
        lastUpdated: 'Live Exchange Feed'
      });
    });

    if (results.length > 0) {
      subscriptionCache = results;
      lastSubFetchTime = now;
      console.log(`[SubscriptionService] Successfully scraped ${results.length} real-time subscription records.`);
      return results;
    }
  } catch (err) {
    console.warn('[SubscriptionService] Live subscription fetch error, using cache:', err.message);
  }

  return subscriptionCache;
}

export function findMatchingSubscription(ipoName, subscriptionList = []) {
  if (!ipoName || !Array.isArray(subscriptionList) || subscriptionList.length === 0) {
    return null;
  }

  const norm = ipoName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Exact or contains match
  const matched = subscriptionList.find(s => {
    const sNorm = (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return sNorm && (norm.includes(sNorm) || sNorm.includes(norm));
  });

  return matched || null;
}
