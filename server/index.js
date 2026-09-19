import { buildDynamicIpoFromScraped } from './services/ipoAutoBuilder.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkRegistrarAllotment } from './services/registrarService.js';
import { fetchKfinIssues, queryKfintechAllotment, findKfinIssue } from './services/kfintechService.js';
import { fetchMufgIssues, queryMufgAllotment, findMufgIssue } from './services/mufgService.js';
import { fetchBigshareIssues, queryBigshareAllotment, findBigshareIssue, fetchBigshareCaptcha, checkBigshareServersHealth, BIGSHARE_SERVERS } from './services/bigshareService.js';
import {
  fetchUpstoxIpos,
  fetchUpstoxIpoDetails,
  getUpstoxLoginUrl,
  exchangeCodeForToken,
  getUpstoxConfig,
  saveAccessToken,
  saveUpstoxCredentials,
  evaluateIpoStatus
} from './services/upstoxService.js';
import express from 'express';
import cors from 'cors';
import { fetchLiveGmp } from './services/gmpService.js';
import { fetchLiveExchangeIpos, fetchLiveBidding } from './services/nseService.js';
import { fetchLiveSubscription } from './services/subscriptionService.js';
import { fetchLiveBuybacks } from './services/buybackService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Direct Mobile Download Endpoints
app.get(['/download', '/install'], (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Download IPORadar Android App</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: #131c31; border: 1px solid #1e293b; border-radius: 28px; padding: 32px 24px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .icon { width: 68px; height: 68px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(99,102,241,0.4); }
        h1 { margin: 0 0 8px; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
        .badge { display: inline-block; padding: 4px 12px; background: #10b98120; color: #10b981; border: 1px solid #10b98140; border-radius: 999px; font-size: 11px; font-weight: 800; margin-bottom: 18px; text-transform: uppercase; }
        p { color: #94a3b8; font-size: 13px; line-height: 1.5; margin-bottom: 26px; }
        .btn { display: block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff; font-size: 15px; font-weight: 800; padding: 16px 24px; border-radius: 16px; text-decoration: none; box-shadow: 0 10px 20px rgba(79,70,229,0.35); transition: transform 0.15s; }
        .btn:active { transform: scale(0.98); }
        .instructions { margin-top: 24px; padding: 14px; background: #0f172a; border-radius: 14px; text-align: left; font-size: 11px; color: #64748b; line-height: 1.6; }
        .instructions strong { color: #cbd5e1; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">📡</div>
        <div class="badge">Verified Release • v1.0.0</div>
        <h1>IPORadar Android App</h1>
        <p>Official build ready for your phone with Live Real-Time Market Feed & Instant Allotment Status.</p>
        <a href="/apk" class="btn">📥 Download APK (4.3 MB)</a>
        <div class="instructions">
          <strong>Installation Guide:</strong><br>
          1. Tap the download button above.<br>
          2. When download finishes, open the file.<br>
          3. If Android prompts <em>"Install unknown apps"</em>, toggle <strong>Allow from this source</strong>.<br>
          4. Tap <strong>Install</strong> to enjoy IPORadar!
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/apk', (req, res) => {
  const apkPath = path.resolve(__dirname, '../IPORadar-debug.apk');
  res.download(apkPath, 'IPORadar.apk');
});

// In-memory cache of live IPOs
let currentLiveIpos = [];

function overlayGmp(ipos, gmpList) {
  if (!Array.isArray(gmpList) || gmpList.length === 0) return ipos;
  return ipos.map(ipo => {
    const cleanName = ipo.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matched = gmpList.find(g => {
      const gNorm = (g.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return gNorm.includes(cleanName) || cleanName.includes(gNorm);
    });
    if (matched && typeof matched.gmpPrice === 'number') {
      return {
        ...ipo,
        gmp: {
          gmpPrice: matched.gmpPrice,
          gmpPercent: matched.gmpPercent || 0,
          estimatedListingPrice: matched.estimatedListingPrice || (ipo.priceBandMax + matched.gmpPrice),
          trend: matched.gmpPrice >= 0 ? 'up' : 'down',
          kostakRate: matched.kostakRate || 0,
          subjectToSauda: matched.subjectToSauda || 0,
          lastUpdated: matched.lastUpdated || 'Live Market Feed'
        }
      };
    }
    return ipo;
  });
}

// Health endpoint
app.get('/api/health', (req, res) => {
  const upstoxConfig = getUpstoxConfig();
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    service: 'IPORadar Hybrid Feed Engine (Upstox API + KFintech RTA + MUFG + Live GMP)',
    hasUpstoxAuth: !!upstoxConfig.accessToken,
    liveCount: currentLiveIpos.length
  });
});

// GET /api/upstox/status
app.get('/api/upstox/status', (req, res) => {
  const config = getUpstoxConfig();
  res.json({
    success: true,
    hasAccessToken: !!config.accessToken,
    hasApiKey: !!config.apiKey,
    hasApiSecret: !!config.apiSecret,
    source: config.accessToken ? 'Upstox Official API (api.upstox.com)' : 'Live Market Feed'
  });
});

// POST /api/upstox/token - Save or update Upstox credentials
app.post('/api/upstox/token', (req, res) => {
  try {
    const { accessToken, apiKey, apiSecret } = req.body;
    saveUpstoxCredentials({ accessToken, apiKey, apiSecret });
    res.json({
      success: true,
      message: 'Upstox credentials updated successfully. Next fetch will query Upstox API directly.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/upstox/login - Redirects to Upstox login dialog
app.get('/api/upstox/login', (req, res) => {
  const loginUrl = getUpstoxLoginUrl();
  if (!loginUrl) {
    return res.status(400).send('Please configure UPSTOX_API_KEY in your .env file first.');
  }
  res.redirect(loginUrl);
});

// GET /api/upstox/callback - OAuth token exchange
app.get('/api/upstox/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Missing authorization code in Upstox callback.');
  }
  try {
    const tokenData = await exchangeCodeForToken(code);
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Upstox Authentication Successful</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: white; }
          .card { background: #1e293b; padding: 40px; border-radius: 24px; text-align: center; border: 1px solid #334155; max-width: 480px; }
          .badge { background: #10b98120; color: #10b981; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: bold; display: inline-block; margin-bottom: 16px; }
          h1 { margin: 0 0 12px 0; font-size: 24px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
          .btn { background: #4f46e5; color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; text-decoration: none; display: inline-block; transition: background 0.2s; }
          .btn:hover { background: #4338ca; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">Connected</div>
          <h1>Upstox API Authorized!</h1>
          <p>Your 24-hour access token has been generated and saved to .env. IPORadar will now prioritize official, clean market data directly from Upstox.</p>
          <a href="/" class="btn">Return to Application</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`Upstox token exchange failed: ${err.message}`);
  }
});

// GET /api/ipos - Primary Hybrid Feed (Upstox Official + Live GMP + KFintech + Live Subscription)
app.get('/api/ipos', async (req, res) => {
  try {
    const [liveGmpList, kfinIssues, liveSubscriptions] = await Promise.all([
      fetchLiveGmp(),
      fetchKfinIssues(),
      fetchLiveSubscription()
    ]);

    // Try official Upstox API first
    const upstoxList = await fetchUpstoxIpos(kfinIssues);
    let source = 'Live Real-Time Market Feed';

    if (Array.isArray(upstoxList) && upstoxList.length > 0) {
      currentLiveIpos = overlayGmp(upstoxList, liveGmpList);
      source = 'Upstox Official API (api.upstox.com)';
    } else if (Array.isArray(liveGmpList) && liveGmpList.length > 0) {
      currentLiveIpos = liveGmpList.map(scraped => buildDynamicIpoFromScraped(scraped, kfinIssues, liveSubscriptions));
    }

    // Dynamically evaluate status and enforce SEBI retail rules for every issue
    const normalizedIpos = currentLiveIpos.map(ipo => {
      const isSme = ipo.category === 'sme';
      const price = ipo.cutOffPrice || ipo.priceBandMax || 100;
      let lot = ipo.lotSize;
      if (!isSme && price > 0) {
        const maxAllowed = Math.max(1, Math.floor(15000 / price));
        if (!lot || lot <= 0 || (lot * price > 15000)) {
          lot = maxAllowed;
        }
      }
      const minInvestment = lot * price;
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
        minimumQuantity: (!isSme && ipo.minimumQuantity && ipo.minimumQuantity * price > 15000) ? lot : (ipo.minimumQuantity || lot),
        status,
        badge
      };
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      source,
      count: normalizedIpos.length,
      data: normalizedIpos
    });
  } catch (error) {
    console.error('[API Error /api/ipos]:', error.message);
    res.status(500).json({ success: false, error: error.message, data: currentLiveIpos });
  }
});

// GET /api/subscription - Direct Live Subscription table
app.get('/api/subscription', async (req, res) => {
  try {
    const subs = await fetchLiveSubscription();
    res.json({ success: true, count: subs.length, data: subs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ipos/gmp - Dedicated live GMP feed
app.get('/api/ipos/gmp', async (req, res) => {
  try {
    const liveGmp = await fetchLiveGmp();
    res.json({ success: true, timestamp: new Date().toISOString(), data: liveGmp });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/buybacks - Live buyback data scraped from live market feed
app.get('/api/buybacks', async (req, res) => {
  try {
    const buybacks = await fetchLiveBuybacks();
    res.json({ success: true, count: buybacks.length, data: buybacks });
  } catch (err) {
    console.error('[API Error /api/buybacks]:', err.message);
    res.status(500).json({ success: false, error: err.message, data: [] });
  }
});

// GET /api/ipos/buybacks - Legacy alias for backward compatibility
app.get('/api/ipos/buybacks', async (req, res) => {
  try {
    const buybacks = await fetchLiveBuybacks();
    res.json({ success: true, count: buybacks.length, data: buybacks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, data: [] });
  }
});

// GET /api/ipos/calendar - Dynamically generated from live active market issues
app.get('/api/ipos/calendar', (req, res) => {
  const eventsByDate = {};

  currentLiveIpos.forEach(ipo => {
    if (ipo.openDate && ipo.openDate !== 'Active') {
      eventsByDate[ipo.openDate] = eventsByDate[ipo.openDate] || [];
      eventsByDate[ipo.openDate].push({ ipoName: ipo.name, category: ipo.category, type: 'Open' });
    }
    if (ipo.closeDate && ipo.closeDate !== 'Active') {
      eventsByDate[ipo.closeDate] = eventsByDate[ipo.closeDate] || [];
      eventsByDate[ipo.closeDate].push({ ipoName: ipo.name, category: ipo.category, type: 'Close' });
    }
    if (ipo.allotmentDate && ipo.allotmentDate !== 'T+1') {
      eventsByDate[ipo.allotmentDate] = eventsByDate[ipo.allotmentDate] || [];
      eventsByDate[ipo.allotmentDate].push({ ipoName: ipo.name, category: ipo.category, type: 'Allotment' });
    }
    if (ipo.listingDate && ipo.listingDate !== 'T+3') {
      eventsByDate[ipo.listingDate] = eventsByDate[ipo.listingDate] || [];
      eventsByDate[ipo.listingDate].push({ ipoName: ipo.name, category: ipo.category, type: 'Listing' });
    }
  });

  const formattedEvents = Object.keys(eventsByDate).map(date => ({
    date,
    events: eventsByDate[date]
  }));

  res.json({ success: true, count: formattedEvents.length, data: formattedEvents });
});

// GET /api/ipos/:id - Real-time full details from Upstox get-ipo-details endpoint
app.get('/api/ipos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const kfinIssues = await fetchKfinIssues();
    const upstoxDetail = await fetchUpstoxIpoDetails(id, kfinIssues);

    if (upstoxDetail) {
      // Find matching live GMP if any
      const liveGmpList = await fetchLiveGmp();
      const matchedWithGmp = overlayGmp([upstoxDetail.mapped], liveGmpList);

      return res.json({
        success: true,
        source: 'Official Upstox Detail Endpoint (api.upstox.com/v2/ipos/:id)',
        data: matchedWithGmp[0] || upstoxDetail.mapped,
        raw: upstoxDetail.raw
      });
    }

    // Fallback: check current cached list
    const cached = currentLiveIpos.find(i => i.id === id || i.symbol.toLowerCase() === id.toLowerCase());
    if (cached) {
      return res.json({
        success: true,
        source: 'Local Master Cache',
        data: cached
      });
    }

    res.status(404).json({ success: false, message: `IPO with id "${id}" not found` });
  } catch (error) {
    console.error(`[API Error /api/ipos/${req.params.id}]:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/allotment/kfin-issues - Returns all official issues currently declared on KFintech
app.get('/api/allotment/kfin-issues', async (req, res) => {
  try {
    const issues = await fetchKfinIssues();
    res.json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    console.error('[API Error /api/allotment/kfin-issues]:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/allotment/mufg-issues - Returns all official issues currently declared on MUFG Intime
app.get('/api/allotment/mufg-issues', async (req, res) => {
  try {
    const issues = await fetchMufgIssues();
    res.json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    console.error('[API Error /api/allotment/mufg-issues]:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/allotment/bigshare-issues - Returns all official issues currently declared on Bigshare Services
app.get('/api/allotment/bigshare-issues', async (req, res) => {
  try {
    const issues = await fetchBigshareIssues();
    res.json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    console.error('[API Error /api/allotment/bigshare-issues]:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/allotment/bigshare-servers - Returns real-time health & latency across Bigshare servers
app.get('/api/allotment/bigshare-servers', async (req, res) => {
  try {
    const servers = await checkBigshareServersHealth();
    res.json({ success: true, data: servers });
  } catch (error) {
    console.error('[API Error /api/allotment/bigshare-servers]:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/allotment/bigshare-captcha - Generates fresh CAPTCHA token and base64 challenge image
app.get('/api/allotment/bigshare-captcha', async (req, res) => {
  try {
    const preferredServer = req.query.server ? String(req.query.server).toLowerCase() : undefined;
    const captcha = await fetchBigshareCaptcha(preferredServer);
    if (captcha.success) {
      res.json({
        success: true,
        token: captcha.token,
        image: captcha.image,
        serverId: captcha.serverId,
        serverName: captcha.serverName,
        serverUrl: captcha.serverUrl,
        portalUrl: captcha.portalUrl
      });
    } else {
      res.status(500).json({ success: false, error: captcha.error });
    }
  } catch (error) {
    console.error('[API Error /api/allotment/bigshare-captcha]:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/allotment/check - Verifies against live market issues, KFintech, MUFG Intime, or Bigshare
app.post('/api/allotment/check', async (req, res) => {
  try {
    const { ipoId, queryType, queryValue, kfinClientId, mufgClientId, bigshareCompanyId, captchaToken, captchaAnswer, ipoName, bigshareServerId } = req.body;
    if (!queryValue) {
      return res.status(400).json({ success: false, error: 'Missing queryValue' });
    }

    let targetIpo = currentLiveIpos.find(i => i.id === ipoId);

    // 1. Explicit Registrar IDs passed in request
    if (bigshareCompanyId) {
      targetIpo = {
        id: String(bigshareCompanyId),
        name: ipoName || targetIpo?.name || 'Bigshare Issue',
        registrar: 'Bigshare Services Pvt Ltd',
        bigshareCompanyId: String(bigshareCompanyId),
        status: targetIpo?.status || 'listed',
        allotmentDate: targetIpo?.allotmentDate || 'Declared',
        lotSize: targetIpo?.lotSize || 100,
        priceBandMax: targetIpo?.priceBandMax || 140
      };
    } else if (mufgClientId) {
      targetIpo = {
        id: String(mufgClientId),
        name: ipoName || targetIpo?.name || 'MUFG Issue',
        registrar: 'MUFG Intime India Pvt Ltd',
        mufgClientId: String(mufgClientId),
        status: targetIpo?.status || 'listed',
        allotmentDate: targetIpo?.allotmentDate || 'Declared',
        lotSize: targetIpo?.lotSize || 100,
        priceBandMax: targetIpo?.priceBandMax || 140
      };
    } else if (kfinClientId) {
      targetIpo = {
        id: String(kfinClientId),
        name: ipoName || targetIpo?.name || 'KFintech Issue',
        registrar: 'KFin Technologies Ltd',
        kfinClientId: String(kfinClientId),
        status: targetIpo?.status || 'listed',
        allotmentDate: targetIpo?.allotmentDate || 'Declared',
        lotSize: targetIpo?.lotSize || 100,
        priceBandMax: targetIpo?.priceBandMax || 140
      };
    } else {
      // 2. Check if ipoId directly matches a registrar issue ID
      const [bigshareIssues, mufgIssues, kfinIssues] = await Promise.all([
        fetchBigshareIssues(),
        fetchMufgIssues(),
        fetchKfinIssues()
      ]);

      const matchedBigshare = bigshareIssues.find(b => b.companyId === String(ipoId));
      const matchedMufg = mufgIssues.find(m => m.clientId === String(ipoId));
      const matchedKfin = kfinIssues.find(k => k.clientId === String(ipoId));

      if (matchedBigshare) {
        targetIpo = {
          id: matchedBigshare.companyId,
          name: ipoName || matchedBigshare.name,
          registrar: 'Bigshare Services Pvt Ltd',
          bigshareCompanyId: matchedBigshare.companyId,
          status: targetIpo?.status || 'listed',
          allotmentDate: targetIpo?.allotmentDate || 'Declared',
          lotSize: targetIpo?.lotSize || 100,
          priceBandMax: targetIpo?.priceBandMax || 140
        };
      } else if (matchedMufg) {
        targetIpo = {
          id: matchedMufg.clientId,
          name: ipoName || matchedMufg.name,
          registrar: 'MUFG Intime India Pvt Ltd',
          mufgClientId: matchedMufg.clientId,
          status: targetIpo?.status || 'listed',
          allotmentDate: targetIpo?.allotmentDate || 'Declared',
          lotSize: targetIpo?.lotSize || 100,
          priceBandMax: targetIpo?.priceBandMax || 140
        };
      } else if (matchedKfin) {
        targetIpo = {
          id: matchedKfin.clientId,
          name: ipoName || matchedKfin.name,
          registrar: 'KFin Technologies Ltd',
          kfinClientId: matchedKfin.clientId,
          status: targetIpo?.status || 'listed',
          allotmentDate: targetIpo?.allotmentDate || 'Declared',
          lotSize: targetIpo?.lotSize || 100,
          priceBandMax: targetIpo?.priceBandMax || 140
        };
      } else if (targetIpo && targetIpo.registrar) {
        const reg = targetIpo.registrar.toLowerCase();
        if (reg.includes('bigshare')) {
          const bsMatch = await findBigshareIssue(targetIpo.name);
          targetIpo.bigshareCompanyId = bsMatch?.companyId || targetIpo.bigshareCompanyId;
        } else if (reg.includes('mufg') || reg.includes('link intime')) {
          const mufgMatch = await findMufgIssue(targetIpo.name);
          targetIpo.mufgClientId = mufgMatch?.clientId || targetIpo.mufgClientId;
        } else if (reg.includes('kfin') || reg.includes('karvy')) {
          const kfinMatch = await findKfinIssue(targetIpo.name);
          targetIpo.kfinClientId = kfinMatch?.clientId || targetIpo.kfinClientId;
        }
      } else if (ipoName) {
        // 3. Fallback search by IPO name
        const [bsMatch, mMatch, kMatch] = await Promise.all([
          findBigshareIssue(ipoName),
          findMufgIssue(ipoName),
          findKfinIssue(ipoName)
        ]);

        if (bsMatch) {
          targetIpo = {
            id: bsMatch.companyId,
            name: ipoName,
            registrar: 'Bigshare Services Pvt Ltd',
            bigshareCompanyId: bsMatch.companyId,
            status: 'listed'
          };
        } else if (mMatch) {
          targetIpo = {
            id: mMatch.clientId,
            name: ipoName,
            registrar: 'MUFG Intime India Pvt Ltd',
            mufgClientId: mMatch.clientId,
            status: 'listed'
          };
        } else if (kMatch) {
          targetIpo = {
            id: kMatch.clientId,
            name: ipoName,
            registrar: 'KFin Technologies Ltd',
            kfinClientId: kMatch.clientId,
            status: 'listed'
          };
        }
      }
    }

    if (!targetIpo) {
      targetIpo = {
        id: ipoId || 'ipo',
        name: ipoName || 'IPO Issue',
        registrar: 'Link Intime India Pvt Ltd',
        status: 'listed'
      };
    }

    const result = await checkRegistrarAllotment(targetIpo, queryType || 'pan', queryValue, {
      bigshareCompanyId: targetIpo?.bigshareCompanyId || bigshareCompanyId,
      captchaToken,
      captchaAnswer,
      bigshareServerId
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[API Error /api/allotment/check]:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve production static assets from dist
app.use(express.static(path.join(__dirname, '../dist')));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 [IPORadar Hybrid Server] Running at http://localhost:${PORT}`);
  console.log(`📡 Real-Time Live Feed API: http://localhost:${PORT}/api/ipos`);
  console.log(`🔥 Live GMP Feed: http://localhost:${PORT}/api/ipos/gmp`);
  console.log(`📋 KFintech Issues: http://localhost:${PORT}/api/allotment/kfin-issues`);
  console.log(`📋 MUFG Intime Issues: http://localhost:${PORT}/api/allotment/mufg-issues`);
  console.log(`📋 Bigshare Issues: http://localhost:${PORT}/api/allotment/bigshare-issues`);
  console.log(`🔑 Upstox Auth Login: http://localhost:${PORT}/api/upstox/login`);
});
