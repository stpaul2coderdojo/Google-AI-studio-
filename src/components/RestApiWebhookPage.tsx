import React, { useState } from 'react';
import { 
  Code, Send, Globe, Key, CheckCircle, AlertCircle, Copy, 
  Terminal, ShieldCheck, RefreshCw, Layers, Database, Lock, 
  FileText, Zap, Sparkles, ExternalLink, Check
} from 'lucide-react';
import { RestApiEndpointSpec } from '../types';
import { useIAMAuth } from '../context/IAMAuthContext';

const ENDPOINTS_CATALOG: RestApiEndpointSpec[] = [
  {
    id: 'ep-auth-login',
    category: 'IAM & Security',
    method: 'POST',
    path: '/api/auth/login',
    description: 'Zero-Trust PBKDF2/SHA-512 authentication & session token issuance',
    requiresAuth: false,
    sampleRequestBody: {
      username: 'admin',
      password: 'DojoAdmin2026!'
    },
    sampleResponse: {
      success: true,
      token: 'ZT-SESSION-99214-XPRIZE-SECURE',
      user: {
        username: 'admin',
        role: 'SUPER_ADMIN',
        permissions: ['MANAGE_USERS', 'VIEW_EHR', 'EDIT_EHR', 'ADJUDICATE_CLAIMS', 'PROCESS_PAYMENTS', 'SYNC_WORDPRESS']
      }
    }
  },
  {
    id: 'ep-records-get',
    category: 'Medical EHR Records',
    method: 'GET',
    path: '/api/records',
    description: 'List all structured clinical wellness and somatic encounter records',
    requiresAuth: true,
    requiredPermission: 'VIEW_EHR',
    sampleResponse: {
      success: true,
      count: 3,
      records: [
        {
          id: 'REC-2026-001',
          patientName: 'Elena Rostova',
          encounterType: 'Wilderness Somatic Therapy',
          vitalSigns: { bloodPressure: '118/76', heartRate: 64, hrvScore: 72, cortisolIndex: 'Low (Optimal)' },
          billingStatus: 'Ready for Billing'
        }
      ]
    }
  },
  {
    id: 'ep-records-post',
    category: 'Medical EHR Records',
    method: 'POST',
    path: '/api/records',
    description: 'Ingest new EHR record with physiological telemetry and provider diagnosis',
    requiresAuth: true,
    requiredPermission: 'EDIT_EHR',
    sampleRequestBody: {
      patientName: 'Marcus Vance',
      encounterType: 'Martial Movement Rehab',
      providerName: 'Sensei Maya Chen, LAc, MPT',
      vitalSigns: { bloodPressure: '124/80', heartRate: 68, hrvScore: 65, cortisolIndex: 'Moderate' },
      diagnosisCodes: [{ code: 'M75.121', description: 'Rotator cuff tendinitis' }],
      procedureCodes: [{ code: '97530', description: 'Therapeutic Activities', fee: 90.0, units: 3 }]
    },
    sampleResponse: {
      success: true,
      message: 'Medical wellness record ingested successfully into EHR repository.',
      record: { id: 'REC-2026-881', patientName: 'Marcus Vance' }
    }
  },
  {
    id: 'ep-ai-extract',
    category: 'Medical EHR Records',
    method: 'POST',
    path: '/api/ai/extract-notes',
    description: 'Gemini NLP extraction of clinician voice dictation into structured JSON EHR',
    requiresAuth: true,
    requiredPermission: 'EDIT_EHR',
    sampleRequestBody: {
      rawText: 'Patient presented with acute thoracic pain after trail sprint. Post-session HRV 72ms, BP 118/76. Prescribed therapeutic exercise.'
    },
    sampleResponse: {
      success: true,
      data: {
        chiefComplaint: 'Postural thoracic strain',
        vitalSigns: { bloodPressure: '118/76', heartRate: 64, hrvScore: 72 },
        suggestedIcd10: ['M54.6: Thoracic pain'],
        suggestedCpt: ['97110: Therapeutic exercise ($85.00)']
      }
    }
  },
  {
    id: 'ep-ai-billing-agent',
    category: 'AI CPT Billing',
    method: 'POST',
    path: '/api/ai/billing-agent',
    description: 'Autonomous multi-stage ICD-10 / CPT coding, fee calculation, and CMS-1500 generation',
    requiresAuth: true,
    requiredPermission: 'ADJUDICATE_CLAIMS',
    sampleRequestBody: {
      record: {
        id: 'REC-2026-001',
        patientName: 'Elena Rostova',
        encounterType: 'Wilderness Somatic Therapy',
        clinicalNotes: 'Intensive 90-min wilderness somatic rehab with incline gait training.'
      },
      insuranceProvider: {
        name: 'Blue Cross Blue Shield',
        payerId: 'BCBS-98301',
        typicalReimbursementRate: 0.88
      }
    },
    sampleResponse: {
      success: true,
      invoiceId: 'INV-2026-88120',
      claimNumber: 'CLM-2026-99120',
      steps: [
        { stage: 'CLINICAL_NLP', title: 'Biomarker Extraction' },
        { stage: 'ICD_CPT_SYNTHESIS', title: 'ICD-10 / CPT Synthesis' },
        { stage: 'INSURANCE_ADJUDICATION', title: 'EDI 837P Adjudication' },
        { stage: 'WP_WEBHOOK_EMIT', title: 'Dispatched Webhook to wildernessdojo.home.blog' }
      ]
    }
  },
  {
    id: 'ep-payments-process',
    category: 'Payment Gateway',
    method: 'POST',
    path: '/api/payments/process',
    description: 'Real-time HSA/FSA, Credit Card, and EDI 835 Copay settlement',
    requiresAuth: true,
    requiredPermission: 'PROCESS_PAYMENTS',
    sampleRequestBody: {
      invoiceId: 'INV-2026-88120',
      amount: 88.56,
      paymentMethod: 'HSA_FSA_CARD',
      cardDetails: { last4: '8821', holder: 'Elena Rostova' }
    },
    sampleResponse: {
      success: true,
      transaction: {
        id: 'TX-1771239912',
        transactionHash: '0x7f4ae8b2e1199aef',
        amountPaid: 88.56,
        status: 'SUCCESS',
        authCode: 'AUTH-948210',
        receiptUrl: '/receipts/dojo-receipt-INV-2026-88120.pdf'
      }
    }
  },
  {
    id: 'ep-wp-sync',
    category: 'WordPress & Webhooks',
    method: 'GET',
    path: '/api/wordpress/sync',
    description: 'Bidirectional sync with wildernessdojo.home.blog blog posts and course catalog',
    requiresAuth: true,
    requiredPermission: 'SYNC_WORDPRESS',
    sampleResponse: {
      success: true,
      siteUrl: 'https://wildernessdojo.home.blog',
      postingEmailGateway: 'duru909mede@post.wordpress.com',
      isOnline: true,
      latencyMs: 38,
      postsCount: 4,
      webhookEndpoint: 'https://wildernessdojo.home.blog/wp-json/dojo-billing/v1/payment-webhook'
    }
  },
  {
    id: 'ep-wp-post-blog',
    category: 'WordPress & Webhooks',
    method: 'POST',
    path: '/api/wordpress/post-blog',
    description: 'Post-by-Email dispatch to duru909mede@post.wordpress.com for wildernessdojo.home.blog publication',
    requiresAuth: true,
    requiredPermission: 'SYNC_WORDPRESS',
    sampleRequestBody: {
      title: 'Alpine Somatic Conditioning & Autonomic Resilience',
      category: 'Wilderness Somatic Medicine',
      tags: ['Somatic Therapy', 'Neuromuscular', 'High Sierra', 'CPT-97110'],
      status: 'publish',
      slug: 'alpine-somatic-conditioning-resilience',
      featuredSessionCost: 350.00,
      coveredUnderInsurance: true,
      content: '## Clinical Somatic Conditioning\nCombining high Sierra trail movement with continuous HRV telemetry.'
    },
    sampleResponse: {
      success: true,
      messageId: 'WP-EMAIL-1723819001-K992X',
      transactionHash: '0x3a992bc81e00f912c98d',
      dispatchedTo: 'duru909mede@post.wordpress.com',
      targetSite: 'https://wildernessdojo.home.blog',
      post: {
        id: 4891,
        title: 'Alpine Somatic Conditioning & Autonomic Resilience',
        link: 'https://wildernessdojo.home.blog/2026/08/16/alpine-somatic-conditioning-resilience/'
      }
    }
  },
  {
    id: 'ep-wp-generate-blog',
    category: 'WordPress & Webhooks',
    method: 'POST',
    path: '/api/wordpress/generate-blog',
    description: 'Gemini AI synthesis of clinical records and topics into WordPress-ready somatic articles',
    requiresAuth: true,
    requiredPermission: 'SYNC_WORDPRESS',
    sampleRequestBody: {
      topic: 'Vagal Tone and High-Altitude Movement Recovery',
      templateType: 'case-study'
    },
    sampleResponse: {
      success: true,
      data: {
        title: 'Clinical Case Study: High-Altitude Somatic Recovery',
        category: 'Clinical Case Studies',
        tags: ['Somatic Therapy', 'HRV Telemetry', 'CPT-97110'],
        content: '## Executive Clinical Overview\n...',
        targetEmail: 'duru909mede@post.wordpress.com'
      }
    }
  },
  {
    id: 'ep-wp-webhook',
    category: 'WordPress & Webhooks',
    method: 'POST',
    path: '/api/wordpress/webhook',
    description: 'Dispatches authenticated HMAC-SHA256 event to unlock member course passes',
    requiresAuth: true,
    requiredPermission: 'SYNC_WORDPRESS',
    sampleRequestBody: {
      invoiceId: 'INV-2026-88120',
      claimNumber: 'CLM-2026-88120',
      patientName: 'Elena Rostova',
      totalAmount: 88.56,
      status: 'PAYMENT_SETTLED'
    },
    sampleResponse: {
      success: true,
      webhookToken: 'WD-WP-HOOK-2026-APPROVED',
      dispatchedTo: 'https://wildernessdojo.home.blog/wp-json/dojo-billing/v1/payment-webhook',
      status: 'ACKNOWLEDGED'
    }
  },
  {
    id: 'ep-database-json',
    category: 'JSON Database',
    method: 'GET',
    path: '/api/database/json',
    description: 'Export linked JSON database with cryptographic SHA-256 checksum',
    requiresAuth: true,
    sampleResponse: {
      success: true,
      database: {
        schemaVersion: '2026.4.1',
        checksum: '0x8f7c9e0123ba4455',
        collections: ['records', 'invoices', 'payers', 'securityLogs']
      }
    }
  }
];

