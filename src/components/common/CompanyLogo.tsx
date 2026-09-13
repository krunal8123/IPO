import React, { useState } from 'react';
import { IpoItem } from '../../types/ipo';

interface CompanyLogoProps {
  ipo?: IpoItem;
  logo?: string;
  name?: string;
  symbol?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const getCompanyDomain = (companyName: string, sym?: string): string => {
  const clean = (companyName + ' ' + (sym || '')).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.includes('nse') || clean.includes('nationalstockexchange')) return 'nseindia.com';
  if (clean.includes('veegaland')) return 'veegaland.in';
  if (clean.includes('manika')) return 'manikaplastech.com';
  if (clean.includes('heromotor')) return 'heromotors.com';
  if (clean.includes('jindal')) return 'jindalsupreme.com';
  if (clean.includes('rentomojo')) return 'rentomojo.com';
  if (clean.includes('steamhouse')) return 'steamhouse.in';
  if (clean.includes('swiggy')) return 'swiggy.com';
  if (clean.includes('hyundai')) return 'hyundai.com';
  if (clean.includes('waaree')) return 'waaree.com';
  if (clean.includes('ntpc')) return 'ntpcgreen.com';
  if (clean.includes('afcons')) return 'afcons.com';
  if (clean.includes('tata')) return 'tatacapital.com';
  if (clean.includes('arcil') || clean.includes('assetreconstruction')) return 'arcil.co.in';
  if (clean.includes('ssretail') || clean.includes('ssmobile')) return 'ssmobile.com';
  if (clean.includes('glasswall')) return 'glasswallsystems.in';
  if (clean.includes('kanohar')) return 'kanohar.com';
  if (clean.includes('prasol')) return 'prasolchem.com';
  if (clean.includes('amtech')) return 'amtechesters.com';
  if (clean.includes('infrax')) return 'infrax.in';
  if (clean.includes('karamtara')) return 'karamtara.com';
  if (clean.includes('lccproject')) return 'lccprojects.com';
  if (clean.includes('manipal')) return 'manipalgroup.info';
  if (clean.includes('vinod')) return 'vinodtexworld.com';
  if (clean.includes('quanto')) return 'quantoagroworld.com';
  if (clean.includes('shakti')) return 'shaktipolytarp.com';
  if (clean.includes('vama')) return 'vamawovenfab.com';
  if (clean.includes('maharaja')) return 'maharajaspeedex.com';
  if (clean.includes('omgalaxy')) return 'omgalaxy.in';
  if (clean.includes('raksan')) return 'raksantransformers.com';
  if (clean.includes('century')) return 'centurybusinessmedia.com';
  if (clean.includes('injecto')) return 'injecto.in';
  if (clean.includes('apana')) return 'apanalogistics.com';
  if (clean.includes('pranav')) return 'pranavconstructions.com';
  if (clean.includes('sonaselection')) return 'sonaselection.com';
  if (clean.includes('kheria')) return 'kheriaautocomp.com';
  if (clean.includes('spectra')) return 'spectratechnology.com';
  if (clean.includes('axiom')) return 'axiomgas.com';
  if (clean.includes('aonesteel')) return 'aonesteels.com';
  if (clean.includes('parle')) return 'parleproducts.com';
  if (clean.includes('jio')) return 'jio.com';
  if (clean.includes('flipkart')) return 'flipkart.com';
  if (clean.includes('sbi')) return 'sbimf.com';

  const rawClean = companyName.toLowerCase().replace(/limited|pvt|ltd|india|ipo|\(.*?\)/gi, '').replace(/[^a-z0-9]/g, '');
  return `${rawClean}.com`;
};

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  ipo,
  logo: directLogo,
  name: directName,
  symbol: directSymbol,
  size = 'md',
  className = ''
}) => {
  const logo = directLogo || ipo?.logo_url || (ipo as any)?.logo;
  const name = directName || ipo?.name || '';
  const symbol = directSymbol || ipo?.symbol || '';
  const [errorCount, setErrorCount] = useState(0);

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

  // Resolve best logo source:
  // 1. Direct real image URL if provided and not an initials SVG
  // 2. Official Google favicon via resolved company domain
  // 3. Unavatar fallback
  const domain = getCompanyDomain(name, symbol);
  const hasDirectHttpLogo = Boolean(logo && logo.startsWith('http'));

  let activeImgSrc: string | null = null;
  if (errorCount === 0) {
    if (hasDirectHttpLogo) {
      activeImgSrc = logo!;
    } else {
      activeImgSrc = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }
  } else if (errorCount === 1) {
    activeImgSrc = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } else if (errorCount === 2) {
    activeImgSrc = `https://unavatar.io/${domain}?fallback=false`;
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
