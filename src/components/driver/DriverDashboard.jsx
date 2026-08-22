import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
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
  Check
} from 'lucide-react';

export default function DriverDashboard() {
  const { lang, t } = useLanguage();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Incoming Ride Request Modal Popup */}
      {activeBooking && activeBooking.status === 'searching' && isOnline && (
        <IncomingRideModal
          booking={activeBooking}
          onAccept={() => acceptBooking(driverProfile)}
          onReject={rejectBooking}
        />
      )}

      {/* Top Banner: Driver Duty Switcher & Main Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-3xl shadow-lg shadow-blue-600/30">
              🚜
            </div>
            {isOnline && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-stone-900">
                {driverProfile.fullName}
              </h2>
              <span className="flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === 'hi' ? 'केवाईसी सत्यापित पार्टनर' : 'KYC Verified Partner'}</span>
              </span>
            </div>
            <p className="text-xs text-stone-500 font-bold mt-0.5">
              {driverProfile.modelName || 'Mahindra 575 DI (50 HP)'} • <span className="text-stone-800 font-mono font-black">{driverProfile.vehicleNumber || 'UP-32-BT-9901'}</span>
            </p>
          </div>
        </div>

        {/* Action Controls: Tab Switcher & Online/Offline Duty Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'hi' ? 'लाइव रडार' : 'Live Radar'}</span>
            </button>

            <button
              onClick={() => setActiveTab('passport')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === 'passport'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'hi' ? 'वाहन व डीएल पासपोर्ट' : 'Vehicle & DL Passport'}</span>
            </button>
          </div>

          {/* Duty Switcher */}
          <button
            onClick={toggleDriverDuty}
            className={`px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-98 ${
              isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-4 ring-emerald-100'
                : 'bg-stone-200 hover:bg-stone-300 text-stone-700 shadow-stone-200/50'
            }`}
          >
            <Power className={`w-4 h-4 ${isOnline ? 'text-white' : 'text-stone-500'}`} />
            <span>{isOnline ? (lang === 'hi' ? 'ऑनलाइन' : 'Online') : (lang === 'hi' ? 'ऑफलाइन' : 'Offline')}</span>
          </button>
        </div>

      </div>

      {/* Duty Status Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900 text-xs font-bold">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>{lang === 'hi' ? 'आप अभी ऑफलाइन हैं। नई बुकिंग पाने के लिए "ऑनलाइन" बटन दबाएं।' : 'You are currently Offline. Turn Online to receive live ride requests.'}</span>
          </div>
          <button
            onClick={toggleDriverDuty}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl whitespace-nowrap shadow-sm"
          >
            {lang === 'hi' ? 'ऑनलाइन हों' : 'Go Online'}
          </button>
        </div>
      )}

      {/* Metrics Row: Earnings, Trips, Rating */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Today's Earnings */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl shadow-inner">
            ₹
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-stone-400">
              {lang === 'hi' ? 'आज की कमाई' : "Today's Earnings"}
            </span>
            <h3 className="text-2xl font-black text-stone-900">
              ₹{driverProfile.totalEarnings.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Completed Trips */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl shadow-inner">
            🚜
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-stone-400">
              {lang === 'hi' ? 'कुल संपन्न यात्राएं' : 'Completed Trips'}
            </span>
            <h3 className="text-2xl font-black text-stone-900">
              {driverProfile.completedRides} {lang === 'hi' ? 'खेत' : 'Khets'}
            </h3>
          </div>
        </div>

        {/* YOUR RATING */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xl shadow-inner">
            ⭐
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-stone-400">
              {lang === 'hi' ? 'आपकी रेटिंग' : 'Your Rating'}
            </span>
            <h3 className="text-2xl font-black text-stone-900">
              {driverProfile.rating} / 5.0
            </h3>
          </div>
        </div>

      </div>

      {/* VIEW 1: LIVE RADAR & DISPATCH OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Left: Driver Map */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-stone-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'hi' ? 'चालक लाइव रडार' : 'Driver Operating Radar (5 km Radius)'}</span>
                </h3>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                  {isOnline ? (lang === 'hi' ? 'रडार सक्रिय 🟢' : 'Radar Active 🟢') : (lang === 'hi' ? 'रडार बंद ⚪' : 'Radar Paused ⚪')}
                </span>
              </div>

              <LiveMap
                farmerLocation={null}
                driverPos={driverCurrentPos}
                activeVehicleType={driverProfile.vehicleType}
                showNearbyDrivers={false}
                bookingStatus={isOnline ? 'idle' : 'offline'}
                isDriverView={true}
                className="h-[300px] w-full rounded-2xl"
              />
            </div>
          </div>

          {/* Right: Machine Info */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Quick Rates Card */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-stone-900">
                  {lang === 'hi' ? 'आपकी मशीनरी दरें' : 'Your Machine Rates'}
                </h4>
                <button
                  onClick={() => setIsEditingRates(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{lang === 'hi' ? 'दरें बदलें' : 'Edit Rates'}</span>
                </button>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-500 font-semibold">{lang === 'hi' ? 'प्रति घंटा दर' : 'Hourly Rate'}</span>
                  <span className="font-black text-stone-900">₹{driverProfile.hourlyRate}/{lang === 'hi' ? 'घंटा' : 'hr'}</span>
                </div>
                <div className="flex justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-500 font-semibold">{lang === 'hi' ? 'प्रति बीघा दर' : 'Per Bigha Rate'}</span>
                  <span className="font-black text-emerald-700">₹{driverProfile.acreRate}/{lang === 'hi' ? 'बीघा' : 'bigha'}</span>
                </div>
              </div>
            </div>

            {/* Passport Quick Snapshot Link */}
            <div 
              onClick={() => setActiveTab('passport')}
              className="p-5 rounded-3xl bg-gradient-to-br from-emerald-900 to-stone-900 text-white cursor-pointer hover:shadow-lg transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                  {lang === 'hi' ? 'वाहन पासपोर्ट' : 'Vehicle Passport'}
                </span>
                <ChevronRight className="w-4 h-4 text-emerald-300" />
              </div>
              <h5 className="font-black text-base">
                {driverProfile.modelName || 'Mahindra 575 DI'}
              </h5>
              <p className="text-xs text-stone-300 font-mono">
                {lang === 'hi' ? 'नंबर प्लेट: ' : 'Plate: '}{driverProfile.vehicleNumber || 'UP-32-BT-9901'}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: COMPREHENSIVE DRIVER PROFILE, VEHICLE PASSPORT & DL DETAILS */}
      {activeTab === 'passport' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Commercial Driving License (DL) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Driving License Card */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl shadow-inner">
                      🪪
                    </div>
                    <div>
                      <h4 className="font-black text-base text-stone-900">
                        {lang === 'hi' ? 'कमर्शियल ड्राइविंग लाइसेंस (DL)' : 'Commercial Driving License (DL)'}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-semibold">
                        {lang === 'hi' ? 'परिवहन विभाग, उत्तर प्रदेश सरकार' : 'Government Transport Authority of Uttar Pradesh'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span>{lang === 'hi' ? 'सत्यापित' : 'Active & Verified'}</span>
                  </span>
                </div>

                {/* DL Photo Preview with Zoom button */}
                <div className="relative group overflow-hidden rounded-2xl border-2 border-stone-200 bg-stone-950 h-56 flex items-center justify-center">
                  <img
                    src={defaultDl}
                    alt="Driving License Document"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent flex items-end justify-between p-4">
                    <div className="text-white">
                      <span className="text-[10px] font-bold text-emerald-400 bg-stone-900/80 px-2 py-0.5 rounded">
                        {lang === 'hi' ? 'डीएल सत्यापित' : 'DL Verified'}
                      </span>
                      <p className="text-xs font-mono font-bold mt-1">
                        {lang === 'hi' ? 'चालक: ' : 'Holder: '}{driverProfile.fullName}
                      </p>
                    </div>

                    <button
                      onClick={() => setPreviewDoc({ title: lang === 'hi' ? 'कमर्शियल ड्राइविंग लाइसेंस' : 'Commercial Driving License', image: defaultDl, type: 'DL Document' })}
                      className="px-3 py-1.5 bg-white/90 hover:bg-white text-stone-900 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'देखें' : 'Inspect'}</span>
                    </button>
                  </div>
                </div>

                {/* DL Metadata Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-[10px] text-stone-400 block font-bold">{lang === 'hi' ? 'लाइसेंस श्रेणी' : 'License Class'}</span>
                    <span className="font-black text-stone-800">{lang === 'hi' ? 'हैवी ट्रैक्टर / कृषि मशीनरी' : 'Heavy TR / Commercial Tractor'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-[10px] text-stone-400 block font-bold">{lang === 'hi' ? 'आरटीओ प्राधिकरण' : 'RTO Authority'}</span>
                    <span className="font-black text-stone-800">RTO Lucknow (UP-32)</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-[10px] text-stone-400 block font-bold">{lang === 'hi' ? 'पंजीकृत फोन' : 'Registered Phone'}</span>
                    <span className="font-black text-stone-800">{driverProfile.phone || '9876501234'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-[10px] text-stone-400 block font-bold">{lang === 'hi' ? 'सुरक्षा रिकॉर्ड' : 'Safety Record'}</span>
                    <span className="font-black text-emerald-700">{lang === 'hi' ? '100% स्वच्छ रिकॉर्ड' : '100% Clean Record'}</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Vehicle Machinery Passport & RC Plate Details */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Vehicle Machinery Card */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shadow-inner">
                      🚜
                    </div>
                    <div>
                      <h4 className="font-black text-base text-stone-900">
                        {lang === 'hi' ? 'कृषि मशीनरी पासपोर्ट' : 'Agricultural Machinery Passport'}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-semibold">
                        {lang === 'hi' ? 'पंजीकृत भारी कृषि उपकरण' : 'Registered Heavy Fleet Equipment'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                    {lang === 'hi' ? 'कमर्शियल आरसी मान्य' : 'Commercial RC Valid'}
                  </span>
                </div>

                {/* Number Plate & Machine Photo Preview with Zoom button */}
                <div className="relative group overflow-hidden rounded-2xl border-2 border-stone-200 bg-stone-950 h-56 flex items-center justify-center">
                  <img
                    src={defaultPlate}
                    alt="Machinery Registration Plate"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent flex items-end justify-between p-4">
                    <div className="text-white">
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-stone-900/80 px-2 py-0.5 rounded">
                        {lang === 'hi' ? 'नंबर: ' : 'Plate: '}{driverProfile.vehicleNumber || 'UP-32-BT-9901'}
                      </span>
                      <p className="text-xs font-bold mt-1">
                        {driverProfile.modelName || 'Mahindra 575 DI (50 HP)'}
                      </p>
                    </div>

                    <button
                      onClick={() => setPreviewDoc({ title: lang === 'hi' ? 'वाहन नंबर प्लेट व आरसी' : 'Vehicle Number Plate & RC Photo', image: defaultPlate, type: 'Machinery RC Document' })}
                      className="px-3 py-1.5 bg-white/90 hover:bg-white text-stone-900 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'देखें' : 'Inspect'}</span>
                    </button>
                  </div>
                </div>

                {/* Vehicle Machinery Specifications */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-[10px] text-stone-400 block font-bold">{lang === 'hi' ? 'श्रेणी' : 'Category'}</span>
                    <span className="font-black text-stone-800 capitalize">{driverProfile.vehicleType || 'Tractor (50 HP)'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-[10px] text-stone-400 block font-bold">{lang === 'hi' ? 'इंजन क्षमता' : 'Power Output'}</span>
                    <span className="font-black text-stone-800">50 - 55 HP</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-[10px] text-stone-400 block font-bold">{lang === 'hi' ? 'प्रति घंटा दर' : 'Hourly Rate'}</span>
                    <span className="font-black text-stone-900">₹{driverProfile.hourlyRate}/{lang === 'hi' ? 'घंटा' : 'hr'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-[10px] text-stone-400 block font-bold">{lang === 'hi' ? 'प्रति बीघा दर' : 'Per Bigha Rate'}</span>
                    <span className="font-black text-emerald-700">₹{driverProfile.acreRate}/{lang === 'hi' ? 'बीघा' : 'bigha'}</span>
                  </div>
                </div>

                {/* Supported Implements & Attachments */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <span className="text-[11px] font-black uppercase text-stone-600 block">
                    {lang === 'hi' ? 'संबद्ध कृषि यंत्र व उपकरण:' : 'Supported Implements & Attachments:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-800">
                      ⚙️ {lang === 'hi' ? 'रोटावेटर' : 'Rotavator'}
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-800">
                      🌾 {lang === 'hi' ? 'मिट्टी पलट हल' : 'MB Plough'}
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-800">
                      🌱 {lang === 'hi' ? 'बीज बुवाई मशीन' : 'Seed Drill'}
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-800">
                      🚜 {lang === 'hi' ? '4-पहिया ट्रॉली' : '4-Wheel Trolley'}
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* MODAL 1: DOCUMENT INSPECTION POPUP */}
      {previewDoc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h4 className="font-black text-base text-stone-900">{previewDoc.title}</h4>
                <p className="text-xs text-stone-500 font-semibold">{previewDoc.type}</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-stone-200 max-h-[60vh]">
              <img src={previewDoc.image} alt={previewDoc.title} className="w-full h-auto object-contain" />
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{lang === 'hi' ? 'कृषि सेवा नेटवर्क पर एन्क्रिप्टेड व सत्यापित' : 'Verified and encrypted in KrishiSeva Driver Network'}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT MACHINE RATES POPUP */}
      {isEditingRates && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-black text-base text-stone-900">{lang === 'hi' ? 'मशीनरी किराया दरें अपडेट करें' : 'Update Machinery Rental Rates'}</h4>
              <button
                onClick={() => setIsEditingRates(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRates} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-stone-700 uppercase mb-1">
                  {lang === 'hi' ? 'प्रति घंटा दर (₹) *' : 'Hourly Rate (₹) *'}
                </label>
                <input
                  type="number"
                  min="200"
                  step="50"
                  required
                  value={rateForm.hourlyRate}
                  onChange={(e) => setRateForm({ ...rateForm, hourlyRate: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 font-black text-base text-stone-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-stone-700 uppercase mb-1">
                  {lang === 'hi' ? 'प्रति बीघा जुताई दर (₹) *' : 'Per Bigha Rate (₹) *'}
                </label>
                <input
                  type="number"
                  min="300"
                  step="50"
                  required
                  value={rateForm.acreRate}
                  onChange={(e) => setRateForm({ ...rateForm, acreRate: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 font-black text-base text-emerald-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingRates(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs hover:bg-stone-200"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition"
                >
                  {lang === 'hi' ? 'दरें सहेजें' : 'Save Rates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
