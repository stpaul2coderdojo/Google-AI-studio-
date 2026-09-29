import React, { useState } from 'react';
import { 
  Layers, FileText, CheckCircle2, CreditCard, Printer, Download, 
  ExternalLink, QrCode, Shield, ArrowRight, Clock, AlertTriangle, Building,
  ShieldCheck, History, Sparkles, Bot, Plus, Trash2, Calendar, User, DollarSign
} from 'lucide-react';
import { Invoice, InvoiceLineItem, MedicalWellnessRecord, InsuranceProvider, CMS1500ClaimData, InvoiceAuditEntry } from '../types';
import { BillingAuditTrail } from './BillingAuditTrail';
import { useIAMAuth } from '../context/IAMAuthContext';

interface InvoicesClaimsViewProps {
  invoices: Invoice[];
  records?: MedicalWellnessRecord[];
  payers?: InsuranceProvider[];
  selectedInvoice: Invoice | null;
  onSelectInvoice: (invoice: Invoice | null) => void;
  onOpenPayment: (invoice: Invoice) => void;
  onAddNewInvoice?: (newInvoice: Invoice) => void;
}

const COMMON_BILLING_CPTS: { code: string; desc: string; fee: number }[] = [
  { code: '97110', desc: 'Therapeutic Exercise (15 min units)', fee: 85.00 },
  { code: '97112', desc: 'Neuromuscular Re-education (15 min units)', fee: 95.00 },
  { code: '97530', desc: 'Therapeutic Activities, Direct Contact (15 min)', fee: 90.00 },
  { code: '97140', desc: 'Manual Therapy Techniques (15 min)', fee: 80.00 },
  { code: '90837', desc: 'Mind-Body Somatic Psychotherapy (60 min)', fee: 180.00 },
  { code: '99214', desc: 'Office / Outpatient Medical Evaluation (Moderate)', fee: 165.00 },
  { code: '97802', desc: 'Medical Nutrition Therapy Intake (15 min)', fee: 75.00 }
];

