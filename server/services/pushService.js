/**
 * IPORadar Push Notification Service
 * Manages VAPID-based Web Push subscriptions and sends typed notifications.
 *
 * Subscription store: server/data/subscriptions.json  (flat JSON array)
 * VAPID keys come from environment variables.
 */

import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const SUBS_FILE = path.join(DATA_DIR, 'subscriptions.json');
const SNAPSHOT_FILE = path.join(DATA_DIR, 'ipo_snapshot.json');

// ── VAPID setup ──────────────────────────────────────────────────────────────
const VAPID_PUBLIC_KEY  = process.env.VAPID_PUBLIC_KEY  || 'BDpLT6qTBzeIQSIlwGrG6NJWIs70CuPKAvD8sWownfg5E2seBThhxzqmdSPcs-CMkg0RdBt6s-vLE0X_Wv0jffk';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'Igw5i22hHPJS_OKvugu67Q7-y7XxsFEof2VNQ75hA_k';
const VAPID_SUBJECT     = process.env.VAPID_SUBJECT     || 'mailto:admin@iporadar.app';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// ── Helpers ───────────────────────────────────────────────────────────────────
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadSubscriptions() {
  ensureDir();
  if (!fs.existsSync(SUBS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8')); } catch { return []; }
}

function saveSubscriptions(subs) {
  ensureDir();
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2), 'utf8');
}

