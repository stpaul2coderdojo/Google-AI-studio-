import { MedicalWellnessRecord, InsuranceProvider, WordPressPost, Patient } from '../types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'PT-8821',
    name: 'Elena Rostova',
    dob: '1989-04-14',
    gender: 'Female',
    contactEmail: 'elena.rostova@wildernessdojo.org',
    phone: '(530) 555-0192',
    address: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
    emergencyContactName: 'Dmitri Rostov (Spouse)',
    emergencyContactPhone: '(530) 555-0199',
    medicalHistoryNotes: 'Postural myofascial strain, altitude recovery, autonomic hyperarousal',
    knownAllergies: 'None reported (NKDA)',
    insuranceProviderId: 'bcbs-001',
    insurancePolicyNumber: 'BC-992817441',
    insuranceGroupNumber: 'GRP-WD-880',
    linkedWpMemberId: 'WP-USER-441',
    registeredDate: '2026-06-15',
    preferredEncounterType: 'Wilderness Somatic Therapy',
    status: 'Active Member'
  },
  {
    id: 'PT-9402',
    name: 'Marcus Vance',
    dob: '1982-11-23',
    gender: 'Male',
    contactEmail: 'm.vance@techridge.io',
    phone: '(415) 555-8321',
    address: '220 Alpine Crest, Incline Village, NV 89451',
    emergencyContactName: 'Sarah Vance (Sister)',
    emergencyContactPhone: '(415) 555-8390',
    medicalHistoryNotes: 'Right shoulder rotator cuff tendinitis, sedentary postural fatigue',
    knownAllergies: 'Sulfa antibiotics',
    insuranceProviderId: 'uhc-002',
    insurancePolicyNumber: 'UHC-773829104',
    insuranceGroupNumber: 'GRP-TECH-104',
    linkedWpMemberId: 'WP-USER-912',
    registeredDate: '2026-07-02',
    preferredEncounterType: 'Martial Movement Rehab',
    status: 'Active Member'
  },
  {
    id: 'PT-7119',
    name: 'Sophia Al-Mansoor',
    dob: '1995-08-03',
    gender: 'Female',
    contactEmail: 'sophia.almansoor@healthpost.net',
    phone: '(916) 555-7734',
    address: '55 Pine Needle Way, Truckee, CA 96161',
    emergencyContactName: 'Zayd Al-Mansoor (Brother)',
    emergencyContactPhone: '(916) 555-7700',
    medicalHistoryNotes: 'Post-viral dysautonomia, orthostatic fatigue, vagal nerve dysregulation',
    knownAllergies: 'Latex',
    insuranceProviderId: 'aetna-003',
    insurancePolicyNumber: 'AET-443918230',
    insuranceGroupNumber: 'GRP-BIO-901',
    linkedWpMemberId: 'WP-USER-719',
    registeredDate: '2026-07-10',
    preferredEncounterType: 'Forest Mindfulness & Stress Protocol',
    status: 'Active Member'
  }
];

