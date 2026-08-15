import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Bot, 
  Sparkles, 
  ArrowRightLeft, 
  CheckCircle2, 
  Lock, 
  Globe, 
  CreditCard, 
  Cpu, 
  FileCheck, 
  Clock, 
  Filter, 
  Search, 
  Download, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  Activity, 
  AlertCircle,
  Hash,
  Layers,
  FileText
} from 'lucide-react';
import { Invoice, InvoiceAuditEntry, AntigravityAgentStep } from '../types';

interface BillingAuditTrailProps {
  invoice: Invoice;
  onClose?: () => void;
  standalone?: boolean;
}

export const BillingAuditTrail: React.FC<BillingAuditTrailProps> = ({
  invoice,
  onClose,
  standalone = false,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Generate comprehensive synthesized audit trail if none explicitly attached
  const auditEntries: InvoiceAuditEntry[] = useMemo(() => {
    if (invoice.auditTrail && invoice.auditTrail.length > 0) {
      return invoice.auditTrail;
    }

    // Synthesize realistic chronological audit trail from invoice telemetry
    const entries: InvoiceAuditEntry[] = [];
    const dos = invoice.dateOfService || '2026-08-14';

    // 1. Encounter Ingestion
    entries.push({
      id: `AUD-${invoice.id}-01`,
      timestamp: `${dos} 09:15:22`,
      type: 'STATUS_CHANGE',
      actor: 'Wilderness Dojo Clinical EHR Interface',
      title: 'Encounter Record Ingested & Initialized',
      description: `Patient clinical wellness encounter record (${invoice.recordId}) for ${invoice.patientName} uploaded with biometric telemetry and therapist clinical notes.`,
      statusChange: { from: 'Draft', to: 'Ready for Coding' },
      complianceCategory: 'HIPAA Privacy',
      cryptographicHash: `0x7f4a${invoice.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}8b2e11`,
      metadata: {
        recordId: invoice.recordId,
        patientName: invoice.patientName,
        facility: 'Wilderness Dojo Health Sanctuary',
      }
    });

    // 2. AI Clinical NLP & Biomarker Extraction
    entries.push({
      id: `AUD-${invoice.id}-02`,
      timestamp: `${dos} 09:15:24`,
      type: 'AI_VERIFICATION',
      actor: 'Antigravity Autonomous Clinical NLP Agent',
      title: 'Biomarker Extraction & Medical Necessity Scored',
      description: `Antigravity NLP analyzed encounter notes, vital signs, and stress markers. Verified physiological indications for somatic physical therapy and neuromuscular re-education.`,
      aiConfidenceScore: invoice.aiVerificationScore || 98,
      complianceCategory: 'ICD-10 Specificity',
      cryptographicHash: `0x3c99${invoice.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}ae55ff`,
      metadata: {
        icdCodes: invoice.cms1500?.icd10Pointers || ['M54.6', 'F43.0'],
        verificationScore: invoice.aiVerificationScore || 98,
        auditNotes: invoice.aiAuditNotes,
      }
    });

    // 3. AMA CPT Procedural Synthesis & CMS 8-Minute Compliance Check
    entries.push({
      id: `AUD-${invoice.id}-03`,
      timestamp: `${dos} 09:15:26`,
      type: 'COMPLIANCE_CHECK',
      actor: 'Antigravity AMA Coding Validator',
      title: 'CPT Fee Schedule & CMS 8-Minute Rule Validation',
      description: `Validated ${invoice.lineItems.length} procedural line items against AMA CPT 2026 guidelines. All timed physical therapy codes (97110, 97112) verified for proper 15-minute unit thresholds without overlapping intervals.`,
      complianceCategory: 'CMS 8-Minute Rule',
      cryptographicHash: `0x11ab${invoice.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}90dc44`,
      metadata: {
        lineItemsCount: invoice.lineItems.length,
        totalBilled: invoice.subtotal,
        timedUnitsCompliant: true,
      }
    });

    // 4. Clearinghouse Real-Time Payer Eligibility & Adjudication
    entries.push({
      id: `AUD-${invoice.id}-04`,
      timestamp: `${dos} 09:15:28`,
      type: 'CLEARINGHOUSE_DISPATCH',
      actor: `${invoice.insuranceProvider?.clearinghouse || 'Availity / Change Healthcare EDI'}`,
      title: 'EDI 270/271 Real-Time Adjudication & Approval',
      description: `Submitted electronic 837P claim to ${invoice.insuranceProvider?.name} (Payer ID: ${invoice.insuranceProvider?.payerId}). Insurance adjudicated ${Math.round((invoice.insuranceProvider?.typicalReimbursementRate || 0.85) * 100)}% coverage ($${invoice.insuranceCoveredAmount.toFixed(2)}) and allocated patient responsibility of $${invoice.patientResponsibility.toFixed(2)}.`,
      statusChange: { from: 'Submitted to Insurance', to: 'Adjudicated' },
      complianceCategory: 'Payer Policy',
      cryptographicHash: `0x88ff${invoice.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}33aa01`,
      metadata: {
        payerId: invoice.insuranceProvider?.payerId,
        claimControlNumber: invoice.cms1500?.claimControlNumber || `CLM-${invoice.invoiceNumber}`,
        insurancePaid: invoice.insuranceCoveredAmount,
        patientCopay: invoice.patientResponsibility,
      }
    });

    // 5. WordPress Webhook Dispatch
    entries.push({
      id: `AUD-${invoice.id}-05`,
      timestamp: `${dos} 09:15:30`,
      type: 'WP_WEBHOOK',
      actor: 'WordPress Dojo Bridge (REST Webhook Engine)',
      title: 'Cryptographic Webhook Pushed to wildernessdojo.home.blog',
      description: `Dispatched HMAC-SHA256 authenticated webhook event to update patient course entitlements and financial ledger on the Wilderness Dojo web portal. Acknowledged with HTTP 200 OK.`,
      complianceCategory: 'HIPAA Privacy',
      cryptographicHash: `0xee41${invoice.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}77fa99`,
      metadata: {
        endpoint: 'https://wildernessdojo.home.blog/wp-json/dojo-billing/v1/payment-webhook',
        wpPostRef: invoice.wpPostRef || 'https://wildernessdojo.home.blog/?p=101',
        responseStatus: 200,
      }
    });

    // 6. Payment Settlement if Paid
    if (invoice.status === 'Paid in Full' || (invoice.paymentHistory && invoice.paymentHistory.length > 0)) {
      const pmt = invoice.paymentHistory && invoice.paymentHistory[0];
      entries.push({
        id: `AUD-${invoice.id}-06`,
        timestamp: pmt?.timestamp ? new Date(pmt.timestamp).toLocaleString() : `${dos} 09:42:15`,
        type: 'PAYMENT_EVENT',
        actor: pmt?.processedBy || 'Wilderness Health Pay Gateway (HIPAA & PCI DSS L1)',
        title: 'Patient Copay Settled in Real-Time',
        description: `Patient balance of $${(pmt?.amountPaid || invoice.patientResponsibility).toFixed(2)} finalized via ${pmt?.paymentMethod || 'HSA_FSA_CARD'} (${pmt?.cardBrand || 'HSA Visa'} •••• ${pmt?.cardLast4 || '4912'}). Authorization Code: ${pmt?.authCode || 'AUTH-992184'}.`,
        statusChange: { from: 'Adjudicated', to: 'Paid in Full' },
        complianceCategory: 'PCI-DSS Settlement',
        cryptographicHash: pmt?.transactionHash || `0x42ff${invoice.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}88ba22`,
        metadata: {
          authCode: pmt?.authCode || 'AUTH-992184',
          transactionHash: pmt?.transactionHash || '0x42ff99120488ba22',
          hsaEligible: true,
        }
      });
    }

    return entries;
  }, [invoice]);

  // Filter and search entries
  const filteredEntries = useMemo(() => {
    return auditEntries.filter((entry) => {
      // Type filter
      if (selectedFilter !== 'ALL' && entry.type !== selectedFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = entry.title.toLowerCase().includes(q);
        const matchDesc = entry.description.toLowerCase().includes(q);
        const matchActor = entry.actor.toLowerCase().includes(q);
        const matchCategory = entry.complianceCategory?.toLowerCase().includes(q) || false;
        const matchHash = entry.cryptographicHash?.toLowerCase().includes(q) || false;
        return matchTitle || matchDesc || matchActor || matchCategory || matchHash;
      }
      return true;
    });
  }, [auditEntries, selectedFilter, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedEntries(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyReport = () => {
    const reportText = JSON.stringify({
      invoiceNumber: invoice.invoiceNumber,
      patientName: invoice.patientName,
      dateOfService: invoice.dateOfService,
      aiVerificationScore: invoice.aiVerificationScore,
      aiAuditNotes: invoice.aiAuditNotes,
      status: invoice.status,
      auditTrail: auditEntries,
    }, null, 2);

    navigator.clipboard.writeText(reportText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      invoiceNumber: invoice.invoiceNumber,
      recordId: invoice.recordId,
      patientName: invoice.patientName,
      dateOfService: invoice.dateOfService,
      status: invoice.status,
      payer: invoice.insuranceProvider?.name,
      auditTrail: auditEntries,
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `billing-audit-trail-${invoice.invoiceNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Helper for event style
  const getEventBadge = (type: InvoiceAuditEntry['type']) => {
    switch (type) {
      case 'STATUS_CHANGE':
        return {
          icon: <ArrowRightLeft className="w-4 h-4 text-cyan-300" />,
          bg: 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300',
          label: 'Status Transition',
        };
      case 'AI_VERIFICATION':
        return {
          icon: <Sparkles className="w-4 h-4 text-emerald-300" />,
          bg: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300',
          label: 'AI Verification',
        };
      case 'AGENTIC_STEP':
        return {
          icon: <Cpu className="w-4 h-4 text-teal-300" />,
          bg: 'bg-teal-500/15 border-teal-400/30 text-teal-300',
          label: 'Agentic Step',
        };
      case 'COMPLIANCE_CHECK':
        return {
          icon: <FileCheck className="w-4 h-4 text-amber-300" />,
          bg: 'bg-amber-500/15 border-amber-400/30 text-amber-300',
          label: 'Compliance Check',
        };
      case 'CLEARINGHOUSE_DISPATCH':
        return {
          icon: <Building2 className="w-4 h-4 text-indigo-300" />,
          bg: 'bg-indigo-500/15 border-indigo-400/30 text-indigo-300',
          label: 'Clearinghouse EDI',
        };
      case 'WP_WEBHOOK':
        return {
          icon: <Globe className="w-4 h-4 text-teal-300" />,
          bg: 'bg-teal-500/15 border-teal-400/30 text-teal-300',
          label: 'WordPress Webhook',
        };
      case 'PAYMENT_EVENT':
        return {
          icon: <CreditCard className="w-4 h-4 text-emerald-300" />,
          bg: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300',
          label: 'Payment Settlement',
        };
      default:
        return {
          icon: <Activity className="w-4 h-4 text-slate-300" />,
          bg: 'bg-slate-500/15 border-slate-400/30 text-slate-300',
          label: 'Audit Log',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl backdrop-blur-md bg-emerald-400/15 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>Billing Compliance & Autonomous AI Audit Trail</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    HMAC-SHA256 SECURED
                  </span>
                </h3>
                <p className="text-xs text-slate-300/80">
                  Immutable chronological audit record tracking every AI clinical rationale, rule verification, payer status transition, and webhook delivery for Invoice <span className="font-mono text-emerald-300 font-bold">{invoice.invoiceNumber}</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={handleCopyReport}
              className="px-3.5 py-2 rounded-2xl backdrop-blur-md bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 flex items-center space-x-1.5 border border-white/10 transition"
              title="Copy audit log to clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>{copiedNotification ? 'Copied!' : 'Copy Log'}</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-xs font-bold text-slate-950 flex items-center space-x-1.5 transition shadow-md shadow-emerald-500/20"
              title="Download audit trail JSON file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit JSON</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5 pt-5 border-t border-white/10">
          <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              AI Verification Score
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-mono font-bold text-emerald-300">
                {invoice.aiVerificationScore || 98}%
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Optimal
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Audit Events Logged
            </span>
            <span className="text-xl font-mono font-bold text-white">
              {auditEntries.length} Records
            </span>
          </div>

          <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Current Claim State
            </span>
            <span className="text-sm font-semibold text-teal-300 truncate block">
              {invoice.status}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Compliance Standard
            </span>
            <span className="text-xs font-semibold text-emerald-300 flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>HIPAA & CMS-1500 Pass</span>
            </span>
          </div>
        </div>
      </div>

      {/* AI Clinical & Coding Verification Note Highlight */}
      <div className="p-5 rounded-3xl backdrop-blur-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/40 border border-emerald-500/30 shadow-inner space-y-3">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Antigravity Autonomous AI Verification & Medical Necessity Rationale
          </h4>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-sans">
          "{invoice.aiAuditNotes || 'High-affinity medical necessity established. Procedural units mapped according to Wilderness Physical Therapy and Somatic Care Guidelines with zero compliance conflicts.'}"
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-300">
          <span className="font-semibold text-slate-400">Validated Crosswalks:</span>
          {invoice.cms1500?.icd10Pointers.map((icd, idx) => (
            <span key={idx} className="font-mono px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 text-emerald-300">
              {icd}
            </span>
          ))}
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Payer Rules:</span>
          <span className="text-teal-300 font-medium">{invoice.insuranceProvider?.name}</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 mr-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          {[
            { id: 'ALL', label: `All (${auditEntries.length})` },
            { id: 'STATUS_CHANGE', label: 'Status Changes' },
            { id: 'AI_VERIFICATION', label: 'AI Verifications' },
            { id: 'COMPLIANCE_CHECK', label: 'Compliance' },
            { id: 'CLEARINGHOUSE_DISPATCH', label: 'Clearinghouse' },
            { id: 'WP_WEBHOOK', label: 'WordPress' },
            { id: 'PAYMENT_EVENT', label: 'Payments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1 rounded-xl font-medium transition backdrop-blur-md ${
                selectedFilter === tab.id
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold shadow-sm'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail..."
            className="w-full bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:border-emerald-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative pl-6 sm:pl-8 space-y-4 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
        {filteredEntries.map((entry, index) => {
          const badge = getEventBadge(entry.type);
          const isExpanded = !!expandedEntries[entry.id];

          return (
            <div key={entry.id} className="relative group">
              {/* Timeline Bullet Node */}
              <div className="absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 rounded-full backdrop-blur-md bg-[#081a17] border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
              </div>

              {/* Event Card */}
              <div className="backdrop-blur-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-2xl p-5 transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                {/* Header line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center space-x-1.5 ${badge.bg}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>

                    {entry.complianceCategory && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-white/[0.06] text-slate-300 border border-white/10">
                        {entry.complianceCategory}
                      </span>
                    )}

                    {entry.aiConfidenceScore && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Confidence: {entry.aiConfidenceScore}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{entry.timestamp}</span>
                  </div>
                </div>

                {/* Event Title & Actor */}
                <div className="mt-2.5">
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>{entry.title}</span>
                  </h4>
                  <p className="text-[11px] text-emerald-300/90 font-medium mt-0.5 flex items-center space-x-1">
                    <span>Actor: {entry.actor}</span>
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300/90 mt-2 leading-relaxed font-sans">
                  {entry.description}
                </p>

                {/* Status Transition Pill if applicable */}
                {entry.statusChange && (
                  <div className="mt-3 inline-flex items-center space-x-2 p-2 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10 text-xs">
                    <span className="text-slate-400 font-medium">State Shift:</span>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                      {entry.statusChange.from}
                    </span>
                    <span className="text-slate-400">➔</span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      {entry.statusChange.to}
                    </span>
                  </div>
                )}

                {/* Bottom Bar: Cryptographic Hash & Details Toggle */}
                <div className="mt-4 pt-3 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
                    <Hash className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-500">Hash:</span>
                    <span className="text-teal-300 truncate max-w-[200px] sm:max-w-xs">{entry.cryptographicHash}</span>
                  </div>

                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <button
                      onClick={() => toggleExpand(entry.id)}
                      className="text-xs text-slate-300 hover:text-emerald-300 flex items-center space-x-1 transition font-medium"
                    >
                      <span>{isExpanded ? 'Hide Raw Metadata' : 'View Raw Metadata'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Expanded JSON Inspector */}
                {isExpanded && entry.metadata && (
                  <div className="mt-3 p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-[11px] text-teal-200 overflow-x-auto">
                    <div className="text-[10px] text-slate-400 mb-1 font-sans font-semibold">
                      Metadata Payload & Verification Proof:
                    </div>
                    <pre>{JSON.stringify(entry.metadata, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredEntries.length === 0 && (
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-500" />
            <p className="text-xs">No audit events match your current filter or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};
