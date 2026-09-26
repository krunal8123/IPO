import React, { useState, useEffect, useMemo } from 'react';
import { IpoItem } from '../../types/ipo';

interface CompanyLogoProps {
  ipo?: IpoItem;
  logo?: string;
  name?: string;
  symbol?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Dynamically generate fallback domains by algorithmically stripping corporate noise (no hardcoded lists)
function getDynamicDomainCandidates(rawLogoUrl: string, companyName: string, sym?: string): string[] {
  const candidates: string[] = [];

  // 1. If rawLogo is a Google Favicon URL, extract the domain parameter
  if (rawLogoUrl && rawLogoUrl.includes('domain=')) {
    const match = rawLogoUrl.match(/domain=([^&]+)/);
    if (match && match[1]) {
      const dom = match[1].toLowerCase().trim();
      const base = dom.replace(/\.(com|in|co\.in|org|net|io|ai)$/i, '');

      // Dynamically strip legal/corporate suffixes that often cause 404s
      const cleanBase = base
        .replace(/(indialimited|consultingserviceslimited|technologieslimited|industrieslimited|solutionslimited|holdingslimited|enterpriseslimited|serviceslimited|limited|pvt|ltd|india|technologies|solutions|infrastructure|logistics|consulting|services|industries|holdings|enterprises|international|corp|group)/gi, '')
        .trim();

      if (cleanBase && cleanBase !== base) {
        candidates.push(`${cleanBase}.com`);
        candidates.push(`${cleanBase}.in`);
        candidates.push(`${cleanBase}group.com`);
      }
    }
  }

  // 2. Dynamically derive from company name
  if (companyName) {
    const cleanWords = companyName
      .toLowerCase()
      .replace(/limited|pvt|ltd|india|ipo|\(.*?\)/gi, '')
      .trim()
      .replace(/[^a-z0-9]/g, '');

    if (cleanWords && !candidates.includes(`${cleanWords}.com`)) {
      candidates.push(`${cleanWords}.com`);
      candidates.push(`${cleanWords}.in`);
    }
  }

  // 3. From symbol if available
  if (sym) {
    const cleanSym = sym.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanSym && !candidates.includes(`${cleanSym}.com`)) {
      candidates.push(`${cleanSym}.com`);
    }
  }

  return candidates;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  ipo,
  logo: directLogo,
  name: directName,
  symbol: directSymbol,
  size = 'md',
  className = ''
}) => {
  // Bind logo dynamically from API response
  const rawLogo = directLogo || ipo?.logo || ipo?.logo_url || (ipo as any)?.logoUrl || (ipo as any)?.company_logo || (ipo as any)?.icon_url || '';
  const name = directName || ipo?.name || '';
  const symbol = directSymbol || ipo?.symbol || '';
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    setErrorCount(0);
  }, [rawLogo, name, symbol]);

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

  // Dynamic fallback candidate URLs
  const dynamicCandidates = useMemo(() => {
    return getDynamicDomainCandidates(rawLogo, name, symbol);
  }, [rawLogo, name, symbol]);

  // Determine active image source dynamically:
  // - errorCount 0: Always use the exact logo coming from API response!
  // - errorCount 1: If API logo fails, try dynamically cleaned Google Favicon
  // - errorCount 2: Try next dynamic candidate or unavatar
  // - errorCount >= 3: Fall back to styled gradient initials
  let activeImgSrc: string | null = null;
  if (errorCount === 0) {
    if (rawLogo && rawLogo.trim().length > 0) {
      activeImgSrc = rawLogo.trim();
    } else if (dynamicCandidates.length > 0) {
      activeImgSrc = `https://www.google.com/s2/favicons?domain=${dynamicCandidates[0]}&sz=128`;
    }
  } else if (errorCount === 1) {
    if (dynamicCandidates.length > 0) {
      activeImgSrc = `https://www.google.com/s2/favicons?domain=${dynamicCandidates[0]}&sz=128`;
    }
  } else if (errorCount === 2) {
    if (dynamicCandidates.length > 1) {
      activeImgSrc = `https://www.google.com/s2/favicons?domain=${dynamicCandidates[1]}&sz=128`;
    } else if (dynamicCandidates.length > 0) {
      activeImgSrc = `https://unavatar.io/${dynamicCandidates[0]}?fallback=false`;
    }
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1 select-none ${className}`}
    >
      {activeImgSrc && errorCount < 3 ? (
        <img
          src={activeImgSrc}
          alt={name}
          onError={() => setErrorCount(prev => prev + 1)}
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
