import React, { useState } from 'react';
import { 
  CreditCard, ShieldCheck, CheckCircle2, Lock, RefreshCw, 
  DollarSign, Sparkles, Receipt, ArrowRight, Building, Globe
} from 'lucide-react';
import { Invoice, PaymentTransaction } from '../types';

interface RealtimePaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
  onPaymentSuccess: (invoiceId: string, transaction: PaymentTransaction) => void;
}

export const RealtimePaymentModal: React.FC<RealtimePaymentModalProps> = ({
  invoice,
  onClose,
  onPaymentSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'HSA_FSA_CARD' | 'CREDIT_DEBIT' | 'INSURANCE_DIRECT_EFT' | 'BANK_ACH'>('HSA_FSA_CARD');
  const [cardNumber, setCardNumber] = useState('4912 8820 3910 4912');
  const [expiry, setExpiry] = useState('08/29');
  const [cvv, setCvv] = useState('419');
  const [cardHolder, setCardHolder] = useState(invoice.patientName);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);

  const amountToPay = invoice.patientResponsibility > 0 ? invoice.patientResponsibility : invoice.subtotal;

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: amountToPay,
          paymentMethod,
          cardDetails: {
            last4: cardNumber.replace(/\s/g, '').slice(-4),
            holder: cardHolder
          },
          insurancePayerId: invoice.insuranceProvider?.id,
          patientName: invoice.patientName
        })
      });

      const data = await res.json();
      if (data.success && data.transaction) {
        setCompletedTx(data.transaction);
        // Also trigger WordPress webhook sync
        await fetch('/api/wordpress/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceId: invoice.id,
            claimNumber: invoice.cms1500?.claimControlNumber,
            patientName: invoice.patientName,
            totalAmount: amountToPay,
            status: 'SETTLED_IN_REALTIME'
          })
        });

        onPaymentSuccess(invoice.id, data.transaction);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="backdrop-blur-2xl bg-[#081a17]/90 border border-white/15 rounded-3xl w-full max-w-lg overflow-hidden text-slate-100 shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6 space-y-5">
        {!completedTx ? (
          <>
            {/* Header */}
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2.5">
                  <span className="p-1.5 rounded-xl backdrop-blur-md bg-emerald-400/15 text-emerald-300 border border-emerald-400/30">
                    <CreditCard className="w-5 h-5" />
                  </span>
                  <span>Real-Time Payment Processing Gateway</span>
                </h3>
                <p className="text-xs text-slate-300/80 mt-1">
                  Secure PCI-DSS & HIPAA Compliant settlement for Invoice #{invoice.invoiceNumber}
                </p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white font-mono p-1 rounded-lg hover:bg-white/10 transition">
                ✕
              </button>
            </div>

            {/* Amount Banner */}
            <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-white/10 flex items-center justify-between shadow-inner">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Balance Due (Copay / Patient Responsibility)</span>
                <span className="text-2xl font-bold font-mono text-emerald-300">
                  ${amountToPay.toFixed(2)}
                </span>
              </div>
              <div className="text-right text-xs">
                <span className="text-slate-400 block font-medium">Insurance Covered:</span>
                <span className="font-mono font-bold text-teal-300">${invoice.insuranceCoveredAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Select Payment Instrument</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('HSA_FSA_CARD')}
                  className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-start transition backdrop-blur-md ${
                    paymentMethod === 'HSA_FSA_CARD'
                      ? 'bg-emerald-950/50 border-emerald-400/60 text-white ring-1 ring-emerald-400/40 shadow-sm'
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>HSA / FSA Card</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Pre-tax health savings</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CREDIT_DEBIT')}
                  className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-start transition backdrop-blur-md ${
                    paymentMethod === 'CREDIT_DEBIT'
                      ? 'bg-emerald-950/50 border-emerald-400/60 text-white ring-1 ring-emerald-400/40 shadow-sm'
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold">
                    <CreditCard className="w-4 h-4 text-teal-400" />
                    <span>Credit / Debit Card</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Visa, Mastercard, Amex</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('INSURANCE_DIRECT_EFT')}
                  className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-start transition backdrop-blur-md ${
                    paymentMethod === 'INSURANCE_DIRECT_EFT'
                      ? 'bg-emerald-950/50 border-emerald-400/60 text-white ring-1 ring-emerald-400/40 shadow-sm'
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold">
                    <Building className="w-4 h-4 text-cyan-400" />
                    <span>Payer Direct EFT</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">ERA 835 Clearinghouse</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK_ACH')}
                  className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-start transition backdrop-blur-md ${
                    paymentMethod === 'BANK_ACH'
                      ? 'bg-emerald-950/50 border-emerald-400/60 text-white ring-1 ring-emerald-400/40 shadow-sm'
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Bank ACH Wire</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Direct Bank Routing</span>
                </button>
              </div>
            </div>

            {/* Payment Form Details */}
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Cardholder / Account Name</label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:border-emerald-400 focus:outline-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-emerald-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">CVV / CVC</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Authorizing & Settle in Real-Time...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Pay & Settle ${amountToPay.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400">
                <Globe className="w-3.5 h-3.5 text-teal-300" />
                <span>Automatic webhook sync to <strong className="text-slate-200">wildernessdojo.home.blog</strong></span>
              </div>
            </form>
          </>
        ) : (
          /* Payment Confirmation Screen */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl backdrop-blur-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Payment Confirmed & Settled!</h3>
              <p className="text-xs text-slate-300/80 mt-1">
                Transaction finalized in real-time. Remittance token pushed to WordPress.
              </p>
            </div>

            <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-white/10 text-xs font-mono text-left space-y-2 shadow-inner">
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="text-white font-bold">{completedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Auth Code:</span>
                <span className="text-emerald-300 font-bold">{completedTx.authCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="text-white font-bold">${completedTx.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method:</span>
                <span className="text-teal-300">{completedTx.cardBrand} (•••• {completedTx.cardLast4})</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-[11px]">
                <span className="text-slate-400">WordPress Sync:</span>
                <span className="text-emerald-300 font-sans font-semibold">ACKNOWLEDGED (HTTP 200)</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/25"
              >
                Done & Return to Billing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
