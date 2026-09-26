import React, { useMemo } from 'react';
import { IpoItem } from '../../types/ipo';
import { Lock, Unlock, Clock, AlertTriangle, TrendingDown, Calendar, Building2, Sparkles } from 'lucide-react';
import { CompanyLogo } from '../common/CompanyLogo';

interface AnchorLockInTrackerProps {
  ipos: IpoItem[];
  onSelectIpo?: (ipo: IpoItem) => void;
}

function addDays(dateStr: string, days: number): Date {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDaysUntil(d: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

interface LockInEntry {
  ipo: IpoItem;
  listingDate: Date;
  lockIn30: Date;
  lockIn90: Date;
  daysTo30: number;
  daysTo90: number;
  listingGainPercent: number;
  isListingDayPast: boolean;
}

export const AnchorLockInTracker: React.FC<AnchorLockInTrackerProps> = ({ ipos, onSelectIpo }) => {
  const entries = useMemo<LockInEntry[]>(() => {
    const now = new Date();
    return ipos
      .filter(ipo => {
        if (!ipo.listingDate || ipo.listingDate.startsWith('T+') || ipo.listingDate === 'Active') return false;
        const d = new Date(ipo.listingDate);
        if (isNaN(d.getTime())) return false;
        // Show IPOs that have listed or will list within next 90 days
        const daysToList = getDaysUntil(d);
        return daysToList > -180; // within 6 months past listing
      })
      .map(ipo => {
        const listingDate = new Date(ipo.listingDate);
        const lockIn30 = addDays(ipo.listingDate, 30);
        const lockIn90 = addDays(ipo.listingDate, 90);
        const daysTo30 = getDaysUntil(lockIn30);
        const daysTo90 = getDaysUntil(lockIn90);
        const isListingDayPast = listingDate < now;
        const listingGainPercent = ipo.listingGainPercent ||
          (ipo.listingPrice && ipo.priceBandMax > 0
            ? ((ipo.listingPrice - ipo.priceBandMax) / ipo.priceBandMax) * 100
            : ipo.gmp.gmpPercent);
        return { ipo, listingDate, lockIn30, lockIn90, daysTo30, daysTo90, listingGainPercent, isListingDayPast };
      })
      .sort((a, b) => {
        // Sort by urgency: nearest lock-in expiry first
        const urgencyA = Math.min(Math.abs(a.daysTo30), Math.abs(a.daysTo90));
        const urgencyB = Math.min(Math.abs(b.daysTo30), Math.abs(b.daysTo90));
        return urgencyA - urgencyB;
      });
  }, [ipos]);

  const upcoming30 = entries.filter(e => e.daysTo30 >= 0 && e.daysTo30 <= 14);
  const upcoming90 = entries.filter(e => e.daysTo90 >= 0 && e.daysTo90 <= 14 && !(e.daysTo30 >= 0 && e.daysTo30 <= 14));

  function RiskBadge({ days }: { days: number }) {
    if (days < 0) return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">Expired</span>;
    if (days === 0) return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 animate-pulse">TODAY</span>;
    if (days <= 3) return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300">In {days}d ⚡</span>;
    if (days <= 7) return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">In {days}d</span>;
    if (days <= 30) return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">In {days}d</span>;
    return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">In {days}d</span>;
  }

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {(upcoming30.length > 0 || upcoming90.length > 0) && (
        <div className="space-y-2">
          {upcoming30.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/40 rounded-2xl p-3.5 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-rose-700 dark:text-rose-300">
                  ⚠️ 30-Day Lock-In Expiry Approaching
                </p>
                <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                  {upcoming30.map(e => e.ipo.name).join(', ')} — Anchor investors can unlock 50% shares soon. Watch for selling pressure.
                </p>
              </div>
            </div>
          )}
          {upcoming90.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 rounded-2xl p-3.5 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-amber-700 dark:text-amber-300">
                  90-Day Lock-In Expiry Approaching
                </p>
                <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                  {upcoming90.map(e => e.ipo.name).join(', ')} — Remaining 50% anchor shares unlock soon.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          <Lock className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>No recently listed IPOs found to track lock-in expiries.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(({ ipo, listingDate, lockIn30, lockIn90, daysTo30, daysTo90, listingGainPercent, isListingDayPast }) => (
            <div
              key={ipo.id}
              className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer"
              onClick={() => onSelectIpo?.(ipo)}
            >
              <div className="flex items-start gap-3">
                <CompanyLogo ipo={ipo} size="sm" className="w-10 h-10 rounded-xl shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{ipo.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{ipo.sector} • {ipo.category.toUpperCase()}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-black ${listingGainPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {listingGainPercent >= 0 ? '+' : ''}{listingGainPercent.toFixed(1)}%
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Listing Gain</p>
                    </div>
                  </div>

                  {/* Lock-in timeline */}
                  <div className="mt-3 space-y-2">
                    {/* Listing */}
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] flex-wrap">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${isListingDayPast ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
                      <span className="text-slate-500 dark:text-slate-400 w-24 sm:w-28 shrink-0">Listed:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{formatDate(listingDate)}</span>
                    </div>

                    {/* 30-day lock-in */}
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] flex-wrap">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        daysTo30 < 0 ? 'bg-slate-300 dark:bg-slate-600'
                        : daysTo30 <= 7 ? 'bg-rose-500 animate-pulse'
                        : 'bg-amber-400'
                      }`} />
                      <span className="text-slate-500 dark:text-slate-400 w-24 sm:w-28 shrink-0">30-Day Lock-In:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{formatDate(lockIn30)}</span>
                      <RiskBadge days={daysTo30} />
                    </div>

                    {/* 90-day lock-in */}
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] flex-wrap">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        daysTo90 < 0 ? 'bg-slate-300 dark:bg-slate-600'
                        : daysTo90 <= 7 ? 'bg-rose-500 animate-pulse'
                        : 'bg-blue-400'
                      }`} />
                      <span className="text-slate-500 dark:text-slate-400 w-24 sm:w-28 shrink-0">90-Day Lock-In:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{formatDate(lockIn90)}</span>
                      <RiskBadge days={daysTo90} />
                    </div>
                  </div>

                  {/* Visual lock-in progress bar */}
                  {isListingDayPast && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Listing</span>
                        <span>30D</span>
                        <span>90D</span>
                      </div>
                      <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        {/* Progress from listing to now */}
                        {(() => {
                          const totalDays = 90;
                          const daysSinceListing = Math.max(0, -getDaysUntil(listingDate));
                          const progress = Math.min(100, (daysSinceListing / totalDays) * 100);
                          const mark30 = (30 / 90) * 100;
                          return (
                            <>
                              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                              <div className="absolute top-0 h-full w-0.5 bg-white/70 dark:bg-slate-900/70" style={{ left: `${mark30}%` }} />
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl p-3 leading-relaxed">
        <strong>How Anchor Lock-Ins Work:</strong> Anchor investors are allotted shares before the IPO opens. Per SEBI regulations, 50% of their allotted shares are locked for 30 days from the listing date, and the remaining 50% for 90 days. Expiry of these windows can lead to increased selling pressure and price volatility.
      </div>
    </div>
  );
};
