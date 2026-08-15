import React from 'react';
import { ShieldCheck, Activity, Globe, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { WordPressSyncStatus } from '../types';

interface HeaderProps {
  activeTab: 'workbench' | 'records' | 'invoices' | 'payers' | 'wordpress';
  setActiveTab: (tab: 'workbench' | 'records' | 'invoices' | 'payers' | 'wordpress') => void;
  wpStatus: WordPressSyncStatus | null;
  onRefreshWp: () => void;
  isSyncing: boolean;
  totalInvoicesCount: number;
  totalRecordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  wpStatus,
  onRefreshWp,
  isSyncing,
  totalInvoicesCount,
  totalRecordsCount
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#081816]/70 border-b border-white/10 text-white shadow-[0_4px_30px_rgba(0,0,0,0.35)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/80 to-teal-400/80 backdrop-blur-md flex items-center justify-center shadow-lg shadow-emerald-900/50 border border-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white drop-shadow-sm">
                  Wilderness Dojo
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-300 font-semibold border border-emerald-400/30 backdrop-blur-md shadow-inner">
                  Antigravity AI Billing
                </span>
              </div>
              <p className="text-xs text-slate-300/80">
                Medical Wellness Invoicing & Real-Time Claims Engine
              </p>
            </div>
          </div>

          {/* WordPress Bridge & Status Chips */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={onRefreshWp}
              disabled={isSyncing}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-slate-200 border border-white/10 transition shadow-sm"
              title="Click to sync with wildernessdojo.home.blog"
            >
              <Globe className="w-3.5 h-3.5 text-teal-300" />
              <span className="text-slate-200">wildernessdojo.home.blog</span>
              <span className={`w-2 h-2 rounded-full ${wpStatus?.isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`}></span>
              {isSyncing && <RefreshCw className="w-3 h-3 text-slate-300 animate-spin" />}
            </button>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/[0.04] text-xs text-slate-300 border border-white/10 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>EDI 837P Clearinghouse: Active</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 backdrop-blur-xl bg-white/[0.04] p-1.5 rounded-2xl border border-white/10 text-xs font-medium shadow-inner">
            <button
              onClick={() => setActiveTab('workbench')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition duration-200 ${
                activeTab === 'workbench'
                  ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Workbench</span>
            </button>

            <button
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition duration-200 ${
                activeTab === 'records'
                  ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Wellness Records ({totalRecordsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition duration-200 ${
                activeTab === 'invoices'
                  ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Invoices & Claims ({totalInvoicesCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('payers')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition duration-200 ${
                activeTab === 'payers'
                  ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Payers</span>
            </button>

            <button
              onClick={() => setActiveTab('wordpress')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition duration-200 ${
                activeTab === 'wordpress'
                  ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>WordPress Bridge</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
