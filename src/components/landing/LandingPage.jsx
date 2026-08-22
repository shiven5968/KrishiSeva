import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { usePricing } from '../../context/PricingContext';
import { MACHINERY_CATEGORIES } from '../../types/machinery';
import LiveMap from '../map/LiveMap';
import { 
  Tractor, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  PhoneCall,
  Layers,
  Bookmark,
  Zap,
  Star,
  Users,
  Award,
  ChevronDown,
  HelpCircle,
  TrendingUp,
  Fuel,
  Gauge,
  Check
} from 'lucide-react';

export default function LandingPage({ onOpenAuthModal }) {
  const { lang, t } = useLanguage();
  const { quickDemoLogin } = useAuth();
  const { rates } = usePricing();

  // Instant Fare Estimator & Pre-booking state
  const [selectedMachine, setSelectedMachine] = useState('tractor');
  const [selectedAttachment, setSelectedAttachment] = useState('rotavator');
  const [estimatedBighas, setEstimatedBighas] = useState(4);
  const [estimatedHours, setEstimatedHours] = useState(3);
  const [estimatedKm, setEstimatedKm] = useState(12);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState(0);

  // Calculate live estimate in widget
  const getEstimatedCost = () => {
    if (selectedMachine === 'tractor') return estimatedBighas * rates.tractor.ratePerBigha;
    if (selectedMachine === 'harvester') return estimatedBighas * rates.harvester.ratePerBigha;
    if (selectedMachine === 'jcb') return estimatedHours * rates.jcb.ratePerHour;
    return rates.truck.baseLoadingCharge + (estimatedKm * rates.truck.ratePerKm);
  };

  const handleQuickBook = () => {
    quickDemoLogin('farmer');
  };

  const FAQS = [
    {
      q: lang === 'hi' ? 'बुकिंग के बाद मशीन खेत तक पहुँचने में कितना समय लगता है?' : 'How long does it take for the machine to arrive at my field?',
      a: lang === 'hi' ? 'औसतन 8 से 15 मिनट के भीतर नजदीकी सत्यापित ऑपरेटर आपके खेत की सीमा पर पहुँच जाते हैं। आप उन्हें मोबाइल मैप पर लाइव देख सकते हैं।' : 'On average, the nearest verified operator arrives within 8 to 15 minutes. You can track their exact GPS movement live on your screen.'
    },
    {
      q: lang === 'hi' ? 'किराये का भुगतान कब और कैसे करना होता है?' : 'When and how is the payment made?',
      a: lang === 'hi' ? 'कार्य समाप्त होने के बाद आप सीधे ड्राइवर को यूपीआई (UPI), नकद (Cash), अथवा बैंक ट्रांसफर द्वारा पारदर्शी पूर्व-निर्धारित बिल के अनुसार भुगतान कर सकते हैं।' : 'Payment is made directly to the driver after completion of work via UPI, Cash, or Direct Bank Transfer as per the upfront fixed receipt.'
    },
    {
      q: lang === 'hi' ? 'क्या सभी ड्राइवर और मशीनें प्रशासनिक रूप से जाँची गई हैं?' : 'Are all machine drivers and vehicles verified?',
      a: lang === 'hi' ? 'हाँ, प्रत्येक ड्राइवर का ड्राइविंग लाइसेंस और वाहन नंबर प्लेट हमारी सुपर एडमिन टीम द्वारा सरकारी मानकों के अनुसार सत्यापित होने के बाद ही सक्रिय होता है।' : 'Yes, every driver must pass strict document inspection (Driving License & Vehicle Registration Plate) audited by our Admin verification team.'
    },
    {
      q: lang === 'hi' ? 'यदि मेरे पास कई अलग-अलग खेत हैं तो क्या मैं उन्हें सहेज सकता हूँ?' : 'Can I save multiple field locations for 1-click booking?',
      a: lang === 'hi' ? 'बिल्कुल! "Save My Lands" फीचर से आप नदी वाला खेत, गाँव की मुख्य ज़मीन आदि को उनके बीघा आकार के साथ सुरक्षित कर सकते हैं।' : 'Yes! The "Save My Lands" portfolio allows saving custom field profiles with GPS coordinates and Bigha sizes for instant 1-click auto-fill.'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-emerald-500 selection:text-white">
      
      {/* 1. HERO COCKPIT: What the site actually does — Right above the fold! */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-20 border-b border-stone-800 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-stone-950 to-stone-950">
        
        {/* Subtle background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Top Punchline Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-black shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>
                {lang === 'hi' ? '🌾 भारत का पहला ऑन-डिमांड कृषि मशीनरी नेटवर्क' : '🌾 India’s #1 On-Demand Agricultural Machinery Network'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              {lang === 'hi' ? (
                <>
                  खेत आपका, मशीन हमारी — <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                    1-क्लिक में ट्रैक्टर खेत पर तैयार!
                  </span>
                </>
              ) : (
                <>
                  Heavy Farm Machinery, <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                    Dispatched to Your Field in Minutes!
                  </span>
                </>
              )}
            </h1>

            <p className="text-stone-400 text-sm sm:text-base font-normal max-w-2xl mx-auto">
              {lang === 'hi'
                ? 'बिना बिचौलिए, सही बीघा रेट और लाइव GPS ट्रैकिंग के साथ अपनी जुताई, कटाई या ढुलाई बुक करें।'
                : 'Zero middlemen, upfront transparent per-bigha pricing, and live turn-by-turn GPS tracking to your khet.'}
            </p>
          </div>

          {/* TWO COLUMN HERO: Left Booking Cockpit + Right Live Radar Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
            
            {/* LEFT: 1-Click Interactive Booking Widget */}
            <div className="lg:col-span-6 bg-stone-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-stone-700 shadow-2xl space-y-5">
              
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-800">
                    Instant Booking
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">
                    {lang === 'hi' ? 'खेत पर मशीन मंगाएं' : 'Book Farm Machinery'}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Estimated Fare</span>
                  <span className="text-2xl font-black text-emerald-400">
                    ₹{getEstimatedCost().toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 1. Machinery Selection Pills */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  {lang === 'hi' ? '1. मशीन चुनें (Select Machine):' : '1. Select Machinery:'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'tractor', icon: '🚜', label: 'Tractor', rate: `₹${rates.tractor.ratePerBigha}/bigha` },
                    { id: 'harvester', icon: '🌾', label: 'Harvester', rate: `₹${rates.harvester.ratePerBigha}/bigha` },
                    { id: 'jcb', icon: '🏗️', label: 'JCB', rate: `₹${rates.jcb.ratePerHour}/hr` },
                    { id: 'truck', icon: '🚚', label: 'Truck', rate: '₹500+' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedMachine(item.id)}
                      className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                        selectedMachine === item.id
                          ? 'border-emerald-500 bg-emerald-950/70 text-white ring-2 ring-emerald-500/30'
                          : 'border-stone-700 bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-[11px] font-black">{item.label}</span>
                      <span className="text-[9px] text-stone-400 font-bold">{item.rate}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Attachments Selection for Tractor */}
              {selectedMachine === 'tractor' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-300">
                    {lang === 'hi' ? '2. उपकरण (Attachment):' : '2. Implement Attachment:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'rotavator', label: 'रोटावेटर (Rotavator)', desc: 'Finest soil prep' },
                      { id: 'cultivator', label: 'कल्टीवेटर (Cultivator)', desc: 'Deep tilling' },
                      { id: 'plough', label: 'एमबी प्लाऊ (Plough)', desc: 'Heavy hard ground' }
                    ].map(att => (
                      <button
                        key={att.id}
                        type="button"
                        onClick={() => setSelectedAttachment(att.id)}
                        className={`p-2 rounded-xl border text-left transition ${
                          selectedAttachment === att.id
                            ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-bold'
                            : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <span className="text-[11px] font-bold block truncate">{att.label}</span>
                        <span className="text-[9px] text-stone-500 block">{att.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Field Area Slider & Quick Presets */}
              {(selectedMachine === 'tractor' || selectedMachine === 'harvester') && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-stone-300">
                    <span>3. Field Size (खेत का आकार):</span>
                    <span className="text-emerald-400 font-black text-sm">{estimatedBighas} बीघा (Bigha)</span>
                  </div>
                  
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={estimatedBighas}
                    onChange={(e) => setEstimatedBighas(Number(e.target.value))}
                    className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />

                  <div className="flex gap-2 pt-1">
                    {[2, 4, 6, 10, 15].map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setEstimatedBighas(b)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition ${
                          estimatedBighas === b
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
                        }`}
                      >
                        {b} Bigha
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hours for JCB */}
              {selectedMachine === 'jcb' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-stone-300">
                    <span>3. Required Time:</span>
                    <span className="text-blue-400 font-black text-sm">{estimatedHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              )}

              {/* Distance for Truck */}
              {selectedMachine === 'truck' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-stone-300">
                    <span>3. Transport Distance:</span>
                    <span className="text-purple-400 font-black text-sm">{estimatedKm} Kilometers</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="80"
                    value={estimatedKm}
                    onChange={(e) => setEstimatedKm(Number(e.target.value))}
                    className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              )}

              {/* Action Button: Book Now */}
              <button
                onClick={handleQuickBook}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-base shadow-xl shadow-emerald-950 transition flex items-center justify-center gap-2 active:scale-98"
              >
                <span>{lang === 'hi' ? '🌾 खेत पर मशीन मंगाएं (Book Now)' : '🚜 Dispatch Machinery to My Field'}</span>
                <ArrowRight className="w-5 h-5 text-stone-950" />
              </button>

              {/* Driver Quick Link */}
              <div className="text-center pt-2 border-t border-stone-800/80">
                <button
                  onClick={() => quickDemoLogin('verified_driver')}
                  className="text-xs text-stone-400 hover:text-emerald-400 font-semibold transition"
                >
                  {lang === 'hi'
                    ? 'ट्रैक्टर या जेसीबी के मालिक हैं? पार्टनर बनें और ₹50,000+/माह कमाएं →'
                    : 'Own a tractor or heavy machine? Partner & Earn ₹50,000+/month →'}
                </button>
              </div>

            </div>

            {/* RIGHT: Live Radar Map Showcase */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-stone-900 rounded-3xl p-4 sm:p-5 border border-stone-800 shadow-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <h4 className="font-extrabold text-sm">
                      {lang === 'hi' ? 'लाइव रडार (Nearby Verified Fleet)' : 'Live Fleet Radar Near Malihabad'}
                    </h4>
                  </div>

                  <span className="text-[11px] font-black text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                    ⚡ 8-12 Min Arrival
                  </span>
                </div>

                {/* Live Interactive Leaflet Map */}
                <LiveMap
                  farmerLocation={{ lat: 26.8467, lng: 80.9462 }}
                  showNearbyDrivers={true}
                  bookingStatus="idle"
                  className="h-[340px] sm:h-[380px] w-full rounded-2xl"
                />

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800">
                    <span className="text-[10px] text-stone-400 block font-semibold">Tractor Fleet</span>
                    <span className="text-sm font-black text-emerald-400">18 Online</span>
                  </div>
                  <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800">
                    <span className="text-[10px] text-stone-400 block font-semibold">Harvesters</span>
                    <span className="text-sm font-black text-blue-400">6 Online</span>
                  </div>
                  <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800">
                    <span className="text-[10px] text-stone-400 block font-semibold">Avg Rating</span>
                    <span className="text-sm font-black text-amber-400">4.95 ★</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. MACHINERY FLEET SHOWCASE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
            Verified Fleet Portfolio
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {lang === 'hi' ? 'प्रमाणित भारी कृषि मशीनें व अटैचमेंट्स' : 'Engineered for Every Agricultural Phase'}
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm">
            {lang === 'hi' ? 'हाई-पावर 4WD ट्रैक्टर, आधुनिक हार्वेस्टर, जेसीबी व मालवाहक' : 'Heavy-duty 4WD machines with laser precision and high-efficiency attachments'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MACHINERY_CATEGORIES.map(category => (
            <div 
              key={category.id}
              onClick={() => quickDemoLogin('farmer')}
              className="group bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 hover:border-emerald-500 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Image Header with Badge */}
                <div className="relative h-44 overflow-hidden bg-stone-950">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent"></div>
                  
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-stone-950/90 text-stone-200 text-[10px] font-black border border-stone-700 backdrop-blur-md">
                    {category.hp}
                  </span>

                  <span className="absolute top-3 right-3 text-2xl drop-shadow-md">
                    {category.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-base text-white group-hover:text-emerald-400 transition-colors">
                      {lang === 'hi' ? category.hindiTitle : category.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                      {category.tagline}
                    </p>
                  </div>

                  {/* Attachment chips */}
                  <div className="pt-2 border-t border-stone-800">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1.5">
                      Available Implements ({category.attachments.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {category.attachments.slice(0, 3).map(att => (
                        <span key={att.id} className="text-[10px] bg-stone-950 text-stone-300 px-2 py-0.5 rounded-md border border-stone-800 font-semibold">
                          {att.icon} {t(att.nameKey).split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Footer */}
              <div className="p-5 pt-0">
                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Base Rate</span>
                    <span className="font-black text-emerald-400 text-sm">
                      {category.id === 'tractor' ? `₹${rates.tractor.ratePerBigha}/Bigha` :
                       category.id === 'harvester' ? `₹${rates.harvester.ratePerBigha}/Bigha` :
                       category.id === 'jcb' ? `₹${rates.jcb.ratePerHour}/Hour` :
                       `₹${rates.truck.baseLoadingCharge} + ₹${rates.truck.ratePerKm}/Km`}
                    </span>
                  </div>

                  <span className="text-xs font-extrabold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                    Book →
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 3. TRUST & SECURITY PILLARS */}
      <section className="py-16 bg-stone-900 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 bg-stone-950 rounded-3xl border border-stone-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800">
                <Bookmark className="w-6 h-6" />
              </div>
              <h4 className="font-black text-white text-base">Save My Lands</h4>
              <p className="text-xs text-stone-400 leading-relaxed font-medium">
                Save multiple field profiles (e.g. *नदी वाला खेत*, *गाँव की मुख्य ज़मीन*) for instant 1-click booking without re-entering location.
              </p>
            </div>

            <div className="p-6 bg-stone-950 rounded-3xl border border-stone-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-800">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-black text-white text-base">Live GPS Dispatch</h4>
              <p className="text-xs text-stone-400 leading-relaxed font-medium">
                Watch machinery moving turn-by-turn towards your field boundary with live accurate arrival times.
              </p>
            </div>

            <div className="p-6 bg-stone-950 rounded-3xl border border-stone-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-black text-white text-base">Strict KYC Audit</h4>
              <p className="text-xs text-stone-400 leading-relaxed font-medium">
                Every driver is verified with government Driving License (DL) & Vehicle Plate photo checks by Super Admin.
              </p>
            </div>

            <div className="p-6 bg-stone-950 rounded-3xl border border-stone-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-800">
                <IndianRupee className="w-6 h-6" />
              </div>
              <h4 className="font-black text-white text-base">Fixed Price Guarantee</h4>
              <p className="text-xs text-stone-400 leading-relaxed font-medium">
                Transparent per-bigha math calculated upfront before booking. Zero hidden commission or brokerage.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FAQ ACCORDION SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {lang === 'hi' ? 'अक्सर पूछे जाने वाले सवाल' : 'Got Questions? We Have Answers.'}
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div 
              key={index}
              className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-extrabold text-sm sm:text-base text-white hover:text-emerald-400 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${openFaq === index ? 'rotate-180 text-emerald-400' : 'text-stone-400'}`} />
              </button>

              {openFaq === index && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-stone-300 leading-relaxed border-t border-stone-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
