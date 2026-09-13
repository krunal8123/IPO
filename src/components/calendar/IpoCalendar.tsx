import React, { useState, useMemo, useEffect, useRef } from 'react';
import { IpoItem, CalendarEvent, IpoCategory } from '../../types/ipo';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  CalendarDays,
  List,
  Clock,
  Zap,
  Building2,
  CheckCircle2,
  Check,
  AlertCircle
} from 'lucide-react';
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
  dateStr: string;
  dateObj: Date;
  dateKey: string; // YYYY-MM-DD
  priceBandMax: number;
  lotSize: number;
  ipo?: IpoItem;
}

// Helper: parse date safely
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === 'Active' || dateStr.startsWith('T+')) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

// Helper: YYYY-MM-DD key
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Compute dynamic contextual status for each milestone event
function getMilestoneDetails(type: 'Open' | 'Close' | 'Allotment' | 'Listing', dateObj: Date) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateObj);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isToday = diffDays === 0;
  const isPast = diffDays < 0;

  if (type === 'Allotment') {
    if (isToday) {
      return {
        badgeLabel: 'Allotment Basis Today',
        subtext: 'Registrar Finalizing Allotment',
        badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        dotColor: 'bg-emerald-500',
        isDeclared: true
      };
    } else if (isPast) {
      return {
        badgeLabel: 'Allotment Declared',
        subtext: 'Basis of Allotment Finalized',
        badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        dotColor: 'bg-emerald-500',
        isDeclared: true
      };
    } else {
      return {
        badgeLabel: 'Expected Allotment',
        subtext: `Scheduled in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
        badgeBg: 'bg-amber-500/10 border-amber-500/30',
        textColor: 'text-amber-600 dark:text-amber-400',
        dotColor: 'bg-amber-500',
        isDeclared: false
      };
    }
  }

  if (type === 'Open') {
    if (isToday) {
      return {
        badgeLabel: 'Bidding Opens Today',
        subtext: 'Bidding Window 10 AM - 5 PM',
        badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        dotColor: 'bg-emerald-500',
        isDeclared: false
      };
    } else if (isPast) {
      return {
        badgeLabel: 'Bidding Active',
        subtext: 'Issue Open for Subscription',
        badgeBg: 'bg-blue-500/10 border-blue-500/30',
        textColor: 'text-blue-600 dark:text-blue-400',
        dotColor: 'bg-blue-500',
        isDeclared: false
      };
    } else {
      return {
        badgeLabel: 'Bidding Opens',
        subtext: `Starts in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
        badgeBg: 'bg-indigo-500/10 border-indigo-500/30',
        textColor: 'text-indigo-600 dark:text-indigo-400',
        dotColor: 'bg-indigo-500',
        isDeclared: false
      };
    }
  }

  if (type === 'Close') {
    if (isToday) {
      return {
        badgeLabel: 'Bidding Closes Today',
        subtext: 'Final Day • Cut-off 5:00 PM',
        badgeBg: 'bg-rose-500/10 border-rose-500/30',
        textColor: 'text-rose-600 dark:text-rose-400',
        dotColor: 'bg-rose-500',
        isDeclared: false
      };
    } else if (isPast) {
      return {
        badgeLabel: 'Bidding Closed',
        subtext: 'Applications Finished',
        badgeBg: 'bg-slate-500/10 border-slate-500/30',
        textColor: 'text-slate-600 dark:text-slate-400',
        dotColor: 'bg-slate-400',
        isDeclared: false
      };
    } else {
      return {
        badgeLabel: 'Bidding Closes',
        subtext: `Closes in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
        badgeBg: 'bg-rose-500/10 border-rose-500/30',
        textColor: 'text-rose-600 dark:text-rose-400',
        dotColor: 'bg-rose-500',
        isDeclared: false
      };
    }
  }

  // Listing
  if (isToday) {
    return {
      badgeLabel: 'Listing Today',
      subtext: 'Bells Ring 10:00 AM IST',
      badgeBg: 'bg-purple-500/10 border-purple-500/30',
      textColor: 'text-purple-600 dark:text-purple-400',
      dotColor: 'bg-purple-500',
      isDeclared: true
    };
  } else if (isPast) {
    return {
      badgeLabel: 'Listed on Exchange',
      subtext: 'Trading on BSE / NSE',
      badgeBg: 'bg-slate-500/10 border-slate-500/30',
      textColor: 'text-slate-600 dark:text-slate-400',
      dotColor: 'bg-slate-400',
      isDeclared: true
    };
  } else {
    return {
      badgeLabel: 'Expected Listing',
      subtext: `Listing in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      badgeBg: 'bg-purple-500/10 border-purple-500/30',
      textColor: 'text-purple-600 dark:text-purple-400',
      dotColor: 'bg-purple-500',
      isDeclared: false
    };
  }
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const IpoCalendar: React.FC<IpoCalendarProps> = ({ ipos = [], events = [], onSelectIpo }) => {
  const [filterType, setFilterType] = useState<'all' | 'Open' | 'Close' | 'Allotment' | 'Listing'>('all');
  const [filterCat, setFilterCat] = useState<'all' | 'mainboard' | 'sme'>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('calendar');

  const agendaRef = useRef<HTMLDivElement>(null);

  // Build flattened real-time calendar events
  const allEvents = useMemo(() => {
    const flattened: FlattenedCalendarEvent[] = [];

    if (ipos.length > 0) {
      ipos.forEach(ipo => {
        if (filterCat !== 'all' && ipo.category !== filterCat) return;

        const addEvent = (type: 'Open' | 'Close' | 'Allotment' | 'Listing', rawDate: string) => {
          const dateObj = parseDate(rawDate);
          if (!dateObj) return;
          flattened.push({
            ipoId: ipo.id,
            ipoName: ipo.name,
            category: ipo.category,
            symbol: ipo.symbol,
            logo: ipo.logo,
            type,
            dateStr: rawDate,
            dateObj,
            dateKey: toDateKey(dateObj),
            priceBandMax: ipo.priceBandMax,
            lotSize: ipo.lotSize,
            ipo
          });
        };

        if (ipo.openDate) addEvent('Open', ipo.openDate);
        if (ipo.closeDate) addEvent('Close', ipo.closeDate);
        if (ipo.allotmentDate) addEvent('Allotment', ipo.allotmentDate);
        if (ipo.listingDate) addEvent('Listing', ipo.listingDate);
      });
    } else if (events.length > 0) {
      events.forEach(day => {
        const dateObj = parseDate(day.date);
        if (!dateObj) return;
        day.events.forEach(ev => {
          flattened.push({
            ipoId: ev.ipoName,
            ipoName: ev.ipoName,
            category: ev.category,
            symbol: ev.ipoName.slice(0, 4).toUpperCase(),
            logo: '',
            type: ev.type as any,
            dateStr: day.date,
            dateObj,
            dateKey: toDateKey(dateObj),
            priceBandMax: 100,
            lotSize: 100
          });
        });
      });
    }

    // Filter by type
    if (filterType !== 'all') {
      return flattened.filter(e => e.type === filterType);
    }
    return flattened;
  }, [ipos, events, filterType, filterCat]);

  // Group events by YYYY-MM-DD
  const eventsByDateKey = useMemo(() => {
    const map = new Map<string, FlattenedCalendarEvent[]>();
    allEvents.forEach(ev => {
      const arr = map.get(ev.dateKey) || [];
      arr.push(ev);
      map.set(ev.dateKey, arr);
    });
    return map;
  }, [allEvents]);

  // Calculate default month based on events
  const defaultYearMonth = useMemo(() => {
    if (allEvents.length > 0) {
      const nowTime = Date.now();
      const sorted = [...allEvents].sort((a, b) => Math.abs(a.dateObj.getTime() - nowTime) - Math.abs(b.dateObj.getTime() - nowTime));
      return { year: sorted[0].dateObj.getFullYear(), month: sorted[0].dateObj.getMonth() };
    }
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  }, [allEvents]);

  const [currentYear, setCurrentYear] = useState<number>(defaultYearMonth.year);
  const [currentMonth, setCurrentMonth] = useState<number>(defaultYearMonth.month);
  const [selectedDateKey, setSelectedDateKey] = useState<string>('');

  // Initial selection or month change selection
  useEffect(() => {
    const ymPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    // If selected date already belongs to this month and has events, keep it!
    if (selectedDateKey.startsWith(ymPrefix)) {
      return;
    }
    const datesWithEvents = Array.from(eventsByDateKey.keys()).sort();
    const dateInMonth = datesWithEvents.find(k => k.startsWith(ymPrefix));
    if (dateInMonth) {
      setSelectedDateKey(dateInMonth);
    } else if (datesWithEvents.length > 0) {
      setSelectedDateKey(datesWithEvents[0]);
    } else {
      setSelectedDateKey(`${ymPrefix}-01`);
    }
  }, [currentYear, currentMonth]);

  // Selection handler with month sync and mobile smooth scroll
  const handleSelectDay = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    const parts = dateKey.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      if (y !== currentYear || m !== currentMonth) {
        setCurrentYear(y);
        setCurrentMonth(m);
      }
    }

    // On mobile screens, smoothly bring the agenda into view
    setTimeout(() => {
      if (agendaRef.current) {
        agendaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 40);
  };

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    handleSelectDay(toDateKey(today));
  };

  // Build grid days for current month
  const monthDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      dayNumber: number;
      dateKey: string;
      isCurrentMonth: boolean;
      events: FlattenedCalendarEvent[];
    }> = [];

    // 1. Trailing days from prev month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const key = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateKey: key,
        isCurrentMonth: false,
        events: eventsByDateKey.get(key) || []
      });
    }

    // 2. Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateKey: key,
        isCurrentMonth: true,
        events: eventsByDateKey.get(key) || []
      });
    }

    // 3. Leading days of next month
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const key = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateKey: key,
        isCurrentMonth: false,
        events: eventsByDateKey.get(key) || []
      });
    }

    return days;
  }, [currentYear, currentMonth, eventsByDateKey]);

  // Active day events
  const selectedDayEvents = useMemo(() => {
    return eventsByDateKey.get(selectedDateKey) || [];
  }, [selectedDateKey, eventsByDateKey]);

  // Formatted date string for selected date
  const selectedDateFormatted = useMemo(() => {
    if (!selectedDateKey) return '';
    const parts = selectedDateKey.split('-');
    if (parts.length !== 3) return selectedDateKey;
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [selectedDateKey]);

  // All dates with events in current month for quick-jump pills
  const activeDatesInMonth = useMemo(() => {
    const ymPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    return Array.from(eventsByDateKey.keys())
      .filter(k => k.startsWith(ymPrefix))
      .sort();
  }, [currentYear, currentMonth, eventsByDateKey]);

  // Grouped agenda for list view
  const groupedAgenda = useMemo(() => {
    const sortedKeys = Array.from(eventsByDateKey.keys()).sort();
    return sortedKeys.map(key => {
      const items = eventsByDateKey.get(key) || [];
      const parts = key.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const dateLabel = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      return { dateKey: key, dateLabel, items };
    });
  }, [eventsByDateKey]);

  const todayKey = toDateKey(new Date());

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-500 shadow-xs">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                IPO Event Calendar
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Upstox Schedule
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Interactive Calendly-style schedule: Bidding Opens, Closes, Basis of Allotment, and Exchange Listings.
            </p>
          </div>

          {/* View Mode & Category Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Switcher: Calendar Grid vs Agenda List */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Agenda</span>
              </button>
            </div>

            {/* Category Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 text-xs font-bold">
              <button
                onClick={() => setFilterCat('all')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterCat === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All
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
          </div>
        </div>

        {/* Milestone Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
          {[
            { id: 'all', label: `All Milestones (${allEvents.length})` },
            { id: 'Open', label: 'Issue Opens' },
            { id: 'Close', label: 'Issue Closes' },
            { id: 'Allotment', label: 'Allotment Dates' },
            { id: 'Listing', label: 'Exchange Listings' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setFilterType(p.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                filterType === p.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs font-bold'
                  : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW MODE 1: INTERACTIVE CALENDAR GRID */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Calendar Widget (Left / Top) */}
          <div className="lg:col-span-7 glass-card rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            
            {/* Month Header Switcher */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
                <button
                  type="button"
                  onClick={jumpToToday}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors cursor-pointer"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick-Jump Active Date Chips */}
            {activeDatesInMonth.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                  Active Days:
                </span>
                {activeDatesInMonth.map(dateKey => {
                  const dayNum = parseInt(dateKey.split('-')[2]);
                  const count = (eventsByDateKey.get(dateKey) || []).length;
                  const isSelected = dateKey === selectedDateKey;
                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => handleSelectDay(dateKey)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>{MONTH_NAMES[currentMonth].slice(0, 3)} {dayNum}</span>
                      <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Weekday Strip */}
            <div className="grid grid-cols-7 text-center">
              {WEEKDAYS.map((wd, i) => (
                <div
                  key={i}
                  className="py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
                >
                  <span className="sm:inline hidden">{wd}</span>
                  <span className="sm:hidden">{wd.charAt(0)}</span>
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {monthDays.map((dayItem, idx) => {
                const isSelected = dayItem.dateKey === selectedDateKey;
                const isToday = dayItem.dateKey === todayKey;
                const hasEvents = dayItem.events.length > 0;

                // Extract unique event types for indicator dots
                const uniqueTypes = Array.from(new Set(dayItem.events.map(e => e.type)));

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDay(dayItem.dateKey)}
                    className={`h-11 sm:h-13 rounded-2xl p-1 flex flex-col items-center justify-between transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400 scale-[1.03] z-10'
                        : isToday
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold border-2 border-indigo-400 dark:border-indigo-600'
                          : hasEvents
                            ? 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-900 dark:text-white font-semibold hover:bg-indigo-50/70 dark:hover:bg-slate-700/60 border border-slate-200/70 dark:border-slate-700/70'
                            : dayItem.isCurrentMonth
                              ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                              : 'text-slate-300 dark:text-slate-600 opacity-40 hover:opacity-70'
                    }`}
                  >
                    {/* Day number */}
                    <span className={`text-xs sm:text-sm leading-tight ${isSelected ? 'font-black' : ''}`}>
                      {dayItem.dayNumber}
                    </span>

                    {/* Event indicators (dots) */}
                    <div className="flex items-center gap-0.5 mt-auto">
                      {uniqueTypes.slice(0, 3).map((t, tIdx) => {
                        const dotColor = t === 'Open' ? 'bg-emerald-500' : t === 'Close' ? 'bg-rose-500' : t === 'Allotment' ? 'bg-amber-500' : 'bg-indigo-500';
                        return (
                          <span
                            key={tIdx}
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : dotColor}`}
                          />
                        );
                      })}
                      {dayItem.events.length > 3 && (
                        <span className={`text-[8px] font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                          +{dayItem.events.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Color Legend Strip */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Milestone Legend:</span>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Bidding Opens
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Bidding Closes
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Allotment Date
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Listing Date
                </span>
              </div>
            </div>
          </div>

          {/* Selected Day's Agenda (Right / Bottom Drawer) */}
          <div ref={agendaRef} className="lg:col-span-5 glass-card rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            
            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider flex items-center gap-1">
                  <CalendarDays className="w-3 h-3 text-indigo-500" />
                  Milestones for Selected Date:
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {selectedDateFormatted}
                </h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                selectedDayEvents.length > 0
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {selectedDayEvents.length} Event{selectedDayEvents.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Events for this day */}
            {selectedDayEvents.length > 0 ? (
              <div className="space-y-3 max-h-[460px] overflow-y-auto no-scrollbar pr-0.5">
                {selectedDayEvents.map((ev, evIdx) => {
                  const details = getMilestoneDetails(ev.type, ev.dateObj);

                  return (
                    <div
                      key={evIdx}
                      onClick={() => ev.ipo && onSelectIpo?.(ev.ipo)}
                      className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 transition-all cursor-pointer group space-y-3 shadow-xs"
                    >
                      {/* Event Type Badge & Subtext */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase border ${details.badgeBg} ${details.textColor}`}>
                          <span className={`w-2 h-2 rounded-full ${details.dotColor}`} />
                          <span>{details.badgeLabel}</span>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300">
                          {ev.category}
                        </span>
                      </div>

                      {/* Company Identity */}
                      <div className="flex items-center gap-3">
                        <CompanyLogo logo={ev.logo} name={ev.ipoName} symbol={ev.symbol} size="md" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {ev.ipoName}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span>Symbol: <strong className="text-slate-700 dark:text-slate-300">{ev.symbol}</strong></span>
                            <span>•</span>
                            <span>Price: <strong className="text-slate-700 dark:text-slate-300">₹{ev.priceBandMax}</strong></span>
                            <span>•</span>
                            <span>Lot: <strong className="text-slate-700 dark:text-slate-300">{ev.lotSize} sh</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Subtext info row & CTA */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {details.subtext}
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          <span>View Prospectus</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto text-xl">
                  📅
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    No Milestones on this Date
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                    There are no issue openings, closings, allotments, or listings on {selectedDateFormatted}.
                  </p>
                </div>

                {activeDatesInMonth.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Tap to jump to an active date in {MONTH_NAMES[currentMonth]}:
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xs mx-auto">
                      {activeDatesInMonth.slice(0, 6).map(dateKey => {
                        const dayNum = parseInt(dateKey.split('-')[2]);
                        const count = (eventsByDateKey.get(dateKey) || []).length;
                        return (
                          <button
                            key={dateKey}
                            type="button"
                            onClick={() => handleSelectDay(dateKey)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>{MONTH_NAMES[currentMonth].slice(0, 3)} {dayNum}</span>
                            <span className="text-[10px] px-1 rounded-full bg-indigo-200/60 dark:bg-indigo-900/60 font-bold">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* VIEW MODE 2: CHRONOLOGICAL AGENDA LIST */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          {groupedAgenda.map((day, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <CalendarIcon className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {day.dateLabel}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  {day.items.length} event{day.items.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {day.items.map((ev, evIdx) => {
                  const details = getMilestoneDetails(ev.type, ev.dateObj);

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
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md block ${details.badgeBg} ${details.textColor}`}>
                          {details.badgeLabel}
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

          {groupedAgenda.length === 0 && (
            <div className="text-center p-8 glass-card rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
              No milestone events found for the selected filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
