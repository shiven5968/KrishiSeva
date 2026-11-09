import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
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
import NotFoundPage from './components/common/NotFoundPage';
import Footer from './components/common/Footer';
import Breadcrumbs from './components/common/Breadcrumbs';
import PrivacyPolicyModal from './components/common/PrivacyPolicyModal';
import ContactUsModal from './components/common/ContactUsModal';
import TermsModal from './components/common/TermsModal';
import { updatePageSEO } from './utils/seoHelper';
import { trackPageView } from './services/analytics';

function MainContent() {
  const { activeRole, setActiveRole, driverProfile, currentUser } = useAuth();
  const { activeBooking } = useRealtimeSync();
  const { isDark } = useTheme();
  const { lang } = useLanguage();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSavedLandsModalOpen, setIsSavedLandsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [is404, setIs404] = useState(false);

  // Synchronize hash with active route, 301 alias rewrites, SEO updates, and role locking
  useEffect(() => {
    const handleRouteFromHash = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();

      // Item 10: 301 Aliases & Route Rewrites
      if (hash === '#book' || hash === '#tractor' || pathname === '/book' || pathname === '/tractor') {
        window.location.hash = '#farmer';
        return;
      }
      if (hash === '#register' || hash === '#fleet' || pathname === '/driver-register' || pathname === '/fleet') {
        window.location.hash = '#driver';
        return;
      }

      // Intercept direct modal triggers (from URL / footer links)
      if (hash === '#contact' || pathname === '/contact-us') {
        setIsContactModalOpen(true);
      }
      if (hash === '#privacy' || pathname === '/privacy-policy') {
        setIsPrivacyModalOpen(true);
      }
      if (hash === '#terms' || pathname === '/terms') {
        setIsTermsModalOpen(true);
      }

      // Item 9: 404 Route handling
      if (hash === '#404' || pathname === '/404') {
        setIs404(true);
        updatePageSEO('not_found');
        trackPageView('/404', 'KrishiSeva - 404 Lost in Fields');
        return;
      } else {
        setIs404(false);
      }

      // 1. IF LOGGED IN: Lock the session strictly to the authenticated role
      if (currentUser && currentUser.isAuthenticated) {
        if (currentUser.role === 'farmer') {
          setActiveRole('farmer');
          if (hash !== '#farmer') window.location.hash = '#farmer';
          updatePageSEO('farmer');
          trackPageView('/farmer', 'KrishiSeva - Farmer Booking Cockpit');
        } else if (currentUser.role === 'driver') {
          setActiveRole('driver');
          if (hash !== '#driver') window.location.hash = '#driver';
          updatePageSEO('driver');
          trackPageView('/driver', 'KrishiSeva - Operator Telemetry Hub');
        } else if (currentUser.role === 'admin') {
          setActiveRole('admin');
          if (hash !== '#admin') window.location.hash = '#admin';
          updatePageSEO('admin');
          trackPageView('/admin', 'KrishiSeva - Regional Admin Control Room');
        }
        return;
      }

      // 2. IF NOT LOGGED IN: Allow hash routing to login screens or landing
      if (hash === '#admin' || pathname === '/admin') {
        setActiveRole('admin');
        updatePageSEO('admin');
        trackPageView('/admin', 'KrishiSeva - Admin Authentication Gate');
      } else if (hash === '#farmer') {
        setActiveRole('farmer');
        updatePageSEO('farmer');
        trackPageView('/farmer', 'KrishiSeva - Farmer Portal');
      } else if (hash === '#driver') {
        setActiveRole('driver');
        updatePageSEO('driver');
        trackPageView('/driver', 'KrishiSeva - Partner Pilot Portal');
      } else {
        setActiveRole('landing');
        updatePageSEO('landing');
        trackPageView('/', 'KrishiSeva - Precision Farm Fleet Ecosystem');
      }
    };

    handleRouteFromHash();
    window.addEventListener('hashchange', handleRouteFromHash);
    return () => window.removeEventListener('hashchange', handleRouteFromHash);
  }, [currentUser, setActiveRole]);

  // Dedicated 404 View
  if (is404) {
    return (
      <div className={`min-h-screen flex flex-col selection:bg-[#1A4F32] selection:text-white transition-colors duration-500 relative ${isDark ? 'bg-[#080E0B] text-[#EAEFEA]' : 'bg-[#FDFBF7] text-[#0B1E14]'}`}>
        <Navbar 
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenSavedLandsModal={() => setIsSavedLandsModalOpen(true)}
        />
        <main className="flex-1">
          <NotFoundPage onNavigateHome={() => {
            setIs404(false);
            window.location.hash = '';
            setActiveRole('landing');
          }} />
        </main>
        <Footer 
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
          onOpenContact={() => setIsContactModalOpen(true)}
          onOpenTerms={() => setIsTermsModalOpen(true)}
        />
        <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
        <ContactUsModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
        <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
      </div>
    );
  }

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
          <Footer 
            onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
            onOpenContact={() => setIsContactModalOpen(true)}
            onOpenTerms={() => setIsTermsModalOpen(true)}
          />
          <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
          <ContactUsModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
          <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
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

      {/* Item 15: Breadcrumb navigation */}
      <Breadcrumbs 
        items={[
          { label: lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home', href: '/', onClick: () => { window.location.hash = ''; } },
          { 
            label: currentUser.role === 'farmer' 
              ? (hasActiveBooking 
                  ? (lang === 'hi' ? 'लाइव जीपीएस ट्रैकिंग' : 'Live Fleet Tracking')
                  : (lang === 'hi' ? 'किसान बुकिंग कॉकपिट' : 'Farmer Booking Cockpit'))
              : (lang === 'hi' ? 'पायलट ऑपरेटर टेलीमेट्री' : 'Operator Telemetry Hub')
          }
        ]} 
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

      {/* Item 16: Launch-Ready Global Footer with SEO Internal Links & Helpline */}
      <Footer 
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
        onOpenTerms={() => setIsTermsModalOpen(true)}
      />

      {/* Global Modals */}
      <UniversalAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SavedLandsModal
        isOpen={isSavedLandsModalOpen}
        onClose={() => setIsSavedLandsModalOpen(false)}
      />

      {/* Items 19 & 20: Privacy Policy & Contact Us Modals */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />
      <ContactUsModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
      <TermsModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
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
