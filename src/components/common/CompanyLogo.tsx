import React, { useState } from 'react';

interface CompanyLogoProps {
  logo?: string;
  name: string;
  symbol?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  logo,
  name,
  symbol,
  size = 'md',
  className = ''
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-9 h-9 rounded-xl text-xs',
    md: 'w-12 h-12 rounded-2xl text-sm',
    lg: 'w-14 h-14 rounded-2xl text-base',
    xl: 'w-16 h-16 rounded-3xl text-lg'
  };

  const cleanName = (name || '').replace(/Limited|Pvt|Ltd|India|IPO|\(.*?\)/gi, '').trim();
  const initials = symbol 
    ? symbol.slice(0, 2).toUpperCase()
    : cleanName.split(/\s+/).length >= 2
    ? (cleanName.split(/\s+/)[0][0] + cleanName.split(/\s+/)[1][0]).toUpperCase()
    : (cleanName.slice(0, 2) || 'IP').toUpperCase();

  const colors = [
    'from-blue-600 to-indigo-600',
    'from-emerald-600 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-purple-600 to-pink-600',
    'from-indigo-500 to-cyan-600'
  ];
  const charCodeSum = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const gradient = colors[charCodeSum % colors.length];

  const hasImage = Boolean(logo && !hasError && (logo.startsWith('http') || logo.startsWith('data:image')));

  return (
    <div 
      className={`${sizeClasses[size]} bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1 select-none ${className}`}
    >
      {hasImage ? (
        <img
          src={logo}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-contain rounded-lg"
          loading="lazy"
        />
      ) : (
        <div className={`w-full h-full rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black tracking-wider shadow-inner`}>
          {initials}
        </div>
      )}
    </div>
  );
};
