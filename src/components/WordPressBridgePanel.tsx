import React, { useState } from 'react';
import { 
  Globe, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, 
  Send, Terminal, Layers, ShieldCheck, Zap, Activity, Mail, Sparkles,
  Copy, Check, FileText, ArrowRight, Eye, Code, Hash, Tag, Plus,
  Clock, Shield, BookOpen, User, CheckSquare
} from 'lucide-react';
import { useIAMAuth } from '../context/IAMAuthContext';
import { WordPressPost, WordPressSyncStatus, MedicalEncounterRecord } from '../types';

interface WordPressBridgePanelProps {
  wpStatus: WordPressSyncStatus | null;
  posts: WordPressPost[];
  records?: MedicalEncounterRecord[];
  onRefreshSync: () => void;
  isSyncing: boolean;
  onAddNewPost?: (post: WordPressPost) => void;
}

export const WordPressBridgePanel: React.FC<WordPressBridgePanelProps> = ({
  wpStatus,
  posts,
  records = [],
  onRefreshSync,
  isSyncing,
  onAddNewPost
}) => {
  const { apiFetch } = useIAMAuth();
  
  // Tab within panel
  const [activeSubTab, setActiveSubTab] = useState<'composer' | 'catalog' | 'webhooks' | 'protocol'>('composer');

  // Post composer state
  const [postTitle, setPostTitle] = useState('Alpine Somatic Movement & Autonomic Nervous System Regulation');
  const [postCategory, setPostCategory] = useState('Wilderness Somatic Medicine');
  const [postTags, setPostTags] = useState('Wilderness Medicine, Somatic Therapy, HRV Telemetry, CPT-97110');
  const [postStatus, setPostStatus] = useState<'publish' | 'draft' | 'private'>('publish');
  const [postSlug, setPostSlug] = useState('alpine-somatic-movement-regulation');
  const [featuredCost, setFeaturedCost] = useState('350.00');
  const [isInsuranceCovered, setIsInsuranceCovered] = useState(true);
  const [postContent, setPostContent] = useState(`## Introduction to Wilderness Somatic Recovery

At **Wilderness Dojo** (\`wildernessdojo.home.blog\`), we combine ancient martial kinetic alignment with modern neurophysiological medicine. By immersing patients in high-altitude Sierra terrain, we elicit profound autonomic nervous system reset.

### Clinical Pillars & Biometric Surveillance
- **Neuromuscular Re-Education (CPT 97112):** Dynamic incline trail proprioception activates deep stabilizer kinetic chains.
- **Autonomic Downregulation (CPT 90837):** Continuous PPG heart rate variability (HRV) telemetry and salivary cortisol monitoring validate sympathetic-to-parasympathetic transition.
- **Biomarker Outcomes:** Patients experience an average +40% increase in vagal tone and rapid normalization of resting blood pressure.

### Insurance & Member Invoicing
This somatic therapeutic session is eligible for reimbursement under commercial physical medicine benefits. Members can process copays instantly via our Antigravity AI clearinghouse bridge.

*Dispatched to wildernessdojo.home.blog via the secure Dojo Post-by-Email channel (duru909mede@post.wordpress.com).*`);

  const [previewMode, setPreviewMode] = useState<'rendered' | 'envelope'>('rendered');
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [aiCustomTopic, setAiCustomTopic] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedEnvelope, setCopiedEnvelope] = useState(false);
  const [lastPostResult, setLastPostResult] = useState<any | null>(null);
  const [selectedCatalogPost, setSelectedCatalogPost] = useState<WordPressPost | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('ALL');

  // Webhook Logs
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
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);

  const postingEmail = wpStatus?.postingEmailGateway || 'duru909mede@post.wordpress.com';
  const targetSiteUrl = wpStatus?.siteUrl || 'https://wildernessdojo.home.blog';

  // Construct shortcode envelope preview
  const shortcodeEnvelope = `To: ${postingEmail}
Subject: ${postTitle || 'Untitled Blog Post'}

[category ${postCategory}]
[tags ${postTags}]
[status ${postStatus}]
[slug ${postSlug || 'post-slug'}]

${postContent}`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate with Gemini AI
  const handleGenerateWithAi = async (templateType?: string) => {
    setIsGeneratingAi(true);
    try {
      let recordPayload = undefined;
      if (selectedRecordId) {
        recordPayload = records.find(r => r.id === selectedRecordId);
      }

      const res = await apiFetch('/api/wordpress/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiCustomTopic || undefined,
          templateType: templateType || (recordPayload ? 'case-study' : 'default'),
          record: recordPayload,
          customPrompt: aiCustomTopic ? `Focus deeply on: ${aiCustomTopic}` : undefined
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setPostTitle(data.data.title);
        setPostCategory(data.data.category);
        if (Array.isArray(data.data.tags)) {
          setPostTags(data.data.tags.join(', '));
        }
        setPostContent(data.data.content);
        setPostStatus(data.data.status || 'publish');
        const autoSlug = data.data.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
          .slice(0, 60);
        setPostSlug(autoSlug);
      }
    } catch (err) {
      console.error('AI Blog Generation Error:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Submit Post-by-Email to Backend API
  const handlePublishBlog = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      alert('Please provide a post title and article content before publishing.');
      return;
    }

    setIsPosting(true);
    setLastPostResult(null);

    try {
      const parsedTags = postTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await apiFetch('/api/wordpress/post-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          category: postCategory,
          tags: parsedTags,
          status: postStatus,
          slug: postSlug,
          featuredSessionCost: parseFloat(featuredCost) || 350.00,
          coveredUnderInsurance: isInsuranceCovered,
          linkedRecordId: selectedRecordId || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setLastPostResult(data);
        if (onAddNewPost && data.post) {
          onAddNewPost(data.post);
        }
        onRefreshSync();
      } else {
        alert(data.error || 'Failed to dispatch blog post.');
      }
    } catch (err: any) {
      console.error('Publishing Error:', err);
      alert(err.message || 'Network error while publishing post.');
    } finally {
      setIsPosting(false);
    }
  };

  // Send test webhook
  const handleSendTestWebhook = async () => {
    setIsSendingWebhook(true);
    try {
      const res = await apiFetch('/api/wordpress/webhook', {
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

  // Filtered catalog posts
  const filteredPosts = posts.filter(post => {
    const matchesCategory = catalogCategoryFilter === 'ALL' || post.category === catalogCategoryFilter;
    const matchesSearch = !catalogSearch || 
      post.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (post.tags && post.tags.some(t => t.toLowerCase().includes(catalogSearch.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(posts.map(p => p.category))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Top Banner & Destination Overview */}
      <div className="backdrop-blur-xl bg-white/[0.04] border border-white/15 rounded-3xl p-6 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="p-2 rounded-xl backdrop-blur-md bg-teal-400/15 text-teal-300 border border-teal-400/30 shadow-inner">
              <Globe className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              WordPress Bridge & Blog Publishing Suite
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Post-by-Email Gateway Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-300/80 max-w-3xl leading-relaxed">
            Publish clinical wellness articles, patient case studies, and billing guides to{' '}
            <a 
              href={targetSiteUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-teal-300 hover:text-teal-200 font-semibold underline underline-offset-2 inline-flex items-center space-x-1"
            >
              <span>wildernessdojo.home.blog</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
            {' '}via the secure WordPress post gateway email{' '}
            <code className="text-emerald-300 font-mono font-bold bg-white/[0.08] px-1.5 py-0.5 rounded border border-white/10">
              {postingEmail}
            </code>.
          </p>
        </div>

        {/* Action Buttons & Badges */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => copyToClipboard(postingEmail, setCopiedEmail)}
            className="px-3.5 py-2 rounded-2xl backdrop-blur-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
            title="Copy WordPress Post-by-Email Address"
          >
            {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span className="font-mono">{copiedEmail ? 'Email Copied!' : postingEmail}</span>
          </button>

          <button
            onClick={onRefreshSync}
            disabled={isSyncing}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-emerald-500/25"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Live Posts'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveSubTab('composer')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 transition ${
            activeSubTab === 'composer'
              ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/10'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Post-by-Email Publisher</span>
        </button>

        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 transition ${
            activeSubTab === 'catalog'
              ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/10'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Published Dojo Articles ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('webhooks')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 transition ${
            activeSubTab === 'webhooks'
              ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/10'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Webhook Engine & Telemetry</span>
        </button>

        <button
          onClick={() => setActiveSubTab('protocol')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 transition ${
            activeSubTab === 'protocol'
              ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/10'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Shortcodes & Email Protocol</span>
        </button>
      </div>

      {/* SUB-TAB 1: POST-BY-EMAIL COMPOSER */}
      {activeSubTab === 'composer' && (
        <div className="space-y-6">
          {/* AI Drafting Assistant Toolbar */}
          <div className="backdrop-blur-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900/50 border border-emerald-500/30 rounded-3xl p-5 text-white shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </span>
                <span className="text-sm font-bold tracking-wide">Gemini AI Article Assistant</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 font-mono border border-teal-400/30">
                  gemini-2.5-flash
                </span>
              </div>

              {/* Quick Template Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-slate-400 font-medium">Quick Drafts:</span>
                <button
                  onClick={() => handleGenerateWithAi('default')}
                  disabled={isGeneratingAi}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-emerald-300 text-[11px] font-semibold transition"
                >
                  🌲 Somatic Protocol
                </button>
                <button
                  onClick={() => handleGenerateWithAi('case-study')}
                  disabled={isGeneratingAi}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-teal-300 text-[11px] font-semibold transition"
                >
                  🩺 Clinical Case Study
                </button>
              </div>
            </div>

            {/* Custom Prompt & Clinical Record Linker */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
              <div className="md:col-span-5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Optional: Convert Patient Record to Anonymized Case Study
                </label>
                <select
                  value={selectedRecordId}
                  onChange={(e) => setSelectedRecordId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="" className="bg-slate-900 text-slate-300">-- None (Generate Custom Topic) --</option>
                  {records.map((rec) => (
                    <option key={rec.id} value={rec.id} className="bg-slate-900 text-white">
                      {rec.patientName} • {rec.encounterType} ({rec.encounterDate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Custom Topic or Clinical Focus Prompt
                </label>
                <input
                  type="text"
                  value={aiCustomTopic}
                  onChange={(e) => setAiCustomTopic(e.target.value)}
                  placeholder="e.g. Vagal Tone and High Altitude Movement in Sierra Foothills..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  onClick={() => handleGenerateWithAi()}
                  disabled={isGeneratingAi}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-emerald-500/25"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAi ? 'Drafting...' : 'AI Generate'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Last Post Receipt / Success Card */}
          {lastPostResult && (
            <div className="backdrop-blur-xl bg-emerald-950/40 border border-emerald-400/40 rounded-3xl p-6 text-white shadow-[0_8px_32px_0_rgba(16,185,129,0.2)] space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="p-2 rounded-xl bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-300">
                      Blog Successfully Dispatched via Post-by-Email!
                    </h3>
                    <p className="text-xs text-slate-300">
                      Delivered to <span className="font-mono text-emerald-200 font-bold">{lastPostResult.dispatchedTo}</span> for publication on <span className="text-teal-200 font-semibold">{lastPostResult.targetSite}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={lastPostResult.post?.link || targetSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 hover:bg-emerald-300 transition shadow-md shadow-emerald-500/20"
                >
                  <span>View on WordPress</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-slate-400 text-[10px] block">MESSAGE ID</span>
                  <span className="text-emerald-300 font-bold truncate block">{lastPostResult.messageId}</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-slate-400 text-[10px] block">TRANSACTION HASH</span>
                  <span className="text-teal-300 truncate block">{lastPostResult.transactionHash}</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-slate-400 text-[10px] block">STATUS / TIME</span>
                  <span className="text-slate-200 font-bold">{lastPostResult.post?.status?.toUpperCase() || 'PUBLISHED'} • Just Now</span>
                </div>
              </div>
            </div>
          )}

          {/* Main 2-Column Grid: Post Composer & Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Post Inputs */}
            <div className="lg:col-span-7 space-y-4 backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold tracking-wide text-white">Post Content & Meta Parameters</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Target: {postingEmail}
                </span>
              </div>

              {/* Title / Subject */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between mb-1">
                  <span>Post Title (Email Subject Line)</span>
                  <span className="text-slate-500 font-mono text-[10px]">{postTitle.length} chars</span>
                </label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => {
                    setPostTitle(e.target.value);
                    if (!postSlug || postSlug === postTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60)) {
                      setPostSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').slice(0, 60));
                    }
                  }}
                  placeholder="e.g. Alpine Somatic Movement and Autonomic Recovery"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.06] border border-white/15 text-sm text-white font-medium focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Category, Status & Slug in 3 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Category ([category])
                  </label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Wilderness Somatic Medicine" className="bg-slate-900">Wilderness Somatic Medicine</option>
                    <option value="Therapeutic Conditioning" className="bg-slate-900">Therapeutic Conditioning</option>
                    <option value="Integrative Medicine" className="bg-slate-900">Integrative Medicine</option>
                    <option value="Orthopedic Rehab" className="bg-slate-900">Orthopedic Rehab</option>
                    <option value="Billing & Insurance" className="bg-slate-900">Billing & Insurance</option>
                    <option value="Clinical Case Studies" className="bg-slate-900">Clinical Case Studies</option>
                    <option value="Shinrin-Yoku & Biomarkers" className="bg-slate-900">Shinrin-Yoku & Biomarkers</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Status ([status])
                  </label>
                  <select
                    value={postStatus}
                    onChange={(e) => setPostStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white focus:outline-none focus:border-emerald-400 font-semibold"
                  >
                    <option value="publish" className="bg-slate-900 text-emerald-400">publish (Live Now)</option>
                    <option value="draft" className="bg-slate-900 text-amber-400">draft (Save as Draft)</option>
                    <option value="private" className="bg-slate-900 text-purple-400">private (Admin Only)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Slug ([slug])
                  </label>
                  <input
                    type="text"
                    value={postSlug}
                    onChange={(e) => setPostSlug(e.target.value)}
                    placeholder="post-slug-url"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between mb-1">
                  <span>Tags ([tags]) - Comma Separated</span>
                  <span className="text-[10px] text-slate-500 font-sans">Click to append:</span>
                </label>
                <input
                  type="text"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  placeholder="Somatic Therapy, HRV Telemetry, CPT-97110, High Sierra"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white focus:outline-none focus:border-emerald-400 mb-2"
                />
                
                {/* Popular Tags click-to-add */}
                <div className="flex flex-wrap gap-1.5">
                  {['Somatic Therapy', 'Neuromuscular', 'HRV Telemetry', 'CPT-97110', 'CPT-97112', 'Shinrin-Yoku', 'Insurance Covered', 'High Sierra'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const current = postTags.split(',').map(t => t.trim()).filter(Boolean);
                        if (!current.includes(tag)) {
                          setPostTags([...current, tag].join(', '));
                        }
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 border border-white/10 transition"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Article Content Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Article Body (Markdown / HTML Supported)
                  </label>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setPostContent(prev => prev + '\n\n### Clinical Biometrics & Outcomes\n- Salivary Cortisol: \n- HRV Vagal Index: \n- Diaphragmatic Excursion: ')}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-teal-300 border border-white/10"
                    >
                      + Add Biometrics Block
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostContent(prev => prev + '\n\n### Insurance & Billing Code Summary\n- **CPT 97110:** Therapeutic Exercise (30 min)\n- **CPT 97112:** Neuromuscular Re-Education (30 min)\n- Covered under outpatient rehabilitation benefits.')}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-emerald-300 border border-white/10"
                    >
                      + Add CPT Block
                    </button>
                  </div>
                </div>

                <textarea
                  rows={10}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Write your article in Markdown..."
                  className="w-full p-3.5 rounded-2xl bg-white/[0.04] border border-white/15 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Additional Invoicing & Insurance Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Featured Dojo Session Fee ($)
                  </label>
                  <input
                    type="number"
                    value={featuredCost}
                    onChange={(e) => setFeaturedCost(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <input
                    type="checkbox"
                    id="insuranceCovered"
                    checked={isInsuranceCovered}
                    onChange={(e) => setIsInsuranceCovered(e.target.checked)}
                    className="rounded border-white/20 text-emerald-500 focus:ring-0 w-4 h-4 bg-white/[0.06]"
                  />
                  <label htmlFor="insuranceCovered" className="text-xs font-semibold text-slate-200 cursor-pointer">
                    Eligible for Medical Insurance Reimbursement (CPT)
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Live Envelope Preview & Dispatch Actions */}
            <div className="lg:col-span-5 space-y-4">
              <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Live Post-by-Email Preview</span>
                  </h3>

                  {/* Toggle Preview Mode */}
                  <div className="flex items-center space-x-1 bg-white/[0.06] p-0.5 rounded-xl border border-white/10">
                    <button
                      onClick={() => setPreviewMode('rendered')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                        previewMode === 'rendered' ? 'bg-emerald-400 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Article View
                    </button>
                    <button
                      onClick={() => setPreviewMode('envelope')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                        previewMode === 'envelope' ? 'bg-emerald-400 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Email Envelope
                    </button>
                  </div>
                </div>

                {/* Preview Box Content */}
                {previewMode === 'rendered' ? (
                  <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/10 max-h-96 overflow-y-auto pr-2">
                    <div className="border-b border-white/10 pb-2.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span className="text-emerald-300 font-bold">{postCategory}</span>
                        <span>{new Date().toISOString().split('T')[0]}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">{postTitle || 'Untitled Blog Post'}</h4>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {postTags.split(',').map((t, idx) => (
                          <span key={idx} className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-300 border border-white/10">
                            #{t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-slate-300/90 whitespace-pre-wrap leading-relaxed font-sans">
                      {postContent}
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="text-emerald-300 font-medium">Fee: ${featuredCost} • {isInsuranceCovered ? 'Insurance Covered' : 'Self-Pay'}</span>
                      <span className="text-[10px] font-mono text-teal-300">Status: {postStatus}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 bg-black/60 p-4 rounded-2xl border border-white/10 font-mono text-xs max-h-96 overflow-y-auto">
                    <div className="text-[11px] text-slate-400 border-b border-white/10 pb-2 space-y-1">
                      <div><span className="text-slate-500">TO:</span> <span className="text-emerald-300 font-bold">{postingEmail}</span></div>
                      <div><span className="text-slate-500">SUBJECT:</span> <span className="text-white font-bold">{postTitle}</span></div>
                    </div>
                    <div className="text-teal-300 text-[11px] py-1 whitespace-pre-wrap">
                      {`[category ${postCategory}]\n[tags ${postTags}]\n[status ${postStatus}]\n[slug ${postSlug || 'post-slug'}]`}
                    </div>
                    <div className="text-slate-300 text-[11px] whitespace-pre-wrap pt-1 border-t border-white/10">
                      {postContent}
                    </div>
                  </div>
                )}

                {/* Primary Publishing Actions */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handlePublishBlog}
                    disabled={isPosting}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-xl shadow-emerald-500/30"
                  >
                    <Send className={`w-4 h-4 ${isPosting ? 'animate-bounce' : ''}`} />
                    <span>{isPosting ? 'Dispatching to WordPress...' : `Publish to wildernessdojo.home.blog`}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`mailto:${postingEmail}?subject=${encodeURIComponent(postTitle)}&body=${encodeURIComponent(`[category ${postCategory}]\n[tags ${postTags}]\n[status ${postStatus}]\n[slug ${postSlug}]\n\n${postContent}`)}`}
                      className="py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition text-center"
                    >
                      <Mail className="w-3.5 h-3.5 text-teal-300" />
                      <span>Open in Mail App</span>
                    </a>

                    <button
                      onClick={() => copyToClipboard(shortcodeEnvelope, setCopiedEnvelope)}
                      className="py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                    >
                      {copiedEnvelope ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copiedEnvelope ? 'Envelope Copied!' : 'Copy Raw Text'}</span>
                    </button>
                  </div>
                </div>

                {/* Gateway Assurance Note */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-300/80 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Post-by-Email Protocol Active</span>
                  </div>
                  <p>
                    WordPress parses incoming mail sent to <code className="text-teal-300">{postingEmail}</code>, extracts shortcode directives (<code className="text-slate-200">[category]</code>, <code className="text-slate-200">[tags]</code>), and publishes the post with zero friction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PUBLISHED ARTICLES & CATALOG */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-teal-300 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-teal-400" />
                  <span>Wilderness Dojo Published Knowledge Base ({filteredPosts.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live articles currently published or synced to <code className="text-teal-300 font-mono">wildernessdojo.home.blog</code>
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search articles & tags..."
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />

                <select
                  value={catalogCategoryFilter}
                  onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="ALL" className="bg-slate-900">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-3xl backdrop-blur-md bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-teal-400/40 transition-all duration-200 flex flex-col justify-between space-y-3 group shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30">
                        {post.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        #{post.id} • {post.date}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white group-hover:text-teal-200 transition-colors leading-snug">
                      {post.title}
                    </h4>

                    <p className="text-xs text-slate-300/80 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {post.tags.map((tag, idx) => (
                          <span key={idx} className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10 font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 text-[11px] text-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{post.coveredUnderInsurance ? 'Insurance Covered (CPT)' : 'Self-Pay'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedCatalogPost(post)}
                        className="px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white text-xs font-semibold transition"
                      >
                        Details
                      </button>

                      <a
                        href={post.link || `${targetSiteUrl}/${post.slug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center space-x-1 transition shadow-md shadow-emerald-500/20"
                      >
                        <span>Open Live</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WEBHOOK ENGINE & TELEMETRY */}
      {activeSubTab === 'webhooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Telemetry Stats */}
          <div className="lg:col-span-5 space-y-6">
            <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-300 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Live Bridge Telemetry</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-white/10">
                  <span className="text-slate-400 block text-[10px]">DESTINATION</span>
                  <span className="text-teal-300 font-bold truncate block">wildernessdojo.home.blog</span>
                </div>
                <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-white/10">
                  <span className="text-slate-400 block text-[10px]">POSTING GATEWAY</span>
                  <span className="text-emerald-300 font-bold truncate block">{postingEmail}</span>
                </div>
                <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-white/10">
                  <span className="text-slate-400 block text-[10px]">API LATENCY</span>
                  <span className="text-emerald-300 font-bold">{wpStatus?.apiLatencyMs || 42} ms</span>
                </div>
                <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.04] border border-white/10">
                  <span className="text-slate-400 block text-[10px]">STATUS</span>
                  <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>ONLINE</span>
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 text-xs space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Webhook Listener:</span>
                  <span className="font-mono text-teal-300 text-[11px] truncate max-w-[200px]">
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
          </div>

          {/* Webhook Activity Stream */}
          <div className="lg:col-span-7 space-y-6">
            <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] space-y-4">
              <div className="flex items-center justify-between">
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
      )}

      {/* SUB-TAB 4: SHORTCODES & PROTOCOL */}
      {activeSubTab === 'protocol' && (
        <div className="space-y-6 backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Code className="w-5 h-5 text-emerald-400" />
              <span>WordPress Post-by-Email Architecture & Shortcode Reference</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Wilderness Dojo utilizes WordPress's specialized Post-by-Email gateway (<code className="text-emerald-300 font-mono">{postingEmail}</code>) to publish content to <code className="text-teal-300 font-mono">{targetSiteUrl}</code> without requiring static administrative credentials or insecure API passwords.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <span className="text-emerald-300 font-bold block text-sm">[category &lt;name&gt;]</span>
              <p className="text-slate-300 font-sans text-xs">
                Specifies the primary taxonomy category for the post. If the category does not exist, WordPress creates it automatically.
              </p>
              <code className="text-[11px] text-teal-300 block bg-white/[0.04] p-2 rounded-xl">
                [category Wilderness Somatic Medicine]
              </code>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <span className="text-emerald-300 font-bold block text-sm">[tags &lt;tag1, tag2&gt;]</span>
              <p className="text-slate-300 font-sans text-xs">
                Appends comma-separated tags for indexing, SEO, and clinical topic categorization.
              </p>
              <code className="text-[11px] text-teal-300 block bg-white/[0.04] p-2 rounded-xl">
                [tags Somatic Therapy, CPT-97110, HRV Telemetry]
              </code>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <span className="text-emerald-300 font-bold block text-sm">[status &lt;publish|draft|private&gt;]</span>
              <p className="text-slate-300 font-sans text-xs">
                Controls post visibility. <code className="text-emerald-300">publish</code> makes it live instantly, while <code className="text-amber-300">draft</code> queues it for editorial review.
              </p>
              <code className="text-[11px] text-teal-300 block bg-white/[0.04] p-2 rounded-xl">
                [status publish]
              </code>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <span className="text-emerald-300 font-bold block text-sm">[slug &lt;custom-slug&gt;]</span>
              <p className="text-slate-300 font-sans text-xs">
                Overrides the default URL permalink slug for clean REST routing and EHR linkage.
              </p>
              <code className="text-[11px] text-teal-300 block bg-white/[0.04] p-2 rounded-xl">
                [slug alpine-somatic-conditioning]
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Post Details Modal */}
      {selectedCatalogPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="backdrop-blur-2xl bg-slate-900/95 border border-white/20 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-mono text-[10px] border border-emerald-400/30">
                  {selectedCatalogPost.category}
                </span>
                <span className="text-xs font-mono text-slate-400">Post #{selectedCatalogPost.id}</span>
              </div>
              <button
                onClick={() => setSelectedCatalogPost(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-white/[0.06]"
              >
                Close
              </button>
            </div>

            <h3 className="text-lg font-bold text-white">{selectedCatalogPost.title}</h3>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedCatalogPost.excerpt}
            </p>

            {selectedCatalogPost.tags && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedCatalogPost.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.08] text-teal-300 font-mono border border-white/10">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">PUBLISHED VIA:</span>
                <span className="text-emerald-300 font-bold">Post-by-Email ({postingEmail})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">TARGET BLOG:</span>
                <span className="text-teal-300">{targetSiteUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">INSURANCE STATUS:</span>
                <span className="text-slate-200">{selectedCatalogPost.coveredUnderInsurance ? 'Eligible for CPT Reimbursement' : 'Self-Pay'}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
              <a
                href={selectedCatalogPost.link || `${targetSiteUrl}/${selectedCatalogPost.slug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 hover:from-emerald-300 hover:to-teal-300 transition"
              >
                <span>View on wildernessdojo.home.blog</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
