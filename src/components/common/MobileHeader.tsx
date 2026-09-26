import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useWatchlist } from '../../context/WatchlistContext';
import { Sun, Moon, Bookmark, Search, X, Radar, RefreshCw } from 'lucide-react';
import { IpoItem } from '../../types/ipo';
import { CompanyLogo } from './CompanyLogo';

interface MobileHeaderProps {
  activeTab: string;
  onOpenWatchlist: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  ipos?: IpoItem[];
  onSelectIpo?: (ipo: IpoItem) => void;
  onNavigateToIpos?: () => void;
  isSyncing?: boolean;
  lastSyncTime?: string;
  onRefresh?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeTab,
  onOpenWatchlist,
  searchQuery,
  setSearchQuery,
  ipos = [],
  onSelectIpo,
  onNavigateToIpos,
  isSyncing = false,
  lastSyncTime = '',
  onRefresh
}) => {
  const { theme, toggleTheme } = useTheme();
  const { watchlist } = useWatchlist();
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const titles: Record<string, string> = {
    ipos: 'IPORadar Live',
    gmp: 'Grey Market Premium',
    subscription: 'Live Subscription',
    allotment: 'Allotment Status',
    calendar: 'IPO Calendar',
    buyback: 'Share Buybacks'
  };

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [isSearchOpen]);

  const q = searchQuery.toLowerCase().trim();
  const searchMatches = q.length > 0 && ipos
    ? ipos.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.symbol.toLowerCase().includes(q) ||
        i.sector.toLowerCase().includes(q) ||
        i.registrar.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="md:hidden sticky top-0 z-40 safe-top bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 transition-all">
      {!isSearchOpen ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-sm text-white shrink-0">
              <Radar className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white">
                {titles[activeTab] || 'IPORadar'}
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                {isSyncing ? (
                  <>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span>Fetching latest data…</span>
                  </>
                ) : lastSyncTime ? (
                  <>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Updated {lastSyncTime}</span>
                  </>
                ) : (
                  'Real-time Indian Stock Market Intelligence'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isSyncing}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-500' : ''}`} />
              </button>
            )}

            {/* Search Toggle Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Search IPOs"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Watchlist */}
            <button
              onClick={onOpenWatchlist}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Watchlist"
            >
              <Bookmark className="w-4 h-4" />
              {watchlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[9px] font-bold text-white flex items-center justify-center">
                  {watchlist.length}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>
      ) : (
        /* Expanded Mobile Search Input */
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search IPO, SME, GMP, Sector..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="px-2.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Instant Search Popup on Mobile */}
          {q.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2.5 max-h-[360px] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl z-50 divide-y divide-slate-100 dark:divide-slate-800 animate-fade-in no-scrollbar">
              {searchMatches.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No IPOs found matching "{searchQuery}"
                </div>
              ) : (
                <>
                  <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Matching IPOs</span>
                    <span>{searchMatches.length} found</span>
                  </div>
                  {searchMatches.slice(0, 7).map(ipo => (
                    <button
                      key={ipo.id}
                      type="button"
                      onClick={() => {
                        onSelectIpo?.(ipo);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer group"
                    >
                      <div className="min-w-0 flex items-center gap-2.5">
                        <CompanyLogo ipo={ipo} size="sm" className="w-8 h-8 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {ipo.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {ipo.category.toUpperCase()} • ₹{ipo.priceBandMax} • Closes {ipo.closeDate}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 block">
                          +₹{ipo.gmp.gmpPrice}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          (+{ipo.gmp.gmpPercent}%)
                        </span>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToIpos?.();
                      setIsSearchOpen(false);
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer border-t border-slate-100 dark:border-slate-800"
                  >
                    View all {searchMatches.length} results in Main Explorer →
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
