import https from 'https';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
import axios from 'axios';

let nseCookie = null;
let lastCookieTime = 0;
const COOKIE_TTL_MS = 10 * 60 * 1000; // 10 mins

async function getNseHeaders() {
  const now = Date.now();
  if (!nseCookie || (now - lastCookieTime > COOKIE_TTL_MS)) {
    try {
      const handshake = await axios.get('https://www.nseindia.com', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        timeout: 5000,
        httpsAgent
      });
      const rawCookies = handshake.headers['set-cookie'];
      if (rawCookies) {
        nseCookie = rawCookies.map(c => c.split(';')[0]).join('; ');
        lastCookieTime = now;
      }
    } catch (e) {
      // ignore
    }
  }

  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': 'https://www.nseindia.com/market-data/all-upcoming-issues-ipo',
    'Accept': 'application/json, text/plain, */*',
    'Cookie': nseCookie || ''
  };
}

export async function fetchLiveExchangeIpos() {
  try {
    const headers = await getNseHeaders();
    const response = await axios.get('https://www.nseindia.com/api/ipo-current-issue', {
      headers,
      timeout: 5000
    });

    if (Array.isArray(response.data)) {
      console.log(`[NSE API] Fetched ${response.data.length} live issues directly from NSE.`);
      return response.data;
    }
  } catch (error) {
    // NSE rate limits or requires dynamic session renewal
  }
  return [];
}

export async function fetchLiveBidding(symbol) {
  try {
    const headers = await getNseHeaders();
    const response = await axios.get(`https://www.nseindia.com/api/ipo-bid-details?issue=${encodeURIComponent(symbol)}`, {
      headers,
      timeout: 5000
    });
    return response.data;
  } catch (err) {
    return null;
  }
}
