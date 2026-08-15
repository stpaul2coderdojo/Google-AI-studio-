import React, { useState } from 'react';
import { 
  Activity, Plus, Search, Filter, Sparkles, HeartPulse, Shield, 
  ChevronRight, Calendar, User, FileText, CheckCircle2, ArrowUpRight,
  TrendingUp, Zap, Stethoscope, AlertCircle
} from 'lucide-react';
import { MedicalWellnessRecord, InsuranceProvider } from '../types';

interface MedicalWellnessRecordsProps {
  records: MedicalWellnessRecord[];
  payers: InsuranceProvider[];
  onSelectRecordForBilling: (record: MedicalWellnessRecord) => void;
  onAddNewRecord: (newRecord: MedicalWellnessRecord) => void;
}

export const MedicalWellnessRecords: React.FC<MedicalWellnessRecordsProps> = ({
  records,
  payers,
  onSelectRecordForBilling,
  onAddNewRecord
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<MedicalWellnessRecord | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [rawNoteInput, setRawNoteInput] = useState<string>('');
  const [isExtractingNotes, setIsExtractingNotes] = useState<boolean>(false);

  // Form State for new record
  const [formData, setFormData] = useState<Partial<MedicalWellnessRecord>>({
    patientName: '',
    dob: '1990-01-01',
    gender: 'Female',
    contactEmail: '',
    phone: '(555) 000-0000',
    insuranceProviderId: payers[0]?.id || 'bcbs-001',
    insurancePolicyNumber: 'POL-992011',
    insuranceGroupNumber: 'GRP-WD-101',
    encounterDate: new Date().toISOString().split('T')[0],
    encounterType: 'Wilderness Somatic Therapy',
    providerName: 'Dr. Kaelen Thorne, DPT',
    providerNpi: '1892837492',
    providerSpecialty: 'Wilderness Somatic Physical Medicine',
    facilityName: 'Wilderness Dojo Alpine Health Sanctuary',
    facilityAddress: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
    chiefComplaint: '',
    clinicalNotes: '',
    vitalSigns: {
      bloodPressure: '120/80',
      heartRate: 68,
      hrvScore: 70,
      cortisolIndex: 'Optimal',
      mobilityScore: 85,
      respiratoryRate: 14,
      oxygenSaturation: 99
    },
    biomarkerSummary: 'Somatic recovery in progress.',
    diagnosisCodes: [
      { code: 'M54.6', type: 'ICD-10', description: 'Pain in thoracic spine', justification: 'Somatic paraspinal rehab' }
    ],
    procedureCodes: [
      { code: '97110', type: 'CPT', description: 'Therapeutic Exercise (15 min units)', fee: 85.00, units: 2 }
    ],
    billingStatus: 'Ready for Billing',
    linkedWpPostId: 101,
    linkedWpMemberId: 'WP-MEMBER-501'
  });

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || r.encounterType === filterType;
    return matchesSearch && matchesType;
  });

  const handleAIExtract = async () => {
    if (!rawNoteInput.trim()) return;
    setIsExtractingNotes(true);
    try {
      const res = await fetch('/api/ai/extract-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawNoteInput })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          chiefComplaint: data.data.chiefComplaint || prev.chiefComplaint,
          clinicalNotes: data.data.clinicalNotes || prev.clinicalNotes,
          vitalSigns: data.data.vitalSigns || prev.vitalSigns,
          biomarkerSummary: data.data.biomarkerSummary || prev.biomarkerSummary
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtractingNotes(false);
    }
  };

  const handleSaveNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newRec: MedicalWellnessRecord = {
      id: `REC-2026-00${records.length + 1}`,
      patientId: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: formData.patientName || 'New Dojo Patient',
      dob: formData.dob || '1990-01-01',
      gender: (formData.gender as any) || 'Female',
      contactEmail: formData.contactEmail || 'member@wildernessdojo.org',
      phone: formData.phone || '(555) 555-5555',
      insuranceProviderId: formData.insuranceProviderId || payers[0]?.id || 'bcbs-001',
      insurancePolicyNumber: formData.insurancePolicyNumber || 'POL-001',
      insuranceGroupNumber: formData.insuranceGroupNumber || 'GRP-WD',
      encounterDate: formData.encounterDate || new Date().toISOString().split('T')[0],
      encounterType: (formData.encounterType as any) || 'Wilderness Somatic Therapy',
      providerName: formData.providerName || 'Dr. Kaelen Thorne, DPT',
      providerNpi: formData.providerNpi || '1892837492',
      providerSpecialty: formData.providerSpecialty || 'Wilderness Physical Medicine',
      facilityName: 'Wilderness Dojo Alpine Health Sanctuary',
      facilityAddress: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
      chiefComplaint: formData.chiefComplaint || 'Alpine rehabilitation and somatic conditioning',
      clinicalNotes: formData.clinicalNotes || 'Patient completed structured wilderness physical therapy and breathwork.',
      vitalSigns: formData.vitalSigns || {
        bloodPressure: '120/80',
        heartRate: 68,
        hrvScore: 70,
        cortisolIndex: 'Optimal',
        mobilityScore: 85,
        respiratoryRate: 14,
        oxygenSaturation: 99
      },
      biomarkerSummary: formData.biomarkerSummary || 'Somatic recovery telemetry verified.',
      diagnosisCodes: formData.diagnosisCodes || [
        { code: 'M54.6', type: 'ICD-10', description: 'Pain in thoracic spine' }
      ],
      procedureCodes: formData.procedureCodes || [
        { code: '97110', type: 'CPT', description: 'Therapeutic Exercise', fee: 85.00, units: 2 }
      ],
      billingStatus: 'Ready for Billing',
      linkedWpPostId: 101,
      linkedWpMemberId: `WP-MEMBER-${Math.floor(100 + Math.random() * 900)}`
    };

    onAddNewRecord(newRec);
    setShowCreateModal(false);
    setSelectedRecordDetail(newRec);
  };

  return (
    <div className="space-y-6">
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
            Electronic clinical charting for Wilderness Dojo members with biomarker surveillance and automated ICD/CPT mapping.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold flex items-center space-x-2 transition shadow-lg shadow-emerald-500/25 border border-white/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Wellness Encounter</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-4 flex flex-col sm:flex-row gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search patient, chief complaint, or record ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
          >
            <option value="ALL" className="bg-[#091a18]">All Encounter Types</option>
            <option value="Wilderness Somatic Therapy" className="bg-[#091a18]">Wilderness Somatic Therapy</option>
            <option value="Martial Movement Rehab" className="bg-[#091a18]">Martial Movement Rehab</option>
            <option value="Forest Mindfulness & Stress Protocol" className="bg-[#091a18]">Forest Mindfulness & Stress Protocol</option>
            <option value="Biometric Rehabilitation" className="bg-[#091a18]">Biometric Rehabilitation</option>
          </select>
        </div>
      </div>

      {/* Records Table / Cards Grid */}
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
                <button
                  onClick={() => setSelectedRecordDetail(record)}
                  className="px-3.5 py-1.5 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.15] text-xs text-slate-200 border border-white/10 transition"
                >
                  Full Chart
                </button>

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

      {/* Detailed Record Modal / Drawer */}
      {selectedRecordDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-[#081a17]/90 border border-white/15 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto text-slate-100 shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6 space-y-6">
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

            {/* Provider & WordPress Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-slate-400 block font-semibold">Attending Clinical Specialist:</span>
                <span className="text-slate-100 font-medium">{selectedRecordDetail.providerName}</span>
                <span className="text-slate-400 block font-mono">NPI: {selectedRecordDetail.providerNpi}</span>
              </div>
              <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-slate-400 block font-semibold">WordPress Member Bridge:</span>
                <span className="text-slate-100 font-medium">Member ID: {selectedRecordDetail.linkedWpMemberId}</span>
                <span className="text-teal-300 block font-mono">wildernessdojo.home.blog/p/{selectedRecordDetail.linkedWpPostId}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <button
                onClick={() => setSelectedRecordDetail(null)}
                className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.15] text-xs font-medium text-slate-200 border border-white/10"
              >
                Close Record
              </button>

              <button
                onClick={() => {
                  setSelectedRecordDetail(null);
                  onSelectRecordForBilling(selectedRecordDetail);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-500/25"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Antigravity AI Billing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Record Modal with AI Note Parser */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-[#081a17]/90 border border-white/15 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-slate-100 shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Record New Wilderness Wellness Encounter</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white font-mono p-1 rounded-lg hover:bg-white/10">
                ✕
              </button>
            </div>

            {/* AI Note Parser Box */}
            <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-emerald-400/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Smart Note Dictation / Fast Fill</span>
                </span>
                <button
                  type="button"
                  onClick={handleAIExtract}
                  disabled={isExtractingNotes || !rawNoteInput.trim()}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:bg-white/10 text-slate-950 text-[11px] font-bold transition shadow-sm"
                >
                  {isExtractingNotes ? 'Extracting with Gemini...' : 'Auto-Extract Clinical Data'}
                </button>
              </div>
              <textarea
                placeholder="Paste raw therapist dictation or session notes (e.g. 'Patient presented with acute low back pain following alpine traverse. Completed 60 min neuromuscular re-ed on forest trail. BP 118/76, HRV 72ms, mobility score 88. Recommending 4 units PT...')"
                value={rawNoteInput}
                onChange={(e) => setRawNoteInput(e.target.value)}
                rows={2}
                className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <form onSubmit={handleSaveNewRecord} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Roland Ramirez"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Encounter Type</label>
                  <select
                    value={formData.encounterType}
                    onChange={(e) => setFormData({ ...formData, encounterType: e.target.value as any })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="Wilderness Somatic Therapy" className="bg-[#091a18]">Wilderness Somatic Therapy</option>
                    <option value="Martial Movement Rehab" className="bg-[#091a18]">Martial Movement Rehab</option>
                    <option value="Forest Mindfulness & Stress Protocol" className="bg-[#091a18]">Forest Mindfulness & Stress Protocol</option>
                    <option value="Biometric Rehabilitation" className="bg-[#091a18]">Biometric Rehabilitation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Insurance Provider</label>
                  <select
                    value={formData.insuranceProviderId}
                    onChange={(e) => setFormData({ ...formData, insuranceProviderId: e.target.value })}
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Policy / Member Number</label>
                  <input
                    type="text"
                    required
                    value={formData.insurancePolicyNumber}
                    onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Chief Complaint</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lumbar strain, autonomic exhaustion from high-altitude expedition"
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Clinical Therapy Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed somatic treatment protocol and patient responses..."
                  value={formData.clinicalNotes}
                  onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.15] text-xs text-slate-300 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/25"
                >
                  Save Record & Open Chart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