export const INSURANCE_PAYERS: InsuranceProvider[] = [
  {
    id: 'bcbs-001',
    name: 'Blue Cross Blue Shield (Wilderness & Integrative Plan)',
    payerId: 'BCBS-98301',
    clearinghouse: 'Change Healthcare / Availity EDI',
    copayType: 'Fixed',
    standardCopayAmount: 30.00,
    deductibleRequired: 250.00,
    typicalReimbursementRate: 0.88,
    realTimeAdjudication: true,
    electronicClaimsPayor: true,
    contactNumber: '1-800-555-2277',
    claimsAddress: 'P.O. Box 9012, Chicago, IL 60601',
  },
  {
    id: 'uhc-002',
    name: 'UnitedHealthcare (Optum Wellness & Rehab Network)',
    payerId: 'UHC-87726',
    clearinghouse: 'Optum360 EDI Gateway',
    copayType: 'Percentage',
    standardCopayAmount: 15.0, // 15%
    deductibleRequired: 500.00,
    typicalReimbursementRate: 0.82,
    realTimeAdjudication: true,
    electronicClaimsPayor: true,
    contactNumber: '1-877-842-3210',
    claimsAddress: 'P.O. Box 30555, Salt Lake City, UT 84130',
  },
  {
    id: 'aetna-003',
    name: 'Aetna Health (Mind-Body & Somatic Covered Benefits)',
    payerId: 'AETNA-60054',
    clearinghouse: 'Availity Revenue Clearinghouse',
    copayType: 'Fixed',
    standardCopayAmount: 25.00,
    deductibleRequired: 200.00,
    typicalReimbursementRate: 0.85,
    realTimeAdjudication: true,
    electronicClaimsPayor: true,
    contactNumber: '1-800-872-3862',
    claimsAddress: 'P.O. Box 981106, El Paso, TX 79998',
  },
  {
    id: 'cigna-004',
    name: 'Cigna Global & Behavioral Wellness Network',
    payerId: 'CIGNA-62308',
    clearinghouse: 'RelayHealth Payer Gateway',
    copayType: 'Fixed',
    standardCopayAmount: 35.00,
    deductibleRequired: 350.00,
    typicalReimbursementRate: 0.80,
    realTimeAdjudication: true,
    electronicClaimsPayor: true,
    contactNumber: '1-800-244-6224',
    claimsAddress: 'P.O. Box 188014, Chattanooga, TN 37422',
  },
  {
    id: 'kaiser-005',
    name: 'Kaiser Permanente (Complementary & Somatic Care)',
    payerId: 'KP-94120',
    clearinghouse: 'Kaiser Internal EDI Exchange',
    copayType: 'Fixed',
    standardCopayAmount: 20.00,
    deductibleRequired: 150.00,
    typicalReimbursementRate: 0.90,
    realTimeAdjudication: true,
    electronicClaimsPayor: true,
    contactNumber: '1-800-464-4000',
    claimsAddress: 'P.O. Box 12985, Oakland, CA 94604',
  },
  {
    id: 'medicare-006',
    name: 'Medicare Advantage Part B (Physical Therapy & Wellness)',
    payerId: 'MEDADV-00402',
    clearinghouse: 'Noridian Healthcare Solutions MAC',
    copayType: 'Percentage',
    standardCopayAmount: 20.0, // 20% coinsurance
    deductibleRequired: 240.00,
    typicalReimbursementRate: 0.80,
    realTimeAdjudication: true,
    electronicClaimsPayor: true,
    contactNumber: '1-800-633-4227',
    claimsAddress: 'P.O. Box 6702, Fargo, ND 58108',
  },
  {
    id: 'wilderness-mutual-007',
    name: 'Wilderness Dojo Health & Somatic Mutual Reserve',
    payerId: 'WD-MUTUAL-101',
    clearinghouse: 'Direct WordPress REST Clearinghouse',
    copayType: 'Fixed',
    standardCopayAmount: 15.00,
    deductibleRequired: 100.00,
    typicalReimbursementRate: 0.95,
    realTimeAdjudication: true,
    electronicClaimsPayor: true,
    contactNumber: '1-888-DOJO-MED',
    claimsAddress: 'Basecamp Ridge Suite 4, High Sierra, CA 96150',
  }
];

