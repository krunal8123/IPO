import React, { useState, useEffect, useRef } from 'react';
import { liveIpoService } from '../../services/liveIpoService';
import { BigshareServerId, BigshareServerInfo } from '../../types/ipo';
import { X, RefreshCw, ShieldCheck, AlertCircle, ArrowRight, Loader2, SkipForward, Server, CheckCircle2, Zap } from 'lucide-react';

interface BigshareCaptchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (token: string, answer: string, serverId?: BigshareServerId) => Promise<{ success: boolean; error?: string; done?: boolean; hasMore?: boolean }>;
  ipoName: string;
  isBatch?: boolean;
  batchCount?: number;
  currentPanIndex?: number;
  currentPanName?: string;
  currentPanNumber?: string;
  onSkipCurrentPan?: () => void;
}

const DEFAULT_SERVERS: BigshareServerInfo[] = [
  { id: 'server1', name: 'Server 1', url: 'https://ipo.bigshareonline.com', portalUrl: 'https://ipo.bigshareonline.com/', status: 'online' },
  { id: 'server2', name: 'Server 2', url: 'https://ipo1.bigshareonline.com', portalUrl: 'https://ipo1.bigshareonline.com/ipo_status.html', status: 'online' },
  { id: 'server3', name: 'Server 3', url: 'https://ipo2.bigshareonline.com', portalUrl: 'https://ipo2.bigshareonline.com/ipo_status.html', status: 'online' }
];

