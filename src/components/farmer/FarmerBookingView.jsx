import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
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
import FarmerBookingHistoryModal from './FarmerBookingHistoryModal';
import confetti from 'canvas-confetti';
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
  LandPlot,
  Ruler,
  ShieldCheck,
  Wrench,
  Sprout,
  Copy,
  Smartphone,
  ExternalLink,
  QrCode,
  Package,
  Boxes,
  Home,
  Building,
  Store,
  Warehouse,
  History
} from 'lucide-react';

// Specialized Farm Cargo Types for Transport
export const CARGO_TYPES = [
  {
    id: 'grains',
    nameKey: 'cargoGrains',
    nameEn: 'Harvested Grains & Crops',
    nameHi: 'अनाज / फसल (गेहूँ, धान, मक्का)',
    icon: '🌾',
    descEn: 'Wheat, Paddy, Mustard, Maize, Pulses',
    descHi: 'गेहूँ, धान, मक्का, सरसों, दलहन बोरियां'
  },
  {
    id: 'inputs',
    nameKey: 'cargoInputs',
    nameEn: 'Fertilizers, Seeds & Compost',
    nameHi: 'खाद, उर्वरक व बीज',
    icon: '🌱',
    descEn: 'DAP, Urea, Organic Manure, Certified Seeds',
    descHi: 'डीएपी, यूरिया, जैविक खाद, प्रमाणित बीज'
  },
  {
    id: 'fodder',
    nameKey: 'cargoFodder',
    nameEn: 'Crop Straw / Bhusa / Fodder',
    nameHi: 'भूसा, चारा व पुआल',
    icon: '🪵',
    descEn: 'Wheat Straw, Cattle Feed, Fodder Bales',
    descHi: 'गेहूँ का भूसा, पशु चारा, पुआल बंडल'
  },
  {
    id: 'produce',
    nameKey: 'cargoProduce',
    nameEn: 'Fresh Fruits & Vegetables',
    nameHi: 'फल व ताजी सब्जियां',
    icon: '🥭',
    descEn: 'Malihabad Mangoes, Potatoes, Tomatoes',
    descHi: 'मलिहाबादी आम, आलू, टमाटर, हरी सब्जियां'
  },
  {
    id: 'construction',
    nameKey: 'cargoConstruction',
    nameEn: 'Sand / Gravel / Bricks',
    nameHi: 'रेत, मौरंग, गिट्टी व ईंट',
    icon: '🧱',
    descEn: 'River Sand, Aggregate, Field Boundary Bricks',
    descHi: 'नदी की रेत, मौरंग, गिट्टी, खेत बाउंड्री ईंटें'
  },
  {
    id: 'equipment',
    nameKey: 'cargoEquipment',
    nameEn: 'Farm Equipment Shifting',
    nameHi: 'कृषि यंत्र व भारी उपकरण ढुलाई',
    icon: '⚙️',
    descEn: 'Threshers, Generators, Pumps, Heavy Implements',
    descHi: 'थ्रेशर, जनरेटर, सिंचाई पंप, भारी उपकरण'
  }
];

// Specialized Transport Destinations
export const TRANSPORT_DROP_DESTINATIONS = [
  {
    id: 'loc_1',
    nameEn: 'APMC Grain Market (कृषि गल्ला मंडी)',
    nameHi: 'नवीन कृषि उत्पादन गल्ला मंडी समिति',
    district: 'Malihabad Mandi',
    distanceKm: 14,
    icon: '🏬',
    tagEn: 'Direct Crop Sale',
    tagHi: 'फसल बिक्री केंद्र'
  },
  {
    id: 'loc_2',
    nameEn: 'Regional Cold Storage & Fruit Silo',
    nameHi: 'कोल्ड स्टोरेज एवं साइलो गोदाम',
    district: 'Kakori Complex',
    distanceKm: 22,
    icon: '🏭',
    tagEn: 'Perishable Storage',
    tagHi: 'शीतगृह भंडारण'
  },
  {
    id: 'loc_3',
    nameEn: 'Central FCI Grain Godown / Depot',
    nameHi: 'एफसीआई अनाज गोदाम / वेयरहाउस',
    district: 'Bakshi Ka Talab',
    distanceKm: 8,
    icon: '🏢',
    tagEn: 'Govt Procurement',
    tagHi: 'सरकारी क्रय केंद्र'
  },
  {
    id: 'loc_4',
    nameEn: 'Local Flour & Processing Mill',
    nameHi: 'आटा व राइस प्रोसेसिंग मिल',
    district: 'Dubagga Industrial Area',
    distanceKm: 18,
    icon: '🌾',
    tagEn: 'Direct Buyer',
    tagHi: 'सीधा खरीदार'
  },
  {
    id: 'loc_5',
    nameEn: 'Farmer Residence / Private Godown',
    nameHi: 'किसान का घर / निजी गोदाम',
    district: 'Gram Panchayat Rampur',
    distanceKm: 4,
    icon: '🏡',
    tagEn: 'Home Delivery',
    tagHi: 'घर तक ढुलाई'
  },
  {
    id: 'loc_6',
    nameEn: 'Custom Destination Address (Enter Custom Km)',
    nameHi: 'अन्य गंतव्य स्थान (कस्टम दूरी दर्ज करें)',
    district: 'Custom Location',
    distanceKm: 12,
    icon: '📍',
    tagEn: 'Flexible Distance',
    tagHi: 'इच्छानुसार दूरी'
  }
];

// Refined Vector Icon Helpers
const getCategoryIcon = (catId, isSelected) => {
  switch (catId) {
    case 'tractor':
      return <Tractor className={`w-7 h-7 ${isSelected ? 'text-emerald-400' : 'text-stone-400'}`} />;
    case 'harvester':
      return <Wheat className={`w-7 h-7 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />;
    case 'jcb':
      return <Layers className={`w-7 h-7 ${isSelected ? 'text-orange-400' : 'text-stone-400'}`} />;
    case 'truck':
      return <Truck className={`w-7 h-7 ${isSelected ? 'text-blue-400' : 'text-stone-400'}`} />;
    default:
      return <Tractor className="w-7 h-7 text-emerald-400" />;
  }
};

const getAttachmentIcon = (attId, isSelected) => {
  switch (attId) {
    case 'rotavator':
      return <Settings2 className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-stone-400'}`} />;
    case 'plough':
      return <Wrench className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-stone-400'}`} />;
    case 'cultivator':
      return <Wheat className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />;
    case 'seedDrill':
      return <Sprout className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-stone-400'}`} />;
    case 'laserLeveler':
      return <Zap className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-stone-400'}`} />;
    default:
      return <Settings2 className="w-5 h-5 text-emerald-400" />;
  }
};

