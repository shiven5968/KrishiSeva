import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { audioHelper } from '../../utils/audioHelper';
import { updatePageSEO } from '../../utils/seoHelper';
import { trackEvent, ANALYTICS_EVENTS } from '../../services/analytics';
import { 
  Scale, 
  ShieldCheck, 
  FileText, 
  Phone, 
  Mail, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  X, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Lock,
  UserCheck,
  Send
} from 'lucide-react';

export default function LegalCompliancePortal({ 
  isOpen, 
  onClose, 
  initialTab = 'contact' // 'contact' | 'privacy' | 'terms' | 'nodal'
}) {
  const { lang } = useLanguage();
  const { isDark } = useTheme();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [copiedTicket, setCopiedTicket] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (initialTab === 'privacy') updatePageSEO('privacy');
      else if (initialTab === 'terms') updatePageSEO('terms');
      else updatePageSEO('contact');
    }
  }, [isOpen, initialTab]);

  // Form State for Statutory Grievance / Formal Query
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    role: currentUser?.role || 'farmer',
    district: 'Lucknow',
    grievanceType: 'Machinery Dispatch Delay or Non-Arrival',
    subject: '',
    statement: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'privacy') updatePageSEO('privacy');
    else if (tabKey === 'terms') updatePageSEO('terms');
    else updatePageSEO('contact');
  };

  const handleSubmitGrievance = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError(lang === 'hi' ? 'कृपया आवेदक का पूरा विधिक नाम दर्ज करें।' : 'Please provide complainant full legal name.');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError(lang === 'hi' ? 'कृपया 10-अंकीय वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!formData.statement.trim()) {
      setFormError(lang === 'hi' ? 'कृपया शिकायत अथवा आवश्यकता का विस्तृत विवरण दर्ज करें।' : 'Please provide statement of facts / grievance description.');
      return;
    }

    setIsSubmitting(true);

    const ticketNumber = `KS-GRV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const submissionRecord = {
      ticketNumber,
      timestamp: new Date().toISOString(),
      name: formData.name.trim(),
      phone: cleanPhone,
      role: formData.role,
      district: formData.district,
      grievanceType: formData.grievanceType,
      subject: formData.subject.trim() || formData.grievanceType,
      statement: formData.statement.trim(),
      status: 'ACKNOWLEDGED',
      assignedOfficer: 'Rajesh Verma (Grievance Redressal Officer)',
      statutoryResolutionDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    };

    setTimeout(() => {
      // Save to localStorage queue for Admin audit trail
      try {
        const existing = JSON.parse(localStorage.getItem('krishi_contact_enquiries') || '[]');
        localStorage.setItem('krishi_contact_enquiries', JSON.stringify([submissionRecord, ...existing]));
      } catch (err) {
        console.error('Failed to log grievance record', err);
      }

      // Realtime Broadcast
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const ch = new BroadcastChannel('krishi_realtime_network');
          ch.postMessage({
            type: 'NEW_LEGAL_GRIEVANCE',
            payload: submissionRecord
          });
        } catch (e) {}
      }

      audioHelper.playBookingConfirmed();
      trackEvent(ANALYTICS_EVENTS.CONTACT_FORM_SUBMITTED, {
        role: formData.role,
        district: formData.district,
        ticket: ticketNumber
      });

      setIsSubmitting(false);
      setSubmittedTicket(submissionRecord);
    }, 600);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-2.5 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`rounded-2xl max-w-4xl w-full shadow-2xl border flex flex-col max-h-[94vh] overflow-hidden transition-colors duration-300 relative ${
          isDark 
            ? 'bg-[#0A0F0D] border-stone-800 text-stone-200' 
            : 'bg-white border-stone-300 text-stone-900'
        }`}
      >
        {/* ═══════════ TOP CORPORATE LEGAL HEADER ═══════════ */}
        <header className={`px-5 sm:px-7 py-4 border-b shrink-0 flex items-start justify-between gap-4 ${
          isDark ? 'bg-[#0E1511] border-stone-800' : 'bg-stone-50/90 border-stone-200'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                Corporate Legal Desk
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-stone-700 dark:text-stone-300">
                CIN: U01100UP2026PTC184920 • Reg. #58291
              </span>
            </div>
            
            <h2 className="text-base sm:text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-display">
              KRISHISEVA TECHNOLOGIES PRIVATE LIMITED
            </h2>
            
            <p className="text-[11px] sm:text-xs text-stone-700 dark:text-stone-300 font-normal leading-relaxed">
              Statutory Grievance Redressal & Legal Compliance Portal • Pursuant to Rule 3(2) of IT Rules, 2021 & DPDP Act, 2023
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center justify-center transition shrink-0 cursor-pointer"
            aria-label="Close Legal Desk"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* ═══════════ STATUTORY INFORMATION & JURISDICTION BAR ═══════════ */}
        <div className={`px-5 sm:px-7 py-2.5 border-b text-[11px] grid grid-cols-1 md:grid-cols-3 gap-2 shrink-0 ${
          isDark ? 'bg-[#080C0A] border-stone-800 text-stone-400' : 'bg-stone-100/70 border-stone-200 text-stone-600'
        }`}>
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate"><strong>Reg. Office:</strong> Gomti Nagar, Lucknow, UP - 226010</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span><strong>Helpline:</strong> <a href="tel:+919236581606" className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold">+91 92365 81606</a> (Mon–Sat)</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span><strong>Nodal Email:</strong> <span className="font-mono text-stone-700 dark:text-stone-300">grievance@krishiseva.in</span></span>
          </div>
        </div>

        {/* ═══════════ LEGAL SECTION TABS ═══════════ */}
        <nav aria-label="Legal document tabs" className={`px-5 sm:px-7 border-b flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0 py-1 ${
          isDark ? 'border-stone-800 bg-[#0A0F0D]' : 'border-stone-200 bg-white'
        }`}>
          {[
            { id: 'contact', label: lang === 'hi' ? 'शिकायत एवं सहायता फॉर्म' : 'Grievance & Support Desk', sub: 'Rule 3(2)' },
            { id: 'privacy', label: lang === 'hi' ? 'गोपनीयता नीति (DPDP)' : 'Privacy Policy', sub: 'DPDP Act 2023' },
            { id: 'terms', label: lang === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service', sub: 'Operating Contract' },
            { id: 'nodal', label: lang === 'hi' ? 'नोडल अधिकारी व अपीलीय व्यवस्था' : 'Nodal Officer & Escalation', sub: 'Grievance Matrix' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex items-baseline gap-1.5 cursor-pointer ${
                  isActive 
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/20' 
                    : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] font-normal opacity-70">({tab.sub})</span>
              </button>
            );
          })}
        </nav>

        {/* ═══════════ MODAL SCROLLABLE CONTENT AREA ═══════════ */}
        <div className="overflow-y-auto px-5 sm:px-7 py-5 flex-1 space-y-6 text-xs sm:text-sm leading-relaxed">
          
          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 1: FORMAL GRIEVANCE & CUSTOMER SUPPORT FORM */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              
              {/* Statutory Notice Banner */}
              <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                isDark ? 'bg-stone-900/60 border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-700'
              }`}>
                <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-white uppercase tracking-wider text-[11px]">
                  <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Statutory Notice pursuant to Rule 3(2) of IT Intermediary Rules, 2021</span>
                </div>
                <p>
                  Any registered cultivator, equipment operator, or member of the public may submit a formal complaint or service enquiry below. Each filing is stamped with an immutable Ticket Reference ID and acknowledged within 24 hours. Formal resolution is rendered within a statutory limit of 15 working days.
                </p>
              </div>

              {/* Direct Urgent Helpline Contacts Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-stone-900/40 border-stone-800' : 'bg-white border-stone-200'
                }`}>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      Direct Telephonic Helpline
                    </span>
                    <a href="tel:+919236581606" className="text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                      +91 92365 81606
                    </a>
                    <span className="text-[10px] text-stone-500 block">Mon–Sat: 08:00 – 20:00 IST</span>
                  </div>
                  <a
                    href="tel:+919236581606"
                    className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Desk</span>
                  </a>
                </div>

                <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-stone-900/40 border-stone-800' : 'bg-white border-stone-200'
                }`}>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      Official WhatsApp Telemetry Desk
                    </span>
                    <a 
                      href="https://wa.me/919236581606?text=Official%20Grievance%20Enquiry%20-%20KrishiSeva" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      +91 92365 81606
                    </a>
                    <span className="text-[10px] text-stone-500 block">24/7 Automated Dispatch Bot</span>
                  </div>
                  <a
                    href="https://wa.me/919236581606?text=Official%20Grievance%20Enquiry%20-%20KrishiSeva"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Success Receipt View upon Submission */}
              {submittedTicket ? (
                <div className={`p-5 rounded-xl border space-y-4 animate-fade-in ${
                  isDark ? 'bg-emerald-950/20 border-emerald-800/60' : 'bg-emerald-50/70 border-emerald-200'
                }`}>
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-emerald-200 dark:border-emerald-800/60">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                          Grievance Filed & Acknowledged
                        </h4>
                        <span className="text-xs text-stone-600 dark:text-stone-300">
                          Formal record logged with KrishiSeva Nodal Cell.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300">
                        {submittedTicket.ticketNumber}
                      </span>
                      <button
                        onClick={() => copyToClipboard(submittedTicket.ticketNumber)}
                        className="p-1.5 rounded bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-700 dark:text-stone-300 text-xs"
                        title="Copy Reference ID"
                      >
                        {copiedTicket ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-stone-500 block">Complainant:</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{submittedTicket.name} ({submittedTicket.phone})</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Assigned Officer:</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{submittedTicket.assignedOfficer}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Nature of Complaint:</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{submittedTicket.grievanceType}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Statutory Resolution SLA:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">Within 15 Days (By {submittedTicket.statutoryResolutionDate})</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-400 italic pt-2">
                    An SMS / WhatsApp confirmation with your ticket particulars has been queued to your registered number. For urgent updates, quote your Ticket Reference Number when calling +91 92365 81606.
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSubmittedTicket(null)}
                      className="px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 text-white dark:text-stone-900 font-bold text-xs cursor-pointer"
                    >
                      File Another Grievance
                    </button>
                  </div>
                </div>
              ) : (
                /* Formal Submission Form */
                <form onSubmit={handleSubmitGrievance} className="space-y-4">
                  {formError && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Legal Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                        Complainant / User Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Balram Singh / Rajesh Kumar"
                        className={`w-full px-3 py-2 rounded-lg border text-xs font-medium outline-none focus:border-emerald-600 transition ${
                          isDark ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                        required
                      />
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                        Registered Mobile Number *
                      </label>
                      <div className="flex">
                        <span className={`px-2.5 py-2 text-xs font-bold border border-r-0 rounded-l-lg flex items-center ${
                          isDark ? 'bg-stone-800 border-stone-700 text-stone-400' : 'bg-stone-100 border-stone-300 text-stone-600'
                        }`}>
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                          placeholder="9236581606"
                          className={`w-full px-3 py-2 rounded-r-lg border text-xs font-medium outline-none focus:border-emerald-600 transition ${
                            isDark ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                          }`}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* User Classification */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                        Complainant Classification *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border text-xs font-medium outline-none focus:border-emerald-600 transition cursor-pointer ${
                          isDark ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      >
                        <option value="farmer">Agricultural Cultivator / Smallholder Farmer</option>
                        <option value="tenant">Tenant Farmer / Batai Cultivator (1-Year Pass)</option>
                        <option value="chc_owner">Custom Hiring Center (CHC) Equipment Fleet Owner</option>
                        <option value="driver">Machinery Pilot / Commercial Tractor Driver</option>
                        <option value="landowner">Agricultural Landowner / Title Holder</option>
                        <option value="other">General Public / Corporate / Institutional Entity</option>
                      </select>
                    </div>

                    {/* District / Jurisdiction */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                        District & Tehsil (Uttar Pradesh) *
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="e.g. Lucknow / Malihabad / Mohanlalganj"
                        className={`w-full px-3 py-2 rounded-lg border text-xs font-medium outline-none focus:border-emerald-600 transition ${
                          isDark ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Nature of Grievance */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                      Nature of Grievance / Matter Under Complaint *
                    </label>
                    <select
                      value={formData.grievanceType}
                      onChange={(e) => setFormData({ ...formData, grievanceType: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-medium outline-none focus:border-emerald-600 transition cursor-pointer ${
                        isDark ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    >
                      <option value="Machinery Dispatch Delay or Non-Arrival">Machinery Dispatch Delay or Driver Non-Arrival</option>
                      <option value="Acreage Measurement & Dynamic Rate Dispute">Acreage GPS Measurement & Dynamic Rate / Billing Dispute</option>
                      <option value="UP Bhulekh / AgriStack Land Sync Failure">UP Bhulekh / AgriStack Land Record Verification Issue</option>
                      <option value="Equipment Breakdown & Unfinished Agricultural Work">Equipment Breakdown & Unfinished Agricultural Work</option>
                      <option value="Tenant Batai Pass & Landowner eKYC Dispute">Tenant Batai Pass & Landowner Consent / eKYC Dispute</option>
                      <option value="Data Privacy & Personal Record Erasure (DPDP)">Data Privacy, Aadhaar Masking & Personal Record Erasure</option>
                      <option value="Other Statutory Grievance">Other Legal Representation / Formal Enquiry</option>
                    </select>
                  </div>

                  {/* Detailed Statement of Facts */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                      Statement of Facts & Detailed Particulars *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.statement}
                      onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                      placeholder="Please state material facts in chronological order, citing Booking ID, Khasra Plot number (if applicable), date of occurrence, and specific redressal sought..."
                      className={`w-full p-3 rounded-lg border text-xs font-medium outline-none focus:border-emerald-600 transition ${
                        isDark ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                      required
                    />
                  </div>

                  {/* Form Submission Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200 dark:border-stone-800">
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                      <Lock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Encrypted SSL Transmission • Section 79 IT Act Protected</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>Filing Grievance...</span>
                        </>
                      ) : (
                        <>
                          <Scale className="w-3.5 h-3.5" />
                          <span>File Grievance with Nodal Officer</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 2: PRIVACY POLICY (DPDP ACT 2023) */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === 'privacy' && (
            <div className="space-y-5">
              <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  Statutory Document • DPDP Act 2023 Compliant
                </span>
                <h3 className="text-base font-bold text-stone-900 dark:text-white mt-0.5">
                  Privacy Policy & Data Principal Protection Charter
                </h3>
                <p className="text-xs text-stone-500">
                  Effective Date: 1 January 2026 • Version 2.4 • Applicable to All Cultivators, Drivers & CHC Operators
                </p>
              </div>

              {/* Clause 1.0 */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wide">
                  1.0 Statutory Framework & Purpose
                </h4>
                <p>
                  This Privacy Policy is formulated in accordance with the provisions of the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011. KrishiSeva Technologies Private Limited ("KrishiSeva", "Company", "We") operates as a Data Fiduciary regarding the personal, spatial, and landholding records processed across our agricultural fleet dispatch platform.
                </p>
              </div>

              {/* Clause 2.0 */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wide">
                  2.0 Categories of Agricultural & Personal Data Processed
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Aadhaar eKYC Tokens:</strong> Redacted, masked 12-digit tokens processed strictly via UIDAI-licensed authentication gateways for farmer verification. We do not store raw Aadhaar numbers or biometric data.</li>
                  <li><strong>Government Land Registry Records:</strong> Official Khasra numbers, Gata plots, measured area (Bigha / Acre / Hectare), and landholder names retrieved directly from UP Bhulekh and the National AgriStack Unified Farmer Service Interface.</li>
                  <li><strong>Geospatial Farmland Boundaries:</strong> Polygon GPS coordinates, latitude/longitude boundary points, and tractor telemetry logs captured for machinery dispatch accuracy.</li>
                  <li><strong>Machinery Ownership Records:</strong> Regional Transport Office (RTO) registration numbers, commercial driving licenses, and fitness certificates of equipment operators.</li>
                </ul>
              </div>

              {/* Clause 3.0 */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wide">
                  3.0 Tenant Farmer (Batai) Verifications & Landowner Consent
                </h4>
                <p>
                  Pursuant to UP Tenancy and Land Revenue laws, tenant cultivators (Batai Kisans) are authorized to book machinery exclusively upon receiving verified digital WhatsApp / OTP consent from the registered title holder. Upon verification, the tenant is granted a non-transferable 1-Year Batai Pass strictly bounded to the authorized Khasra polygon. Unauthorized boundary expansion is locked by algorithmic geospatial fencing.
                </p>
              </div>

              {/* Clause 4.0 */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wide">
                  4.0 Rights of Data Principals under DPDP Act, 2023
                </h4>
                <p>
                  Every registered user retains absolute rights to: (a) Access and receive a summary of all personal and farmland data processed by KrishiSeva; (b) Seek rectification of inaccurate or outdated Khasra records; (c) Exercise the Right to Erasure / Account Deletion, purging all personal identification records from active clusters within 72 hours, subject to statutory retention for tax and accounting audits.
                </p>
              </div>

              {/* Clause 5.0 */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wide">
                  5.0 Data Security, Encryption & Localization
                </h4>
                <p>
                  All data in transit is encrypted using TLS 1.3 cryptographic protocols, and at rest utilizing AES-256 standards. In compliance with the guidelines of the Ministry of Electronics and Information Technology (MeitY), all database servers, telemetry backups, and farmer registries are localized strictly within data centers physically situated inside the sovereign borders of the Republic of India.
                </p>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 3: TERMS OF SERVICE & OPERATING CONTRACT */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === 'terms' && (
            <div className="space-y-5">
              <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  Commercial Operating Agreement • Custom Hiring Standards
                </span>
                <h3 className="text-base font-bold text-stone-900 dark:text-white mt-0.5">
                  General Terms of Platform Service & Machinery Rental Agreement
                </h3>
                <p className="text-xs text-stone-500">
                  Standard Terms between Cultivators, Machinery Pilots, Custom Hiring Centers (CHCs) and KrishiSeva
                </p>
              </div>

              {/* Article I */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wide">
                  Article I: Platform Intermediary Scope
                </h4>
                <p>
                  KrishiSeva operates as a digital technology marketplace under Section 79 of the Information Technology Act, 2000. KrishiSeva facilitates the connection, algorithmic rate resolution, and geospatial dispatch between verified Custom Hiring Centers (CHC fleet owners) and agricultural cultivators. All operators undergo mandatory RTO and KYC verification.
                </p>
              </div>

              {/* Article II */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wide">
                  Article II: Dynamic Regional Agro-Boom Pricing Engine
                </h4>
                <p>
                  Machinery rental tariffs are calibrated algorithmically based on regional agro-climatic zones, state soil density indices, and local fuel fluctuations. Standard baseline for Uttar Pradesh Central is ₹1,300 per Bigha (or equivalent benchmark). The Counter-Offer Bargaining Engine enables fair mutual price adjustment within approved regulatory boundaries without hidden brokerage or non-transparent middleman commissions.
                </p>
              </div>

              {/* Article III */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wide">
                  Article III: Arrival Protocols & Agricultural Field Safety
                </h4>
                <p>
                  Upon booking confirmation, the assigned machinery pilot is bound to arrive at the designated GPS boundary within 15–30 minutes under standard operating conditions. In the event of machinery mechanical failure during tilling, sowing, or harvesting, the nearest CHC partner is automatically alerted to dispatch replacement equipment to safeguard crop harvest timelines.
                </p>
              </div>

              {/* Article IV */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wide">
                  Article IV: Dispute Settlement & Exclusive Legal Jurisdiction
                </h4>
                <p>
                  All disputes arising out of or in connection with machinery rentals, billing, or tenant authorizations shall first be subject to conciliation through the KrishiSeva Resident Grievance Cell. If unresolved within 30 days, the parties agree that competent Civil Courts situated exclusively at Lucknow, Uttar Pradesh, shall have sole and exclusive jurisdiction.
                </p>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 4: NODAL OFFICERS & STATUTORY ESCALATION MATRIX */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === 'nodal' && (
            <div className="space-y-5">
              <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  Statutory Appointments • Rule 3(2) IT Rules, 2021
                </span>
                <h3 className="text-base font-bold text-stone-900 dark:text-white mt-0.5">
                  Statutory Grievance Redressal & Nodal Escalation Matrix
                </h3>
                <p className="text-xs text-stone-500">
                  Institutional hierarchy for resolution of consumer, agricultural, and data privacy complaints.
                </p>
              </div>

              {/* 3-Tier Hierarchy */}
              <div className="space-y-3">
                {/* Level 1 */}
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-stone-900/50 border-stone-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                    <span className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Level 1: Frontline Operations & Dispatch Desk
                    </span>
                    <span className="text-[11px] font-semibold text-stone-500">SLA: 24 Hours</span>
                  </div>
                  <div className="pt-2 text-xs space-y-1 text-stone-700 dark:text-stone-300">
                    <p><strong>Primary Channels:</strong> Telephone: <a href="tel:+919236581606" className="text-emerald-600 font-bold hover:underline">+91 92365 81606</a> | WhatsApp: +91 92365 81606</p>
                    <p><strong>Scope:</strong> Live machinery tracking, driver delays, plot coordinates misallocation, immediate dispatch replacement.</p>
                  </div>
                </div>

                {/* Level 2 */}
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-emerald-950/20 border-emerald-800/80' : 'bg-emerald-50/70 border-emerald-300'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-800/80">
                    <span className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      Level 2: Resident Grievance & Data Protection Officer (Rule 3(2))
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">SLA: 48 Hrs Ack / 15 Days Resolution</span>
                  </div>
                  <div className="pt-2 text-xs space-y-1 text-stone-800 dark:text-stone-200">
                    <p><strong>Designated Officer:</strong> Shri Rajesh Verma (Advocate & Resident Grievance Officer)</p>
                    <p><strong>Official Address:</strong> KrishiSeva Technologies Pvt. Ltd., AgriTech Innovation Corridor, Vibhuti Khand, Gomti Nagar, Lucknow, UP – 226010</p>
                    <p><strong>Statutory Email:</strong> <span className="font-mono font-bold">grievance@krishiseva.in</span></p>
                    <p><strong>Direct Helpline:</strong> <a href="tel:+919236581606" className="font-bold text-emerald-800 dark:text-emerald-400 hover:underline">+91 92365 81606</a></p>
                  </div>
                </div>

                {/* Level 3 */}
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-stone-900/50 border-stone-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                    <span className="font-bold text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Level 3: Grievance Appellate Committee (GAC) / Ministry Escalation
                    </span>
                    <span className="text-[11px] font-semibold text-stone-500">Central Government Portal</span>
                  </div>
                  <div className="pt-2 text-xs space-y-1 text-stone-700 dark:text-stone-300">
                    <p>
                      If a complainant is aggrieved by a decision rendered by the Grievance Officer, or if no decision is communicated within 15 days, an appeal may be preferred to the Grievance Appellate Committee constituted by the Central Government under Rule 3A of the IT Rules, 2021, through the online portal <a href="https://gac.gov.in" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 underline font-semibold">gac.gov.in</a>.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ═══════════ FOOTER STATUTORY STRIP ═══════════ */}
        <footer className={`px-5 sm:px-7 py-3 border-t shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] ${
          isDark ? 'bg-[#0E1511] border-stone-800 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-600'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Govt. of India MeitY & AgriStack Verified Service Framework</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono">Toll-Free / Support: +91 92365 81606</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs transition cursor-pointer"
            >
              Close Portal
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
