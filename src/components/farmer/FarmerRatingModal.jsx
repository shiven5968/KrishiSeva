import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Star, 
  CheckCircle2, 
  Tractor, 
  Zap, 
  ArrowRight,
  IndianRupee,
  Edit2,
  QrCode,
  Banknote,
  Copy,
  Check,
  X
} from 'lucide-react';

const FEEDBACK_TAGS = [
  { id: 'punctual', labelHi: '⚡ समय पर आगमन', labelEn: '⚡ On Time Arrival' },
  { id: 'skilled', labelHi: '🚜 कुशल चालक', labelEn: '🚜 Skilled Driver' },
  { id: 'clean', labelHi: '🌾 सटीक जुताई', labelEn: '🌾 Perfect Tillage' },
  { id: 'fair_price', labelHi: '💰 पारदर्शी दर', labelEn: '💰 Fair & Transparent' },
  { id: 'polite', labelHi: '🤝 विनम्र व्यवहार', labelEn: '🤝 Polite & Helpful' },
  { id: 'safe', labelHi: '🛡️ सुरक्षित कार्य', labelEn: '🛡️ Safe Operation' }
];

export default function FarmerRatingModal({ 
  isOpen, 
  booking, 
  onSubmitRating, 
  onClose 
}) {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(['punctual', 'clean', 'skilled']);
  const [comment, setComment] = useState('');
  const [paidAmount, setPaidAmount] = useState(booking?.estimatedPrice || 0);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'upi'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen || !booking) return null;

  const driver = booking.assignedDriver || {
    name: 'Jagjit Singh (जगजीत सिंह)',
    modelName: 'Mahindra 575 DI (50 HP)',
    vehicleNumber: 'UP-32-KR-7744',
    rating: 4.95,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  };

  const upiHandle = `driver.${driver.vehicleNumber?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'up32kr7744'}@upi`;

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiHandle);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    
    const finalAmount = Number(paidAmount) || booking.estimatedPrice || 0;

    onSubmitRating({
      rating,
      tags: selectedTags,
      comment,
      paymentMethod: paymentMode,
      driverPhone: driver.phone || '9876501234',
      bookingId: booking.id,
      amountPaid: finalAmount
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const getRatingStatus = (stars) => {
    switch (stars) {
      case 5:
        return {
          text: lang === 'hi' ? '🌟 उत्कृष्ट सेवा (5.0)' : '🌟 Outstanding Service (5.0)',
          color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        };
      case 4:
        return {
          text: lang === 'hi' ? '👍 बहुत अच्छा काम (4.0)' : '👍 Great Experience (4.0)',
          color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        };
      case 3:
        return {
          text: lang === 'hi' ? '👌 संतोषजनक कार्य (3.0)' : '👌 Good Experience (3.0)',
          color: 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        };
      case 2:
        return {
          text: lang === 'hi' ? '⚠️ सुधार की आवश्यकता (2.0)' : '⚠️ Average Experience (2.0)',
          color: 'bg-orange-500/10 border-orange-500/30 text-orange-400'
        };
      case 1:
        return {
          text: lang === 'hi' ? '❌ असंतोषजनक सेवा (1.0)' : '❌ Poor Experience (1.0)',
          color: 'bg-red-500/10 border-red-500/30 text-red-400'
        };
      default:
        return {
          text: '5.0 Rating',
          color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        };
    }
  };

  const currentStatus = getRatingStatus(hoverRating || rating);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden relative transition-all duration-300 ${
        isDark 
          ? 'bg-slate-900 border-slate-800 text-white shadow-black/80' 
          : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
      }`}>
        
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header with Close Button */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/90'
        }`}>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'कार्य संपन्न' : 'Job Completed'}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-16 px-6 text-center space-y-4 animate-fade-in flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-3xl shadow-inner animate-bounce">
              ⭐
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-emerald-400">
                {lang === 'hi' ? 'प्रतिक्रिया व भुगतान दर्ज!' : 'Transaction & Feedback Complete!'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {lang === 'hi' 
                  ? `आपकी प्रतिक्रिया व ₹${paidAmount} का भुगतान सुरक्षित रूप से दर्ज कर लिया गया है।` 
                  : `Your review and payout of ₹${paidAmount} have been securely processed.`}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Scrollable Modal Body */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-700 flex-1">
              
              {/* Driver & Due Fare Card */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl font-bold shrink-0">
                    🚜
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-xs sm:text-sm truncate">{driver.name}</h4>
                    <p className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {driver.modelName} • <span className="font-mono text-emerald-400">{driver.vehicleNumber}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {lang === 'hi' ? 'देय राशि' : 'Fare Due'}
                  </span>
                  {isEditingAmount ? (
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <span className="text-emerald-400 font-black text-xs">₹</span>
                      <input
                        type="number"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        className="w-16 px-1 py-0.5 rounded bg-slate-900 border border-emerald-500 text-white font-black text-xs text-right outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditingAmount(false)}
                        className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-black"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-base font-black text-emerald-400">
                        ₹{paidAmount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingAmount(true)}
                        className="p-1 text-slate-500 hover:text-emerald-400 transition"
                        title="Edit Amount"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Payment Mode: Sleek Segmented Pill Control */}
              <div className="space-y-3">
                <span className={`text-xs font-black uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  💳 {lang === 'hi' ? 'भुगतान का तरीका' : 'Select Payment Mode'}
                </span>

                <div className={`p-1.5 rounded-2xl border flex items-center gap-1.5 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('cash')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
                      paymentMode === 'cash'
                        ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 shadow-sm'
                        : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'hi' ? 'नकद (Cash)' : 'Cash to Driver'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('upi')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
                      paymentMode === 'upi'
                        ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 shadow-sm'
                        : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'hi' ? 'ऑनलाइन QR' : 'UPI / Online QR'}</span>
                  </button>
                </div>

                {/* QR Code Inside Rounded White Card */}
                {paymentMode === 'upi' && (
                  <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-3 animate-fade-in ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[11px] font-bold text-slate-400">
                      {lang === 'hi' ? `चालक को ₹${paidAmount} का UPI भुगतान करें:` : `Pay ₹${paidAmount} directly to Driver UPI:`}
                    </span>

                    <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center w-36 h-36">
                      <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        {/* QR Corner markers */}
                        {/* Top-Left */}
                        <rect x="10" y="10" width="50" height="50" rx="4" fill="none" stroke="#1e293b" strokeWidth="6"/>
                        <rect x="22" y="22" width="26" height="26" rx="2" fill="#1e293b"/>
                        
                        {/* Top-Right */}
                        <rect x="140" y="10" width="50" height="50" rx="4" fill="none" stroke="#1e293b" strokeWidth="6"/>
                        <rect x="152" y="22" width="26" height="26" rx="2" fill="#1e293b"/>
                        
                        {/* Bottom-Left */}
                        <rect x="10" y="140" width="50" height="50" rx="4" fill="none" stroke="#1e293b" strokeWidth="6"/>
                        <rect x="22" y="152" width="26" height="26" rx="2" fill="#1e293b"/>
                        
                        {/* Detailed Data Grid Modules */}
                        {Array.from({ length: 15 }).map((_, colIndex) => {
                          const x = 15 + colIndex * 12;
                          return Array.from({ length: 15 }).map((_, rowIndex) => {
                            const y = 15 + rowIndex * 12;
                            // Skip corner patterns
                            if (x < 70 && y < 70) return null;
                            if (x > 130 && y < 70) return null;
                            if (x < 70 && y > 130) return null;
                            // Skip center logo area
                            if (x > 65 && x < 135 && y > 65 && y < 135) return null;
                            
                            // Deterministic module placement
                            const hash = (colIndex * 9 + rowIndex * 17) % 10;
                            if (hash < 6) {
                              return (
                                <rect 
                                  key={`${colIndex}-${rowIndex}`} 
                                  x={x} 
                                  y={y} 
                                  width="9" 
                                  height="9" 
                                  rx="1.5" 
                                  fill="#1e293b" 
                                />
                              );
                            }
                            return null;
                          });
                        })}
                        
                        {/* Center UPI logo area */}
                        <rect x="75" y="75" width="50" height="50" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="2"/>
                        <text x="100" y="105" textAnchor="middle" fontSize="18" fontWeight="black" fill="#059669">UPI</text>
                      </svg>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-emerald-400 text-xs font-mono font-bold transition active:scale-95"
                      title="Click to Copy UPI ID"
                    >
                      <span>{upiHandle}</span>
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Overhauled Star Rating UI */}
              <div className={`text-center space-y-3 p-4 rounded-2xl border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                {/* Dynamic Top Rating Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>⭐ {(hoverRating || rating).toFixed(1)} / 5.0 Rating</span>
                </div>

                {/* 5 Large Interactive Stars */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none"
                      >
                        <Star 
                          className={`w-9 h-9 sm:w-10 sm:h-10 transition-all duration-150 ${
                            active 
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]' 
                              : isDark ? 'text-slate-700 hover:text-slate-500' : 'text-slate-300 hover:text-slate-400'
                          }`} 
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Single Clean Status Pill Below Stars */}
                <div className="flex items-center justify-center">
                  <span className={`text-xs font-black tracking-wide px-3 py-0.5 rounded-lg border transition-colors ${currentStatus.color}`}>
                    {currentStatus.text}
                  </span>
                </div>
              </div>

              {/* 4. Refined Feedback Feature Tags */}
              <div className="space-y-2.5">
                <label className={`block text-xs font-black uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {lang === 'hi' ? 'सेवा के बारे में क्या पसंद आया?' : 'WHAT DID YOU LIKE ABOUT THE SERVICE?'}
                </label>

                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-medium border transition-all duration-150 active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-sm'
                            : isDark
                            ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {lang === 'hi' ? tag.labelHi : tag.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Comment */}
              <div className="space-y-1.5">
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={lang === 'hi' ? 'अतिरिक्त टिप्पणी लिखें (वैकल्पिक)...' : 'Add optional feedback note...'}
                  className={`w-full p-3 rounded-2xl border text-xs outline-none transition resize-none ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>

            </div>

            {/* 5. Sticky Primary CTA Button at Bottom */}
            <div className={`p-4 border-t shrink-0 ${
              isDark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-100 bg-white/95'
            }`}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/10 active:scale-95 transition flex items-center justify-center gap-2 text-sm disabled:opacity-70"
              >
                <span>
                  {lang === 'hi' 
                    ? `पूर्ण लेनदेन व रेटिंग दर्ज करें • ₹${paidAmount}` 
                    : `Complete Transaction • ₹${paidAmount}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
