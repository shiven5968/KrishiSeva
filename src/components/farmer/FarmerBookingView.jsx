import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeSync } from '../../context/RealtimeSyncContext';
import { usePricing, SUPPORTED_QUANTITY_UNITS, UNIT_CONVERSIONS_TO_BIGHA } from '../../context/PricingContext';
import { useSavedLands } from '../../context/SavedLandsContext';
import { usePreBookings } from '../../context/PreBookingsContext';
import { MACHINERY_CATEGORIES, MOCK_DROP_LOCATIONS } from '../../types/machinery';
import { DEFAULT_FARM_LOCATION } from '../../utils/geoUtils';
import LiveMap from '../map/LiveMap';
import SavedLandsModal from './SavedLandsModal';
import PreBookingsModal from './PreBookingsModal';
import { 
  Tractor, 
  Layers, 
  MapPin, 
  Clock, 
  IndianRupee, 
  Check, 
  ChevronRight, 
  Sparkles, 
  AlertCircle,
  Wheat,
  Calculator,
  Navigation,
  Info,
  Truck,
  Bookmark,
  PlusCircle,
  Settings2,
  Calendar,
  CalendarDays,
  Zap,
  CheckCircle2,
  Sun,
  Sunrise,
  Send,
  X,
  Plus,
  Minus,
  Edit3,
  LandPlot,
  Ruler,
  ShieldCheck
} from 'lucide-react';

