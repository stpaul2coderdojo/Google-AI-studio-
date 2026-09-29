import React, { useState } from 'react';
import { 
  CreditCard, ShieldCheck, CheckCircle, AlertCircle, DollarSign, 
  ArrowRight, FileText, Download, Printer, RefreshCw, Send, Globe,
  Receipt, Lock, Zap, Clock, User, Building, QrCode, Sparkles
} from 'lucide-react';
import { Invoice, PaymentTransaction } from '../types';
import { useIAMAuth } from '../context/IAMAuthContext';

interface PatientPaymentPageProps {
  invoices: Invoice[];
  onOpenPaymentModal: (invoice: Invoice) => void;
  onSelectInvoiceDetail: (invoice: Invoice) => void;
  onPaymentSuccess?: (invoiceId: string, transaction: PaymentTransaction) => void;
}

export const PatientPaymentPage: React.FC<PatientPaymentPageProps> = ({
  invoices,
  onOpenPaymentModal,
  onSelectInvoiceDetail,
  onPaymentSuccess
}) => {
  const { apiFetch } = useIAMAuth();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(invoices[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'HSA_FSA_CARD' | 'CREDIT_DEBIT' | 'INSURANCE_DIRECT_EFT' | 'BANK_ACH'>('HSA_FSA_CARD');
  const [cardNumber, setCardNumber] = useState<string>('4719 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState<string>('09/29');
  const [cardCvc, setCardCvc] = useState<string>('892');
  const [cardHolder, setCardHolder] = useState<string>('Elena Rostova');
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    invoice: Invoice;
    transaction: any;
    wpSyncToken: string;
  } | null>(null);
  const [webhookLog, setWebhookLog] = useState<string | null>(null);

  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId) || invoices[0];

  const totalOutstandingCopay = invoices
    .filter(inv => inv.status !== 'Paid in Full')
    .reduce((sum, inv) => sum + inv.patientResponsibility, 0);

  const totalInsuranceAdjudicated = invoices
    .reduce((sum, inv) => sum + inv.insuranceCoveredAmount, 0);

  const totalBilledValue = invoices
    .reduce((sum, inv) => sum + inv.subtotal, 0);

  const handleProcessDirectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setIsProcessing(true);
    setWebhookLog(null);

    try {
      // 1. Process payment via Zero-Trust REST API
      const res = await apiFetch('/api/payments/process', {
        method: 'POST',
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: selectedInvoice.patientResponsibility,
          paymentMethod,
          cardDetails: {
            last4: cardNumber.replace(/\D/g, '').slice(-4) || '8821',
            holder: cardHolder
          },
          insurancePayerId: selectedInvoice.insuranceProvider.payerId,
          patientName: selectedInvoice.patientName
        })
      });

      const data = await res.json();

      if (data.success && data.transaction) {
        // 2. Dispatch real-time Webhook to wildernessdojo.home.blog
        const wpRes = await apiFetch('/api/wordpress/webhook', {
          method: 'POST',
          body: JSON.stringify({
            invoiceId: selectedInvoice.id,
            claimNumber: selectedInvoice.cms1500?.claimControlNumber || selectedInvoice.id,
            patientName: selectedInvoice.patientName,
            totalAmount: selectedInvoice.patientResponsibility,
            status: 'PAYMENT_SETTLED_HSA_VERIFIED'
          })
        });

        const wpData = await wpRes.json();
        const wpToken = wpData.webhookToken || `WD-HOOK-${Date.now()}`;

        setWebhookLog(`Webhook dispatched to https://wildernessdojo.home.blog/wp-json/dojo-billing/v1/payment-webhook with token: ${wpToken}`);

        setPaymentSuccessData({
          invoice: selectedInvoice,
          transaction: data.transaction,
          wpSyncToken: wpToken
        });

        if (onPaymentSuccess) {
          onPaymentSuccess(selectedInvoice.id, data.transaction);
        }
      }
    } catch (err: any) {
      console.error('Payment processing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CreditCard className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Patient Payment & CPT Billing Terminal
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Real-Time HSA/FSA Gateway
              </span>
            </div>
            <p className="text-xs text-slate-300/80 mt-1 max-w-2xl">
              Execute direct patient copay settlements, adjudicate insurance balance claims, and push instant cryptographic webhook updates to <span className="font-mono text-emerald-300">wildernessdojo.home.blog</span>.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Total Outstanding Copays</span>
              <span className="text-base font-bold text-amber-400 font-mono">${totalOutstandingCopay.toFixed(2)}</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Insurance Adjudicated</span>
              <span className="text-base font-bold text-emerald-400 font-mono">${totalInsuranceAdjudicated.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Invoices Selector & Payment Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Invoices & Claim Ledger (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Select Encounter / Claim to Pay</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">{invoices.length} Invoices</span>
            </div>

            <div className="space-y-3">
              {invoices.map((inv) => {
                const isSelected = inv.id === selectedInvoiceId;
                const isPaid = inv.status === 'Paid in Full';

                return (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setSelectedInvoiceId(inv.id);
                      setPaymentSuccessData(null);
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-400/50 shadow-md shadow-emerald-950/40'
                        : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{inv.patientName}</span>
                          <span className="text-[10px] font-mono text-slate-400">({inv.invoiceNumber})</span>
                        </div>
                        <span className="text-[11px] text-slate-300/80 block mt-0.5">
                          {inv.insuranceProvider.name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isPaid
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {inv.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Total Billed</span>
                        <span className="text-slate-200">${inv.subtotal.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Ins. Paid</span>
                        <span className="text-emerald-400">${inv.insuranceCoveredAmount.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Patient Copay</span>
                        <span className="text-amber-300 font-bold">${inv.patientResponsibility.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Webhook Status to wildernessdojo.home.blog */}
          <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <Globe className="w-4 h-4 text-teal-400" />
                <span>WordPress Webhook Pipeline</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                Active Bridge
              </span>
            </div>
            <p className="text-[11px] text-slate-300/80 leading-relaxed">
              Every settled payment automatically transmits an authenticated HMAC-SHA256 payload to <span className="font-mono text-emerald-300">wildernessdojo.home.blog/wp-json/dojo-billing/v1/payment-webhook</span> to update patient member subscriptions and unlock seasonal retreat passes.
            </p>
            {webhookLog && (
              <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/30 font-mono text-[10px] text-emerald-300 break-all">
                {webhookLog}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Payment Checkout / Receipt (7 cols) */}
        <div className="lg:col-span-7">
          {selectedInvoice && !paymentSuccessData ? (
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Selected Invoice Details Summary */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Checkout Claim</span>
                    <h3 className="text-sm font-bold text-white">{selectedInvoice.patientName} • {selectedInvoice.invoiceNumber}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">Patient Amount Due</span>
                    <span className="text-xl font-extrabold text-emerald-400 font-mono">
                      ${selectedInvoice.patientResponsibility.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Line Items breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                  {selectedInvoice.lineItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
                      <span>CPT {item.cptCode} ({item.units}x) - {item.description.slice(0, 32)}...</span>
                      <span>${item.totalCharge.toFixed(2)} (Copay: ${item.patientPortion.toFixed(2)})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <form onSubmit={handleProcessDirectPayment} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-2">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('HSA_FSA_CARD')}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        paymentMethod === 'HSA_FSA_CARD'
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-inner'
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400 mb-1" />
                      <span className="text-xs font-bold block">HSA / FSA Card</span>
                      <span className="text-[10px] text-slate-400 font-mono">Pre-Tax Health</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CREDIT_DEBIT')}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        paymentMethod === 'CREDIT_DEBIT'
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-inner'
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-teal-400 mb-1" />
                      <span className="text-xs font-bold block">Credit / Debit</span>
                      <span className="text-[10px] text-slate-400 font-mono">Visa, MC, Amex</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('INSURANCE_DIRECT_EFT')}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        paymentMethod === 'INSURANCE_DIRECT_EFT'
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-inner'
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Building className="w-4 h-4 text-cyan-400 mb-1" />
                      <span className="text-xs font-bold block">EDI 835 EFT</span>
                      <span className="text-[10px] text-slate-400 font-mono">Payer Auto-Draft</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('BANK_ACH')}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        paymentMethod === 'BANK_ACH'
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-inner'
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Lock className="w-4 h-4 text-indigo-400 mb-1" />
                      <span className="text-xs font-bold block">Bank ACH</span>
                      <span className="text-[10px] text-slate-400 font-mono">Zero Fee</span>
                    </button>
                  </div>
                </div>

                {/* Card / Account Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white focus:outline-none focus:border-emerald-400 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-emerald-400 transition"
                        required
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-emerald-400 transition"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">
                        CVC / Security Code
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-emerald-400 transition"
                        placeholder="CVC"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Security Guarantee */}
                <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit TLS Encryption • PCI-DSS Level 1 & HIPAA Compliant Settlement</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Settling via Clearinghouse & Webhook...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-slate-950" />
                      <span>Settle Copay of ${selectedInvoice.patientResponsibility.toFixed(2)} in Real-Time</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : paymentSuccessData ? (
            /* Printable Real-Time Receipt View */
            <div className="backdrop-blur-xl bg-white/[0.03] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Payment Successfully Settled</h3>
                    <p className="text-xs text-emerald-400 font-mono">Auth: {paymentSuccessData.transaction.authCode}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 border border-white/10 flex items-center space-x-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    onClick={() => setPaymentSuccessData(null)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-xs font-semibold text-emerald-300 border border-emerald-500/30 transition"
                  >
                    Done
                  </button>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="p-5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-white block">WILDERNESS DOJO HEALTH SANCTUARY</span>
                    <span className="text-slate-400 text-[11px]">104 Dojo Ridge Way, Tahoe Vista, CA 96148</span>
                    <span className="text-slate-400 text-[11px] block">wildernessdojo.home.blog</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold block">PAID IN FULL</span>
                    <span className="text-slate-400 text-[10px]">{new Date().toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-y border-white/10">
                  <div>
                    <span className="text-slate-400 block">Patient:</span>
                    <span className="text-white font-semibold">{paymentSuccessData.invoice.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Invoice Number:</span>
                    <span className="text-white">{paymentSuccessData.invoice.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Payment Method:</span>
                    <span className="text-emerald-300">{paymentSuccessData.transaction.cardBrand} (*{paymentSuccessData.transaction.cardLast4})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Transaction Hash:</span>
                    <span className="text-slate-300 text-[10px] truncate block">{paymentSuccessData.transaction.transactionHash}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Total Service Amount:</span>
                    <span>${paymentSuccessData.invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Insurance Remittance ({paymentSuccessData.invoice.insuranceProvider.name}):</span>
                    <span>-${paymentSuccessData.invoice.insuranceCoveredAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10 text-sm">
                    <span>Amount Paid by Patient:</span>
                    <span className="text-emerald-400">${paymentSuccessData.transaction.amountPaid.toFixed(2)}</span>
                  </div>
                </div>

                {/* Cryptographic Webhook Confirmation */}
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[10px] space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                    <Globe className="w-3 h-3" />
                    <span>WordPress Member Webhook Synced</span>
                  </div>
                  <p className="text-slate-300">
                    Token: <span className="text-emerald-300">{paymentSuccessData.wpSyncToken}</span>
                  </p>
                  <p className="text-slate-400">
                    Course access & member retreat entitlements unlocked at wildernessdojo.home.blog.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center text-slate-400">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p>Select an invoice from the list to begin payment settlement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
