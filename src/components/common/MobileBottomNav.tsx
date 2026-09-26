import React from 'react';
import { Layers, Flame, BarChart3, CheckCircle2, Calendar, Coins, Target, GitCompare } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'ipos', label: 'IPOs', icon: Layers },
    { id: 'gmp', label: 'GMP', icon: Flame, badge: 'Live' },
    { id: 'subscription', label: 'Bids', icon: BarChart3 },
    { id: 'allotment', label: 'Allotment', icon: CheckCircle2 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Odds', icon: Target },
    { id: 'compare', label: 'Compare', icon: GitCompare }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between h-14 px-1 overflow-x-auto no-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 min-w-[46px] py-1 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm shadow-indigo-500/50" />
              )}
              <div className="relative mt-1">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[1.8px]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight ${isActive ? 'font-black' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
