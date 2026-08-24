import React, { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useRealtimeSync } from '../../context/RealtimeSyncContext';
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
  Star
} from 'lucide-react';

export default function FarmerLiveTracking() {
  const { lang, t, localize } = useLanguage();
  const { isDark } = useTheme();
  const { 
    activeBooking, 
    driverCurrentPos, 
    routeWaypoints, 
    cancelBooking,
    updateBookingStatus,
    submitDriverRating,
    updateBookingPrice,
    isHardwareGpsActive,
    hardwareGpsTelemetry
  } = useRealtimeSync();

  // Rating modal open state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(true);

  // Simulated radar searching timer
  const [searchSeconds, setSearchSeconds] = useState(1);

  // Cancellation Reason Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Bargain states
  const [bargainPriceInput, setBargainPriceInput] = useState('');
  const [isBargainSuccess, setIsBargainSuccess] = useState(false);

  useEffect(() => {
    if (activeBooking && activeBooking.estimatedPrice) {
      setBargainPriceInput(String(activeBooking.estimatedPrice));
    }
  }, [activeBooking?.id]);

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
    if (!driverCurrentPos || !activeBooking.farmerLocation) return 1.2;
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
    // Return a simulated speed that fluctuates slightly around 22-26 km/h
    return 22 + (Math.round(Math.sin(Date.now() / 3000) * 2) + 1); 
  }, [activeBooking?.status, isHardwareGpsActive, hardwareGpsTelemetry.speed]);

  const liveEtaMins = useMemo(() => {
    if (activeBooking.status === 'arrived') return 0;
    const speed = currentSpeed || 22;
    const mins = Math.max(1, Math.round((distanceKm / speed) * 60));
    return mins;
  }, [distanceKm, activeBooking.status, currentSpeed]);

  // Status text mapping
  const getStatusText = () => {
    switch (activeBooking.status) {
      case 'searching':
        return {
          title: lang === 'hi' ? 'आस-पास के ड्राइवरों की खोज जारी...' : 'Looking for Nearest Drivers...',
          subtitle: lang === 'hi' ? 'आपके खेत से 5 किमी के दायरे में उपलब्ध सभी सत्यापित ऑपरेटरों को अनुरोध भेजा जा रहा है।' : 'Broadcasting request to verified machinery operators within 5 km of your field.',
          badgeColor: isDark 
            ? 'bg-stone-900/90 text-white border-stone-800 shadow-black/40' 
            : 'bg-white text-slate-900 border-slate-200 shadow-slate-200/50'
        };
      case 'accepted':
        return {
          title: lang === 'hi' ? 'ड्राइवर ने बुकिंग स्वीकार की!' : 'Driver Accepted Your Booking!',
          subtitle: lang === 'hi' ? `${assignedDriver?.name || 'ड्राइवर'} आपके खेत की ओर रवाना हो चुके हैं।` : `${assignedDriver?.name || 'Operator'} is en route to your field.`,
          badgeColor: isDark 
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' 
            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
        };
      case 'arrived':
        return {
          title: lang === 'hi' ? 'चालक खेत पर पहुँच चुके हैं 📍' : 'Driver Arrived at Field 📍',
          subtitle: lang === 'hi' ? 'मशीन आपके खेत पर उपस्थित है। कार्य प्रारंभ करवाएं।' : 'Machinery is at your field. Ready to commence farm operations.',
          badgeColor: isDark 
            ? 'bg-blue-950/80 text-blue-300 border-blue-800' 
            : 'bg-blue-50 text-blue-900 border-blue-200'
        };
      case 'in_progress':
        return {
          title: lang === 'hi' ? 'खेत का कार्य प्रगति पर है 🚜' : 'Field Operation in Progress 🚜',
          subtitle: lang === 'hi' ? 'लाइव कार्य अवधि व टेलीमेट्री ट्रैक की जा रही है।' : 'Live operation telemetry is active.',
          badgeColor: isDark 
            ? 'bg-amber-950/80 text-amber-300 border-amber-800' 
            : 'bg-amber-50 text-amber-900 border-amber-200'
        };
      case 'completed':
        return {
          title: lang === 'hi' ? 'कार्य संपन्न हुआ! धन्यवाद।' : 'Work Completed Successfully!',
          subtitle: lang === 'hi' ? 'कृपया ड्राइवर को तय किराया प्रदान करें।' : 'Please settle the calculated fare with the operator.',
          badgeColor: isDark 
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' 
            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
        };
      default:
        return {
          title: 'Booking Active',
          subtitle: '',
          badgeColor: isDark ? 'bg-stone-900 text-stone-200 border-stone-800' : 'bg-white text-slate-800 border-slate-200'
        };
    }
  };

  const statusInfo = getStatusText();

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4 transition-colors duration-200 ${
      isDark ? 'text-stone-100' : 'text-slate-900'
    }`}>
      
      {/* Top Status Banner */}
      <div className={`p-5 rounded-3xl border ${statusInfo.badgeColor} shadow-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-200`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border ${
            isDark ? 'bg-stone-900 text-emerald-400 border-stone-700' : 'bg-emerald-100 text-emerald-700 border-emerald-300'
          }`}>
            {isSearching ? (
              <Radio className="w-6 h-6 text-emerald-500 animate-pulse" />
            ) : activeBooking.status === 'completed' ? (
              '🎉'
            ) : (
              '🚜'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {statusInfo.title}
              </h2>
              {isSearching && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              )}
              {activeBooking.status === 'accepted' && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              )}
            </div>
            <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-stone-300' : 'text-slate-600'}`}>
              {statusInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Live GPS Telemetry Pill (When Accepted) */}
        {!isSearching && activeBooking.status === 'accepted' && (
          <div className={`flex items-center gap-3 p-2.5 rounded-2xl border text-xs font-black ${
            isDark ? 'bg-stone-900/90 border-stone-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-1.5 text-emerald-500">
              <Gauge className="w-3.5 h-3.5" />
              <span>Speed: {currentSpeed} km/h</span>
            </div>
            <span className={isDark ? 'text-stone-600' : 'text-slate-400'}>•</span>
            <div className="flex items-center gap-1.5 text-amber-500">
              <MapPin className="w-3.5 h-3.5" />
              <span>Dist: {distanceKm} km</span>
            </div>
          </div>
        )}

        {/* Searching Timer Pill (When Searching) */}
        {isSearching && (
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs font-black shadow-lg ${
            isDark ? 'bg-stone-900/90 border-stone-800 text-emerald-400 shadow-black/10' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <Clock className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
            <span>Searching: {searchSeconds}s</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Full Live Map */}
        <div className="lg:col-span-8">
          <div className={`rounded-3xl p-4 sm:p-5 border shadow-2xl space-y-3 transition-colors duration-200 ${
            isDark ? 'bg-stone-900/90 border-stone-800 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-500" />
                <h3 className={`font-extrabold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {isSearching 
                    ? (lang === 'hi' ? 'खेत के पास मशीनरी रडार खोज' : 'Machinery Dispatch Radar Active')
                    : (lang === 'hi' ? 'लाइव जीपीएस नेविगेशन' : 'Live GPS Machinery Dispatch to Field')}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-3 py-1 rounded-full shadow-sm border ${
                  isSearching 
                    ? isDark ? 'bg-stone-950 text-emerald-400 border-stone-800 animate-pulse' : 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                    : isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {isSearching 
                    ? 'Pinging Nearby Operators 📡' 
                    : activeBooking.status === 'arrived' 
                      ? 'Arrived at Field 📍' 
                      : activeBooking.status === 'completed' 
                        ? 'Done' 
                        : `ETA: ${liveEtaMins} Mins (~${distanceKm} km)`}
                </span>
              </div>
            </div>

            {/* Live Leaflet Map Component */}
            <LiveMap
              farmerLocation={activeBooking.farmerLocation}
              driverPos={driverCurrentPos}
              routeWaypoints={isSearching ? [] : routeWaypoints}
              activeVehicleType={activeBooking.machineryType}
              showNearbyDrivers={isSearching}
              bookingStatus={activeBooking.status}
              className={`h-[500px] w-full rounded-2xl overflow-hidden border ${isDark ? 'border-stone-800' : 'border-slate-200'}`}
            />
          </div>
        </div>

        {/* Right Column: Dynamic State Display */}
        <div className="lg:col-span-4">
          
          {/* 1. SEARCHING STATE: Machinery Request Info & Actions */}
          {isSearching && (
            <div className={`rounded-3xl p-6 border shadow-2xl space-y-4 animate-fade-in transition-colors duration-200 flex-1 flex flex-col justify-between ${
              isDark ? 'bg-stone-900/90 border-stone-800 text-white shadow-black/40' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
            }`}>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800/40">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-500">
                    {lang === 'hi' ? 'अनुरोधित बुकिंग विवरण' : 'Booking Request Summary'}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                    {lang === 'hi' ? 'लाइव प्रसारण' : 'Broadcast Live'}
                  </span>
                </div>

                {/* Machinery Requested Summary */}
                <div className={`rounded-2xl p-4 border space-y-2.5 text-xs ${
                  isDark ? 'bg-stone-950/80 border-stone-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'अनुरोधित मशीन:' : 'Requested Machinery:'}</span>
                    <span className={`font-bold capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeBooking.machineryType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'उपकरण (Attachment):' : 'Implement:'}</span>
                    <span className="font-extrabold text-emerald-500">{t(activeBooking.attachment?.nameKey)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'खेत का आकार:' : 'Farm Size:'}</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeBooking.landSize} {activeBooking.sizeUnit}</span>
                  </div>
                  <div className={`flex justify-between items-center pt-2 border-t ${isDark ? 'border-stone-800' : 'border-slate-200'}`}>
                    <span className={`font-bold ${isDark ? 'text-stone-300' : 'text-slate-700'}`}>{lang === 'hi' ? 'अनुमानित किराया:' : 'Estimated Fare:'}</span>
                    <span className="text-xl font-black text-amber-500">₹{activeBooking.estimatedPrice}</span>
                  </div>
                  {activeBooking.paymentMethod && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'भुगतान विधि:' : 'Payment Method:'}</span>
                        <span className={`font-bold uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeBooking.paymentMethod === 'cod' ? 'COD' : 'Online'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'अग्रिम भुगतान:' : 'Paid Advance:'}</span>
                        <span className="font-bold text-emerald-500">₹{activeBooking.advancePaid || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'शेष देय राशि:' : 'Balance Due:'}</span>
                        <span className="font-bold text-amber-500">₹{activeBooking.balanceDue || 0}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Bargaining / Counter-Offer Section */}
                <div className={`rounded-2xl p-4 border space-y-3 animate-fade-in ${
                  isDark ? 'bg-stone-950/80 border-stone-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-extrabold uppercase tracking-wider">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'किराया मोल-भाव (Bargain Price)' : 'Want to Bargain?'}</span>
                  </div>
                  <p className={`text-[10px] leading-normal ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                    {lang === 'hi'
                      ? 'अपना नया प्रस्तावित किराया दर्ज करें। आस-पास के ऑपरेटरों को आपका ऑफर तुरंत दिखेगा।'
                      : 'Enter your proposed fare. Nearby operators will see your counter-offer immediately.'}
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>₹</span>
                      <input
                        type="number"
                        value={bargainPriceInput}
                        onChange={(e) => {
                          setBargainPriceInput(e.target.value);
                          setIsBargainSuccess(false);
                        }}
                        placeholder={activeBooking.estimatedPrice}
                        className={`w-full pl-7 pr-3 py-2 border rounded-xl text-xs font-black focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition ${
                          isDark ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const val = Number(bargainPriceInput);
                        if (val > 0) {
                          updateBookingPrice(val);
                          setIsBargainSuccess(true);
                          setTimeout(() => setIsBargainSuccess(false), 3000);
                        }
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/10 transition active:scale-95 shrink-0"
                    >
                      {lang === 'hi' ? 'ऑफर भेजें' : 'Send Offer'}
                    </button>
                  </div>
                  {isBargainSuccess && (
                    <p className="text-[10px] text-emerald-500 font-black text-center animate-pulse">
                      {lang === 'hi' ? '✓ नया काउंटर-ऑफर भेजा गया!' : '✓ Counter-offer sent successfully!'}
                    </p>
                  )}
                </div>

                {/* Live Operator Broadcast Status Stream */}
                <div className={`rounded-2xl p-4 border space-y-2.5 ${
                  isDark ? 'bg-stone-950/80 border-stone-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                      <span>{lang === 'hi' ? 'दायरे में सक्रिय चालक (3)' : 'Nearby Operators in Range (3)'}</span>
                    </span>
                    <span className={`text-[10px] font-bold ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>Malihabad • 5 km</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                      isDark ? 'bg-stone-900/60 border-stone-800 text-stone-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">🚜</span>
                        <div>
                          <span className="font-bold block">Mahindra 575 DI (50 HP)</span>
                          <span className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-slate-500'}`}>Jagjit Singh • 1.2 km away</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                        Pinging 📡
                      </span>
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                      isDark ? 'bg-stone-900/60 border-stone-800 text-stone-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">🌾</span>
                        <div>
                          <span className="font-bold block">Preet 987 Combine (110 HP)</span>
                          <span className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-slate-500'}`}>Rampal Sharma • 2.8 km away</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                        Pinging 📡
                      </span>
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                      isDark ? 'bg-stone-900/60 border-stone-800 text-stone-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">🚜</span>
                        <div>
                          <span className="font-bold block">Swaraj 855 FE (52 HP)</span>
                          <span className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-slate-500'}`}>Gurmeet Singh • 3.4 km away</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                        Pinging 📡
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancel Request Button (Opens Reason Modal) */}
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className={`w-full py-3.5 rounded-2xl border border-red-500/50 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 mt-3 ${
                  isDark ? 'text-red-400 hover:bg-red-950/40' : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>{t('cancelBooking')} (अनुरोध रद्द करें)</span>
              </button>

            </div>
          )}

          {/* 2. MATCHED STATE: Driver Assigned, Photo, Call Driver & Live GPS Info */}
          {!isSearching && assignedDriver && (
            <div className={`rounded-3xl p-6 border shadow-2xl space-y-5 animate-fade-in transition-colors duration-200 flex-1 flex flex-col justify-between ${
              isDark ? 'bg-stone-900/90 border-emerald-600/40 text-white shadow-black/40' : 'bg-white border-emerald-500/30 text-slate-900 shadow-slate-200/50'
            }`}>
              
              {/* Driver Header Card */}
              <div className={`flex items-center gap-4 pb-4 border-b ${isDark ? 'border-stone-800' : 'border-slate-200'}`}>
                <img
                  src={assignedDriver.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                  alt={assignedDriver.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {assignedDriver.name}
                    </h4>
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" title="Verified Driver" />
                  </div>
                  <p className={`text-xs font-bold mt-0.5 ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                    ⭐ {assignedDriver.rating || 5.0} • Verified Operator
                  </p>
                  <div className="mt-1">
                    <span className={`text-[11px] font-mono font-black tracking-wider px-2.5 py-0.5 rounded-md border ${
                      isDark ? 'bg-stone-950 text-emerald-300 border-emerald-900' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {assignedDriver.vehicleNumber || 'UP-32-BT-9901'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Start Job Security OTP PIN (Shown prominently to farmer until completed) */}
              {activeBooking.status !== 'completed' && (
                <div className={`p-4 rounded-2xl border text-center space-y-2 relative overflow-hidden shadow-xl transition-all ${
                  isDark 
                    ? 'bg-gradient-to-r from-emerald-950/80 via-stone-950 to-emerald-950/80 border-emerald-500/50 shadow-emerald-950/50' 
                    : 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-emerald-300 shadow-emerald-200/40'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                      <span>🔐</span>
                      <span>{lang === 'hi' ? 'खेत कार्य प्रारंभ पिन (Start OTP)' : 'Start Job Security PIN'}</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                      {lang === 'hi' ? 'ड्राइवर को बताएं' : 'Share with Driver'}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 py-1">
                    <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-emerald-400 bg-black/40 px-6 py-1.5 rounded-2xl border border-emerald-500/40 shadow-inner">
                      {activeBooking.startOtp || '4821'}
                    </div>
                  </div>

                  <p className={`text-[11px] font-medium leading-tight ${isDark ? 'text-stone-300' : 'text-slate-600'}`}>
                    {lang === 'hi' 
                      ? 'ड्राइवर के आपके खेत पर पहुँचने के बाद ही यह 4-अंकों का पिन चालक को बताएं।' 
                      : 'Share this 4-digit PIN with the operator upon farm arrival to authorize work start.'}
                  </p>
                </div>
              )}

              {/* Machinery & Attachment Summary */}
              <div className={`rounded-2xl p-4 border space-y-2.5 text-xs ${
                isDark ? 'bg-stone-950/80 border-stone-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'मशीन:' : 'Machinery:'}</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{assignedDriver.modelName || 'Mahindra 575 DI (50 HP)'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'लगाया गया उपकरण:' : 'Implement:'}</span>
                  <span className="font-extrabold text-emerald-500">{t(activeBooking.attachment?.nameKey)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'खेत का दायरा:' : 'Farm Size:'}</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeBooking.landSize} {activeBooking.sizeUnit}</span>
                </div>
                <div className={`flex justify-between items-center pt-2 border-t ${isDark ? 'border-stone-800' : 'border-slate-200'}`}>
                  <span className={`font-bold ${isDark ? 'text-stone-300' : 'text-slate-700'}`}>{lang === 'hi' ? 'कुल नियत किराया:' : 'Total Fixed Fare:'}</span>
                  <span className="text-2xl font-black text-emerald-500">₹{activeBooking.estimatedPrice}</span>
                </div>
                {activeBooking.paymentMethod && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'भुगतान विधि:' : 'Payment Method:'}</span>
                      <span className={`font-bold uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeBooking.paymentMethod === 'cod' ? 'COD' : 'Online'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'अग्रिम भुगतान:' : 'Paid Advance:'}</span>
                      <span className="font-bold text-emerald-500">₹{activeBooking.advancePaid || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'शेष देय राशि:' : 'Balance Due:'}</span>
                      <span className="font-bold text-amber-500">₹{activeBooking.balanceDue || 0}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons: Call Driver & Cancel */}
              <div className="space-y-3">
                <a
                  href={`tel:${assignedDriver.phone}`}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-98"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Driver ({assignedDriver.phone})</span>
                </a>

                {activeBooking.status !== 'completed' && (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className={`w-full py-3 rounded-2xl border border-red-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      isDark ? 'text-red-400 hover:bg-red-950/40' : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{t('cancelBooking')}</span>
                  </button>
                )}

                {activeBooking.status === 'completed' && (
                  <div className="space-y-2.5">
                    <button
                      onClick={() => setIsRatingModalOpen(true)}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-98"
                    >
                      <Star className="w-4 h-4 fill-stone-950" />
                      <span>{lang === 'hi' ? '⭐ चालक को 5 स्टार में से रेटिंग दें' : '⭐ Rate Driver Out of 5 Stars'}</span>
                    </button>

                    <button
                      onClick={() => cancelBooking('Trip Finished', 'farmer')}
                      className={`w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition shadow-lg ${
                        isDark ? 'bg-stone-800 hover:bg-stone-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'hi' ? 'नई बुकिंग करें' : 'Book Another Machine'}</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Cancellation Reason Modal */}
      <CancelReasonModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirmCancel={handleConfirmCancelWithReason}
        role="farmer"
        partnerName={assignedDriver?.name || 'चालक (Driver)'}
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
