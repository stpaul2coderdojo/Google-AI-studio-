import React, { useState } from 'react';
import { 
  ShoppingBag, Plus, Search, Filter, CreditCard, Smartphone, 
  QrCode, CheckCircle2, Clock, AlertCircle, ArrowUpRight, 
  DollarSign, Receipt, FileText, Printer, Trash2, Edit3, 
  Copy, Check, ShieldCheck, Sparkles, Building, Globe
} from 'lucide-react';
import { PurchaseInvoice, PurchaseInvoiceItem } from '../types';
import { RazorpayUPIModal } from './RazorpayUPIModal';
import { useIAMAuth } from '../context/IAMAuthContext';

interface PurchaseInvoicingPanelProps {
  invoices: PurchaseInvoice[];
  onAddNewInvoice: (invoice: PurchaseInvoice) => void;
  onUpdateInvoice: (invoice: PurchaseInvoice) => void;
  onDeleteInvoice?: (id: string) => void;
}

export const PurchaseInvoicingPanel: React.FC<PurchaseInvoicingPanelProps> = ({
  invoices,
  onAddNewInvoice,
  onUpdateInvoice,
  onDeleteInvoice
}) => {
  const { apiFetch } = useIAMAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ISSUED' | 'PAYMENT_PENDING' | 'PAID' | 'DRAFT'>('ALL');
  
  // Selected invoice for Razorpay UPI modal
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<PurchaseInvoice | null>(null);
  
  // Selected invoice for detailed view / print
  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState<PurchaseInvoice | null>(null);
  
  // Create modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // New invoice form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<PurchaseInvoiceItem[]>([
    {
      id: 'item-1',
      description: 'High Sierra Somatic Conditioning Sanctuary Pass',
      category: 'Retreat Package',
      quantity: 1,
      unitPrice: 45000,
      taxPercent: 18,
      total: 53100
    }
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Line item helpers
  const handleAddLineItem = () => {
    const newItem: PurchaseInvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      category: 'Retreat Package',
      quantity: 1,
      unitPrice: 0,
      taxPercent: currency === 'INR' ? 18 : 0,
      total: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleUpdateLineItem = (index: number, field: keyof PurchaseInvoiceItem, val: any) => {
    const updated = [...lineItems];
    const current = { ...updated[index], [field]: val };

    const qty = Number(current.quantity) || 1;
    const price = Number(current.unitPrice) || 0;
    const tax = Number(current.taxPercent) || 0;
    current.total = Number((qty * price * (1 + tax / 100)).toFixed(2));

    updated[index] = current;
    setLineItems(updated);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  // Form Calculations
  const calculatedSubtotal = lineItems.reduce((sum, item) => sum + (Number(item.quantity || 1) * Number(item.unitPrice || 0)), 0);
  const calculatedTax = lineItems.reduce((sum, item) => {
    const base = Number(item.quantity || 1) * Number(item.unitPrice || 0);
    return sum + (base * (Number(item.taxPercent || 0) / 100));
  }, 0);
  const calculatedTotal = Math.max(0, calculatedSubtotal + calculatedTax - Number(discount || 0));

  // Submit new purchase invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !lineItems.length) {
      alert('Please fill customer details and line items.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/purchase-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          billingAddress,
          currency,
          exchangeRateToInr: currency === 'USD' ? 86.5 : 1.0,
          lineItems,
          discount,
          dueDate,
          notes
        })
      });

      const data = await res.json();
      if (data.success && data.invoice) {
        onAddNewInvoice(data.invoice);
        setIsCreateModalOpen(false);
        // Reset form
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setBillingAddress('');
        setNotes('');
      }
    } catch (err) {
      console.error('Error creating purchase invoice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.lineItems.some(item => item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Analytics Metrics
  const totalInvoicedInr = invoices.reduce((sum, inv) => {
    return sum + (inv.currency === 'INR' ? inv.totalAmount : inv.totalAmount * (inv.exchangeRateToInr || 86.5));
  }, 0);

  const totalPaidInr = invoices.filter(i => i.status === 'PAID').reduce((sum, inv) => {
    return sum + (inv.currency === 'INR' ? inv.totalAmount : inv.totalAmount * (inv.exchangeRateToInr || 86.5));
  }, 0);

  const pendingCount = invoices.filter(i => i.status === 'ISSUED' || i.status === 'PAYMENT_PENDING').length;
  const paidCount = invoices.filter(i => i.status === 'PAID').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="p-6 rounded-3xl backdrop-blur-2xl bg-gradient-to-r from-[#091b17]/90 via-[#0e2420]/80 to-[#071714]/90 border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-tight">Purchase Invoicing & Direct Gateway</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-semibold border border-amber-500/30">
                  Razorpay Active &bull; UPI Deprecated
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Direct sanctuary sales, somatic retreat passes, and equipment procurement. Secure card/netbanking payments (UPI deprecated).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Total Invoiced</span>
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">ALL TIME</span>
          </div>
          <p className="text-2xl font-black text-white font-mono tracking-tight">
            ₹{Math.round(totalInvoicedInr).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 flex items-center space-x-1 font-mono">
            <span>≈ ${(totalInvoicedInr / 86.5).toFixed(2)} USD</span>
            <span>&bull;</span>
            <span className="text-emerald-400">{invoices.length} invoices</span>
          </p>
        </div>

        {/* Settled Revenue */}
        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Paid Revenue</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-[10px] flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>SETTLED</span>
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            ₹{Math.round(totalPaidInr).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            {paidCount} paid &bull; Instant Razorpay Auto-Capture (UPI Deprecated)
          </p>
        </div>

        {/* Pending Settlement */}
        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Pending Invoices</span>
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-[10px]">
              AWAITING SETTLEMENT
            </span>
          </div>
          <p className="text-2xl font-black text-amber-300 font-mono tracking-tight">
            {pendingCount}
          </p>
          <p className="text-[11px] text-slate-400">
            Pending invoices awaiting card/netbanking settlement
          </p>
        </div>

        {/* UPI Gateway Status */}
        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Razorpay Gateway (Cards)</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
              UPI DEPRECATED
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-teal-300 font-mono tracking-tight">Active</span>
            <span className="text-xs text-slate-400">Credit/Debit Cards</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
            <CreditCard className="w-3 h-3 text-emerald-400" />
            <span className="truncate">Cards & Netbanking Active &bull; UPI Disabled</span>
          </p>
        </div>
      </div>

      {/* Search, Filter, and Controls */}
      <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice #, client, item..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full w-full md:w-auto p-1 bg-white/[0.03] rounded-2xl border border-white/5">
          {(['ALL', 'ISSUED', 'PAYMENT_PENDING', 'PAID', 'DRAFT'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
                statusFilter === status
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {status === 'ALL' ? 'All Invoices' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List / Table */}
      <div className="backdrop-blur-2xl bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider bg-white/[0.01]">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer / Sanctuary Client</th>
                <th className="py-3.5 px-4">Issue & Due Date</th>
                <th className="py-3.5 px-4">Itemized Goods / Services</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-slate-600" />
                    <p>No purchase invoices found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const amountInr = inv.currency === 'INR' 
                    ? inv.totalAmount 
                    : Math.round(inv.totalAmount * (inv.exchangeRateToInr || 86.5));

                  return (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition">
                      {/* Invoice Number */}
                      <td className="py-4 px-4 font-mono font-bold text-white whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <Receipt className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{inv.invoiceNumber}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-white">{inv.customerName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{inv.customerEmail}</p>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-4 px-4 whitespace-nowrap text-[11px] text-slate-300">
                        <div>
                          <span>Issued: {inv.issueDate}</span>
                          <span className="block text-slate-500">Due: {inv.dueDate}</span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="space-y-1">
                          {inv.lineItems.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-1.5 text-[11px]">
                              <span className="px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-300 font-mono text-[9px] shrink-0">
                                {item.category}
                              </span>
                              <span className="truncate text-slate-300">{item.description} (x{item.quantity})</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 text-right whitespace-nowrap font-mono">
                        <div>
                          <span className="font-bold text-white text-sm">
                            {inv.currency === 'INR' ? `₹${inv.totalAmount.toLocaleString()}` : `$${inv.totalAmount.toFixed(2)}`}
                          </span>
                          {inv.currency !== 'INR' && (
                            <span className="block text-[10px] text-slate-400">
                              (₹{amountInr.toLocaleString()})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                            : inv.status === 'PAYMENT_PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : inv.status === 'ISSUED'
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                            : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                        }`}>
                          {inv.status === 'PAID' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {inv.status === 'PAYMENT_PENDING' && <Clock className="w-3 h-3 text-amber-400" />}
                          <span>{inv.status}</span>
                        </span>

                        {inv.status === 'PAID' && inv.upiVpa && (
                          <span className="block text-[9px] font-mono text-emerald-400/80 mt-1">
                            {inv.upiVpa}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          {inv.status !== 'PAID' ? (
                            <button
                              onClick={() => setSelectedInvoiceForPayment(inv)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition"
                              title="Pay via Razorpay (Cards / Netbanking)"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay via Razorpay</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedInvoiceDetail(inv)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1 transition"
                              title="View Paid Receipt"
                            >
                              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Receipt</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedInvoiceDetail(inv)}
                            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition"
                            title="View Full Invoice Details"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RAZORPAY & UPI PAYMENT MODAL */}
      {selectedInvoiceForPayment && (
        <RazorpayUPIModal
          invoice={selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          onPaymentSuccess={(invoiceId, paymentData) => {
            const updated = invoices.map(i => {
              if (i.id === invoiceId) {
                return {
                  ...i,
                  status: 'PAID' as const,
                  paymentGateway: (paymentData.paymentMethod?.startsWith('NETBANKING') ? 'NET_BANKING' : 'RAZORPAY_CARD') as any,
                  razorpayPaymentId: paymentData.paymentId,
                  razorpayOrderId: paymentData.orderId,
                  paidAt: paymentData.paidAt || new Date().toISOString(),
                  receiptNumber: paymentData.receiptNumber
                };
              }
              return i;
            });
            const updatedInvoice = updated.find(i => i.id === invoiceId);
            if (updatedInvoice) onUpdateInvoice(updatedInvoice);
          }}
        />
      )}

      {/* CREATE PURCHASE INVOICE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-3xl bg-[#091b17]/95 border border-white/15 rounded-3xl w-full max-w-2xl overflow-hidden text-slate-100 shadow-[0_24px_64px_rgba(0,0,0,0.7)] p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Create Purchase Invoice</h3>
                  <p className="text-xs text-slate-400">Direct sanctuary services, equipment, or retreat billing</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-white">Customer / Client Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Dr. Marcus Vance"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-white">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. m.vance@techridge.io"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-white">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98200 44102"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-white">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e2420] border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="INR">INR (₹ Indian Rupee &bull; Cards / Netbanking)</option>
                    <option value="USD">USD ($ US Dollar)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-white">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">Itemized Goods & Services</label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {lineItems.map((item, idx) => (
                    <div key={item.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-400">Item #{idx + 1}</span>
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(idx)}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateLineItem(idx, 'description', e.target.value)}
                            placeholder="Description (e.g. Bo Staff, Retreat Pass)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white"
                            required
                          />
                        </div>

                        <div>
                          <select
                            value={item.category}
                            onChange={(e) => handleUpdateLineItem(idx, 'category', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-[#0e2420] border border-white/10 text-white text-[11px]"
                          >
                            <option value="Retreat Package">Retreat Package</option>
                            <option value="Martial Equipment">Martial Equipment</option>
                            <option value="Herbal & Nutrition">Herbal & Nutrition</option>
                            <option value="Bio-Telemetry Sensor">Bio Sensor</option>
                            <option value="Clinical Out-of-Pocket">Clinical</option>
                            <option value="Membership">Membership</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-1">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateLineItem(idx, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className="px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white text-center font-mono"
                          />
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateLineItem(idx, 'unitPrice', e.target.value)}
                            placeholder="Price"
                            className="px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white text-center font-mono"
                          />
                          <div className="flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
                            {currency === 'INR' ? `₹${item.total}` : `$${item.total}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400">Calculated Total:</span>
                  <p className="text-xl font-bold text-emerald-400">
                    {currency === 'INR' ? `₹${calculatedTotal.toLocaleString()}` : `$${calculatedTotal.toFixed(2)}`}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <p>Subtotal: {currency === 'INR' ? `₹${calculatedSubtotal}` : `$${calculatedSubtotal}`}</p>
                  <p>Tax / GST: {currency === 'INR' ? `₹${calculatedTax.toFixed(2)}` : `$${calculatedTax.toFixed(2)}`}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Issue Purchase Invoice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED INVOICE DRAWER / RECEIPT VIEW */}
      {selectedInvoiceDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-3xl bg-[#091b17]/95 border border-white/15 rounded-3xl w-full max-w-xl text-slate-100 shadow-[0_24px_64px_rgba(0,0,0,0.7)] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>Wilderness Dojo Sanctuary</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    selectedInvoiceDetail.status === 'PAID'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {selectedInvoiceDetail.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Director: Dr. Bheemaiah Anil K</p>
              </div>
              <button
                onClick={() => setSelectedInvoiceDetail(null)}
                className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            {/* Bill Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Billed To</p>
                <p className="font-bold text-white mt-1">{selectedInvoiceDetail.customerName}</p>
                <p className="text-slate-300">{selectedInvoiceDetail.customerEmail}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{selectedInvoiceDetail.billingAddress}</p>
              </div>
              <div className="text-right font-mono text-[11px] space-y-1">
                <p><span className="text-slate-400">Invoice: </span><strong className="text-white">{selectedInvoiceDetail.invoiceNumber}</strong></p>
                <p><span className="text-slate-400">Issue Date: </span>{selectedInvoiceDetail.issueDate}</p>
                <p><span className="text-slate-400">Due Date: </span>{selectedInvoiceDetail.dueDate}</p>
                {selectedInvoiceDetail.receiptNumber && (
                  <p><span className="text-slate-400">Receipt #: </span><strong className="text-emerald-400">{selectedInvoiceDetail.receiptNumber}</strong></p>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-white/10 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-white/[0.04] text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {selectedInvoiceDetail.lineItems.map(item => (
                    <tr key={item.id}>
                      <td className="p-3">
                        <span className="font-sans font-medium text-white">{item.description}</span>
                        <span className="block text-[10px] text-slate-400">{item.category}</span>
                      </td>
                      <td className="p-3 text-center text-slate-300">{item.quantity}</td>
                      <td className="p-3 text-right text-slate-300">
                        {selectedInvoiceDetail.currency === 'INR' ? `₹${item.unitPrice}` : `$${item.unitPrice}`}
                      </td>
                      <td className="p-3 text-right text-white font-bold">
                        {selectedInvoiceDetail.currency === 'INR' ? `₹${item.total}` : `$${item.total}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-slate-400 uppercase text-[10px]">Total Amount</span>
                <p className="text-xl font-black text-emerald-400">
                  {selectedInvoiceDetail.currency === 'INR' 
                    ? `₹${selectedInvoiceDetail.totalAmount.toLocaleString()}` 
                    : `$${selectedInvoiceDetail.totalAmount.toFixed(2)}`}
                </p>
              </div>
              {selectedInvoiceDetail.status === 'PAID' && (
                <div className="text-right text-[11px] text-slate-300">
                  <span className="text-emerald-400 font-bold block">PAID VIA RAZORPAY</span>
                  <span className="text-slate-400 font-mono">Secure Gateway</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {selectedInvoiceDetail.status !== 'PAID' ? (
                <button
                  onClick={() => {
                    setSelectedInvoiceForPayment(selectedInvoiceDetail);
                    setSelectedInvoiceDetail(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay with Razorpay (Cards / Netbanking)</span>
                </button>
              ) : (
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt / PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
