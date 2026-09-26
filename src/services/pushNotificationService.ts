/**
 * IPORadar — Client-side Push Notification Service
 * Handles browser permission, subscription registration, and server sync.
 */

import { getApiBaseUrl } from './liveIpoService';

// VAPID public key (must match server) — also fetched dynamically from server
const FALLBACK_VAPID_PUBLIC_KEY = 'BDpLT6qTBzeIQSIlwGrG6NJWIs70CuPKAvD8sWownfg5E2seBThhxzqmdSPcs-CMkg0RdBt6s-vLE0X_Wv0jffk';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
}

/** Check if push notifications are supported in this browser */
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/** Get current notification permission state */
export function getPermissionState(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

/** Fetch VAPID public key from the server (with fallback) */
async function fetchVapidPublicKey(): Promise<string> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/push/vapid-public-key`, {
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.publicKey) return json.publicKey;
    }
  } catch {
    // Use embedded fallback
  }
  return FALLBACK_VAPID_PUBLIC_KEY;
}

/** Register / retrieve the push subscription and sync to server */
async function subscribeToPush(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  const publicKey = await fetchVapidPublicKey();

  // Check if already subscribed
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
  }

  // Sync to server
  try {
    await fetch(`${getApiBaseUrl()}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON()),
      signal: AbortSignal.timeout(5000)
    });
  } catch {
    // Server unreachable — subscription is still active locally
    console.warn('[PushClient] Could not sync subscription to server (will retry on next load)');
  }

  return subscription;
}

/** Unsubscribe from push notifications */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return true;

    // Notify server
    try {
      await fetch(`${getApiBaseUrl()}/push/unsubscribe`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
        signal: AbortSignal.timeout(5000)
      });
    } catch { /* best-effort */ }

    await sub.unsubscribe();
    return true;
  } catch (err) {
    console.error('[PushClient] Unsubscribe failed:', err);
    return false;
  }
}

/**
 * Request notification permission and subscribe to push.
 * Returns: 'granted' | 'denied' | 'unsupported' | 'error'
 */
export async function requestPushPermission(): Promise<'granted' | 'denied' | 'unsupported' | 'error'> {
  if (!isPushSupported()) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return 'denied';

    const registration = await navigator.serviceWorker.ready;
    await subscribeToPush(registration);
    localStorage.setItem('iporadar_push_subscribed', 'true');
    return 'granted';
  } catch (err) {
    console.error('[PushClient] Permission request failed:', err);
    return 'error';
  }
}

/** Returns true if the user is currently subscribed */
export async function isPushSubscribed(): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}

/** Re-sync existing subscription to server (called on app load) */
export async function syncPushSubscription(): Promise<void> {
  if (!isPushSupported()) return;
  if (getPermissionState() !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker.ready;
    await subscribeToPush(reg);
  } catch {
    // Ignore
  }
}
