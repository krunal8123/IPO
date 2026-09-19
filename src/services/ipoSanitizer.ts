import { IpoItem, IpoStatus } from '../types/ipo';

export function parseDateBoundary(dateStr?: string, defaultHour: number = 0, defaultMin: number = 0): Date | null {
  if (!dateStr || dateStr === 'Active' || dateStr.includes('T+') || dateStr === 'N/A') return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  d.setHours(defaultHour, defaultMin, 0, 0);
  return d;
}

export function evaluateIpoStatus(
  openStr?: string,
  closeStr?: string,
  listingStr?: string,
  dailyEndTime?: string,
  rawStatus?: string
): { status: IpoStatus; badge: string } {
  const now = new Date();
  const openDate = parseDateBoundary(openStr, 10, 0);

  let closeH = 17, closeM = 0;
  if (dailyEndTime) {
    const parts = dailyEndTime.split(':').map(Number);
    if (!isNaN(parts[0])) closeH = parts[0];
    if (!isNaN(parts[1])) closeM = parts[1];
  }
  const closeDate = parseDateBoundary(closeStr, closeH, closeM);
  const listingDate = parseDateBoundary(listingStr, 10, 0);

  if (listingDate && now >= listingDate) {
    return { status: 'listed', badge: 'Listed' };
  }
  if (closeDate && now > closeDate) {
    return { status: 'closed', badge: 'Closed / Allotment' };
  }
  if (openDate && closeDate && now >= openDate && now <= closeDate) {
    return { status: 'live', badge: 'Bidding Live' };
  }
  if (openDate && now < openDate) {
    return { status: 'upcoming', badge: 'Upcoming' };
  }

  const fallback = (rawStatus === 'open' || rawStatus === 'live') ? 'live' : rawStatus === 'upcoming' ? 'upcoming' : 'closed';
  return {
    status: fallback as IpoStatus,
    badge: fallback === 'live' ? 'Bidding Live' : fallback === 'upcoming' ? 'Upcoming' : 'Closed'
  };
}

export function sanitizeIpoData(ipo: IpoItem): IpoItem {
  if (!ipo) return ipo;
  const isSme = ipo.category === 'sme';
  const price = ipo.priceBandMax || ipo.cutOffPrice || ipo.priceBandMin || 100;
  let lot = ipo.lotSize;

  if (!isSme && price > 0) {
    const maxAllowedLot = Math.max(1, Math.floor(15000 / price));
    if (!lot || lot <= 0 || (lot * price > 15000)) {
      lot = maxAllowedLot;
    }
  }

  const minInvestment = lot * price;
  const minQty = (!isSme && ipo.minimumQuantity && ipo.minimumQuantity * price > 15000)
    ? lot
    : (ipo.minimumQuantity || lot);

  const { status, badge } = evaluateIpoStatus(
    ipo.openDate,
    ipo.closeDate,
    ipo.listingDate,
    ipo.dailyEndTime,
    ipo.status
  );

  return {
    ...ipo,
    lotSize: lot,
    minInvestment,
    minimumQuantity: minQty,
    status,
    badge
  };
}
