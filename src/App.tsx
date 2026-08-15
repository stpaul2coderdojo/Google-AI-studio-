import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AgenticWorkbench } from './components/AgenticWorkbench';
import { MedicalWellnessRecords } from './components/MedicalWellnessRecords';
import { InsurancePayersManager } from './components/InsurancePayersManager';
import { InvoicesClaimsView } from './components/InvoicesClaimsView';
import { RealtimePaymentModal } from './components/RealtimePaymentModal';
import { WordPressBridgePanel } from './components/WordPressBridgePanel';
import { 
  SAMPLE_WELLNESS_RECORDS, 
  INSURANCE_PAYERS, 
  INITIAL_WORDPRESS_POSTS 
} from './data/mockData';
import { 
  MedicalWellnessRecord, 
  InsuranceProvider, 
  Invoice, 
  WordPressPost, 
  WordPressSyncStatus,
  PaymentTransaction,
  AntigravityAgentStep,
  InvoiceAuditEntry 
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workbench' | 'records' | 'invoices' | 'payers' | 'wordpress'>('workbench');
  const [records, setRecords] = useState<MedicalWellnessRecord[]>(SAMPLE_WELLNESS_RECORDS);
  const [payers, setPayers] = useState<InsuranceProvider[]>(INSURANCE_PAYERS);
  const [wpPosts, setWpPosts] = useState<WordPressPost[]>(INITIAL_WORDPRESS_POSTS);
  const [wpStatus, setWpStatus] = useState<WordPressSyncStatus | null>({
    siteUrl: 'https://wildernessdojo.home.blog',
    isOnline: true,
    lastSyncTimestamp: new Date().toISOString(),
    syncedPostsCount: INITIAL_WORDPRESS_POSTS.length,
    activeMemberSessions: 14,
    apiLatencyMs: 38,
    webhookEndpoint: 'https://wildernessdojo.home.blog/wp-json/dojo-billing/v1/payment-webhook',
    authMode: 'REST Open API'
  });
  const [isSyncingWp, setIsSyncingWp] = useState<boolean>(false);

  // Invoices list state (pre-populated with 2 realistic baseline claims)
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-2026-88120',
      invoiceNumber: 'INV-2026-88120',
      recordId: 'REC-2026-001',
      patientName: 'Elena Rostova',
      patientEmail: 'elena.rostova@wildernessdojo.org',
      patientAddress: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
      insuranceProvider: INSURANCE_PAYERS[0],
      policyNumber: 'BC-992817441',
      groupNumber: 'GRP-WD-880',
      dateOfService: '2026-08-14',
      issueDate: '2026-08-14',
      dueDate: '2026-08-28',
      lineItems: [
        {
          id: 'ITEM-1',
          cptCode: '97110',
          description: 'Therapeutic Exercise (15 min units)',
          units: 2,
          unitPrice: 85.00,
          totalCharge: 170.00,
          insuranceAllowed: 161.50,
          insurancePaid: 142.12,
          patientPortion: 27.88,
          status: 'Approved'
        },
        {
          id: 'ITEM-2',
          cptCode: '97112',
          description: 'Neuromuscular Re-education (15 min units)',
          units: 2,
          unitPrice: 95.00,
          totalCharge: 190.00,
          insuranceAllowed: 180.50,
          insurancePaid: 158.84,
          patientPortion: 31.16,
          status: 'Approved'
        },
        {
          id: 'ITEM-3',
          cptCode: '90837',
          description: 'Mind-Body Somatic Encounter (60 min)',
          units: 1,
          unitPrice: 180.00,
          totalCharge: 180.00,
          insuranceAllowed: 171.00,
          insurancePaid: 150.48,
          patientPortion: 29.52,
          status: 'Approved'
        }
      ],
      subtotal: 540.00,
      insuranceCoveredAmount: 451.44,
      patientResponsibility: 88.56,
      status: 'Adjudicated',
      wpSyncStatus: 'synced',
      wpPostRef: 'https://wildernessdojo.home.blog/?p=101',
      aiVerificationScore: 98,
      aiAuditNotes: 'High-affinity medical necessity established. Procedural units mapped according to Wilderness Somatic Physical Medicine guidelines with zero compliance conflicts.',
      cms1500: {
        claimControlNumber: 'CLM-2026-88120',
        payerName: 'Blue Cross Blue Shield (Wilderness & Integrative Plan)',
        payerId: 'BCBS-98301',
        insuredName: 'Elena Rostova',
        insuredId: 'BC-992817441',
        patientRelationship: 'Self',
        dateOfCurrentIllness: '2026-08-14',
        referringProviderNpi: '1892837492',
        billingProviderNpi: '1892837492',
        billingProviderTaxId: '94-3829104',
        totalCharges: 540.00,
        amountPaid: 451.44,
        balanceDue: 88.56,
        icd10Pointers: ['M54.6', 'F43.0', 'Z71.3'],
        serviceLines: [
          { date: '2026-08-14', placeOfService: '11 - Office / Sanctuary', cpt: '97110', modifier: 'GP', diagnosisPointer: '1', charge: 170.00, units: 2 },
          { date: '2026-08-14', placeOfService: '11 - Office / Sanctuary', cpt: '97112', modifier: 'GP', diagnosisPointer: '1', charge: 190.00, units: 2 },
          { date: '2026-08-14', placeOfService: '11 - Office / Sanctuary', cpt: '90837', modifier: '95', diagnosisPointer: '2', charge: 180.00, units: 1 }
        ]
      }
    }
  ]);

  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState<Invoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);

  // Sync with WordPress API
  const refreshWordPressSync = async () => {
    setIsSyncingWp(true);
    try {
      const res = await fetch('/api/wordpress/sync');
      const data = await res.json();
      if (data.success) {
        setWpStatus({
          siteUrl: data.siteUrl,
          isOnline: data.isOnline,
          lastSyncTimestamp: data.lastSyncTimestamp,
          syncedPostsCount: data.posts?.length || wpPosts.length,
          activeMemberSessions: data.activeMemberSessions,
          apiLatencyMs: data.latencyMs,
          webhookEndpoint: data.webhookEndpoint,
          authMode: 'REST Open API'
        });
        if (data.posts && data.posts.length > 0) {
          setWpPosts(data.posts);
        }
      }
    } catch (err) {
      console.warn('WP Sync note:', err);
    } finally {
      setIsSyncingWp(false);
    }
  };

  useEffect(() => {
    refreshWordPressSync();
  }, []);

  // Autonomous Antigravity Billing execution handler
  const handleExecuteBilling = async (record: MedicalWellnessRecord, payer: InsuranceProvider) => {
    try {
      const res = await fetch('/api/ai/billing-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record,
          insuranceProvider: payer
        })
      });

      const data = await res.json();
      if (data.success && data.invoice) {
        // Upsert invoice into invoices list
        setInvoices(prev => [data.invoice, ...prev.filter(inv => inv.id !== data.invoice.id)]);
        
        // Update record status to Claim Invoiced
        setRecords(prev => prev.map(r => r.id === record.id ? { ...r, billingStatus: 'Claim Invoiced' } : r));

        return {
          success: true,
          invoice: data.invoice,
          steps: data.steps || []
        };
      } else {
        throw new Error(data.error || 'Failed to process billing');
      }
    } catch (err: any) {
      console.error(err);
      return {
        success: false,
        steps: []
      };
    }
  };

  const handlePaymentSuccess = (invoiceId: string, transaction: PaymentTransaction) => {
    const paymentAuditEntry: InvoiceAuditEntry = {
      id: `AUD-${invoiceId}-PMT-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      type: 'PAYMENT_EVENT',
      actor: transaction.processedBy || 'Wilderness Health Pay Gateway (HIPAA & PCI DSS L1)',
      title: 'Patient Copay Succeeded & Settled',
      description: `Payment of $${transaction.amountPaid.toFixed(2)} finalized via ${transaction.paymentMethod} (${transaction.cardBrand || 'HSA/Card'} •••• ${transaction.cardLast4 || '4912'}). Authorization Code: ${transaction.authCode}.`,
      statusChange: { from: 'Adjudicated', to: 'Paid in Full' },
      complianceCategory: 'PCI-DSS Settlement',
      cryptographicHash: transaction.transactionHash,
      metadata: {
        transactionId: transaction.id,
        authCode: transaction.authCode,
        amountPaid: transaction.amountPaid,
        gatewayResponse: transaction.gatewayResponse,
        hsaEligible: true,
      }
    };

    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'Paid in Full',
          paymentHistory: [transaction, ...(inv.paymentHistory || [])],
          patientResponsibility: 0,
          auditTrail: [paymentAuditEntry, ...(inv.auditTrail || [])]
        };
      }
      return inv;
    }));

    // Update corresponding patient record
    const targetInvoice = invoices.find(i => i.id === invoiceId);
    if (targetInvoice) {
      setRecords(prev => prev.map(r => r.id === targetInvoice.recordId ? { ...r, billingStatus: 'Payment Settled' } : r));
    }
  };

  return (
    <div className="min-h-screen bg-[#061110] text-slate-100 font-sans selection:bg-emerald-400 selection:text-slate-950 relative overflow-hidden">
      {/* Frosted Glass Ambient Lighting Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-[36rem] h-[36rem] bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute top-2/3 right-1/3 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      </div>

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wpStatus={wpStatus}
        onRefreshWp={refreshWordPressSync}
        isSyncing={isSyncingWp}
        totalInvoicesCount={invoices.length}
        totalRecordsCount={records.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {activeTab === 'workbench' && (
          <AgenticWorkbench
            records={records}
            payers={payers}
            onExecuteBilling={handleExecuteBilling}
            onSelectInvoice={(inv) => {
              setSelectedInvoiceDetail(inv);
              setActiveTab('invoices');
            }}
            onOpenPayment={(inv) => setPaymentModalInvoice(inv)}
          />
        )}

        {activeTab === 'records' && (
          <MedicalWellnessRecords
            records={records}
            payers={payers}
            onSelectRecordForBilling={(rec) => {
              setActiveTab('workbench');
            }}
            onAddNewRecord={(newRec) => {
              setRecords(prev => [newRec, ...prev]);
            }}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesClaimsView
            invoices={invoices}
            selectedInvoice={selectedInvoiceDetail}
            onSelectInvoice={setSelectedInvoiceDetail}
            onOpenPayment={(inv) => setPaymentModalInvoice(inv)}
          />
        )}

        {activeTab === 'payers' && (
          <InsurancePayersManager
            payers={payers}
            onSelectPayer={(payer) => {
              setActiveTab('workbench');
            }}
          />
        )}

        {activeTab === 'wordpress' && (
          <WordPressBridgePanel
            wpStatus={wpStatus}
            posts={wpPosts}
            onRefreshSync={refreshWordPressSync}
            isSyncing={isSyncingWp}
          />
        )}
      </main>

      {/* Payment Processing Modal */}
      {paymentModalInvoice && (
        <RealtimePaymentModal
          invoice={paymentModalInvoice}
          onClose={() => setPaymentModalInvoice(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
