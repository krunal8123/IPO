import React, { useState, useMemo, useEffect } from 'react';
import { IpoItem } from '../../types/ipo';
import {
  Calculator, Users, TrendingUp, Info, AlertCircle, ChevronDown,
  Target, Percent, DollarSign, Sparkles, ArrowRight, Minus, Plus
} from 'lucide-react';

interface AllotmentOddsCalculatorProps {
  ipos: IpoItem[];
}

function calcRetailOdds(
  retailSub: number,
  retailSharesReservedPercent: number,
  issueSizeCr: number,
  priceBandMax: number,
  lotSize: number,
): {
  applicationsEstimate: number;
  oddsPercent: number;
  oddsRatio: string;
  winOddsDisplay: string;
} {
  // SEBI: Retail quota = 35% of total issue
  const totalShares = Math.floor((issueSizeCr * 1e7) / priceBandMax);
  const retailShares = Math.floor(totalShares * retailSharesReservedPercent);
  const minLotsAllocatable = Math.floor(retailShares / lotSize);

  // Estimate applications from subscription multiplier (retail portion)
  // total_applications ≈ retail_sub × retailShares / lotSize
  const applicationsEstimate = Math.max(1, Math.round(retailSub * minLotsAllocatable));
  
  // SEBI lottery: each application gets exactly 1 lot (if sub > 1x) or pro-rata
  // Odds = allottable_lots / total_applications
  const oddsPercent = retailSub <= 1
    ? 100
    : Math.min(100, (minLotsAllocatable / applicationsEstimate) * 100);

  const oddsRatio = retailSub <= 1
    ? '1 in 1'
    : `1 in ${Math.round(retailSub)}`;

  const winOddsDisplay = oddsPercent >= 100
    ? '100%'
    : oddsPercent < 1
    ? `${oddsPercent.toFixed(2)}%`
    : `${oddsPercent.toFixed(1)}%`;

  return { applicationsEstimate, oddsPercent, oddsRatio, winOddsDisplay };
}

// Binomial probability that at least 1 of N independent events succeeds
function atLeastOneProb(p: number, n: number): number {
  return 1 - Math.pow(1 - p, n);
}

// Helper to parse diverse date strings
function parseDateBoundary(dateStr?: string, defaultHour: number = 0, defaultMin: number = 0): Date | null {
  if (!dateStr || dateStr === 'Active' || dateStr.includes('T+') || dateStr === 'N/A' || dateStr === 'Declared') return null;
  const parts = dateStr.trim().split(/[-/ ]+/);
  if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    const dt = new Date(y, m, d, defaultHour, defaultMin, 0, 0);
    if (!isNaN(dt.getTime())) return dt;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    if (!dateStr.includes(':')) {
      d.setHours(defaultHour, defaultMin, 0, 0);
    }
    return d;
  }
  return null;
}

type IpoCalcEligibility = 'live' | 'recently_closed' | 'exclude';

function getIpoEligibility(ipo: IpoItem, now: Date = new Date()): IpoCalcEligibility {
  let openH = 10, openM = 0;
  if (ipo.dailyStartTime) {
    const parts = ipo.dailyStartTime.split(':').map(Number);
    if (!isNaN(parts[0])) openH = parts[0];
    if (!isNaN(parts[1])) openM = parts[1];
  }

  let closeH = 17, closeM = 0;
  if (ipo.dailyEndTime) {
    const parts = ipo.dailyEndTime.split(':').map(Number);
    if (!isNaN(parts[0])) closeH = parts[0];
    if (!isNaN(parts[1])) closeM = parts[1];
  }

  const openDate = parseDateBoundary(ipo.openDate, openH, openM);
  const closeDate = parseDateBoundary(ipo.closeDate, closeH, closeM);
  const listingDate = parseDateBoundary(ipo.listingDate, 10, 0);

  // 1. Exclude upcoming IPOs (bidding hasn't started yet)
  if (openDate && now < openDate) {
    return 'exclude';
  }
  if (ipo.status === 'upcoming' && (!openDate || now < openDate)) {
    return 'exclude';
  }

  // 2. Check if currently LIVE (within open and close window)
  if (openDate && closeDate && now >= openDate && now <= closeDate) {
    return 'live';
  }
  if (ipo.status === 'live' && (!closeDate || now <= closeDate)) {
    return 'live';
  }

  // 3. Check if CLOSED / RECENTLY CLOSED
  const isClosed = (closeDate && now > closeDate) || ipo.status === 'closed' || ipo.status === 'listed';
  if (isClosed) {
    // Recently closed criteria:
    // a) Closed within the last 30 days based on closeDate
    if (closeDate) {
      const daysSinceClose = (now.getTime() - closeDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceClose >= 0 && daysSinceClose <= 30) {
        return 'recently_closed';
      }
    } else if (listingDate) {
      // If closeDate wasn't parsed, check listing date proximity (within 14 days)
      const daysSinceListing = (now.getTime() - listingDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceListing <= 14) {
        return 'recently_closed';
      }
    } else if (ipo.status === 'closed') {
      return 'recently_closed';
    }
  }

  return 'exclude';
}

