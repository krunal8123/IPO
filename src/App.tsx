import React, { useState, useMemo, useEffect } from 'react';
import { IpoItem, IpoCategory, IpoStatus, BuybackItem } from './types/ipo';
import { useWatchlist } from './context/WatchlistContext';
import { liveIpoService } from './services/liveIpoService';
import { getCachedUpstoxIpos } from './services/upstoxDirectService';
import { NoticeTicker } from './components/common/NoticeTicker';
import { Navbar } from './components/common/Navbar';
import { MobileHeader } from './components/common/MobileHeader';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { QuickStatsBar } from './components/ipo/QuickStatsBar';
import { FilterBar } from './components/ipo/FilterBar';
import { IpoCard } from './components/ipo/IpoCard';
import { IpoDetailModal } from './components/ipo/IpoDetailModal';
import { GmpTracker } from './components/gmp/GmpTracker';
import { SubscriptionView } from './components/subscription/SubscriptionView';
import { AllotmentChecker } from './components/allotment/AllotmentChecker';
import { IpoCalendar } from './components/calendar/IpoCalendar';
import { BuybackTracker } from './components/buyback/BuybackTracker';
import { ServerSettingsModal } from './components/common/ServerSettingsModal';
import { InstallPwaBanner } from './components/common/InstallPwaBanner';
import { RefreshCw, Radio, Sparkles, Settings } from 'lucide-react';

const VALID_TABS = ['ipos', 'gmp', 'subscription', 'allotment', 'calendar', 'buyback'] as const;
type TabType = typeof VALID_TABS[number];

function getInitialTab(): TabType {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase() as TabType;
    if (VALID_TABS.includes(hash)) {
      return hash;
    }
    const saved = localStorage.getItem('iporadar_active_tab') as TabType;
    if (saved && VALID_TABS.includes(saved)) {
      return saved;
    }
  }
  return 'ipos';
}

