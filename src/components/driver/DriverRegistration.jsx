import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeSync } from '../../context/RealtimeSyncContext';
import { MACHINERY_CATEGORIES } from '../../types/machinery';
import { 
  Truck, 
  Upload, 
  Camera, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  ArrowRight,
  Info,
  Sparkles,
  User,
  Zap,
  Check,
  Tractor
} from 'lucide-react';

const POPULAR_MACHINE_MODELS = [
  'Mahindra 575 DI (50 HP)',
  'John Deere 5310 (55 HP)',
  'Sonalika Tiger 55 (55 HP)',
  'Kubota MU4501 (45 HP)',
  'Preet 987 Combine (110 HP)',
  'DJI Agras T40 Drone (40L)'
];

const SAMPLE_DL_PHOTOS = [
  'https://images.unsplash.com/photo-1554774853-719586f82d77?w=600&q=80',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80'
];

const SAMPLE_PLATE_PHOTOS = [
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=80',
  'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&q=80'
];

export default function DriverRegistration() {
  const { lang, t } = useLanguage();
  const { currentUser, driverProfile, registerDriverKyc } = useAuth();
  const { submitDriverKycRealtime } = useRealtimeSync();

  const displayName = currentUser?.name || driverProfile?.fullName || 'Jagjit Singh (जगजीत सिंह)';
  const displayPhone = currentUser?.phone || driverProfile?.phone || '9876501234';

  const [formData, setFormData] = useState({
    vehicleType: driverProfile?.vehicleType && driverProfile.vehicleType !== 'tractor' ? driverProfile.vehicleType : 'tractor',
    modelName: driverProfile?.modelName && driverProfile.modelName !== 'Tractor (50 HP)' ? driverProfile.modelName : 'Mahindra 575 DI (50 HP)',
    vehicleNumber: driverProfile?.vehicleNumber || 'UP-32-KR-7744',
    implement: driverProfile?.implement || 'Rotavator (6 Feet)',
    dlPhoto: driverProfile?.dlImage || SAMPLE_DL_PHOTOS[0],
    platePhoto: driverProfile?.plateImage || SAMPLE_PLATE_PHOTOS[0]
  });

  const [dlPreview, setDlPreview] = useState(formData.dlPhoto);
  const [platePreview, setPlatePreview] = useState(formData.platePhoto);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDlUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setDlPreview(url);
      setFormData(prev => ({ ...prev, dlPhoto: url }));
    }
  };

  const handlePlateUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPlatePreview(url);
      setFormData(prev => ({ ...prev, platePhoto: url }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submission = {
      driverName: displayName,
      fullName: displayName,
      phone: displayPhone,
      vehicleType: formData.vehicleType,
      modelName: formData.modelName,
      vehicleNumber: formData.vehicleNumber.toUpperCase(),
      implement: formData.implement,
      hourlyRate: 1000,
      acreRate: 1300,
      dlPhoto: dlPreview,
      dlImage: dlPreview,
      platePhoto: platePreview,
      plateImage: platePreview,
      isDriverOnboarded: true,
      verificationStatus: 'verified',
      status: 'online'
    };

    setTimeout(() => {
      setIsSubmitting(false);
      // Update local driver auth status to verified & active
      registerDriverKyc(submission);
      // Instantly trigger real-time BroadcastChannel event to Admin Portal
      submitDriverKycRealtime(submission);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="bg-white/90 dark:bg-[#0D1611]/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-black/[0.08] dark:border-emerald-500/20 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="border-b border-black/[0.06] dark:border-white/[0.08] pb-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'hi' ? 'ड्राइवर व मशीनरी ऑनबोर्डिंग' : 'Driver & Machinery Onboarding'}</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight">
            {lang === 'hi' ? 'मशीनरी एवं फ्लीट पंजीकरण' : 'Fleet Machinery & KYC Registration'}
          </h2>
          <p className="text-xs sm:text-sm text-[#4F6358] dark:text-[#9FB1A7] font-medium">
            {lang === 'hi' 
              ? 'अपनी मशीनरी श्रेणी, आरसी नंबर और आवश्यक दस्तावेज दर्ज कर ऑपरेटर नेटवर्क से तुरंत जुड़ें।' 
              : 'Register your vehicle category, registration plate, and KYC documents to activate operator telemetry.'}
          </p>
        </div>

        {/* 1. Auto-Populated Verified User Profile Banner (Eliminating Redundant Entry) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-xl shrink-0 border border-emerald-500/30">
              👤
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {lang === 'hi' ? 'सत्यापित खाता प्रोफाइल' : 'Verified Profile'}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">✓</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  {displayName}
                </span>
                <span className="text-slate-400 dark:text-stone-500 font-bold">•</span>
                <span className="font-mono font-extrabold text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                  +91 {displayPhone}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white dark:text-stone-950 text-xs font-black shadow-sm">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'hi' ? 'प्रमाणित' : 'Auth Active'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 2. Machinery Category Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-800 dark:text-stone-200 uppercase tracking-wider">
              {lang === 'hi' ? '1. मशीनरी श्रेणी चुनें (Machine Category) *' : '1. Select Machine Category *'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {MACHINERY_CATEGORIES.map(cat => {
                const isSelected = formData.vehicleType === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, vehicleType: cat.id })}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-950 dark:text-white shadow-md ring-2 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-stone-800 bg-slate-50/70 dark:bg-stone-950/60 hover:border-slate-300 dark:hover:border-stone-700 text-slate-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{cat.icon}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center text-xs font-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-extrabold text-xs block truncate">{t(cat.nameKey)}</span>
                      <span className="text-[10px] text-slate-500 dark:text-stone-400 block truncate">
                        ₹{cat.baseRatePerHour}/hr • ₹{cat.baseRatePerBigha}/bigha
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Vehicle Registration Number & Model / Make */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vehicle Number Plate */}
            <div>
              <label className="block text-xs font-black text-slate-800 dark:text-stone-200 uppercase tracking-wider mb-1.5">
                {lang === 'hi' ? '2. वाहन नंबर प्लेट (RC Number) *' : '2. Vehicle Registration Number *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                  placeholder="UP-32-AB-1234"
                  className="w-full pl-4 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-stone-700 font-mono font-black text-base text-slate-900 dark:text-white uppercase bg-slate-50 dark:bg-stone-950 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Model / Make */}
            <div>
              <label className="block text-xs font-black text-slate-800 dark:text-stone-200 uppercase tracking-wider mb-1.5">
                {lang === 'hi' ? '3. मॉडल एवं एचपी रेटिंग (Make & HP) *' : '3. Model & HP Rating *'}
              </label>
              <input
                type="text"
                value={formData.modelName}
                onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                placeholder="e.g. Mahindra 575 DI (50 HP)"
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 dark:border-stone-700 font-bold text-xs sm:text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-stone-950 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                required
              />
            </div>
          </div>

          {/* Quick Model Suggestion Chips */}
          <div className="space-y-1.5 -mt-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{lang === 'hi' ? 'लोकप्रिय मॉडल त्वरित चयन:' : 'Quick Select Benchmark Models:'}</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_MACHINE_MODELS.map(model => (
                <button
                  key={model}
                  type="button"
                  onClick={() => setFormData({ ...formData, modelName: model })}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-stone-900 hover:bg-emerald-500/20 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-stone-800 text-[11px] font-bold transition cursor-pointer"
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Mandatory Document Uploads (DL & Vehicle Plate Photo) */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-stone-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{lang === 'hi' ? '4. अनिवार्य दस्तावेज़ सत्यापन (KYC Documents)' : '4. Required KYC Documents'}</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Direct Telemetry Link
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Document 1: DL Photo */}
              <div className="border-2 border-dashed border-slate-300 dark:border-stone-700 hover:border-emerald-500 rounded-2xl p-4 transition bg-slate-50/70 dark:bg-stone-950/60 flex flex-col items-center justify-center text-center relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDlUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                
                {dlPreview ? (
                  <div className="w-full space-y-2">
                    <img
                      src={dlPreview}
                      alt="DL Preview"
                      className="w-full h-32 object-cover rounded-xl border border-slate-300 dark:border-stone-800 shadow-sm"
                    />
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 pt-1">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'ड्राइविंग लाइसेंस संलग्न ✓' : 'DL Attached ✓'}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-stone-400 font-medium">Click to Change</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{t('uploadDL')}</p>
                      <p className="text-[10px] text-slate-500 dark:text-stone-400">Click or Drag to Upload DL</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Document 2: Vehicle Number Plate Photo */}
              <div className="border-2 border-dashed border-slate-300 dark:border-stone-700 hover:border-emerald-500 rounded-2xl p-4 transition bg-slate-50/70 dark:bg-stone-950/60 flex flex-col items-center justify-center text-center relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePlateUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                
                {platePreview ? (
                  <div className="w-full space-y-2">
                    <img
                      src={platePreview}
                      alt="Vehicle Plate Preview"
                      className="w-full h-32 object-cover rounded-xl border border-slate-300 dark:border-stone-800 shadow-sm"
                    />
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 pt-1">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'नंबर प्लेट फोटो संलग्न ✓' : 'Plate Attached ✓'}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-stone-400 font-medium">Click to Change</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{t('uploadPlate')}</p>
                      <p className="text-[10px] text-slate-500 dark:text-stone-400">Clear photo of vehicle number plate</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Submit & Telemetry Activation Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.99] hover:translate-y-[-1px] transition-all duration-300 cursor-pointer"
          >
            {isSubmitting ? (
              <span>{lang === 'hi' ? 'फ्लीट सक्रिय हो रही है...' : 'Activating Operator Dashboard...'}</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-stone-950 stroke-[2.5]" />
                <span>{lang === 'hi' ? 'मशीनरी सत्यापित करें व ऑपरेटर कॉकपिट खोलें →' : 'Complete Onboarding & Enter Operator Cockpit →'}</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}

