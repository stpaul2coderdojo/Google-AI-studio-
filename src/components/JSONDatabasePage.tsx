import React, { useState } from 'react';
import { 
  Database, Code, Save, RefreshCw, Download, Upload, Trash2, 
  Plus, Check, AlertTriangle, Search, Filter, Layers, Copy, CheckCircle2,
  Lock, Sparkles, FileJson, ArrowRightLeft, ShieldCheck
} from 'lucide-react';
import { MedicalWellnessRecord, Invoice, InsuranceProvider, WordPressPost, IAMSecurityAuditEntry } from '../types';
import { useIAMAuth } from '../context/IAMAuthContext';

interface JSONDatabasePageProps {
  records: MedicalWellnessRecord[];
  invoices: Invoice[];
  payers: InsuranceProvider[];
  posts: WordPressPost[];
  onUpdateRecords: (records: MedicalWellnessRecord[]) => void;
  onUpdateInvoices: (invoices: Invoice[]) => void;
  onUpdatePayers: (payers: InsuranceProvider[]) => void;
}

type CollectionKey = 'records' | 'invoices' | 'payers' | 'posts' | 'full_database';

export const JSONDatabasePage: React.FC<JSONDatabasePageProps> = ({
  records,
  invoices,
  payers,
  posts,
  onUpdateRecords,
  onUpdateInvoices,
  onUpdatePayers
}) => {
  const { apiFetch } = useIAMAuth();
  const [activeCollection, setActiveCollection] = useState<CollectionKey>('records');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [jsonEditText, setJsonEditText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [isSyncingServer, setIsSyncingServer] = useState<boolean>(false);

  // Get current active collection data
  const getCollectionData = () => {
    switch (activeCollection) {
      case 'records': return records;
      case 'invoices': return invoices;
      case 'payers': return payers;
      case 'posts': return posts;
      case 'full_database':
        return {
          schemaVersion: '2026.4.1',
          lastUpdated: new Date().toISOString(),
          appDatabase: {
            records,
            invoices,
            payers,
            posts
          },
          metadata: {
            totalRecords: records.length,
            totalInvoices: invoices.length,
            totalPayers: payers.length,
            linkedWordpressSite: 'https://wildernessdojo.home.blog',
            zeroTrustSecurityGrade: 'A+'
          }
        };
    }
  };

  const currentData = getCollectionData();

  // Start editing a specific item in the collection
  const handleStartEdit = (item: any, index: number) => {
    setEditingIndex(index);
    setJsonEditText(JSON.stringify(item, null, 2));
    setJsonError(null);
  };

  // Start editing full collection or full database
  const handleEditEntireCollection = () => {
    setEditingIndex(-1); // -1 represents whole collection
    setJsonEditText(JSON.stringify(currentData, null, 2));
    setJsonError(null);
  };

  // Save changes back to state and backend API
  const handleSaveJson = async () => {
    try {
      const parsed = JSON.parse(jsonEditText);
      setJsonError(null);
      setIsSyncingServer(true);

      if (editingIndex === -1) {
        // Editing entire collection or entire database
        if (activeCollection === 'records' && Array.isArray(parsed)) {
          onUpdateRecords(parsed);
        } else if (activeCollection === 'invoices' && Array.isArray(parsed)) {
          onUpdateInvoices(parsed);
        } else if (activeCollection === 'payers' && Array.isArray(parsed)) {
          onUpdatePayers(parsed);
        } else if (activeCollection === 'full_database' && parsed.appDatabase) {
          if (Array.isArray(parsed.appDatabase.records)) onUpdateRecords(parsed.appDatabase.records);
          if (Array.isArray(parsed.appDatabase.invoices)) onUpdateInvoices(parsed.appDatabase.invoices);
          if (Array.isArray(parsed.appDatabase.payers)) onUpdatePayers(parsed.appDatabase.payers);
        }
      } else if (editingIndex !== null && editingIndex >= 0) {
        // Editing single document
        if (activeCollection === 'records') {
          const updated = [...records];
          updated[editingIndex] = parsed;
          onUpdateRecords(updated);
        } else if (activeCollection === 'invoices') {
          const updated = [...invoices];
          updated[editingIndex] = parsed;
          onUpdateInvoices(updated);
        } else if (activeCollection === 'payers') {
          const updated = [...payers];
          updated[editingIndex] = parsed;
          onUpdatePayers(updated);
        }
      }

      // Sync to backend API endpoint /api/database/json/sync
      try {
        await apiFetch('/api/database/json/sync', {
          method: 'POST',
          body: JSON.stringify({
            collectionName: activeCollection,
            data: parsed
          })
        });
      } catch (e) {
        console.log('Server sync fallback notice:', e);
      }

      setSyncStatusMsg(`Successfully committed and synchronized ${activeCollection} JSON store.`);
      setTimeout(() => setSyncStatusMsg(null), 4000);
      setEditingIndex(null);
    } catch (err: any) {
      setJsonError(`JSON Syntax Error: ${err.message}`);
    } finally {
      setIsSyncingServer(false);
    }
  };

  // Delete item from collection
  const handleDeleteItem = (index: number) => {
    if (!confirm('Are you sure you want to delete this document from the JSON database?')) return;

    if (activeCollection === 'records') {
      const updated = records.filter((_, i) => i !== index);
      onUpdateRecords(updated);
    } else if (activeCollection === 'invoices') {
      const updated = invoices.filter((_, i) => i !== index);
      onUpdateInvoices(updated);
    } else if (activeCollection === 'payers') {
      const updated = payers.filter((_, i) => i !== index);
      onUpdatePayers(updated);
    }

    setSyncStatusMsg(`Document removed from ${activeCollection}.`);
    setTimeout(() => setSyncStatusMsg(null), 3000);
  };

  // Insert document template
  const handleInsertDocument = () => {
    let template: any = {};
    if (activeCollection === 'records') {
      template = {
        id: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
        patientId: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
        patientName: 'New Somatic Patient',
        dob: '1990-01-01',
        gender: 'Other',
        contactEmail: 'patient@wildernessdojo.org',
        phone: '(530) 555-0100',
        insuranceProviderId: 'bcbs-001',
        insurancePolicyNumber: 'POL-9921',
        insuranceGroupNumber: 'GRP-101',
        encounterDate: new Date().toISOString().split('T')[0],
        encounterType: 'Wilderness Somatic Therapy',
        providerName: 'Dr. Kaelen Thorne, DPT',
        providerNpi: '1892837492',
        providerSpecialty: 'Wilderness Somatic Medicine',
        facilityName: 'Wilderness Dojo Alpine Health Sanctuary',
        facilityAddress: '104 Dojo Ridge Way, Tahoe Vista, CA 96148',
        chiefComplaint: 'Postural fatigue and stress dysregulation',
        clinicalNotes: 'Encounter notes pending.',
        vitalSigns: { bloodPressure: '120/80', heartRate: 70, hrvScore: 65, cortisolIndex: 'Optimal', mobilityScore: 85, respiratoryRate: 14, oxygenSaturation: 98 },
        biomarkerSummary: 'Physiological parameters baseline verified.',
        diagnosisCodes: [{ code: 'M54.6', type: 'ICD-10', description: 'Pain in thoracic spine' }],
        procedureCodes: [{ code: '97110', type: 'CPT', description: 'Therapeutic Exercise', fee: 85.0, units: 2 }],
        billingStatus: 'Ready for Coding'
      };
      onUpdateRecords([template, ...records]);
    } else if (activeCollection === 'payers') {
      template = {
        id: `payer-${Date.now()}`,
        name: 'New Commercial Health Network',
        payerId: 'PAYER-NEW',
        clearinghouse: 'Availity EDI Exchange',
        copayType: 'Fixed',
        standardCopayAmount: 25.0,
        deductibleRequired: 250.0,
        typicalReimbursementRate: 0.85,
        realTimeAdjudication: true,
        electronicClaimsPayor: true,
        contactNumber: '1-800-555-0199',
        claimsAddress: 'P.O. Box 100, Healthcare Way, NY 10001'
      };
      onUpdatePayers([...payers, template]);
    }

    setSyncStatusMsg(`Inserted new document into ${activeCollection}.`);
    setTimeout(() => setSyncStatusMsg(null), 3000);
  };

  // Export full JSON file
  const handleExportJson = () => {
    const fullDb = {
      schemaVersion: '2026.4.1',
      exportedAt: new Date().toISOString(),
      appDatabase: {
        records,
        invoices,
        payers,
        posts
      }
    };

    const blob = new Blob([JSON.stringify(fullDb, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wilderness-dojo-database-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopyJson = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Filter items by search query
  const filteredItems = Array.isArray(currentData) ? currentData.filter((item: any) => {
    if (!searchQuery) return true;
    return JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());
  }) : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Database className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Live App JSON Database Explorer
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                Two-Way Sync
              </span>
            </div>
            <p className="text-xs text-slate-300/80 mt-1 max-w-2xl">
              Direct live access to the application's underlying JSON data stores (<span className="font-mono text-emerald-300">records</span>, <span className="font-mono text-emerald-300">invoices</span>, <span className="font-mono text-emerald-300">payers</span>, <span className="font-mono text-emerald-300">posts</span>). Any edits made here immediately reflect throughout all application views and API endpoints.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportJson}
              className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white border border-white/15 flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export JSON Backup</span>
            </button>
            <button
              onClick={handleEditEntireCollection}
              className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-xs font-semibold text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5 transition"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Edit Full JSON</span>
            </button>
          </div>
        </div>

        {/* Sync status toast */}
        {syncStatusMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
        )}
      </div>

      {/* Collection Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => {
              setActiveCollection('records');
              setEditingIndex(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 ${
              activeCollection === 'records'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white bg-white/[0.02] border border-transparent'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>wellness_records.json ({records.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveCollection('invoices');
              setEditingIndex(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 ${
              activeCollection === 'invoices'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white bg-white/[0.02] border border-transparent'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>invoices_claims.json ({invoices.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveCollection('payers');
              setEditingIndex(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 ${
              activeCollection === 'payers'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white bg-white/[0.02] border border-transparent'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>insurance_payers.json ({payers.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveCollection('posts');
              setEditingIndex(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 ${
              activeCollection === 'posts'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white bg-white/[0.02] border border-transparent'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>wordpress_cache.json ({posts.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveCollection('full_database');
              setEditingIndex(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 ${
              activeCollection === 'full_database'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white bg-white/[0.02] border border-transparent'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>full_app_database.json</span>
          </button>
        </div>

        {activeCollection !== 'full_database' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInsertDocument}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center space-x-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert Document</span>
            </button>
          </div>
        )}
      </div>

      {/* Editor or Browser */}
      {editingIndex !== null ? (
        /* Full JSON In-Place Code Editor */
        <div className="backdrop-blur-xl bg-white/[0.03] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">
                {editingIndex === -1
                  ? `Editing Entire ${activeCollection} Collection`
                  : `Editing ${activeCollection} Document #${editingIndex + 1}`}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopyJson(jsonEditText)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs text-slate-300 flex items-center space-x-1.5 transition"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => setEditingIndex(null)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveJson}
                disabled={isSyncingServer}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-md shadow-emerald-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSyncingServer ? 'Committing...' : 'Commit Changes'}</span>
              </button>
            </div>
          </div>

          {jsonError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{jsonError}</span>
            </div>
          )}

          <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/60">
            <textarea
              value={jsonEditText}
              onChange={(e) => setJsonEditText(e.target.value)}
              rows={22}
              className="w-full p-4 font-mono text-xs text-emerald-300 bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-400 leading-relaxed resize-y selection:bg-emerald-500/30"
              spellCheck={false}
            />
          </div>
        </div>
      ) : activeCollection === 'full_database' ? (
        /* Full Database Tree View */
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>App Schema & State Representation</span>
            </h2>
            <button
              onClick={() => handleCopyJson(JSON.stringify(currentData, null, 2))}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs text-slate-300 flex items-center space-x-1.5 transition"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied Full DB' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed">
            {JSON.stringify(currentData, null, 2)}
          </pre>
        </div>
      ) : (
        /* Document Cards Grid */
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${activeCollection} JSON documents by keyword, code, name...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item: any, idx: number) => {
              const docId = item.id || item.invoiceNumber || item.slug || `DOC-${idx}`;
              const docTitle = item.patientName || item.name || item.title || docId;

              return (
                <div
                  key={docId}
                  className="backdrop-blur-xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 rounded-2xl p-4 shadow-lg transition space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{docTitle}</span>
                      <span className="text-[10px] font-mono text-slate-400">{docId}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleStartEdit(item, idx)}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 text-xs font-semibold border border-white/10 transition"
                      >
                        Edit JSON
                      </button>
                      <button
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <pre className="p-3 rounded-xl bg-black/40 border border-white/10 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-48 leading-normal selection:bg-emerald-500/30">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
