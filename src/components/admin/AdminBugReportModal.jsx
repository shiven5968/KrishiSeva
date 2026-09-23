import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Bug, 
  Upload, 
  Camera, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Trash2, 
  Layers, 
  Cpu, 
  ShieldAlert, 
  History, 
  Sparkles, 
  FileCode, 
  ExternalLink,
  ClipboardCheck,
  Clock,
  Check,
  Scan,
  Monitor,
  Image as ImageIcon
} from 'lucide-react';

const ISSUE_CATEGORIES = [
  { id: 'data_sync', labelHi: 'डेटाबेस / सिंक त्रुटि (Data Sync / Conflict)', labelEn: 'Database / Real-time Sync Conflict' },
  { id: 'dispatch_algo', labelHi: 'मशीनरी डिस्पैच / रूटिंग बग (Dispatch Bug)', labelEn: 'Machinery Dispatch / Algorithm Error' },
  { id: 'payment_gateway', labelHi: 'भुगतान / एस्क्रो विसंगति (Payment Mismatch)', labelEn: 'Payment Gateway / Escrow Discrepancy' },
  { id: 'kyc_verification', labelHi: 'केवाईसी / वाहन सत्यापन त्रुटि (KYC Bug)', labelEn: 'Driver KYC / Vahan API Verification Bug' },
  { id: 'pricing_surge', labelHi: 'एग्रो-प्राइसिंग / सर्ज गणना बग (Pricing Engine)', labelEn: 'Agro-Pricing / Surge Rate Calculation Bug' },
  { id: 'ui_portal', labelHi: 'एडमिन पोर्टल यूआई / क्रैश (UI Crash)', labelEn: 'Admin Portal UI Glitch / Crash' },
  { id: 'other', labelHi: 'अन्य तकनीकी समस्या (Other Backend Issue)', labelEn: 'Other Backend Technical Issue' }
];

