import React, { useMemo, useState } from 'react';
import { IpoItem, FamilyBid, FamilyPnlEntry, BrokerName, MandateStatus } from '../../types/ipo';
import { useFamilyBidding } from '../../context/FamilyBiddingContext';
import { usePan } from '../../context/PanContext';
import {
  Users, Plus, Trash2, Edit3, CheckCircle2, Clock, RefreshCw,
  DollarSign, BarChart3, Wallet, AlertCircle, ChevronDown, Check,
  X, TrendingUp, TrendingDown, PieChart, IndianRupee, Award
} from 'lucide-react';

interface FamilyBiddingHubProps {
  ipos: IpoItem[];
  onSelectIpo?: (ipo: IpoItem) => void;
}

const BROKERS: BrokerName[] = ['Zerodha', 'Groww', 'Upstox', 'Angel One', 'Dhan', 'HDFC Securities', 'ICICI Direct', 'SBI Securities', 'Other'];
const MANDATE_STATUSES: MandateStatus[] = ['Pending', 'Requested', 'Authorized', 'Blocked', 'Released'];

const MANDATE_CONFIG: Record<MandateStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  'Pending': { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', icon: <Clock className="w-3 h-3" /> },
  'Requested': { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/40', icon: <RefreshCw className="w-3 h-3" /> },
  'Authorized': { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950/40', icon: <CheckCircle2 className="w-3 h-3" /> },
  'Blocked': { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-950/40', icon: <AlertCircle className="w-3 h-3" /> },
  'Released': { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/40', icon: <Check className="w-3 h-3" /> },
};

function maskPan(pan: string) {
  if (!pan || pan.length < 5) return pan;
  return pan.slice(0, 2) + '***' + pan.slice(-2);
}

function getCurrentFiscalYear() {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-${String(year + 1).slice(-2)}`;
}

interface AddBidFormProps {
  ipos: IpoItem[];
  onClose: () => void;
}

const AddBidForm: React.FC<AddBidFormProps> = ({ ipos, onClose }) => {
  const { pans } = usePan();
  const { addBid } = useFamilyBidding();

  const [form, setForm] = useState({
    panId: pans[0]?.id || '',
    ipoId: ipos.find(i => i.status === 'live' || i.status === 'upcoming')?.id || ipos[0]?.id || '',
    broker: 'Zerodha' as BrokerName,
    lotsApplied: 1,
    category: 'Retail' as FamilyBid['category'],
    mandateStatus: 'Pending' as MandateStatus,
    applicationNo: '',
    upiRefNo: '',
  });

  const selectedIpo = ipos.find(i => i.id === form.ipoId);
  const selectedPan = pans.find(p => p.id === form.panId);
  const capitalBlocked = selectedIpo ? form.lotsApplied * selectedIpo.lotSize * selectedIpo.priceBandMax : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPan || !selectedIpo) return;
    addBid({
      panId: form.panId,
      panNumber: selectedPan.pan,
      applicantName: selectedPan.name || selectedPan.pan,
      nickname: selectedPan.nickname,
      ipoId: form.ipoId,
      ipoName: selectedIpo.name,
      broker: form.broker,
      lotsApplied: form.lotsApplied,
      priceApplied: selectedIpo.priceBandMax,
      capitalBlocked,
      mandateStatus: form.mandateStatus,
      applicationNo: form.applicationNo || undefined,
      upiRefNo: form.upiRefNo || undefined,
      category: form.category,
    });
    onClose();
  };

  const set = (k: keyof typeof form, v: string | number) => setForm(prev => ({ ...prev, [k]: v }));

  const inputClass = "w-full px-3 py-2 text-sm rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50";
  const selectClass = inputClass + " appearance-none cursor-pointer";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Applicant (PAN)</label>
          <select className={selectClass} value={form.panId} onChange={e => set('panId', e.target.value)} required>
            {pans.length === 0 && <option value="">No PANs saved – add in Allotment tab</option>}
            {pans.map(p => <option key={p.id} value={p.id}>{p.nickname || p.name || maskPan(p.pan)} ({maskPan(p.pan)})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">IPO</label>
          <select className={selectClass} value={form.ipoId} onChange={e => set('ipoId', e.target.value)} required>
            {ipos.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Broker</label>
          <select className={selectClass} value={form.broker} onChange={e => set('broker', e.target.value as BrokerName)}>
            {BROKERS.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Category</label>
          <select className={selectClass} value={form.category} onChange={e => set('category', e.target.value as FamilyBid['category'])}>
            <option value="Retail">Retail</option>
            <option value="sHNI">sHNI (Small – ₹2L–₹10L)</option>
            <option value="bHNI">bHNI (Big – &gt;₹10L)</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Lots Applied</label>
          <input type="number" className={inputClass} min={1} max={500} value={form.lotsApplied} onChange={e => set('lotsApplied', Number(e.target.value))} required />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Mandate Status</label>
          <select className={selectClass} value={form.mandateStatus} onChange={e => set('mandateStatus', e.target.value as MandateStatus)}>
            {MANDATE_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Application No. (optional)</label>
          <input type="text" className={inputClass} placeholder="e.g. 1234567890" value={form.applicationNo} onChange={e => set('applicationNo', e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">UPI Ref No. (optional)</label>
          <input type="text" className={inputClass} placeholder="e.g. 501234567890" value={form.upiRefNo} onChange={e => set('upiRefNo', e.target.value)} />
        </div>
      </div>

      {selectedIpo && (
        <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-3 text-xs border border-indigo-200/60 dark:border-indigo-800/40">
          <span className="font-bold text-indigo-700 dark:text-indigo-300">Capital to Block: </span>
          <span className="font-black text-slate-900 dark:text-white">₹{capitalBlocked.toLocaleString('en-IN')}</span>
          <span className="text-slate-500 dark:text-slate-400 ml-2">({form.lotsApplied} lots × {selectedIpo.lotSize} shares × ₹{selectedIpo.priceBandMax})</span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={pans.length === 0} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-sm font-black text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Add Bid
        </button>
      </div>
    </form>
  );
};

interface AddPnlFormProps {
  ipos: IpoItem[];
  onClose: () => void;
}

const AddPnlForm: React.FC<AddPnlFormProps> = ({ ipos, onClose }) => {
  const { pans } = usePan();
  const { addPnlEntry } = useFamilyBidding();

  const [form, setForm] = useState({
    panId: pans[0]?.id || '',
    ipoId: ipos[0]?.id || '',
    lotsApplied: 1,
    lotsAllotted: 0,
    applicationPrice: 0,
    listingPrice: 0,
    broker: 'Zerodha' as BrokerName,
    status: 'Allotted' as FamilyPnlEntry['status'],
    appliedDate: '',
    listingDate: '',
  });

  const selectedIpo = ipos.find(i => i.id === form.ipoId);
  const selectedPan = pans.find(p => p.id === form.panId);
  const capitalInvested = form.lotsAllotted * (selectedIpo?.lotSize || 0) * form.applicationPrice;
  const sharesAllotted = form.lotsAllotted * (selectedIpo?.lotSize || 0);
  const listingDayProfit = sharesAllotted * (form.listingPrice - form.applicationPrice);
  const refundReceived = (form.lotsApplied - form.lotsAllotted) * (selectedIpo?.lotSize || 0) * form.applicationPrice;

  const set = (k: keyof typeof form, v: string | number) => setForm(prev => ({ ...prev, [k]: v }));
  const inputClass = "w-full px-3 py-2 text-sm rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPan || !selectedIpo) return;
    addPnlEntry({
      panId: form.panId,
      panNumber: selectedPan.pan,
      applicantName: selectedPan.name || selectedPan.pan,
      nickname: selectedPan.nickname,
      ipoId: form.ipoId,
      ipoName: selectedIpo.name,
      ipoSymbol: selectedIpo.symbol,
      appliedDate: form.appliedDate,
      listingDate: form.listingDate,
      lotsApplied: form.lotsApplied,
      lotsAllotted: form.lotsAllotted,
      applicationPrice: form.applicationPrice,
      listingPrice: form.listingPrice,
      capitalInvested,
      refundReceived,
      listingDayProfit,
      status: form.status,
      broker: form.broker,
      fiscalYear: getCurrentFiscalYear(),
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Applicant (PAN)</label>
          <select className={inputClass + " appearance-none cursor-pointer"} value={form.panId} onChange={e => set('panId', e.target.value)} required>
            {pans.map(p => <option key={p.id} value={p.id}>{p.nickname || p.name || maskPan(p.pan)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">IPO</label>
          <select className={inputClass + " appearance-none cursor-pointer"} value={form.ipoId} onChange={e => set('ipoId', e.target.value)} required>
            {ipos.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Lots Applied</label>
          <input type="number" className={inputClass} min={0} value={form.lotsApplied} onChange={e => set('lotsApplied', Number(e.target.value))} required />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Lots Allotted</label>
          <input type="number" className={inputClass} min={0} value={form.lotsAllotted} onChange={e => set('lotsAllotted', Number(e.target.value))} required />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Application Price (₹)</label>
          <input type="number" className={inputClass} min={0} value={form.applicationPrice} onChange={e => set('applicationPrice', Number(e.target.value))} required />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Listing Price (₹)</label>
          <input type="number" className={inputClass} min={0} value={form.listingPrice} onChange={e => set('listingPrice', Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Broker</label>
          <select className={inputClass + " appearance-none cursor-pointer"} value={form.broker} onChange={e => set('broker', e.target.value as BrokerName)}>
            {BROKERS.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Status</label>
          <select className={inputClass + " appearance-none cursor-pointer"} value={form.status} onChange={e => set('status', e.target.value as FamilyPnlEntry['status'])}>
            <option value="Allotted">Allotted</option>
            <option value="Not Allotted">Not Allotted</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Applied Date</label>
          <input type="date" className={inputClass} value={form.appliedDate} onChange={e => set('appliedDate', e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Listing Date</label>
          <input type="date" className={inputClass} value={form.listingDate} onChange={e => set('listingDate', e.target.value)} />
        </div>
      </div>

      {form.lotsAllotted > 0 && form.applicationPrice > 0 && form.listingPrice > 0 && (
        <div className={`rounded-xl p-3 text-xs border ${listingDayProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/30' : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-800/30'}`}>
          <span className="font-bold">Listing Day P&L: </span>
          <span className={`font-black text-base ${listingDayProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {listingDayProfit >= 0 ? '+' : ''}₹{Math.round(listingDayProfit).toLocaleString('en-IN')}
          </span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-sm font-black text-white hover:bg-emerald-700 transition-colors">Add P&L Entry</button>
      </div>
    </form>
  );
};

export const FamilyBiddingHub: React.FC<FamilyBiddingHubProps> = ({ ipos }) => {
  const { bids, pnlEntries, updateBid, removeBid, removePnlEntry } = useFamilyBidding();
  const { pans } = usePan();
  const [activeSubTab, setActiveSubTab] = useState<'bids' | 'pnl'>('bids');
  const [showAddBidForm, setShowAddBidForm] = useState(false);
  const [showAddPnlForm, setShowAddPnlForm] = useState(false);

  // P&L Summary
  const pnlSummary = useMemo(() => {
    const totalInvested = pnlEntries.reduce((s, e) => s + e.capitalInvested, 0);
    const totalProfit = pnlEntries.reduce((s, e) => s + e.listingDayProfit, 0);
    const totalApplied = pnlEntries.length;
    const allotted = pnlEntries.filter(e => e.status === 'Allotted').length;
    const allotmentRate = totalApplied > 0 ? (allotted / totalApplied) * 100 : 0;
    return { totalInvested, totalProfit, totalApplied, allotted, allotmentRate };
  }, [pnlEntries]);

  // Bids Summary
  const bidsSummary = useMemo(() => {
    const totalBlocked = bids.reduce((s, b) => s + b.capitalBlocked, 0);
    const authorized = bids.filter(b => b.mandateStatus === 'Authorized' || b.mandateStatus === 'Blocked').length;
    return { totalBlocked, authorized, total: bids.length };
  }, [bids]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-indigo-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Family IPO Bidding Hub
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Track bids and mandates across all family members. Log allotments and build your annual P&L ledger.
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 w-fit">
        {(['bids', 'pnl'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveSubTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === t ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            {t === 'bids' ? `Active Bids (${bids.length})` : `P&L Ledger (${pnlEntries.length})`}
          </button>
        ))}
      </div>

      {/* Active Bids Tab */}
      {activeSubTab === 'bids' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Bids', value: bidsSummary.total, color: 'text-slate-800 dark:text-slate-200' },
              { label: 'Mandates Active', value: bidsSummary.authorized, color: 'text-amber-600 dark:text-amber-400' },
              { label: 'Capital Blocked', value: `₹${(bidsSummary.totalBlocked / 100000).toFixed(1)}L`, color: 'text-rose-600 dark:text-rose-400' },
            ].map(s => (
              <div key={s.label} className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-slate-200 dark:border-slate-800">
                <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Add Bid */}
          {!showAddBidForm ? (
            <button
              onClick={() => setShowAddBidForm(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Bid
            </button>
          ) : (
            <div className="glass-card rounded-3xl p-5 border border-indigo-200/60 dark:border-indigo-800/40">
              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4">New Bid Entry</h4>
              <AddBidForm ipos={ipos} onClose={() => setShowAddBidForm(false)} />
            </div>
          )}

          {/* Bids List */}
          {bids.length > 0 ? (
            <div className="space-y-3">
              {bids.map(bid => {
                const mc = MANDATE_CONFIG[bid.mandateStatus];
                return (
                  <div key={bid.id} className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-black text-slate-900 dark:text-white">{bid.applicantName}</span>
                          {bid.nickname && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold">{bid.nickname}</span>}
                          <span className={`flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded ${mc.bg} ${mc.color}`}>
                            {mc.icon}
                            {bid.mandateStatus}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{bid.ipoName}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                          <span>{maskPan(bid.panNumber)}</span>
                          <span>•</span>
                          <span>{bid.broker}</span>
                          <span>•</span>
                          <span>{bid.lotsApplied} lots × ₹{bid.priceApplied}</span>
                          <span>•</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">₹{bid.capitalBlocked.toLocaleString('en-IN')} blocked</span>
                        </div>
                        {bid.applicationNo && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">App No: {bid.applicationNo}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Quick mandate update */}
                        <select
                          value={bid.mandateStatus}
                          onChange={e => updateBid(bid.id, { mandateStatus: e.target.value as MandateStatus })}
                          className="text-[10px] rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-1 text-slate-700 dark:text-slate-300 cursor-pointer"
                          title="Update mandate status"
                        >
                          {MANDATE_STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <button
                          onClick={() => removeBid(bid.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !showAddBidForm && (
              <div className="text-center py-12 text-slate-400 text-sm">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No bids tracked yet. Add your first bid above.</p>
                {pans.length === 0 && <p className="text-xs mt-1 text-amber-500">Tip: Add family PANs in the Allotment tab first.</p>}
              </div>
            )
          )}
        </div>
      )}

      {/* P&L Ledger Tab */}
      {activeSubTab === 'pnl' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total IPOs Applied', value: pnlSummary.totalApplied, color: 'text-slate-800 dark:text-slate-200' },
              { label: 'Allotments', value: `${pnlSummary.allotted}/${pnlSummary.totalApplied}`, color: 'text-indigo-600 dark:text-indigo-400' },
              { label: 'Allotment Rate', value: `${pnlSummary.allotmentRate.toFixed(0)}%`, color: 'text-violet-600 dark:text-violet-400' },
              {
                label: 'Total Listing P&L',
                value: `${pnlSummary.totalProfit >= 0 ? '+' : ''}₹${Math.round(pnlSummary.totalProfit).toLocaleString('en-IN')}`,
                color: pnlSummary.totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
              },
            ].map(s => (
              <div key={s.label} className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-slate-200 dark:border-slate-800">
                <p className={`text-lg sm:text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {!showAddPnlForm ? (
            <button
              onClick={() => setShowAddPnlForm(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Log P&L Entry
            </button>
          ) : (
            <div className="glass-card rounded-3xl p-5 border border-emerald-200/60 dark:border-emerald-800/40">
              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4">New P&L Entry</h4>
              <AddPnlForm ipos={ipos} onClose={() => setShowAddPnlForm(false)} />
            </div>
          )}

          {pnlEntries.length > 0 ? (
            <div className="space-y-3">
              {pnlEntries.map(entry => (
                <div key={entry.id} className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{entry.applicantName}</span>
                        {entry.nickname && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold">{entry.nickname}</span>}
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          entry.status === 'Allotted' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                          : entry.status === 'Not Allotted' ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                        }`}>
                          {entry.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{entry.ipoName}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>{maskPan(entry.panNumber)}</span>
                        <span>•</span>
                        <span>{entry.broker}</span>
                        <span>•</span>
                        <span>{entry.lotsApplied} applied / {entry.lotsAllotted} allotted</span>
                        {entry.listingDate && <><span>•</span><span>Listed: {entry.listingDate}</span></>}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs flex-wrap">
                        <span className="text-slate-600 dark:text-slate-400">Issue: ₹{entry.applicationPrice}</span>
                        {entry.listingPrice > 0 && <span className="text-slate-600 dark:text-slate-400">Listing: ₹{entry.listingPrice}</span>}
                        {entry.listingDayProfit !== 0 && (
                          <span className={`font-black ${entry.listingDayProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {entry.listingDayProfit >= 0 ? '+' : ''}₹{Math.round(entry.listingDayProfit).toLocaleString('en-IN')} P&L
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removePnlEntry(entry.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !showAddPnlForm && (
              <div className="text-center py-12 text-slate-400 text-sm">
                <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No P&L entries yet. Log your IPO results above.</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
