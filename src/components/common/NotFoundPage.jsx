import React, { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { updatePageSEO } from '../../utils/seoHelper';
import Breadcrumbs from './Breadcrumbs';
import { 
  Tractor, 
  MapPinOff, 
  ArrowLeft, 
  PhoneCall, 
  Compass, 
  Search,
  Home,
  ShieldAlert
} from 'lucide-react';

export default function NotFoundPage({ onNavigateHome }) {
  const { lang } = useLanguage();
  const { isDark } = useTheme();
  const { setActiveRole } = useAuth();

  useEffect(() => {
    updatePageSEO('not_found');
  }, []);

  const handleReturn = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.hash = '';
      setActiveRole('landing');
    }
  };

  const breadcrumbs = [
    { label: lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home', href: '/', onClick: handleReturn },
    { label: lang === 'hi' ? '404 - पृष्ठ नहीं मिला' : '404 - Page Not Found' }
  ];

  return (
    <div className={`min-h-[85vh] flex flex-col justify-between py-8 px-4 transition-colors duration-300 ${
      isDark ? 'text-[#EAEFEA]' : 'text-[#0B1E14]'
    }`}>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-2xl mx-auto my-auto text-center space-y-6 sm:space-y-8 animate-fade-in py-12">
        {/* Animated Radar / Lost Tractor Graphic */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping opacity-30" />
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-emerald-500/30 animate-spin-slow" />
          
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-emerald-950/80 to-stone-900 border-2 border-emerald-500/50 flex flex-col items-center justify-center shadow-2xl relative z-10">
            <span className="text-4xl sm:text-5xl">🚜</span>
            <span className="text-[10px] font-black uppercase text-amber-400 mt-1 flex items-center gap-1">
              <MapPinOff className="w-3 h-3 text-amber-400" />
              <span>GPS 404</span>
            </span>
          </div>
        </div>

        {/* Text Details with Semantic One H1 for this page */}
        <div className="space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20">
            {lang === 'hi' ? 'खसरा या रूट उपलब्ध नहीं है' : 'Field Route / Page Not Found'}
          </span>
          
          {/* Exactly one H1 for 404 view */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-[#0B1E14] dark:text-[#EAEFEA]">
            {lang === 'hi' ? 'खेत का रास्ता भटक गया?' : 'Lost in the Farmlands?'}
          </h1>
          
          <p className="text-sm sm:text-base text-[#4F6358] dark:text-[#9FB1A7] max-w-lg mx-auto font-medium leading-relaxed">
            {lang === 'hi'
              ? 'यह पृष्ठ या खसरा नंबर हमारे जीपीएस सैटेलाइट राडार पर दर्ज नहीं है। कृपया मुख्य पोर्टल पर लौटकर नया खेत खोजें अथवा किसान हेल्पलाइन से संपर्क करें।'
              : 'The requested page or Khasra plot could not be located on our GPS satellite radar. Return to the main cockpit or connect with our Kisan helpline.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleReturn}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'hi' ? 'मुख्य कॉकपिट पर लौटें' : 'Return to Main Cockpit'}</span>
          </button>

          <a
            href="tel:18005728899"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer text-inherit no-underline"
          >
            <PhoneCall className="w-4 h-4 text-emerald-500" />
            <span>{lang === 'hi' ? 'हेल्पलाइन: 1800-572-8899' : 'Helpline: 1800-572-8899'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
