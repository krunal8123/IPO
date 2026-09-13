import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Sparkles, Smartphone, Radar } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if already running in standalone/installed mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return; // Already installed, do not show
    }

    // 2. Check if user dismissed recently (within 2 days)
    const dismissedAt = localStorage.getItem('iporadar_pwa_dismissed');
    if (dismissedAt) {
      const diffDays = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (diffDays < 2) {
        return;
      }
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    if (isIosDevice) {
      setIsIos(true);
      // Wait 2 seconds before showing subtle iOS install prompt
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // 4. Android/Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Wait 1.5 seconds so user sees the page first
      setTimeout(() => {
        setShowBanner(true);
      }, 1500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback: alert instructions
      alert('To install: Open browser menu (⋮) and tap "Install app" or "Add to Home Screen".');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIosGuide(false);
    localStorage.setItem('iporadar_pwa_dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Floating Bottom App Installation Bar */}
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-md mx-auto z-50 animate-bounce-short">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border border-indigo-500/30 backdrop-blur-xl flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/40 shrink-0 text-white">
              <Radar className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black tracking-tight text-white truncate">
                  Add IPORadar to Home Screen
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                  App
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                Instant 1-tap launch & live market updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* iOS Step-by-Step Installation Modal Guide */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white text-center shadow-2xl relative">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold mb-1">
              Install on iPhone / iPad
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Follow these 2 quick steps to add IPORadar to your home screen:
            </p>

            <div className="space-y-3 text-left text-xs bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                  1
                </div>
                <div>
                  Tap the <strong className="text-white">Share</strong> button <Share className="inline w-3.5 h-3.5 mx-1 text-indigo-400" /> in Safari's bottom toolbar.
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                  2
                </div>
                <div>
                  Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong> <PlusSquare className="inline w-3.5 h-3.5 mx-1 text-indigo-400" />.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
