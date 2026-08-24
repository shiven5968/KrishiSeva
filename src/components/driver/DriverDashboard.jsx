import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeSync } from '../../context/RealtimeSyncContext';
import LiveMap from '../map/LiveMap';
import IncomingRideModal from './IncomingRideModal';
import DriverNavigation from './DriverNavigation';
import { 
  Tractor, 
  Power, 
  IndianRupee, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Bell, 
  Sparkles,
  TrendingUp,
  History,
  Radio,
  FileText,
  CreditCard,
  Settings,
  Eye,
  Award,
  Phone,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Edit2,
  X,
  Gauge,
  Check,
  Compass,
  Crosshair,
  Zap,
  ArrowUpRight,
  Star
} from 'lucide-react';

export default function DriverDashboard() {
  const { lang, t } = useLanguage();
  const { isDark } = useTheme();
  const { driverProfile, setDriverProfile, toggleDriverDuty } = useAuth();
  const { 
    activeBooking, 
    acceptBooking, 
    rejectBooking, 
    driverCurrentPos,
    routeWaypoints,
    createBookingRequest
  } = useRealtimeSync();

  // Active Tab within Driver Dashboard: 'overview' | 'passport'
  const [activeTab, setActiveTab] = useState('overview');

  // Document Viewer Modal State (for zooming DL or Number Plate)
  const [previewDoc, setPreviewDoc] = useState(null);

  // Rate Editing Modal State
  const [isEditingRates, setIsEditingRates] = useState(false);
  const [rateForm, setRateForm] = useState({
    hourlyRate: driverProfile.hourlyRate || 1000,
    acreRate: driverProfile.acreRate || 1300
  });

  const isOnline = driverProfile.status === 'online';

  // If driver has accepted an active booking, render the full turn-by-turn Navigation Screen
  if (activeBooking && (activeBooking.status === 'accepted' || activeBooking.status === 'arrived' || activeBooking.status === 'in_progress')) {
    return <DriverNavigation />;
  }

  // Trigger a demo ride request for immediate evaluation
  const handleSimulateIncomingRide = () => {
    createBookingRequest({
      farmerName: lang === 'hi' ? 'बलराम किसान' : 'Balram Kisan',
      farmerPhone: '+91 98765 43210',
      farmerLocation: {
        lat: 26.8467,
        lng: 80.9462,
        address: 'Khet #14, Gram Panchayat Rampur, Malihabad'
      },
      machineryType: driverProfile.vehicleType || 'tractor',
      attachment: {
        id: 'rotavator',
        nameKey: 'rotavator',
        descKey: 'rotavatorDesc',
        icon: '⚙️',
        extraRatePerAcre: 200
      },
      landSize: 3,
      sizeUnit: 'bigha',
      estimatedPrice: 3150,
      estimatedETA: lang === 'hi' ? '6-8 मिनट' : '6-8 Mins'
    });
  };

  // Save Updated Rates
  const handleSaveRates = (e) => {
    e.preventDefault();
    setDriverProfile(prev => ({
      ...prev,
      hourlyRate: Number(rateForm.hourlyRate),
      acreRate: Number(rateForm.acreRate)
    }));
    setIsEditingRates(false);
  };

  // Default fallback images for DL and Plate
  const defaultDl = driverProfile.dlPhoto || driverProfile.dlImage || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80';
  const defaultPlate = driverProfile.platePhoto || driverProfile.plateImage || 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=800&auto=format&fit=crop&q=80';

  return (
    <div className={`min-h-screen font-sans selection:bg-emerald-500 selection:text-stone-950 transition-colors duration-200 ${
      isDark ? 'bg-[#090D0B] text-stone-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* ══════════════ MAIN WRAPPER CONTAINER ══════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Incoming Ride Request Modal Popup */}
        {activeBooking && activeBooking.status === 'searching' && isOnline && (
          <IncomingRideModal
            booking={activeBooking}
            onAccept={() => acceptBooking(driverProfile)}
            onReject={rejectBooking}
          />
        )}

        {/* ══════════════ 1. TOP DRIVER HEADER & STATUS BAR ══════════════ */}
        <div className={`rounded-3xl p-5 sm:p-6 border shadow-xl backdrop-blur-xl transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
          isDark 
            ? 'bg-[#111827]/90 border-emerald-500/20 shadow-black/60' 
            : 'bg-white/90 border-slate-200 shadow-slate-200/60'
        }`}>
          
          {/* Driver Identity Left Group */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border ${
                isDark 
                  ? 'bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-900/40 border-emerald-500/30 text-emerald-400 shadow-emerald-950/50' 
                  : 'bg-gradient-to-br from-emerald-100 to-green-200 border-emerald-300 text-emerald-800 shadow-emerald-200'
              }`}>
                {driverProfile.vehicleType === 'harvester' ? '🌾' : driverProfile.vehicleType === 'jcb' ? '🏗️' : '🚜'}
              </div>
              {isOnline && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-stone-900"></span>
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {driverProfile.fullName || 'Rameshwar'}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'hi' ? 'केवाईसी सत्यापित पार्टनर' : 'KYC Verified Partner'}</span>
                </span>
              </div>
              <p className={`text-xs font-bold ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                {driverProfile.modelName || 'Mahindra 575 DI'} • <span className={`font-mono font-black ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{driverProfile.vehicleNumber || 'UP-32-AB-1555'}</span>
              </p>
            </div>
          </div>

          {/* Action Controls: Mode Navigation & High-Contrast Duty Switcher */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            
            {/* Minimalist Tab Pills */}
            <nav className={`flex items-center p-1 rounded-2xl border text-xs font-black shadow-sm ${
              isDark ? 'bg-stone-950 border-stone-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-emerald-500 text-stone-950 shadow-md'
                    : isDark ? 'text-stone-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'लाइव डिस्पैच रडार' : 'Live Dispatch Radar'}</span>
              </button>

              <button
                onClick={() => setActiveTab('passport')}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'passport'
                    ? 'bg-emerald-500 text-stone-950 shadow-md'
                    : isDark ? 'text-stone-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'वाहन व डीएल पासपोर्ट' : 'Vehicle & Passport'}</span>
              </button>
            </nav>

            {/* High-Contrast Online/Offline Duty Toggle */}
            <button
              onClick={toggleDriverDuty}
              className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                isOnline
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                  : isDark
                  ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300'
              }`}
            >
              <Power className={`w-4 h-4 ${isOnline ? 'text-stone-950' : 'text-stone-400'}`} />
              <span>{isOnline ? (lang === 'hi' ? '🟢 ऑन ड्यूटी (Online)' : '🟢 Online / On Duty') : (lang === 'hi' ? '⚪ ऑफ ड्यूटी (Offline)' : '⚪ Off Duty (Offline)')}</span>
            </button>
          </div>

        </div>

        {/* Duty Status Alert Banner */}
        {!isOnline && (
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-bold animate-fade-in ${
            isDark 
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-200' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
              <span>{lang === 'hi' ? 'आप अभी ऑफलाइन हैं। निकटतम किसानों से बुकिंग अनुरोध पाने के लिए "ऑन ड्यूटी" बटन दबाएं।' : 'You are currently Offline. Turn On Duty to start receiving nearby farm booking dispatches.'}</span>
            </div>
            <button
              onClick={toggleDriverDuty}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs transition active:scale-95 shadow-md self-end sm:self-auto"
            >
              {lang === 'hi' ? 'ऑन ड्यूटी हों' : 'Go On Duty'}
            </button>
          </div>
        )}

        {/* ══════════════ 2. KEY METRICS GRID (EARNINGS & TRIPS) ══════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Today's Earnings */}
          <div className={`p-5 rounded-3xl border shadow-xl transition-all duration-200 hover:-translate-y-1 relative overflow-hidden ${
            isDark 
              ? 'bg-[#111827]/90 border-emerald-500/20 shadow-black/50' 
              : 'bg-white border-slate-200 shadow-slate-200/60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                {lang === 'hi' ? 'आज की कुल कमाई' : "Today's Earnings"}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-lg">
                ₹
              </div>
            </div>
            <div className="space-y-1">
              <h3 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                ₹{driverProfile.totalEarnings.toLocaleString()}
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[10px]">
                  <ArrowUpRight className="w-3 h-3" /> +0%
                </span>
                <span className={isDark ? 'text-stone-400' : 'text-slate-500'}>vs yesterday</span>
              </div>
            </div>
          </div>

          {/* Card 2: Completed Jobs */}
          <div className={`p-5 rounded-3xl border shadow-xl transition-all duration-200 hover:-translate-y-1 relative overflow-hidden ${
            isDark 
              ? 'bg-[#111827]/90 border-emerald-500/20 shadow-black/50' 
              : 'bg-white border-slate-200 shadow-slate-200/60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                {lang === 'hi' ? 'कुल संपन्न कार्य' : 'Completed Jobs'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center text-lg">
                🚜
              </div>
            </div>
            <div className="space-y-1">
              <h3 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {driverProfile.completedRides} {lang === 'hi' ? 'खेत' : 'Khets'}
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className={isDark ? 'text-stone-300' : 'text-slate-600'}>Direct Escrow Disbursal</span>
              </div>
            </div>
          </div>

          {/* Card 3: Driver Rating */}
          <div className={`p-5 rounded-3xl border shadow-xl transition-all duration-200 hover:-translate-y-1 relative overflow-hidden ${
            isDark 
              ? 'bg-[#111827]/90 border-emerald-500/20 shadow-black/50' 
              : 'bg-white border-slate-200 shadow-slate-200/60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                {lang === 'hi' ? 'चालक रेटिंग' : 'Driver Rating'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center text-lg">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {driverProfile.rating || '5.0'} / 5.0
              </h3>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <span>★★★★★</span>
                <span className={`ml-1 text-[11px] ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>Top Rated Partner</span>
              </div>
            </div>
          </div>

        </div>

        {/* ══════════════ 3. MAIN DASHBOARD CONTENT AREA ══════════════ */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            
            {/* Left 8 Cols: Operating Radar & Dispatch Map */}
            <div className="lg:col-span-8 space-y-4">
              <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl space-y-4 backdrop-blur-xl ${
                isDark 
                  ? 'bg-[#111827]/90 border-emerald-500/20 shadow-black/50' 
                  : 'bg-white border-slate-200 shadow-slate-200/60'
              }`}>
                
                {/* Header with Radar Pulse */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800/40">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-stone-500'}`} />
                    <div>
                      <h4 className={`text-base font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <span>{lang === 'hi' ? 'चालक लाइव ऑपरेटिंग रडार' : 'Driver Operating Radar (5 km Radius)'}</span>
                      </h4>
                      <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                        {lang === 'hi' 
                          ? 'मलिहाबाद व आसपास के खेतों से लाइव बुकिंग अनुरोध रडार पर दिखाई देंगे।' 
                          : 'Real-time telemetry and incoming farm dispatch requests across Malihabad.'}
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider self-start sm:self-auto border ${
                    isOnline 
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40' 
                      : 'bg-stone-900 text-stone-400 border-stone-800'
                  }`}>
                    {isOnline ? (lang === 'hi' ? 'रडार सक्रिय • अनुरोध स्कैन हो रहे हैं 🟢' : 'Radar Active • Scanning for Requests') : (lang === 'hi' ? 'रडार बंद ⚪' : 'Radar Paused ⚪')}
                  </span>
                </div>

                {/* Map Container */}
                <div className="relative rounded-2xl overflow-hidden border border-stone-800/80 shadow-inner">
                  <LiveMap
                    farmerLocation={null}
                    driverPos={driverCurrentPos}
                    activeVehicleType={driverProfile.vehicleType}
                    showNearbyDrivers={false}
                    bookingStatus={isOnline ? 'idle' : 'offline'}
                    isDriverView={true}
                    className="h-[340px] w-full rounded-2xl"
                  />
                </div>

                {/* Demo Ride Trigger (For Testing) */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSimulateIncomingRide}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1"
                  >
                    <span>⚡ Simulate Incoming Farm Request (Demo)</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Right 4 Cols: Machine Rates & Fleet Passport Card */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Rate Manager Card */}
              <div className={`p-6 rounded-3xl border shadow-xl backdrop-blur-xl space-y-4 ${
                isDark 
                  ? 'bg-[#111827]/90 border-emerald-500/20 shadow-black/50' 
                  : 'bg-white border-slate-200 shadow-slate-200/60'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-stone-800/40">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {lang === 'hi' ? 'आपकी मशीनरी दरें' : 'Machine Rates & Yield'}
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsEditingRates(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition active:scale-95"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{lang === 'hi' ? 'दरें बदलें' : 'Edit Rates'}</span>
                  </button>
                </div>
                
                <div className="space-y-2.5 text-xs">
                  <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
                    isDark ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={isDark ? 'text-stone-400 font-medium' : 'text-slate-500 font-semibold'}>
                      {lang === 'hi' ? 'प्रति घंटा दर' : 'Hourly Rate'}
                    </span>
                    <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ₹{driverProfile.hourlyRate || 1000} / {lang === 'hi' ? 'घंटा' : 'hr'}
                    </span>
                  </div>

                  <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
                    isDark ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={isDark ? 'text-stone-400 font-medium' : 'text-slate-500 font-semibold'}>
                      {lang === 'hi' ? 'प्रति बीघा दर' : 'Per Bigha Rate'}
                    </span>
                    <span className="font-black text-sm text-emerald-400">
                      ₹{driverProfile.acreRate || 1300} / {lang === 'hi' ? 'बीघा' : 'bigha'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Digital Vehicle Passport Card (Styled like a Dark Metallic ID) */}
              <div 
                onClick={() => setActiveTab('passport')}
                className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-emerald-950/80 border border-emerald-500/30 text-white cursor-pointer hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-200 space-y-4 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-mono">
                      {lang === 'hi' ? 'डिजिटल वाहन पासपोर्ट' : 'DIGITAL VEHICLE PASSPORT'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="space-y-1">
                  <h5 className="font-black text-lg text-white">
                    {driverProfile.modelName || 'Mahindra 575 DI'}
                  </h5>
                  <p className="text-xs font-mono text-emerald-300 font-black px-2.5 py-1 rounded-lg bg-stone-900/90 border border-emerald-500/20 inline-block">
                    {driverProfile.vehicleNumber || 'UP-32-AB-1555'}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Category: {driverProfile.vehicleType?.toUpperCase() || 'TRACTOR'}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>RC Verified</span>
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ══════════════ 4. PASSPORT & DL DETAILS TAB ══════════════ */}
        {activeTab === 'passport' && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Commercial Driving License (DL) */}
              <div className="lg:col-span-6 space-y-6">
                
                <div className={`p-6 rounded-3xl border shadow-xl backdrop-blur-xl space-y-5 ${
                  isDark 
                    ? 'bg-[#111827]/90 border-emerald-500/20 shadow-black/50' 
                    : 'bg-white border-slate-200 shadow-slate-200/60'
                }`}>
                  <div className="flex items-center justify-between border-b border-stone-800/40 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xl shadow-inner">
                        🪪
                      </div>
                      <div>
                        <h4 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {lang === 'hi' ? 'कमर्शियल ड्राइविंग लाइसेंस (DL)' : 'Commercial Driving License (DL)'}
                        </h4>
                        <p className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                          {lang === 'hi' ? 'परिवहन विभाग, उत्तर प्रदेश सरकार' : 'Government Transport Authority of Uttar Pradesh'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>{lang === 'hi' ? 'सत्यापित' : 'Active & Verified'}</span>
                    </span>
                  </div>

                  {/* DL Photo Preview with Zoom button */}
                  <div className="relative group overflow-hidden rounded-2xl border-2 border-stone-800 bg-stone-950 h-56 flex items-center justify-center">
                    <img
                      src={defaultDl}
                      alt="Driving License Document"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent flex items-end justify-between p-4">
                      <div className="text-white">
                        <span className="text-[10px] font-bold text-emerald-400 bg-stone-900/90 px-2 py-0.5 rounded border border-emerald-500/30">
                          {lang === 'hi' ? 'डीएल सत्यापित' : 'DL Verified'}
                        </span>
                        <p className="text-xs font-mono font-bold mt-1">
                          {lang === 'hi' ? 'चालक: ' : 'Holder: '}{driverProfile.fullName || 'Rameshwar'}
                        </p>
                      </div>

                      <button
                        onClick={() => setPreviewDoc({ title: lang === 'hi' ? 'कमर्शियल ड्राइविंग लाइसेंस' : 'Commercial Driving License', image: defaultDl, type: 'DL Document' })}
                        className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-900 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'देखें' : 'Inspect'}</span>
                      </button>
                    </div>
                  </div>

                  {/* DL Metadata Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`text-[10px] block font-bold ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'लाइसेंस श्रेणी' : 'License Class'}</span>
                      <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{lang === 'hi' ? 'हैवी ट्रैक्टर / कृषि मशीनरी' : 'Heavy Commercial Tractor'}</span>
                    </div>
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`text-[10px] block font-bold ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'आरटीओ प्राधिकरण' : 'RTO Authority'}</span>
                      <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>RTO Malihabad (UP-32)</span>
                    </div>
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`text-[10px] block font-bold ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'पंजीकृत फोन' : 'Registered Phone'}</span>
                      <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{driverProfile.phone || '9876501234'}</span>
                    </div>
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`text-[10px] block font-bold ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'सुरक्षा रिकॉर्ड' : 'Safety Record'}</span>
                      <span className="font-black text-emerald-400">{lang === 'hi' ? '100% स्वच्छ रिकॉर्ड' : '100% Clean Record'}</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Column: Vehicle Machinery Passport & RC Plate Details */}
              <div className="lg:col-span-6 space-y-6">
                
                <div className={`p-6 rounded-3xl border shadow-xl backdrop-blur-xl space-y-5 ${
                  isDark 
                    ? 'bg-[#111827]/90 border-emerald-500/20 shadow-black/50' 
                    : 'bg-white border-slate-200 shadow-slate-200/60'
                }`}>
                  <div className="flex items-center justify-between border-b border-stone-800/40 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xl shadow-inner">
                        🚜
                      </div>
                      <div>
                        <h4 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {lang === 'hi' ? 'कृषि मशीनरी पासपोर्ट' : 'Agricultural Machinery Passport'}
                        </h4>
                        <p className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                          {lang === 'hi' ? 'पंजीकृत भारी कृषि उपकरण' : 'Registered Heavy Fleet Equipment'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-500/40">
                      {lang === 'hi' ? 'कमर्शियल आरसी मान्य' : 'Commercial RC Valid'}
                    </span>
                  </div>

                  {/* Number Plate & Machine Photo Preview with Zoom button */}
                  <div className="relative group overflow-hidden rounded-2xl border-2 border-stone-800 bg-stone-950 h-56 flex items-center justify-center">
                    <img
                      src={defaultPlate}
                      alt="Machinery Registration Plate"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent flex items-end justify-between p-4">
                      <div className="text-white">
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-stone-900/90 px-2 py-0.5 rounded border border-amber-500/30">
                          {lang === 'hi' ? 'नंबर: ' : 'Plate: '}{driverProfile.vehicleNumber || 'UP-32-AB-1555'}
                        </span>
                        <p className="text-xs font-bold mt-1">
                          {driverProfile.modelName || 'Mahindra 575 DI'}
                        </p>
                      </div>

                      <button
                        onClick={() => setPreviewDoc({ title: lang === 'hi' ? 'वाहन नंबर प्लेट व आरसी' : 'Vehicle Number Plate & RC Photo', image: defaultPlate, type: 'Machinery RC Document' })}
                        className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-900 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'देखें' : 'Inspect'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Vehicle Machinery Specifications */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`text-[10px] block font-bold ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'श्रेणी' : 'Category'}</span>
                      <span className={`font-black capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>{driverProfile.vehicleType || 'Tractor (50 HP)'}</span>
                    </div>
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`text-[10px] block font-bold ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'इंजन क्षमता' : 'Power Output'}</span>
                      <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>50 - 55 HP</span>
                    </div>
                  </div>

                  {/* Supported Implements & Attachments */}
                  <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className={`text-[11px] font-black uppercase block ${isDark ? 'text-stone-400' : 'text-slate-600'}`}>
                      {lang === 'hi' ? 'संबद्ध कृषि यंत्र व उपकरण:' : 'Supported Implements & Attachments:'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${isDark ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-white border-slate-300 text-slate-800'}`}>
                        ⚙️ {lang === 'hi' ? 'रोटावेटर' : 'Rotavator'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${isDark ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-white border-slate-300 text-slate-800'}`}>
                        🌾 {lang === 'hi' ? 'मिट्टी पलट हल' : 'MB Plough'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${isDark ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-white border-slate-300 text-slate-800'}`}>
                        🌱 {lang === 'hi' ? 'बीज बुवाई मशीन' : 'Seed Drill'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${isDark ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-white border-slate-300 text-slate-800'}`}>
                        🚜 {lang === 'hi' ? '4-पहिया ट्रॉली' : '4-Wheel Trolley'}
                      </span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ══════════════ MODAL 1: DOCUMENT INSPECTION POPUP ══════════════ */}
        {previewDoc && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className={`rounded-3xl max-w-lg w-full p-6 shadow-2xl border relative space-y-4 ${
              isDark ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between border-b border-stone-800/40 pb-3">
                <div>
                  <h4 className="font-black text-base">{previewDoc.title}</h4>
                  <p className="text-xs text-stone-400 font-semibold">{previewDoc.type}</p>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-stone-800 max-h-[60vh]">
                <img src={previewDoc.image} alt={previewDoc.title} className="w-full h-auto object-contain" />
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === 'hi' ? 'कृषि सेवा नेटवर्क पर एन्क्रिप्टेड व सत्यापित' : 'Verified and encrypted in KrishiSeva Driver Network'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ MODAL 2: EDIT MACHINE RATES POPUP ══════════════ */}
        {isEditingRates && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className={`rounded-3xl max-w-md w-full p-6 shadow-2xl border relative space-y-5 ${
              isDark ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between border-b border-stone-800/40 pb-3">
                <h4 className="font-black text-base">{lang === 'hi' ? 'मशीनरी किराया दरें अपडेट करें' : 'Update Machinery Rental Rates'}</h4>
                <button
                  onClick={() => setIsEditingRates(false)}
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRates} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    {lang === 'hi' ? 'प्रति घंटा दर (₹) *' : 'Hourly Rate (₹) *'}
                  </label>
                  <input
                    type="number"
                    min="200"
                    step="50"
                    required
                    value={rateForm.hourlyRate}
                    onChange={(e) => setRateForm({ ...rateForm, hourlyRate: e.target.value })}
                    className={`w-full px-4 py-3 rounded-2xl border font-black text-base outline-none focus:border-emerald-500 ${
                      isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    {lang === 'hi' ? 'प्रति बीघा जुताई दर (₹) *' : 'Per Bigha Rate (₹) *'}
                  </label>
                  <input
                    type="number"
                    min="300"
                    step="50"
                    required
                    value={rateForm.acreRate}
                    onChange={(e) => setRateForm({ ...rateForm, acreRate: e.target.value })}
                    className={`w-full px-4 py-3 rounded-2xl border font-black text-base text-emerald-400 outline-none focus:border-emerald-500 ${
                      isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingRates(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-700 text-stone-300 font-bold text-xs hover:bg-stone-800"
                  >
                    {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs shadow-md transition active:scale-95"
                  >
                    {lang === 'hi' ? 'दरें सहेजें' : 'Save Rates'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
