import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeSync } from '../../context/RealtimeSyncContext';
import { 
  usePricing, 
  REGIONAL_AGRO_ZONES, 
  SEASONAL_CROP_CYCLES, 
  calculateDynamicRates,
  BASELINE_REFERENCE_RATES
} from '../../context/PricingContext';
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
  RefreshCw,
  LandPlot,
  CreditCard,
  PhoneCall,
  CheckCircle,
  HelpCircle,
  FileSpreadsheet,
  Bug
} from 'lucide-react';
import AdminBugReportModal from './AdminBugReportModal';

const REJECTION_REASON_PRESETS = [
  'Driving License photo is blurry or unreadable (ड्राइविंग लाइसेंस फ़ोटो धुंधली है)',
  'Number plate does not match vehicle registration details (नंबर प्लेट विवरण मेल नहीं खाता)',
  'Expired driving license document (ड्राइविंग लाइसेंस की वैधता समाप्त हो चुकी है)',
  'Vehicle photo incomplete or implement damaged (गाड़ी की फोटो अधूरी है)'
];

// Mock Live Platform Dispatches Stream
const LIVE_DISPATCHES_DATA = [
  {
    bookingId: 'KS-8901',
    farmerName: 'Rameshwar Singh (रामेश्वर सिंह)',
    village: 'Gram Malihabad',
    farmPlot: 'Gata #142 (3.0 Bigha)',
    serviceType: 'Tractor + Rotavator (6 Feet)',
    vehicleIcon: '🚜',
    operatorName: 'Jagjit Singh (जगजीत सिंह)',
    operatorPhone: '+91 9876501234',
    operatorPlate: 'UP-32-KR-7744',
    status: 'in_progress', // 'in_progress' | 'en_route' | 'completed' | 'pending'
    statusText: 'In Progress (Rotavating)',
    bigha: 3.0,
    amount: 3900,
    paymentMode: 'UPI (Paid)',
    startTime: '11:42 AM'
  },
  {
    bookingId: 'KS-8902',
    farmerName: 'Balram Singh (बलराम सिंह)',
    village: 'Gram Malihabad',
    farmPlot: 'Gata #215 (6.0 Bigha)',
    serviceType: 'Combine Harvester (Multi-Crop)',
    vehicleIcon: '🌾',
    operatorName: 'Gurpreet Brar (गुरप्रीत बराड़)',
    operatorPhone: '+91 9876588112',
    operatorPlate: 'PB-10-AZ-1100',
    status: 'en_route',
    statusText: 'En Route to Farm (ETA: 8 mins)',
    bigha: 6.0,
    amount: 9000,
    paymentMode: 'UPI (Escrow Held)',
    startTime: '12:05 PM'
  },
  {
    bookingId: 'KS-8899',
    farmerName: 'Harish Chandra (हरीश चंद्र)',
    village: 'Kakori Sector 2',
    farmPlot: 'Plot #88 (4.5 Bigha)',
    serviceType: 'JCB 3DX Excavator',
    vehicleIcon: '🏗️',
    operatorName: 'Rampal Sharma (रामपाल शर्मा)',
    operatorPhone: '+91 9811122233',
    operatorPlate: 'UP-32-BT-9901',
    status: 'completed',
    statusText: 'Completed & Verified',
    bigha: 4.5,
    amount: 4500,
    paymentMode: 'Cash on Delivery (Settled)',
    startTime: '10:15 AM'
  },
  {
    bookingId: 'KS-8898',
    farmerName: 'Dharmendra Rawat (धर्मेन्द्र रावत)',
    village: 'Malihabad North',
    farmPlot: 'Gata #304 (2.0 Bigha)',
    serviceType: 'Laser Land Leveler',
    vehicleIcon: '🚜',
    operatorName: 'Surendra Yadav (सुरेंद्र यादव)',
    operatorPhone: '+91 9839012445',
    operatorPlate: 'UP-32-AZ-4421',
    status: 'completed',
    statusText: 'Completed & Verified',
    bigha: 2.0,
    amount: 2600,
    paymentMode: 'UPI (Settled)',
    startTime: '09:30 AM'
  }
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

// Mock Real-Time System Audit Event Logs
const AUDIT_LOGS_DATA = [
  { time: '12:05 PM', type: 'dispatch', text: 'Dispatch #KS-8902 started: Combine Harvester assigned to Balram Singh (6.0 Bigha)' },
  { time: '11:58 AM', type: 'kyc', text: 'AgriStack UPFR Record verified for Farmer Balram Singh (UPFR-2026-88910)' },
  { time: '11:42 AM', type: 'payment', text: 'UPI Payment Confirmed: ₹3,900 for Booking #KS-8901 via BharatPay Gateway' },
  { time: '11:30 AM', type: 'rates', text: 'Dynamic Base Rate updated for Combine Harvester: ₹1,500/bigha by Admin' },
  { time: '10:45 AM', type: 'driver', text: 'Driver KYC Approved: Jagjit Singh (UP-32-KR-7744 • Mahindra 575 DI)' },
  { time: '09:15 AM', type: 'system', text: 'Vahan & Sarathi API Gateway Sync completed: 0 document rejections' }
];

export default function AdminPortal() {
  const { lang, t } = useLanguage();
  const { isDark } = useTheme();
  const { setDriverVerification, setActiveRole } = useAuth();
  const { 
    pendingApplications, 
    approveApplication, 
    rejectApplication 
  } = useRealtimeSync();
  const { 
    rates, 
    updateRates, 
    resetToDefaultRates, 
    selectedZoneId, 
    selectedSeasonId, 
    applyRegionalAndSeasonalSurge 
  } = usePricing();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'kyc' | 'directory' | 'pricing'
  const [inspectingApp, setInspectingApp] = useState(null);
  const [isBugReportModalOpen, setIsBugReportModalOpen] = useState(false);

  // Regional & Seasonal State
  const [activeZoneId, setActiveZoneId] = useState(selectedZoneId || 'up_purvanchal');
  const [activeSeasonId, setActiveSeasonId] = useState(selectedSeasonId || 'normal_cycle');

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

  const handleSelectZone = (zoneId) => {
    setActiveZoneId(zoneId);
    const computed = calculateDynamicRates(zoneId, activeSeasonId);
    setEditableRates({
      tractorBigha: computed.tractor.ratePerBigha,
      harvesterBigha: computed.harvester.ratePerBigha,
      jcbHour: computed.jcb.ratePerHour,
      truckBase: computed.truck.baseLoadingCharge,
      truckKm: computed.truck.ratePerKm
    });
  };

  const handleSelectSeason = (seasonId) => {
    setActiveSeasonId(seasonId);
    const computed = calculateDynamicRates(activeZoneId, seasonId);
    setEditableRates({
      tractorBigha: computed.tractor.ratePerBigha,
      harvesterBigha: computed.harvester.ratePerBigha,
      jcbHour: computed.jcb.ratePerHour,
      truckBase: computed.truck.baseLoadingCharge,
      truckKm: computed.truck.ratePerKm
    });
  };

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
    applyRegionalAndSeasonalSurge(activeZoneId, activeSeasonId);
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
    setActiveZoneId('up_purvanchal');
    setActiveSeasonId('normal_cycle');
    const defaultRates = calculateDynamicRates('up_purvanchal', 'normal_cycle');
    setEditableRates({
      tractorBigha: defaultRates.tractor.ratePerBigha,
      harvesterBigha: defaultRates.harvester.ratePerBigha,
      jcbHour: defaultRates.jcb.ratePerHour,
      truckBase: defaultRates.truck.baseLoadingCharge,
      truckKm: defaultRates.truck.ratePerKm
    });
    setSaveSuccessBanner(true);
    setTimeout(() => setSaveSuccessBanner(false), 3000);
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-[#1A4F32] selection:text-white transition-colors duration-500 ${
      isDark ? 'bg-[#080E0B] text-[#EAEFEA]' : 'bg-[#FDFBF7] text-[#0B1E14]'
    }`}>
      
      {/* ══════════════ SUB-COMMAND TABS STRIP ══════════════ */}
      <div className={`border-b py-3 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        isDark ? 'bg-[#080E0B]/80 border-white/[0.05]' : 'bg-[#FDFBF7]/80 border-black/[0.04]'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Navigation Pill Tabs */}
          <nav className="flex items-center p-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold bg-black/[0.02] dark:bg-white/[0.03]">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#0B1E14] dark:bg-[#EAEFEA] text-white dark:text-[#0B1E14] shadow-sm'
                  : 'text-[#4F6358] dark:text-[#9FB1A7] hover:text-[#0B1E14] dark:hover:text-[#EAEFEA]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'संचालन एवं डिस्पैच' : 'Operations & Dispatches'}</span>
            </button>

            <button
              onClick={() => setActiveTab('kyc')}
              className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 relative cursor-pointer ${
                activeTab === 'kyc'
                  ? 'bg-[#0B1E14] dark:bg-[#EAEFEA] text-white dark:text-[#0B1E14] shadow-sm'
                  : 'text-[#4F6358] dark:text-[#9FB1A7] hover:text-[#0B1E14] dark:hover:text-[#EAEFEA]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'केवाईसी ऑडिट' : 'KYC Queue'}</span>
              {pendingApplications.length > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-[#1A4F32] dark:bg-[#4ADE80] text-white dark:text-[#0B1E14] font-bold">
                  {pendingApplications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-[#0B1E14] dark:bg-[#EAEFEA] text-white dark:text-[#0B1E14] shadow-sm'
                  : 'text-[#4F6358] dark:text-[#9FB1A7] hover:text-[#0B1E14] dark:hover:text-[#EAEFEA]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'फ्लीट इन्वेंटरी' : 'Fleet Inventory'}</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-[#0B1E14] dark:bg-[#EAEFEA] text-white dark:text-[#0B1E14] shadow-sm'
                  : 'text-[#4F6358] dark:text-[#9FB1A7] hover:text-[#0B1E14] dark:hover:text-[#EAEFEA]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'मूल्य निर्धारण' : 'Rates Engine'}</span>
            </button>
          </nav>

          {/* Right Status Badge & Actions */}
          <div className="flex items-center gap-2.5">
            <div className={`hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] font-medium ${
              isDark ? 'bg-white/[0.03] border-white/[0.08] text-[#9FB1A7]' : 'bg-black/[0.02] border-black/[0.06] text-[#4F6358]'
            }`}>
              <span className="w-2 h-2 rounded-full bg-[#1A4F32] dark:bg-[#4ADE80] animate-pulse" />
              <span>Malihabad Node: Live</span>
            </div>

            {/* Direct Backend Issue Report Button */}
            <button
              onClick={() => setIsBugReportModalOpen(true)}
              className="px-3.5 py-2 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs shadow-sm transition-all duration-300 flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title={lang === 'hi' ? 'बैकएंड टीम को समस्या रिपोर्ट करें' : 'Report Issue to Backend Team'}
            >
              <Bug className="w-3.5 h-3.5 text-red-500" />
              <span>{lang === 'hi' ? 'समस्या रिपोर्ट करें' : 'Report Backend Issue'}</span>
            </button>

            <button
              onClick={() => {
                window.location.hash = '';
                setActiveRole('landing');
              }}
              className="px-4 py-2 rounded-full bg-[#0B1E14] hover:bg-[#153424] dark:bg-[#EAEFEA] dark:hover:bg-white text-white dark:text-[#0B1E14] font-medium text-xs shadow-sm transition-all duration-300 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
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
        {/* TAB 1: OPERATIONS, DISPATCHES & AUDIT LEDGER  */}
        {/* ═════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* 4 SLEEK KPI STAT CARDS WITH LIVE TREND BADGES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Stat 1: Total Active Bookings */}
              <div className={`p-5 rounded-3xl border shadow-lg relative overflow-hidden transition-all duration-200 ${
                isDark ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/60'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                    Active Field Dispatches
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    42 Orders
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[10px]">
                      <ArrowUpRight className="w-3 h-3" /> +14.2%
                    </span>
                    <span className={isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}>today (Live Stream)</span>
                  </div>
                </div>
              </div>

              {/* Stat 2: Live Fleets Online */}
              <div className={`p-5 rounded-3xl border shadow-lg relative overflow-hidden transition-all duration-200 ${
                isDark ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/60'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                    Operational Machinery
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                    <Tractor className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    18 Units Ready
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className={isDark ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600'}>11 Tractors • 4 Combines • 3 JCBs</span>
                  </div>
                </div>
              </div>

              {/* Stat 3: Gross Farm Coverage */}
              <div className={`p-5 rounded-3xl border shadow-lg relative overflow-hidden transition-all duration-200 ${
                isDark ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/60'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
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
                    <span className={isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}>serviced this week</span>
                  </div>
                </div>
              </div>

              {/* Stat 4: Network Uptime & Driver Payouts */}
              <div className={`p-5 rounded-3xl border shadow-lg relative overflow-hidden transition-all duration-200 ${
                isDark ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/60'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                    Gross GMV & Disbursals
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
                    <span className={isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}>Direct Driver Payouts</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ══════════════ LIVE PLATFORM DISPATCHES PIPELINE ══════════════ */}
            <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
              isDark ? 'bg-stone-900/90 border-slate-200 dark:border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {lang === 'hi' ? 'लाइव प्लेटफॉर्म बुकिंग एवं डिस्पैच मॉनिटर' : 'Live Bookings & Field Dispatch Monitor'}
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                      Real-time machinery dispatch ledger across farm plots in Malihabad
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-xs font-black">
                    ⚡ Live Broadcast Stream
                  </span>
                </div>
              </div>

              {/* Data Table for Live Dispatches */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b uppercase font-black tracking-wider text-[10px] ${
                    isDark ? 'bg-stone-950/80 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}>
                    <tr>
                      <th className="py-3.5 px-4">Booking ID & Farmer</th>
                      <th className="py-3.5 px-4">Service & Plot Size</th>
                      <th className="py-3.5 px-4">Assigned Operator & Vehicle</th>
                      <th className="py-3.5 px-4">Live Dispatch State</th>
                      <th className="py-3.5 px-4">Billing & Escrow</th>
                      <th className="py-3.5 px-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/40">
                    {LIVE_DISPATCHES_DATA.map(dispatch => (
                      <tr key={dispatch.bookingId} className={`hover:bg-emerald-500/5 transition-colors ${
                        isDark ? 'text-stone-200' : 'text-slate-800'
                      }`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{dispatch.vehicleIcon}</span>
                            <div>
                              <span className="font-black text-sm block">{dispatch.farmerName}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                #{dispatch.bookingId} • {dispatch.village}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div>
                            <span className="font-bold text-xs block">{dispatch.serviceType}</span>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold">
                              {dispatch.farmPlot}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div>
                            <span className="font-bold text-xs block">{dispatch.operatorName}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              {dispatch.operatorPlate} • {dispatch.operatorPhone}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                            dispatch.status === 'in_progress'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                              : dispatch.status === 'en_route'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800/80'
                              : 'bg-blue-950 text-blue-400 border border-blue-800/80'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              dispatch.status === 'in_progress' ? 'bg-emerald-400 animate-ping' : 'bg-current'
                            }`} />
                            <span>{dispatch.statusText}</span>
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div>
                            <span className="font-black text-sm text-emerald-400 font-mono block">
                              ₹{dispatch.amount.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {dispatch.paymentMode}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                            {dispatch.startTime}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ══════════════ 2-COLUMN OPERATIONAL AUDIT & FLEET HEALTH ══════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left 7 Cols: Real-Time Audit Event Log */}
              <div className={`lg:col-span-7 p-6 rounded-3xl border shadow-xl space-y-4 ${
                isDark ? 'bg-stone-900/90 border-slate-200 dark:border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/40">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <h4 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {lang === 'hi' ? 'सिस्टम ऑडिट एवं सुरक्षा लॉग्स' : 'System Audit & Activity Logs'}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">REAL-TIME FEED</span>
                </div>

                <div className="space-y-3">
                  {AUDIT_LOGS_DATA.map((log, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-2xl border flex items-start gap-3 text-xs ${
                        isDark ? 'bg-stone-950 border-slate-200 dark:border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="font-mono text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 shrink-0">
                        {log.time}
                      </span>
                      <p className={`font-medium ${isDark ? 'text-slate-700 dark:text-slate-300' : 'text-slate-700'}`}>
                        {log.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 5 Cols: Machinery Availability Breakdown */}
              <div className={`lg:col-span-5 p-6 rounded-3xl border shadow-xl space-y-4 flex flex-col justify-between ${
                isDark ? 'bg-stone-900/90 border-slate-200 dark:border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/40">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-emerald-400" />
                      <h4 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {lang === 'hi' ? 'मशीनरी उपलब्धता अनुपात' : 'Fleet Availability Ratio'}
                      </h4>
                    </div>
                    <span className="text-xs font-black text-emerald-400">98.4% Health</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>🚜 Tractors & Implements</span>
                        <span className="text-emerald-400">18 / 24 Available</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>🌾 Combine Harvesters</span>
                        <span className="text-amber-400">5 / 8 Available</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '62.5%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>🏗️ Earthmovers (JCB)</span>
                        <span className="text-blue-400">4 / 6 Available</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '66.7%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>🚚 Agri Transport Trucks</span>
                        <span className="text-purple-400">8 / 10 Available</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                  isDark ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold">AgriStack Vahan Auto-Audit Node</span>
                  </div>
                  <span className="font-mono font-black text-[10px]">ALL ACTIVE</span>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800/40">
              <div>
                <h2 className={`text-xl font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>{t('pendingDrivers')} ({pendingApplications.length})</span>
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                  Review submitted Driving Licenses, Vehicle RC plates & approve for instant fleet dispatch
                </p>
              </div>
            </div>

            {pendingApplications.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl border shadow-lg space-y-3 ${
                isDark ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
                  ✅
                </div>
                <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('noPending')}
                </h3>
                <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
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
                      isDark ? 'bg-stone-900/90 border-slate-200 dark:border-slate-800' : 'bg-white border-slate-200'
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
                          <p className={`text-xs font-bold ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                            {app.phone} • <span className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>{app.modelName}</span>
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/60 font-black text-[10px] uppercase tracking-wider">
                        {app.submittedAt}
                      </span>
                    </div>

                    <div className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs ${
                      isDark ? 'bg-stone-950 border-slate-200 dark:border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div>
                        <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                          Vehicle Number
                        </span>
                        <span className={`font-black text-sm font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {app.vehicleNumber}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                          Platform Dynamic Rates
                        </span>
                        <span className="font-extrabold text-emerald-500 text-xs">
                          Auto-Managed by Admin Node
                        </span>
                      </div>
                    </div>

                    {/* Documents Thumbnail Previews */}
                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        onClick={() => setInspectingApp(app)}
                        className={`border rounded-2xl p-2 cursor-pointer transition text-center group ${
                          isDark ? 'bg-stone-950 border-slate-200 dark:border-slate-800 hover:border-emerald-500/60' : 'bg-slate-50 border-slate-200 hover:border-emerald-500'
                        }`}
                      >
                        <img
                          src={app.dlPhoto}
                          alt="DL"
                          className="w-full h-24 object-cover rounded-xl border border-stone-700 group-hover:opacity-90 transition-opacity"
                        />
                        <span className="mt-1 block text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-emerald-400">
                          🔍 {t('dlPreview')}
                        </span>
                      </div>

                      <div 
                        onClick={() => setInspectingApp(app)}
                        className={`border rounded-2xl p-2 cursor-pointer transition text-center group ${
                          isDark ? 'bg-stone-950 border-slate-200 dark:border-slate-800 hover:border-emerald-500/60' : 'bg-slate-50 border-slate-200 hover:border-emerald-500'
                        }`}
                      >
                        <img
                          src={app.platePhoto}
                          alt="Plate"
                          className="w-full h-24 object-cover rounded-xl border border-stone-700 group-hover:opacity-90 transition-opacity"
                        />
                        <span className="mt-1 block text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-emerald-400">
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
                            ? 'border-stone-700 text-slate-700 dark:text-slate-300 hover:bg-stone-800' 
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
        {/* TAB 3: FLEET INVENTORY & DATA TABLE           */}
        {/* ═════════════════════════════════════════════ */}
        {activeTab === 'directory' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/40">
              <div>
                <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {lang === 'hi' ? 'पंजीकृत फ्लीट एवं मशीनरी इन्वेंटरी' : 'Registered Fleet & Machinery Inventory'}
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                  Directory of all authorized drivers, machinery specs, implements and verification states
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fleetSearch}
                  onChange={(e) => setFleetSearch(e.target.value)}
                  placeholder="Search by driver, model or plate..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs font-bold outline-none focus:border-emerald-500 ${
                    isDark ? 'border-slate-200 dark:border-slate-800 bg-stone-900 text-white' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* High-Contrast Data Table */}
            <div className={`rounded-3xl border shadow-xl overflow-hidden ${
              isDark ? 'bg-stone-900/90 border-slate-200 dark:border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b uppercase font-black tracking-wider text-[10px] ${
                    isDark ? 'bg-stone-950/80 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
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
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{fleet.id} • {fleet.phone}</span>
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
                            <span className="font-mono font-black text-xs px-2 py-1 rounded-lg bg-stone-950 border border-slate-200 dark:border-slate-800 text-emerald-400">
                              {fleet.vehicleNumber}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 font-bold">
                              <span className="text-amber-400">★</span>
                              <span>{fleet.rating}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">({fleet.completedJobs} rides)</span>
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
        {/* TAB 4: DYNAMIC REGIONAL & SEASONAL PRICING    */}
        {/* ═════════════════════════════════════════════ */}
        {activeTab === 'pricing' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header Box */}
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
              isDark ? 'bg-stone-900/90 border-slate-200 dark:border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/40 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-xs font-black uppercase tracking-wider">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Regional Agro-Boom & Seasonal Pricing Engine</span>
                  </div>
                  <h2 className={`text-2xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {lang === 'hi' ? 'क्षेत्रीय कृषि बूम व मौसमी मांग आधारित दर प्रबंधन' : 'Regional Agro-Boom & Seasonal Demand Rates Management'}
                  </h2>
                  <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                    {lang === 'hi' 
                      ? 'यूपी पूर्वांचल आधार दर (₹1,300/बीघा) के अनुसार विभिन्न राज्यों के कृषि बूम व कटाई/बुवाई पीक सीजन के आधार पर डायनामिक दरें तय करें।' 
                      : 'Anchor pricing based on UP Purvanchal (₹1,300/bigha base), scaling dynamically for high-intensity cash-crop boom belts (Maharashtra, Granary) & harvest season surges.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetRates}
                  className={`px-4 py-2.5 rounded-2xl border font-bold text-xs flex items-center gap-1.5 transition shrink-0 ${
                    isDark 
                      ? 'border-stone-700 text-slate-700 dark:text-slate-300 hover:bg-stone-800' 
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to UP Baseline</span>
                </button>
              </div>

              {/* ══════════════ 1. REGIONAL AGRO-BOOM SELECTOR ══════════════ */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}>
                    <Globe className="w-4 h-4" />
                    <span>1. Select State / Agricultural Zone (राज्य व कृषि बूम क्षेत्र)</span>
                  </label>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Active: <span className="text-emerald-400 font-black">{REGIONAL_AGRO_ZONES.find(z => z.id === activeZoneId)?.nameEn}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {REGIONAL_AGRO_ZONES.map(zone => {
                    const isSelected = activeZoneId === zone.id;
                    return (
                      <div
                        key={zone.id}
                        onClick={() => handleSelectZone(zone.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-left relative overflow-hidden ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-500/30'
                            : isDark
                            ? 'border-slate-200 dark:border-slate-800 bg-stone-950 hover:border-stone-700 hover:bg-stone-900/60'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className={`font-black text-xs ${
                            isSelected ? 'text-emerald-400' : isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            {zone.nameEn}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 ${
                            zone.multiplier > 1.1
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : zone.multiplier < 1.0
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}>
                            {zone.tag}
                          </span>
                        </div>

                        <p className={`text-[11px] leading-snug line-clamp-2 ${
                          isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600'
                        }`}>
                          {zone.description}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/40 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-500 dark:text-slate-400">Multiplier:</span>
                          <span className="font-black text-emerald-400 font-bold">{zone.multiplier}x</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ══════════════ 2. SEASONAL CROP CYCLE & SURGE SELECTOR ══════════════ */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                    isDark ? 'text-amber-400' : 'text-amber-700'
                  }`}>
                    <Zap className="w-4 h-4" />
                    <span>2. Seasonal Crop Cycle & Demand Surge (फसल चक्र व पीक सीजन मांग)</span>
                  </label>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Active Season: <span className="text-amber-400 font-black">{SEASONAL_CROP_CYCLES.find(s => s.id === activeSeasonId)?.nameEn}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SEASONAL_CROP_CYCLES.map(season => {
                    const isSelected = activeSeasonId === season.id;
                    return (
                      <div
                        key={season.id}
                        onClick={() => handleSelectSeason(season.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-left relative overflow-hidden ${
                          isSelected
                            ? 'border-amber-500 bg-amber-950/40 shadow-lg shadow-amber-500/15 ring-2 ring-amber-500/30'
                            : isDark
                            ? 'border-slate-200 dark:border-slate-800 bg-stone-950 hover:border-stone-700 hover:bg-stone-900/60'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={`font-black text-xs ${
                            isSelected ? 'text-amber-400' : isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            {season.nameEn}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 ${
                            season.surgeMultiplier > 1.05
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : season.surgeMultiplier < 1.0
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}>
                            {season.surgeMultiplier}x Surge
                          </span>
                        </div>

                        <p className={`text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1`}>
                          🌾 {season.activeCrops}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                          {season.demandFocus}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ══════════════ 3. DYNAMIC FORMULA BREAKDOWN BANNER ══════════════ */}
              {(() => {
                const currentZone = REGIONAL_AGRO_ZONES.find(z => z.id === activeZoneId) || REGIONAL_AGRO_ZONES[0];
                const currentSeason = SEASONAL_CROP_CYCLES.find(s => s.id === activeSeasonId) || SEASONAL_CROP_CYCLES[0];
                const totalMultiplier = (currentZone.multiplier * currentSeason.surgeMultiplier).toFixed(2);

                return (
                  <div className={`mt-6 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isDark ? 'bg-stone-950 border-emerald-500/30 text-stone-200' : 'bg-emerald-50 border-emerald-200 text-slate-800'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-stone-950 font-black text-[10px] uppercase">
                          Dynamic Rate Matrix
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {currentZone.nameEn} • {currentSeason.nameEn}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        Formula: ₹1,300 (UP Purvanchal Base) × {currentZone.multiplier}x (Agro Boom) × {currentSeason.surgeMultiplier}x (Season Surge) = <span className="text-emerald-400 font-black">₹{editableRates.tractorBigha} / Bigha (Combined Multiplier: {totalMultiplier}x)</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-bold">Total Effective Factor</span>
                      <span className="text-xl font-black text-emerald-400 font-mono">{totalMultiplier}x</span>
                    </div>
                  </div>
                );
              })()}

              {/* ══════════════ 4. EDITABLE RATE FIELDS & SAVE CTA ══════════════ */}
              <form onSubmit={handleSaveRates} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Tractor Rate */}
                  <div className="p-5 rounded-3xl border-2 border-emerald-500/40 bg-emerald-950/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🚜</span>
                      <div>
                        <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Tractor + Implements</h4>
                        <span className="text-[10px] text-emerald-400 font-bold">Dynamic Area Rate (Bigha)</span>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-bold uppercase mb-1.5 ${isDark ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600'}`}>
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
                        <span className="text-[10px] text-amber-400 font-bold">Dynamic Area Rate (Bigha)</span>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-bold uppercase mb-1.5 ${isDark ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600'}`}>
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
                        <span className="text-[10px] text-blue-400 font-bold">Dynamic Hourly Rate (Hours)</span>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-bold uppercase mb-1.5 ${isDark ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600'}`}>
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
                        <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600'}`}>
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
                        <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600'}`}>
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
                  <span>{lang === 'hi' ? 'क्षेत्रीय व मौसमी दरें सुरक्षित करें (Save & Deploy Live Rates)' : 'Save & Deploy Regional & Seasonal Rates Across KrishiSeva Platform'}</span>
                </button>
              </form>

            </div>

          </div>
        )}

      </main>

      {/* ══════════════ SIDE-BY-SIDE DOCUMENT INSPECTION MODAL ══════════════ */}
      {inspectingApp && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border max-h-[90vh] overflow-y-auto space-y-6 ${
            isDark ? 'bg-stone-900 border-slate-200 dark:border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/40">
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
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>{t('dlPreview')} (Driving License)</span>
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-2 bg-stone-950">
                  <img
                    src={inspectingApp.dlPhoto}
                    alt="Driving License Full"
                    className="w-full h-56 object-cover rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>{t('platePreview')} (Number Plate Photo)</span>
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-2 bg-stone-950">
                  <img
                    src={inspectingApp.platePhoto}
                    alt="Number Plate Full"
                    className="w-full h-56 object-cover rounded-xl"
                  />
                </div>
              </div>

            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/40">
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
            
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800/40 pb-4">
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    For {rejectingApp.driverName} ({rejectingApp.vehicleNumber})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRejectingApp(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {lang === 'hi' ? 'मानक कारण चुनें (Preset Reasons)' : 'Select Reason for Driver Notification:'}
              </label>

              <div className="space-y-2">
                {REJECTION_REASON_PRESETS.map((reason, idx) => (
                  <label
                    key={idx}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-2.5 transition text-xs font-bold ${
                      selectedReason === reason && !customReason.trim()
                        ? 'border-red-500 bg-red-950/40 text-red-200'
                        : 'border-slate-200 dark:border-slate-800 bg-stone-950 hover:bg-stone-900 text-slate-700 dark:text-slate-300'
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
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  {lang === 'hi' ? 'या अन्य विशिष्ट कारण लिखें (Custom Reason):' : 'Or Type Custom Specific Reason:'}
                </label>
                <textarea
                  rows="2"
                  placeholder="उदा. ड्राइविंग लाइसेंस का कोना कटा हुआ है, कृपया पूरी फोटो भेजें।"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-stone-950 font-bold text-xs text-white outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingApp(null)}
                  className="w-1/3 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-stone-800"
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

      {/* Backend Bug & Issue Escalation Modal */}
      <AdminBugReportModal
        isOpen={isBugReportModalOpen}
        onClose={() => setIsBugReportModalOpen(false)}
      />

    </div>
  );
}
