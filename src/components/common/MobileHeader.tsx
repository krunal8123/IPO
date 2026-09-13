import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useWatchlist } from '../../context/WatchlistContext';
import { Sun, Moon, Bookmark, Bell, Radar } from 'lucide-react';

interface MobileHeaderProps {
  activeTab: string;
  onOpenWatchlist: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ activeTab, onOpenWatchlist }) => {
  const { theme, toggleTheme } = useTheme();
  const { watchlist } = useWatchlist();

  const titles: Record<string, string> = {
    ipos: 'IPORadar Live',
    gmp: 'Grey Market Premium',
    subscription: 'Live Subscription',
    allotment: 'Allotment Status',
    calendar: 'IPO Calendar',
    buyback: 'Share Buybacks'
  };

  return (
    <div className="md:hidden sticky top-0 z-40 safe-top bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-sm text-white">
          <Radar className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white">
            {titles[activeTab] || 'IPORadar'}
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Real-time Indian Stock Market Intelligence
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenWatchlist}
          className="relative p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          <Bookmark className="w-4 h-4" />
          {watchlist.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[9px] font-bold text-white flex items-center justify-center">
              {watchlist.length}
            </span>
          )}
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          {theme === 'light' ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </div>
  );
};
