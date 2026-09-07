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
  ChevronRight,
  User,
  Sparkles
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
      <header className="sticky top-0 z-50 bg-[#ECF5F0]/40 dark:bg-slate-950/40 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl w-full mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Brand Logo - Returns to logged-in dashboard */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer group"
            title={currentUser ? "Go to Dashboard" : "Return to Home"}
          >
            <img src="/images/logo.png" alt="KrishiSeva Logo" className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105 rounded-xl" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-display">
                  KrishiSeva
                </span>
                {lang === 'hi' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold hidden sm:inline-block bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                    कृषिसेवा
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold hidden sm:inline-block bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                    AgriTech
                  </span>
                )}
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden md:block">
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
          <div className="flex items-center gap-2.5" ref={menuRef}>
            
            {/* Quick Theme Toggle Icon Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm border border-emerald-900/10 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 transition-colors shadow-sm cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Quick Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="px-3.5 py-1.5 rounded-full border bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm border-emerald-900/10 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'hi' ? 'EN' : 'हिन्दी'}</span>
            </button>

            {/* Unauthenticated Quick Login Pill */}
            {(!currentUser || !currentUser.isAuthenticated) ? (
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm hover:shadow-emerald-500/20 active:scale-98 flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'लॉगिन करें' : 'Login'}</span>
              </button>
            ) : (
              /* Authenticated User Profile Pill Button */
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-sm active:scale-98 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-xs border border-emerald-200 dark:border-emerald-800/60">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold block leading-tight truncate max-w-[100px]">
                    {currentUser?.name || (currentUser?.role === 'driver' ? 'Driver' : 'Farmer')}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize block">
                    {currentUser?.role || 'User'}
                  </span>
                </div>
                <Menu className="w-4 h-4 text-slate-500 ml-0.5" />
              </button>
            )}

            {/* Dropdown Menu Modal */}
            {isMenuOpen && currentUser && (
              <div className="absolute right-4 top-16 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 space-y-3 z-50 animate-scale-in">
                
                {/* User Header */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-base border border-emerald-500/20">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {currentUser?.name || 'Krishi User'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      +91 {currentUser?.phone || ''}
                    </p>
                  </div>
                </div>

                {/* Farmer Actions */}
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
                      className="w-full p-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
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
                      className="w-full p-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
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
                      className="w-full p-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
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

                {/* Account & Logout */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-between text-xs font-semibold transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>{lang === 'hi' ? 'लॉगआउट करें' : 'Logout'}</span>
                    </div>
                  </button>

                  {currentUser?.role === 'farmer' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsDeleteAccountModalOpen(true);
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 flex items-center justify-between text-xs font-semibold transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <Trash2 className="w-4 h-4 text-red-500" />
                        <span>{lang === 'hi' ? 'खाता हटाएं' : 'Delete Account'}</span>
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
