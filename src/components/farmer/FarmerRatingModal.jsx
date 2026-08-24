import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Star, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Tractor, 
  ThumbsUp, 
  Zap, 
  Award,
  Heart,
  ArrowRight,
  IndianRupee,
  MessageSquare
} from 'lucide-react';

const FEEDBACK_TAGS = [
  { id: 'punctual', labelHi: '⚡ समय पर आगमन (On Time)', labelEn: '⚡ On Time Arrival' },
  { id: 'skilled', labelHi: '🚜 कुशल चालक (Skilled Work)', labelEn: '🚜 Skilled Driver' },
  { id: 'clean', labelHi: '🌾 सटीक व गहरी जुताई (Perfect Tillage)', labelEn: '🌾 Perfect Tillage' },
  { id: 'fair_price', labelHi: '💰 पारदर्शी व उचित दर (Fair Price)', labelEn: '💰 Fair & Transparent' },
  { id: 'polite', labelHi: '🤝 विनम्र व्यवहार (Polite & Helpful)', labelEn: '🤝 Polite & Helpful' },
  { id: 'safe', labelHi: '🛡️ सुरक्षित संचालन (Safe Operation)', labelEn: '🛡️ Safe Operation' }
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !booking) return null;

  const driver = booking.assignedDriver || {
    name: 'Jagjit Singh (जगजीत सिंह)',
    modelName: 'Mahindra 575 DI (50 HP)',
    vehicleNumber: 'UP-32-KR-7744',
    rating: 4.95,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  };

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Call parent submit handler
    onSubmitRating({
      rating,
      tags: selectedTags,
      comment,
      driverPhone: driver.phone || '9876501234',
      bookingId: booking.id,
      amountPaid: booking.estimatedPrice || 0
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1600);
  };

  const getRatingLabel = (stars) => {
    switch (stars) {
      case 5:
        return lang === 'hi' ? '🌟 उत्कृष्ट अनुभव! (Outstanding Service)' : '🌟 Outstanding Service (5.0)';
      case 4:
        return lang === 'hi' ? '👍 बहुत अच्छा काम (Very Good)' : '👍 Very Good Service (4.0)';
      case 3:
        return lang === 'hi' ? '👌 संतोषजनक कार्य (Good)' : '👌 Satisfactory Work (3.0)';
      case 2:
        return lang === 'hi' ? '⚠️ सुधार की आवश्यकता (Needs Improvement)' : '⚠️ Needs Improvement (2.0)';
      case 1:
        return lang === 'hi' ? '❌ असंतोषजनक सेवा (Poor Experience)' : '❌ Poor Experience (1.0)';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border relative overflow-hidden transition-all duration-300 ${
        isDark 
          ? 'bg-[#0F1713] border-emerald-500/30 text-white shadow-emerald-950/40' 
          : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
      }`}>
        
        {/* Subtle Ambient Glow Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {submitted ? (
          <div className="py-12 text-center space-y-4 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-4xl shadow-inner animate-bounce">
              ⭐
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-emerald-400">
                {lang === 'hi' ? 'रेटिंग सफलतापूर्वक दर्ज की गई!' : 'Rating Successfully Submitted!'}
              </h3>
              <p className={`text-xs font-medium ${isDark ? 'text-stone-300' : 'text-slate-600'}`}>
                {lang === 'hi' 
                  ? `चालक के पोर्टल में ${rating}/5 रेटिंग व ₹${booking.estimatedPrice} का भुगतान तुरंत अपडेट कर दिया गया है।` 
                  : `Driver rating (${rating}/5) & payout (₹${booking.estimatedPrice}) have been updated in driver cockpit.`}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            {/* Header: Job Completion Badge & Driver Card */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'खेत कार्य सफलतापूर्वक संपन्न' : 'Farm Tillage Completed'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {lang === 'hi' ? 'चालक पार्टनर को रेटिंग दें' : 'Rate Your Driver Partner'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                {lang === 'hi' ? 'आपकी रेटिंग से ऑपरेटर की गुणवत्ता व सेवा में सुधार होता है।' : 'Your feedback helps maintain high fleet quality across KrishiSeva.'}
              </p>
            </div>

            {/* Driver Identity Card & Completed Amount */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              isDark ? 'bg-stone-950/80 border-stone-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-2xl font-bold">
                  🚜
                </div>
                <div>
                  <h4 className="font-black text-sm">{driver.name}</h4>
                  <p className={`text-xs font-bold ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                    {driver.modelName} • <span className="font-mono text-emerald-400">{driver.vehicleNumber}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                  {lang === 'hi' ? 'कुल भुगतान' : 'Paid Fare'}
                </span>
                <span className="text-base font-black text-emerald-400">
                  ₹{booking.estimatedPrice}
                </span>
              </div>
            </div>

            {/* Interactive 5-Star Rating Selector */}
            <div className={`text-center space-y-3 p-4 rounded-2xl border ${
              isDark ? 'bg-stone-950/60 border-stone-800' : 'bg-slate-50 border-slate-200'
            }`}>
              
              {/* Score Pill Display */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-black">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{hoverRating || rating}.0 / 5.0 {lang === 'hi' ? 'स्टार' : 'Stars'}</span>
              </div>

              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1.5 transition-all duration-200 hover:scale-125 active:scale-95 focus:outline-none flex flex-col items-center gap-1"
                    >
                      <Star 
                        className={`w-9 h-9 sm:w-10 sm:h-10 transition-all duration-150 ${
                          active 
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-110' 
                            : isDark ? 'text-stone-700 hover:text-stone-500' : 'text-slate-300 hover:text-slate-400'
                        }`} 
                      />
                      <span className={`text-[10px] font-black ${
                        active ? 'text-amber-400' : isDark ? 'text-stone-600' : 'text-slate-400'
                      }`}>
                        {star}★
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Rating Feedback Text */}
              <div className="h-6 flex items-center justify-center">
                <span className="text-xs font-black text-amber-400 tracking-wide animate-fade-in bg-amber-500/10 px-3 py-0.5 rounded-lg border border-amber-500/20">
                  {getRatingLabel(hoverRating || rating)}
                </span>
              </div>
            </div>

            {/* Quick Complement Feedback Tags */}
            <div className="space-y-2">
              <label className={`block text-[11px] font-black uppercase tracking-wider ${
                isDark ? 'text-stone-400' : 'text-slate-500'
              }`}>
                {lang === 'hi' ? 'चालक की क्या खूबी पसंद आई?' : 'What did you like about the service?'}
              </label>

              <div className="flex flex-wrap gap-2">
                {FEEDBACK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 active:scale-95 ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                          : isDark
                          ? 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {lang === 'hi' ? tag.labelHi : tag.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Comment Input */}
            <div className="space-y-1.5">
              <label className={`block text-[11px] font-black uppercase tracking-wider ${
                isDark ? 'text-stone-400' : 'text-slate-500'
              }`}>
                {lang === 'hi' ? 'अतिरिक्त टिप्पणी (वैकल्पिक)' : 'Add Optional Comment'}
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={lang === 'hi' ? 'उदा. बहुत बढ़िया जुताई की, समय से पहले कार्य पूरा किया...' : 'e.g. Very fast and precise rotavator tilling...'}
                className={`w-full p-3 rounded-2xl border text-xs outline-none transition resize-none ${
                  isDark 
                    ? 'bg-stone-950 border-stone-800 text-white focus:border-emerald-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                }`}
              />
            </div>

            {/* Submit Rating Action Button */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
              >
                <Star className="w-4 h-4 fill-stone-950" />
                <span>{lang === 'hi' ? `रेटिंग दर्ज करें (${rating} / 5 ⭐)` : `Submit Rating (${rating} / 5 ⭐)`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className={`w-full py-2 text-center text-xs font-bold transition ${
                  isDark ? 'text-stone-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'hi' ? 'अभी छोड़ें (Skip for now)' : 'Skip for now'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