export default function FarmerBookingView({ onOpenAuthModal }) {
  const { lang, t } = useLanguage();
  const { currentUser } = useAuth();
  const { createBookingRequest, activeBooking } = useRealtimeSync();
  const { rates, calculateFare } = usePricing();
  const { savedLands, selectedLand, selectedLandId, setSelectedLandId } = useSavedLands();
  const { preBookings, addPreBooking } = usePreBookings();

  const [isSavedLandsModalOpen, setIsSavedLandsModalOpen] = useState(false);
  const [isPreBookingsModalOpen, setIsPreBookingsModalOpen] = useState(false);

  // Booking Timing Mode: 'instant' (Now) vs 'schedule' (Pre-Book for Date & Day)
  const [bookingTimingMode, setBookingTimingMode] = useState('instant');

  // Pre-Booking Date & Time State
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [scheduledDate, setScheduledDate] = useState(tomorrowStr);
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('morning');
  const [specialNotes, setSpecialNotes] = useState('');
  const [scheduledSuccessData, setScheduledSuccessData] = useState(null);

  // Payment Flow States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select' | 'upi'
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'online'
  const [pendingBookingData, setPendingBookingData] = useState(null);

  // Selected Machine Category (default 'tractor')
  const [selectedCategoryId, setSelectedCategoryId] = useState('tractor');
  
  // Selected Attachment (mandatory for tractor)
  const [selectedAttachmentId, setSelectedAttachmentId] = useState('rotavator');

  // Universal Unit & Quantity State (Bigha, Acre, Hectare, Hours, Biswa, Kanal):
  const [selectedUnit, setSelectedUnit] = useState('bigha');
  const [quantityInput, setQuantityInput] = useState(selectedLand?.bigha || 3);
  const [quantityText, setQuantityText] = useState(String(selectedLand?.bigha || 3));

  const [selectedDropLocationId, setSelectedDropLocationId] = useState('loc_1');
  const [customDistanceKm, setCustomDistanceKm] = useState(14);
  const [customDistanceText, setCustomDistanceText] = useState('14');

  // Active Unit Metadata
  const currentUnitMeta = useMemo(() => {
    return SUPPORTED_QUANTITY_UNITS.find(u => u.id === selectedUnit) || SUPPORTED_QUANTITY_UNITS[0];
  }, [selectedUnit]);

  // Auto-fill quantity and location when Saved Land changes
  useEffect(() => {
    if (selectedLand && (selectedCategoryId === 'tractor' || selectedCategoryId === 'harvester')) {
      if (selectedUnit === 'bigha') {
        setQuantityInput(selectedLand.bigha);
        setQuantityText(String(selectedLand.bigha));
      } else if (selectedUnit === 'acre') {
        const acreVal = Math.round((selectedLand.bigha / 1.61) * 10) / 10;
        setQuantityInput(acreVal);
        setQuantityText(String(acreVal));
      } else if (selectedUnit === 'hectare') {
        const hecVal = Math.round((selectedLand.bigha / 3.95) * 100) / 100;
        setQuantityInput(hecVal);
        setQuantityText(String(hecVal));
      }
    }
  }, [selectedLandId, selectedLand, selectedCategoryId]);

  // When changing Unit, smoothly convert existing quantity
  const handleUnitChange = (newUnit) => {
    if (newUnit === selectedUnit) return;
    const oldMultiplier = UNIT_CONVERSIONS_TO_BIGHA[selectedUnit] || 1.0;
    const newMultiplier = UNIT_CONVERSIONS_TO_BIGHA[newUnit] || 1.0;

    const currentVal = parseFloat(quantityText) || quantityInput || 1;
    const equivBigha = currentVal * oldMultiplier;
    const converted = Math.round((equivBigha / newMultiplier) * 10) / 10;

    const finalVal = Math.max(0.1, converted);
    setSelectedUnit(newUnit);
    setQuantityInput(finalVal);
    setQuantityText(String(finalVal));
  };

  // Handle Free Typing for Quantity
  const handleQuantityTextChange = (val) => {
    setQuantityText(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setQuantityInput(num);
    }
  };

  const handleQuantityBlur = () => {
    const num = parseFloat(quantityText);
    if (isNaN(num) || num <= 0) {
      setQuantityText('1');
      setQuantityInput(1);
    } else {
      setQuantityText(String(num));
      setQuantityInput(num);
    }
  };

  const handleSliderQuantityChange = (num) => {
    setQuantityInput(num);
    setQuantityText(String(num));
  };

  const handleQuantityStep = (delta) => {
    const current = parseFloat(quantityText) || quantityInput || 1;
    const updated = Math.max(currentUnitMeta.step || 0.5, Math.round((current + delta) * 10) / 10);
    setQuantityInput(updated);
    setQuantityText(String(updated));
  };

  // Compute Day of Week from scheduledDate
  const computedDayOfWeek = useMemo(() => {
    if (!scheduledDate) return lang === 'hi' ? 'कल' : 'Tomorrow';
    const dateObj = new Date(scheduledDate + 'T00:00:00');
    const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayNamesHi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const dayIndex = dateObj.getDay();
    return lang === 'hi' ? dayNamesHi[dayIndex] : dayNamesEn[dayIndex];
  }, [scheduledDate, lang]);

  // Selected Category Object
  const currentCategory = useMemo(() => {
    return MACHINERY_CATEGORIES.find(c => c.id === selectedCategoryId) || MACHINERY_CATEGORIES[0];
  }, [selectedCategoryId]);

  // Selected Attachment Object
  const currentAttachment = useMemo(() => {
    return currentCategory.attachments?.find(a => a.id === selectedAttachmentId) || currentCategory.attachments?.[0];
  }, [currentCategory, selectedAttachmentId]);

  // Active Drop Location for Transport
  const currentDropLocation = useMemo(() => {
    return MOCK_DROP_LOCATIONS.find(loc => loc.id === selectedDropLocationId) || MOCK_DROP_LOCATIONS[0];
  }, [selectedDropLocationId]);

  // Effective Distance in Km
  const effectiveDistanceKm = useMemo(() => {
    if (selectedDropLocationId === 'loc_5') {
      return Number(customDistanceKm) || 10;
    }
    return currentDropLocation.distanceKm;
  }, [selectedDropLocationId, customDistanceKm, currentDropLocation]);

  // Dynamic Fare Calculation supporting chosen unit
  const fareResult = useMemo(() => {
    return calculateFare({
      machineryType: selectedCategoryId,
      quantity: quantityInput,
      unit: selectedUnit,
      distanceKm: effectiveDistanceKm
    });
  }, [selectedCategoryId, quantityInput, selectedUnit, effectiveDistanceKm, calculateFare, rates]);

  // Equivalent Area Conversions preview for user
  const conversionHints = useMemo(() => {
    if (selectedUnit === 'hours') return null;
    const bighaEquiv = quantityInput * (UNIT_CONVERSIONS_TO_BIGHA[selectedUnit] || 1.0);
    const acreEquiv = Math.round((bighaEquiv / 1.61) * 100) / 100;
    const hecEquiv = Math.round((bighaEquiv / 3.95) * 100) / 100;
    return {
      bigha: Math.round(bighaEquiv * 10) / 10,
      acre: acreEquiv,
      hectare: hecEquiv
    };
  }, [quantityInput, selectedUnit]);

  // Handle Category Change
  const handleCategoryChange = (catId) => {
    setSelectedCategoryId(catId);
    if (catId === 'jcb') {
      setSelectedUnit('hours');
      setQuantityInput(4);
      setQuantityText('4');
    } else if (selectedUnit === 'hours') {
      setSelectedUnit('bigha');
      setQuantityInput(3);
      setQuantityText('3');
    }
    const cat = MACHINERY_CATEGORIES.find(c => c.id === catId);
    if (cat && cat.attachments?.length > 0) {
      setSelectedAttachmentId(cat.attachments[0].id);
    }
  };

  // Time slot labels
  const timeSlotOptions = [
    { id: 'morning', icon: '🌅', labelEn: 'Early Morning (06:00 AM - 10:00 AM)', labelHi: 'प्रातःकाल (06:00 AM - 10:00 AM)', desc: lang === 'hi' ? 'जुताई व बुवाई हेतु उत्तम' : 'Ideal for tilling & seed sowing' },
    { id: 'afternoon', icon: '☀️', labelEn: 'Afternoon (02:00 PM - 06:00 PM)', labelHi: 'दोपहर (02:00 PM - 06:00 PM)', desc: lang === 'hi' ? 'कटाई व मड़ाई हेतु उत्तम' : 'Ideal for harvesting & threshing' },
    { id: 'full_day', icon: '🌾', labelEn: 'Full Day Shift (06:00 AM - 06:00 PM)', labelHi: 'पूर्ण दिवस (06:00 AM - 06:00 PM)', desc: lang === 'hi' ? 'बड़े रकबे के कार्य हेतु' : 'Large acreage operations' }
  ];

  // Handle Booking (Instant or Scheduled Pre-Booking)
  const handleConfirmBooking = () => {
    if (!currentUser?.isAuthenticated) {
      onOpenAuthModal();
      return;
    }

    let payload = {};
    if (bookingTimingMode === 'schedule') {
      const selectedSlotObj = timeSlotOptions.find(s => s.id === scheduledTimeSlot) || timeSlotOptions[0];
      payload = {
        farmerName: currentUser.name,
        farmerPhone: currentUser.phone,
        landName: selectedLand?.name || (lang === 'hi' ? 'मुख्य खेत' : 'Main Farm'),
        machineryType: selectedCategoryId,
        attachment: currentAttachment,
        landSize: selectedCategoryId === 'truck' ? effectiveDistanceKm : quantityInput,
        sizeUnit: selectedCategoryId === 'truck' ? 'km' : selectedUnit,
        scheduledDate: scheduledDate,
        scheduledDay: computedDayOfWeek,
        timeSlot: lang === 'hi' ? selectedSlotObj.labelHi : selectedSlotObj.labelEn,
        estimatedPrice: fareResult.total,
        specialNotes: specialNotes
      };
    } else {
      payload = {
        farmerName: currentUser.name,
        farmerPhone: currentUser.phone,
        farmerLocation: {
          lat: selectedLand?.lat || DEFAULT_FARM_LOCATION.lat,
          lng: selectedLand?.lng || DEFAULT_FARM_LOCATION.lng,
          address: selectedLand?.address || DEFAULT_FARM_LOCATION.address
        },
        machineryType: selectedCategoryId,
        attachment: currentAttachment,
        landName: selectedLand?.name,
        landSize: selectedCategoryId === 'truck' ? effectiveDistanceKm : quantityInput,
        sizeUnit: selectedCategoryId === 'truck' ? 'km' : selectedUnit,
        dropLocation: selectedCategoryId === 'truck' ? currentDropLocation.name : null,
        estimatedPrice: fareResult.total,
        estimatedETA: lang === 'hi' ? '35-60 मिनट' : '35-60 Mins'
      };
    }

    setPendingBookingData(payload);
    setIsPaymentModalOpen(true);
    setPaymentStep('select');
    setPaymentMethod('cod');
  };

  const handleExecuteBookingWithPayment = (method, paidAmount) => {
    if (!pendingBookingData) return;

    const finalPayload = {
      ...pendingBookingData,
      paymentMethod: method,
      advancePaid: Math.round(paidAmount),
      balanceDue: Math.round(pendingBookingData.estimatedPrice - paidAmount)
    };

    if (bookingTimingMode === 'schedule') {
      const newPreBooking = addPreBooking(finalPayload);
      setScheduledSuccessData(newPreBooking);
    } else {
      createBookingRequest(finalPayload);
    }

    setIsPaymentModalOpen(false);
    setPendingBookingData(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Top Banner: Saved Lands & Pre-Bookings Manager Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-stone-900 via-stone-900 to-emerald-950/40 text-white p-4 sm:p-5 rounded-3xl border border-stone-800/80 shadow-lg relative overflow-hidden group">
        {/* Subtle gradient shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-lg shadow-inner">
            🌾
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <span>{lang === 'hi' ? 'किसान बुकिंग डैशबोर्ड' : 'Farmer Booking Cockpit'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 font-bold backdrop-blur-sm">
                {lang === 'hi' ? '1-क्लिक वाहन सेवा' : '1-Click Dispatch'}
              </span>
            </h2>
            <p className="text-xs text-stone-400 font-medium">
              {lang === 'hi' ? 'चयनित खेत: ' : 'Active Land: '}
              <b className="text-emerald-400">{selectedLand?.name || (lang === 'hi' ? 'मेरा खेत' : 'My Farm')} ({selectedLand?.bigha || 3} {lang === 'hi' ? 'बीघा' : 'Bigha'})</b>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => setIsPreBookingsModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-700/60 hover:border-blue-600 font-black text-xs flex items-center gap-1.5 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-blue-500/10"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'hi' ? 'अग्रिम बुकिंग' : 'Pre-Bookings'} ({preBookings.length})</span>
          </button>

          <button
            onClick={() => setIsSavedLandsModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-700/60 hover:border-stone-600 font-bold text-xs flex items-center gap-1.5 transition-all duration-200 active:scale-95 hover:shadow-emerald-500/10"
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'hi' ? 'सहेजे गए खेत' : 'My Saved Lands'} ({savedLands.length})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: 4 Step Interactive Booking Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: Select Booking Timing (Instant vs Pre-Book) */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-stone-400">{lang === 'hi' ? 'चरण 1' : 'Step 1'}</span>
                <h3 className="text-lg font-black text-stone-900">
                  {lang === 'hi' ? 'बुकिंग का समय चुनें' : 'Select Booking Timing'}
                </h3>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{bookingTimingMode === 'schedule' ? (lang === 'hi' ? 'अग्रिम आरक्षण' : 'Advanced Reservation') : (lang === 'hi' ? 'तत्काल सेवा' : 'Immediate Need')}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option A: Instant Dispatch (Now) */}
              <div
                onClick={() => setBookingTimingMode('instant')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-2 ${
                  bookingTimingMode === 'instant'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-base">
                    ⚡
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    bookingTimingMode === 'instant' ? 'border-emerald-600 bg-emerald-600' : 'border-stone-300'
                  }`}>
                    {bookingTimingMode === 'instant' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-stone-900 text-sm">
                    {lang === 'hi' ? 'तुरंत मंगाएं' : 'Instant Dispatch (Now)'}
                  </h4>
                  <p className="text-xs text-stone-500 font-semibold mt-0.5">
                    {lang === 'hi' ? 'खेत पर आगमन: ~35-60 मिनट' : 'Farm Arrival: ~35-60 Mins'}
                  </p>
                </div>
              </div>

              {/* Option B: Pre-Book for Date & Day */}
              <div
                onClick={() => setBookingTimingMode('schedule')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-2 ${
                  bookingTimingMode === 'schedule'
                    ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-base">
                    📅
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    bookingTimingMode === 'schedule' ? 'border-blue-600 bg-blue-600' : 'border-stone-300'
                  }`}>
                    {bookingTimingMode === 'schedule' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-stone-900 text-sm">
                    {lang === 'hi' ? 'अग्रिम तारीख के लिए बुक करें' : 'Pre-Book for Date & Day'}
                  </h4>
                  <p className="text-xs text-stone-500 font-semibold mt-0.5">
                    {lang === 'hi' ? 'आगामी जुताई/कटाई के लिए आरक्षित' : 'Reserve machinery in advance'}
                  </p>
                </div>
              </div>

            </div>

            {/* PRE-BOOKING SPECIFIC INPUTS (Date, Day & Time Slot) */}
            {bookingTimingMode === 'schedule' && (
              <div className="p-4 rounded-2xl bg-blue-950 text-white space-y-4 border border-blue-800 shadow-md animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-black text-blue-300 uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>{lang === 'hi' ? 'अग्रिम बुकिंग विवरण' : 'Pre-Booking Schedule Details'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-900">
                  {/* Date Picker */}
                  <div>
                    <label className="block text-[11px] font-black text-blue-200 uppercase mb-1">
                      {lang === 'hi' ? 'तारीख चुनें *' : 'Select Date *'}
                    </label>
                    <input
                      type="date"
                      min={tomorrowStr}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-blue-400 bg-white font-black text-xs text-stone-900 outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>

                  {/* Day of Week Display */}
                  <div>
                    <label className="block text-[11px] font-black text-blue-200 uppercase mb-1">
                      {lang === 'hi' ? 'दिन' : 'Day of Week'}
                    </label>
                    <div className="px-3.5 py-2.5 rounded-xl bg-blue-900/90 border border-blue-700 font-black text-xs text-amber-300 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      <span>{computedDayOfWeek}</span>
                    </div>
                  </div>
                </div>

                {/* Time Window Selection */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-blue-200 uppercase">
                    {lang === 'hi' ? 'समय का स्लॉट *' : 'Time Slot *'}
                  </label>
                  <div className="grid grid-cols-1 gap-2 text-stone-900">
                    {timeSlotOptions.map(slot => (
                      <div
                        key={slot.id}
                        onClick={() => setScheduledTimeSlot(slot.id)}
                        className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                          scheduledTimeSlot === slot.id
                            ? 'border-amber-400 bg-blue-900 text-white'
                            : 'border-blue-800 bg-blue-900/40 text-blue-200 hover:bg-blue-900/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{slot.icon}</span>
                          <div>
                            <span className="font-black text-xs block">
                              {lang === 'hi' ? slot.labelHi : slot.labelEn}
                            </span>
                            <span className="text-[10px] text-blue-300">
                              {slot.desc}
                            </span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          scheduledTimeSlot === slot.id ? 'border-amber-400 bg-amber-400' : 'border-blue-600'
                        }`}>
                          {scheduledTimeSlot === slot.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-950" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Instructions Note */}
                <div>
                  <label className="block text-[11px] font-black text-blue-200 uppercase mb-1">
                    {lang === 'hi' ? 'खेत निर्देश / विशेष विवरण' : 'Farm Instructions / Special Notes'}
                  </label>
                  <input
                    type="text"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder={lang === 'hi' ? 'उदा. सड़क से खेत तक चकमार्ग उपलब्ध है' : 'e.g. Approach pathway available from main road'}
                    className="w-full px-3.5 py-2 rounded-xl border border-blue-700 bg-blue-900/70 text-white text-xs outline-none placeholder:text-blue-400 focus:border-amber-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Machinery Selection */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-stone-400">{lang === 'hi' ? 'चरण 2' : 'Step 2'}</span>
                <h3 className="text-lg font-black text-stone-900">{t('selectMachinery')}</h3>
              </div>
              <span className="text-xs text-stone-500 font-bold">
                {currentCategory.capacity}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MACHINERY_CATEGORIES.map(cat => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer text-center space-y-2 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-3xl block">{cat.icon}</span>
                    <div>
                      <h4 className="font-extrabold text-xs text-stone-900">
                        {t(cat.nameKey)}
                      </h4>
                      <span className="text-[10px] font-black text-emerald-700 mt-1 block">
                        {cat.id === 'truck' ? `₹${rates.truck?.ratePerKm}/km` : cat.id === 'jcb' ? `₹${rates.jcb?.ratePerHour}/${lang === 'hi' ? 'घंटा' : 'hr'}` : `₹${rates[cat.id]?.ratePerBigha}/${lang === 'hi' ? 'बीघा' : 'bigha'}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Mandatory Implement/Attachment Selection for Tractors */}
          {currentCategory.attachments && currentCategory.attachments.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-stone-400">{lang === 'hi' ? 'चरण 3' : 'Step 3'}</span>
                  <h3 className="text-lg font-black text-stone-900">
                    {lang === 'hi' ? 'यंत्र / उपकरण जोड़ें' : 'Select Implement / Attachment'}
                  </h3>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {lang === 'hi' ? 'अनिवार्य उपकरण' : 'Mandatory Implement'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentCategory.attachments.map(att => {
                  const isSelected = selectedAttachmentId === att.id;
                  return (
                    <div
                      key={att.id}
                      onClick={() => setSelectedAttachmentId(att.id)}
                      className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{att.icon}</span>
                        <div>
                          <h5 className="font-extrabold text-xs text-stone-900">
                            {t(att.nameKey)}
                          </h5>
                          <p className="text-[10px] text-stone-500 font-semibold">
                            {t(att.descKey)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {att.extraRatePerAcre > 0 ? (
                          <span className="text-[11px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            +₹{att.extraRatePerAcre}/{lang === 'hi' ? 'बीघा' : 'bigha'}
                          </span>
                        ) : (
                          <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {lang === 'hi' ? 'सम्मिलित' : 'Included'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Universal Multi-Unit Farmland Size & Quantity Selector */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-stone-400">{lang === 'hi' ? 'चरण 4' : 'Step 4'}</span>
                <h3 className="text-lg font-black text-stone-900">
                  {lang === 'hi' ? 'खेत का आकार व मात्रा' : 'Farmland Size & Quantity'}
                </h3>
              </div>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'सभी इकाइयाँ समर्थित' : 'Multi-Unit Enabled'}</span>
              </span>
            </div>

            {/* Mode 1: Tractor & Harvester & Multi-Unit Land Operations */}
            {(selectedCategoryId === 'tractor' || selectedCategoryId === 'harvester' || selectedCategoryId === 'jcb') && (
              <div className="space-y-4">
                
                {/* Interactive Unit Selection Pills */}
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    {lang === 'hi' ? 'माप की इकाई चुनें:' : 'Select Measurement Unit:'}
                  </label>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {SUPPORTED_QUANTITY_UNITS.map(unitObj => {
                      const isUnitSelected = selectedUnit === unitObj.id;
                      return (
                        <button
                          key={unitObj.id}
                          type="button"
                          onClick={() => handleUnitChange(unitObj.id)}
                          className={`p-2.5 rounded-2xl border-2 transition text-center space-y-1 active:scale-95 ${
                            isUnitSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm font-black'
                              : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 font-bold'
                          }`}
                        >
                          <span className="text-base block">{unitObj.icon}</span>
                          <span className="text-xs block">{lang === 'hi' ? unitObj.labelHi : unitObj.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Interactive Typing Box + Steppers */}
                <div className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleQuantityStep(-(currentUnitMeta.step || 0.5))}
                      className="w-12 h-12 rounded-2xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-black text-xl flex items-center justify-center shadow-sm active:scale-95 transition"
                      title="Decrease"
                    >
                      <Minus className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    <div className="flex-1 relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={quantityText}
                        onChange={(e) => handleQuantityTextChange(e.target.value)}
                        onBlur={handleQuantityBlur}
                        placeholder={lang === 'hi' ? `उदा. ${currentUnitMeta.step || 2}` : `e.g. ${currentUnitMeta.step || 2}`}
                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-emerald-500 bg-white font-black text-stone-900 text-center text-2xl outline-none shadow-inner focus:ring-4 focus:ring-emerald-500/20"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-stone-400 uppercase pointer-events-none">
                        {lang === 'hi' ? currentUnitMeta.labelHi : currentUnitMeta.labelEn}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuantityStep(currentUnitMeta.step || 0.5)}
                      className="w-12 h-12 rounded-2xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-black text-xl flex items-center justify-center shadow-sm active:scale-95 transition"
                      title="Increase"
                    >
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Equivalent Real-Time Conversion Tooltip */}
                  {conversionHints && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lang === 'hi' ? 'क्षेत्रफल रूपांतरण:' : 'Area Equivalence:'}</span>
                      </span>
                      <span className="font-extrabold text-stone-900">
                        {lang === 'hi' 
                          ? `≈ ${conversionHints.bigha} बीघा | ${conversionHints.acre} एकड़ | ${conversionHints.hectare} हेक्टेयर`
                          : `≈ ${conversionHints.bigha} Bigha | ${conversionHints.acre} Acre | ${conversionHints.hectare} Hectare`}
                      </span>
                    </div>
                  )}

                  {/* Slider Control */}
                  <div className="pt-2">
                    <input
                      type="range"
                      min={currentUnitMeta.defaultMin || 0.5}
                      max={currentUnitMeta.defaultMax || 20}
                      step={currentUnitMeta.step || 0.5}
                      value={quantityInput}
                      onChange={(e) => handleSliderQuantityChange(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-2.5 bg-stone-200 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400 font-bold mt-1">
                      <span>{currentUnitMeta.defaultMin} {lang === 'hi' ? currentUnitMeta.labelHi : currentUnitMeta.labelEn}</span>
                      <span>{Math.round((currentUnitMeta.defaultMax / 2) * 10) / 10} {lang === 'hi' ? currentUnitMeta.labelHi : currentUnitMeta.labelEn}</span>
                      <span>{currentUnitMeta.defaultMax} {lang === 'hi' ? currentUnitMeta.labelHi : currentUnitMeta.labelEn}</span>
                    </div>
                  </div>

                  {/* Quick Preset Pills for Fast Selection */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-stone-400 font-bold mr-1">{lang === 'hi' ? 'त्वरित चयन:' : 'Quick Select:'}</span>
                    {currentUnitMeta.presets.map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setQuantityInput(val);
                          setQuantityText(String(val));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          quantityInput === val
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {val} {lang === 'hi' ? currentUnitMeta.labelHi : currentUnitMeta.labelEn}
                      </button>
                    ))}
                  </div>

                </div>

              </div>
            )}

            {/* Mode 2: Truck / Trolley (Distance) */}
            {selectedCategoryId === 'truck' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MOCK_DROP_LOCATIONS.map(loc => (
                    <div
                      key={loc.id}
                      onClick={() => setSelectedDropLocationId(loc.id)}
                      className={`p-3 rounded-xl border-2 transition cursor-pointer text-xs flex items-center justify-between ${
                        selectedDropLocationId === loc.id
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span>{loc.name}</span>
                      <span className="font-black text-stone-900">~{loc.distanceKm} km</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Live Map + Dynamic Pricing Card */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Map Preview */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'hi' ? 'खेत लोकेशन व रडार मैप' : 'Farm Location & Radar'}</span>
              </h3>
              <span className="text-xs text-stone-500 font-bold">
                {selectedLand?.name || (lang === 'hi' ? 'मेरा खेत' : 'My Farm')}
              </span>
            </div>

            <LiveMap
              farmerLocation={{
                lat: selectedLand?.lat || DEFAULT_FARM_LOCATION.lat,
                lng: selectedLand?.lng || DEFAULT_FARM_LOCATION.lng
              }}
              activeVehicleType={selectedCategoryId}
              showNearbyDrivers={true}
              bookingStatus="idle"
              className="h-[260px] w-full rounded-2xl"
            />
          </div>

          {/* TOTAL ESTIMATED PRICE CARD */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 shadow-2xl border-2 border-emerald-500/40 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-700">
              <div>
                <span className="text-xs text-emerald-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" />
                  <span>{t('estimatedPrice')}</span>
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl sm:text-5xl font-black text-white">
                    ₹{fareResult.total}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {t(currentCategory.nameKey)}
                </span>
                <p className="text-[11px] text-stone-400 mt-1 font-semibold">
                  + {t(currentAttachment?.nameKey)}
                </p>
              </div>
            </div>

            {/* Pre-Booking Timing Banner */}
            {bookingTimingMode === 'schedule' ? (
              <div className="p-3.5 rounded-2xl bg-blue-950/90 border border-blue-500/50 text-xs text-blue-200 space-y-1.5">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-amber-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'आरक्षित तारीख:' : 'Reserved Date:'}</span>
                  </span>
                  <span className="font-black text-white">{scheduledDate} ({computedDayOfWeek})</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span>{lang === 'hi' ? 'समय स्लॉट:' : 'Time Slot:'}</span>
                  <span className="font-bold text-amber-300">{scheduledTimeSlot.toUpperCase()}</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-stone-300">
                  <span>{lang === 'hi' ? 'दर गणना:' : 'Calculation Formula:'}</span>
                  <span className="font-extrabold text-emerald-400">{fareResult.breakdownText}</span>
                </div>
                <div className="flex justify-between items-center text-stone-300">
                  <span>{lang === 'hi' ? 'अनुमानित आगमन समय:' : 'Estimated Farm Arrival:'}</span>
                  <span className="font-bold text-amber-300">{lang === 'hi' ? '~35-60 मिनट (सीधा खेत पर)' : '~35-60 Mins (Direct Dispatch)'}</span>
                </div>
              </div>
            )}

            {/* DISCLAIMER NOTE */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <p className="font-medium leading-relaxed">
                {t('priceDisclaimer')}
              </p>
            </div>

            {/* Confirm Booking Button */}
            <button
              onClick={handleConfirmBooking}
              className={`w-full py-4 rounded-2xl font-black text-base sm:text-lg shadow-xl flex items-center justify-center gap-2 transition active:scale-98 transform ${
                bookingTimingMode === 'schedule'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-600/30'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-stone-950 shadow-emerald-500/25'
              }`}
            >
              <span>
                {bookingTimingMode === 'schedule'
                  ? (lang === 'hi' ? `तारीख ${scheduledDate} के लिए अग्रिम आरक्षित करें` : `Confirm Pre-Booking for ${scheduledDate}`)
                  : t('confirmBooking')}
              </span>
              <ChevronRight className="w-6 h-6" />
            </button>

          </div>

        </div>

      </div>

      {/* MODAL 1: PRE-BOOKING CONFIRMATION POPUP */}
      {scheduledSuccessData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-blue-500 relative space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🎉
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-0.5 rounded-full border border-blue-300">
                {lang === 'hi' ? 'अग्रिम बुकिंग सफल' : 'Pre-Booking Confirmed'}
              </span>
              <h3 className="text-xl font-black text-stone-900 mt-1">
                {lang === 'hi' ? 'मशीनरी सफलतापूर्वक आरक्षित की गई!' : 'Farm Machinery Reserved!'}
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {lang === 'hi' 
                  ? 'ड्राइवर पार्टनर को आपकी आरक्षित तारीख व समय की सूचना भेज दी गई है।' 
                  : 'Your advance booking has been confirmed and scheduled in our dispatch queue.'}
              </p>
            </div>

            {/* Scheduled Details Card */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">{lang === 'hi' ? 'तारीख व दिन:' : 'Date & Day:'}</span>
                <b className="text-stone-900">{scheduledSuccessData.scheduledDate} ({scheduledSuccessData.scheduledDay})</b>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">{lang === 'hi' ? 'समय स्लॉट:' : 'Time Slot:'}</span>
                <b className="text-blue-700">{scheduledSuccessData.timeSlot}</b>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">{lang === 'hi' ? 'मशीनरी व यंत्र:' : 'Machinery & Implement:'}</span>
                <b className="text-emerald-700 capitalize">{scheduledSuccessData.machineryType} + {scheduledSuccessData.attachment?.nameEn}</b>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">{lang === 'hi' ? 'मात्रा व आकार:' : 'Quantity & Size:'}</span>
                <b className="text-stone-900">{scheduledSuccessData.landSize} {scheduledSuccessData.sizeUnit?.toUpperCase()}</b>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                <span className="text-stone-500 font-bold">{lang === 'hi' ? 'कुल किराया:' : 'Total Price:'}</span>
                <span className="text-sm font-bold text-stone-700">₹{scheduledSuccessData.estimatedPrice}</span>
              </div>
              {scheduledSuccessData.paymentMethod && (
                <>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-500">{lang === 'hi' ? 'भुगतान विधि:' : 'Payment Method:'}</span>
                    <b className="text-stone-800 uppercase">{scheduledSuccessData.paymentMethod === 'cod' ? 'COD (30% Advance)' : 'Online (100% Paid)'}</b>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-500">{lang === 'hi' ? 'अग्रिम भुगतान:' : 'Paid Advance:'}</span>
                    <b className="text-emerald-700">₹{scheduledSuccessData.advancePaid}</b>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-stone-200 font-black text-sm">
                    <span className="text-stone-700">{lang === 'hi' ? 'शेष देय राशि:' : 'Balance Due:'}</span>
                    <span className="text-amber-700">₹{scheduledSuccessData.balanceDue}</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setScheduledSuccessData(null)}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-600/30 transition active:scale-95"
            >
              {lang === 'hi' ? 'ठीक है' : 'OK (View in Pre-Bookings)'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: MY SAVED LANDS (UP BHULEKH & AGRISTACK) */}
      <SavedLandsModal
        isOpen={isSavedLandsModalOpen}
        onClose={() => setIsSavedLandsModalOpen(false)}
      />

      {/* MODAL 3: PRE-BOOKINGS PORTFOLIO */}
      <PreBookingsModal
        isOpen={isPreBookingsModalOpen}
        onClose={() => setIsPreBookingsModalOpen(false)}
      />

      {/* PAYMENT METHOD MODAL */}
      {isPaymentModalOpen && pendingBookingData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white text-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-stone-900">
                {lang === 'hi' ? 'भुगतान विधि चुनें' : 'Choose Payment Method'}
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {lang === 'hi' ? 'बुकिंग की पुष्टि करने के लिए भुगतान विकल्प चुनें' : 'Select a payment option to confirm your booking'}
              </p>
            </div>

            {paymentStep === 'select' ? (
              <div className="space-y-4">
                {/* Order Summary */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-wider">
                      {lang === 'hi' ? 'कुल राशि' : 'Total Amount'}
                    </p>
                    <p className="text-lg font-black text-stone-800">
                      ₹{pendingBookingData.estimatedPrice}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-wider">
                      {lang === 'hi' ? 'मशीन प्रकार' : 'Machinery'}
                    </p>
                    <p className="text-xs font-bold text-stone-600 capitalize">
                      {pendingBookingData.machineryType === 'truck' ? 'Trolley' : pendingBookingData.machineryType}
                    </p>
                  </div>
                </div>

                {/* Option 1: COD with 30% Advance */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/5'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-stone-300'
                    }`}>
                      {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-stone-900">
                          {lang === 'hi' ? 'कैश ऑन डिलीवरी (COD)' : 'Cash on Delivery (COD)'}
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          30% {lang === 'hi' ? 'अग्रिम' : 'Advance'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 leading-normal">
                        {lang === 'hi'
                          ? `बुकिंग के लिए अभी ₹${Math.round(pendingBookingData.estimatedPrice * 0.3)} का ऑनलाइन भुगतान करें। बाकी ₹${Math.round(pendingBookingData.estimatedPrice * 0.7)} काम के बाद चालक को नकद दें।`
                          : `Pay ₹${Math.round(pendingBookingData.estimatedPrice * 0.3)} (30% booking advance) online now. Pay the remaining ₹${Math.round(pendingBookingData.estimatedPrice * 0.7)} in cash after work.`}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Option 2: 100% Online Payment */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('online')}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                    paymentMethod === 'online'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/5'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      paymentMethod === 'online' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-stone-300'
                    }`}>
                      {paymentMethod === 'online' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-stone-900">
                          {lang === 'hi' ? 'पूर्ण ऑनलाइन भुगतान' : 'Pay Full Amount Online'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          100% {lang === 'hi' ? 'सुरक्षित' : 'Secure'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 leading-normal">
                        {lang === 'hi'
                          ? `अभी पूरा ₹${pendingBookingData.estimatedPrice} भुगतान करें। काम पूरा होने पर कोई अतिरिक्त शुल्क नहीं देना होगा।`
                          : `Pay the full amount of ₹${pendingBookingData.estimatedPrice} now. No cash hassle after work is completed.`}
                      </p>
                    </div>
                  </div>
                </button>

                {/* CTA Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsPaymentModalOpen(false); setPendingBookingData(null); }}
                    className="w-1/3 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm font-bold hover:bg-stone-50 transition"
                  >
                    {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStep('upi')}
                    className="w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black shadow-lg shadow-emerald-600/10 transition flex items-center justify-center gap-1.5"
                  >
                    <span>{lang === 'hi' ? 'भुगतान के लिए आगे बढ़ें' : 'Proceed to Pay'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Simulated UPI QR Screen */
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-4 text-center">
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">
                      {lang === 'hi' ? 'भुगतान की जाने वाली राशि' : 'Amount to Pay'}
                    </span>
                    <span className="text-3xl font-black text-emerald-600">
                      ₹{paymentMethod === 'cod' ? Math.round(pendingBookingData.estimatedPrice * 0.3) : pendingBookingData.estimatedPrice}
                    </span>
                    {paymentMethod === 'cod' && (
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        (30% {lang === 'hi' ? 'बुकिंग अग्रिम' : 'Booking Advance'})
                      </span>
                    )}
                  </div>

                  {/* Simulated QR Code */}
                  <div className="w-40 h-40 bg-white border border-stone-200 rounded-2xl mx-auto flex items-center justify-center p-2 shadow-sm relative group">
                    <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      {/* QR Corner markers */}
                      <rect x="10" y="10" width="50" height="50" rx="4" fill="none" stroke="#1e293b" strokeWidth="6"/>
                      <rect x="20" y="20" width="30" height="30" rx="2" fill="#1e293b"/>
                      <rect x="140" y="10" width="50" height="50" rx="4" fill="none" stroke="#1e293b" strokeWidth="6"/>
                      <rect x="150" y="20" width="30" height="30" rx="2" fill="#1e293b"/>
                      <rect x="10" y="140" width="50" height="50" rx="4" fill="none" stroke="#1e293b" strokeWidth="6"/>
                      <rect x="20" y="150" width="30" height="30" rx="2" fill="#1e293b"/>
                      {/* Data modules */}
                      {[70,80,90,100,110,120].map(x => [70,80,90,100,110,120,130,140,150,160].map(y => (
                        (x + y) % 30 < 15 && <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" rx="1" fill="#1e293b" opacity={0.7 + Math.random() * 0.3}/>
                      )))}
                      {[10,20,30,40,50,70,80,90,100,110].map(x => [70,80,90,100,110].map(y => (
                        (x * y) % 20 < 10 && <rect key={`h-${x}-${y}`} x={x} y={y} width="8" height="8" rx="1" fill="#1e293b" opacity={0.6 + Math.random() * 0.3}/>
                      )))}
                      {[70,80,90,100,110,120,130].map(x => [10,20,30,40,50].map(y => (
                        (x + y * 2) % 25 < 12 && <rect key={`v-${x}-${y}`} x={x} y={y} width="8" height="8" rx="1" fill="#1e293b" opacity={0.6 + Math.random() * 0.3}/>
                      )))}
                      {/* Center UPI logo area */}
                      <rect x="75" y="75" width="50" height="50" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="2"/>
                      <text x="100" y="105" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#059669">UPI</text>
                    </svg>
                    <div className="absolute inset-0 bg-stone-900/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white/95 px-2 py-1 rounded text-[10px] font-bold text-stone-700 shadow-sm">Scan with BHIM/UPI</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-stone-400 font-medium">
                    {lang === 'hi'
                      ? 'भुगतान करने के लिए किसी भी यूपीआई ऐप (PhonePe, GPay, Paytm) का उपयोग करके इस क्यूआर कोड को स्कैन करें।'
                      : 'Scan this QR code using any UPI app (PhonePe, GPay, Paytm) to make the payment.'}
                  </p>
                </div>

                {/* Confirm Action Button */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStep('select')}
                    className="w-1/3 py-3.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-bold hover:bg-stone-50 transition"
                  >
                    {lang === 'hi' ? 'पीछे जाएँ' : 'Back'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteBookingWithPayment(
                      paymentMethod,
                      paymentMethod === 'cod' ? Math.round(pendingBookingData.estimatedPrice * 0.3) : pendingBookingData.estimatedPrice
                    )}
                    className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-stone-950 text-sm font-black shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-1.5 transition"
                  >
                    <ShieldCheck className="w-4 h-4 text-stone-950" />
                    <span>
                      {lang === 'hi' ? 'मैंने भुगतान कर दिया है' : 'I Have Paid & Confirm'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
