import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Phone, 
  MessageSquare, 
  Wrench, 
  ShieldCheck, 
  Clock, 
  X, 
  Headphones
} from 'lucide-react';

export default function HelpSupportModal({ isOpen, onClose }) {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border relative overflow-hidden transition-all duration-300 max-h-[90vh] overflow-y-auto ${
        isDark 
          ? 'bg-slate-900 border-slate-800 text-white shadow-emerald-950/20' 
          : 'bg-white border-slate-200 text-slate-900 shadow-2xl shadow-emerald-900/10'
      }`}>
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-xl transition cursor-pointer ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
          }`}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{lang === 'hi' ? 'किसान सहायता एवं हेल्पलाइन' : '24x7 Support & Helpline'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'hi' 
                ? 'मशीनरी बुकिंग, तकनीकी सहायता या खराबी में तुरंत संपर्क करें' 
                : 'Instant assistance for machinery dispatches, billing & breakdown'}
            </p>
          </div>
        </div>

        {/* Support Cards */}
        <div className="space-y-3.5">
          
          {/* Toll Free Kisan Call Center */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-800/60 border-slate-700/80 hover:border-emerald-500/50' : 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-300'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-block">
                  {lang === 'hi' ? 'टोल-फ्री राष्ट्रीय हेल्पलाइन' : 'Toll-Free National Helpline'}
                </span>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5 pt-1">
                  <span>1800-180-1551</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'hi' 
                    ? 'कृषि मंत्रालय एवं कृषिसेवा 24x7 कॉल सेंटर (निःशुल्क)' 
                    : 'Ministry of Agriculture & KrishiSeva 24x7 Free Hotline'}
                </p>
              </div>
              <a
                href="tel:18001801551"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 shrink-0 active:scale-95 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'कॉल करें' : 'Call Now'}</span>
              </a>
            </div>
          </div>

          {/* WhatsApp Direct Help */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-800/60 border-slate-700/80 hover:border-green-500/50' : 'bg-slate-50 border-slate-200 hover:border-green-300'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 inline-block">
                  WhatsApp Support
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 pt-1">
                  <span>+91 98765 43210</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'hi' 
                    ? 'लाइव लोकेशन भेजें या व्हाट्सएप पर तुरंत चैट करें' 
                    : 'Share live GPS coordinates or chat instantly on WhatsApp'}
                </p>
              </div>
              <a
                href="https://wa.me/919876543210?text=KrishiSeva%20Help%20Request"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow-md shadow-green-600/20 flex items-center gap-1.5 shrink-0 active:scale-95 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Emergency Machinery Breakdown Support */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-800/60 border-slate-700/80 hover:border-amber-500/50' : 'bg-amber-50/50 border-amber-100 hover:border-amber-300'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-block">
                  {lang === 'hi' ? 'मशीन खराबी / आपातकाल' : 'Machinery Breakdown'}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 pt-1">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  <span>{lang === 'hi' ? 'ऑन-फील्ड रिपेयर डिस्पैच' : 'On-Field Rapid Mechanic Dispatch'}</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'hi' 
                    ? 'कार्य के दौरान ट्रैक्टर/हार्वेस्टर खराबी पर वैकल्पिक मशीन का बैकअप' 
                    : 'Instant replacement machinery dispatched if equipment stalls on field'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  alert(lang === 'hi' 
                    ? 'आपातकालीन सहायता अनुरोध दर्ज किया गया। नजदीकी तकनीशियन आपसे 5 मिनट में संपर्क करेगा।' 
                    : 'Emergency mechanic requested. A nearby tech lead will call you in 5 minutes.');
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-1.5 shrink-0 active:scale-95 transition cursor-pointer"
              >
                <span>{lang === 'hi' ? 'अनुरोध करें' : 'Request SOS'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Operating Hours Note */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{lang === 'hi' ? '24 घंटे • 7 दिन उपलब्ध' : 'Available 24x7 Nationwide'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? '100% सत्यापित' : '100% Verified Support'}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
