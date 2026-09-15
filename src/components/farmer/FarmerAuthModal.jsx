import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { sendRealWhatsAppOtp } from '../../utils/smsGateway';
import { Phone, ShieldCheck, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';

export default function FarmerAuthModal({ isOpen, onClose }) {
  const { lang, t } = useLanguage();
  const { requestOtp, verifyOtp, generatedOtp } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      setError(lang === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    const result = requestOtp(cleanPhone);
    if (result.success) {
      setOtp('');
      setStep('otp');
      sendRealWhatsAppOtp(cleanPhone, result.code, lang).catch(() => {});
    } else {
      setError(result.error);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const result = verifyOtp(phone, otp);
    if (result.success) {
      setError('');
      onClose();
    } else {
      setError(result.error || (lang === 'hi' ? 'गलत ओटीपी। कृपया पुनः प्रयास करें' : 'Invalid OTP. Please check the code.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <Phone className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-stone-900">
            {lang === 'hi' ? 'किसान मोबाइल लॉगिन' : 'Farmer Mobile Login'}
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm">
            {lang === 'hi' 
              ? 'खेत तक मशीनरी मंगाने के लिए अपना मोबाइल नंबर सत्यापित करें' 
              : 'Verify your phone number with instant OTP'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t('enterMobile')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-sm">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  maxLength="10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full pl-20 pr-4 py-3.5 rounded-xl border-2 border-stone-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 font-bold text-stone-900 text-lg outline-none transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>{t('sendOtp')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  {t('enterOtp')}
                </label>
                <span className="text-xs text-stone-500">
                  +91 {phone}
                </span>
              </div>



              <input
                type="text"
                maxLength="4"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full py-3.5 text-center tracking-[0.5em] rounded-xl border-2 border-stone-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 font-black text-stone-900 text-2xl outline-none transition"
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
        )}

      </div>
    </div>
  );
}