function loadSnapshot() {
  if (!fs.existsSync(SNAPSHOT_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8')); } catch { return {}; }
}

function saveSnapshot(data) {
  ensureDir();
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Save a new push subscription (dedup by endpoint) */
export function addSubscription(sub) {
  const subs = loadSubscriptions();
  const existing = subs.findIndex(s => s.endpoint === sub.endpoint);
  if (existing >= 0) {
    subs[existing] = sub;
  } else {
    subs.push(sub);
  }
  saveSubscriptions(subs);
  return subs.length;
}

/** Remove a push subscription by endpoint */
export function removeSubscription(endpoint) {
  const subs = loadSubscriptions().filter(s => s.endpoint !== endpoint);
  saveSubscriptions(subs);
}

/** Return subscriber count */
export function getSubscriberCount() {
  return loadSubscriptions().length;
}

/** Return VAPID public key for the browser */
export function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY;
}

/**
 * Send a push notification to ALL subscribers.
 * @param {object} payload - { title, body, icon, badge, tag, url, data }
 */
export async function sendPushToAll(payload) {
  const subs = loadSubscriptions();
  if (subs.length === 0) return { sent: 0, failed: 0, removed: 0 };

  const notification = JSON.stringify({
    title: payload.title || 'IPORadar',
    body: payload.body || '',
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/icon-192.png',
    tag: payload.tag || 'iporadar-update',
    url: payload.url || '/',
    data: payload.data || {}
  });

  let sent = 0, failed = 0, toRemove = [];

  await Promise.allSettled(
    subs.map(async sub => {
      try {
        await webpush.sendNotification(sub, notification);
        sent++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          toRemove.push(sub.endpoint);
        }
        failed++;
        console.warn('[Push] Failed to notify endpoint:', err.statusCode || err.message);
      }
    })
  );

  if (toRemove.length > 0) {
    const cleaned = loadSubscriptions().filter(s => !toRemove.includes(s.endpoint));
    saveSubscriptions(cleaned);
  }

  console.log(`[Push] Sent=${sent} Failed=${failed} Removed=${toRemove.length} Total=${subs.length}`);
  return { sent, failed, removed: toRemove.length };
}

/**
 * Diff current IPO list against previous snapshot and fire targeted notifications.
 * Called by buildStaticData.js after each scraper run.
 */
export async function notifyIpoChanges(currentIpos) {
  if (!Array.isArray(currentIpos) || currentIpos.length === 0) return;

  const snapshot = loadSnapshot();
  const prev = snapshot.ipos || [];

  const prevMap = {};
  prev.forEach(i => { prevMap[i.id] = i; });

  const notifications = [];

  for (const ipo of currentIpos) {
    const old = prevMap[ipo.id];

    // 1. Brand-new IPO announced
    if (!old) {
      if (ipo.status === 'upcoming') {
        notifications.push({
          title: `New IPO Announced: ${ipo.name}`,
          body: `Opens ${ipo.openDate} | Price Band Rs ${ipo.priceBandMin}-${ipo.priceBandMax} | Lot: ${ipo.lotSize} shares`,
          tag: `new-ipo-${ipo.id}`,
          url: '/#ipos',
          data: { type: 'new_ipo', id: ipo.id }
        });
      }
      if (ipo.status === 'live') {
        notifications.push({
          title: `IPO Open Now: ${ipo.name}`,
          body: `Bidding is LIVE until ${ipo.closeDate} | Rs ${ipo.priceBandMin}-${ipo.priceBandMax}`,
          tag: `live-ipo-${ipo.id}`,
          url: '/#ipos',
          data: { type: 'ipo_live', id: ipo.id }
        });
      }
      continue;
    }

    // 2. Status changed to LIVE
    if (old.status !== 'live' && ipo.status === 'live') {
      notifications.push({
        title: `IPO Opens Today: ${ipo.name}`,
        body: `Bidding is LIVE! Apply before ${ipo.closeDate} | Rs ${ipo.priceBandMin}-${ipo.priceBandMax}`,
        tag: `live-ipo-${ipo.id}`,
        url: '/#ipos',
        data: { type: 'ipo_opened', id: ipo.id }
      });
    }

    // 3. Allotment declared
    if (old.status !== 'allotted' && ipo.status === 'allotted') {
      notifications.push({
        title: `Allotment Declared: ${ipo.name}`,
        body: `Check your allotment status now! Listing date: ${ipo.listingDate || 'Soon'}`,
        tag: `allotment-${ipo.id}`,
        url: '/#allotment',
        data: { type: 'allotment_declared', id: ipo.id }
      });
    }

    // 4. Listed on exchange
    if (old.status !== 'listed' && ipo.status === 'listed') {
      const gmpPct = ipo.gmp && ipo.gmp.gmpPercent ? ipo.gmp.gmpPercent : 0;
      notifications.push({
        title: `${ipo.name} Listed!`,
        body: `Listed with ${gmpPct >= 0 ? '+' : ''}${gmpPct}% premium. Check gains on IPORadar.`,
        tag: `listed-${ipo.id}`,
        url: '/#gmp',
        data: { type: 'ipo_listed', id: ipo.id }
      });
    }

    // 5. GMP spike (>=15% change in either direction)
    const oldGmp = (old.gmp && old.gmp.gmpPercent) ? old.gmp.gmpPercent : 0;
    const newGmp = (ipo.gmp && ipo.gmp.gmpPercent) ? ipo.gmp.gmpPercent : 0;
    if (ipo.status === 'live' && Math.abs(newGmp - oldGmp) >= 15) {
      const dir = newGmp > oldGmp ? 'GMP Surge' : 'GMP Drop';
      notifications.push({
        title: `${dir}: ${ipo.name} now ${newGmp >= 0 ? '+' : ''}${newGmp}%`,
        body: `Grey Market Premium changed from ${oldGmp >= 0 ? '+' : ''}${oldGmp}% to ${newGmp >= 0 ? '+' : ''}${newGmp}% (Rs ${ipo.gmp && ipo.gmp.gmpPrice ? ipo.gmp.gmpPrice : 0})`,
        tag: `gmp-${ipo.id}`,
        url: '/#gmp',
        data: { type: 'gmp_spike', id: ipo.id }
      });
    }

    // 6. Subscription milestone
    const oldSub = (old.subscriptionRate && old.subscriptionRate.total) ? old.subscriptionRate.total : 0;
    const newSub = (ipo.subscriptionRate && ipo.subscriptionRate.total) ? ipo.subscriptionRate.total : 0;
    const milestones = [10, 50, 100, 200, 500];
    for (const m of milestones) {
      if (oldSub < m && newSub >= m && ipo.status === 'live') {
        notifications.push({
          title: `${ipo.name} is ${m}x Subscribed!`,
          body: `Now ${newSub.toFixed(1)}x oversubscribed across all categories. GMP: ${newGmp >= 0 ? '+' : ''}${newGmp}%`,
          tag: `sub-${ipo.id}-${m}x`,
          url: '/#subscription',
          data: { type: 'subscription_milestone', id: ipo.id, milestone: m }
        });
        break;
      }
    }
  }

  saveSnapshot({ ipos: currentIpos, updatedAt: new Date().toISOString() });

  let totalSent = 0;
  for (const notif of notifications) {
    const result = await sendPushToAll(notif);
    totalSent += result.sent;
    console.log(`[Push] "${notif.title}" -> ${result.sent} delivered`);
  }

  return { notificationsSent: notifications.length, devicesSent: totalSent };
}
