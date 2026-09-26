import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  isPushSupported,
  getPermissionState,
  requestPushPermission,
  isPushSubscribed,
  unsubscribeFromPush,
  syncPushSubscription
} from '../../services/pushNotificationService';

const DISMISSED_KEY = 'iporadar_push_banner_dismissed';
const SUBSCRIBED_KEY = 'iporadar_push_subscribed';

export const PushNotificationBanner: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!isPushSupported()) return;

    // Re-sync existing subscription silently on load
    syncPushSubscription().catch(() => { });

    const permission = getPermissionState();

    // Already subscribed
    if (permission === 'granted') {
      isPushSubscribed().then(sub => {
        setSubscribed(sub);
        if (sub) setVisible(false);
      });
      return;
    }

    // Denied — don't show banner
    if (permission === 'denied') return;

    // Check if user dismissed before
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    // Show banner after a short delay (don't interrupt first load)
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    const result = await requestPushPermission();
    setLoading(false);

    if (result === 'granted') {
      setSubscribed(true);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setVisible(false);
      }, 3000);
    } else if (result === 'denied') {
      setVisible(false);
      localStorage.setItem(DISMISSED_KEY, '1');
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    await unsubscribeFromPush();
    setLoading(false);
    setSubscribed(false);
    localStorage.removeItem(SUBSCRIBED_KEY);
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  if (!isPushSupported()) return null;

  // Subscribed management button (shown in settings area, not a banner)
  if (subscribed && !visible) {
    return null; // Managed via Settings modal instead
  }

  if (!visible) return null;

  // Success state
  if (showSuccess) {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-fade-in">
        <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-bold text-sm">Notifications enabled!</p>
            <p className="text-xs text-emerald-100">You'll now get real-time IPO alerts on your phone.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-fade-in">
      <div className="relative bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-700/50 rounded-2xl p-4 shadow-2xl shadow-indigo-900/40 overflow-hidden">

        {/* Subtle glow background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 pointer-events-none" />

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 relative">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
            <Bell className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-sm font-bold text-white">Get IPO Alerts</p>
              <span className="text-[9px] font-black uppercase tracking-wide bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-full border border-indigo-500/40">
                Free
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
              Get notified for new IPOs, allotment results, GMP spikes, and subscription milestones.
            </p>

            {/* Feature list */}
            <div className="grid grid-cols-2 gap-1 mb-3">
              {[
                'New IPO open',
                'Allotment declared',
                'GMP surge/drop',
                '10x / 50x / 100x alerts',
              ].map(f => (
                <div key={f} className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleEnable}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg transition-all disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {loading ? 'Enabling…' : 'Enable Alerts'}
              </button>
              <button
                onClick={handleDismiss}
                className="py-2 px-3 rounded-xl bg-slate-700/60 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Small bell toggle button for use inside Settings modal */
export const PushToggleButton: React.FC = () => {
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const supported = isPushSupported();

  useEffect(() => {
    if (!supported) return;
    isPushSubscribed().then(setSubscribed);
  }, [supported]);

  if (!supported) return (
    <div className="text-xs text-slate-500 dark:text-slate-400">
      Push notifications not supported in this browser.
    </div>
  );

  if (subscribed === null) return null;

  const handleToggle = async () => {
    setLoading(true);
    if (subscribed) {
      await unsubscribeFromPush();
      setSubscribed(false);
    } else {
      const result = await requestPushPermission();
      setSubscribed(result === 'granted');
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${subscribed
          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        } disabled:opacity-60`}
    >
      {subscribed ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
      {loading
        ? 'Updating…'
        : subscribed
          ? 'IPO Alerts: ON (tap to disable)'
          : 'Enable IPO Push Alerts'}
      {subscribed && (
        <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      )}
    </button>
  );
};
