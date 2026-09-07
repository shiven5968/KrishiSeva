import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw, 
  Check, 
  MessageSquareQuote
} from 'lucide-react';

export default function CancellationAlertModal({ isOpen, onClose, alertData }) {
  const { lang } = useLanguage();

  if (!isOpen || !alertData) return null;

  const isCancelledByFarmer = alertData.cancelledByRole === 'farmer';
  const roleTitle = isCancelledByFarmer ? (lang === 'hi' ? 'किसान (Farmer)' : 'Farmer') : (lang === 'hi' ? 'ड्राइवर (Operator)' : 'Driver');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-red-500 relative space-y-5 text-center">
        
        {/* Big Icon */}
        <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
          ❌
        </div>

        {/* Title */}
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-100 px-3 py-0.5 rounded-full border border-red-300">
            {lang === 'hi' ? `${roleTitle} द्वारा बुकिंग रद्द` : `Booking Cancelled by ${roleTitle}`}
          </span>
          <h3 className="text-xl font-black text-stone-900 mt-2">
            {alertData.cancelledByName || roleTitle} {lang === 'hi' ? 'ने बुकिंग रद्द कर दी है' : 'has cancelled the request'}
          </h3>
        </div>

        {/* Cancellation Reason Box */}
        <div className="p-4 rounded-2xl bg-stone-50 border-2 border-dashed border-red-300 text-left space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-red-900">
            <MessageSquareQuote className="w-4 h-4 text-red-600 shrink-0" />
            <span>{lang === 'hi' ? 'रद्द करने का कारण (Reason Given):' : 'Reason Given by Partner:'}</span>
          </div>
          <p className="text-sm font-black text-stone-900 bg-white p-3 rounded-xl border border-stone-200 shadow-sm leading-relaxed">
            "{alertData.reason || (lang === 'hi' ? 'कोई कारण नहीं दिया गया' : 'No specific reason provided')}"
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-stone-800 text-white font-black text-xs sm:text-sm shadow-xl transition active:scale-98 flex items-center justify-center gap-2"
        >
          <span>{lang === 'hi' ? 'समझ गया (Dismiss & Continue)' : 'Dismiss & Return to Dashboard'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
