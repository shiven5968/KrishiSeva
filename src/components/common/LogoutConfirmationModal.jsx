import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { LogOut, X, AlertTriangle, ArrowRight } from 'lucide-react';

export default function LogoutConfirmationModal({ isOpen, onClose, onConfirmLogout, userName, userRole }) {
  const { lang } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative space-y-5 text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
          <LogOut className="w-8 h-8 text-red-600 stroke-[2.5]" />
        </div>

        {/* Title & Message */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-black text-stone-900">
            {lang === 'hi' ? 'लॉगआउट करना चाहते हैं?' : 'Do you want to log out?'}
          </h3>
          <p className="text-xs text-stone-500 font-medium leading-relaxed">
            {lang === 'hi'
              ? `क्या आप वाकई ${userName || 'अपने खाते'} से लॉगआउट करना चाहते हैं? दोबारा जुड़ने के लिए मोबाइल नंबर दर्ज करना होगा।`
              : `Are you sure you want to log out of your session (${userName || 'current user'})? You will need your phone number to sign back in.`}
          </p>
        </div>

        {/* Action Buttons: Yes or No */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm transition active:scale-95"
          >
            {lang === 'hi' ? 'नहीं' : 'No, Stay'}
          </button>

          <button
            type="button"
            onClick={onConfirmLogout}
            className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-600/30 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>{lang === 'hi' ? 'हाँ, लॉगआउट करें' : 'Yes, Log Out'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
