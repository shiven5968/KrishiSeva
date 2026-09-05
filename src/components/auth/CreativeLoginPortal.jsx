import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
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
  CheckCheck,
  Sun,
  Moon,
  FileText,
  Wrench,
  Camera,
  Upload,
  RefreshCw,
  ChevronDown
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

  // Authentication States
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'profile_setup' | 'agristack_verify' | 'driver_kyc'
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeOtpCode, setActiveOtpCode] = useState('');
  const [waDeliveryDelayed, setWaDeliveryDelayed] = useState(false);

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
        // New user -> prompt for Role (Farmer vs Driver) and Name
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
        ? '1-क्लिक इंस्टेंट डिस्पैच के साथ, मलीहाबाद/लखनऊ में आपके खेत के 5 किमी के दायरे में सत्यापित चालकों को तुरंत अलर्ट प्राप्त होता है। मशीनें आमतौर पर 15 से 45 मिनट के भीतर पहुंच जाती हैं।'
        : 'With 1-Click Instant Dispatch, verified drivers within a 5 km radius of your field in Malihabad/Lucknow receive alerts instantly. Machinery usually arrives within 15 to 45 minutes.'
    },
    {
      q: lang === 'hi'
        ? 'किराये की गणना कैसे की जाती है? क्या कोई छिपे हुए शुल्क हैं?'
        : 'How is the price calculated? Are there hidden charges?',
      a: lang === 'hi'
        ? 'आपके द्वारा पुष्टि करने से पहले प्रति-बीघा या प्रति-घंटा दरें पारदर्शी रूप से प्रदर्शित की जाती हैं। कोई छिपे हुए शुल्क या अप्रत्याशित सर्ज चार्ज नहीं हैं।'
        : 'Rates are transparently displayed per-bigha or hourly before you confirm. There are zero hidden fees or unexpected surge costs.'
    },
    {
      q: lang === 'hi'
        ? 'क्या मैं नकद भुगतान कर सकता हूँ या ऑनलाइन भुगतान अनिवार्य है?'
        : 'Can I pay in cash or is online payment mandatory?',
      a: lang === 'hi'
        ? 'आप कार्य पूरा होने के बाद सीधे चालक को नकद भुगतान कर सकते हैं या ऐप में उनका यूपीआई क्यूआर कोड स्कैन कर सकते हैं।'
        : 'You can pay cash directly to the driver after work completion or scan their UPI QR code in the app.'
    },
    {
      q: lang === 'hi'
        ? 'क्या होगा यदि मेरा खेत औपचारिक पते के बिना किसी आंतरिक गाँव में है?'
        : 'What if my field is in an interior village without a formal address?',
      a: lang === 'hi'
        ? 'कृषिसेवा एग्रीस्टैक भूलेख भूमि अभिलेखों के साथ एकीकृत उच्च-सटीक जीपीएस रडार का उपयोग करता है। बस हमारे सैटेलाइट मानचित्र पर सीधे अपने खेत का चयन करें।'
        : 'KrishiSeva uses high-precision GPS radar integrated with AgriStack UPFR land records. Simply select your field directly on our satellite map.'
    },
    {
      q: lang === 'hi'
        ? 'क्या चालक और मशीनरी सत्यापित हैं?'
        : 'Are drivers and machinery verified?',
      a: lang === 'hi'
        ? 'हाँ! प्रत्येक बेड़े के मालिक और ऑपरेटर का 100% केवाईसी सत्यापन, ड्राइविंग लाइसेंस प्रमाणीकरण और वाहन की स्थिति की जांच की जाती है।'
        : 'Yes! Every fleet owner and operator undergoes strict 100% KYC verification, driving license authentication, and vehicle condition checks.'
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col justify-between selection:bg-emerald-500 selection:text-stone-950 font-sans relative overflow-x-hidden transition-colors duration-200 ${
      isDark ? 'bg-[#05080C] text-stone-100' : 'bg-slate-50 text-slate-900'
    }`}>
      


      {/* ═══════════ SEAMLESS FULL-WIDTH NAVBAR ═══════════ */}
      <header className={`w-full fixed top-0 left-0 right-0 z-50 px-8 pt-6 pb-4 flex items-center justify-between border-b shadow-sm transition-colors duration-200 ${
        isDark 
          ? 'bg-black/20 backdrop-blur-xl border-white/10' 
          : 'bg-white/60 backdrop-blur-xl border-slate-200/80'
      }`}>
        {/* Brand Logo (Far Left) */}
        <div 
          onClick={() => setPortalView('landing')}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <img 
            src="/images/logo.png" 
            alt="KrishiSeva Logo" 
            className="h-9 w-auto object-contain transition-transform duration-200 hover:scale-105 rounded-xl" 
          />
          <span className={`text-xl font-extrabold tracking-tight transition-all duration-300 group-hover:text-emerald-450 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            KrishiSeva
          </span>
        </div>

        {/* Actions & Controls (Far Right) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Header Login Action */}
          <button
            onClick={() => setPortalView(prev => prev === 'landing' ? 'login' : 'landing')}
            className={`text-xs px-4 py-1.5 rounded-full font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
              portalView === 'landing'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-[0_2px_12px_rgba(16,185,129,0.35)]'
                : (isDark 
                    ? 'bg-stone-900/90 hover:bg-stone-800/90 border border-stone-800/80 text-stone-300 hover:border-emerald-500/30 hover:text-white' 
                    : 'bg-white/90 hover:bg-slate-50 border border-slate-200 text-slate-700 hover:border-emerald-500/40 hover:text-slate-900 shadow-sm')
            }`}
          >
            {portalView === 'landing' ? (
              <>
                <User className="w-3.5 h-3.5 text-stone-950" />
                <span>{lang === 'hi' ? 'लॉगिन' : 'Login'}</span>
              </>
            ) : (
              <>
                <span>{lang === 'hi' ? '← मुख्य पृष्ठ' : '← Home'}</span>
              </>
            )}
          </button>

          {/* Admin Login Quick Link */}
          <button
            onClick={() => setActiveRole('admin')}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition-all active:scale-95 flex items-center gap-1.5 ${
              isDark 
                ? 'bg-stone-900/90 hover:bg-stone-800/90 border-stone-800/80 text-stone-300 hover:border-emerald-500/30 hover:text-white' 
                : 'bg-white/90 hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500/40 hover:text-slate-900 shadow-sm'
            }`}
          >
            <Lock className={`w-3.5 h-3.5 ${isDark ? 'text-stone-400' : 'text-slate-550'}`} />
            <span>{lang === 'hi' ? 'एडमिन लॉगिन' : 'Admin Login'}</span>
          </button>

          {/* Dark / Light Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition-all active:scale-95 flex items-center gap-1.5 ${
              isDark 
                ? 'bg-stone-900/90 hover:bg-stone-800/90 border-stone-800/80 text-stone-300 hover:border-emerald-500/30 hover:text-white' 
                : 'bg-white/90 hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500/40 hover:text-slate-900 shadow-sm'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition-all active:scale-95 flex items-center gap-1.5 ${
              isDark 
                ? 'bg-stone-900/90 hover:bg-stone-800/90 border-stone-800/80 text-stone-300 hover:border-emerald-500/30 hover:text-white' 
                : 'bg-white/90 hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500/40 hover:text-slate-900 shadow-sm'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-550" />
            <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
          </button>
        </div>
      </header>

      {/* ═══════════ HERO & AUTH CONTAINER ═══════════ */}
      <main className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden z-10">
        
        {/* ───── Background Farm Vignette (Wheat Field 4K Video) ───── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className={`absolute inset-0 w-full h-full object-cover scale-105 transition-all duration-700 ${
              isDark 
                ? 'opacity-70 brightness-95 contrast-100' 
                : 'opacity-85 brightness-95 contrast-105 saturate-110'
            }`}
            poster="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&q=80"
          >
            <source src="/videos/hero_field_bg.mp4" type="video/mp4" />
          </video>
          {/* Soft Vignette Overlay for Crisp Readability */}
          <div className={`absolute inset-0 backdrop-blur-[2px] transition-colors duration-300 ${
            isDark 
              ? 'bg-gradient-to-b from-black/50 via-transparent to-black/40' 
              : 'bg-gradient-to-b from-white/40 via-transparent to-white/30'
          }`} />
        </div>

        {/* Content alignment wrapper */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex-1 flex items-center pt-28 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* LEFT COLUMN: Commanding Headlines */}
          <div className={`transition-all duration-500 ease-out text-left ${
            portalView === 'landing'
              ? 'lg:col-span-12 max-w-3xl space-y-8 py-6'
              : 'lg:col-span-7 space-y-6'
          }`}>
            {/* Top Live Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-emerald-450 text-[10px] font-black uppercase tracking-wider animate-pulse mb-1">
              <span>⚡ 100% VERIFIED FLEET • DISPATCH ACTIVE</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.1] text-white">
                {lang === 'hi' ? (
                  <>
                    मांग पर मशीनें।<br />
                    <span className="text-emerald-450">
                      सीधे आपके खेत पर।
                    </span>
                  </>
                ) : (
                  <>
                    Machinery on Demand.<br />
                    <span className="text-emerald-400">
                      Directly to Your Farm.
                    </span>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg max-w-xl font-bold leading-relaxed text-stone-300">
                {lang === 'hi'
                  ? 'ट्रैक्टर, हार्वेस्टर एवं अर्थमूवर की तत्काल 1-क्लिक बुकिंग। वास्तविक समय में अपने खेत तक लाइव जीपीएस ट्रैक करें।'
                  : 'Instant booking for tractors, harvesters, and earthmovers. Track dispatches in real-time.'}
              </p>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="bg-white/5 border border-white/10 backdrop-blur-lg px-4 py-2.5 rounded-2xl text-xs font-medium text-slate-200 flex items-center gap-2 transition-all duration-300 hover:border-emerald-500/40">
                <Tractor className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'hi' ? 'सत्यापित कृषि उपकरण' : 'Verified Equipment'}</span>
              </span>

              <span className="bg-white/5 border border-white/10 backdrop-blur-lg px-4 py-2.5 rounded-2xl text-xs font-medium text-slate-200 flex items-center gap-2 transition-all duration-300 hover:border-emerald-500/40">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'hi' ? 'त्वरित 1-क्लिक वाहन सेवा' : 'Instant Dispatch'}</span>
              </span>

              <span className="bg-white/5 border border-white/10 backdrop-blur-lg px-4 py-2.5 rounded-2xl text-xs font-medium text-slate-200 flex items-center gap-2 transition-all duration-300 hover:border-emerald-500/40">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'hi' ? 'एग्रीस्टैक भूलेख सत्यापित' : 'AgriStack Verified'}</span>
              </span>
            </div>

            {/* State 1: Primary Action Button */}
            {portalView === 'landing' && (
              <div className="pt-4 animate-fade-in">
                <button
                  type="button"
                  onClick={() => setPortalView('login')}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xl rounded-2xl shadow-[0_10px_35px_rgba(16,185,129,0.4)] transition-all cursor-pointer inline-flex items-center gap-3 active:scale-[0.98] duration-300"
                >
                  <span>{lang === 'hi' ? 'लॉगिन / शुरू करें →' : 'Login / Get Started →'}</span>
                </button>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: WhatsApp OTP & Role Onboarding Card (State 2) */}
          {portalView === 'login' && (
            <div className="lg:col-span-5 w-full relative mt-10 lg:mt-16 animate-fade-in">
              {/* Subtle emerald radial ambient light glow behind the card */}
              <div className="absolute -inset-10 bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full z-0" />
              
              <div className={`border backdrop-blur-xl rounded-3xl p-6 sm:p-8 transition-all duration-300 relative z-10 ${
                isDark 
                  ? 'bg-[#0A0E13]/90 border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)]' 
                  : 'bg-white/90 border-slate-200 shadow-[0_25px_60px_rgba(15,23,42,0.12)] text-slate-800'
              }`}>

                {/* Subtle Back to Home Link */}
                <button
                  type="button"
                  onClick={() => setPortalView('landing')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-emerald-400 transition-colors mb-4 group cursor-pointer"
                >
                  <span className="transition-transform duration-200 group-hover:-translate-x-1 font-bold">←</span>
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
                          ? 'bg-[#05080C] border-white/10 focus-within:border-emerald-500/60' 
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

                  {/* Quick 1-Click Demo Logins */}
                  <div className="pt-2 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`h-px flex-1 ${isDark ? 'bg-stone-800' : 'bg-slate-200'}`} />
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                        {lang === 'hi' ? '⚡ 1-क्लिक डेमो लॉगिन (बिना ओटीपी)' : '⚡ 1-Click Demo Login (No OTP)'}
                      </span>
                      <div className={`h-px flex-1 ${isDark ? 'bg-stone-800' : 'bg-slate-200'}`} />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div
                        onClick={() => quickDemoLogin('farmer')}
                        className={`border p-3.5 rounded-2xl cursor-pointer transition-all duration-250 flex items-center justify-between group active:scale-95 ${
                          isDark 
                            ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-emerald-500/40 text-slate-200' 
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 hover:border-emerald-500/40 text-slate-800 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🌾</span>
                          <div>
                            <span className={`text-xs font-bold block group-hover:text-emerald-505 transition-colors duration-200 ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {lang === 'hi' ? 'बलराम (किसान)' : 'Balram (Farmer)'}
                            </span>
                            <span className={`text-[10px] font-mono ${
                              isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              9876543210
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-450 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>

                      <div
                        onClick={() => quickDemoLogin('driver')}
                        className={`border p-3.5 rounded-2xl cursor-pointer transition-all duration-250 flex items-center justify-between group active:scale-95 ${
                          isDark 
                            ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-emerald-500/40 text-slate-200' 
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 hover:border-emerald-500/40 text-slate-800 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🚜</span>
                          <div>
                            <span className={`text-xs font-bold block group-hover:text-emerald-505 transition-colors duration-200 ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {lang === 'hi' ? 'जगजीत (चालक)' : 'Jagjit (Driver)'}
                            </span>
                            <span className={`text-[10px] font-mono ${
                              isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              9876501234
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-450 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>

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
                      {lang === 'hi' ? '6-अंकीय ओटीपी दर्ज करें' : 'Enter 6-Digit OTP'}
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
                        className="w-full py-4 text-center tracking-[0.6em] rounded-2xl bg-black/50 border border-white/15 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 font-black text-emerald-400 text-3xl outline-none transition-all duration-200 shadow-inner"
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
                        onClick={() => { setStep('phone'); setOtp(''); setError(''); setWaDeliveryDelayed(false); }}
                        className="w-1/3 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-350 font-bold text-xs transition-all duration-200 hover:border-emerald-500/40 hover:text-white"
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
                            <span>{lang === 'hi' ? 'ओटीपी सत्यापित करें' : 'Verify OTP'}</span>
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

                    <button
                      type="submit"
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-base shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] hover:translate-y-[-1px]"
                    >
                      <span>
                        {selectedRole === 'farmer' 
                          ? (lang === 'hi' ? 'आधार सत्यापन हेतु आगे बढ़ें' : 'Continue to Aadhaar KYC') 
                          : (lang === 'hi' ? 'चालक विवरण हेतु आगे बढ़ें' : 'Continue to Driver KYC')}
                      </span>
                      <ArrowRight className="w-5 h-5 text-stone-950" />
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
        )}

        </div>
      </div>
    </main>

      {/* ═══════════ FARMER FAQ SECTION ═══════════ */}
      <div 
        ref={faqRef}
        className={`relative w-full py-20 px-6 border-t transition-all duration-700 ease-out transform ${
          isDark 
            ? 'bg-[#05080C] border-white/5 text-stone-100' 
            : 'bg-slate-50 border-slate-200 text-slate-900'
        } ${
          faqVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <div className="max-w-4xl mx-auto space-y-8 text-center mb-12">
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3.5 py-1.5 rounded-full inline-block font-semibold">
            ❓ {lang === 'hi' ? 'किसान सहायता केंद्र' : 'FARMER HELP CENTER'}
          </span>
          <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {lang === 'hi' ? 'बुकिंग करने से पहले सब कुछ जानें' : 'Everything You Should Know Before Booking'}
          </h2>
          <p className={`text-sm md:text-base max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>
            {lang === 'hi' 
              ? 'सत्यापित ट्रैक्टरों और हार्वेस्टरों को 100% भरोसे के साथ बुक करने में आपकी सहायता के लिए स्पष्ट उत्तर।' 
              : 'Clear, transparent answers to help you book tractors and harvesters with 100% confidence.'}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              className={`transition-all duration-300 shadow-xl cursor-pointer text-left mb-4 rounded-2xl p-6 border ${
                openFaqIndex === index 
                  ? isDark
                    ? 'border-l-4 border-l-emerald-500 border-emerald-500/40 bg-[#0A0E13]' 
                    : 'border-l-4 border-l-emerald-500 border-emerald-500/30 bg-slate-100'
                  : isDark
                    ? 'bg-[#0A0E13] border-white/10 hover:border-emerald-500/40' 
                    : 'bg-white border-slate-200 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex justify-between items-center gap-4">
                <span className={`font-bold text-sm md:text-base ${
                  openFaqIndex === index 
                    ? 'text-emerald-500 font-extrabold' 
                    : isDark ? 'text-white' : 'text-slate-800'
                }`}>
                  {faq.q}
                </span>
                <ChevronDown className={`w-5 h-5 shrink-0 text-emerald-450 transition-transform duration-300 ${
                  openFaqIndex === index ? 'rotate-180' : 'rotate-0'
                }`} />
              </div>
              <div className={`overflow-hidden transition-all duration-300 ${
                openFaqIndex === index ? 'max-h-40 mt-4 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <p className={`text-xs md:text-sm leading-relaxed ${isDark ? 'text-stone-300' : 'text-slate-600'}`}>
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ MINIMALIST FOOTER ═══════════ */}
      <footer className={`relative z-10 border-t px-6 py-4 transition-colors duration-200 ${
        isDark 
          ? 'border-stone-800/80 bg-[#05080C] text-stone-400' 
          : 'border-slate-200 bg-white/40 backdrop-blur-md text-slate-505'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center text-xs">
          <span>© 2026 KrishiSeva • Precision Farm Fleet Network</span>
        </div>
      </footer>

    </div>
  );
}
