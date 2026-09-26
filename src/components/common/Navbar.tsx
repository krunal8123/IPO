import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useWatchlist } from '../../context/WatchlistContext';
import { 
  Sun, 
  Moon, 
  Search, 
  Bookmark, 
  BarChart3, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Coins, 
  Layers,
  Radar,
  RefreshCw,
  Target,
  GitCompare
} from 'lucide-react';

import { IpoItem } from '../../types/ipo';
import { CompanyLogo } from './CompanyLogo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenWatchlist: () => void;
  ipos?: IpoItem[];
  onSelectIpo?: (ipo: IpoItem) => void;
  isSyncing?: boolean;
  lastSyncTime?: string;
  onRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenWatchlist,
  ipos = [],
  onSelectIpo,
  isSyncing = false,
  lastSyncTime = '',
  onRefresh
}) => {
  const { theme, toggleTheme } = useTheme();
  const { watchlist } = useWatchlist();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { id: 'ipos', label: 'IPOs', icon: Layers },
    { id: 'gmp', label: 'GMP', icon: Flame, badge: 'Live' },
    { id: 'subscription', label: 'Subscription', icon: BarChart3 },
    { id: 'allotment', label: 'Allotment', icon: CheckCircle2 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: Target, badge: 'New' },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    // { id: 'buyback', label: 'Buybacks', icon: Coins } // Hidden for now
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-5">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
            onClick={() => setActiveTab('ipos')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/25 text-white">
              <Radar className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="brand-font text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  IPO<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Radar</span>
                </span>
                <span className="text-[10px] uppercase font-black bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded tracking-wide">
                  Live
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden xl:flex items-center gap-1">
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-2.5 h-2.5 animate-spin text-indigo-500" />
                    <span>Fetching latest data…</span>
                  </>
                ) : lastSyncTime ? (
                  <>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Updated {lastSyncTime}</span>
                  </>
                ) : (
                  'GMP • Subscription • Allotment Terminal'
                )}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-0.5 lg:space-x-1 shrink-0">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-2 lg:px-2.5 xl:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold flex items-center gap-1.5 transition-all duration-150 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[8px] lg:text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Search Bar & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-1 justify-end min-w-0">
            <div className="relative w-full min-w-[180px] max-w-[220px] md:max-w-[240px] lg:max-w-[340px] xl:max-w-[420px] transition-all duration-200 focus-within:max-w-[320px] md:focus-within:max-w-[360px] lg:focus-within:max-w-[440px] xl:focus-within:max-w-[520px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search IPO, SME, GMP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-14 py-1.5 text-xs sm:text-sm rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner/5"
              />
              {!searchQuery ? (
                <div className="hidden lg:flex items-center absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <kbd className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-slate-400 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-700/70 rounded border border-slate-300 dark:border-slate-600 shadow-xs">
                    ⌘K
                  </kbd>
                </div>
              ) : (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}

              {/* Instant Live Search Results Popup */}
              {searchQuery.trim().length > 0 && ipos && (
                <div className="absolute right-0 top-full mt-2 w-[340px] lg:w-[420px] max-h-[380px] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl z-50 divide-y divide-slate-100 dark:divide-slate-800 animate-fade-in no-scrollbar">
                  {(() => {
                    const q = searchQuery.toLowerCase().trim();
                    const matches = ipos.filter(i =>
                      i.name.toLowerCase().includes(q) ||
                      i.symbol.toLowerCase().includes(q) ||
                      i.sector.toLowerCase().includes(q) ||
                      i.registrar.toLowerCase().includes(q)
                    );

                    if (matches.length === 0) {
                      return (
                        <div className="p-4 text-center text-xs text-slate-500">
                          No IPOs found matching "{searchQuery}"
                        </div>
                      );
                    }

                    return (
                      <>
                        <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                          <span>Search Results</span>
                          <span>{matches.length} found</span>
                        </div>
                        {matches.slice(0, 8).map(ipo => (
                          <button
                            key={ipo.id}
                            type="button"
                            onClick={() => {
                              onSelectIpo?.(ipo);
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
                            setActiveTab('ipos');
                          }}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer border-t border-slate-100 dark:border-slate-800"
                        >
                          View all {matches.length} results in Main Explorer →
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Watchlist Quick Button */}
            <button
              onClick={onOpenWatchlist}
              className="relative p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="View Watchlist"
            >
              <Bookmark className="w-4 h-4" />
              {watchlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center shadow-xs">
                  {watchlist.length}
                </span>
              )}
            </button>

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isSyncing}
                className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={isSyncing ? 'Refreshing…' : 'Refresh live data'}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-500' : ''}`} />
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
