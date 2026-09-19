import React, { useMemo } from 'react';
import { IpoItem } from '../../types/ipo';
import { Megaphone, Sparkles, TrendingUp, Clock, X, Radio } from 'lucide-react';

interface NoticeTickerProps {
  ipos?: IpoItem[];
  isLive?: boolean;
  onSelectIpo?: (ipo: IpoItem) => void;
}

export const NoticeTicker: React.FC<NoticeTickerProps> = ({
  ipos = [],
  isLive = true,
  onSelectIpo
}) => {
  const [visible, setVisible] = React.useState(true);

  // Generate dynamic live ticker items from real dataset
  const tickerItems = useMemo(() => {
    const list = ipos || [];
    const items: {
      id: string;
      ipo: IpoItem;
      title: string;
      detail: string;
      tag: string;
      tagBg: string;
      tagText: string;
      icon: 'trending' | 'sparkles' | 'clock';
    }[] = [];

    // 1. Ongoing live issues (Bidding active)
    const liveIpos = list.filter(i => i.status === 'live');
    liveIpos.forEach(i => {
      items.push({
        id: `live-${i.id}`,
        ipo: i,
        title: i.name,
        detail: `Bidding Live (Closes ${i.closeDate}) • GMP +₹${i.gmp.gmpPrice} (+${i.gmp.gmpPercent}%)`,
        tag: 'LIVE',
        tagBg: 'bg-emerald-500/15 border-emerald-500/30',
        tagText: 'text-emerald-400',
        icon: 'trending'
      });
    });

    // 2. Top GMP Gainers (sorted by GMP %)
    const topGmp = [...list]
      .filter(i => i.gmp && i.gmp.gmpPercent > 0)
      .sort((a, b) => b.gmp.gmpPercent - a.gmp.gmpPercent)
      .slice(0, 5);

    topGmp.forEach(i => {
      if (!items.some(it => it.ipo.id === i.id)) {
        items.push({
          id: `gmp-${i.id}`,
          ipo: i,
          title: i.name,
          detail: `GMP +₹${i.gmp.gmpPrice} (+${i.gmp.gmpPercent}%) • Est. Listing ₹${i.gmp.estimatedListingPrice}`,
          tag: 'TOP GMP',
          tagBg: 'bg-purple-500/15 border-purple-500/30',
          tagText: 'text-purple-300',
          icon: 'sparkles'
        });
      }
    });

    // 3. Allotment / Closed issues
    const closedIpos = list.filter(i => i.status === 'closed' || i.status === 'listed').slice(0, 4);
    closedIpos.forEach(i => {
      if (!items.some(it => it.ipo.id === i.id)) {
        items.push({
          id: `allot-${i.id}`,
          ipo: i,
          title: i.name,
          detail: `Allotment ${i.allotmentDate} • ${i.registrar.split(' ')[0]}`,
          tag: 'ALLOTMENT',
          tagBg: 'bg-amber-500/15 border-amber-500/30',
          tagText: 'text-amber-300',
          icon: 'clock'
        });
      }
    });

    return items;
  }, [ipos]);

  if (!visible || tickerItems.length === 0) return null;

  return (
    <div className="relative overflow-hidden bg-slate-900 dark:bg-[#0b101d] text-slate-100 text-[11px] sm:text-xs font-medium py-1.5 px-3 sm:px-4 border-b border-indigo-500/20 shadow-xs flex items-center justify-between select-none">
      
      {/* Left Badge: Compact on mobile, rich on desktop */}
      <div className="flex items-center gap-1.5 shrink-0 z-10 mr-2 sm:mr-3">
        {/* Mobile Badge */}
        <span className="sm:hidden flex items-center gap-1 bg-rose-500/20 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>LIVE</span>
        </span>

        {/* Desktop Badge */}
        <span className="hidden sm:flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
          <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
          <span>{isLive ? 'Market Feed' : 'Live Ticker'}</span>
        </span>
      </div>

      {/* Marquee Body with edge gradient fade */}
      <div className="overflow-hidden whitespace-nowrap flex-1 relative [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]">
        <div className="animate-marquee flex items-center gap-6 sm:gap-8">
          {/* Render twice for continuous seamless infinite marquee loop */}
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => onSelectIpo && onSelectIpo(item.ipo)}
              className="inline-flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition-colors group py-0.5"
            >
              <span className={`text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.2 rounded border ${item.tagBg} ${item.tagText}`}>
                {item.tag}
              </span>
              <span className="flex items-center gap-1">
                <strong className="text-white group-hover:underline font-bold">{item.title}:</strong>
                <span className="text-slate-300">{item.detail}</span>
              </span>
              <span className="text-slate-600 ml-3 sm:ml-4 select-none">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={() => setVisible(false)}
        className="ml-2 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors shrink-0 z-10 cursor-pointer"
        title="Dismiss ticker"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
