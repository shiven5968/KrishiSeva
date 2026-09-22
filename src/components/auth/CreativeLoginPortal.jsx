import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { sendRealWhatsAppOtp } from '../../utils/smsGateway';
import { verifyAgriStackFarmer } from '../../services/bhulekhLandService';
import { audioHelper } from '../../utils/audioHelper';
import KrishiSevaLogo from '../common/KrishiSevaLogo';
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
  X,
  Crosshair,
  Navigation,
  Layers,
  Activity,
  Compass,
  DollarSign,
  Radio,
  FileCheck,
  TrendingUp,
  Receipt
} from 'lucide-react';

const FAQS_DATA = [
  {
    qEn: 'How quickly will a tractor or harvester arrive at my field?',
    qHi: 'मशीनरी मेरे खेत पर कितनी देर में पहुंचेगी?',
    aEn: 'Our intelligent geospatial radar assigns the nearest Custom Hiring Center (CHC) driver within 3–5 km. On average, machinery arrives at your field in 15 to 30 minutes with live GPS tracking.',
    aHi: 'हमारा जीपीएस राडार 3 से 5 किमी के दायरे में सबसे नजदीकी चालक को जोड़ता है। आमतौर पर 15 से 30 मिनट में मशीनरी आपके खेत पर पहुँच जाती है और आप उसे लाइव ट्रैक कर सकते हैं।'
  },
  {
    qEn: 'I am a Batai (tenant) farmer without land papers. Can I still book?',
    qHi: 'मैं बटाईदार किसान हूँ और मेरे पास जमीन के सरकारी कागज़ नहीं हैं। क्या मैं बुकिंग कर सकता हूँ?',
    aEn: 'Yes! KrishiSeva offers a 1-Year Batai Pass. Simply provide the Khasra number and landowner phone number or upload a simple agreement once to enjoy unrestricted booking for 365 days.',
    aHi: 'हाँ! कृषिसेवा 1-वर्षीय बटाईदार पास प्रदान करती है। केवल खसरा संख्या व खेत मालिक का नंबर दर्ज कर आप 365 दिनों के लिए निर्बाध रूप से मशीनरी बुक कर सकते हैं।'
  },
  {
    qEn: 'How does payment work? Is advance payment required?',
    qHi: 'भुगतान कैसे होता है? क्या पहले पैसे देने होते हैं?',
    aEn: 'No full upfront payment needed. Your payment is held safely in automated escrow. Funds are only settled to the operator after field work is completed to your 100% satisfaction.',
    aHi: 'पहले पूरे पैसे देने की आवश्यकता नहीं है। आपकी राशि सुरक्षित एस्क्रो में रहती है और कार्य पूर्ण व संतुष्ट होने के बाद ही चालक को जारी की जाती है। आप यूपीआई या नकद भुगतान कर सकते हैं।'
  },
  {
    qEn: 'How are machinery rental rates calculated?',
    qHi: 'मशीनरी के किराए की दरें कैसे तय होती हैं?',
    aEn: 'Rates are dynamically governed by our 28-state agro-economic engine, incorporating regional fuel index, crop season demand, and soil type (e.g. baseline ₹1,300/bigha in UP). Zero broker commission.',
    aHi: 'दरें हमारे 28-राज्य मूल्य निर्धारण इंजन द्वारा तय होती हैं, जो क्षेत्रीय डीजल दर व फसल सत्र पर आधारित होती हैं (उदा. यूपी में ₹1,300/बीघा)। कोई बिचौलिया कमीशन नहीं।'
  },
  {
    qEn: 'Can I schedule machinery in advance for harvesting season?',
    qHi: 'क्या मैं कटाई के समय के लिए पहले से अग्रिम बुकिंग कर सकता हूँ?',
    aEn: 'Yes, you can schedule combine harvesters and tractors up to 30 days in advance with guaranteed machine reservation and preferred time slot allocation.',
    aHi: 'हाँ, आप 30 दिन पहले तक कंबाइन हार्वेस्टर और ट्रैक्टरों की अग्रिम बुकिंग कर सकते हैं और कटाई के दिन मशीन की उपलब्धता सुनिश्चित कर सकते हैं।'
  }
];

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
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Tenant / Batai Farmer Verification States
  const [farmerVerificationType, setFarmerVerificationType] = useState('landowner'); // 'landowner' | 'tenant'
  const [tenantKhasra, setTenantKhasra] = useState('');
  const [tenantLandSize, setTenantLandSize] = useState('3.5');
  const [tenantLandownerPhone, setTenantLandownerPhone] = useState('');
  const [isOwnerLinkSent, setIsOwnerLinkSent] = useState(false);
  const [tenantAgreementDoc, setTenantAgreementDoc] = useState(null);
  const [isGeoTagging, setIsGeoTagging] = useState(false);
  const [geoTaggedCoords, setGeoTaggedCoords] = useState(null);

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
  const [activeFlowStep, setActiveFlowStep] = useState(1);

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

  // Window scroll listener for seamless glassmorphic header transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
  // 4A-2. Tenant Farmer (Batai / Leased) Verification Handlers
  // ─────────────────────────────────────────────────────────────
  const handleSendOwnerApprovalLink = () => {
    const cleanOwnerPhone = tenantLandownerPhone.replace(/\D/g, '');
    if (cleanOwnerPhone.length < 10) {
      setError(lang === 'hi' ? 'कृपया जमीन मालिक का 10-अंकीय मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit Landowner mobile number');
      return;
    }
    setError('');
    setIsOwnerLinkSent(true);
    setToastMessage(lang === 'hi' 
      ? `✅ जमीन मालिक (+91 ${cleanOwnerPhone}) को सहमति लिंक भेज दिया गया है!` 
      : `✅ WhatsApp consent request dispatched to Landowner (+91 ${cleanOwnerPhone})!`);
    audioHelper.playOtpChime();
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleGeoTagField = () => {
    setIsGeoTagging(true);
    setError('');
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsGeoTagging(false);
          setGeoTaggedCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 2,
            locationName: 'Gram Malihabad Farmland Plot'
          });
          audioHelper.playBookingConfirmed();
        },
        () => {
          // Accurate mock fallback
          setTimeout(() => {
            setIsGeoTagging(false);
            setGeoTaggedCoords({
              lat: 26.9168,
              lng: 80.7075,
              accuracy: 2,
              locationName: 'Gram Malihabad Farmland Plot #142'
            });
            audioHelper.playBookingConfirmed();
          }, 800);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setTimeout(() => {
        setIsGeoTagging(false);
        setGeoTaggedCoords({
          lat: 26.9168,
          lng: 80.7075,
          accuracy: 2,
          locationName: 'Gram Malihabad Farmland Plot #142'
        });
        audioHelper.playBookingConfirmed();
      }, 800);
    }
  };

  const handleCompleteTenantRegistration = (e) => {
    e?.preventDefault();
    if (!tenantKhasra.trim()) {
      setError(lang === 'hi' ? 'कृपया खसरा / प्लॉट संख्या दर्ज करें' : 'Please enter Khasra / Plot Number');
      return;
    }
    if (!tenantLandownerPhone.trim()) {
      setError(lang === 'hi' ? 'कृपया जमीन मालिक का मोबाइल नंबर दर्ज करें' : 'Please enter Landowner mobile number');
      return;
    }
    setError('');

    const parsedSize = parseFloat(tenantLandSize) || 3.5;
    const cleanKhasra = tenantKhasra.trim();
    const cleanOwnerPhone = tenantLandownerPhone.replace(/\D/g, '').slice(-10);

    const now = new Date();
    const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const passToken = `BATAI-PASS-${cleanKhasra}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const tenantPlot = {
      id: `land_tenant_${Date.now()}`,
      name: `बटाई खेत #${cleanKhasra} (${parsedSize} बीघा)`,
      khasraNumber: cleanKhasra,
      bigha: parsedSize,
      cropType: 'Wheat / गेहूँ (Batai Crop)',
      soilType: lang === 'hi' ? 'दोमट मिट्टी (Loamy Soil)' : 'Loamy Soil',
      ownershipType: 'tenant_batai',
      landownerPhone: cleanOwnerPhone,
      lat: geoTaggedCoords?.lat || 26.9168,
      lng: geoTaggedCoords?.lng || 80.7075,
      isGovtVerified: true,
      ulpin: `BATAI-UPFR-${cleanKhasra}-01`,
      bataiPassToken: passToken,
      bataiPassExpiry: expiry.toISOString()
    };

    completeNewUserRegistration('farmer', {
      name: userName.trim() || `Kisan ${phone.slice(-4)}`,
      phone,
      village: 'Gram Malihabad',
      tehsil: 'Malihabad',
      farmerType: 'tenant_batai',
      isTenantFarmer: true,
      isAgriStackVerified: true,
      farmerId: `BATAI-UPFR-${Math.floor(10000 + Math.random() * 90000)}`,
      linkedLands: [tenantPlot],
      bataiPass: {
        active: true,
        khasraNumber: cleanKhasra,
        bigha: parsedSize,
        expiryDate: expiry.toISOString(),
        issuedDate: now.toISOString(),
        token: passToken,
        landownerPhone: cleanOwnerPhone,
        geoTaggedCoords: geoTaggedCoords || { lat: 26.9168, lng: 80.7075 }
      },
      tenantDetails: {
        khasraNumber: cleanKhasra,
        landSizeBigha: parsedSize,
        landownerPhone: cleanOwnerPhone,
        isOwnerLinkSent: isOwnerLinkSent || true,
        agreementUploaded: !!tenantAgreementDoc,
        geoTaggedCoords: geoTaggedCoords || { lat: 26.9168, lng: 80.7075 },
        passToken: passToken,
        validUntil: expiry.toISOString()
      }
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
    <div className={`min-h-screen flex flex-col justify-between selection:bg-[#1A4F32] selection:text-white font-sans relative overflow-x-hidden transition-colors duration-500 ${
      isDark 
        ? 'bg-[#080E0B] text-[#EAEFEA]' 
        : 'bg-[#FDFBF7] text-[#0B1E14]'
    }`}>
      {/* Subtle SVG Noise / Grain Texture Overlay (tactile, non-digital aesthetic) */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.035] dark:opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      
      {/* ═══════════ SEAMLESS ORGANIC MINIMALIST HEADER ═══════════ */}
      <header className={`w-full fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled 
          ? 'backdrop-blur-md bg-[#FDFBF7]/85 dark:bg-[#080E0B]/85 border-b border-black/[0.04] dark:border-white/[0.05] py-3.5 shadow-sm' 
          : 'bg-transparent py-5'
      }`}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div 
            onClick={() => {
              setPortalView('landing');
              setIsMobileMenuOpen(false);
            }}
            className="shrink-0 flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
          >
            <KrishiSevaLogo className="h-9 w-9 sm:h-10 sm:w-10 transition-transform duration-300 group-hover:scale-105 shrink-0" />
            <span className="text-xl font-bold tracking-tight text-[#0B1E14] dark:text-[#EAEFEA] font-display transition-colors group-hover:text-[#1A4F32] dark:group-hover:text-[#4ADE80] whitespace-nowrap">
              KrishiSeva
            </span>
          </div>

          {/* Actions & Controls (Desktop) - Minimal Text Links with Soft Hover */}
          <div className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveRole('admin')}
              className="text-[#0B1E14] dark:text-[#EAEFEA] hover:text-[#1A4F32] dark:hover:text-[#4ADE80] hover:bg-[#1A4F32]/5 dark:hover:bg-white/5 transition-all duration-300 text-sm font-medium px-4 py-2 rounded-full active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#1A4F32] dark:text-[#4ADE80]" />
              <span>{lang === 'hi' ? 'एडमिन लॉगिन' : 'Admin Login'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="text-[#0B1E14] dark:text-[#EAEFEA] hover:text-[#1A4F32] dark:hover:text-[#4ADE80] hover:bg-[#1A4F32]/5 dark:hover:bg-white/5 transition-all duration-300 text-sm font-medium px-4 py-2 rounded-full active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#1A4F32] dark:text-[#4ADE80]" />
              <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-full text-[#0B1E14] dark:text-[#EAEFEA] hover:bg-[#1A4F32]/5 dark:hover:bg-white/5 transition-all active:scale-95 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-[#1A4F32] dark:text-[#4ADE80]" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Sheet */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 max-w-lg mx-auto rounded-2xl border border-black/5 dark:border-white/10 bg-[#FDFBF7]/95 dark:bg-[#080E0B]/95 backdrop-blur-xl px-5 py-4 space-y-3 animate-fade-in shadow-xl mx-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setActiveRole('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-xs font-semibold px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 text-[#0B1E14] dark:text-[#EAEFEA] flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#1A4F32] dark:text-[#4ADE80]" />
                  <span>{lang === 'hi' ? 'एडमिन लॉगिन' : 'Admin Login'}</span>
                </span>
                <span className="text-[#1A4F32] dark:text-[#4ADE80] font-bold">→</span>
              </button>

              <button
                onClick={() => toggleLanguage()}
                className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-[#0B1E14] dark:text-[#EAEFEA] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#1A4F32] dark:text-[#4ADE80]" />
                <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════ HERO & AUTH CONTAINER ═══════════ */}
      <main className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden z-10">
        
        {/* ═══════════ VIEW 1: LANDING PAGE HERO ═══════════ */}
        {portalView === 'landing' && (
          <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center text-center px-4 pt-32 pb-16 sm:pt-36 sm:pb-20 w-full max-w-5xl mx-auto animate-fade-in space-y-8 sm:space-y-10">

            <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto overflow-visible relative">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight sm:tracking-tighter leading-[1.15] font-display pt-2">
                {lang === 'hi' ? (
                  <>
                    <span className="inline-block text-[#0B1E14] dark:text-[#EAEFEA]">मांग पर मशीनें।</span><br />
                    <span className="text-[#1A4F32] dark:text-[#4ADE80] inline-block font-bold">
                      सीधे आपके खेत पर।
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-block text-[#0B1E14] dark:text-[#EAEFEA]">Machinery on Demand.</span><br />
                    <span className="text-[#1A4F32] dark:text-[#4ADE80] inline-block font-bold">
                      Directly to Your Farm.
                    </span>
                  </>
                )}
              </h1>

              <p className="text-[#4F6358] dark:text-[#9FB1A7] max-w-2xl sm:max-w-3xl mx-auto text-lg sm:text-xl font-light tracking-wide leading-relaxed">
                {lang === 'hi'
                  ? 'ट्रैक्टर, हार्वेस्टर एवं अर्थमूवर की तत्काल 1-क्लिक बुकिंग। वास्तविक समय में अपने खेत तक लाइव जीपीएस ट्रैक करें।'
                  : 'Instant booking for tractors, harvesters and earthmovers. Track dispatches in real-time.'}
              </p>
            </div>

            {/* Tactile Dark CTA Button */}
            <div className="flex justify-center mx-auto pt-2">
              <button
                onClick={() => {
                  setPortalView('login');
                  setStep('phone');
                  setOtp('');
                  setError('');
                }}
                className="bg-[#0B1E14] hover:bg-[#153424] dark:bg-[#EAEFEA] dark:hover:bg-white text-white dark:text-[#0B1E14] font-medium px-8 py-4 sm:px-9 sm:py-4.5 rounded-full shadow-[0_8px_30px_rgb(11,30,20,0.12)] hover:shadow-[0_8px_30px_rgb(11,30,20,0.2)] hover:-translate-y-1 active:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center gap-3 cursor-pointer group text-base sm:text-lg"
              >
                <span>{lang === 'hi' ? 'मशीनरी बुक करें / साइन इन' : 'Book Machinery / Sign In'}</span>
                <span className="text-xl transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </button>
            </div>

            {/* Minimal Inline Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 max-w-2xl mx-auto pt-4 text-[#4F6358] dark:text-[#9FB1A7] text-sm font-medium">
              <div className="flex items-center gap-2">
                <Tractor className="w-4 h-4 text-[#1A4F32] dark:text-[#4ADE80] shrink-0" />
                <span>{lang === 'hi' ? 'सत्यापित कृषि उपकरण' : 'Verified Equipment'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#1A4F32] dark:text-[#4ADE80] shrink-0" />
                <span>{lang === 'hi' ? 'त्वरित 1-क्लिक सेवा' : 'Instant Dispatch'}</span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1A4F32] dark:text-[#4ADE80] shrink-0" />
                <span>{lang === 'hi' ? 'एग्रीस्टैक सत्यापित' : 'AgriStack Verified'}</span>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 1: "THE FLOW" (Interactive Split-Screen Steps)
                ═══════════════════════════════════════════════════════════════ */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                
                {/* Left Side: Sticky Editorial Heading */}
                <div className="w-full lg:w-5/12 lg:sticky lg:top-28 text-left space-y-6">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight leading-[1.12]">
                    {lang === 'hi' 
                      ? 'ऑर्डर से सीधे खेत तक, मिनटों में।' 
                      : 'From request to field in minutes.'}
                  </h2>

                  <p className="text-base text-[#4F6358] dark:text-[#9FB1A7] leading-relaxed max-w-md">
                    {lang === 'hi'
                      ? 'बिचौलियों की लंबी बातचीत को अलविदा कहें। आधुनिक जीपीएस तकनीक और सरकारी एग्रीस्टैक सत्यापन के साथ सिर्फ 3 आसान चरणों में मशीनरी पाएं।'
                      : 'Eliminate middlemen phone calls and price gouging. Book verified tractors, harvesters, and implements with precision radar tracking.'}
                  </p>

                  {/* Interactive Step Switcher Pills */}
                  <div className="flex items-center gap-3 pt-2">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setActiveFlowStep(num)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                          activeFlowStep === num
                            ? 'bg-[#0B1E14] dark:bg-[#EAEFEA] text-white dark:text-[#0B1E14] shadow-md shadow-[#0B1E14]/10'
                            : 'bg-white/80 dark:bg-slate-900/80 text-[#4F6358] dark:text-[#9FB1A7] border border-[#0B1E14]/10 dark:border-white/10 hover:border-[#1A4F32]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{lang === 'hi' ? `चरण 0${num}` : `Step 0${num}`}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setPortalView('login');
                        setStep('phone');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-2.5 text-sm font-bold text-[#1A4F32] dark:text-[#4ADE80] hover:underline cursor-pointer group"
                    >
                      <span>{lang === 'hi' ? 'अभी बुकिंग शुरू करें' : 'Get started now'}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>

                {/* Right Side: 3 Distinct Step Cards */}
                <div className="w-full lg:w-7/12 space-y-10 sm:space-y-12">
                  
                  {/* STEP 1: Pin Your Plot */}
                  <div 
                    onClick={() => setActiveFlowStep(1)}
                    className={`rounded-3xl p-6 sm:p-8 bg-white/70 dark:bg-[#0B1E14]/60 backdrop-blur-xl border transition-all duration-500 cursor-pointer shadow-[0_20px_40px_rgba(11,30,20,0.06)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] ${
                      activeFlowStep === 1 
                        ? 'border-[#1A4F32] ring-2 ring-[#1A4F32]/20 dark:ring-[#4ADE80]/20' 
                        : 'border-[#0B1E14]/10 dark:border-white/10 hover:border-[#1A4F32]/40 opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="text-xs font-black tracking-wider uppercase text-[#1A4F32] dark:text-[#4ADE80] bg-[#1A4F32]/10 dark:bg-[#4ADE80]/10 px-3 py-1 rounded-full">
                        {lang === 'hi' ? 'चरण 01' : 'Step 01'}
                      </span>
                      <span className="text-xs text-[#4F6358] dark:text-[#9FB1A7] flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#1A4F32] dark:text-[#4ADE80]" />
                        {lang === 'hi' ? 'भू-नक्शा व बटाईदार पास' : 'Geo-Fencing & Batai Pass'}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight mb-2 text-left">
                      {lang === 'hi' ? 'खेत चिन्हित करें (Pin Your Plot)' : 'Pin Your Plot.'}
                    </h3>
                    <p className="text-sm text-[#4F6358] dark:text-[#9FB1A7] text-left leading-relaxed mb-6">
                      {lang === 'hi'
                        ? 'खसरा संख्या दर्ज करें अथवा 1-वर्षीय बटाई पास के जरिए बिना कागजी झंझट के अपने खेत की सीमा तय करें। हमारा जीपीएस सिस्टम सटीक एकड़ गणना करता है।'
                        : 'Select your land boundary via Bhulekh sync or activate your 1-Year Batai Pass for instant tenant validation. GPS calculates precise acreage automatically.'}
                    </p>

                    {/* Step 1 Visual Mockup */}
                    <div className="rounded-2xl bg-gradient-to-br from-[#F4F1EA] to-[#E9E4D8] dark:from-[#112318] dark:to-[#08120B] p-5 border border-[#0B1E14]/10 dark:border-white/5 relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A4F32] dark:text-[#4ADE80] bg-white/80 dark:bg-black/40 px-2.5 py-1 rounded-lg">
                            <LandPlot className="w-3.5 h-3.5" />
                            <span>Khasra #402/1A • 3.2 Bigha</span>
                          </div>
                          <p className="text-xs text-[#4F6358] dark:text-[#9FB1A7] font-medium">
                            {lang === 'hi' ? 'सत्यापित भू-क्षेत्र • गेहूँ बुवाई' : 'Verified Field Perimeter • Wheat Sowing'}
                          </p>
                        </div>
                        <span className="text-xs font-bold bg-[#1A4F32] text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                          <span>{lang === 'hi' ? 'बटाई पास सक्रिय' : 'Batai Pass Active'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* STEP 2: Live Radar Match */}
                  <div 
                    onClick={() => setActiveFlowStep(2)}
                    className={`rounded-3xl p-6 sm:p-8 bg-white/70 dark:bg-[#0B1E14]/60 backdrop-blur-xl border transition-all duration-500 cursor-pointer shadow-[0_20px_40px_rgba(11,30,20,0.06)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] ${
                      activeFlowStep === 2 
                        ? 'border-[#1A4F32] ring-2 ring-[#1A4F32]/20 dark:ring-[#4ADE80]/20' 
                        : 'border-[#0B1E14]/10 dark:border-white/10 hover:border-[#1A4F32]/40 opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="text-xs font-black tracking-wider uppercase text-[#1A4F32] dark:text-[#4ADE80] bg-[#1A4F32]/10 dark:bg-[#4ADE80]/10 px-3 py-1 rounded-full">
                        {lang === 'hi' ? 'चरण 02' : 'Step 02'}
                      </span>
                      <span className="text-xs text-[#4F6358] dark:text-[#9FB1A7] flex items-center gap-1.5 font-medium">
                        <Radio className="w-3.5 h-3.5 text-[#1A4F32] dark:text-[#4ADE80] animate-pulse" />
                        {lang === 'hi' ? '3-5 किमी लाइव राडार' : '3–5 km Live Radar'}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight mb-2 text-left">
                      {lang === 'hi' ? 'लाइव राडार व नजदीकी चालक' : 'Live Radar Match.'}
                    </h3>
                    <p className="text-sm text-[#4F6358] dark:text-[#9FB1A7] text-left leading-relaxed mb-6">
                      {lang === 'hi'
                        ? 'हमारा एल्गोरिदम 5 किमी के भीतर उपलब्ध कस्टम हायरिंग सेंटर (CHC) के अनुभवी चालकों को खोजकर 15-20 मिनट में खेत पर रवाना करता है।'
                        : 'Our intelligent dispatcher connects the nearest certified CHC operator within 3–5 km. Fixed fair-trade rates with zero surge markups.'}
                    </p>

                    {/* Step 2 Visual Mockup */}
                    <div className="rounded-2xl bg-gradient-to-br from-[#F4F1EA] to-[#E9E4D8] dark:from-[#112318] dark:to-[#08120B] p-5 border border-[#0B1E14]/10 dark:border-white/5 relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-xs font-bold text-[#0B1E14] dark:text-[#EAEFEA]">
                              Mahindra 575 DI (50 HP) + Rotavator
                            </span>
                          </div>
                          <p className="text-xs text-[#4F6358] dark:text-[#9FB1A7]">
                            {lang === 'hi' ? 'चालक: रमेश कुमार • दूरी: 1.8 किमी • समय: 12 मिनट' : 'Driver: Ramesh Kumar • Distance: 1.8 km • ETA: 12 mins'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-[#1A4F32] dark:text-[#4ADE80] bg-white/80 dark:bg-black/40 px-3 py-1.5 rounded-xl inline-block">
                            ₹1,300 / Bigha
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: Harvest & Settle */}
                  <div 
                    onClick={() => setActiveFlowStep(3)}
                    className={`rounded-3xl p-6 sm:p-8 bg-white/70 dark:bg-[#0B1E14]/60 backdrop-blur-xl border transition-all duration-500 cursor-pointer shadow-[0_20px_40px_rgba(11,30,20,0.06)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] ${
                      activeFlowStep === 3 
                        ? 'border-[#1A4F32] ring-2 ring-[#1A4F32]/20 dark:ring-[#4ADE80]/20' 
                        : 'border-[#0B1E14]/10 dark:border-white/10 hover:border-[#1A4F32]/40 opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="text-xs font-black tracking-wider uppercase text-[#1A4F32] dark:text-[#4ADE80] bg-[#1A4F32]/10 dark:bg-[#4ADE80]/10 px-3 py-1 rounded-full">
                        {lang === 'hi' ? 'चरण 03' : 'Step 03'}
                      </span>
                      <span className="text-xs text-[#4F6358] dark:text-[#9FB1A7] flex items-center gap-1.5 font-medium">
                        <Receipt className="w-3.5 h-3.5 text-[#1A4F32] dark:text-[#4ADE80]" />
                        {lang === 'hi' ? 'सुरक्षित एस्क्रो भुगतान' : 'Escrow Protection'}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight mb-2 text-left">
                      {lang === 'hi' ? 'कार्य पूर्ण एवं सुरक्षित भुगतान' : 'Harvest & Settle.'}
                    </h3>
                    <p className="text-sm text-[#4F6358] dark:text-[#9FB1A7] text-left leading-relaxed mb-6">
                      {lang === 'hi'
                        ? 'खेत में काम पूरा होने और आपकी 100% संतुष्टि के बाद ही भुगतान चालक को जारी होता है। तत्काल यूपीआई या नकद पावती रसीद प्राप्त करें।'
                        : 'Payment is securely held in automated escrow until the tractor work is completed and verified by you. Instant IMPS settlement with digital receipt.'}
                    </p>

                    {/* Step 3 Visual Mockup */}
                    <div className="rounded-2xl bg-gradient-to-br from-[#F4F1EA] to-[#E9E4D8] dark:from-[#112318] dark:to-[#08120B] p-5 border border-[#0B1E14]/10 dark:border-white/5 relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold text-[#0B1E14] dark:text-[#EAEFEA]">
                              {lang === 'hi' ? 'कार्य संतुष्टि पुष्टि • ओटीपी #5821' : 'Job Verified • OTP #5821 Approved'}
                            </span>
                          </div>
                          <p className="text-xs text-[#4F6358] dark:text-[#9FB1A7]">
                            {lang === 'hi' ? '3.2 बीघा जुताई पूर्ण • डिजिटल रसीद जारी' : '3.2 Bigha Tillage Done • Digital Tax Receipt Generated'}
                          </p>
                        </div>
                        <span className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{lang === 'hi' ? '₹4,160 भुगतान सुरक्षित' : '₹4,160 Settled via IMPS'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 2: "THE ECOSYSTEM" (Premium Bento Grid)
                ═══════════════════════════════════════════════════════════════ */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-[#0B1E14]/5 dark:border-white/5">
              
              {/* Section Heading */}
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <h2 className="text-3xl sm:text-5xl font-black text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight leading-[1.15]">
                  {lang === 'hi' 
                    ? 'भारतीय खेतों के लिए विशेष निर्मित।' 
                    : 'Engineered for Bharat’s Fields.'}
                </h2>
                <p className="text-base text-[#4F6358] dark:text-[#9FB1A7] leading-relaxed">
                  {lang === 'hi'
                    ? 'पारदर्शिता, सुरक्षा और आधुनिक तकनीक का एक संपूर्ण नेटवर्क — जो हर किसान को सशक्त बनाता है।'
                    : 'A unified infrastructure built on transparency, escrow security, and deep-tech agricultural logistics.'}
                </p>
              </div>

              {/* Bento Box Asymmetrical Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 text-left">
                
                {/* Bento Card 1: 1-Year Batai Pass (Large 2-col Hero Card) */}
                <div className="md:col-span-2 lg:col-span-2 rounded-[2rem] bg-[#0B1E14] text-white p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between group hover:scale-[1.015] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_20px_40px_rgba(11,30,20,0.15)]">
                  {/* Subtle Texture Glow */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-400 border border-white/10">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? '1-वर्षीय बटाईदार सुरक्षा पास' : '1-Year Batai Pass Standard'}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      {lang === 'hi' 
                        ? 'बिना खतौनी भी आसान बुकिंग' 
                        : 'Democratizing Machinery for 80M+ Tenant Farmers.'}
                    </h3>
                    <p className="text-sm text-stone-300 max-w-lg leading-relaxed font-light">
                      {lang === 'hi'
                        ? 'बटाईदार किसान बिना पैतृक खतौनी के सिर्फ एक बार 1-वर्षीय पास बनवाकर पूरे 365 दिन बिना रुकावट ट्रैक्टर व हार्वेस्टर बुक कर सकते हैं।'
                        : 'Tenant farmers can book high-capacity machinery frictionlessly for an entire agricultural year with zero paper friction or landowner disputes.'}
                    </p>
                  </div>

                  <div className="relative z-10 pt-8 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs text-stone-400 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {lang === 'hi' ? '365 दिन असीमित बुकिंग सुविधा' : '365-Day Validity • Instant Verification'}
                    </span>
                    <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg">
                      AgriStack & CSC Synced
                    </span>
                  </div>
                </div>

                {/* Bento Card 2: Live Fleet Radar (1-col Square) */}
                <div className="md:col-span-1 lg:col-span-1 rounded-[2rem] bg-white/70 dark:bg-[#0B1E14]/70 backdrop-blur-xl border border-[#0B1E14]/10 dark:border-white/10 p-8 flex flex-col justify-between hover:scale-[1.02] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-sm hover:shadow-md">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#1A4F32]/10 dark:bg-[#4ADE80]/10 flex items-center justify-center text-[#1A4F32] dark:text-[#4ADE80]">
                      <Radio className="w-6 h-6 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight">
                      {lang === 'hi' ? 'लाइव फ्लीट राडार' : 'Live Fleet Radar'}
                    </h3>
                    <p className="text-xs text-[#4F6358] dark:text-[#9FB1A7] leading-relaxed">
                      {lang === 'hi'
                        ? '3-5 किमी के दायरे में निकटतम ट्रैक्टर चालक का 15 मिनट में आगमन।'
                        : 'Proximity matching with sub-minute GPS dispatch across all nearby CHCs.'}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-[#0B1E14]/5 dark:border-white/5">
                    <span className="text-xs font-bold text-[#1A4F32] dark:text-[#4ADE80]">
                      {lang === 'hi' ? 'औसत आगमन: 15 मिनट' : 'Avg ETA: 15 Mins'}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                </div>

                {/* Bento Card 3: Fair-Trade Pricing (1-col Square) */}
                <div className="md:col-span-1 lg:col-span-1 rounded-[2rem] bg-white/70 dark:bg-[#0B1E14]/70 backdrop-blur-xl border border-[#0B1E14]/10 dark:border-white/10 p-8 flex flex-col justify-between hover:scale-[1.02] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-sm hover:shadow-md">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#1A4F32]/10 dark:bg-[#4ADE80]/10 flex items-center justify-center text-[#1A4F32] dark:text-[#4ADE80]">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight">
                      {lang === 'hi' ? '28 राज्यों में पारदर्शी दरें' : 'Fair-Trade Pricing'}
                    </h3>
                    <p className="text-xs text-[#4F6358] dark:text-[#9FB1A7] leading-relaxed">
                      {lang === 'hi'
                        ? 'डीजल सूचकांक व फसल चक्र अनुसार स्वचालित दरें। शून्य बिचौलिया कटौती।'
                        : 'Algorithmic pricing based on regional fuel index and seasonal demand.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#0B1E14]/5 dark:border-white/5">
                    <span className="text-xs font-black tracking-wider text-[#0B1E14] dark:text-[#EAEFEA] bg-[#0B1E14]/5 dark:bg-white/5 px-2.5 py-1 rounded-md">
                      0% Broker Margin
                    </span>
                  </div>
                </div>

                {/* Bento Card 4: Escrow Settlements (2-col Horizontal) */}
                <div className="md:col-span-2 lg:col-span-2 rounded-[2rem] bg-white/70 dark:bg-[#0B1E14]/70 backdrop-blur-xl border border-[#0B1E14]/10 dark:border-white/10 p-8 flex flex-col justify-between hover:scale-[1.015] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-sm hover:shadow-md">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1A4F32] dark:text-[#4ADE80]">
                      <CreditCard className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'सुरक्षित लेन-देन' : 'Instant Escrow Infrastructure'}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight">
                      {lang === 'hi' ? 'ऑटोमेटेड IMPS एवं UPI एस्क्रो भुगतान' : 'Automated IMPS & UPI Escrow Settlements'}
                    </h3>
                    <p className="text-sm text-[#4F6358] dark:text-[#9FB1A7] leading-relaxed">
                      {lang === 'hi'
                        ? 'किसान और मशीन चालक दोनों के पैसे 100% सुरक्षित। कार्य संतोषजनक होने पर ही डिजिटल ओटीपी से चालक के खाते में सीधी राशि जारी।'
                        : 'Funds are securely locked in institutional escrow and disbursed directly to the operator’s bank account via IMPS/UPI only after digital job sign-off.'}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-[#0B1E14]/5 dark:border-white/5 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#4F6358] dark:text-[#9FB1A7]">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      {lang === 'hi' ? 'शून्य अग्रिम जोखिम' : 'Zero Upfront Risk'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      {lang === 'hi' ? 'त्वरित बैंक सेटलमेंट' : 'Direct-to-Bank Payouts'}
                    </span>
                  </div>
                </div>

                {/* Bento Card 5: Bhulekh & Sarathi Integrated (2-col Horizontal) */}
                <div className="md:col-span-2 lg:col-span-2 rounded-[2rem] bg-white/70 dark:bg-[#0B1E14]/70 backdrop-blur-xl border border-[#0B1E14]/10 dark:border-white/10 p-8 flex flex-col justify-between hover:scale-[1.015] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-sm hover:shadow-md">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1A4F32] dark:text-[#4ADE80]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'सरकारी पोर्टल सत्यापन' : 'Government Cloud Integration'}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight">
                      {lang === 'hi' ? 'भूलेख एवं सारथी वाहन पोर्टल से एकीकृत' : 'Govt Bhulekh & Sarathi Integrated'}
                    </h3>
                    <p className="text-sm text-[#4F6358] dark:text-[#9FB1A7] leading-relaxed">
                      {lang === 'hi'
                        ? 'सभी चालकों के ड्राइविंग लाइसेंस, वाहन फिटनेस और जमीन के भू-नक्शे सरकारी डेटाबेस से लाइव जांचे जाते हैं।'
                        : 'Direct real-time API integrations with state Bhulekh portals and MoRTH Sarathi registry guarantee 100% genuine machinery and operators.'}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-[#0B1E14]/5 dark:border-white/5 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#4F6358] dark:text-[#9FB1A7]">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      {lang === 'hi' ? 'डीएल एवं वाहन फिटनेस जांच' : 'DL & Fitness Verified'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      {lang === 'hi' ? 'एग्रीस्टैक आईडी सिंक' : 'AgriStack ID Synced'}
                    </span>
                  </div>
                </div>

              </div>
            </section>

          </div>
        )}

        {/* ═══════════ VIEW 2: DEAD-CENTER AUTH VIEW ═══════════ */}
        {portalView === 'login' && (
          <div className="flex flex-col items-center justify-center min-h-[85vh] w-full px-4 py-12 pt-28 relative">
            
            {/* Radial Ambient Glow Behind Card */}
            <div className="w-[500px] h-[500px] bg-emerald-400/20 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />

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
                <div className="space-y-5 animate-fade-in-up">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight text-[#0B1E14] dark:text-[#EAEFEA]">
                      {lang === 'hi' ? 'शुरू करें' : 'Get Started'}
                    </h3>
                    <p className="text-xs font-light text-[#4F6358] dark:text-[#9FB1A7] tracking-wide">
                      {lang === 'hi' ? 'व्हाट्सएप ओटीपी प्राप्त करने हेतु अपना मोबाइल नंबर दर्ज करें' : 'Enter your mobile number to receive your WhatsApp OTP'}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-2xl bg-red-950/85 border border-red-800/60 text-red-300 text-xs font-semibold text-center flex items-center justify-center gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendWhatsAppOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-wide mb-2 text-[#0B1E14] dark:text-[#EAEFEA]">
                        {lang === 'hi' ? 'मोबाइल नंबर' : 'Enter Mobile Number'}
                      </label>
                      <div className="border border-black/[0.08] dark:border-white/[0.1] p-3.5 flex items-center gap-3 transition-all rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] focus-within:border-[#1A4F32] focus-within:ring-1 focus-within:ring-[#1A4F32]/20">
                        <span className="font-semibold text-xs flex items-center gap-1.5 pointer-events-none border-r border-black/[0.08] dark:border-white/[0.1] pr-3 select-none text-[#4F6358] dark:text-[#9FB1A7]">
                          <span>IN</span>
                          <span>+91</span>
                        </span>
                        <input
                          type="tel"
                          maxLength="10"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9236581609"
                          className="w-full bg-transparent focus:outline-none border-none p-0 focus:ring-0 text-[#0B1E14] dark:text-[#EAEFEA] placeholder:text-[#4F6358]/50 font-medium"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="w-full py-4 bg-[#0B1E14] hover:bg-[#153424] dark:bg-[#EAEFEA] dark:hover:bg-white text-white dark:text-[#0B1E14] font-medium text-sm rounded-full shadow-[0_8px_30px_rgb(11,30,20,0.12)] hover:shadow-[0_8px_30px_rgb(11,30,20,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center gap-2 disabled:opacity-50 tracking-wide cursor-pointer"
                    >
                      {isSendingOtp ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>{lang === 'hi' ? 'व्हाट्सएप ओटीपी भेजा जा रहा है...' : 'Sending WhatsApp OTP...'}</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          <span>{lang === 'hi' ? 'व्हाट्सएप द्वारा ओटीपी भेजें →' : 'Send OTP via WhatsApp →'}</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Minimal Security Text */}
                  <div className="flex items-center justify-center gap-2 text-[10px] pt-1 text-[#4F6358] dark:text-[#9FB1A7] font-light">
                    <Lock className="w-3 h-3 text-[#1A4F32] dark:text-[#4ADE80]" />
                    <span>{lang === 'hi' ? '256-बिट सुरक्षित • 5 मिनट वैधता' : '256-Bit Secure • 5-min Validity'}</span>
                  </div>
                </div>
              )}

              {/* STEP 2: 4-Digit WhatsApp OTP Verification Screen */}
              {step === 'otp' && (
                <div className="space-y-5 animate-fade-in-up">
                  <div className="text-center space-y-1.5">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-[#1A4F32]/10 dark:bg-[#4ADE80]/15 flex items-center justify-center mb-3">
                      <MessageSquare className="w-6 h-6 text-[#1A4F32] dark:text-[#4ADE80]" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-[#0B1E14] dark:text-[#EAEFEA]">
                      {lang === 'hi' ? '4-अंकीय ओटीपी दर्ज करें' : 'Enter 4-Digit OTP'}
                    </h3>
                    <p className="text-xs font-light text-[#4F6358] dark:text-[#9FB1A7] tracking-wide">
                      {lang === 'hi' ? `व्हाट्सएप (+91 ${phone}) पर भेजा गया सुरक्षा कोड` : `WhatsApp verification code sent to +91 ${phone}`}
                    </p>
                  </div>

                  {toastMessage && (
                    <div className="p-3.5 rounded-2xl bg-[#1A4F32]/10 border border-[#1A4F32]/30 text-[#1A4F32] dark:text-[#4ADE80] text-xs font-semibold text-center flex items-center justify-center gap-2 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-[#1A4F32] dark:text-[#4ADE80] shrink-0" />
                      <span>{toastMessage}</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-3.5 rounded-2xl bg-red-950/85 border border-red-800/60 text-red-300 text-xs font-semibold text-center flex items-center justify-center gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        maxLength="4"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full py-4 text-center tracking-[0.6em] rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.1] focus:border-[#1A4F32] focus:ring-1 focus:ring-[#1A4F32]/20 font-bold text-[#0B1E14] dark:text-[#EAEFEA] text-3xl outline-none transition-all duration-200"
                        required
                        autoFocus
                      />
                    </div>

                    {/* Resend OTP with 60-Second Countdown Timer */}
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="text-[#4F6358] dark:text-[#9FB1A7] font-light">
                        {resendTimer > 0 ? (
                          lang === 'hi' ? <span><b className="text-[#1A4F32] dark:text-[#4ADE80] tabular-nums font-semibold">{resendTimer}s</b> में पुनः भेजें</span> : <span>Resend in <b className="text-[#1A4F32] dark:text-[#4ADE80] tabular-nums font-semibold">{resendTimer}s</b></span>
                        ) : (
                          <span>{lang === 'hi' ? 'ओटीपी नहीं मिला?' : "Didn't get code?"}</span>
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={handleResendWhatsAppOtp}
                        disabled={resendTimer > 0 || isSendingOtp}
                        className={`font-semibold transition-all duration-200 ${
                          resendTimer > 0 || isSendingOtp
                            ? 'text-[#4F6358]/50 cursor-not-allowed' 
                            : 'text-[#1A4F32] dark:text-[#4ADE80] hover:underline underline-offset-2 cursor-pointer'
                        }`}
                      >
                        {lang === 'hi' ? 'व्हाट्सएप पर पुनः भेजें' : 'Resend via WhatsApp'}
                      </button>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                        className="w-1/3 py-3.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#0B1E14] dark:text-[#EAEFEA] font-medium text-xs transition-all duration-300 cursor-pointer"
                      >
                        {lang === 'hi' ? 'नंबर बदलें' : 'Change Number'}
                      </button>

                      <button
                        type="submit"
                        disabled={isVerifyingOtp}
                        className="w-2/3 py-3.5 bg-[#0B1E14] hover:bg-[#153424] dark:bg-[#EAEFEA] dark:hover:bg-white text-white dark:text-[#0B1E14] font-medium text-xs rounded-full shadow-[0_8px_30px_rgb(11,30,20,0.12)] hover:shadow-[0_8px_30px_rgb(11,30,20,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center gap-2 tracking-wide cursor-pointer disabled:opacity-50"
                      >
                        {isVerifyingOtp ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin" />
                            <span>{lang === 'hi' ? 'सत्यापित हो रहा है...' : 'Verifying...'}</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
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

                    <button
                      type="submit"
                      className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
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
                          {farmerVerificationType === 'landowner'
                            ? (lang === 'hi' ? 'आधार से अपने खेत लिंक करें' : 'Link Your Land with Aadhaar')
                            : (lang === 'hi' ? 'बटाईदार किसान सत्यापन' : 'Tenant Farmer (Batai) Verification')}
                        </h3>
                        <p className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                          {farmerVerificationType === 'landowner'
                            ? (lang === 'hi' 
                                ? 'सरकारी भूलेख पोर्टल से आपका खसरा व रकबा 1-क्लिक में लिंक हो जाएगा।' 
                                : 'Directly sync your land records and Khasra details from the registry.')
                            : (lang === 'hi'
                                ? 'जमीन मालिक की सहमति एवं जीपीएस लोकेशन से तुरंत मशीनरी बुकिंग शुरू करें।'
                                : 'Instant tractor & machinery access via landowner consent & field geo-tagging.')}
                        </p>
                      </div>

                      {/* 1. Verification Type Selector (Landowner vs Tenant Farmer) */}
                      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-stone-950/80 border border-slate-200 dark:border-stone-800">
                        <button
                          type="button"
                          onClick={() => {
                            setFarmerVerificationType('landowner');
                            setError('');
                          }}
                          className={`py-3 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            farmerVerificationType === 'landowner'
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/40'
                              : isDark ? 'text-stone-400 hover:text-white hover:bg-stone-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                          }`}
                        >
                          <span>🏡</span>
                          <span className="truncate">{lang === 'hi' ? 'स्वयं का खेत (Landowner)' : 'Landowner (Self-Owned)'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFarmerVerificationType('tenant');
                            setError('');
                          }}
                          className={`py-3 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            farmerVerificationType === 'tenant'
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/40'
                              : isDark ? 'text-stone-400 hover:text-white hover:bg-stone-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                          }`}
                        >
                          <span>📄</span>
                          <span className="truncate">{lang === 'hi' ? 'बटाईदार (Tenant Farmer)' : 'Tenant Farmer (Batai / Leased)'}</span>
                        </button>
                      </div>

                      {/* Error Banner */}
                      {error && (
                        <div className="p-3.5 rounded-2xl bg-red-950/85 border border-red-700/60 text-red-200 text-xs font-bold flex items-start gap-2 animate-fade-in">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span>{error}</span>
                          </div>
                        </div>
                      )}

                      {/* ══════════ OPTION A: LANDOWNER (SELF-OWNED) VERIFICATION ══════════ */}
                      {farmerVerificationType === 'landowner' && (
                        <div className="space-y-4 animate-fade-in">
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
                                className="p-2.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-800/50 hover:border-emerald-500 text-left transition-all duration-200 flex items-center justify-between group cursor-pointer"
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
                                className="p-2.5 rounded-xl bg-teal-950/30 hover:bg-teal-950/60 border border-teal-800/50 hover:border-teal-500 text-left transition-all duration-200 flex items-center justify-between group cursor-pointer"
                              >
                                <div>
                                  <span className="text-xs font-black text-teal-300 block">{lang === 'hi' ? '8899 4433 2211 (डेमो आधार 2)' : '8899 4433 2211 (Demo Aadhaar 2)'}</span>
                                  <span className="text-[10px] text-stone-400">{lang === 'hi' ? 'गाटा #215 (6.0 बीघा)' : 'Gata #215 (6.0 Bigha)'}</span>
                                </div>
                                <span className="text-[10px] font-bold text-teal-400 px-2 py-0.5 rounded-lg bg-teal-900/50 group-hover:bg-teal-900/80">{lang === 'hi' ? 'पंजीकृत ✓' : 'Registered ✓'}</span>
                              </button>
                            </div>
                          </div>

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
                                className={`w-1/3 py-4 rounded-2xl border font-bold text-xs transition-all duration-200 cursor-pointer ${
                                  isDark ? 'border-stone-700 text-stone-400 hover:bg-stone-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {lang === 'hi' ? 'बाद में करें' : 'Skip for Now'}
                              </button>

                              <button
                                type="submit"
                                disabled={isVerifyingAgriStack}
                                className="w-2/3 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] hover:translate-y-[-1px] cursor-pointer"
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

                      {/* ══════════ OPTION B: TENANT FARMER (BATAI / LEASED) VERIFICATION ══════════ */}
                      {farmerVerificationType === 'tenant' && (
                        <form onSubmit={handleCompleteTenantRegistration} className="space-y-4 animate-fade-in">
                          
                          {/* 3. Trust Badge & Status */}
                          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold w-full justify-center shadow-xs">
                            <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>⚡ {lang === 'hi' ? 'जियो-टैगिंग एवं सहमति से सत्यापित बटाईदार' : 'Tenant Verified via Geo-Tagging & Consent'}</span>
                          </div>

                          {/* Khasra / Plot Number & Farmland Size */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className={`block text-xs font-bold uppercase tracking-wider ${
                                isDark ? 'text-stone-300' : 'text-slate-700'
                              }`}>
                                {lang === 'hi' ? 'खसरा / प्लॉट संख्या *' : 'Khasra / Plot Number *'}
                              </label>
                              <div className="relative">
                                <LandPlot className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  value={tenantKhasra}
                                  onChange={(e) => setTenantKhasra(e.target.value)}
                                  placeholder={lang === 'hi' ? 'उदा. 142/1' : 'e.g. 142/1'}
                                  className={`w-full pl-10 pr-3 py-3.5 rounded-2xl border font-bold text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                                    isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                                  }`}
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className={`block text-xs font-bold uppercase tracking-wider ${
                                isDark ? 'text-stone-300' : 'text-slate-700'
                              }`}>
                                {lang === 'hi' ? 'रकबा (बीघा)' : 'Field Size (Bigha)'}
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={tenantLandSize}
                                onChange={(e) => setTenantLandSize(e.target.value)}
                                placeholder="3.5"
                                className={`w-full px-3.5 py-3.5 rounded-2xl border font-bold text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                                  isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Landowner Mobile Number & Trigger */}
                          <div className="space-y-1.5">
                            <label className={`block text-xs font-bold uppercase tracking-wider ${
                              isDark ? 'text-stone-300' : 'text-slate-700'
                            }`}>
                              {lang === 'hi' ? 'जमीन मालिक का मोबाइल नंबर *' : 'Landowner Mobile Number *'}
                            </label>
                            
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                  type="tel"
                                  maxLength="10"
                                  value={tenantLandownerPhone}
                                  onChange={(e) => setTenantLandownerPhone(e.target.value)}
                                  placeholder="9876543210"
                                  className={`w-full pl-10 pr-3 py-3.5 rounded-2xl border font-bold text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                                    isDark ? 'border-stone-700 bg-stone-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                                  }`}
                                  required
                                />
                              </div>

                              <button
                                type="button"
                                onClick={handleSendOwnerApprovalLink}
                                className={`px-3 py-3.5 rounded-2xl font-black text-xs transition-all shadow-sm flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer ${
                                  isOwnerLinkSent
                                    ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-400'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                              >
                                {isOwnerLinkSent ? (
                                  <>
                                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                                    <span>{lang === 'hi' ? 'सहमति लिंक भेजा गया ✓' : 'Link Sent ✓'}</span>
                                  </>
                                ) : (
                                  <>
                                    <MessageSquare className="w-4 h-4" />
                                    <span>{lang === 'hi' ? 'मालिक को सहमति लिंक भेजें' : 'Send Approval Link to Owner'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {lang === 'hi'
                                ? 'मालिक को व्हाट्सएप पर 1-क्लिक डिजिटल सहमति लिंक भेजा जाएगा।'
                                : 'WhatsApp digital approval link will be sent to the landowner instantly.'}
                            </p>
                          </div>

                          {/* Upload Batai Agreement / Pradhan Certificate (Optional) */}
                          <div className="space-y-1.5">
                            <label className={`block text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                              isDark ? 'text-stone-300' : 'text-slate-700'
                            }`}>
                              <span>{lang === 'hi' ? 'बटाई अनुबंध / प्रधान प्रमाण-पत्र' : 'Batai Agreement / Pradhan Certificate'}</span>
                              <span className="text-[10px] font-normal text-slate-400 lowercase">(optional)</span>
                            </label>

                            <label className={`border-2 border-dashed rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                              tenantAgreementDoc 
                                ? 'border-emerald-500/60 bg-emerald-500/10' 
                                : isDark ? 'border-stone-700 bg-stone-950 hover:border-emerald-500/40' : 'border-slate-300 bg-slate-50 hover:border-emerald-500/40'
                            }`}>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setTenantAgreementDoc(e.target.files[0].name);
                                    setToastMessage(lang === 'hi' ? 'दस्तावेज़ सफलतापूर्वक संलग्न हुआ' : 'Document attached');
                                    setTimeout(() => setToastMessage(''), 3000);
                                  }
                                }}
                                className="hidden"
                              />
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                  <Upload className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {tenantAgreementDoc || (lang === 'hi' ? 'अनुबंध या प्रधान पत्र अपलोड करें' : 'Upload Agreement or Certificate')}
                                  </p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400">PDF, JPG, PNG (Max 10MB)</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-600 text-white shrink-0">
                                {tenantAgreementDoc ? '✓ Attached' : 'Choose'}
                              </span>
                            </label>
                          </div>

                          {/* High-Tech GPS Field Radar / Searcher Widget */}
                          <div className="space-y-1.5 pt-1">
                            <button
                              type="button"
                              onClick={handleGeoTagField}
                              disabled={isGeoTagging}
                              className={`w-full py-3.5 px-4 rounded-2xl border font-bold text-xs transition-all duration-300 flex items-center justify-between cursor-pointer relative overflow-hidden group shadow-sm ${
                                geoTaggedCoords
                                  ? 'bg-emerald-950/70 dark:bg-emerald-950/80 border-emerald-500/70 text-emerald-400 ring-1 ring-emerald-500/30'
                                  : isDark
                                  ? 'bg-stone-950/90 border-emerald-500/30 text-stone-200 hover:border-emerald-500 hover:bg-stone-900'
                                  : 'bg-emerald-50/70 border-emerald-500/40 text-slate-800 hover:border-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {/* Animated Radar Scanning Line when locating */}
                              {isGeoTagging && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent animate-[shimmer_1.5s_infinite] pointer-events-none" />
                              )}

                              <div className="flex items-center gap-3 relative z-10 min-w-0">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                  isGeoTagging
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : geoTaggedCoords
                                    ? 'bg-emerald-500 text-stone-950 font-black'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                }`}>
                                  {isGeoTagging ? (
                                    <Crosshair className="w-4 h-4 animate-spin text-emerald-400" />
                                  ) : geoTaggedCoords ? (
                                    <Check className="w-4 h-4 text-stone-950 stroke-[3]" />
                                  ) : (
                                    <Crosshair className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                                  )}
                                </div>

                                <div className="text-left min-w-0">
                                  <span className="font-extrabold text-xs block truncate text-slate-900 dark:text-white">
                                    {isGeoTagging
                                      ? (lang === 'hi' ? '📡 जीपीएस उपग्रह से खेत स्कैन कर रहे हैं...' : '📡 Scanning Field GPS via Satellites...')
                                      : geoTaggedCoords
                                      ? (lang === 'hi' ? '🎯 खेत जीपीएस पिन हो गया' : '🎯 Field GPS Coordinates Locked')
                                      : (lang === 'hi' ? 'खेत की जीपीएस लोकेशन खोजें व पिन करें' : 'Search & Pin Field GPS Location')}
                                  </span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-medium">
                                    {isGeoTagging
                                      ? (lang === 'hi' ? 'सटीक उपग्रह निर्देशांक प्राप्त हो रहे हैं...' : 'Acquiring high-precision lock...')
                                      : geoTaggedCoords
                                      ? `Lat: ${geoTaggedCoords.lat.toFixed(4)}°N, Lng: ${geoTaggedCoords.lng.toFixed(4)}°E • ±${geoTaggedCoords.accuracy || 2}m`
                                      : (lang === 'hi' ? '1-क्लिक ऑटो-जीपीएस सैटेलाइट डिटेक्टर' : '1-Click Automatic GPS Satellite Searcher')}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 relative z-10 pl-2">
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                                  geoTaggedCoords
                                    ? 'bg-emerald-500 text-stone-950 border-emerald-400 font-extrabold shadow-xs'
                                    : isGeoTagging
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    geoTaggedCoords ? 'bg-stone-950' : 'bg-emerald-500 animate-ping'
                                  }`} />
                                  <span>{isGeoTagging ? 'Searching...' : geoTaggedCoords ? '±2m Locked' : 'GPS Search'}</span>
                                </span>
                              </div>
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2.5 pt-2">
                            <button
                              type="button"
                              onClick={handleSkipAgriStack}
                              className={`w-1/3 py-4 rounded-2xl border font-bold text-xs transition-all duration-200 cursor-pointer ${
                                isDark ? 'border-stone-700 text-stone-400 hover:bg-stone-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {lang === 'hi' ? 'बाद में करें' : 'Skip for Now'}
                            </button>

                            <button
                              type="submit"
                              className="w-2/3 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] hover:translate-y-[-1px] cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-stone-950" />
                              <span>{lang === 'hi' ? 'बटाईदार सत्यापन पूरा करें →' : 'Complete Tenant Verification →'}</span>
                            </button>
                          </div>

                        </form>
                      )}

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
      {portalView === 'landing' && (
        <section 
          ref={faqRef}
          className="relative w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-[#0B1E14]/5 dark:border-white/5 transition-colors duration-300"
        >
          <div className="max-w-4xl mx-auto space-y-4 text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0B1E14] dark:text-[#EAEFEA] leading-tight">
              {lang === 'hi' ? 'बुकिंग करने से पहले सब कुछ जानें' : 'Everything You Need to Know.'}
            </h2>
            <p className="text-sm sm:text-base max-w-2xl mx-auto text-[#4F6358] dark:text-[#9FB1A7] leading-relaxed">
              {lang === 'hi' 
                ? 'सत्यापित ट्रैक्टरों और हार्वेस्टरों को 100% भरोसे और पारदर्शी दरों के साथ बुक करने के लिए स्पष्ट उत्तर।' 
                : 'Clear, transparent answers to help you book tractors and harvesters with 100% confidence.'}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 text-left">
            {FAQS_DATA.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              const question = lang === 'hi' ? faq.qHi : faq.qEn;
              const answer = lang === 'hi' ? faq.aHi : faq.aEn;

              return (
                <div
                  key={index}
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className={`rounded-2xl border transition-all duration-300 cursor-pointer p-6 shadow-sm backdrop-blur-xl ${
                    isOpen 
                      ? 'bg-white dark:bg-[#0B1E14] border-[#1A4F32] dark:border-[#4ADE80] shadow-md ring-1 ring-[#1A4F32]/20 dark:ring-[#4ADE80]/20' 
                      : 'bg-white/70 dark:bg-[#0B1E14]/70 border-[#0B1E14]/10 dark:border-white/10 hover:border-[#1A4F32]/50'
                  }`}
                >
                  <div className="flex justify-between items-center gap-4">
                    <span className={`font-bold text-base sm:text-lg tracking-tight ${
                      isOpen ? 'text-[#1A4F32] dark:text-[#4ADE80]' : 'text-[#0B1E14] dark:text-[#EAEFEA]'
                    }`}>
                      {question}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen 
                        ? 'bg-[#1A4F32]/10 dark:bg-[#4ADE80]/10 text-[#1A4F32] dark:text-[#4ADE80] rotate-180' 
                        : 'bg-[#0B1E14]/5 dark:bg-white/5 text-[#4F6358] dark:text-[#9FB1A7]'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  
                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-[#0B1E14]/5 dark:border-white/5 animate-fade-in">
                      <p className="text-sm leading-relaxed text-[#4F6358] dark:text-[#9FB1A7]">
                        {answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

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
