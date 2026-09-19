import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { IpoItem, AllotmentResult, KfinIssue, MufgIssue, BigshareIssue, BatchAllotmentResult, BigshareServerId } from '../../types/ipo';
import { liveIpoService } from '../../services/liveIpoService';
import { usePan } from '../../context/PanContext';
import { PanCardManager } from './PanCardManager';
import { BigshareCaptchaModal } from './BigshareCaptchaModal';
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
  ChevronDown,
  Play,
  Users,
  RefreshCw,
  Lock
} from 'lucide-react';

interface AllotmentCheckerProps {
  ipos: IpoItem[];
  initialSelectedIpoId?: string | null;
  selectionTimestamp?: number;
}

const STOP_WORDS_SET = new Set([
  'limited', 'ltd', 'pvt', 'private', 'ipo', 'sme', 'india',
  'industries', 'technologies', 'technology', 'solutions', 'enterprises',
  'logistics', 'chemicals', 'pharma', 'finance', 'financial', 'capital',
  'international', 'systems', 'infra', 'infrastructure', 'electricals',
  'services', 'holdings', 'group', 'corp', 'corporation', 'company', 'co',
  'labs', 'projects', 'ventures', 'engineering', 'products', 'retail',
  'power', 'securities', 'energy', 'global', 'reit', 'sm', 'trust'
]);

function getDistinctTokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS_SET.has(t));
}

function matchIssueByName<T extends { name: string }>(targetName: string, issues: T[]): T | null {
  const cleanTarget = targetName.toLowerCase().replace(/\b(limited|ltd|pvt|private|ipo|sme|india)\b/gi, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const issue of issues) {
    const cleanIssue = issue.name.toLowerCase().replace(/\b(limited|ltd|pvt|private|ipo|sme|india)\b/gi, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanIssue === cleanTarget) return issue;
  }
  const targetTokens = getDistinctTokens(targetName);
  if (targetTokens.length === 0) return null;
  let best: T | null = null;
  let maxScore = 0;
  for (const issue of issues) {
    const issueTokens = getDistinctTokens(issue.name);
    if (issueTokens.length === 0) continue;
    let matched = 0;
    for (const t of targetTokens) {
      if (issueTokens.includes(t)) matched++;
    }
    const ratio = matched / Math.max(targetTokens.length, issueTokens.length);
    if (matched > 0 && ratio >= 0.5 && ratio > maxScore) {
      maxScore = ratio;
      best = issue;
    }
  }
  return best;
}

