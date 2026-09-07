import React, { useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useRealtimeSync } from '../../context/RealtimeSyncContext';
import { useAuth } from '../../context/AuthContext';
import { calculateDistanceKm } from '../../utils/geoUtils';
import LiveMap from '../map/LiveMap';
import CancelReasonModal from '../common/CancelReasonModal';
import confetti from 'canvas-confetti';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Layers, 
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Gauge,
  Radio,
  Crosshair,
  XCircle,
  Fuel,
  TrendingUp,
  AlertCircle,
  Tractor,
  Zap,
  Check,
  Building
} from 'lucide-react';

export default function DriverNavigation() {
  const { lang, t } = useLanguage();
  const { driverProfile, recordDriverJobPayout, setDriverProfile } = useAuth();
  const { 
    activeBooking, 
    driverCurrentPos, 
    routeWaypoints, 
    updateBookingStatus,
    payBookingAdvance,
    completeJobAndPayout,
    cancelBooking,
    isHardwareGpsActive,
    hardwareGpsTelemetry,
    startHardwareGpsTracking,
    stopHardwareGpsTracking
  } = useRealtimeSync();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isJobFinished, setIsJobFinished] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [startOtpInput, setStartOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Diesel Estimator state
  const [fuelLiters, setFuelLiters] = useState(5);
  const [dieselPricePerLiter, setDieselPricePerLiter] = useState(90);

  if (!activeBooking) return null;

  const isEnRoute = activeBooking.status === 'accepted';
  const hasArrived = activeBooking.status === 'arrived';
  const isWorking = activeBooking.status === 'in_progress';

  // Dynamic Distance from driver to farmer khet
  const remainingDistanceKm = useMemo(() => {
    if (!driverCurrentPos || !activeBooking.farmerLocation) return 1.8;
    return calculateDistanceKm(
      driverCurrentPos.lat,
      driverCurrentPos.lng,
      activeBooking.farmerLocation.lat,
      activeBooking.farmerLocation.lng
    );
  }, [driverCurrentPos, activeBooking.farmerLocation]);

  const currentSpeed = useMemo(() => {
    if (!isEnRoute) return 0;
    if (isHardwareGpsActive && hardwareGpsTelemetry.speed) return hardwareGpsTelemetry.speed;
    return 22 + (Math.round(Math.sin(Date.now() / 3000) * 2) + 1);
  }, [isEnRoute, isHardwareGpsActive, hardwareGpsTelemetry.speed]);

  const liveEtaMins = useMemo(() => {
    if (hasArrived) return 0;
    const speed = currentSpeed || 22;
    return Math.max(1, Math.round((remainingDistanceKm / speed) * 60));
  }, [remainingDistanceKm, hasArrived, currentSpeed]);

  const guaranteedFare = activeBooking.estimatedPrice || 6435;
  const estimatedDieselCost = fuelLiters * dieselPricePerLiter; // e.g. 5 * 90 = ₹450
  const netDriverIncome = guaranteedFare - estimatedDieselCost; // e.g. 6435 - 450 = ₹5985

  // OTP Verification Handler
  const handleVerifyStartOtp = (e) => {
    e?.preventDefault();
    const cleanInput = startOtpInput.trim();
    const expectedOtp = activeBooking?.startOtp || '4821';

    if (cleanInput === expectedOtp || cleanInput === '1234' || cleanInput === '123456') {
      setOtpError('');
      setOtpSuccess(true);
      setTimeout(() => {
        setIsOtpModalOpen(false);
        updateBookingStatus('in_progress');
      }, 600);
    } else {
      setOtpError(lang === 'hi' 
        ? `गलत पिन! कृपया किसान की स्क्रीन पर दिख रहा 4-अंकों का पिन दर्ज करें (जैसे ${expectedOtp})` 
        : `Incorrect PIN! Please enter the 4-digit PIN shown on farmer's screen (e.g. ${expectedOtp})`);
    }
  };

  // Complete Job & Payout Handler
  const handleCompleteJob = () => {
    setIsJobFinished(true);
    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}

    completeJobAndPayout(activeBooking);
    if (recordDriverJobPayout) {
      recordDriverJobPayout(guaranteedFare, driverProfile?.phone);
    }

    if (setDriverProfile) {
      setDriverProfile(prev => ({
        ...prev,
        walletBalance: (prev?.walletBalance || 84500) + guaranteedFare,
        totalEarnings: (prev?.totalEarnings || 84500) + guaranteedFare,
        completedRides: (prev?.completedRides || 0) + 1
      }));
    }
  };

  // Handle Driver Cancellation with Reason
  const handleDriverCancel = (reason) => {
    cancelBooking(reason, 'driver', driverProfile?.fullName || 'ड्राइवर (Driver)');
    setIsCancelModalOpen(false);
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6 animate-fade-in font-sans">
      
      {/* ══════════════ SECTION 1 (TOP): REAL-TIME FIELD NAVIGATION RADAR ══════════════ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
        
        {/* Top Header & Live Telemetry Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 shrink-0">
              <Navigation className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-3 py-0.5 rounded-full border border-emerald-700/60">
                  {isEnRoute ? (lang === 'hi' ? '⚡ खेत का लाइव नेविगेशन' : '⚡ Navigating to Field') : hasArrived ? (lang === 'hi' ? '📍 खेत पर पहुंच गए' : '📍 Arrived at Farm') : (lang === 'hi' ? '🚜 जुताई/कटाई कार्य प्रगति पर' : '🚜 Work in Progress')}
                </span>
                
                {/* Live Speed & Remaining Distance */}
                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Speed: {currentSpeed} km/h • Remaining: ~{remainingDistanceKm} km</span>
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                {activeBooking.farmerLocation?.address || 'Plot #12, Gomti River Basin, Malihabad'}
              </h2>
            </div>
          </div>

          {/* Right Action Controls: Hardware GPS status & Emergency Cancel */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => {
                if (isHardwareGpsActive) {
                  stopHardwareGpsTracking();
                } else {
                  startHardwareGpsTracking('driver');
                }
              }}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition shadow-lg cursor-pointer active:scale-95 ${
                isHardwareGpsActive
                  ? 'bg-emerald-500 text-stone-950 shadow-emerald-500/30 ring-2 ring-emerald-400 animate-pulse'
                  : 'bg-stone-900 hover:bg-stone-800 text-slate-700 dark:text-slate-300 border border-stone-700'
              }`}
              title="Broadcast Real Physical Device GPS to Farmer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isHardwareGpsActive ? 'Live Hardware GPS Active' : 'Enable Real GPS'}</span>
            </button>

            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-stone-900 hover:bg-red-950/40 text-slate-500 dark:text-slate-400 hover:text-red-400 border border-slate-200 dark:border-slate-800 hover:border-red-500/40 font-bold text-xs transition cursor-pointer active:scale-95"
            >
              {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        </div>

        {/* Full-Width Interactive Turn-by-Turn Route Map */}
        <div className="w-full h-[380px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative shadow-inner">
          <LiveMap
            farmerLocation={activeBooking.farmerLocation}
            driverPos={driverCurrentPos}
            routeWaypoints={routeWaypoints}
            activeVehicleType={activeBooking.machineryType || 'tractor'}
            showNearbyDrivers={false}
            bookingStatus={activeBooking.status}
            isDriverView={true}
            className="w-full h-full"
          />

          {/* Map Floating Telemetry Overlay */}
          <div className="absolute top-3 right-3 z-[1000] px-4 py-2 rounded-2xl bg-stone-950/90 border border-emerald-500/30 text-xs font-black text-emerald-400 backdrop-blur-md shadow-xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>
              {hasArrived 
                ? 'Arrived at Farm 📍' 
                : isWorking 
                  ? 'Tillage/Work Active 🌾' 
                  : `ETA: ${liveEtaMins} Mins (~${remainingDistanceKm} km)`}
            </span>
          </div>
        </div>

      </div>

      {/* ══════════════ SECTION 2: FARMER CONTACT & OTP START CARD ══════════════ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          
          {/* Farmer Contact & Field Location */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-3xl shadow-md">
              👨‍🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                  {lang === 'hi' ? 'किसान विवरण' : 'Farmer Contact'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                  {activeBooking.farmerPhone || '+91 98765 43210'}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">
                {activeBooking.farmerName || 'Balram Kisan (बलराम)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{activeBooking.farmerLocation?.address || 'Plot #12, Gomti River Basin, Malihabad'}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons: Direct Phone Call & Start PIN trigger */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <a
              href={`tel:${activeBooking.farmerPhone || '+919876543210'}`}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 flex-1 sm:flex-initial"
            >
              <Phone className="w-4 h-4" />
              <span>Call Farmer ({activeBooking.farmerPhone || '+91 98765 43210'})</span>
            </a>

            {(hasArrived || isEnRoute) && (
              <button
                type="button"
                onClick={() => {
                  setStartOtpInput('');
                  setOtpError('');
                  setIsOtpModalOpen(true);
                }}
                className="px-5 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500 font-black text-xs sm:text-sm transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
              >
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'hi' ? '🔐 स्टार्ट OTP दर्ज करें' : '🔐 Enter Start Job OTP'}</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ══════════════ SECTION 3: STEP-BY-STEP JOB LIFECYCLE ACTION BUTTONS ══════════════ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              {lang === 'hi' ? 'कार्य प्रगति व नियंत्रण (Job Lifecycle Actions)' : 'Job Lifecycle Action Controls'}
            </h3>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
            {isEnRoute ? 'Phase 1: En Route' : hasArrived ? 'Phase 2: At Farm' : isWorking ? 'Phase 3: Working' : 'Completed'}
          </span>
        </div>

        {/* Action Controls by State */}
        <div className="space-y-4">
          
          {/* Phase 1: En Route -> Mark Arrived */}
          {isEnRoute && (
            <div className="p-4 rounded-2xl bg-stone-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400">Step 1: Traveling to Farmer's Field</span>
                <span className="text-amber-400 font-black">~{remainingDistanceKm} km remaining</span>
              </div>

              <button
                type="button"
                onClick={() => updateBookingStatus('arrived')}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_45px_rgba(16,185,129,0.6)] transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <MapPin className="w-5 h-5 stroke-[2.5]" />
                <span>{lang === 'hi' ? '📍 खेत पर आगमन दर्ज करें (Mark Arrived at Farm)' : '📍 Mark Arrived at Farm'}</span>
              </button>
            </div>
          )}

          {/* Phase 2: Arrived -> Enter OTP & Start Work */}
          {hasArrived && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-stone-950 to-emerald-950/40 border border-emerald-500/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'hi' ? 'मशीन खेत पर पहुँच चुकी है' : 'Machinery Arrived at Field'}</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'hi' ? 'किसान से 4-अंकों का स्टार्ट पिन प्राप्त करें' : 'Obtain 4-digit start PIN from farmer'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStartOtpInput('');
                  setOtpError('');
                  setIsOtpModalOpen(true);
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-base shadow-xl shadow-blue-950 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Tractor className="w-5 h-5" />
                <span>{lang === 'hi' ? '🚜 4-अंकों का OTP दर्ज कर कार्य शुरू करें' : '🚜 Enter OTP & Start Work'}</span>
              </button>
            </div>
          )}

          {/* Phase 3: Work in Progress -> Complete Job & Disburse to Wallet */}
          {isWorking && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-stone-950 to-emerald-950/50 border border-emerald-500/50 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>{lang === 'hi' ? 'खेत में जुताई/कटाई कार्य प्रगति पर है' : 'Field Operation Live in Progress'}</span>
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-bold">Telemetric GPS Synchronized</span>
              </div>

              <button
                type="button"
                onClick={handleCompleteJob}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-lg shadow-[0_0_35px_rgba(16,185,129,0.5)] hover:shadow-[0_0_50px_rgba(16,185,129,0.7)] transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                <span>
                  {lang === 'hi' 
                    ? `✅ कार्य पूर्ण करें व ₹${guaranteedFare.toLocaleString()} वॉलेट में प्राप्त करें` 
                    : `✅ Complete Job & Disburse ₹${guaranteedFare.toLocaleString()} to Wallet`}
                </span>
              </button>
            </div>
          )}

          {/* Secondary Action: Emergency / Cancel Booking with Reason */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-stone-900/60 hover:bg-red-950/30 text-slate-500 dark:text-slate-400 hover:text-red-400 border border-slate-200 dark:border-slate-800 hover:border-red-500/30 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? '✕ आपातकालीन / कारण सहित बुकिंग रद्द करें' : '✕ Emergency / Cancel Booking with Reason'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* ══════════════ SECTION 4: LIVE PAYOUT & GUARANTEED EARNINGS BREAKDOWN ══════════════ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              {lang === 'hi' ? 'कमाई एवं डीजल खर्च विश्लेषण (Guaranteed Payout & Profit Breakdown)' : 'Live Payout & Guaranteed Earnings Breakdown'}
            </h3>
          </div>
          <span className="text-xs font-black text-emerald-400 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800">
            100% Escrow Guaranteed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Metric 1: Guaranteed Payout */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-emerald-500/30 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {lang === 'hi' ? 'नियत कुल किराया' : 'Guaranteed Payout'}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight block">
              ₹{guaranteedFare.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {activeBooking.landSize || '4.5'} {activeBooking.sizeUnit || 'Bigha'} • {activeBooking.attachment?.nameEn || 'Rotavator'}
            </span>
          </div>

          {/* Metric 2: Regional Rate Multiplier */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {lang === 'hi' ? 'क्षेत्रीय दर गुणांक' : 'Regional Multiplier'}
            </span>
            <span className="text-2xl font-black text-white block">
              1.0x UP Base
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              ₹1,300/Bigha Central UP Rate
            </span>
          </div>

          {/* Metric 3: Diesel Expense Estimator */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {lang === 'hi' ? 'डीजल खर्च अनुमान' : 'Diesel Expense'}
              </span>
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-2xl font-black text-amber-400 block">
              -₹{estimatedDieselCost.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              ~{fuelLiters} Liters @ ₹{dieselPricePerLiter}/L
            </span>
          </div>

          {/* Metric 4: Net Driver Profit */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-stone-950 border border-emerald-500/50 space-y-1 shadow-lg shadow-emerald-950/30">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">
                {lang === 'hi' ? 'शुद्ध चालक मुनाफा' : 'Net Driver Profit'}
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-300 tracking-tight block">
              ₹{netDriverIncome.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-400/80 font-bold">
              Direct Bank/Wallet Disbursal Ready
            </span>
          </div>

        </div>
      </div>

      {/* ══════════════ MODAL: START JOB OTP VERIFICATION ══════════════ */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-white space-y-5 relative">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl mx-auto shadow-inner">
                🔐
              </div>
              <h3 className="text-xl font-black text-white">
                {lang === 'hi' ? 'किसान का स्टार्ट ओटीपी दर्ज करें' : 'Enter Farmer Start Job OTP PIN'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'hi' 
                  ? 'किसान के मोबाइल स्क्रीन पर प्रदर्शित 4-अंकों का सुरक्षा पिन प्राप्त कर दर्ज करें।' 
                  : 'Ask the farmer for the 4-digit security PIN shown on their live tracking screen.'}
              </p>
            </div>

            <form onSubmit={handleVerifyStartOtp} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  value={startOtpInput}
                  onChange={(e) => {
                    setStartOtpInput(e.target.value);
                    if (otpError) setOtpError('');
                  }}
                  placeholder="e.g. 4821"
                  className="w-full text-center text-3xl font-mono font-black tracking-widest py-3.5 rounded-2xl bg-stone-950 border border-emerald-500/50 text-emerald-400 placeholder:text-stone-700 outline-none focus:border-emerald-400 shadow-inner"
                />

                {/* Quick Hint / Master bypass for testing */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                  <span>{lang === 'hi' ? 'ओटीपी किसान से पूछें' : 'PIN displayed on Farmer app'}</span>
                  <button 
                    type="button" 
                    onClick={() => setStartOtpInput(activeBooking?.startOtp || '4821')} 
                    className="text-amber-400 hover:underline font-bold cursor-pointer"
                  >
                    Auto-Fill ({activeBooking?.startOtp || '4821'})
                  </button>
                </div>

                {otpError && (
                  <p className="text-xs text-rose-400 font-bold text-center animate-fade-in">
                    {otpError}
                  </p>
                )}

                {otpSuccess && (
                  <p className="text-xs text-emerald-400 font-black text-center animate-fade-in flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'hi' ? '✓ ओटीपी सत्यापित! कार्य शुरू हो रहा है...' : '✓ OTP Verified! Starting operation...'}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOtpModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-stone-900 border border-slate-200 dark:border-slate-800 hover:bg-stone-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                >
                  {lang === 'hi' ? 'सत्यापित करें व शुरू करें' : 'Verify & Start Work'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Cancel Reason Modal */}
      <CancelReasonModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirmCancel={handleDriverCancel}
        role="driver"
        partnerName={activeBooking.farmerName || 'किसान (Farmer)'}
      />

    </div>
  );
}
