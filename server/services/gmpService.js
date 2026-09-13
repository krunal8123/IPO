import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

let gmpCache = [];
let lastGmpFetchTime = 0;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes live cache

export async function fetchLiveGmp() {
  const now = Date.now();
  if (gmpCache && gmpCache.length > 0 && (now - lastGmpFetchTime < CACHE_TTL_MS)) {
    return gmpCache;
  }

  try {
    const response = await axios.get('https://www.ipoji.com/ipo-gmp', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://www.ipoji.com/'
      },
      httpsAgent,
      timeout: 8000
    });

    const $ = cheerio.load(response.data);
    const liveResults = [];

    $('tr.gmp-row').each((_, element) => {
      const row = $(element);
      const name = row.attr('data-name');
      if (!name) return;

      const gmpPrice = parseFloat(row.attr('data-gmp')) || 0;
      const gmpPercent = parseFloat(row.attr('data-pct')) || 0;
      const estimatedListingPrice = parseFloat(row.attr('data-indicative')) || 0;
      const statusRaw = row.attr('data-status') || 'open';
      const typeRaw = row.attr('data-type') || 'mainboard';
      const updatedText = row.find('time.gmp-updated-time').text().trim() || 'Live Feed';
      const priceText = row.find('td').eq(2).text().replace(/\s+/g, ' ').trim();
      const dateText = row.find('td').eq(6).text().replace(/\s+/g, ' ').trim();

      liveResults.push({
        name: name.endsWith('IPO') ? name.replace(' IPO', '') : name,
        type: typeRaw,
        category: typeRaw.toLowerCase().includes('sme') ? 'sme' : 'mainboard',
        status: statusRaw === 'open' ? 'live' : statusRaw === 'upcoming' ? 'upcoming' : 'listed',
        gmpPrice,
        gmpPercent,
        estimatedListingPrice,
        trend: gmpPrice >= 0 ? 'up' : 'down',
        kostakRate: gmpPrice > 0 ? Math.floor(gmpPrice * 15) : 0,
        subjectToSauda: gmpPrice > 0 ? Math.floor(gmpPrice * 800) : 0,
        lastUpdated: updatedText,
        priceText,
        dateText
      });
    });

    if (liveResults.length > 0) {
      gmpCache = liveResults;
      lastGmpFetchTime = now;
      console.log(`[LiveGMP] Successfully scraped ${liveResults.length} real-time IPOs directly from live market feed.`);
      return liveResults;
    }
  } catch (err) {
    console.warn('[LiveGMP] Online fetch to live source had a hiccup, returning current live cache:', err.message);
  }

  return gmpCache;
}