export const AllotmentChecker: React.FC<AllotmentCheckerProps> = ({ ipos, initialSelectedIpoId, selectionTimestamp }) => {
  const [kfinIssues, setKfinIssues] = useState<KfinIssue[]>([]);
  const [mufgIssues, setMufgIssues] = useState<MufgIssue[]>([]);
  const [bigshareIssues, setBigshareIssues] = useState<BigshareIssue[]>([]);
  const [isCaptchaModalOpen, setIsCaptchaModalOpen] = useState<boolean>(false);
  const [captchaPendingAction, setCaptchaPendingAction] = useState<'single' | 'batch' | null>(null);
  const [batchCurrentPanIndex, setBatchCurrentPanIndex] = useState<number>(0);
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
    liveIpoService.getBigshareIssues().then(issues => {
      if (Array.isArray(issues) && issues.length > 0) {
        setBigshareIssues(issues);
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

  // Master list of all searchable issues across MUFG, KFintech, Bigshare, and Market Feed
  const allSearchableOptions = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      group: 'MUFG Intime' | 'KFintech' | 'Bigshare' | 'Market Feed';
      badge: string;
      badgeColor: string;
      registrar: string;
      mufgClientId?: string;
      kfinClientId?: string;
      bigshareCompanyId?: string;
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

    // 3. Bigshare Services Issues
    bigshareIssues.forEach(b => {
      list.push({
        id: b.companyId,
        name: b.name,
        group: 'Bigshare',
        badge: '🔐 Bigshare In-App',
        badgeColor: 'bg-violet-600 text-white',
        registrar: 'Bigshare Services Pvt Ltd',
        bigshareCompanyId: b.companyId
      });
    });

    // 4. Market Feed Issues (deduplicated against MUFG, KFintech, and Bigshare)
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
  }, [mufgIssues, kfinIssues, bigshareIssues, eligibleIpos]);

  // Dedicated list of shortcuts for recent allotment-out / declared IPOs
  const recentAllotmentShortcuts = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      badge: string;
      badgeColor: string;
      registrar: string;
      isLiveApi: boolean;
      allotmentDate?: string;
    }> = [];

    const cleanStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

    const parseTimestamp = (dateStr?: string): number => {
      if (!dateStr || dateStr === 'T+1' || dateStr === 'T+3' || dateStr === 'Active' || dateStr === 'Declared') return 0;
      const ts = Date.parse(dateStr);
      if (!isNaN(ts)) return ts;
      const parts = dateStr.split(/[-/ ]+/);
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          const parsed = new Date(y < 100 ? y + 2000 : y, m, d).getTime();
          if (!isNaN(parsed)) return parsed;
        }
      }
      return 0;
    };

    const now = Date.now();

    // 1. Gather IPOs where allotment has ACTUALLY been declared (allotmentDate is in the past)
    // A 'closed' IPO just means bidding ended — allotment typically takes T+1 business day.
    // We ONLY show shortcuts for IPOs whose allotmentDate has already passed today.
    const closedOrListed = ipos
      .filter(i => {
        if (i.status === 'listed') return true; // listed = definitely allotted
        if (i.status !== 'closed') return false;
        // For 'closed' status: only include if allotmentDate has already passed
        const allotTs = parseTimestamp(i.allotmentDate);
        if (allotTs === 0) return false; // unknown/placeholder date — skip
        return allotTs <= now; // allotment date is today or in the past
      })
      .slice()
      .sort((a, b) => {
        const timeB = Math.max(
          parseTimestamp(b.allotmentDate),
          parseTimestamp(b.listingDate),
          parseTimestamp(b.closeDate)
        );
        const timeA = Math.max(
          parseTimestamp(a.allotmentDate),
          parseTimestamp(a.listingDate),
          parseTimestamp(a.closeDate)
        );
        return timeB - timeA;
      });

    closedOrListed.forEach(ipo => {
      const reg = (ipo.registrar || '').toLowerCase();
      let mufg: MufgIssue | null = null;
      let kfin: KfinIssue | null = null;
      let bigshare: BigshareIssue | null = null;

      if (reg.includes('bigshare')) {
        bigshare = matchIssueByName(ipo.name, bigshareIssues);
      } else if (reg.includes('mufg') || reg.includes('link intime')) {
        mufg = matchIssueByName(ipo.name, mufgIssues);
      } else if (reg.includes('kfin')) {
        kfin = matchIssueByName(ipo.name, kfinIssues);
      }

      if (!bigshare && !mufg && !kfin) {
        bigshare = matchIssueByName(ipo.name, bigshareIssues);
        if (!bigshare) mufg = matchIssueByName(ipo.name, mufgIssues);
        if (!bigshare && !mufg) kfin = matchIssueByName(ipo.name, kfinIssues);
      }

      if (mufg) {
        list.push({
          id: mufg.clientId,
          name: ipo.name,
          badge: '⚡ MUFG Live',
          badgeColor: 'bg-blue-600 text-white',
          registrar: 'MUFG Intime',
          isLiveApi: true,
          allotmentDate: ipo.allotmentDate
        });
      } else if (kfin) {
        list.push({
          id: kfin.clientId,
          name: ipo.name,
          badge: '⚡ KFin Live',
          badgeColor: 'bg-emerald-600 text-white',
          registrar: 'KFintech',
          isLiveApi: true,
          allotmentDate: ipo.allotmentDate
        });
      } else if (bigshare) {
        list.push({
          id: bigshare.companyId,
          name: ipo.name,
          badge: '🔐 Bigshare',
          badgeColor: 'bg-violet-600 text-white',
          registrar: 'Bigshare',
          isLiveApi: true,
          allotmentDate: ipo.allotmentDate
        });
      } else {
        list.push({
          id: ipo.id,
          name: ipo.name,
          badge: ipo.status === 'listed' ? 'Listed' : 'Allotment',
          badgeColor: 'bg-indigo-600 text-white',
          registrar: ipo.registrar.split(' ')[0] || 'Official',
          isLiveApi: false,
          allotmentDate: ipo.allotmentDate
        });
      }
    });

    // 2. Also include top newly declared live issues from MUFG (highest clientId is newest added on Link Intime)
    const sortedMufg = [...mufgIssues].sort((a, b) => {
      const numA = parseInt(a.clientId, 10) || 0;
      const numB = parseInt(b.clientId, 10) || 0;
      return numB - numA;
    });

    sortedMufg.slice(0, 8).forEach(m => {
      const clean = cleanStr(m.name);
      const exists = list.some(item => {
        const itemClean = cleanStr(item.name);
        return itemClean.includes(clean) || clean.includes(itemClean) || item.id === m.clientId;
      });
      if (!exists) {
        const cleanDisplayName = m.name.replace(/-(?:\s*SME)?\s*IPO$/i, '').trim();
        list.push({
          id: m.clientId,
          name: cleanDisplayName,
          badge: '⚡ MUFG Live',
          badgeColor: 'bg-blue-600 text-white',
          registrar: 'MUFG Intime',
          isLiveApi: true
        });
      }
    });

    // 3. Also include top newly declared live issues from KFintech
    kfinIssues.slice(0, 8).forEach(k => {
      const clean = cleanStr(k.name);
      const exists = list.some(item => {
        const itemClean = cleanStr(item.name);
        return itemClean.includes(clean) || clean.includes(itemClean) || item.id === k.clientId;
      });
      if (!exists) {
        const cleanDisplayName = k.name.replace(/-(?:\s*SME)?\s*IPO$/i, '').replace(/LIMITED.*$/i, 'Ltd').trim();
        list.push({
          id: k.clientId,
          name: cleanDisplayName,
          badge: '⚡ KFin Live',
          badgeColor: 'bg-emerald-600 text-white',
          registrar: 'KFintech',
          isLiveApi: true
        });
      }
    });

    // 4. Also include top newly declared live issues from Bigshare
    bigshareIssues.slice(0, 5).forEach(b => {
      const clean = cleanStr(b.name);
      const exists = list.some(item => {
        const itemClean = cleanStr(item.name);
        return itemClean.includes(clean) || clean.includes(itemClean) || item.id === b.companyId;
      });
      if (!exists) {
        const cleanDisplayName = b.name.replace(/-(?:\s*SME)?\s*IPO$/i, '').replace(/LIMITED.*$/i, 'Ltd').trim();
        list.push({
          id: b.companyId,
          name: cleanDisplayName,
          badge: '🔐 Bigshare',
          badgeColor: 'bg-violet-600 text-white',
          registrar: 'Bigshare',
          isLiveApi: true
        });
      }
    });

    return list.slice(0, 14);
  }, [ipos, mufgIssues, kfinIssues, bigshareIssues]);

  const [selectedIpoId, setSelectedIpoId] = useState<string>('');

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

    // 2. Feed item name matching against Bigshare, MUFG, or KFintech
    const feedItem = ipos.find(i => i.id === initialSelectedIpoId);
    if (feedItem) {
      const reg = (feedItem.registrar || '').toLowerCase();
      let matchedId: string | null = null;

      if (reg.includes('bigshare')) {
        const bs = matchIssueByName(feedItem.name, bigshareIssues);
        if (bs) matchedId = bs.companyId;
      } else if (reg.includes('mufg') || reg.includes('link intime')) {
        const m = matchIssueByName(feedItem.name, mufgIssues);
        if (m) matchedId = m.clientId;
      } else if (reg.includes('kfin')) {
        const k = matchIssueByName(feedItem.name, kfinIssues);
        if (k) matchedId = k.clientId;
      }

      if (!matchedId) {
        const bs = matchIssueByName(feedItem.name, bigshareIssues);
        if (bs) matchedId = bs.companyId;
        else {
          const m = matchIssueByName(feedItem.name, mufgIssues);
          if (m) matchedId = m.clientId;
          else {
            const k = matchIssueByName(feedItem.name, kfinIssues);
            if (k) matchedId = k.clientId;
          }
        }
      }

      selectIssue(matchedId || feedItem.id);
      setTimeout(() => {
        queryInputRef.current?.focus();
        queryInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [initialSelectedIpoId, selectionTimestamp, allSearchableOptions, ipos, mufgIssues, kfinIssues, bigshareIssues]);

  const { pans } = usePan();

  const [searchType, setSearchType] = useState<'pan' | 'appNo' | 'dpId'>('pan');
  const [queryValue, setQueryValue] = useState<string>('');
  const [result, setResult] = useState<AllotmentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'single' | 'batch' | 'pans'>('single');

  // Batch check state
  const [batchResults, setBatchResults] = useState<BatchAllotmentResult[]>([]);
  const [isBatchChecking, setIsBatchChecking] = useState<boolean>(false);
  const [batchChecked, setBatchChecked] = useState<boolean>(false);

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
    if (!selectedIpoId) return null;

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

    // 3. Direct Bigshare issue match
    const bigshare = bigshareIssues.find(b => b.companyId === selectedIpoId);
    if (bigshare) {
      return {
        id: bigshare.companyId,
        name: bigshare.name,
        registrar: 'Bigshare Services Pvt Ltd',
        bigshareCompanyId: bigshare.companyId,
        status: 'listed' as const,
        symbol: bigshare.name.split(' ')[0],
        allotmentDate: 'Declared',
        lotSize: 100,
        priceBandMax: 140,
        category: bigshare.name.toLowerCase().includes('sme') ? ('sme' as const) : ('mainboard' as const)
      };
    }

    // 4. Feed IPO match
    const feed = ipos.find(i => i.id === selectedIpoId) || eligibleIpos.find(i => i.id === selectedIpoId);
    if (feed) {
      const reg = (feed.registrar || '').toLowerCase();

      // If registrar explicitly states Bigshare, check Bigshare first
      if (reg.includes('bigshare')) {
        const matchedBigshare = matchIssueByName(feed.name, bigshareIssues);
        if (matchedBigshare) {
          return {
            ...feed,
            registrar: 'Bigshare Services Pvt Ltd',
            bigshareCompanyId: matchedBigshare.companyId
          };
        }
      }

      // If registrar explicitly states MUFG / Link Intime, check MUFG first
      if (reg.includes('mufg') || reg.includes('link intime')) {
        const matchedMufg = matchIssueByName(feed.name, mufgIssues);
        if (matchedMufg) {
          return {
            ...feed,
            registrar: 'MUFG Intime India Pvt Ltd',
            mufgClientId: matchedMufg.clientId
          };
        }
      }

      // If registrar explicitly states KFintech, check KFin first
      if (reg.includes('kfin')) {
        const matchedKfin = matchIssueByName(feed.name, kfinIssues);
        if (matchedKfin) {
          return {
            ...feed,
            registrar: 'KFin Technologies Ltd',
            kfinClientId: matchedKfin.clientId
          };
        }
      }

      // Fallback matching without registrar hint
      const matchedBigshare = matchIssueByName(feed.name, bigshareIssues);
      if (matchedBigshare) {
        return {
          ...feed,
          registrar: 'Bigshare Services Pvt Ltd',
          bigshareCompanyId: matchedBigshare.companyId
        };
      }

      const matchedMufg = matchIssueByName(feed.name, mufgIssues);
      if (matchedMufg) {
        return {
          ...feed,
          registrar: 'MUFG Intime India Pvt Ltd',
          mufgClientId: matchedMufg.clientId
        };
      }

      const matchedKfin = matchIssueByName(feed.name, kfinIssues);
      if (matchedKfin) {
        return {
          ...feed,
          registrar: 'KFin Technologies Ltd',
          kfinClientId: matchedKfin.clientId
        };
      }

      return feed;
    }

    return null;
  }, [selectedIpoId, mufgIssues, kfinIssues, bigshareIssues, eligibleIpos]);

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

  const isBigshareIssue = useMemo(() => {
    if (!currentIpo) return false;
    if (currentIpo.bigshareCompanyId) return true;
    const reg = (currentIpo.registrar || '').toLowerCase();
    return reg.includes('bigshare');
  }, [currentIpo]);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryValue.trim() || !currentIpo) return;

    if (isBigshareIssue) {
      setCaptchaPendingAction('single');
      setIsCaptchaModalOpen(true);
      return;
    }

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
        currentIpo.mufgClientId,
        currentIpo.bigshareCompanyId
      );
      setResult(res);
    } catch (err) {
      console.error('Allotment check error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset batch results when IPO changes
  useEffect(() => {
    setBatchResults([]);
    setBatchChecked(false);
  }, [selectedIpoId]);

  const handleBatchCheck = useCallback(async () => {
    if (!currentIpo || pans.length === 0) return;

    if (isBigshareIssue) {
      setBatchCurrentPanIndex(0);
      setCaptchaPendingAction('batch');
      const initial: BatchAllotmentResult[] = pans.map(p => ({
        panCard: p,
        result: null,
        loading: true
      }));
      setBatchResults(initial);
      setIsBatchChecking(true);
      setBatchChecked(true);
      setIsCaptchaModalOpen(true);
      return;
    }

    setIsBatchChecking(true);
    setBatchChecked(true);

    // Initialise all as loading
    const initial: BatchAllotmentResult[] = pans.map(p => ({
      panCard: p,
      result: null,
      loading: true
    }));
    setBatchResults(initial);

    // Fire all checks in parallel
    await Promise.all(
      pans.map(async (panCard, idx) => {
        try {
          const res = await liveIpoService.checkAllotment(
            currentIpo.id,
            'pan',
            panCard.pan,
            ipos,
            currentIpo.kfinClientId,
            currentIpo.name,
            currentIpo.mufgClientId,
            currentIpo.bigshareCompanyId
          );
          setBatchResults(prev =>
            prev.map((br, i) =>
              i === idx ? { ...br, result: res, loading: false } : br
            )
          );
        } catch (err) {
          setBatchResults(prev =>
            prev.map((br, i) =>
              i === idx ? { ...br, loading: false, error: 'Check failed' } : br
            )
          );
        }
      })
    );

    setIsBatchChecking(false);
  }, [currentIpo, pans, ipos, isBigshareIssue]);

  const handleCaptchaModalSubmit = async (
    token: string,
    answer: string,
    serverId?: BigshareServerId
  ): Promise<{ success: boolean; error?: string; hasMore?: boolean; done?: boolean }> => {
    if (!currentIpo) return { success: false, error: 'No IPO selected' };

    if (captchaPendingAction === 'single') {
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
          currentIpo.mufgClientId,
          currentIpo.bigshareCompanyId,
          token,
          answer,
          serverId
        );

        if (res.status === 'CAPTCHA_INVALID') {
          setLoading(false);
          return { success: false, error: res.message || 'Invalid CAPTCHA code. Please try again.' };
        }

        setResult(res);
        setIsCaptchaModalOpen(false);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Verification failed.' };
      } finally {
        setLoading(false);
      }
    }

    if (captchaPendingAction === 'batch') {
      const targetPanCard = pans[batchCurrentPanIndex];
      if (!targetPanCard) {
        setIsCaptchaModalOpen(false);
        setIsBatchChecking(false);
        return { success: true, done: true };
      }

      try {
        const res = await liveIpoService.checkAllotment(
          currentIpo.id,
          'pan',
          targetPanCard.pan,
          ipos,
          currentIpo.kfinClientId,
          currentIpo.name,
          currentIpo.mufgClientId,
          currentIpo.bigshareCompanyId,
          token,
          answer,
          serverId
        );

        if (res.status === 'CAPTCHA_INVALID') {
          return { success: false, error: res.message || 'Invalid CAPTCHA code. Please try again.' };
        }

        setBatchResults(prev =>
          prev.map((br, i) => (i === batchCurrentPanIndex ? { ...br, result: res, loading: false } : br))
        );

        if (batchCurrentPanIndex + 1 < pans.length) {
          setBatchCurrentPanIndex(prev => prev + 1);
          return { success: true, hasMore: true };
        } else {
          setIsCaptchaModalOpen(false);
          setIsBatchChecking(false);
          return { success: true, done: true };
        }
      } catch (err: any) {
        setBatchResults(prev =>
          prev.map((br, i) => (i === batchCurrentPanIndex ? { ...br, loading: false, error: 'Check failed' } : br))
        );
        if (batchCurrentPanIndex + 1 < pans.length) {
          setBatchCurrentPanIndex(prev => prev + 1);
          return { success: true, hasMore: true };
        } else {
          setIsCaptchaModalOpen(false);
          setIsBatchChecking(false);
          return { success: true, done: true };
        }
      }
    }

    return { success: false, error: 'Unknown action' };
  };

  const handleSkipBatchPan = () => {
    setBatchResults(prev =>
      prev.map((br, i) => (i === batchCurrentPanIndex ? { ...br, loading: false, error: 'Skipped' } : br))
    );
    if (batchCurrentPanIndex + 1 < pans.length) {
      setBatchCurrentPanIndex(prev => prev + 1);
    } else {
      setIsCaptchaModalOpen(false);
      setIsBatchChecking(false);
    }
  };

  const handleCloseCaptchaModal = () => {
    setIsCaptchaModalOpen(false);
    if (captchaPendingAction === 'batch') {
      setBatchResults(prev =>
        prev.map(br => (br.loading ? { ...br, loading: false, error: 'Cancelled' } : br))
      );
      setIsBatchChecking(false);
    }
    setCaptchaPendingAction(null);
  };

  // Reusable Batch Auto-Check Panel
  const renderBatchPanel = () => {
    if (pans.length === 0) {
      return (
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">No Saved PANs Found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Add your family PAN cards under the <strong>My PANs</strong> tab to auto-check allotment in 1 click.
          </p>
          <button
            type="button"
            onClick={() => setMobileTab('pans')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer min-h-[42px]"
          >
            Go to My PANs
          </button>
        </div>
      );
    }

    if (!currentIpo) {
      return (
        <div className="glass-card rounded-2xl p-5 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2.5">
          <Info className="w-6 h-6 text-indigo-500 mx-auto" />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Select an IPO Issue First</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please pick an IPO from the shortcuts or search above to run batch check.
          </p>
        </div>
      );
    }

    return (
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 shrink-0">
                <Users className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">Auto-Check All PANs</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 ml-8 truncate">
              {pans.length} saved PAN{pans.length > 1 ? 's' : ''} • Single-tap verification
            </p>
          </div>
          <button
            type="button"
            onClick={handleBatchCheck}
            disabled={isBatchChecking}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 cursor-pointer shrink-0 min-h-[42px] touch-manipulation"
          >
            {isBatchChecking ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking...</>
            ) : (
              <><Play className="w-3.5 h-3.5" /> {batchChecked ? 'Re-Check All' : 'Check All'}</>
            )}
          </button>
        </div>

        {/* Batch Results */}
        {batchResults.length > 0 && (
          <div className="space-y-2.5">
            {/* Summary row */}
            {!isBatchChecking && batchResults.every(r => !r.loading) && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {(() => {
                  const allotted = batchResults.filter(r => r.result?.status === 'Allotted').length;
                  const notAllotted = batchResults.filter(r => r.result?.status === 'Not Allotted').length;
                  const underProcess = batchResults.filter(r => r.result?.status === 'Under Process').length;
                  const notFound = batchResults.filter(r => r.result?.status === 'Not Found' || r.error).length;
                  return (
                    <>
                      {allotted > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[11px] font-extrabold border border-emerald-500/20">
                          ✅ {allotted} Allotted
                        </span>
                      )}
                      {notAllotted > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-400 text-[11px] font-extrabold border border-rose-500/20">
                          ❌ {notAllotted} Not Allotted
                        </span>
                      )}
                      {underProcess > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[11px] font-extrabold border border-amber-500/20">
                          ⏳ {underProcess} Under Process
                        </span>
                      )}
                      {notFound > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                          ❓ {notFound} Not Found
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Per-PAN result cards */}
            {batchResults.map((br) => (
              <div
                key={br.panCard.id}
                className={`rounded-xl border p-3 sm:p-3.5 transition-all ${
                  br.loading
                    ? 'bg-slate-100/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 animate-pulse'
                    : br.result?.status === 'Allotted'
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300/60 dark:border-emerald-700/50 shadow-xs'
                      : br.result?.status === 'Not Allotted'
                        ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300/60 dark:border-rose-700/50'
                        : br.result?.status === 'Under Process'
                          ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300/60 dark:border-amber-700/50'
                          : 'bg-slate-100/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Left: PAN identity */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                      {(br.panCard.nickname || br.panCard.name || br.panCard.pan).slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {br.panCard.nickname || br.panCard.name || `${br.panCard.pan.slice(0, 2)}***${br.panCard.pan.slice(5, 9)}${br.panCard.pan[9]}`}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {br.panCard.pan.slice(0, 2)}***{br.panCard.pan.slice(5, 9)}{br.panCard.pan[9]}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status badge */}
                  <div className="shrink-0 text-right">
                    {br.loading ? (
                      <div className="w-20 h-6 rounded-full bg-slate-300/60 dark:bg-slate-700/60 animate-pulse" />
                    ) : br.error ? (
                      <span className="text-[11px] font-bold text-rose-500">Check Failed</span>
                    ) : (
                      <span className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-xs ${
                        br.result?.status === 'Allotted'
                          ? 'bg-emerald-500 text-white'
                          : br.result?.status === 'Not Allotted'
                            ? 'bg-rose-500 text-white'
                            : br.result?.status === 'Under Process'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-500 text-white'
                      }`}>
                        {br.result?.status === 'Not Found' ? 'Not Found' : br.result?.status || '—'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Shares info row if allotted */}
                {!br.loading && br.result?.status === 'Allotted' && br.result.sharesAllotted > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Applied: <strong className="text-slate-700 dark:text-slate-300">{br.result.sharesApplied} shs</strong></span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Allotted: {br.result.sharesAllotted} shares 🎉</span>
                  </div>
                )}

                {/* Not allotted message */}
                {!br.loading && br.result?.status === 'Not Allotted' && (
                  <div className="mt-2 pt-1.5 border-t border-rose-200/40 dark:border-rose-900/30 text-[11px] text-rose-600 dark:text-rose-400">
                    UPI mandate will be unblocked on refund date
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!batchChecked && (
          <p className="text-[11px] text-slate-400 text-center">
            Click <strong>Check All</strong> to verify allotment across all your saved PAN cards via the live {currentIpo ? (isKfinIssue ? 'KFintech' : isBigshareIssue ? 'Bigshare' : 'MUFG Intime') : ''} API.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* Header */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-1.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
              IPO Allotment Status Checker
            </h2>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] sm:text-xs font-bold border border-emerald-500/20">
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>MUFG, KFintech & Bigshare Live APIs</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Verify your allotment status directly against official registrar databases for Mainboard and SME IPOs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

        {/* Main Content Area */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-5">

          {/* Select IPO Header & Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                Select IPO Issue
              </label>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                {allSearchableOptions.length} Declared Issues
              </span>
            </div>

            {/* Quick Select Recent Allotment Out Shortcuts Pills (Swipeable on Mobile) */}
            {recentAllotmentShortcuts.length > 0 && (
              <div className="mb-3.5">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400 font-extrabold">Recent Allotment Out Shortcuts</span>
                  </div>
                  <span className="text-[10px] text-slate-400 hidden sm:inline-block">
                    Click to auto-fill & check
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth touch-pan-x">
                  {recentAllotmentShortcuts.map(opt => {
                    const isSelected = opt.id === selectedIpoId;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => selectIssue(opt.id)}
                        title={`${opt.name} (${opt.registrar})`}
                        className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-2 border min-h-[38px] active:scale-95 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/30'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 shadow-2xs'
                        }`}
                      >
                        <span className="truncate max-w-[140px] sm:max-w-[170px]">{opt.name}</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : opt.badge.includes('MUFG')
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                              : opt.badge.includes('KFin')
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : opt.badge.includes('Bigshare')
                                  ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400'
                                  : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                        }`}>
                          {opt.badge.includes('MUFG') ? 'MUFG' : opt.badge.includes('KFin') ? 'KFin' : opt.badge.includes('Bigshare') ? 'Bigshare' : 'Out'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                  className="w-full text-base sm:text-sm pl-10 pr-10 py-3 sm:py-2.5 min-h-[46px] sm:min-h-[40px] rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                {filterQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterQuery('');
                      setIsDropdownOpen(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
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
                          className={`w-full text-left px-3.5 py-3 sm:py-2.5 flex items-center justify-between gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer min-h-[44px] ${isSelected ? 'bg-indigo-50/80 dark:bg-indigo-950/60 font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'
                            }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="text-xs sm:text-sm font-semibold truncate flex items-center gap-1.5">
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
              className="w-full text-sm font-semibold p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/40 cursor-pointer min-h-[48px]"
            >
              <option value="">-- Choose an IPO to Check Allotment --</option>
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

          {/* Empty selection guide prompt */}
          {!selectedIpoId && (
            <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2.5">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Please select an IPO from the quick pills, search, or dropdown above to check allotment.</span>
            </div>
          )}

          {/* Selected IPO Highlights */}
          {currentIpo && (
            <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                {'logo' in currentIpo && currentIpo.logo ? (
                  <img src={currentIpo.logo} alt={currentIpo.name} className="w-9 h-9 rounded-xl object-contain bg-white p-1 border border-slate-200 shadow-xs shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    {currentIpo.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-1.5">
                    <span className="truncate">{currentIpo.name}</span>
                    {isMufgIssue && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-600 text-white inline-flex items-center gap-0.5 shadow-xs shrink-0">
                        <Zap className="w-2.5 h-2.5" /> MUFG Live API
                      </span>
                    )}
                    {isKfinIssue && !isMufgIssue && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-white inline-flex items-center gap-0.5 shadow-xs shrink-0">
                        <Zap className="w-2.5 h-2.5" /> KFin Live API
                      </span>
                    )}
                    {isBigshareIssue && !isMufgIssue && !isKfinIssue && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-600 text-white inline-flex items-center gap-0.5 shadow-xs shrink-0">
                        <Lock className="w-2.5 h-2.5" /> Bigshare In-App
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Registrar: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{currentIpo.registrar}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Calendar className="w-3 h-3 text-slate-400" /> {currentIpo.allotmentDate || 'Declared'}
                </span>
                {isBigshareIssue ? (
                  <div className="flex items-center gap-1.5">
                    <a
                      href="https://www.bigshareonline.com/ipo_Allotment.html"
                      target="_blank"
                      rel="noreferrer"
                      title="Open Bigshare Official Portal (All Servers)"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors min-h-[32px]"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                      <a
                        href="https://ipo.bigshareonline.com/"
                        target="_blank"
                        rel="noreferrer"
                        title="Open Server 1"
                        className="px-1.5 py-1 rounded text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      >
                        S1
                      </a>
                      <a
                        href="https://ipo1.bigshareonline.com/ipo_status.html"
                        target="_blank"
                        rel="noreferrer"
                        title="Open Server 2"
                        className="px-1.5 py-1 rounded text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      >
                        S2
                      </a>
                      <a
                        href="https://ipo2.bigshareonline.com/ipo_status.html"
                        target="_blank"
                        rel="noreferrer"
                        title="Open Server 3"
                        className="px-1.5 py-1 rounded text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      >
                        S3
                      </a>
                    </div>
                  </div>
                ) : (
                  <a
                    href={isMufgIssue ? 'https://in.mpms.mufg.com/Initial_Offer/public-issues.html' : isKfinIssue ? 'https://ipostatus.kfintech.com/' : 'https://in.mpms.mufg.com/Initial_Offer/public-issues.html'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors min-h-[32px]"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Mobile Mode Segmented Switcher (Visible only on < lg screens) */}
          <div className="flex lg:hidden items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMobileTab('single')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] ${
                mobileTab === 'single'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Single Check</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('batch')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] ${
                mobileTab === 'batch'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All PANs ({pans.length})</span>
              {pans.length > 0 && batchResults.some(r => r.result?.status === 'Allotted') && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('pans')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] ${
                mobileTab === 'pans'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>My PANs</span>
            </button>
          </div>

          {/* Conditional Mobile Views */}
          {/* 1. Mobile Batch Tab */}
          <div className={mobileTab === 'batch' ? 'block lg:hidden' : 'hidden'}>
            {renderBatchPanel()}
          </div>

          {/* 2. Mobile My PANs Tab */}
          <div className={mobileTab === 'pans' ? 'block lg:hidden' : 'hidden'}>
            <PanCardManager />
          </div>

          {/* 3. Single Search Form & Result (Visible if mobileTab === 'single' OR on desktop lg:) */}
          <div className={mobileTab === 'single' ? 'block' : 'hidden lg:block'}>

            {/* Quick Batch Trigger Banner on Mobile (When viewing Single Check) */}
            {currentIpo && pans.length > 0 && (
              <div className="lg:hidden mb-4 p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/40 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-purple-900 dark:text-purple-200 truncate">
                    Check All {pans.length} Saved PANs
                  </div>
                  <div className="text-[10px] text-purple-600 dark:text-purple-400 truncate">
                    One tap to check your entire family
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileTab('batch');
                    handleBatchCheck();
                  }}
                  disabled={isBatchChecking}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer shrink-0 min-h-[38px] touch-manipulation"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Check All</span>
                </button>
              </div>
            )}

            <form onSubmit={handleCheck} className="space-y-4 sm:space-y-5">

              {/* Radio query type */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Identification Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pan', label: 'PAN Card', shortLabel: 'PAN', icon: CreditCard },
                    { id: 'appNo', label: 'Application No', shortLabel: 'App No', icon: Hash },
                    { id: 'dpId', label: 'DP / Client ID', shortLabel: 'DP ID', icon: User }
                  ].map(type => {
                    const Icon = type.icon;
                    const isSelected = searchType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          setSearchType(type.id as any);
                          setResult(null);
                        }}
                        className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-transparent shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">{type.label}</span>
                        <span className="sm:hidden">{type.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Saved PAN Autofill Chips (Mobile Friendly) */}
              {searchType === 'pan' && pans.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Quick Autofill from Saved PANs:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x">
                    {pans.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setQueryValue(p.pan)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 min-h-[36px] active:scale-95 ${
                          queryValue === p.pan
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{p.nickname || p.name || `${p.pan.slice(0, 2)}...${p.pan.slice(8)}`}</span>
                        <span className="text-[10px] opacity-75 font-normal">({p.pan.slice(0, 2)}***{p.pan.slice(8)})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input field */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Enter {searchType === 'pan' ? 'Permanent Account Number (PAN)' : searchType === 'appNo' ? 'Application Number' : 'DP / Client ID (16 digits)'}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    {searchType === 'pan' ? (
                      <CreditCard className="w-4 h-4" />
                    ) : searchType === 'appNo' ? (
                      <Hash className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
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
                    onChange={(e) => {
                      const val = searchType === 'pan' ? e.target.value.toUpperCase() : e.target.value;
                      setQueryValue(val);
                    }}
                    autoCapitalize={searchType === 'pan' ? 'characters' : 'off'}
                    autoComplete="off"
                    spellCheck={false}
                    required
                    className="w-full text-base sm:text-sm font-semibold pl-10 pr-10 py-3.5 min-h-[48px] rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/40 tracking-wider"
                  />
                  {queryValue && (
                    <button
                      type="button"
                      onClick={() => setQueryValue('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                      title="Clear input"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {searchType === 'pan'
                    ? 'Standard 10-character alphanumeric PAN issued by Income Tax Dept.'
                    : searchType === 'appNo'
                      ? 'Numeric or alphanumeric application number from broker email/SMS.'
                      : '16-digit CDSL or NSDL Demat account number.'}
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-1 flex items-center gap-2.5">
                <button
                  type="submit"
                  disabled={loading || !queryValue.trim() || !selectedIpoId}
                  className="flex-1 py-3.5 px-6 min-h-[48px] rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm sm:text-base shadow-md hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer touch-manipulation"
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

                {(searched || queryValue) && (
                  <button
                    type="button"
                    onClick={() => { setResult(null); setSearched(false); setQueryValue(''); }}
                    className="p-3.5 min-h-[48px] min-w-[48px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-center"
                    title="Reset"
                    aria-label="Reset search"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

            </form>

            {/* Result Card */}
            {result && (
              <div className={`mt-5 p-4 sm:p-5 rounded-2xl border transition-all animate-fade-in ${
                result.status === 'Allotted'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-900 dark:text-white'
                  : result.status === 'Not Allotted'
                    ? 'bg-rose-500/10 border-rose-500/30 text-slate-900 dark:text-white'
                    : result.status === 'Under Process'
                      ? 'bg-amber-500/10 border-amber-500/30 text-slate-900 dark:text-white'
                      : 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
              }`}>

                {/* Result Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    {result.status === 'Allotted' ? (
                      <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                    ) : result.status === 'Not Allotted' ? (
                      <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                    ) : result.status === 'Under Process' ? (
                      <Clock className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <HelpCircle className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-base leading-snug break-words">{result.ipoName}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Registrar: <strong>{result.registrar}</strong> {result.pan && result.pan !== 'N/A' && `• PAN: ${result.pan}`}
                      </p>
                    </div>
                  </div>

                  <div className="self-start sm:self-auto shrink-0">
                    <span className={`inline-flex items-center text-xs font-black uppercase px-3 py-1.5 rounded-full shadow-xs ${
                      result.status === 'Allotted'
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
                </div>

                {/* Applicant Details Strip (when registered record exists) */}
                {result.applicantName && result.applicantName !== 'N/A' && (
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-200/50 dark:bg-slate-900/40 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-3">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <User className="w-2.5 h-2.5 shrink-0" /> Applicant Name
                      </span>
                      <strong className="text-slate-900 dark:text-slate-100 font-bold truncate block">
                        {result.applicantName}
                      </strong>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Hash className="w-2.5 h-2.5 shrink-0" /> Application No
                      </span>
                      <strong className="text-slate-900 dark:text-slate-100 font-mono text-[11px] sm:text-xs break-all block">
                        {result.applicationNo}
                      </strong>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <CreditCard className="w-2.5 h-2.5 shrink-0" /> DP / Client ID
                      </span>
                      <strong className="text-slate-900 dark:text-slate-100 font-mono text-[11px] sm:text-xs break-all block">
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
                  <div className="col-span-2 sm:col-span-1">
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
                      <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Official confirmation on <strong>{result.registrar}</strong> portal:</span>
                    </div>
                    <a
                      href={result.registrarPortalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors min-h-[34px]"
                    >
                      <span>Open {result.registrar.split(' ')[0]} Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Right Sidebar (Desktop side-by-side view) */}
        <div className="hidden lg:block space-y-4">
          <PanCardManager />
          {renderBatchPanel()}
        </div>

      </div>

      {/* Bigshare In-App CAPTCHA Modal */}
      <BigshareCaptchaModal
        isOpen={isCaptchaModalOpen}
        onClose={handleCloseCaptchaModal}
        onSubmit={handleCaptchaModalSubmit}
        ipoName={currentIpo?.name || 'Bigshare Issue'}
        isBatch={captchaPendingAction === 'batch'}
        batchCount={pans.length}
        currentPanIndex={batchCurrentPanIndex}
        currentPanName={pans[batchCurrentPanIndex]?.name || pans[batchCurrentPanIndex]?.nickname || 'Applicant'}
        currentPanNumber={pans[batchCurrentPanIndex]?.pan}
        onSkipCurrentPan={handleSkipBatchPan}
      />

    </div>
  );
};
