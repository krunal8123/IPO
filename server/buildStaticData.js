import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchLiveGmp } from './services/gmpService.js';
import { fetchKfinIssues } from './services/kfintechService.js';
import { fetchMufgIssues } from './services/mufgService.js';
import { fetchLiveSubscription } from './services/subscriptionService.js';
import { fetchUpstoxIpos } from './services/upstoxService.js';
import { buildDynamicIpoFromScraped } from './services/ipoAutoBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '../public/data');

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

async function buildStaticData() {
  console.log('🚀 [Build Static Data] Starting automated market scraper...');
  const startTime = Date.now();

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    const [liveGmpList, kfinIssues, liveSubscriptions, mufgIssues] = await Promise.all([
      fetchLiveGmp().catch(e => { console.warn('GMP fetch warning:', e.message); return []; }),
      fetchKfinIssues().catch(e => { console.warn('KFin fetch warning:', e.message); return []; }),
      fetchLiveSubscription().catch(e => { console.warn('Subscription fetch warning:', e.message); return []; }),
      fetchMufgIssues().catch(e => { console.warn('MUFG fetch warning:', e.message); return []; })
    ]);

    console.log(`📊 Scraped raw items: GMP=${liveGmpList.length}, KFin=${kfinIssues.length}, Subs=${liveSubscriptions.length}, MUFG=${mufgIssues.length}`);

    // Fetch official Upstox IPOs
    let upstoxList = [];
    try {
      upstoxList = await fetchUpstoxIpos(kfinIssues);
    } catch (e) {
      console.warn('Upstox API warning:', e.message);
    }

    let ipos = [];
    let source = 'Live Real-Time Market Feed';

    if (Array.isArray(upstoxList) && upstoxList.length > 0) {
      ipos = overlayGmp(upstoxList, liveGmpList);
      source = 'Official Market Feed';
    } else if (Array.isArray(liveGmpList) && liveGmpList.length > 0) {
      ipos = liveGmpList.map(scraped => buildDynamicIpoFromScraped(scraped, kfinIssues, liveSubscriptions));
      source = 'Verified Market Scraper';
    }

    // Write primary ipos.json payload
    const iposPayload = {
      success: true,
      timestamp: new Date().toISOString(),
      source,
      count: ipos.length,
      data: ipos
    };

    fs.writeFileSync(path.join(outputDir, 'ipos.json'), JSON.stringify(iposPayload, null, 2), 'utf8');
    console.log(`✅ [ipos.json] Saved ${ipos.length} IPOs with GMP and authentic logos`);

    // Write KFin & MUFG lists
    fs.writeFileSync(path.join(outputDir, 'kfin.json'), JSON.stringify({ success: true, count: kfinIssues.length, data: kfinIssues }, null, 2), 'utf8');
    fs.writeFileSync(path.join(outputDir, 'mufg.json'), JSON.stringify({ success: true, count: mufgIssues.length, data: mufgIssues }, null, 2), 'utf8');
    fs.writeFileSync(path.join(outputDir, 'subscription.json'), JSON.stringify({ success: true, count: liveSubscriptions.length, data: liveSubscriptions }, null, 2), 'utf8');

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`🎉 [Static Data Complete] All 4 data feeds generated in ${duration}s -> public/data/`);
  } catch (error) {
    console.error('❌ [Build Static Data Error]:', error);
    process.exit(1);
  }
}

buildStaticData();
