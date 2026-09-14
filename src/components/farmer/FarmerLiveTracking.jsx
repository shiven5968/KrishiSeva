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
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6 animate-fade-in-up font-sans text-[#0B1E14]">
      
      {/* ══════════════ SECTION 1 (TOP): FULL-WIDTH RADAR MAP & SEARCH STATUS BANNER ══════════════ */}
      <div className="bg-white/80 border border-black/[0.06] rounded-3xl p-5 sm:p-6 shadow-sm backdrop-blur-xl space-y-4">
        
        {/* Header Overlay & Top Telemetry Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#1A4F32]/10 text-[#1A4F32] flex items-center justify-center text-2xl">
              {isSearching ? (
                <Radio className="w-6 h-6 text-[#1A4F32] animate-pulse" />
              ) : activeBooking.status === 'completed' ? (
                '🎉'
              ) : (
                <Tractor className="w-6 h-6 text-[#1A4F32]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#0B1E14] tracking-tight">
                  {statusInfo.title}
                </h2>
                {isSearching && (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A4F32] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1A4F32]"></span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#4F6358] font-medium mt-0.5 tracking-wide">
                {statusInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Right Status Pill */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {isSearching ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A4F32]/10 text-[#1A4F32] text-xs font-semibold">
                <Radio className="w-3.5 h-3.5 animate-spin" />
                <span>Searching: {searchSeconds}s</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-2.5 rounded-full bg-black/5 text-xs font-semibold text-[#0B1E14]">
                <div className="flex items-center gap-1.5 text-[#1A4F32]">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Speed: {currentSpeed} km/h</span>
                </div>
                <span className="text-[#4F6358]">•</span>
                <div className="flex items-center gap-1.5 text-amber-600">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Dist: {distanceKm} km</span>
                </div>
                <span className="text-[#4F6358]">•</span>
                <span className="text-[#1A4F32]">
                  ETA: {liveEtaMins} Mins
                </span>
              </div>
            )}

            {/* Cancel Button */}
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-4 py-2 rounded-full bg-black/5 hover:bg-red-500/10 text-[#4F6358] hover:text-red-500 font-medium text-xs transition-all duration-300 cursor-pointer active:scale-95"
            >
              {t('cancelBooking')}
            </button>
          </div>
        </div>

        {/* Full-Width Interactive Radar Leaflet Map */}
        <div className="w-full h-[360px] rounded-2xl overflow-hidden border border-black/[0.06] relative shadow-inner">
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
          <div className="absolute bottom-3 left-3 z-[1000] px-3.5 py-1.5 rounded-full bg-[#FDFBF7]/90 border border-black/[0.06] text-[11px] font-medium text-[#0B1E14] backdrop-blur-md flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#1A4F32] animate-pulse"></span>
            <span>
              {isSearching 
                ? 'Live Radar: 5 km radius in Malihabad • 12 Operators broadcasting' 
                : `${activeBooking.farmerLocation?.address || 'Plot #12, Gomti River Basin, Malihabad'}`}
            </span>
          </div>
        </div>

      </div>

      {/* ══════════════ SECTION 2: DYNAMIC LIVE MATCHING TIMELINE & PROGRESSION ══════════════ */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(11,30,20,0.03)] border border-[#0B1E14]/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
          {progressSteps.map((stepItem, idx) => {
            const isDone = stepItem.status === 'done';
            const isCurrent = stepItem.status === 'current';
            return (
              <div 
                key={stepItem.step}
                className={`p-3.5 rounded-2xl border transition-all duration-200 relative ${
                  isDone 
                    ? 'bg-[#1A4F32]/10 border-[#1A4F32]/20 text-[#1A4F32]' 
                    : isCurrent 
                      ? 'bg-white border-2 border-[#1A4F32] shadow-[0_4px_20px_rgba(26,79,50,0.08)]' 
                      : 'bg-[#0B1E14]/5 border-transparent text-[#4F6358]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isDone || isCurrent ? 'text-[#1A4F32]' : 'text-[#4F6358]'
                  }`}>
                    Step {stepItem.step} of 4
                  </span>
                  {isDone ? (
                    <div className="w-5 h-5 rounded-full bg-[#1A4F32] text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-[#1A4F32]/15 border border-[#1A4F32] text-[#1A4F32] flex items-center justify-center text-[10px] font-bold animate-pulse">
                      ●
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-black/5 text-[#4F6358] flex items-center justify-center text-[10px] font-semibold">
                      {stepItem.step}
                    </div>
                  )}
                </div>
                <h4 className={`text-xs sm:text-sm ${
                  isDone 
                    ? 'text-[#1A4F32] font-semibold' 
                    : isCurrent 
                      ? 'text-[#0B1E14] font-semibold' 
                      : 'text-[#4F6358]'
                }`}>
                  {lang === 'hi' ? stepItem.nameHi : stepItem.nameEn}
                </h4>
                <p className={`text-[10px] mt-0.5 ${
                  isDone 
                    ? 'text-[#1A4F32]/80' 
                    : isCurrent 
                      ? 'text-[#1A4F32] font-medium' 
                      : 'text-[#4F6358]/80'
                }`}>
                  {isDone ? 'Completed' : isCurrent ? 'Active In Progress...' : 'Pending'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════ SECTION 3: WIDESCREEN BOOKING SUMMARY & BARGAIN ENGINE ══════════════ */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(11,30,20,0.03)] border border-[#0B1E14]/5 space-y-5">
        
        {/* Horizontal Booking Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white shadow-[0_4px_20px_rgba(11,30,20,0.03)] border border-[#0B1E14]/5 text-xs">
          <div>
            <span className="text-xs font-semibold text-[#4F6358] uppercase tracking-wider block">
              {lang === 'hi' ? 'मशीनरी व यंत्र' : 'Machinery & Implement'}
            </span>
            <b className="text-[#0B1E14] capitalize text-sm font-bold">
              {activeBooking.machineryType || 'Tractor'} + {activeBooking.attachment?.nameEn || activeBooking.attachment?.id || 'Rotavator'}
            </b>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#4F6358] uppercase tracking-wider block">
              {lang === 'hi' ? 'खेत का रकबा' : 'Land Area / Size'}
            </span>
            <b className="text-[#0B1E14] text-sm font-bold">
              {activeBooking.landSize || '4.5'} {activeBooking.sizeUnit || 'Bigha'}
            </b>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#4F6358] uppercase tracking-wider block">
              {lang === 'hi' ? 'क्षेत्रीय बेस दर' : 'Base Zone Rate'}
            </span>
            <b className="text-[#1A4F32] text-sm font-bold">
              ₹1,300 / Bigha (UP Central)
            </b>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#4F6358] uppercase tracking-wider block">
              {lang === 'hi' ? 'कुल अनुमानित किराया' : 'Final Estimated Fare'}
            </span>
            <b className="text-2xl font-bold text-[#1A4F32]">
              ₹{estimatedFare.toLocaleString()}
            </b>
          </div>
        </div>

        {/* Live Counter-Offer Bargain Engine (When Searching) */}
        {isSearching && (
          <div className="bg-[#FDFBF7] rounded-2xl border border-[#0B1E14]/10 p-4 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A4F32]">
                <Coins className="w-4 h-4 text-[#1A4F32]" />
                <span>{lang === 'hi' ? 'किराया मोल-भाव (Live Counter-Offer Bargain Engine)' : 'Live Counter-Offer Bargain Engine'}</span>
              </div>
              <span className="text-[#4F6358] text-xs font-medium">
                {lang === 'hi' ? 'अपना नया प्रस्तावित किराया दर्ज करें, ऑपरेटरों को तुरंत दिखेगा' : 'Broadcast custom bid to all nearby operators in radar'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Quick Discount Pills */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-[#4F6358] whitespace-nowrap">
                  {lang === 'hi' ? 'त्वरित छूट:' : 'Quick:'}
                </span>
                {[100, 250, 500].map(disc => (
                  <button
                    key={disc}
                    type="button"
                    onClick={() => handleApplyDiscount(disc)}
                    className="px-3 py-1.5 rounded-full border border-[#0B1E14]/15 text-[#0B1E14] bg-white hover:bg-[#0B1E14]/5 text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-sm"
                  >
                    -₹{disc}
                  </button>
                ))}
              </div>

              {/* Input & Send Button */}
              <div className="flex items-center gap-2 w-full sm:flex-1">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#4F6358] text-sm">₹</span>
                  <input
                    type="number"
                    value={bargainPriceInput}
                    onChange={(e) => {
                      setBargainPriceInput(e.target.value);
                      setIsBargainSuccess(false);
                    }}
                    placeholder={String(estimatedFare)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white border border-[#0B1E14]/20 text-[#0B1E14] font-bold text-base outline-none focus:border-[#1A4F32] focus:ring-1 focus:ring-[#1A4F32] transition"
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
                  className="px-5 py-2.5 bg-[#0B1E14] text-white rounded-full hover:-translate-y-0.5 shadow-md transition-transform font-bold text-xs cursor-pointer active:scale-95 whitespace-nowrap flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>{lang === 'hi' ? 'काउंटर ऑफर रडार पर भेजें' : 'Send Counter Offer to Radar'}</span>
                </button>
              </div>
            </div>

            {isBargainSuccess && (
              <p className="text-xs text-[#1A4F32] font-bold text-center animate-fade-in flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1A4F32]" />
                <span>{lang === 'hi' ? '✓ नया काउंटर-ऑफर (₹' + bargainPriceInput + ') सभी 12 ऑपरेटरों को प्रसारित कर दिया गया है!' : '✓ Counter offer of ₹' + bargainPriceInput + ' broadcasted to 12 nearby operators!'}</span>
              </p>
            )}
          </div>
        )}

      </div>

      {/* ══════════════ SECTION 4: ASSIGNED OPERATOR DETAILS & OTP PIN (WHEN ACCEPTED) ══════════════ */}
      {assignedDriver ? (
        /* Matched Operator Info Card & OTP Start Card */
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(11,30,20,0.03)] border border-[#0B1E14]/10 space-y-5">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#0B1E14]/10">
            {/* Driver Identity */}
            <div className="flex items-center gap-4">
              <img
                src={assignedDriver.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                alt={assignedDriver.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#1A4F32] shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-lg text-[#0B1E14]">
                    {assignedDriver.name}
                  </h4>
                  <ShieldCheck className="w-4 h-4 text-[#1A4F32]" title="Verified Operator" />
                </div>
                <p className="text-xs font-semibold text-amber-600 mt-0.5">
                  ⭐ {assignedDriver.rating || 4.95} • Verified Machinery Partner
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#0B1E14] px-2 py-0.5 rounded-md bg-[#0B1E14]/5 border border-[#0B1E14]/10">
                    {assignedDriver.vehicleNumber || 'UP-32-BT-9901'}
                  </span>
                  <span className="text-xs text-[#4F6358] font-medium">
                    {assignedDriver.modelName || 'Mahindra 575 DI (50 HP)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Call Button */}
            <a
              href={`tel:${assignedDriver.phone || '+91 98765 01234'}`}
              className="px-6 py-3.5 rounded-2xl bg-[#1A4F32] hover:bg-[#143E27] text-white font-bold text-sm shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Phone className="w-4 h-4 text-white" />
              <span>Call Operator ({assignedDriver.phone || '+91 98765 01234'})</span>
            </a>
          </div>

          {/* Security OTP PIN Cards */}
          {activeBooking.status !== 'completed' && (
            <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#0B1E14]/10 text-center space-y-3">
              {activeBooking.status === 'in_progress' ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A4F32] flex items-center gap-1.5">
                      <span>🏁</span>
                      <span>{lang === 'hi' ? 'कार्य समापन ओटीपी (Job Completion OTP)' : 'Job Completion OTP PIN'}</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {lang === 'hi' ? 'काम पूरा होने पर बताएं' : 'Share After Work is Finished'}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 py-1">
                    <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-[#1A4F32] bg-white px-8 py-2 rounded-2xl border border-[#0B1E14]/10 shadow-sm">
                      {activeBooking.completionOtp || '7392'}
                    </div>
                  </div>

                  <p className="text-xs text-[#4F6358] font-medium">
                    {lang === 'hi' 
                      ? 'खेत में पूरा काम संतोषजनक होने पर ही यह 4-अंकों का समापन ओटीपी ड्राइवर को दें।' 
                      : 'Share this 4-digit PIN with operator only after field work is completed to your satisfaction.'}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A4F32] flex items-center gap-1.5">
                      <span>🔐</span>
                      <span>{lang === 'hi' ? 'खेत कार्य प्रारंभ पिन (Start OTP)' : 'Start Job Security PIN'}</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {lang === 'hi' ? 'ड्राइवर को बताएं' : 'Share with Operator on Arrival'}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 py-1">
                    <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-[#1A4F32] bg-white px-8 py-2 rounded-2xl border border-[#0B1E14]/10 shadow-sm">
                      {activeBooking.startOtp || '4821'}
                    </div>
                  </div>

                  <p className="text-xs text-[#4F6358] font-medium">
                    {lang === 'hi' 
                      ? 'ड्राइवर के खेत पर पहुँचने के बाद ही यह 4-अंकों का सुरक्षा पिन चालक को बताएं।' 
                      : 'Share this 4-digit PIN with the machinery operator upon arrival at field.'}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Job Completion & Rating CTA */}
          {activeBooking.status === 'completed' && (
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setIsRatingModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
              >
                <Star className="w-4 h-4 fill-stone-950" />
                <span>{lang === 'hi' ? '⭐ चालक को 5 स्टार में से रेटिंग दें' : '⭐ Rate Operator Out of 5 Stars'}</span>
              </button>

              <button
                onClick={() => cancelBooking('Trip Finished', 'farmer')}
                className="w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition bg-white hover:bg-[#0B1E14]/5 text-[#0B1E14] border border-[#0B1E14]/10 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
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
