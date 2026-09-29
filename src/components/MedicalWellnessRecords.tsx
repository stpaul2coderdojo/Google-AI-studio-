import React, { useState } from 'react';
import { 
  Activity, Plus, Search, Filter, Sparkles, HeartPulse, Shield, 
  ChevronRight, Calendar, User, FileText, CheckCircle2, ArrowUpRight,
  TrendingUp, Zap, Stethoscope, AlertCircle, UserCheck, Users, Mail, Phone,
  MapPin, ShieldCheck, Clock, Trash2, ArrowRight
} from 'lucide-react';
import { useIAMAuth } from '../context/IAMAuthContext';
import { MedicalWellnessRecord, InsuranceProvider, Patient, MedicalCodeItem } from '../types';
import { INITIAL_PATIENTS } from '../data/mockData';

interface MedicalWellnessRecordsProps {
  records: MedicalWellnessRecord[];
  payers: InsuranceProvider[];
  patients?: Patient[];
  onSelectRecordForBilling: (record: MedicalWellnessRecord) => void;
  onAddNewRecord: (newRecord: MedicalWellnessRecord) => void;
  onAddNewPatient?: (newPatient: Patient) => void;
  onViewPatientPortal?: (patientId: string) => void;
}

const COMMON_ICD_CODES: { code: string; desc: string; just: string }[] = [
  { code: 'M54.6', desc: 'Pain in thoracic spine', just: 'Primary biomechanical lesion treated during incline gait rehab' },
  { code: 'F43.0', desc: 'Acute stress reaction / somatic fatigue', just: 'Autonomic dysregulation addressed via somatic immersion' },
  { code: 'M75.121', desc: 'Rotator cuff tendinitis, right shoulder', just: 'Chief orthopedic diagnosis under active rehabilitation' },
  { code: 'Z73.0', desc: 'Burn-out / state of vital exhaustion', just: 'Executive stress pathology treated with martial somatic grounding' },
  { code: 'G90.9', desc: 'Disorder of autonomic nervous system, unspecified', just: 'Post-viral vagal nerve and orthostatic rehabilitation' },
  { code: 'Z71.3', desc: 'Dietary & metabolic endurance surveillance', just: 'High-altitude hydration and metabolic recovery coaching' }
];

const COMMON_CPT_CODES: { code: string; desc: string; fee: number; units: number; just: string }[] = [
  { code: '97110', desc: 'Therapeutic Exercise (15 min units)', fee: 85.00, units: 2, just: 'Dynamic wilderness mobility & spinal stabilization drills' },
  { code: '97112', desc: 'Neuromuscular Re-education (15 min units)', fee: 95.00, units: 2, just: 'Proprioceptive trail balancing and posture resetting' },
  { code: '97530', desc: 'Therapeutic Activities, Direct Contact (15 min units)', fee: 90.00, units: 2, just: 'Functional martial kinetic chain mobility and load tolerance' },
  { code: '97140', desc: 'Manual Therapy Techniques (15 min units)', fee: 80.00, units: 2, just: 'Joint mobilization and myofascial release' },
  { code: '90837', desc: 'Mind-Body Somatic Psychotherapy (60 min)', fee: 180.00, units: 1, just: 'Autonomic down-regulation & vagal nerve conditioning' },
  { code: '99214', desc: 'Office / Outpatient Medical Evaluation (Moderate)', fee: 165.00, units: 1, just: 'Longitudinal biometric checkup & clinical care plan update' }
];