export const SAMPLE_WELLNESS_RECORDS: MedicalWellnessRecord[] = [
  {
    id: 'REC-2026-001',
    patientId: 'PT-8821',
    patientName: 'Elena Rostova',
    dob: '1989-04-14',
    gender: 'Female',
    contactEmail: 'elena.rostova@wildernessdojo.org',
    phone: '(530) 555-0192',
    insuranceProviderId: 'bcbs-001',
    insurancePolicyNumber: 'BC-992817441',
    insuranceGroupNumber: 'GRP-WD-880',
    encounterDate: '2026-08-14',
    encounterType: 'Wilderness Somatic Therapy',
    providerName: 'Dr. Kaelen Thorne, DPT, OCS',
    providerNpi: '1892837492',
    providerSpecialty: 'Wilderness Physical Medicine & Somatic Therapy',
    facilityName: 'Wilderness Dojo Alpine Health Sanctuary',
    facilityAddress: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
    chiefComplaint: 'Chronic sympathetic nervous system hyperarousal, postural myofascial strain of thoracic spine following intense alpine trek, elevated cortisol markers.',
    clinicalNotes: 'Patient Elena presented for intensive 90-minute Wilderness Somatic Rehabilitation encounter. Initial examination revealed thoracic paraspinal hypertonicity (Grade 2-3) and diminished respiratory diaphragm excursion. Supervised wilderness therapeutic movement protocol performed: 45 min guided biomechanical neuromuscular re-education on natural incline trails, combined with somatic breathwork regulation. Post-session HRV increased from 38ms to 72ms. Pain visual analog scale reduced from 6/10 to 2/10. Recommended for 4 additional outpatient wellness conditioning units.',
    vitalSigns: {
      bloodPressure: '118/76',
      heartRate: 64,
      hrvScore: 72,
      cortisolIndex: 'Low (Optimal - Down 38%)',
      mobilityScore: 88,
      respiratoryRate: 13,
      oxygenSaturation: 99
    },
    biomarkerSummary: 'Salivary cortisol normalized post-trail somatic circuit; vagal tone index +42% improvement; thoracic ROM restored to 85 degrees.',
    diagnosisCodes: [
      { code: 'M54.6', type: 'ICD-10', description: 'Pain in thoracic spine', justification: 'Primary biomechanical lesion treated during incline gait rehab' },
      { code: 'F43.0', type: 'ICD-10', description: 'Acute stress reaction / somatic fatigue', justification: 'Documented autonomic dysregulation addressed via somatic immersion' },
      { code: 'Z71.3', type: 'ICD-10', description: 'Dietary & metabolic endurance surveillance', justification: 'High-altitude hydration and metabolic recovery coaching' }
    ],
    procedureCodes: [
      { code: '97110', type: 'CPT', description: 'Therapeutic Exercise (15 min units)', fee: 85.00, units: 2, justification: 'Dynamic wilderness mobility & spinal stabilization drills' },
      { code: '97112', type: 'CPT', description: 'Neuromuscular Re-education (15 min units)', fee: 95.00, units: 2, justification: 'Proprioceptive trail balancing and posture resetting' },
      { code: '90837', type: 'CPT', description: 'Psychotherapy / Mind-Body Somatic Encounter (60 min)', fee: 180.00, units: 1, justification: 'Autonomic nervous system down-regulation protocol' }
    ],
    billingStatus: 'Ready for Billing',
    linkedWpPostId: 101,
    linkedWpMemberId: 'WP-USER-441'
  },
  {
    id: 'REC-2026-002',
    patientId: 'PT-9402',
    patientName: 'Marcus Vance',
    dob: '1982-11-23',
    gender: 'Male',
    contactEmail: 'm.vance@techridge.io',
    phone: '(415) 555-8321',
    insuranceProviderId: 'uhc-002',
    insurancePolicyNumber: 'UHC-773829104',
    insuranceGroupNumber: 'GRP-TECH-104',
    encounterDate: '2026-08-13',
    encounterType: 'Martial Movement Rehab',
    providerName: 'Sensei Maya Chen, LAc, MPT',
    providerNpi: '1437890211',
    providerSpecialty: 'Integrative Martial Rehabilitation & Sports Medicine',
    facilityName: 'Wilderness Dojo Alpine Health Sanctuary',
    facilityAddress: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
    chiefComplaint: 'Right rotator cuff tendinopathy and executive burnout syndrome aggravated by sedentary screen posture.',
    clinicalNotes: 'Marcus participated in a structured 75-minute Martial Movement Therapy and kinetic chain realignment. Protocol included controlled Dojo Bo-staff dynamic mobility, scapular retraction isometric holding, and therapeutic breathwork under load. Shoulder active abduction restored from 110 deg to 165 deg without impingement sign. Biometric tracking showed sustained heart rate recovery with reduction in arterial tension.',
    vitalSigns: {
      bloodPressure: '124/80',
      heartRate: 68,
      hrvScore: 65,
      cortisolIndex: 'Moderate (Improving)',
      mobilityScore: 82,
      respiratoryRate: 14,
      oxygenSaturation: 98
    },
    biomarkerSummary: 'Shoulder range of motion +55 degrees; baseline grip strength increased to 48kg bilateral; sympathetic overdrive mitigated.',
    diagnosisCodes: [
      { code: 'M75.121', type: 'ICD-10', description: 'Complete or incomplete rotator cuff tear or tendinitis, right shoulder', justification: 'Chief orthopedic diagnosis under active rehabilitation' },
      { code: 'Z73.0', type: 'ICD-10', description: 'Burn-out / state of vital exhaustion', justification: 'Executive stress pathology treated with martial somatic grounding' }
    ],
    procedureCodes: [
      { code: '97530', type: 'CPT', description: 'Therapeutic Activities, Direct Patient Contact (15 min units)', fee: 90.00, units: 3, justification: 'Functional martial kinetic chain mobility and scapular loading' },
      { code: '97140', type: 'CPT', description: 'Manual Therapy Techniques (15 min units)', fee: 80.00, units: 2, justification: 'Glenohumeral joint mobilization and myofascial release' }
    ],
    billingStatus: 'Ready for Billing',
    linkedWpPostId: 104,
    linkedWpMemberId: 'WP-USER-912'
  },
  {
    id: 'REC-2026-003',
    patientId: 'PT-7119',
    patientName: 'Sophia Al-Mansoor',
    dob: '1995-08-03',
    gender: 'Female',
    contactEmail: 'sophia.almansoor@healthpost.net',
    phone: '(916) 555-7734',
    insuranceProviderId: 'aetna-003',
    insurancePolicyNumber: 'AET-443918230',
    insuranceGroupNumber: 'GRP-MED-771',
    encounterDate: '2026-08-11',
    encounterType: 'Forest Mindfulness & Stress Protocol',
    providerName: 'Dr. Jesse Rivera, MD, ABIHM',
    providerNpi: '1902883419',
    providerSpecialty: 'Integrative Wilderness Medicine',
    facilityName: 'Wilderness Dojo Basecamp Outpost',
    facilityAddress: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
    chiefComplaint: 'Post-viral fatigue syndrome with autonomic orthostatic tachycardia and cognitive fog.',
    clinicalNotes: 'Comprehensive 60-min physiological monitoring and Japanese Shinrin-yoku (forest bathing) therapeutic pacing session. Patient completed monitored walking at 2.1 mph on natural pine forest terrain with continuous SpO2 and PPG heart rate recording. Parasympathetic rebound verified with high-frequency HRV elevation (+65%). Clinical nutrition and electrolyte balance counseling provided.',
    vitalSigns: {
      bloodPressure: '112/72',
      heartRate: 59,
      hrvScore: 84,
      cortisolIndex: 'Optimal',
      mobilityScore: 92,
      respiratoryRate: 12,
      oxygenSaturation: 99
    },
    biomarkerSummary: 'Cognitive alertness score 9/10; orthostatic tolerance test negative for POTS flare; sustained parasympathetic predominance.',
    diagnosisCodes: [
      { code: 'R53.82', type: 'ICD-10', description: 'Chronic fatigue, unspecified / post-viral debility', justification: 'Primary therapeutic focus for forest pacing program' },
      { code: 'G90.9', type: 'ICD-10', description: 'Disorder of autonomic nervous system, unspecified', justification: 'Autonomic re-regulation through wilderness immersion' }
    ],
    procedureCodes: [
      { code: '99214', type: 'CPT', description: 'Office/Outpatient Visit, Established Patient, Moderate Complexity', fee: 165.00, units: 1, justification: 'Detailed integrative medical evaluation and pacing management' },
      { code: '97802', type: 'CPT', description: 'Medical Nutrition Therapy, Initial Assessment (15 min units)', fee: 45.00, units: 2, justification: 'Cellular recovery and hydration optimization' }
    ],
    billingStatus: 'Ready for Coding',
    linkedWpPostId: 102,
    linkedWpMemberId: 'WP-USER-118'
  }
];

