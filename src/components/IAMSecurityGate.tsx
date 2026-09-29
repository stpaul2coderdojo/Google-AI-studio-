import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, User, Key, Eye, EyeOff, AlertTriangle, 
  CheckCircle2, ArrowRight, ShieldAlert, Sparkles, Terminal, Activity, FileCheck
} from 'lucide-react';
import { useIAMAuth } from '../context/IAMAuthContext';

export const IAMSecurityGate: React.FC = () => {
  const { login, isLoading, error, clearError } = useIAMAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('DojoAdmin2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [loginFailedCount, setLoginFailedCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    const success = await login(username.trim(), password);
    if (!success) {
      setLoginFailedCount(prev => prev + 1);
    }
  };

  const handleQuickFill = (roleUser: string, rolePass: string) => {
    setUsername(roleUser);
    setPassword(rolePass);
    clearError();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Subtle background ambient mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-35">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-[600px] h-[450px] bg-teal-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header bar */}
      <header className="relative z-10 border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-slate-950/60">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Wilderness Dojo</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                IAM Gateway
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Antigravity AI Medical Billing & Clinical Claims Terminal
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono">IAM Security: Active</span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Outer Border Box */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/80 p-6 sm:p-8 space-y-6">
            
            {/* Top Identity Block */}
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 mb-1">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Admin Authentication
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Identity and Access Management (IAM) security clearance required for HIPAA PHI and automated billing claims.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start space-x-2.5 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-300">Access Denied</p>
                  <p className="text-rose-200/90 text-[11px] mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  IAM Username or Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) clearError();
                    }}
                    placeholder="e.g. admin or user@wildernessdojo.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/15 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm text-white placeholder-slate-500 transition outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Security Password
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    PBKDF2 SHA-512
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) clearError();
                    }}
                    placeholder="Enter admin password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-white/15 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm text-white placeholder-slate-500 transition outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying IAM Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authenticate & Enter System</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick-Access IAM Roles for instant review & switching */}
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-slate-300">
                  Pre-configured IAM Role Profiles:
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">One-Click Select</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'DojoAdmin2026!')}
                  className={`text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                    username === 'admin' 
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-white' 
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">Super Admin / CMO</div>
                      <div className="text-[10px] text-slate-400">admin • All clearances & AI tuning</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    SUPER_ADMIN
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('dr.thorne', 'Somatic2026!')}
                  className={`text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                    username === 'dr.thorne' 
                      ? 'bg-teal-500/15 border-teal-500/40 text-white' 
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">Clinical Director</div>
                      <div className="text-[10px] text-slate-400">dr.thorne • EHR & Treatment claims</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    CHIEF_MEDICAL
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('compliance', 'AuditPass2026!')}
                  className={`text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                    username === 'compliance' 
                      ? 'bg-amber-500/15 border-amber-500/40 text-white' 
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <FileCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">Billing Officer</div>
                      <div className="text-[10px] text-slate-400">compliance • CMS-1500 & EDI 835 Remit</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    BILLING_OFFICER
                  </span>
                </button>
              </div>
            </div>

            {/* Security Guarantee Footer */}
            <div className="pt-2 text-center">
              <div className="inline-flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Trust Session • 24h Expiry • Salt Hashed</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-3 text-center text-xs text-slate-400 backdrop-blur-md bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="text-slate-400">Wilderness Dojo Antigravity AI v2.6.4</span>
          <span>•</span>
          <span className="text-emerald-400">IAM Role-Based Access Control</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Target Integration: <span className="text-slate-300 font-mono">wildernessdojo.home.blog</span>
        </div>
      </footer>
    </div>
  );
};
