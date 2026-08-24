import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeSync } from '../../context/RealtimeSyncContext';
import { usePricing } from '../../context/PricingContext';
import LiveMap from '../map/LiveMap';
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
  LogOut,
  Activity,
  Radio,
  Compass,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Globe,
  Home,
  Check,
  Zap,
  Gauge,
  Navigation,
  RefreshCw
} from 'lucide-react';

const REJECTION_REASON_PRESETS = [
  'Driving License photo is blurry or unreadable (ड्राइविंग लाइसेंस फ़ोटो धुंधली है)',
  'Number plate does not match vehicle registration details (नंबर प्लेट विवरण मेल नहीं खाता)',
  'Expired driving license document (ड्राइविंग लाइसेंस की वैधता समाप्त हो चुकी है)',
  'Vehicle photo incomplete or implement damaged (गाड़ी की फोटो अधूरी है)'
];

// Mock Registered Active Fleet Directory for Malihabad Region
const REGISTERED_FLEET_DATA = [
  {
    id: 'FLEET-001',
    driverName: 'Jagjit Singh (जगजीत सिंह)',
    phone: '+91 9876501234',
    vehicleType: 'tractor',
    modelName: 'Mahindra 575 DI (50 HP)',
    vehicleNumber: 'UP-32-KR-7744',
    implement: 'Rotavator (6 Feet)',
    status: 'online',
    kycStatus: 'verified',
    rating: 4.95,
    completedJobs: 142,
    location: 'Gram Malihabad West'
  },
  {
    id: 'FLEET-002',
    driverName: 'Gurpreet Brar (गुरप्रीत बराड़)',
    phone: '+91 9876588112',
    vehicleType: 'harvester',
    modelName: 'Preet 987 Combine (110 HP)',
    vehicleNumber: 'PB-10-AZ-1100',
    implement: 'Multi-Crop Grain Header',
    status: 'dispatch',
    kycStatus: 'verified',
    rating: 4.98,
    completedJobs: 89,
    location: 'Bakshi Ka Talab Road'
  },
  {
    id: 'FLEET-003',
    driverName: 'Rampal Sharma (रामपाल शर्मा)',
    phone: '+91 9811122233',
    vehicleType: 'jcb',
    modelName: 'JCB 3DX EcoXcellence (76 HP)',
    vehicleNumber: 'UP-32-BT-9901',
    implement: 'Heavy Excavator Bucket',
    status: 'online',
    kycStatus: 'verified',
    rating: 4.88,
    completedJobs: 64,
    location: 'Malihabad Bypass'
  },
  {
    id: 'FLEET-004',
    driverName: 'Surendra Yadav (सुरेंद्र यादव)',
    phone: '+91 9839012445',
    vehicleType: 'tractor',
    modelName: 'Swaraj 855 FE (52 HP)',
    vehicleNumber: 'UP-32-AZ-4421',
    implement: 'Laser Land Leveler',
    status: 'online',
    kycStatus: 'verified',
    rating: 4.92,
    completedJobs: 118,
    location: 'Kakori Sector 4'
  }
];

