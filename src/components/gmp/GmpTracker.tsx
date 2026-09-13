import React, { useState } from 'react';
import { IpoItem } from '../../types/ipo';
import { Flame, Calculator, TrendingUp, ArrowUpRight, Search, Sparkles, Minus, Plus } from 'lucide-react';
import { Badge } from '../common/Badge';
import { CompanyLogo } from '../common/CompanyLogo';

interface GmpTrackerProps {
  ipos: IpoItem[];
  onSelectIpo: (ipo: IpoItem) => void;
}

export const GmpTracker: React.FC<GmpTrackerProps> = ({ ipos, onSelectIpo }) => {
  const [calcLots, setCalcLots] = useState<number>(1);
  const [selectedCalcIpo, setSelectedCalcIpo] = useState<string>(ipos[0]?.id || '');
  const [filterCat, setFilterCat] = useState<'all' | 'mainboard' | 'sme'>('all');

  const filtered = ipos
    .filter(i => filterCat === 'all' || i.category === filterCat)
    .sort((a, b) => b.gmp.gmpPercent - a.gmp.gmpPercent);

  const activeIpo = ipos.find(i => i.id === selectedCalcIpo) || ipos[0];
  const maxRetailLots = activeIpo 
    ? (activeIpo.category === 'sme' ? 1 : Math.max(1, Math.floor(200000 / (activeIpo.lotSize * activeIpo.priceBandMax))))
    : 13;
  const expectedProfit = activeIpo ? activeIpo.gmp.gmpPrice * activeIpo.lotSize * calcLots : 0;
  const investmentNeeded = activeIpo ? activeIpo.minInvestment * calcLots : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-500">
                <Flame className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                IPO Grey Market Premium (GMP)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Live grey market rates, Kostak rates, Subject to Sauda, and expected listing gains.
            </p>
          </div>

          {/* Category Pill Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 text-xs font-bold">
            <button
              onClick={() => setFilterCat('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterCat === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All GMP
            </button>
            <button
              onClick={() => setFilterCat('mainboard')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterCat === 'mainboard'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Mainboard
            </button>
            <button
              onClick={() => setFilterCat('sme')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterCat === 'sme'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              SME
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Profit Calculator */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-white dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-slate-900/40">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Live Expected Profit Calculator
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Select IPO Issue
            </label>
            <select
              value={selectedCalcIpo}
              onChange={(e) => setSelectedCalcIpo(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              {ipos.map(i => (
                <option key={i.id} value={i.id}>
                  {i.name} (+{i.gmp.gmpPercent}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Number of Lots Applied
              </label>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                = {(calcLots * (activeIpo?.lotSize || 1)).toLocaleString('en-IN')} Shares
              </span>
            </div>

            {/* Custom Sleek Stepper Input without ugly default browser up/down spin arrows */}
            <div className="flex items-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 shadow-xs focus-within:ring-2 focus-within:ring-indigo-500/40">
              <button
                type="button"
                onClick={() => setCalcLots(prev => Math.max(1, prev - 1))}
                disabled={calcLots <= 1}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer font-bold shrink-0"
                title="Decrease Lots"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <input
                type="number"
                min="1"
                max="100"
                value={calcLots}
                onChange={(e) => setCalcLots(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="w-full text-center text-sm font-black text-slate-900 dark:text-white bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button
                type="button"
                onClick={() => setCalcLots(prev => Math.min(100, prev + 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer font-bold shrink-0"
                title="Increase Lots"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick preset lot pills */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5">
              {[1, 2, 5, 10, maxRetailLots].filter((v, i, a) => a.indexOf(v) === i && v > 0).map(lot => (
                <button
                  key={lot}
                  type="button"
                  onClick={() => setCalcLots(lot)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer shrink-0 ${
                    calcLots === lot
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {lot === maxRetailLots && lot > 1 ? `Max Retail (${lot})` : `${lot} Lot${lot > 1 ? 's' : ''}`}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Listing Profit</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                +₹{expectedProfit.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
              <span>Investment Required:</span>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                ₹{investmentNeeded.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GMP Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Company / IPO</th>
                <th className="p-3.5">Issue Price</th>
                <th className="p-3.5">Grey Market Premium</th>
                <th className="p-3.5">Est. Listing Price</th>
                <th className="p-3.5">Profit Per Lot</th>
                <th className="p-3.5">Kostak / SS</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(ipo => {
                const profitPerLot = ipo.gmp.gmpPrice * ipo.lotSize;
                return (
                  <tr 
                    key={ipo.id} 
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => onSelectIpo(ipo)}
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <CompanyLogo logo={ipo.logo} name={ipo.name} symbol={ipo.symbol} size="sm" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{ipo.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-bold">
                              {ipo.category}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Lot: {ipo.lotSize} shares • Closes {ipo.closeDate}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      ₹{ipo.priceBandMax}
                    </td>

                    <td className="p-3.5">
                      <div className="inline-flex items-center gap-1 font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+₹{ipo.gmp.gmpPrice}</span>
                        <span className="text-[10px]">({ipo.gmp.gmpPercent}%)</span>
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      ₹{ipo.gmp.estimatedListingPrice}
                    </td>

                    <td className="p-3.5 font-extrabold text-emerald-600 dark:text-emerald-400">
                      +₹{profitPerLot.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      <div>K: ₹{ipo.gmp.kostakRate}</div>
                      <div className="text-[10px] text-slate-400">SS: ₹{ipo.gmp.subjectToSauda}</div>
                    </td>

                    <td className="p-3.5 text-right">
                      <button 
                        className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                        title="View Prospectus"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
