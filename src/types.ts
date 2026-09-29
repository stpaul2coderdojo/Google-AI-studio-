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

export interface Patient {
  id: string; // e.g. "PT-8821"
  name: string;
  dob: string;
  gender: 'Female' | 'Male' | 'Non-Binary' | 'Other';
  contactEmail: string;
  phone: string;
  address: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalHistoryNotes?: string;
  knownAllergies?: string;
  insuranceProviderId: string;
  insurancePolicyNumber: string;
  insuranceGroupNumber: string;
  linkedWpMemberId?: string;
  registeredDate: string;
  preferredEncounterType?: string;
  status: 'Active Member' | 'On Leave' | 'Completed Program';
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

export type MedicalEncounterRecord = MedicalWellnessRecord;

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
  content?: string;
  category: string;
  tags?: string[];
  status?: 'publish' | 'draft' | 'private';
  featuredSessionCost?: number;
  coveredUnderInsurance?: boolean;
  publishedVia?: 'POST_BY_EMAIL' | 'REST_API' | 'DIRECT_SYNC';
  postEmailGateway?: string;
}

export interface WordPressEmailPostPayload {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  status?: 'publish' | 'draft' | 'private';
  slug?: string;
  targetEmail: string; // e.g. duru909mede@post.wordpress.com
  targetSite: string; // e.g. https://wildernessdojo.home.blog
  featuredSessionCost?: number;
  coveredUnderInsurance?: boolean;
  linkedRecordId?: string;
}

export interface WordPressEmailPostResult {
  success: boolean;
  messageId: string;
  transactionHash: string;
  dispatchedTo: string;
  targetSite: string;
  post: WordPressPost;
  emailSubject: string;
  formattedBodyWithShortcodes: string;
  timestamp: string;
  mailtoUrl: string;
}

export interface WordPressSyncStatus {
  siteUrl: string;
  postingEmailGateway: string; // duru909mede@post.wordpress.com
  isOnline: boolean;
  lastSyncTimestamp: string;
  syncedPostsCount: number;
  activeMemberSessions: number;
  apiLatencyMs: number;
  webhookEndpoint: string;
  authMode: 'Application Password' | 'REST Open API' | 'JWT Bearer' | 'Post-by-Email Gateway';
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

export interface PatientAppointment {
  id: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  encounterType: 'Wilderness Somatic Therapy' | 'Martial Movement Rehab' | 'Forest Mindfulness & Stress Protocol' | 'Biometric Rehabilitation' | 'Physical Conditioning & Gait Training';
  providerName: string;
  providerSpecialty: string;
  facilityName: string;
  facilityAddress: string;
  status: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  telehealthOrTrail: 'Alpine Trail Sanctuary' | 'Dojo Training Hall' | 'Shinrin-Yoku Forest' | 'Secure Telehealth';
  preparationNotes: string;
  insurancePreAuthorized: boolean;
  estimatedCopay: number;
}

export interface LongitudinalBiometricDataPoint {
  date: string;
  encounterLabel: string;
  hrvScore: number; // ms
  heartRate: number; // bpm
  mobilityScore: number; // 0-100
  stressIndex: number; // 0-100 (lower is better)
  spo2: number; // %
  systolicBp: number;
  diastolicBp: number;
  painLevel: number; // 0-10
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

export type IAMRole = 
  | 'SUPER_ADMIN' 
  | 'CHIEF_MEDICAL_OFFICER' 
  | 'BILLING_COMPLIANCE_OFFICER' 
  | 'AUDIT_OFFICER';

export type IAMPermission = 
  | 'MANAGE_USERS' 
  | 'AI_MODEL_TUNING' 
  | 'VIEW_EHR' 
  | 'EDIT_EHR' 
  | 'ADJUDICATE_CLAIMS' 
  | 'VIEW_INVOICES' 
  | 'MANAGE_PAYERS' 
  | 'SYNC_WORDPRESS' 
  | 'EXPORT_AUDIT_LOGS' 
  | 'PROCESS_PAYMENTS';

export interface IAMUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: IAMRole;
  roleTitle: string;
  permissions: IAMPermission[];
  lastLogin: string;
  createdAt: string;
  active: boolean;
  twoFactorEnabled?: boolean;
}

export interface AuthSession {
  token: string;
  user: IAMUser;
  expiresAt: string;
}

export interface IAMLoginResponse {
  success: boolean;
  token?: string;
  user?: IAMUser;
  error?: string;
  requiresTwoFactor?: boolean;
}

export interface IAMSecurityAuditEntry {
  id: string;
  timestamp: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'USER_CREATED' | 'PERMISSION_GRANT' | 'RESTRICTED_ACCESS_ATTEMPT' | 'ZERO_TRUST_VERIFICATION';
  username: string;
  role: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
  details: string;
}

export interface ZeroTrustMetrics {
  totalVerifications: number;
  activeSessionsCount: number;
  leastPrivilegeEnforcementRate: number;
  blockedIntrusions: number;
  cryptographicHashChainStatus: 'HEALTHY_VERIFIED' | 'DEGRADED';
  averageAuthLatencyMs: number;
  zeroTrustGrade: 'A+' | 'A' | 'B';
  lastVerificationTimestamp: string;
}

export interface XPrizeDemoStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  tabKey: 'records' | 'workbench' | 'invoices' | 'payers' | 'wordpress' | 'patient-portal' | 'patient-payment' | 'json-database' | 'rest-api';
  badge: string;
  details: string[];
}

export type NavigationTab = 
  | 'workbench' 
  | 'records' 
  | 'patient-portal' 
  | 'patient-payment' 
  | 'invoices' 
  | 'payers' 
  | 'json-database' 
  | 'rest-api' 
  | 'wordpress';

export interface AppJSONDatabase {
  schemaVersion: string;
  lastUpdated: string;
  checksum: string;
  collections: {
    records: MedicalWellnessRecord[];
    invoices: Invoice[];
    payers: InsuranceProvider[];
    posts: WordPressPost[];
    securityLogs: IAMSecurityAuditEntry[];
  };
  metadata: {
    totalRecords: number;
    totalInvoices: number;
    totalPayers: number;
    environment: string;
    linkedWordpressSite: string;
  };
}

export interface RestApiEndpointSpec {
  id: string;
  category: 'IAM & Security' | 'Medical EHR Records' | 'AI CPT Billing' | 'Payment Gateway' | 'WordPress & Webhooks' | 'JSON Database';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requiresAuth: boolean;
  requiredPermission?: IAMPermission;
  requestHeaders?: Record<string, string>;
  requestBodySchema?: any;
  sampleRequestBody?: any;
  sampleResponse: any;
}