export const INITIAL_WORDPRESS_POSTS: WordPressPost[] = [
  {
    id: 101,
    title: 'Wilderness Dojo: Alpine Somatic Conditioning & Stress Recovery',
    slug: 'alpine-somatic-conditioning',
    date: '2026-08-10',
    link: 'https://wildernessdojo.home.blog/2026/08/10/alpine-somatic-conditioning/',
    excerpt: 'Combining ancient martial discipline with modern neuromuscular physical medicine in high Sierra terrain. Eligible for medical insurance reimbursement under CPT 97110 & 97112.',
    category: 'Therapeutic Conditioning',
    tags: ['Somatic Therapy', 'Neuromuscular', 'High Sierra', 'CPT-97110'],
    featuredSessionCost: 455.00,
    coveredUnderInsurance: true,
    publishedVia: 'POST_BY_EMAIL',
    postEmailGateway: 'duru909mede@post.wordpress.com'
  },
  {
    id: 102,
    title: 'Forest Bathing & Biomarker Surveillance Protocol',
    slug: 'forest-bathing-biomarker-protocol',
    date: '2026-08-08',
    link: 'https://wildernessdojo.home.blog/2026/08/08/forest-bathing-protocol/',
    excerpt: 'Clinical Shinrin-yoku with continuous HRV telemetry, salivary cortisol monitoring, and physician-guided pacing for autonomic nervous system reset.',
    category: 'Integrative Medicine',
    tags: ['Forest Bathing', 'HRV Telemetry', 'Cortisol', 'Shinrin-Yoku'],
    featuredSessionCost: 255.00,
    coveredUnderInsurance: true,
    publishedVia: 'POST_BY_EMAIL',
    postEmailGateway: 'duru909mede@post.wordpress.com'
  },
  {
    id: 104,
    title: 'Martial Movement Rehabilitation for Shoulder & Spinal Health',
    slug: 'martial-movement-rehabilitation',
    date: '2026-08-04',
    link: 'https://wildernessdojo.home.blog/2026/08/04/martial-movement-rehab/',
    excerpt: 'Restoring kinetic chain freedom through Bo-staff alignment drills and targeted manual therapy. Reimbursable under physical therapy and orthopedic rehab benefits.',
    category: 'Orthopedic Rehab',
    tags: ['Martial Rehab', 'Rotator Cuff', 'Kinetic Chain', 'CPT-97530'],
    featuredSessionCost: 430.00,
    coveredUnderInsurance: true,
    publishedVia: 'POST_BY_EMAIL',
    postEmailGateway: 'duru909mede@post.wordpress.com'
  },
  {
    id: 107,
    title: 'High Sierra Wilderness Health Retreat 2026: Insurance Invoicing Guide',
    slug: 'insurance-invoicing-guide-2026',
    date: '2026-07-28',
    link: 'https://wildernessdojo.home.blog/2026/07/28/insurance-invoicing-guide/',
    excerpt: 'How our Antigravity AI Billing engine connects Wilderness Dojo members directly to BCBS, UHC, Aetna, Cigna, and Kaiser for instant claim settlement.',
    category: 'Billing & Insurance',
    tags: ['Insurance Claims', 'CMS-1500', 'EDI 837P', 'HSA Copay'],
    featuredSessionCost: 0,
    coveredUnderInsurance: true,
    publishedVia: 'POST_BY_EMAIL',
    postEmailGateway: 'duru909mede@post.wordpress.com'
  }
];

