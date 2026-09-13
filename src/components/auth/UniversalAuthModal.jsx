import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  KeyRound, 
  Tractor, 
  Truck, 
  Sparkles, 
  User, 
  CheckCircle2, 
  X,
  Layers
} from 'lucide-react';

export default function UniversalAuthModal({ isOpen, onClose }) {
  const { lang, t } = useLanguage();
  const { 
    requestOtp, 
    verifyOtp, 
    generatedOtp, 
    isNewUserRoleSelectionRequired, 
    completeNewUserRegistration,
    quickDemoLogin
  } = useAuth();

  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'role_select'
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError(lang === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    const result = requestOtp(phone);
    if (result.success) {
      setOtp(result.code);
      setStep('otp');
    } else {
      setError(result.error);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const result = verifyOtp(phone, otp);

    if (result.success) {
      setError('');
      if (result.isNewUser) {
        setStep('role_select');
      } else {
        onClose();
      }
    } else {
      setError(result.error || (lang === 'hi' ? 'गलत ओटीपी।' : 'Invalid OTP.'));
    }
  };

  const handleRoleSelection = (role) => {
    completeNewUserRegistration(role, { name: userName || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#0B1E14]/75 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FDFBF7] dark:bg-[#0D1611] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_20px_50px_rgba(11,30,20,0.25)] border border-black/[0.08] dark:border-white/[0.08] relative overflow-hidden text-[#0B1E14] dark:text-[#EAEFEA]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#0B1E14] dark:text-[#EAEFEA] flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: Phone Number Input */}
        {step === 'phone' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#1A4F32]/10 dark:bg-[#4ADE80]/10 text-[#1A4F32] dark:text-[#4ADE80] flex items-center justify-center mx-auto border border-[#1A4F32]/20">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight">
                {lang === 'hi' ? 'मोबाइल नंबर से लॉगिन / साइनअप' : 'Universal Mobile Login'}
              </h3>
              <p className="text-[#4F6358] dark:text-[#9FB1A7] text-xs sm:text-sm font-medium">
                {lang === 'hi'
                  ? 'अपना 10 अंकों का मोबाइल नंबर दर्ज करें और तत्काल ओटीपी प्राप्त करें'
                  : 'Enter your 10-digit mobile number for instant OTP verification'}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4F6358] dark:text-[#9FB1A7] uppercase tracking-wider mb-1.5">
                  {t('enterMobile')}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6358] dark:text-[#9FB1A7] font-black text-sm">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    maxLength="10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-20 pr-4 py-3.5 rounded-2xl border border-black/15 dark:border-white/15 bg-white/80 dark:bg-black/40 focus:border-[#1A4F32] dark:focus:border-[#4ADE80] focus:ring-4 focus:ring-[#1A4F32]/10 font-black text-[#0B1E14] dark:text-[#EAEFEA] text-lg outline-none transition shadow-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[#0B1E14] hover:bg-[#153424] dark:bg-[#EAEFEA] dark:hover:bg-white text-white dark:text-[#0B1E14] font-black text-base shadow-[0_8px_30px_rgb(11,30,20,0.12)] flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span>{t('sendOtp')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {/* Quick Demo Test Profiles for Fast Testing */}
            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
              <span className="text-[10px] text-[#4F6358] dark:text-[#9FB1A7] font-extrabold uppercase tracking-wider block text-center">
                ⚡ 1-Click Fast Demo Login (डेमो प्रोफ़ाइल चुनें)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { quickDemoLogin('farmer'); onClose(); }}
                  className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.04] hover:bg-emerald-500/10 border border-black/[0.06] dark:border-white/[0.08] text-left transition hover:border-[#1A4F32]/30"
                >
                  <span className="text-xs font-black text-[#0B1E14] dark:text-[#EAEFEA] block">🌾 Farmer</span>
                  <span className="text-[10px] text-[#4F6358] dark:text-[#9FB1A7]">9876543210</span>
                </button>

                <button
                  type="button"
                  onClick={() => { quickDemoLogin('verified_driver'); onClose(); }}
                  className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.04] hover:bg-blue-500/10 border border-black/[0.06] dark:border-white/[0.08] text-left transition hover:border-blue-500/30"
                >
                  <span className="text-xs font-black text-[#0B1E14] dark:text-[#EAEFEA] block">🚜 Driver</span>
                  <span className="text-[10px] text-[#4F6358] dark:text-[#9FB1A7]">9876501234</span>
                </button>

                <button
                  type="button"
                  onClick={() => { quickDemoLogin('pending_driver'); onClose(); }}
                  className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.04] hover:bg-amber-500/10 border border-black/[0.06] dark:border-white/[0.08] text-left transition hover:border-amber-500/30"
                >
                  <span className="text-xs font-black text-[#0B1E14] dark:text-[#EAEFEA] block">⏳ KYC Pending</span>
                  <span className="text-[10px] text-[#4F6358] dark:text-[#9FB1A7]">9811122233</span>
                </button>

                <button
                  type="button"
                  onClick={() => { quickDemoLogin('admin'); onClose(); }}
                  className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.04] hover:bg-purple-500/10 border border-black/[0.06] dark:border-white/[0.08] text-left transition hover:border-purple-500/30"
                >
                  <span className="text-xs font-black text-[#0B1E14] dark:text-[#EAEFEA] block">🛡️ Admin</span>
                  <span className="text-[10px] text-[#4F6358] dark:text-[#9FB1A7]">9999999999</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: OTP Verification Screen */}
        {step === 'otp' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#1A4F32]/10 dark:bg-[#4ADE80]/10 text-[#1A4F32] dark:text-[#4ADE80] flex items-center justify-center mx-auto border border-[#1A4F32]/20">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight">
                {lang === 'hi' ? 'ओटीपी सत्यापन' : 'Verify OTP Code'}
              </h3>
              <p className="text-[#4F6358] dark:text-[#9FB1A7] text-xs sm:text-sm font-medium">
                {lang === 'hi' ? `मोबाइल +91 ${phone} पर भेजा गया कोड दर्ज करें` : `Enter the 6-digit code sent to +91 ${phone}`}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full py-4 text-center tracking-[0.5em] rounded-2xl border border-black/15 dark:border-white/15 bg-white/80 dark:bg-black/40 focus:border-[#1A4F32] dark:focus:border-[#4ADE80] focus:ring-4 focus:ring-[#1A4F32]/10 font-black text-[#0B1E14] dark:text-[#EAEFEA] text-3xl outline-none transition shadow-sm"
                  required
                />
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-1/3 py-3.5 rounded-full border border-black/15 dark:border-white/15 text-[#0B1E14] dark:text-[#EAEFEA] font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3.5 rounded-full bg-[#0B1E14] hover:bg-[#153424] dark:bg-[#EAEFEA] dark:hover:bg-white text-white dark:text-[#0B1E14] font-black text-base shadow-[0_8px_30px_rgb(11,30,20,0.12)] flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>{t('verifyOtp')}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: POST-OTP ROLE SELECTION */}
        {step === 'role_select' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#1A4F32] dark:text-[#4ADE80] bg-[#1A4F32]/10 dark:bg-[#4ADE80]/10 px-3.5 py-1 rounded-full border border-[#1A4F32]/20">
                {lang === 'hi' ? 'स्वागत है! अपनी भूमिका चुनें' : 'Welcome! Select Your Account Role'}
              </span>
              <h3 className="text-2xl font-black text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight mt-1">
                {lang === 'hi' ? 'आप कृषि सेवा का उपयोग कैसे करना चाहते हैं?' : 'Are you a Farmer or a Machinery Driver?'}
              </h3>
              <p className="text-[#4F6358] dark:text-[#9FB1A7] text-xs sm:text-sm font-medium">
                {lang === 'hi' ? 'खेत के लिए मशीनरी बुक करें या अपनी मशीन लगाकर कमाई शुरू करें' : 'Choose whether you want to book equipment or provide equipment'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4F6358] dark:text-[#9FB1A7] uppercase tracking-wider mb-1.5">
                {t('fullName')} (Optional)
              </label>
              <input
                type="text"
                placeholder="अपना नाम दर्ज करें"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-black/15 dark:border-white/15 bg-white/80 dark:bg-black/40 font-bold text-[#0B1E14] dark:text-[#EAEFEA] outline-none focus:border-[#1A4F32] dark:focus:border-[#4ADE80] shadow-sm transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option A: Farmer (Book Machinery) */}
              <div
                onClick={() => handleRoleSelection('farmer')}
                className="p-5 rounded-3xl border border-[#1A4F32]/30 dark:border-[#4ADE80]/30 bg-[#1A4F32]/5 hover:bg-[#1A4F32]/10 cursor-pointer transition shadow-sm hover:shadow-md group space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0B1E14] text-white flex items-center justify-center shadow-md">
                  <Tractor className="w-6 h-6 text-[#4ADE80]" />
                </div>
                <div>
                  <h4 className="font-black text-base text-[#0B1E14] dark:text-[#EAEFEA]">
                    {lang === 'hi' ? 'मैं किसान हूँ (Farmer)' : 'I am a Farmer'}
                  </h4>
                  <p className="text-xs text-[#4F6358] dark:text-[#9FB1A7] mt-1 leading-relaxed">
                    {lang === 'hi' ? 'खेत की जुताई, बुवाई, कटाई हेतु मशीनरी बुक करें।' : 'Book tractors, harvesters & earthmovers for your fields.'}
                  </p>
                </div>
                <button className="w-full py-2.5 rounded-full bg-[#0B1E14] hover:bg-[#153424] text-white font-bold text-xs shadow-sm transition">
                  {lang === 'hi' ? 'किसान के रूप में जारी रखें' : 'Continue as Farmer'}
                </button>
              </div>

              {/* Option B: Driver (Provide Machinery) */}
              <div
                onClick={() => handleRoleSelection('driver')}
                className="p-5 rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition shadow-sm hover:shadow-md group space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1A4F32] text-white flex items-center justify-center shadow-md">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-base text-[#0B1E14] dark:text-[#EAEFEA]">
                    {lang === 'hi' ? 'मैं ड्राइवर/मालिक हूँ (Driver)' : 'I am a Driver / Owner'}
                  </h4>
                  <p className="text-xs text-[#4F6358] dark:text-[#9FB1A7] mt-1 leading-relaxed">
                    {lang === 'hi' ? 'केवाईसी दस्तावेज़ (DL/प्लेट) अपलोड कर बुकिंग पाएं।' : 'Upload DL & Plate to start receiving field ride requests.'}
                  </p>
                </div>
                <button className="w-full py-2.5 rounded-full bg-[#1A4F32] hover:bg-[#153424] text-white font-bold text-xs shadow-sm transition">
                  {lang === 'hi' ? 'केवाईसी शुरू करें' : 'Start Driver KYC'}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
