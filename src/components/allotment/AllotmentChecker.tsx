import React, { useState, useMemo, useEffect, useRef } from 'react';
import { IpoItem, AllotmentResult, KfinIssue, MufgIssue } from '../../types/ipo';
import { liveIpoService } from '../../services/liveIpoService';
import { 
  CheckCircle2, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  HelpCircle, 
  RotateCcw, 
  Sparkles,
  Building2,
  Calendar,
  AlertTriangle,
  Info,
  Zap,
  User,
  Hash,
  CreditCard,
  X,
  ChevronDown
} from 'lucide-react';

interface AllotmentCheckerProps {
  ipos: IpoItem[];
  initialSelectedIpoId?: string | null;
  selectionTimestamp?: number;
}

export const AllotmentChecker: React.FC<AllotmentCheckerProps> = ({ ipos, initialSelectedIpoId, selectionTimestamp }) => {
  const [kfinIssues, setKfinIssues] = useState<KfinIssue[]>([]);
  const [mufgIssues, setMufgIssues] = useState<MufgIssue[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const queryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    liveIpoService.getKfinIssues().then(issues => {
      if (Array.isArray(issues) && issues.length > 0) {
        setKfinIssues(issues);
      }
    });
    liveIpoService.getMufgIssues().then(issues => {
      if (Array.isArray(issues) && issues.length > 0) {
        setMufgIssues(issues);
      }
    });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter out upcoming IPOs entirely - allotment can only exist for closed or listed issues
  const eligibleIpos = useMemo(() => {
    const closedOrListed = ipos.filter(i => i.status === 'closed' || i.status === 'listed');
    return closedOrListed.length > 0 ? closedOrListed : ipos.filter(i => i.status !== 'upcoming');
  }, [ipos]);

  // Master list of all searchable issues across MUFG, KFintech, and Market Feed
  const allSearchableOptions = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      group: 'MUFG Intime' | 'KFintech' | 'Market Feed';
      badge: string;
      badgeColor: string;
      registrar: string;
      mufgClientId?: string;
      kfinClientId?: string;
    }> = [];

    // 1. MUFG Intime Issues
    mufgIssues.forEach(m => {
      list.push({
        id: m.clientId,
        name: m.name,
        group: 'MUFG Intime',
        badge: '⚡ MUFG Live API',
        badgeColor: 'bg-blue-600 text-white',
        registrar: 'MUFG Intime India Pvt Ltd',
        mufgClientId: m.clientId
      });
    });

    // 2. KFintech Issues
    kfinIssues.forEach(k => {
      list.push({
        id: k.clientId,
        name: k.name,
        group: 'KFintech',
        badge: '⚡ KFin Live API',
        badgeColor: 'bg-emerald-600 text-white',
        registrar: 'KFin Technologies Ltd',
        kfinClientId: k.clientId
      });
    });

    // 3. Market Feed Issues (deduplicated against MUFG and KFintech)
    eligibleIpos.forEach(i => {
      const clean = i.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const alreadyAdded = list.some(item => {
        const itemClean = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return itemClean.includes(clean) || clean.includes(itemClean);
      });
      if (!alreadyAdded) {
        list.push({
          id: i.id,
          name: i.name,
          group: 'Market Feed',
          badge: i.registrar.split(' ')[0],
          badgeColor: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
          registrar: i.registrar
        });
      }
    });

    return list;
  }, [mufgIssues, kfinIssues, eligibleIpos]);

  const [selectedIpoId, setSelectedIpoId] = useState<string>('');

  // Auto-initialize selectedIpoId once issues load
  useEffect(() => {
    if (!selectedIpoId && allSearchableOptions.length > 0) {
      setSelectedIpoId(allSearchableOptions[0].id);
    }
  }, [allSearchableOptions, selectedIpoId]);

  // Auto-select and focus input when navigated from IPO Detail Dialog
  useEffect(() => {
    if (!initialSelectedIpoId) return;

    // 1. Direct ID match in allSearchableOptions
    const direct = allSearchableOptions.find(o => o.id === initialSelectedIpoId);
    if (direct) {
      selectIssue(direct.id);
      setTimeout(() => {
        queryInputRef.current?.focus();
        queryInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      return;
    }

    // 2. Feed item name matching against MUFG or KFintech
    const feedItem = ipos.find(i => i.id === initialSelectedIpoId);
    if (feedItem) {
      const clean = feedItem.name.toLowerCase().replace(/[^a-z0-9]/g, '');

      const mufg = mufgIssues.find(m => {
        const mClean = m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return mClean.includes(clean) || clean.includes(mClean);
      });
      if (mufg) {
        selectIssue(mufg.clientId);
        setTimeout(() => {
          queryInputRef.current?.focus();
          queryInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
        return;
      }

      const kfin = kfinIssues.find(k => {
        const kClean = k.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return kClean.includes(clean) || clean.includes(kClean);
      });
      if (kfin) {
        selectIssue(kfin.clientId);
        setTimeout(() => {
          queryInputRef.current?.focus();
          queryInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
        return;
      }

      selectIssue(feedItem.id);
      setTimeout(() => {
        queryInputRef.current?.focus();
        queryInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [initialSelectedIpoId, selectionTimestamp, allSearchableOptions, ipos, mufgIssues, kfinIssues]);

  const [searchType, setSearchType] = useState<'pan' | 'appNo' | 'dpId'>('pan');
  const [queryValue, setQueryValue] = useState<string>('');
  const [result, setResult] = useState<AllotmentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);

  // Filtered options based on user typing
  const filteredOptions = useMemo(() => {
    if (!filterQuery.trim()) return allSearchableOptions;
    const q = filterQuery.toLowerCase().trim();
    return allSearchableOptions.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.registrar.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q)
    );
  }, [allSearchableOptions, filterQuery]);

  // Dedicated selection handler - resets previous search results immediately
  const selectIssue = (id: string) => {
    setSelectedIpoId(id);
    setResult(null);
    setSearched(false);
    setIsDropdownOpen(false);
    setFilterQuery('');
  };

  // Determine active IPO details directly from the selected ID
  const currentIpo = useMemo(() => {
    // 1. Direct MUFG issue match
    const mufg = mufgIssues.find(m => m.clientId === selectedIpoId);
    if (mufg) {
      return {
        id: mufg.clientId,
        name: mufg.name,
        registrar: 'MUFG Intime India Pvt Ltd',
        mufgClientId: mufg.clientId,
        status: 'listed' as const,
        symbol: mufg.name.split(' ')[0],
        allotmentDate: 'Declared',
        lotSize: 100,
        priceBandMax: 140,
        category: mufg.name.toLowerCase().includes('sme') ? ('sme' as const) : ('mainboard' as const)
      };
    }

    // 2. Direct KFintech issue match
    const kfin = kfinIssues.find(k => k.clientId === selectedIpoId);
    if (kfin) {
      return {
        id: kfin.clientId,
        name: kfin.name,
        registrar: 'KFin Technologies Ltd',
        kfinClientId: kfin.clientId,
        status: 'listed' as const,
        symbol: kfin.name.split(' ')[0],
        allotmentDate: 'Declared',
        lotSize: 100,
        priceBandMax: 140,
        category: 'mainboard' as const
      };
    }

    // 3. Feed IPO match
    const feed = eligibleIpos.find(i => i.id === selectedIpoId);
    if (feed) {
      const cleanFeedName = feed.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Auto-attach MUFG clientId if feed item matches an MUFG registry issue
      const matchedMufg = mufgIssues.find(m => {
        const mClean = m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return mClean.includes(cleanFeedName) || cleanFeedName.includes(mClean);
      });
      if (matchedMufg) {
        return {
          ...feed,
          registrar: 'MUFG Intime India Pvt Ltd',
          mufgClientId: matchedMufg.clientId
        };
      }

      // Auto-attach KFin clientId if feed item matches a KFin registry issue
      const matchedKfin = kfinIssues.find(k => {
        const kClean = k.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return kClean.includes(cleanFeedName) || cleanFeedName.includes(kClean);
      });
      if (matchedKfin) {
        return {
          ...feed,
          registrar: 'KFin Technologies Ltd',
          kfinClientId: matchedKfin.clientId
        };
      }

      return feed;
    }

    // 4. Fallback to top option
    if (allSearchableOptions.length > 0) {
      const first = allSearchableOptions[0];
      return {
        id: first.id,
        name: first.name,
        registrar: first.registrar,
        mufgClientId: first.mufgClientId,
        kfinClientId: first.kfinClientId,
        status: 'listed' as const,
        symbol: first.name.split(' ')[0],
        allotmentDate: 'Declared',
        lotSize: 100,
        priceBandMax: 140,
        category: 'mainboard' as const
      };
    }

    return eligibleIpos[0];
  }, [selectedIpoId, mufgIssues, kfinIssues, eligibleIpos, allSearchableOptions]);

  const isKfinIssue = useMemo(() => {
    if (!currentIpo) return false;
    if (currentIpo.kfinClientId) return true;
    const reg = (currentIpo.registrar || '').toLowerCase();
    return reg.includes('kfin') || reg.includes('karvy');
  }, [currentIpo]);

  const isMufgIssue = useMemo(() => {
    if (!currentIpo) return false;
    if (currentIpo.mufgClientId) return true;
    const reg = (currentIpo.registrar || '').toLowerCase();
    return reg.includes('mufg') || reg.includes('link intime') || reg.includes('linkintime');
  }, [currentIpo]);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryValue.trim() || !currentIpo) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await liveIpoService.checkAllotment(
        currentIpo.id, 
        searchType, 
        queryValue, 
        ipos, 
        currentIpo.kfinClientId,
        currentIpo.name,
        currentIpo.mufgClientId
      );
      setResult(res);
    } catch (err) {
      console.error('Allotment check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const registrars = [
    { name: 'MUFG Intime India (Link Intime)', url: 'https://in.mpms.mufg.com/Initial_Offer/public-issues.html', tag: 'Real-Time API Connected' },
    { name: 'KFin Technologies Ltd', url: 'https://ipostatus.kfintech.com/', tag: 'Real-Time API Connected' },
    { name: 'Bigshare Services Pvt Ltd', url: 'https://ipo.bigshareonline.com/', tag: 'Visual CAPTCHA Portal' },
    { name: 'Skyline Financial Services', url: 'https://www.skylinerta.com/ipo.php', tag: 'SME Registrar' },
    { name: 'Cameo Corporate Services', url: 'https://ipo.cameoindia.com/', tag: 'Regional Registrar' }
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              IPO Allotment Status Checker
            </h2>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <Zap className="w-3.5 h-3.5" />
            <span>MUFG Intime & KFintech Live APIs Connected</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Verify your allotment status directly against official registrar databases for Mainboard and SME IPOs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Search Form */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-5">
          <form onSubmit={handleCheck} className="space-y-5">

            {/* Select IPO */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  Select IPO Issue
                </label>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {allSearchableOptions.length} Declared Issues Available
                </span>
              </div>

              {/* Interactive Searchable Combobox */}
              <div ref={searchContainerRef} className="relative mb-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search any IPO by name (e.g. Glass Wall, Kanohar, Manika)..."
                    value={filterQuery}
                    onChange={(e) => {
                      setFilterQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (filteredOptions.length > 0) {
                          selectIssue(filteredOptions[0].id);
                        }
                      } else if (e.key === 'Escape') {
                        setIsDropdownOpen(false);
                      }
                    }}
                    className="w-full text-xs sm:text-sm pl-10 pr-9 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  {filterQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterQuery('');
                        setIsDropdownOpen(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Live Search Suggestions Dropdown */}
                {isDropdownOpen && filterQuery.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-64 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl divide-y divide-slate-100 dark:divide-slate-800 animate-fade-in">
                    {filteredOptions.length === 0 ? (
                      <div className="p-3.5 text-xs text-slate-500 text-center">
                        No matching IPO issues found for "{filterQuery}"
                      </div>
                    ) : (
                      filteredOptions.slice(0, 15).map(item => {
                        const isSelected = item.id === selectedIpoId;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => selectIssue(item.id)}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors ${
                              isSelected ? 'bg-indigo-50/80 dark:bg-indigo-950/60 font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                                <span>{item.name}</span>
                                {isSelected && (
                                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold">• Selected</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Registrar: {item.registrar}
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Native Dropdown Selector */}
              <select
                value={selectedIpoId}
                onChange={(e) => selectIssue(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
              >
                {/* 1. Official MUFG Intime Issues */}
                {mufgIssues.length > 0 && (
                  <optgroup label={`MUFG Intime / Link Intime (${mufgIssues.length} Live Issues)`}>
                    {mufgIssues.map(m => (
                      <option key={m.clientId} value={m.clientId}>
                        ⚡ {m.name} (MUFG Live API)
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* 2. Official KFintech Issues */}
                {kfinIssues.length > 0 && (
                  <optgroup label={`KFintech Official Registry Issues (${kfinIssues.length} Live Issues)`}>
                    {kfinIssues.map(k => (
                      <option key={k.clientId} value={k.clientId}>
                        ⚡ {k.name} (KFintech Live API)
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* 3. Feed IPOs */}
                <optgroup label="Market Feed Issues (Declared / Listed)">
                  {eligibleIpos.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} — Registrar: {i.registrar.split(' ')[0]}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Selected IPO Highlights */}
            {currentIpo && (
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  {'logo' in currentIpo && currentIpo.logo ? (
                    <img src={currentIpo.logo} alt={currentIpo.name} className="w-8 h-8 rounded-lg object-contain bg-white p-1 border border-slate-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                      {currentIpo.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{currentIpo.name}</span>
                      {isMufgIssue && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-600 text-white inline-flex items-center gap-0.5 shadow-sm">
                          <Zap className="w-2.5 h-2.5" /> MUFG Live API
                        </span>
                      )}
                      {isKfinIssue && !isMufgIssue && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-white inline-flex items-center gap-0.5 shadow-sm">
                          <Zap className="w-2.5 h-2.5" /> KFin Live API
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Registrar: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{currentIpo.registrar}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <Calendar className="w-3 h-3 text-slate-400" /> Allotment: {currentIpo.allotmentDate || 'Declared'}
                  </span>
                  <a
                    href={isMufgIssue ? 'https://in.mpms.mufg.com/Initial_Offer/public-issues.html' : isKfinIssue ? 'https://ipostatus.kfintech.com/' : (currentIpo.registrar || '').toLowerCase().includes('bigshare') ? 'https://ipo.bigshareonline.com/' : 'https://in.mpms.mufg.com/Initial_Offer/public-issues.html'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Radio query type */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Identification Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'pan', label: 'PAN Card Number' },
                  { id: 'appNo', label: 'Application Number' },
                  { id: 'dpId', label: 'DP / Client ID' }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setSearchType(type.id as any);
                      setResult(null);
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${searchType === type.id
                        ? 'bg-indigo-600 text-white border-transparent shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input field */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Enter {searchType === 'pan' ? 'Permanent Account Number (PAN)' : searchType === 'appNo' ? 'Application Number' : 'DP / Client ID (16 digits)'}
              </label>
              <input
                ref={queryInputRef}
                type="text"
                placeholder={
                  searchType === 'pan'
                    ? 'e.g. ABCDE1234F'
                    : searchType === 'appNo'
                      ? 'e.g. 10982348'
                      : 'e.g. 1208160012345678'
                }
                value={queryValue}
                onChange={(e) => setQueryValue(e.target.value)}
                required
                className="w-full text-xs sm:text-sm font-semibold p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {/* Test Simulation Samples */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold text-slate-400">Quick Test Samples:</div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setSearchType('pan'); setQueryValue('ALLOT1234F'); }}
                  className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1 hover:bg-emerald-100 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Sample Allotted Bid
                </button>
                <button
                  type="button"
                  onClick={() => { setSearchType('pan'); setQueryValue('NONAL1234F'); }}
                  className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-100 cursor-pointer"
                >
                  Sample Non-Allotted Bid
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !queryValue}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" /> Verifying with Registrar...
                  </span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check Allotment Status</span>
                  </>
                )}
              </button>

              {searched && (
                <button
                  type="button"
                  onClick={() => { setResult(null); setSearched(false); setQueryValue(''); }}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

          </form>

          {/* Result Card */}
          {result && (
            <div className={`mt-6 p-5 rounded-2xl border transition-all animate-fade-in ${result.status === 'Allotted'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-900 dark:text-white'
                : result.status === 'Not Allotted'
                  ? 'bg-rose-500/10 border-rose-500/30 text-slate-900 dark:text-white'
                  : result.status === 'Under Process'
                    ? 'bg-amber-500/10 border-amber-500/30 text-slate-900 dark:text-white'
                    : 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
              }`}>

              {/* Result Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5">
                  {result.status === 'Allotted' ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  ) : result.status === 'Not Allotted' ? (
                    <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                  ) : result.status === 'Under Process' ? (
                    <Clock className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <HelpCircle className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base leading-snug">{result.ipoName}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Registrar: <strong>{result.registrar}</strong> {result.pan && result.pan !== 'N/A' && `• PAN: ${result.pan}`}
                    </p>
                  </div>
                </div>

                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full shrink-0 ${result.status === 'Allotted'
                    ? 'bg-emerald-500 text-white'
                    : result.status === 'Not Allotted'
                      ? 'bg-rose-500 text-white'
                      : result.status === 'Under Process'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-600 text-white'
                  }`}>
                  {result.status === 'Not Found' ? 'Record Not Found' : result.status}
                </span>
              </div>

              {/* Applicant Details Strip (when registered record exists) */}
              {result.applicantName && result.applicantName !== 'N/A' && (
                <div className="p-3 rounded-xl bg-slate-200/50 dark:bg-slate-900/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                      <User className="w-2.5 h-2.5" /> Applicant Name
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold truncate block">
                      {result.applicantName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                      <Hash className="w-2.5 h-2.5" /> Application No
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100 font-mono">
                      {result.applicationNo}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                      <CreditCard className="w-2.5 h-2.5" /> DP / Client ID
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100 font-mono">
                      {result.dpId}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Verified Registrar</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {result.registrar.split(' ')[0]}
                    </span>
                  </div>
                </div>
              )}

              {/* Status Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs py-3 border-y border-slate-200/60 dark:border-slate-700/60 my-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Shares Applied</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-sm">
                    {result.sharesApplied > 0 ? `${result.sharesApplied} Shares` : '0 (Not Applied)'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Shares Allotted</span>
                  <strong className={result.sharesAllotted > 0 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold text-sm' : 'text-slate-500'}>
                    {result.sharesAllotted > 0 ? `${result.sharesAllotted} Shares` : '0 Shares'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Refund / Mandate Status</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {result.status === 'Allotted'
                      ? 'N/A (Full Allotment)'
                      : result.refundAmount > 0
                        ? `₹${result.refundAmount.toLocaleString('en-IN')} (Unblocked)`
                        : result.status === 'Not Allotted'
                          ? 'UPI Mandate Unblocked'
                          : 'Nil'}
                  </strong>
                </div>
              </div>

              {/* Status Description Message */}
              <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {result.message}
              </div>

              {/* Official Registrar Deep Link */}
              {result.registrarPortalUrl && (
                <div className="mt-3 pt-3 border-t border-slate-200/40 dark:border-slate-700/40 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Official confirmation on <strong>{result.registrar}</strong> portal:</span>
                  </div>
                  <a
                    href={result.registrarPortalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors"
                  >
                    <span>Open {result.registrar.split(' ')[0]} Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Direct Registrar Portals Sidebar */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Official Registrar Portals
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
              Indian IPO allotments are officially registered and published by SEBI-authorized RTAs.
            </p>
          </div>

          <div className="space-y-2.5">
            {registrars.map((reg, idx) => (
              <a
                key={idx}
                href={reg.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1">
                    <span>{reg.name}</span>
                  </div>
                  <div className={`text-[10px] ${reg.tag.includes('API') ? 'text-emerald-500 font-semibold' : 'text-slate-400'}`}>
                    {reg.tag}
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </a>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              Real-Time Registrar Integration
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-900 dark:text-emerald-300/90">
              When an application is processed, <strong>MUFG Intime</strong> and <strong>KFintech</strong> verify your PAN directly against their live allotment databases, displaying your registered application number, category, allocated shares, and refund amount.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              UPI Mandate Unblocking
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300/90">
              If your status shows <strong>Not Allotted</strong>, your bank usually unblocks the blocked UPI mandate on the designated Refund Date or within 24 hours of basis of allotment finalization.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
