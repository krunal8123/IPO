import React, { createContext, useContext, useEffect, useState } from 'react';
import { FamilyBid, FamilyPnlEntry } from '../types/ipo';

interface FamilyBiddingContextType {
  bids: FamilyBid[];
  pnlEntries: FamilyPnlEntry[];
  addBid: (bid: Omit<FamilyBid, 'id' | 'appliedAt'>) => void;
  updateBid: (id: string, updates: Partial<Omit<FamilyBid, 'id'>>) => void;
  removeBid: (id: string) => void;
  addPnlEntry: (entry: Omit<FamilyPnlEntry, 'id'>) => void;
  updatePnlEntry: (id: string, updates: Partial<Omit<FamilyPnlEntry, 'id'>>) => void;
  removePnlEntry: (id: string) => void;
}

const FamilyBiddingContext = createContext<FamilyBiddingContextType | undefined>(undefined);

const BIDS_KEY = 'ipo_family_bids';
const PNL_KEY = 'ipo_family_pnl';

function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const FamilyBiddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bids, setBids] = useState<FamilyBid[]>(() => {
    try {
      const s = localStorage.getItem(BIDS_KEY);
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  const [pnlEntries, setPnlEntries] = useState<FamilyPnlEntry[]>(() => {
    try {
      const s = localStorage.getItem(PNL_KEY);
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(BIDS_KEY, JSON.stringify(bids)); } catch { /* ignore */ }
  }, [bids]);

  useEffect(() => {
    try { localStorage.setItem(PNL_KEY, JSON.stringify(pnlEntries)); } catch { /* ignore */ }
  }, [pnlEntries]);

  const addBid = (bid: Omit<FamilyBid, 'id' | 'appliedAt'>) => {
    setBids(prev => [...prev, { ...bid, id: genId('bid'), appliedAt: new Date().toISOString() }]);
  };

  const updateBid = (id: string, updates: Partial<Omit<FamilyBid, 'id'>>) => {
    setBids(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBid = (id: string) => {
    setBids(prev => prev.filter(b => b.id !== id));
  };

  const addPnlEntry = (entry: Omit<FamilyPnlEntry, 'id'>) => {
    setPnlEntries(prev => [...prev, { ...entry, id: genId('pnl') }]);
  };

  const updatePnlEntry = (id: string, updates: Partial<Omit<FamilyPnlEntry, 'id'>>) => {
    setPnlEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const removePnlEntry = (id: string) => {
    setPnlEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <FamilyBiddingContext.Provider value={{
      bids, pnlEntries,
      addBid, updateBid, removeBid,
      addPnlEntry, updatePnlEntry, removePnlEntry,
    }}>
      {children}
    </FamilyBiddingContext.Provider>
  );
};

export const useFamilyBidding = () => {
  const ctx = useContext(FamilyBiddingContext);
  if (!ctx) throw new Error('useFamilyBidding must be used within FamilyBiddingProvider');
  return ctx;
};
