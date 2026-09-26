import React, { createContext, useContext, useEffect, useState } from 'react';

interface WatchlistContextType {
  watchlist: string[]; // array of ipo ids
  toggleWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
  clearWatchlist: () => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ipo_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ipo_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (id: string) => {
    setWatchlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const clearWatchlist = () => {
    setWatchlist([]);
    try {
      localStorage.removeItem('ipo_watchlist');
    } catch {
      // ignore
    }
  };

  const isInWatchlist = (id: string) => watchlist.includes(id);

  return (
    <WatchlistContext.Provider value={{ watchlist, toggleWatchlist, isInWatchlist, clearWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlist must be used within WatchlistProvider');
  return context;
};
