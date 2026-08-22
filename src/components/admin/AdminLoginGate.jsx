import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, ArrowRight, KeyRound, AlertCircle, UserCheck, ArrowLeft } from 'lucide-react';

export default function AdminLoginGate({ onAdminLoginSuccess }) {
  const { lang } = useLanguage();
  const { quickDemoLogin, setActiveRole } = useAuth();

  const [userId, setUserId] = useState('admin_krishi');
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');

  const handleAdminAuth = (e) => {
    e.preventDefault();
    const validIds = ['admin', 'admin_krishi', 'admin@krishiseva.gov.in', 'superadmin', '9999999999'];
    const validPasskeys = ['9999', 'krishi@2026', 'admin123', 'passkey2026'];

    const isValidId = validIds.some(id => id.toLowerCase() === userId.trim().toLowerCase());
    const isValidPass = validPasskeys.includes(passkey.trim());

    if ((isValidId && isValidPass) || passkey === '9999') {
      quickDemoLogin('admin');
      setError('');
      if (onAdminLoginSuccess) onAdminLoginSuccess();
    } else {
      setError(
        lang === 'hi' 
          ? 'अमान्य यूजर आईडी या पासकी। डेमो: User ID: admin_krishi, Passkey: 9999' 
          : 'Invalid Admin User ID or Passkey. (Demo: User ID: admin_krishi | Passkey: 9999)'
      );
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-purple-500 selection:text-white">
      
      {/* Subtle Purple Security Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.2),rgba(24,24,27,0))] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293718_1px,transparent_1px),linear-gradient(to_bottom,#1f293718_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Return to Public Home */}
      <div className="absolute top-6 left-6 z-10">
        <button
          type="button"
          onClick={() => {
            window.location.hash = '';
            setActiveRole('landing');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-900/90 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-bold transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400" />
          <span>{lang === 'hi' ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Back to KrishiSeva'}</span>
        </button>
      </div>

      <div className="bg-stone-900/90 backdrop-blur-2xl rounded-3xl max-w-md w-full p-8 sm:p-9 shadow-2xl border border-purple-900/40 text-center space-y-6 relative z-10">
        
        {/* Security Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-800 text-purple-400 flex items-center justify-center mx-auto shadow-inner ring-2 ring-purple-500/20">
          <Lock className="w-8 h-8 text-purple-400" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-950 px-3 py-1 rounded-full border border-purple-800">
            🔒 Restricted Access Portal
          </span>
          <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
            {lang === 'hi' ? 'प्रशासक सत्यापन (Admin Portal)' : 'Super Admin Authorization'}
          </h2>
          <p className="text-xs text-stone-400">
            {lang === 'hi' 
              ? 'प्रणाली और चालक केवाईसी सत्यापन हेतु अधिकृत क्रेडेंशियल्स दर्ज करें' 
              : 'Enter authorized Administrative User ID and Master Passkey'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminAuth} className="space-y-4 text-left">
          
          {/* User ID Input */}
          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
              Admin User ID
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-black text-xs">
                👤
              </span>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. admin_krishi"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-700 bg-stone-950 text-white font-bold text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
                required
              />
            </div>
          </div>

          {/* Passkey Input */}
          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
              Master Passkey / PIN
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-black text-xs">
                🔑
              </span>
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter Passkey (PIN: 9999)"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-700 bg-stone-950 text-white font-black text-sm tracking-widest focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-xl shadow-purple-950 transition flex items-center justify-center gap-2 active:scale-98"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>{lang === 'hi' ? 'पोर्टल अनलॉक करें' : 'Unlock Super Admin Portal'}</span>
          </button>
        </form>

        <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800 text-stone-400 text-xs font-medium space-y-1">
          <div className="flex justify-between text-[11px]">
            <span>Demo User ID:</span>
            <span className="font-bold text-purple-300">admin_krishi</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Demo Passkey:</span>
            <span className="font-bold text-purple-300">9999</span>
          </div>
        </div>

      </div>

    </div>
  );
}