export const SAMPLE_APPOINTMENTS = [
  {
    id: 'APT-2026-901',
    patientId: 'PT-8821',
    patientName: 'Elena Rostova',
    appointmentDate: '2026-08-19',
    appointmentTime: '09:00 AM',
    durationMinutes: 75,
    encounterType: 'Wilderness Somatic Therapy' as const,
    providerName: 'Dr. Kaelen Thorne, DPT, OCS',
    providerSpecialty: 'Wilderness Physical Medicine & Somatic Therapy',
    facilityName: 'Wilderness Dojo Alpine Health Sanctuary',
    facilityAddress: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
    status: 'Confirmed' as const,
    telehealthOrTrail: 'Alpine Trail Sanctuary' as const,
    preparationNotes: 'Wear trail terrain hiking boots and biometric chest strap. 16oz hydration intake recommended 45 min prior to incline trail drills.',
    insurancePreAuthorized: true,
    estimatedCopay: 30.00
  },
  {
    id: 'APT-2026-902',
    patientId: 'PT-8821',
    patientName: 'Elena Rostova',
    appointmentDate: '2026-08-26',
    appointmentTime: '10:30 AM',
    durationMinutes: 60,
    encounterType: 'Biometric Rehabilitation' as const,
    providerName: 'Dr. Jesse Rivera, MD, ABIHM',
    providerSpecialty: 'Integrative Wilderness Medicine',
    facilityName: 'Wilderness Dojo Basecamp Outpost',
    facilityAddress: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
    status: 'Scheduled' as const,
    telehealthOrTrail: 'Secure Telehealth' as const,
    preparationNotes: 'Review 14-day continuous HRV baseline log and post-trek thoracic spinal range measurements.',
    insurancePreAuthorized: true,
    estimatedCopay: 30.00
  },
  {
    id: 'APT-2026-903',
    patientId: 'PT-9402',
    patientName: 'Marcus Vance',
    appointmentDate: '2026-08-18',
    appointmentTime: '02:00 PM',
    durationMinutes: 90,
    encounterType: 'Martial Movement Rehab' as const,
    providerName: 'Sensei Maya Chen, LAc, MPT',
    providerSpecialty: 'Integrative Martial Rehabilitation & Sports Medicine',
    facilityName: 'Wilderness Dojo Alpine Health Sanctuary',
    facilityAddress: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
    status: 'Confirmed' as const,
    telehealthOrTrail: 'Dojo Training Hall' as const,
    preparationNotes: 'Bring Dojo Bo-staff mobility gear. Pre-session isometric warm-up provided via WordPress member portal app.',
    insurancePreAuthorized: true,
    estimatedCopay: 25.00
  },
  {
    id: 'APT-2026-904',
    patientId: 'PT-9402',
    patientName: 'Marcus Vance',
    appointmentDate: '2026-08-25',
    appointmentTime: '03:15 PM',
    durationMinutes: 60,
    encounterType: 'Physical Conditioning & Gait Training' as const,
    providerName: 'Dr. Kaelen Thorne, DPT, OCS',
    providerSpecialty: 'Wilderness Physical Medicine & Somatic Therapy',
    facilityName: 'Wilderness Dojo Alpine Health Sanctuary',
    facilityAddress: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
    status: 'Scheduled' as const,
    telehealthOrTrail: 'Alpine Trail Sanctuary' as const,
    preparationNotes: 'Kinetic chain load test and scapular stabilization reassessment.',
    insurancePreAuthorized: true,
    estimatedCopay: 25.00
  },
  {
    id: 'APT-2026-905',
    patientId: 'PT-7119',
    patientName: 'Sophia Al-Mansoor',
    appointmentDate: '2026-08-20',
    appointmentTime: '11:00 AM',
    durationMinutes: 60,
    encounterType: 'Forest Mindfulness & Stress Protocol' as const,
    providerName: 'Dr. Jesse Rivera, MD, ABIHM',
    providerSpecialty: 'Integrative Wilderness Medicine',
    facilityName: 'Wilderness Dojo Basecamp Outpost',
    facilityAddress: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
    status: 'Confirmed' as const,
    telehealthOrTrail: 'Shinrin-Yoku Forest' as const,
    preparationNotes: 'Shinrin-yoku forest immersion session. Fasting glucose not required; bring water and wear weather-protective layers.',
    insurancePreAuthorized: true,
    estimatedCopay: 25.00
  }
];

