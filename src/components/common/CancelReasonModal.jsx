import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Send,
  Clock,
  CloudRain,
  Wrench,
  DollarSign,
  Edit3
} from 'lucide-react';

const FARMER_REASONS = [
  { id: 'eta', icon: '⏳', textEn: 'Driver is taking too long / ETA too high', textHi: 'ड्राइवर बहुत दूर है / पहुँचने में देर लग रही है' },
  { id: 'weather', icon: '🌧️', textEn: 'Weather changed / Rain expected in field', textHi: 'मौसम बदल गया / बारिश की संभावना है' },
  { id: 'wrong_machine', icon: '🚜', textEn: 'Selected wrong machinery or attachment', textHi: 'गलत मशीन या उपकरण चुन लिया' },
  { id: 'price_area', icon: '💰', textEn: 'Need to change field area or price', textHi: 'खेत का दायरा या किराया बदलना है' },
  { id: 'other', icon: '✏️', textEn: 'Other reason (type below)', textHi: 'अन्य कारण (नीचे लिखें)' }
];

const DRIVER_REASONS = [
  { id: 'breakdown', icon: '⛽', textEn: 'Machinery technical fault / Diesel issue', textHi: 'मशीन में तकनीकी खराबी / डीज़ल की कमी' },
  { id: 'bad_road', icon: '📍', textEn: 'Farm road inaccessible / Narrow path', textHi: 'खेत का रास्ता बहुत संकरा या खराब है' },
  { id: 'busy', icon: '⏳', textEn: 'Delayed at previous farm job', textHi: 'पिछले खेत में काम लंबा खिंच गया' },
  { id: 'emergency', icon: '🚨', textEn: 'Personal emergency / Operator unavailable', textHi: 'व्यक्तिगत आपातकाल / ऑपरेटर अनुपलब्ध' },
  { id: 'other', icon: '✏️', textEn: 'Other reason (type below)', textHi: 'अन्य कारण (नीचे लिखें)' }
];

export default function CancelReasonModal({ isOpen, onClose, onConfirmCancel, role = 'farmer', partnerName }) {
  const { lang } = useLanguage();
  const [selectedReasonId, setSelectedReasonId] = useState('');
  const [customReasonText, setCustomReasonText] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const reasonsList = role === 'driver' ? DRIVER_REASONS : FARMER_REASONS;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedReasonId) {
      setError(lang === 'hi' ? 'कृपया रद्द करने का कारण चुनें' : 'Please select a cancellation reason');
      return;
    }

    let finalReason = '';
    if (selectedReasonId === 'other') {
      if (!customReasonText.trim()) {
        setError(lang === 'hi' ? 'कृपया अपना कारण लिखकर बताएं' : 'Please type your custom reason');
        return;
      }
      finalReason = customReasonText.trim();
    } else {
      const selected = reasonsList.find(r => r.id === selectedReasonId);
      finalReason = lang === 'hi' ? selected.textHi : selected.textEn;
    }

    onConfirmCancel(finalReason);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center text-xl shadow-inner">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">
                {lang === 'hi' ? 'बुकिंग रद्द करने का कारण' : 'Reason for Cancellation'}
              </h3>
              <p className="text-stone-500 text-xs font-semibold">
                {lang === 'hi' ? `यह कारण ${partnerName || 'दूसरे पक्ष'} को सूचित किया जाएगा` : `This reason will be shared directly with ${partnerName || 'the other party'}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* Reason Selection Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase text-stone-600">
              {lang === 'hi' ? 'रद्द करने का मुख्य कारण चुनें:' : 'Select Primary Reason:'}
            </label>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {reasonsList.map(reason => {
                const isSelected = selectedReasonId === reason.id;
                return (
                  <div
                    key={reason.id}
                    onClick={() => {
                      setSelectedReasonId(reason.id);
                      setError('');
                    }}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'border-red-500 bg-red-50/70 shadow-sm'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-xl shrink-0">{reason.icon}</span>
                    <span className="font-bold text-xs text-stone-800 flex-1">
                      {lang === 'hi' ? reason.textHi : reason.textEn}
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-red-600 bg-red-600' : 'border-stone-300'
                    }`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Reason Text Box (Appears when "Other" is chosen) */}
          {selectedReasonId === 'other' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="block text-xs font-black text-stone-700">
                {lang === 'hi' ? 'कृपया विस्तार से कारण लिखें:' : 'Please describe your reason:'}
              </label>
              <textarea
                rows="2"
                required
                value={customReasonText}
                onChange={(e) => setCustomReasonText(e.target.value)}
                placeholder={lang === 'hi' ? 'उदा. बारिश शुरू हो गई है इसलिए आज जुताई नहीं करानी...' : 'e.g. Sudden heavy rain started in our village...'}
                className="w-full p-3 rounded-2xl border-2 border-stone-300 font-medium text-xs text-stone-900 bg-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 resize-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
            >
              {lang === 'hi' ? 'वापस जाएं' : 'Keep Booking'}
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'कारण सहित रद्द करें' : 'Confirm Cancellation'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
