import React, { useMemo } from 'react';
import { IpoItem } from '../../types/ipo';
import { mockIpoList } from '../../data/mockIpoData';
import { Megaphone, Sparkles, TrendingUp, Clock, X } from 'lucide-react';

interface NoticeTickerProps {
  ipos?: IpoItem[];
  isLive?: boolean;
  onSelectIpo?: (ipo: IpoItem) => void;
}

export const NoticeTicker: React.FC<NoticeTickerProps> = ({ 
  ipos = mockIpoList, 
  isLive = true,
  onSelectIpo 
}) => {
  const [visible, setVisible] = React.useState(true);

  // Generate dynamic live ticker items from real dataset
  const tickerItems = useMemo(() => {
    const list = ipos && ipos.length > 0 ? ipos : mockIpoList;
    const items: { id: string; ipo: IpoItem; title: string; detail: string; tag: string; icon: 'trending' | 'sparkles' | 'clock' }[] = [];

    // 1. Ongoing live issues (Bidding active)
    const liveIpos = list.filter(i => i.status === 'live');
    liveIpos.forEach(i => {
      items.push({
        id: `live-${i.id}`,
        ipo: i,
        title: `${i.name}:`,
        detail: `Bidding Active (Closes ${i.closeDate}) • GMP +₹${i.gmp.gmpPrice} (+${i.gmp.gmpPercent}%)`,
        tag: 'LIVE BIDDING',
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
          title: `${i.name}:`,
          detail: `GMP surges to +₹${i.gmp.gmpPrice} (+${i.gmp.gmpPercent}%) • Est. Listing ₹${i.gmp.estimatedListingPrice}`,
          tag: 'TOP GMP',
          icon: 'sparkles'
        });
      }
    });

    // 3. Allotment / Closed issues
    const closedIpos = list.filter(i => i.status === 'closed' || i.status === 'listed').slice(0, 3);
    closedIpos.forEach(i => {
      if (!items.some(it => it.ipo.id === i.id)) {
        items.push({
          id: `allot-${i.id}`,
          ipo: i,
          title: `${i.name}:`,
          detail: `Allotment ${i.allotmentDate} • Registrar: ${i.registrar}`,
          tag: 'ALLOTMENT',
          icon: 'clock'
        });
      }
    });

    return items;
  }, [ipos]);

  if (!visible || tickerItems.length === 0) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white text-xs font-medium py-1.5 px-4 shadow-sm flex items-center justify-between select-none">
      <div className="flex items-center gap-2 shrink-0 z-10 mr-3">
        <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
          <Megaphone className="w-3 h-3 text-amber-300 animate-bounce" />
          <span>{isLive ? 'Real-Time Feed' : 'Live Updates'}</span>
        </span>
      </div>

      <div className="overflow-hidden whitespace-nowrap flex-1 relative mask-linear">
        <div className="animate-marquee flex items-center gap-8">
          {/* Render twice for seamless continuous infinite marquee loop */}
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div 
              key={`${item.id}-${idx}`} 
              onClick={() => onSelectIpo && onSelectIpo(item.ipo)}
              className="inline-flex items-center gap-2 cursor-pointer hover:underline hover:text-amber-200 transition-colors"
            >
              {item.icon === 'trending' ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              ) : item.icon === 'sparkles' ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              )}
              <span>
                <strong>{item.title}</strong> {item.detail}
              </span>
              <span className="text-white/30 ml-4">•</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setVisible(false)}
        className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors shrink-0 z-10 cursor-pointer"
        title="Dismiss marquee"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
