import React from 'react';
import { Layers, Flame, Clock, CheckCircle2 } from 'lucide-react';
import { IpoItem, IpoCategory, IpoStatus } from '../../types/ipo';

interface QuickStatsBarProps {
  ipos: IpoItem[];
  selectedCategory?: 'all' | IpoCategory;
  selectedStatus?: 'all' | IpoStatus;
  onSelectFilter?: (category?: 'all' | IpoCategory, status?: 'all' | IpoStatus) => void;
}

export const QuickStatsBar: React.FC<QuickStatsBarProps> = ({ 
  ipos, 
  selectedCategory = 'all',
  selectedStatus = 'all',
  onSelectFilter 
}) => {
  const totalCount = ipos.length;
  const mainboardTotal = ipos.filter(i => i.category === 'mainboard').length;
  const smeTotal = ipos.filter(i => i.category === 'sme').length;

  const liveCount = ipos.filter(i => i.status === 'live').length;
  const mainboardLive = ipos.filter(i => i.category === 'mainboard' && i.status === 'live').length;
  const smeLive = ipos.filter(i => i.category === 'sme' && i.status === 'live').length;

  const upcomingCount = ipos.filter(i => i.status === 'upcoming').length;
  const mainboardUpcoming = ipos.filter(i => i.category === 'mainboard' && i.status === 'upcoming').length;
  const smeUpcoming = ipos.filter(i => i.category === 'sme' && i.status === 'upcoming').length;

  const listedCount = ipos.filter(i => i.status === 'listed' || i.status === 'closed').length;
  const mainboardListed = ipos.filter(i => i.category === 'mainboard' && (i.status === 'listed' || i.status === 'closed')).length;
  const smeListed = ipos.filter(i => i.category === 'sme' && (i.status === 'listed' || i.status === 'closed')).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* Tile 1: All Issues (Mainboard + SME) */}
      <div 
        onClick={() => onSelectFilter?.('all', 'all')}
        className={`glass-card rounded-2xl p-3.5 sm:p-4 cursor-pointer transition-all flex items-center justify-between group ${
          selectedCategory === 'all' && selectedStatus === 'all'
            ? 'ring-2 ring-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-500/40'
            : 'hover:border-indigo-400/60'
        }`}
      >
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>All Issues</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalCount}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              ({mainboardTotal} Main • {smeTotal} SME)
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      {/* Tile 2: Live Bidding Open */}
      <div 
        onClick={() => onSelectFilter?.('all', 'live')}
        className={`glass-card rounded-2xl p-3.5 sm:p-4 cursor-pointer transition-all flex items-center justify-between group ${
          selectedStatus === 'live'
            ? 'ring-2 ring-emerald-500/80 bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-500/40'
            : 'hover:border-emerald-400/60'
        }`}
      >
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Live Bidding</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {liveCount}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              ({mainboardLive} Main • {smeLive} SME)
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Flame className="w-5 h-5" />
        </div>
      </div>

      {/* Tile 3: Upcoming IPOs */}
      <div 
        onClick={() => onSelectFilter?.('all', 'upcoming')}
        className={`glass-card rounded-2xl p-3.5 sm:p-4 cursor-pointer transition-all flex items-center justify-between group ${
          selectedStatus === 'upcoming'
            ? 'ring-2 ring-amber-500/80 bg-amber-50/50 dark:bg-amber-950/40 border-amber-500/40'
            : 'hover:border-amber-400/60'
        }`}
      >
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Upcoming IPOs</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {upcomingCount}
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              ({mainboardUpcoming} Main • {smeUpcoming} SME)
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Tile 4: Closed / Listed IPOs */}
      <div 
        onClick={() => onSelectFilter?.('all', 'listed')}
        className={`glass-card rounded-2xl p-3.5 sm:p-4 cursor-pointer transition-all flex items-center justify-between group ${
          selectedStatus === 'listed'
            ? 'ring-2 ring-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-500/40'
            : 'hover:border-indigo-400/60'
        }`}
      >
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Closed / Listed</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {listedCount}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              ({mainboardListed} Main • {smeListed} SME)
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

    </div>
  );
};
