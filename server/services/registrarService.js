import { findKfinIssue, queryKfintechAllotment } from './kfintechService.js';
import { findMufgIssue, queryMufgAllotment } from './mufgService.js';

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

export async function checkRegistrarAllotment(ipo, queryType = 'pan', queryValue = '') {
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

  // 4. Check if the IPO is managed by MUFG / Link Intime
  let mufgClientId = ipo?.mufgClientId;
  const isMufgRegistrar = (registrar || '').toLowerCase().includes('mufg') || 
                          (registrar || '').toLowerCase().includes('link intime') || 
                          (registrar || '').toLowerCase().includes('linkintime');

  if (!mufgClientId) {
    const matchedMufg = await findMufgIssue(ipoName, ipo?.symbol);
    if (matchedMufg) {
      mufgClientId = matchedMufg.clientId;
    }
  }

  if (mufgClientId || (isMufgRegistrar && mufgClientId)) {
    console.log(`[RegistrarService] Executing real-time MUFG Intime query for ${ipoName} (clientId: ${mufgClientId})`);
    const mufgResult = await queryMufgAllotment({
      clientId: mufgClientId,
      queryType,
      queryValue: query,
      ipoName,
      lotSize: ipo?.lotSize,
      priceBandMax: ipo?.priceBandMax
    });
    return mufgResult;
  }

  // 5. Check if the IPO is managed by KFintech (or matched to a KFintech issue)
  let kfinClientId = ipo?.kfinClientId;
  const isKfinRegistrar = (registrar || '').toLowerCase().includes('kfin') || (registrar || '').toLowerCase().includes('karvy');

  if (!kfinClientId) {
    const matchedKfin = await findKfinIssue(ipoName, ipo?.symbol);
    if (matchedKfin) {
      kfinClientId = matchedKfin.clientId;
    }
  }

  if (kfinClientId || isKfinRegistrar) {
    if (kfinClientId) {
      console.log(`[RegistrarService] Executing real-time KFintech query for ${ipoName} (clientId: ${kfinClientId})`);
      const kfinResult = await queryKfintechAllotment({
        clientId: kfinClientId,
        queryType,
        queryValue: query,
        ipoName,
        lotSize: ipo?.lotSize,
        priceBandMax: ipo?.priceBandMax
      });
      return kfinResult;
    }
  }

  // 6. Other Registrars (Bigshare, Skyline, Cameo, etc.)
  // Official SEBI portals require visual CAPTCHA verification to prevent automated scraping
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
    message: `${registrar} requires visual image CAPTCHA authentication on their official portal to view individual allotment results. Please click the button below to verify your PAN directly on ${registrar}.`,
    registrar,
    finalizedDate: ipo?.allotmentDate,
    registrarPortalUrl: regUrl
  };
}
