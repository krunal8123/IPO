import { findKfinIssue, queryKfintechAllotment } from './kfintechService.js';
import { findMufgIssue, queryMufgAllotment } from './mufgService.js';
import { findBigshareIssue, queryBigshareAllotment } from './bigshareService.js';

export function getRegistrarUrl(registrarName = '') {
  const name = (registrarName || '').toLowerCase();
  if (name.includes('mufg') || name.includes('link intime') || name.includes('linkintime')) {
    return 'https://in.mpms.mufg.com/Initial_Offer/public-issues.html';
  }
  if (name.includes('kfin') || name.includes('karvy')) {
    return 'https://ipostatus.kfintech.com/';
  }
  if (name.includes('bigshare')) {
    return 'https://ipo.bigshareonline.com/';
  }
  if (name.includes('skyline')) {
    return 'https://www.skylinerta.com/ipo.php';
  }
  if (name.includes('cameo')) {
    return 'https://ipo.cameoindia.com/';
  }
  if (name.includes('maashitla')) {
    return 'https://maashitla.com/allotment-status/';
  }
  if (name.includes('purva')) {
    return 'https://www.purvashare.com/queries/';
  }
  return 'https://in.mpms.mufg.com/Initial_Offer/public-issues.html';
}

export async function checkRegistrarAllotment(ipo, queryType = 'pan', queryValue = '', extraOptions = {}) {
  const query = (queryValue || '').trim().toUpperCase();
  const registrar = ipo?.registrar || 'Link Intime India Pvt Ltd';
  const ipoName = ipo?.name || 'IPO Issue';
  const regUrl = getRegistrarUrl(registrar);

  // 1. Status Check: Is the IPO currently upcoming or live?
  if (ipo?.status === 'upcoming') {
    return {
      ipoId: ipo?.id || 'ipo',
      ipoName,
      applicantName: 'N/A',
      pan: queryType === 'pan' ? query : 'N/A',
      applicationNo: queryType === 'appNo' ? query : 'N/A',
      dpId: queryType === 'dpId' ? query : 'N/A',
      sharesApplied: 0,
      sharesAllotted: 0,
      status: 'Under Process',
      refundAmount: 0,
      message: `Allotment has NOT started. Bidding for ${ipoName} opens on ${ipo?.openDate || 'soon'}. Allotment will be declared by ${registrar} on ${ipo?.allotmentDate || 'schedule'}.`,
      registrar,
      finalizedDate: ipo?.allotmentDate,
      registrarPortalUrl: regUrl
    };
  }

  if (ipo?.status === 'live') {
    return {
      ipoId: ipo?.id || 'ipo',
      ipoName,
      applicantName: 'N/A',
      pan: queryType === 'pan' ? query : 'N/A',
      applicationNo: queryType === 'appNo' ? query : 'N/A',
      dpId: queryType === 'dpId' ? query : 'N/A',
      sharesApplied: 0,
      sharesAllotted: 0,
      status: 'Under Process',
      refundAmount: 0,
      message: `Bidding for ${ipoName} is currently LIVE until ${ipo?.closeDate || 'closing cutoff'}. The registrar (${registrar}) will finalize the basis of allotment on ${ipo?.allotmentDate || 'schedule'}. Please check back once declared.`,
      registrar,
      finalizedDate: ipo?.allotmentDate,
      registrarPortalUrl: regUrl
    };
  }

  // 2. Validate PAN format if queryType === 'pan'
  if (queryType === 'pan') {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(query)) {
      return {
        ipoId: ipo?.id || 'ipo',
        ipoName,
        applicantName: 'N/A',
        pan: query,
        applicationNo: 'N/A',
        dpId: 'N/A',
        sharesApplied: 0,
        sharesAllotted: 0,
        status: 'Not Found',
        refundAmount: 0,
        message: `Invalid PAN format: "${query}". A valid Indian PAN contains 5 letters, 4 digits, and 1 letter (e.g. ABCDE1234F).`,
        registrar,
        finalizedDate: ipo?.allotmentDate,
        registrarPortalUrl: regUrl
      };
    }
  }

  // 3. Demo simulation test keys (for testing UI states)
  const isDemoAllotted = query === 'ALLOT1234F' || query === 'WINNR1234A' || query.includes('WIN');
  const isDemoNonAllotted = query === 'NONAL1234F' || query.includes('NONAL') || query.includes('DEMOREG');

  if (isDemoAllotted) {
    const lot = ipo?.lotSize || 100;
    const price = ipo?.priceBandMax || 140;
    return {
      ipoId: ipo?.id || 'ipo',
      ipoName,
      applicantName: 'VERIFIED INVESTOR (ALLOTTEE)',
      pan: queryType === 'pan' ? query : 'N/A',
      applicationNo: `2026${Math.floor(100000 + Math.random() * 900000)}`,
      dpId: `IN300126-${Math.floor(10000000 + Math.random() * 90000000)}`,
      sharesApplied: lot,
      sharesAllotted: lot,
      status: 'Allotted',
      refundAmount: 0,
      message: `Congratulations! Your bid was successfully selected in the registrar basis of allotment. ${lot} shares at ₹${price} have been allocated and will be credited to your demat account prior to listing date (${ipo?.listingDate || 'listing'}).`,
      registrar,
      finalizedDate: ipo?.allotmentDate,
      registrarPortalUrl: regUrl
    };
  }

  if (isDemoNonAllotted) {
    const lot = ipo?.lotSize || 100;
    const price = ipo?.priceBandMax || 140;
    const totalAmount = lot * price;
    return {
      ipoId: ipo?.id || 'ipo',
      ipoName,
      applicantName: 'REGISTERED BIDDER (NON-ALLOTTEE)',
      pan: queryType === 'pan' ? query : 'N/A',
      applicationNo: `2026${Math.floor(100000 + Math.random() * 900000)}`,
      dpId: `IN300126-${Math.floor(10000000 + Math.random() * 90000000)}`,
      sharesApplied: lot,
      sharesAllotted: 0,
      status: 'Not Allotted',
      refundAmount: totalAmount,
      message: `Your application was registered with ${registrar}, but due to heavy oversubscription, it was not selected in the computerized lottery draw. Your blocked bank UPI mandate of ₹${totalAmount.toLocaleString('en-IN')} has been unblocked/refunded.`,
      registrar,
      finalizedDate: ipo?.allotmentDate,
      registrarPortalUrl: regUrl
    };
  }

  // Check explicit registrar flags first
  const isBigshareRegistrar = (registrar || '').toLowerCase().includes('bigshare');
  const isMufgRegistrar = (registrar || '').toLowerCase().includes('mufg') || 
                          (registrar || '').toLowerCase().includes('link intime') || 
                          (registrar || '').toLowerCase().includes('linkintime');
  const isKfinRegistrar = (registrar || '').toLowerCase().includes('kfin') || 
                          (registrar || '').toLowerCase().includes('karvy');

  let bigshareCompanyId = ipo?.bigshareCompanyId || extraOptions?.bigshareCompanyId;
  let mufgClientId = ipo?.mufgClientId;
  let kfinClientId = ipo?.kfinClientId;

  // 4. Branch by explicit registrar affinity
  if (bigshareCompanyId || isBigshareRegistrar) {
    if (!bigshareCompanyId) {
      const matchedBigshare = await findBigshareIssue(ipoName, ipo?.symbol);
      if (matchedBigshare) bigshareCompanyId = matchedBigshare.companyId;
    }
    if (bigshareCompanyId) {
      console.log(`[RegistrarService] Executing Bigshare query for ${ipoName} (companyId: ${bigshareCompanyId}, server: ${extraOptions?.bigshareServerId || 'default'})`);
      return await queryBigshareAllotment({
        companyId: bigshareCompanyId,
        queryType,
        queryValue: query,
        captchaToken: extraOptions?.captchaToken,
        captchaAnswer: extraOptions?.captchaAnswer,
        ipoName,
        lotSize: ipo?.lotSize,
        priceBandMax: ipo?.priceBandMax,
        serverId: extraOptions?.bigshareServerId
      });
    }
  }

  if (mufgClientId || isMufgRegistrar) {
    if (!mufgClientId) {
      const matchedMufg = await findMufgIssue(ipoName, ipo?.symbol);
      if (matchedMufg) mufgClientId = matchedMufg.clientId;
    }
    if (mufgClientId) {
      console.log(`[RegistrarService] Executing real-time MUFG Intime query for ${ipoName} (clientId: ${mufgClientId})`);
      return await queryMufgAllotment({
        clientId: mufgClientId,
        queryType,
        queryValue: query,
        ipoName,
        lotSize: ipo?.lotSize,
        priceBandMax: ipo?.priceBandMax
      });
    }
  }

  if (kfinClientId || isKfinRegistrar) {
    if (!kfinClientId) {
      const matchedKfin = await findKfinIssue(ipoName, ipo?.symbol);
      if (matchedKfin) kfinClientId = matchedKfin.clientId;
    }
    if (kfinClientId) {
      console.log(`[RegistrarService] Executing real-time KFintech query for ${ipoName} (clientId: ${kfinClientId})`);
      return await queryKfintechAllotment({
        clientId: kfinClientId,
        queryType,
        queryValue: query,
        ipoName,
        lotSize: ipo?.lotSize,
        priceBandMax: ipo?.priceBandMax
      });
    }
  }

  // 5. Fallback across registrars if registrar was unspecified
  const [matchedBigshare, matchedMufg, matchedKfin] = await Promise.all([
    findBigshareIssue(ipoName, ipo?.symbol),
    findMufgIssue(ipoName, ipo?.symbol),
    findKfinIssue(ipoName, ipo?.symbol)
  ]);

  if (matchedBigshare) {
    console.log(`[RegistrarService] Discovered Bigshare issue match for ${ipoName} (companyId: ${matchedBigshare.companyId}, server: ${extraOptions?.bigshareServerId || 'default'})`);
    return await queryBigshareAllotment({
      companyId: matchedBigshare.companyId,
      queryType,
      queryValue: query,
      captchaToken: extraOptions?.captchaToken,
      captchaAnswer: extraOptions?.captchaAnswer,
      ipoName,
      lotSize: ipo?.lotSize,
      priceBandMax: ipo?.priceBandMax,
      serverId: extraOptions?.bigshareServerId
    });
  }

  if (matchedMufg) {
    console.log(`[RegistrarService] Discovered MUFG issue match for ${ipoName} (clientId: ${matchedMufg.clientId})`);
    return await queryMufgAllotment({
      clientId: matchedMufg.clientId,
      queryType,
      queryValue: query,
      ipoName,
      lotSize: ipo?.lotSize,
      priceBandMax: ipo?.priceBandMax
    });
  }

  if (matchedKfin) {
    console.log(`[RegistrarService] Discovered KFintech issue match for ${ipoName} (clientId: ${matchedKfin.clientId})`);
    return await queryKfintechAllotment({
      clientId: matchedKfin.clientId,
      queryType,
      queryValue: query,
      ipoName,
      lotSize: ipo?.lotSize,
      priceBandMax: ipo?.priceBandMax
    });
  }

  // 7. Other Registrars (Skyline, Cameo, etc.)
  return {
    ipoId: ipo?.id || 'ipo',
    ipoName,
    applicantName: 'N/A',
    pan: queryType === 'pan' ? query : 'N/A',
    applicationNo: queryType === 'appNo' ? query : 'N/A',
    dpId: queryType === 'dpId' ? query : 'N/A',
    sharesApplied: 0,
    sharesAllotted: 0,
    status: 'Not Found',
    refundAmount: 0,
    message: `${registrar} portal requires verification on their official website. Please click the button below to verify your application directly on ${registrar}.`,
    registrar,
    finalizedDate: ipo?.allotmentDate,
    registrarPortalUrl: regUrl
  };
}
