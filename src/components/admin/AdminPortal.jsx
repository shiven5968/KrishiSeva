import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeSync } from '../../context/RealtimeSyncContext';
import { usePricing } from '../../context/PricingContext';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Truck, 
  Tractor, 
  MapPin, 
  Sparkles, 
  Search, 
  AlertCircle,
  Clock,
  Layers,
  DollarSign,
  TrendingUp,
  Users,
  Save,
  RotateCcw,
  Sliders,
  ShieldAlert,
  LogOut
} from 'lucide-react';

const REJECTION_REASON_PRESETS = [
  'Driving License photo is blurry or unreadable (ड्राइविंग लाइसेंस फ़ोटो धुंधली है)',
  'Number plate does not match vehicle registration details (नंबर प्लेट विवरण मेल नहीं खाता)',
  'Expired driving license document (ड्राइविंग लाइसेंस की वैधता समाप्त हो चुकी है)',
  'Vehicle photo incomplete or implement damaged (गाड़ी की फोटो अधूरी है)'
];

export default function AdminPortal() {
  const { lang, t } = useLanguage();
  const { setDriverVerification, logout } = useAuth();
  const { 
    pendingApplications, 
    approveApplication, 
    rejectApplication 
  } = useRealtimeSync();
  const { rates, updateRates, resetToDefaultRates } = usePricing();

  const [activeTab, setActiveTab] = useState('kyc'); // 'dashboard' | 'kyc' | 'pricing'
  const [inspectingApp, setInspectingApp] = useState(null);

  // Rejection Reason Modal State
  const [rejectingApp, setRejectingApp] = useState(null);
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASON_PRESETS[0]);
  const [customReason, setCustomReason] = useState('');

  // Editable pricing state
  const [editableRates, setEditableRates] = useState({
    tractorBigha: rates.tractor.ratePerBigha,
    harvesterBigha: rates.harvester.ratePerBigha,
    jcbHour: rates.jcb.ratePerHour,
    truckBase: rates.truck.baseLoadingCharge,
    truckKm: rates.truck.ratePerKm
  });

  const [saveSuccessBanner, setSaveSuccessBanner] = useState(false);

  const handleApprove = (app) => {
    approveApplication(app.id, { driverPhone: app.phone, driverName: app.driverName });
    setDriverVerification('verified');
    setInspectingApp(null);
  };

  const handleOpenRejectModal = (app) => {
    setRejectingApp(app);
    setSelectedReason(REJECTION_REASON_PRESETS[0]);
    setCustomReason('');
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectingApp) return;

    const finalReason = customReason.trim() ? customReason : selectedReason;
    rejectApplication(rejectingApp.id, finalReason);
    setDriverVerification('rejected');
    setRejectingApp(null);
    setInspectingApp(null);
  };

  const handleSaveRates = (e) => {
    e.preventDefault();
    updateRates({
      tractor: { ...rates.tractor, ratePerBigha: Number(editableRates.tractorBigha) },
      harvester: { ...rates.harvester, ratePerBigha: Number(editableRates.harvesterBigha) },
      jcb: { ...rates.jcb, ratePerHour: Number(editableRates.jcbHour) },
      truck: { 
        ...rates.truck, 
        baseLoadingCharge: Number(editableRates.truckBase), 
        ratePerKm: Number(editableRates.truckKm) 
      }
    });
    setSaveSuccessBanner(true);
    setTimeout(() => setSaveSuccessBanner(false), 3500);
  };

  const handleResetRates = () => {
    resetToDefaultRates();
    setEditableRates({
      tractorBigha: 1300,
      harvesterBigha: 1500,
      jcbHour: 1000,
      truckBase: 500,
      truckKm: 50
    });
    setSaveSuccessBanner(true);
    setTimeout(() => setSaveSuccessBanner(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-stone-950 via-purple-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 shrink-0">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-300 bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-700">
                {lang === 'hi' ? 'सुपर एडमिन नियंत्रण कक्ष (Admin /admin)' : 'Super Admin Portal'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {lang === 'hi' ? 'कृषि सेवा - एडमिन सत्यापन व दर नियंत्रण' : 'KrishiSeva Admin Verification Portal'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 font-medium">
              {lang === 'hi'
                ? 'ड्राइवर केवाईसी (DL/प्लेट) सत्यापन, रिजेक्शन कारण प्रबंधन और डायनामिक बेस रेट कंट्रोल'
                : 'KYC Document Auditing with Rejection Reasons, and Dynamic Platform Rates'}
            </p>
          </div>
        </div>

        {/* Tab Navigation & Admin Logout */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center p-1 bg-stone-900/80 rounded-2xl border border-stone-700 text-xs font-bold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'}`}
            >
              📊 {lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
            </button>
            <button
              onClick={() => setActiveTab('kyc')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${activeTab === 'kyc' ? 'bg-purple-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'}`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>KYC Queue</span>
              {pendingApplications.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-red-500 text-white font-black">
                  {pendingApplications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${activeTab === 'pricing' ? 'bg-purple-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'}`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Pricing</span>
            </button>
          </div>
        </div>

      </div>

      {/* Save Success Banner */}
      {saveSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{lang === 'hi' ? 'दरें सफलतापूर्वक अपडेट की गईं! सभी किसानों को नए रेट तुरंत दिखाई देंगे।' : 'Base rates successfully updated! Live across all active booking sessions.'}</span>
          </div>
          <span className="text-xs bg-emerald-700 px-2 py-0.5 rounded font-black">Active</span>
        </div>
      )}

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-black uppercase">Active Verified Drivers</span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  🚜
                </div>
              </div>
              <h3 className="text-3xl font-black text-stone-900">42 Fleet</h3>
              <p className="text-xs text-emerald-600 font-bold">Online & Ready</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-black uppercase">Pending KYC Queue</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  ⏳
                </div>
              </div>
              <h3 className="text-3xl font-black text-amber-600">{pendingApplications.length} Requests</h3>
              <p className="text-xs text-stone-500 font-bold">Awaiting Document Audit</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-black uppercase">Registered Farmers</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  🌾
                </div>
              </div>
              <h3 className="text-3xl font-black text-stone-900">1,280</h3>
              <p className="text-xs text-stone-500 font-bold">Malihabad Region</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-black uppercase">Total GMV</span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                  ₹
                </div>
              </div>
              <h3 className="text-3xl font-black text-stone-900">₹3,44,500</h3>
              <p className="text-xs text-purple-600 font-bold">Zero Platform Cut</p>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: KYC QUEUE (Requirement 3: Review Drawer & Reject with Reason Workflow) */}
      {activeTab === 'kyc' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>{t('pendingDrivers')} ({pendingApplications.length})</span>
            </h2>
          </div>

          {pendingApplications.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl">
                ✅
              </div>
              <h3 className="text-lg font-black text-stone-900">
                {t('noPending')}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {lang === 'hi' 
                  ? 'सभी प्राप्त ड्राइविंग लाइसेंस और नंबर प्लेट सत्यापित कर लिए गए हैं।' 
                  : 'All driver applications have been thoroughly audited and approved.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingApplications.map(app => (
                <div 
                  key={app.id}
                  className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md hover:shadow-lg transition space-y-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
                        {app.vehicleType === 'tractor' ? '🚜' : app.vehicleType === 'jcb' ? '🏗️' : '🌾'}
                      </div>
                      <div>
                        <h3 className="font-black text-base text-stone-900">
                          {app.driverName}
                        </h3>
                        <p className="text-xs text-stone-500 font-bold">
                          {app.phone} • <span className="text-stone-800">{app.modelName}</span>
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-[11px] uppercase tracking-wider">
                      {app.submittedAt}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Vehicle Number</span>
                      <span className="font-black text-stone-900 text-sm">{app.vehicleNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Proposed Rates</span>
                      <span className="font-extrabold text-emerald-700">₹{app.acreRate}/bigha • ₹{app.hourlyRate}/hr</span>
                    </div>
                  </div>

                  {/* Documents Thumbnail Previews */}
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => setInspectingApp(app)}
                      className="border rounded-2xl p-2 bg-stone-50 hover:bg-stone-100 cursor-pointer transition text-center group"
                    >
                      <img
                        src={app.dlPhoto}
                        alt="DL"
                        className="w-full h-24 object-cover rounded-xl border border-stone-200 group-hover:opacity-90"
                      />
                      <span className="mt-1 block text-[10px] font-bold text-stone-600 group-hover:text-purple-700">
                        🔍 {t('dlPreview')}
                      </span>
                    </div>

                    <div 
                      onClick={() => setInspectingApp(app)}
                      className="border rounded-2xl p-2 bg-stone-50 hover:bg-stone-100 cursor-pointer transition text-center group"
                    >
                      <img
                        src={app.platePhoto}
                        alt="Plate"
                        className="w-full h-24 object-cover rounded-xl border border-stone-200 group-hover:opacity-90"
                      />
                      <span className="mt-1 block text-[10px] font-bold text-stone-600 group-hover:text-purple-700">
                        🔍 {t('platePreview')}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Approve & Reject with Reason */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setInspectingApp(app)}
                      className="w-1/3 py-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>

                    <button
                      onClick={() => handleOpenRejectModal(app)}
                      className="w-1/3 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t('rejectDriver')}</span>
                    </button>

                    <button
                      onClick={() => handleApprove(app)}
                      className="w-1/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('approveDriver')}</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRICING ENGINE */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-5">
            <div>
              <span className="text-xs font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Live Pricing Controller
              </span>
              <h3 className="text-2xl font-black text-stone-900 mt-1">
                {lang === 'hi' ? 'कृषि मशीनरी बेस रेट प्रबंधन' : 'Agricultural Machinery Base Rates Management'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                {lang === 'hi' ? 'यहाँ दरें बदलने पर ऐप में सभी जगह किसानों को नए दाम तुरंत दिखने लगेंगे।' : 'Changes made here will instantly update the dynamic pricing calculations across the farmer booking app.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetRates}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs flex items-center gap-1.5 hover:bg-stone-50 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>

          <form onSubmit={handleSaveRates} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/30 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚜</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-stone-900">Tractor + Implements</h4>
                    <span className="text-[10px] text-emerald-800 font-bold">Pricing by Area (Bigha)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Rate per Bigha (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-stone-500">₹</span>
                    <input
                      type="number"
                      required
                      value={editableRates.tractorBigha}
                      onChange={(e) => setEditableRates({ ...editableRates, tractorBigha: e.target.value })}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-emerald-300 bg-white font-black text-lg text-stone-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border-2 border-amber-500/40 bg-amber-50/30 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌾</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-stone-900">Combine Harvester</h4>
                    <span className="text-[10px] text-amber-800 font-bold">Pricing by Area (Bigha)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Rate per Bigha (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-stone-500">₹</span>
                    <input
                      type="number"
                      required
                      value={editableRates.harvesterBigha}
                      onChange={(e) => setEditableRates({ ...editableRates, harvesterBigha: e.target.value })}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-amber-300 bg-white font-black text-lg text-stone-900 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border-2 border-blue-500/40 bg-blue-50/30 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏗️</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-stone-900">JCB / Earthmovers</h4>
                    <span className="text-[10px] text-blue-800 font-bold">Pricing by Time (Hours)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Rate per Hour (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-stone-500">₹</span>
                    <input
                      type="number"
                      required
                      value={editableRates.jcbHour}
                      onChange={(e) => setEditableRates({ ...editableRates, jcbHour: e.target.value })}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-blue-300 bg-white font-black text-lg text-stone-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border-2 border-purple-500/40 bg-purple-50/30 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-stone-900">Trucks & Trolleys</h4>
                    <span className="text-[10px] text-purple-800 font-bold">Base + Distance (Km)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                      Base (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={editableRates.truckBase}
                      onChange={(e) => setEditableRates({ ...editableRates, truckBase: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl border border-purple-300 bg-white font-black text-sm text-stone-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                      Per Km (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={editableRates.truckKm}
                      onChange={(e) => setEditableRates({ ...editableRates, truckKm: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl border border-purple-300 bg-white font-black text-sm text-stone-900 outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-base shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Save className="w-5 h-5" />
              <span>{lang === 'hi' ? 'नई दरें सुरक्षित करें (Save & Deploy Rates)' : 'Save & Deploy Live Rates'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Side-by-Side Document Inspection Modal */}
      {inspectingApp && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                  Driver Document Inspection
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-1">
                  {inspectingApp.driverName} ({inspectingApp.vehicleNumber})
                </h3>
              </div>

              <button
                onClick={() => setInspectingApp(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-stone-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>{t('dlPreview')} (Driving License)</span>
                </h4>
                <div className="border-2 border-stone-200 rounded-2xl p-2 bg-stone-50">
                  <img
                    src={inspectingApp.dlPhoto}
                    alt="Driving License Full"
                    className="w-full h-56 object-cover rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-stone-700 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>{t('platePreview')} (Number Plate Photo)</span>
                </h4>
                <div className="border-2 border-stone-200 rounded-2xl p-2 bg-stone-50">
                  <img
                    src={inspectingApp.platePhoto}
                    alt="Number Plate Full"
                    className="w-full h-56 object-cover rounded-xl"
                  />
                </div>
              </div>

            </div>

            <div className="flex gap-3 pt-4 border-t border-stone-100">
              <button
                onClick={() => { setRejectingApp(inspectingApp); setInspectingApp(null); }}
                className="w-1/2 py-4 rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-black text-sm transition"
              >
                {t('rejectDriver')}
              </button>

              <button
                onClick={() => handleApprove(inspectingApp)}
                className="w-1/2 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{t('approveDriver')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DEDICATED REJECTION REASON MODAL (Requirement 3: Specific Rejection Reason Workflow) */}
      {rejectingApp && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-red-500/40 space-y-6">
            
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-black text-xl shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase text-red-700 bg-red-50 px-2 py-0.5 rounded">
                    Admin Rejection Action
                  </span>
                  <h3 className="text-lg font-black text-stone-900 mt-0.5">
                    {lang === 'hi' ? 'अस्वीकृति का कारण चुनें' : 'Provide Rejection Reason'}
                  </h3>
                  <p className="text-xs text-stone-500 font-bold">
                    For {rejectingApp.driverName} ({rejectingApp.vehicleNumber})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRejectingApp(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <label className="block text-xs font-black text-stone-700 uppercase tracking-wider">
                {lang === 'hi' ? 'मानक कारण चुनें (Preset Reasons)' : 'Select Reason for Driver Notification:'}
              </label>

              <div className="space-y-2">
                {REJECTION_REASON_PRESETS.map((reason, idx) => (
                  <label
                    key={idx}
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-start gap-2.5 transition text-xs font-bold ${
                      selectedReason === reason && !customReason.trim()
                        ? 'border-red-600 bg-red-50 text-red-950'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectionPreset"
                      checked={selectedReason === reason && !customReason.trim()}
                      onChange={() => { setSelectedReason(reason); setCustomReason(''); }}
                      className="mt-0.5 text-red-600 focus:ring-red-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {lang === 'hi' ? 'या अन्य विशिष्ट कारण लिखें (Custom Reason):' : 'Or Type Custom Specific Reason:'}
                </label>
                <textarea
                  rows="2"
                  placeholder="उदा. ड्राइविंग लाइसेंस का कोना कटा हुआ है, कृपया पूरी फोटो भेजें।"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 font-bold text-xs text-stone-900 outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingApp(null)}
                  className="w-1/3 py-3.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'अस्वीकृति की पुष्टि करें (Confirm Reject)' : 'Confirm Rejection'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
