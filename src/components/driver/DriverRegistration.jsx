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
  Sparkles
} from 'lucide-react';

export default function DriverRegistration() {
  const { lang, t } = useLanguage();
  const { currentUser, driverProfile, registerDriverKyc } = useAuth();
  const { submitDriverKycRealtime } = useRealtimeSync();

  const [formData, setFormData] = useState({
    fullName: currentUser?.name || driverProfile?.fullName || '',
    phone: currentUser?.phone || driverProfile?.phone || '',
    vehicleType: driverProfile?.vehicleType && driverProfile.vehicleType !== 'tractor' ? driverProfile.vehicleType : '',
    modelName: driverProfile?.modelName && driverProfile.modelName !== 'Tractor (50 HP)' ? driverProfile.modelName : '',
    vehicleNumber: driverProfile?.vehicleNumber || '',
    dlPhoto: driverProfile?.dlImage || '',
    platePhoto: driverProfile?.plateImage || ''
  });

  const [dlPreview, setDlPreview] = useState(formData.dlPhoto);
  const [platePreview, setPlatePreview] = useState(formData.platePhoto);

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
    const submission = {
      driverName: formData.fullName,
      phone: formData.phone,
      vehicleType: formData.vehicleType,
      modelName: formData.modelName,
      vehicleNumber: formData.vehicleNumber,
      hourlyRate: 1000,
      acreRate: 1300,
      dlPhoto: dlPreview,
      platePhoto: platePreview
    };

    // Update local driver auth status to PENDING_VERIFICATION
    registerDriverKyc(submission);

    // Instantly trigger real-time BroadcastChannel event to Admin Portal
    submitDriverKycRealtime(submission);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="border-b border-stone-100 pb-5 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {lang === 'hi' ? 'ड्राइवर ऑनबोर्डिंग केवाईसी' : 'Driver Partner KYC Registration'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
            {t('driverOnboardingTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            {lang === 'hi' 
              ? 'अपनी मशीन पंजीकृत करें, ड्राइविंग लाइसेंस और नंबर प्लेट फोटो अपलोड कर एडमिन सत्यापन हेतु जमा करें।' 
              : 'Register your vehicle, attach documents & submit for instant Admin review.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Personal & Vehicle Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t('fullName')} *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 font-bold text-stone-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t('mobileNumber')} *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 font-bold text-stone-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none"
                required
              />
            </div>
          </div>

          {/* Vehicle Category & Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t('selectVehicleType')} *
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 font-bold text-stone-900 bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none"
                required
              >
                <option value="">{lang === 'hi' ? '-- वाहन श्रेणी चुनें --' : '-- Choose Vehicle Category --'}</option>
                {MACHINERY_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {t(cat.nameKey)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t('vehicleNumber')} *
              </label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                placeholder="UP-32-AB-1234"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 font-black text-stone-900 uppercase focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none"
                required
              />
            </div>
          </div>

          {/* Vehicle Model */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Model / Make (उदा. Mahindra 575 DI / Sonalika Tiger 55) *
            </label>
            <input
              type="text"
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              placeholder="e.g. Mahindra 575 DI (50 HP)"
              className="w-full px-4 py-3 rounded-xl border border-stone-300 font-bold text-stone-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none"
              required
            />
          </div>

          {/* DOCUMENT UPLOADS (Driving License and Vehicle Plate Photo) */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>{lang === 'hi' ? 'दस्तावेज़ सत्यापन (Mandatory Document Uploads)' : 'Required KYC Documents'}</span>
              </h3>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Real-Time Admin Verification
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Document 1: DL Photo */}
              <div className="border-2 border-dashed border-stone-300 hover:border-blue-500 rounded-2xl p-4 transition bg-stone-50/50 flex flex-col items-center justify-center text-center relative group">
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
                      className="w-full h-32 object-cover rounded-xl border border-stone-300 shadow-sm"
                    />
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'ड्राइविंग लाइसेंस संलग्न (DL Attached)' : 'Driving License Attached'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">{t('uploadDL')}</p>
                      <p className="text-[10px] text-stone-500">Click or Drag to Upload DL</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Document 2: Vehicle Number Plate Photo */}
              <div className="border-2 border-dashed border-stone-300 hover:border-blue-500 rounded-2xl p-4 transition bg-stone-50/50 flex flex-col items-center justify-center text-center relative group">
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
                      className="w-full h-32 object-cover rounded-xl border border-stone-300 shadow-sm"
                    />
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'नंबर प्लेट फोटो संलग्न (Plate Attached)' : 'Vehicle Plate Attached'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">{t('uploadPlate')}</p>
                      <p className="text-[10px] text-stone-500">Clear photo of vehicle number plate</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition active:scale-98"
          >
            <span>{t('submitForVerification')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

        </form>

      </div>
    </div>
  );
}
