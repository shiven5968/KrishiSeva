import React, { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { updatePageSEO } from '../../utils/seoHelper';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  MapPin, 
  UserCheck, 
  X, 
  Building2, 
  Scale, 
  CheckCircle2, 
  Mail, 
  PhoneCall 
} from 'lucide-react';

export default function PrivacyPolicyModal({ isOpen, onClose }) {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  useEffect(() => {
    if (isOpen) {
      updatePageSEO('privacy');
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
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#0B1E14] dark:text-[#EAEFEA]">
                  {lang === 'hi' ? 'गोपनीयता नीति एवं डेटा सुरक्षा' : 'Privacy Policy & Data Protection'}
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  DPDP Act 2023 Compliant
                </span>
              </div>
              <p className="text-xs text-[#4F6358] dark:text-[#9FB1A7] mt-0.5 font-medium">
                {lang === 'hi'
                  ? 'डिजिटल भारत एवं एग्रीस्टैक किसान डेटा सुरक्षा मानकों के अंतर्गत संरक्षित'
                  : 'Governed by Digital Personal Data Protection Act (India) & AgriStack Data Guidelines'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close Privacy Policy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Legal Sections */}
        <div className="overflow-y-auto pr-1 py-4 space-y-6 text-xs sm:text-sm leading-relaxed text-[#4F6358] dark:text-[#CBD5E1]">
          
          {/* Section 1: Introduction */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#0B1E14] dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-500" />
              <span>1. {lang === 'hi' ? 'प्रस्तावना एवं दायरा' : 'Introduction & Scope'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'कृषि सेवा (KrishiSeva Technologies India) किसानों, ऑपरेटरों एवं कस्टम हायरिंग सेंटर्स (CHCs) के व्यक्तिगत एवं कृषि डेटा की पूर्ण गोपनीयता बनाए रखने के लिए प्रतिबद्ध है। यह नीति स्पष्ट करती है कि हम आपके आधार ई-केवाईसी, भूलेख खसरा अभिलेख एवं जीपीएस निर्देशांकों का संग्रह और उपयोग किस प्रकार करते हैं।'
                : 'KrishiSeva Technologies India is dedicated to safeguarding the personal and agricultural data of farmers, machinery operators, and Custom Hiring Centers (CHCs). This policy explains our protocols for handling Aadhaar eKYC, Bhulekh land registries, and GPS coordinates.'}
            </p>
          </div>

          {/* Section 2: Data We Collect */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#0B1E14] dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>2. {lang === 'hi' ? 'हमारे द्वारा संकलित डेटा' : 'Information We Collect'}</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>{lang === 'hi' ? 'पहचान एवं प्रमाणीकरण:' : 'Identity & Auth:'}</strong> {lang === 'hi' ? 'नाम, मोबाइल नंबर, और यूआईडीएआई (UIDAI) द्वारा सुरक्षित 12-अंकीय आधार ई-केवाईसी मास्क टोकन।' : 'Name, phone number, and UIDAI masked eKYC verification tokens.'}
              </li>
              <li>
                <strong>{lang === 'hi' ? 'भू-अभिलेख एवं खसरा संख्या:' : 'Land Records & Khasra Numbers:'}</strong> {lang === 'hi' ? 'उत्तर प्रदेश राजस्व परिषद (UP Bhulekh) एवं एग्रीस्टैक (AgriStack UPFR) से सत्यापित खसरा/गाटा संख्या, रकबा (बीघा/हेक्टेयर) एवं मृदा प्रकार।' : 'UP Bhulekh and AgriStack UPFR verified Khasra/Gata numbers, farmland acreage, and soil profile.'}
              </li>
              <li>
                <strong>{lang === 'hi' ? 'जियो-स्पेशियल लोकेशन एवं जीपीएस पॉलीगॉन:' : 'Geospatial Radar & GPS Polygons:'}</strong> {lang === 'hi' ? 'मशीनरी को खेत तक सटीक पहुँचाने हेतु खेत की सीमा (पॉलीगॉन) तथा लाइव डिस्पैच टेलीमेट्री।' : 'Precise farmland boundary coordinates and machinery dispatch telemetry.'}
              </li>
            </ul>
          </div>

          {/* Section 3: Batai / Tenant Farmer Landowner Consent */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#0B1E14] dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>3. {lang === 'hi' ? 'बटाईदार एवं भूस्वामी सहमति प्रोटोकॉल' : 'Tenant Farmer (Batai) Consent Protocol'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'बटाईदार कृषकों के लिए मशीनरी बुकिंग केवल तभी स्वीकृत होती है जब पंजीकृत जमीन मालिक व्हाट्सएप / एसएमएस के माध्यम से आधार ई-केवाईसी द्वारा 1-वर्षीय बटाई पास की पुष्टि करते हैं। अधिकृत खसरा के अतिरिक्त किसी भी अन्य प्लॉट पर बुकिंग की अनुमति नहीं दी जाती।'
                : 'For tenant farmers (Batai), machinery booking is strictly gated until the verified registered landowner grants digital eKYC consent via WhatsApp/SMS. Booking is strictly locked to the authorized Khasra boundary.'}
            </p>
          </div>

          {/* Section 4: Live Telemetry & GPS Tracking */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#0B1E14] dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>4. {lang === 'hi' ? 'जीपीएस एवं टेलीमेट्री गोपनीयता' : 'Live GPS & Telemetry Privacy'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'ड्राइवर व ट्रैक्टर का जीपीएस केवल सक्रिय बुकिंग (जब मशीन खेत की ओर रवाना होती है) के दौरान ही किसान के साथ साझा किया जाता है। ड्यूटी ऑफलाइन होने पर कोई भी बैकग्राउंड ट्रैकिंग नहीं की जाती।'
                : 'Driver GPS coordinates are broadcasted solely during active dispatches to ensure timely field arrival. Zero background telemetry tracking occurs when duty status is switched offline.'}
            </p>
          </div>

          {/* Section 5: Data Rights & Account Deletion */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#0B1E14] dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>5. {lang === 'hi' ? 'उपयोगकर्ता अधिकार एवं खाता विलोपन' : 'Your Rights & Data Deletion'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'डीपीडीपी अधिनियम 2023 के अंतर्गत आप किसी भी समय अपने सहेजे गए खेत मिटा सकते हैं अथवा "Delete Account" विकल्प द्वारा अपनी पूरी प्रोफ़ाइल और डेटा हमारे सर्वर से स्थायी रूप से हटा सकते हैं।'
                : 'Under the DPDP Act 2023, you retain full rights to inspect, update, or permanently purge your registered farmland profiles and account records at any time.'}
            </p>
          </div>

          {/* Section 6: Grievance Officer */}
          <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 space-y-2">
            <span className="font-bold text-xs uppercase tracking-wider text-[#0B1E14] dark:text-white block">
              {lang === 'hi' ? 'शिकायत निवारण अधिकारी (Grievance Redressal Officer)' : 'Grievance Redressal Officer'}
            </span>
            <div className="text-xs space-y-1">
              <p><strong>Name:</strong> Rajesh Verma (Data Protection Officer)</p>
              <p><strong>Address:</strong> KrishiSeva AgriTech Hub, Gomti Nagar, Lucknow, UP - 226010</p>
              <p><strong>Email:</strong> grievance@krishiseva.in | privacy@krishiseva.in</p>
              <p><strong>Helpline:</strong> 1800-572-8899 (Mon–Sat, 9:00 AM – 6:00 PM)</p>
            </div>
          </div>

        </div>

        {/* Modal Bottom Action Button */}
        <div className="pt-4 border-t border-black/10 dark:border-white/10 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#0B1E14] hover:bg-[#153424] dark:bg-[#EAEFEA] dark:hover:bg-white text-white dark:text-[#0B1E14] font-black text-xs sm:text-sm transition cursor-pointer"
          >
            {lang === 'hi' ? 'समझ गया / बंद करें' : 'I Understand & Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
