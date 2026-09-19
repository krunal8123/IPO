import React, { useState, useEffect, useRef } from 'react';
import { liveIpoService } from '../../services/liveIpoService';
import { X, RefreshCw, ShieldCheck, AlertCircle, ArrowRight, Loader2, CheckCircle2, SkipForward } from 'lucide-react';

interface BigshareCaptchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (token: string, answer: string) => Promise<{ success: boolean; error?: string; done?: boolean; hasMore?: boolean }>;
  ipoName: string;
  isBatch?: boolean;
  batchCount?: number;
  currentPanIndex?: number;
  currentPanName?: string;
  currentPanNumber?: string;
  onSkipCurrentPan?: () => void;
}

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
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [loadingCaptcha, setLoadingCaptcha] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFreshCaptcha = async () => {
    setLoadingCaptcha(true);
    setErrorMsg(null);
    setCaptchaInput('');
    try {
      const res = await liveIpoService.getBigshareCaptcha();
      if (res && res.token && res.image) {
        setCaptchaToken(res.token);
        setCaptchaImage(res.image);
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        setErrorMsg('Failed to load CAPTCHA from Bigshare. Please click reload.');
      }
    } catch {
      setErrorMsg('Network error fetching CAPTCHA. Please check your connection.');
    } finally {
      setLoadingCaptcha(false);
    }
  };

  // Trigger fresh CAPTCHA on open or when advancing to next PAN in batch
  useEffect(() => {
    if (isOpen) {
      loadFreshCaptcha();
    } else {
      setCaptchaInput('');
      setErrorMsg(null);
      setSubmitting(false);
    }
  }, [isOpen, currentPanIndex]);

  const executeSubmit = async (answerToSubmit: string) => {
    const cleanAnswer = answerToSubmit.trim();
    if (!cleanAnswer || !captchaToken || submitting) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await onSubmit(captchaToken, cleanAnswer);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid CAPTCHA code. Please try again with the new code.');
        await loadFreshCaptcha();
      } else if (res.hasMore) {
        // Next PAN in queue will automatically trigger useEffect via currentPanIndex
        setCaptchaInput('');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification failed. Please try again.');
      await loadFreshCaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSubmit(captchaInput);
  };

  // Auto-submit when user finishes typing the 6 digits
  const handleInputChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 6);
    setCaptchaInput(digitsOnly);
    if (digitsOnly.length === 6 && !submitting && !loadingCaptcha && captchaToken) {
      executeSubmit(digitsOnly);
    }
  };

  if (!isOpen) return null;

  const progressPercent = isBatch ? Math.round(((currentPanIndex + 1) / batchCount) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress Bar for Batch Mode */}
        {isBatch && (
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  Bigshare Verification
                </h3>
                {isBatch && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    PAN {currentPanIndex + 1} of {batchCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                {ipoName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Active PAN Identity Card in Batch Mode */}
          {isBatch && currentPanNumber && (
            <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block">
                  Verifying Applicant
                </span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {currentPanName || 'Applicant'}
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                {currentPanNumber}
              </span>
            </div>
          )}

          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isBatch ? (
              <span>
                Each query requires a fresh CAPTCHA code from Bigshare. Enter the <strong>6 digits</strong> below (auto-submits instantly):
              </span>
            ) : (
              <span>
                Bigshare Services requires image verification to query live allotment records. Enter the <strong>6 digits</strong> shown below:
              </span>
            )}
          </div>

          {/* CAPTCHA Image Container */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-center min-h-[52px] flex-1">
              {loadingCaptcha ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  Fetching fresh CAPTCHA...
                </div>
              ) : captchaImage ? (
                <img
                  src={captchaImage}
                  alt="Bigshare CAPTCHA Challenge"
                  className="max-h-12 object-contain rounded-lg shadow-sm select-none"
                />
              ) : (
                <span className="text-xs text-rose-500">Failed to load challenge</span>
              )}
            </div>

            <button
              type="button"
              onClick={loadFreshCaptcha}
              disabled={loadingCaptcha || submitting}
              className="p-2.5 ml-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-slate-200/60 dark:border-slate-700 transition-all disabled:opacity-50"
              title="Reload new CAPTCHA"
            >
              <RefreshCw className={`w-4 h-4 ${loadingCaptcha ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Input Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Enter 6-Digit Code
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                {captchaInput.length}/6 Digits
              </span>
            </div>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={captchaInput}
              onChange={e => handleInputChange(e.target.value)}
              placeholder="• • • • • •"
              maxLength={6}
              autoComplete="off"
              disabled={submitting || loadingCaptcha}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 font-black tracking-[0.35em] text-center text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            {isBatch && onSkipCurrentPan && currentPanIndex < batchCount - 1 && (
              <button
                type="button"
                onClick={onSkipCurrentPan}
                disabled={submitting}
                className="py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0"
                title="Skip this PAN"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Skip
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={captchaInput.length < 4 || submitting || loadingCaptcha}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  {isBatch && currentPanIndex < batchCount - 1 ? 'Next PAN' : 'Verify Allotment'}
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
