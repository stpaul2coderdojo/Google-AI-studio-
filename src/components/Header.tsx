import React from 'react';
import { 
  ShieldCheck, Activity, Globe, Sparkles, RefreshCw, Layers, 
  UserCheck, Shield, Key, LogOut, Lock, User, CreditCard, Database, Terminal, ShoppingBag
} from 'lucide-react';
import { WordPressSyncStatus, NavigationTab } from '../types';
import { useIAMAuth } from '../context/IAMAuthContext';

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  wpStatus: WordPressSyncStatus | null;
  onRefreshWp: () => void;
  isSyncing: boolean;
  totalInvoicesCount: number;
  totalRecordsCount: number;
  totalPurchaseInvoicesCount?: number;
  onOpenIAMSecurityModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  wpStatus,
  onRefreshWp,
  isSyncing,
  totalInvoicesCount,
  totalRecordsCount,
  totalPurchaseInvoicesCount,
  onOpenIAMSecurityModal
}) => {
  const { user, logout } = useIAMAuth();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#081816]/80 border-b border-white/10 text-white shadow-[0_4px_30px_rgba(0,0,0,0.35)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/80 to-teal-400/80 backdrop-blur-md flex items-center justify-center shadow-lg shadow-emerald-900/50 border border-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white drop-shadow-sm">
                  Wilderness Dojo
                </span>
                <span className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-300 font-semibold border border-emerald-400/30 backdrop-blur-md shadow-inner">
                  Antigravity AI Billing
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 font-medium border border-teal-500/30 hidden sm:inline-flex items-center gap-1">
                  Director: Dr. Bheemaiah Anil K
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300/80 flex items-center gap-1.5 flex-wrap">
                <span>Medical Wellness Invoicing & Real-Time Claims Engine</span>
                <span className="text-slate-500 hidden sm:inline">&bull;</span>
                <span className="text-emerald-300/90 font-medium sm:hidden">Dr. Bheemaiah Anil K, Director</span>
              </p>
            </div>
          </div>

          {/* Center IAM User Identity & Security Clearance Bar */}
          {user && (
            <div className="hidden xl:flex items-center space-x-2.5 px-3 py-1.5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-inner">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg ${
                  user.role === 'SUPER_ADMIN' ? 'bg-emerald-500/20 text-emerald-400' :
                  user.role === 'CHIEF_MEDICAL_OFFICER' ? 'bg-teal-500/20 text-teal-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-white max-w-[140px] truncate">{user.fullName || user.username}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold border ${
                      user.role === 'SUPER_ADMIN' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      user.role === 'CHIEF_MEDICAL_OFFICER' ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' :
                      'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>IAM Clearance: Validated</span>
                  </div>
                </div>
              </div>

              {onOpenIAMSecurityModal && (
                <button
                  onClick={onOpenIAMSecurityModal}
                  className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition"
                  title="Open IAM Security & Access Manager"
                >
                  <Key className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Right Action Controls: IAM Security Manager & Logout */}
          <div className="flex items-center space-x-2 shrink-0">
            {onOpenIAMSecurityModal && (
              <button
                onClick={onOpenIAMSecurityModal}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
                title="Manage IAM Accounts & Security Audit Logs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">IAM Security</span>
              </button>
            )}

            <button
              onClick={() => logout()}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
              title="Sign Out of IAM Administrator Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Bar */}
        <div className="py-2.5 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 backdrop-blur-xl bg-white/[0.04] p-1 rounded-2xl border border-white/10 text-xs font-medium shadow-inner overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('workbench')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition duration-200 shrink-0 ${
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
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition duration-200 shrink-0 ${
                activeTab === 'records'
                  ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Record Management ({totalRecordsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('patient-payment')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition duration-200 shrink-0 ${
                activeTab === 'patient-payment'
                  ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Patient Payment</span>
            </button>

            <button
              onClick={() => setActiveTab('patient-portal')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition duration-200 shrink-0 ${
                activeTab === 'patient-portal'
                  ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Patient Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition duration-200 shrink-0 ${
                activeTab === 'invoices'
                  ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Invoices ({totalInvoicesCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('purchase-invoices')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition duration-200 shrink-0 ${
                activeTab === 'purchase-invoices'
                  ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Purchase & UPI {totalPurchaseInvoicesCount !== undefined ? `(${totalPurchaseInvoicesCount})` : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab('payers')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition duration-200 shrink-0 ${
                activeTab === 'payers'
                  ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Payers</span>
            </button>

            <button
              onClick={() => setActiveTab('json-database')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition duration-200 shrink-0 ${
                activeTab === 'json-database'
                  ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>JSON Database</span>
            </button>

            <button
              onClick={() => setActiveTab('rest-api')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition duration-200 shrink-0 ${
                activeTab === 'rest-api'
                  ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>REST API & Webhooks</span>
            </button>

            <button
              onClick={() => setActiveTab('wordpress')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition duration-200 shrink-0 ${
                activeTab === 'wordpress'
                  ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>WordPress Bridge</span>
            </button>
          </nav>

          {/* WordPress Bridge Quick Status button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefreshWp}
              disabled={isSyncing}
              className="flex items-center space-x-2 px-3 py-1 rounded-xl backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-mono text-slate-200 border border-white/10 transition shadow-sm"
              title="Click to sync with wildernessdojo.home.blog | Gateway: duru909mede@post.wordpress.com"
            >
              <Globe className="w-3.5 h-3.5 text-teal-300" />
              <span className="text-slate-200">wildernessdojo.home.blog</span>
              <span className="hidden lg:inline text-emerald-400/80 font-mono text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                duru909mede@post.wordpress.com
              </span>
              <span className={`w-2 h-2 rounded-full ${wpStatus?.isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`}></span>
              {isSyncing && <RefreshCw className="w-3 h-3 text-slate-300 animate-spin" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
