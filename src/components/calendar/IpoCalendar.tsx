import React, { useState, useMemo } from 'react';
import { IpoItem, CalendarEvent, IpoCategory } from '../../types/ipo';
import { Calendar as CalendarIcon, Clock, ChevronRight, Check, Filter, Sparkles, ArrowUpRight, Layers } from 'lucide-react';
import { Badge } from '../common/Badge';
import { CompanyLogo } from '../common/CompanyLogo';

interface IpoCalendarProps {
  ipos?: IpoItem[];
  events?: CalendarEvent[];
  onSelectIpo?: (ipo: IpoItem) => void;
}

interface FlattenedCalendarEvent {
  ipoId: string;
  ipoName: string;
  category: IpoCategory;
  symbol: string;
  logo: string;
  type: 'Open' | 'Close' | 'Allotment' | 'Listing';
  date: string;
  priceBandMax: number;
  lotSize: number;
  ipo?: IpoItem;
}

export const IpoCalendar: React.FC<IpoCalendarProps> = ({ ipos = [], events = [], onSelectIpo }) => {
  const [filterType, setFilterType] = useState<'all' | 'Open' | 'Close' | 'Allotment' | 'Listing'>('all');
  const [filterCat, setFilterCat] = useState<'all' | 'mainboard' | 'sme'>('all');

  const typeConfig: Record<string, { variant: 'primary' | 'success' | 'danger' | 'warning' | 'purple', label: string, color: string }> = {
    Open: { variant: 'success', label: 'Issue Opens', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' },
    Close: { variant: 'danger', label: 'Issue Closes', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50' },
    Allotment: { variant: 'warning', label: 'Allotment Out', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50' },
    Listing: { variant: 'primary', label: 'Exchange Listing', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50' }
  };

  // Build real-time calendar events from official Upstox IPOs
  const groupedEvents = useMemo(() => {
    const flattened: FlattenedCalendarEvent[] = [];

    if (ipos.length > 0) {
      ipos.forEach(ipo => {
        if (filterCat !== 'all' && ipo.category !== filterCat) return;

        if (ipo.openDate && ipo.openDate !== 'Active') {
          flattened.push({
            ipoId: ipo.id,
            ipoName: ipo.name,
            category: ipo.category,
            symbol: ipo.symbol,
            logo: ipo.logo,
            type: 'Open',
            date: ipo.openDate,
            priceBandMax: ipo.priceBandMax,
            lotSize: ipo.lotSize,
            ipo
          });
        }

        if (ipo.closeDate && ipo.closeDate !== 'Active') {
          flattened.push({
            ipoId: ipo.id,
            ipoName: ipo.name,
            category: ipo.category,
            symbol: ipo.symbol,
            logo: ipo.logo,
            type: 'Close',
            date: ipo.closeDate,
            priceBandMax: ipo.priceBandMax,
            lotSize: ipo.lotSize,
            ipo
          });
        }

        if (ipo.allotmentDate && ipo.allotmentDate !== 'T+1') {
          flattened.push({
            ipoId: ipo.id,
            ipoName: ipo.name,
            category: ipo.category,
            symbol: ipo.symbol,
            logo: ipo.logo,
            type: 'Allotment',
            date: ipo.allotmentDate,
            priceBandMax: ipo.priceBandMax,
            lotSize: ipo.lotSize,
            ipo
          });
        }

        if (ipo.listingDate && ipo.listingDate !== 'T+3') {
          flattened.push({
            ipoId: ipo.id,
            ipoName: ipo.name,
            category: ipo.category,
            symbol: ipo.symbol,
            logo: ipo.logo,
            type: 'Listing',
            date: ipo.listingDate,
            priceBandMax: ipo.priceBandMax,
            lotSize: ipo.lotSize,
            ipo
          });
        }
      });
    } else if (events.length > 0) {
      // Fallback
      events.forEach(day => {
        day.events.forEach(ev => {
          flattened.push({
            ipoId: ev.ipoName,
            ipoName: ev.ipoName,
            category: ev.category,
            symbol: ev.ipoName.slice(0, 4).toUpperCase(),
            logo: '',
            type: ev.type as any,
            date: day.date,
            priceBandMax: 100,
            lotSize: 100
          });
        });
      });
    }

    // Filter by event type
    const filtered = filterType === 'all' 
      ? flattened 
      : flattened.filter(e => e.type === filterType);

    // Group by date
    const map = new Map<string, FlattenedCalendarEvent[]>();
    filtered.forEach(ev => {
      const arr = map.get(ev.date) || [];
      arr.push(ev);
      map.set(ev.date, arr);
    });

    // Sort dates
    const sortedDates = Array.from(map.keys()).sort((a, b) => {
      return a.localeCompare(b);
    });

    return sortedDates.map(date => ({
      date,
      items: map.get(date) || []
    }));
  }, [ipos, events, filterType, filterCat]);

  // Statistics
  const totalEventsCount = useMemo(() => {
    return groupedEvents.reduce((acc, curr) => acc + curr.items.length, 0);
  }, [groupedEvents]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-500">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Official IPO Event Calendar
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Upstox Dates
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Complete milestone lifecycle: Issue Bidding Opens, Closes, Allotment Basis, and Exchange Listings.
            </p>
          </div>

          {/* Category Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 text-xs font-bold">
            <button
              onClick={() => setFilterCat('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterCat === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterCat('mainboard')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterCat === 'mainboard'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Mainboard
            </button>
            <button
              onClick={() => setFilterCat('sme')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterCat === 'sme'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              SME
            </button>
          </div>
        </div>

        {/* Milestone Type Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          {[
            { id: 'all', label: `All Milestones (${totalEventsCount})` },
            { id: 'Open', label: 'Issue Opens' },
            { id: 'Close', label: 'Issue Closes' },
            { id: 'Allotment', label: 'Allotment Out' },
            { id: 'Listing', label: 'Exchange Listings' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setFilterType(p.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                filterType === p.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                  : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date timeline cards */}
      <div className="space-y-4">
        {groupedEvents.map((day, idx) => (
          <div 
            key={idx}
            className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <CalendarIcon className="w-4 h-4" />
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {day.date}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {day.items.length} milestone event{day.items.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {day.items.map((ev, evIdx) => {
                const conf = typeConfig[ev.type] || { variant: 'primary', label: ev.type, color: 'text-indigo-600' };
                return (
                  <div 
                    key={evIdx}
                    onClick={() => ev.ipo && onSelectIpo?.(ev.ipo)}
                    className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-start justify-between gap-2.5 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <CompanyLogo logo={ev.logo} name={ev.ipoName} symbol={ev.symbol} size="sm" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {ev.ipoName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-bold uppercase">{ev.category}</span>
                          <span>•</span>
                          <span>₹{ev.priceBandMax}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md block ${conf.color}`}>
                        {conf.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-end gap-0.5 mt-1">
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {groupedEvents.length === 0 && (
          <div className="text-center p-8 glass-card rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
            No milestone events found for the selected filter.
          </div>
        )}
      </div>

    </div>
  );
};
