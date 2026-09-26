import React, { useState, useMemo } from 'react';
import { IpoItem } from '../../types/ipo';
import {
  GitCompare, Plus, X, ArrowUpRight, TrendingUp, TrendingDown, Minus,
  Flame, BarChart3, DollarSign, Calendar, CheckCircle2, Sparkles,
  ChevronDown, AlertCircle, ShieldCheck
} from 'lucide-react';
import { CompanyLogo } from '../common/CompanyLogo';
import { Badge } from '../common/Badge';

interface IpoCompareViewProps {
  ipos: IpoItem[];
  onSelectIpo: (ipo: IpoItem) => void;
}

function fmt(n: number, decimals = 0) {
  return n.toLocaleString('en-IN', { maximumFractionDigits: decimals });
}

function CompareSelector({
  ipos,
  selectedId,
  onChange,
  placeholder,
}: {
  ipos: IpoItem[];
  selectedId: string;
  onChange: (id: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={selectedId}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {ipos.map(i => (
          <option key={i.id} value={i.id}>{i.name}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
}

type CompareMetricRow = {
  label: string;
  key: string;
  getValue: (ipo: IpoItem) => string | number;
  getNumericValue?: (ipo: IpoItem) => number;
  higherIsBetter?: boolean; // undefined = neutral
  format?: (v: number) => string;
  isSection?: boolean;
};

const METRIC_ROWS: CompareMetricRow[] = [
  { label: 'OVERVIEW', key: 'sec1', getValue: () => '', isSection: true },
  { label: 'Category', key: 'category', getValue: (i) => i.category === 'mainboard' ? 'Mainboard' : 'SME' },
  { label: 'Status', key: 'status', getValue: (i) => i.status.charAt(0).toUpperCase() + i.status.slice(1) },
  { label: 'Sector', key: 'sector', getValue: (i) => i.sector },
  { label: 'Exchange', key: 'exchange', getValue: (i) => i.exchange.join(' & ') },
  
  { label: 'PRICING', key: 'sec2', getValue: () => '', isSection: true },
  { label: 'Issue Price (₹)', key: 'price', getValue: (i) => `₹${i.priceBandMin}–₹${i.priceBandMax}`, getNumericValue: (i) => i.priceBandMax },
  { label: 'Lot Size (shares)', key: 'lot', getValue: (i) => fmt(i.lotSize), getNumericValue: (i) => i.lotSize },
  { label: 'Min Investment (₹)', key: 'min-inv', getValue: (i) => `₹${fmt(i.minInvestment)}`, getNumericValue: (i) => i.minInvestment, higherIsBetter: false },
  { label: 'Issue Size (₹ Cr)', key: 'issue-size', getValue: (i) => `₹${fmt(i.issueSizeCr)} Cr`, getNumericValue: (i) => i.issueSizeCr },
  { label: 'Fresh Issue (₹ Cr)', key: 'fresh', getValue: (i) => `₹${fmt(i.freshIssueCr)} Cr`, getNumericValue: (i) => i.freshIssueCr, higherIsBetter: true },
  { label: 'OFS (₹ Cr)', key: 'ofs', getValue: (i) => `₹${fmt(i.ofsCr)} Cr`, getNumericValue: (i) => i.ofsCr, higherIsBetter: false },
  { label: 'OFS %', key: 'ofs-pct', getValue: (i) => i.issueSizeCr > 0 ? `${((i.ofsCr / i.issueSizeCr) * 100).toFixed(1)}%` : '—', getNumericValue: (i) => i.issueSizeCr > 0 ? (i.ofsCr / i.issueSizeCr) * 100 : 0, higherIsBetter: false },
  
  { label: 'GMP & MARKET SENTIMENT', key: 'sec3', getValue: () => '', isSection: true },
  { label: 'Grey Market Premium (₹)', key: 'gmp', getValue: (i) => `+₹${fmt(i.gmp.gmpPrice)}`, getNumericValue: (i) => i.gmp.gmpPrice, higherIsBetter: true },
  { label: 'GMP (%)', key: 'gmp-pct', getValue: (i) => `+${i.gmp.gmpPercent.toFixed(1)}%`, getNumericValue: (i) => i.gmp.gmpPercent, higherIsBetter: true },
  { label: 'Kostak Rate (₹)', key: 'kostak', getValue: (i) => `₹${fmt(i.gmp.kostakRate)}`, getNumericValue: (i) => i.gmp.kostakRate, higherIsBetter: true },
  { label: 'Subject to Sauda (₹)', key: 'sts', getValue: (i) => `₹${fmt(i.gmp.subjectToSauda)}`, getNumericValue: (i) => i.gmp.subjectToSauda, higherIsBetter: true },
  { label: 'Est. Listing Price (₹)', key: 'listing', getValue: (i) => `₹${fmt(i.gmp.estimatedListingPrice)}`, getNumericValue: (i) => i.gmp.estimatedListingPrice, higherIsBetter: true },
  
  { label: 'SUBSCRIPTION DATA', key: 'sec4', getValue: () => '', isSection: true },
  { label: 'Overall Subscription', key: 'total-sub', getValue: (i) => `${i.subscription.total.toFixed(2)}x`, getNumericValue: (i) => i.subscription.total, higherIsBetter: true },
  { label: 'QIB (Institutional)', key: 'qib', getValue: (i) => `${i.subscription.qib.toFixed(2)}x`, getNumericValue: (i) => i.subscription.qib, higherIsBetter: true },
  { label: 'NII / HNI', key: 'nii', getValue: (i) => `${i.subscription.nii.toFixed(2)}x`, getNumericValue: (i) => i.subscription.nii, higherIsBetter: true },
  { label: 'Retail', key: 'retail', getValue: (i) => `${i.subscription.retail.toFixed(2)}x`, getNumericValue: (i) => i.subscription.retail, higherIsBetter: true },
  
  { label: 'FINANCIALS (LATEST FY)', key: 'sec5', getValue: () => '', isSection: true },
  { label: 'Revenue (₹ Cr)', key: 'rev', getValue: (i) => i.financials?.length ? `₹${fmt(i.financials[i.financials.length - 1].revenue)} Cr` : '—', getNumericValue: (i) => i.financials?.length ? i.financials[i.financials.length - 1].revenue : 0, higherIsBetter: true },
  { label: 'PAT (₹ Cr)', key: 'pat', getValue: (i) => i.financials?.length ? `₹${fmt(i.financials[i.financials.length - 1].pat)} Cr` : '—', getNumericValue: (i) => i.financials?.length ? i.financials[i.financials.length - 1].pat : 0, higherIsBetter: true },
  { label: 'Net Worth (₹ Cr)', key: 'nw', getValue: (i) => i.financials?.length ? `₹${fmt(i.financials[i.financials.length - 1].netWorth)} Cr` : '—', getNumericValue: (i) => i.financials?.length ? i.financials[i.financials.length - 1].netWorth : 0, higherIsBetter: true },
  { label: 'PAT Margin (%)', key: 'pat-margin', getValue: (i) => { const f = i.financials; if (!f?.length) return '—'; const l = f[f.length - 1]; return l.revenue > 0 ? `${((l.pat / l.revenue) * 100).toFixed(1)}%` : '—'; }, getNumericValue: (i) => { const f = i.financials; if (!f?.length) return 0; const l = f[f.length - 1]; return l.revenue > 0 ? (l.pat / l.revenue) * 100 : 0; }, higherIsBetter: true },
  
  { label: 'KEY DATES', key: 'sec6', getValue: () => '', isSection: true },
  { label: 'Open Date', key: 'open', getValue: (i) => i.openDate },
  { label: 'Close Date', key: 'close', getValue: (i) => i.closeDate },
  { label: 'Allotment Date', key: 'allot', getValue: (i) => i.allotmentDate },
  { label: 'Listing Date', key: 'list-dt', getValue: (i) => i.listingDate },
  
  { label: 'ANALYST RATING', key: 'sec7', getValue: () => '', isSection: true },
  { label: 'Analyst Recommendation', key: 'analyst', getValue: (i) => i.analystRating },
  { label: 'Rating Score', key: 'rating-score', getValue: (i) => `${i.ratingScore}/5`, getNumericValue: (i) => i.ratingScore, higherIsBetter: true },
];

function CellComparison({ ipos, metric }: { ipos: (IpoItem | null)[]; metric: CompareMetricRow }) {
  const values = ipos.map(ipo => ipo ? metric.getValue(ipo) : '—');
  const numericValues = ipos.map(ipo => (ipo && metric.getNumericValue) ? metric.getNumericValue(ipo) : null);

  const validNums = numericValues.filter(v => v !== null) as number[];
  const maxVal = validNums.length > 0 ? Math.max(...validNums) : null;
  const minVal = validNums.length > 0 ? Math.min(...validNums) : null;

  return (
    <>
      {ipos.map((ipo, idx) => {
        const val = values[idx];
        const num = numericValues[idx];
        let highlight = '';
        if (metric.getNumericValue && num !== null && maxVal !== null && minVal !== null && maxVal !== minVal) {
          if (metric.higherIsBetter === true && num === maxVal) highlight = 'text-emerald-600 dark:text-emerald-400 font-black';
          else if (metric.higherIsBetter === false && num === minVal) highlight = 'text-emerald-600 dark:text-emerald-400 font-black';
          else if (metric.higherIsBetter === true && num === minVal) highlight = 'text-rose-600 dark:text-rose-400';
          else if (metric.higherIsBetter === false && num === maxVal) highlight = 'text-rose-600 dark:text-rose-400';
        }

        return (
          <td key={idx} className={`px-4 py-2.5 text-sm text-center border-r border-slate-100 dark:border-slate-800 last:border-r-0 ${highlight || 'text-slate-700 dark:text-slate-300'}`}>
            {ipo ? val : <span className="text-slate-300 dark:text-slate-600">—</span>}
          </td>
        );
      })}
    </>
  );
}

export const IpoCompareView: React.FC<IpoCompareViewProps> = ({ ipos, onSelectIpo }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['', '', '']);

  const selectedIpos: (IpoItem | null)[] = selectedIds.map(id => ipos.find(i => i.id === id) || null);
  const activeIpos = selectedIpos.filter(Boolean) as IpoItem[];

  const handleChange = (idx: number, id: string) => {
    setSelectedIds(prev => {
      const next = [...prev];
      next[idx] = id;
      return next;
    });
  };

  // AI Verdict: recommend based on GMP + subscription + analyst rating
  const aiVerdict = useMemo(() => {
    if (activeIpos.length < 2) return null;
    const scored = activeIpos.map(ipo => ({
      ipo,
      score:
        (ipo.gmp.gmpPercent * 0.35) +
        (ipo.subscription.total * 0.3) +
        (ipo.ratingScore * 10 * 0.2) +
        (ipo.subscription.qib * 0.15),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored[0].ipo;
  }, [activeIpos]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <GitCompare className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Head-to-Head IPO Comparison
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Compare up to 3 IPOs side-by-side across GMP, pricing, subscription, financials, and analyst ratings.
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map(idx => (
          <div key={idx}>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              IPO #{idx + 1}
            </label>
            <CompareSelector
              ipos={ipos}
              selectedId={selectedIds[idx]}
              onChange={id => handleChange(idx, id)}
              placeholder={`Select IPO ${idx + 1}…`}
            />
          </div>
        ))}
      </div>

      {/* Company Headers */}
      {activeIpos.length > 0 && (
        <>
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Unified Scrollable Table */}
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/60">
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-400 w-[160px] sm:w-[200px] text-left align-top">
                      Company / Metric
                    </th>
                    {selectedIds.map((id, idx) => {
                      const ipo = selectedIpos[idx];
                      return (
                        <th key={idx} className="p-3 sm:p-4 text-center border-l border-slate-100 dark:border-slate-800 font-normal align-top">
                          {ipo ? (
                            <div className="space-y-2">
                              <div className="flex justify-center">
                                <CompanyLogo name={ipo.name} logo={ipo.logo} size="md" />
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => onSelectIpo(ipo)}
                                  className="text-xs font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 cursor-pointer"
                                >
                                  {ipo.name}
                                </button>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">{ipo.sector}</p>
                              </div>
                              <div className="flex justify-center">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  ipo.status === 'live' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                  : ipo.status === 'upcoming' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                  {ipo.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-slate-400 dark:text-slate-500 text-xs font-medium py-6">
                              No IPO Selected
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {METRIC_ROWS.map(metric => {
                    if (metric.isSection) {
                      return (
                        <tr key={metric.key} className="bg-slate-100/70 dark:bg-slate-800/60">
                          <td colSpan={selectedIds.length + 1} className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {metric.label}
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={metric.key} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-3 sm:px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 w-[160px] sm:w-[200px]">
                          {metric.label}
                        </td>
                        <CellComparison ipos={selectedIpos} metric={metric} />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Verdict */}
          {aiVerdict && activeIpos.length >= 2 && (
            <div className="glass-panel rounded-3xl p-5 border border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/50 dark:bg-indigo-950/20">
              <div className="flex items-start gap-3">
                <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-0.5">
                    IPORadar Recommendation
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Based on GMP momentum, institutional demand (QIB), subscription depth, and analyst rating, our model recommends deploying capital in:
                  </p>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    🏆 {aiVerdict.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    GMP: +{aiVerdict.gmp.gmpPercent.toFixed(1)}% &nbsp;•&nbsp; 
                    Overall Sub: {aiVerdict.subscription.total.toFixed(1)}x &nbsp;•&nbsp;
                    QIB: {aiVerdict.subscription.qib.toFixed(1)}x
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeIpos.length === 0 && (
        <div className="glass-card rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-800">
          <div className="text-4xl mb-4">⚔️</div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">No IPOs Selected</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Select at least 2 IPOs above to start comparing them side-by-side.</p>
        </div>
      )}
    </div>
  );
};
