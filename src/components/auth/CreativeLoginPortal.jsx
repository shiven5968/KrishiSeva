import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { sendRealWhatsAppOtp } from '../../utils/smsGateway';
import { verifyAgriStackFarmer } from '../../services/bhulekhLandService';
import { audioHelper } from '../../utils/audioHelper';
import { 
  Phone,
  LogIn, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft, 
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
  CheckCheck,
  Sun,
  Moon,
  FileText,
  Wrench,
  Camera,
  Upload,
  RefreshCw,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export default function CreativeLoginPortal() {
  const { lang, toggleLanguage, localize } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const { 
    requestOtp,
    verifyOtp,
    completeNewUserRegistration,
    setActiveRole,
    quickDemoLogin
  } = useAuth();

  // Portal View State: State 1 (landing) vs State 2 (login)
  const [portalView, setPortalView] = useState('landing'); // 'landing' | 'login'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication States
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'profile_setup' | 'agristack_verify' | 'driver_kyc'
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Profile Setup States (Role chosen AFTER OTP verification)
  const [userName, setUserName] = useState('');
  const [selectedRole, setSelectedRole] = useState('farmer'); // 'farmer' | 'driver'

  // AgriStack & Aadhaar States (Farmer KYC)
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarStep, setAadhaarStep] = useState('input'); // 'input' | 'result'
  const [isVerifyingAgriStack, setIsVerifyingAgriStack] = useState(false);
  const [agriStackResult, setAgriStackResult] = useState(null);

  // Driver Essentials KYC States
  const [driverDlNumber, setDriverDlNumber] = useState('');
  const [driverVehicleType, setDriverVehicleType] = useState('tractor');
  const [driverModelName, setDriverModelName] = useState('');
  const [driverVehicleNumber, setDriverVehicleNumber] = useState('');
  const [driverImplement, setDriverImplement] = useState('');
  const [isSubmittingDriverKyc, setIsSubmittingDriverKyc] = useState(false);
  const [kycSubStep, setKycSubStep] = useState('details'); // 'details' | 'uploads'
  const [dlPhoto, setDlPhoto] = useState('');
  const [vehiclePhoto, setVehiclePhoto] = useState('');
  const [faceImage, setFaceImage] = useState('');
  const [faceAuthStatus, setFaceAuthStatus] = useState('idle'); // 'idle' | 'scanning' | 'success'
  const videoRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);

  // FAQ accordion and scroll-reveal states
  const faqRef = useRef(null);
  const [faqVisible, setFaqVisible] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFaqVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (faqRef.current) {
      observer.observe(faqRef.current);
    }
    return () => {
      if (faqRef.current) {
        observer.unobserve(faqRef.current);
      }
    };
  }, []);

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

  // Clean up camera stream when leaving uploads page or unmounting
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream, step, kycSubStep]);

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

    // 1. Generate 6-digit random OTP in AuthContext
    const otpResult = requestOtp(cleanPhone);
    if (!otpResult.success) {
      setIsSendingOtp(false);
      setError(otpResult.error);
      return;
    }

    const code = otpResult.code;
    setResendTimer(60);
    setStep('otp');
    setOtp('');

    setToastMessage(lang === 'hi' ? `व्हाट्सएप पर ओटीपी भेज दिया गया है (+91 ${cleanPhone})` : `OTP Sent via WhatsApp (+91 ${cleanPhone})`);
    setTimeout(() => setToastMessage(''), 6000);

    // 2. Send via UltraMsg WhatsApp API
    try {
      const waRes = await sendRealWhatsAppOtp(cleanPhone, code, lang);
      setIsSendingOtp(false);

    } catch (err) {
      setIsSendingOtp(false);
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
    setResendTimer(60);

    setToastMessage(lang === 'hi' ? `नया ओटीपी व्हाट्सएप पर भेज दिया गया है (+91 ${cleanPhone})` : `New OTP Sent via WhatsApp (+91 ${cleanPhone})`);
    setTimeout(() => setToastMessage(''), 6000);

    try {
      const waRes = await sendRealWhatsAppOtp(cleanPhone, code, lang);
      setIsSendingOtp(false);
    } catch (err) {
      setIsSendingOtp(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 2. Verify 4-Digit WhatsApp OTP Logic
  // ─────────────────────────────────────────────────────────────
  const handleVerifyOtp = (e) => {
    e?.preventDefault();
    if (!otp || otp.length < 4) {
      setError(lang === 'hi' ? 'कृपया पूरा 4-अंकीय ओटीपी दर्ज करें' : 'Please enter the full 4-digit OTP');
      return;
    }
    setError('');
    setIsVerifyingOtp(true);

    const result = verifyOtp(phone, otp);
    setIsVerifyingOtp(false);

    if (result.success) {
      if (result.isNewUser) {
        // New user -> prompt for Role (Farmer vs Driver)
        setStep('profile_setup');
      } else {
        // Returning user -> log straight into cockpit
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

  // Direct 1-Click Role Login for Fallback / Unknown phone numbers
  const handleDirectRoleLogin = (role) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    completeNewUserRegistration(role, {
      name: userName.trim() || (role === 'farmer' ? `Kisan ${cleanPhone.slice(-4)}` : `Driver ${cleanPhone.slice(-4)}`),
      phone: cleanPhone
    });
    setActiveRole(role);
  };

  // ─────────────────────────────────────────────────────────────
  // 3. User Profile & Role Decision: Farmer -> Aadhaar KYC, Driver -> Driver KYC
  // ─────────────────────────────────────────────────────────────
  const handleProceedFromProfile = (e) => {
    e?.preventDefault();
    if (!userName.trim()) {
      setError(lang === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें' : 'Please enter your full name');
      return;
    }
    setError('');

    if (selectedRole === 'driver') {
      // Proceed to Driver Essentials KYC
      setStep('driver_kyc');
      return;
    }

    // If farmer, proceed to Aadhaar e-KYC / AgriStack land sync
    setAadhaarStep('input');
    setStep('agristack_verify');
  };

  // ─────────────────────────────────────────────────────────────
  // 4A. Farmer: AgriStack Aadhaar Verification
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
        village: p.village || 'Gram Malihabad',
        tehsil: p.tehsil || 'Malihabad',
        isAgriStackVerified: true,
        farmerId: p.farmerId,
        linkedLands: p.linkedLands
      });
    } else {
      completeNewUserRegistration('farmer', {
        name: userName.trim(),
        phone,
        village: 'Gram Malihabad'
      });
    }
    setActiveRole('farmer');
    audioHelper.playBookingConfirmed();
  };

  const handleSkipAgriStack = () => {
    completeNewUserRegistration('farmer', {
      name: userName.trim(),
      phone,
      village: 'Gram Malihabad'
    });
    setActiveRole('farmer');
    audioHelper.playBookingConfirmed();
  };

  // ─────────────────────────────────────────────────────────────
  // 4B. Driver: Essentials KYC Registration Workflow
  // ─────────────────────────────────────────────────────────────
  const handleProceedToKycUploads = (e) => {
    e?.preventDefault();
    if (!driverDlNumber.trim()) {
      setError(lang === 'hi' ? 'कृपया ड्राइविंग लाइसेंस (DL) संख्या दर्ज करें' : 'Please enter Driving License (DL) Number');
      return;
    }
    if (!driverVehicleNumber.trim()) {
      setError(lang === 'hi' ? 'कृपया वाहन संख्या (RC) दर्ज करें' : 'Please enter Vehicle Number');
      return;
    }
    if (!driverModelName.trim()) {
      setError(lang === 'hi' ? 'कृपया मशीनरी मॉडल का नाम दर्ज करें' : 'Please enter Machinery Model Name');
      return;
    }
    setError('');
    setKycSubStep('uploads');
  };

  const handleCompleteDriverKyc = (e) => {
    e?.preventDefault();
    if (!dlPhoto) {
      setError(lang === 'hi' ? 'कृपया ड्राइविंग लाइसेंस (DL) फोटो अपलोड करें' : 'Please upload Driving License (DL) photo');
      return;
    }
    if (!vehiclePhoto) {
      setError(lang === 'hi' ? 'कृपया वाहन/मशीनरी का फोटो अपलोड करें' : 'Please upload Vehicle photo');
      return;
    }
    if (faceAuthStatus !== 'success') {
      setError(lang === 'hi' ? 'कृपया चेहरा प्रमाणीकरण (Face Authentication) पूर्ण करें' : 'Please complete Face Authentication');
      return;
    }
    setError('');
    setIsSubmittingDriverKyc(true);

    setTimeout(() => {
      setIsSubmittingDriverKyc(false);
      completeNewUserRegistration('driver', {
        name: userName.trim(),
        phone,
        dlNumber: driverDlNumber.trim(),
        vehicleType: driverVehicleType,
        modelName: driverModelName.trim(),
        vehicleNumber: driverVehicleNumber.trim(),
        implement: driverImplement,
        verificationStatus: 'verified',
        status: 'online',
        hourlyRate: 1000,
        acreRate: 1300,
        dlImage: dlPhoto,
        plateImage: vehiclePhoto,
        faceImage: faceImage
      });
      setActiveRole('driver');
      audioHelper.playBookingConfirmed();
    }, 1000);
  };

  const triggerFaceScan = async () => {
    setError('');
    setFaceAuthStatus('scanning');
    audioHelper.playOtpChime();

    try {
      // 1. Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 320, height: 320 } 
      });
      setCameraStream(stream);

      // 2. Bind stream to video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);

      // 3. Scan for 3.5 seconds, then capture frame
      setTimeout(() => {
        try {
          const video = videoRef.current;
          if (video && video.readyState >= 2) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 320;
            canvas.height = video.videoHeight || 320;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg');
              setFaceImage(dataUrl);
            }
          } else {
            // Fallback if video isn't ready
            setFaceImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80');
          }
        } catch (captureErr) {
          setFaceImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80');
        }

        // 4. Stop stream tracks
        stream.getTracks().forEach(track => track.stop());
        setCameraStream(null);

        // 5. Update status
        setFaceAuthStatus('success');
        audioHelper.playBookingConfirmed();
      }, 3500);

    } catch (err) {
      console.warn('Camera access failed, using simulated scan fallback', err);
      // Fallback: simulated biometric scan
      setTimeout(() => {
        setFaceAuthStatus('success');
        setFaceImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80');
        audioHelper.playBookingConfirmed();
      }, 3000);
    }
  };

  const faqs = [
    {
      q: lang === 'hi' 
        ? 'ट्रैक्टर या हार्वेस्टर मेरे खेत पर कितनी जल्दी पहुंचेगा?' 
        : 'How fast will the tractor or harvester reach my farm?',
      a: lang === 'hi'
        ? '1-क्लिक इंस्टेंट डिस्पैच के साथ, मलीहाबाद/लखनऊ क्षेत्र में आपके खेत से 5 किमी के दायरे में सभी उपलब्ध ऑपरेटरों को तुरंत अलर्ट भेजा जाता है। मशीनरी आमतौर पर 15 से 45 मिनट के भीतर पहुंच जाती है।'
        : 'With 1-Click Instant Dispatch, verified drivers within a 5 km radius of your field in Malihabad/Lucknow receive alerts instantly. Machinery usually arrives within 15 to 45 minutes.'
    },
    {
      q: lang === 'hi'
        ? 'किराया कैसे तय होता है? क्या कोई छिपा हुआ शुल्क है?'
        : 'How is the price calculated? Are there hidden charges?',
      a: lang === 'hi'
        ? 'सभी कीमतें पारदर्शी रूप से प्रति-बीघा या प्रति-घंटे पहले ही दिखाई जाती हैं। कोई छुपा हुआ शुल्क या अप्रत्याशित सर्ज प्राइसिंग नहीं है।'
        : 'Rates are transparently displayed per-bigha or hourly before you confirm. There are zero hidden fees or unexpected surge costs.'
    },
    {
      q: lang === 'hi'
        ? 'क्या मैं नकद भुगतान कर सकता हूँ या ऑनलाइन अनिवार्य है?'
        : 'Can I pay in cash or is online payment mandatory?',
      a: lang === 'hi'
        ? 'हाँ! आप कार्य पूर्ण होने के बाद सीधे ड्राइवर को नकद भुगतान कर सकते हैं या ऐप में उनके यूपीआई क्यूआर को स्कैन कर सकते हैं।'
        : 'You can pay cash directly to the driver after work completion or scan their UPI QR code in the app.'
    },
    {
      q: lang === 'hi'
        ? 'यदि मेरा खेत किसी गांव के आंतरिक क्षेत्र में है जिसका पता नहीं है?'
        : 'What if my field is in an interior village without a formal address?',
      a: lang === 'hi'
        ? 'कृषिसेवा एग्रीस्टैक भू-अभिलेख और उच्च-सटीक जीपीएस रडार से लैस है। बस अपने खेत का चयन सीधे हमारे सैटेलाइट मैप पर करें।'
        : 'KrishiSeva uses high-precision GPS radar integrated with AgriStack UPFR land records. Simply select your field directly on our satellite map.'
    },
    {
      q: lang === 'hi'
        ? 'क्या ड्राइवर और मशीनरी सत्यापित हैं?'
        : 'Are drivers and machinery verified?',
      a: lang === 'hi'
        ? 'बिल्कुल! प्रत्येक फ्लीट ओनर और ऑपरेटर का 100% बायोमेट्रिक सत्यापन, ड्राइविंग लाइसेंस प्रमाणीकरण और वाहन की स्थिति की जांच की जाती है।'
        : 'Yes! Every fleet owner and operator undergoes strict 100% KYC verification, driving license authentication, and vehicle condition checks.'
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col justify-between selection:bg-emerald-500 selection:text-stone-950 font-sans relative overflow-x-hidden transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#ECF5F0] text-slate-900'
    }`}>
      
      {/* ═══════════ SEAMLESS UNIFIED TOP NAVBAR ═══════════ */}
      <header className="w-full fixed top-0 left-0 right-0 z-50 bg-[#ECF5F0]/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between">
          {/* Brand Logo & Name (Sitting naturally on mint canvas without white box) */}
          <div 
            onClick={() => {
              setPortalView('landing');
              setIsMobileMenuOpen(false);
            }}
            className="shrink-0 flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
          >
            <img 
              src="/images/logo.png" 
              alt="KrishiSeva Logo" 
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105 rounded-xl shrink-0" 
            />
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display transition-colors group-hover:text-emerald-600 whitespace-nowrap">
              KrishiSeva
            </span>
          </div>

          {/* Actions & Controls (Desktop) */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveRole('admin')}
              className="text-xs px-3.5 py-1.5 rounded-full border bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm border-emerald-900/10 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'hi' ? 'एडमिन लॉगिन' : 'Admin Login'}</span>
            </button>

            {/* Dark / Light Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="text-xs px-3.5 py-1.5 rounded-full border bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm border-emerald-900/10 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Dark</span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="text-xs px-3.5 py-1.5 rounded-full border bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm border-emerald-900/10 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl border bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-emerald-900/10 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 shadow-sm transition-all active:scale-95 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Sheet */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-emerald-900/10 dark:border-slate-800 bg-[#ECF5F0]/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 py-3 space-y-2.5 animate-fade-in shadow-xl">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setActiveRole('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border bg-white/90 dark:bg-slate-900/90 border-emerald-900/10 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{lang === 'hi' ? 'एडमिन लॉगिन' : 'Admin Login'}</span>
                </span>
                <span className="text-emerald-600 font-bold">→</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="text-xs font-bold px-3 py-2 rounded-xl border bg-white/90 dark:bg-slate-900/90 border-emerald-900/10 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Dark</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    toggleLanguage();
                  }}
                  className="text-xs font-bold px-3 py-2 rounded-xl border bg-white/90 dark:bg-slate-900/90 border-emerald-900/10 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════ HERO & AUTH CONTAINER ═══════════ */}
      <main className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden z-10">
        
        {/* ───── Crisp MessMates Modern SaaS Background ───── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          {/* Top Emerald Radial Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]" />
          
          {/* Left & Right Soft Ambient Lighting Orbs */}
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/8 dark:bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/6 dark:bg-teal-500/8 rounded-full blur-[120px]" />
          
          {/* Subtle Modern Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 dark:opacity-40" />
        </div>

        
        {/* ═══════════ VIEW 1: LANDING PAGE HERO ═══════════ */}
        {portalView === 'landing' && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 py-12 pt-28 max-w-4xl mx-auto text-center animate-fade-in">
            {/* Top Live Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider animate-pulse mb-6 mx-auto shadow-xs">
              <span>⚡ 100% VERIFIED FLEET • DISPATCH ACTIVE</span>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white font-display">
                {lang === 'hi' ? (
                  <>
                    मांग पर मशीनें।<br />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      सीधे आपके खेत पर।
                    </span>
                  </>
                ) : (
                  <>
                    Machinery on Demand.<br />
                    <span className="text-emerald-500 dark:text-emerald-400">
                      Directly to Your Farm.
                    </span>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                {lang === 'hi'
                  ? 'ट्रैक्टर, हार्वेस्टर एवं अर्थमूवर की तत्काल 1-क्लिक बुकिंग। वास्तविक समय में अपने खेत तक लाइव जीपीएस ट्रैक करें।'
                  : 'Instant booking for tractors, harvesters and earthmovers. Track dispatches in real-time.'}
              </p>
            </div>

            {/* CTA Action Button */}
            <div className="pt-8 flex justify-center mx-auto">
              <button
                onClick={() => {
                  setPortalView('login');
                  setStep('phone');
                  setOtp('');
                  setError('');
                }}
                className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>{lang === 'hi' ? 'मशीनरी बुक करें / लॉगिन' : 'Book Machinery / Sign In'}</span>
                <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm sm:max-w-none mx-auto pt-8">
              <span className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all duration-300 hover:border-emerald-500/40">
                <Tractor className="w-4 h-4 text-emerald-500" />
                <span>{lang === 'hi' ? 'सत्यापित कृषि उपकरण' : 'Verified Equipment'}</span>
              </span>

              <span className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all duration-300 hover:border-emerald-500/40">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>{lang === 'hi' ? 'त्वरित 1-क्लिक वाहन सेवा' : 'Instant Dispatch'}</span>
              </span>

              <span className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all duration-300 hover:border-emerald-500/40">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'hi' ? 'एग्रीस्टैक भूलेख सत्यापित' : 'AgriStack Verified'}</span>
              </span>
            </div>
          </div>
        )}

        {/* ═══════════ VIEW 2: DEAD-CENTER AUTH VIEW ═══════════ */}
        {portalView === 'login' && (
          <div className="flex flex-col items-center justify-center min-h-[85vh] w-full px-4 py-12 pt-28 relative">
            
            {/* Radial Ambient Glow Behind Card */}
            <div className="w-[500px] h-[500px] bg-emerald-400/20 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />

            {/* Top Header Floating Badge */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-emerald-900/10 dark:border-slate-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-4 py-2 rounded-full shadow-sm mb-6 mx-auto inline-flex items-center gap-2">
              <span>🌾</span>
              <span>{lang === 'hi' ? 'कृषि सेवा • अखिल भारतीय सटीक कृषि मशीनरी नेटवर्क' : 'KrishiSeva • Pan-India Precision Farm Machinery Network'}</span>
            </div>

            <div className="max-w-md w-full relative animate-fade-in mx-auto">
              {/* Auth Card Elevation & Sizing */}
              <div className="max-w-md w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-emerald-900/10 dark:border-slate-800 p-8 rounded-3xl shadow-2xl shadow-emerald-900/10 dark:shadow-2xl text-slate-900 dark:text-white relative z-10 transition-all duration-300 mx-auto">

                {/* Back to Home Button Inside Card */}
                <button
                  type="button"
                  onClick={() => {
                    setPortalView('landing');
                    setStep('phone');
                    setOtp('');
                    setError('');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors mb-5 group cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
                  <span>{lang === 'hi' ? 'मुख्य पृष्ठ पर वापस' : 'Back to Home'}</span>
                </button>


              {/* STEP 1: Phone Number Input & Send WhatsApp OTP */}
              {step === 'phone' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {lang === 'hi' ? 'शुरू करें' : 'Get Started'}
                    </h3>
                    <p className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                      {lang === 'hi' ? 'व्हाट्सएप ओटीपी प्राप्त करने हेतु अपना मोबाइल नंबर दर्ज करें' : 'Enter your mobile number to receive your WhatsApp OTP'}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-2xl bg-red-950/85 border border-red-800/60 text-red-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendWhatsAppOtp} className="space-y-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                        isDark ? 'text-stone-400' : 'text-slate-650'
                      }`}>
                        {lang === 'hi' ? 'मोबाइल नंबर' : 'Enter Mobile Number'}
                      </label>
                      <div className={`border p-3.5 flex items-center gap-3 transition-all rounded-2xl ${
                        isDark 
                          ? 'bg-slate-950 border-white/10 focus-within:border-emerald-500/60' 
                          : 'bg-slate-50 border-slate-250 focus-within:border-emerald-500/60'
                      }`}>
                        <span className={`font-semibold text-xs flex items-center gap-1.5 pointer-events-none border-r pr-3 select-none ${
                          isDark ? 'text-slate-350 border-slate-700' : 'text-slate-500 border-slate-300'
                        }`}>
                          <span>IN</span>
                          <span>+91</span>
                        </span>
                        <input
                          type="tel"
                          maxLength="10"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9236581609"
                          className={`w-full bg-transparent focus:outline-none border-none p-0 focus:ring-0 ${
                            isDark ? 'text-white placeholder:text-slate-605' : 'text-slate-900 placeholder:text-slate-400'
                          }`}
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSendingOtp ? (
                        <>
                          <Clock className="w-5 h-5 animate-spin text-stone-950" />
                          <span>{lang === 'hi' ? 'व्हाट्सएप ओटीपी भेजा जा रहा है...' : 'Sending WhatsApp OTP...'}</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-5 h-5 text-stone-950" />
                          <span>{lang === 'hi' ? 'व्हाट्सएप द्वारा ओटीपी भेजें ->' : 'Send OTP via WhatsApp ->'}</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Minimal Security Text */}
                  <div className={`flex items-center justify-center gap-2 text-[10px] pt-1 ${
                    isDark ? 'text-stone-400' : 'text-slate-500'
                  }`}>
                    <Lock className="w-3 h-3 text-emerald-500" />
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
                    <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {lang === 'hi' ? '4-अंकीय ओटीपी दर्ज करें' : 'Enter 4-Digit OTP'}
                    </h3>
                    <p className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
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

                  
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      <span>{lang === 'hi' ? 'परीक्षण कोड: 1234 या 1111' : 'Test Code: 1234 or 1111'}</span>
                    </div>
                    <div>
                      <input
                        type="text"
                        maxLength="4"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full py-4 text-center tracking-[0.6em] rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 font-black text-emerald-400 text-3xl outline-none transition-all duration-200 shadow-inner"
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
                            ? 'text-stone-500 cursor-not-allowed' 
                            : 'text-emerald-400 hover:text-emerald-350 underline underline-offset-2'
                        }`}
                      >
                        {lang === 'hi' ? 'व्हाट्सएप पर पुनः भेजें' : 'Resend via WhatsApp'}
                      </button>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                        className="w-1/3 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:bg-white/10 text-slate-350 font-bold text-xs transition-all duration-200 hover:border-emerald-500/40 hover:text-white"
                      >
                        {lang === 'hi' ? 'नंबर बदलें' : 'Change Number'}
                      </button>

                      <button
                        type="submit"
                        disabled={isVerifyingOtp}
                        className="w-2/3 py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                      >
                        {isVerifyingOtp ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin text-stone-950" />
                            <span>{lang === 'hi' ? 'सत्यापित हो रहा है...' : 'Verifying...'}</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 text-stone-950" />
                            <span>{lang === 'hi' ? 'सत्यापित करें व लॉगिन करें' : 'Verify & Login'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 3: Profile Setup & Choose Role (Farmer vs Driver) */}
              {step === 'profile_setup' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1.5 text-center">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mb-2">
                      <Sparkles className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {lang === 'hi' ? 'अपनी भूमिका व नाम चुनें' : 'Choose Your Account Type'}
                    </h3>
                    <p className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
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
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                        isDark ? 'text-stone-300' : 'text-slate-700'
                      }`}>
                        {lang === 'hi' ? 'आपका पूरा नाम *' : 'Full Name *'}
                      </label>
                      <div className="relative">
                        <User className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder={lang === 'hi' ? 'उदा. रामेश्वर सिंह' : 'e.g. Rameshwar Singh'}
                          className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border font-bold text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all duration-200 ${
                            isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                          }`}
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                        isDark ? 'text-stone-300' : 'text-slate-700'
                      }`}>
                        {lang === 'hi' ? 'अपनी मुख्य भूमिका चुनें *' : 'Select Your Role *'}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedRole('farmer')}
                          className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2 ${
                            selectedRole === 'farmer'
                              ? 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-500/30'
                              : isDark ? 'border-stone-800 bg-stone-950/60 text-stone-400' : 'border-slate-200 bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Tractor className={`w-6 h-6 ${selectedRole === 'farmer' ? 'text-emerald-500' : 'text-stone-400'}`} />
                            {selectedRole === 'farmer' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          </div>
                          <div>
                            <span className={`font-black text-sm block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {lang === 'hi' ? 'किसान (Farmer)' : 'Farmer'}
                            </span>
                            <span className={`text-[11px] leading-tight block ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                              {lang === 'hi' ? 'खेत के लिए मशीन बुक करें' : 'Book Machinery'}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedRole('driver')}
                          className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2 ${
                            selectedRole === 'driver'
                              ? 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-500/30'
                              : isDark ? 'border-stone-800 bg-stone-950/60 text-stone-400' : 'border-slate-200 bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Truck className={`w-6 h-6 ${selectedRole === 'driver' ? 'text-emerald-500' : 'text-stone-400'}`} />
                            {selectedRole === 'driver' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          </div>
                          <div>
                            <span className={`font-black text-sm block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {lang === 'hi' ? 'चालक / फ्लीट मालिक' : 'Driver / Partner'}
                            </span>
                            <span className={`text-[11px] leading-tight block ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                              {lang === 'hi' ? 'मशीन जोड़ें व कमाई करें' : 'Earn Bookings'}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDirectRoleLogin('farmer')}
                        className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <span>🌾 {lang === 'hi' ? 'किसान लॉगिन' : 'Log in as Farmer'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDirectRoleLogin('driver')}
                        className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 border border-slate-700"
                      >
                        <span>🚜 {lang === 'hi' ? 'चालक लॉगिन' : 'Log in as Driver'}</span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <span>
                        {selectedRole === 'farmer' 
                          ? (lang === 'hi' ? 'पूरा प्रोफाइल व आधार KYC भरें →' : 'Complete Profile & Aadhaar KYC →') 
                          : (lang === 'hi' ? 'पूरा चालक विवरण भरें →' : 'Complete Driver KYC Profile →')}
                      </span>
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 4A: AgriStack Farmer Aadhaar Verification (If Farmer Selected) */}
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
                        <h3 className={`text-xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {lang === 'hi' ? 'आधार से अपने खेत लिंक करें' : 'Link Your Land with Aadhaar'}
                        </h3>
                        <p className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                          {lang === 'hi' 
                            ? 'सरकारी भूलेख पोर्टल से आपका खसरा व रकबा 1-क्लिक में लिंक हो जाएगा।' 
                            : 'Directly sync your land records and Khasra details from the registry.'}
                        </p>
                      </div>

                      {/* Demo Aadhaar Benchmark Profiles */}
                      <div className={`p-3 rounded-2xl border space-y-2 ${
                        isDark ? 'bg-stone-950 border-stone-800' : 'bg-slate-100 border-slate-200'
                      }`}>
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
                          <label className={`block text-xs font-bold uppercase tracking-wider ${
                            isDark ? 'text-stone-300' : 'text-slate-700'
                          }`}>
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
                              className={`w-full pl-12 pr-4 py-4 rounded-2xl border font-black tracking-widest text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 ${
                                isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                              }`}
                              autoFocus
                            />
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={handleSkipAgriStack}
                            className={`w-1/3 py-4 rounded-2xl border font-bold text-xs transition-all duration-200 ${
                              isDark ? 'border-stone-700 text-stone-400 hover:bg-stone-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                            }`}
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
                                <span>{lang === 'hi' ? 'सत्यापित करें व खेत लाएं' : 'Verify & Fetch Lands'}</span>
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
                                    <span className="font-bold text-white block">{localize(l.name)}</span>
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
                        <span>{lang === 'hi' ? 'सत्यापित खेतों के साथ कॉकपिट में प्रवेश करें' : 'Enter Farmer Cockpit'}</span>
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* STEP 4B: Driver Essentials KYC Onboarding - Step 1: Details */}
              {step === 'driver_kyc' && kycSubStep === 'details' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center space-y-1.5">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mb-2">
                      <Truck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-stone-900 text-emerald-300 border border-stone-800 text-[11px] font-bold">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Step 1 of 2: Fleet Information</span>
                    </div>
                    <h3 className={`text-xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {lang === 'hi' ? 'चालक व मशीन आवश्यक विवरण' : 'Driver & Machinery Essentials'}
                    </h3>
                    <p className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                      {lang === 'hi' 
                        ? 'अपना ड्राइविंग लाइसेंस व वाहन विवरण दर्ज कर फ्लीट नेटवर्क से तुरंत जुड़ें।' 
                        : 'Enter your DL and machinery details to start receiving nearby bookings.'}
                    </p>
                  </div>



                  {error && (
                    <div className="p-3.5 rounded-2xl bg-red-950/85 border border-red-700/60 text-red-200 text-xs font-bold flex items-start gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleProceedToKycUploads} className="space-y-3.5">
                    <div>
                      <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                        isDark ? 'text-stone-300' : 'text-slate-700'
                      }`}>
                        {lang === 'hi' ? 'ड्राइविंग लाइसेंस (DL) संख्या *' : 'Driving License (DL) Number *'}
                      </label>
                      <input
                        type="text"
                        value={driverDlNumber}
                        onChange={(e) => setDriverDlNumber(e.target.value)}
                        placeholder="UP32 20190088771"
                        className={`w-full px-4 py-3 rounded-xl border font-bold text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition ${
                          isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                        }`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                          isDark ? 'text-stone-300' : 'text-slate-700'
                        }`}>
                          {lang === 'hi' ? 'वाहन प्रकार *' : 'Vehicle Type *'}
                        </label>
                        <select
                          value={driverVehicleType}
                          onChange={(e) => setDriverVehicleType(e.target.value)}
                          className={`w-full px-3 py-3 rounded-xl border font-bold text-xs outline-none focus:border-emerald-500 ${
                            isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                          }`}
                        >
                          <option value="tractor">🚜 Tractor</option>
                          <option value="harvester">🌾 Harvester</option>
                          <option value="jcb">🏗️ Earthmover (JCB)</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                          isDark ? 'text-stone-300' : 'text-slate-700'
                        }`}>
                          {lang === 'hi' ? 'नंबर प्लेट (RC) *' : 'Vehicle Number *'}
                        </label>
                        <input
                          type="text"
                          value={driverVehicleNumber}
                          onChange={(e) => setDriverVehicleNumber(e.target.value)}
                          placeholder="UP-32-BT-9901"
                          className={`w-full px-3 py-3 rounded-xl border font-bold text-xs outline-none focus:border-emerald-500 ${
                            isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                          }`}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                        isDark ? 'text-stone-300' : 'text-slate-700'
                      }`}>
                        {lang === 'hi' ? 'मशीनरी मॉडल का नाम *' : 'Machinery Model Name *'}
                      </label>
                      <input
                        type="text"
                        value={driverModelName}
                        onChange={(e) => setDriverModelName(e.target.value)}
                        placeholder="Mahindra 575 DI (50 HP)"
                        className={`w-full px-4 py-3 rounded-xl border font-bold text-xs outline-none focus:border-emerald-500 ${
                          isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                        isDark ? 'text-stone-300' : 'text-slate-700'
                      }`}>
                        {lang === 'hi' ? 'संलग्न उपकरण (Implement)' : 'Equipped Attachment'}
                      </label>
                      <input
                        type="text"
                        value={driverImplement}
                        onChange={(e) => setDriverImplement(e.target.value)}
                        placeholder="Rotavator (6 Feet)"
                        className={`w-full px-4 py-3 rounded-xl border font-bold text-xs outline-none focus:border-emerald-500 ${
                          isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] hover:translate-y-[-1px] mt-2"
                    >
                      <span>{lang === 'hi' ? 'दस्तावेज़ और चेहरा सत्यापन पर जाएं' : 'Proceed to Document & Face Verification'}</span>
                      <ArrowRight className="w-4 h-4 text-stone-950" />
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 4B: Driver Essentials KYC Onboarding - Step 2: Uploads & Face Auth */}
              {step === 'driver_kyc' && kycSubStep === 'uploads' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center space-y-1.5">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mb-2">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-stone-900 text-emerald-300 border border-stone-800 text-[11px] font-bold">
                      <Camera className="w-3 h-3 text-emerald-400" />
                      <span>Step 2 of 2: Biometrics & Documents</span>
                    </div>
                    <h3 className={`text-xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {lang === 'hi' ? 'दस्तावेज़ व चेहरा सत्यापन' : 'Biometrics & KYC Uploads'}
                    </h3>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-2xl bg-red-950/85 border border-red-700/60 text-red-200 text-xs font-bold flex items-start gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Photo upload: Driving License */}
                    <div className="space-y-1.5">
                      <span className={`block text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-stone-300' : 'text-slate-700'}`}>
                        {lang === 'hi' ? 'ड्राइविंग लाइसेंस (DL) फोटो *' : 'Driving License Photo *'}
                      </span>
                      {dlPhoto ? (
                        <div className="relative border border-emerald-500/30 rounded-2xl overflow-hidden bg-black/60 p-2 flex items-center justify-between gap-3 animate-fade-in">
                          <img src={dlPhoto} className="w-16 h-12 object-cover rounded-xl border border-stone-800" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold block truncate">DL_{driverDlNumber}.jpg</span>
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">✓ Ready</span>
                          </div>
                          <button 
                            onClick={() => setDlPhoto('')}
                            className="px-2.5 py-1.5 text-[10px] font-bold bg-stone-900 hover:bg-stone-850 rounded-lg text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDlPhoto('https://images.unsplash.com/photo-1554774853-719586f82d77?w=300&q=80')}
                          className={`w-full p-4 border-2 border-dashed rounded-2xl text-center flex flex-col items-center justify-center gap-1 transition ${
                            isDark ? 'border-stone-800 bg-stone-900/50 hover:border-emerald-500/50' : 'border-slate-300 bg-slate-50 hover:border-emerald-500/50'
                          }`}
                        >
                          <Upload className="w-5 h-5 text-stone-400" />
                          <span className="text-xs font-bold">{lang === 'hi' ? 'डीएल फोटो अपलोड करें' : 'Upload DL Card Photo'}</span>
                          <span className="text-[9px] text-stone-500">Max size 5MB • Click to simulate upload</span>
                        </button>
                      )}
                    </div>

                    {/* Photo upload: Vehicle */}
                    <div className="space-y-1.5">
                      <span className={`block text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-stone-300' : 'text-slate-700'}`}>
                        {lang === 'hi' ? 'वाहन / मशीनरी फोटो *' : 'Vehicle / Machinery Photo *'}
                      </span>
                      {vehiclePhoto ? (
                        <div className="relative border border-emerald-500/30 rounded-2xl overflow-hidden bg-black/60 p-2 flex items-center justify-between gap-3 animate-fade-in">
                          <img src={vehiclePhoto} className="w-16 h-12 object-cover rounded-xl border border-stone-800" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold block truncate">RC_{driverVehicleNumber}.jpg</span>
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">✓ Ready</span>
                          </div>
                          <button 
                            onClick={() => setVehiclePhoto('')}
                            className="px-2.5 py-1.5 text-[10px] font-bold bg-stone-900 hover:bg-stone-850 rounded-lg text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setVehiclePhoto('https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=300&q=80')}
                          className={`w-full p-4 border-2 border-dashed rounded-2xl text-center flex flex-col items-center justify-center gap-1 transition ${
                            isDark ? 'border-stone-800 bg-stone-900/50 hover:border-emerald-500/50' : 'border-slate-300 bg-slate-50 hover:border-emerald-500/50'
                          }`}
                        >
                          <Tractor className="w-5 h-5 text-stone-400" />
                          <span className="text-xs font-bold">{lang === 'hi' ? 'वाहन फोटो अपलोड करें' : 'Upload Vehicle Photo'}</span>
                          <span className="text-[9px] text-stone-500">Max size 5MB • Click to simulate upload</span>
                        </button>
                      )}
                    </div>

                    {/* Biometric Face Authentication Container */}
                    <div className={`p-4 rounded-2xl border ${
                      isDark ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className={`block text-[11px] font-bold uppercase tracking-wider mb-2.5 text-center ${
                        isDark ? 'text-stone-300' : 'text-slate-700'
                      }`}>
                        🛡️ {lang === 'hi' ? 'सुरक्षित बायोमेट्रिक चेहरा सत्यापन' : 'Secure Biometric Face Authentication'}
                      </span>

                      <div className="flex flex-col items-center justify-center space-y-3">
                        {/* Circular guide scanner */}
                        <div className="w-28 h-28 rounded-full border-4 border-dashed border-emerald-500/30 relative overflow-hidden flex items-center justify-center bg-black/60 group shadow-inner">
                          {faceAuthStatus === 'idle' && (
                            <User className="w-12 h-12 text-stone-600 group-hover:scale-110 transition duration-300" />
                          )}

                          {faceAuthStatus === 'scanning' && (
                            <div className="w-full h-full relative overflow-hidden rounded-full">
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover scale-x-[-1]"
                              />
                              <div className="absolute left-0 right-0 h-0.5 bg-emerald-450 shadow-[0_0_10px_rgba(16,185,129,0.9)] animate-[bounce_2s_infinite]" />
                            </div>
                          )}

                          {faceAuthStatus === 'success' && faceImage && (
                            <img src={faceImage} className="w-full h-full object-cover animate-fade-in" />
                          )}
                        </div>

                        {/* Status Label */}
                        <div className="text-center">
                          {faceAuthStatus === 'idle' && (
                            <span className="text-[11px] font-bold text-stone-500">Ready to scan face / चेहरा स्कैन के लिए तैयार</span>
                          )}
                          {faceAuthStatus === 'scanning' && (
                            <span className="text-[11px] font-bold text-amber-400 animate-pulse">Scanning biometric coordinates... (Blink your eyes)</span>
                          )}
                          {faceAuthStatus === 'success' && (
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 justify-center">
                              <CheckCheck className="w-4 h-4" /> Face Authenticated Successfully!
                            </span>
                          )}
                        </div>

                        {/* Trigger button */}
                        {faceAuthStatus !== 'success' && (
                          <button
                            type="button"
                            disabled={faceAuthStatus === 'scanning'}
                            onClick={triggerFaceScan}
                            className="px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-emerald-500/40 text-emerald-400 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>{faceAuthStatus === 'scanning' ? 'Scanning...' : (lang === 'hi' ? 'स्कैन शुरू करें' : 'Start Biometric Scan')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleCompleteDriverKyc} className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setKycSubStep('details')}
                        className={`flex-1 py-3.5 rounded-2xl font-black text-xs transition border ${
                          isDark ? 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-850' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {lang === 'hi' ? '← पीछे जाएँ' : '← Back'}
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmittingDriverKyc}
                        className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-xs shadow-xl shadow-emerald-500/20 transition duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                      >
                        {isSubmittingDriverKyc ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin text-stone-950" />
                            <span>{lang === 'hi' ? 'सत्यापित हो रहा है...' : 'Verifying KYC...'}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-stone-950" />
                            <span>{lang === 'hi' ? 'रजिस्ट्रेशन पूर्ण करें व प्रवेश करें' : 'Complete Registration & Enter'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>

            {/* Bottom Trust Metrics Bar (Below Card) */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-emerald-900/10 dark:border-slate-800 shadow-sm">
              <span className="flex items-center gap-1.5">
                <span>⚡</span>
                <span>{lang === 'hi' ? '15 मिनट त्वरित वाहन सेवा' : '15-Min Instant Dispatch'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span>🛡️</span>
                <span>{lang === 'hi' ? '100% एग्रीस्टैक सत्यापित' : '100% AgriStack Verified'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span>📍</span>
                <span>{lang === 'hi' ? '28 राज्यों में पारदर्शी मूल्य' : '28 States Dynamic Pricing'}</span>
              </span>
            </div>

          </div>
        )}
      </main>

      {/* ═══════════ FARMER FAQ SECTION (Landing View Only) ═══════════ */}
      <section 
          className="relative w-full py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300"
        >
          <div className="max-w-4xl mx-auto space-y-4 text-center mb-12">
            <span className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'hi' ? 'अक्सर पूछे जाने वाले सवाल' : 'Frequently Asked Questions'}</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              {lang === 'hi' ? 'बुकिंग करने से पहले सब कुछ जानें' : 'Everything You Should Know Before Booking'}
            </h2>
            <p className="text-sm sm:text-base max-w-2xl mx-auto text-slate-600 dark:text-slate-400">
              {lang === 'hi' 
                ? 'सत्यापित ट्रैक्टरों और हार्वेस्टरों को 100% भरोसे के साथ बुक करने में आपकी सहायता के लिए स्पष्ट उत्तर।' 
                : 'Clear, transparent answers to help you book tractors and harvesters with 100% confidence.'}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className={`rounded-2xl border transition-all duration-200 cursor-pointer p-5 sm:p-6 shadow-sm ${
                    isOpen 
                      ? 'bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500 border-emerald-500/40 shadow-md' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-center gap-4">
                    <span className={`font-bold text-sm sm:text-base ${
                      isOpen ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-900 dark:text-white'
                    }`}>
                      {faq.q}
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen 
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rotate-180' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  
                  {isOpen && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 animate-fade-in">
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      {/* ═══════════ MINIMALIST FOOTER ═══════════ */}
      <footer className={`relative z-10 border-t px-6 py-4 transition-colors duration-200 ${
        isDark 
          ? 'border-stone-800/80 bg-slate-950 text-stone-400' 
          : 'border-slate-200 bg-white/40 backdrop-blur-md text-slate-505'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center text-xs">
          <span>© 2026 KrishiSeva • Precision Farm Fleet Network</span>
        </div>
      </footer>

    </div>
  );
}
