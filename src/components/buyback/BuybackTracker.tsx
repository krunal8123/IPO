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
        {buybacks.map(item => (
          <div 
            key={item.id}
            className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant={item.status === 'open' ? 'success' : item.status === 'upcoming' ? 'warning' : 'neutral'}>
                  {item.status.toUpperCase()}
                </Badge>
                <span className="text-xs font-semibold text-slate-400">
                  {item.type}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                {item.companyName}
              </h3>
              <p className="text-xs text-slate-400 mb-4">Symbol: {item.symbol} • Record Date: {item.recordDate}</p>

              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block">Buyback Price</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">₹{item.buybackPrice}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block">Current Price (CMP)</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">₹{item.currentMarketPrice}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Premium: +{item.premiumPercent}%
              </span>
              <span className="text-slate-500 font-semibold">Size: ₹{item.issueSizeCr.toLocaleString('en-IN')} Cr</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