export default function AdminPortal() {
  const { lang, t, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { setDriverVerification, logout, setActiveRole } = useAuth();
  const { 
    pendingApplications, 
    approveApplication, 
    rejectApplication,
    onlineFleet 
  } = useRealtimeSync();
  const { rates, updateRates, resetToDefaultRates } = usePricing();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'kyc' | 'directory' | 'pricing'
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
  const [fleetSearch, setFleetSearch] = useState('');

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
    <div className={`min-h-screen font-sans selection:bg-emerald-500 selection:text-stone-950 transition-colors duration-200 ${
      isDark ? 'bg-[#090D0B] text-stone-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* ══════════════ SUB-COMMAND TABS STRIP ══════════════ */}
      <div className={`border-b py-3 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
        isDark ? 'bg-stone-900/40 border-stone-800/80' : 'bg-white/70 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Navigation Pill Tabs */}
          <nav className={`flex items-center p-1 rounded-2xl border text-xs font-black shadow-sm ${
            isDark ? 'bg-stone-950 border-stone-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-stone-950 shadow-md'
                  : isDark ? 'text-stone-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'कमांड सेंटर' : 'Command Center'}</span>
            </button>

            <button
              onClick={() => setActiveTab('kyc')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 relative ${
                activeTab === 'kyc'
                  ? 'bg-emerald-500 text-stone-950 shadow-md'
                  : isDark ? 'text-stone-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'केवाईसी ऑडिट' : 'KYC Queue'}</span>
              {pendingApplications.length > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-red-500 text-white font-black animate-pulse">
                  {pendingApplications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'directory'
                  ? 'bg-emerald-500 text-stone-950 shadow-md'
                  : isDark ? 'text-stone-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'फ्लीट डायरेक्टरी' : 'Fleet Directory'}</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'pricing'
                  ? 'bg-emerald-500 text-stone-950 shadow-md'
                  : isDark ? 'text-stone-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'मूल्य निर्धारण' : 'Rates Engine'}</span>
            </button>
          </nav>

          {/* Right Status Badge & Public App shortcut */}
          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold ${
              isDark ? 'bg-stone-950 border-stone-800 text-stone-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Malihabad Node: Operational</span>
            </div>

            <button
              onClick={() => {
                window.location.hash = '';
                setActiveRole('landing');
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs shadow-sm transition flex items-center gap-1.5 active:scale-95"
            >
              <Home className="w-3.5 h-3.5 text-stone-950" />
              <span>{lang === 'hi' ? 'मुख्य पृष्ठ' : 'Public App'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* ══════════════ MAIN CONTENT CONTAINER ══════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Save Success Notification Banner */}
        {saveSuccessBanner && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-between shadow-xl shadow-emerald-500/20 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-stone-950" />
              <span>{lang === 'hi' ? 'दरें सफलतापूर्वक अपडेट की गईं! सभी किसानों को नए रेट तुरंत दिखाई देंगे।' : 'Base rates successfully updated! Live across all active booking sessions.'}</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-stone-950 text-emerald-400 text-[10px] font-black uppercase">Active ✓</span>
          </div>
        )}

        {/* ═════════════════════════════════════════════ */}
        {/* TAB 1: COMMAND CENTER & REAL-TIME DISPATCH    */}
        {/* ═════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* 4 SLEEK KPI STAT CARDS WITH LIVE TREND BADGES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Stat 1: Total Active Bookings */}
              <div className={`p-5 rounded-3xl border shadow-lg relative overflow-hidden transition-all duration-200 ${
                isDark ? 'bg-stone-900/80 border-stone-800 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/60'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                    Active Bookings
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    42 Dispatches
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[10px]">
                      <ArrowUpRight className="w-3 h-3" /> +14.2%
                    </span>
                    <span className={isDark ? 'text-stone-400' : 'text-slate-500'}>today (Live Stream)</span>
                  </div>
                </div>
              </div>

              {/* Stat 2: Live Fleets Online */}
              <div className={`p-5 rounded-3xl border shadow-lg relative overflow-hidden transition-all duration-200 ${
                isDark ? 'bg-stone-900/80 border-stone-800 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/60'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                    Live Fleets in Range
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                    <Tractor className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    18 Units Online
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className={isDark ? 'text-stone-300' : 'text-slate-600'}>11 Tractors • 4 Combines • 3 JCBs</span>
                  </div>
                </div>
              </div>

              {/* Stat 3: Gross Farm Coverage */}
              <div className={`p-5 rounded-3xl border shadow-lg relative overflow-hidden transition-all duration-200 ${
                isDark ? 'bg-stone-900/80 border-stone-800 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/60'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                    Gross Farm Coverage
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    1,420 Bighas
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-[10px]">
                      🌾 +85 Bighas
                    </span>
                    <span className={isDark ? 'text-stone-400' : 'text-slate-500'}>serviced this week</span>
                  </div>
                </div>
              </div>

              {/* Stat 4: Network Uptime & Driver Payouts */}
              <div className={`p-5 rounded-3xl border shadow-lg relative overflow-hidden transition-all duration-200 ${
                isDark ? 'bg-stone-900/80 border-stone-800 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/60'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                    Network & Payouts
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center font-black">
                    ₹
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹2,84,500
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-500/10 text-[10px]">
                      🟢 99.98%
                    </span>
                    <span className={isDark ? 'text-stone-400' : 'text-slate-500'}>Uptime • Direct Disbursal</span>
                  </div>
                </div>
              </div>

            </div>

            {/* REAL-TIME DISPATCH CONTROL & LIVE GPS FLEET MAP */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left 8 Cols: Live Interactive Map */}
              <div className={`lg:col-span-8 p-5 sm:p-6 rounded-3xl border shadow-xl space-y-4 ${
                isDark ? 'bg-stone-900/90 border-stone-800 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-200/60'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-800/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <div>
                      <h4 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {lang === 'hi' ? 'लाइव फ्लीट डिस्पैच व जीपीएस टेलीमेट्री' : 'Live Fleet Dispatch & GPS Telemetry'}
                      </h4>
                      <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                        Real-time GPS coordinates of active tractors, harvesters & earthmovers across Malihabad
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider self-start sm:self-auto">
                    Live Broadcast • 1.2s Sync
                  </span>
                </div>

                <div className="rounded-2xl overflow-hidden border border-stone-800/80 shadow-inner">
                  <LiveMap 
                    farmerLocation={{ lat: 26.9200, lng: 80.7100 }}
                    showNearbyDrivers={true}
                    className="h-[420px] w-full rounded-2xl"
                  />
                </div>
              </div>

              {/* Right 4 Cols: Live Telemetry Stream */}
              <div className={`lg:col-span-4 p-5 sm:p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 ${
                isDark ? 'bg-stone-900/90 border-stone-800 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-200/60'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800/40">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {lang === 'hi' ? 'सक्रिय फ्लीट सिग्नल्स' : 'Live Fleet Signals'}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">4 ONLINE</span>
                  </div>

                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {REGISTERED_FLEET_DATA.map(fleet => (
                      <div 
                        key={fleet.id}
                        className={`p-3 rounded-2xl border transition-all duration-200 hover:border-emerald-500/50 ${
                          isDark ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {fleet.vehicleType === 'tractor' ? '🚜' : fleet.vehicleType === 'harvester' ? '🌾' : '🏗️'}
                            </span>
                            <div>
                              <h5 className={`font-black text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {fleet.driverName}
                              </h5>
                              <p className={`text-[10px] ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                                {fleet.modelName}
                              </p>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                            fleet.status === 'dispatch'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                              : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                          }`}>
                            {fleet.status === 'dispatch' ? 'ON DISPATCH' : 'AVAILABLE'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] mt-2 pt-2 border-t border-stone-800/50">
                          <span className={isDark ? 'text-stone-400' : 'text-slate-500'}>
                            📍 {fleet.location}
                          </span>
                          <span className="font-mono font-bold text-emerald-400">
                            {fleet.vehicleNumber}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                  isDark ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-[11px] font-bold">AgriStack Vahan Bridge Active</span>
                  </div>
                  <span className="text-[10px] font-mono font-black">100% OK</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════ */}
        {/* TAB 2: DRIVER KYC AUDIT QUEUE                 */}
        {/* ═════════════════════════════════════════════ */}
        {activeTab === 'kyc' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800/40">
              <div>
                <h2 className={`text-xl font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>{t('pendingDrivers')} ({pendingApplications.length})</span>
                </h2>
                <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                  Review submitted Driving Licenses, Vehicle RC plates & approve for instant fleet dispatch
                </p>
              </div>
            </div>

            {pendingApplications.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl border shadow-lg space-y-3 ${
                isDark ? 'bg-stone-900/80 border-stone-800' : 'bg-white border-slate-200'
              }`}>
                <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
                  ✅
                </div>
                <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('noPending')}
                </h3>
                <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
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
                    className={`p-6 rounded-3xl border shadow-lg hover:shadow-xl transition-all duration-200 space-y-5 ${
                      isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-2xl font-bold">
                          {app.vehicleType === 'tractor' ? '🚜' : app.vehicleType === 'jcb' ? '🏗️' : '🌾'}
                        </div>
                        <div>
                          <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {app.driverName}
                          </h3>
                          <p className={`text-xs font-bold ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                            {app.phone} • <span className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>{app.modelName}</span>
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/60 font-black text-[10px] uppercase tracking-wider">
                        {app.submittedAt}
                      </span>
                    </div>

                    <div className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs ${
                      isDark ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div>
                        <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                          Vehicle Number
                        </span>
                        <span className={`font-black text-sm font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {app.vehicleNumber}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                          Proposed Rates
                        </span>
                        <span className="font-extrabold text-emerald-500">
                          ₹{app.acreRate}/bigha • ₹{app.hourlyRate}/hr
                        </span>
                      </div>
                    </div>

                    {/* Documents Thumbnail Previews */}
                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        onClick={() => setInspectingApp(app)}
                        className={`border rounded-2xl p-2 cursor-pointer transition text-center group ${
                          isDark ? 'bg-stone-950 border-stone-800 hover:border-emerald-500/60' : 'bg-slate-50 border-slate-200 hover:border-emerald-500'
                        }`}
                      >
                        <img
                          src={app.dlPhoto}
                          alt="DL"
                          className="w-full h-24 object-cover rounded-xl border border-stone-700 group-hover:opacity-90 transition-opacity"
                        />
                        <span className="mt-1 block text-[10px] font-bold text-stone-400 group-hover:text-emerald-400">
                          🔍 {t('dlPreview')}
                        </span>
                      </div>

                      <div 
                        onClick={() => setInspectingApp(app)}
                        className={`border rounded-2xl p-2 cursor-pointer transition text-center group ${
                          isDark ? 'bg-stone-950 border-stone-800 hover:border-emerald-500/60' : 'bg-slate-50 border-slate-200 hover:border-emerald-500'
                        }`}
                      >
                        <img
                          src={app.platePhoto}
                          alt="Plate"
                          className="w-full h-24 object-cover rounded-xl border border-stone-700 group-hover:opacity-90 transition-opacity"
                        />
                        <span className="mt-1 block text-[10px] font-bold text-stone-400 group-hover:text-emerald-400">
                          🔍 {t('platePreview')}
                        </span>
                      </div>
                    </div>

                    {/* Actions: Approve & Reject with Reason */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setInspectingApp(app)}
                        className={`w-1/3 py-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1 transition ${
                          isDark 
                            ? 'border-stone-700 text-stone-300 hover:bg-stone-800' 
                            : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => handleOpenRejectModal(app)}
                        className="w-1/3 py-3 rounded-2xl border border-red-800/60 text-red-400 hover:bg-red-950/50 font-bold text-xs flex items-center justify-center gap-1 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{t('rejectDriver')}</span>
                      </button>

                      <button
                        onClick={() => handleApprove(app)}
                        className="w-1/3 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-xs flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/20 transition active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-stone-950" />
                        <span>{t('approveDriver')}</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════ */}
        {/* TAB 3: FLEET DIRECTORY & DATA TABLE           */}
        {/* ═════════════════════════════════════════════ */}
        {activeTab === 'directory' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800/40">
              <div>
                <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {lang === 'hi' ? 'पंजीकृत फ्लीट डायरेक्टरी' : 'Registered Fleet Directory'}
                </h2>
                <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                  Directory of all authorized drivers, machinery specs and verification states
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fleetSearch}
                  onChange={(e) => setFleetSearch(e.target.value)}
                  placeholder="Search by driver, model or plate..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs font-bold outline-none focus:border-emerald-500 ${
                    isDark ? 'border-stone-800 bg-stone-900 text-white' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* High-Contrast Data Table */}
            <div className={`rounded-3xl border shadow-xl overflow-hidden ${
              isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-slate-200'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b uppercase font-black tracking-wider text-[10px] ${
                    isDark ? 'bg-stone-950/80 border-stone-800 text-stone-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}>
                    <tr>
                      <th className="py-4 px-5">Fleet ID & Driver</th>
                      <th className="py-4 px-4">Machinery & Implement</th>
                      <th className="py-4 px-4">Registration Plate</th>
                      <th className="py-4 px-4">Rating & Jobs</th>
                      <th className="py-4 px-4">Live Status</th>
                      <th className="py-4 px-5 text-right">Audit State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/40">
                    {REGISTERED_FLEET_DATA
                      .filter(f => 
                        !fleetSearch || 
                        f.driverName.toLowerCase().includes(fleetSearch.toLowerCase()) || 
                        f.modelName.toLowerCase().includes(fleetSearch.toLowerCase()) || 
                        f.vehicleNumber.toLowerCase().includes(fleetSearch.toLowerCase())
                      )
                      .map(fleet => (
                        <tr key={fleet.id} className={`hover:bg-emerald-500/5 transition-colors ${
                          isDark ? 'text-stone-200' : 'text-slate-800'
                        }`}>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">
                                {fleet.vehicleType === 'tractor' ? '🚜' : fleet.vehicleType === 'harvester' ? '🌾' : '🏗️'}
                              </span>
                              <div>
                                <span className="font-black text-sm block">{fleet.driverName}</span>
                                <span className="text-[10px] text-stone-400 font-mono">{fleet.id} • {fleet.phone}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div>
                              <span className="font-bold block">{fleet.modelName}</span>
                              <span className="text-[10px] text-emerald-400">{fleet.implement}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-mono font-black text-xs px-2 py-1 rounded-lg bg-stone-950 border border-stone-800 text-emerald-400">
                              {fleet.vehicleNumber}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 font-bold">
                              <span className="text-amber-400">★</span>
                              <span>{fleet.rating}</span>
                              <span className="text-[10px] text-stone-400">({fleet.completedJobs} rides)</span>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              fleet.status === 'dispatch'
                                ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                                : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            }`}>
                              {fleet.status === 'dispatch' ? 'On Dispatch' : 'Available'}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-right">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-stone-950 text-[10px] font-black inline-flex items-center gap-1 shadow-md shadow-emerald-500/20">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Verified ✓</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════ */}
        {/* TAB 4: DYNAMIC BASE PRICING CONTROLLER        */}
        {/* ═════════════════════════════════════════════ */}
        {activeTab === 'pricing' && (
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 animate-fade-in ${
            isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800/40 pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-xs font-black uppercase">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Dynamic Platform Pricing Engine</span>
                </div>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {lang === 'hi' ? 'कृषि मशीनरी बेस रेट प्रबंधन' : 'Agricultural Machinery Base Rates Management'}
                </h3>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                  {lang === 'hi' ? 'यहाँ दरें बदलने पर ऐप में सभी जगह किसानों को नए दाम तुरंत दिखने लगेंगे।' : 'Changes made here will instantly update dynamic pricing calculations across all active farmer booking sessions.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetRates}
                className={`px-4 py-2 rounded-2xl border font-bold text-xs flex items-center gap-1.5 transition ${
                  isDark 
                    ? 'border-stone-700 text-stone-300 hover:bg-stone-800' 
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>

            <form onSubmit={handleSaveRates} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Tractor Rate */}
                <div className="p-5 rounded-3xl border-2 border-emerald-500/40 bg-emerald-950/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚜</span>
                    <div>
                      <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Tractor + Implements</h4>
                      <span className="text-[10px] text-emerald-400 font-bold">Pricing by Area (Bigha)</span>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold uppercase mb-1.5 ${isDark ? 'text-stone-300' : 'text-slate-600'}`}>
                      Rate per Bigha (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-emerald-500">₹</span>
                      <input
                        type="number"
                        required
                        value={editableRates.tractorBigha}
                        onChange={(e) => setEditableRates({ ...editableRates, tractorBigha: e.target.value })}
                        className={`w-full pl-8 pr-3 py-3 rounded-2xl border font-black text-lg outline-none focus:border-emerald-500 ${
                          isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Harvester Rate */}
                <div className="p-5 rounded-3xl border-2 border-amber-500/40 bg-amber-950/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌾</span>
                    <div>
                      <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Combine Harvester</h4>
                      <span className="text-[10px] text-amber-400 font-bold">Pricing by Area (Bigha)</span>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold uppercase mb-1.5 ${isDark ? 'text-stone-300' : 'text-slate-600'}`}>
                      Rate per Bigha (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-amber-500">₹</span>
                      <input
                        type="number"
                        required
                        value={editableRates.harvesterBigha}
                        onChange={(e) => setEditableRates({ ...editableRates, harvesterBigha: e.target.value })}
                        className={`w-full pl-8 pr-3 py-3 rounded-2xl border font-black text-lg outline-none focus:border-amber-500 ${
                          isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* JCB Rate */}
                <div className="p-5 rounded-3xl border-2 border-blue-500/40 bg-blue-950/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏗️</span>
                    <div>
                      <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>JCB / Earthmovers</h4>
                      <span className="text-[10px] text-blue-400 font-bold">Pricing by Time (Hours)</span>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold uppercase mb-1.5 ${isDark ? 'text-stone-300' : 'text-slate-600'}`}>
                      Rate per Hour (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-blue-500">₹</span>
                      <input
                        type="number"
                        required
                        value={editableRates.jcbHour}
                        onChange={(e) => setEditableRates({ ...editableRates, jcbHour: e.target.value })}
                        className={`w-full pl-8 pr-3 py-3 rounded-2xl border font-black text-lg outline-none focus:border-blue-500 ${
                          isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Truck Rate */}
                <div className="p-5 rounded-3xl border-2 border-purple-500/40 bg-purple-950/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚚</span>
                    <div>
                      <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Trucks & Trolleys</h4>
                      <span className="text-[10px] text-purple-400 font-bold">Base + Distance (Km)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-stone-300' : 'text-slate-600'}`}>
                        Base (₹)
                      </label>
                      <input
                        type="number"
                        required
                        value={editableRates.truckBase}
                        onChange={(e) => setEditableRates({ ...editableRates, truckBase: e.target.value })}
                        className={`w-full px-3 py-2.5 rounded-xl border font-black text-sm outline-none ${
                          isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-stone-300' : 'text-slate-600'}`}>
                        Per Km (₹)
                      </label>
                      <input
                        type="number"
                        required
                        value={editableRates.truckKm}
                        onChange={(e) => setEditableRates({ ...editableRates, truckKm: e.target.value })}
                        className={`w-full px-3 py-2.5 rounded-xl border font-black text-sm outline-none ${
                          isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-98"
              >
                <Save className="w-5 h-5 text-stone-950" />
                <span>{lang === 'hi' ? 'नई दरें सुरक्षित करें (Save & Deploy Live Rates)' : 'Save & Deploy Live Rates'}</span>
              </button>
            </form>
          </div>
        )}

      </main>

      {/* ══════════════ SIDE-BY-SIDE DOCUMENT INSPECTION MODAL ══════════════ */}
      {inspectingApp && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border max-h-[90vh] overflow-y-auto space-y-6 ${
            isDark ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-800/40">
              <div>
                <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  Driver Document Inspection
                </span>
                <h3 className="text-xl font-black mt-1">
                  {inspectingApp.driverName} ({inspectingApp.vehicleNumber})
                </h3>
              </div>

              <button
                onClick={() => setInspectingApp(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>{t('dlPreview')} (Driving License)</span>
                </h4>
                <div className="border border-stone-800 rounded-2xl p-2 bg-stone-950">
                  <img
                    src={inspectingApp.dlPhoto}
                    alt="Driving License Full"
                    className="w-full h-56 object-cover rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>{t('platePreview')} (Number Plate Photo)</span>
                </h4>
                <div className="border border-stone-800 rounded-2xl p-2 bg-stone-950">
                  <img
                    src={inspectingApp.platePhoto}
                    alt="Number Plate Full"
                    className="w-full h-56 object-cover rounded-xl"
                  />
                </div>
              </div>

            </div>

            <div className="flex gap-3 pt-4 border-t border-stone-800/40">
              <button
                onClick={() => { setRejectingApp(inspectingApp); setInspectingApp(null); }}
                className="w-1/2 py-4 rounded-2xl border border-red-800/60 text-red-400 hover:bg-red-950/40 font-black text-sm transition"
              >
                {t('rejectDriver')}
              </button>

              <button
                onClick={() => handleApprove(inspectingApp)}
                className="w-1/2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-stone-950" />
                <span>{t('approveDriver')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════ DEDICATED REJECTION REASON MODAL ══════════════ */}
      {rejectingApp && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className={`rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-red-500/40 space-y-6 ${
            isDark ? 'bg-stone-900 text-white' : 'bg-white text-slate-900'
          }`}>
            
            <div className="flex items-start justify-between border-b border-stone-800/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-700 text-red-400 flex items-center justify-center font-black text-xl shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                    Admin Rejection Action
                  </span>
                  <h3 className="text-lg font-black mt-0.5">
                    {lang === 'hi' ? 'अस्वीकृति का कारण चुनें' : 'Provide Rejection Reason'}
                  </h3>
                  <p className="text-xs text-stone-400 font-bold">
                    For {rejectingApp.driverName} ({rejectingApp.vehicleNumber})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRejectingApp(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <label className="block text-xs font-black text-stone-300 uppercase tracking-wider">
                {lang === 'hi' ? 'मानक कारण चुनें (Preset Reasons)' : 'Select Reason for Driver Notification:'}
              </label>

              <div className="space-y-2">
                {REJECTION_REASON_PRESETS.map((reason, idx) => (
                  <label
                    key={idx}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-2.5 transition text-xs font-bold ${
                      selectedReason === reason && !customReason.trim()
                        ? 'border-red-500 bg-red-950/40 text-red-200'
                        : 'border-stone-800 bg-stone-950 hover:bg-stone-900 text-stone-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectionPreset"
                      checked={selectedReason === reason && !customReason.trim()}
                      onChange={() => { setSelectedReason(reason); setCustomReason(''); }}
                      className="mt-0.5 text-red-500 focus:ring-red-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase mb-1">
                  {lang === 'hi' ? 'या अन्य विशिष्ट कारण लिखें (Custom Reason):' : 'Or Type Custom Specific Reason:'}
                </label>
                <textarea
                  rows="2"
                  placeholder="उदा. ड्राइविंग लाइसेंस का कोना कटा हुआ है, कृपया पूरी फोटो भेजें।"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-stone-800 bg-stone-950 font-bold text-xs text-white outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingApp(null)}
                  className="w-1/3 py-3.5 rounded-2xl border border-stone-800 text-stone-300 font-bold text-xs hover:bg-stone-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-1.5"
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
