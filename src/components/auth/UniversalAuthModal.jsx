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
    const code = requestOtp(phone);
    setOtp(code);
    setStep('otp');
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
      setError(lang === 'hi' ? 'गलत ओटीपी। 1234 या जनरेटेड कोड दर्ज करें।' : 'Invalid OTP code. Try entering 1234.');
    }
  };

  const handleRoleSelection = (role) => {
    completeNewUserRegistration(role, { name: userName || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: Phone Number Input */}
        {step === 'phone' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <Phone className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-stone-900">
                {lang === 'hi' ? 'मोबाइल नंबर से लॉगिन / साइनअप' : 'Universal Mobile Login'}
              </h3>
              <p className="text-stone-500 text-xs sm:text-sm font-medium">
                {lang === 'hi'
                  ? 'अपना 10 अंकों का मोबाइल नंबर दर्ज करें और तत्काल ओटीपी प्राप्त करें'
                  : 'Enter your 10-digit mobile number for instant OTP verification'}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  {t('enterMobile')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-black text-sm">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    maxLength="10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-20 pr-4 py-3.5 rounded-2xl border-2 border-stone-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 font-black text-stone-900 text-lg outline-none transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-98"
              >
                <span>{t('sendOtp')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {/* Quick Demo Test Profiles for Fast Testing */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block text-center">
                ⚡ 1-Click Fast Demo Login (डेमो प्रोफ़ाइल चुनें)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { quickDemoLogin('farmer'); onClose(); }}
                  className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition"
                >
                  <span className="text-xs font-black text-emerald-900 block">🌾 Existing Farmer</span>
                  <span className="text-[10px] text-emerald-700">9876543210</span>
                </button>

                <button
                  type="button"
                  onClick={() => { quickDemoLogin('verified_driver'); onClose(); }}
                  className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition"
                >
                  <span className="text-xs font-black text-blue-900 block">🚜 Verified Driver</span>
                  <span className="text-[10px] text-blue-700">9876501234</span>
                </button>

                <button
                  type="button"
                  onClick={() => { quickDemoLogin('pending_driver'); onClose(); }}
                  className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition"
                >
                  <span className="text-xs font-black text-amber-900 block">⏳ Pending Driver</span>
                  <span className="text-[10px] text-amber-700">9811122233</span>
                </button>

                <button
                  type="button"
                  onClick={() => { quickDemoLogin('admin'); onClose(); }}
                  className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition"
                >
                  <span className="text-xs font-black text-purple-900 block">🛡️ Super Admin</span>
                  <span className="text-[10px] text-purple-700">9999999999</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: OTP Verification Screen */}
        {step === 'otp' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-stone-900">
                {lang === 'hi' ? 'ओटीपी सत्यापन' : 'Verify OTP Code'}
              </h3>
              <p className="text-stone-500 text-xs sm:text-sm font-medium">
                {lang === 'hi' ? `मोबाइल +91 ${phone} पर भेजा गया कोड दर्ज करें` : `Enter the 4-digit code sent to +91 ${phone}`}
              </p>
            </div>

            {/* Demo Hint Banner */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Simulated OTP: <b>{generatedOtp || '1234'}</b></span>
              </div>
              <button
                type="button"
                onClick={() => setOtp(generatedOtp || '1234')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-sm"
              >
                Auto-Fill
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength="4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full py-4 text-center tracking-[0.6em] rounded-2xl border-2 border-stone-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 font-black text-stone-900 text-3xl outline-none transition"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-1/3 py-3.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-50"
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-98"
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
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                {lang === 'hi' ? 'स्वागत है! अपनी भूमिका चुनें' : 'Welcome! Select Your Account Role'}
              </span>
              <h3 className="text-2xl font-black text-stone-900 mt-1">
                {lang === 'hi' ? 'आप कृषि सेवा का उपयोग कैसे करना चाहते हैं?' : 'Are you a Farmer or a Machinery Driver?'}
              </h3>
              <p className="text-stone-500 text-xs sm:text-sm font-medium">
                {lang === 'hi' ? 'खेत के लिए मशीनरी बुक करें या अपनी मशीन लगाकर कमाई शुरू करें' : 'Choose whether you want to book equipment or provide equipment'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                {t('fullName')} (Optional)
              </label>
              <input
                type="text"
                placeholder="अपना नाम दर्ज करें"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-900 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option A: Farmer (Book Machinery) */}
              <div
                onClick={() => handleRoleSelection('farmer')}
                className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-600 cursor-pointer transition shadow-md group space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Tractor className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-base text-stone-900">
                    {lang === 'hi' ? 'मैं किसान हूँ (Farmer)' : 'I am a Farmer'}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">
                    {lang === 'hi' ? 'खेत की जुताई, बुवाई, कटाई हेतु मशीनरी बुक करें।' : 'Book tractors, harvesters & earthmovers for your fields.'}
                  </p>
                </div>
                <button className="w-full py-2 rounded-xl bg-emerald-600 text-white font-black text-xs">
                  {lang === 'hi' ? 'किसान के रूप में जारी रखें' : 'Continue as Farmer'}
                </button>
              </div>

              {/* Option B: Driver (Provide Machinery) */}
              <div
                onClick={() => handleRoleSelection('driver')}
                className="p-5 rounded-2xl border-2 border-blue-500 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-600 cursor-pointer transition shadow-md group space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Truck className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-base text-stone-900">
                    {lang === 'hi' ? 'मैं ड्राइवर/मालिक हूँ (Driver)' : 'I am a Driver / Owner'}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">
                    {lang === 'hi' ? 'केवाईसी दस्तावेज़ (DL/प्लेट) अपलोड कर बुकिंग पाएं।' : 'Upload DL & Plate to start receiving field ride requests.'}
                  </p>
                </div>
                <button className="w-full py-2 rounded-xl bg-blue-600 text-white font-black text-xs">
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
