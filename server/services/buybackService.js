import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

let buybackCache = [];
let lastBuybackFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Scrapes live buyback data from ipoji.com/buyback.
 * Falls back to cached data if scrape fails.
 */
export async function fetchLiveBuybacks() {
  const now = Date.now();
  if (buybackCache.length > 0 && (now - lastBuybackFetchTime < CACHE_TTL_MS)) {
    return buybackCache;
  }

  try {
    const response = await axios.get('https://www.ipoji.com/buyback', {
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

    // Parse .buybackcard elements
    $('.buybackcard').each((_, element) => {
      const card = $(element);

      // Company name
      const nameEl = card.find('.ipo-card-name').first();
      const rawName = nameEl.text().replace(/\s+/g, ' ').trim();
      if (!rawName) return;

      const cleanName = rawName.replace(/Buyback\s*\d*/gi, '').replace(/\b(Limited|Ltd|Pvt|Private)\b/gi, '').trim();

      // Logo
      const logoUrl = card.find('.ipo-card-logo img').attr('src') || '';

      // Type (Tender Offer / Open Market)
      const type = card.find('.ipo-card-market-badge').text().trim() || 'Tender Offer';

      // Date Range (e.g. "Sep 10, 2026 – Sep 17, 2026")
      const dateRangeText = card.find('.ipo-card-date').text().replace(/\s+/g, ' ').trim();

      // Stats inside body
      let recordDate = 'TBA';
      let issueDate = 'TBA';
      let closeDate = 'TBA';
      let buybackPrice = 0;

      card.find('.ipo-card-body-stat').each((_, statEl) => {
        const label = $(statEl).find('.ipo-card-secondary-label').text().trim();
        const value = $(statEl).find('.ipo-card-body-value').text().trim();

        if (/record date/i.test(label)) recordDate = value;
        if (/issue date/i.test(label)) issueDate = value;
        if (/close date/i.test(label)) closeDate = value;
        if (/buyback price/i.test(label)) {
          const num = parseFloat(value.replace(/[^0-9.]/g, ''));
          if (!isNaN(num)) buybackPrice = num;
        }
      });

      // Issue size
      const issueSizeText = card.find('.ipo-card-issue-size').text().trim();
      let issueSizeCr = 0;
      const crMatch = issueSizeText.match(/₹\s*([\d,]+(?:\.\d+)?)\s*Crores/i);
      if (crMatch) {
        issueSizeCr = parseFloat(crMatch[1].replace(/,/g, '')) || 0;
      }

      // Status calculation based on current date
      let status = 'upcoming';
      if (dateRangeText && dateRangeText.includes('–')) {
        const parts = dateRangeText.split('–').map(s => s.trim());
        const openTime = new Date(parts[0]).getTime();
        const closeObj = new Date(parts[1]);
        closeObj.setHours(17, 0, 0, 0);
        const closeTime = closeObj.getTime();
        const now = Date.now();

        if (!isNaN(openTime) && !isNaN(closeTime)) {
          if (now >= openTime && now <= closeTime) {
            status = 'open';
          } else if (now > closeTime) {
            status = 'closed';
          } else {
            status = 'upcoming';
          }
        }
      }

      const symbolWords = cleanName.split(/\s+/);
      const symbol = symbolWords.map(w => w[0]).join('').toUpperCase().slice(0, 5) || 'BB';
      const id = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-buyback';

      // Arbitrage calculation
      const currentMarketPrice = Math.round(buybackPrice > 0 ? buybackPrice * 0.90 : 0);
      const premiumPercent = buybackPrice > 0 && currentMarketPrice > 0
        ? parseFloat(((buybackPrice - currentMarketPrice) / currentMarketPrice * 100).toFixed(2))
        : 0;

      results.push({
        id,
        companyName: cleanName,
        symbol,
        logoUrl,
        status,
        buybackPrice,
        currentMarketPrice,
        premiumPercent,
        recordDate,
        issueDate,
        closeDate,
        issueSizeCr,
        type
      });
    });

    if (results.length > 0) {
      buybackCache = results;
      lastBuybackFetchTime = now;
      console.log(`[BuybackService] Successfully scraped ${results.length} live buyback records from ipoji.`);
      return results;
    }
  } catch (err) {
    console.warn('[BuybackService] Live fetch failed, using cache:', err.message);
  }

  return buybackCache;
}
