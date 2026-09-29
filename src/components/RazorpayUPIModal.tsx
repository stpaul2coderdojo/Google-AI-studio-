import React, { useState, useEffect } from 'react';
import { 
  X, QrCode, Smartphone, CreditCard, Building2, CheckCircle2, 
  ShieldCheck, ArrowRight, RefreshCw, Copy, Check, ExternalLink, 
  Clock, AlertCircle, Sparkles, Receipt, Lock
} from 'lucide-react';
import { useIAMAuth } from '../context/IAMAuthContext';
import { PurchaseInvoice, RazorpayOrderDetails } from '../types';

interface RazorpayUPIModalProps {
  invoice: PurchaseInvoice;
  onClose: () => void;
  onPaymentSuccess: (invoiceId: string, paymentDetails: any) => void;
}

export const RazorpayUPIModal: React.FC<RazorpayUPIModalProps> = ({
  invoice,
  onClose,
  onPaymentSuccess
}) => {
  const { apiFetch } = useIAMAuth();
  const [activeMethod, setActiveMethod] = useState<'UPI_QR' | 'UPI_VPA' | 'CARD' | 'NETBANKING'>('CARD');
  
  // Order state
  const [orderDetails, setOrderDetails] = useState<RazorpayOrderDetails | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  
  // UPI VPA state
  const [upiVpa, setUpiVpa] = useState('bheemaiah@oksbi');
  const [isVpaRequested, setIsVpaRequested] = useState(false);
  const [vpaMessage, setVpaMessage] = useState('');
  
  // Card state
  const [cardNumber, setCardNumber] = useState('4532 8912 7701 4920');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('819');
  const [cardHolder, setCardHolder] = useState(invoice.customerName);
  
  // Netbanking state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  
  // Processing & verification
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Countdown timer for QR (15 mins)
  const [timeLeft, setTimeLeft] = useState(900);

  // Amount in INR for UPI payment
  const amountInr = invoice.currency === 'INR' 
    ? invoice.totalAmount 
    : Math.round(invoice.totalAmount * (invoice.exchangeRateToInr || 86.5));
  
  const formattedInr = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amountInr);

  const formattedOriginal = new Intl.NumberFormat(invoice.currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: invoice.currency,
    maximumFractionDigits: 2
  }).format(invoice.totalAmount);

  // Initialize Razorpay Order on mount
  useEffect(() => {
    let isMounted = true;

    async function initOrder() {
      setIsLoadingOrder(true);
      try {
        const res = await apiFetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purchaseInvoiceId: invoice.id,
            amount: amountInr,
            currency: 'INR',
            notes: {
              invoiceNumber: invoice.invoiceNumber,
              customerName: invoice.customerName,
              customerEmail: invoice.customerEmail
            }
          })
        });

        const data = await res.json();
        if (isMounted && data.success && data.order) {
          setOrderDetails(data.order);
        }
      } catch (err) {
        console.error('Failed to create Razorpay order:', err);
      } finally {
        if (isMounted) setIsLoadingOrder(false);
      }
    }

    initOrder();

    return () => {
      isMounted = false;
    };
  }, [invoice.id, amountInr]);

  // QR Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || completedPayment) return;
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, completedPayment]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Verify Payment Handler
  const handleVerifyPayment = async (methodUsed: string, vpaUsed?: string) => {
    if (methodUsed.startsWith('UPI')) {
      alert('UPI payments have been deprecated and disabled. Please select Credit/Debit Card or NetBanking.');
      setActiveMethod('CARD');
      return;
    }

    setIsProcessing(true);
    try {
      const orderId = orderDetails?.id || `order_${Date.now()}`;
      const paymentId = `pay_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const res = await apiFetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          purchaseInvoiceId: invoice.id,
          paymentMethod: methodUsed
        })
      });

      const data = await res.json();
      if (data.success) {
        setCompletedPayment(data);
        onPaymentSuccess(invoice.id, data);
      } else {
        alert(data.error || 'Payment verification failed.');
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Direct VPA Collect Request (DEPRECATED)
  const handleSendVpaRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('UPI payments and VPA collect requests have been deprecated and disabled. Please use Credit/Debit Card or NetBanking.');
    setActiveMethod('CARD');
  };

  const copyUpiPayload = () => {
    if (orderDetails?.upi_qr_payload) {
      navigator.clipboard.writeText(orderDetails.upi_qr_payload);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl backdrop-blur-3xl bg-[#091b17]/95 border border-white/15 rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.7)] text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/30 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base">Razorpay Smart Gateway</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-medium border border-amber-500/30">
                  UPI Deprecated &bull; Cards Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Invoice {invoice.invoiceNumber} &bull; Wilderness Dojo Sanctuary
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invoice Summary Banner */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-950/40 border-b border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Total Payable</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-white font-mono tracking-tight">{formattedInr}</span>
              {invoice.currency !== 'INR' && (
                <span className="text-xs text-slate-400">({formattedOriginal} @ ₹{invoice.exchangeRateToInr || 86.5}/$)</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono inline-flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>PCI-DSS Level 1 &bull; 0% Fee</span>
            </span>
          </div>
        </div>

        {!completedPayment ? (
          <div className="p-6 space-y-6">
            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveMethod('CARD')}
                className={`py-2 px-1 rounded-xl font-medium transition flex flex-col items-center justify-center space-y-1 ${
                  activeMethod === 'CARD'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[11px]">Cards (Active)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('NETBANKING')}
                className={`py-2 px-1 rounded-xl font-medium transition flex flex-col items-center justify-center space-y-1 ${
                  activeMethod === 'NETBANKING'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-[11px]">Netbanking</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('UPI_QR')}
                className={`py-2 px-1 rounded-xl font-medium transition flex flex-col items-center justify-center space-y-1 ${
                  activeMethod === 'UPI_QR'
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/30 text-amber-300 font-mono font-bold">DEP</span>
                </div>
                <span className="text-[10px] line-through opacity-75">UPI QR</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('UPI_VPA')}
                className={`py-2 px-1 rounded-xl font-medium transition flex flex-col items-center justify-center space-y-1 ${
                  activeMethod === 'UPI_VPA'
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/30 text-amber-300 font-mono font-bold">DEP</span>
                </div>
                <span className="text-[10px] line-through opacity-75">UPI VPA</span>
              </button>
            </div>

            {/* TAB 1: UPI QR CODE (DEPRECATED) */}
            {activeMethod === 'UPI_QR' && (
              <div className="flex flex-col items-center space-y-4">
                {/* Prominent Deprecation Banner */}
                <div className="w-full p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>UPI Payment Channel Deprecated & Disabled</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Transactions via UPI QR Code and deep links have been officially deprecated and deactivated. Initiation of new UPI payments is permanently disabled. Please use Credit/Debit Card or NetBanking.
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveMethod('CARD')}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold inline-flex items-center space-x-1.5 transition shadow-sm"
                    >
                      <span>Switch to Credit / Debit Card</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-center space-y-0.5 opacity-60">
                  <p className="text-xs font-semibold text-slate-400 line-through">Scan with Any UPI App</p>
                  <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM &bull; Channel Inactive</p>
                </div>

                {/* QR Code Container - Grayscale with Deprecated Overlay */}
                <div className="relative p-4 rounded-3xl bg-white/70 border-4 border-slate-700 shadow-2xl flex flex-col items-center opacity-40 grayscale pointer-events-none">
                  <div className="relative">
                    {/* Stylized QR Representation */}
                    <svg className="w-48 h-48 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="5" y="5" width="24" height="24" rx="3" fill="#0f172a" />
                      <rect x="8" y="8" width="18" height="18" fill="white" />
                      <rect x="11" y="11" width="12" height="12" fill="#64748b" />

                      <rect x="71" y="5" width="24" height="24" rx="3" fill="#0f172a" />
                      <rect x="74" y="8" width="18" height="18" fill="white" />
                      <rect x="77" y="11" width="12" height="12" fill="#64748b" />

                      <rect x="5" y="71" width="24" height="24" rx="3" fill="#0f172a" />
                      <rect x="8" y="74" width="18" height="18" fill="white" />
                      <rect x="11" y="77" width="12" height="12" fill="#64748b" />

                      <circle cx="34" cy="10" r="2.5" />
                      <circle cx="42" cy="10" r="2.5" />
                      <circle cx="50" cy="10" r="2.5" />
                      <circle cx="58" cy="10" r="2.5" />
                      <circle cx="66" cy="10" r="2.5" />
                      
                      <circle cx="34" cy="18" r="2.5" />
                      <circle cx="46" cy="18" r="2.5" />
                      <circle cx="54" cy="18" r="2.5" />
                      <circle cx="62" cy="18" r="2.5" />

                      <circle cx="10" cy="34" r="2.5" />
                      <circle cx="18" cy="34" r="2.5" />
                      <circle cx="26" cy="34" r="2.5" />
                      <circle cx="34" cy="34" r="2.5" />
                      <circle cx="42" cy="34" r="2.5" />
                      <circle cx="50" cy="34" r="2.5" />
                      <circle cx="58" cy="34" r="2.5" />
                      <circle cx="66" cy="34" r="2.5" />
                      <circle cx="74" cy="34" r="2.5" />
                      <circle cx="82" cy="34" r="2.5" />
                      <circle cx="90" cy="34" r="2.5" />

                      <rect x="36" y="36" width="28" height="28" rx="6" fill="#0f172a" />
                      <text x="50" y="54" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">UPI</text>
                    </svg>
                  </div>
                </div>

                {/* Instant Verification Simulation Action - DISABLED */}
                <button
                  type="button"
                  disabled={true}
                  className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-500 font-bold text-xs tracking-wide flex items-center justify-center space-x-2 cursor-not-allowed"
                >
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>UPI Payments Disabled (Deprecated)</span>
                </button>
              </div>
            )}

            {/* TAB 2: UPI ID / VPA (DEPRECATED) */}
            {activeMethod === 'UPI_VPA' && (
              <div className="space-y-4">
                {/* Prominent Deprecation Banner */}
                <div className="w-full p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>UPI VPA Collect Requests Deprecated & Disabled</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Virtual Payment Address (VPA) collect requests have been deprecated and disabled. In-flight requests cannot be dispatched. Please use Credit/Debit Card or NetBanking to complete payment.
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveMethod('CARD')}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold inline-flex items-center space-x-1.5 transition shadow-sm"
                    >
                      <span>Switch to Credit / Debit Card</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 opacity-50">
                  <label className="text-xs font-semibold text-white block">Enter your UPI ID / Virtual Address (VPA)</label>
                  <p className="text-[11px] text-slate-400">Collect requests are permanently deactivated.</p>
                </div>

                <div className="relative opacity-50">
                  <input
                    type="text"
                    value={upiVpa}
                    disabled={true}
                    placeholder="e.g. yourname@oksbi"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 text-slate-400 placeholder-slate-600 text-sm font-mono cursor-not-allowed"
                  />
                  <div className="absolute right-3 top-3 text-[10px] text-amber-400 font-semibold uppercase">
                    Channel Deprecated
                  </div>
                </div>

                <button
                  type="button"
                  disabled={true}
                  className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-500 font-bold text-xs tracking-wide flex items-center justify-center space-x-2 cursor-not-allowed"
                >
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>UPI VPA Collect Requests Disabled (Deprecated)</span>
                </button>
              </div>
            )}

            {/* TAB 3: CARDS (Visa / Mastercard / RuPay) */}
            {activeMethod === 'CARD' && (
              <form onSubmit={(e) => { e.preventDefault(); handleVerifyPayment('CARD'); }} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="4532 8912 7701 4920"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="08/29"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="819"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="Marcus Vance"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wide flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Processing Card Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-slate-950" />
                      <span>Pay {formattedInr} via Secure Card Gateway</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 4: NETBANKING */}
            {activeMethod === 'NETBANKING' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white">Select Your Bank</label>
                  <p className="text-[11px] text-slate-400">Direct instant debit via Indian Netbanking Gateway</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                        selectedBank === bank
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-white font-semibold'
                          : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <span>{bank}</span>
                      {selectedBank === bank && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyPayment(`NETBANKING_${selectedBank.toUpperCase().replace(/\s+/g, '_')}`)}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wide flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Redirecting to {selectedBank}...</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 text-slate-950" />
                      <span>Proceed with {selectedBank} ({formattedInr})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* PAYMENT SUCCESS CONFIRMATION RECEIPT */
          <div className="p-6 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-bold text-white tracking-tight">Payment Successfully Captured!</h4>
              <p className="text-xs text-slate-300">
                Razorpay Secure Network confirmed real-time settlement for <strong>{invoice.invoiceNumber}</strong>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs space-y-2 text-left font-mono">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Payment ID:</span>
                <span className="text-emerald-300 font-bold">{completedPayment.paymentId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Gateway Ref:</span>
                <span className="text-white">{completedPayment.gatewayRef || completedPayment.orderId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Receipt Number:</span>
                <span className="text-white">{completedPayment.receiptNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Amount Settled:</span>
                <span className="text-emerald-400 font-bold">{formattedInr}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Payment Channel:</span>
                <span className="text-slate-300 font-semibold text-emerald-400">Secure Card / Netbanking</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-500/20"
              >
                <span>Done & Return to Invoices</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer Security Badges */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted Razorpay Gateway</span>
          </div>
          <div className="font-mono text-[10px] text-amber-400/90">
            UPI Deprecated &bull; Cards & Netbanking Supported
          </div>
        </div>

      </div>
    </div>
  );
};