export const BigshareCaptchaModal: React.FC<BigshareCaptchaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  ipoName,
  isBatch = false,
  batchCount = 1,
  currentPanIndex = 0,
  currentPanName,
  currentPanNumber,
  onSkipCurrentPan
}) => {
  const [selectedServer, setSelectedServer] = useState<BigshareServerId>('server1');
  const [activeServerId, setActiveServerId] = useState<BigshareServerId>('server1');
  const [activeServerName, setActiveServerName] = useState<string>('Server 1');
  const [serverList, setServerList] = useState<BigshareServerInfo[]>(DEFAULT_SERVERS);
  const [isFailoverOccurred, setIsFailoverOccurred] = useState<boolean>(false);
  const [failoverMessage, setFailoverMessage] = useState<string | null>(null);

  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [loadingCaptcha, setLoadingCaptcha] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFreshCaptcha = async (preferredServer: BigshareServerId = selectedServer) => {
    setLoadingCaptcha(true);
    setErrorMsg(null);
    setCaptchaInput('');
    setIsFailoverOccurred(false);
    setFailoverMessage(null);

    try {
      const res = await liveIpoService.getBigshareCaptcha(preferredServer);
      if (res && res.token && res.image) {
        setCaptchaToken(res.token);
        setCaptchaImage(res.image);

        if (res.serverId) {
          setActiveServerId(res.serverId);
          setActiveServerName(res.serverName || (res.serverId === 'server1' ? 'Server 1' : res.serverId === 'server2' ? 'Server 2' : 'Server 3'));
          if (res.serverId !== preferredServer) {
            setIsFailoverOccurred(true);
            setFailoverMessage(`${preferredServer.toUpperCase()} was unavailable; automatically routed to ${res.serverName || res.serverId.toUpperCase()}.`);
            setSelectedServer(res.serverId);
          }
        }
        setTimeout(() => inputRef.current?.focus(), 150);
      } else {
        setErrorMsg('Failed to load CAPTCHA from Bigshare servers. Tap reload or select another server.');
      }
    } catch {
      setErrorMsg('Network error connecting to Bigshare. Select another server or tap reload.');
    } finally {
      setLoadingCaptcha(false);
    }
  };

  const handleServerChange = (serverId: BigshareServerId) => {
    if (serverId === selectedServer && !errorMsg) return;
    setSelectedServer(serverId);
    loadFreshCaptcha(serverId);
  };

  // On open, load fresh server health & CAPTCHA
  useEffect(() => {
    if (isOpen) {
      liveIpoService.getBigshareServers().then(servers => {
        if (servers && servers.length > 0) {
          setServerList(servers);
        }
      });
      loadFreshCaptcha(selectedServer);
    } else {
      setCaptchaInput('');
      setErrorMsg(null);
      setSubmitting(false);
      setIsFailoverOccurred(false);
      setFailoverMessage(null);
    }
  }, [isOpen, currentPanIndex]);

  const executeSubmit = async (answerToSubmit: string) => {
    const cleanAnswer = answerToSubmit.trim();
    if (!cleanAnswer || !captchaToken || submitting) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await onSubmit(captchaToken, cleanAnswer, activeServerId);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid CAPTCHA code. Please try again with the new code.');
        await loadFreshCaptcha(selectedServer);
      } else if (res.hasMore) {
        setCaptchaInput('');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification failed. Tap reload or try another server.');
      await loadFreshCaptcha(selectedServer);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSubmit(captchaInput);
  };

  // Instant auto-submit when exactly 6 digits are typed on numeric keypad
  const handleInputChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 6);
    setCaptchaInput(digitsOnly);
    if (digitsOnly.length === 6 && !submitting && !loadingCaptcha && captchaToken) {
      executeSubmit(digitsOnly);
    }
  };

  if (!isOpen) return null;

  const progressPercent = isBatch ? Math.round(((currentPanIndex + 1) / batchCount) * 100) : 100;
  const activeServerInfo = serverList.find(s => s.id === activeServerId) || serverList[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 max-h-[94vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 shrink-0" />

        {/* Progress Bar for Batch Mode */}
        {isBatch && (
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 shrink-0">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                  Bigshare Security
                </h3>
                {isBatch && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                    {currentPanIndex + 1}/{batchCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-[260px]">
                {ipoName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors shrink-0 touch-manipulation cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Server Switcher Pill Bar */}
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Bigshare Server
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active: {activeServerName}</span>
                {activeServerInfo?.latencyMs ? (
                  <span className="text-slate-400 dark:text-slate-500 font-medium">({activeServerInfo.latencyMs}ms)</span>
                ) : null}
              </div>
            </div>

            {/* 3-Server Selector Pills */}
            <div className="grid grid-cols-3 gap-1.5">
              {serverList.map((srv) => {
                const isSelected = selectedServer === srv.id;
                const isActive = activeServerId === srv.id;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    disabled={loadingCaptcha || submitting}
                    onClick={() => handleServerChange(srv.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{srv.name}</span>
                      {isActive && (
                        <CheckCircle2 className={`w-3 h-3 ${isSelected ? 'text-emerald-300' : 'text-emerald-500'}`} />
                      )}
                    </div>
                    {srv.latencyMs ? (
                      <span className={`text-[9px] font-mono font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                        {srv.latencyMs}ms
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Failover note if Server 1 was down and auto-routed */}
            {isFailoverOccurred && failoverMessage && (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                <Zap className="w-3 h-3 shrink-0" />
                <span>{failoverMessage}</span>
              </div>
            )}
          </div>

          {/* Active PAN Identity Card in Batch Mode */}
          {isBatch && currentPanNumber && (
            <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block">
                  Checking Investor
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                  {currentPanName || 'Applicant'}
                </span>
              </div>
              <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shrink-0 shadow-2xs">
                {currentPanNumber}
              </span>
            </div>
          )}

          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isBatch ? (
              <span>
                Enter the <strong>6 digits</strong> below. It <strong>submits automatically</strong> once all 6 digits are typed:
              </span>
            ) : (
              <span>
                Bigshare requires verification to view live status. Enter the <strong>6 digits</strong> shown below:
              </span>
            )}
          </div>

          {/* CAPTCHA Image Container with large touch reload */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-center min-h-[56px] flex-1">
              {loadingCaptcha ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  Generating challenge from {activeServerName}...
                </div>
              ) : captchaImage ? (
                <img
                  src={captchaImage}
                  alt={`Bigshare ${activeServerName} CAPTCHA`}
                  className="max-h-14 object-contain rounded-lg shadow-xs select-none"
                />
              ) : (
                <span className="text-xs text-rose-500 font-medium">Challenge failed to load. Switch server or retry.</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => loadFreshCaptcha(selectedServer)}
              disabled={loadingCaptcha || submitting}
              className="p-3 ml-2 rounded-xl text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 bg-white dark:bg-slate-700 shadow-sm border border-slate-200/80 dark:border-slate-600 transition-all disabled:opacity-50 touch-manipulation active:scale-95 cursor-pointer"
              title="Reload new CAPTCHA"
            >
              <RefreshCw className={`w-4 h-4 ${loadingCaptcha ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Large, Mobile-Optimized Input Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                6-Digit Security Code
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                captchaInput.length === 6 
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {captchaInput.length} / 6
              </span>
            </div>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={captchaInput}
              onChange={e => handleInputChange(e.target.value)}
              placeholder="••••••"
              maxLength={6}
              autoComplete="off"
              disabled={submitting || loadingCaptcha}
              className="w-full h-14 px-4 rounded-2xl border-2 border-indigo-500/30 focus:border-indigo-600 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 font-mono font-black tracking-[0.45em] text-center text-2xl sm:text-3xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner"
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <div className="flex-1">
                <span className="font-medium">{errorMsg}</span>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Tip: If {activeServerName} is slow, select another server above.
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons with high touch targets */}
          <div className="flex items-center gap-2.5 pt-2 pb-2 sm:pb-0">
            {isBatch && onSkipCurrentPan && currentPanIndex < batchCount - 1 && (
              <button
                type="button"
                onClick={onSkipCurrentPan}
                disabled={submitting}
                className="h-12 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shrink-0 touch-manipulation active:scale-95 cursor-pointer"
                title="Skip this PAN"
              >
                <SkipForward className="w-4 h-4" />
                <span className="hidden sm:inline">Skip PAN</span>
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-12 flex-1 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation active:scale-95 flex items-center justify-center cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={captchaInput.length < 4 || submitting || loadingCaptcha}
              className="h-12 flex-1 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying ({activeServerName})...</span>
                </>
              ) : (
                <>
                  <span>{isBatch && currentPanIndex < batchCount - 1 ? 'Next PAN' : 'Verify'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
