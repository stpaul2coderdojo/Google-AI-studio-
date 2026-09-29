import React, { useState } from 'react';
import { 
  User, Activity, Calendar, FileText, ShieldCheck, HeartPulse, 
  TrendingUp, Clock, MapPin, CheckCircle2, AlertCircle, ChevronRight, 
  Sparkles, DollarSign, Download, Plus, ArrowRight, Stethoscope, 
  Layers, CreditCard, RefreshCw, Zap, Award, Target, Phone, Mail,
  ExternalLink, CalendarDays, BarChart2
} from 'lucide-react';
import { 
  MedicalWellnessRecord, 
  InsuranceProvider, 
  Invoice, 
  PatientAppointment,
  LongitudinalBiometricDataPoint 
} from '../types';
import { PATIENT_LONGITUDINAL_HISTORIES, SAMPLE_APPOINTMENTS } from '../data/mockData';

interface PatientPortalSummaryProps {
  records: MedicalWellnessRecord[];
  payers: InsuranceProvider[];
  invoices: Invoice[];
  selectedPatientId?: string;
  onSelectInvoice: (invoice: Invoice) => void;
  onOpenPayment: (invoice: Invoice) => void;
  onNavigateToWorkbenchWithRecord?: (record: MedicalWellnessRecord) => void;
}