export const App: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
      try {
        localStorage.setItem('iporadar_active_tab', tab);
      } catch {
        // ignore
      }
    }
  };

  // Sync route on hashchange (browser Back/Forward navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (VALID_TABS.includes(hash as TabType) && hash !== activeTab) {
        setActiveTabState(hash);
        try {
          localStorage.setItem('iporadar_active_tab', hash);
        } catch {
          // ignore
        }
      }
    };

    if (!window.location.hash && activeTab) {
      window.location.hash = activeTab;
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);
  const [categoryFilter, setCategoryFilter] = useState<'all' | IpoCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | IpoStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showWatchlistOnly, setShowWatchlistOnly] = useState<boolean>(false);
  const [selectedIpo, setSelectedIpo] = useState<IpoItem | null>(null);
  const [allotmentTarget, setAllotmentTarget] = useState<{ id: string; timestamp: number } | null>(null);
  const [showServerModal, setShowServerModal] = useState<boolean>(false);

  // Live real-time state directly from Upstox API
  const [ipos, setIpos] = useState<IpoItem[]>(() => getCachedUpstoxIpos());
  const [buybacks, setBuybacks] = useState<BuybackItem[]>([]);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<string>('Verified Market Feed');

  const { isInWatchlist } = useWatchlist();

  // Fetch live market data
  const syncLiveData = async () => {
    setIsSyncing(true);
    try {
      // Temporarily disabled buybacks API call
      // const buybackRes = await liveIpoService.fetchBuybacks();
      const ipoRes = await liveIpoService.getLiveIpos();
      setIpos(ipoRes.ipos);
      setIsLive(ipoRes.isLive);
      setLastSyncTime(ipoRes.timestamp);
      setDataSource(ipoRes.source);
      // if (buybackRes.length > 0) setBuybacks(buybackRes);
    } catch (e) {
      console.warn('Failed to sync live data:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncLiveData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      syncLiveData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter logic
  const filteredIpos = useMemo(() => {
    return ipos.filter(ipo => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          ipo.name.toLowerCase().includes(q) ||
          ipo.symbol.toLowerCase().includes(q) ||
          ipo.sector.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Watchlist
      if (showWatchlistOnly && !isInWatchlist(ipo.id)) {
        return false;
      }

      // Category
      if (categoryFilter !== 'all' && ipo.category !== categoryFilter) {
        return false;
      }

      // Status
      if (statusFilter !== 'all') {
        if (statusFilter === 'listed') {
          if (ipo.status !== 'listed' && ipo.status !== 'closed') return false;
        } else if (ipo.status !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [ipos, categoryFilter, statusFilter, searchQuery, showWatchlistOnly, isInWatchlist]);

  // Counts for filter badges (reflects active filters accurately)
  const countMap = useMemo(() => {
    const baseMatches = (i: IpoItem) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!i.name.toLowerCase().includes(q) && !i.symbol.toLowerCase().includes(q) && !i.sector.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (showWatchlistOnly && !isInWatchlist(i.id)) {
        return false;
      }
      return true;
    };

    const statusMatches = (i: IpoItem) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'listed') return i.status === 'listed' || i.status === 'closed';
      return i.status === statusFilter;
    };

    const categoryMatches = (i: IpoItem) => {
      if (categoryFilter === 'all') return true;
      return i.category === categoryFilter;
    };

    return {
      all: ipos.filter(i => baseMatches(i) && statusMatches(i)).length,
      mainboard: ipos.filter(i => baseMatches(i) && statusMatches(i) && i.category === 'mainboard').length,
      sme: ipos.filter(i => baseMatches(i) && statusMatches(i) && i.category === 'sme').length,
      live: ipos.filter(i => baseMatches(i) && categoryMatches(i) && i.status === 'live').length,
      upcoming: ipos.filter(i => baseMatches(i) && categoryMatches(i) && i.status === 'upcoming').length,
      listed: ipos.filter(i => baseMatches(i) && categoryMatches(i) && (i.status === 'listed' || i.status === 'closed')).length,
    };
  }, [ipos, statusFilter, categoryFilter, searchQuery, showWatchlistOnly, isInWatchlist]);

  const handleOpenWatchlist = () => {
    setActiveTab('ipos');
    setShowWatchlistOnly(true);
  };

  const handleFilterSelect = (cat?: 'all' | IpoCategory, stat?: 'all' | IpoStatus) => {
    setActiveTab('ipos');
    if (cat) setCategoryFilter(cat);
    if (stat) setStatusFilter(stat);
    setShowWatchlistOnly(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white pb-16 md:pb-8 transition-colors duration-200">

      {/* 1. Desktop Layout: Top Ticker followed by Desktop Navbar */}
      <div className="hidden md:block">
        <NoticeTicker ipos={ipos} isLive={isLive} onSelectIpo={(ipo) => setSelectedIpo(ipo)} />
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenWatchlist={handleOpenWatchlist}
          ipos={ipos}
          onSelectIpo={(ipo) => setSelectedIpo(ipo)}
        />
      </div>

      {/* 2. Mobile Layout: MobileHeader with safe-top first, then NoticeTicker cleanly below it */}
      <div className="md:hidden">
        <MobileHeader
          activeTab={activeTab}
          onOpenWatchlist={handleOpenWatchlist}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          ipos={ipos}
          onSelectIpo={(ipo) => setSelectedIpo(ipo)}
          onNavigateToIpos={() => setActiveTab('ipos')}
        />
        <NoticeTicker ipos={ipos} isLive={isLive} onSelectIpo={(ipo) => setSelectedIpo(ipo)} />
      </div>

      {/* 4. Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">

        {/* IPOs Tab */}
        {activeTab === 'ipos' && (
          <div>
            {/* Quick Metrics Bar */}
            <QuickStatsBar
              ipos={ipos}
              selectedCategory={categoryFilter}
              selectedStatus={statusFilter}
              onSelectFilter={handleFilterSelect}
            />

            {/* Filter & Category Pills */}
            <FilterBar
              category={categoryFilter}
              setCategory={setCategoryFilter}
              status={statusFilter}
              setStatus={setStatusFilter}
              showWatchlistOnly={showWatchlistOnly}
              setShowWatchlistOnly={setShowWatchlistOnly}
              countMap={countMap}
            />

            {/* Filter Result Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 px-1 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  {categoryFilter === 'all' ? 'All Issues' : categoryFilter === 'mainboard' ? 'Mainboard Issues' : 'SME Issues'}
                </span>
                <span>•</span>
                <span>
                  Showing <strong className="text-slate-900 dark:text-white">{filteredIpos.length}</strong> {filteredIpos.length === 1 ? 'Tile' : 'Tiles'}
                  {categoryFilter === 'all' && (
                    <span className="opacity-80">
                      {' '}({filteredIpos.filter(i => i.category === 'mainboard').length} Mainboard • {filteredIpos.filter(i => i.category === 'sme').length} SME)
                    </span>
                  )}
                </span>
              </div>

              {(categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery || showWatchlistOnly) && (
                <button
                  onClick={() => {
                    setCategoryFilter('all');
                    setStatusFilter('all');
                    setSearchQuery('');
                    setShowWatchlistOnly(false);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-[11px] cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* IPO Cards Grid */}
            {ipos.length === 0 && isSyncing ? (
              <div className="glass-card rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 my-8 max-w-lg mx-auto animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-7 h-7 animate-spin" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                  Connecting to Live Upstox API
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Streaming real-time IPO and market data directly from Upstox...
                </p>
              </div>
            ) : filteredIpos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredIpos.map(ipo => (
                  <IpoCard
                    key={ipo.id}
                    ipo={ipo}
                    onSelect={(i) => setSelectedIpo(i)}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 my-8 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto mb-4 text-2xl">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  No IPOs Found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {showWatchlistOnly
                    ? "You haven't saved any IPOs to your watchlist yet. Tap the bookmark icon on any IPO card to save it."
                    : "No IPOs matched your current filter criteria. Try clearing search or selecting 'All Status'."}
                </p>
                <button
                  onClick={() => {
                    setCategoryFilter('all');
                    setStatusFilter('all');
                    setSearchQuery('');
                    setShowWatchlistOnly(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* GMP Tab */}
        {activeTab === 'gmp' && (
          <GmpTracker
            ipos={ipos}
            onSelectIpo={(i) => setSelectedIpo(i)}
            searchQuery={searchQuery}
          />
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <SubscriptionView
            ipos={ipos}
            onSelectIpo={(i) => setSelectedIpo(i)}
            searchQuery={searchQuery}
          />
        )}

        {/* Allotment Tab */}
        {activeTab === 'allotment' && (
          <AllotmentChecker
            ipos={ipos}
            initialSelectedIpoId={allotmentTarget?.id}
            selectionTimestamp={allotmentTarget?.timestamp}
          />
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <IpoCalendar
            ipos={ipos}
            onSelectIpo={setSelectedIpo}
          />
        )}

        {/* Buybacks Tab */}
        {activeTab === 'buyback' && (
          <BuybackTracker
            buybacks={buybacks}
          />
        )}

      </main>

      {/* 5. Prospectus / Detail Modal */}
      {selectedIpo && (
        <IpoDetailModal
          key={selectedIpo.id}
          ipo={selectedIpo}
          onClose={() => setSelectedIpo(null)}
          onOpenSubscription={() => {
            setActiveTab('subscription');
          }}
          onOpenAllotment={(targetIpo) => {
            setAllotmentTarget({ id: targetIpo.id, timestamp: Date.now() });
            setActiveTab('allotment');
          }}
        />
      )}

      {/* 5b. Server Settings Modal */}
      <ServerSettingsModal
        isOpen={showServerModal}
        onClose={() => setShowServerModal(false)}
        onSaved={syncLiveData}
      />

      {/* 6. Mobile Bottom Tab Bar & PWA Banner (hidden when detail modal is open to prevent overlapping) */}
      {!selectedIpo && (
        <>
          <MobileBottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <InstallPwaBanner />
        </>
      )}

      {/* 7. Footer */}
      <footer className="mt-16 border-t border-slate-200/80 dark:border-slate-800/80 pt-8 pb-24 md:pb-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            IPORadar • India's Comprehensive IPO & GMP Tracking Platform
          </p>
          <p className="text-[11px] leading-relaxed max-w-2xl mx-auto">
            Disclaimer: Grey Market Premium (GMP) rates and subject to sauda numbers are purely indicative market estimates. All financial metrics and prospectus details are for informational and educational purposes only. Please consult SEBI registered investment advisors before making investment decisions.
          </p>
          <p className="text-[10px] text-slate-400 pt-2">
            © {new Date().getFullYear()} IPORadar
          </p>
        </div>
      </footer>

    </div>
  );
};
