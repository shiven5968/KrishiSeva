import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeSync } from '../../context/RealtimeSyncContext';
import { useSavedLands } from '../../context/SavedLandsContext';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import { 
  Tractor, 
  Globe, 
  ShieldCheck, 
  LogOut,
  LogIn,
  Bookmark
} from 'lucide-react';

export default function Navbar({ onOpenAuthModal, onOpenSavedLandsModal }) {
  const { lang, toggleLanguage } = useLanguage();
  const { activeRole, setActiveRole, currentUser, driverProfile, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
      <header className="sticky top-0 z-50 bg-stone-950/95 backdrop-blur-md border-b border-stone-800 shadow-md text-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Brand Logo - Returns to logged-in dashboard */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer group"
            title={currentUser ? "Go to Dashboard" : "Return to Home"}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              <Tractor className="w-6 h-6 animate-pulse-slow text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-white tracking-tight">Krishi<span className="text-amber-400">Seva</span></span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 font-bold hidden sm:inline-block">कृषि सेवा</span>
              </div>
              <p className="text-[10px] text-stone-400 font-medium hidden md:block">
                {lang === 'hi' ? 'ना बिचौलिया, ना इंतज़ार — मशीन सीधा खेत पर' : 'Not a Call, Just a Click — Machinery to your Farm'}
              </p>
            </div>
          </div>

          {/* STRICT ROLE-BASED NAVIGATION */}
          
          {/* 1. FARMER VIEW */}
          {currentUser && currentUser.role === 'farmer' && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => onOpenSavedLandsModal && onOpenSavedLandsModal()}
                className="px-3.5 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-700/60 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'hi' ? 'सहेजे गए खेत' : 'My Saved Lands'}</span>
              </button>
            </div>
          )}

          {/* 2. DRIVER VIEW */}
          {currentUser && currentUser.role === 'driver' && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="px-3 py-1 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${driverProfile.status === 'online' ? 'bg-amber-500 animate-pulse' : 'bg-stone-500'}`} />
                <span className="text-xs font-bold text-stone-300">
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
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-bold shadow-sm transition active:scale-95 hover:border-amber-500/40"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>

            {/* User Profile & Explicit Logout */}
            {currentUser && currentUser.isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-stone-900 rounded-xl border border-stone-700 text-xs font-black text-stone-200 flex items-center gap-1.5">
                  <span>{currentUser.role === 'farmer' ? '🌾' : currentUser.role === 'driver' ? '🚜' : '🛡️'}</span>
                  <span className="max-w-[120px] truncate">{currentUser.name?.split(' ')[0] || currentUser.name || 'User'}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 uppercase">
                    {currentUser.role}
                  </span>
                </div>

                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-red-950 text-stone-300 hover:text-red-400 border border-stone-700 hover:border-red-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                  title="Log out of this session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{lang === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 text-xs font-black shadow-lg shadow-amber-500/20 transition active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Logout Confirmation Modal (Yes / No) */}
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={handleConfirmLogout}
        userName={currentUser?.name}
        userRole={currentUser?.role}
      />
    </>
  );
}
