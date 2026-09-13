import React from 'react';
import { BuybackItem } from '../../types/ipo';
import { Coins, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Badge } from '../common/Badge';

interface BuybackTrackerProps {
  buybacks: BuybackItem[];
}

export const BuybackTracker: React.FC<BuybackTrackerProps> = ({ buybacks }) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500">
            <Coins className="w-5 h-5" />
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Share Buybacks Tracker
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Track active and upcoming share buybacks, tender offer prices, and premium over current market prices.
        </p>
      </div>

      {/* Buybacks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {buybacks.map(item => {
          const arbitrageSpread = Math.max(0, item.buybackPrice - item.currentMarketPrice);
          return (
            <div 
              key={item.id}
              className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === 'open' ? 'success' : item.status === 'upcoming' ? 'warning' : 'neutral'}>
                      {item.status.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {item.type}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Record: {item.recordDate}
                  </span>
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                    {item.companyName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                      {item.companyName}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Symbol: <span className="font-bold text-slate-700 dark:text-slate-300">{item.symbol}</span> • Issue Size: ₹{item.issueSizeCr.toLocaleString('en-IN')} Cr
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Buyback Price</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">₹{item.buybackPrice}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Current Price</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">₹{item.currentMarketPrice}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-center">
                    <span className="text-[10px] uppercase text-emerald-600 dark:text-emerald-400 block font-semibold">Spread / Share</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">+₹{arbitrageSpread}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Premium: +{item.premiumPercent}%
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Tender Route
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
