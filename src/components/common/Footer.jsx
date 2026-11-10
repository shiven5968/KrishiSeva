import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import KrishiSevaLogo from './KrishiSevaLogo';
import { 
  Tractor, 
  ShieldCheck, 
  PhoneCall, 
  Mail, 
  MapPin, 
  ExternalLink, 
  FileText, 
  Heart,
  Globe,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function Footer({ onOpenPrivacy, onOpenContact, onOpenTerms }) {
  const { lang } = useLanguage();
  const { isDark } = useTheme();
  const { setActiveRole } = useAuth();

  const handleNav = (e, hash, role) => {
    e.preventDefault();
    if (role) setActiveRole(role);
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer 
      role="contentinfo"
      className={`border-t transition-colors duration-300 relative z-20 ${
        isDark 
          ? 'bg-[#080E0B] border-white/10 text-stone-300' 
          : 'bg-[#FDFBF7] border-black/10 text-[#0B1E14]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-black/5 dark:border-white/10">
          
          {/* Column 1: Brand & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <a 
              href="/"
              onClick={(e) => handleNav(e, '', 'landing')}
              className="flex items-center gap-3 no-underline text-inherit group w-fit cursor-pointer"
              title="KrishiSeva Homepage"
            >
              <KrishiSevaLogo className="h-10 w-10 sm:h-12 sm:w-12 transition-transform duration-300 group-hover:scale-105 shrink-0" />
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight font-display text-[#0B1E14] dark:text-[#EAEFEA] block">
                  KrishiSeva
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  कृषि सेवा • Precision Farm Fleet
                </span>
              </div>
            </a>

            <p className="text-xs sm:text-sm text-[#4F6358] dark:text-[#9FB1A7] max-w-sm leading-relaxed font-medium">
              {lang === 'hi' 
                ? 'मांग पर आधुनिक कृषि मशीनरी, कंबाइन हार्वेस्टर एवं ड्रोन स्प्रेयर का भारत का सबसे विश्वसनीय राडार नेटवर्क। सरकारी भूलेख एवं एग्रीस्टैक एकीकृत।'
                : "India's precision on-demand agricultural machinery network. Instant tractor, harvester & drone dispatch directly to your GPS farmland coordinates."}
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>AgriStack UPFR Verified</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                <span>🏛️ UP Bhulekh Gata Synced</span>
              </span>
            </div>
          </div>

          {/* Column 2: Farmer Fleet Services (Internal Links) */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0B1E14] dark:text-white">
              {lang === 'hi' ? 'किसान सेवाएँ' : 'Farmer Fleet'}
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-[#4F6358] dark:text-[#CBD5E1]">
              <li>
                <a 
                  href="/#farmer" 
                  onClick={(e) => handleNav(e, '#farmer', 'farmer')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>🚜 {lang === 'hi' ? 'ट्रैक्टर बुकिंग कॉकपिट' : 'Tractor Dispatch Cockpit'}</span>
                </a>
              </li>
              <li>
                <a 
                  href="/#farmer" 
                  onClick={(e) => handleNav(e, '#farmer', 'farmer')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>🌾 {lang === 'hi' ? 'कंबाइन हार्वेस्टर बुकिंग' : 'Combine Harvesters'}</span>
                </a>
              </li>
              <li>
                <a 
                  href="/#farmer" 
                  onClick={(e) => handleNav(e, '#farmer', 'farmer')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>🛸 {lang === 'hi' ? 'ड्रोन यूरिया स्प्रेयर' : 'Drone Crop Spraying'}</span>
                </a>
              </li>
              <li>
                <a 
                  href="/#farmer" 
                  onClick={(e) => handleNav(e, '#farmer', 'farmer')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>🔒 {lang === 'hi' ? 'बटाईदार 1-वर्षीय पास' : 'Tenant Batai Pass'}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Driver & CHC Partners (Internal Links) */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0B1E14] dark:text-white">
              {lang === 'hi' ? 'ऑपरेटर एवं फ्लीट' : 'Fleet & Partners'}
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-[#4F6358] dark:text-[#CBD5E1]">
              <li>
                <a 
                  href="/#driver" 
                  onClick={(e) => handleNav(e, '#driver', 'driver')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>📋 {lang === 'hi' ? 'चालक फ्लीट ऑनबोर्डिंग' : 'Driver Registration'}</span>
                </a>
              </li>
              <li>
                <a 
                  href="/#driver" 
                  onClick={(e) => handleNav(e, '#driver', 'driver')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>⚡ {lang === 'hi' ? 'ऑपरेटर लाइव टेलीमेट्री' : 'Live Radar Telemetry'}</span>
                </a>
              </li>
              <li>
                <a 
                  href="/#admin" 
                  onClick={(e) => handleNav(e, '#admin', 'admin')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>🛡️ {lang === 'hi' ? 'प्रशासनिक कंसोल' : 'Admin Operations'}</span>
                </a>
              </li>
              <li>
                <a 
                  href="/sitemap.xml" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  <span>🗺️ {lang === 'hi' ? 'कृषि नेटवर्क निर्देशिका' : 'Fleet Directory'}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Legal (Internal Links) */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0B1E14] dark:text-white">
              {lang === 'hi' ? 'विधिक एवं सहायता केंद्र' : 'Help & Legal'}
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-[#4F6358] dark:text-[#CBD5E1]">
              <li>
                <button 
                  type="button"
                  onClick={() => onOpenContact && onOpenContact()}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{lang === 'hi' ? 'विधिक शिकायत एवं सहायता डेस्क' : 'Grievance & Support Desk'}</span>
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => onOpenPrivacy && onOpenPrivacy()}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{lang === 'hi' ? 'गोपनीयता नीति (DPDP 2023)' : 'Privacy Policy (DPDP Act)'}</span>
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => onOpenTerms && onOpenTerms()}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{lang === 'hi' ? 'सेवा की शर्तें व किराया अनुबंध' : 'Terms of Service & Rental'}</span>
                </button>
              </li>
              <li>
                <a 
                  href="tel:+919236581606"
                  className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 hover:underline"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>+91 92365 81606</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#4F6358] dark:text-[#9FB1A7]">
          <div className="flex items-center gap-2">
            <span>© 2026 KrishiSeva Technologies India Pvt. Ltd. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span>DPDP Act 2023 Compliant</span>
            <span>•</span>
            <span>Govt. AgriStack Verified</span>
            <span>•</span>
            <span>Made with <Heart className="w-3 h-3 text-red-500 inline fill-red-500" /> for Indian Kisans</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
