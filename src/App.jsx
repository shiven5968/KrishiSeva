import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PricingProvider } from './context/PricingContext';
import { SavedLandsProvider } from './context/SavedLandsContext';
import { PreBookingsProvider } from './context/PreBookingsContext';
import { RealtimeSyncProvider, useRealtimeSync } from './context/RealtimeSyncContext';
import Navbar from './components/common/Navbar';
import CreativeLoginPortal from './components/auth/CreativeLoginPortal';
import UniversalAuthModal from './components/auth/UniversalAuthModal';
import SavedLandsModal from './components/farmer/SavedLandsModal';
import FarmerBookingView from './components/farmer/FarmerBookingView';
import FarmerLiveTracking from './components/farmer/FarmerLiveTracking';
import DriverRegistration from './components/driver/DriverRegistration';
import DriverPendingScreen from './components/driver/DriverPendingScreen';
import DriverDashboard from './components/driver/DriverDashboard';
import AdminPortal from './components/admin/AdminPortal';
import AdminLoginGate from './components/admin/AdminLoginGate';

function MainContent() {
  const { activeRole, setActiveRole, driverProfile, currentUser } = useAuth();
  const { activeBooking } = useRealtimeSync();
  const { isDark } = useTheme();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSavedLandsModalOpen, setIsSavedLandsModalOpen] = useState(false);

  // Synchronize hash with active route and enforce authenticated role locking
  useEffect(() => {
    const handleRouteFromHash = () => {
      const hash = window.location.hash;

      // 1. IF LOGGED IN: Lock the session strictly to the authenticated role
      if (currentUser && currentUser.isAuthenticated) {
        if (currentUser.role === 'farmer') {
          setActiveRole('farmer');
          if (hash !== '#farmer') window.location.hash = '#farmer';
        } else if (currentUser.role === 'driver') {
          setActiveRole('driver');
          if (hash !== '#driver') window.location.hash = '#driver';
        } else if (currentUser.role === 'admin') {
          setActiveRole('admin');
          if (hash !== '#admin') window.location.hash = '#admin';
        }
        return;
      }

      // 2. IF NOT LOGGED IN: Allow hash routing to login screens or landing
      if (hash === '#admin' || window.location.pathname === '/admin') {
        setActiveRole('admin');
      } else if (hash === '#farmer') {
        setActiveRole('farmer');
      } else if (hash === '#driver') {
        setActiveRole('driver');
      } else {
        setActiveRole('landing');
      }
    };

    handleRouteFromHash();
    window.addEventListener('hashchange', handleRouteFromHash);
    return () => window.removeEventListener('hashchange', handleRouteFromHash);
  }, [currentUser, setActiveRole]);

  // 1. ADMIN ROUTE
  if (activeRole === 'admin' || currentUser?.role === 'admin') {
    if (currentUser?.role === 'admin') {
      return (
        <div className={`min-h-screen flex flex-col selection:bg-[#1A4F32] selection:text-white transition-colors duration-500 relative ${isDark ? 'bg-[#080E0B] text-[#EAEFEA]' : 'bg-[#FDFBF7] text-[#0B1E14]'}`}>
          {/* Global Tactile Paper Grain Overlay */}
          <div 
            className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] dark:opacity-[0.025] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />
          <Navbar 
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenSavedLandsModal={() => setIsSavedLandsModalOpen(true)}
          />
          <main className="flex-1 pb-16 animate-fade-in">
            <AdminPortal />
          </main>
        </div>
      );
    }
    return <AdminLoginGate onAdminLoginSuccess={() => setActiveRole('admin')} />;
  }

  // 2. UNAUTHENTICATED SESSION -> Creative Login Portal
  if (!currentUser || !currentUser.isAuthenticated) {
    return <CreativeLoginPortal />;
  }

  // Check strictly if there is an active running booking (including completed for 5-star rating)
  const hasActiveBooking = activeBooking && ['searching', 'accepted', 'arrived', 'in_progress', 'completed'].includes(activeBooking.status);

  return (
    <div className={`min-h-screen flex flex-col selection:bg-[#1A4F32] selection:text-white transition-colors duration-500 relative ${isDark ? 'bg-[#080E0B] text-[#EAEFEA]' : 'bg-[#FDFBF7] text-[#0B1E14]'}`}>
      
      {/* Global Tactile Paper Grain Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] dark:opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Strict Role-Locked Navbar */}
      <Navbar 
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSavedLandsModal={() => setIsSavedLandsModalOpen(true)}
      />

      <main className="flex-1 pb-16 animate-fade-in">
        
        {/* 1. STRICT FARMER VIEW: Locked to Farmer account */}
        {currentUser.role === 'farmer' && (
          <>
            {hasActiveBooking ? (
              <FarmerLiveTracking />
            ) : (
              <FarmerBookingView 
                onOpenAuthModal={() => setIsAuthModalOpen(true)} 
                onOpenSavedLandsModal={() => setIsSavedLandsModalOpen(true)}
              />
            )}
          </>
        )}

        {/* 2. STRICT DRIVER VIEW: Locked to Driver account */}
        {currentUser.role === 'driver' && (
          <>
            {(!currentUser.isDriverOnboarded && driverProfile.verificationStatus === 'unregistered') && <DriverRegistration />}
            {(!currentUser.isDriverOnboarded && (driverProfile.verificationStatus === 'pending' || driverProfile.verificationStatus === 'rejected')) && (
              <DriverPendingScreen />
            )}
            {(currentUser.isDriverOnboarded || driverProfile.verificationStatus === 'verified') && <DriverDashboard />}
          </>
        )}

      </main>

      {/* Global Modals */}
      <UniversalAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SavedLandsModal
        isOpen={isSavedLandsModalOpen}
        onClose={() => setIsSavedLandsModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <PricingProvider>
            <SavedLandsProvider>
              <PreBookingsProvider>
                <RealtimeSyncProvider>
                  <MainContent />
                </RealtimeSyncProvider>
              </PreBookingsProvider>
            </SavedLandsProvider>
          </PricingProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
