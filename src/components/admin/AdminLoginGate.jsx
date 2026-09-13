import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Shield,
  Crown,
  Lock, 
  ArrowRight, 
  KeyRound, 
  AlertCircle, 
  User, 
  ArrowLeft,
  Zap,
  Sun,
  Moon,
  Globe
} from 'lucide-react';

export default function AdminLoginGate({ onAdminLoginSuccess }) {
  const { lang, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { quickDemoLogin, setActiveRole } = useAuth();

  const [userId, setUserId] = useState('admin_krishi');
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');

  const handleAdminAuth = (e) => {
    e?.preventDefault();
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
          ? 'अमान्य यूजर आईडी या पासकी।' 
          : 'Invalid Admin User ID or Passkey.'
      );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#1A4F32] selection:text-white transition-colors duration-500 ${
      isDark ? 'bg-[#080E0B] text-[#EAEFEA]' : 'bg-[#FDFBF7] text-[#0B1E14]'
    }`}>
      
      {/* Top Navbar Back & Tools */}
      <div className="w-full max-w-5xl flex items-center justify-between relative z-10">
        <button
          onClick={() => setActiveRole('farmer')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.08] text-[#0B1E14] dark:text-[#EAEFEA] hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold transition-all duration-300 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{lang === 'hi' ? '← मुख्य पोर्टल पर लौटें' : '← Back to App'}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#0B1E14] dark:text-[#EAEFEA] text-xs font-semibold transition-all duration-300 cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#1A4F32]" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#0B1E14] dark:text-[#EAEFEA] text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#1A4F32] dark:text-[#4ADE80]" />
            <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
          </button>
        </div>
      </div>

      {/* ═══════════ ORGANIC MINIMALIST LOGIN CARD ═══════════ */}
      <div className="my-auto max-w-md w-full relative z-10 animate-fade-in-up">
        
        <div className="backdrop-blur-xl bg-white/90 dark:bg-[#0D1611]/90 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(11,30,20,0.12)] rounded-3xl p-8 sm:p-9 text-center space-y-6 relative overflow-hidden">
          
          {/* Security Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/5 text-[10px] font-semibold tracking-wider text-[#4F6358] dark:text-[#9FB1A7]">
            <span className="w-2 h-2 rounded-full bg-[#1A4F32] dark:bg-[#4ADE80] animate-pulse" />
            <span>RESTRICTED COMMAND PORTAL • LEVEL 3 AUTH</span>
          </div>

          {/* Super Admin Emblem Logo and Titles */}
          <div className="space-y-3">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#1A4F32]/10 dark:bg-[#4ADE80]/15 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-[#1A4F32] dark:text-[#4ADE80]" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight font-display">
                {lang === 'hi' ? 'सुपर एडमिन कमांड सेंटर' : 'Super Admin Command'}
              </h2>
              <p className="text-xs text-[#4F6358] dark:text-[#9FB1A7] font-light max-w-xs mx-auto mt-1 tracking-wide">
                {lang === 'hi' 
                  ? 'कृषि फ्लीट टेलीमेट्री, ड्राइवर केवाईसी व प्लेटफॉर्म दर प्रबंधन' 
                  : 'Enterprise Fleet Telemetry, Driver KYC Audit & Dynamic Pricing Engine'}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/85 border border-red-800/60 text-red-300 text-xs font-semibold text-center flex items-center justify-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4 text-left">
            
            {/* User ID Input */}
            <div>
              <label className="block text-xs font-semibold text-[#0B1E14] dark:text-[#EAEFEA] tracking-wide mb-2">
                {lang === 'hi' ? 'प्रशासक आईडी (Admin User ID)' : 'Admin User ID'}
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6358]">
                  <User className="w-4 h-4 text-[#1A4F32] dark:text-[#4ADE80]" />
                </span>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="admin_krishi"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-[#0B1E14] dark:text-[#EAEFEA] font-medium text-sm focus:border-[#1A4F32] focus:ring-1 focus:ring-[#1A4F32]/20 outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Passkey Input */}
            <div>
              <label className="block text-xs font-semibold text-[#0B1E14] dark:text-[#EAEFEA] tracking-wide mb-2">
                {lang === 'hi' ? 'मास्टर पासकी / पिन' : 'Master Passkey / PIN'}
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6358]">
                  <KeyRound className="w-4 h-4 text-[#1A4F32] dark:text-[#4ADE80]" />
                </span>
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-[#0B1E14] dark:text-[#EAEFEA] font-bold text-base tracking-[0.3em] focus:border-[#1A4F32] focus:ring-1 focus:ring-[#1A4F32]/20 outline-none transition-all duration-200"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-full bg-[#0B1E14] hover:bg-[#153424] dark:bg-[#EAEFEA] dark:hover:bg-white text-white dark:text-[#0B1E14] font-medium text-sm shadow-[0_8px_30px_rgb(11,30,20,0.12)] hover:shadow-[0_8px_30px_rgb(11,30,20,0.2)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center gap-2 active:scale-[0.98] hover:-translate-y-0.5 tracking-wide cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'hi' ? 'सुपर एडमिन कमांड अनलॉक करें →' : 'Unlock Super Admin Command →'}</span>
            </button>
          </form>

        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-[#4F6358] dark:text-[#9FB1A7] pb-2 font-light">
        <span>© 2026 KrishiSeva Enterprise Command</span>
      </div>

    </div>
  );
}
