import React, { useState, useMemo } from 'react';
import { IpoItem } from '../../types/ipo';
import { BarChart3, Users, Briefcase, Building, Layers, ArrowUpRight, TrendingUp, Sparkles, Filter, CheckCircle2, AlertCircle, Clock, Calendar } from 'lucide-react';
import { Badge } from '../common/Badge';
import { CompanyLogo } from '../common/CompanyLogo';

interface SubscriptionViewProps {
  ipos: IpoItem[];
  onSelectIpo: (ipo: IpoItem) => void;
  searchQuery?: string;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ ipos, onSelectIpo, searchQuery = '' }) => {
  const [filterCat, setFilterCat] = useState<'all' | 'mainboard' | 'sme'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'upcoming' | 'closed'>('all');
  const [sortBy, setSortBy] = useState<'demand' | 'retail' | 'size'>('demand');

  // Filter and sort issues with active subscription tracking
  const subscriptionIpos = useMemo(() => {
    return ipos
      .filter(i => {
        if (filterCat !== 'all' && i.category !== filterCat) return false;
        if (filterStatus !== 'all') {
          if (filterStatus === 'live' && i.status !== 'live') return false;
          if (filterStatus === 'upcoming' && i.status !== 'upcoming') return false;
          if (filterStatus === 'closed' && (i.status !== 'closed' && i.status !== 'listed')) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            i.name.toLowerCase().includes(q) ||
            i.symbol.toLowerCase().includes(q) ||
            i.sector.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'demand') return b.subscription.total - a.subscription.total;
        if (sortBy === 'retail') return b.subscription.retail - a.subscription.retail;
        if (sortBy === 'size') return b.issueSizeCr - a.issueSizeCr;
        return 0;
      });
  }, [ipos, filterCat, filterStatus, sortBy]);

  // High-level summary metrics
  const summaryStats = useMemo(() => {
    const liveIssues = ipos.filter(i => i.status === 'live');
    const sorted = [...ipos].sort((a, b) => b.subscription.total - a.subscription.total);
    const totalSubSum = liveIssues.reduce((acc, curr) => acc + curr.subscription.total, 0);
    const avgSub = liveIssues.length > 0 ? Number((totalSubSum / liveIssues.length).toFixed(2)) : 0;
    return {
      liveCount: liveIssues.length,
      topIpo: sorted[0] || null,
      avgSub
    };
  }, [ipos]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-500">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Exchange Bidding & Subscription Demand
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Exchange Feed
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Official live bidding demand across Retail Individual (RII), Non-Institutional (NII/HNI), and QIB quotas from BSE & NSE.
            </p>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 text-xs font-bold">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All ({ipos.length})
              </button>
              <button
                onClick={() => setFilterStatus('live')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterStatus === 'live'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Live Now ({ipos.filter(i => i.status === 'live').length})
              </button>
              <button
                onClick={() => setFilterStatus('upcoming')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterStatus === 'upcoming'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Upcoming ({ipos.filter(i => i.status === 'upcoming').length})
              </button>
              <button
                onClick={() => setFilterStatus('closed')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterStatus === 'closed'
                    ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Closed ({ipos.filter(i => i.status === 'closed' || i.status === 'listed').length})
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 text-xs font-bold">
              <button
                onClick={() => setFilterCat('all')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterCat === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All Cat
              </button>
              <button
                onClick={() => setFilterCat('mainboard')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterCat === 'mainboard'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Mainboard
              </button>
              <button
                onClick={() => setFilterCat('sme')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterCat === 'sme'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                SME
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="demand">Sort: Total Demand</option>
              <option value="retail">Sort: Retail Demand</option>
              <option value="size">Sort: Issue Size</option>
            </select>
          </div>
        </div>

        {/* 3 Overview Stat Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Live Bidding Issues</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{summaryStats.liveCount} Issues Active</span>
            </div>
            <Layers className="w-5 h-5 text-indigo-500 opacity-70" />
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Top Demand Leader</span>
              <span className="text-base font-black text-indigo-600 dark:text-indigo-400 truncate block max-w-[180px]">
                {summaryStats.topIpo?.name || 'N/A'} ({summaryStats.topIpo?.subscription.total}x)
              </span>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500 opacity-70" />
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Live Subscription</span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {summaryStats.avgSub > 0 ? `${summaryStats.avgSub}x Subscribed` : 'N/A'}
              </span>
            </div>
            <Sparkles className="w-5 h-5 text-indigo-500 opacity-70" />
          </div>
        </div>
      </div>

      {/* Subscription Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {subscriptionIpos.map(ipo => {
          const sub = ipo.subscription;
          const isLive = ipo.status === 'live';
          const isUpcoming = ipo.status === 'upcoming';
          const isClosed = ipo.status === 'closed' || ipo.status === 'listed';
          const isOverSub = sub.total >= 1.0;
          const isRetailOver = sub.retail >= 1.0;
          const isNiiOver = sub.nii >= 1.0;
          const isQibOver = sub.qib >= 1.0;

          // Scale for progress bar: min 0, 1.0x = 100%, max 3x visual cap
          const getBarPercent = (val: number) => {
            if (val <= 0) return 0;
            if (val <= 1) return Math.round(val * 100);
            return Math.min(100, Math.round(100 + ((val - 1) / 3) * 50));
          };

          return (
            <div 
              key={ipo.id}
              onClick={() => onSelectIpo(ipo)}
              className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                {/* Header: Company identity, badges and total demand callout */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <CompanyLogo logo={ipo.logo} name={ipo.name} symbol={ipo.symbol} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {ipo.name}
                        </h3>
                        <Badge variant={ipo.category === 'mainboard' ? 'primary' : 'purple'} size="sm">
                          {ipo.category.toUpperCase()}
                        </Badge>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isLive
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 animate-pulse'
                            : isUpcoming
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {isLive ? 'Bidding Live' : isUpcoming ? 'Upcoming' : 'Bidding Closed'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Issue: <strong>₹{ipo.issueSizeCr} Cr</strong> • Price: <strong>₹{ipo.priceBandMax}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">
                      {isUpcoming ? 'Status' : isClosed ? 'Final Demand' : 'Total Demand'}
                    </span>
                    {isUpcoming ? (
                      <div>
                        <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">
                          Opens Soon
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 block">
                          Starts {ipo.openDate}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className={`text-xl sm:text-2xl font-black ${
                          isOverSub 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : sub.total > 0 
                            ? 'text-indigo-600 dark:text-indigo-400' 
                            : 'text-slate-400'
                        }`}>
                          {sub.total}x
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md block mt-0.5 ${
                          isOverSub 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : sub.total > 0 
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' 
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}>
                          {isClosed ? 'Book Closed' : isOverSub ? 'Oversubscribed' : sub.total > 0 ? `${Math.round(sub.total * 100)}% Booked` : 'Opens Soon'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Accurately bound Bidding & Timeline status bar */}
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="text-[11px] font-semibold">
                      {isUpcoming ? (
                        <>Bidding: <strong className="text-slate-900 dark:text-white">{ipo.openDate} to {ipo.closeDate}</strong></>
                      ) : isLive ? (
                        <>Live Window: <strong className="text-emerald-600 dark:text-emerald-400">{ipo.openDate} to {ipo.closeDate}</strong></>
                      ) : (
                        <>Bidding Closed: <strong className="text-slate-900 dark:text-white">{ipo.closeDate}</strong> • Allotment: <strong>{ipo.allotmentDate}</strong></>
                      )}
                    </span>
                  </div>

                  {sub.applications && sub.applications > 0 ? (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/50">
                      {sub.applications.toLocaleString('en-IN')} Bids Received
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">
                      Quota: {ipo.category === 'sme' ? '50% Retail' : '35% Retail • 50% QIB'}
                    </span>
                  )}
                </div>

                {/* Visual Category Demand Breakdown */}
                {isUpcoming ? (
                  <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200 space-y-1 mb-4">
                    <div className="font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Bidding Schedule & Quota Reservations</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
                      Offer opens on <strong>{ipo.openDate}</strong> at 10:00 AM IST. Quota allocation: {ipo.category === 'sme' ? '50% Retail, 50% Non-Retail' : '35% Retail Individual, 15% NII/HNI, and 50% QIB'}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    
                    {/* Retail Individual (RII) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                          <Users className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Retail Individual (RII)</span>
                          <span className="text-[10px] text-slate-400 font-normal">({ipo.category === 'sme' ? '50%' : '35%'})</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-slate-900 dark:text-white text-xs">{sub.retail}x</span>
                          <span className={`text-[10px] font-bold ${isRetailOver ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                            {isRetailOver ? `(${Math.round(sub.retail * 100)}%)` : `${Math.round(sub.retail * 100)}%`}
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isRetailOver ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${getBarPercent(sub.retail)}%` }}
                        />
                      </div>
                    </div>

                    {/* Non-Institutional / HNI */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                          <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                          <span>Non-Institutional (NII/HNI)</span>
                          <span className="text-[10px] text-slate-400 font-normal">(15%)</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-slate-900 dark:text-white text-xs">{sub.nii}x</span>
                          <span className={`text-[10px] font-bold ${isNiiOver ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500'}`}>
                            {isNiiOver ? `(${Math.round(sub.nii * 100)}%)` : `${Math.round(sub.nii * 100)}%`}
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isNiiOver ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${getBarPercent(sub.nii)}%` }}
                        />
                      </div>
                    </div>

                    {/* Qualified Institutional (QIB) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                          <Building className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Qualified Institutional (QIB)</span>
                          <span className="text-[10px] text-slate-400 font-normal">(50%)</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-slate-900 dark:text-white text-xs">{sub.qib}x</span>
                          <span className={`text-[10px] font-bold ${isQibOver ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                            {isQibOver ? `(${Math.round(sub.qib * 100)}%)` : `${Math.round(sub.qib * 100)}%`}
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isQibOver ? 'bg-gradient-to-r from-indigo-500 to-blue-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${getBarPercent(sub.qib)}%` }}
                        />
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                  Lot Size: <strong>{ipo.lotSize} shares</strong> (₹{(ipo.lotSize * ipo.priceBandMax).toLocaleString('en-IN')})
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px]">
                  <span>View Details</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
