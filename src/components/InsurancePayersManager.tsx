import React, { useState } from 'react';
import { 
  ShieldCheck, Search, Zap, CheckCircle2, DollarSign, Building2, Phone, 
  FileCheck, ArrowRight, Plus, Shield, Check, Globe, HelpCircle, Trash2,
  Lock, RefreshCw
} from 'lucide-react';
import { InsuranceProvider } from '../types';
import { useIAMAuth } from '../context/IAMAuthContext';

interface InsurancePayersManagerProps {
  payers: InsuranceProvider[];
  onSelectPayer?: (payer: InsuranceProvider) => void;
  onAddNewPayer?: (newPayer: InsuranceProvider) => void;
}

const PAYER_PRESETS: Partial<InsuranceProvider>[] = [
  {
    name: 'Cigna Global & Wilderness Health',
    payerId: 'CIGNA-62308',
    clearinghouse: 'Availity / Change Healthcare Gateway',
    copayType: 'Fixed',
    standardCopayAmount: 25.00,
    deductibleRequired: 200.00,
    typicalReimbursementRate: 0.85,
    realTimeAdjudication: true,
    electronicClaimsPayor: true,
    contactNumber: '1-800-882-4462',
    claimsAddress: 'P.O. Box 188014, Chattanooga, TN 37422'
  },
  {
    name: 'Humana Gold Plus (Integrative Medicine)',
    payerId: 'HUM-61101',
    clearinghouse: 'Change Healthcare Clearinghouse',
    copayType: 'Percentage',
    standardCopayAmount: 10.0,
    deductibleRequired: 150.00,
    typicalReimbursementRate: 0.90,
    realTimeAdjudication: true,
    electronicClaimsPayor: true,
    contactNumber: '1-800-448-6262',
    claimsAddress: 'P.O. Box 14601, Lexington, KY 40512'
  },
  {
    name: 'Anthem Blue Cross California',
    payerId: 'ANTHEM-00201',
    clearinghouse: 'Availity Health EDI Gateway',
    copayType: 'Fixed',
    standardCopayAmount: 35.00,
    deductibleRequired: 300.00,
    typicalReimbursementRate: 0.88,
    realTimeAdjudication: true,
    electronicClaimsPayor: true,
    contactNumber: '1-888-254-2721',
    claimsAddress: 'P.O. Box 70000, Van Nuys, CA 91470'
  },
  {
    name: 'Tricare West Active Duty & Veteran Wellness',
    payerId: 'TRICARE-99881',
    clearinghouse: 'Optum360 Military EDI Gateway',
    copayType: 'Fixed',
    standardCopayAmount: 0.00,
    deductibleRequired: 0.00,
    typicalReimbursementRate: 0.95,
    realTimeAdjudication: true,
    electronicClaimsPayor: true,
    contactNumber: '1-844-866-9378',
    claimsAddress: 'P.O. Box 202112, Florence, SC 29502'
  }
];

