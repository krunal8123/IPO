import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, Wifi } from 'lucide-react';
import { DEFAULT_SERVER, DEFAULT_LAN_SERVER, getCustomServerHost, setCustomServerHost, testServerHost } from '../../services/liveIpoService';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [hostInput, setHostInput] = useState<string>(() => getCustomServerHost());
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const ok = await testServerHost(hostInput);
      if (ok) {
        setTestResult({ success: true, message: 'Server reachable! Live API responded 200 OK.' });
      } else {
        setTestResult({ 
          success: false, 
          message: 'Could not connect. Make sure your phone is on the same Wi-Fi and the backend server is running.' 
        });
      }
    } catch {
      setTestResult({ success: false, message: 'Connection failed. Check IP & port.' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setCustomServerHost(hostInput);
    onSaved();
    onClose();
  };

  const handleResetToDefault = () => {
    setHostInput(DEFAULT_LAN_SERVER);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Server className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Backend Server Settings
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Connect mobile app to live PC backend feed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Backend API Server URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hostInput}
                onChange={(e) => {
                  setHostInput(e.target.value);
                  setTestResult(null);
                }}
                placeholder="http://10.202.144.96:5001"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {testing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wifi className="w-3.5 h-3.5" />
                )}
                <span>Test</span>
              </button>
            </div>
          </div>

          {/* Test Feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl flex items-start gap-2 text-[11px] font-medium ${
                testResult.success
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Help Info & Presets */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Quick Preset Servers:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setHostInput(DEFAULT_SERVER);
                  setTestResult(null);
                }}
                className="w-full text-left p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50 border border-indigo-200/50 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 transition-colors"
              >
                <div className="font-extrabold flex items-center justify-between">
                  <span>☁️ Cloud Public Server (Recommended)</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-indigo-600 text-white rounded">No Wi-Fi Needed</span>
                </div>
                <div className="font-mono text-[10px] opacity-80 truncate">{DEFAULT_SERVER}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Works anywhere on 4G, 5G or any Wi-Fi. Bypasses Windows Firewall.</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setHostInput(DEFAULT_LAN_SERVER);
                  setTestResult(null);
                }}
                className="w-full text-left p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <div className="font-bold flex items-center justify-between">
                  <span>🏠 Local Wi-Fi (LAN)</span>
                </div>
                <div className="font-mono text-[10px] opacity-80 truncate">{DEFAULT_LAN_SERVER}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Requires phone on same Wi-Fi with port 5001 unblocked.</div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            Save & Reconnect
          </button>
        </div>

      </div>
    </div>
  );
};
