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
    <div className={`min-h-screen flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden selection:bg-emerald-500 selection:text-stone-950 transition-colors duration-200 ${
      isDark ? 'bg-[#090D0B] text-stone-100' : 'bg-slate-900 text-slate-100'
    }`}>
      
      {/* ───── Signature Obsidian & Emerald Ambient Tech Background ───── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.22),rgba(9,13,11,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Subtle bottom emerald glow */}
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navbar Back & Tools */}
      <div className="w-full max-w-5xl flex items-center justify-between relative z-10">
        <button
          onClick={() => setActiveRole('farmer')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/50 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition hover:bg-emerald-950/40 backdrop-blur-xl group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{lang === 'hi' ? '← मुख्य पोर्टल पर लौटें' : '← Back to App'}</span>
        </button>

        <div className="flex items-center gap-2.5">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="px-3 py-2 rounded-2xl bg-black/50 border border-emerald-500/20 text-stone-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-xl"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 rounded-2xl bg-black/50 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-xl"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
          </button>
        </div>
      </div>

      {/* ═══════════ HD FROSTED GLASS LOGIN CARD ═══════════ */}
      <div className="my-auto max-w-md w-full relative z-10 animate-fade-in">
        
        <div className="backdrop-blur-3xl bg-black/60 border border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.12)] rounded-3xl p-8 sm:p-9 text-center space-y-6 relative overflow-hidden">
          
          {/* Security Badge with Pulsing Beacon */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-black tracking-wider text-emerald-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>🔒 RESTRICTED COMMAND PORTAL • LEVEL 3 AUTH</span>
          </div>

          {/* Super Admin Emblem Logo and Titles */}
          <div className="space-y-3">
            <div className="relative w-18 h-18 mx-auto flex items-center justify-center group">
              {/* Outer ambient pulsing glow */}
              <div className="absolute inset-0 bg-emerald-500/25 rounded-3xl blur-xl group-hover:bg-emerald-500/40 transition-all duration-500 animate-pulse" />
              
              {/* Main emblem squircle container */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-950 via-stone-900 to-[#0A0E13] border-2 border-emerald-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.25)] ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-300">
                {/* Admin Shield Icon */}
                <ShieldCheck className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)] stroke-[2.2]" />
                
                {/* Crown / Authority Badge in Top Corner */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Crown className="w-3.5 h-3.5 text-stone-950 fill-stone-950 stroke-[2.5]" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {lang === 'hi' ? 'सुपर एडमिन कमांड सेंटर' : 'Super Admin Command'}
              </h2>
              <p className="text-xs text-stone-400 font-medium max-w-xs mx-auto mt-1">
                {lang === 'hi' 
                  ? 'कृषि फ्लीट टेलीमेट्री, ड्राइवर केवाईसी व प्लेटफॉर्म दर प्रबंधन' 
                  : 'Enterprise Fleet Telemetry, Driver KYC Audit & Dynamic Pricing Engine'}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/85 border border-red-800/60 text-red-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4 text-left">
            
            {/* User ID Input */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                {lang === 'hi' ? 'प्रशासक आईडी (Admin User ID)' : 'Admin User ID'}
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-emerald-400 transition-colors">
                  <User className="w-4 h-4 text-emerald-500" />
                </span>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="admin_krishi"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-stone-800 bg-[#111827] text-white font-bold text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all duration-200 shadow-inner"
                  required
                />
              </div>
            </div>

            {/* Passkey Input */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                {lang === 'hi' ? 'मास्टर पासकी / पिन' : 'Master Passkey / PIN'}
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-emerald-400 transition-colors">
                  <KeyRound className="w-4 h-4 text-emerald-500" />
                </span>
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-stone-800 bg-[#111827] text-white font-black text-base tracking-[0.3em] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all duration-200 shadow-inner"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] hover:-translate-y-0.5"
            >
              <ShieldCheck className="w-4 h-4 text-stone-950" />
              <span>{lang === 'hi' ? 'सुपर एडमिन कमांड अनलॉक करें →' : 'Unlock Super Admin Command →'}</span>
            </button>
          </form>



        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-stone-500 pb-2">
        <span>© 2026 KrishiSeva Enterprise Command</span>
      </div>

    </div>
  );
}
