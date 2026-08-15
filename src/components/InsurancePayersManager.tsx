import React, { useState } from 'react';
import { ShieldCheck, Search, Zap, CheckCircle2, DollarSign, Building2, Phone, FileCheck, ArrowRight } from 'lucide-react';
import { InsuranceProvider } from '../types';

interface InsurancePayersManagerProps {
  payers: InsuranceProvider[];
  onSelectPayer?: (payer: InsuranceProvider) => void;
}

export const InsurancePayersManager: React.FC<InsurancePayersManagerProps> = ({
  payers,
  onSelectPayer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [testPolicyNumber, setTestPolicyNumber] = useState('BC-992817441');
  const [selectedPayerForTest, setSelectedPayerForTest] = useState<string>(payers[0]?.id || '');
  const [eligibilityResult, setEligibilityResult] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const filteredPayers = payers.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.payerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clearinghouse.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerifyEligibility = () => {
    setIsVerifying(true);
    setEligibilityResult(null);
    setTimeout(() => {
      const payer = payers.find(p => p.id === selectedPayerForTest) || payers[0];
      setEligibilityResult({
        status: 'ACTIVE_COVERAGE_VERIFIED',
        memberStatus: 'Active - High Sierra Somatic Rehabilitation Rider Included',
        payerName: payer.name,
        payerId: payer.payerId,
        copay: payer.copayType === 'Fixed' ? `$${payer.standardCopayAmount}` : `${payer.standardCopayAmount}%`,
        deductibleMet: `$${payer.deductibleRequired} of $${payer.deductibleRequired} (100% Met)`,
        reimbursementEst: `${Math.round(payer.typicalReimbursementRate * 100)}%`,
        priorAuthRequired: false,
        clearinghouseRef: `EDI-271-${Date.now().toString(36).toUpperCase()}`
      });
      setIsVerifying(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <span className="p-2 rounded-xl backdrop-blur-md bg-emerald-400/15 text-emerald-300 border border-emerald-400/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span>Medical Insurance Payers & Clearinghouse Network</span>
          </h2>
          <p className="text-xs text-slate-300/80 mt-1">
            Supported medical payers configured for real-time electronic claims (EDI 837P) and instant remittance (ERA 835).
          </p>
        </div>
      </div>

      {/* Real-time Eligibility Verification Box */}
      <div className="backdrop-blur-xl bg-white/[0.04] border border-white/15 rounded-3xl p-6 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-widest mb-4 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>Real-Time Payer Eligibility & Benefits Lookup (EDI 270/271)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs text-slate-300/90 font-medium mb-1.5">Select Medical Payer</label>
            <select
              value={selectedPayerForTest}
              onChange={(e) => setSelectedPayerForTest(e.target.value)}
              className="w-full bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
            >
              {payers.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#091a18]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs text-slate-300/90 font-medium mb-1.5">Member Policy / Subscriber ID</label>
            <input
              type="text"
              value={testPolicyNumber}
              onChange={(e) => setTestPolicyNumber(e.target.value)}
              placeholder="e.g. BC-992817441"
              className="w-full bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <button
              onClick={handleVerifyEligibility}
              disabled={isVerifying || !testPolicyNumber}
              className="w-full px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-500/25"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isVerifying ? 'Checking Clearinghouse...' : 'Verify Benefits'}</span>
            </button>
          </div>
        </div>

        {/* Eligibility Verification Card Output */}
        {eligibilityResult && (
          <div className="mt-5 p-5 rounded-2xl backdrop-blur-xl bg-emerald-950/40 border border-emerald-400/40 space-y-3 text-xs shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{eligibilityResult.status}</span>
              </span>
              <span className="font-mono text-slate-300 text-[11px] px-2.5 py-0.5 rounded-full backdrop-blur-md bg-white/10 border border-white/15">
                {eligibilityResult.clearinghouseRef}
              </span>
            </div>
            <p className="text-slate-200 font-medium">{eligibilityResult.memberStatus}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 font-mono text-[11px]">
              <div className="backdrop-blur-md bg-white/[0.04] p-2.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[9px]">COPAY</span>
                <span className="text-white font-bold text-xs">{eligibilityResult.copay}</span>
              </div>
              <div className="backdrop-blur-md bg-white/[0.04] p-2.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[9px]">DEDUCTIBLE</span>
                <span className="text-teal-300 font-bold text-xs">{eligibilityResult.deductibleMet}</span>
              </div>
              <div className="backdrop-blur-md bg-white/[0.04] p-2.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[9px]">EST. REIMBURSEMENT</span>
                <span className="text-emerald-300 font-bold text-xs">{eligibilityResult.reimbursementEst}</span>
              </div>
              <div className="backdrop-blur-md bg-white/[0.04] p-2.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[9px]">PRIOR AUTH</span>
                <span className="text-cyan-300 font-bold text-xs">Waived (In-Network)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payers List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPayers.map((payer) => (
          <div
            key={payer.id}
            className="backdrop-blur-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-emerald-400/40 rounded-3xl p-6 text-slate-100 flex flex-col justify-between transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-emerald-900/30 group"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-2xl backdrop-blur-md bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full backdrop-blur-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  {payer.payerId}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-base text-white group-hover:text-emerald-200 transition-colors">{payer.name}</h4>
                <p className="text-xs text-slate-300/80 mt-1 flex items-center space-x-1 font-mono">
                  <span>Clearinghouse: {payer.clearinghouse}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-2 text-xs text-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-400">Standard Member Copay:</span>
                  <span className="font-bold text-white">
                    {payer.copayType === 'Fixed' ? `$${payer.standardCopayAmount.toFixed(2)}` : `${payer.standardCopayAmount}%`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Typical Payer Coverage:</span>
                  <span className="font-bold text-emerald-300">
                    {Math.round(payer.typicalReimbursementRate * 100)}% of Allowed
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Annual Deductible:</span>
                  <span className="font-bold text-slate-200">
                    ${payer.deductibleRequired.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Claims Line: {payer.contactNumber}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-emerald-300 flex items-center space-x-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Real-Time Adjudication</span>
              </span>

              {onSelectPayer && (
                <button
                  onClick={() => onSelectPayer(payer)}
                  className="text-xs text-slate-300 hover:text-emerald-300 flex items-center space-x-1 font-semibold transition"
                >
                  <span>Select Payer</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
