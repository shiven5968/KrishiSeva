import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeSync } from '../../context/RealtimeSyncContext';
import { usePricing } from '../../context/PricingContext';
import LiveMap from '../map/LiveMap';
import DriverNavigation from './DriverNavigation';
import confetti from 'canvas-confetti';
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
  Star,
  Fuel,
  Wallet,
  ArrowDownRight,
  Clock,
  Navigation,
  Send,
  AlertCircle,
  Truck,
  Building2,
  Landmark,
  ArrowRight
} from 'lucide-react';

export default function DriverDashboard() {
  const { lang, t } = useLanguage();
  const { isDark } = useTheme();
  const { driverProfile, setDriverProfile, toggleDriverDuty, recordDriverJobPayout } = useAuth();
  const { rates } = usePricing();
  const { 
    activeBooking, 
    acceptBooking, 
    rejectBooking, 
    driverCurrentPos,
    createBookingRequest
  } = useRealtimeSync();

  // Active Tab within Driver Dashboard: 'overview' | 'passport'
  const [activeTab, setActiveTab] = useState('overview');

  // Radar Scanning Radius: '5km' vs '10km'
  const [radarRadiusKm, setRadarRadiusKm] = useState(5);

  // Document Viewer Modal State (for zooming DL or Number Plate)
  const [previewDoc, setPreviewDoc] = useState(null);

  // Rate Editing Modal State
  const [isEditingRates, setIsEditingRates] = useState(false);
  const [rateForm, setRateForm] = useState({
    hourlyRate: driverProfile?.hourlyRate || rates.tractor?.ratePerHour || 1000,
    acreRate: driverProfile?.acreRate || rates.tractor?.ratePerBigha || 1300
  });

  // Diesel / Fuel Expense Tracker State
  const [fuelCostInput, setFuelCostInput] = useState(450);
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState(90);

  // Direct Bank Account Transfer / Cashout Modal State
  const [isCashoutModalOpen, setIsCashoutModalOpen] = useState(false);
  const [cashoutAmount, setCashoutAmount] = useState('5000');
  const [accountHolderName, setAccountHolderName] = useState(driverProfile?.fullName || 'Rameshwar Singh');
  const [accountNumber, setAccountNumber] = useState('489210034821');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('489210034821');
  const [ifscCode, setIfscCode] = useState('SBIN0001234');
  const [transferMode, setTransferMode] = useState('imps'); // 'imps' | 'neft'
  const [bankFormError, setBankFormError] = useState('');
  const [cashoutSuccessData, setCashoutSuccessData] = useState(null);

  // Dynamic Bank & Branch Detection from IFSC Code
  const getBankNameFromIfsc = (ifsc) => {
    if (!ifsc || ifsc.length < 4) return null;
    const prefix = ifsc.substring(0, 4).toUpperCase();
    const map = {
      'SBIN': 'SBI - State Bank of India (Malihabad Branch)',
      'HDFC': 'HDFC Bank Ltd - Main Rural Branch',
      'ICIC': 'ICICI Bank Ltd - Gomti Nagar Branch',
      'PUNB': 'PNB - Punjab National Bank (Kisan Branch)',
      'BARB': 'Bank of Baroda (BoB) - Rural Branch',
      'CNRB': 'Canara Bank - Agri Hub',
      'UBIN': 'Union Bank of India',
      'BKID': 'Bank of India (BOI)',
      'IDIB': 'Indian Bank',
      'AXIS': 'Axis Bank Ltd',
      'KKBK': 'Kotak Mahindra Bank'
    };
    return map[prefix] || (ifsc.length >= 8 ? 'Verified Commercial Bank Branch (IMPS/NEFT Enabled)' : null);
  };

  // Recent Completed Jobs Log
  const [recentJobsLog, setRecentJobsLog] = useState([
    {
      id: 'job_101',
      farmerName: 'Balram Kisan (बलराम)',
      khetLocation: 'Khet near Malihabad River',
      size: '4.5 Bigha',
      machinery: 'Tractor + Rotavator',
      fare: 5850,
      fuelCost: 450,
      netProfit: 5400,
      time: '11:30 AM Today',
      paymentMethod: 'Bank Disbursed'
    },
    {
      id: 'job_100',
      farmerName: 'Gurpreet Singh (गुरप्रीत)',
      khetLocation: 'Plot #8, Rampur Farm Gate',
      size: '3.0 Bigha',
      machinery: 'Tractor + Cultivator',
      fare: 3900,
      fuelCost: 320,
      netProfit: 3580,
      time: 'Yesterday',
      paymentMethod: 'Cash on Field'
    }
  ]);

  const isOnline = driverProfile?.status === 'online';

  // Available Wallet Balance Calculation (Defaults to ₹84,500)
  const walletBalance = useMemo(() => {
    return driverProfile?.walletBalance ?? Math.max(84500, (driverProfile?.totalEarnings || 0));
  }, [driverProfile?.walletBalance, driverProfile?.totalEarnings]);

  // If driver has accepted an active booking, render the full turn-by-turn Navigation Screen
  if (activeBooking && (activeBooking.status === 'accepted' || activeBooking.status === 'arrived' || activeBooking.status === 'in_progress')) {
    return <DriverNavigation />;
  }

  // Trigger a demo ride request for immediate evaluation
  const handleSimulateIncomingRide = () => {
    createBookingRequest({
      farmerName: lang === 'hi' ? 'बलराम किसान (रिवर साइड)' : 'Balram Kisan (River Side)',
      farmerPhone: '+91 98765 43210',
      farmerLocation: {
        lat: 26.9168,
        lng: 80.7075,
        address: 'Khet #14 near River, Gram Panchayat Rampur, Malihabad'
      },
      machineryType: driverProfile?.vehicleType || 'tractor',
      attachment: {
        id: 'rotavator',
        nameEn: 'Rotavator (Deep Tillage)',
        nameHi: 'रोटावेटर (गहरी जुताई)',
        icon: '⚙️',
        extraRatePerAcre: 0
      },
      landSize: 4.5,
      sizeUnit: 'bigha',
      estimatedPrice: 5850,
      distanceKm: 1.8,
      estimatedETA: lang === 'hi' ? '5-7 मिनट' : '5-7 Mins'
    });
  };

  // Save Updated Rates
  const handleSaveRates = (e) => {
    e?.preventDefault();
    setDriverProfile(prev => ({
      ...prev,
      hourlyRate: Number(rateForm.hourlyRate),
      acreRate: Number(rateForm.acreRate)
    }));
    setIsEditingRates(false);
  };

  // Direct Bank Account Transfer Handler
  const handleExecuteCashout = (e) => {
    e?.preventDefault();
    setBankFormError('');

    const amountToWithdraw = Number(cashoutAmount);
    if (!amountToWithdraw || amountToWithdraw <= 0) {
      setBankFormError(lang === 'hi' ? 'कृपया मान्य निकासी राशि दर्ज करें।' : 'Please enter a valid withdrawal amount.');
      return;
    }
    if (amountToWithdraw > walletBalance) {
      setBankFormError(lang === 'hi' ? 'निकासी राशि उपलब्ध बैलेंस से अधिक है।' : 'Withdrawal amount exceeds available wallet balance.');
      return;
    }
    if (!accountHolderName.trim()) {
      setBankFormError(lang === 'hi' ? 'खाताधारक का नाम दर्ज करें।' : 'Please enter account holder name.');
      return;
    }
    if (!accountNumber || accountNumber.length < 9) {
      setBankFormError(lang === 'hi' ? 'मान्य बैंक खाता संख्या (9-18 अंक) दर्ज करें।' : 'Enter a valid bank account number (9-18 digits).');
      return;
    }
    if (accountNumber !== confirmAccountNumber) {
      setBankFormError(lang === 'hi' ? 'बैंक खाता संख्या मेल नहीं खाती।' : 'Bank account numbers do not match.');
      return;
    }
    if (!ifscCode || ifscCode.length < 6) {
      setBankFormError(lang === 'hi' ? 'मान्य IFSC कोड दर्ज करें।' : 'Enter a valid IFSC code (e.g. SBIN0001234).');
      return;
    }

    // Deduct from wallet balance
    setDriverProfile(prev => ({
      ...prev,
      walletBalance: Math.max(0, (prev?.walletBalance ?? walletBalance) - amountToWithdraw)
    }));

    const last4 = accountNumber.slice(-4);
    const detectedBank = getBankNameFromIfsc(ifscCode) || 'Commercial Bank';

    setCashoutSuccessData({
      amount: amountToWithdraw,
      accountHolder: accountHolderName,
      accountMasked: `•••• •••• ${last4}`,
      bankName: detectedBank,
      ifsc: ifscCode.toUpperCase(),
      transferMode: transferMode === 'imps' ? 'Instant IMPS (24x7)' : 'NEFT / RTGS',
      txnId: 'IMPS' + Math.floor(1000000000 + Math.random() * 9000000000),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    try {
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
    } catch (err) {}
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-emerald-500 selection:text-stone-950 transition-colors duration-200 ${
      isDark ? 'bg-[#090D0B] text-stone-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* ══════════════ MAIN WIDESCREEN WRAPPER (max-w-7xl) ══════════════ */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6 animate-fade-in">
        
        {/* ══════════════ 1. TOP DRIVER HEADER & STATUS BAR ══════════════ */}
        <div className={`rounded-3xl p-5 sm:p-6 border shadow-2xl backdrop-blur-xl transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
          isDark 
            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-black/60' 
            : 'bg-white border-slate-200 shadow-slate-200/60'
        }`}>
          
          {/* Driver Identity Left Group */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border ${
                isDark 
                  ? 'bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-900/40 border-emerald-500/40 text-emerald-400 shadow-emerald-950/50' 
                  : 'bg-gradient-to-br from-emerald-100 to-green-200 border-emerald-300 text-emerald-800 shadow-emerald-200'
              }`}>
                {driverProfile?.vehicleType === 'harvester' ? '🌾' : driverProfile?.vehicleType === 'jcb' ? '🏗️' : '🚜'}
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
                  {driverProfile?.fullName || 'Rameshwar Singh'}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'hi' ? 'केवाईसी सत्यापित पार्टनर' : 'KYC Verified Partner'}</span>
                </span>
              </div>
              <p className={`text-xs font-bold ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                {driverProfile?.modelName || 'Mahindra 575 DI (50 HP)'} • <span className={`font-mono font-black ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{driverProfile?.vehicleNumber || 'UP-32-KR-7744'}</span>
              </p>
            </div>
          </div>

          {/* Action Controls: Mode Navigation, Radius Toggle & Online/Offline Switch */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            
            {/* Minimalist Tab Switcher */}
            <nav className={`flex items-center p-1 rounded-2xl border text-xs font-black shadow-sm ${
              isDark ? 'bg-stone-950 border-slate-200 dark:border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-emerald-500 text-stone-950 shadow-md'
                    : isDark ? 'text-slate-700 dark:text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'लाइव डिस्पैच रडार' : 'Live Dispatch Radar'}</span>
              </button>

              <button
                onClick={() => setActiveTab('passport')}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'passport'
                    ? 'bg-emerald-500 text-stone-950 shadow-md'
                    : isDark ? 'text-slate-700 dark:text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'वाहन व डीएल पासपोर्ट' : 'Vehicle & KYC Passport'}</span>
              </button>
            </nav>

            {/* High-Contrast Online/Offline Duty Toggle */}
            <button
              onClick={toggleDriverDuty}
              className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer ${
                isOnline
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                  : isDark
                  ? 'bg-stone-800 hover:bg-stone-700 text-slate-700 dark:text-slate-300 border border-stone-700'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300'
              }`}
            >
              <Power className={`w-4 h-4 ${isOnline ? 'text-stone-950' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{isOnline ? (lang === 'hi' ? '🟢 ऑन ड्यूटी (Online)' : '🟢 Online / On Duty') : (lang === 'hi' ? '⚪ ऑफ ड्यूटी (Offline)' : '⚪ Off Duty (Offline)')}</span>
            </button>
          </div>

        </div>

        {/* ══════════════ 2. GPS TOP BANNER (DRIVER OPERATING RADAR - 320PX) ══════════════ */}
        <div className={`rounded-3xl p-6 sm:p-7 border shadow-2xl space-y-4 transition-colors duration-200 ${
          isDark ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Compass className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-black text-base sm:text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {lang === 'hi' ? 'चालक लाइव ऑपरेटिंग रडार' : 'Driver Operating Radar & Farm Telemetry'}
                  </h3>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    isOnline 
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' 
                      : 'bg-stone-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}>
                    {isOnline ? `RADAR ACTIVE • ${radarRadiusKm} KM SCAN` : 'RADAR OFFLINE'}
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                  {lang === 'hi' ? 'मलिहाबाद व आसपास के खेतों से लाइव बुकिंग अनुरोध और निकटतम किसान लोकेशन' : 'Real-time telemetry and incoming farm dispatch requests across Malihabad & Lucknow zone.'}
                </p>
              </div>
            </div>

            {/* Radar Radius Switcher & Quick Demo Test Trigger */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-stone-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setRadarRadiusKm(5)}
                  className={`px-3 py-1 rounded-lg transition ${radarRadiusKm === 5 ? 'bg-emerald-500 text-stone-950 font-black' : 'text-slate-500 dark:text-slate-400 hover:text-white'}`}
                >
                  5 km
                </button>
                <button
                  type="button"
                  onClick={() => setRadarRadiusKm(10)}
                  className={`px-3 py-1 rounded-lg transition ${radarRadiusKm === 10 ? 'bg-emerald-500 text-stone-950 font-black' : 'text-slate-500 dark:text-slate-400 hover:text-white'}`}
                >
                  10 km
                </button>
              </div>

              <button
                type="button"
                onClick={handleSimulateIncomingRide}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Test incoming booking alert"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'hi' ? '⚡ टेस्ट अनुरोध (Demo)' : '⚡ Simulate Request (Demo)'}</span>
              </button>
            </div>
          </div>

          {/* Satellite Radar Map Canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
            <LiveMap
              farmerLocation={activeBooking?.farmerLocation || null}
              driverPos={driverCurrentPos}
              activeVehicleType={driverProfile?.vehicleType || 'tractor'}
              showNearbyDrivers={false}
              bookingStatus={isOnline ? (activeBooking ? 'in_progress' : 'idle') : 'offline'}
              isDriverView={true}
              className="h-[300px] sm:h-[320px] w-full rounded-2xl"
            />
          </div>
        </div>

        {/* ══════════════ 3. LIVE DISPATCH REQUEST DRAWER (UBER/RAPIDO STYLE ACCEPT CARD) ══════════════ */}
        {activeBooking && activeBooking.status === 'searching' && isOnline && (
          <div className="rounded-3xl p-6 border-2 border-emerald-500/70 bg-gradient-to-br from-[#0A0E13] via-emerald-950/40 to-stone-950 text-white shadow-2xl shadow-emerald-950/70 space-y-5 animate-bounce-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-stone-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/30">
                  🚜
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                      ⚡ {lang === 'hi' ? 'नया बुकिंग अनुरोध' : 'INCOMING DISPATCH ALERT'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">• ~{activeBooking.distanceKm || '1.8'} km away</span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">
                    {activeBooking.farmerName || 'Balram Kisan'}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {activeBooking.farmerLocation?.address || 'Khet #14 near River, Gram Panchayat Rampur'} ({activeBooking.landSize || '4.5'} {activeBooking.sizeUnit || 'Bigha'})
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">{lang === 'hi' ? 'कुल किराया (Total Fare)' : 'Total Job Fare'}</span>
                <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                  ₹{activeBooking.estimatedPrice || 5850}
                </span>
                <span className="text-[11px] text-emerald-300 block font-semibold">
                  {lang === 'hi' ? 'कार्य पूरा होने पर 100% नकद/यूपीआई' : '100% Guaranteed Pay on Completion'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-bold block">{lang === 'hi' ? 'मशीनरी व यंत्र:' : 'Machine & Implement:'}</span>
                <b className="text-white capitalize">{activeBooking.machineryType || 'Tractor'} + {activeBooking.attachment?.nameEn || activeBooking.attachment?.id || 'Rotavator'}</b>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-bold block">{lang === 'hi' ? 'खेत पर आगमन समय:' : 'ETA to Field:'}</span>
                <b className="text-amber-400">{activeBooking.estimatedETA || '5-7 Mins'} (~1.8 km)</b>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-bold block">{lang === 'hi' ? 'अनुमानित कार्य समय:' : 'Estimated Duration:'}</span>
                <b className="text-blue-400">~2.5 {lang === 'hi' ? 'घंटे' : 'Hours'}</b>
              </div>
            </div>

            {/* Accept / Decline Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => acceptBooking(driverProfile)}
                className="w-full sm:flex-1 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_45px_rgba(16,185,129,0.6)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>{lang === 'hi' ? `स्वीकार करें (₹${activeBooking.estimatedPrice || 5850}) →` : `Accept Dispatch (₹${activeBooking.estimatedPrice || 5850}) →`}</span>
              </button>

              <button
                type="button"
                onClick={rejectBooking}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-stone-900/90 hover:bg-stone-800 text-slate-700 dark:text-slate-300 hover:text-white font-bold text-sm border border-stone-700 transition active:scale-95 cursor-pointer"
              >
                <span>{lang === 'hi' ? 'अस्वीकार करें' : 'Decline'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════ 4. REAL-TIME EARNINGS & WALLET GRID (4 METRICS CARDS) ══════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Today's Earnings */}
          <div className={`p-5 rounded-3xl border shadow-xl transition-all duration-200 hover:-translate-y-1 relative overflow-hidden ${
            isDark 
              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-black/50' 
              : 'bg-white border-slate-200 shadow-slate-200/60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                {lang === 'hi' ? 'आज की कुल कमाई' : "Today's Earnings"}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-lg">
                ₹
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-emerald-400 tracking-tight">
                ₹{(driverProfile?.totalEarnings || 0).toLocaleString()}
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[10px]">
                  <ArrowUpRight className="w-3 h-3" /> +18%
                </span>
                <span className={isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}>vs yesterday</span>
              </div>
            </div>
          </div>

          {/* Card 2: Completed Jobs */}
          <div className={`p-5 rounded-3xl border shadow-xl transition-all duration-200 hover:-translate-y-1 relative overflow-hidden ${
            isDark 
              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-black/50' 
              : 'bg-white border-slate-200 shadow-slate-200/60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                {lang === 'hi' ? 'कुल संपन्न कार्य' : 'Completed Jobs'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center text-lg">
                🚜
              </div>
            </div>
            <div className="space-y-1">
              <h3 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {driverProfile?.completedRides || 142} {lang === 'hi' ? 'खेत' : 'Khets'}
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className={isDark ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600'}>100% Escrow Disbursed</span>
              </div>
            </div>
          </div>

          {/* Card 3: Driver Rating */}
          <div className={`p-5 rounded-3xl border shadow-xl transition-all duration-200 hover:-translate-y-1 relative overflow-hidden ${
            isDark 
              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-black/50' 
              : 'bg-white border-slate-200 shadow-slate-200/60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                {lang === 'hi' ? 'चालक रेटिंग' : 'Driver Rating'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center text-lg">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {Number(driverProfile?.rating || 5.0).toFixed(1)} / 5.0
              </h3>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <span>★★★★★</span>
                <span className={`ml-1 text-[11px] ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>Top Rated Partner</span>
              </div>
            </div>
          </div>

          {/* Card 4: Instant Wallet Disbursal */}
          <div className={`p-5 rounded-3xl border shadow-xl transition-all duration-200 hover:-translate-y-1 relative overflow-hidden ${
            isDark 
              ? 'bg-gradient-to-br from-[#0A0E13] via-emerald-950/30 to-[#0A0E13] border-emerald-500/40 shadow-emerald-950/30' 
              : 'bg-emerald-50/70 border-emerald-300 shadow-slate-200/60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                {lang === 'hi' ? 'उपलब्ध वॉलेट बैलेंस' : 'Instant Wallet Balance'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-lg">
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-white tracking-tight">
                ₹{walletBalance.toLocaleString()}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCashoutAmount(String(Math.min(5000, walletBalance)));
                  setIsCashoutModalOpen(true);
                }}
                className="w-full py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <span>⚡ {lang === 'hi' ? 'बैंक खाते में ट्रांसफर' : 'Direct Bank Transfer'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* ══════════════ 5. DRIVER ESSENTIAL UTILITY PANELS (BOTTOM 3-COLUMN GRID) ══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Panel A (Left 4 Cols): Machine Rates Customizer */}
          <div className={`lg:col-span-4 p-6 rounded-3xl border shadow-xl space-y-4 ${
            isDark ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-black/40' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {lang === 'hi' ? 'आपकी मशीनरी दरें' : 'Machine Rates & Yield'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingRates(!isEditingRates)}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditingRates ? (lang === 'hi' ? 'रद्द' : 'Cancel') : (lang === 'hi' ? 'दरें बदलें' : 'Edit Rates')}</span>
              </button>
            </div>

            {isEditingRates ? (
              <form onSubmit={handleSaveRates} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    {lang === 'hi' ? 'प्रति घंटा दर (₹/Hour)' : 'Hourly Rate (₹/Hour)'}
                  </label>
                  <input
                    type="number"
                    value={rateForm.hourlyRate}
                    onChange={(e) => setRateForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-700 bg-stone-900 text-white font-bold text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    {lang === 'hi' ? 'प्रति बीघा दर (₹/Bigha)' : 'Per Bigha Rate (₹/Bigha)'}
                  </label>
                  <input
                    type="number"
                    value={rateForm.acreRate}
                    onChange={(e) => setRateForm(prev => ({ ...prev, acreRate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-700 bg-stone-900 text-white font-bold text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 text-stone-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                >
                  {lang === 'hi' ? 'दरें सहेजें' : 'Save Rates'}
                </button>
              </form>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
                  isDark ? 'bg-stone-950 border-slate-200 dark:border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={isDark ? 'text-slate-500 dark:text-slate-400 font-medium' : 'text-slate-500 font-semibold'}>
                    {lang === 'hi' ? 'प्रति घंटा दर' : 'Hourly Rate'}
                  </span>
                  <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹{driverProfile?.hourlyRate || rates.tractor?.ratePerHour || 1000} / {lang === 'hi' ? 'घंटा' : 'hr'}
                  </span>
                </div>

                <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
                  isDark ? 'bg-stone-950 border-slate-200 dark:border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={isDark ? 'text-slate-500 dark:text-slate-400 font-medium' : 'text-slate-500 font-semibold'}>
                    {lang === 'hi' ? 'प्रति बीघा दर' : 'Per Bigha Rate'}
                  </span>
                  <span className="font-black text-sm text-emerald-400">
                    ₹{driverProfile?.acreRate || rates.tractor?.ratePerBigha || 1300} / {lang === 'hi' ? 'बीघा' : 'bigha'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                  ✓ {lang === 'hi' ? 'क्षेत्रीय आधार मूल्य से स्वतः सिंक्रनाइज़्ड' : 'Auto-synced with regional agro baseline'}
                </div>
              </div>
            )}
          </div>

          {/* Panel B (Center 4 Cols): Diesel & Fuel Expense Tracker */}
          <div className={`lg:col-span-4 p-6 rounded-3xl border shadow-xl space-y-4 ${
            isDark ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-black/40' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-amber-400" />
                <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {lang === 'hi' ? 'डीजल व ईंधन व्यय ट्रैकर' : 'Diesel & Trip Fuel Profit'}
                </h4>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                ₹{fuelPricePerLiter}/L Diesel
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  {lang === 'hi' ? 'प्रति ट्रिप डीजल खर्च (₹)' : 'Trip Fuel Expense (₹)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={fuelCostInput}
                    onChange={(e) => setFuelCostInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-700 bg-stone-900 text-white font-bold text-sm outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold">
                    ≈ {(fuelCostInput / fuelPricePerLiter).toFixed(1)} L
                  </span>
                </div>
              </div>

              {/* Net Profit Calculation Display */}
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{lang === 'hi' ? 'अनुमानित ट्रिप किराया:' : 'Est. Job Fare:'}</span>
                  <span className="text-white font-bold">₹5,850</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{lang === 'hi' ? 'डीजल कटौती:' : 'Fuel Deduction:'}</span>
                  <span className="text-red-400 font-bold">-₹{fuelCostInput}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-800 font-black text-sm">
                  <span className="text-stone-200">{lang === 'hi' ? 'शुद्ध चालक लाभ:' : 'Net Driver Profit:'}</span>
                  <span className="text-emerald-400">₹{5850 - fuelCostInput} ({(Math.round((5850 - fuelCostInput)/5850 * 100))}% Margin)</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
                <span>{lang === 'hi' ? 'औसत खपत:' : 'Avg Consumption:'} ~3.8 L/hr</span>
                <span>{lang === 'hi' ? 'डीजल सब्सिडी समर्थित' : 'Diesel Norms Met'}</span>
              </div>
            </div>
          </div>

          {/* Panel C (Right 4 Cols): Digital Vehicle Passport & KYC */}
          <div 
            onClick={() => setActiveTab('passport')}
            className="lg:col-span-4 p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-emerald-950/80 border border-emerald-500/30 text-white cursor-pointer hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-200 space-y-4 group relative overflow-hidden"
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
                {driverProfile?.modelName || 'Mahindra 575 DI (50 HP)'}
              </h5>
              <p className="text-xs font-mono text-emerald-300 font-black px-2.5 py-1 rounded-lg bg-stone-900/90 border border-emerald-500/20 inline-block">
                {driverProfile?.vehicleNumber || 'UP-32-KR-7744'}
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex justify-between items-center">
                <span>RC Verification:</span>
                <span className="text-emerald-400 font-black">✓ UP RTO Verified</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Commercial DL:</span>
                <span className="text-emerald-400 font-black">✓ Valid Heavy Agro</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Insurance / Fitness:</span>
                <span className="text-blue-400 font-bold">Valid till Dec 2028</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Category: TRACTOR (50 HP)</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Level 3 KYC</span>
              </span>
            </div>
          </div>

        </div>

        {/* ══════════════ 6. RECENT COMPLETED JOBS ACTIVITY LOG ══════════════ */}
        <div className={`rounded-3xl p-6 border shadow-2xl space-y-4 ${
          isDark ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-black/40' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {lang === 'hi' ? 'हालिया संपन्न कार्य व भुगतान लॉग' : 'Recent Completed Jobs & Payout Ledger'}
              </h4>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {recentJobsLog.length} Records Verified
            </span>
          </div>

          <div className="space-y-3">
            {recentJobsLog.map((job) => (
              <div
                key={job.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                  isDark ? 'bg-stone-950/60 border-slate-200 dark:border-slate-800/80 hover:border-emerald-700/40' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 flex items-center justify-center text-xl shrink-0">
                    🚜
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{job.farmerName}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">• {job.time}</span>
                    </div>
                    <p className={`text-[11px] ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                      {job.khetLocation} ({job.size}) • {job.machinery}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span className="font-black text-sm text-emerald-400 block">+₹{job.fare}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Net Profit: ₹{job.netProfit}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-700/60 shrink-0">
                    ✓ {job.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ══════════════ MODAL: DIRECT BANK ACCOUNT (IMPS / NEFT) SETTLEMENT ══════════════ */}
      {isCashoutModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-emerald-500/40 space-y-5 my-8">
            
            {cashoutSuccessData ? (
              <div className="text-center space-y-5 py-2 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-emerald-950 border border-emerald-500/50 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-inner shadow-emerald-500/30">
                  <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">
                    {lang === 'hi' ? 'बैंक ट्रांसफर सफल!' : 'Bank Transfer Initiated!'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'hi' 
                      ? `₹${cashoutSuccessData.amount.toLocaleString()} आपके बैंक खाते में सफलतापूर्वक भेज दिए गए हैं।` 
                      : `₹${cashoutSuccessData.amount.toLocaleString()} sent directly to ${cashoutSuccessData.bankName.split('-')[0].trim()} A/C ending in ${cashoutSuccessData.accountMasked.slice(-8)}.`}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2.5 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{lang === 'hi' ? 'स्थानांतरित राशि:' : 'Amount Transferred:'}</span>
                    <b className="text-emerald-400 text-base font-black">₹{cashoutSuccessData.amount.toLocaleString()}</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{lang === 'hi' ? 'खाताधारक:' : 'Account Holder:'}</span>
                    <b className="text-white font-bold">{cashoutSuccessData.accountHolder}</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{lang === 'hi' ? 'बैंक खाता:' : 'Bank Account:'}</span>
                    <b className="text-stone-200 font-mono text-xs">{cashoutSuccessData.accountMasked}</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{lang === 'hi' ? 'बैंक एवं शाखा:' : 'Bank & Branch:'}</span>
                    <b className="text-slate-700 dark:text-slate-300 text-[11px]">{cashoutSuccessData.bankName}</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">IFSC:</span>
                    <b className="text-slate-700 dark:text-slate-300 font-mono text-xs">{cashoutSuccessData.ifsc}</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{lang === 'hi' ? 'ट्रांसफर मोड:' : 'Transfer Mode:'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                      ⚡ {cashoutSuccessData.transferMode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">UTR / IMPS Ref:</span>
                    <b className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{cashoutSuccessData.txnId}</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{lang === 'hi' ? 'समय:' : 'Timestamp:'}</span>
                    <b className="text-slate-500 dark:text-slate-400 text-[11px]">{cashoutSuccessData.timestamp}</b>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 font-bold flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>✓ 100% RBI Regulated IMPS Settlement Completed</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsCashoutModalOpen(false);
                    setCashoutSuccessData(null);
                    setBankFormError('');
                  }}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base shadow-xl shadow-emerald-500/30 transition active:scale-95 cursor-pointer"
                >
                  {lang === 'hi' ? 'संपन्न करें (Done)' : 'Done & Return to Cockpit'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleExecuteCashout} className="space-y-4">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center p-2.5">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                        {lang === 'hi' ? 'सीधे बैंक खाते में ट्रांसफर (IMPS / NEFT)' : 'Direct Bank Account Transfer (IMPS / NEFT)'}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {lang === 'hi' ? '24x7 तत्काल बैंक खाता निकासी' : 'Instant 24x7 Commercial Bank Settlement'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCashoutModalOpen(false);
                      setBankFormError('');
                    }}
                    className="p-1.5 rounded-xl bg-stone-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Field 1: Available Wallet Balance Badge */}
                <div className="p-3.5 rounded-2xl bg-stone-950 border border-emerald-500/20 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                      {lang === 'hi' ? 'उपलब्ध वॉलेट बैलेंस' : 'Available Wallet Balance'}
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">
                      ✓ Instant IMPS Disbursal Ready
                    </span>
                  </div>
                  <span className="text-2xl font-black text-emerald-400 tracking-tight">
                    ₹{walletBalance.toLocaleString()}
                  </span>
                </div>

                {/* Field 2: Withdrawal Amount (₹) with Quick Buttons */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {lang === 'hi' ? 'निकासी राशि (₹)' : 'Withdrawal Amount (₹)'}
                    </label>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Min: ₹100 • Max: ₹{walletBalance.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={cashoutAmount}
                    onChange={(e) => setCashoutAmount(e.target.value)}
                    max={walletBalance}
                    min={100}
                    className="w-full px-4 py-3 rounded-xl border border-stone-700 bg-stone-950 font-black text-lg text-white outline-none focus:border-emerald-500 transition"
                    placeholder="Enter amount (e.g. 5000)"
                    required
                  />
                  {/* Quick Select Amount Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {[2000, 5000, 10000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCashoutAmount(String(Math.min(preset, walletBalance)))}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                          Number(cashoutAmount) === preset
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-stone-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-white'
                        }`}
                      >
                        ₹{preset.toLocaleString()}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCashoutAmount(String(walletBalance))}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-950 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900 transition cursor-pointer ml-auto"
                    >
                      {lang === 'hi' ? 'पूरा बैलेंस निकालें' : 'All Balance (₹' + walletBalance.toLocaleString() + ')'}
                    </button>
                  </div>
                </div>

                {/* Field 3: Account Holder Name */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {lang === 'hi' ? 'खाताधारक का नाम (पासबुक अनुसार)' : 'Account Holder Name (As in Passbook)'}
                  </label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-950 font-bold text-sm text-white outline-none focus:border-emerald-500 transition"
                    placeholder="e.g. Rameshwar Singh"
                    required
                  />
                </div>

                {/* Field 4 & 5: Bank Account Number & Confirm Account Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      {lang === 'hi' ? 'बैंक खाता संख्या' : 'Bank Account Number'}
                    </label>
                    <input
                      type="password"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-950 font-mono font-bold text-sm text-white outline-none focus:border-emerald-500 tracking-wider transition"
                      placeholder="Enter 9-18 digits"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      {lang === 'hi' ? 'खाता संख्या दोबारा दर्ज करें' : 'Confirm Account Number'}
                    </label>
                    <input
                      type="text"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-stone-950 font-mono font-bold text-sm text-white outline-none transition tracking-wider ${
                        confirmAccountNumber && accountNumber !== confirmAccountNumber
                          ? 'border-rose-500 focus:border-rose-400'
                          : 'border-stone-700 focus:border-emerald-500'
                      }`}
                      placeholder="Re-enter account number"
                      required
                    />
                  </div>
                </div>

                {/* Live Account Number Match Verification Indicator */}
                {confirmAccountNumber && (
                  <div className="text-[11px]">
                    {accountNumber === confirmAccountNumber ? (
                      <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {lang === 'hi' ? 'खाता संख्या सत्यापित (Match Verified)' : '✓ Account Numbers Match'}
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {lang === 'hi' ? 'खाता संख्या मेल नहीं खाती (Mismatch)' : '✕ Account Numbers Do Not Match'}
                      </span>
                    )}
                  </div>
                )}

                {/* Field 6: IFSC Code & Dynamic Bank Detection */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {lang === 'hi' ? 'IFSC कोड' : 'Bank IFSC Code'}
                  </label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-950 font-mono font-black text-sm text-emerald-400 uppercase outline-none focus:border-emerald-500 tracking-wider transition"
                    placeholder="e.g. SBIN0001234"
                    maxLength={11}
                    required
                  />
                  {/* Dynamic Bank Branch Detection Badge */}
                  {getBankNameFromIfsc(ifscCode) && (
                    <div className="mt-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-2 text-[11px] text-emerald-300 font-bold">
                      <Landmark className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>✓ {getBankNameFromIfsc(ifscCode)}</span>
                    </div>
                  )}
                </div>

                {/* Settlement Speed Selector: Instant IMPS vs NEFT */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {lang === 'hi' ? 'सेटलमेंट स्पीड' : 'Transfer Mode & Settlement Speed'}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTransferMode('imps')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                        transferMode === 'imps'
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                          : 'bg-stone-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-emerald-400 mb-0.5">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Instant IMPS</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">24x7 Immediate Credit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTransferMode('neft')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                        transferMode === 'neft'
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                          : 'bg-stone-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-blue-400 mb-0.5">
                        <Landmark className="w-3.5 h-3.5" />
                        <span>NEFT / RTGS</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Standard Batch Clearance</span>
                    </button>
                  </div>
                </div>

                {/* Validation Error Banner */}
                {bankFormError && (
                  <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300 font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{bankFormError}</span>
                  </div>
                )}

                {/* Security & Trust Badge */}
                <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-[11px] text-emerald-300 font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>🛡️ Bank Account Verified • Instant 24x7 Direct IMPS Disbursal • ₹0 Gateway Fee</span>
                </div>

                {/* Primary CTA Action Button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg rounded-2xl cursor-pointer transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] active:scale-98 flex items-center justify-center gap-2"
                >
                  <span>
                    {lang === 'hi' 
                      ? `₹${Number(cashoutAmount) ? Number(cashoutAmount).toLocaleString() : walletBalance.toLocaleString()} बैंक खाते में भेजें →` 
                      : `Transfer ₹${Number(cashoutAmount) ? Number(cashoutAmount).toLocaleString() : walletBalance.toLocaleString()} to Bank Account →`}
                  </span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
