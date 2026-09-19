import React, { createContext, useContext, useEffect, useState } from 'react';
import { PanCard } from '../types/ipo';

interface PanContextType {
  pans: PanCard[];
  addPan: (pan: Omit<PanCard, 'id'>) => void;
  removePan: (id: string) => void;
  updatePan: (id: string, updates: Partial<Omit<PanCard, 'id'>>) => void;
}

const PanContext = createContext<PanContextType | undefined>(undefined);

const STORAGE_KEY = 'ipo_pan_cards';

export const PanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pans, setPans] = useState<PanCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pans));
    } catch {
      // ignore storage errors
    }
  }, [pans]);

  const addPan = (pan: Omit<PanCard, 'id'>) => {
    const id = `pan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setPans(prev => [...prev, { ...pan, id, pan: pan.pan.toUpperCase().trim() }]);
  };

  const removePan = (id: string) => {
    setPans(prev => prev.filter(p => p.id !== id));
  };

  const updatePan = (id: string, updates: Partial<Omit<PanCard, 'id'>>) => {
    setPans(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...updates, pan: updates.pan ? updates.pan.toUpperCase().trim() : p.pan }
          : p
      )
    );
  };

  return (
    <PanContext.Provider value={{ pans, addPan, removePan, updatePan }}>
      {children}
    </PanContext.Provider>
  );
};

export const usePan = () => {
  const context = useContext(PanContext);
  if (!context) throw new Error('usePan must be used within PanProvider');
  return context;
};
