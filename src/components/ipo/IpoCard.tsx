import React from 'react';
import { IpoItem } from '../../types/ipo';
import { useWatchlist } from '../../context/WatchlistContext';
import { Badge } from '../common/Badge';
import { CompanyLogo } from '../common/CompanyLogo';
import { 
  Bookmark, 
  TrendingUp, 
  Calendar, 
  Coins, 
  ChevronRight, 
  Sparkles,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface IpoCardProps {
  ipo: IpoItem;
  onSelect: (ipo: IpoItem) => void;
}

export const IpoCard: React.FC<IpoCardProps> = ({ ipo, onSelect }) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const bookmarked = isInWatchlist(ipo.id);

  const statusConfig = {
    live: { label: 'Live Bidding', variant: 'success' as const, pulse: true },
    upcoming: { label: 'Upcoming', variant: 'warning' as const, pulse: false },
    closed: { label: 'Closed', variant: 'neutral' as const, pulse: false },
    listed: { label: 'Listed', variant: 'primary' as const, pulse: false }
  };

  const statusInfo = statusConfig[ipo.status];

  return (
    <div 
      className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative group cursor-pointer border border-slate-200/80 dark:border-slate-800/80"
      onClick={() => onSelect(ipo)}
    >
      {/* Top Header: Badge, Category & Bookmark */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.variant} pulse={statusInfo.pulse}>
              {statusInfo.label}
            </Badge>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {ipo.category === 'mainboard' ? 'Mainboard' : 'SME'}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist(ipo.id);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              bookmarked
                ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={bookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-indigo-600' : ''}`} />
          </button>
        </div>

        {/* Company Identity */}
        <div className="flex items-start gap-3 mb-4">
          <CompanyLogo logo={ipo.logo} name={ipo.name} symbol={ipo.symbol} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {ipo.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              {ipo.sector} • {ipo.symbol}
            </p>
          </div>
        </div>

        {/* GMP Highlight Banner */}
        <div className="rounded-xl p-2.5 mb-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent dark:from-emerald-500/15 dark:via-teal-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-xs">
              ₹
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                Live GMP
              </div>
              <div className="text-xs font-black text-slate-900 dark:text-white">
                +₹{ipo.gmp.gmpPrice}{' '}
                <span className="text-emerald-600 dark:text-emerald-400">
                  (+{ipo.gmp.gmpPercent}%)
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Est. Listing</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              ₹{ipo.gmp.estimatedListingPrice}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
              Price Band
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              ₹{ipo.priceBandMin} - ₹{ipo.priceBandMax}
            </span>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
              Min. Investment
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              ₹{ipo.minInvestment.toLocaleString('en-IN')}{' '}
              <span className="text-[10px] font-normal text-slate-500">({ipo.lotSize} sh)</span>
            </span>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
              Issue Size
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              ₹{ipo.issueSizeCr.toLocaleString('en-IN')} Cr
            </span>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
              Subscription
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
              {ipo.subscription.total > 0 ? (
                <>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                    {ipo.subscription.total}x
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Day {ipo.subscription.day})
                  </span>
                </>
              ) : (
                <span className="text-slate-400 font-normal">Opens Soon</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Date schedule & Detail Link */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-800 dark:text-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
          <span>{ipo.openDate} to {ipo.closeDate}</span>
        </div>

        <div className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform text-[11px]">
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
