import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ShieldCheck,
  User,
  Tag,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { PanCard } from '../../types/ipo';
import { usePan } from '../../context/PanContext';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function maskPan(pan: string): string {
  if (pan.length !== 10) return pan;
  return pan.slice(0, 2) + '***' + pan.slice(5, 9) + pan[9];
}

function validatePan(pan: string): string | null {
  const p = pan.toUpperCase().trim();
  if (!p) return 'PAN is required';
  if (p.length !== 10) return 'PAN must be exactly 10 characters';
  if (!PAN_REGEX.test(p)) return 'Invalid PAN format (e.g. ABCDE1234F)';
  return null;
}

interface EditState {
  id: string;
  pan: string;
  name: string;
  nickname: string;
}

interface PanCardManagerProps {
  compact?: boolean; // compact mode for inline display in allotment checker
}

export const PanCardManager: React.FC<PanCardManagerProps> = ({ compact = false }) => {
  const { pans, addPan, removePan, updatePan } = usePan();

  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Add form state
  const [newPan, setNewPan] = useState('');
  const [newName, setNewName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [addError, setAddError] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validatePan(newPan);
    if (err) { setAddError(err); return; }

    // Check duplicate PAN
    const upper = newPan.toUpperCase().trim();
    if (pans.some(p => p.pan === upper)) {
      setAddError('This PAN is already saved');
      return;
    }

    addPan({
      pan: upper,
      name: newName.trim() || undefined,
      nickname: newNickname.trim() || undefined
    });
    setNewPan('');
    setNewName('');
    setNewNickname('');
    setAddError('');
    setShowAddForm(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editState) return;
    const err = validatePan(editState.pan);
    if (err) return;
    updatePan(editState.id, {
      pan: editState.pan,
      name: editState.name.trim() || undefined,
      nickname: editState.nickname.trim() || undefined
    });
    setEditState(null);
  };

  const startEdit = (card: PanCard) => {
    setEditState({ id: card.id, pan: card.pan, name: card.name || '', nickname: card.nickname || '' });
    setDeleteConfirm(null);
  };

  return (
    <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/40 dark:to-purple-950/30 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-indigo-100/30 dark:hover:bg-indigo-900/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
            <CreditCard className="w-4 h-4" />
          </span>
          <div className="text-left">
            <div className="text-sm font-black text-slate-900 dark:text-white">My PAN Cards</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {pans.length === 0
                ? 'No PANs saved — add to auto-check allotment'
                : `${pans.length} PAN${pans.length > 1 ? 's' : ''} saved • Auto-check ready`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pans.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
              {pans.length}
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Body */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2.5">

          {/* PAN Card list */}
          {pans.length > 0 && (
            <div className="space-y-2">
              {pans.map(card => (
                <div
                  key={card.id}
                  className="group rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden transition-all"
                >
                  {editState?.id === card.id ? (
                    // Inline Edit Form
                    <form onSubmit={handleEditSubmit} className="p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">PAN</label>
                          <input
                            type="text"
                            value={editState.pan}
                            onChange={e => setEditState(s => s ? { ...s, pan: e.target.value.toUpperCase() } : null)}
                            maxLength={10}
                            className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            placeholder="ABCDE1234F"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nickname</label>
                          <input
                            type="text"
                            value={editState.nickname}
                            onChange={e => setEditState(s => s ? { ...s, nickname: e.target.value } : null)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            placeholder="e.g. Dad"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Applicant Name (Optional)</label>
                        <input
                          type="text"
                          value={editState.name}
                          onChange={e => setEditState(s => s ? { ...s, name: e.target.value } : null)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                          placeholder="e.g. Full name (optional)"
                        />
                      </div>
                      <div className="flex gap-2 pt-0.5">
                        <button type="submit" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer">
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button type="button" onClick={() => setEditState(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    // Display Row
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                          {(card.nickname || card.name || card.pan).slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {card.nickname || card.name || maskPan(card.pan)}
                            </span>
                            {card.nickname && card.name && (
                              <span className="text-[10px] text-slate-400 truncate hidden sm:block">({card.name})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                            <span>{maskPan(card.pan)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {deleteConfirm === card.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => { removePan(card.id); setDeleteConfirm(null); }}
                              className="px-2 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold cursor-pointer hover:bg-red-700 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(null)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(card)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(card.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Form */}
          {showAddForm ? (
            <form onSubmit={handleAddSubmit} className="rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/50 p-3.5 space-y-3">
              <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-500" /> Add New PAN Card
              </div>

              {addError && (
                <div className="flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2.5 py-1.5 rounded-lg">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {addError}
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1">
                  <CreditCard className="w-3 h-3" /> PAN Number *
                </label>
                <input
                  type="text"
                  value={newPan}
                  onChange={e => { setNewPan(e.target.value.toUpperCase()); setAddError(''); }}
                  maxLength={10}
                  autoFocus
                  placeholder="ABCDE1234F"
                  className="w-full text-sm font-mono font-bold tracking-widest px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder-slate-400 placeholder:tracking-normal placeholder:font-normal placeholder:text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1">
                    <User className="w-3 h-3" /> Applicant Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => { setNewName(e.target.value); setAddError(''); }}
                    placeholder="e.g. Full name (optional)"
                    className="w-full text-xs px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1">
                    <Tag className="w-3 h-3" /> Nickname (Optional)
                  </label>
                  <input
                    type="text"
                    value={newNickname}
                    onChange={e => setNewNickname(e.target.value)}
                    placeholder="e.g. Dad, Wife, Self"
                    className="w-full text-xs px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-0.5">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add PAN
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setAddError(''); setNewPan(''); setNewName(''); setNewNickname(''); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => { setShowAddForm(true); setEditState(null); }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {pans.length === 0 ? 'Add Your First PAN Card' : 'Add Another PAN'}
            </button>
          )}

          {pans.length === 0 && !showAddForm && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center pb-1">
              Save your family's PAN cards and auto-check allotment for all in one click.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
