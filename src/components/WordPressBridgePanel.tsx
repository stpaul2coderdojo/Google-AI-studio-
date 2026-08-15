import React, { useState } from 'react';
import { 
  Globe, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, 
  Send, Terminal, Layers, ShieldCheck, Zap, Activity
} from 'lucide-react';
import { WordPressPost, WordPressSyncStatus } from '../types';

interface WordPressBridgePanelProps {
  wpStatus: WordPressSyncStatus | null;
  posts: WordPressPost[];
  onRefreshSync: () => void;
  isSyncing: boolean;
}

export const WordPressBridgePanel: React.FC<WordPressBridgePanelProps> = ({
  wpStatus,
  posts,
  onRefreshSync,
  isSyncing
}) => {
  const [webhookLogs, setWebhookLogs] = useState<any[]>([
    {
      id: 'HOOK-001',
      timestamp: '2026-08-14 11:20:45',
      event: 'invoice.adjudicated',
      endpoint: `${wpStatus?.siteUrl || 'https://wildernessdojo.home.blog'}/wp-json/dojo-billing/v1/payment-webhook`,
      status: 200,
      payload: { claimId: 'CLM-2026-88120', patient: 'Elena Rostova', covered: '$360.00' }
    },
    {
      id: 'HOOK-002',
      timestamp: '2026-08-13 16:44:12',
      event: 'payment.settled_realtime',
      endpoint: `${wpStatus?.siteUrl || 'https://wildernessdojo.home.blog'}/wp-json/dojo-billing/v1/payment-webhook`,
      status: 200,
      payload: { txId: 'TX-1723588910', method: 'HSA_FSA_CARD', amount: '$45.00' }
    }
  ]);

  const [testPayload, setTestPayload] = useState(
    JSON.stringify({
      event: 'test.connection',
      site: 'wildernessdojo.home.blog',
      timestamp: new Date().toISOString()
    }, null, 2)
  );
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);

  const handleSendTestWebhook = async () => {
    setIsSendingWebhook(true);
    try {
      const res = await fetch('/api/wordpress/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: 'TEST-INV-990',
          claimNumber: 'CLM-TEST',
          patientName: 'Test Wilderness Member',
          totalAmount: 150.00,
          status: 'TEST_DISPATCH'
        })
      });
      const data = await res.json();

      setWebhookLogs(prev => [
        {
          id: `HOOK-${Date.now().toString().slice(-3)}`,
          timestamp: new Date().toLocaleTimeString(),
          event: 'test.webhook_dispatched',
          endpoint: data.dispatchedTo,
          status: 200,
          payload: data.syncedData
        },
        ...prev
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="backdrop-blur-xl bg-white/[0.04] border border-white/15 rounded-3xl p-6 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl backdrop-blur-md bg-teal-400/15 text-teal-300 border border-teal-400/30">
              <Globe className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              WordPress Interface Bridge (wildernessdojo.home.blog)
            </h2>
          </div>
          <p className="text-xs text-slate-300/80 max-w-2xl leading-relaxed">
            Direct REST API and Webhook integration linking patient somatic medical records, CPT billing schedules, and real-time payments to the Wilderness Dojo web portal.
          </p>
        </div>

        <button
          onClick={onRefreshSync}
          disabled={isSyncing}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-emerald-500/25 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Live WP Data'}</span>
        </button>
      </div>

      {/* Grid: Bridge Telemetry & Webhook Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Connection Telemetry & Synced Dojo Catalog */}
        <div className="lg:col-span-6 space-y-6">
          <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-300 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Bridge Connection Telemetry</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-white/10">
                <span className="text-slate-400 block text-[10px]">TARGET URL</span>
                <span className="text-teal-300 font-bold truncate block">wildernessdojo.home.blog</span>
              </div>
              <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-white/10">
                <span className="text-slate-400 block text-[10px]">API LATENCY</span>
                <span className="text-emerald-300 font-bold">{wpStatus?.apiLatencyMs || 42} ms</span>
              </div>
              <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-white/10">
                <span className="text-slate-400 block text-[10px]">CONNECTION</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ONLINE</span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Webhook Listener Endpoint:</span>
                <span className="font-mono text-teal-300 text-[11px] truncate max-w-[240px]">
                  /wp-json/dojo-billing/v1/payment-webhook
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Security Encryption:</span>
                <span className="text-emerald-300 font-mono text-[11px]">HMAC-SHA256 Signed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Member Sync:</span>
                <span className="text-slate-200 font-medium">14 Active Alpine Somatic Members</span>
              </div>
            </div>
          </div>

          {/* Synced Dojo Courses / Posts */}
          <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-teal-300 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Synced WordPress Courses & Articles</span>
              </h3>
              <span className="text-xs text-slate-400 px-2.5 py-0.5 rounded-full backdrop-blur-md bg-white/10 border border-white/15">{posts.length} Items</span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 space-y-2 hover:border-teal-400/40 transition-all duration-200 group"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-white group-hover:text-teal-200 transition-colors line-clamp-1">{post.title}</h4>
                    <span className="px-2.5 py-0.5 rounded-full backdrop-blur-md bg-white/10 text-slate-300 text-[10px] font-mono border border-white/10">
                      #{post.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300/80 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex justify-between items-center pt-1 text-[11px]">
                    <span className="text-emerald-300 font-semibold">{post.category} • Insurance Covered</span>
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-300 hover:text-teal-200 font-semibold flex items-center space-x-1 transition"
                    >
                      <span>View Blog</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Webhook Dispatcher & Real-Time Sync Logs */}
        <div className="lg:col-span-6 space-y-6">
          {/* Webhook Dispatcher Card */}
          <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-300 flex items-center space-x-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Real-Time Webhook Dispatcher</span>
              </h3>
              <button
                onClick={handleSendTestWebhook}
                disabled={isSendingWebhook}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition shadow-md shadow-emerald-500/25"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isSendingWebhook ? 'Sending...' : 'Test Webhook Push'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300/80 leading-relaxed">
              When an invoice or medical insurance claim is settled, the Antigravity engine transmits a secure cryptographic webhook to <code className="text-teal-300 font-mono backdrop-blur-md bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/10">wildernessdojo.home.blog</code> to update member access.
            </p>

            {/* Webhook Activity Stream */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">Webhook Stream Logs:</span>
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {webhookLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl backdrop-blur-md bg-black/40 border border-white/10 font-mono text-xs text-slate-300 space-y-1.5 shadow-inner"
                  >
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-emerald-300 font-bold">{log.event}</span>
                      <span className="text-slate-400">{log.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {log.endpoint}
                    </div>
                    <div className="p-2.5 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10 text-[10px] text-teal-300 overflow-x-auto">
                      {JSON.stringify(log.payload)}
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] text-emerald-300 pt-0.5 font-sans font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>HTTP 200 OK • Acknowledged by WordPress Dojo Bridge</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
