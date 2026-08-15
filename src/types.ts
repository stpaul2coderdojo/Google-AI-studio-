export interface VitalSigns {
  bloodPressure: string;
  heartRate: number;
  hrvScore: number; // Heart Rate Variability (ms)
  cortisolIndex: string; // e.g. "Low (Optimal)", "Moderate", "Elevated"
  mobilityScore: number; // 0-100 score
  respiratoryRate: number;
  oxygenSaturation: number;
}

export interface MedicalCodeItem {
  code: string;
  type: 'ICD-10' | 'CPT';
  description: string;
  fee?: number;
  units?: number;
  justification?: string;
  isCovered?: boolean;
}

export interface MedicalWellnessRecord {
  id: string;
  patientId: string;
  patientName: string;
  dob: string;
  gender: 'Female' | 'Male' | 'Non-Binary' | 'Other';
  contactEmail: string;
  phone: string;
  insuranceProviderId: string;
  insurancePolicyNumber: string;
  insuranceGroupNumber: string;
  encounterDate: string;
  encounterType: 'Wilderness Somatic Therapy' | 'Martial Movement Rehab' | 'Forest Mindfulness & Stress Protocol' | 'Biometric Rehabilitation' | 'Physical Conditioning & Gait Training';
  providerName: string;
  providerNpi: string;
  providerSpecialty: string;
  facilityName: string;
  facilityAddress: string;
  chiefComplaint: string;
  clinicalNotes: string;
  vitalSigns: VitalSigns;
  biomarkerSummary: string;
  diagnosisCodes: MedicalCodeItem[];
  procedureCodes: MedicalCodeItem[];
  billingStatus: 'Draft' | 'Ready for Coding' | 'Ready for Billing' | 'Claim Invoiced' | 'Payment Settled';
  linkedWpPostId?: number;
  linkedWpMemberId?: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  payerId: string;
  clearinghouse: string;
  copayType: 'Fixed' | 'Percentage';
  standardCopayAmount: number; // e.g. $35 or 15%
  deductibleRequired: number;
  typicalReimbursementRate: number; // e.g. 0.85 (85%)
  realTimeAdjudication: boolean;
  electronicClaimsPayor: boolean;
  contactNumber: string;
  claimsAddress: string;
}

export interface InvoiceLineItem {
  id: string;
  cptCode: string;
  description: string;
  units: number;
  unitPrice: number;
  totalCharge: number;
  insuranceAllowed: number;
  insurancePaid: number;
  patientPortion: number;
  status: 'Approved' | 'Adjusted' | 'Pending';
}

export interface PaymentTransaction {
  id: string;
  transactionHash: string;
  amountPaid: number;
  paymentMethod: 'HSA_FSA_CARD' | 'CREDIT_DEBIT' | 'INSURANCE_DIRECT_EFT' | 'BANK_ACH';
  cardLast4?: string;
  cardBrand?: string;
  timestamp: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  authCode: string;
  gatewayResponse: string;
  receiptUrl: string;
  processedBy: string;
}

export interface CMS1500ClaimData {
  claimControlNumber: string;
  payerName: string;
  payerId: string;
  insuredName: string;
  insuredId: string;
  patientRelationship: 'Self' | 'Spouse' | 'Child' | 'Other';
  dateOfCurrentIllness: string;
  referringProviderNpi: string;
  billingProviderNpi: string;
  billingProviderTaxId: string;
  totalCharges: number;
  amountPaid: number;
  balanceDue: number;
  icd10Pointers: string[];
  serviceLines: {
    date: string;
    placeOfService: string;
    cpt: string;
    modifier?: string;
    diagnosisPointer: string;
    charge: number;
    units: number;
  }[];
}

export interface InvoiceAuditEntry {
  id: string;
  timestamp: string;
  type: 'STATUS_CHANGE' | 'AI_VERIFICATION' | 'AGENTIC_STEP' | 'PAYMENT_EVENT' | 'CLEARINGHOUSE_DISPATCH' | 'WP_WEBHOOK' | 'COMPLIANCE_CHECK';
  actor: string;
  title: string;
  description: string;
  statusChange?: {
    from: string;
    to: string;
  };
  aiConfidenceScore?: number;
  complianceCategory?: 'HIPAA Privacy' | 'AMA CPT Rules' | 'ICD-10 Specificity' | 'PCI-DSS Settlement' | 'Payer Policy' | 'CMS 8-Minute Rule';
  cryptographicHash?: string;
  metadata?: Record<string, any>;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  recordId: string;
  patientName: string;
  patientEmail: string;
  patientAddress: string;
  insuranceProvider: InsuranceProvider;
  policyNumber: string;
  groupNumber: string;
  dateOfService: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  insuranceCoveredAmount: number;
  patientResponsibility: number;
  status: 'Draft' | 'Submitted to Insurance' | 'Adjudicated' | 'Real-Time Settling' | 'Paid in Full' | 'Denied';
  paymentHistory?: PaymentTransaction[];
  cms1500?: CMS1500ClaimData;
  wpSyncStatus: 'synced' | 'pending' | 'failed' | 'not_synced';
  wpPostRef?: string;
  aiVerificationScore: number;
  aiAuditNotes: string;
  auditTrail?: InvoiceAuditEntry[];
  agentSteps?: AntigravityAgentStep[];
}

export interface WordPressPost {
  id: number;
  title: string;
  slug: string;
  date: string;
  link: string;
  excerpt: string;
  category: string;
  featuredSessionCost?: number;
  coveredUnderInsurance?: boolean;
}

export interface WordPressSyncStatus {
  siteUrl: string;
  isOnline: boolean;
  lastSyncTimestamp: string;
  syncedPostsCount: number;
  activeMemberSessions: number;
  apiLatencyMs: number;
  webhookEndpoint: string;
  authMode: 'Application Password' | 'REST Open API' | 'JWT Bearer';
}

export interface AntigravityAgentStep {
  id: string;
  stage: 'INITIALIZATION' | 'CLINICAL_NLP' | 'ICD_CPT_SYNTHESIS' | 'WP_MEMBER_LOOKUP' | 'INSURANCE_ADJUDICATION' | 'PAYMENT_CLEARING' | 'INVOICE_SYNTHESIS' | 'WP_WEBHOOK_EMIT';
  title: string;
  detail: string;
  timestamp: string;
  status: 'queued' | 'executing' | 'completed' | 'failed';
  dataPayload?: any;
  thoughtLog?: string;
}

export interface AgentBillingExecutionResult {
  success: boolean;
  invoiceId: string;
  claimNumber: string;
  record: MedicalWellnessRecord;
  invoice: Invoice;
  steps: AntigravityAgentStep[];
  realTimePaymentToken?: string;
  wpSyncLog?: string;
  summaryText: string;
}
