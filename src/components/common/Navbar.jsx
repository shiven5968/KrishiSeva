import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeSync } from '../../context/RealtimeSyncContext';
import { useSavedLands } from '../../context/SavedLandsContext';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import FarmerBookingHistoryModal from '../farmer/FarmerBookingHistoryModal';
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
  Trash2
} from 'lucide-react';

export default function Navbar({ onOpenAuthModal, onOpenSavedLandsModal }) {
  const { lang, toggleLanguage } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const { activeRole, setActiveRole, currentUser, driverProfile, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  // Clicking Logo returns user to their authenticated home dashboard (NOT logged out)
  const handleLogoClick = () => {
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

          {/* STRICT ROLE-BASED NAVIGATION */}
          
          {/* 1. DRIVER VIEW */}
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

          {/* 3. ADMIN VIEW */}
          {currentUser && currentUser.role === 'admin' && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-purple-950 text-purple-300 border border-purple-700 font-black text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Admin Console</span>
              </span>
            </div>
          )}

          {/* Right Utility Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Theme Toggle Button (Dark 🌙 / Light ☀️) */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-sm transition active:scale-95 ${
                isDark 
                  ? 'border-stone-800 bg-stone-900 hover:bg-stone-800 text-amber-400 hover:border-amber-500/40' 
                  : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:border-slate-300'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-sm transition active:scale-95 ${
                isDark 
                  ? 'border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-200 hover:border-emerald-500/40' 
                  : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:border-slate-300'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>

            {/* Farmer Booking History Button */}
            {currentUser && currentUser.role === 'farmer' && (
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-sm transition active:scale-95 ${
                  isDark 
                    ? 'border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300' 
                    : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                }`}
                title={lang === 'hi' ? 'बुकिंग इतिहास देखें' : 'View Booking History'}
              >
                <History className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{lang === 'hi' ? 'इतिहास' : 'History'}</span>
              </button>
            )}

            {/* User Profile & Explicit Logout */}
            {currentUser && currentUser.isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 ${
                  isDark ? 'bg-stone-900 border-stone-700 text-stone-200' : 'bg-slate-100 border-slate-200 text-slate-900'
                }`}>
                  <span>{currentUser.role === 'farmer' ? '🌾' : currentUser.role === 'driver' ? '🚜' : '🛡️'}</span>
                  <span className="max-w-[120px] truncate">{currentUser.name?.split(' ')[0] || currentUser.name || 'User'}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    isDark ? 'bg-stone-800 text-stone-400' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>

                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
                    isDark 
                      ? 'bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white border-stone-700 hover:border-stone-600' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300'
                  }`}
                  title="Log out of this session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{lang === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
                </button>

                {/* Farmer / User Delete Account Option */}
                {currentUser.role === 'farmer' && (
                  <button
                    onClick={() => setIsDeleteAccountModalOpen(true)}
                    className={`px-2.5 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1 transition active:scale-95 ${
                      isDark 
                        ? 'bg-stone-900 hover:bg-red-950 text-stone-400 hover:text-red-400 border-stone-800 hover:border-red-800/60' 
                        : 'bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border-slate-200 hover:border-red-200'
                    }`}
                    title={lang === 'hi' ? 'खाता हमेशा के लिए हटाएं (Delete Account)' : 'Delete Account Permanently'}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span className="hidden md:inline">{lang === 'hi' ? 'खाता हटाएं' : 'Delete'}</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Farmer Booking History Modal */}
      <FarmerBookingHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* Logout Confirmation Modal (Yes / No) */}
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
