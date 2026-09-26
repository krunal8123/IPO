import React from 'react';
import { IpoCategory, IpoStatus } from '../../types/ipo';
import { Bookmark } from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';

interface FilterBarProps {
  category: 'all' | IpoCategory;
  setCategory: (c: 'all' | IpoCategory) => void;
  status: 'all' | IpoStatus;
  setStatus: (s: 'all' | IpoStatus) => void;
  showWatchlistOnly: boolean;
  setShowWatchlistOnly: (val: boolean) => void;
  countMap: {
    all: number;
    mainboard: number;
    sme: number;
    live: number;
    upcoming: number;
    listed: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  category,
  setCategory,
  status,
  setStatus,
  showWatchlistOnly,
  setShowWatchlistOnly,
  countMap
}) => {
  const { watchlist } = useWatchlist();
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-2">
      
      {/* Category Toggle (All Issues vs Mainboard vs SME) */}
      <div className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/70 border border-slate-300/60 dark:border-slate-700/60 backdrop-blur-md">
        
        {/* All Issues Button */}
        <button
          onClick={() => setCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            category === 'all'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>All Issues</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 font-extrabold border border-slate-200/60 dark:border-slate-700/60">
            {countMap.all}
          </span>
        </button>

        {/* Mainboard Button */}
        <button
          onClick={() => setCategory('mainboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            category === 'mainboard'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Mainboard</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-extrabold border border-indigo-200/60 dark:border-indigo-800/60">
            {countMap.mainboard}
          </span>
        </button>

        {/* SME Button */}
        <button
          onClick={() => setCategory('sme')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            category === 'sme'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>SME</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 font-extrabold border border-purple-200/60 dark:border-purple-800/60">
            {countMap.sme}
          </span>
        </button>

      </div>

      {/* Status Pills & Watchlist Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStatus('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            status === 'all' && !showWatchlistOnly
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
              : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
          }`}
        >
          <span>All Status</span>
          <span className="text-[10px] opacity-75 ml-1 font-bold">({countMap.all})</span>
        </button>

        <button
          onClick={() => { setStatus('live'); setShowWatchlistOnly(false); }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
            status === 'live' && !showWatchlistOnly
              ? 'bg-emerald-600 text-white border-transparent shadow-xs'
              : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Bidding</span>
          <span className="text-[10px] opacity-80 font-bold">({countMap.live})</span>
        </button>

        <button
          onClick={() => { setStatus('upcoming'); setShowWatchlistOnly(false); }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
            status === 'upcoming' && !showWatchlistOnly
              ? 'bg-amber-600 text-white border-transparent shadow-xs'
              : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-500'
          }`}
        >
          <span>Upcoming</span>
          <span className="text-[10px] opacity-80 font-bold">({countMap.upcoming})</span>
        </button>

        <button
          onClick={() => { setStatus('listed'); setShowWatchlistOnly(false); }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
            status === 'listed' && !showWatchlistOnly
              ? 'bg-indigo-600 text-white border-transparent shadow-xs'
              : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-500'
          }`}
        >
          <span>Listed / Closed</span>
          <span className="text-[10px] opacity-80 font-bold">({countMap.listed})</span>
        </button>

        {/* Watchlist Filter Pill */}
        <button
          onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
            showWatchlistOnly
              ? 'bg-indigo-600 text-white border-transparent shadow-xs'
              : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-500'
          }`}
        >
          <Bookmark className={`w-3 h-3 ${showWatchlistOnly ? 'fill-white' : ''}`} />
          <span>Watchlist</span>
          {watchlist.length > 0 && (
            <span className={`text-[10px] ml-0.5 font-bold ${showWatchlistOnly ? 'text-indigo-100' : 'text-indigo-600 dark:text-indigo-400'}`}>
              ({watchlist.length})
            </span>
          )}
        </button>
      </div>

    </div>
  );
};