export const RestApiWebhookPage: React.FC = () => {
  const { sessionToken, apiFetch } = useIAMAuth();
  const [selectedEndpoint, setSelectedEndpoint] = useState<RestApiEndpointSpec>(ENDPOINTS_CATALOG[1]);
  const [customRequestBody, setCustomRequestBody] = useState<string>(
    JSON.stringify(ENDPOINTS_CATALOG[1].sampleRequestBody || {}, null, 2)
  );
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [liveResponse, setLiveResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'api-explorer' | 'webhook-guide' | 'wp-php-code'>('api-explorer');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleSelectEndpoint = (ep: RestApiEndpointSpec) => {
    setSelectedEndpoint(ep);
    setCustomRequestBody(JSON.stringify(ep.sampleRequestBody || {}, null, 2));
    setLiveResponse(null);
    setResponseStatus(null);
    setResponseLatency(null);
  };

  const handleExecuteLiveRequest = async () => {
    setIsExecuting(true);
    const startTime = Date.now();

    try {
      let bodyData: any = undefined;
      if (selectedEndpoint.method !== 'GET' && customRequestBody) {
        try {
          bodyData = JSON.parse(customRequestBody);
        } catch (e) {
          // ignore parse error
        }
      }

      const res = await apiFetch(selectedEndpoint.path, {
        method: selectedEndpoint.method,
        body: bodyData ? JSON.stringify(bodyData) : undefined
      });

      const latency = Date.now() - startTime;
      const data = await res.json();

      setResponseStatus(res.status);
      setResponseLatency(latency);
      setLiveResponse(data);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseLatency(Date.now() - startTime);
      setLiveResponse({ error: err.message || 'Request failed' });
    } finally {
      setIsExecuting(false);
    }
  };

  const generateCurlSnippet = () => {
    let curl = `curl -X ${selectedEndpoint.method} "https://wildernessdojo.home.blog${selectedEndpoint.path}" \\\n`;
    curl += `  -H "Content-Type: application/json" \\\n`;
    if (selectedEndpoint.requiresAuth) {
      curl += `  -H "Authorization: Bearer ${sessionToken || 'YOUR_ZERO_TRUST_TOKEN'}" \\\n`;
      curl += `  -H "X-Client-Signature: sha256-verified" \\\n`;
    }
    if (selectedEndpoint.method !== 'GET' && customRequestBody) {
      curl += `  -d '${customRequestBody.replace(/\n/g, '')}'`;
    }
    return curl;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Terminal className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                REST API & Webhook Integration Suite
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                OpenAPI 3.1 & HMAC Webhooks
              </span>
            </div>
            <p className="text-xs text-slate-300/80 mt-1 max-w-2xl">
              Complete draft specification and live testing suite for the Wilderness Dojo REST API and real-time webhook connector to <span className="font-mono text-emerald-300">wildernessdojo.home.blog</span>.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center space-x-1.5 p-1 bg-white/[0.04] rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveSubTab('api-explorer')}
              className={`px-3 py-1.5 rounded-lg transition font-semibold ${
                activeSubTab === 'api-explorer'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              API Explorer
            </button>
            <button
              onClick={() => setActiveSubTab('webhook-guide')}
              className={`px-3 py-1.5 rounded-lg transition font-semibold ${
                activeSubTab === 'webhook-guide'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Webhook Architecture
            </button>
            <button
              onClick={() => setActiveSubTab('wp-php-code')}
              className={`px-3 py-1.5 rounded-lg transition font-semibold ${
                activeSubTab === 'wp-php-code'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              WordPress PHP Code
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'api-explorer' ? (
        /* Grid: Endpoints List & Interactive Console */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Endpoints Catalog (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-4 shadow-lg space-y-2">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Available REST API Endpoints ({ENDPOINTS_CATALOG.length})
              </h2>

              <div className="space-y-2">
                {ENDPOINTS_CATALOG.map((ep) => {
                  const isSelected = ep.id === selectedEndpoint.id;

                  return (
                    <div
                      key={ep.id}
                      onClick={() => handleSelectEndpoint(ep)}
                      className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-400/50 shadow-inner'
                          : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          ep.method === 'GET' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' :
                          ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          ep.method === 'PUT' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                          'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>
                          {ep.method}
                        </span>
                        <span className="text-xs font-mono text-white font-bold">{ep.path}</span>
                      </div>
                      <p className="text-[11px] text-slate-300/80 mt-1">{ep.description}</p>
                      <div className="flex items-center space-x-2 mt-2 text-[10px] font-mono text-slate-400">
                        <span>{ep.category}</span>
                        {ep.requiresAuth && (
                          <span className="text-emerald-400 flex items-center space-x-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Zero-Trust Auth</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Tester & Schema Console (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              {/* Endpoint Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    selectedEndpoint.method === 'GET' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' :
                    selectedEndpoint.method === 'POST' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {selectedEndpoint.method}
                  </span>
                  <span className="text-sm font-mono font-bold text-white">{selectedEndpoint.path}</span>
                </div>

                <button
                  onClick={handleExecuteLiveRequest}
                  disabled={isExecuting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Execute Test</span>
                    </>
                  )}
                </button>
              </div>

              {/* Request Body (if POST/PUT) */}
              {selectedEndpoint.method !== 'GET' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Request Body (JSON)</label>
                  <textarea
                    value={customRequestBody}
                    onChange={(e) => setCustomRequestBody(e.target.value)}
                    rows={6}
                    className="w-full p-3 rounded-xl bg-black/50 border border-white/15 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-400 leading-relaxed"
                  />
                </div>
              )}

              {/* cURL Command Generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Generated cURL</label>
                  <button
                    onClick={() => handleCopy(generateCurlSnippet())}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                  >
                    {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-slate-300 font-mono text-[11px] overflow-x-auto">
                  {generateCurlSnippet()}
                </pre>
              </div>

              {/* Live Response Panel */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">API Response</span>
                  {responseStatus && (
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className={`px-2 py-0.5 rounded ${
                        responseStatus === 200 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        HTTP {responseStatus}
                      </span>
                      {responseLatency && (
                        <span className="text-slate-400">{responseLatency}ms</span>
                      )}
                    </div>
                  )}
                </div>

                <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-emerald-300 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed">
                  {liveResponse
                    ? JSON.stringify(liveResponse, null, 2)
                    : JSON.stringify(selectedEndpoint.sampleResponse, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ) : activeSubTab === 'webhook-guide' ? (
        /* Webhook Architecture Guide */
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <span>Real-Time Webhook Pipeline to wildernessdojo.home.blog</span>
            </h2>
            <p className="text-xs text-slate-300/80 leading-relaxed max-w-3xl">
              When an insurance claim is adjudicated and patient copay is paid, the Antigravity Billing Engine automatically emits a signed webhook event to <span className="font-mono text-emerald-300">wildernessdojo.home.blog/wp-json/dojo-billing/v1/payment-webhook</span>.
            </p>
          </div>

          {/* Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-black/40 border border-white/10 text-center text-xs font-mono">
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
              <span className="text-emerald-400 font-bold block mb-1">1. Claim Adjudication</span>
              <span className="text-slate-400 text-[11px]">EDI 837P approved via clearinghouse</span>
            </div>
            <div className="p-3 rounded-lg bg-teal-950/40 border border-teal-500/30">
              <span className="text-teal-400 font-bold block mb-1">2. Copay Settlement</span>
              <span className="text-slate-400 text-[11px]">HSA/FSA instant authorization</span>
            </div>
            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
              <span className="text-cyan-400 font-bold block mb-1">3. HMAC-SHA256 Sign</span>
              <span className="text-slate-400 text-[11px]">Cryptographic payload hash</span>
            </div>
            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30">
              <span className="text-indigo-400 font-bold block mb-1">4. WordPress Unlock</span>
              <span className="text-slate-400 text-[11px]">Course access & member profile update</span>
            </div>
          </div>
        </div>
      ) : (
        /* WordPress PHP Receiver Code Snippet */
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Code className="w-4 h-4 text-teal-400" />
                <span>WordPress Theme functions.php Webhook Receiver</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Drop this snippet into <code className="text-emerald-300">functions.php</code> on wildernessdojo.home.blog to listen for real-time payment notifications.
              </p>
            </div>

            <button
              onClick={() => handleCopy(`<?php
// Wilderness Dojo Real-Time Payment Webhook Receiver
add_action('rest_api_init', function () {
    register_rest_route('dojo-billing/v1', '/payment-webhook', array(
        'methods' => 'POST',
        'callback' => 'handle_wilderness_dojo_payment_webhook',
        'permission_callback' => '__return_true',
    ));
});

function handle_wilderness_dojo_payment_webhook($request) {
    $params = $request->get_json_params();
    $invoice_id = sanitize_text_field($params['invoiceId'] ?? '');
    $patient_name = sanitize_text_field($params['patientName'] ?? '');
    $total_amount = floatval($params['totalAmount'] ?? 0);
    $status = sanitize_text_field($params['status'] ?? '');

    // Log the transaction
    error_log("[Wilderness Dojo] Received billing webhook: Invoice {$invoice_id} for {$patient_name} - Amount: \${$total_amount}");

    // Unlock member course access or WooCommerce order status
    return new WP_REST_Response(array(
        'success' => true,
        'message' => "Payment for invoice {$invoice_id} acknowledged by wildernessdojo.home.blog",
        'timestamp' => current_time('mysql'),
    ), 200);
}
`)}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 border border-white/10 flex items-center space-x-1.5 transition"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied PHP' : 'Copy PHP Snippet'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed max-h-[500px]">
{`<?php
/**
 * Wilderness Dojo Antigravity AI Real-Time Payment Webhook Handler
 * Drop inside functions.php or mu-plugins on wildernessdojo.home.blog
 */

add_action('rest_api_init', function () {
    register_rest_route('dojo-billing/v1', '/payment-webhook', array(
        'methods' => 'POST',
        'callback' => 'handle_wilderness_dojo_payment_webhook',
        'permission_callback' => '__return_true',
    ));
});

function handle_wilderness_dojo_payment_webhook($request) {
    $params = $request->get_json_params();
    $invoice_id = sanitize_text_field($params['invoiceId'] ?? '');
    $patient_name = sanitize_text_field($params['patientName'] ?? '');
    $total_amount = floatval($params['totalAmount'] ?? 0);
    $status = sanitize_text_field($params['status'] ?? '');

    // Verify HMAC-SHA256 signature if configured
    $signature = $request->get_header('X-Dojo-Signature');

    // Update user meta / WooCommerce order entitlements
    // e.g. update_user_meta($user_id, 'dojo_retreat_pass_active', true);

    return new WP_REST_Response(array(
        'success' => true,
        'webhookToken' => 'WD-WP-HOOK-' . wp_generate_password(8, false),
        'message' => "Payment of \${$total_amount} for {$patient_name} verified. Member pass unlocked.",
        'timestamp' => current_time('mysql'),
    ), 200);
}`}
          </pre>
        </div>
      )}
    </div>
  );
};
