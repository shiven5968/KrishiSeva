import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSavedLands } from '../../context/SavedLandsContext';
import { usePreBookings } from '../../context/PreBookingsContext';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import FarmerBookingHistoryModal from '../farmer/FarmerBookingHistoryModal';
import SavedLandsModal from '../farmer/SavedLandsModal';
import PreBookingsModal from '../farmer/PreBookingsModal';
import DeleteAccountModal from './DeleteAccountModal';
import HelpSupportModal from './HelpSupportModal';
import { 
  Tractor, 
  Globe, 
  ShieldCheck, 
  LogOut,
  LogIn, 
  Bookmark, 
  Sun, 
  Moon, 
  History, 
  Trash2, 
  Menu, 
  X, 
  Calendar, 
  ChevronRight, 
  User, 
  Sparkles,
  Truck,
  Wallet,
  Headphones,
  Power,
  ArrowRightLeft,
  IndianRupee,
  FileCheck2,
  Phone
} from 'lucide-react';

export default function Navbar({ onOpenAuthModal, onOpenSavedLandsModal }) {
  const { lang, toggleLanguage } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const { activeRole, setActiveRole, currentUser, driverProfile, toggleDriverDuty, logout } = useAuth();
  const { savedLands } = useSavedLands();
  const { preBookings } = usePreBookings();

  // Scroll state for seamless header blur
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dropdown Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Modal States
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSavedLandsModalOpen, setIsSavedLandsModalOpen] = useState(false);
  const [isPreBookingsModalOpen, setIsPreBookingsModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Clicking Logo returns user to their authenticated home dashboard
  const handleLogoClick = () => {
    setIsMenuOpen(false);
    if (currentUser && currentUser.isAuthenticated) {
      if (currentUser.role === 'admin') {
        window.location.hash = '#admin';
        setActiveRole('admin');
      } else if (currentUser.role === 'driver') {
        window.location.hash = '#driver';
        setActiveRole('driver');
      } else {
        window.location.hash = '#farmer';
        setActiveRole('farmer');
      }
      return;
    }
    window.location.hash = '';
    setActiveRole('landing');
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    setIsMenuOpen(false);
    logout();
    window.location.hash = '';
  };

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all duration-500 ${
        isScrolled 
          ? 'backdrop-blur-md bg-[#FDFBF7]/85 dark:bg-[#080E0B]/85 border-b border-black/[0.04] dark:border-white/[0.05] py-2' 
          : 'bg-transparent py-3'
      }`}>
        <div className="max-w-7xl w-full mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-3">
          
          {/* Brand Logo - Returns to logged-in dashboard */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
            title={currentUser ? "Go to Dashboard" : "Return to Home"}
          >
            <img src="/images/logo.png" alt="KrishiSeva Logo" className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105 rounded-xl" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-[#0B1E14] dark:text-[#EAEFEA] font-display transition-colors group-hover:text-[#1A4F32] dark:group-hover:text-[#4ADE80]">
                  KrishiSeva
                </span>
                {lang === 'hi' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold hidden sm:inline-block bg-[#1A4F32]/10 text-[#1A4F32] dark:bg-[#4ADE80]/15 dark:text-[#4ADE80]">
                    कृषिसेवा
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold hidden sm:inline-block bg-[#1A4F32]/10 text-[#1A4F32] dark:bg-[#4ADE80]/15 dark:text-[#4ADE80]">
                    AgriTech
                  </span>
                )}
              </div>
              <p className="text-[10px] font-normal text-[#4F6358] dark:text-[#9FB1A7] hidden md:block tracking-wide">
                {lang === 'hi' ? 'कॉल नहीं, केवल एक क्लिक • आधुनिक कृषि मशीनरी' : 'Not a Call, Just a Click • Precision Farm Machinery'}
              </p>
            </div>
          </div>

          {/* DRIVER ON-DUTY INDICATOR (IF DRIVER) */}
          {currentUser && currentUser.role === 'driver' && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-xl border flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                <span className={`relative flex h-2.5 w-2.5 ${driverProfile.status === 'online' ? '' : 'opacity-50'}`}>
                  {driverProfile.status === 'online' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${driverProfile.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {driverProfile.status === 'online' ? (lang === 'hi' ? 'ड्यूटी पर (Online)' : 'On Duty (Online)') : (lang === 'hi' ? 'ऑफलाइन (Offline)' : 'Off Duty (Offline)')}
                </span>
              </div>
            </div>
          )}

          {/* ADMIN INDICATOR (IF ADMIN) */}
          {currentUser && currentUser.role === 'admin' && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Admin Console</span>
              </span>
            </div>
          )}

          {/* RIGHT CONTAINER: THEME, LANG & PROFILE MENU */}
          <div className="flex items-center gap-2" ref={menuRef}>
            
            {/* Quick Theme Toggle Icon Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#0B1E14] dark:text-[#EAEFEA] transition-all duration-300 cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#1A4F32]" />}
            </button>

            {/* Quick Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-[#0B1E14] dark:text-[#EAEFEA] transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#1A4F32] dark:text-[#4ADE80]" />
              <span>{lang === 'hi' ? 'EN' : 'हिन्दी'}</span>
            </button>

            {/* Unauthenticated Quick Login Pill */}
            {(!currentUser || !currentUser.isAuthenticated) ? (
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-2 rounded-full bg-[#0B1E14] hover:bg-[#153424] dark:bg-[#EAEFEA] dark:hover:bg-white text-white dark:text-[#0B1E14] font-medium text-xs tracking-wide transition-all shadow-[0_4px_14px_rgb(11,30,20,0.12)] hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'लॉगिन करें' : 'Login'}</span>
              </button>
            ) : (
              /* Authenticated User Profile Pill Button */
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1E14]/[0.03] dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.08] text-[#0B1E14] dark:text-[#EAEFEA] hover:bg-[#0B1E14]/[0.06] dark:hover:bg-white/10 transition-all duration-300 shadow-sm active:scale-98 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#1A4F32]/10 dark:bg-[#4ADE80]/15 text-[#1A4F32] dark:text-[#4ADE80] flex items-center justify-center font-bold text-xs">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-semibold block leading-tight truncate max-w-[100px]">
                    {currentUser?.name || (currentUser?.role === 'driver' ? 'Driver' : 'Farmer')}
                  </span>
                  <span className="text-[10px] text-[#4F6358] dark:text-[#9FB1A7] capitalize block font-light">
                    {currentUser?.role || 'User'}
                  </span>
                </div>
                <Menu className="w-3.5 h-3.5 text-[#4F6358] dark:text-[#9FB1A7] ml-0.5" />
              </button>
            )}

            {/* Dropdown Menu Modal */}
            {isMenuOpen && currentUser && (
              <div className="absolute right-4 top-14 w-80 max-h-[85vh] overflow-y-auto rounded-3xl bg-[#FDFBF7]/95 dark:bg-[#080E0B]/95 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-2xl p-4 space-y-3 z-50 animate-scale-in">
                
                {/* User Profile Header Card */}
                <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base border shadow-sm ${
                      currentUser?.role === 'driver'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                        : currentUser?.role === 'admin'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                        : 'bg-[#1A4F32]/10 text-[#1A4F32] dark:text-[#4ADE80] border-[#1A4F32]/20'
                    }`}>
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-bold text-[#0B1E14] dark:text-[#EAEFEA] truncate">
                          {currentUser?.name || 'Krishi User'}
                        </p>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-[#4F6358] dark:text-[#9FB1A7]">
                          {currentUser?.role || 'User'}
                        </span>
                      </div>
                      <p className="text-xs text-[#4F6358] dark:text-[#9FB1A7] truncate mt-0.5 font-light">
                        +91 {currentUser?.phone || ''}
                      </p>
                    </div>
                  </div>

                  {/* Role Status Sub-badge */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                    {currentUser?.role === 'driver' ? (
                      <>
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium truncate max-w-[140px]">
                          <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">{driverProfile?.modelName || 'Mahindra 575 DI'}</span>
                        </span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 shrink-0">
                          <span>₹{(driverProfile?.totalEarnings || 84500).toLocaleString('en-IN')}</span>
                        </span>
                      </>
                    ) : currentUser?.role === 'farmer' ? (
                      <>
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>AgriStack ID</span>
                        </span>
                        <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          {currentUser?.farmerId || 'UPFR-2026-88910'}
                        </span>
                      </>
                    ) : (
                      <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Super Administrator</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* DRIVER SPECIFIC ACTIONS */}
                {currentUser?.role === 'driver' && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 block">
                      {lang === 'hi' ? 'चालक सेवाएँ' : 'Driver Services'}
                    </span>

                    {/* Duty Toggle Button */}
                    <button
                      type="button"
                      onClick={() => {
                        toggleDriverDuty();
                      }}
                      className="w-full p-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Power className={`w-4 h-4 ${driverProfile?.status === 'online' ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span>{lang === 'hi' ? 'ड्यूटी स्थिति (Online/Offline)' : 'Duty Status (Online/Offline)'}</span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        driverProfile?.status === 'online'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}>
                        {driverProfile?.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </button>

                    {/* Driver KYC & Passport */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        window.location.hash = '#driver';
                        setActiveRole('driver');
                      }}
                      className="w-full p-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileCheck2 className="w-4 h-4 text-blue-500" />
                        <span>{lang === 'hi' ? 'केवाईसी एवं मशीनरी पासपोर्ट' : 'KYC & Machinery Passport'}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    {/* Earnings & Payouts */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        window.location.hash = '#driver';
                        setActiveRole('driver');
                      }}
                      className="w-full p-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Wallet className="w-4 h-4 text-emerald-500" />
                        <span>{lang === 'hi' ? 'कुल कमाई व बैंक निकासी' : 'Earnings & Bank Payouts'}</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹{(driverProfile?.totalEarnings || 84500).toLocaleString('en-IN')}
                      </span>
                    </button>
                  </div>
                )}

                {/* FARMER SPECIFIC ACTIONS */}
                {currentUser?.role === 'farmer' && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 block">
                      {lang === 'hi' ? 'किसान मेनू' : 'Farmer Menu'}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsHistoryModalOpen(true);
                      }}
                      className="w-full p-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <History className="w-4 h-4 text-emerald-500" />
                        <span>{lang === 'hi' ? 'बुकिंग इतिहास' : 'Booking History'}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsPreBookingsModalOpen(true);
                      }}
                      className="w-full p-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-teal-500" />
                        <span>{lang === 'hi' ? 'अग्रिम बुकिंग्स' : 'Scheduled Bookings'}</span>
                      </div>
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                        {preBookings?.length || 0}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (onOpenSavedLandsModal) {
                          onOpenSavedLandsModal();
                        } else {
                          setIsSavedLandsModalOpen(true);
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bookmark className="w-4 h-4 text-emerald-500" />
                        <span>{lang === 'hi' ? 'सहेजे गए खेत' : 'My Saved Lands'}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        {savedLands?.length || 0}
                      </span>
                    </button>
                  </div>
                )}

                {/* HELP & SUPPORT SECTION (FOR FARMER & DRIVER ONLY) */}
                {currentUser?.role !== 'admin' && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 block">
                      {lang === 'hi' ? 'सहायता एवं सेटिंग्स' : 'Support & Settings'}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsHelpModalOpen(true);
                      }}
                      className="w-full p-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Headphones className="w-4 h-4 text-emerald-500" />
                        <span>{lang === 'hi' ? 'किसान हेल्पलाइन (24x7)' : '24x7 Help & Helpline'}</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Toll Free
                      </span>
                    </button>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={toggleLanguage}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:border-emerald-500/40 transition cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{lang === 'hi' ? 'English' : 'हिन्दी'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:border-emerald-500/40 transition cursor-pointer"
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
                    </div>
                  </div>
                )}

                {/* ACCOUNT & LOGOUT */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-between text-xs font-semibold transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>{lang === 'hi' ? 'लॉगआउट करें' : 'Logout'}</span>
                    </div>
                  </button>

                  {currentUser?.role !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsDeleteAccountModalOpen(true);
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 flex items-center justify-between text-xs font-semibold transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Trash2 className="w-4 h-4 text-red-500" />
                        <span>{lang === 'hi' ? 'खाता स्थायी रूप से हटाएं' : 'Delete Account Permanently'}</span>
                      </div>
                    </button>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>
      </header>

      {/* Modals */}
      <FarmerBookingHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <SavedLandsModal
        isOpen={isSavedLandsModalOpen}
        onClose={() => setIsSavedLandsModalOpen(false)}
      />

      <PreBookingsModal
        isOpen={isPreBookingsModalOpen}
        onClose={() => setIsPreBookingsModalOpen(false)}
      />

      <HelpSupportModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={handleConfirmLogout}
        userName={currentUser?.name}
      />

      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />
    </>
  );
}
