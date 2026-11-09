// Google Analytics 4 (GA4) & User Telemetry Tracker for KrishiSeva
// Compliant with user privacy and offline fallback

export const GA_MEASUREMENT_ID = 'G-KRISHISEVA26';

/**
 * Track Page Views across single-page hash navigation
 */
export function trackPageView(path, title) {
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: title
      });
    } catch (e) {
      console.debug('[GA4] Pageview tracking failed:', e);
    }
  }
}

/**
 * Track Custom Product & Conversion Events
 */
export function trackEvent(action, params = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', action, params);
    } catch (e) {
      console.debug('[GA4] Event tracking failed:', e);
    }
  }
}

// Pre-defined KrishiSeva conversion events
export const ANALYTICS_EVENTS = {
  FARMER_BOOKING_INITIATED: 'farmer_booking_initiated',
  FARMER_BOOKING_CONFIRMED: 'farmer_booking_confirmed',
  AGRISTACK_EKYC_VERIFIED: 'agristack_ekyc_verified',
  BATAI_PLOT_LOCKED: 'batai_plot_locked',
  DRIVER_KYC_SUBMITTED: 'driver_kyc_submitted',
  CONTACT_FORM_SUBMITTED: 'contact_form_submitted',
  LANGUAGE_TOGGLED: 'language_toggled',
  CALL_HELPLINE_CLICKED: 'call_helpline_clicked'
};
