import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Trash2, 
  ShieldAlert, 
  X, 
  RefreshCw,
  Database
} from 'lucide-react';

export default function DeleteAccountModal({ isOpen, onClose }) {
  const { lang } = useLanguage();
  const { isDark } = useTheme();
  const { currentUser, deleteAccount } = useAuth();

  const [confirmed, setConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      deleteAccount(currentUser.phone);
      setIsDeleting(false);
      setIsDeleted(true);
      setTimeout(() => {
        setIsDeleted(false);
        setConfirmed(false);
        onClose();
      }, 1800);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className={`rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border relative overflow-hidden transition-all duration-300 ${
        isDark 
          ? 'bg-white dark:bg-slate-900 border-red-500/40 text-white shadow-red-950/50' 
          : 'bg-white border-red-200 text-slate-900 shadow-2xl shadow-red-500/10'
      }`}>
        
        {/* Ambient Red Warning Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        {!isDeleting && !isDeleted && (
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-xl transition ${
              isDark ? 'text-slate-500 dark:text-slate-400 hover:text-white hover:bg-stone-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {isDeleted ? (
          <div className="py-8 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-3xl shadow-inner animate-bounce">
              🗑️
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-red-400">
                {lang === 'hi' ? 'खाता सफलतापूर्वक हटा दिया गया' : 'Account Permanently Deleted'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600'}`}>
                {lang === 'hi' 
                  ? 'आपका सारा डेटा डेटाबेस से हमेशा के लिए हटा दिया गया है। अगली बार लॉगिन करने पर आप नए किसान के रूप में शुरुआत करेंगे।' 
                  : 'All your data has been purged from our database. Re-registering in the future will start as a brand new user.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Header */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-400 flex items-center justify-center shrink-0 shadow-lg shadow-red-950/50">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-red-400 flex items-center gap-1.5">
                  <span>{lang === 'hi' ? 'खाता स्थायी रूप से हटाएं?' : 'Delete Account Permanently?'}</span>
                </h3>
                <p className={`text-xs font-bold mt-0.5 ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                  {currentUser.name} • <span className="font-mono text-slate-700 dark:text-slate-300">{currentUser.phone}</span>
                </p>
              </div>
            </div>

            {/* Warning Points */}
            <div className={`p-4 rounded-2xl border space-y-3 text-xs ${
              isDark ? 'bg-stone-950/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300' : 'bg-red-50/70 border-red-200 text-slate-800'
            }`}>
              <div className="flex items-start gap-2.5">
                <Database className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {lang === 'hi'
                    ? 'डेटाबेस से आपके सहेजे गए खेत, खतौनी भूलेख विवरण व बुकिंग इतिहास हमेशा के लिए मिट जाएंगे।'
                    : 'All your saved farm plots, Bhulekh land records, and booking invoices will be wiped from our database.'}
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-bold text-amber-400">
                  {lang === 'hi'
                    ? 'यदि आप पुनः इस मोबाइल नंबर से जुड़ेंगे, तो आपको एकदम नए किसान के रूप में शुरुआत करनी होगी।'
                    : 'If you register again with this mobile number in the future, you will start completely fresh from scratch.'}
                </p>
              </div>
            </div>

            {/* Checkbox Confirmation */}
            <label className="flex items-center gap-3 cursor-pointer select-none p-2.5 rounded-xl hover:bg-white/5 transition">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-4 h-4 text-red-500 rounded border-stone-700 focus:ring-red-500 shrink-0 cursor-pointer"
              />
              <span className={`text-xs font-bold ${isDark ? 'text-slate-700 dark:text-slate-300' : 'text-slate-700'}`}>
                {lang === 'hi' 
                  ? 'हाँ, मैं समझता हूँ कि यह डेटाबेस से हमेशा के लिए हट जाएगा।' 
                  : 'Yes, I understand that this will be permanently erased.'}
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className={`w-1/2 py-3 rounded-xl border text-xs font-bold transition active:scale-95 ${
                  isDark ? 'border-stone-700 text-slate-700 dark:text-slate-300 hover:bg-stone-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={!confirmed || isDeleting}
                className="w-1/2 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                {isDeleting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{lang === 'hi' ? 'खाता हटाएं' : 'Delete Account'}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