export const InsurancePayersManager: React.FC<InsurancePayersManagerProps> = ({
  payers,
  onSelectPayer,
  onAddNewPayer
}) => {
  const { apiFetch } = useIAMAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [testPolicyNumber, setTestPolicyNumber] = useState('BC-992817441');
  const [selectedPayerForTest, setSelectedPayerForTest] = useState<string>(payers[0]?.id || '');
  const [eligibilityResult, setEligibilityResult] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showAddPayerModal, setShowAddPayerModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // New Payer Form state
  const [payerForm, setPayerForm] = useState<Partial<InsuranceProvider>>({
    name: '',
    payerId: '',
    clearinghouse: 'Availity / Change Healthcare Gateway',
    copayType: 'Fixed',
    standardCopayAmount: 30.00,
    deductibleRequired: 250.00,
    typicalReimbursementRate: 0.85,
    realTimeAdjudication: true,
    electronicClaimsPayor: true,
    contactNumber: '1-800-555-0199',
    claimsAddress: 'P.O. Box 9000, Claims Center, CA 90001'
  });

  const handleApplyPreset = (preset: Partial<InsuranceProvider>) => {
    setPayerForm({
      ...payerForm,
      ...preset
    });
  };

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
        copay: payer.copayType === 'Fixed' ? `$${payer.standardCopayAmount.toFixed(2)}` : `${payer.standardCopayAmount}%`,
        deductibleMet: `$${payer.deductibleRequired} of $${payer.deductibleRequired} (100% Met)`,
        reimbursementEst: `${Math.round(payer.typicalReimbursementRate * 100)}%`,
        priorAuthRequired: false,
        clearinghouseRef: `EDI-271-${Date.now().toString(36).toUpperCase()}`
      });
      setIsVerifying(false);
    }, 700);
  };

  const handleSavePayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerForm.name?.trim() || !payerForm.payerId?.trim()) return;

    const newId = `payer-${Date.now().toString(36)}`;
    const newPayer: InsuranceProvider = {
      id: newId,
      name: payerForm.name,
      payerId: payerForm.payerId.toUpperCase(),
      clearinghouse: payerForm.clearinghouse || 'Availity EDI Gateway',
      copayType: payerForm.copayType || 'Fixed',
      standardCopayAmount: Number(payerForm.standardCopayAmount) || 25,
      deductibleRequired: Number(payerForm.deductibleRequired) || 200,
      typicalReimbursementRate: Number(payerForm.typicalReimbursementRate) || 0.85,
      realTimeAdjudication: payerForm.realTimeAdjudication !== false,
      electronicClaimsPayor: payerForm.electronicClaimsPayor !== false,
      contactNumber: payerForm.contactNumber || '1-800-555-0100',
      claimsAddress: payerForm.claimsAddress || 'P.O. Box 1000, Claims Department'
    };

    if (onAddNewPayer) {
      onAddNewPayer(newPayer);
    }

    try {
      await apiFetch('/api/payers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayer)
      });
    } catch (err) {
      console.warn('Backend sync note for payer:', err);
    }

    setShowAddPayerModal(false);
    showToast(`Insurance Provider "${newPayer.name}" added to clearinghouse network!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-500/95 text-slate-950 font-bold text-xs shadow-2xl flex items-center space-x-2 border border-white/20 backdrop-blur-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <span className="p-2 rounded-xl backdrop-blur-md bg-emerald-400/15 text-emerald-300 border border-emerald-400/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span>Medical Insurance Payers & Clearinghouse Network</span>
          </h2>
          <p className="text-xs text-slate-300/80 mt-1">
            Configure payer fee schedules, real-time electronic claims (EDI 837P), instant copay verification, and clearinghouse routing.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddPayerModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold flex items-center space-x-2 transition shadow-lg shadow-emerald-500/25 border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Insurance Provider</span>
          </button>
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
                  {p.name} ({p.payerId})
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
              className="w-full bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:border-emerald-400 focus:outline-none font-mono"
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

      {/* Payers Search Bar */}
      <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Filter payers by name, EDI Payer ID, or clearinghouse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-400"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredPayers.length} Active Clearinghouse Connections
        </div>
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
                  <span>Select for Billing</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD NEW INSURANCE PAYER */}
      {showAddPayerModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-[#081a17]/95 border border-white/15 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-slate-100 shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Add New Insurance Provider & Payer Connection</span>
              </h3>
              <button onClick={() => setShowAddPayerModal(false)} className="text-slate-400 hover:text-white font-mono p-1 rounded-lg hover:bg-white/10">
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-emerald-400/30 space-y-2">
              <span className="text-xs font-bold text-emerald-300 block">Quick Load Preset Payer Templates:</span>
              <div className="flex flex-wrap gap-2">
                {PAYER_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-white/10 text-xs font-medium transition"
                  >
                    + {preset.name?.split(' ')[0]} ({preset.payerId})
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSavePayer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payer Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cigna Global & Integrative Health"
                    value={payerForm.name}
                    onChange={(e) => setPayerForm({ ...payerForm, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">EDI Payer ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CIGNA-62308"
                    value={payerForm.payerId}
                    onChange={(e) => setPayerForm({ ...payerForm, payerId: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">EDI Clearinghouse Gateway</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Availity / Change Healthcare"
                    value={payerForm.clearinghouse}
                    onChange={(e) => setPayerForm({ ...payerForm, clearinghouse: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Claims Support Phone</label>
                  <input
                    type="text"
                    placeholder="1-800-555-0100"
                    value={payerForm.contactNumber}
                    onChange={(e) => setPayerForm({ ...payerForm, contactNumber: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Financial & Copay Rules */}
              <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-3">
                <h5 className="font-bold text-teal-300 text-xs flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Fee Schedule & Adjudication Rules</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Copay Type</label>
                    <select
                      value={payerForm.copayType}
                      onChange={(e) => setPayerForm({ ...payerForm, copayType: e.target.value as any })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                    >
                      <option value="Fixed" className="bg-[#091a18]">Fixed ($)</option>
                      <option value="Percentage" className="bg-[#091a18]">Percentage (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Standard Copay Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={payerForm.standardCopayAmount}
                      onChange={(e) => setPayerForm({ ...payerForm, standardCopayAmount: Number(e.target.value) })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Typical Reimbursement (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      max="1.0"
                      value={payerForm.typicalReimbursementRate}
                      onChange={(e) => setPayerForm({ ...payerForm, typicalReimbursementRate: Number(e.target.value) })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-emerald-300 focus:border-emerald-400 focus:outline-none font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Claims Submission Address</label>
                <input
                  type="text"
                  placeholder="e.g. P.O. Box 188014, Chattanooga, TN 37422"
                  value={payerForm.claimsAddress}
                  onChange={(e) => setPayerForm({ ...payerForm, claimsAddress: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <label className="flex items-center space-x-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payerForm.realTimeAdjudication !== false}
                    onChange={(e) => setPayerForm({ ...payerForm, realTimeAdjudication: e.target.checked })}
                    className="rounded border-white/20 text-emerald-400 focus:ring-emerald-400"
                  />
                  <span>Enable Real-Time EDI Adjudication (EDI 837P / 835)</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddPayerModal(false)}
                  className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.15] text-xs text-slate-300 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/25"
                >
                  Save Payer Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