export const PATIENT_LONGITUDINAL_HISTORIES: Record<string, {
  baselineDate: string;
  targetDate: string;
  telemetryTrends: {
    date: string;
    encounterLabel: string;
    hrvScore: number;
    heartRate: number;
    mobilityScore: number;
    stressIndex: number;
    spo2: number;
    systolicBp: number;
    diastolicBp: number;
    painLevel: number;
  }[];
  overallRecoveryPercent: number;
  clinicalMilestones: {
    id: string;
    date: string;
    title: string;
    category: 'Biomarker' | 'Biomechanics' | 'Autonomic' | 'Adherence';
    description: string;
    status: 'Achieved' | 'In Progress' | 'Target';
  }[];
  carePlanHighlights: string[];
}> = {
  'PT-8821': {
    baselineDate: '2026-06-10',
    targetDate: '2026-09-30',
    overallRecoveryPercent: 78,
    telemetryTrends: [
      { date: '2026-06-10', encounterLabel: 'Baseline Intake', hrvScore: 38, heartRate: 78, mobilityScore: 58, stressIndex: 82, spo2: 97, systolicBp: 134, diastolicBp: 88, painLevel: 7 },
      { date: '2026-07-02', encounterLabel: 'Encounter 1: Somatic Intro', hrvScore: 46, heartRate: 74, mobilityScore: 68, stressIndex: 68, spo2: 98, systolicBp: 128, diastolicBp: 82, painLevel: 5 },
      { date: '2026-07-22', encounterLabel: 'Encounter 2: Alpine Incline', hrvScore: 59, heartRate: 69, mobilityScore: 78, stressIndex: 48, spo2: 98, systolicBp: 122, diastolicBp: 78, painLevel: 4 },
      { date: '2026-08-14', encounterLabel: 'Encounter 3: Current State', hrvScore: 72, heartRate: 64, mobilityScore: 88, stressIndex: 28, spo2: 99, systolicBp: 118, diastolicBp: 76, painLevel: 2 },
    ],
    clinicalMilestones: [
      { id: 'M-1', date: '2026-07-02', title: 'HRV Elevation > 45ms', category: 'Autonomic', description: 'Restored baseline vagal brake activity during resting parasympathetic state.', status: 'Achieved' },
      { id: 'M-2', date: '2026-07-22', title: 'Thoracic Extension > 75°', category: 'Biomechanics', description: 'Eliminated sharp paraspinal spasm during 15% incline trail ascending.', status: 'Achieved' },
      { id: 'M-3', date: '2026-08-14', title: 'Cortisol Awakening Normalization', category: 'Biomarker', description: 'Salivary diurnal curve restored to healthy clinical reference range.', status: 'Achieved' },
      { id: 'M-4', date: '2026-09-15', title: 'Full Alpine High-Pass Clearance', category: 'Adherence', description: '12-mile wilderness backpacking endurance without thoracic flare-ups.', status: 'In Progress' }
    ],
    carePlanHighlights: [
      'Twice-weekly guided alpine incline somatic physical therapy drills (CPT 97110/97112).',
      'Daily 20-minute parasympathetic diaphragmatic pacing via Wilderness Dojo member portal.',
      'Continuous biometric monitoring with SpO2 and HRV telemetry verification.',
      'Active pre-authorized BCBS insurance coverage with $30 copay schedule.'
    ]
  },
  'PT-9402': {
    baselineDate: '2026-06-25',
    targetDate: '2026-10-15',
    overallRecoveryPercent: 72,
    telemetryTrends: [
      { date: '2026-06-25', encounterLabel: 'Baseline Intake', hrvScore: 42, heartRate: 82, mobilityScore: 52, stressIndex: 78, spo2: 97, systolicBp: 138, diastolicBp: 90, painLevel: 6 },
      { date: '2026-07-15', encounterLabel: 'Encounter 1: Kinetic Chain', hrvScore: 51, heartRate: 76, mobilityScore: 64, stressIndex: 62, spo2: 98, systolicBp: 130, diastolicBp: 84, painLevel: 5 },
      { date: '2026-08-01', encounterLabel: 'Encounter 2: Bo-Staff Rehab', hrvScore: 58, heartRate: 72, mobilityScore: 74, stressIndex: 45, spo2: 98, systolicBp: 126, diastolicBp: 82, painLevel: 3 },
      { date: '2026-08-13', encounterLabel: 'Encounter 3: Current State', hrvScore: 65, heartRate: 68, mobilityScore: 82, stressIndex: 34, spo2: 98, systolicBp: 124, diastolicBp: 80, painLevel: 2 },
    ],
    clinicalMilestones: [
      { id: 'M-1', date: '2026-07-15', title: 'Shoulder Abduction > 140°', category: 'Biomechanics', description: 'Restored active overhead reaching without painful arc sign.', status: 'Achieved' },
      { id: 'M-2', date: '2026-08-01', title: 'Grip Strength Symmetry > 45kg', category: 'Biomechanics', description: 'Balanced kinetic force distribution across posterior rotator cuff.', status: 'Achieved' },
      { id: 'M-3', date: '2026-08-13', title: 'Stress Marker Mitigation', category: 'Autonomic', description: 'Resting systolic blood pressure decreased by 14 mmHg.', status: 'Achieved' },
      { id: 'M-4', date: '2026-09-30', title: 'Full Martial Kata Functional Test', category: 'Adherence', description: 'Unrestricted martial movement drills and executive stress resilience.', status: 'In Progress' }
    ],
    carePlanHighlights: [
      'Martial Bo-Staff kinetic rehabilitation & scapular stabilization (CPT 97530).',
      'Targeted glenohumeral manual therapy and joint mobilization (CPT 97140).',
      'Ergonomic workstation posture alignment protocol and scheduled movement breaks.',
      'Active pre-authorized UHC Optum Wellness insurance coverage with 15% copay.'
    ]
  },
  'PT-7119': {
    baselineDate: '2026-07-01',
    targetDate: '2026-10-01',
    overallRecoveryPercent: 84,
    telemetryTrends: [
      { date: '2026-07-01', encounterLabel: 'Baseline Intake', hrvScore: 48, heartRate: 76, mobilityScore: 66, stressIndex: 72, spo2: 97, systolicBp: 122, diastolicBp: 78, painLevel: 5 },
      { date: '2026-07-18', encounterLabel: 'Encounter 1: Shinrin-Yoku', hrvScore: 62, heartRate: 68, mobilityScore: 76, stressIndex: 52, spo2: 98, systolicBp: 118, diastolicBp: 74, painLevel: 3 },
      { date: '2026-08-02', encounterLabel: 'Encounter 2: Pacing Protocol', hrvScore: 74, heartRate: 63, mobilityScore: 85, stressIndex: 36, spo2: 99, systolicBp: 114, diastolicBp: 72, painLevel: 2 },
      { date: '2026-08-11', encounterLabel: 'Encounter 3: Current State', hrvScore: 84, heartRate: 59, mobilityScore: 92, stressIndex: 20, spo2: 99, systolicBp: 112, diastolicBp: 72, painLevel: 1 },
    ],
    clinicalMilestones: [
      { id: 'M-1', date: '2026-07-18', title: 'Negative Orthostatic Tachycardia Flare', category: 'Biomarker', description: 'Standing HR elevation stabilized under 15 bpm delta.', status: 'Achieved' },
      { id: 'M-2', date: '2026-08-02', title: 'Cognitive Endurance Score > 8/10', category: 'Autonomic', description: 'Sustained attention during complex daily tasks without brain fog.', status: 'Achieved' },
      { id: 'M-3', date: '2026-08-11', title: 'Vagal Tone Recovery (HRV > 80ms)', category: 'Autonomic', description: 'Parasympathetic predominance documented in physiological logs.', status: 'Achieved' },
      { id: 'M-4', date: '2026-09-15', title: 'Self-Directed Forest Pacing Certification', category: 'Adherence', description: 'Completion of 8-week independent Shinrin-yoku therapy curriculum.', status: 'In Progress' }
    ],
    carePlanHighlights: [
      'Shinrin-yoku clinical forest bathing and pacing management (CPT 99214).',
      'Cellular metabolic recovery and integrative nutrition protocol (CPT 97802).',
      'Daily morning outdoor light exposure and circadian rhythm optimization.',
      'Active pre-authorized Aetna Health insurance coverage with $25 copay schedule.'
    ]
  }
};

