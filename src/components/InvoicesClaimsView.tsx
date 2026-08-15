import React, { useState } from 'react';
import { 
  Layers, FileText, CheckCircle2, CreditCard, Printer, Download, 
  ExternalLink, QrCode, Shield, ArrowRight, Clock, AlertTriangle, Building,
  ShieldCheck, History, Sparkles, Bot
} from 'lucide-react';
import { Invoice } from '../types';
import { BillingAuditTrail } from './BillingAuditTrail';

interface InvoicesClaimsViewProps {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  onSelectInvoice: (invoice: Invoice | null) => void;
  onOpenPayment: (invoice: Invoice) => void;
}

export const InvoicesClaimsView: React.FC<InvoicesClaimsViewProps> = ({
  invoices,
  selectedInvoice,
  onSelectInvoice,
  onOpenPayment
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'itemized_invoice' | 'cms1500' | 'audit_trail'>('itemized_invoice');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredInvoices = invoices.filter(inv => {
    if (filterStatus === 'ALL') return true;
    return inv.status === filterStatus;
  });

  return (
    <div className="space-y-6">
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

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
          >
            <option value="ALL" className="bg-[#091a18]">All Invoices ({invoices.length})</option>
            <option value="Paid in Full" className="bg-[#091a18]">Paid in Full</option>
            <option value="Adjudicated" className="bg-[#091a18]">Adjudicated / Awaiting Payment</option>
            <option value="Submitted to Insurance" className="bg-[#091a18]">Submitted to Insurance</option>
          </select>
        </div>
      </div>

      {/* Invoices List */}
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
                        <span>Audit Trail</span>
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

      {/* Selected Invoice Full Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-[#081a17]/90 border border-white/15 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto text-slate-100 shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold text-white">
                    Medical Invoice: {selectedInvoice.invoiceNumber}
                  </h3>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-md ${
                    selectedInvoice.status === 'Paid in Full'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Encounter Claim Control: {selectedInvoice.cms1500?.claimControlNumber} • Date of Service: {selectedInvoice.dateOfService}
                </p>
              </div>

              {/* View Switcher: Itemized vs CMS-1500 Form vs Audit Trail */}
              <div className="flex items-center space-x-2">
                <div className="backdrop-blur-md bg-white/[0.05] p-1 rounded-2xl border border-white/10 flex items-center space-x-1 text-xs">
                  <button
                    onClick={() => setActiveViewMode('itemized_invoice')}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                      activeViewMode === 'itemized_invoice'
                        ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Itemized Statement
                  </button>
                  <button
                    onClick={() => setActiveViewMode('cms1500')}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                      activeViewMode === 'cms1500'
                        ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    CMS-1500 Form
                  </button>
                  <button
                    onClick={() => setActiveViewMode('audit_trail')}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center space-x-1.5 ${
                      activeViewMode === 'audit_trail'
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Audit Trail</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                      activeViewMode === 'audit_trail' ? 'bg-black/30 text-slate-950 font-bold' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {selectedInvoice.aiVerificationScore || 98}%
                    </span>
                  </button>
                </div>
                <button
                  onClick={() => onSelectInvoice(null)}
                  className="text-slate-400 hover:text-white text-lg font-mono p-1 rounded-lg hover:bg-white/10 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* TAB 1: Itemized Clinical Invoice View */}
            {activeViewMode === 'itemized_invoice' && (
              <div className="space-y-6 backdrop-blur-xl bg-white/[0.03] p-6 rounded-3xl border border-white/10 shadow-inner">
                {/* Dojo Header & Patient / Payer Blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-white/10 pb-6">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
                        WD
                      </div>
                      <span className="font-bold text-base text-white">Wilderness Dojo Health Sanctuary</span>
                    </div>
                    <p className="text-xs text-slate-300/80 mt-2 leading-relaxed">
                      104 Dojo Ridge Way, Tahoe Vista, CA 96148<br />
                      NPI: 1892837492 • Tax ID: 94-3829104<br />
                      Portal: <span className="text-teal-300 font-mono">wildernessdojo.home.blog</span>
                    </p>
                  </div>

                  <div className="sm:text-right text-xs space-y-1">
                    <span className="text-slate-400 block font-semibold">Billed To (Patient):</span>
                    <span className="text-white font-bold text-sm block">{selectedInvoice.patientName}</span>
                    <span className="text-slate-300 block">{selectedInvoice.patientAddress}</span>
                    <span className="text-slate-400 block pt-1">
                      Primary Insurance: <strong className="text-emerald-300">{selectedInvoice.insuranceProvider?.name}</strong>
                    </span>
                    <span className="text-slate-400 block font-mono">
                      Policy #: {selectedInvoice.policyNumber} • Group: {selectedInvoice.groupNumber}
                    </span>
                  </div>
                </div>

                {/* Line Items Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-3">
                    Itemized Medical & Somatic Services (CPT Procedural Schedule)
                  </h4>
                  <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full text-xs text-slate-200 text-left">
                      <thead className="bg-white/[0.04] text-slate-300 border-b border-white/10 font-semibold text-[11px]">
                        <tr>
                          <th className="py-3 px-3.5">CPT Code</th>
                          <th className="py-3 px-3.5">Service Description</th>
                          <th className="py-3 px-3.5 text-center">Units</th>
                          <th className="py-3 px-3.5 text-right">Fee</th>
                          <th className="py-3 px-3.5 text-right">Total Charge</th>
                          <th className="py-3 px-3.5 text-right">Ins. Paid</th>
                          <th className="py-3 px-3.5 text-right">Patient Copay</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06] font-mono">
                        {selectedInvoice.lineItems.map((item) => (
                          <tr key={item.id} className="hover:bg-white/[0.02]">
                            <td className="py-3 px-3.5 font-bold text-emerald-300">{item.cptCode}</td>
                            <td className="py-3 px-3.5 font-sans text-slate-200">{item.description}</td>
                            <td className="py-3 px-3.5 text-center">{item.units}</td>
                            <td className="py-3 px-3.5 text-right">${item.unitPrice.toFixed(2)}</td>
                            <td className="py-3 px-3.5 text-right font-bold text-white">${item.totalCharge.toFixed(2)}</td>
                            <td className="py-3 px-3.5 text-right text-emerald-300 font-semibold">${item.insurancePaid.toFixed(2)}</td>
                            <td className="py-3 px-3.5 text-right text-teal-200 font-semibold">${item.patientPortion.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Summary & QR Verification */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-4 border-t border-white/10 items-center">
                  <div className="sm:col-span-6 p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center text-slate-950 shadow">
                      <QrCode className="w-14 h-14" />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <span className="font-bold text-slate-100 block">Cryptographic Invoice Verification</span>
                      <span className="text-[11px] text-slate-400 font-mono block">Hash: {selectedInvoice.id}</span>
                      <span className="text-[10px] text-emerald-300 block">Verified on wildernessdojo.home.blog</span>
                    </div>
                  </div>

                  <div className="sm:col-span-6 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Gross Charges:</span>
                      <span className="text-white font-bold">${selectedInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-300">
                      <span>Medical Insurance Remittance:</span>
                      <span className="font-bold">-${selectedInvoice.insuranceCoveredAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-teal-200 pt-2 border-t border-white/10">
                      <span>Patient Responsibility / Copay:</span>
                      <span>${selectedInvoice.patientResponsibility.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Official Standard CMS-1500 Medical Claim Form View */}
            {activeViewMode === 'cms1500' && (
              <div className="space-y-4 bg-white text-slate-900 p-6 rounded-2xl font-sans text-xs border-4 border-red-700/80 shadow-2xl">
                {/* Red Header Standard */}
                <div className="border-b-2 border-red-700 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-red-700 text-sm tracking-wider uppercase">
                      HEALTH INSURANCE CLAIM FORM (CMS-1500)
                    </h3>
                    <p className="text-[10px] text-slate-600 font-medium">
                      APPROVED BY NATIONAL UNIFORM CLAIM COMMITTEE (NUCC) 02/12
                    </p>
                  </div>
                  <div className="text-right text-[11px] font-mono">
                    <span className="font-bold text-red-700">EDI 837P REAL-TIME</span>
                  </div>
                </div>

                {/* Form Boxes Grid */}
                <div className="grid grid-cols-12 gap-2 text-[11px]">
                  <div className="col-span-12 sm:col-span-6 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">1. MEDICARE / MEDICAID / TRICARE / GROUP HEALTH PLAN</span>
                    <span className="font-bold uppercase text-slate-900">{selectedInvoice.insuranceProvider?.name}</span>
                  </div>
                  <div className="col-span-12 sm:col-span-6 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">1a. INSURED'S I.D. NUMBER</span>
                    <span className="font-mono font-bold">{selectedInvoice.policyNumber}</span>
                  </div>

                  <div className="col-span-12 sm:col-span-7 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">2. PATIENT'S NAME (Last Name, First Name)</span>
                    <span className="font-bold uppercase">{selectedInvoice.patientName}</span>
                  </div>
                  <div className="col-span-12 sm:col-span-5 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">3. PATIENT'S BIRTH DATE</span>
                    <span className="font-mono">1989-04-14 (Female)</span>
                  </div>

                  <div className="col-span-12 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block">21. DIAGNOSIS OR NATURE OF ILLNESS OR INJURY (ICD-10-CM)</span>
                    <div className="flex flex-wrap gap-3 font-mono font-bold mt-1 text-slate-900">
                      {selectedInvoice.cms1500?.icd10Pointers.map((icd, i) => (
                        <span key={icd} className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs">
                          {String.fromCharCode(65 + i)}: {icd}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 24. Service Lines */}
                  <div className="col-span-12 p-2 border border-slate-400 rounded-lg">
                    <span className="text-[9px] font-bold text-red-700 block mb-1">
                      24. DATES OF SERVICE, PROCEDURES, SERVICES, OR SUPPLIES (CPT / HCPCS)
                    </span>
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className="bg-slate-100 text-slate-700 text-[10px]">
                        <tr>
                          <th className="p-1">Date</th>
                          <th className="p-1">Place</th>
                          <th className="p-1">CPT</th>
                          <th className="p-1">Mod</th>
                          <th className="p-1 text-right">Charges</th>
                          <th className="p-1 text-center">Days/Units</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.cms1500?.serviceLines.map((line, idx) => (
                          <tr key={idx} className="border-t border-slate-200">
                            <td className="p-1">{line.date}</td>
                            <td className="p-1">{line.placeOfService}</td>
                            <td className="p-1 font-bold text-red-700">{line.cpt}</td>
                            <td className="p-1">{line.modifier}</td>
                            <td className="p-1 text-right font-bold">${line.charge.toFixed(2)}</td>
                            <td className="p-1 text-center">{line.units}</td>
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
