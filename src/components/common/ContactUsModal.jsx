import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { audioHelper } from '../../utils/audioHelper';
import { updatePageSEO } from '../../utils/seoHelper';
import { trackEvent, ANALYTICS_EVENTS } from '../../services/analytics';
import { 
  Mail, 
  Phone, 
  Send, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  MapPin, 
  User, 
  AlertCircle, 
  X, 
  Sparkles, 
  HelpCircle,
  Building2,
  Tractor
} from 'lucide-react';

export default function ContactUsModal({ isOpen, onClose }) {
  const { lang } = useLanguage();
  const { isDark } = useTheme();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      updatePageSEO('contact');
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    role: currentUser?.role || 'farmer',
    district: 'Lucknow',
    subject: 'Machinery Booking Help',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage(lang === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें' : 'Please enter your full name');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage(lang === 'hi' ? 'कृपया 10-अंकीय वैध मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!formData.message.trim()) {
      setErrorMessage(lang === 'hi' ? 'कृपया अपना संदेश या समस्या का विवरण लिखें' : 'Please enter your message or query');
      return;
    }

    setIsSubmitting(true);

    const enquiryRecord = {
      id: `enquiry_${Date.now()}`,
      timestamp: new Date().toISOString(),
      name: formData.name.trim(),
      phone: cleanPhone,
      role: formData.role,
      district: formData.district,
      subject: formData.subject,
      message: formData.message.trim(),
      status: 'new'
    };

    setTimeout(() => {
      // 1. Save to local storage for Admin Portal / customer service queue
      try {
        const existing = JSON.parse(localStorage.getItem('krishi_contact_enquiries') || '[]');
        localStorage.setItem('krishi_contact_enquiries', JSON.stringify([enquiryRecord, ...existing]));
      } catch (err) {
        console.error('Failed to store contact enquiry', err);
      }

      // 2. Broadcast to Real-Time Network if available
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const channel = new BroadcastChannel('krishi_realtime_network');
          channel.postMessage({
            type: 'NEW_CONTACT_ENQUIRY',
            payload: enquiryRecord
          });
        } catch (e) {}
      }

      // 3. Audio & analytics feedback
      audioHelper.playBookingConfirmed();
      trackEvent(ANALYTICS_EVENTS.CONTACT_FORM_SUBMITTED, {
        role: formData.role,
        district: formData.district
      });

      setIsSubmitting(false);
      setSuccessMessage(
        lang === 'hi'
          ? 'आपका संदेश सफलतापूर्वक दर्ज हो गया है! हमारी किसान सहायता टीम शीघ्र ही आपसे संपर्क करेगी।'
          : 'Thank you! Your message has been received. Our Kisan Support team will connect with you shortly.'
      );

      // Reset form after short delay
      setTimeout(() => {
        setFormData({
          name: currentUser?.name || '',
          phone: currentUser?.phone || '',
          role: currentUser?.role || 'farmer',
          district: 'Lucknow',
          subject: 'Machinery Booking Help',
          message: ''
        });
      }, 4000);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border relative overflow-hidden transition-all duration-300 max-h-[92vh] flex flex-col ${
          isDark 
            ? 'bg-[#0D1611] border-emerald-500/20 text-[#EAEFEA]' 
            : 'bg-[#FDFBF7] border-black/10 text-[#0B1E14]'
        }`}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#0B1E14] dark:text-[#EAEFEA]">
                  {lang === 'hi' ? 'हमसे संपर्क करें (24x7 हेल्पलाइन)' : 'Contact Us & 24x7 Kisan Support'}
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Live Dispatch Help
                </span>
              </div>
              <p className="text-xs text-[#4F6358] dark:text-[#9FB1A7] mt-0.5 font-medium">
                {lang === 'hi'
                  ? 'मशीनरी उपलब्धता, फ्लीट ऑनबोर्डिंग या तकनीकी सहायता हेतु संदेश भेजें'
                  : 'Get instant assistance with tractor dispatches, CHC fleet, or billing'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close Contact Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <div className="overflow-y-auto pr-1 py-4 space-y-4">
          
          {/* Direct Help Quick Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a 
              href="tel:18005728899"
              className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-inherit no-underline hover:bg-emerald-500/15 transition cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-stone-950 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  {lang === 'hi' ? 'टोल-फ्री किसान हेल्पलाइन' : 'Toll-Free Helpline'}
                </span>
                <span className="font-extrabold text-xs text-[#0B1E14] dark:text-white">1800-572-8899</span>
              </div>
            </a>

            <a 
              href="https://wa.me/919876501234?text=Namaste%20KrishiSeva%20Help%20Desk"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center gap-3 text-inherit no-underline hover:bg-teal-500/15 transition cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-500 text-stone-950 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
                  {lang === 'hi' ? 'व्हाट्सएप त्वरित चैट' : 'WhatsApp Live Chat'}
                </span>
                <span className="font-extrabold text-xs text-[#0B1E14] dark:text-white">+91 98765-01234</span>
              </div>
            </a>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-start gap-2.5 animate-fade-in shadow-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block text-sm">{lang === 'hi' ? 'संदेश प्राप्त हुआ ✓' : 'Message Sent Successfully ✓'}</span>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#4F6358] dark:text-stone-300">
                  {lang === 'hi' ? 'पूरा नाम *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={lang === 'hi' ? 'उदा. बलराम सिंह' : 'e.g. Balram Singh'}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 font-bold text-xs bg-black/[0.02] dark:bg-white/[0.03] outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#4F6358] dark:text-stone-300">
                  {lang === 'hi' ? 'मोबाइल नंबर (10-अंक) *' : 'Mobile Number (10 Digits) *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 font-bold text-xs bg-black/[0.02] dark:bg-white/[0.03] outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Profile Type */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#4F6358] dark:text-stone-300">
                  {lang === 'hi' ? 'आपकी श्रेणी *' : 'You are a *'}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 font-bold text-xs bg-black/[0.02] dark:bg-stone-900 outline-none focus:border-emerald-500 transition cursor-pointer"
                >
                  <option value="farmer">{lang === 'hi' ? '🌾 किसान (Farmer)' : '🌾 Farmer'}</option>
                  <option value="driver">{lang === 'hi' ? '🚜 ट्रैक्टर चालक / ऑपरेटर (Driver)' : '🚜 Machine Operator / Driver'}</option>
                  <option value="chc_owner">{lang === 'hi' ? '🏛️ कस्टम हायरिंग सेंटर संचालक (CHC)' : '🏛️ CHC Center Owner'}</option>
                  <option value="other">{lang === 'hi' ? '📦 अन्य / सामान्य पूछताछ' : '📦 Other / General Enquiry'}</option>
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#4F6358] dark:text-stone-300">
                  {lang === 'hi' ? 'जिला / कार्यक्षेत्र *' : 'District / Region *'}
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Lucknow / Malihabad"
                  className="w-full px-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 font-bold text-xs bg-black/[0.02] dark:bg-white/[0.03] outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#4F6358] dark:text-stone-300">
                {lang === 'hi' ? 'विषय (Subject) *' : 'Subject *'}
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 font-bold text-xs bg-black/[0.02] dark:bg-stone-900 outline-none focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="Machinery Booking Help">{lang === 'hi' ? 'मशीनरी बुकिंग सहायता (Booking Assistance)' : 'Machinery Booking Help'}</option>
                <option value="Driver / Fleet Onboarding">{lang === 'hi' ? 'ड्राइवर / फ्लीट पंजीकरण (Fleet Onboarding)' : 'Driver / Fleet Onboarding'}</option>
                <option value="UP Bhulekh / AgriStack Issue">{lang === 'hi' ? 'भूलेख / एग्रीस्टैक सत्यापन समस्या (Registry Issue)' : 'UP Bhulekh / AgriStack Issue'}</option>
                <option value="Billing & Pricing Dispute">{lang === 'hi' ? 'किराया व भुगतान पूछताछ (Billing & Rates)' : 'Billing & Pricing Dispute'}</option>
                <option value="Other">{lang === 'hi' ? 'अन्य कोई प्रश्न (General Query)' : 'Other Enquiry'}</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#4F6358] dark:text-stone-300">
                {lang === 'hi' ? 'संदेश या समस्या का विवरण *' : 'Your Message / Requirement *'}
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={lang === 'hi' ? 'कृपया अपनी आवश्यकता अथवा समस्या का विस्तार से वर्णन करें...' : 'Please describe your requirement or problem in detail...'}
                className="w-full p-3 rounded-2xl border border-black/10 dark:border-white/10 font-medium text-xs bg-black/[0.02] dark:bg-white/[0.03] outline-none focus:border-emerald-500 transition"
                required
              />
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin text-stone-950" />
                  <span>{lang === 'hi' ? 'संदेश भेजा जा रहा है...' : 'Sending Message...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-stone-950" />
                  <span>{lang === 'hi' ? 'संदेश सबमिट करें (Send Message)' : 'Send Message to Kisan Desk'}</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
