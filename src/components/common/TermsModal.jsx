import React, { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { updatePageSEO } from '../../utils/seoHelper';
import { 
  FileCheck2, 
  X, 
  Scale, 
  Tractor, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  IndianRupee 
} from 'lucide-react';

export default function TermsModal({ isOpen, onClose }) {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  useEffect(() => {
    if (isOpen) {
      updatePageSEO('terms');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border relative overflow-hidden transition-all duration-300 max-h-[92vh] flex flex-col ${
          isDark 
            ? 'bg-[#0D1611] border-emerald-500/20 text-[#EAEFEA]' 
            : 'bg-[#FDFBF7] border-black/10 text-[#0B1E14]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#0B1E14] dark:text-[#EAEFEA]">
                  {lang === 'hi' ? 'सेवा की शर्तें एवं दिशानिर्देश' : 'Terms of Service & Rental Conditions'}
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Fair Rental Standard
                </span>
              </div>
              <p className="text-xs text-[#4F6358] dark:text-[#9FB1A7] mt-0.5 font-medium">
                {lang === 'hi'
                  ? 'किसान, ऑपरेटर एवं कस्टम हायरिंग सेंटर्स के लिए निष्पक्ष अनुबंध'
                  : 'Fair operating contract between farmers, machine drivers & CHC fleets'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close Terms Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto pr-1 py-4 space-y-5 text-xs sm:text-sm leading-relaxed text-[#4F6358] dark:text-[#CBD5E1]">
          
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#0B1E14] dark:text-white flex items-center gap-2">
              <Tractor className="w-4 h-4 text-emerald-500" />
              <span>1. {lang === 'hi' ? 'मशीनरी उपलब्धता एवं डिस्पैच' : 'Machinery Booking & Dispatch'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'बुकिंग स्वीकार होने पर नजदीकी सत्यापित मशीन चालक 15 से 30 मिनट में किसान के बताए जीपीएस निर्देशांकों पर पहुँचने हेतु बाध्य हैं। प्राकृतिक आपदा, भारी वर्षा अथवा अनपेक्षित तकनीकी खराबी की स्थिति में किसान को तुरंत सूचित किया जाएगा।'
                : 'Upon booking confirmation, assigned drivers strive to arrive at the specified farmland GPS boundary within 15–30 minutes. Inclement weather or sudden breakdown triggers instant farmer notification.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#0B1E14] dark:text-white flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-500" />
              <span>2. {lang === 'hi' ? 'पारदर्शी क्षेत्रीय किराया एवं भुगतान' : 'Transparent Regional Pricing & Payment'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'सभी दरें संबंधित जिले एवं कृषि-जलवायु क्षेत्र के एग्रो-बूम मल्टीप्लायर के अनुसार पूर्व-निर्धारित होती हैं। कार्य समाप्ति के पश्चात बिल राशि यूपीआई अथवा नकद द्वारा सीधे चालक को देय होगी।'
                : 'All fares scale automatically via the Regional Demand Multiplier. Post-work payment is rendered directly to the operator via UPI, Cash, or Net Banking.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#0B1E14] dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
              <span>3. {lang === 'hi' ? 'बटाईदार एवं भूस्वामी दायित्व' : 'Tenant & Landowner Obligations'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'बटाईदार केवल अधिकृत खसरा संख्या पर ही कृषि कार्य कराने के पात्र होंगे। किसी अन्य अनधिकृत भूमि पर मशीन का उपयोग पाए जाने पर खाता तत्काल निलंबित किया जा सकता है।'
                : 'Tenant farmers must only deploy hired machinery on authorized Khasra plots confirmed by the landowner. Dispatches to unverified parcels void service guarantees.'}
            </p>
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-black/10 dark:border-white/10 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#0B1E14] hover:bg-[#153424] dark:bg-[#EAEFEA] dark:hover:bg-white text-white dark:text-[#0B1E14] font-black text-xs sm:text-sm transition cursor-pointer"
          >
            {lang === 'hi' ? 'स्वीकार करें / बंद करें' : 'Accept & Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
