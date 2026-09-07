import React, { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useRealtimeSync } from '../../context/RealtimeSyncContext';
import { usePricing } from '../../context/PricingContext';
import { calculateDistanceKm } from '../../utils/geoUtils';
import LiveMap from '../map/LiveMap';
import CancelReasonModal from '../common/CancelReasonModal';
import FarmerRatingModal from './FarmerRatingModal';
import { 
  Tractor, 
  Phone, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  Navigation,
  Sparkles,
  Gauge,
  Compass,
  Radio,
  Wifi,
  Search,
  Coins,
  Star,
  ArrowRight,
  Zap,
  Check,
  Layers,
  LandPlot,
  Award,
  Send,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export default function FarmerLiveTracking() {
  const { lang, t, localize } = useLanguage();
  const { isDark } = useTheme();
  const { rates } = usePricing();
  const { 
    activeBooking, 
    driverCurrentPos, 
    routeWaypoints, 
    cancelBooking,
    acceptBooking,
    updateBookingStatus,
    submitDriverRating,
    updateBookingPrice,
    payBookingAdvance,
    isHardwareGpsActive,
    hardwareGpsTelemetry
  } = useRealtimeSync();

  // Rating modal open state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(true);

  // Simulated radar searching timer
  const [searchSeconds, setSearchSeconds] = useState(12);

  // Cancellation Reason Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Bargain states
  const [bargainPriceInput, setBargainPriceInput] = useState('');
  const [isBargainSuccess, setIsBargainSuccess] = useState(false);

  useEffect(() => {
    if (activeBooking && activeBooking.estimatedPrice) {
      setBargainPriceInput(String(activeBooking.estimatedPrice));
    }
  }, [activeBooking?.id, activeBooking?.estimatedPrice]);

  // Auto-open rating modal whenever driver marks job completed
  useEffect(() => {
    if (activeBooking?.status === 'completed') {
      setIsRatingModalOpen(true);
    }
  }, [activeBooking?.status]);

  useEffect(() => {
    let interval = null;
    if (activeBooking && activeBooking.status === 'searching') {
      interval = setInterval(() => {
        setSearchSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeBooking?.status]);

  if (!activeBooking) return null;

  const isSearching = activeBooking.status === 'searching';
  const assignedDriver = activeBooking.assignedDriver;

  // Handle Confirmed Cancellation with Reason
  const handleConfirmCancelWithReason = (reason) => {
    cancelBooking(reason, 'farmer', activeBooking.farmerName || 'Balram Kisan');
    setIsCancelModalOpen(false);
  };

  // Dynamic Live Distance & ETA calculation from real GPS coordinates
  const distanceKm = useMemo(() => {
    if (!driverCurrentPos || !activeBooking.farmerLocation) return 1.8;
    return calculateDistanceKm(
      driverCurrentPos.lat,
      driverCurrentPos.lng,
      activeBooking.farmerLocation.lat,
      activeBooking.farmerLocation.lng
    );
  }, [driverCurrentPos, activeBooking.farmerLocation]);

  const currentSpeed = useMemo(() => {
    if (activeBooking?.status !== 'accepted') return 0;
    if (isHardwareGpsActive && hardwareGpsTelemetry.speed) return hardwareGpsTelemetry.speed;
    return 22 + (Math.round(Math.sin(Date.now() / 3000) * 2) + 1); 
  }, [activeBooking?.status, isHardwareGpsActive, hardwareGpsTelemetry.speed]);

  const liveEtaMins = useMemo(() => {
    if (activeBooking.status === 'arrived') return 0;
    const speed = currentSpeed || 22;
    return Math.max(1, Math.round((distanceKm / speed) * 60));
  }, [distanceKm, activeBooking.status, currentSpeed]);

  // Fallback / standard estimated fare calculation
  const estimatedFare = activeBooking.estimatedPrice || 6435;

  // Quick discount buttons handler for bargain drawer
  const handleApplyDiscount = (discount) => {
    const currentBase = activeBooking.estimatedPrice || estimatedFare;
    const newPrice = Math.max(1000, currentBase - discount);
    setBargainPriceInput(String(newPrice));
  };

  // Status text mapping
  const getStatusText = () => {
    switch (activeBooking.status) {
      case 'searching':
        return {
          title: lang === 'hi' ? 'आस-पास के ऑपरेटरों की खोज जारी...' : 'Radar Active • Broadcasting to Operators',
          subtitle: lang === 'hi' 
            ? 'मलीहाबाद क्षेत्र में 5 किमी के दायरे में 12 सक्रिय ऑपरेटरों को लाइव अनुरोध भेजा गया है।' 
            : 'Broadcasting to 12 verified machinery operators in Malihabad Zone (~5 km radius).',
          badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        };
      case 'accepted':
        return {
          title: lang === 'hi' ? 'ड्राइवर ने बुकिंग स्वीकार की!' : 'Driver Accepted Your Dispatch Request!',
          subtitle: lang === 'hi' 
            ? `${assignedDriver?.name || 'ड्राइवर'} आपके खेत की ओर रवाना हो चुके हैं।` 
            : `${assignedDriver?.name || 'Operator'} is en route to your field (~${distanceKm} km away).`,
          badgeColor: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
        };
      case 'arrived':
        return {
          title: lang === 'hi' ? 'चालक खेत पर पहुँच चुके हैं 📍' : 'Driver Arrived at Farm 📍',
          subtitle: lang === 'hi' 
            ? 'मशीनरी खेत पर उपस्थित है। 4-अंकों का ओटीपी साझा कर जुताई शुरू कराएं।' 
            : 'Machinery has arrived at field. Share your 4-digit start PIN to begin.',
          badgeColor: 'bg-blue-950/80 border-blue-500/40 text-blue-300'
        };
      case 'in_progress':
        return {
          title: lang === 'hi' ? 'खेत का कार्य प्रगति पर है 🚜' : 'Field Operation in Progress 🚜',
          subtitle: lang === 'hi' 
            ? 'लाइव जुताई/कटाई टेलीमेट्री व जीपीएस सक्रिय है।' 
            : 'Live machinery telemetry and tillage tracking is active.',
          badgeColor: 'bg-amber-950/80 border-amber-500/40 text-amber-300'
        };
      case 'completed':
        return {
          title: lang === 'hi' ? 'कार्य संपन्न हुआ! धन्यवाद।' : 'Work Completed Successfully! 🎉',
          subtitle: lang === 'hi' 
            ? 'कृपया चालक को 5 स्टार में से रेटिंग दें और भुगतान सत्यापित करें।' 
            : 'Please rate your machinery operator out of 5 stars and settle the fare.',
          badgeColor: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
        };
      default:
        return {
          title: 'Booking Active',
          subtitle: '',
          badgeColor: 'bg-stone-900 border-slate-200 dark:border-slate-800 text-white'
        };
    }
  };

  const statusInfo = getStatusText();

  // Progress Steps definition
  const progressSteps = [
    {
      step: 1,
      nameEn: 'Request Broadcasted',
      nameHi: 'अनुरोध प्रसारित',
      status: 'done'
    },
    {
      step: 2,
      nameEn: 'Driver Accepting',
      nameHi: 'चालक स्वीकृति',
      status: isSearching ? 'current' : 'done'
    },
    {
      step: 3,
      nameEn: 'En Route to Farm',
      nameHi: 'खेत की ओर रवाना',
      status: activeBooking.status === 'accepted' ? 'current' : (['arrived', 'in_progress', 'completed'].includes(activeBooking.status) ? 'done' : 'upcoming')
    },
    {
      step: 4,
      nameEn: 'Work Started',
      nameHi: 'कार्य प्रारंभ',
      status: activeBooking.status === 'in_progress' ? 'current' : (activeBooking.status === 'completed' ? 'done' : 'upcoming')
    }
  ];

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6 animate-fade-in font-sans">
      
      {/* ══════════════ SECTION 1 (TOP): FULL-WIDTH RADAR MAP & SEARCH STATUS BANNER ══════════════ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
        
        {/* Header Overlay & Top Telemetry Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl shadow-inner">
              {isSearching ? (
                <Radio className="w-6 h-6 text-emerald-400 animate-pulse" />
              ) : activeBooking.status === 'completed' ? (
                '🎉'
              ) : (
                <Tractor className="w-6 h-6 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {statusInfo.title}
                </h2>
                {isSearching && (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {statusInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Right Status Pill */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {isSearching ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-black shadow-lg shadow-emerald-950/40 animate-pulse">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span>Searching: {searchSeconds}s</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-stone-900/90 border border-slate-200 dark:border-slate-800 text-xs font-black text-white">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Speed: {currentSpeed} km/h</span>
                </div>
                <span className="text-stone-600">•</span>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Dist: {distanceKm} km</span>
                </div>
                <span className="text-stone-600">•</span>
                <span className="text-emerald-300">
                  ETA: {liveEtaMins} Mins
                </span>
              </div>
            )}

            {/* Cancel Button */}
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-red-950/40 text-slate-500 dark:text-slate-400 hover:text-red-400 border border-slate-200 dark:border-slate-800 hover:border-red-500/40 font-bold text-xs transition cursor-pointer active:scale-95"
            >
              {t('cancelBooking')}
            </button>
          </div>
        </div>

        {/* Full-Width Interactive Radar Leaflet Map */}
        <div className="w-full h-[360px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative shadow-inner">
          <LiveMap
            farmerLocation={activeBooking.farmerLocation}
            driverPos={driverCurrentPos}
            routeWaypoints={isSearching ? [] : routeWaypoints}
            activeVehicleType={activeBooking.machineryType || 'tractor'}
            showNearbyDrivers={isSearching}
            bookingStatus={activeBooking.status}
            className="w-full h-full"
          />

          {/* Map Bottom Floating Pill */}
          <div className="absolute bottom-3 left-3 z-[1000] px-3.5 py-1.5 rounded-xl bg-stone-950/90 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 backdrop-blur-md flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              {isSearching 
                ? 'Live Radar: 5 km radius in Malihabad • 12 Operators broadcasting' 
                : `${activeBooking.farmerLocation?.address || 'Plot #12, Gomti River Basin, Malihabad'}`}
            </span>
          </div>
        </div>

      </div>

      {/* ══════════════ SECTION 2: DYNAMIC LIVE MATCHING TIMELINE & PROGRESSION ══════════════ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
          {progressSteps.map((stepItem, idx) => {
            const isDone = stepItem.status === 'done';
            const isCurrent = stepItem.status === 'current';
            return (
              <div 
                key={stepItem.step}
                className={`p-3.5 rounded-2xl border transition-all duration-200 relative ${
                  isDone 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                    : isCurrent 
                      ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30' 
                      : 'bg-stone-950/60 border-slate-200 dark:border-slate-800 text-stone-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    isDone || isCurrent ? 'text-emerald-400' : 'text-stone-500'
                  }`}>
                    Step {stepItem.step} of 4
                  </span>
                  {isDone ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center text-[10px] font-black">
                      ✓
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center text-[10px] font-black animate-pulse">
                      ●
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-stone-900 border border-slate-200 dark:border-slate-800 text-stone-600 flex items-center justify-center text-[10px] font-bold">
                      {stepItem.step}
                    </div>
                  )}
                </div>
                <h4 className={`text-xs sm:text-sm font-black ${
                  isDone ? 'text-emerald-300' : isCurrent ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {lang === 'hi' ? stepItem.nameHi : stepItem.nameEn}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isDone ? 'Completed' : isCurrent ? 'Active In Progress...' : 'Pending'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════ SECTION 3: WIDESCREEN BOOKING SUMMARY & BARGAIN ENGINE ══════════════ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5">
        
        {/* Horizontal Booking Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-stone-950 border border-slate-200 dark:border-slate-800/90 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {lang === 'hi' ? 'मशीनरी व यंत्र' : 'Machinery & Implement'}
            </span>
            <b className="text-white capitalize text-sm">
              {activeBooking.machineryType || 'Tractor'} + {activeBooking.attachment?.nameEn || activeBooking.attachment?.id || 'Rotavator'}
            </b>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {lang === 'hi' ? 'खेत का रकबा' : 'Land Area / Size'}
            </span>
            <b className="text-white text-sm">
              {activeBooking.landSize || '4.5'} {activeBooking.sizeUnit || 'Bigha'}
            </b>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {lang === 'hi' ? 'क्षेत्रीय बेस दर' : 'Base Zone Rate'}
            </span>
            <b className="text-emerald-400 text-sm">
              ₹1,300 / Bigha (UP Central)
            </b>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {lang === 'hi' ? 'कुल अनुमानित किराया' : 'Final Estimated Fare'}
            </span>
            <b className="text-2xl font-black text-emerald-400">
              ₹{estimatedFare.toLocaleString()}
            </b>
          </div>
        </div>

        {/* Live Counter-Offer Bargain Engine (When Searching) */}
        {isSearching && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-950 via-emerald-950/20 to-stone-950 border border-emerald-500/30 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'hi' ? 'किराया मोल-भाव (Live Counter-Offer Bargain Engine)' : 'Live Counter-Offer Bargain Engine'}</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {lang === 'hi' ? 'अपना नया प्रस्तावित किराया दर्ज करें, ऑपरेटरों को तुरंत दिखेगा' : 'Send instant custom bid to all nearby operators in radar'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Quick Discount Pills */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold whitespace-nowrap">Quick:</span>
                {[100, 250, 500].map(disc => (
                  <button
                    key={disc}
                    type="button"
                    onClick={() => handleApplyDiscount(disc)}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-emerald-300 border border-stone-700 text-xs font-black transition cursor-pointer active:scale-95"
                  >
                    -₹{disc}
                  </button>
                ))}
              </div>

              {/* Input & Send Button */}
              <div className="flex items-center gap-2 w-full sm:flex-1">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 dark:text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={bargainPriceInput}
                    onChange={(e) => {
                      setBargainPriceInput(e.target.value);
                      setIsBargainSuccess(false);
                    }}
                    placeholder={String(estimatedFare)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white font-black text-base outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const val = Number(bargainPriceInput);
                    if (val > 0) {
                      updateBookingPrice(val);
                      setIsBargainSuccess(true);
                      setTimeout(() => setIsBargainSuccess(false), 3500);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95 whitespace-nowrap flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-stone-950" />
                  <span>{lang === 'hi' ? 'काउंटर ऑफर रडार पर भेजें' : 'Send Counter Offer to Radar'}</span>
                </button>
              </div>
            </div>

            {isBargainSuccess && (
              <p className="text-xs text-emerald-400 font-black text-center animate-fade-in flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'hi' ? '✓ नया काउंटर-ऑफर (₹' + bargainPriceInput + ') सभी 12 ऑपरेटरों को प्रसारित कर दिया गया है!' : '✓ Counter offer of ₹' + bargainPriceInput + ' broadcasted to 12 nearby operators!'}</span>
              </p>
            )}
          </div>
        )}

      </div>

      {/* ══════════════ SECTION 4: ASSIGNED OPERATOR DETAILS & OTP PIN (WHEN ACCEPTED) ══════════════ */}
      {assignedDriver ? (
        /* Matched Operator Info Card & OTP Start Card */
        <div className="bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            {/* Driver Identity */}
            <div className="flex items-center gap-4">
              <img
                src={assignedDriver.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                alt={assignedDriver.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-lg text-white">
                    {assignedDriver.name}
                  </h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" title="Verified Operator" />
                </div>
                <p className="text-xs font-bold text-amber-400 mt-0.5">
                  ⭐ {assignedDriver.rating || 4.95} • Verified Machinery Partner
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-emerald-300 px-2 py-0.5 rounded-md bg-stone-950 border border-emerald-900">
                    {assignedDriver.vehicleNumber || 'UP-32-BT-9901'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    {assignedDriver.modelName || 'Mahindra 575 DI (50 HP)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Call Button */}
            <a
              href={`tel:${assignedDriver.phone || '+91 98765 01234'}`}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center gap-2 transition active:scale-95 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Phone className="w-4 h-4" />
              <span>Call Operator ({assignedDriver.phone || '+91 98765 01234'})</span>
            </a>
          </div>

          {/* Start Job Security OTP PIN Card */}
          {activeBooking.status !== 'completed' && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-stone-950 to-emerald-950/60 border border-emerald-500/40 text-center space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span>🔐</span>
                  <span>{lang === 'hi' ? 'खेत कार्य प्रारंभ पिन (Start OTP)' : 'Start Job Security PIN'}</span>
                </span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                  {lang === 'hi' ? 'ड्राइवर को बताएं' : 'Share with Operator on Arrival'}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 py-1">
                <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-emerald-400 bg-black/60 px-8 py-2 rounded-2xl border border-emerald-500/50 shadow-inner">
                  {activeBooking.startOtp || '4821'}
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {lang === 'hi' 
                  ? 'ड्राइवर के खेत पर पहुँचने के बाद ही यह 4-अंकों का सुरक्षा पिन चालक को बताएं।' 
                  : 'Share this 4-digit PIN with the machinery operator upon arrival at field.'}
              </p>
            </div>
          )}

          {/* Job Completion & Rating CTA */}
          {activeBooking.status === 'completed' && (
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setIsRatingModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
              >
                <Star className="w-4 h-4 fill-stone-950" />
                <span>{lang === 'hi' ? '⭐ चालक को 5 स्टार में से रेटिंग दें' : '⭐ Rate Operator Out of 5 Stars'}</span>
              </button>

              <button
                onClick={() => cancelBooking('Trip Finished', 'farmer')}
                className="w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition bg-stone-900 hover:bg-stone-800 text-white border border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{lang === 'hi' ? 'नई बुकिंग करें' : 'Book Another Machine'}</span>
              </button>
            </div>
          )}

        </div>
      ) : null}

      {/* Cancellation Reason Modal */}
      <CancelReasonModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirmCancel={handleConfirmCancelWithReason}
        role="farmer"
        partnerName={assignedDriver?.name || 'चालक (Operator)'}
      />

      {/* 5-Star Driver Rating Pop-up Modal when Job is Completed */}
      <FarmerRatingModal
        isOpen={activeBooking.status === 'completed' && isRatingModalOpen}
        booking={activeBooking}
        onSubmitRating={submitDriverRating}
        onClose={() => setIsRatingModalOpen(false)}
      />

    </div>
  );
}