export const PatientPortalSummary: React.FC<PatientPortalSummaryProps> = ({
  records,
  payers,
  invoices,
  selectedPatientId: initialSelectedId,
  onSelectInvoice,
  onOpenPayment,
  onNavigateToWorkbenchWithRecord
}) => {
  // Derive unique patient profiles from records
  const uniquePatients = React.useMemo(() => {
    const map = new Map<string, MedicalWellnessRecord>();
    records.forEach(r => {
      if (!map.has(r.patientId)) {
        map.set(r.patientId, r);
      }
    });
    return Array.from(map.values());
  }, [records]);

  // Selected Patient State (default to first patient or prop)
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialSelectedId || uniquePatients[0]?.patientId || 'PT-8821'
  );

  // Appointments state
  const [appointments, setAppointments] = useState<PatientAppointment[]>(SAMPLE_APPOINTMENTS);
  const [showBookModal, setShowBookModal] = useState<boolean>(false);
  const [activeTelemetryMetric, setActiveTelemetryMetric] = useState<'hrv' | 'hr' | 'mobility' | 'stress' | 'bp' | 'pain'>('hrv');
  const [activeTabSection, setActiveTabSection] = useState<'overview' | 'telemetry' | 'billing' | 'appointments' | 'encounters'>('overview');

  // New Appointment Form State
  const [newApptForm, setNewApptForm] = useState<Partial<PatientAppointment>>({
    appointmentDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    appointmentTime: '10:00 AM',
    durationMinutes: 60,
    encounterType: 'Wilderness Somatic Therapy',
    providerName: 'Dr. Kaelen Thorne, DPT, OCS',
    providerSpecialty: 'Wilderness Physical Medicine & Somatic Therapy',
    facilityName: 'Wilderness Dojo Alpine Health Sanctuary',
    facilityAddress: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
    status: 'Scheduled',
    telehealthOrTrail: 'Alpine Trail Sanctuary',
    preparationNotes: 'Wear flexible trail athletic attire and bring heart rate sensor.',
    insurancePreAuthorized: true,
    estimatedCopay: 30.00
  });

  // Current Patient Data
  const currentPatientRecord = uniquePatients.find(p => p.patientId === selectedPatientId) || uniquePatients[0];
  
  // All encounters for this patient
  const patientEncounters = records.filter(r => r.patientId === selectedPatientId);
  
  // All invoices for this patient
  const patientInvoices = invoices.filter(inv => 
    inv.patientName.toLowerCase() === currentPatientRecord?.patientName.toLowerCase() ||
    patientEncounters.some(e => e.id === inv.recordId)
  );

  // All upcoming appointments for this patient
  const patientAppointments = appointments.filter(a => a.patientId === selectedPatientId);

  // Longitudinal telemetry history
  const longitudinalHistory = PATIENT_LONGITUDINAL_HISTORIES[selectedPatientId] || {
    baselineDate: currentPatientRecord?.encounterDate || '2026-07-01',
    targetDate: '2026-10-01',
    overallRecoveryPercent: 75,
    telemetryTrends: [
      { date: '2026-07-01', encounterLabel: 'Baseline Intake', hrvScore: 40, heartRate: 78, mobilityScore: 60, stressIndex: 75, spo2: 97, systolicBp: 130, diastolicBp: 85, painLevel: 6 },
      { date: currentPatientRecord?.encounterDate || '2026-08-14', encounterLabel: 'Latest Encounter', hrvScore: currentPatientRecord?.vitalSigns.hrvScore || 70, heartRate: currentPatientRecord?.vitalSigns.heartRate || 65, mobilityScore: currentPatientRecord?.vitalSigns.mobilityScore || 85, stressIndex: 30, spo2: currentPatientRecord?.vitalSigns.oxygenSaturation || 99, systolicBp: 118, diastolicBp: 76, painLevel: 2 }
    ],
    clinicalMilestones: [
      { id: 'M-GEN-1', date: '2026-07-15', title: 'Biomarker Stabilization', category: 'Biomarker', description: 'Metabolic markers and vital signs within target range.', status: 'Achieved' },
      { id: 'M-GEN-2', date: '2026-08-14', title: 'Functional Range Improvement', category: 'Biomechanics', description: 'Restored active movement under guided rehabilitation load.', status: 'Achieved' },
      { id: 'M-GEN-3', date: '2026-09-30', title: 'Long-term Autonomic Resilience', category: 'Autonomic', description: 'Sustained parasympathetic vagal regulation during physical stress.', status: 'In Progress' }
    ],
    carePlanHighlights: [
      'Structured wilderness somatic rehabilitation and functional conditioning.',
      'Physiological telemetry logging and biomarker tracking.',
      'Integrated medical insurance coverage and electronic claim processing.'
    ]
  };

  // Associated Insurance Provider
  const patientPayer = payers.find(p => p.id === currentPatientRecord?.insuranceProviderId) || payers[0];

  // Financial calculations
  const totalBilled = patientInvoices.reduce((acc, inv) => acc + inv.subtotal, 0);
  const totalInsuranceCovered = patientInvoices.reduce((acc, inv) => acc + inv.insuranceCoveredAmount, 0);
  const outstandingPatientCopay = patientInvoices.reduce((acc, inv) => acc + (inv.status === 'Paid in Full' ? 0 : inv.patientResponsibility), 0);

  // Handle adding appointment
  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatientRecord) return;

    const newAppt: PatientAppointment = {
      id: `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: currentPatientRecord.patientId,
      patientName: currentPatientRecord.patientName,
      appointmentDate: newApptForm.appointmentDate || new Date().toISOString().split('T')[0],
      appointmentTime: newApptForm.appointmentTime || '10:00 AM',
      durationMinutes: newApptForm.durationMinutes || 60,
      encounterType: newApptForm.encounterType as any || 'Wilderness Somatic Therapy',
      providerName: newApptForm.providerName || 'Dr. Kaelen Thorne, DPT',
      providerSpecialty: newApptForm.providerSpecialty || 'Wilderness Physical Medicine',
      facilityName: newApptForm.facilityName || 'Wilderness Dojo Alpine Health Sanctuary',
      facilityAddress: newApptForm.facilityAddress || '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
      status: 'Confirmed',
      telehealthOrTrail: newApptForm.telehealthOrTrail as any || 'Alpine Trail Sanctuary',
      preparationNotes: newApptForm.preparationNotes || 'Standard hydration and biometric gear.',
      insurancePreAuthorized: true,
      estimatedCopay: patientPayer.standardCopayAmount || 30.00
    };

    setAppointments(prev => [newAppt, ...prev]);
    setShowBookModal(false);
  };

  // Telemetry Sparkline metrics
  const latestTelemetry = longitudinalHistory.telemetryTrends[longitudinalHistory.telemetryTrends.length - 1];
  const baselineTelemetry = longitudinalHistory.telemetryTrends[0];

  const hrvDelta = latestTelemetry && baselineTelemetry ? Math.round(((latestTelemetry.hrvScore - baselineTelemetry.hrvScore) / baselineTelemetry.hrvScore) * 100) : 0;
  const painDelta = latestTelemetry && baselineTelemetry ? Math.round(((baselineTelemetry.painLevel - latestTelemetry.painLevel) / baselineTelemetry.painLevel) * 100) : 0;
  const mobilityDelta = latestTelemetry && baselineTelemetry ? Math.round(((latestTelemetry.mobilityScore - baselineTelemetry.mobilityScore) / baselineTelemetry.mobilityScore) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Patient Selector Strip */}
      <div className="bg-[#081a17]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/30 to-teal-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Select Patient Record
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {uniquePatients.length} Active Patients
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Patient Portal & Longitudinal Health Summary
              </h2>
            </div>
          </div>

          {/* Quick Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {uniquePatients.map((patient) => {
              const isSelected = patient.patientId === selectedPatientId;
              return (
                <button
                  key={patient.patientId}
                  onClick={() => setSelectedPatientId(patient.patientId)}
                  className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 flex items-center space-x-2 shrink-0 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold border-white/20 shadow-lg shadow-emerald-900/40 scale-102'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/5 hover:border-white/15'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-emerald-400'}`} />
                  <span>{patient.patientName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                    {patient.patientId}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {currentPatientRecord && (
        <>
          {/* Patient Master Profile & Top Health Metric Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Demographic & Insurance Credentials Card */}
            <div className="lg:col-span-2 bg-[#091e1b]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-white/10">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-extrabold text-2xl shadow-lg shadow-emerald-950/60 border border-white/30 shrink-0">
                    {currentPatientRecord.patientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {currentPatientRecord.patientName}
                      </h1>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1 shadow-inner">
                        <Award className="w-3 h-3 text-emerald-300" />
                        <span>Active Sanctuary Protocol</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-300 flex-wrap gap-y-1">
                      <span>DOB: <strong className="text-white font-mono">{currentPatientRecord.dob}</strong></span>
                      <span>•</span>
                      <span>Gender: <strong className="text-white">{currentPatientRecord.gender}</strong></span>
                      <span>•</span>
                      <span>MRN: <strong className="text-emerald-400 font-mono">{currentPatientRecord.patientId}</strong></span>
                      {currentPatientRecord.linkedWpMemberId && (
                        <>
                          <span>•</span>
                          <span className="text-teal-300">WordPress Member: <strong className="font-mono text-white">{currentPatientRecord.linkedWpMemberId}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setShowBookModal(true)}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-400 transition shadow-lg shadow-emerald-900/40 flex items-center space-x-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>

              {/* Contact & Insurance Subgrid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Contact & Address
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center space-x-2 text-slate-200">
                      <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{currentPatientRecord.contactEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-200">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{currentPatientRecord.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{currentPatientRecord.facilityAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Verified Medical Insurance
                  </span>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">{patientPayer.name}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-300 text-[10px] font-mono border border-emerald-400/20">
                        {patientPayer.payerId}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1">
                      <span>Policy: <strong className="text-slate-100 font-mono">{currentPatientRecord.insurancePolicyNumber}</strong></span>
                      <span>Group: <strong className="text-slate-100 font-mono">{currentPatientRecord.insuranceGroupNumber}</strong></span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-emerald-300/90 pt-1 border-t border-white/5">
                      <span>Standard Copay: <strong>${patientPayer.standardCopayAmount.toFixed(2)}</strong></span>
                      <span>Reimbursement: <strong>{Math.round(patientPayer.typicalReimbursementRate * 100)}%</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Recovery Index & Quick Status Panel */}
            <div className="bg-[#091e1b]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Longitudinal Recovery Index
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-400/15 text-teal-300 font-mono border border-teal-400/30">
                    Phase III
                  </span>
                </div>

                <div className="flex items-baseline space-x-3">
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
                    {longitudinalHistory.overallRecoveryPercent}%
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    +24% vs baseline
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900/80 rounded-full h-3 p-0.5 border border-white/10">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000 shadow-sm shadow-emerald-500/50"
                    style={{ width: `${longitudinalHistory.overallRecoveryPercent}%` }}
                  />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Target recovery window ending <strong>{longitudinalHistory.targetDate}</strong>. Autonomic vagal tone and thoracic mobility indexes indicate sustained functional healing.
                </p>
              </div>

              {/* Quick Summary Chips */}
              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/10 mt-6">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Encounters</span>
                  <span className="text-lg font-bold text-white mt-0.5 block">{patientEncounters.length} Completed</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Copay Balance</span>
                  <span className={`text-lg font-bold mt-0.5 block ${outstandingPatientCopay > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
                    ${outstandingPatientCopay.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center space-x-2 border-b border-white/10 pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTabSection('overview')}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 flex items-center space-x-2 shrink-0 ${
                activeTabSection === 'overview'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Longitudinal Health Overview</span>
            </button>

            <button
              onClick={() => setActiveTabSection('billing')}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 flex items-center space-x-2 shrink-0 ${
                activeTabSection === 'billing'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Recent Billing Statuses ({patientInvoices.length})</span>
            </button>

            <button
              onClick={() => setActiveTabSection('appointments')}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 flex items-center space-x-2 shrink-0 ${
                activeTabSection === 'appointments'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Upcoming Appointments ({patientAppointments.length})</span>
            </button>

            <button
              onClick={() => setActiveTabSection('encounters')}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 flex items-center space-x-2 shrink-0 ${
                activeTabSection === 'encounters'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Clinical Encounters ({patientEncounters.length})</span>
            </button>
          </div>

          {/* Section 1: Longitudinal Health Overview */}
          {activeTabSection === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Telemetry Trajectory Section */}
              <div className="bg-[#081a17]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div>
                    <div className="flex items-center space-x-2">
                      <HeartPulse className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        Physiological Telemetry Trends
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-1">
                      Longitudinal Biometric Trajectory
                    </h3>
                  </div>

                  {/* Metric Switcher Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: 'hrv', label: 'HRV (ms)', icon: HeartPulse },
                      { id: 'mobility', label: 'Mobility (0-100)', icon: Activity },
                      { id: 'stress', label: 'Stress Index', icon: Zap },
                      { id: 'hr', label: 'Heart Rate (bpm)', icon: HeartPulse },
                      { id: 'bp', label: 'Blood Pressure', icon: Activity },
                      { id: 'pain', label: 'Pain (0-10)', icon: AlertCircle },
                    ].map((metric) => {
                      const isActive = activeTelemetryMetric === metric.id;
                      return (
                        <button
                          key={metric.id}
                          onClick={() => setActiveTelemetryMetric(metric.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition duration-150 flex items-center space-x-1.5 ${
                            isActive
                              ? 'bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/40 shadow-sm'
                              : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/5'
                          }`}
                        >
                          <span>{metric.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Trajectory Highlights & Key Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Heart Rate Variability (HRV)</span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-2xl font-bold text-emerald-300 font-mono">{latestTelemetry.hrvScore} ms</span>
                      <span className="text-xs text-emerald-400 font-semibold">+{hrvDelta}%</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Baseline: {baselineTelemetry.hrvScore} ms (Vagal Brake Activated)</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Thoracic Mobility Score</span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-2xl font-bold text-teal-300 font-mono">{latestTelemetry.mobilityScore}/100</span>
                      <span className="text-xs text-teal-400 font-semibold">+{mobilityDelta}%</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Active Incline Range: 88° Extension</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Resting Blood Pressure</span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-2xl font-bold text-cyan-300 font-mono">{latestTelemetry.systolicBp}/{latestTelemetry.diastolicBp}</span>
                      <span className="text-xs text-cyan-400 font-semibold">Optimal</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Baseline: {baselineTelemetry.systolicBp}/{baselineTelemetry.diastolicBp} mmHg</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Pain Visual Analog Scale</span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-2xl font-bold text-emerald-300 font-mono">{latestTelemetry.painLevel}/10</span>
                      <span className="text-xs text-emerald-400 font-semibold">-{painDelta}%</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Baseline: {baselineTelemetry.painLevel}/10 (Severe Post-Trek)</span>
                  </div>
                </div>

                {/* Longitudinal Visual Telemetry Bar Graph / Timeline */}
                <div className="mt-8 p-6 rounded-2xl bg-[#040e0c]/90 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/5">
                    <span>Encounter / Date Checkpoint</span>
                    <span className="font-semibold text-slate-300">
                      Telemetry Index ({activeTelemetryMetric.toUpperCase()})
                    </span>
                  </div>

                  <div className="space-y-4">
                    {longitudinalHistory.telemetryTrends.map((trend, idx) => {
                      let val = 0;
                      let displayVal = '';
                      let percentWidth = 0;
                      let colorClass = 'from-emerald-500 to-teal-400';

                      if (activeTelemetryMetric === 'hrv') {
                        val = trend.hrvScore;
                        displayVal = `${val} ms`;
                        percentWidth = Math.min(100, Math.round((val / 100) * 100));
                      } else if (activeTelemetryMetric === 'mobility') {
                        val = trend.mobilityScore;
                        displayVal = `${val} / 100`;
                        percentWidth = Math.min(100, val);
                      } else if (activeTelemetryMetric === 'stress') {
                        val = trend.stressIndex;
                        displayVal = `${val} Index`;
                        percentWidth = Math.min(100, val);
                        colorClass = val > 60 ? 'from-amber-500 to-rose-400' : 'from-emerald-500 to-teal-400';
                      } else if (activeTelemetryMetric === 'hr') {
                        val = trend.heartRate;
                        displayVal = `${val} bpm`;
                        percentWidth = Math.min(100, Math.round((val / 120) * 100));
                      } else if (activeTelemetryMetric === 'bp') {
                        displayVal = `${trend.systolicBp}/${trend.diastolicBp} mmHg`;
                        percentWidth = Math.min(100, Math.round((trend.systolicBp / 160) * 100));
                      } else if (activeTelemetryMetric === 'pain') {
                        val = trend.painLevel;
                        displayVal = `${val} / 10`;
                        percentWidth = Math.min(100, val * 10);
                        colorClass = val > 5 ? 'from-rose-500 to-amber-400' : 'from-emerald-500 to-teal-400';
                      }

                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-full bg-white/10 text-[10px] flex items-center justify-center font-mono font-bold text-slate-300">
                                {idx + 1}
                              </span>
                              <span className="font-semibold text-slate-200">{trend.encounterLabel}</span>
                              <span className="text-slate-500 font-mono text-[11px]">({trend.date})</span>
                            </div>
                            <span className="font-mono font-bold text-emerald-400">{displayVal}</span>
                          </div>

                          {/* Metric Progress Visualizer */}
                          <div className="w-full bg-slate-900/80 rounded-full h-3 p-0.5 border border-white/5">
                            <div
                              className={`bg-gradient-to-r ${colorClass} h-full rounded-full transition-all duration-700`}
                              style={{ width: `${percentWidth}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Milestones & Care Plan Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Clinical Milestones */}
                <div className="bg-[#081a17]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">Clinical Milestones & Goals</h3>
                  </div>

                  <div className="space-y-4">
                    {longitudinalHistory.clinicalMilestones.map((milestone) => (
                      <div 
                        key={milestone.id}
                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start justify-between space-x-4 hover:border-white/15 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-200">{milestone.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                              {milestone.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {milestone.description}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Logged: {milestone.date}
                          </span>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 border ${
                          milestone.status === 'Achieved'
                            ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30'
                            : 'bg-teal-400/15 text-teal-300 border-teal-400/30'
                        }`}>
                          {milestone.status === 'Achieved' ? '✓ Achieved' : '⟳ In Progress'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Care Plan Highlights */}
                <div className="bg-[#081a17]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4 text-teal-400" />
                    <h3 className="text-lg font-bold text-white">Active Somatic Care Plan</h3>
                  </div>

                  <div className="space-y-3">
                    {longitudinalHistory.carePlanHighlights.map((highlight, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {highlight}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Antigravity AI Protocol Insight</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Patient shows exceptional autonomic reactivity to high-altitude incline terrain. Recommended continuing current 2-unit CPT 97110 / 97112 regimen for 4 additional clinical weeks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Recent Billing Statuses */}
          {activeTabSection === 'billing' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Billing Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-[#081a17]/90 border border-white/10 shadow-xl space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Billed Charges</span>
                  <span className="text-3xl font-extrabold text-white block">${totalBilled.toFixed(2)}</span>
                  <span className="text-xs text-slate-400 block">{patientInvoices.length} Total Claims Invoiced</span>
                </div>

                <div className="p-6 rounded-3xl bg-[#081a17]/90 border border-white/10 shadow-xl space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Insurance Remitted / Covered</span>
                  <span className="text-3xl font-extrabold text-emerald-400 block">${totalInsuranceCovered.toFixed(2)}</span>
                  <span className="text-xs text-emerald-400/80 block">Adjudicated via {patientPayer.clearinghouse}</span>
                </div>

                <div className="p-6 rounded-3xl bg-[#081a17]/90 border border-white/10 shadow-xl space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Patient Balance / Copay Due</span>
                  <div className="flex items-baseline space-x-3">
                    <span className={`text-3xl font-extrabold block ${outstandingPatientCopay > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
                      ${outstandingPatientCopay.toFixed(2)}
                    </span>
                    {outstandingPatientCopay === 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-semibold border border-emerald-400/30">
                        All Settled
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 block">HSA / FSA Card Eligible</span>
                </div>
              </div>

              {/* Patient Invoices Table */}
              <div className="bg-[#081a17]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Itemized Invoices & Insurance Claims</h3>
                    <p className="text-xs text-slate-400">Claims generated and adjudicated by Antigravity AI</p>
                  </div>
                </div>

                {patientInvoices.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                    <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs">No invoices generated yet for {currentPatientRecord.patientName}.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                          <th className="pb-3 pl-2">Invoice / Claim #</th>
                          <th className="pb-3">Date of Service</th>
                          <th className="pb-3">Insurance Payer</th>
                          <th className="pb-3">Total Billed</th>
                          <th className="pb-3">Insurance Paid</th>
                          <th className="pb-3">Patient Copay</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right pr-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {patientInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-white/[0.02] transition">
                            <td className="py-4 pl-2 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                            <td className="py-4 text-slate-300">{inv.dateOfService}</td>
                            <td className="py-4 text-slate-300">{inv.insuranceProvider?.name || 'Medical Payer'}</td>
                            <td className="py-4 font-mono text-slate-200">${inv.subtotal.toFixed(2)}</td>
                            <td className="py-4 font-mono text-emerald-400">${inv.insuranceCoveredAmount.toFixed(2)}</td>
                            <td className="py-4 font-mono font-bold text-amber-300">${inv.patientResponsibility.toFixed(2)}</td>
                            <td className="py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                                inv.status === 'Paid in Full'
                                  ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30'
                                  : inv.status === 'Adjudicated'
                                  ? 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30'
                                  : 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-4 text-right pr-2">
                              <div className="flex items-center justify-end space-x-2">
                                {inv.patientResponsibility > 0 && inv.status !== 'Paid in Full' && (
                                  <button
                                    onClick={() => onOpenPayment(inv)}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center space-x-1"
                                  >
                                    <CreditCard className="w-3 h-3" />
                                    <span>Pay Copay</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => onSelectInvoice(inv)}
                                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 font-medium text-xs border border-white/10 transition flex items-center space-x-1"
                                >
                                  <span>View Statement</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Upcoming Appointments */}
          {activeTabSection === 'appointments' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Upcoming Sanctuary Appointments</h3>
                  <p className="text-xs text-slate-400">Scheduled clinical sessions, trail somatic protocols & telehealth visits</p>
                </div>

                <button
                  onClick={() => setShowBookModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-400 transition shadow-lg shadow-emerald-900/40 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule New Encounter</span>
                </button>
              </div>

              {patientAppointments.length === 0 ? (
                <div className="text-center py-16 bg-[#081a17]/90 border border-white/10 rounded-3xl">
                  <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-300 text-sm font-semibold">No appointments scheduled.</p>
                  <button
                    onClick={() => setShowBookModal(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    Schedule First Appointment
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {patientAppointments.map((appt) => (
                    <div 
                      key={appt.id}
                      className="bg-[#081a17]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 hover:border-emerald-500/30 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 flex flex-col items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {new Date(appt.appointmentDate).toLocaleString('default', { month: 'short' })}
                            </span>
                            <span className="text-lg font-black font-mono leading-none">
                              {new Date(appt.appointmentDate).getDate()}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-emerald-400 block">{appt.encounterType}</span>
                            <h4 className="text-base font-bold text-white">{appt.appointmentTime} ({appt.durationMinutes} min)</h4>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          appt.status === 'Confirmed'
                            ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30'
                            : 'bg-teal-400/15 text-teal-300 border-teal-400/30'
                        }`}>
                          {appt.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs border-t border-b border-white/5 py-4 text-slate-300">
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Provider: <strong className="text-white">{appt.providerName}</strong> ({appt.providerSpecialty})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Venue: <strong className="text-white">{appt.telehealthOrTrail}</strong> • {appt.facilityName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Insurance Pre-Authorized • Estimated Copay: <strong className="text-emerald-300">${appt.estimatedCopay.toFixed(2)}</strong></span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                          Preparation & Protocol Notes
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {appt.preparationNotes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 4: Clinical Encounters Timeline */}
          {activeTabSection === 'encounters' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Clinical Encounters & Clinical Notes</h3>
                  <p className="text-xs text-slate-400">Electronic Health Records, physician dictation & vitals</p>
                </div>
              </div>

              <div className="space-y-6">
                {patientEncounters.map((rec) => (
                  <div 
                    key={rec.id}
                    className="bg-[#081a17]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-emerald-400">{rec.id}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-xs text-slate-300">{rec.encounterDate}</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mt-0.5">{rec.encounterType}</h4>
                        <p className="text-xs text-slate-400">Provider: {rec.providerName} • {rec.facilityName}</p>
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 self-start sm:self-auto">
                        Status: {rec.billingStatus}
                      </span>
                    </div>

                    {/* Vitals Ribbon */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                        <span className="text-[10px] text-slate-400 block uppercase">Blood Pressure</span>
                        <span className="text-xs font-mono font-bold text-white mt-0.5 block">{rec.vitalSigns.bloodPressure}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                        <span className="text-[10px] text-slate-400 block uppercase">Heart Rate</span>
                        <span className="text-xs font-mono font-bold text-emerald-300 mt-0.5 block">{rec.vitalSigns.heartRate} bpm</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                        <span className="text-[10px] text-slate-400 block uppercase">HRV Score</span>
                        <span className="text-xs font-mono font-bold text-teal-300 mt-0.5 block">{rec.vitalSigns.hrvScore} ms</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                        <span className="text-[10px] text-slate-400 block uppercase">Cortisol Index</span>
                        <span className="text-xs font-bold text-emerald-400 mt-0.5 block truncate">{rec.vitalSigns.cortisolIndex}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                        <span className="text-[10px] text-slate-400 block uppercase">Mobility</span>
                        <span className="text-xs font-mono font-bold text-cyan-300 mt-0.5 block">{rec.vitalSigns.mobilityScore}/100</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                        <span className="text-[10px] text-slate-400 block uppercase">SpO2</span>
                        <span className="text-xs font-mono font-bold text-white mt-0.5 block">{rec.vitalSigns.oxygenSaturation}%</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                        <span className="text-[10px] text-slate-400 block uppercase">Resp. Rate</span>
                        <span className="text-xs font-mono font-bold text-white mt-0.5 block">{rec.vitalSigns.respiratoryRate}/min</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[11px] mb-1">
                          Chief Complaint
                        </span>
                        <p className="text-slate-200 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          {rec.chiefComplaint}
                        </p>
                      </div>

                      <div>
                        <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[11px] mb-1">
                          Clinical Progress Notes
                        </span>
                        <p className="text-slate-300 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 leading-relaxed">
                          {rec.clinicalNotes}
                        </p>
                      </div>
                    </div>

                    {/* Diagnosis & Procedure Codes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5 text-xs">
                      <div className="space-y-2">
                        <span className="text-slate-400 font-semibold block uppercase text-[10px]">Diagnoses (ICD-10-CM)</span>
                        <div className="space-y-1.5">
                          {rec.diagnosisCodes.map(d => (
                            <div key={d.code} className="flex items-center space-x-2 text-slate-300 bg-white/[0.02] p-2 rounded-lg">
                              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono rounded font-bold">{d.code}</span>
                              <span className="truncate">{d.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-slate-400 font-semibold block uppercase text-[10px]">Procedures (AMA CPT)</span>
                        <div className="space-y-1.5">
                          {rec.procedureCodes.map(c => (
                            <div key={c.code} className="flex items-center justify-between text-slate-300 bg-white/[0.02] p-2 rounded-lg">
                              <div className="flex items-center space-x-2 truncate">
                                <span className="px-1.5 py-0.5 bg-teal-500/20 text-teal-300 font-mono rounded font-bold">{c.code}</span>
                                <span className="truncate">{c.description}</span>
                              </div>
                              <span className="font-mono text-emerald-400 shrink-0">${((c.fee || 85) * (c.units || 1)).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Book Appointment Modal */}
      {showBookModal && currentPatientRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#081a17] border border-white/20 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Schedule Encounter</span>
                <h3 className="text-xl font-bold text-white">Book Sanctuary Session</h3>
              </div>
              <button
                onClick={() => setShowBookModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Patient</span>
                <span className="text-sm font-bold text-white mt-0.5 block">{currentPatientRecord.patientName} ({currentPatientRecord.patientId})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={newApptForm.appointmentDate}
                    onChange={(e) => setNewApptForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
                    className="w-full bg-[#040e0c] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Time & Duration</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newApptForm.appointmentTime}
                      onChange={(e) => setNewApptForm(prev => ({ ...prev, appointmentTime: e.target.value }))}
                      placeholder="e.g. 10:00 AM"
                      className="w-2/3 bg-[#040e0c] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                      required
                    />
                    <select
                      value={newApptForm.durationMinutes}
                      onChange={(e) => setNewApptForm(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
                      className="w-1/3 bg-[#040e0c] border border-white/10 rounded-xl px-2 py-2 text-white focus:border-emerald-400 focus:outline-none"
                    >
                      <option value={45}>45m</option>
                      <option value={60}>60m</option>
                      <option value={75}>75m</option>
                      <option value={90}>90m</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Encounter Type</label>
                <select
                  value={newApptForm.encounterType}
                  onChange={(e) => setNewApptForm(prev => ({ ...prev, encounterType: e.target.value as any }))}
                  className="w-full bg-[#040e0c] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                >
                  <option value="Wilderness Somatic Therapy">Wilderness Somatic Therapy (Alpine Trail Incline)</option>
                  <option value="Martial Movement Rehab">Martial Movement Rehab (Bo-Staff & Kinetic Chain)</option>
                  <option value="Forest Mindfulness & Stress Protocol">Forest Mindfulness & Stress Protocol (Shinrin-Yoku)</option>
                  <option value="Biometric Rehabilitation">Biometric Rehabilitation (HRV Telemetry Pacing)</option>
                  <option value="Physical Conditioning & Gait Training">Physical Conditioning & Gait Training</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Attending Provider</label>
                  <select
                    value={newApptForm.providerName}
                    onChange={(e) => setNewApptForm(prev => ({ ...prev, providerName: e.target.value }))}
                    className="w-full bg-[#040e0c] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="Dr. Kaelen Thorne, DPT, OCS">Dr. Kaelen Thorne, DPT (Physical Medicine)</option>
                    <option value="Sensei Maya Chen, LAc, MPT">Sensei Maya Chen, MPT (Martial Rehab)</option>
                    <option value="Dr. Jesse Rivera, MD, ABIHM">Dr. Jesse Rivera, MD (Integrative Medicine)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Venue / Setting</label>
                  <select
                    value={newApptForm.telehealthOrTrail}
                    onChange={(e) => setNewApptForm(prev => ({ ...prev, telehealthOrTrail: e.target.value as any }))}
                    className="w-full bg-[#040e0c] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="Alpine Trail Sanctuary">Alpine Trail Sanctuary (Incline 15%)</option>
                    <option value="Dojo Training Hall">Dojo Training Hall</option>
                    <option value="Shinrin-Yoku Forest">Shinrin-Yoku Pine Forest</option>
                    <option value="Secure Telehealth">Secure Telehealth</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Preparation & Gear Instructions</label>
                <textarea
                  value={newApptForm.preparationNotes}
                  onChange={(e) => setNewApptForm(prev => ({ ...prev, preparationNotes: e.target.value }))}
                  rows={3}
                  className="w-full bg-[#040e0c] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-emerald-400 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                <span>Insurance Pre-Authorization: <strong>Active</strong></span>
                <span>Standard Copay: <strong>${patientPayer.standardCopayAmount.toFixed(2)}</strong></span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-900/40 transition"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