export const AllotmentOddsCalculator: React.FC<AllotmentOddsCalculatorProps> = ({ ipos }) => {
  const eligibleIpos = useMemo(() => {
    const live: IpoItem[] = [];
    const closed: IpoItem[] = [];
    const now = new Date();

    ipos.forEach(item => {
      const eligibility = getIpoEligibility(item, now);
      if (eligibility === 'live') live.push(item);
      else if (eligibility === 'recently_closed') closed.push(item);
    });

    // Sort live by closeDate ascending (earliest closing first)
    live.sort((a, b) => {
      const ta = parseDateBoundary(a.closeDate, 17, 0)?.getTime() || 0;
      const tb = parseDateBoundary(b.closeDate, 17, 0)?.getTime() || 0;
      return ta - tb;
    });

    // Sort recently closed by closeDate descending (most recently closed first)
    closed.sort((a, b) => {
      const ta = parseDateBoundary(a.closeDate, 17, 0)?.getTime() || 0;
      const tb = parseDateBoundary(b.closeDate, 17, 0)?.getTime() || 0;
      return tb - ta;
    });

    return {
      all: [...live, ...closed],
      live,
      closed,
    };
  }, [ipos]);

  const [selectedId, setSelectedId] = useState<string>('');
  const [familyCount, setFamilyCount] = useState<number>(3);
  const [lotsPerApp, setLotsPerApp] = useState<number>(1);
  const [hniLoanRate, setHniLoanRate] = useState<number>(9.5);
  const [hniApplicationLakhs, setHniApplicationLakhs] = useState<number>(14);
  const [listingPriceExpected, setListingPriceExpected] = useState<number>(0);
  const [hniSubMultiplier, setHniSubMultiplier] = useState<number>(30);

  // Synchronize selection dynamically when IPO feed loads or changes
  useEffect(() => {
    if ((!selectedId || !eligibleIpos.all.some(i => i.id === selectedId)) && eligibleIpos.all.length > 0) {
      setSelectedId(eligibleIpos.all[0].id);
    }
  }, [eligibleIpos, selectedId]);

  const ipo = eligibleIpos.all.find(i => i.id === selectedId) || eligibleIpos.all[0];

  // Dynamically update HNI multiplier and expected listing price when IPO selection changes
  useEffect(() => {
    if (ipo) {
      if (ipo.subscription?.nii > 0 || ipo.subscription?.total > 0) {
        setHniSubMultiplier(Math.max(1, Math.round(ipo.subscription.nii || ipo.subscription.total)));
      }
      const estPrice = ipo.gmp?.estimatedListingPrice || (ipo.priceBandMax + (ipo.gmp?.gmpPrice || 0));
      if (estPrice > 0) {
        setListingPriceExpected(estPrice);
      }
    }
  }, [ipo?.id]);

  const isLive = useMemo(() => {
    if (!ipo) return false;
    return getIpoEligibility(ipo, new Date()) === 'live';
  }, [ipo]);

  const odds = useMemo(() => {
    if (!ipo) return null;
    return calcRetailOdds(
      ipo.subscription.retail,
      0.35,
      ipo.issueSizeCr,
      ipo.priceBandMax,
      ipo.lotSize,
    );
  }, [ipo]);

  const singleAppOdds = odds ? odds.oddsPercent / 100 : 0;
  const familyOdds = odds ? atLeastOneProb(singleAppOdds, familyCount) * 100 : 0;

  // sHNI / bHNI Funding Cost
  const hniCapital = hniApplicationLakhs * 100000;
  const hniInterestFor7Days = (hniCapital * hniLoanRate) / 100 / 365 * 7;
  const sharesInApplication = ipo ? Math.floor(hniCapital / ipo.priceBandMax) : 0;
  const expectedAllottedShares = ipo ? Math.floor(sharesInApplication / Math.max(1, hniSubMultiplier)) : 0;
  const capitalActuallyUsed = expectedAllottedShares * (ipo?.priceBandMax || 0);
  const hniBreakevenPrice = ipo && expectedAllottedShares > 0
    ? ipo.priceBandMax + (hniInterestFor7Days / expectedAllottedShares)
    : 0;
  const actualListingGainLoss = ipo && listingPriceExpected > 0 && expectedAllottedShares > 0
    ? (listingPriceExpected - (ipo.priceBandMax || 0)) * expectedAllottedShares - hniInterestFor7Days
    : null;

  const verdictColor = familyOdds > 50
    ? 'text-emerald-600 dark:text-emerald-400'
    : familyOdds > 20
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-rose-600 dark:text-rose-400';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-violet-500/20 text-violet-600 dark:text-violet-400">
              <Target className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              SEBI Allotment Odds Calculator
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Statistical allotment probability based on live subscription data. Optimize your family bidding strategy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Retail Odds */}
        <div className="glass-card rounded-3xl p-5 space-y-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-violet-500" />
            <h3 className="font-black text-slate-900 dark:text-white text-sm">
              Retail Allotment Probability
            </h3>
          </div>

          {/* IPO Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Select IPO
              </label>
              {ipo && (
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                  isLive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {isLive ? `LIVE (Closes ${ipo.closeDate})` : `CLOSED (Allotment: ${ipo.allotmentDate || 'T+1'})`}
                </span>
              )}
            </div>
            <div className="relative">
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer font-medium"
              >
                {eligibleIpos.all.length === 0 && <option value="">No live or recently closed IPOs</option>}
                {eligibleIpos.live.length > 0 && (
                  <optgroup label="🟢 Live Bidding IPOs">
                    {eligibleIpos.live.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.category.toUpperCase()}) — Closes {i.closeDate}
                      </option>
                    ))}
                  </optgroup>
                )}
                {eligibleIpos.closed.length > 0 && (
                  <optgroup label="✓ Recently Closed IPOs (Awaiting Allotment / Listing)">
                    {eligibleIpos.closed.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.category.toUpperCase()}) — Closed {i.closeDate}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {ipo && odds ? (
            <>
              {/* Key stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { 
                    label: isLive ? 'Retail Sub (Live)' : 'Retail Sub (Final)', 
                    value: `${ipo.subscription.retail.toFixed(1)}x`, 
                    color: 'text-rose-600 dark:text-rose-400' 
                  },
                  { label: 'Odds Ratio', value: odds.oddsRatio, color: 'text-amber-600 dark:text-amber-400' },
                  { label: 'Win Chance', value: odds.winOddsDisplay, color: 'text-violet-600 dark:text-violet-400' },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 sm:p-3 text-center">
                    <p className={`text-sm sm:text-lg font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-violet-50 dark:bg-violet-950/30 rounded-2xl p-3.5 border border-violet-200/60 dark:border-violet-800/40">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">
                    In oversubscribed retail categories, SEBI mandates a <strong>computer lottery</strong> for minimum lot allotment. 
                    Applying for 13 lots gives the same odds as applying for 1 lot from the same PAN.
                  </p>
                </div>
              </div>

              {/* Family PAN Optimizer */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Family PANs to Apply
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFamilyCount(c => Math.max(1, c - 1))}
                    className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-black text-slate-900 dark:text-white w-8 text-center">{familyCount}</span>
                  <button
                    onClick={() => setFamilyCount(c => Math.min(20, c + 1))}
                    className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-right">
                    <p className={`text-2xl font-black ${verdictColor}`}>
                      {familyOdds.toFixed(1)}%
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Cumulative chance</p>
                  </div>
                </div>

                {/* Strategy comparison */}
                <div className="mt-4 space-y-2">
                  {[
                    { label: `1 PAN × ${lotsPerApp} lots`, odds: singleAppOdds * 100, tag: 'Single' },
                    { label: `${Math.min(3, familyCount)} PANs × 1 lot each`, odds: atLeastOneProb(singleAppOdds, Math.min(3, familyCount)) * 100, tag: 'Family (3)' },
                    { label: `${familyCount} PANs × 1 lot each`, odds: familyOdds, tag: `Family (${familyCount})`, highlight: true },
                  ].map(opt => (
                    <div
                      key={opt.label}
                      className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs ${
                        opt.highlight
                          ? 'bg-violet-50 dark:bg-violet-950/40 border border-violet-300/60 dark:border-violet-700/50'
                          : 'bg-slate-50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <span className={`font-bold text-[11px] uppercase tracking-wide mr-1.5 px-1.5 py-0.5 rounded ${opt.highlight ? 'bg-violet-200 dark:bg-violet-900 text-violet-700 dark:text-violet-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          {opt.tag}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">{opt.label}</span>
                      </div>
                      <span className={`font-black text-sm ${opt.odds > 50 ? 'text-emerald-600 dark:text-emerald-400' : opt.odds > 20 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {opt.odds.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              No live or recently closed IPOs available.
            </div>
          )}
        </div>

        {/* Right: sHNI / bHNI Breakeven Calculator */}
        <div className="glass-card rounded-3xl p-5 space-y-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-500" />
            <h3 className="font-black text-slate-900 dark:text-white text-sm">
              HNI Funding Cost & Breakeven
            </h3>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-3 border border-amber-200/60 dark:border-amber-800/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                HNI investors use NBFC IPO funding to amplify lot count. This calculator shows the exact listing price needed to cover 7-day loan interest and breakeven.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Application Size (₹ Lakhs)', value: hniApplicationLakhs, set: setHniApplicationLakhs, min: 2, max: 500, step: 1 },
              { label: 'NBFC Rate (% p.a.)', value: hniLoanRate, set: setHniLoanRate, min: 6, max: 24, step: 0.5 },
              { label: 'HNI Sub Multiplier', value: hniSubMultiplier, set: setHniSubMultiplier, min: 1, max: 300, step: 1 },
              { label: 'Expected Listing Price (₹)', value: listingPriceExpected, set: setListingPriceExpected, min: 0, max: 10000, step: 1 },
            ].map(({ label, value, set, min, max, step }) => (
              <div key={label}>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                  {label}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={e => set(Number(e.target.value))}
                  min={min}
                  max={max}
                  step={step}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            ))}
          </div>

          {ipo ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Total Interest (7 days)', value: `₹${Math.round(hniInterestFor7Days).toLocaleString('en-IN')}`, highlight: false },
                  { label: 'Allotted Shares (est.)', value: expectedAllottedShares.toLocaleString('en-IN'), highlight: false },
                  { label: 'Capital Deployed', value: `₹${Math.round(capitalActuallyUsed).toLocaleString('en-IN')}`, highlight: false },
                  { label: 'Breakeven Price', value: hniBreakevenPrice > 0 ? `₹${hniBreakevenPrice.toFixed(2)}` : '—', highlight: true },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl p-3 text-center ${s.highlight ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/30' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                    <p className={`text-base font-black ${s.highlight ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {s.value}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {listingPriceExpected > 0 && actualListingGainLoss !== null && (
                <div className={`rounded-2xl p-4 border text-center ${
                  actualListingGainLoss >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/30'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-800/30'
                }`}>
                  <p className={`text-2xl font-black ${actualListingGainLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {actualListingGainLoss >= 0 ? '+' : ''}₹{Math.round(actualListingGainLoss).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Estimated Net Profit after interest (listing day)
                  </p>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-400">
                <strong>Issue Price:</strong> ₹{ipo.priceBandMax} &nbsp;|&nbsp;
                <strong>Lot Size:</strong> {ipo.lotSize} shares &nbsp;|&nbsp;
                <strong>Current GMP:</strong>{' '}
                <span className={ipo.gmp.gmpPrice >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                  +₹{ipo.gmp.gmpPrice} (+{ipo.gmp.gmpPercent}%)
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-sm">Select an IPO to calculate.</div>
          )}
        </div>
      </div>
    </div>
  );
};