export const MedicalWellnessRecords: React.FC<MedicalWellnessRecordsProps> = ({
  records,
  payers,
  patients: externalPatients,
  onSelectRecordForBilling,
  onAddNewRecord,
  onAddNewPatient,
  onViewPatientPortal
}) => {
  const { apiFetch } = useIAMAuth();
  const [viewTab, setViewTab] = useState<'records' | 'patients'>('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<MedicalWellnessRecord | null>(null);
  const [selectedPatientDetail, setSelectedPatientDetail] = useState<Patient | null>(null);

  // Patient Directory State
  const [patientList, setPatientList] = useState<Patient[]>(externalPatients || INITIAL_PATIENTS);

  // Modals state
  const [showCreateRecordModal, setShowCreateRecordModal] = useState<boolean>(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState<boolean>(false);
  const [rawNoteInput, setRawNoteInput] = useState<string>('');
  const [isExtractingNotes, setIsExtractingNotes] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State for new Patient
  const [newPatientForm, setNewPatientForm] = useState<Partial<Patient>>({
    name: '',
    dob: '1992-05-18',
    gender: 'Female',
    contactEmail: '',
    phone: '(530) 555-0100',
    address: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalHistoryNotes: 'Postural strain, mountain athletic conditioning, stress regulation',
    knownAllergies: 'None reported (NKDA)',
    insuranceProviderId: payers[0]?.id || 'bcbs-001',
    insurancePolicyNumber: 'BC-9920041',
    insuranceGroupNumber: 'GRP-WD-880',
    linkedWpMemberId: 'WP-MEMBER-600',
    preferredEncounterType: 'Wilderness Somatic Therapy',
    status: 'Active Member'
  });

  // Form State for new Encounter Record
  const [recordFormData, setRecordFormData] = useState<Partial<MedicalWellnessRecord>>({
    patientId: 'PT-8821',
    patientName: 'Elena Rostova',
    dob: '1989-04-14',
    gender: 'Female',
    contactEmail: 'elena.rostova@wildernessdojo.org',
    phone: '(530) 555-0192',
    insuranceProviderId: payers[0]?.id || 'bcbs-001',
    insurancePolicyNumber: 'BC-992817441',
    insuranceGroupNumber: 'GRP-WD-880',
    encounterDate: new Date().toISOString().split('T')[0],
    encounterType: 'Wilderness Somatic Therapy',
    providerName: 'Dr. Kaelen Thorne, DPT, OCS',
    providerNpi: '1892837492',
    providerSpecialty: 'Wilderness Physical Medicine & Somatic Therapy',
    facilityName: 'Wilderness Dojo Alpine Health Sanctuary',
    facilityAddress: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
    chiefComplaint: '',
    clinicalNotes: '',
    vitalSigns: {
      bloodPressure: '120/78',
      heartRate: 66,
      hrvScore: 72,
      cortisolIndex: 'Low (Optimal)',
      mobilityScore: 86,
      respiratoryRate: 14,
      oxygenSaturation: 99
    },
    biomarkerSummary: 'Somatic recovery in progress with restored parasympathetic vagal tone.',
    diagnosisCodes: [
      { code: 'M54.6', type: 'ICD-10', description: 'Pain in thoracic spine', justification: 'Primary biomechanical lesion' }
    ],
    procedureCodes: [
      { code: '97110', type: 'CPT', description: 'Therapeutic Exercise (15 min units)', fee: 85.00, units: 2, justification: 'Dynamic trail mobility' }
    ],
    billingStatus: 'Ready for Billing',
    linkedWpPostId: 101,
    linkedWpMemberId: 'WP-USER-441'
  });

  // Sync selected patient in record form
  const handleSelectPatientForRecord = (patId: string) => {
    const found = patientList.find(p => p.id === patId);
    if (found) {
      setRecordFormData(prev => ({
        ...prev,
        patientId: found.id,
        patientName: found.name,
        dob: found.dob,
        gender: found.gender,
        contactEmail: found.contactEmail,
        phone: found.phone,
        insuranceProviderId: found.insuranceProviderId,
        insurancePolicyNumber: found.insurancePolicyNumber,
        insuranceGroupNumber: found.insuranceGroupNumber,
        linkedWpMemberId: found.linkedWpMemberId || `WP-MEMBER-${found.id}`
      }));
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || r.encounterType === filterType;
    return matchesSearch && matchesType;
  });

  const filteredPatients = patientList.filter(p => {
    return p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAIExtract = async () => {
    if (!rawNoteInput.trim()) return;
    setIsExtractingNotes(true);
    try {
      const res = await apiFetch('/api/ai/extract-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawNoteInput })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setRecordFormData(prev => ({
          ...prev,
          chiefComplaint: data.data.chiefComplaint || prev.chiefComplaint,
          clinicalNotes: data.data.clinicalNotes || prev.clinicalNotes,
          vitalSigns: {
            ...prev.vitalSigns,
            ...(data.data.vitalSigns || {})
          },
          biomarkerSummary: data.data.biomarkerSummary || prev.biomarkerSummary
        }));
        showToast('Clinical dictation successfully extracted with Gemini AI!');
      }
    } catch (e) {
      console.error(e);
      showToast('Error extracting clinical notes.');
    } finally {
      setIsExtractingNotes(false);
    }
  };

  const handleSaveNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.name?.trim()) return;

    const newId = `PT-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdPatient: Patient = {
      id: newId,
      name: newPatientForm.name || 'New Patient',
      dob: newPatientForm.dob || '1992-05-18',
      gender: (newPatientForm.gender as any) || 'Female',
      contactEmail: newPatientForm.contactEmail || `patient.${newId.toLowerCase()}@wildernessdojo.org`,
      phone: newPatientForm.phone || '(530) 555-0100',
      address: newPatientForm.address || '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
      emergencyContactName: newPatientForm.emergencyContactName || 'Family Contact',
      emergencyContactPhone: newPatientForm.emergencyContactPhone || '(530) 555-0199',
      medicalHistoryNotes: newPatientForm.medicalHistoryNotes || 'Somatic physical therapy and trail conditioning',
      knownAllergies: newPatientForm.knownAllergies || 'NKDA',
      insuranceProviderId: newPatientForm.insuranceProviderId || payers[0]?.id || 'bcbs-001',
      insurancePolicyNumber: newPatientForm.insurancePolicyNumber || `POL-${Math.floor(100000 + Math.random() * 900000)}`,
      insuranceGroupNumber: newPatientForm.insuranceGroupNumber || 'GRP-WD-880',
      linkedWpMemberId: newPatientForm.linkedWpMemberId || `WP-USER-${Math.floor(100 + Math.random() * 900)}`,
      registeredDate: new Date().toISOString().split('T')[0],
      preferredEncounterType: newPatientForm.preferredEncounterType || 'Wilderness Somatic Therapy',
      status: 'Active Member'
    };

    setPatientList(prev => [createdPatient, ...prev]);
    if (onAddNewPatient) {
      onAddNewPatient(createdPatient);
    }

    // Try server sync
    try {
      await apiFetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: createdPatient.id,
          patientName: createdPatient.name,
          encounterType: createdPatient.preferredEncounterType || 'Wilderness Somatic Therapy',
          chiefComplaint: 'Patient Registration & Health Intake Intake',
          clinicalNotes: `Initial registration profile created for ${createdPatient.name}.`,
          insuranceProviderId: createdPatient.insuranceProviderId,
          insurancePolicyNumber: createdPatient.insurancePolicyNumber
        })
      });
    } catch (err) {
      console.warn('Backend sync note:', err);
    }

    setShowAddPatientModal(false);
    showToast(`Patient ${createdPatient.name} (${createdPatient.id}) registered successfully!`);
  };

  const handleSaveNewRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRecId = `REC-2026-00${records.length + 1}`;
    const newRec: MedicalWellnessRecord = {
      id: newRecId,
      patientId: recordFormData.patientId || `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: recordFormData.patientName || 'New Dojo Patient',
      dob: recordFormData.dob || '1990-01-01',
      gender: (recordFormData.gender as any) || 'Female',
      contactEmail: recordFormData.contactEmail || 'member@wildernessdojo.org',
      phone: recordFormData.phone || '(555) 555-5555',
      insuranceProviderId: recordFormData.insuranceProviderId || payers[0]?.id || 'bcbs-001',
      insurancePolicyNumber: recordFormData.insurancePolicyNumber || 'POL-001',
      insuranceGroupNumber: recordFormData.insuranceGroupNumber || 'GRP-WD-880',
      encounterDate: recordFormData.encounterDate || new Date().toISOString().split('T')[0],
      encounterType: (recordFormData.encounterType as any) || 'Wilderness Somatic Therapy',
      providerName: recordFormData.providerName || 'Dr. Kaelen Thorne, DPT, OCS',
      providerNpi: recordFormData.providerNpi || '1892837492',
      providerSpecialty: recordFormData.providerSpecialty || 'Wilderness Physical Medicine & Somatic Therapy',
      facilityName: 'Wilderness Dojo Alpine Health Sanctuary',
      facilityAddress: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
      chiefComplaint: recordFormData.chiefComplaint || 'Alpine rehabilitation and somatic conditioning',
      clinicalNotes: recordFormData.clinicalNotes || 'Patient completed structured wilderness physical therapy and breathwork regulation.',
      vitalSigns: recordFormData.vitalSigns || {
        bloodPressure: '120/80',
        heartRate: 68,
        hrvScore: 70,
        cortisolIndex: 'Low (Optimal)',
        mobilityScore: 85,
        respiratoryRate: 14,
        oxygenSaturation: 99
      },
      biomarkerSummary: recordFormData.biomarkerSummary || 'Somatic recovery telemetry verified.',
      diagnosisCodes: recordFormData.diagnosisCodes || [
        { code: 'M54.6', type: 'ICD-10', description: 'Pain in thoracic spine', justification: 'Paraspinal rehab' }
      ],
      procedureCodes: recordFormData.procedureCodes || [
        { code: '97110', type: 'CPT', description: 'Therapeutic Exercise', fee: 85.00, units: 2, justification: 'Dynamic trail mobility' }
      ],
      billingStatus: 'Ready for Billing',
      linkedWpPostId: 101,
      linkedWpMemberId: recordFormData.linkedWpMemberId || `WP-USER-${Math.floor(100 + Math.random() * 900)}`
    };

    onAddNewRecord(newRec);

    // Call backend API
    try {
      await apiFetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRec)
      });
    } catch (err) {
      console.warn('Backend sync note:', err);
    }

    setShowCreateRecordModal(false);
    setSelectedRecordDetail(newRec);
    showToast(`Clinical encounter ${newRec.id} recorded for ${newRec.patientName}!`);
  };

  const handleAddDiagnosisCode = (diag: { code: string; desc: string; just: string }) => {
    const existing = recordFormData.diagnosisCodes || [];
    if (existing.some(d => d.code === diag.code)) return;
    setRecordFormData(prev => ({
      ...prev,
      diagnosisCodes: [...existing, { code: diag.code, type: 'ICD-10', description: diag.desc, justification: diag.just }]
    }));
  };

  const handleRemoveDiagnosisCode = (code: string) => {
    setRecordFormData(prev => ({
      ...prev,
      diagnosisCodes: (prev.diagnosisCodes || []).filter(d => d.code !== code)
    }));
  };

  const handleAddProcedureCode = (proc: { code: string; desc: string; fee: number; units: number; just: string }) => {
    const existing = recordFormData.procedureCodes || [];
    if (existing.some(p => p.code === proc.code)) return;
    setRecordFormData(prev => ({
      ...prev,
      procedureCodes: [...existing, { code: proc.code, type: 'CPT', description: proc.desc, fee: proc.fee, units: proc.units, justification: proc.just }]
    }));
  };

  const handleRemoveProcedureCode = (code: string) => {
    setRecordFormData(prev => ({
      ...prev,
      procedureCodes: (prev.procedureCodes || []).filter(p => p.code !== code)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-500/95 text-slate-950 font-bold text-xs shadow-2xl flex items-center space-x-2 border border-white/20 backdrop-blur-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <span className="p-2 rounded-xl backdrop-blur-md bg-emerald-400/15 text-emerald-300 border border-emerald-400/30">
              <HeartPulse className="w-5 h-5" />
            </span>
            <span>Medical Wellness & Somatic Health Records</span>
          </h2>
          <p className="text-xs text-slate-300/80 mt-1">
            Comprehensive patient directory, electronic clinical charting, biomarker surveillance, and automated CPT/ICD coding.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowAddPatientModal(true)}
            className="px-3.5 py-2.5 rounded-2xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/15 text-xs font-bold flex items-center space-x-2 transition shadow-sm"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>Add Patient</span>
          </button>

          <button
            onClick={() => setShowCreateRecordModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold flex items-center space-x-2 transition shadow-lg shadow-emerald-500/25 border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Wellness Encounter</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher & Search Bar */}
      <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        {/* Tab Toggle */}
        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 w-full sm:w-auto">
          <button
            onClick={() => setViewTab('records')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition ${
              viewTab === 'records'
                ? 'bg-emerald-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Clinical Encounters ({records.length})</span>
          </button>
          <button
            onClick={() => setViewTab('patients')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition ${
              viewTab === 'patients'
                ? 'bg-emerald-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Patient Registry ({patientList.length})</span>
          </button>
        </div>

        {/* Search Input & Filter */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder={viewTab === 'records' ? "Search records, complaints, or IDs..." : "Search patient name, ID, or email..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {viewTab === 'records' && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
            >
              <option value="ALL" className="bg-[#091a18]">All Types</option>
              <option value="Wilderness Somatic Therapy" className="bg-[#091a18]">Somatic Therapy</option>
              <option value="Martial Movement Rehab" className="bg-[#091a18]">Martial Rehab</option>
              <option value="Forest Mindfulness & Stress Protocol" className="bg-[#091a18]">Forest Mindfulness</option>
            </select>
          )}
        </div>
      </div>

      {/* VIEW: CLINICAL ENCOUNTERS */}
      {viewTab === 'records' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => {
            const payer = payers.find(p => p.id === record.insuranceProviderId);
            return (
              <div
                key={record.id}
                className="backdrop-blur-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-emerald-400/40 rounded-3xl p-6 text-slate-100 flex flex-col justify-between transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-emerald-900/30 group"
              >
                <div className="space-y-3.5">
                  {/* Top Patient Meta */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-base text-white group-hover:text-emerald-300 transition cursor-pointer" onClick={() => setSelectedRecordDetail(record)}>
                        {record.patientName}
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <span>ID: {record.patientId}</span>
                        <span>•</span>
                        <span>DOB: {record.dob}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full backdrop-blur-md bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold">
                      {record.billingStatus}
                    </span>
                  </div>

                  {/* Encounter & Insurance Badges */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center space-x-2 text-slate-200">
                      <Activity className="w-3.5 h-3.5 text-teal-300" />
                      <span className="font-medium">{record.encounterType}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Shield className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{payer?.name || 'Primary Medical Insurance'}</span>
                    </div>
                  </div>

                  {/* Chief Complaint Quote */}
                  <div className="p-3 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300 italic line-clamp-2">
                    "{record.chiefComplaint}"
                  </div>

                  {/* Vital Telemetry Chips */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/[0.08] text-center">
                      <span className="text-slate-400 block text-[9px]">BP</span>
                      <span className="text-slate-100 font-semibold">{record.vitalSigns.bloodPressure}</span>
                    </div>
                    <div className="p-2 rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/[0.08] text-center">
                      <span className="text-teal-300 block text-[9px]">HRV</span>
                      <span className="text-teal-300 font-semibold">{record.vitalSigns.hrvScore}ms</span>
                    </div>
                    <div className="p-2 rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/[0.08] text-center">
                      <span className="text-cyan-300 block text-[9px]">MOBILITY</span>
                      <span className="text-cyan-300 font-semibold">{record.vitalSigns.mobilityScore}/100</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedRecordDetail(record)}
                      className="px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.15] text-xs text-slate-200 border border-white/10 transition"
                    >
                      Full Chart
                    </button>

                    {onViewPatientPortal && (
                      <button
                        onClick={() => onViewPatientPortal(record.patientId)}
                        className="px-3 py-1.5 rounded-xl backdrop-blur-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-semibold transition flex items-center space-x-1"
                        title="View Longitudinal Health Summary & Appointments"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Portal</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectRecordForBilling(record)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Auto-Bill</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: PATIENT REGISTRY & DIRECTORY */}
      {viewTab === 'patients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => {
            const payer = payers.find(p => p.id === patient.insuranceProviderId);
            const patientEncounters = records.filter(r => r.patientId === patient.id || r.patientName.toLowerCase() === patient.name.toLowerCase());

            return (
              <div
                key={patient.id}
                className="backdrop-blur-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-emerald-400/40 rounded-3xl p-6 text-slate-100 flex flex-col justify-between transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-emerald-900/30 group"
              >
                <div className="space-y-4">
                  {/* Top Patient Avatar & Status */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-base shadow-sm">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-white group-hover:text-emerald-300 transition cursor-pointer" onClick={() => setSelectedPatientDetail(patient)}>
                          {patient.name}
                        </h4>
                        <div className="text-xs text-slate-400 font-mono">
                          ID: {patient.id} • {patient.gender}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full backdrop-blur-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                      {patient.status}
                    </span>
                  </div>

                  {/* Contact details */}
                  <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{patient.contactEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{patient.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{patient.address}</span>
                    </div>
                  </div>

                  {/* Insurance and Encounters Meta */}
                  <div className="p-3 rounded-2xl backdrop-blur-md bg-emerald-950/20 border border-emerald-500/20 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400">Insurance:</span>
                      <span className="font-semibold text-emerald-300">{payer?.name.split('(')[0] || 'Medical Insurance'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                      <span>Policy: {patient.insurancePolicyNumber}</span>
                      <span>Encounters: {patientEncounters.length}</span>
                    </div>
                  </div>
                </div>

                {/* Patient Action Buttons */}
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setRecordFormData(prev => ({
                        ...prev,
                        patientId: patient.id,
                        patientName: patient.name,
                        dob: patient.dob,
                        gender: patient.gender,
                        contactEmail: patient.contactEmail,
                        phone: patient.phone,
                        insuranceProviderId: patient.insuranceProviderId,
                        insurancePolicyNumber: patient.insurancePolicyNumber,
                        insuranceGroupNumber: patient.insuranceGroupNumber,
                        linkedWpMemberId: patient.linkedWpMemberId
                      }));
                      setShowCreateRecordModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-400/15 hover:bg-emerald-400/25 text-emerald-300 border border-emerald-400/30 text-xs font-semibold transition flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Encounter</span>
                  </button>

                  {onViewPatientPortal && (
                    <button
                      onClick={() => onViewPatientPortal(patient.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold transition shadow-sm flex items-center space-x-1"
                    >
                      <span>Patient Portal</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatientDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-[#081a17]/95 border border-white/15 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-slate-100 shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6 space-y-5">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-xl">
                  {selectedPatientDetail.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedPatientDetail.name}</h3>
                  <p className="text-xs text-slate-400">
                    Patient ID: {selectedPatientDetail.id} • Registered: {selectedPatientDetail.registeredDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientDetail(null)}
                className="text-slate-400 hover:text-white text-lg font-mono p-1 rounded-lg hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-2">
                <h5 className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">Demographics & Contact</h5>
                <div><span className="text-slate-400">DOB:</span> <span className="text-slate-200 font-medium">{selectedPatientDetail.dob} ({selectedPatientDetail.gender})</span></div>
                <div><span className="text-slate-400">Email:</span> <span className="text-slate-200 font-medium">{selectedPatientDetail.contactEmail}</span></div>
                <div><span className="text-slate-400">Phone:</span> <span className="text-slate-200 font-medium">{selectedPatientDetail.phone}</span></div>
                <div><span className="text-slate-400">Address:</span> <span className="text-slate-200 font-medium">{selectedPatientDetail.address}</span></div>
                <div><span className="text-slate-400">Emergency:</span> <span className="text-slate-200 font-medium">{selectedPatientDetail.emergencyContactName} ({selectedPatientDetail.emergencyContactPhone})</span></div>
              </div>

              <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-2">
                <h5 className="font-bold text-teal-300 uppercase tracking-wider text-[11px]">Insurance & Member Links</h5>
                <div><span className="text-slate-400">Payer ID:</span> <span className="text-slate-200 font-medium">{selectedPatientDetail.insuranceProviderId}</span></div>
                <div><span className="text-slate-400">Policy #:</span> <span className="text-slate-200 font-medium font-mono">{selectedPatientDetail.insurancePolicyNumber}</span></div>
                <div><span className="text-slate-400">Group #:</span> <span className="text-slate-200 font-medium font-mono">{selectedPatientDetail.insuranceGroupNumber}</span></div>
                <div><span className="text-slate-400">WordPress Member:</span> <span className="text-slate-200 font-medium font-mono">{selectedPatientDetail.linkedWpMemberId}</span></div>
                <div><span className="text-slate-400">Allergies:</span> <span className="text-rose-300 font-medium">{selectedPatientDetail.knownAllergies}</span></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 text-xs space-y-1.5">
              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[11px]">Medical & Somatic History</span>
              <p className="text-slate-200 leading-relaxed">{selectedPatientDetail.medicalHistoryNotes}</p>
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedPatientDetail(null)}
                className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.15] text-xs text-slate-300 border border-white/10"
              >
                Close
              </button>
              {onViewPatientPortal && (
                <button
                  onClick={() => {
                    const pid = selectedPatientDetail.id;
                    setSelectedPatientDetail(null);
                    onViewPatientPortal(pid);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold"
                >
                  Open Patient Portal
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Record Modal */}
      {selectedRecordDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-[#081a17]/95 border border-white/15 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto text-slate-100 shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold text-white">{selectedRecordDetail.patientName}</h3>
                  <span className="px-3 py-0.5 rounded-full backdrop-blur-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                    {selectedRecordDetail.encounterType}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Encounter Record #{selectedRecordDetail.id} • Date of Service: {selectedRecordDetail.encounterDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecordDetail(null)}
                className="text-slate-400 hover:text-white text-lg font-mono p-1 rounded-lg hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>

            {/* Vitals Telemetry Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-3 flex items-center space-x-2">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                <span>Biometric & Vital Sign Telemetry</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-white/10">
                  <span className="text-xs text-slate-400 block">Blood Pressure</span>
                  <span className="text-lg font-bold font-mono text-white">{selectedRecordDetail.vitalSigns.bloodPressure}</span>
                </div>
                <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-white/10">
                  <span className="text-xs text-slate-400 block">Heart Rate / HRV</span>
                  <span className="text-lg font-bold font-mono text-teal-300">{selectedRecordDetail.vitalSigns.heartRate} bpm / {selectedRecordDetail.vitalSigns.hrvScore}ms</span>
                </div>
                <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-white/10">
                  <span className="text-xs text-slate-400 block">Cortisol Index</span>
                  <span className="text-sm font-semibold text-emerald-300">{selectedRecordDetail.vitalSigns.cortisolIndex}</span>
                </div>
                <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-white/10">
                  <span className="text-xs text-slate-400 block">Mobility & SpO2</span>
                  <span className="text-lg font-bold font-mono text-cyan-300">{selectedRecordDetail.vitalSigns.mobilityScore}/100 • {selectedRecordDetail.vitalSigns.oxygenSaturation}%</span>
                </div>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-300 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-teal-300" />
                <span>Clinical Notes & Somatic Therapy Observations</span>
              </h4>
              <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 text-xs text-slate-200 leading-relaxed">
                {selectedRecordDetail.clinicalNotes}
              </div>
            </div>

            {/* Diagnoses & Procedures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-2">
                <span className="text-slate-400 block font-semibold">Diagnosis Codes (ICD-10):</span>
                {selectedRecordDetail.diagnosisCodes.map((d, i) => (
                  <div key={i} className="flex justify-between items-center bg-black/30 p-2 rounded-xl border border-white/5">
                    <span className="font-mono font-bold text-emerald-300">{d.code}</span>
                    <span className="text-slate-300 truncate max-w-[180px]">{d.description}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-2">
                <span className="text-slate-400 block font-semibold">Procedures (CPT Codes):</span>
                {selectedRecordDetail.procedureCodes.map((p, i) => (
                  <div key={i} className="flex justify-between items-center bg-black/30 p-2 rounded-xl border border-white/5">
                    <span className="font-mono font-bold text-teal-300">{p.code}</span>
                    <span className="text-slate-300 font-mono">${(p.fee || 0).toFixed(2)} ({p.units || 1} units)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedRecordDetail(null)}
                  className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.15] text-xs font-medium text-slate-200 border border-white/10"
                >
                  Close Record
                </button>

                {onViewPatientPortal && (
                  <button
                    onClick={() => {
                      const pid = selectedRecordDetail.patientId;
                      setSelectedRecordDetail(null);
                      onViewPatientPortal(pid);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Open Patient Portal</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedRecordDetail(null);
                  onSelectRecordForBilling(selectedRecordDetail);
                }}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Antigravity AI Billing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW PATIENT */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-[#081a17]/95 border border-white/15 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-slate-100 shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <User className="w-5 h-5 text-emerald-400" />
                <span>Register New Patient & Dojo Member</span>
              </h3>
              <button onClick={() => setShowAddPatientModal(false)} className="text-slate-400 hover:text-white font-mono p-1 rounded-lg hover:bg-white/10">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewPatient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin-Sutherland"
                    value={newPatientForm.name}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={newPatientForm.dob}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, dob: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value as any })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="Female" className="bg-[#091a18]">Female</option>
                    <option value="Male" className="bg-[#091a18]">Male</option>
                    <option value="Non-Binary" className="bg-[#091a18]">Non-Binary</option>
                    <option value="Other" className="bg-[#091a18]">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="member@domain.com"
                    value={newPatientForm.contactEmail}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, contactEmail: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="(555) 000-0000"
                    value={newPatientForm.phone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="e.g. 104 Dojo Ridge Way, Tahoe Vista, CA 96148"
                  value={newPatientForm.address}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, address: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. David Lin (Spouse)"
                    value={newPatientForm.emergencyContactName}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, emergencyContactName: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. (530) 555-0199"
                    value={newPatientForm.emergencyContactPhone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, emergencyContactPhone: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Insurance Info */}
              <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-3">
                <h5 className="font-bold text-emerald-300 text-xs flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Primary Health Insurance Policy</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Insurance Provider</label>
                    <select
                      value={newPatientForm.insuranceProviderId}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, insuranceProviderId: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                    >
                      {payers.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#091a18]">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Member Policy #</label>
                    <input
                      type="text"
                      placeholder="e.g. POL-99201"
                      value={newPatientForm.insurancePolicyNumber}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, insurancePolicyNumber: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Group #</label>
                    <input
                      type="text"
                      placeholder="e.g. GRP-WD-880"
                      value={newPatientForm.insuranceGroupNumber}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, insuranceGroupNumber: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Known Allergies / Flags</label>
                  <input
                    type="text"
                    placeholder="e.g. NKDA or Latex, Sulfa"
                    value={newPatientForm.knownAllergies}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, knownAllergies: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WordPress Member ID</label>
                  <input
                    type="text"
                    placeholder="e.g. WP-MEMBER-502"
                    value={newPatientForm.linkedWpMemberId}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, linkedWpMemberId: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.15] text-xs text-slate-300 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/25"
                >
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD NEW WELLNESS ENCOUNTER */}
      {showCreateRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-[#081a17]/95 border border-white/15 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto text-slate-100 shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Record New Clinical Wellness Encounter</span>
              </h3>
              <button onClick={() => setShowCreateRecordModal(false)} className="text-slate-400 hover:text-white font-mono p-1 rounded-lg hover:bg-white/10">
                ✕
              </button>
            </div>

            {/* AI Note Dictation Box */}
            <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-emerald-400/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Smart Note Dictation / Fast Fill (Gemini NLP)</span>
                </span>
                <button
                  type="button"
                  onClick={handleAIExtract}
                  disabled={isExtractingNotes || !rawNoteInput.trim()}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:opacity-50 text-slate-950 text-[11px] font-bold transition shadow-sm"
                >
                  {isExtractingNotes ? 'Extracting...' : 'Auto-Extract Telemetry & Notes'}
                </button>
              </div>
              <textarea
                placeholder="Paste raw therapist dictation or session notes (e.g. 'Patient completed 75 min somatic physical therapy and alpine neuromuscular gait conditioning. BP 118/76, HRV 74ms, mobility score 88. Pain reduced from 6/10 to 2/10. Recommending 4 units PT...')"
                value={rawNoteInput}
                onChange={(e) => setRawNoteInput(e.target.value)}
                rows={2}
                className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <form onSubmit={handleSaveNewRecord} className="space-y-4">
              {/* Patient Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Select Patient / Member *</label>
                  <select
                    value={recordFormData.patientId}
                    onChange={(e) => handleSelectPatientForRecord(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none font-medium"
                  >
                    {patientList.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#091a18]">
                        {p.name} ({p.id}) - {p.gender}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Encounter Type *</label>
                  <select
                    value={recordFormData.encounterType}
                    onChange={(e) => setRecordFormData({ ...recordFormData, encounterType: e.target.value as any })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="Wilderness Somatic Therapy" className="bg-[#091a18]">Wilderness Somatic Therapy</option>
                    <option value="Martial Movement Rehab" className="bg-[#091a18]">Martial Movement Rehab</option>
                    <option value="Forest Mindfulness & Stress Protocol" className="bg-[#091a18]">Forest Mindfulness & Stress Protocol</option>
                    <option value="Biometric Rehabilitation" className="bg-[#091a18]">Biometric Rehabilitation</option>
                  </select>
                </div>
              </div>

              {/* Attending Provider & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Service</label>
                  <input
                    type="date"
                    required
                    value={recordFormData.encounterDate}
                    onChange={(e) => setRecordFormData({ ...recordFormData, encounterDate: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Attending Provider</label>
                  <input
                    type="text"
                    required
                    value={recordFormData.providerName}
                    onChange={(e) => setRecordFormData({ ...recordFormData, providerName: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Provider NPI</label>
                  <input
                    type="text"
                    required
                    value={recordFormData.providerNpi}
                    onChange={(e) => setRecordFormData({ ...recordFormData, providerNpi: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Vitals & Biomarkers */}
              <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-3">
                <h5 className="font-bold text-emerald-300 text-xs flex items-center space-x-1.5">
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Vital Signs & Physiological Biomarkers</span>
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={recordFormData.vitalSigns?.bloodPressure || '120/80'}
                      onChange={(e) => setRecordFormData({
                        ...recordFormData,
                        vitalSigns: { ...recordFormData.vitalSigns!, bloodPressure: e.target.value }
                      })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={recordFormData.vitalSigns?.heartRate || 68}
                      onChange={(e) => setRecordFormData({
                        ...recordFormData,
                        vitalSigns: { ...recordFormData.vitalSigns!, heartRate: Number(e.target.value) }
                      })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-teal-300 focus:border-emerald-400 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">HRV Score (ms)</label>
                    <input
                      type="number"
                      value={recordFormData.vitalSigns?.hrvScore || 72}
                      onChange={(e) => setRecordFormData({
                        ...recordFormData,
                        vitalSigns: { ...recordFormData.vitalSigns!, hrvScore: Number(e.target.value) }
                      })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-emerald-300 focus:border-emerald-400 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Mobility (0-100)</label>
                    <input
                      type="number"
                      value={recordFormData.vitalSigns?.mobilityScore || 85}
                      onChange={(e) => setRecordFormData({
                        ...recordFormData,
                        vitalSigns: { ...recordFormData.vitalSigns!, mobilityScore: Number(e.target.value) }
                      })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-cyan-300 focus:border-emerald-400 focus:outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Chief Complaint & Clinical Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Chief Complaint *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paraspinal strain and autonomic hyperarousal following trail climb"
                  value={recordFormData.chiefComplaint}
                  onChange={(e) => setRecordFormData({ ...recordFormData, chiefComplaint: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Clinical Therapy Notes & Observations *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed somatic treatment protocol, patient tolerance, Range of Motion metrics, and care plan..."
                  value={recordFormData.clinicalNotes}
                  onChange={(e) => setRecordFormData({ ...recordFormData, clinicalNotes: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Diagnosis Codes (ICD-10) Builder */}
              <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-emerald-300 text-xs">Diagnosis Codes (ICD-10)</h5>
                  <span className="text-[11px] text-slate-400">Click quick presets below to add</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {COMMON_ICD_CODES.map((icd) => (
                    <button
                      key={icd.code}
                      type="button"
                      onClick={() => handleAddDiagnosisCode(icd)}
                      className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-white/10 text-[11px] flex items-center space-x-1 font-mono transition"
                    >
                      <Plus className="w-3 h-3 text-emerald-400" />
                      <span>{icd.code}</span>
                      <span className="text-slate-400 font-sans truncate max-w-[120px]">({icd.desc})</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  {(recordFormData.diagnosisCodes || []).map((diag) => (
                    <div key={diag.code} className="flex justify-between items-center p-2 rounded-xl bg-black/30 border border-white/5 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-emerald-300">{diag.code}</span>
                        <span className="text-slate-200">{diag.description}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDiagnosisCode(diag.code)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Procedure Codes (CPT) Builder */}
              <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-teal-300 text-xs">Procedure Codes (CPT Billing)</h5>
                  <span className="text-[11px] text-slate-400">Click quick presets to add billable units</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {COMMON_CPT_CODES.map((cpt) => (
                    <button
                      key={cpt.code}
                      type="button"
                      onClick={() => handleAddProcedureCode(cpt)}
                      className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-teal-500/20 text-slate-200 hover:text-teal-300 border border-white/10 text-[11px] flex items-center space-x-1 font-mono transition"
                    >
                      <Plus className="w-3 h-3 text-teal-400" />
                      <span>{cpt.code}</span>
                      <span className="text-emerald-300 font-bold">${cpt.fee}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  {(recordFormData.procedureCodes || []).map((proc) => (
                    <div key={proc.code} className="flex justify-between items-center p-2 rounded-xl bg-black/30 border border-white/5 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-teal-300">{proc.code}</span>
                        <span className="text-slate-200">{proc.description}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-emerald-300 font-bold">${(proc.fee || 0).toFixed(2)} ({proc.units || 1} units)</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProcedureCode(proc.code)}
                          className="text-slate-400 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateRecordModal(false)}
                  className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.15] text-xs text-slate-300 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/25"
                >
                  Save Encounter Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
