import React, { useState } from 'react';
import { 
  Sparkles, Play, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, 
  FileText, CreditCard, Globe, Zap, Cpu, Terminal, RefreshCw, Layers, Check
} from 'lucide-react';
import { MedicalWellnessRecord, InsuranceProvider, AntigravityAgentStep, Invoice } from '../types';

interface AgenticWorkbenchProps {
  records: MedicalWellnessRecord[];
  payers: InsuranceProvider[];
  onExecuteBilling: (record: MedicalWellnessRecord, payer: InsuranceProvider) => Promise<{ success: boolean; invoice?: Invoice; steps: AntigravityAgentStep[] }>;
  onSelectInvoice: (invoice: Invoice) => void;
  onOpenPayment: (invoice: Invoice) => void;
}

export const AgenticWorkbench: React.FC<AgenticWorkbenchProps> = ({
  records,
  payers,
  onExecuteBilling,
  onSelectInvoice,
  onOpenPayment
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(records[0]?.id || '');
  const [selectedPayerId, setSelectedPayerId] = useState<string>(records[0]?.insuranceProviderId || payers[0]?.id || '');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionSteps, setExecutionSteps] = useState<AntigravityAgentStep[]>([]);
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);
  const [agentThoughtStream, setAgentThoughtStream] = useState<string>('');
  const [activeStepTab, setActiveStepTab] = useState<'timeline' | 'payload' | 'terminal'>('timeline');

  const selectedRecord = records.find(r => r.id === selectedRecordId) || records[0];
  const selectedPayer = payers.find(p => p.id === selectedPayerId) || payers[0];

  const handleRunAgent = async () => {
    if (!selectedRecord || !selectedPayer) return;
    setIsRunning(true);
    setExecutionSteps([]);
    setGeneratedInvoice(null);
    setAgentThoughtStream('Initializing Antigravity Billing Agent...\nConnecting to medical coding engine and wildernessdojo.home.blog bridge...');

    try {
      const result = await onExecuteBilling(selectedRecord, selectedPayer);
      if (result.success && result.invoice) {
        setExecutionSteps(result.steps);
        setGeneratedInvoice(result.invoice);
        setAgentThoughtStream(
          `Autonomous billing cycle completed with status 200 OK.\nClaim Number: ${result.invoice.cms1500?.claimControlNumber}\nTotal Charges: $${result.invoice.subtotal.toFixed(2)}\nInsurance Allowed: $${result.invoice.insuranceCoveredAmount.toFixed(2)}\nPatient Copay: $${result.invoice.patientResponsibility.toFixed(2)}\nDispatched to WordPress site wildernessdojo.home.blog.`
        );
      }
    } catch (err: any) {
      console.error(err);
      setAgentThoughtStream(`Agent halted with error: ${err.message || 'Execution failed'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Concept Card */}
      <div className="backdrop-blur-2xl bg-gradient-to-r from-emerald-950/70 via-[#0d2d28]/70 to-[#061816]/80 rounded-3xl p-6 border border-emerald-400/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl backdrop-blur-md bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 shadow-inner">
                <Cpu className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">
                Antigravity Agentic Billing Command Center
              </h2>
            </div>
            <p className="text-sm text-slate-200/90 max-w-3xl leading-relaxed">
              Autonomous AI agent for clinical medical coding, real-time insurance adjudication, and payment processing connected to{' '}
              <span className="text-emerald-300 font-mono underline decoration-emerald-400/50 font-semibold">wildernessdojo.home.blog</span>.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunAgent}
              disabled={isRunning}
              className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center space-x-2 transition-all duration-200 backdrop-blur-md border ${
                isRunning
                  ? 'bg-white/10 text-slate-400 border-white/10 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 border-white/30 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                  <span>Agent Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Autonomous Billing</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Config Selector + Live Execution Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Selection & Clinical Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] space-y-5">
            <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-widest flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>1. Select Patient & Wellness Record</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Wellness Record
                </label>
                <select
                  value={selectedRecordId}
                  onChange={(e) => {
                    setSelectedRecordId(e.target.value);
                    const rec = records.find(r => r.id === e.target.value);
                    if (rec) setSelectedPayerId(rec.insuranceProviderId);
                  }}
                  className="w-full bg-black/40 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40"
                >
                  {records.map((r) => (
                    <option key={r.id} value={r.id} className="bg-[#091a18] text-slate-100">
                      {r.patientName} — {r.encounterType} ({r.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Chosen Medical Insurance Payer
                </label>
                <select
                  value={selectedPayerId}
                  onChange={(e) => setSelectedPayerId(e.target.value)}
                  className="w-full bg-black/40 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40"
                >
                  {payers.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#091a18] text-slate-100">
                      {p.name} ({p.payerId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Patient Mini Card */}
              {selectedRecord && (
                <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/[0.08] space-y-3 text-xs shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-100 text-sm">{selectedRecord.patientName}</span>
                    <span className="px-2.5 py-0.5 rounded-full backdrop-blur-md bg-white/10 text-slate-200 font-mono text-[11px] border border-white/10">
                      DOB: {selectedRecord.dob}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Encounter Date:</span>
                      <span className="text-slate-100 font-medium">{selectedRecord.encounterDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Policy Number:</span>
                      <span className="text-slate-100 font-mono">{selectedRecord.insurancePolicyNumber}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.08]">
                    <span className="text-slate-400 block mb-1 font-semibold text-[11px]">Chief Complaint:</span>
                    <p className="text-slate-200 text-xs italic leading-relaxed line-clamp-2">
                      "{selectedRecord.chiefComplaint}"
                    </p>
                  </div>

                  {/* Vitals Telemetry Badge */}
                  <div className="pt-1 flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-xl backdrop-blur-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-[11px]">
                      BP: {selectedRecord.vitalSigns.bloodPressure}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl backdrop-blur-md bg-teal-500/15 text-teal-300 border border-teal-500/30 font-mono text-[11px]">
                      HRV: {selectedRecord.vitalSigns.hrvScore} ms
                    </span>
                    <span className="px-2.5 py-1 rounded-xl backdrop-blur-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono text-[11px]">
                      Mobility: {selectedRecord.vitalSigns.mobilityScore}/100
                    </span>
                  </div>
                </div>
              )}

              {/* Insurance Payer Mini Details */}
              {selectedPayer && (
                <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs text-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Clearinghouse Gateway:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{selectedPayer.clearinghouse}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Reimbursement Model:</span>
                    <span>
                      {Math.round(selectedPayer.typicalReimbursementRate * 100)}% Coverage / {selectedPayer.copayType === 'Fixed' ? `$${selectedPayer.standardCopayAmount} Copay` : `${selectedPayer.standardCopayAmount}% Coinsurance`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* WordPress Target Info */}
          <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-4 text-xs text-slate-200 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-teal-300" />
              <div>
                <span className="font-semibold text-slate-100 block">WordPress Live Endpoint</span>
                <span className="text-slate-300 font-mono">wildernessdojo.home.blog</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full backdrop-blur-md bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 font-semibold">
              Bridge Ready
            </span>
          </div>
        </div>

        {/* Right Column: Execution Timeline & Proof of Work Output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
                  2. Antigravity Execution Timeline (Proof of Work)
                </h3>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center space-x-1 backdrop-blur-md bg-white/[0.05] p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setActiveStepTab('timeline')}
                  className={`px-3 py-1 rounded-lg transition ${activeStepTab === 'timeline' ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-sm' : 'text-slate-300 hover:text-white'}`}
                >
                  Step Flow
                </button>
                <button
                  onClick={() => setActiveStepTab('terminal')}
                  className={`px-3 py-1 rounded-lg transition ${activeStepTab === 'terminal' ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-sm' : 'text-slate-300 hover:text-white'}`}
                >
                  Terminal Logs
                </button>
              </div>
            </div>

            {/* If no execution yet */}
            {executionSteps.length === 0 && !isRunning && (
              <div className="py-14 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl backdrop-blur-md bg-white/[0.05] text-slate-400 mx-auto flex items-center justify-center border border-white/10 shadow-inner">
                  <Terminal className="w-6 h-6" />
                </div>
                <p className="text-slate-200 text-sm font-semibold">
                  Ready to trigger Antigravity AI Medical Billing
                </p>
                <p className="text-xs text-slate-300/80 max-w-md mx-auto leading-relaxed">
                  Click "Run Autonomous Billing" to synthesize ICD-10/CPT codes, verify with wildernessdojo.home.blog, and generate real-time insurance claims.
                </p>
              </div>
            )}

            {/* Running Loader */}
            {isRunning && (
              <div className="py-12 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-400/20 border-t-emerald-400 animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-emerald-300 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Antigravity AI Agent in Progress</h4>
                  <p className="text-xs text-emerald-300/90 mt-1 font-mono">
                    Synthesizing clinical codes & querying clearinghouse...
                  </p>
                </div>
              </div>
            )}

            {/* Step Timeline View */}
            {activeStepTab === 'timeline' && executionSteps.length > 0 && (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {executionSteps.map((step, index) => (
                  <div
                    key={step.id || index}
                    className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-white/10 hover:border-emerald-400/40 space-y-2 transition shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center text-[11px] font-bold">
                          {index + 1}
                        </span>
                        <span className="font-bold text-xs text-slate-100">{step.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-300 font-mono">{step.timestamp}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 pl-7 leading-relaxed">{step.detail}</p>

                    {step.thoughtLog && (
                      <div className="ml-7 mt-1.5 p-2.5 rounded-xl backdrop-blur-md bg-black/40 border border-white/[0.08] text-[11px] text-emerald-300 font-mono">
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Agent Thought Stream:</span>
                        {step.thoughtLog}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Terminal View */}
            {activeStepTab === 'terminal' && (
              <div className="backdrop-blur-xl bg-black/60 p-4 rounded-2xl border border-white/10 font-mono text-xs text-slate-200 h-80 overflow-y-auto space-y-2 shadow-inner">
                <div className="text-slate-400">// Antigravity Clinical AI Billing CLI v2.4</div>
                <div className="text-teal-300">[SYSTEM] Agent initialized with models/gemini-3.7-flash</div>
                <div className="text-slate-300 whitespace-pre-wrap">{agentThoughtStream}</div>
              </div>
            )}

            {/* Generated Invoice Outcome Card */}
            {generatedInvoice && (
              <div className="mt-5 p-5 rounded-2xl backdrop-blur-2xl bg-gradient-to-r from-emerald-950/70 to-teal-950/60 border border-emerald-400/30 text-slate-100 space-y-3 shadow-[0_8px_32px_rgba(4,30,25,0.45)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm text-white">
                      Invoice & Claim Ready: {generatedInvoice.invoiceNumber}
                    </span>
                  </div>
                  <span className="px-3 py-0.5 rounded-full backdrop-blur-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                    {generatedInvoice.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs py-2 border-y border-white/10 font-mono">
                  <div>
                    <span className="text-slate-300 block text-[10px]">Total Billed:</span>
                    <span className="font-bold text-white">${generatedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-emerald-300 block text-[10px]">Insurance Covered:</span>
                    <span className="font-bold text-emerald-300">${generatedInvoice.insuranceCoveredAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-teal-200 block text-[10px]">Patient Copay:</span>
                    <span className="font-bold text-teal-200">${generatedInvoice.patientResponsibility.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSelectInvoice(generatedInvoice)}
                      className="px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.15] text-xs font-medium text-slate-100 border border-white/15 flex items-center space-x-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>View CMS-1500 & Invoice</span>
                    </button>

                    <button
                      onClick={() => onOpenPayment(generatedInvoice)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition shadow-md shadow-emerald-500/25"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Process Real-Time Payment</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-300">
                    Synced with <span className="font-mono text-emerald-300 font-semibold">wildernessdojo.home.blog</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