const getUnitIcon = (unitId, isSelected) => {
  switch (unitId) {
    case 'bigha':
      return <LandPlot className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-stone-400'}`} />;
    case 'acre':
      return <Tractor className={`w-4 h-4 ${isSelected ? 'text-teal-400' : 'text-stone-400'}`} />;
    case 'hectare':
      return <Ruler className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-stone-400'}`} />;
    case 'hours':
      return <Clock className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />;
    case 'biswa':
      return <Layers className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-stone-400'}`} />;
    case 'kanal':
      return <Wheat className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-stone-400'}`} />;
    default:
      return <LandPlot className="w-4 h-4 text-emerald-400" />;
  }
};

export default function FarmerBookingView({ onOpenAuthModal }) {
  const { lang, t, localize } = useLanguage();
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const { createBookingRequest, activeBooking } = useRealtimeSync();
  const { rates, calculateFare } = usePricing();
  const { savedLands, selectedLand, selectedLandId, setSelectedLandId } = useSavedLands();
  const { preBookings, addPreBooking } = usePreBookings();

  const [isSavedLandsModalOpen, setIsSavedLandsModalOpen] = useState(false);
  const [isPreBookingsModalOpen, setIsPreBookingsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Booking Timing Mode: 'instant' (Now) vs 'schedule' (Pre-Book for Date & Day)
  const [bookingTimingMode, setBookingTimingMode] = useState('instant');

  // Pre-Booking Date & Time State
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [scheduledDate, setScheduledDate] = useState(tomorrowStr);
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('morning');
  const [specialNotes, setSpecialNotes] = useState('');
  const [scheduledSuccessData, setScheduledSuccessData] = useState(null);

  // Pre-Booking Bargain / Counter-Offer State
  const [customBargainPrice, setCustomBargainPrice] = useState(null);

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

  // Truck / Logistics Specific States (Cargo & Where to Go)
  const [selectedCargoId, setSelectedCargoId] = useState('grains');
  const [customCargoText, setCustomCargoText] = useState('');
  const [customDropLocationName, setCustomDropLocationName] = useState('');
  const [cargoWeightTons, setCargoWeightTons] = useState(5);

  // Active Unit Metadata
  const currentUnitMeta = useMemo(() => {
    return SUPPORTED_QUANTITY_UNITS.find(u => u.id === selectedUnit) || SUPPORTED_QUANTITY_UNITS[0];
  }, [selectedUnit]);

  // Selected Cargo Object
  const currentCargo = useMemo(() => {
    return CARGO_TYPES.find(c => c.id === selectedCargoId) || CARGO_TYPES[0];
  }, [selectedCargoId]);

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
    return TRANSPORT_DROP_DESTINATIONS.find(loc => loc.id === selectedDropLocationId) || TRANSPORT_DROP_DESTINATIONS[0];
  }, [selectedDropLocationId]);

  // Effective Distance in Km
  const effectiveDistanceKm = useMemo(() => {
    if (selectedDropLocationId === 'loc_6') {
      return Number(customDistanceKm) || 12;
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

    const finalPrice = (customBargainPrice !== null && customBargainPrice > 0) 
      ? Number(customBargainPrice) 
      : fareResult.total;

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
        estimatedPrice: finalPrice,
        originalStandardPrice: fareResult.total,
        isBargained: finalPrice !== fareResult.total,
        paymentMethod: 'pay_after_work',
        advancePaid: 0,
        balanceDue: finalPrice,
        specialNotes: specialNotes
      };
      const newPreBooking = addPreBooking(payload);
      setScheduledSuccessData(newPreBooking);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
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
        dropLocation: selectedCategoryId === 'truck' 
          ? (selectedDropLocationId === 'loc_6' ? (customDropLocationName || 'Custom Destination') : currentDropLocation.nameEn)
          : null,
        cargoName: selectedCategoryId === 'truck' ? (lang === 'hi' ? currentCargo.nameHi : currentCargo.nameEn) : null,
        cargoDetails: selectedCategoryId === 'truck' ? (customCargoText || currentCargo.descEn) : null,
        pickupAddress: selectedLand?.address || 'Khet #14, Gram Malihabad',
        estimatedPrice: finalPrice,
        originalStandardPrice: fareResult.total,
        isBargained: finalPrice !== fareResult.total,
        paymentMethod: 'pay_after_work',
        advancePaid: 0,
        balanceDue: finalPrice,
        estimatedETA: lang === 'hi' ? '35-60 मिनट' : '35-60 Mins'
      };

      if (selectedCategoryId === 'truck') {
        const cargoNameStr = lang === 'hi' ? currentCargo.nameHi : currentCargo.nameEn;
        const dropNameStr = selectedDropLocationId === 'loc_6' 
          ? (customDropLocationName || (lang === 'hi' ? 'कस्टम गंतव्य स्थान' : 'Custom Destination'))
          : (lang === 'hi' ? currentDropLocation.nameHi : currentDropLocation.nameEn);

        payload = {
          ...payload,
          cargoId: selectedCargoId,
          cargoName: cargoNameStr,
          cargoDetails: customCargoText || (lang === 'hi' ? currentCargo.descHi : currentCargo.descEn),
          pickupAddress: selectedLand?.address || 'Khet #14, Gram Malihabad',
          dropLocation: dropNameStr,
          distanceKm: effectiveDistanceKm,
          cargoWeightTons: cargoWeightTons
        };
      }

      createBookingRequest(payload);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in text-stone-100">
      
      {/* Top Banner: Saved Lands & Pre-Bookings Manager Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border shadow-2xl relative overflow-hidden group transition-colors duration-200 ${
        isDark ? 'bg-stone-900/80 backdrop-blur-xl border-stone-800 text-white shadow-black/40' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <div className="relative flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg ${
            isDark ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 shadow-emerald-950/50' : 'bg-emerald-100 border border-emerald-300 text-emerald-700'
          }`}>
            <Tractor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-black text-base sm:text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {lang === 'hi' ? 'किसान बुकिंग कॉकपिट' : 'Farmer Booking Cockpit'}
              </h2>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider backdrop-blur-sm ${
                isDark ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {lang === 'hi' ? '1-क्लिक वाहन सेवा' : '1-Click Dispatch'}
              </span>
            </div>
            <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
              {lang === 'hi' ? 'सक्रिय खेत: ' : 'Active Land: '}
              <span className="text-emerald-500 font-bold">
                {selectedLand ? localize(selectedLand.name) : (lang === 'hi' ? 'मेरा खेत' : 'My Farm')} ({selectedLand?.bigha || 3} {lang === 'hi' ? 'बीघा' : 'Bigha'})
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all duration-200 active:scale-95 shadow-md ${
              isDark 
                ? 'bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border-emerald-500/40 hover:border-emerald-500 shadow-emerald-950/30' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'hi' ? 'बुकिंग इतिहास' : 'My History'}</span>
          </button>

          <button
            onClick={() => setIsPreBookingsModalOpen(true)}
            className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all duration-200 active:scale-95 shadow-md ${
              isDark 
                ? 'bg-blue-950/70 hover:bg-blue-900/90 text-blue-300 border-blue-500/30 hover:border-blue-500/60 shadow-blue-950/30' 
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>{lang === 'hi' ? 'अग्रिम बुकिंग' : 'Pre-Bookings'} ({preBookings.length})</span>
          </button>

          <button
            onClick={() => setIsSavedLandsModalOpen(true)}
            className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all duration-200 active:scale-95 shadow-md ${
              isDark 
                ? 'bg-stone-850/90 hover:bg-stone-800 text-stone-200 border-stone-700/80 hover:border-emerald-500/50 shadow-black/40' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-500" />
            <span>{lang === 'hi' ? 'सहेजे गए खेत' : 'My Saved Lands'} ({savedLands.length})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: 4 Step Interactive Booking Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: Select Booking Timing (Instant vs Pre-Book) */}
          <div className={`rounded-3xl p-6 sm:p-7 border shadow-2xl space-y-5 transition-colors duration-200 ${
            isDark ? 'bg-stone-900/70 backdrop-blur-xl border-stone-800/80 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500">{lang === 'hi' ? 'चरण 1' : 'STEP 1'}</span>
                <h3 className={`text-lg sm:text-xl font-black tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {lang === 'hi' ? 'बुकिंग का समय चुनें' : 'Select Booking Timing'}
                </h3>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 backdrop-blur-sm ${
                isDark ? 'text-blue-400 bg-blue-950/70 border-blue-500/30' : 'text-blue-700 bg-blue-50 border-blue-200'
              }`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{bookingTimingMode === 'schedule' ? (lang === 'hi' ? 'अग्रिम आरक्षण' : 'Advanced Reservation') : (lang === 'hi' ? 'तत्काल सेवा' : 'Immediate Need')}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Option A: Instant Dispatch (Now) */}
              <div
                onClick={() => setBookingTimingMode('instant')}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer space-y-3 relative overflow-hidden group ${
                  bookingTimingMode === 'instant'
                    ? isDark ? 'border-emerald-500/70 bg-emerald-950/40 shadow-xl shadow-emerald-950/50 ring-1 ring-emerald-500/40' : 'border-emerald-500 bg-emerald-50/80 shadow-md ring-1 ring-emerald-500/40'
                    : isDark ? 'border-stone-800 bg-stone-950/60 hover:border-stone-700 hover:bg-stone-900/60 text-stone-300' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    bookingTimingMode === 'instant' 
                      ? isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : isDark ? 'bg-stone-850 text-stone-400 border border-stone-700' : 'bg-slate-200 text-slate-600 border border-slate-300'
                  }`}>
                    <Zap className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                    bookingTimingMode === 'instant' ? 'border-emerald-500 bg-emerald-500' : isDark ? 'border-stone-700 bg-stone-900' : 'border-slate-300 bg-white'
                  }`}>
                    {bookingTimingMode === 'instant' && <Check className="w-3 h-3 text-stone-950 stroke-[3]" />}
                  </div>
                </div>
                <div>
                  <h4 className={`font-extrabold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {lang === 'hi' ? 'तुरंत मंगाएं' : 'Instant Dispatch (Now)'}
                  </h4>
                  <p className={`text-xs font-medium mt-1 ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                    {lang === 'hi' ? 'खेत पर आगमन: ~35-60 मिनट' : 'Farm Arrival: ~35-60 Mins'}
                  </p>
                </div>
              </div>

              {/* Option B: Pre-Book for Date & Day */}
              <div
                onClick={() => setBookingTimingMode('schedule')}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer space-y-3 relative overflow-hidden group ${
                  bookingTimingMode === 'schedule'
                    ? isDark ? 'border-blue-500/70 bg-blue-950/40 shadow-xl shadow-blue-950/50 ring-1 ring-blue-500/40' : 'border-blue-500 bg-blue-50/80 shadow-md ring-1 ring-blue-500/40'
                    : isDark ? 'border-stone-800 bg-stone-950/60 hover:border-stone-700 hover:bg-stone-900/60 text-stone-300' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    bookingTimingMode === 'schedule' 
                      ? isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-blue-100 text-blue-700 border border-blue-300'
                      : isDark ? 'bg-stone-850 text-stone-400 border border-stone-700' : 'bg-slate-200 text-slate-600 border border-slate-300'
                  }`}>
                    <CalendarDays className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                    bookingTimingMode === 'schedule' ? 'border-blue-500 bg-blue-500' : isDark ? 'border-stone-700 bg-stone-900' : 'border-slate-300 bg-white'
                  }`}>
                    {bookingTimingMode === 'schedule' && <Check className="w-3 h-3 text-stone-950 stroke-[3]" />}
                  </div>
                </div>
                <div>
                  <h4 className={`font-extrabold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {lang === 'hi' ? 'अग्रिम तारीख के लिए बुक करें' : 'Pre-Book for Date & Day'}
                  </h4>
                  <p className={`text-xs font-medium mt-1 ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                    {lang === 'hi' ? 'आगामी जुताई/कटाई के लिए आरक्षित' : 'Reserve machinery in advance'}
                  </p>
                </div>
              </div>

            </div>

            {/* PRE-BOOKING SPECIFIC INPUTS (Date, Day & Time Slot) */}
            {bookingTimingMode === 'schedule' && (
              <div className="p-5 rounded-2xl bg-stone-950/90 text-white space-y-4 border border-blue-500/30 shadow-2xl animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-black text-blue-400 uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>{lang === 'hi' ? 'अग्रिम बुकिंग विवरण' : 'Pre-Booking Schedule Details'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Date Picker */}
                  <div>
                    <label className="block text-[11px] font-black text-stone-400 uppercase mb-1.5">
                      {lang === 'hi' ? 'तारीख चुनें *' : 'Select Date *'}
                    </label>
                    <input
                      type="date"
                      min={tomorrowStr}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-700 bg-stone-900 font-bold text-xs text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                  {/* Day of Week Display */}
                  <div>
                    <label className="block text-[11px] font-black text-stone-400 uppercase mb-1.5">
                      {lang === 'hi' ? 'दिन' : 'Day of Week'}
                    </label>
                    <div className="px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 font-bold text-xs text-amber-400 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      <span>{computedDayOfWeek}</span>
                    </div>
                  </div>
                </div>

                {/* Time Window Selection */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-stone-400 uppercase">
                    {lang === 'hi' ? 'समय का स्लॉट *' : 'Time Slot *'}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {timeSlotOptions.map(slot => (
                      <div
                        key={slot.id}
                        onClick={() => setScheduledTimeSlot(slot.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          scheduledTimeSlot === slot.id
                            ? 'border-amber-500/70 bg-amber-950/30 text-white'
                            : 'border-stone-800 bg-stone-900/60 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{slot.icon}</span>
                          <div>
                            <span className="font-extrabold text-xs block text-white">
                              {lang === 'hi' ? slot.labelHi : slot.labelEn}
                            </span>
                            <span className="text-[11px] text-stone-400 font-medium">
                              {slot.desc}
                            </span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          scheduledTimeSlot === slot.id ? 'border-amber-400 bg-amber-400' : 'border-stone-700'
                        }`}>
                          {scheduledTimeSlot === slot.id && <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Instructions Note */}
                <div>
                  <label className="block text-[11px] font-black text-stone-400 uppercase mb-1.5">
                    {lang === 'hi' ? 'खेत निर्देश / विशेष विवरण' : 'Farm Instructions / Special Notes'}
                  </label>
                  <input
                    type="text"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder={lang === 'hi' ? 'उदा. सड़क से खेत तक चकमार्ग उपलब्ध है' : 'e.g. Approach pathway available from main road'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-700 bg-stone-900 text-white text-xs outline-none placeholder:text-stone-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Machinery Selection */}
          <div className={`rounded-3xl p-6 sm:p-7 border shadow-2xl space-y-5 transition-colors duration-200 ${
            isDark ? 'bg-stone-900/70 backdrop-blur-xl border-stone-800/80 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500">{lang === 'hi' ? 'चरण 2' : 'STEP 2'}</span>
                <h3 className={`text-lg sm:text-xl font-black tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {lang === 'hi' ? 'मशीनरी का चयन करें' : 'Select Machinery Fleet'}
                </h3>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                isDark ? 'text-stone-400 bg-stone-800 border-stone-700' : 'text-slate-600 bg-slate-100 border-slate-200'
              }`}>
                {currentCategory.capacity}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {MACHINERY_CATEGORIES.map(cat => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-center space-y-2.5 relative group ${
                      isSelected
                        ? isDark ? 'border-emerald-500/80 bg-emerald-950/40 shadow-xl shadow-emerald-950/60 ring-1 ring-emerald-500/40' : 'border-emerald-500 bg-emerald-50/80 shadow-md ring-1 ring-emerald-500/40'
                        : isDark ? 'border-stone-800 bg-stone-950/60 hover:border-stone-700 hover:bg-stone-900/60 text-stone-300' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center transition-all ${
                      isSelected 
                        ? isDark ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-emerald-100 border border-emerald-300'
                        : isDark ? 'bg-stone-850 border border-stone-700' : 'bg-slate-200 border border-slate-300'
                    }`}>
                      {getCategoryIcon(cat.id, isSelected)}
                    </div>
                    <div>
                      <h4 className={`font-extrabold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {t(cat.nameKey)}
                      </h4>
                      <span className="text-xs font-black text-emerald-500 mt-1 block tracking-wide">
                        {cat.id === 'truck' ? `₹${rates.truck?.ratePerKm}/km` : cat.id === 'jcb' ? `₹${rates.jcb?.ratePerHour}/${lang === 'hi' ? 'घंटा' : 'hr'}` : `₹${rates[cat.id]?.ratePerBigha}/${lang === 'hi' ? 'बीघा' : 'bigha'}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Mandatory Implement/Attachment Selection OR Cargo Selection for Truck */}
          {selectedCategoryId === 'truck' ? (
            <div className={`rounded-3xl p-6 sm:p-7 border shadow-2xl space-y-5 animate-fade-in transition-colors duration-200 ${
              isDark ? 'bg-stone-900/70 backdrop-blur-xl border-stone-800/80 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500">{lang === 'hi' ? 'चरण 3' : 'STEP 3'}</span>
                  <h3 className={`text-lg sm:text-xl font-black tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {lang === 'hi' ? 'क्या उठाना है? माल / फसल सामग्री का प्रकार' : 'What to Pick Up? (Select Cargo Type)'}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-slate-500'} mt-0.5`}>
                    {lang === 'hi' ? 'ट्रक अथवा ट्रैक्टर-ट्रॉली में ढुलाई हेतु फसल/सामग्री का चयन करें' : 'Select agricultural produce or materials to load and transport'}
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  isDark ? 'text-blue-400 bg-blue-950/70 border-blue-500/30' : 'text-blue-800 bg-blue-50 border-blue-200'
                }`}>
                  {lang === 'hi' ? '📦 अनिवार्य माल चयन' : '📦 Mandatory Cargo'}
                </span>
              </div>

              {/* 6-Grid of Farm Cargo Types */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CARGO_TYPES.map(cargo => {
                  const isSelected = selectedCargoId === cargo.id;
                  return (
                    <div
                      key={cargo.id}
                      onClick={() => setSelectedCargoId(cargo.id)}
                      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer space-y-2 relative ${
                        isSelected
                          ? isDark ? 'border-emerald-500/80 bg-emerald-950/40 shadow-xl shadow-emerald-950/60 ring-1 ring-emerald-500/40' : 'border-emerald-500 bg-emerald-50/80 shadow-md ring-1 ring-emerald-500/40'
                          : isDark ? 'border-stone-800 bg-stone-950/60 hover:border-stone-700 hover:bg-stone-900/60 text-stone-300' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{cargo.icon}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-emerald-400 bg-emerald-400' : isDark ? 'border-stone-700' : 'border-slate-300'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                        </div>
                      </div>
                      <div>
                        <h5 className={`font-black text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {lang === 'hi' ? cargo.nameHi : cargo.nameEn}
                        </h5>
                        <p className={`text-[11px] font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'} mt-0.5`}>
                          {lang === 'hi' ? cargo.descHi : cargo.descEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Optional Custom Cargo Details Input */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isDark ? 'bg-stone-950/80 border-stone-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <label className={`block text-[11px] font-black uppercase tracking-wider ${
                  isDark ? 'text-stone-400' : 'text-slate-600'
                }`}>
                  {lang === 'hi' ? 'विशिष्ट माल विवरण / मात्रा (वैकल्पिक)' : 'Specific Cargo Quantity / Details (Optional)'}
                </label>
                <input
                  type="text"
                  value={customCargoText}
                  onChange={(e) => setCustomCargoText(e.target.value)}
                  placeholder={lang === 'hi' ? 'उदा. 80 बोरी गेहूं (40 क्विंटल) / 50 कट्टे डीएपी खाद / 1 पूरी ट्रॉली भूसा' : 'e.g. 80 Bags Wheat (40 Quintals) / 50 Bags Fertilizer / 1 Full Trolley'}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold outline-none transition ${
                    isDark ? 'bg-stone-900 border-stone-700 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>

              {/* Vehicle Body / Trolley Type Selection */}
              <div className="space-y-2">
                <label className={`block text-[11px] font-black uppercase tracking-wider ${
                  isDark ? 'text-stone-400' : 'text-slate-600'
                }`}>
                  {lang === 'hi' ? 'वाहन बॉडी व ट्रॉली का प्रकार:' : 'Select Truck / Trolley Body Type:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {currentCategory.attachments?.map(att => {
                    const isSelected = selectedAttachmentId === att.id;
                    return (
                      <div
                        key={att.id}
                        onClick={() => setSelectedAttachmentId(att.id)}
                        className={`p-3 rounded-xl border cursor-pointer text-xs flex items-center justify-between ${
                          isSelected
                            ? isDark ? 'border-blue-500/80 bg-blue-950/40 text-white font-bold' : 'border-blue-500 bg-blue-50 text-blue-950 font-bold'
                            : isDark ? 'border-stone-800 bg-stone-950/60 text-stone-300 hover:border-stone-700' : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{att.icon}</span>
                          <span>{t(att.nameKey)}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : currentCategory.attachments && currentCategory.attachments.length > 0 && (
            <div className={`rounded-3xl p-6 sm:p-7 border shadow-2xl space-y-5 animate-fade-in transition-colors duration-200 ${
              isDark ? 'bg-stone-900/70 backdrop-blur-xl border-stone-800/80 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500">{lang === 'hi' ? 'चरण 3' : 'STEP 3'}</span>
                  <h3 className={`text-lg sm:text-xl font-black tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {lang === 'hi' ? 'यंत्र / उपकरण जोड़ें' : 'Select Implement / Attachment'}
                  </h3>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  isDark ? 'text-amber-400 bg-amber-950/70 border-amber-500/30' : 'text-amber-800 bg-amber-50 border-amber-200'
                }`}>
                  {lang === 'hi' ? 'अनिवार्य उपकरण' : 'Mandatory Implement'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentCategory.attachments.map(att => {
                  const isSelected = selectedAttachmentId === att.id;
                  return (
                    <div
                      key={att.id}
                      onClick={() => setSelectedAttachmentId(att.id)}
                      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? isDark ? 'border-emerald-500/80 bg-emerald-950/40 shadow-xl shadow-emerald-950/60 ring-1 ring-emerald-500/40' : 'border-emerald-500 bg-emerald-50/80 shadow-md ring-1 ring-emerald-500/40'
                          : isDark ? 'border-stone-800 bg-stone-950/60 hover:border-stone-700 hover:bg-stone-900/60 text-stone-300' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isSelected 
                            ? isDark ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-emerald-100 border border-emerald-300'
                            : isDark ? 'bg-stone-850 border border-stone-700' : 'bg-slate-200 border border-slate-300'
                        }`}>
                          {getAttachmentIcon(att.id, isSelected)}
                        </div>
                        <div>
                          <h5 className={`font-extrabold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {t(att.nameKey)}
                          </h5>
                          <p className={`text-[11px] font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                            {t(att.descKey)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {att.extraRatePerAcre > 0 && (
                          <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                            isDark ? 'text-amber-400 bg-amber-950/60 border-amber-500/30' : 'text-amber-800 bg-amber-50 border-amber-200'
                          }`}>
                            +₹{att.extraRatePerAcre}/{lang === 'hi' ? 'बीघा' : 'bigha'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Farmland Size OR Where to Go (Pickup & Delivery Destination) */}
          <div className={`rounded-3xl p-6 sm:p-7 border shadow-2xl space-y-5 transition-colors duration-200 ${
            isDark ? 'bg-stone-900/70 backdrop-blur-xl border-stone-800/80 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500">{lang === 'hi' ? 'चरण 4' : 'STEP 4'}</span>
                <h3 className={`text-lg sm:text-xl font-black tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedCategoryId === 'truck' 
                    ? (lang === 'hi' ? 'कहाँ ले जाना है? पिकअप व गंतव्य रूट' : 'Where to Go? (Pickup & Delivery Destination)')
                    : (lang === 'hi' ? 'खेत का आकार व मात्रा' : 'Farmland Size & Quantity')}
                </h3>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                selectedCategoryId === 'truck'
                  ? isDark ? 'text-blue-400 bg-blue-950/70 border-blue-500/30' : 'text-blue-700 bg-blue-50 border-blue-200'
                  : isDark ? 'text-emerald-400 bg-emerald-950/70 border-emerald-500/30' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
              }`}>
                {selectedCategoryId === 'truck' ? <Navigation className="w-3.5 h-3.5" /> : <Ruler className="w-3.5 h-3.5" />}
                <span>{selectedCategoryId === 'truck' ? (lang === 'hi' ? 'दूरी व रूट आधारित दर' : 'Route & Km Based') : (lang === 'hi' ? 'सभी इकाइयाँ समर्थित' : 'Multi-Unit Enabled')}</span>
              </span>
            </div>

            {/* Mode 1: Tractor & Harvester & Multi-Unit Land Operations */}
            {(selectedCategoryId === 'tractor' || selectedCategoryId === 'harvester' || selectedCategoryId === 'jcb') && (
              <div className="space-y-5">
                
                {/* Interactive Unit Selection Pills */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${
                    isDark ? 'text-stone-400' : 'text-slate-600'
                  }`}>
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
                          className={`p-3 rounded-2xl border transition-all text-center space-y-1.5 active:scale-95 ${
                            isUnitSelected
                              ? isDark ? 'border-emerald-500/80 bg-emerald-950/50 text-white shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-500/40 font-extrabold' : 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-md ring-1 ring-emerald-500/40 font-extrabold'
                              : isDark ? 'border-stone-800 bg-stone-950/60 hover:border-stone-700 text-stone-400 font-bold' : 'border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-600 font-bold'
                          }`}
                        >
                          <div className="flex justify-center">
                            {getUnitIcon(unitObj.id, isUnitSelected)}
                          </div>
                          <span className={`text-xs block ${isDark ? 'text-stone-200' : 'text-slate-800'}`}>{lang === 'hi' ? unitObj.labelHi : unitObj.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Interactive Typing Box + Steppers */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  isDark ? 'bg-stone-950/80 border-stone-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => handleQuantityStep(-(currentUnitMeta.step || 0.5))}
                      className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border font-black text-2xl flex items-center justify-center shadow-lg active:scale-95 transition ${
                        isDark 
                          ? 'bg-stone-900 border-stone-700 hover:border-emerald-500 text-stone-200 hover:text-emerald-400' 
                          : 'bg-white border-slate-300 hover:border-emerald-500 text-slate-800 hover:text-emerald-600'
                      }`}
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
                        className={`w-full px-4 py-3.5 rounded-2xl border font-black text-emerald-500 text-center text-3xl sm:text-4xl outline-none shadow-inner focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
                          isDark ? 'border-stone-700 bg-stone-900' : 'border-slate-300 bg-white'
                        }`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-stone-400 uppercase pointer-events-none tracking-wider">
                        {lang === 'hi' ? currentUnitMeta.labelHi : currentUnitMeta.labelEn}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuantityStep(currentUnitMeta.step || 0.5)}
                      className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border font-black text-2xl flex items-center justify-center shadow-lg active:scale-95 transition ${
                        isDark 
                          ? 'bg-stone-900 border-stone-700 hover:border-emerald-500 text-stone-200 hover:text-emerald-400' 
                          : 'bg-white border-slate-300 hover:border-emerald-500 text-slate-800 hover:text-emerald-600'
                      }`}
                      title="Increase"
                    >
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Equivalent Real-Time Conversion Tooltip */}
                  {conversionHints && (
                    <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                      isDark ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{lang === 'hi' ? 'क्षेत्रफल रूपांतरण:' : 'Area Equivalence:'}</span>
                      </span>
                      <span className={`font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
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
                      className={`w-full accent-emerald-500 cursor-pointer h-2 rounded-lg ${isDark ? 'bg-stone-800' : 'bg-slate-200'}`}
                    />
                    <div className={`flex justify-between text-[11px] font-bold mt-1.5 ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                      <span>{currentUnitMeta.defaultMin} {lang === 'hi' ? currentUnitMeta.labelHi : currentUnitMeta.labelEn}</span>
                      <span>{Math.round((currentUnitMeta.defaultMax / 2) * 10) / 10} {lang === 'hi' ? currentUnitMeta.labelHi : currentUnitMeta.labelEn}</span>
                      <span>{currentUnitMeta.defaultMax} {lang === 'hi' ? currentUnitMeta.labelHi : currentUnitMeta.labelEn}</span>
                    </div>
                  </div>

                  {/* Quick Preset Pills for Fast Selection */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className={`text-[11px] font-bold mr-1 ${isDark ? 'text-stone-400' : 'text-slate-600'}`}>{lang === 'hi' ? 'त्वरित चयन:' : 'Quick Select:'}</span>
                    {currentUnitMeta.presets.map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setQuantityInput(val);
                          setQuantityText(String(val));
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          quantityInput === val
                            ? 'bg-emerald-500 text-stone-950 shadow-md font-black'
                            : isDark ? 'bg-stone-900 border border-stone-800 text-stone-300 hover:border-emerald-500/40 hover:text-white' : 'bg-white border border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
                        }`}
                      >
                        {val} {lang === 'hi' ? currentUnitMeta.labelHi : currentUnitMeta.labelEn}
                      </button>
                    ))}
                  </div>

                </div>

              </div>
            )}

            {/* Mode 2: Truck / Trolley Logistics (Where to Go / Pickup & Delivery Route) */}
            {selectedCategoryId === 'truck' && (
              <div className="space-y-5 animate-fade-in">
                
                {/* 1. Pickup Origin Point (Default: Farm) */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDark ? 'bg-stone-950/80 border-stone-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-lg shrink-0">
                      📍
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                        {lang === 'hi' ? 'माल उठाने का स्थान (Pickup Point)' : 'Origin / Pickup Point'}
                      </span>
                      <p className={`font-black text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedLand ? localize(selectedLand.name) : (lang === 'hi' ? 'खेत #14, मलिहाबाद' : 'Farm #14, Malihabad')}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                    isDark ? 'bg-stone-900 text-stone-300 border-stone-700' : 'bg-white text-slate-700 border-slate-300'
                  }`}>
                    {lang === 'hi' ? 'खेत जीपीएस सुरक्षित' : 'Farm GPS Lock'}
                  </span>
                </div>

                {/* 2. Destination Selection Grid (Where to go) */}
                <div className="space-y-2.5">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-stone-400' : 'text-slate-600'
                  }`}>
                    {lang === 'hi' ? 'गंतव्य स्थान चुनें (Select Delivery Destination):' : 'Select Delivery Destination / Market Yard:'}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TRANSPORT_DROP_DESTINATIONS.map(loc => {
                      const isLocSelected = selectedDropLocationId === loc.id;
                      return (
                        <div
                          key={loc.id}
                          onClick={() => setSelectedDropLocationId(loc.id)}
                          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer space-y-2 ${
                            isLocSelected
                              ? isDark ? 'border-blue-500/80 bg-blue-950/40 text-white shadow-lg ring-1 ring-blue-500/40' : 'border-blue-500 bg-blue-50 text-blue-950 shadow-md ring-1 ring-blue-500/40'
                              : isDark ? 'border-stone-800 bg-stone-950/60 hover:border-stone-700 text-stone-300' : 'border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xl">{loc.icon}</span>
                            <span className="font-mono font-black text-xs text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-800/60">
                              ~{loc.distanceKm} km
                            </span>
                          </div>
                          <div>
                            <h5 className={`font-black text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {lang === 'hi' ? loc.nameHi : loc.nameEn}
                            </h5>
                            <p className={`text-[10px] font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                              {loc.district} • <span className="text-emerald-400 font-bold">{lang === 'hi' ? loc.tagHi : loc.tagEn}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. If Custom Destination is Selected */}
                {selectedDropLocationId === 'loc_6' && (
                  <div className={`p-4 rounded-2xl border space-y-3.5 ${
                    isDark ? 'bg-stone-950/80 border-stone-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <label className={`block text-[11px] font-black uppercase tracking-wider mb-1.5 ${
                        isDark ? 'text-stone-400' : 'text-slate-600'
                      }`}>
                        {lang === 'hi' ? 'कस्टम गंतव्य का नाम व पता:' : 'Custom Destination Address:'}
                      </label>
                      <input
                        type="text"
                        value={customDropLocationName}
                        onChange={(e) => setCustomDropLocationName(e.target.value)}
                        placeholder={lang === 'hi' ? 'उदा. दुबग्गा मंडी / सीतापुर रोड वेयरहाउस' : 'e.g. Dubagga Mandi / Sitapur Road Warehouse'}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold outline-none transition ${
                          isDark ? 'bg-stone-900 border-stone-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className={`text-[11px] font-black uppercase tracking-wider ${
                          isDark ? 'text-stone-400' : 'text-slate-600'
                        }`}>
                          {lang === 'hi' ? 'खेत से कुल दूरी (किमी):' : 'Total Distance from Farm (Km):'}
                        </label>
                        <span className="font-mono font-black text-sm text-blue-400">
                          {customDistanceKm} Km
                        </span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="100"
                        step="1"
                        value={customDistanceKm}
                        onChange={(e) => setCustomDistanceKm(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer h-2 rounded-lg bg-stone-800"
                      />
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

        {/* Right Column: Live Map + Dynamic Pricing Card + Fleet Radar (Sticky on Desktop) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20 self-start">
          
          {/* Live Map Preview */}
          <div className={`rounded-3xl p-5 border shadow-2xl space-y-3 transition-colors duration-200 ${
            isDark ? 'bg-stone-900/70 backdrop-blur-xl border-stone-800/80 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-extrabold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>{lang === 'hi' ? 'खेत लोकेशन व रडार मैप' : 'Farm Location & Radar'}</span>
              </h3>
              <span className={`text-xs font-bold ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                {selectedLand ? localize(selectedLand.name) : (lang === 'hi' ? 'मेरा खेत' : 'My Farm')}
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
              className={`h-[220px] w-full rounded-2xl overflow-hidden border ${isDark ? 'border-stone-800' : 'border-slate-200'}`}
            />
          </div>

          {/* TOTAL ESTIMATED PRICE CARD */}
          <div className={`rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden group text-white ${
            isDark 
              ? 'bg-gradient-to-br from-stone-900 via-stone-900 to-emerald-950/50 border border-emerald-500/30' 
              : 'bg-gradient-to-br from-slate-900 via-stone-900 to-emerald-950 border border-emerald-500/40 shadow-xl'
          }`}>
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs text-emerald-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" />
                  <span>{customBargainPrice && customBargainPrice !== fareResult.total ? (lang === 'hi' ? 'आपका प्रस्तावित किराया' : 'Your Counter Offer') : t('estimatedPrice')}</span>
                </span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    ₹{(customBargainPrice !== null && customBargainPrice > 0) ? customBargainPrice : fareResult.total}
                  </span>
                  {customBargainPrice && customBargainPrice !== fareResult.total && (
                    <span className="text-sm font-bold text-stone-400 line-through">
                      ₹{fareResult.total}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  {selectedCategoryId === 'truck' ? (lang === 'hi' ? 'ट्रक / ट्रॉली ढुलाई' : 'Truck Logistics') : t(currentCategory.nameKey)}
                </span>
                <p className="text-[11px] text-stone-300 mt-1.5 font-medium">
                  {selectedCategoryId === 'truck' 
                    ? `+ ${lang === 'hi' ? currentCargo.nameHi : currentCargo.nameEn}` 
                    : `+ ${t(currentAttachment?.nameKey)}`}
                </p>
              </div>
            </div>

            {/* PRE-BOOKING BARGAIN / COUNTER-OFFER TOOL (WITHOUT SENDING MONEY) */}
            <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                  <span>🤝</span>
                  <span>{lang === 'hi' ? 'मनपसंद किराया ऑफर / मोलभाव (Bargain Price)' : 'Bargain / Make a Price Offer'}</span>
                </div>
                {customBargainPrice && customBargainPrice !== fareResult.total && (
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 animate-pulse">
                    {lang === 'hi' ? 'ऑफर सक्रिय ✓' : 'Custom Offer Active ✓'}
                  </span>
                )}
              </div>

              {/* Quick Adjustment Buttons & Custom Input */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[130px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-base">₹</span>
                  <input
                    type="number"
                    value={customBargainPrice !== null ? customBargainPrice : fareResult.total}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setCustomBargainPrice(isNaN(val) ? '' : Math.max(100, val));
                    }}
                    placeholder={String(fareResult.total)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-stone-950 border border-emerald-500/40 text-white font-black text-base outline-none focus:border-emerald-400 shadow-inner"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setCustomBargainPrice(Math.max(100, (customBargainPrice || fareResult.total) - 100))}
                  className="px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-black border border-stone-700 transition active:scale-95 shrink-0"
                  title="Reduce ₹100"
                >
                  -₹100
                </button>

                <button
                  type="button"
                  onClick={() => setCustomBargainPrice(Math.max(100, (customBargainPrice || fareResult.total) - 200))}
                  className="px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-black border border-stone-700 transition active:scale-95 shrink-0"
                  title="Reduce ₹200"
                >
                  -₹200
                </button>

                {customBargainPrice && customBargainPrice !== fareResult.total && (
                  <button
                    type="button"
                    onClick={() => setCustomBargainPrice(null)}
                    className="px-3 py-2.5 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800 transition active:scale-95 shrink-0"
                    title="Reset to standard rate"
                  >
                    ↺ {lang === 'hi' ? 'रीसेट' : 'Reset'}
                  </button>
                )}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between text-[11px] text-stone-300">
                <span>
                  {lang === 'hi' ? 'मानक सिस्टम दर:' : 'Standard System Rate:'} <b className="text-white">₹{fareResult.total}</b>
                </span>
                {customBargainPrice && customBargainPrice !== fareResult.total && (
                  <span className="text-emerald-400 font-bold">
                    {Number(customBargainPrice) < fareResult.total 
                      ? (lang === 'hi' ? `₹${fareResult.total - Number(customBargainPrice)} का डिस्काउंट ऑफर` : `₹${fareResult.total - Number(customBargainPrice)} counter offer`)
                      : (lang === 'hi' ? `₹${Number(customBargainPrice) - fareResult.total} प्रीमियम ऑफर` : `₹${Number(customBargainPrice) - fareResult.total} priority offer`)}
                  </span>
                )}
              </div>
            </div>

            {/* Zero Advance Required Guarantee Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="font-bold leading-tight">
                {lang === 'hi' 
                  ? '🔒 शून्य अग्रिम राशि — बुकिंग हेतु अभी कोई पैसा नहीं देना है। कार्य पूरा होने के बाद ही चालक को भुगतान करें।' 
                  : '🔒 ₹0 Advance Required — No money needed to book. Pay driver only after field work is completed.'}
              </p>
            </div>

            {/* Pre-Booking Timing Banner */}
            {bookingTimingMode === 'schedule' ? (
              <div className="p-4 rounded-2xl bg-blue-950/70 border border-blue-500/30 text-xs text-blue-200 space-y-2">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-amber-300 flex items-center gap-1.5">
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
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                {selectedCategoryId === 'truck' ? (
                  <>
                    <div className="flex justify-between items-center text-stone-200">
                      <span className="font-medium text-stone-400">{lang === 'hi' ? 'परिवहन रूट:' : 'Transport Route:'}</span>
                      <span className="font-bold text-blue-300 truncate max-w-[200px]">
                        📍 {selectedLand?.name || 'Farm'} ➔ {selectedDropLocationId === 'loc_6' ? (customDropLocationName || 'Custom') : (lang === 'hi' ? currentDropLocation.nameHi : currentDropLocation.nameEn)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-stone-200">
                      <span className="font-medium text-stone-400">{lang === 'hi' ? 'दर गणना:' : 'Fare Formula:'}</span>
                      <span className="font-extrabold text-emerald-400">₹500 बेस + ({effectiveDistanceKm} km × ₹50)</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center text-stone-200">
                    <span className="font-medium text-stone-400">{lang === 'hi' ? 'दर गणना:' : 'Calculation Formula:'}</span>
                    <span className="font-extrabold text-emerald-400">{fareResult.breakdownText}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-stone-200">
                  <span className="font-medium text-stone-400">{lang === 'hi' ? 'अनुमानित आगमन समय:' : 'Estimated Farm Arrival:'}</span>
                  <span className="font-bold text-amber-300">{lang === 'hi' ? '~35-60 मिनट (सीधा खेत पर)' : '~35-60 Mins (Direct Dispatch)'}</span>
                </div>
              </div>
            )}

            {/* Confirm Booking Button */}
            <button
              onClick={handleConfirmBooking}
              className={`w-full py-4 rounded-2xl font-black text-base sm:text-lg shadow-xl flex items-center justify-center gap-2 transition active:scale-98 transform ${
                bookingTimingMode === 'schedule'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-emerald-500/20'
              }`}
            >
              <span>
                {bookingTimingMode === 'schedule'
                  ? (lang === 'hi' ? `तारीख ${scheduledDate} के लिए अग्रिम आरक्षित करें` : `Confirm Pre-Booking for ${scheduledDate}`)
                  : (lang === 'hi' ? `मशीनरी तुरंत बुक करें (₹${(customBargainPrice !== null && customBargainPrice > 0) ? customBargainPrice : fareResult.total})` : `Request Machinery Now (₹${(customBargainPrice !== null && customBargainPrice > 0) ? customBargainPrice : fareResult.total})`)}
              </span>
              <ChevronRight className="w-5 h-5" />
            </button>

          </div>

          {/* Live Nearby Machinery Fleet Status Widget */}
          <div className={`rounded-3xl p-5 border shadow-2xl space-y-3 transition-colors duration-200 ${
            isDark ? 'bg-stone-900/70 backdrop-blur-xl border-stone-800/80 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>{lang === 'hi' ? 'सक्रिय नजदीकी फ्लीट' : 'Active Nearby Fleet'}</span>
              </span>
              <span className={`text-[10px] font-bold ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                {lang === 'hi' ? 'मलिहाबाद जोन • 5 km' : 'Malihabad Zone • 5 km'}
              </span>
            </div>

            <div className="space-y-2">
              <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition ${
                isDark ? 'bg-stone-950/60 border-stone-800/80 hover:border-emerald-700/50' : 'bg-slate-50 border-slate-200 hover:border-emerald-400'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                    isDark ? 'bg-emerald-950/80 border border-emerald-700/50 text-emerald-400' : 'bg-emerald-100 border border-emerald-300 text-emerald-700'
                  }`}>
                    <Tractor className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Mahindra 575 DI (50 HP)</span>
                    <span className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-slate-500'}`}>
                      {lang === 'hi' ? 'जगजीत सिंह • 1.2 km दूर' : 'Jagjit Singh • 1.2 km away'}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {lang === 'hi' ? 'उपलब्ध ✓' : 'Available ✓'}
                </span>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition ${
                isDark ? 'bg-stone-950/60 border-stone-800/80 hover:border-amber-700/50' : 'bg-slate-50 border-slate-200 hover:border-amber-400'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                    isDark ? 'bg-amber-950/80 border border-amber-700/50 text-amber-400' : 'bg-amber-100 border border-amber-300 text-amber-700'
                  }`}>
                    <Wheat className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Preet 987 Combine (110 HP)</span>
                    <span className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-slate-500'}`}>
                      {lang === 'hi' ? 'रामपाल शर्मा • 2.8 km दूर' : 'Rampal Sharma • 2.8 km away'}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  isDark ? 'bg-amber-950 text-amber-300 border-amber-800/60' : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {lang === 'hi' ? 'उपलब्ध ✓' : 'Available ✓'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL 1: PRE-BOOKING CONFIRMATION POPUP */}
      {scheduledSuccessData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-stone-900 text-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-blue-500/40 relative space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🎉
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-300 bg-blue-950/80 px-3 py-0.5 rounded-full border border-blue-500/30">
                {lang === 'hi' ? 'अग्रिम बुकिंग सफल' : 'Pre-Booking Confirmed'}
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                {lang === 'hi' ? 'मशीनरी सफलतापूर्वक आरक्षित की गई!' : 'Farm Machinery Reserved!'}
              </h3>
              <p className="text-xs text-stone-400 font-medium">
                {lang === 'hi' 
                  ? 'ड्राइवर पार्टनर को आपकी आरक्षित तारीख व समय की सूचना भेज दी गई है।' 
                  : 'Your advance booking has been confirmed and scheduled in our dispatch queue.'}
              </p>
            </div>

            {/* Scheduled Details Card */}
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-xs space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-stone-400">{lang === 'hi' ? 'तारीख व दिन:' : 'Date & Day:'}</span>
                <b className="text-white">{scheduledSuccessData.scheduledDate} ({scheduledSuccessData.scheduledDay})</b>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-400">{lang === 'hi' ? 'समय स्लॉट:' : 'Time Slot:'}</span>
                <b className="text-blue-400">{scheduledSuccessData.timeSlot}</b>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-400">{lang === 'hi' ? 'मशीनरी व यंत्र:' : 'Machinery & Implement:'}</span>
                <b className="text-emerald-400 capitalize">{scheduledSuccessData.machineryType} + {scheduledSuccessData.attachment?.nameEn}</b>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-400">{lang === 'hi' ? 'मात्रा व आकार:' : 'Quantity & Size:'}</span>
                <b className="text-white">{scheduledSuccessData.landSize} {scheduledSuccessData.sizeUnit?.toUpperCase()}</b>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-stone-800">
                <span className="text-stone-400 font-bold">{lang === 'hi' ? 'कुल किराया:' : 'Total Price:'}</span>
                <span className="text-sm font-bold text-white">₹{scheduledSuccessData.estimatedPrice}</span>
              </div>
              {scheduledSuccessData.paymentMethod && (
                <>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-400">{lang === 'hi' ? 'भुगतान विधि:' : 'Payment Method:'}</span>
                    <b className="text-stone-200 uppercase">{scheduledSuccessData.paymentMethod === 'cod' ? 'COD (30% Advance)' : 'Online (100% Paid)'}</b>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-400">{lang === 'hi' ? 'अग्रिम भुगतान:' : 'Paid Advance:'}</span>
                    <b className="text-emerald-400">₹{scheduledSuccessData.advancePaid}</b>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-stone-800 font-black text-sm">
                    <span className="text-stone-300">{lang === 'hi' ? 'शेष देय राशि:' : 'Balance Due:'}</span>
                    <span className="text-amber-400">₹{scheduledSuccessData.balanceDue}</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setScheduledSuccessData(null)}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-xl shadow-blue-600/30 transition active:scale-95"
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

      {/* Farmer Booking History Modal */}
      <FarmerBookingHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

    </div>
  );
}
