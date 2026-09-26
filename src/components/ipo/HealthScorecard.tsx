import React, { useMemo } from 'react';
import { IpoItem, HealthScorecard as HealthScorecardType, HealthFlag } from '../../types/ipo';
import {
  ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, Minus,
  BarChart3, DollarSign, Target, Sparkles, Info, CheckCircle2, XCircle
} from 'lucide-react';

function computeHealthScore(ipo: IpoItem): HealthScorecardType {
  const flags: HealthFlag[] = [];
  let valuationScore = 0;
  let growthScore = 0;
  let financialHealthScore = 0;
  let demandScore = 0;

  const financials = ipo.financials || [];
  const latest = financials[financials.length - 1];
  const prev = financials[financials.length - 2];
  const oldest = financials[0];

  // ── Valuation Score (0–25) ─────────────────────────────
  const mktCapEst = ipo.priceBandMax && ipo.issueSizeCr
    ? ipo.issueSizeCr * 4 // rough proxy: issue is ~25% of company
    : 0;
  const peRatio = latest && latest.pat > 0
    ? (mktCapEst / latest.pat)
    : null;
  const pbRatio = latest && latest.netWorth > 0
    ? (mktCapEst / latest.netWorth)
    : null;
  const ofsPercent = ipo.issueSizeCr > 0
    ? (ipo.ofsCr / ipo.issueSizeCr) * 100
    : 0;

  if (peRatio !== null) {
    if (peRatio < 20) valuationScore += 25;
    else if (peRatio < 40) valuationScore += 18;
    else if (peRatio < 70) valuationScore += 10;
    else {
      valuationScore += 3;
      flags.push({
        id: 'high-pe',
        type: 'red',
        severity: 'high',
        title: 'Aggressive Valuation (High P/E)',
        description: `P/E ratio of ~${peRatio.toFixed(0)}x is significantly above typical sector peers. Issue may be priced to perfection.`,
        value: `~${peRatio.toFixed(0)}x P/E`,
      });
    }
  } else {
    valuationScore += 5; // Loss-making company
    if (latest && latest.pat < 0) {
      flags.push({
        id: 'loss-making',
        type: 'red',
        severity: 'high',
        title: 'Loss-Making Company',
        description: 'Company reported a net loss in the most recent fiscal year.',
        value: `PAT: ₹${latest.pat.toFixed(0)} Cr`,
      });
    }
  }

  // OFS alert
  if (ofsPercent > 75) {
    flags.push({
      id: 'high-ofs',
      type: 'red',
      severity: 'medium',
      title: 'High OFS (Promoter Offloading)',
      description: `${ofsPercent.toFixed(0)}% of issue size is Offer for Sale. Promoters are primarily exiting, not raising fresh capital.`,
      value: `OFS: ${ofsPercent.toFixed(0)}%`,
    });
    valuationScore = Math.max(0, valuationScore - 5);
  } else if (ofsPercent < 30) {
    flags.push({
      id: 'fresh-issue',
      type: 'green',
      severity: 'low',
      title: 'Majority Fresh Issue',
      description: `${(100 - ofsPercent).toFixed(0)}% is fresh capital deployment. Company is expanding, not promoters exiting.`,
      value: `Fresh: ${(100 - ofsPercent).toFixed(0)}%`,
    });
    valuationScore = Math.min(25, valuationScore + 3);
  }

  // ── Growth Score (0–25) ────────────────────────────────
  let revenueCagr: number | undefined;
  let patMargin: number | undefined;

  if (financials.length >= 2 && oldest && latest && oldest.revenue > 0) {
    const years = financials.length - 1;
    revenueCagr = (Math.pow(latest.revenue / oldest.revenue, 1 / years) - 1) * 100;
    if (revenueCagr > 25) { growthScore += 25; flags.push({ id: 'high-growth', type: 'green', severity: 'low', title: 'Strong Revenue Growth', description: `3-Year Revenue CAGR of ${revenueCagr.toFixed(1)}% signals robust business momentum.`, value: `${revenueCagr.toFixed(1)}% CAGR` }); }
    else if (revenueCagr > 15) growthScore += 18;
    else if (revenueCagr > 5) growthScore += 10;
    else { growthScore += 4; flags.push({ id: 'slow-growth', type: 'red', severity: 'medium', title: 'Sluggish Revenue Growth', description: `Revenue CAGR of ${revenueCagr.toFixed(1)}% is below inflationary levels, raising concerns about scalability.`, value: `${revenueCagr.toFixed(1)}% CAGR` }); }
  } else {
    growthScore += 10;
  }

  // PAT margin
  if (latest && latest.revenue > 0) {
    patMargin = (latest.pat / latest.revenue) * 100;
    if (patMargin > 15) { growthScore = Math.min(25, growthScore + 3); flags.push({ id: 'high-margin', type: 'green', severity: 'low', title: 'Healthy Profit Margins', description: `PAT margin of ${patMargin.toFixed(1)}% is above industry average, indicating efficient operations.`, value: `${patMargin.toFixed(1)}% PAT Margin` }); }
    else if (patMargin < 0) { growthScore = Math.max(0, growthScore - 5); }
  }

  // ── Financial Health Score (0–25) ──────────────────────
  if (latest && prev) {
    // Revenue trend
    if (latest.revenue > prev.revenue) financialHealthScore += 10;
    else { financialHealthScore += 3; flags.push({ id: 'revenue-decline', type: 'red', severity: 'medium', title: 'Revenue Contraction', description: 'Revenue declined year-over-year, potentially signaling demand slowdown or market share loss.', value: `YoY: ₹${latest.revenue.toFixed(0)} Cr` }); }

    // PAT trend  
    if (latest.pat > prev.pat && latest.pat > 0) financialHealthScore += 15;
    else if (latest.pat > 0) financialHealthScore += 8;
    else { financialHealthScore += 2; flags.push({ id: 'negative-cfo', type: 'red', severity: 'high', title: 'Negative PAT Trajectory', description: 'Profitability is declining or negative. Raises questions about the sustainability of the business model.', value: `PAT: ₹${latest.pat.toFixed(0)} Cr` }); }
  } else {
    financialHealthScore += 12;
  }

  // ── Demand Score (0–25) ────────────────────────────────
  const totalSub = ipo.subscription?.total || 0;
  const qibSub = ipo.subscription?.qib || 0;
  const retailSub = ipo.subscription?.retail || 0;

  if (totalSub > 50) demandScore += 25;
  else if (totalSub > 20) demandScore += 20;
  else if (totalSub > 10) demandScore += 15;
  else if (totalSub > 1) demandScore += 8;
  else demandScore += 3;

  if (qibSub > 30) {
    flags.push({ id: 'strong-qib', type: 'green', severity: 'low', title: 'Strong Institutional Demand (QIB)', description: `QIB category is oversubscribed by ${qibSub.toFixed(1)}x, signaling confidence from institutional investors.`, value: `${qibSub.toFixed(1)}x QIB` });
  }
  if (retailSub > 10 && qibSub > 5) {
    flags.push({ id: 'broad-demand', type: 'green', severity: 'low', title: 'Broad-Based Demand Across Categories', description: 'Both institutional and retail segments show strong demand, indicating healthy market-wide interest.', value: `Retail: ${retailSub.toFixed(1)}x` });
  }

  const totalScore = Math.min(100, valuationScore + growthScore + financialHealthScore + demandScore);

  let verdict: HealthScorecardType['verdict'];
  if (totalScore >= 80) verdict = 'Strong Buy';
  else if (totalScore >= 65) verdict = 'Buy';
  else if (totalScore >= 45) verdict = 'Neutral';
  else if (totalScore >= 30) verdict = 'Avoid';
  else verdict = 'High Risk';

  // Align with analyst rating if much different
  if (ipo.analystRating === 'Avoid') verdict = totalScore < 50 ? 'Avoid' : 'Neutral';
  if (ipo.analystRating === 'Apply') verdict = totalScore >= 45 ? (totalScore >= 70 ? 'Buy' : 'Neutral') : verdict;

  return {
    totalScore, valuationScore, growthScore, financialHealthScore, demandScore,
    flags, verdict, peRatio: peRatio ?? undefined, pbRatio: pbRatio ?? undefined,
    revenueCagr, patMargin, ofsPercent,
  };
}

