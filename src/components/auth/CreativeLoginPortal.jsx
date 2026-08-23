import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { sendRealSmsToPhone, sendAadhaarEkycSms, sendRealWhatsAppOtp } from '../../utils/smsGateway';
import { verifyAgriStackFarmer, REGISTERED_AGRISTACK_RECORDS } from '../../services/bhulekhLandService';
import { audioHelper } from '../../utils/audioHelper';
import { 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  KeyRound, 
  Tractor, 
  Truck, 
  Sparkles, 
  User, 
  CheckCircle2, 
  Globe, 
  MapPin, 
  Clock, 
  Award, 
  Zap, 
  Lock,
  MessageSquare,
  Settings,
  X,
  Radio,
  Send,
  ExternalLink,
  FileCheck2,
  LandPlot,
  CreditCard,
  Check,
  Building2,
  ShieldAlert,
  Smartphone,
  AlertCircle,
  Star,
  Users,
  Leaf,
  Sprout,
  HeartHandshake,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

// 3D Floating Leaf with realistic SVG shape
function Floating3DLeaf({ size = 32, color = '#22c55e', delay = 0, duration = 12, left, animation = 'leaf-fall-1' }) {
  return (
    <div
      className="absolute pointer-events-none select-none leaf-3d z-[1]"
      style={{
        left,
        top: '-5%',
        width: size,
        height: size,
        animation: `${animation} ${duration}s ease-in-out ${delay}s infinite`,
      }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        {/* Leaf body */}
        <path
          d="M50 5 C20 25, 5 55, 50 95 C95 55, 80 25, 50 5Z"
          fill={color}
          opacity="0.85"
        />
        {/* Center vein */}
        <path
          d="M50 15 L50 85"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Side veins */}
        <path d="M50 30 L30 45" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" />
        <path d="M50 30 L70 45" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" />
        <path d="M50 50 L25 60" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" />
        <path d="M50 50 L75 60" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" />
        <path d="M50 65 L32 75" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M50 65 L68 75" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" strokeLinecap="round" />
        {/* Shine highlight */}
        <ellipse cx="38" cy="40" rx="8" ry="15" fill="rgba(255,255,255,0.12)" transform="rotate(-15 38 40)" />
      </svg>
    </div>
  );
}

export default function CreativeLoginPortal() {
  const { lang, toggleLanguage, t } = useLanguage();
  const { 
    requestOtp, 
    verifyOtp, 
    generatedOtp, 
    completeNewUserRegistration,
    setActiveRole
  } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'profile_setup' | 'agristack_verify'
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedRole, setSelectedRole] = useState('farmer');
  const [resendTimer, setResendTimer] = useState(30);
  const [activeOtpCode, setActiveOtpCode] = useState('1234');

  // UIDAI Aadhaar e-KYC & AgriStack State
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarStep, setAadhaarStep] = useState('input'); // 'input' | 'otp' | 'result'
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [activeAadhaarOtpCode, setActiveAadhaarOtpCode] = useState('849201');
  const [aadhaarResendTimer, setAadhaarResendTimer] = useState(30);
  const [isVerifyingAgriStack, setIsVerifyingAgriStack] = useState(false);
  const [agriStackResult, setAgriStackResult] = useState(null);

  // Gateway Configuration Modal States
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [waProvider, setWaProvider] = useState(() => {
    if (localStorage.getItem('krishi_meta_config')) return 'meta';
    if (localStorage.getItem('krishi_twiliowa_config')) return 'twiliowa';
    if (localStorage.getItem('krishi_wati_config')) return 'wati';
    if (localStorage.getItem('krishi_interakt_config')) return 'interakt';
    if (localStorage.getItem('krishi_ultramsg_config')) return 'ultramsg';
    if (localStorage.getItem('krishi_greenapi_config')) return 'greenapi';
    return 'none';
  });

  // Meta Cloud API
  const [waMetaPhoneId, setWaMetaPhoneId] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_meta_config') || '{}');
      return cfg.phoneId || '';
    } catch { return ''; }
  });
  const [waMetaToken, setWaMetaToken] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_meta_config') || '{}');
      return cfg.accessToken || '';
    } catch { return ''; }
  });
  const [waMetaTemplate, setWaMetaTemplate] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_meta_config') || '{}');
      return cfg.templateName || '';
    } catch { return ''; }
  });

  // Twilio WhatsApp
  const [waTwilioSid, setWaTwilioSid] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_twiliowa_config') || '{}');
      return cfg.accountSid || '';
    } catch { return ''; }
  });
  const [waTwilioToken, setWaTwilioToken] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_twiliowa_config') || '{}');
      return cfg.authToken || '';
    } catch { return ''; }
  });
  const [waTwilioFrom, setWaTwilioFrom] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_twiliowa_config') || '{}');
      return cfg.fromNumber || '';
    } catch { return ''; }
  });

  // Wati
  const [waWatiEndpoint, setWaWatiEndpoint] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_wati_config') || '{}');
      return cfg.apiEndpoint || '';
    } catch { return ''; }
  });
  const [waWatiToken, setWaWatiToken] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_wati_config') || '{}');
      return cfg.accessToken || '';
    } catch { return ''; }
  });
  const [waWatiTemplate, setWaWatiTemplate] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_wati_config') || '{}');
      return cfg.templateName || '';
    } catch { return ''; }
  });

  // Interakt
  const [waInteraktKey, setWaInteraktKey] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_interakt_config') || '{}');
      return cfg.apiKey || '';
    } catch { return ''; }
  });
  const [waInteraktTemplate, setWaInteraktTemplate] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_interakt_config') || '{}');
      return cfg.templateName || '';
    } catch { return ''; }
  });

  // UltraMsg & Green-API
  const [waUltramsgInstance, setWaUltramsgInstance] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_ultramsg_config') || '{}');
      return cfg.instanceId || '';
    } catch { return ''; }
  });
  const [waUltramsgToken, setWaUltramsgToken] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_ultramsg_config') || '{}');
      return cfg.token || '';
    } catch { return ''; }
  });
  const [waGreenapiInstance, setWaGreenapiInstance] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_greenapi_config') || '{}');
      return cfg.instanceId || '';
    } catch { return ''; }
  });
  const [waGreenapiToken, setWaGreenapiToken] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_greenapi_config') || '{}');
      return cfg.token || '';
    } catch { return ''; }
  });

  // SMS Fallback and Delivery status states
  const [waDeliveryFailed, setWaDeliveryFailed] = useState(false);
  const [waProviderUsed, setWaProviderUsed] = useState('');
  const [smsFallbackSent, setSmsFallbackSent] = useState(false);

  const [smsProvider, setSmsProvider] = useState(() => {
    if (localStorage.getItem('krishi_fast2sms_api_key')) return 'fast2sms';
    if (localStorage.getItem('krishi_twilio_config')) return 'twilio';
    return 'none';
  });
  const [fast2smsKey, setFast2smsKey] = useState(() => localStorage.getItem('krishi_fast2sms_api_key') || '');
  const [twilioSid, setTwilioSid] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_twilio_config') || '{}');
      return cfg.accountSid || '';
    } catch { return ''; }
  });
  const [twilioToken, setTwilioToken] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_twilio_config') || '{}');
      return cfg.authToken || '';
    } catch { return ''; }
  });
  const [twilioFrom, setTwilioFrom] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('krishi_twilio_config') || '{}');
      return cfg.fromNumber || '';
    } catch { return ''; }
  });

  const handleSaveGatewayConfig = (e) => {
    e.preventDefault();

    // Clean up all first
    localStorage.removeItem('krishi_meta_config');
    localStorage.removeItem('krishi_twiliowa_config');
    localStorage.removeItem('krishi_wati_config');
    localStorage.removeItem('krishi_interakt_config');
    localStorage.removeItem('krishi_ultramsg_config');
    localStorage.removeItem('krishi_greenapi_config');

    // 1. Save WhatsApp config
    if (waProvider === 'meta') {
      localStorage.setItem('krishi_meta_config', JSON.stringify({ phoneId: waMetaPhoneId, accessToken: waMetaToken, templateName: waMetaTemplate }));
    } else if (waProvider === 'twiliowa') {
      localStorage.setItem('krishi_twiliowa_config', JSON.stringify({ accountSid: waTwilioSid, authToken: waTwilioToken, fromNumber: waTwilioFrom }));
    } else if (waProvider === 'wati') {
      localStorage.setItem('krishi_wati_config', JSON.stringify({ apiEndpoint: waWatiEndpoint, accessToken: waWatiToken, templateName: waWatiTemplate }));
    } else if (waProvider === 'interakt') {
      localStorage.setItem('krishi_interakt_config', JSON.stringify({ apiKey: waInteraktKey, templateName: waInteraktTemplate }));
    } else if (waProvider === 'ultramsg') {
      localStorage.setItem('krishi_ultramsg_config', JSON.stringify({ instanceId: waUltramsgInstance, token: waUltramsgToken }));
    } else if (waProvider === 'greenapi') {
      localStorage.setItem('krishi_greenapi_config', JSON.stringify({ instanceId: waGreenapiInstance, token: waGreenapiToken }));
    }

    // 2. Save SMS config
    if (smsProvider === 'fast2sms') {
      localStorage.setItem('krishi_fast2sms_api_key', fast2smsKey);
      localStorage.removeItem('krishi_twilio_config');
    } else if (smsProvider === 'twilio') {
      localStorage.setItem('krishi_twilio_config', JSON.stringify({ accountSid: twilioSid, authToken: twilioToken, fromNumber: twilioFrom }));
      localStorage.removeItem('krishi_fast2sms_api_key');
    } else {
      localStorage.removeItem('krishi_fast2sms_api_key');
      localStorage.removeItem('krishi_twilio_config');
    }

    setShowGatewayModal(false);
  };

  // Timer countdown for App login OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Timer countdown for Aadhaar e-KYC OTP resend
  useEffect(() => {
    let interval = null;
    if (aadhaarStep === 'otp' && aadhaarResendTimer > 0) {
      interval = setInterval(() => {
        setAadhaarResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [aadhaarStep, aadhaarResendTimer]);

  // WhatsApp OTP auto-trigger
  const triggerWhatsAppOtp = async (phoneNumber, code) => {
    setWaDeliveryFailed(false);
    setWaProviderUsed('');
    const result = await sendRealWhatsAppOtp(phoneNumber, code, lang);
    if (result.success) {
      console.log(`Success: OTP sent silently via ${result.provider}`);
      setWaProviderUsed(result.provider);
      setWaDeliveryFailed(false);
    } else {
      console.warn(`WhatsApp delivery failed: ${result.error || 'No gateway configured'}`);
      setWaDeliveryFailed(true);
      setWaProviderUsed(result.provider || 'None');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError(lang === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    
    const result = requestOtp(phone);
    if (!result.success) {
      setError(result.error);
      return;
    }

    const code = result.code;
    setActiveOtpCode(code);
    setResendTimer(60);
    setStep('otp');

    // Trigger WhatsApp delivery (SMS is only triggered via fallback)
    triggerWhatsAppOtp(phone, code);
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    setError('');

    const result = requestOtp(phone);
    if (!result.success) {
      setError(result.error);
      return;
    }

    const code = result.code;
    setActiveOtpCode(code);
    setResendTimer(60);
    triggerWhatsAppOtp(phone, code);
  };

  const handleSendSmsFallback = async () => {
    setError('');
    const result = await sendRealSmsToPhone(phone, activeOtpCode);
    if (result.success) {
      setSmsFallbackSent(true);
      setTimeout(() => setSmsFallbackSent(false), 5000);
    } else {
      setError(lang === 'hi' ? 'एसएमएस भेजना विफल रहा।' : 'Failed to send SMS fallback.');
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const result = verifyOtp(phone, otp);

    if (result.success) {
      setError('');
      if (result.isNewUser) {
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
      setError(result.error || (lang === 'hi' ? 'गलत ओटीपी कोड।' : 'Invalid OTP.'));
    }
  };

  // Step 2: Handle Profile Details & Role Selection
  const handleProceedFromProfile = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError(lang === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें' : 'Please enter your full name');
      return;
    }
    setError('');

    if (selectedRole === 'driver') {
      completeNewUserRegistration('driver', { name: userName.trim(), phone });
      setActiveRole('driver');
      return;
    }

    // If farmer, proceed to Aadhaar e-KYC Verification
    setAadhaarStep('input');
    setStep('agristack_verify');
  };

  // Step 3A: User enters Aadhaar -> Validate against AgriStack Registry & Send UIDAI e-KYC OTP
  const handleSendAadhaarOtp = async (e) => {
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
          ? '❌ यह आधार नंबर AgriStack किसान रजिस्ट्री में पंजीकृत नहीं है। कृपया CSC पर पंजीकरण कराएं अथवा नीचे दिए "बाद में करें" से जारी रखें।'
          : '❌ This Aadhaar number is NOT registered in the AgriStack Farmer Registry. Please register via CSC or click "Skip for Now" to proceed.'
        );
        return;
      }

      // Aadhaar is verified in government AgriStack database!
      setAgriStackResult(check);

      // Generate UIDAI e-KYC OTP
      const generatedUidaiOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setActiveAadhaarOtpCode(generatedUidaiOtp);
      setAadhaarResendTimer(30);
      setAadhaarStep('otp');

      // Dispatch real Aadhaar OTP SMS & sound
      sendAadhaarEkycSms(phone, generatedUidaiOtp, check.farmerProfile.aadhaarMasked);
      audioHelper.playOtpChime();
    } catch (err) {
      setIsVerifyingAgriStack(false);
      setError(lang === 'hi' ? 'सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।' : 'Could not connect to registry server. Please try again.');
    }
  };

  // Step 3B: Verify UIDAI Aadhaar OTP -> Show Real Land Data
  const handleVerifyAadhaarOtp = (e) => {
    e.preventDefault();
    if (!aadhaarOtp.trim() || aadhaarOtp.length < 6) {
      setError(lang === 'hi' ? 'कृपया 6-अंकीय आधार ओटीपी दर्ज करें' : 'Please enter the 6-digit Aadhaar OTP');
      return;
    }

    if (aadhaarOtp === activeAadhaarOtpCode || aadhaarOtp === '123456' || aadhaarOtp === '849201') {
      setError('');
      setAadhaarStep('result');
      audioHelper.playBookingConfirmed();
    } else {
      setError(lang === 'hi' ? 'गलत आधार ओटीपी कोड। कृपया सही 6-अंकीय कोड या ऑटो-फिल का उपयोग करें।' : 'Incorrect Aadhaar OTP code. Please enter the valid 6-digit code or use Auto-Fill.');
    }
  };

  // Confirm and Save Verified Lands from AgriStack
  const handleCompleteAgriStackRegistration = () => {
    if (agriStackResult?.farmerProfile) {
      const p = agriStackResult.farmerProfile;
      completeNewUserRegistration('farmer', {
        name: userName.trim() || p.kisanCardName,
        phone,
        isAgriStackVerified: true,
        farmerId: p.farmerId,
        aadhaarMasked: p.aadhaarMasked,
        totalLandBigha: p.totalLandBigha,
        linkedLands: p.linkedLands
      });
    } else {
      completeNewUserRegistration('farmer', { name: userName.trim(), phone });
    }
    setActiveRole('farmer');
  };

  // Skip AgriStack Verification Option
  const handleSkipAgriStack = () => {
    completeNewUserRegistration('farmer', {
      name: userName.trim(),
      phone,
      isAgriStackVerified: false
    });
    setActiveRole('farmer');
  };



  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col relative overflow-hidden selection:bg-emerald-500 selection:text-stone-950 font-sans">
      
      {/* ───── Cinematic 4K Wheat Field Background Video ───── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-75"
          poster="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Dark cinematic overlay for text readability & high contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/75 via-stone-950/65 to-stone-950/90" />
        {/* Emerald accent glow on top */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]" />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* ───── 3D Falling Leaves ───── */}
      <Floating3DLeaf size={28} color="#22c55e" delay={0} duration={14} left="5%" animation="leaf-fall-1" />
      <Floating3DLeaf size={22} color="#16a34a" delay={2} duration={11} left="15%" animation="leaf-fall-2" />
      <Floating3DLeaf size={35} color="#4ade80" delay={4} duration={16} left="25%" animation="leaf-fall-3" />
      <Floating3DLeaf size={18} color="#15803d" delay={1} duration={13} left="40%" animation="leaf-fall-1" />
      <Floating3DLeaf size={30} color="#86efac" delay={6} duration={15} left="55%" animation="leaf-fall-2" />
      <Floating3DLeaf size={24} color="#059669" delay={3} duration={12} left="68%" animation="leaf-fall-3" />
      <Floating3DLeaf size={20} color="#34d399" delay={8} duration={14} left="78%" animation="leaf-fall-1" />
      <Floating3DLeaf size={26} color="#10b981" delay={5} duration={17} left="88%" animation="leaf-fall-2" />
      <Floating3DLeaf size={16} color="#22c55e" delay={7} duration={10} left="95%" animation="leaf-fall-3" />
      <Floating3DLeaf size={32} color="#4ade80" delay={9} duration={18} left="48%" animation="leaf-fall-1" />

      {/* ═══════════ TOP HEADER BAR ═══════════ */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between animate-fade-in-down">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 group-hover:scale-105 transition-all duration-300">
            <Tractor className="w-6 h-6 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-2xl text-white tracking-tight">Krishi<span className="text-emerald-400">Seva</span></span>
              {lang === 'hi' && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 font-bold hidden sm:inline-block backdrop-blur-sm">कृषि सेवा</span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 font-medium hidden md:block">
              {lang === 'hi' ? 'ना बिचौलिया, ना इंतज़ार — मशीन सीधा खेत पर' : 'Not a Call, Just a Click — Machinery to your Farm'}
            </p>
          </div>
        </div>

        {/* Right Top Header Navigation */}
        <div className="flex items-center gap-2.5">


          <a
            href="#admin"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-800/80 bg-stone-900/50 hover:bg-stone-800/80 text-stone-400 hover:text-white text-xs font-bold transition-all duration-200 backdrop-blur-md hover:border-stone-700"
            title="Admin Portal Access"
          >
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>{lang === 'hi' ? 'प्रशासक' : 'Admin'}</span>
          </a>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-700/80 bg-stone-900/50 hover:bg-stone-800/80 text-stone-300 hover:text-white text-xs font-bold shadow-sm transition-all duration-200 active:scale-95 backdrop-blur-md hover:border-emerald-700/50"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
          </button>
        </div>

      </header>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className="relative z-10 flex-1 flex items-center max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* ──── LEFT COLUMN: Hero, Stats, Testimonials ──── */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            {/* Live Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-black shadow-lg backdrop-blur-md hover:border-emerald-500/50 transition-all duration-300 cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>{lang === 'hi' ? '🌾 भारत का #1 कृषि मशीनरी नेटवर्क' : "🌾 India's #1 Farm Fleet Network"}</span>
            </div>

            {/* Hero Headline */}
            <h1 className="animate-fade-in-up stagger-2 text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-white tracking-tight leading-[1.1]">
              {lang === 'hi' ? (
                <>
                  खेत आपका, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 animate-gradient-shift bg-300%">
                    मशीन हमारी।
                  </span>
                </>
              ) : (
                <>
                  Your Field, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 animate-gradient-shift bg-300%">
                    Our Power.
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-in-up stagger-3 text-stone-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
              {lang === 'hi'
                ? 'ट्रैक्टर, कंबाइन हार्वेस्टर व जेसीबी की 1-क्लिक ऑन-डिमांड बुकिंग। सत्यापित ऑपरेटर और पारदर्शी दर सीधे खेत की सीमा तक।'
                : 'On-demand tractors, harvesters, and earthmovers dispatched directly to your farm boundary with transparent fixed rates.'}
            </p>

            {/* ── Feature Pills ── */}
            <div className="animate-fade-in-up stagger-4 flex flex-wrap gap-2 justify-center lg:justify-start max-w-lg mx-auto lg:mx-0">
              {[
                { icon: <ShieldCheck className="w-3 h-3" />, text: lang === 'hi' ? '100% KYC फ्लीट' : '100% KYC Fleet', color: 'text-amber-400 bg-amber-950/50 border-amber-800/50' },
                { icon: <LandPlot className="w-3 h-3" />, text: 'AgriStack', color: 'text-blue-400 bg-blue-950/50 border-blue-800/50' },
              ].map((f, i) => (
                <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${f.color} backdrop-blur-sm`}>
                  {f.icon}
                  <span>{f.text}</span>
                </span>
              ))}
            </div>
          </div>

          {/* ──── RIGHT COLUMN: Auth Card ──── */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end animate-fade-in-up stagger-3">
            <div className="relative bg-stone-900/70 backdrop-blur-2xl rounded-3xl p-7 sm:p-8 border border-stone-800/80 shadow-2xl shadow-black/30 space-y-6 max-w-md w-full group/card">
              
              {/* Glow border effect on hover */}
              <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Card inner content */}
              <div className="relative space-y-6">

              {/* STEP 1: Phone Number Input */}
              {step === 'phone' && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                      {lang === 'hi' ? 'कृषि सेवा में प्रवेश करें' : 'Get Started with KrishiSeva'}
                    </h2>
                    <p className="text-stone-400 text-xs sm:text-sm font-medium leading-relaxed">
                      {lang === 'hi' ? 'सत्यापन कोड प्राप्त करने हेतु 10-अंकीय मोबाइल नंबर दर्ज करें' : 'Enter your 10-digit mobile number to receive verification OTP'}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-bold text-center animate-fade-in">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                        {lang === 'hi' ? 'मोबाइल नंबर दर्ज करें' : 'Enter Mobile Number'}
                      </label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-black text-sm flex items-center gap-1.5 pointer-events-none">
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </span>
                        <input
                          type="tel"
                          maxLength="10"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9236581609"
                          className="w-full pl-20 pr-4 py-4 rounded-2xl border border-stone-700/80 bg-stone-950/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-black text-white text-base outline-none transition-all duration-200 hover:border-stone-600"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-base shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] hover:translate-y-[-1px]"
                    >
                      <span>{lang === 'hi' ? 'व्हाट्सएप पर ओटीपी भेजें' : 'Send OTP on WhatsApp'}</span>
                      <ArrowRight className="w-5 h-5 text-stone-950" />
                    </button>
                  </form>

                  {/* Security assurance */}
                  <div className="flex items-center justify-center gap-2 text-[10px] text-stone-600 pt-1">
                    <Lock className="w-3 h-3" />
                    <span>{lang === 'hi' ? '256-बिट SSL एन्क्रिप्शन से सुरक्षित' : '256-bit SSL encrypted & secure'}</span>
                  </div>
                </div>
              )}

              {/* STEP 2: Segmented OTP Input */}
              {step === 'otp' && (
                <div className="space-y-5 animate-fade-in-up">
                  <div className="text-center space-y-1.5">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center mb-3">
                      <MessageSquare className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {lang === 'hi' ? '6-अंकीय ओटीपी दर्ज करें' : 'Enter 6-Digit OTP'}
                    </h3>
                    <p className="text-stone-400 text-xs font-medium">
                      {lang === 'hi' ? `मोबाइल +91 ${phone} पर भेजा गया कोड` : `Verification code sent to +91 ${phone}`}
                    </p>
                  </div>



                  {error && (
                    <div className="p-3 rounded-2xl bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-bold text-center animate-fade-in">
                      {error}
                    </div>
                  )}

                  {waDeliveryFailed && (
                    <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-900/30 text-amber-300 text-xs font-semibold text-center leading-relaxed animate-fade-in">
                      {lang === 'hi' ? 'व्हाट्सएप पर ओटीपी भेजना विफल रहा। ' : 'WhatsApp OTP delivery failed. '}
                      <button
                        type="button"
                        onClick={handleSendSmsFallback}
                        className="font-black underline hover:text-amber-200 transition-colors ml-1"
                      >
                        {lang === 'hi' ? 'सामान्य एसएमएस द्वारा प्राप्त करें' : 'Send via Regular SMS'}
                      </button>
                    </div>
                  )}

                  {smsFallbackSent && (
                    <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 text-xs font-bold text-center animate-fade-in">
                      {lang === 'hi' ? 'एसएमएस सफलतापूर्वक भेज दिया गया है!' : 'SMS fallback sent successfully!'}
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
                        className="w-full py-4 text-center tracking-[0.6em] rounded-2xl border border-stone-700/80 bg-stone-950/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-black text-emerald-400 text-3xl outline-none transition-all duration-200"
                        required
                        autoFocus
                      />
                    </div>

                    {/* Resend OTP */}
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
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0}
                        className={`font-black transition-all duration-200 ${
                          resendTimer > 0 
                            ? 'text-stone-600 cursor-not-allowed' 
                            : 'text-emerald-400 hover:text-emerald-300 underline underline-offset-2'
                        }`}
                      >
                        {lang === 'hi' ? 'कोड पुनः भेजें' : 'Resend Code'}
                      </button>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => { setStep('phone'); setOtp(''); setError(''); setWaDeliveryFailed(false); }}
                        className="w-1/3 py-4 rounded-2xl border border-stone-700/80 text-stone-300 font-bold text-xs hover:bg-stone-800/80 hover:border-stone-600 transition-all duration-200"
                      >
                        {lang === 'hi' ? 'नंबर बदलें' : 'Change Number'}
                      </button>

                      <button
                        type="submit"
                        className="w-2/3 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] hover:translate-y-[-1px]"
                      >
                        <ShieldCheck className="w-4 h-4 text-stone-950" />
                        <span>{lang === 'hi' ? 'सत्यापित करें' : 'Verify OTP'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 3: Brand New User Sign-Up Profile Details & Role */}
              {step === 'profile_setup' && (
                <div className="space-y-5 animate-fade-in-up">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center mb-2">
                      <HeartHandshake className="w-7 h-7 text-emerald-400" />
                    </div>
                    <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50 backdrop-blur-sm">
                      {lang === 'hi' ? 'नया पंजीकरण' : 'Sign Up'}
                    </span>
                    <h3 className="text-xl font-black text-white mt-2">
                      {lang === 'hi' ? 'अपना विवरण व भूमिका चुनें' : 'Enter Your Profile & Role'}
                    </h3>
                  </div>

                  {error && (
                    <div className="p-3 rounded-2xl bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-bold text-center animate-fade-in">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleProceedFromProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                        {lang === 'hi' ? 'आपका पूरा नाम *' : 'Your Full Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder={lang === 'hi' ? 'उदा. बलराम सिंह' : 'e.g. Balram Singh'}
                        className="w-full px-4 py-4 rounded-2xl border border-stone-700/80 bg-stone-950/80 font-bold text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 hover:border-stone-600"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                        {lang === 'hi' ? 'खाता प्रकार चुनें *' : 'Choose Account Type *'}
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <div
                          onClick={() => setSelectedRole('farmer')}
                          className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-center space-y-2 hover-lift ${
                            selectedRole === 'farmer'
                              ? 'border-emerald-500/80 bg-emerald-950/40 shadow-md ring-2 ring-emerald-500/20'
                              : 'border-stone-800/80 bg-stone-950/60 hover:bg-stone-900 hover:border-stone-700 text-stone-400'
                          }`}
                        >
                          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <span className="text-2xl">🌾</span>
                          </div>
                          <h4 className="font-black text-white text-xs sm:text-sm">{lang === 'hi' ? 'किसान' : 'Farmer'}</h4>
                          <p className="text-[10px] text-stone-500">{lang === 'hi' ? 'ट्रैक्टर व मशीनें बुक करें' : 'Book tractors & harvesters'}</p>
                        </div>

                        <div
                          onClick={() => setSelectedRole('driver')}
                          className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-center space-y-2 hover-lift ${
                            selectedRole === 'driver'
                              ? 'border-blue-500/80 bg-blue-950/40 shadow-md ring-2 ring-blue-500/20'
                              : 'border-stone-800/80 bg-stone-950/60 hover:bg-stone-900 hover:border-stone-700 text-stone-400'
                          }`}
                        >
                          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <span className="text-2xl">🚜</span>
                          </div>
                          <h4 className="font-black text-white text-xs sm:text-sm">{lang === 'hi' ? 'चालक / ऑपरेटर' : 'Operator / Driver'}</h4>
                          <p className="text-[10px] text-stone-500">{lang === 'hi' ? 'मशीन चलाएं और कमाएं' : 'Provide machine & earn'}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] hover:translate-y-[-1px]"
                    >
                      <span>{selectedRole === 'farmer' ? (lang === 'hi' ? 'आगे बढ़ें (आधार ई-केवाईसी)' : 'Proceed to Aadhaar e-KYC') : (lang === 'hi' ? 'पंजीकरण पूरा करें' : 'Complete Sign Up')}</span>
                      <ArrowRight className="w-4 h-4 text-stone-950" />
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 4: AgriStack Farmer Verification with Automatic Aadhaar OTP */}
              {step === 'agristack_verify' && (
                <div className="space-y-5 animate-fade-in-up">
                  
                  {/* Phase 1: Enter 12-Digit Aadhaar */}
                  {aadhaarStep === 'input' && (
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-950/80 border border-blue-700/50 flex items-center justify-center mb-2">
                          <Building2 className="w-7 h-7 text-blue-400" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/50 text-[11px] font-bold backdrop-blur-sm">
                          <ShieldCheck className="w-3 h-3 text-blue-400" />
                          <span>{lang === 'hi' ? 'UIDAI व एग्रीस्टैक किसान रजिस्ट्री' : 'UIDAI & AgriStack Farmer Registry'}</span>
                        </div>
                        <h3 className="text-xl font-black text-white mt-1">
                          {lang === 'hi' ? 'आधार कार्ड नंबर दर्ज करें' : 'Enter 12-Digit Aadhaar'}
                        </h3>
                        <p className="text-xs text-stone-400 font-medium">
                          {lang === 'hi' 
                            ? 'आधार संख्या दर्ज कर सत्यापन करें — पंजीकृत होने पर वास्तविक खेत विवरण स्वतः लोड होंगे' 
                            : 'Enter your 12-digit Aadhaar to verify government registration and fetch real land records'}
                        </p>
                      </div>

                      {/* Benchmark Registered Aadhaar Selector Pills */}
                      <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800/60 space-y-2 backdrop-blur-sm">
                        <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">
                          {lang === 'hi' ? '⚡ पंजीकृत एग्रीस्टैक प्रोफाइल (त्वरित परीक्षण):' : '⚡ Registered AgriStack Benchmark Profiles (Quick Test):'}
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAadhaarNumber('5544 3322 1100')}
                            className="p-2.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-800/50 hover:border-emerald-700 text-left transition-all duration-200 flex items-center justify-between group"
                          >
                            <div>
                              <span className="text-xs font-black text-emerald-300 block">{lang === 'hi' ? '5544 3322 1100 (डेमो आधार 1)' : '5544 3322 1100 (Demo Aadhaar 1)'}</span>
                              <span className="text-[10px] text-stone-500">{lang === 'hi' ? 'गाटा #142 (3.0 बीघा), गाटा #74 (4.5 बीघा)' : 'Gata #142 (3.0 Bigha), Gata #74 (4.5 Bigha)'}</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-900/50 group-hover:bg-emerald-900/80">{lang === 'hi' ? 'पंजीकृत ✓' : 'Registered ✓'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setAadhaarNumber('8899 4433 2211')}
                            className="p-2.5 rounded-xl bg-blue-950/30 hover:bg-blue-950/60 border border-blue-800/50 hover:border-blue-700 text-left transition-all duration-200 flex items-center justify-between group"
                          >
                            <div>
                              <span className="text-xs font-black text-blue-300 block">{lang === 'hi' ? '8899 4433 2211 (डेमो आधार 2)' : '8899 4433 2211 (Demo Aadhaar 2)'}</span>
                              <span className="text-[10px] text-stone-500">{lang === 'hi' ? 'गाटा #215 (6.0 बीघा)' : 'Gata #215 (6.0 Bigha)'}</span>
                            </div>
                            <span className="text-[10px] font-bold text-blue-400 px-2 py-0.5 rounded-lg bg-blue-900/50 group-hover:bg-blue-900/80">{lang === 'hi' ? 'पंजीकृत ✓' : 'Registered ✓'}</span>
                          </button>
                        </div>
                      </div>

                      {error && (
                        <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-700/60 text-red-200 text-xs font-bold flex items-start gap-2 animate-fade-in">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span>{error}</span>
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleSendAadhaarOtp} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider">
                            {lang === 'hi' ? 'आधार संख्या (12-अंकीय आधार) *' : '12-Digit Aadhaar Number *'}
                          </label>

                          <div className="relative">
                            <CreditCard className="w-5 h-5 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              maxLength="14"
                              value={aadhaarNumber}
                              onChange={(e) => setAadhaarNumber(e.target.value)}
                              placeholder="5544 3322 1100"
                              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-700/80 bg-stone-950/80 font-black text-white tracking-widest text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-stone-600"
                              autoFocus
                            />
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={handleSkipAgriStack}
                            className="w-1/3 py-4 rounded-2xl border border-stone-700/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 hover:border-stone-600 font-bold text-xs transition-all duration-200"
                          >
                            {lang === 'hi' ? 'बाद में करें' : 'Skip for Now'}
                          </button>

                          <button
                            type="submit"
                            disabled={isVerifyingAgriStack}
                            className="w-2/3 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] hover:translate-y-[-1px]"
                          >
                            {isVerifyingAgriStack ? (
                              <>
                                <Clock className="w-4 h-4 animate-spin" />
                                <span>{lang === 'hi' ? 'जांच रहे हैं...' : 'Verifying Registry...'}</span>
                              </>
                            ) : (
                              <>
                                <Smartphone className="w-4 h-4" />
                                <span>{lang === 'hi' ? 'आधार ओटीपी भेजें' : 'Send Aadhaar OTP'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Phase 2: Enter UIDAI Aadhaar 6-Digit OTP */}
                  {aadhaarStep === 'otp' && (
                    <div className="space-y-4 animate-fade-in-up">
                      <div className="text-center space-y-2">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center mb-2">
                          <ShieldCheck className="w-7 h-7 text-emerald-400" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 text-[11px] font-bold backdrop-blur-sm">
                          <Lock className="w-3 h-3 text-emerald-400" />
                          <span>{lang === 'hi' ? 'UIDAI आधार ई-केवाईसी एसएमएस गेटवे' : 'UIDAI Aadhaar e-KYC SMS Gateway'}</span>
                        </div>
                        <h3 className="text-xl font-black text-white mt-1">
                          {lang === 'hi' ? 'आधार ओटीपी सत्यापन' : 'Verify Aadhaar OTP'}
                        </h3>
                        <p className="text-xs text-stone-400 font-medium">
                          {lang === 'hi' 
                            ? `आधार से लिंक मोबाइल नंबर (+91 ${phone.slice(0, 2)}*****${phone.slice(-3)}) पर भेजा गया 6-अंकीय कोड दर्ज करें` 
                            : `Enter the 6-digit code sent to your Aadhaar-registered mobile (+91 ${phone.slice(0, 2)}*****${phone.slice(-3)})`}
                        </p>
                      </div>

                      {/* Small Standalone Auto-Fill for Aadhaar OTP */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setAadhaarOtp(activeAadhaarOtpCode)}
                          className="text-[11px] font-bold text-stone-400 hover:text-blue-400 transition-all duration-200 flex items-center gap-1 bg-stone-950/80 hover:bg-blue-950/40 px-2.5 py-1 rounded-xl border border-stone-800 hover:border-blue-700/50 shadow-sm active:scale-95"
                        >
                          <Sparkles className="w-3 h-3 text-blue-400" />
                          <span>{lang === 'hi' ? `स्वतः भरें (${activeAadhaarOtpCode})` : `Auto-Fill UIDAI OTP (${activeAadhaarOtpCode})`}</span>
                        </button>
                      </div>

                      {error && (
                        <div className="p-3 rounded-2xl bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-bold text-center animate-fade-in">
                          {error}
                        </div>
                      )}

                      <form onSubmit={handleVerifyAadhaarOtp} className="space-y-4">
                        <div>
                          <input
                            type="text"
                            maxLength="6"
                            value={aadhaarOtp}
                            onChange={(e) => setAadhaarOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••••"
                            className="w-full py-4 text-center tracking-[0.5em] rounded-2xl border border-blue-500/40 bg-stone-950/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-black text-blue-400 text-2xl outline-none transition-all duration-200"
                            required
                            autoFocus
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs px-1">
                          <span className="text-stone-400">
                            {aadhaarResendTimer > 0 ? (
                              lang === 'hi' ? <span><b className="text-blue-400 tabular-nums">{aadhaarResendTimer}s</b> में पुनः भेजें</span> : <span>Resend in <b className="text-blue-400 tabular-nums">{aadhaarResendTimer}s</b></span>
                            ) : (
                              <span>{lang === 'hi' ? 'ओटीपी नहीं मिला?' : "Didn't receive OTP?"}</span>
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={handleSendAadhaarOtp}
                            disabled={aadhaarResendTimer > 0}
                            className={`font-black transition-all duration-200 ${
                              aadhaarResendTimer > 0 
                                ? 'text-stone-600 cursor-not-allowed' 
                                : 'text-blue-400 hover:text-blue-300 underline underline-offset-2'
                            }`}
                          >
                            {lang === 'hi' ? 'ओटीपी पुनः भेजें' : 'Resend Aadhaar OTP'}
                          </button>
                        </div>

                        <div className="flex gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => { setAadhaarStep('input'); setError(''); }}
                            className="w-1/3 py-4 rounded-2xl border border-stone-700/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 hover:border-stone-600 font-bold text-xs transition-all duration-200"
                          >
                            {lang === 'hi' ? 'आधार बदलें' : 'Change Aadhaar'}
                          </button>

                          <button
                            type="submit"
                            className="w-2/3 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] hover:translate-y-[-1px]"
                          >
                            <FileCheck2 className="w-4 h-4" />
                            <span>{lang === 'hi' ? 'सत्यापित करें व खेत लाएं' : 'Verify & Fetch Land Records'}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Phase 3: Real Land Records Fetched & Digital Kisan Pehchaan Patra */}
                  {aadhaarStep === 'result' && agriStackResult && (
                    <div className="space-y-4 animate-fade-in-up">
                      
                      <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-stone-900/90 to-emerald-950/80 border-2 border-emerald-500/60 shadow-xl shadow-emerald-500/5 space-y-3 text-white relative overflow-hidden">
                        
                        {/* Subtle shimmer */}
                        <div className="absolute inset-0 shimmer rounded-3xl" />
                        
                        <div className="relative">
                          <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">🇮🇳</span>
                              <div>
                                <h4 className="font-black text-xs uppercase tracking-wider text-emerald-300">
                                  {lang === 'hi' ? 'किसान पहचान पत्र (Kisan Pehchaan Patra)' : 'Digital Farmer Identity Card'}
                                </h4>
                                <p className="text-[10px] text-stone-400">{lang === 'hi' ? 'UIDAI ई-केवाईसी व एग्रीस्टैक द्वारा सत्यापित' : 'UIDAI e-KYC & AgriStack UPFR Verified'}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500 text-stone-950 flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>{lang === 'hi' ? 'सत्यापित कृषक' : 'Verified Cultivator'}</span>
                            </span>
                          </div>

                          {/* Farmer & Aadhaar Details */}
                          <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                            <div>
                              <span className="text-[10px] text-stone-500 block">{lang === 'hi' ? 'कृषक का नाम' : 'Farmer Name'}</span>
                              <b className="text-white text-sm">{agriStackResult.farmerProfile.kisanCardName}</b>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-500 block">{lang === 'hi' ? 'किसान आईडी' : 'Farmer ID'}</span>
                              <b className="font-mono text-emerald-300">{agriStackResult.farmerProfile.farmerId}</b>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-500 block">{lang === 'hi' ? 'ग्राम व तहसील' : 'Village & Tehsil'}</span>
                              <span>{agriStackResult.farmerProfile.village}, {agriStackResult.farmerProfile.tehsil}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-500 block">{lang === 'hi' ? 'कुल कृषि भूमि' : 'Total Farmland Area'}</span>
                              <b className="text-emerald-400 text-sm">{agriStackResult.farmerProfile.totalLandBigha} {lang === 'hi' ? 'बीघा' : 'Bigha'}</b>
                            </div>
                          </div>

                          {/* Auto-Fetched Linked Lands */}
                          <div className="pt-2 border-t border-emerald-900/50 space-y-1.5 mt-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                              <LandPlot className="w-3 h-3 text-emerald-400" />
                              <span>{lang === 'hi' ? `आधार से प्राप्त खेत (${agriStackResult.farmerProfile.linkedLands.length} प्लॉट):` : `Auto-Fetched Lands (${agriStackResult.farmerProfile.linkedLands.length} Plots):`}</span>
                            </span>
                            
                            <div className="space-y-1">
                              {agriStackResult.farmerProfile.linkedLands.map(l => (
                                <div key={l.id} className="p-2.5 rounded-xl bg-stone-950/60 border border-emerald-900/50 flex items-center justify-between text-xs hover:bg-stone-950/80 transition-all duration-200">
                                  <div>
                                    <span className="font-bold text-white block">{l.name}</span>
                                    <span className="text-[10px] text-stone-500">{lang === 'hi' ? `गाटा संख्या: #${l.khasraNumber} • ${l.soilType}` : `Gata / Khasra No: #${l.khasraNumber} • ${l.soilType}`}</span>
                                  </div>
                                  <span className="font-black text-emerald-400 text-xs">{l.bigha} {lang === 'hi' ? 'बीघा' : 'Bigha'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Confirm & Save Button */}
                      <button
                        type="button"
                        onClick={handleCompleteAgriStackRegistration}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] hover:translate-y-[-1px]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-stone-950" />
                        <span>{lang === 'hi' ? 'खेत सहेजें व बुकिंग शुरू करें' : 'Save Lands & Proceed to Booking'}</span>
                      </button>

                    </div>
                  )}

                </div>
              )}

              </div> {/* end relative inner */}
            </div>
          </div>

        </div>

      </main>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 text-center animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-[11px] text-stone-600">
          <span>{lang === 'hi' ? '© 2026 कृषि सेवा' : '© 2026 KrishiSeva'}</span>
          <span className="hidden sm:inline text-stone-800">•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-stone-700" />
            {lang === 'hi' ? '100% सत्यापित कृषि मशीनरी नेटवर्क' : '100% Verified Agricultural Heavy Fleet Network'}
          </span>
        </div>
      </footer>

      {/* ═══════════ GATEWAY CONFIGURATION MODAL ═══════════ */}
      {showGatewayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-200 space-y-6 my-8">
            <button
              onClick={() => setShowGatewayModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <span>{lang === 'hi' ? 'ओटीपी गेटवे कॉन्फ़िगरेशन' : 'OTP Gateway Configuration'}</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                {lang === 'hi'
                  ? 'अपना पर्सनल व्हाट्सएप या एसएमएस गेटवे सेट करें ताकि उपयोगकर्ताओं को आपकी आईडी से सीधा ओटीपी प्राप्त हो सके।'
                  : 'Configure your personal WhatsApp or SMS gateways to send real-time OTP notifications to your users.'}
              </p>
            </div>

            <form onSubmit={handleSaveGatewayConfig} className="space-y-6">
              {/* WhatsApp Gateway Section */}
              <div className="space-y-3 p-4 rounded-2xl bg-stone-950/40 border border-stone-800/60">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'व्हाट्सएप गेटवे (स्वचालन)' : 'WhatsApp Gateway (Auto-Send)'}</span>
                </h4>

                <div className="space-y-2">
                  <label className="block text-xs text-stone-400 font-medium">
                    {lang === 'hi' ? 'गेटवे प्रदाता' : 'Gateway Provider'}
                  </label>
                  <select
                    value={waProvider}
                    onChange={(e) => setWaProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="none">{lang === 'hi' ? 'कोई नहीं (सिर्फ सिमुलेशन / लोकल मॉक)' : 'None (Simulation / Local Mock)'}</option>
                    <option value="meta">Meta WhatsApp Cloud API (Official Business)</option>
                    <option value="twiliowa">Twilio WhatsApp API (Enterprise Broadcast)</option>
                    <option value="wati">Wati WhatsApp API (Official Partner)</option>
                    <option value="interakt">Interakt WhatsApp API (Official Partner)</option>
                    <option value="ultramsg">UltraMsg (Personal Number Scan QR)</option>
                    <option value="greenapi">Green-API (Personal Number Scan QR)</option>
                  </select>
                </div>

                {waProvider === 'meta' && (
                  <div className="space-y-3 pt-2 animate-fade-in">
                    <div className="space-y-2">
                      <label className="block text-xs text-stone-400">Phone Number ID</label>
                      <input
                        type="text"
                        value={waMetaPhoneId}
                        onChange={(e) => setWaMetaPhoneId(e.target.value)}
                        placeholder="e.g. 10928374829302"
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs text-stone-400">System User Access Token (Permanent)</label>
                      <input
                        type="password"
                        value={waMetaToken}
                        onChange={(e) => setWaMetaToken(e.target.value)}
                        placeholder="EAAGz..."
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs text-stone-400">Approved Template Name</label>
                      <input
                        type="text"
                        value={waMetaTemplate}
                        onChange={(e) => setWaMetaTemplate(e.target.value)}
                        placeholder="e.g. krishiseva_otp"
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/30 text-[11px] text-blue-300 leading-relaxed">
                      <strong>How to Setup Meta Cloud API:</strong>
                      <ol className="list-decimal pl-4 mt-1 space-y-1">
                        <li>Set up a Meta Developer App and add WhatsApp product.</li>
                        <li>Get your <strong>Phone Number ID</strong> and generate a permanent <strong>Access Token</strong> in Business Manager.</li>
                        <li>Register an approved utility OTP template with body: <em>"Your KrishiSeva verification code is {"{{1}}"}. Valid for 5 minutes. Do not share this code with anyone."</em></li>
                      </ol>
                    </div>
                  </div>
                )}

                {waProvider === 'twiliowa' && (
                  <div className="space-y-3 pt-2 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-stone-400 mb-1">Account SID</label>
                        <input
                          type="text"
                          value={waTwilioSid}
                          onChange={(e) => setWaTwilioSid(e.target.value)}
                          placeholder="AC..."
                          className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-400 mb-1">Auth Token</label>
                        <input
                          type="password"
                          value={waTwilioToken}
                          onChange={(e) => setWaTwilioToken(e.target.value)}
                          placeholder="Twilio Token"
                          className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Twilio WhatsApp Sender Number</label>
                      <input
                        type="text"
                        value={waTwilioFrom}
                        onChange={(e) => setWaTwilioFrom(e.target.value)}
                        placeholder="e.g. +14155238886 (or Sandbox number)"
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/30 text-[11px] text-blue-300 leading-relaxed">
                      <strong>How to Setup Twilio WhatsApp:</strong>
                      <ol className="list-decimal pl-4 mt-1 space-y-1">
                        <li>Enable WhatsApp in your Twilio Console.</li>
                        <li>Join the Twilio Sandbox or configure your own business number.</li>
                        <li>Copy paste your Twilio <strong>Account SID</strong>, <strong>Auth Token</strong>, and <strong>Sender Number</strong> here.</li>
                      </ol>
                    </div>
                  </div>
                )}

                {waProvider === 'wati' && (
                  <div className="space-y-3 pt-2 animate-fade-in">
                    <div className="space-y-2">
                      <label className="block text-xs text-stone-400">API Endpoint URL</label>
                      <input
                        type="url"
                        value={waWatiEndpoint}
                        onChange={(e) => setWaWatiEndpoint(e.target.value)}
                        placeholder="https://live-xxx.wati.io"
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs text-stone-400">Access Token / API Key</label>
                      <input
                        type="password"
                        value={waWatiToken}
                        onChange={(e) => setWaWatiToken(e.target.value)}
                        placeholder="Wati Auth Token"
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs text-stone-400">Approved Template Name</label>
                      <input
                        type="text"
                        value={waWatiTemplate}
                        onChange={(e) => setWaWatiTemplate(e.target.value)}
                        placeholder="e.g. krishiseva_otp"
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/30 text-[11px] text-blue-300 leading-relaxed">
                      <strong>How to Setup Wati API:</strong>
                      <ol className="list-decimal pl-4 mt-1 space-y-1">
                        <li>Go to Wati Dashboard &rarr; API Integration.</li>
                        <li>Copy your API Endpoint and Access Token and paste them here.</li>
                        <li>Submit your template name for approval in the Wati portal.</li>
                      </ol>
                    </div>
                  </div>
                )}

                {waProvider === 'interakt' && (
                  <div className="space-y-3 pt-2 animate-fade-in">
                    <div className="space-y-2">
                      <label className="block text-xs text-stone-400">Interakt Write API Key</label>
                      <input
                        type="password"
                        value={waInteraktKey}
                        onChange={(e) => setWaInteraktKey(e.target.value)}
                        placeholder="API Key"
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs text-stone-400">Approved Template Name</label>
                      <input
                        type="text"
                        value={waInteraktTemplate}
                        onChange={(e) => setWaInteraktTemplate(e.target.value)}
                        placeholder="e.g. krishiseva_otp"
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/30 text-[11px] text-blue-300 leading-relaxed">
                      <strong>How to Setup Interakt:</strong>
                      <ol className="list-decimal pl-4 mt-1 space-y-1">
                        <li>Login to Interakt and go to Settings &rarr; Developer API.</li>
                        <li>Copy the API Key and paste here.</li>
                        <li>Ensure your approved template name is matches.</li>
                      </ol>
                    </div>
                  </div>
                )}

                {waProvider === 'ultramsg' && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-stone-400 mb-1">Instance ID</label>
                        <input
                          type="text"
                          value={waUltramsgInstance}
                          onChange={(e) => setWaUltramsgInstance(e.target.value)}
                          placeholder="e.g. instance12345"
                          className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-400 mb-1">Token</label>
                        <input
                          type="password"
                          value={waUltramsgToken}
                          onChange={(e) => setWaUltramsgToken(e.target.value)}
                          placeholder="API Token"
                          className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/30 text-[11px] text-blue-300 leading-relaxed">
                      <strong>How to Setup UltraMsg:</strong>
                      <ol className="list-decimal pl-4 mt-1 space-y-1">
                        <li>Register a free account on <a href="https://ultramsg.com" target="_blank" rel="noreferrer" className="underline font-bold">ultramsg.com</a></li>
                        <li>Scan the QR code shown on their dashboard with your WhatsApp app (Linked Devices).</li>
                        <li>Copy and paste your <strong>Instance ID</strong> and <strong>Token</strong> here.</li>
                      </ol>
                    </div>
                  </div>
                )}

                {waProvider === 'greenapi' && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-stone-400 mb-1">idInstance</label>
                        <input
                          type="text"
                          value={waGreenapiInstance}
                          onChange={(e) => setWaGreenapiInstance(e.target.value)}
                          placeholder="e.g. 11018XXXXX"
                          className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-400 mb-1">apiTokenInstance</label>
                        <input
                          type="password"
                          value={waGreenapiToken}
                          onChange={(e) => setWaGreenapiToken(e.target.value)}
                          placeholder="Api Token Instance"
                          className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/30 text-[11px] text-blue-300 leading-relaxed">
                      <strong>How to Setup Green-API:</strong>
                      <ol className="list-decimal pl-4 mt-1 space-y-1">
                        <li>Register a free account on <a href="https://green-api.com" target="_blank" rel="noreferrer" className="underline font-bold">green-api.com</a></li>
                        <li>Create a free instance, then scan the QR code to link your WhatsApp.</li>
                        <li>Copy and paste your <strong>idInstance</strong> and <strong>apiTokenInstance</strong> here.</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              {/* SMS Gateway Section */}
              <div className="space-y-3 p-4 rounded-2xl bg-stone-950/40 border border-stone-800/60">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'एसएमएस गेटवे (मोबाईल नेटवर्क)' : 'SMS Gateway (Carrier Network)'}</span>
                </h4>

                <div className="space-y-2">
                  <label className="block text-xs text-stone-400 font-medium">
                    {lang === 'hi' ? 'एसएमएस प्रदाता' : 'SMS Provider'}
                  </label>
                  <select
                    value={smsProvider}
                    onChange={(e) => setSmsProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="none">{lang === 'hi' ? 'कोई नहीं (मुफ़्त टेक्स्टबेल्ट परीक्षण)' : 'None (Free Textbelt Fallback)'}</option>
                    <option value="fast2sms">Fast2SMS (OTP Route - India Only)</option>
                    <option value="twilio">Twilio SMS (Global)</option>
                  </select>
                </div>

                {smsProvider === 'fast2sms' && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Fast2SMS API Key</label>
                      <input
                        type="password"
                        value={fast2smsKey}
                        onChange={(e) => setFast2smsKey(e.target.value)}
                        placeholder="Paste your Fast2SMS Authorization Key"
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                {smsProvider === 'twilio' && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <label className="block text-xs text-stone-400">Account SID</label>
                      <input
                        type="text"
                        value={twilioSid}
                        onChange={(e) => setTwilioSid(e.target.value)}
                        placeholder="Twilio Account SID"
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-stone-400 mb-1">Auth Token</label>
                        <input
                          type="password"
                          value={twilioToken}
                          onChange={(e) => setTwilioToken(e.target.value)}
                          placeholder="Twilio Auth Token"
                          className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-400 mb-1">Sender Number</label>
                        <input
                          type="text"
                          value={twilioFrom}
                          onChange={(e) => setTwilioFrom(e.target.value)}
                          placeholder="e.g. +1234567890"
                          className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:border-emerald-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGatewayModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-800 hover:bg-stone-800 text-stone-400 hover:text-white text-xs font-bold transition-all duration-200"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-black shadow-lg shadow-emerald-500/10 transition-all duration-200"
                >
                  {lang === 'hi' ? 'सेटिंग्स सहेजें' : 'Save Configurations'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
