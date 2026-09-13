import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, MoreVertical, Sparkles, Smartphone, Radar } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);

  useEffect(() => {
    // 1. If already installed or running as PWA / Capacitor App, do not show
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      localStorage.getItem('iporadar_pwa_installed') === 'true';

    if (isStandalone) {
      return;
    }

    // 2. Check if user dismissed recently (remember for 14 days so it never pesters on reloads)
    const dismissedAt = localStorage.getItem('iporadar_pwa_dismissed');
    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < 14) {
        return;
      }
    }

    // 3. Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(ua);
    setIsIos(isApple);

    // 4. Capture native beforeinstallprompt (Chrome / Edge / Samsung Internet on Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 5. Detect when user installs app so prompt is never shown again
    const handleAppInstalled = () => {
      localStorage.setItem('iporadar_pwa_installed', 'true');
      setIsVisible(false);
      setShowGuideModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 6. Display the banner on mobile after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    // If native prompt is available (Android Chrome)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          localStorage.setItem('iporadar_pwa_installed', 'true');
          setIsVisible(false);
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.warn('Native install prompt error:', err);
      }
    }

    // Otherwise show the visual 2-tap guide
    setShowGuideModal(true);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowGuideModal(false);
    localStorage.setItem('iporadar_pwa_dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Flipkart-Style Floating "Add to Home Screen" Bottom Bar */}
      <div className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-bounce-short">
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-2xl border border-indigo-500/40 backdrop-blur-xl flex items-center justify-between gap-2.5">
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/50 shrink-0 text-white">
              <Radar className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black tracking-tight text-white truncate">
                  Add to Home Screen
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Fast
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                Install app for 1-tap live market alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-indigo-600/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Visual 2-Tap Step-by-Step Installation Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 text-white text-center shadow-2xl relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/40">
              <Radar className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-base font-black mb-1">
              Add IPORadar to Home Screen
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Follow these 2 quick steps in your phone's browser:
            </p>

            <div className="space-y-3 text-left text-xs bg-slate-800/80 p-4 rounded-2xl border border-slate-700 mb-5">
              {isIos ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                      1
                    </div>
                    <div>
                      Tap the <strong className="text-white">Share</strong> button <Share className="inline w-3.5 h-3.5 mx-1 text-indigo-400" /> in Safari's bottom bar.
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
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                      1
                    </div>
                    <div>
                      Tap the browser menu <strong className="text-white">(⋮)</strong> <MoreVertical className="inline w-3.5 h-3.5 mx-0.5 text-indigo-400" /> in top/bottom corner.
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                      2
                    </div>
                    <div>
                      Tap <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong> <PlusSquare className="inline w-3.5 h-3.5 mx-1 text-indigo-400" />.
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