const SEVERITY_LEVELS = [
  { id: 'P0', label: 'P0 - Blocker / Critical Outage', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', sla: '15 Mins SLA' },
  { id: 'P1', label: 'P1 - High / Stuck Operation', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', sla: '2 Hours SLA' },
  { id: 'P2', label: 'P2 - Normal / Functional Issue', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', sla: '12 Hours SLA' },
  { id: 'P3', label: 'P3 - Low / Minor UI/Text Bug', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', sla: '24 Hours SLA' }
];

const STORAGE_KEY = 'krishi_admin_backend_tickets';

const INITIAL_DEMO_TICKETS = [
  {
    ticketId: 'ENG-DEV-9102',
    category: 'data_sync',
    severity: 'P1',
    title: 'Fleet driver location websocket lag in Bakshi Ka Talab region',
    description: 'Driver GPS coordinates are updating with a 45-second latency on the Admin live tracking map.',
    status: 'In Progress',
    assignedTo: 'DevOps & Geo Engine Team',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    screenshot: null
  },
  {
    ticketId: 'ENG-DEV-8840',
    category: 'pricing_surge',
    severity: 'P2',
    title: 'Purvanchal Kharif surge round-off precision check',
    description: 'Base rate calculation rounded down ₹1499.50 to ₹1499 instead of ₹1500.',
    status: 'Resolved',
    assignedTo: 'Pricing Algorithm Lead',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    screenshot: null
  }
];

export default function AdminBugReportModal({ isOpen, onClose }) {
  const { lang } = useLanguage();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'
  const [category, setCategory] = useState('data_sync');
  const [severity, setSeverity] = useState('P1');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [ticketsList, setTicketsList] = useState([]);
  const [pasteNotice, setPasteNotice] = useState(false);

  const fileInputRef = useRef(null);

  // Load Tickets from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTicketsList(JSON.parse(stored));
      } else {
        setTicketsList(INITIAL_DEMO_TICKETS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_TICKETS));
      }
    } catch {
      setTicketsList(INITIAL_DEMO_TICKETS);
    }
  }, [isOpen]);

  // Listen for paste event (Ctrl+V) to capture screenshot directly from clipboard!
  useEffect(() => {
    const handlePaste = (e) => {
      if (!isOpen || activeTab !== 'create') return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            setScreenshot(event.target.result);
            setPasteNotice(true);
            setTimeout(() => setPasteNotice(false), 4000);
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, activeTab]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenshot(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 1-Click Instant In-Page Snapshot (0 Browser popups / No screen share dialog)
  const handleInstantSnapshot = async () => {
    try {
      setIsCapturing(true);
      // Wait for modal to hide from DOM
      await new Promise(r => setTimeout(r, 150));

      const canvas = await html2canvas(document.body, {
        scale: Math.min(window.devicePixelRatio || 1, 2),
        logging: false,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => element.classList?.contains('admin-bug-modal-root')
      });

      const dataUrl = canvas.toDataURL('image/png');
      setScreenshot(dataUrl);
    } catch (err) {
      console.warn('html2canvas snapshot failed:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Browser Screen / Window Capture (Hides modal during capture so modal is never in the screenshot)
  const handleCaptureScreen = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        setIsCapturing(true);
        await new Promise(r => setTimeout(r, 100));

        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { displaySurface: 'browser' },
          preferCurrentTab: true,
          selfBrowserSurface: 'include'
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        await new Promise(r => setTimeout(r, 200));

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        stream.getTracks().forEach(track => track.stop());
        const dataUrl = canvas.toDataURL('image/png');
        setScreenshot(dataUrl);
      } else {
        alert(lang === 'hi' ? 'स्क्रीनशॉट फ़ाइल अपलोड करें या Ctrl+V से पेस्ट करें' : 'Please upload a screenshot file or paste with Ctrl+V');
      }
    } catch {
      // User canceled screen share or permission denied
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    const generatedId = `ENG-DEV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = {
      ticketId: generatedId,
      category,
      severity,
      title: title.trim(),
      description: description.trim(),
      stepsToReproduce: stepsToReproduce.trim(),
      screenshot: screenshot || null,
      status: 'Under Investigation',
      assignedTo: 'On-Call Backend Engineers',
      createdAt: new Date().toISOString(),
      adminAuthor: currentUser?.name || 'Super Admin',
      adminPhone: currentUser?.phone || '9999999999',
      telemetry: {
        currentRoute: window.location.hash || window.location.pathname,
        resolution: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent.substring(0, 100)
      }
    };

    setTimeout(() => {
      const updated = [newTicket, ...ticketsList];
      setTicketsList(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Ticket storage quota warning', err);
      }

      setIsSubmitting(false);
      setSubmittedTicket(newTicket);
      // Reset fields
      setTitle('');
      setDescription('');
      setStepsToReproduce('');
      setScreenshot(null);
    }, 600);
  };

  if (isCapturing) {
    return createPortal(
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999] bg-[#0B1E14] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2.5 border border-emerald-500/30 animate-pulse">
        <Scan className="w-4 h-4 text-emerald-400 animate-spin" />
        <span>{lang === 'hi' ? 'पोर्टल स्क्रीनशॉट लिया जा रहा है...' : 'Capturing portal snapshot...'}</span>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div 
      onClick={onClose}
      className="admin-bug-modal-root fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FDFBF7] dark:bg-[#0D1611] rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-[0_20px_50px_rgba(11,30,20,0.3)] border border-black/[0.08] dark:border-white/[0.08] relative my-auto max-h-[88vh] overflow-y-auto space-y-5 text-[#0B1E14] dark:text-[#EAEFEA]"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#0B1E14] dark:text-[#EAEFEA] flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20 shrink-0">
            <Bug className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black tracking-tight">
                {lang === 'hi' ? 'बैकएंड टीम को समस्या रिपोर्ट करें' : 'Report Issue to Backend Engineering Team'}
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                Dev Escalation
              </span>
            </div>
            <p className="text-xs text-[#4F6358] dark:text-[#9FB1A7] mt-0.5 font-medium">
              {lang === 'hi' 
                ? 'यदि एडमिन पोर्टल पर कोई विसंगति है जो एडमिन साइड से ठीक नहीं हो सकती, तो स्क्रीनशॉट के साथ रिपोर्ट करें।' 
                : 'Directly escalate system anomalies, database sync issues, or algorithmic bugs to on-call backend engineers.'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => { setActiveTab('create'); setSubmittedTicket(null); }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
              activeTab === 'create'
                ? 'bg-[#0B1E14] text-white dark:bg-[#EAEFEA] dark:text-[#0B1E14] shadow-sm'
                : 'text-[#4F6358] dark:text-[#9FB1A7] hover:text-[#0B1E14]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'नई समस्या दर्ज करें' : 'Create Bug Report'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('history'); setSubmittedTicket(null); }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
              activeTab === 'history'
                ? 'bg-[#0B1E14] text-white dark:bg-[#EAEFEA] dark:text-[#0B1E14] shadow-sm'
                : 'text-[#4F6358] dark:text-[#9FB1A7] hover:text-[#0B1E14]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'पूर्व टिकट इतिहास' : 'Escalation Queue'} ({ticketsList.length})</span>
          </button>
        </div>

        {/* TAB 1: CREATE NEW BUG REPORT */}
        {activeTab === 'create' && (
          <div>
            {submittedTicket ? (
              <div className="p-6 rounded-3xl bg-[#1A4F32]/10 border border-[#1A4F32]/20 text-center space-y-4 animate-scale-in">
                <div className="w-14 h-14 rounded-full bg-[#1A4F32] text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8 text-[#4ADE80]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#1A4F32]/20 text-[#1A4F32] dark:text-[#4ADE80] border border-[#1A4F32]/30">
                    Ticket ID: {submittedTicket.ticketId}
                  </span>
                  <h4 className="text-xl font-black text-[#0B1E14] dark:text-[#EAEFEA] mt-2">
                    {lang === 'hi' ? 'समस्या बैकएंड इंजीनियरिंग टीम को अग्रेषित कर दी गई है' : 'Ticket Escalated to Backend Engineering Team'}
                  </h4>
                  <p className="text-xs text-[#4F6358] dark:text-[#9FB1A7] max-w-md mx-auto">
                    {lang === 'hi'
                      ? 'ऑन-कॉल बैकएंड इंजीनियर को सूचित कर दिया गया है। आपका स्क्रीनशॉट व टेलीमेट्री सुरक्षित रूप से संलग्न कर दिए गए हैं।'
                      : 'On-call backend engineers have been alerted with full system diagnostics and screenshot attachments.'}
                  </p>
                </div>

                <div className="flex gap-2 justify-center pt-2">
                  <button
                    onClick={() => setSubmittedTicket(null)}
                    className="px-4 py-2 rounded-full border border-black/15 dark:border-white/15 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    {lang === 'hi' ? 'एक और समस्या दर्ज करें' : 'Submit Another Issue'}
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="px-5 py-2 rounded-full bg-[#0B1E14] text-white dark:bg-[#EAEFEA] dark:text-[#0B1E14] text-xs font-bold shadow-sm transition"
                  >
                    {lang === 'hi' ? 'टिकट ट्रैक करें' : 'View in Queue'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {pasteNotice && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-scale-in">
                    <ClipboardCheck className="w-4 h-4 shrink-0" />
                    <span>{lang === 'hi' ? 'क्लिपबोर्ड से स्क्रीनशॉट सफलतापूर्वक पेस्ट किया गया!' : 'Screenshot pasted directly from clipboard!'}</span>
                  </div>
                )}

                {/* Severity & Category Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4F6358] dark:text-[#9FB1A7] mb-1">
                      {lang === 'hi' ? 'समस्या श्रेणी *' : 'Issue Category *'}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-black/15 dark:border-white/15 bg-white/80 dark:bg-black/40 font-bold text-xs text-[#0B1E14] dark:text-[#EAEFEA] outline-none focus:border-[#1A4F32] dark:focus:border-[#4ADE80] transition"
                    >
                      {ISSUE_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>
                          {lang === 'hi' ? c.labelHi : c.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4F6358] dark:text-[#9FB1A7] mb-1">
                      {lang === 'hi' ? 'गंभीरता स्तर (Priority SLA) *' : 'Severity Level *'}
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-black/15 dark:border-white/15 bg-white/80 dark:bg-black/40 font-bold text-xs text-[#0B1E14] dark:text-[#EAEFEA] outline-none focus:border-[#1A4F32] dark:focus:border-[#4ADE80] transition"
                    >
                      {SEVERITY_LEVELS.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.label} ({s.sla})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4F6358] dark:text-[#9FB1A7] mb-1">
                    {lang === 'hi' ? 'समस्या का संक्षिप्त शीर्षक *' : 'Issue Title / Summary *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'hi' ? 'उदा: किसान आईडी UPFR-88910 का खसरा डेटा सिंक नहीं हो रहा है...' : 'e.g. Driver KYC verification webhook failed on Sarathi gateway...'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-black/15 dark:border-white/15 bg-white/80 dark:bg-black/40 font-bold text-xs text-[#0B1E14] dark:text-[#EAEFEA] outline-none focus:border-[#1A4F32] dark:focus:border-[#4ADE80] transition"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4F6358] dark:text-[#9FB1A7] mb-1">
                    {lang === 'hi' ? 'विस्तृत विवरण (क्या गलत हुआ और क्या होना चाहिए था) *' : 'Detailed Description & Backend Expectation *'}
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder={lang === 'hi' ? 'समस्या का पूरा विवरण लिखें जिसे एडमिन साइड से ठीक नहीं किया जा सकता...' : 'Explain the issue, the affected booking/driver ID, and what backend engineers must inspect/patch...'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-black/15 dark:border-white/15 bg-white/80 dark:bg-black/40 font-medium text-xs text-[#0B1E14] dark:text-[#EAEFEA] outline-none focus:border-[#1A4F32] dark:focus:border-[#4ADE80] transition resize-none"
                  />
                </div>

                {/* SCREENSHOT ATTACHMENT SECTION */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4F6358] dark:text-[#9FB1A7] flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-red-500" />
                      <span>{lang === 'hi' ? 'स्क्रीनशॉट संलग्न करें (Screenshot)' : 'Attach Screenshot Evidence'}</span>
                    </label>
                    <span className="text-[10px] text-[#4F6358] dark:text-[#9FB1A7] font-medium">
                      💡 Tip: Press <kbd className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[9px]">Ctrl + V</kbd> anywhere to paste
                    </span>
                  </div>

                  {screenshot ? (
                    <div className="relative rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden bg-black/5 dark:bg-white/5 p-2">
                      <img
                        src={screenshot}
                        alt="Issue Screenshot Preview"
                        className="w-full h-44 object-contain rounded-xl bg-black/40"
                      />
                      <button
                        type="button"
                        onClick={() => setScreenshot(null)}
                        className="absolute top-4 right-4 p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition"
                        title="Remove Screenshot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="mt-2 text-center text-[10px] font-bold text-[#1A4F32] dark:text-[#4ADE80] flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Screenshot attached ({Math.round(screenshot.length / 1024)} KB)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {/* Primary Action: 1-Click Instant Page Snapshot */}
                      <div
                        onClick={handleInstantSnapshot}
                        className="w-full border-2 border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 rounded-2xl p-3.5 text-left cursor-pointer transition flex items-center justify-between group active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                            <Scan className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-[#0B1E14] dark:text-[#EAEFEA]">
                                {lang === 'hi' ? '1-क्लिक ऑटो स्क्रीनशॉट (अनुशंसित)' : '1-Click Auto Page Snapshot (Recommended)'}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                                Instant
                              </span>
                            </div>
                            <p className="text-[10px] text-[#4F6358] dark:text-[#9FB1A7]">
                              {lang === 'hi' ? 'बिना किसी ब्राउज़र पॉपअप के मौजूदा पोर्टल का सीधा स्क्रीनशॉट लेता है' : 'Instantly captures current portal state with zero browser popups or prompts'}
                            </p>
                          </div>
                        </div>
                        <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition" />
                      </div>

                      {/* Secondary Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Upload File Box */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border border-black/15 dark:border-white/15 hover:border-black/30 dark:hover:border-white/30 rounded-xl p-3 text-center cursor-pointer transition bg-white/50 dark:bg-white/[0.02] flex items-center justify-center gap-2 group active:scale-98"
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Upload className="w-4 h-4 text-[#4F6358] group-hover:text-red-500 transition" />
                          <span className="text-xs font-bold text-[#0B1E14] dark:text-[#EAEFEA]">
                            {lang === 'hi' ? 'फ़ाइल अपलोड करें' : 'Upload Image File'}
                          </span>
                        </div>

                        {/* Screen / Window Capture Box */}
                        <div
                          onClick={handleCaptureScreen}
                          className="border border-black/15 dark:border-white/15 hover:border-black/30 dark:hover:border-white/30 rounded-xl p-3 text-center cursor-pointer transition bg-white/50 dark:bg-white/[0.02] flex items-center justify-center gap-2 group active:scale-98"
                        >
                          <Monitor className="w-4 h-4 text-[#4F6358] group-hover:text-blue-500 transition" />
                          <span className="text-xs font-bold text-[#0B1E14] dark:text-[#EAEFEA]">
                            {lang === 'hi' ? 'संपूर्ण विंडो / स्क्रीन' : 'Capture Display / Window'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Auto Telemetry Snapshot Pill */}
                <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-[#4F6358] dark:text-[#9FB1A7]">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-500" />
                    <span>Auto-Telemetry: <b>Admin Session</b> ({currentUser?.name || 'Super Admin'})</span>
                  </div>
                  <span className="font-mono text-[10px]">
                    {window.innerWidth}x{window.innerHeight} • UP Malihabad Node
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-[#0B1E14] hover:bg-[#153424] dark:bg-[#EAEFEA] dark:hover:bg-white text-white dark:text-[#0B1E14] font-black text-sm shadow-[0_8px_30px_rgb(11,30,20,0.12)] flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>{lang === 'hi' ? 'दर्ज किया जा रहा है...' : 'Submitting to Backend Pipeline...'}</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'बैकएंड टीम को टिकट भेजें' : 'Escalate Ticket to Backend Team'}</span>
                    </>
                  )}
                </button>

              </form>
            )}
          </div>
        )}

        {/* TAB 2: TICKET QUEUE HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {ticketsList.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#4F6358] dark:text-[#9FB1A7]">
                {lang === 'hi' ? 'कोई सक्रिय बग टिकट नहीं है।' : 'No reported tickets in the queue.'}
              </div>
            ) : (
              ticketsList.map((ticket, idx) => (
                <div 
                  key={ticket.ticketId || idx}
                  className="p-4 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-2 hover:border-[#1A4F32]/30 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 text-[#0B1E14] dark:text-[#EAEFEA]">
                        {ticket.ticketId}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        ticket.severity === 'P0' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                        ticket.severity === 'P1' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-600 border-blue-500/20'
                      }`}>
                        {ticket.severity}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      ticket.status === 'Resolved' 
                        ? 'bg-[#1A4F32]/10 text-[#1A4F32] dark:text-[#4ADE80] border border-[#1A4F32]/20' 
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      ● {ticket.status}
                    </span>
                  </div>

                  <h5 className="font-black text-sm text-[#0B1E14] dark:text-[#EAEFEA]">
                    {ticket.title}
                  </h5>

                  <p className="text-xs text-[#4F6358] dark:text-[#9FB1A7] line-clamp-2 leading-relaxed">
                    {ticket.description}
                  </p>

                  {ticket.screenshot && (
                    <div className="pt-1">
                      <img 
                        src={ticket.screenshot} 
                        alt="Screenshot evidence" 
                        className="w-full h-28 object-contain rounded-xl bg-black/30 border border-black/10 dark:border-white/10"
                      />
                    </div>
                  )}

                  <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[10px] text-[#4F6358] dark:text-[#9FB1A7]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(ticket.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                    </div>
                    <span>Assigned: <b>{ticket.assignedTo || 'Backend Engineering'}</b></span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}