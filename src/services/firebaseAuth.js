// Firebase Phone Authentication Service for KrishiSeva
import { auth, app, RecaptchaVerifier, signInWithPhoneNumber } from '../firebase';

export { auth, app };

// Configure invisible RecaptchaVerifier attached to recaptcha-container
export function getRecaptchaVerifier(containerId = 'recaptcha-container') {
  if (typeof window === 'undefined') return null;

  // Verify DOM container exists
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[Firebase Auth] #${containerId} not found in DOM, falling back to body.`);
  }

  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {}
    window.recaptchaVerifier = null;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('[Firebase Auth] reCAPTCHA verified successfully.');
    },
    'expired-callback': () => {
      console.warn('[Firebase Auth] reCAPTCHA expired, resetting verifier.');
    }
  });

  return window.recaptchaVerifier;
}

// Send Real SMS OTP via Firebase Phone Auth to +91XXXXXXXXXX
export async function sendFirebasePhoneOtp(phoneNumber, containerId = 'recaptcha-container') {
  const cleanNumber = String(phoneNumber || '').replace(/\D/g, '').slice(-10);
  if (cleanNumber.length !== 10) {
    return { success: false, error: 'Please enter a valid 10-digit mobile number' };
  }

  const formattedPhone = `+91${cleanNumber}`;
  console.log(`[Firebase Auth] Initiating signInWithPhoneNumber for: ${formattedPhone}`);

  try {
    const appVerifier = getRecaptchaVerifier(containerId);
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    window.confirmationResult = confirmationResult;
    return { success: true, confirmationResult, phone: formattedPhone };
  } catch (error) {
    console.error('[Firebase Auth] Detailed Dispatch Error:', error);
    
    // Clear verifier on failure so next attempt gets fresh instance
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      } catch (e) {}
    }

    const errorCode = error?.code || 'auth/unknown';
    let detailedMsg = `[${errorCode}]: ${error.message}`;

    if (errorCode === 'auth/unauthorized-domain') {
      detailedMsg = `[auth/unauthorized-domain]: This domain (${window.location.hostname}) is not authorized in Firebase Console. Go to Firebase Console -> Authentication -> Settings -> Authorized Domains -> Add '${window.location.hostname}'.`;
    } else if (errorCode === 'auth/invalid-phone-number') {
      detailedMsg = `[auth/invalid-phone-number]: Invalid phone number format (+91${cleanNumber}).`;
    } else if (errorCode === 'auth/too-many-requests') {
      detailedMsg = `[auth/too-many-requests]: SMS quota limit or too many attempts. Please try again later.`;
    } else if (errorCode === 'auth/captcha-check-failed') {
      detailedMsg = `[auth/captcha-check-failed]: Google reCAPTCHA verification failed. Please try again.`;
    } else if (errorCode === 'auth/operation-not-allowed') {
      detailedMsg = `[auth/operation-not-allowed]: Phone Provider is not enabled in Firebase Console. Please enable Phone Auth in Firebase Console -> Authentication -> Sign-in method.`;
    }

    return { 
      success: false, 
      error: detailedMsg, 
      code: errorCode, 
      rawError: error 
    };
  }
}

// Verify 6-digit OTP using confirmationResult.confirm(otpCode)
export async function verifyFirebaseOtp(otpCode) {
  if (!window.confirmationResult) {
    return { success: false, error: '[auth/session-expired]: OTP session expired. Please request a new code.' };
  }

  try {
    const userCredential = await window.confirmationResult.confirm(otpCode);
    const user = userCredential.user;
    return { success: true, user };
  } catch (error) {
    console.error('[Firebase Auth] Verification Error:', error);
    const errorCode = error?.code || 'auth/unknown';
    let friendlyError = `[${errorCode}]: ${error.message}`;

    if (errorCode === 'auth/invalid-verification-code') {
      friendlyError = '[auth/invalid-verification-code]: Incorrect OTP code. Please enter the 6-digit code received on your phone.';
    } else if (errorCode === 'auth/code-expired') {
      friendlyError = '[auth/code-expired]: OTP has expired. Please click "Resend OTP".';
    }
    return { success: false, error: friendlyError, code: errorCode, rawError: error };
  }
}
