import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { sendRealWhatsAppOtp } from '../../utils/smsGateway';
import { verifyAgriStackFarmer } from '../../services/bhulekhLandService';
import { audioHelper } from '../../utils/audioHelper';
import { 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  Tractor, 
  Truck, 
  Sparkles, 
  User, 
  CheckCircle2, 
  Globe, 
  MapPin, 
  Clock, 
  Lock,
  MessageSquare,
  LandPlot,
  CreditCard,
  Check,
  Building2,
  FileCheck2,
  AlertCircle,
  Zap,
  CheckCheck
} from 'lucide-react';

export default function CreativeLoginPortal() {
  const { lang, toggleLanguage } = useLanguage();
  const { 
    requestOtp,
    verifyOtp,
    completeNewUserRegistration,
    setActiveRole
  } = useAuth();

  // Authentication States
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'profile_setup' | 'agristack_verify'
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeOtpCode, setActiveOtpCode] = useState('');
  const [waDeliveryDelayed, setWaDeliveryDelayed] = useState(false);

  // Minimalist Role Toggle Segment Control ('farmer' | 'driver')
  const [loginRoleTab, setLoginRoleTab] = useState('farmer');

  // Profile Setup States
  const [userName, setUserName] = useState('');
  const [selectedRole, setSelectedRole] = useState('farmer');

  // AgriStack & Aadhaar States
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarStep, setAadhaarStep] = useState('input'); // 'input' | 'result'
  const [isVerifyingAgriStack, setIsVerifyingAgriStack] = useState(false);
  const [agriStackResult, setAgriStackResult] = useState(null);

  // 60-Second Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (step === 'otp' && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // ─────────────────────────────────────────────────────────────
  // 1. WhatsApp OTP Dispatch Workflow (UltraMsg instance189366)
  // ─────────────────────────────────────────────────────────────
  const handleSendWhatsAppOtp = async (e) => {
    e?.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      setError(lang === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setIsSendingOtp(true);

    // 1. Generate 6-digit random OTP in AuthContext (with 15-min rate limit & 5-min expiry)
    const otpResult = requestOtp(cleanPhone);
    if (!otpResult.success) {
      setIsSendingOtp(false);
      setError(otpResult.error);
      return;
    }

    const code = otpResult.code;
    setActiveOtpCode(code);
    setResendTimer(60);
    setStep('otp');
    setOtp('');
    setWaDeliveryDelayed(false);

    setToastMessage(lang === 'hi' ? `व्हाट्सएप पर ओटीपी भेज दिया गया है (+91 ${cleanPhone})` : `OTP Sent via WhatsApp (+91 ${cleanPhone})`);
    setTimeout(() => setToastMessage(''), 6000);

    // 2. Send via UltraMsg WhatsApp API
    try {
      const waRes = await sendRealWhatsAppOtp(cleanPhone, code, lang);
      setIsSendingOtp(false);

      if (!waRes.success) {
        setWaDeliveryDelayed(true);
      }
    } catch (err) {
      setIsSendingOtp(false);
      setWaDeliveryDelayed(true);
    }
  };

  // Resend OTP via WhatsApp
  const handleResendWhatsAppOtp = async () => {
    if (resendTimer > 0 || isSendingOtp) return;
    setError('');
    setIsSendingOtp(true);
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    const otpResult = requestOtp(cleanPhone);
    if (!otpResult.success) {
      setIsSendingOtp(false);
      setError(otpResult.error);
      return;
    }

    const code = otpResult.code;
    setActiveOtpCode(code);
    setResendTimer(60);
    setWaDeliveryDelayed(false);

    setToastMessage(lang === 'hi' ? `नया ओटीपी व्हाट्सएप पर भेज दिया गया है (+91 ${cleanPhone})` : `New OTP Sent via WhatsApp (+91 ${cleanPhone})`);
    setTimeout(() => setToastMessage(''), 6000);

    try {
      const waRes = await sendRealWhatsAppOtp(cleanPhone, code, lang);
      setIsSendingOtp(false);
      if (!waRes.success) {
        setWaDeliveryDelayed(true);
      }
    } catch (err) {
      setIsSendingOtp(false);
      setWaDeliveryDelayed(true);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 2. Verify 6-Digit WhatsApp OTP Logic
  // ─────────────────────────────────────────────────────────────
  const handleVerifyOtp = (e) => {
    e?.preventDefault();
    if (!otp || otp.length < 6) {
      setError(lang === 'hi' ? 'कृपया पूरा 6-अंकीय ओटीपी दर्ज करें' : 'Please enter the full 6-digit OTP');
      return;
    }
    setError('');
    setIsVerifyingOtp(true);

    const result = verifyOtp(phone, otp);
    setIsVerifyingOtp(false);

    if (result.success) {
      if (result.isNewUser) {
        setSelectedRole(loginRoleTab);
        setStep('profile_setup');
      } else {
        if (result.role === 'farmer') {
          setActiveRole('farmer');
        } else if (result.role === 'driver') {
          setActiveRole('driver');
        } else if (result.role === 'admin') {
          setActiveRole('admin');
        }
      }
    } else {
      setError(result.error);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 3. New User Profile & Role Setup
  // ─────────────────────────────────────────────────────────────
  const handleProceedFromProfile = (e) => {
    e?.preventDefault();
    if (!userName.trim()) {
      setError(lang === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें' : 'Please enter your full name');
      return;
    }
    setError('');

    if (selectedRole === 'driver') {
      completeNewUserRegistration('driver', {
        name: userName.trim(),
        phone
      });
      setActiveRole('driver');
      audioHelper.playBookingConfirmed();
      return;
    }

    // If farmer, proceed to AgriStack land sync
    setAadhaarStep('input');
    setStep('agristack_verify');
  };

  // ─────────────────────────────────────────────────────────────
  // 4. AgriStack Aadhaar Direct Verification
  // ─────────────────────────────────────────────────────────────
  const handleVerifyAadhaar = async (e) => {
    e?.preventDefault();
    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      setError(lang === 'hi' ? 'कृपया पूरा 12-अंकीय आधार संख्या दर्ज करें' : 'Please enter a full 12-digit Aadhaar number');
      return;
    }
    setError('');
    setIsVerifyingAgriStack(true);

    try {
      const check = await verifyAgriStackFarmer(cleanAadhaar, userName);
      setIsVerifyingAgriStack(false);

      if (!check.isRegistered) {
        setError(lang === 'hi' 
          ? '❌ यह आधार नंबर AgriStack किसान रजिस्ट्री में पंजीकृत नहीं है। कृपया CSC पर पंजीकरण कराएं अथवा "बाद में करें" से जारी रखें।'
          : '❌ This Aadhaar is not found in the AgriStack Farmer Registry. Please register via CSC or click "Skip for Now".'
        );
        return;
      }

      setAgriStackResult(check);
      setAadhaarStep('result');
      audioHelper.playBookingConfirmed();
    } catch (err) {
      setIsVerifyingAgriStack(false);
      setError(lang === 'hi' ? 'रजिस्ट्री सर्वर से संपर्क नहीं हो सका।' : 'Could not connect to registry server.');
    }
  };

  const handleCompleteAgriStackRegistration = () => {
    if (agriStackResult?.farmerProfile) {
      const p = agriStackResult.farmerProfile;
      completeNewUserRegistration('farmer', {
        name: userName.trim() || p.kisanCardName,
        phone,
        village: p.village,
        tehsil: p.tehsil,
        isAgriStackVerified: true,
        farmerId: p.farmerId,
        linkedLands: p.linkedLands
      });
    } else {
      completeNewUserRegistration('farmer', {
        name: userName.trim(),
        phone
      });
    }
    setActiveRole('farmer');
    audioHelper.playBookingConfirmed();
  };

  const handleSkipAgriStack = () => {
    completeNewUserRegistration('farmer', {
      name: userName.trim(),
      phone
    });
    setActiveRole('farmer');
    audioHelper.playBookingConfirmed();
  };

  return (
    <div className="min-h-screen bg-[#090D0B] text-stone-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-stone-950 font-sans relative overflow-x-hidden">
      
      {/* ───── Deep Matte Background with Subtle HD Farm Vignette ───── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-1000 opacity-40 grayscale-[20%]"
          poster="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&q=80"
        >
          <source src="/videos/hero-wheat-field.mp4" type="video/mp4" />
        </video>
        
        {/* Ultra-Modern Dark Obsidian & Matte Charcoal Vignette (Zero Murky Tints) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090D0B]/95 via-[#090D0B]/80 to-[#090D0B]" />
        
        {/* Emerald Ambient Light Beam */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(16,185,129,0.12),transparent)]" />
        
        {/* Subtle grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* ═══════════ FLOATING MINIMALIST HEADER ═══════════ */}
      <div className="relative z-20 px-4 sm:px-8 pt-4 sm:pt-6 max-w-7xl mx-auto w-full">
        <header className="flex items-center justify-between px-5 sm:px-7 py-3.5 rounded-2xl bg-[#0B0F12]/80 backdrop-blur-xl border border-stone-800/80 shadow-2xl shadow-black/80">
          
          {/* Glowing KrishiSeva Brand Icon & Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all duration-300">
              <Tractor className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl text-white tracking-tight">
                  Krishi<span className="text-emerald-400">Seva</span>
                </span>
                {lang === 'hi' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900 text-emerald-400 border border-stone-800 font-bold hidden sm:inline-block">
                    कृषि सेवा
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Controls: Minimalist Language Toggle & Admin Login Pill */}
          <div className="flex items-center gap-2.5">
            
            {/* Admin Login Pill Button */}
            <a
              href="#admin"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-800 hover:border-emerald-500/50 bg-stone-900/60 hover:bg-stone-900 text-stone-300 hover:text-white text-xs font-bold transition-all duration-200 shadow-sm active:scale-95"
              title="Admin Login"
            >
              <Lock className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-400" />
              <span>{lang === 'hi' ? 'एडमिन लॉगिन' : 'Admin Login'}</span>
            </a>

            {/* Minimalist Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-800 bg-stone-900/60 hover:bg-stone-900 text-stone-200 hover:text-white text-xs font-bold shadow-sm transition-all duration-200 active:scale-95 hover:border-emerald-500/50"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>

          </div>

        </header>
      </div>

      {/* ═══════════ UBER RIDE-HAILING HERO & BOOKING SECTION ═══════════ */}
      <main className="relative z-10 flex-1 flex items-center max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full">
          
          {/* ──── LEFT COLUMN: Uber-Style Hero Headline & Quick Specs ──── */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Bold, Ultra-Clean Uber-Style Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[4.2rem] font-black text-white tracking-tight leading-[1.08]">
              {lang === 'hi' ? (
                <>
                  मांग पर मशीनरी। <br />
                  <span className="text-emerald-400">
                    सीधे आपके खेत तक।
                  </span>
                </>
              ) : (
                <>
                  Machinery on Demand. <br />
                  <span className="text-emerald-400">
                    Directly to Your Farm.
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-stone-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              {lang === 'hi'
                ? 'ट्रैक्टर, कंबाइन हार्वेस्टर और जेसीबी की त्वरित बुकिंग। रियल-टाइम में वाहन का आगमन ट्रैक करें।'
                : 'Instant booking for tractors, harvesters, and earthmovers. Track dispatches in real-time.'}
            </p>

            {/* Quick Specs Grid: 3 Clean Borderless Glass Pill Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-2">
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-200 text-xs font-bold shadow-md">
                <span className="text-base">🚜</span>
                <span>{lang === 'hi' ? 'सत्यापित मशीनरी' : 'Verified Equipment'}</span>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-200 text-xs font-bold shadow-md">
                <span className="text-base">⏱️</span>
                <span>{lang === 'hi' ? 'त्वरित डिस्पैच' : 'Instant Dispatch'}</span>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-200 text-xs font-bold shadow-md">
                <span className="text-base">🛡️</span>
                <span>{lang === 'hi' ? 'एग्रीस्टैक सत्यापित' : 'AgriStack Verified'}</span>
              </div>

            </div>

          </div>

          {/* ──── RIGHT COLUMN: Uber/Rapido-Style Booking Card ──── */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end animate-fade-in">
            <div className="relative bg-[#0B0F12]/90 backdrop-blur-2xl rounded-3xl p-7 sm:p-8 border border-stone-800 shadow-2xl shadow-black/90 space-y-6 max-w-md w-full ring-1 ring-white/5">
              
              <div className="relative space-y-5">

              {/* STEP 1: Phone Number Input */}
              {step === 'phone' && (
                <div className="space-y-5">
                  
                  {/* Card Header & Minimalist Role Segment Control */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {lang === 'hi' ? 'शुरुआत करें' : 'Get Started'}
                      </h2>
                      <p className="text-stone-400 text-xs font-medium">
                        {lang === 'hi' ? 'व्हाट्सएप ओटीपी प्राप्त करने हेतु अपना मोबाइल नंबर दर्ज करें' : 'Enter your mobile number to receive your WhatsApp OTP'}
                      </p>
                    </div>

                    {/* Minimalist Role Toggle Segment Control: [ Farmer | Driver ] */}
                    <div className="grid grid-cols-2 p-1 rounded-xl bg-stone-950 border border-stone-800">
                      <button
                        type="button"
                        onClick={() => setLoginRoleTab('farmer')}
                        className={`py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                          loginRoleTab === 'farmer'
                            ? 'bg-emerald-500 text-stone-950 shadow-md'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        <Tractor className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'किसान (Farmer)' : 'Farmer'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLoginRoleTab('driver')}
                        className={`py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                          loginRoleTab === 'driver'
                            ? 'bg-emerald-500 text-stone-950 shadow-md'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'ड्राइवर (Driver)' : 'Driver'}</span>
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-2xl bg-red-950/85 border border-red-800/60 text-red-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendWhatsAppOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                        {lang === 'hi' ? 'मोबाइल नंबर' : 'Enter Mobile Number'}
                      </label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 font-black text-sm flex items-center gap-1.5 pointer-events-none">
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </span>
                        <input
                          type="tel"
                          maxLength="10"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9236581609"
                          className="w-full pl-20 pr-4 py-4 rounded-2xl border border-stone-700 bg-stone-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 font-black text-white text-base outline-none transition-all duration-200 hover:border-stone-600 shadow-inner"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-base shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-75"
                    >
                      {isSendingOtp ? (
                        <>
                          <Clock className="w-5 h-5 animate-spin text-stone-950" />
                          <span>{lang === 'hi' ? 'व्हाट्सएप ओटीपी भेजा जा रहा है...' : 'Sending WhatsApp OTP...'}</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-5 h-5 text-stone-950" />
                          <span>{lang === 'hi' ? 'व्हाट्सएप द्वारा ओटीपी भेजें' : 'Send OTP via WhatsApp'}</span>
                          <ArrowRight className="w-5 h-5 text-stone-950" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Minimal Security Text */}
                  <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 pt-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>{lang === 'hi' ? '256-बिट सुरक्षित • 5 मिनट वैधता' : '256-Bit Secure • 5-min Validity'}</span>
                  </div>
                </div>
              )}

              {/* STEP 2: 6-Digit WhatsApp OTP Verification Screen */}
              {step === 'otp' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="text-center space-y-1.5">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mb-3 shadow-inner">
                      <MessageSquare className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {lang === 'hi' ? '6-अंकीय ओटीपी दर्ज करें' : 'Enter 6-Digit OTP'}
                    </h3>
                    <p className="text-stone-400 text-xs font-medium">
                      {lang === 'hi' ? `व्हाट्सएप (+91 ${phone}) पर भेजा गया सुरक्षा कोड` : `WhatsApp verification code sent to +91 ${phone}`}
                    </p>
                  </div>

                  {toastMessage && (
                    <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fade-in shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{toastMessage}</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-3.5 rounded-2xl bg-red-950/85 border border-red-800/60 text-red-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* WhatsApp Delayed Fallback Notice */}
                  {waDeliveryDelayed && (
                    <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-600/50 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-lg animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="text-base">⚡</span>
                        <div>
                          <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">
                            {lang === 'hi' ? 'व्हाट्सएप विलंब • फॉलबैक कोड:' : 'WhatsApp Delayed • Fallback Code:'}
                          </span>
                          <span className="font-mono text-base font-black text-emerald-400 tracking-wider">
                            {activeOtpCode}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtp(activeOtpCode)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-[11px] transition-all shadow-md active:scale-95"
                      >
                        {lang === 'hi' ? 'ओटीपी भरें ✓' : 'Auto Fill ✓'}
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full py-4 text-center tracking-[0.6em] rounded-2xl border border-stone-700 bg-stone-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 font-black text-emerald-400 text-3xl outline-none transition-all duration-200 shadow-inner"
                        required
                        autoFocus
                      />
                    </div>

                    {/* Resend OTP with 60-Second Countdown Timer */}
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="text-stone-400">
                        {resendTimer > 0 ? (
                          lang === 'hi' ? <span><b className="text-emerald-400 tabular-nums">{resendTimer}s</b> में पुनः भेजें</span> : <span>Resend in <b className="text-emerald-400 tabular-nums">{resendTimer}s</b></span>
                        ) : (
                          <span>{lang === 'hi' ? 'ओटीपी नहीं मिला?' : "Didn't get code?"}</span>
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={handleResendWhatsAppOtp}
                        disabled={resendTimer > 0 || isSendingOtp}
                        className={`font-black transition-all duration-200 ${
                          resendTimer > 0 || isSendingOtp
                            ? 'text-stone-600 cursor-not-allowed' 
                            : 'text-emerald-400 hover:text-emerald-300 underline underline-offset-2'
                        }`}
                      >
                        {lang === 'hi' ? 'व्हाट्सएप पर पुनः भेजें' : 'Resend via WhatsApp'}
                      </button>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => { setStep('phone'); setOtp(''); setError(''); setWaDeliveryDelayed(false); }}
                        className="w-1/3 py-4 rounded-2xl border border-stone-700 text-stone-300 font-bold text-xs hover:bg-stone-800 hover:border-stone-600 transition-all duration-200"
                      >
                        {lang === 'hi' ? 'नंबर बदलें' : 'Change Number'}
                      </button>

                      <button
                        type="submit"
                        disabled={isVerifyingOtp}
                        className="w-2/3 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] hover:translate-y-[-1px] disabled:opacity-75"
                      >
                        {isVerifyingOtp ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin text-stone-950" />
                            <span>{lang === 'hi' ? 'सत्यापित हो रहा है...' : 'Verifying...'}</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 text-stone-950" />
                            <span>{lang === 'hi' ? 'ओटीपी सत्यापित करें' : 'Verify OTP'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 3: Profile Setup & Role Selection */}
              {step === 'profile_setup' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1.5 text-center">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mb-2">
                      <Sparkles className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {lang === 'hi' ? 'अपनी प्रोफाइल बनाएं' : 'Set Up Your Profile'}
                    </h3>
                    <p className="text-stone-400 text-xs font-medium">
                      {lang === 'hi' ? `सत्यापित व्हाट्सएप: +91 ${phone}` : `Verified WhatsApp: +91 ${phone}`}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-2xl bg-red-950/85 border border-red-800/60 text-red-300 text-xs font-bold text-center animate-fade-in">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleProceedFromProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                        {lang === 'hi' ? 'आपका पूरा नाम *' : 'Full Name *'}
                      </label>
                      <div className="relative">
                        <User className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder={lang === 'hi' ? 'उदा. रामेश्वर सिंह' : 'e.g. Rameshwar Singh'}
                          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-stone-700 bg-stone-950 font-bold text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all duration-200 hover:border-stone-600"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                        {lang === 'hi' ? 'अपनी मुख्य भूमिका चुनें *' : 'Select Your Primary Role *'}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedRole('farmer')}
                          className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2 ${
                            selectedRole === 'farmer'
                              ? 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-500/30'
                              : 'border-stone-800 bg-stone-950/60 hover:border-stone-700 text-stone-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Tractor className={`w-6 h-6 ${selectedRole === 'farmer' ? 'text-emerald-400' : 'text-stone-500'}`} />
                            {selectedRole === 'farmer' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <div>
                            <span className="font-black text-white text-sm block">
                              {lang === 'hi' ? 'किसान' : 'Farmer'}
                            </span>
                            <span className="text-[11px] text-stone-400 leading-tight block">
                              {lang === 'hi' ? 'मशीन बुक करें' : 'Book Machinery'}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedRole('driver')}
                          className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2 ${
                            selectedRole === 'driver'
                              ? 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-500/30'
                              : 'border-stone-800 bg-stone-950/60 hover:border-stone-700 text-stone-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Truck className={`w-6 h-6 ${selectedRole === 'driver' ? 'text-emerald-400' : 'text-stone-500'}`} />
                            {selectedRole === 'driver' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <div>
                            <span className="font-black text-white text-sm block">
                              {lang === 'hi' ? 'ड्राइवर / मालिक' : 'Fleet Driver'}
                            </span>
                            <span className="text-[11px] text-stone-400 leading-tight block">
                              {lang === 'hi' ? 'कमाई शुरू करें' : 'Earn Bookings'}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-base shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] hover:translate-y-[-1px]"
                    >
                      <span>{lang === 'hi' ? 'आगे बढ़ें' : 'Continue'}</span>
                      <ArrowRight className="w-5 h-5 text-stone-950" />
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 4: AgriStack Farmer Registry Verification */}
              {step === 'agristack_verify' && (
                <div className="space-y-4 animate-fade-in">
                  
                  {aadhaarStep === 'input' && (
                    <div className="space-y-4">
                      <div className="text-center space-y-1.5">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mb-2">
                          <Building2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-stone-900 text-emerald-300 border border-stone-800 text-[11px] font-bold">
                          <LandPlot className="w-3 h-3 text-emerald-400" />
                          <span>AgriStack • UPFR (Unified Farmer Registry)</span>
                        </div>
                        <h3 className="text-xl font-black text-white mt-1">
                          {lang === 'hi' ? 'आधार से अपने खेत लिंक करें' : 'Link Your Land with Aadhaar'}
                        </h3>
                        <p className="text-xs text-stone-400 font-medium">
                          {lang === 'hi' 
                            ? 'सरकारी भूलेख पोर्टल से आपका खसरा व रकबा 1-क्लिक में लिंक हो जाएगा।' 
                            : 'Directly sync your land records and Khasra details from the registry.'}
                        </p>
                      </div>

                      {/* Demo Aadhaar Benchmark Profiles */}
                      <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
                          {lang === 'hi' ? '⚡ पंजीकृत एग्रीस्टैक प्रोफाइल:' : '⚡ Registered AgriStack Benchmark Profiles:'}
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAadhaarNumber('5544 3322 1100')}
                            className="p-2.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-800/50 hover:border-emerald-500 text-left transition-all duration-200 flex items-center justify-between group"
                          >
                            <div>
                              <span className="text-xs font-black text-emerald-300 block">{lang === 'hi' ? '5544 3322 1100 (डेमो आधार 1)' : '5544 3322 1100 (Demo Aadhaar 1)'}</span>
                              <span className="text-[10px] text-stone-400">{lang === 'hi' ? 'गाटा #142 (3.0 बीघा)' : 'Gata #142 (3.0 Bigha)'}</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-900/50 group-hover:bg-emerald-900/80">{lang === 'hi' ? 'पंजीकृत ✓' : 'Registered ✓'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setAadhaarNumber('8899 4433 2211')}
                            className="p-2.5 rounded-xl bg-teal-950/30 hover:bg-teal-950/60 border border-teal-800/50 hover:border-teal-500 text-left transition-all duration-200 flex items-center justify-between group"
                          >
                            <div>
                              <span className="text-xs font-black text-teal-300 block">{lang === 'hi' ? '8899 4433 2211 (डेमो आधार 2)' : '8899 4433 2211 (Demo Aadhaar 2)'}</span>
                              <span className="text-[10px] text-stone-400">{lang === 'hi' ? 'गाटा #215 (6.0 बीघा)' : 'Gata #215 (6.0 Bigha)'}</span>
                            </div>
                            <span className="text-[10px] font-bold text-teal-400 px-2 py-0.5 rounded-lg bg-teal-900/50 group-hover:bg-teal-900/80">{lang === 'hi' ? 'पंजीकृत ✓' : 'Registered ✓'}</span>
                          </button>
                        </div>
                      </div>

                      {error && (
                        <div className="p-3.5 rounded-2xl bg-red-950/85 border border-red-700/60 text-red-200 text-xs font-bold flex items-start gap-2 animate-fade-in">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span>{error}</span>
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleVerifyAadhaar} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider">
                            {lang === 'hi' ? 'आधार संख्या (12-अंकीय आधार) *' : '12-Digit Aadhaar Number *'}
                          </label>

                          <div className="relative">
                            <CreditCard className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              maxLength="14"
                              value={aadhaarNumber}
                              onChange={(e) => setAadhaarNumber(e.target.value)}
                              placeholder="5544 3322 1100"
                              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-700 bg-stone-950 font-black text-white tracking-widest text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 hover:border-stone-600"
                              autoFocus
                            />
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={handleSkipAgriStack}
                            className="w-1/3 py-4 rounded-2xl border border-stone-700 text-stone-400 hover:text-stone-200 hover:bg-stone-800 hover:border-stone-600 font-bold text-xs transition-all duration-200"
                          >
                            {lang === 'hi' ? 'बाद में करें' : 'Skip for Now'}
                          </button>

                          <button
                            type="submit"
                            disabled={isVerifyingAgriStack}
                            className="w-2/3 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] hover:translate-y-[-1px]"
                          >
                            {isVerifyingAgriStack ? (
                              <>
                                <Clock className="w-4 h-4 animate-spin text-stone-950" />
                                <span>{lang === 'hi' ? 'जांच रहे हैं...' : 'Verifying Registry...'}</span>
                              </>
                            ) : (
                              <>
                                <FileCheck2 className="w-4 h-4 text-stone-950" />
                                <span>{lang === 'hi' ? 'सत्यापित करें व खेत लाएं' : 'Verify & Fetch Land Records'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Phase 2: Real Land Records Fetched */}
                  {aadhaarStep === 'result' && agriStackResult && (
                    <div className="space-y-4 animate-fade-in">
                      
                      <div className="p-5 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border-2 border-emerald-500/60 shadow-xl shadow-emerald-500/10 space-y-3 text-white relative overflow-hidden">
                        
                        <div className="relative">
                          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">🇮🇳</span>
                              <div>
                                <h4 className="font-black text-xs uppercase tracking-wider text-emerald-400">
                                  {lang === 'hi' ? 'किसान पहचान पत्र (Kisan Pehchaan Patra)' : 'Digital Farmer Identity Card'}
                                </h4>
                                <p className="text-[10px] text-stone-400">{lang === 'hi' ? 'AgriStack UPFR द्वारा सत्यापित' : 'AgriStack UPFR Verified'}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500 text-stone-950 flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>{lang === 'hi' ? 'सत्यापित कृषक' : 'Verified Cultivator'}</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                            <div>
                              <span className="text-[10px] text-stone-400 block">{lang === 'hi' ? 'कृषक का नाम' : 'Farmer Name'}</span>
                              <b className="text-white text-sm">{agriStackResult.farmerProfile.kisanCardName}</b>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-400 block">{lang === 'hi' ? 'किसान आईडी' : 'Farmer ID'}</span>
                              <b className="font-mono text-emerald-400">{agriStackResult.farmerProfile.farmerId}</b>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-400 block">{lang === 'hi' ? 'ग्राम व तहसील' : 'Village & Tehsil'}</span>
                              <span>{agriStackResult.farmerProfile.village}, {agriStackResult.farmerProfile.tehsil}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-400 block">{lang === 'hi' ? 'कुल कृषि भूमि' : 'Total Farmland Area'}</span>
                              <b className="text-emerald-400 text-sm">{agriStackResult.farmerProfile.totalLandBigha} {lang === 'hi' ? 'बीघा' : 'Bigha'}</b>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-stone-800 space-y-1.5 mt-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                              <LandPlot className="w-3 h-3 text-emerald-400" />
                              <span>{lang === 'hi' ? `आधार से प्राप्त खेत (${agriStackResult.farmerProfile.linkedLands.length} प्लॉट):` : `Auto-Fetched Lands (${agriStackResult.farmerProfile.linkedLands.length} Plots):`}</span>
                            </span>
                            
                            <div className="space-y-1">
                              {agriStackResult.farmerProfile.linkedLands.map(l => (
                                <div key={l.id} className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs hover:bg-stone-900 transition-all duration-200">
                                  <div>
                                    <span className="font-bold text-white block">{l.name}</span>
                                    <span className="text-[10px] text-stone-400">{lang === 'hi' ? `गाटा संख्या: #${l.khasraNumber} • ${l.soilType}` : `Gata / Khasra No: #${l.khasraNumber} • ${l.soilType}`}</span>
                                  </div>
                                  <span className="font-black text-emerald-400 text-xs">{l.bigha} {lang === 'hi' ? 'बीघा' : 'Bigha'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={handleCompleteAgriStackRegistration}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] hover:translate-y-[-1px]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-stone-950" />
                        <span>{lang === 'hi' ? 'सत्यापित खेतों के साथ आगे बढ़ें' : 'Proceed with Verified Lands'}</span>
                      </button>
                    </div>
                  )}

                </div>
              )}

              </div>
            </div>
          </div>

        </div>

      </main>

      {/* ═══════════ MINIMALIST FOOTER ═══════════ */}
      <footer className="relative z-10 border-t border-stone-800/80 bg-[#090D0B] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center text-xs text-stone-400">
          <span>© 2026 KrishiSeva • Precision Farm Fleet Network • Malihabad, Lucknow</span>
        </div>
      </footer>

    </div>
  );
}