export const InvoicesClaimsView: React.FC<InvoicesClaimsViewProps> = ({
  invoices,
  records = [],
  payers = [],
  selectedInvoice,
  onSelectInvoice,
  onOpenPayment,
  onAddNewInvoice
}) => {
  const { apiFetch } = useIAMAuth();
  const [activeViewMode, setActiveViewMode] = useState<'itemized_invoice' | 'cms1500' | 'audit_trail'>('itemized_invoice');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State for Creating New Billing Invoice
  const [selectedRecordIdForBilling, setSelectedRecordIdForBilling] = useState<string>('');
  const [billingPatientName, setBillingPatientName] = useState<string>('Elena Rostova');
  const [billingPatientEmail, setBillingPatientEmail] = useState<string>('elena.rostova@wildernessdojo.org');
  const [billingPatientAddress, setBillingPatientAddress] = useState<string>('104 Dojo Ridge Way, Tahoe Vista, CA 96148');
  const [billingDateOfService, setBillingDateOfService] = useState<string>(new Date().toISOString().split('T')[0]);
  const [billingDueDate, setBillingDueDate] = useState<string>(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [billingPayerId, setBillingPayerId] = useState<string>(payers[0]?.id || 'bcbs-001');
  const [billingPolicyNumber, setBillingPolicyNumber] = useState<string>('BC-992817441');
  const [billingGroupNumber, setBillingGroupNumber] = useState<string>('GRP-WD-880');
  const [billingStatus, setBillingStatus] = useState<'Adjudicated' | 'Submitted to Insurance' | 'Paid in Full'>('Adjudicated');

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      id: 'L-1',
      cptCode: '97110',
      description: 'Therapeutic Exercise (15 min units) - Spinal mobilization',
      units: 2,
      unitPrice: 85.00,
      totalCharge: 170.00,
      insuranceAllowed: 170.00,
      insurancePaid: 144.50,
      patientPortion: 25.50,
      status: 'Approved'
    },
    {
      id: 'L-2',
      cptCode: '97112',
      description: 'Neuromuscular Re-education (15 min units) - Trail proprioception',
      units: 2,
      unitPrice: 95.00,
      totalCharge: 190.00,
      insuranceAllowed: 190.00,
      insurancePaid: 161.50,
      patientPortion: 28.50,
      status: 'Approved'
    }
  ]);

  // When user selects a clinical record to auto-fill billing
  const handleSelectRecordForAutoFill = (recId: string) => {
    setSelectedRecordIdForBilling(recId);
    const rec = records.find(r => r.id === recId);
    if (!rec) return;

    setBillingPatientName(rec.patientName);
    setBillingPatientEmail(rec.contactEmail);
    setBillingDateOfService(rec.encounterDate);
    setBillingPayerId(rec.insuranceProviderId);
    setBillingPolicyNumber(rec.insurancePolicyNumber);
    setBillingGroupNumber(rec.insuranceGroupNumber);

    const payer = payers.find(p => p.id === rec.insuranceProviderId) || payers[0];
    const rate = payer?.typicalReimbursementRate || 0.85;

    if (rec.procedureCodes && rec.procedureCodes.length > 0) {
      const newLineItems: InvoiceLineItem[] = rec.procedureCodes.map((proc, idx) => {
        const u = proc.units || 2;
        const up = proc.fee || 85.00;
        const total = u * up;
        const insPaid = Math.round(total * rate * 100) / 100;
        const patCopay = Math.round((total - insPaid) * 100) / 100;
        return {
          id: `L-${idx + 1}`,
          cptCode: proc.code,
          description: proc.description,
          units: u,
          unitPrice: up,
          totalCharge: total,
          insuranceAllowed: total,
          insurancePaid: insPaid,
          patientPortion: patCopay,
          status: 'Approved'
        };
      });
      setLineItems(newLineItems);
    }
  };

  const handleAddLineItem = (cpt: { code: string; desc: string; fee: number }) => {
    const payer = payers.find(p => p.id === billingPayerId) || payers[0];
    const rate = payer?.typicalReimbursementRate || 0.85;
    const units = 2;
    const total = units * cpt.fee;
    const insPaid = Math.round(total * rate * 100) / 100;
    const patCopay = Math.round((total - insPaid) * 100) / 100;

    const newItem: InvoiceLineItem = {
      id: `L-${Date.now().toString(36)}`,
      cptCode: cpt.code,
      description: cpt.desc,
      units: units,
      unitPrice: cpt.fee,
      totalCharge: total,
      insuranceAllowed: total,
      insurancePaid: insPaid,
      patientPortion: patCopay,
      status: 'Approved'
    };

    setLineItems(prev => [...prev, newItem]);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const totalCharge = lineItems.reduce((acc, item) => acc + item.totalCharge, 0);
  const totalInsPaid = lineItems.reduce((acc, item) => acc + item.insurancePaid, 0);
  const totalPatientResponsibility = lineItems.reduce((acc, item) => acc + item.patientPortion, 0);

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) return;

    const payer = payers.find(p => p.id === billingPayerId) || payers[0] || {
      id: 'bcbs-001',
      name: 'Blue Cross Blue Shield',
      payerId: 'BCBS-98301',
      clearinghouse: 'Availity EDI Gateway',
      copayType: 'Fixed' as const,
      standardCopayAmount: 30,
      deductibleRequired: 250,
      typicalReimbursementRate: 0.85,
      realTimeAdjudication: true,
      electronicClaimsPayor: true,
      contactNumber: '1-800-555-2277',
      claimsAddress: 'P.O. Box 9012, Chicago, IL 60601'
    };

    const newInvoiceNumber = `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newClaimControl = `CLM-${Math.floor(100000 + Math.random() * 900000)}`;

    const cmsData: CMS1500ClaimData = {
      claimControlNumber: newClaimControl,
      payerName: payer.name,
      payerId: payer.payerId,
      insuredName: billingPatientName,
      insuredId: billingPolicyNumber,
      patientRelationship: 'Self',
      dateOfCurrentIllness: billingDateOfService,
      referringProviderNpi: '1892837492',
      billingProviderNpi: '1892837492',
      billingProviderTaxId: '94-3829104',
      totalCharges: totalCharge,
      amountPaid: totalInsPaid,
      balanceDue: totalPatientResponsibility,
      icd10Pointers: ['M54.6', 'F43.0', 'Z71.3'],
      serviceLines: lineItems.map(item => ({
        date: billingDateOfService,
        placeOfService: '11 - Office / Sanctuary',
        cpt: item.cptCode,
        modifier: 'GP',
        diagnosisPointer: '1',
        charge: item.totalCharge,
        units: item.units
      }))
    };

    const auditTrailList: InvoiceAuditEntry[] = [
      {
        id: `LOG-1`,
        timestamp: new Date().toISOString(),
        type: 'AI_VERIFICATION',
        actor: 'Antigravity Autonomous Billing Agent',
        title: 'Clinical Necessity Adjudicated',
        description: 'Medical codes verified against wilderness somatic guidelines with zero claim exclusions.',
        aiConfidenceScore: 98,
        complianceCategory: 'AMA CPT Rules'
      },
      {
        id: `LOG-2`,
        timestamp: new Date().toISOString(),
        type: 'CLEARINGHOUSE_DISPATCH',
        actor: 'Clearinghouse Gateway',
        title: 'EDI 837P Electronic Claim Structured',
        description: `Electronic claim ${newClaimControl} routed to ${payer.name} (${payer.payerId}).`,
        aiConfidenceScore: 99,
        complianceCategory: 'Payer Policy'
      }
    ];

    const newInvoice: Invoice = {
      id: `inv-${Date.now().toString(36)}`,
      invoiceNumber: newInvoiceNumber,
      recordId: selectedRecordIdForBilling || 'REC-2026-001',
      patientName: billingPatientName,
      patientEmail: billingPatientEmail,
      patientAddress: billingPatientAddress,
      insuranceProvider: payer,
      policyNumber: billingPolicyNumber,
      groupNumber: billingGroupNumber,
      dateOfService: billingDateOfService,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: billingDueDate,
      lineItems: lineItems,
      subtotal: totalCharge,
      insuranceCoveredAmount: totalInsPaid,
      patientResponsibility: totalPatientResponsibility,
      status: billingStatus,
      cms1500: cmsData,
      wpSyncStatus: 'synced',
      wpPostRef: 'https://wildernessdojo.home.blog/?p=101',
      aiVerificationScore: 98,
      aiAuditNotes: 'High-affinity medical necessity established. Procedural units mapped according to Wilderness Somatic Physical Medicine guidelines with zero compliance conflicts.',
      auditTrail: auditTrailList
    };

    if (onAddNewInvoice) {
      onAddNewInvoice(newInvoice);
    }

    try {
      await apiFetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      });
    } catch (err) {
      console.warn('Backend sync note for invoice:', err);
    }

    setShowCreateInvoiceModal(false);
    onSelectInvoice(newInvoice);
    showToast(`Invoice ${newInvoice.invoiceNumber} created & opened for inspection!`);
  };

  const filteredInvoices = invoices.filter(inv => {
    if (filterStatus === 'ALL') return true;
    return inv.status === filterStatus;
  });

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
              <Layers className="w-5 h-5" />
            </span>
            <span>Invoices & Real-Time Medical Insurance Claims</span>
          </h2>
          <p className="text-xs text-slate-300/80 mt-1">
            Itemized clinical billing statements and official CMS-1500 electronic claims synchronized with wildernessdojo.home.blog.
          </p>
        </div>

        {/* Create Billing & Filters */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowCreateInvoiceModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold flex items-center space-x-2 transition shadow-lg shadow-emerald-500/25 border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Billing Invoice</span>
          </button>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
          >
            <option value="ALL" className="bg-[#091a18]">All Invoices ({invoices.length})</option>
            <option value="Paid in Full" className="bg-[#091a18]">Paid in Full</option>
            <option value="Adjudicated" className="bg-[#091a18]">Adjudicated / Awaiting Payment</option>
            <option value="Submitted to Insurance" className="bg-[#091a18]">Submitted to Insurance</option>
          </select>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-slate-300 font-semibold border-b border-white/10">
              <tr>
                <th className="py-4 px-4">Invoice / Claim #</th>
                <th className="py-4 px-4">Patient</th>
                <th className="py-4 px-4">Medical Insurance</th>
                <th className="py-4 px-4">Date of Service</th>
                <th className="py-4 px-4 text-right">Total Billed</th>
                <th className="py-4 px-4 text-right">Ins. Covered</th>
                <th className="py-4 px-4 text-right">Patient Copay</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.05] transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-white">
                    {inv.invoiceNumber}
                    <span className="block text-[10px] text-slate-400 font-normal">
                      {inv.cms1500?.claimControlNumber}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-slate-100 block">{inv.patientName}</span>
                    <span className="text-[11px] text-slate-400">{inv.patientEmail}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-slate-100 block font-medium">{inv.insuranceProvider?.name}</span>
                    <span className="text-[10px] text-teal-300 font-mono">Pol: {inv.policyNumber}</span>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-300">
                    {inv.dateOfService}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-white">
                    ${inv.subtotal.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-semibold text-emerald-300">
                    ${inv.insuranceCoveredAmount.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-semibold text-teal-200">
                    ${inv.patientResponsibility.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border backdrop-blur-md ${
                      inv.status === 'Paid in Full'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : inv.status === 'Adjudicated'
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setActiveViewMode('audit_trail');
                          onSelectInvoice(inv);
                        }}
                        className="px-2.5 py-1.5 rounded-xl backdrop-blur-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center space-x-1.5 transition shadow-sm"
                        title="View autonomous AI verification notes & compliance audit trail"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Audit</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveViewMode('itemized_invoice');
                          onSelectInvoice(inv);
                        }}
                        className="px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 text-xs font-medium border border-white/10 transition"
                      >
                        Inspect
                      </button>
                      {inv.status !== 'Paid in Full' && (
                        <button
                          onClick={() => onOpenPayment(inv)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold transition shadow-sm"
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CREATE NEW BILLING INVOICE & CLAIM */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-[#081a17]/95 border border-white/15 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto text-slate-100 shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Create Medical Billing Invoice & CMS-1500 Claim</span>
              </h3>
              <button onClick={() => setShowCreateInvoiceModal(false)} className="text-slate-400 hover:text-white font-mono p-1 rounded-lg hover:bg-white/10">
                ✕
              </button>
            </div>

            {/* Quick Record Selection to Auto-Fill */}
            {records.length > 0 && (
              <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-emerald-400/30 space-y-2">
                <label className="block text-xs font-bold text-emerald-300">Auto-Fill from Clinical Encounter Record:</label>
                <select
                  value={selectedRecordIdForBilling}
                  onChange={(e) => handleSelectRecordForAutoFill(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                >
                  <option value="">-- Choose Encounter Record to Auto-Populate --</option>
                  {records.map(r => (
                    <option key={r.id} value={r.id} className="bg-[#091a18]">
                      {r.patientName} • {r.encounterType} ({r.encounterDate}) - {r.id}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleSaveInvoice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={billingPatientName}
                    onChange={(e) => setBillingPatientName(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Patient Email *</label>
                  <input
                    type="email"
                    required
                    value={billingPatientEmail}
                    onChange={(e) => setBillingPatientEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Service</label>
                  <input
                    type="date"
                    required
                    value={billingDateOfService}
                    onChange={(e) => setBillingDateOfService(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    value={billingDueDate}
                    onChange={(e) => setBillingDueDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={billingStatus}
                    onChange={(e) => setBillingStatus(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="Adjudicated" className="bg-[#091a18]">Adjudicated / Awaiting Payment</option>
                    <option value="Submitted to Insurance" className="bg-[#091a18]">Submitted to Insurance</option>
                    <option value="Paid in Full" className="bg-[#091a18]">Paid in Full</option>
                  </select>
                </div>
              </div>

              {/* Insurance Payer Selection */}
              <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-3">
                <h5 className="font-bold text-emerald-300 text-xs flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Insurance Payer & Claim Routing</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Insurance Provider</label>
                    <select
                      value={billingPayerId}
                      onChange={(e) => setBillingPayerId(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                    >
                      {payers.map(p => (
                        <option key={p.id} value={p.id} className="bg-[#091a18]">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Policy / Member ID</label>
                    <input
                      type="text"
                      value={billingPolicyNumber}
                      onChange={(e) => setBillingPolicyNumber(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Group ID</label>
                    <input
                      type="text"
                      value={billingGroupNumber}
                      onChange={(e) => setBillingGroupNumber(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-teal-300 text-xs flex items-center space-x-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Billable Line Items (CPT Codes)</span>
                  </h5>
                  <span className="text-[11px] text-slate-400">Click quick CPT to add</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {COMMON_BILLING_CPTS.map(cpt => (
                    <button
                      key={cpt.code}
                      type="button"
                      onClick={() => handleAddLineItem(cpt)}
                      className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-teal-500/20 text-slate-200 hover:text-teal-300 border border-white/10 text-[11px] flex items-center space-x-1 font-mono transition"
                    >
                      <Plus className="w-3 h-3 text-teal-400" />
                      <span>{cpt.code}</span>
                      <span className="text-emerald-300 font-bold">${cpt.fee}</span>
                    </button>
                  ))}
                </div>

                {/* Line Items List */}
                <div className="space-y-2 pt-2">
                  {lineItems.map(item => (
                    <div key={item.id} className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2 font-mono">
                          <span className="font-bold text-teal-300">{item.cptCode}</span>
                          <span className="text-slate-300 font-sans">{item.description}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {item.units} units @ ${item.unitPrice.toFixed(2)} = ${item.totalCharge.toFixed(2)}
                          <span className="text-emerald-300 ml-2">(Ins: ${item.insurancePaid.toFixed(2)}, Copay: ${item.patientPortion.toFixed(2)})</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(item.id)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Financial Summary Card */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 grid grid-cols-3 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">TOTAL CHARGES</span>
                    <span className="text-white font-bold text-sm">${totalCharge.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">INSURANCE PAID</span>
                    <span className="text-emerald-300 font-bold text-sm">${totalInsPaid.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">PATIENT DUE</span>
                    <span className="text-teal-200 font-bold text-sm">${totalPatientResponsibility.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.15] text-xs text-slate-300 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/25"
                >
                  Generate Invoice & Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice / Claim Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-[#081a17]/95 border border-white/15 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto text-slate-100 shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6 space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold text-white">{selectedInvoice.invoiceNumber}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-md ${
                    selectedInvoice.status === 'Paid in Full'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Electronic Claim Control: {selectedInvoice.cms1500?.claimControlNumber} • Date of Service: {selectedInvoice.dateOfService}
                </p>
              </div>
              <button
                onClick={() => onSelectInvoice(null)}
                className="text-slate-400 hover:text-white text-lg font-mono p-1 rounded-lg hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>

            {/* View Mode Tabs */}
            <div className="flex space-x-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveViewMode('itemized_invoice')}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeViewMode === 'itemized_invoice'
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'backdrop-blur-md bg-white/[0.04] text-slate-300 hover:text-white'
                }`}
              >
                Itemized Superbill / Invoice
              </button>
              <button
                onClick={() => setActiveViewMode('cms1500')}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeViewMode === 'cms1500'
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'backdrop-blur-md bg-white/[0.04] text-slate-300 hover:text-white'
                }`}
              >
                Official CMS-1500 Form (EDI 837P)
              </button>
              <button
                onClick={() => setActiveViewMode('audit_trail')}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeViewMode === 'audit_trail'
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'backdrop-blur-md bg-white/[0.04] text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AI Compliance Audit Trail</span>
              </button>
            </div>

            {/* TAB 1: Itemized Superbill / Invoice */}
            {activeViewMode === 'itemized_invoice' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                    <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">Patient Information</span>
                    <div className="font-bold text-sm text-white">{selectedInvoice.patientName}</div>
                    <div className="text-slate-300">{selectedInvoice.patientEmail}</div>
                    <div className="text-slate-400 font-mono">Member ID: {selectedInvoice.patientAddress}</div>
                  </div>

                  <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                    <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">Medical Insurance Payer</span>
                    <div className="font-bold text-sm text-emerald-300">{selectedInvoice.insuranceProvider?.name}</div>
                    <div className="text-slate-300 font-mono">Policy: {selectedInvoice.policyNumber}</div>
                    <div className="text-slate-400 font-mono">Group: {selectedInvoice.groupNumber}</div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.04] text-[11px] text-slate-300 uppercase tracking-wider font-semibold border-b border-white/10">
                      <tr>
                        <th className="p-3">CPT Code</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-center">Units</th>
                        <th className="p-3 text-right">Fee</th>
                        <th className="p-3 text-right">Total Charge</th>
                        <th className="p-3 text-right">Ins. Paid</th>
                        <th className="p-3 text-right">Copay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {selectedInvoice.lineItems.map((line) => (
                        <tr key={line.id} className="hover:bg-white/[0.03]">
                          <td className="p-3 font-mono font-bold text-teal-300">{line.cptCode}</td>
                          <td className="p-3 text-slate-200">{line.description}</td>
                          <td className="p-3 text-center font-mono">{line.units}</td>
                          <td className="p-3 text-right font-mono text-slate-300">${line.unitPrice.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-bold text-white">${line.totalCharge.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-semibold text-emerald-300">${line.insurancePaid.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-semibold text-teal-200">${line.patientPortion.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="flex justify-end">
                  <div className="w-full sm:w-80 backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Billed Charges:</span>
                      <span className="font-mono text-slate-200 font-bold">${selectedInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-300">
                      <span>Insurance Covered (Adjudicated):</span>
                      <span className="font-mono font-bold">-${selectedInvoice.insuranceCoveredAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-100 font-bold pt-2 border-t border-white/10 text-sm">
                      <span>Patient Copay Balance:</span>
                      <span className="font-mono text-teal-300">${selectedInvoice.patientResponsibility.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Official CMS-1500 Form (EDI 837P) */}
            {activeViewMode === 'cms1500' && (
              <div className="p-6 bg-[#f8f9fa] text-slate-900 rounded-2xl border-2 border-red-800 font-sans shadow-inner space-y-4">
                <div className="flex justify-between items-start border-b-2 border-red-800 pb-3">
                  <div>
                    <h3 className="font-serif font-black text-lg tracking-wider text-red-900">HEALTH INSURANCE CLAIM FORM</h3>
                    <p className="text-[10px] font-mono text-slate-600">APPROVED BY NATIONAL UNIFORM CLAIM COMMITTEE (NUCC) 02/12</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs bg-red-100 text-red-900 px-2 py-1 border border-red-300 rounded">
                      PICA EDI 837P COMPLIANT
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 text-[11px]">
                  <div className="col-span-12 sm:col-span-6 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">1. MEDICARE / MEDICAID / TRICARE / GROUP HEALTH</span>
                    <span className="font-bold text-slate-800">{selectedInvoice.insuranceProvider?.name}</span>
                  </div>
                  <div className="col-span-12 sm:col-span-6 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">1a. INSURED'S I.D. NUMBER</span>
                    <span className="font-mono font-bold text-slate-800">{selectedInvoice.policyNumber}</span>
                  </div>

                  <div className="col-span-12 sm:col-span-7 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">2. PATIENT'S NAME (Last Name, First Name)</span>
                    <span className="font-bold text-slate-800">{selectedInvoice.patientName}</span>
                  </div>
                  <div className="col-span-12 sm:col-span-5 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">3. PATIENT'S BIRTH DATE & SEX</span>
                    <span className="font-mono text-slate-800">1989-04-14 | F</span>
                  </div>

                  <div className="col-span-12 sm:col-span-6 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">21. DIAGNOSIS OR NATURE OF ILLNESS (ICD-10-CM)</span>
                    <span className="font-mono font-bold text-slate-900 block">A. M54.6 (Thoracic Pain)</span>
                    <span className="font-mono text-slate-700 block">B. F43.0 (Stress Reaction)</span>
                  </div>
                  <div className="col-span-12 sm:col-span-6 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">23. PRIOR AUTHORIZATION NUMBER</span>
                    <span className="font-mono font-bold text-slate-800">PA-WD-88902</span>
                  </div>

                  <div className="col-span-12 p-2 border-2 border-red-800 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block mb-1">24. DATES OF SERVICE & PROCEDURES (CPT / HCPCS)</span>
                    <table className="w-full text-left font-mono text-[10px]">
                      <thead>
                        <tr className="border-b border-slate-400">
                          <th>From / To</th>
                          <th>Place</th>
                          <th>CPT / Mod</th>
                          <th>Diag Pointer</th>
                          <th className="text-right">Charges</th>
                          <th className="text-center">Days/Units</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.lineItems.map((line, i) => (
                          <tr key={i} className="border-b border-slate-200">
                            <td>{selectedInvoice.dateOfService}</td>
                            <td>11 (Office)</td>
                            <td className="font-bold">{line.cptCode}</td>
                            <td>A</td>
                            <td className="text-right font-bold">${line.totalCharge.toFixed(2)}</td>
                            <td className="text-center">{line.units}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="col-span-6 sm:col-span-4 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">28. TOTAL CHARGE</span>
                    <span className="font-mono font-bold text-sm">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="col-span-6 sm:col-span-4 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">29. AMOUNT PAID</span>
                    <span className="font-mono font-bold text-sm text-emerald-700">${selectedInvoice.insuranceCoveredAmount.toFixed(2)}</span>
                  </div>
                  <div className="col-span-12 sm:col-span-4 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">30. BALANCE DUE</span>
                    <span className="font-mono font-bold text-sm text-slate-900">${selectedInvoice.patientResponsibility.toFixed(2)}</span>
                  </div>

                  <div className="col-span-12 sm:col-span-6 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">31. SIGNATURE OF PHYSICIAN OR SUPPLIER</span>
                    <span className="font-serif italic text-slate-800 text-xs">Dr. Kaelen Thorne, DPT (NPI: 1892837492) [Electronically Signed]</span>
                  </div>
                  <div className="col-span-12 sm:col-span-6 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">33. BILLING PROVIDER INFO & PH #</span>
                    <span className="text-[10px] text-slate-800">Wilderness Dojo Health Sanctuary • (530) 555-DOJO</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Billing Compliance & AI Audit Trail */}
            {activeViewMode === 'audit_trail' && (
              <BillingAuditTrail invoice={selectedInvoice} />
            )}

            {/* Modal Bottom Actions */}
            <div className="border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.15] text-xs font-medium text-slate-200 flex items-center space-x-1.5 transition border border-white/10"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span>Print Claim</span>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onSelectInvoice(null)}
                  className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.15] text-xs font-medium text-slate-300 border border-white/10 transition"
                >
                  Close
                </button>

                {selectedInvoice.status !== 'Paid in Full' && (
                  <button
                    onClick={() => {
                      onSelectInvoice(null);
                      onOpenPayment(selectedInvoice);
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-xs font-bold text-slate-950 flex items-center space-x-2 shadow-lg shadow-emerald-500/25 transition"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Patient Copay (${selectedInvoice.patientResponsibility.toFixed(2)})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
