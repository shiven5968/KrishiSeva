import React, { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useRealtimeSync } from '../../context/RealtimeSyncContext';
import { calculateDistanceKm } from '../../utils/geoUtils';
import LiveMap from '../map/LiveMap';
import CancelReasonModal from '../common/CancelReasonModal';
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
  Search
} from 'lucide-react';

export default function FarmerLiveTracking() {
  const { lang, t } = useLanguage();
  const { 
    activeBooking, 
    driverCurrentPos, 
    routeWaypoints, 
    cancelBooking,
    updateBookingStatus,
    isHardwareGpsActive,
    hardwareGpsTelemetry
  } = useRealtimeSync();

  // Simulated radar searching timer
  const [searchSeconds, setSearchSeconds] = useState(1);

  // Cancellation Reason Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

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
          subtitle: lang === 'hi' ? 'आपके खेत से 5 किमी के दायरे में उपलब्ध सभी सत्यापित ट्रैक्टर मालिकों को अनुरोध भेजा जा रहा है।' : 'Broadcasting request to verified machinery operators within 5 km of your field.',
          badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800'
        };
      case 'accepted':
        return {
          title: lang === 'hi' ? 'ड्राइवर ने बुकिंग स्वीकार की!' : 'Driver Accepted Your Booking!',
          subtitle: lang === 'hi' ? `${assignedDriver?.name || 'ड्राइवर'} आपके खेत की ओर रवाना हो चुके हैं।` : `${assignedDriver?.name || 'Operator'} is en route to your field.`,
          badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
        };
      case 'arrived':
        return {
          title: lang === 'hi' ? 'मशीनरी आपके खेत पर पहुंच गई है!' : 'Machinery Has Reached Your Field!',
          subtitle: lang === 'hi' ? 'कृपया ड्राइवर को खेत का दायरा और कार्य विवरण समझाएं।' : 'Please guide the operator to the specific field boundary.',
          badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-800'
        };
      case 'in_progress':
        return {
          title: lang === 'hi' ? 'खेत में कार्य प्रगति पर है...' : 'Work in Progress in Field...',
          subtitle: lang === 'hi' ? `${t(activeBooking.attachment?.nameKey)} द्वारा जुताई/कार्य जारी है।` : `Operation ongoing with ${t(activeBooking.attachment?.nameKey)}.`,
          badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-800'
        };
      case 'completed':
        return {
          title: lang === 'hi' ? 'कार्य संपन्न हुआ! धन्यवाद।' : 'Work Completed Successfully!',
          subtitle: lang === 'hi' ? 'कृपया ड्राइवर को तय किराया प्रदान करें।' : 'Please settle the calculated fare with the operator.',
          badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
        };
      default:
        return {
          title: 'Booking Active',
          subtitle: '',
          badgeColor: 'bg-stone-900 text-stone-200 border-stone-800'
        };
    }
  };

  const statusInfo = getStatusText();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Status Banner */}
      <div className={`p-6 rounded-3xl border ${statusInfo.badgeColor} shadow-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-stone-900 text-emerald-400 flex items-center justify-center text-3xl shadow-inner border border-stone-700">
            {isSearching ? (
              <Radio className="w-7 h-7 text-amber-400 animate-pulse" />
            ) : activeBooking.status === 'completed' ? (
              '🎉'
            ) : (
              '🚜'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-black text-white">
                {statusInfo.title}
              </h2>
              {isSearching && (
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
              )}
              {activeBooking.status === 'accepted' && (
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-stone-300 font-semibold mt-1">
              {statusInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Live GPS Telemetry Pill (When Accepted) */}
        {!isSearching && activeBooking.status === 'accepted' && (
          <div className="flex items-center gap-3 bg-stone-900/90 p-3 rounded-2xl border border-stone-700 text-xs font-black text-white">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Gauge className="w-4 h-4" />
              <span>Speed: {currentSpeed} km/h</span>
            </div>
            <span className="text-stone-600">•</span>
            <div className="flex items-center gap-1.5 text-amber-300">
              <MapPin className="w-4 h-4" />
              <span>Dist: {distanceKm} km</span>
            </div>
          </div>
        )}

        {/* Searching Timer Pill (When Searching) */}
        {isSearching && (
          <div className="flex items-center gap-2 bg-stone-900/90 px-4 py-2 rounded-2xl border border-amber-700/60 text-xs font-black text-amber-300">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Searching: {searchSeconds}s</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Full Live Map */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-stone-900/90 rounded-3xl p-5 border border-stone-800 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  {isSearching 
                    ? (lang === 'hi' ? 'खेत के पास मशीनरी रडार खोज (Radar Search Active)' : 'Machinery Dispatch Radar Active')
                    : (lang === 'hi' ? 'लाइव जीपीएस नेविगेशन (Live GPS Tracking to Field)' : 'Live GPS Machinery Dispatch to Field')}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-3.5 py-1.5 rounded-full shadow-sm border ${
                  isSearching 
                    ? 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
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
              className="h-[460px] w-full rounded-2xl"
            />
          </div>
        </div>

        {/* Right Column: Dynamic State Display */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. SEARCHING STATE: Radar Animation & Machinery Request Info */}
          {isSearching && (
            <div className="bg-stone-900/90 rounded-3xl p-6 border border-amber-600/40 shadow-2xl space-y-6 text-white animate-fade-in">
              
              {/* Radar Pulse Box */}
              <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-center space-y-3 relative overflow-hidden">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping"></div>
                  <div className="absolute inset-2 rounded-full bg-amber-500/30 animate-pulse"></div>
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xl shadow-lg shadow-amber-500/40 relative z-10">
                    🚜
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-base text-amber-300">
                    {lang === 'hi' ? 'मशीनरी खोजी जा रही है...' : 'Matching with Nearest Driver'}
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 font-medium">
                    {lang === 'hi' ? 'ड्राइवर द्वारा अनुरोध स्वीकार करने पर उनका विवरण व लाइव लोकेशन दिखाई देगी।' : 'Waiting for an available driver to accept your request.'}
                  </p>
                </div>

                {/* Progress signal bars */}
                <div className="flex justify-center gap-1.5 pt-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>

              {/* Machinery Requested Summary */}
              <div className="bg-stone-950/80 rounded-2xl p-4 border border-stone-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-medium">{lang === 'hi' ? 'अनुरोधित मशीन:' : 'Requested Machinery:'}</span>
                  <span className="font-bold text-white capitalize">{activeBooking.machineryType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-medium">{lang === 'hi' ? 'उपकरण (Attachment):' : 'Implement:'}</span>
                  <span className="font-extrabold text-emerald-400">{t(activeBooking.attachment?.nameKey)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-medium">{lang === 'hi' ? 'खेत का आकार:' : 'Farm Size:'}</span>
                  <span className="font-bold text-white">{activeBooking.landSize} {activeBooking.sizeUnit}</span>
                </div>
                 <div className="flex justify-between items-center pt-2 border-t border-stone-800">
                   <span className="text-stone-300 font-bold">{lang === 'hi' ? 'अनुमानित किराया:' : 'Estimated Fare:'}</span>
                   <span className="text-xl font-black text-amber-300">₹{activeBooking.estimatedPrice}</span>
                 </div>
                 {activeBooking.paymentMethod && (
                   <>
                     <div className="flex justify-between items-center">
                       <span className="text-stone-400 font-medium">{lang === 'hi' ? 'भुगतान विधि:' : 'Payment Method:'}</span>
                       <span className="font-bold text-white uppercase">{activeBooking.paymentMethod === 'cod' ? 'COD' : 'Online'}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-stone-400 font-medium">{lang === 'hi' ? 'अग्रिम भुगतान:' : 'Paid Advance:'}</span>
                       <span className="font-bold text-emerald-400">₹{activeBooking.advancePaid || 0}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-stone-400 font-medium">{lang === 'hi' ? 'शेष देय राशि:' : 'Balance Due:'}</span>
                       <span className="font-bold text-amber-400">₹{activeBooking.balanceDue || 0}</span>
                     </div>
                   </>
                 )}
              </div>

              {/* Cancel Request Button (Opens Reason Modal) */}
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full py-3.5 rounded-2xl border border-red-500/50 text-red-400 hover:bg-red-950/40 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98"
              >
                <XCircle className="w-4 h-4" />
                <span>{t('cancelBooking')} (अनुरोध रद्द करें)</span>
              </button>

            </div>
          )}

          {/* 2. MATCHED STATE: Driver Assigned, Photo, Call Driver & Live GPS Info */}
          {!isSearching && assignedDriver && (
            <div className="bg-stone-900/90 rounded-3xl p-6 border border-emerald-600/40 shadow-2xl space-y-5 text-white animate-fade-in">
              
              {/* Driver Header Card */}
              <div className="flex items-center gap-4 pb-4 border-b border-stone-800">
                <img
                  src={assignedDriver.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                  alt={assignedDriver.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-white text-base">
                      {assignedDriver.name}
                    </h4>
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" title="Verified Driver" />
                  </div>
                  <p className="text-xs text-stone-400 font-bold mt-0.5">
                    ⭐ {assignedDriver.rating || 5.0} • Verified Operator
                  </p>
                  <div className="mt-1">
                    <span className="text-[11px] font-mono font-black tracking-wider bg-stone-950 text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-900">
                      {assignedDriver.vehicleNumber || 'UP-32-BT-9901'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Machinery & Attachment Summary */}
              <div className="bg-stone-950/80 rounded-2xl p-4 border border-stone-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-medium">{lang === 'hi' ? 'मशीन:' : 'Machinery:'}</span>
                  <span className="font-bold text-white">{assignedDriver.modelName || 'Mahindra 575 DI (50 HP)'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-medium">{lang === 'hi' ? 'लगाया गया उपकरण:' : 'Implement:'}</span>
                  <span className="font-extrabold text-emerald-400">{t(activeBooking.attachment?.nameKey)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-medium">{lang === 'hi' ? 'खेत का दायरा:' : 'Farm Size:'}</span>
                  <span className="font-bold text-white">{activeBooking.landSize} {activeBooking.sizeUnit}</span>
                </div>
                 <div className="flex justify-between items-center pt-2 border-t border-stone-800">
                   <span className="text-stone-300 font-bold">{lang === 'hi' ? 'कुल नियत किराया:' : 'Total Fixed Fare:'}</span>
                   <span className="text-2xl font-black text-emerald-400">₹{activeBooking.estimatedPrice}</span>
                 </div>
                 {activeBooking.paymentMethod && (
                   <>
                     <div className="flex justify-between items-center">
                       <span className="text-stone-400 font-medium">{lang === 'hi' ? 'भुगतान विधि:' : 'Payment Method:'}</span>
                       <span className="font-bold text-white uppercase">{activeBooking.paymentMethod === 'cod' ? 'COD' : 'Online'}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-stone-400 font-medium">{lang === 'hi' ? 'अग्रिम भुगतान:' : 'Paid Advance:'}</span>
                       <span className="font-bold text-emerald-400">₹{activeBooking.advancePaid || 0}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-stone-400 font-medium">{lang === 'hi' ? 'शेष देय राशि:' : 'Balance Due:'}</span>
                       <span className="font-bold text-amber-400">₹{activeBooking.balanceDue || 0}</span>
                     </div>
                   </>
                 )}
              </div>

              {/* Action Buttons: Call Driver & Cancel */}
              <div className="space-y-3">
                <a
                  href={`tel:${assignedDriver.phone}`}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 transition active:scale-98"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Driver ({assignedDriver.phone})</span>
                </a>

                {activeBooking.status !== 'completed' && (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-full py-3 rounded-2xl border border-red-500/40 text-red-400 hover:bg-red-950/40 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{t('cancelBooking')}</span>
                  </button>
                )}

                {activeBooking.status === 'completed' && (
                  <button
                    onClick={() => cancelBooking('Trip Finished', 'farmer')}
                    className="w-full py-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white font-black text-sm flex items-center justify-center gap-2 transition shadow-xl"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'hi' ? 'नई बुकिंग करें' : 'Book Another Machine'}</span>
                  </button>
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

    </div>
  );
}
