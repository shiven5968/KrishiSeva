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
  User,
  ChevronRight
} from 'lucide-react';

export default function Navbar({ onOpenAuthModal, onOpenSavedLandsModal }) {
  const { lang, toggleLanguage } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const { activeRole, setActiveRole, currentUser, driverProfile, logout } = useAuth();
  const { savedLands } = useSavedLands();
  const { preBookings } = usePreBookings();

  // Dropdown Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Modal States
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSavedLandsModalOpen, setIsSavedLandsModalOpen] = useState(false);
  const [isPreBookingsModalOpen, setIsPreBookingsModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

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
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b shadow-md transition-colors duration-200 ${
        isDark ? 'bg-[#0B0F12]/95 border-stone-800 text-stone-100' : 'bg-white/95 border-slate-200 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Brand Logo - Returns to logged-in dashboard */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer group"
            title={currentUser ? "Go to Dashboard" : "Return to Home"}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <Tractor className="w-5 h-5 animate-pulse-slow text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-extrabold text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Krishi<span className="text-emerald-500">Seva</span>
                </span>
                {lang === 'hi' && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold hidden sm:inline-block ${
                    isDark ? 'bg-stone-900 text-emerald-400 border border-stone-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    कृषि सेवा
                  </span>
                )}
              </div>
              <p className={`text-[10px] font-medium hidden md:block ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                {lang === 'hi' ? 'ना बिचौलिया, ना इंतज़ार — मशीन सीधा खेत पर' : 'Not a Call, Just a Click — Precision Farm Machinery'}
              </p>
            </div>
          </div>

          {/* DRIVER ON-DUTY INDICATOR (IF DRIVER) */}
          {currentUser && currentUser.role === 'driver' && (
            <div className="hidden sm:flex items-center gap-2">
              <div className={`px-3 py-1 rounded-xl border flex items-center gap-2 ${
                isDark ? 'bg-stone-900 border-stone-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${driverProfile.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                <span className={`text-xs font-bold ${isDark ? 'text-stone-300' : 'text-slate-700'}`}>
                  {driverProfile.status === 'online' ? (lang === 'hi' ? 'ड्यूटी पर (Online)' : 'On Duty (Online)') : (lang === 'hi' ? 'ड्यूटी बंद (Offline)' : 'Off Duty (Offline)')}
                </span>
              </div>
            </div>
          )}

          {/* ADMIN INDICATOR (IF ADMIN) */}
          {currentUser && currentUser.role === 'admin' && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-purple-950 text-purple-300 border border-purple-700 font-black text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Admin Console</span>
              </span>
            </div>
          )}

          {/* RIGHT CONTAINER: UNIFIED PROFILE PILL + HAMBURGER MENU */}
          <div className="relative" ref={menuRef}>
            
            {currentUser && currentUser.isAuthenticated ? (
              /* Authenticated Profile Pill + Hamburger Button */
              <button
                type="button"
                onClick={() => setIsMenuOpen(prev => !prev)}
                className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border transition-all duration-200 active:scale-95 shadow-md ${
                  isMenuOpen 
                    ? 'border-emerald-500/80 bg-emerald-950/40 text-white ring-2 ring-emerald-500/30' 
                    : isDark 
                      ? 'bg-stone-900/90 hover:bg-stone-850 border-stone-800 text-stone-200 hover:border-emerald-500/40' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 shadow-sm'
                }`}
                title="Open Profile & Settings Menu"
              >
                {/* User Avatar */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-stone-950 font-bold text-sm shadow-inner shrink-0">
                  {currentUser.role === 'farmer' ? '🌾' : currentUser.role === 'driver' ? '🚜' : '🛡️'}
                </div>

                {/* User Name & Role Tag */}
                <div className="text-left hidden sm:block">
                  <div className="font-extrabold text-xs leading-tight max-w-[110px] truncate">
                    {currentUser.name?.split(' ')[0] || currentUser.name || 'Balram'}
                  </div>
                  <div className="text-[9px] uppercase font-black text-emerald-400 tracking-wider leading-none mt-0.5">
                    {currentUser.role}
                  </div>
                </div>

                {/* Hamburger Icon (☰) */}
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ml-0.5 ${
                  isDark ? 'bg-stone-800 text-stone-200' : 'bg-slate-100 text-slate-700'
                }`}>
                  {isMenuOpen ? (
                    <X className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Menu className="w-4 h-4" />
                  )}
                </div>
              </button>
            ) : (
              /* Unauthenticated: Clean Action with Menu */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login / Signup</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(prev => !prev)}
                  className={`p-2 rounded-xl border transition active:scale-95 ${
                    isDark ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                  title="Preferences"
                >
                  {isMenuOpen ? <X className="w-4 h-4 text-emerald-400" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* ═══════════ INTERACTIVE SLIDE-DOWN DROPDOWN MENU ═══════════ */}
            {isMenuOpen && (
              <div className={`absolute right-0 mt-2.5 w-72 sm:w-80 rounded-3xl p-4 border shadow-2xl z-50 animate-fade-in space-y-4 backdrop-blur-2xl transition-all ${
                isDark 
                  ? 'bg-stone-950/95 border-emerald-500/30 text-white shadow-black/80' 
                  : 'bg-white/98 border-slate-200 text-slate-900 shadow-2xl shadow-slate-300/60'
              }`}>
                
                {/* Profile Header (If Authenticated) */}
                {currentUser && currentUser.isAuthenticated && (
                  <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                    isDark ? 'bg-stone-900/80 border-stone-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-stone-950 font-bold text-base shadow-md shrink-0">
                      {currentUser.role === 'farmer' ? '🌾' : currentUser.role === 'driver' ? '🚜' : '🛡️'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-xs truncate">
                        {currentUser.name || 'User'}
                      </h4>
                      <p className={`text-[11px] font-mono ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                        {currentUser.phone}
                      </p>
                      <span className="inline-block text-[9px] uppercase font-black px-2 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mt-1">
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                )}

                {/* 1. 👤 ACCOUNT & PREFERENCES */}
                <div className="space-y-1.5">
                  <span className={`text-[10px] font-black uppercase tracking-wider block px-1 ${
                    isDark ? 'text-stone-400' : 'text-slate-500'
                  }`}>
                    👤 {lang === 'hi' ? 'खाता व प्राथमिकताएं' : 'Account & Preferences'}
                  </span>

                  {/* Theme Switcher (Dark / Light) */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition active:scale-98 ${
                      isDark 
                        ? 'bg-stone-900/60 hover:bg-stone-900 border-stone-800/80 text-stone-200' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isDark ? (
                        <Moon className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-500" />
                      )}
                      <span>{lang === 'hi' ? 'थीम मोड' : 'Theme Mode'}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${
                      isDark ? 'bg-stone-800 text-amber-300 border-amber-500/30' : 'bg-white text-indigo-700 border-indigo-200'
                    }`}>
                      {isDark ? '🌙 Dark' : '☀️ Light'}
                    </span>
                  </button>

                  {/* Language Toggle (English / Hindi) */}
                  <button
                    type="button"
                    onClick={toggleLanguage}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition active:scale-98 ${
                      isDark 
                        ? 'bg-stone-900/60 hover:bg-stone-900 border-stone-800/80 text-stone-200' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-emerald-500" />
                      <span>{lang === 'hi' ? 'भाषा (Language)' : 'Language'}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${
                      isDark ? 'bg-stone-800 text-emerald-300 border-emerald-500/30' : 'bg-white text-emerald-700 border-emerald-200'
                    }`}>
                      {lang === 'hi' ? '🇮🇳 हिंदी' : '🌐 English'}
                    </span>
                  </button>
                </div>

                {/* 2. 📌 NAVIGATION & SAVED DATA (Shown for Logged In Users) */}
                {currentUser && currentUser.isAuthenticated && currentUser.role === 'farmer' && (
                  <div className="space-y-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-wider block px-1 ${
                      isDark ? 'text-stone-400' : 'text-slate-500'
                    }`}>
                      📌 {lang === 'hi' ? 'नेविगेशन व सहेजा गया डेटा' : 'Navigation & Saved Data'}
                    </span>

                    {/* Booking History */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsHistoryModalOpen(true);
                      }}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition active:scale-98 ${
                        isDark 
                          ? 'bg-stone-900/60 hover:bg-emerald-950/40 border-stone-800/80 hover:border-emerald-500/40 text-stone-200 hover:text-emerald-300' 
                          : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 hover:border-emerald-200 text-slate-800 hover:text-emerald-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <History className="w-4 h-4 text-emerald-400" />
                        <span>{lang === 'hi' ? 'बुकिंग इतिहास' : 'Booking History'}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>

                    {/* My Saved Lands */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsSavedLandsModalOpen(true);
                      }}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition active:scale-98 ${
                        isDark 
                          ? 'bg-stone-900/60 hover:bg-emerald-950/40 border-stone-800/80 hover:border-emerald-500/40 text-stone-200 hover:text-emerald-300' 
                          : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 hover:border-emerald-200 text-slate-800 hover:text-emerald-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Bookmark className="w-4 h-4 text-emerald-400" />
                        <span>{lang === 'hi' ? 'मेरे सहेजे गए खेत' : 'My Saved Lands'}</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        {savedLands?.length || 0}
                      </span>
                    </button>

                    {/* Pre-Bookings */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsPreBookingsModalOpen(true);
                      }}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition active:scale-98 ${
                        isDark 
                          ? 'bg-stone-900/60 hover:bg-blue-950/40 border-stone-800/80 hover:border-blue-500/40 text-stone-200 hover:text-blue-300' 
                          : 'bg-slate-50 hover:bg-blue-50 border-slate-200 hover:border-blue-200 text-slate-800 hover:text-blue-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span>{lang === 'hi' ? 'अग्रिम बुकिंग' : 'Pre-Bookings'}</span>
                      </div>
                      <span className="text-[10px] font-black text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-500/30">
                        {preBookings?.length || 0}
                      </span>
                    </button>
                  </div>
                )}

                {/* 3. ⚠️ ACCOUNT ACTIONS */}
                {currentUser && currentUser.isAuthenticated && (
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <span className={`text-[10px] font-black uppercase tracking-wider block px-1 ${
                      isDark ? 'text-stone-400' : 'text-slate-500'
                    }`}>
                      ⚠️ {lang === 'hi' ? 'खाता क्रियाएँ' : 'Account Actions'}
                    </span>

                    {/* Logout Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition active:scale-98 ${
                        isDark 
                          ? 'bg-stone-900/60 hover:bg-red-950/60 border-stone-800/80 hover:border-red-700/60 text-stone-200 hover:text-red-400' 
                          : 'bg-slate-50 hover:bg-red-50 border-slate-200 hover:border-red-200 text-slate-800 hover:text-red-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>{lang === 'hi' ? 'लॉगआउट करें' : 'Logout'}</span>
                      </div>
                      <span className="text-[10px] text-stone-400">🚪</span>
                    </button>

                    {/* Delete Account Option (For Farmer) */}
                    {currentUser.role === 'farmer' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsDeleteAccountModalOpen(true);
                        }}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition active:scale-98 ${
                          isDark 
                            ? 'bg-red-950/30 hover:bg-red-950/80 border-red-900/40 hover:border-red-600 text-red-400' 
                            : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Trash2 className="w-4 h-4 text-red-500" />
                          <span>{lang === 'hi' ? 'खाता स्थायी रूप से हटाएं' : 'Delete Account'}</span>
                        </div>
                        <span className="text-[10px] text-red-500">⚠️</span>
                      </button>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      </header>

      {/* Farmer Booking History Modal */}
      <FarmerBookingHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* Saved Lands Modal */}
      <SavedLandsModal
        isOpen={isSavedLandsModalOpen}
        onClose={() => setIsSavedLandsModalOpen(false)}
      />

      {/* Pre-Bookings Modal */}
      <PreBookingsModal
        isOpen={isPreBookingsModalOpen}
        onClose={() => setIsPreBookingsModalOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={handleConfirmLogout}
        userName={currentUser?.name}
      />

      {/* Permanent Account Deletion Modal */}
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />
    </>
  );
}