interface HealthScorecardProps {
  ipo: IpoItem;
}

export const HealthScorecard: React.FC<HealthScorecardProps> = ({ ipo }) => {
  const scorecard = useMemo(() => computeHealthScore(ipo), [ipo]);

  const verdictConfig: Record<HealthScorecardType['verdict'], { color: string; bg: string; border: string; icon: React.ReactNode }> = {
    'Strong Buy': { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-300/60 dark:border-emerald-700/50', icon: <CheckCircle2 className="w-5 h-5" /> },
    'Buy': { color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-50 dark:bg-teal-950/40', border: 'border-teal-300/60 dark:border-teal-700/50', icon: <TrendingUp className="w-5 h-5" /> },
    'Neutral': { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-300/60 dark:border-amber-700/50', icon: <Minus className="w-5 h-5" /> },
    'Avoid': { color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-300/60 dark:border-rose-700/50', icon: <TrendingDown className="w-5 h-5" /> },
    'High Risk': { color: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-300/60 dark:border-red-700/50', icon: <XCircle className="w-5 h-5" /> },
  };
  const vc = verdictConfig[scorecard.verdict];

  const scoreBarSections = [
    { label: 'Valuation', score: scorecard.valuationScore, max: 25, color: 'bg-blue-500' },
    { label: 'Growth', score: scorecard.growthScore, max: 25, color: 'bg-violet-500' },
    { label: 'Financials', score: scorecard.financialHealthScore, max: 25, color: 'bg-amber-500' },
    { label: 'Demand', score: scorecard.demandScore, max: 25, color: 'bg-emerald-500' },
  ];

  const totalBarColor = scorecard.totalScore >= 70 ? 'bg-emerald-500' : scorecard.totalScore >= 45 ? 'bg-amber-500' : 'bg-rose-500';

  const redFlags = scorecard.flags.filter(f => f.type === 'red');
  const greenFlags = scorecard.flags.filter(f => f.type === 'green');

  return (
    <div className="space-y-5">
      {/* Verdict Banner */}
      <div className={`rounded-2xl p-4 border ${vc.bg} ${vc.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
              IPORadar Health Scorecard
            </p>
            <div className={`flex items-center gap-2 font-black text-xl ${vc.color}`}>
              {vc.icon}
              <span>{scorecard.verdict}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-slate-900 dark:text-white">{scorecard.totalScore}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">/ 100</div>
          </div>
        </div>

        {/* Total Score Bar */}
        <div className="mt-3 h-3 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${totalBarColor}`}
            style={{ width: `${scorecard.totalScore}%` }}
          />
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {scoreBarSections.map(s => (
          <div key={s.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{s.label}</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">{s.score}/{s.max}</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${s.color}`}
                style={{ width: `${(s.score / s.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      {(scorecard.peRatio || scorecard.patMargin || scorecard.revenueCagr || scorecard.ofsPercent !== undefined) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { label: 'Est. P/E', value: scorecard.peRatio ? `${scorecard.peRatio.toFixed(0)}x` : 'N/A (Loss)' },
            { label: 'Revenue CAGR', value: scorecard.revenueCagr !== undefined ? `${scorecard.revenueCagr.toFixed(1)}%` : 'N/A' },
            { label: 'PAT Margin', value: scorecard.patMargin !== undefined ? `${scorecard.patMargin.toFixed(1)}%` : 'N/A' },
            { label: 'OFS %', value: `${(scorecard.ofsPercent || 0).toFixed(0)}%` },
          ].map(m => (
            <div key={m.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
              <p className="text-sm font-black text-slate-900 dark:text-white">{m.value}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div>
          <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            Risk Flags
          </h4>
          <div className="space-y-2">
            {redFlags.map(flag => (
              <div key={flag.id} className={`rounded-xl p-3 border flex items-start gap-2.5 ${
                flag.severity === 'high'
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/70 dark:border-rose-800/40'
                  : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200/60 dark:border-orange-800/30'
              }`}>
                <XCircle className={`w-4 h-4 shrink-0 mt-0.5 ${flag.severity === 'high' ? 'text-rose-500' : 'text-orange-500'}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-black ${flag.severity === 'high' ? 'text-rose-700 dark:text-rose-300' : 'text-orange-700 dark:text-orange-300'}`}>
                      {flag.title}
                    </span>
                    {flag.value && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${flag.severity === 'high' ? 'bg-rose-200 dark:bg-rose-900 text-rose-700 dark:text-rose-300' : 'bg-orange-200 dark:bg-orange-900 text-orange-700 dark:text-orange-300'}`}>
                        {flag.value}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{flag.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Green Flags */}
      {greenFlags.length > 0 && (
        <div>
          <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
            <ShieldCheck className="w-4 h-4" />
            Strengths
          </h4>
          <div className="space-y-2">
            {greenFlags.map(flag => (
              <div key={flag.id} className="rounded-xl p-3 border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/30 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">{flag.title}</span>
                    {flag.value && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">{flag.value}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{flag.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl p-3 leading-relaxed">
        <strong>Disclaimer:</strong> Health scores are algorithmic estimates based on publicly available financial data and market subscription metrics. They do not constitute investment advice. Past performance is not indicative of future returns. Consult a SEBI-registered investment advisor before investing.
      </div>
    </div>
  );
};
