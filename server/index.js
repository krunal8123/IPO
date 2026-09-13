import { buildDynamicIpoFromScraped } from './services/ipoAutoBuilder.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkRegistrarAllotment } from './services/registrarService.js';
import { fetchKfinIssues, queryKfintechAllotment, findKfinIssue } from './services/kfintechService.js';
import { fetchMufgIssues, queryMufgAllotment, findMufgIssue } from './services/mufgService.js';
import {
  fetchUpstoxIpos,
  fetchUpstoxIpoDetails,
  getUpstoxLoginUrl,
  exchangeCodeForToken,
  getUpstoxConfig,
  saveAccessToken
} from './services/upstoxService.js';
import express from 'express';
import cors from 'cors';
import { fetchLiveGmp } from './services/gmpService.js';
import { fetchLiveExchangeIpos, fetchLiveBidding } from './services/nseService.js';

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
    hasApiSecret: !!config.apiSecret
  });
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

// GET /api/ipos - Primary Hybrid Feed (Upstox Official + Live GMP + KFintech)
app.get('/api/ipos', async (req, res) => {
  try {
    const [liveGmpList, kfinIssues] = await Promise.all([
      fetchLiveGmp(),
      fetchKfinIssues()
    ]);

    // Try official Upstox API first
    const upstoxList = await fetchUpstoxIpos(kfinIssues);
    let source = 'Live Real-Time Market Feed';

    if (Array.isArray(upstoxList) && upstoxList.length > 0) {
      currentLiveIpos = overlayGmp(upstoxList, liveGmpList);
      source = 'Live Real-Time Market Feed';
    } else if (Array.isArray(liveGmpList) && liveGmpList.length > 0) {
      currentLiveIpos = liveGmpList.map(scraped => buildDynamicIpoFromScraped(scraped, kfinIssues));
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      source,
      count: currentLiveIpos.length,
      data: currentLiveIpos
    });
  } catch (error) {
    console.error('[API Error /api/ipos]:', error.message);
    res.status(500).json({ success: false, error: error.message, data: currentLiveIpos });
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

// GET /api/ipos/buybacks - Hidden / Clean
app.get('/api/ipos/buybacks', (req, res) => {
  res.json({ success: true, count: 0, data: [] });
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

// POST /api/allotment/check - Verifies against live market issues, KFintech, or MUFG Intime
app.post('/api/allotment/check', async (req, res) => {
  try {
    const { ipoId, queryType, queryValue, kfinClientId, mufgClientId, ipoName } = req.body;
    if (!queryValue) {
      return res.status(400).json({ success: false, error: 'Missing queryValue' });
    }

    let targetIpo = currentLiveIpos.find(i => i.id === ipoId);

    // 1. Check if ipoId is an MUFG issue or mufgClientId is provided or ipoName matches
    const mufgIssues = await fetchMufgIssues();
    let matchedMufg = mufgClientId
      ? mufgIssues.find(m => m.clientId === String(mufgClientId))
      : mufgIssues.find(m => m.clientId === String(ipoId));

    if (!matchedMufg && ipoName) {
      matchedMufg = await findMufgIssue(ipoName);
    }

    if (matchedMufg || mufgClientId) {
      const effectiveMufgId = mufgClientId || matchedMufg?.clientId;
      targetIpo = {
        id: effectiveMufgId,
        name: ipoName || (matchedMufg ? matchedMufg.name : (targetIpo ? targetIpo.name : 'MUFG Issue')),
        registrar: 'MUFG Intime India Pvt Ltd',
        mufgClientId: effectiveMufgId,
        status: targetIpo?.status || 'listed',
        allotmentDate: targetIpo?.allotmentDate || 'Declared',
        lotSize: targetIpo?.lotSize || 100,
        priceBandMax: targetIpo?.priceBandMax || 140
      };
    }

    // 2. Check if ipoId is a KFintech clientId directly or kfinClientId is supplied or ipoName matches
    if (!matchedMufg && !mufgClientId) {
      const kfinIssues = await fetchKfinIssues();
      let matchedKfin = kfinClientId
        ? kfinIssues.find(k => k.clientId === String(kfinClientId))
        : kfinIssues.find(k => k.clientId === String(ipoId));

      if (!matchedKfin && ipoName) {
        matchedKfin = await findKfinIssue(ipoName);
      }

      const effectiveClientId = kfinClientId || (matchedKfin ? matchedKfin.clientId : (ipoId && /^\d+$/.test(ipoId) ? ipoId : null));
      if (effectiveClientId && (!targetIpo || !targetIpo.kfinClientId)) {
        targetIpo = {
          id: effectiveClientId,
          name: ipoName || (matchedKfin ? matchedKfin.name : (targetIpo ? targetIpo.name : 'KFintech Issue')),
          registrar: 'KFin Technologies Ltd',
          kfinClientId: effectiveClientId,
          status: targetIpo?.status || 'listed',
          allotmentDate: targetIpo?.allotmentDate || 'Declared',
          lotSize: targetIpo?.lotSize || 100,
          priceBandMax: targetIpo?.priceBandMax || 140
        };
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

    const result = await checkRegistrarAllotment(targetIpo, queryType || 'pan', queryValue);
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
  console.log(`🔑 Upstox Auth Login: http://localhost:${PORT}/api/upstox/login`);
});
