// Firebase Phone Authentication Service for KrishiSeva
import { auth, app } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export { auth, app, RecaptchaVerifier, signInWithPhoneNumber };

// Configure invisible RecaptchaVerifier attached to recaptcha-container
export function getRecaptchaVerifier(containerId = 'recaptcha-container') {
  if (typeof window === 'undefined') return null;

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
    console.error('[Firebase Auth] Dispatch Error:', error);
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      } catch (e) {}
    }

    let friendlyError = error.message;
    if (error.code === 'auth/invalid-phone-number') {
      friendlyError = 'Invalid mobile number format.';
    } else if (error.code === 'auth/too-many-requests') {
      friendlyError = 'Too many requests. Please wait a few moments before trying again.';
    } else if (error.code === 'auth/captcha-check-failed') {
      friendlyError = 'Google reCAPTCHA verification failed. Please try again.';
    } else if (error.code === 'auth/operation-not-allowed') {
      friendlyError = 'Phone Auth is not enabled in Firebase Console. Please verify Phone Provider is enabled.';
    }

    return { success: false, error: friendlyError, rawError: error };
  }
}

// Verify 6-digit OTP using confirmationResult.confirm(otpCode)
export async function verifyFirebaseOtp(otpCode) {
  if (!window.confirmationResult) {
    return { success: false, error: 'OTP session expired. Please request a new code.' };
  }

  try {
    const userCredential = await window.confirmationResult.confirm(otpCode);
    const user = userCredential.user;
    return { success: true, user };
  } catch (error) {
    console.error('[Firebase Auth] Verification Error:', error);
    let friendlyError = 'Invalid OTP code. Please try again.';
    if (error.code === 'auth/invalid-verification-code') {
      friendlyError = 'Incorrect OTP. Please enter the 6-digit code received on your phone.';
    } else if (error.code === 'auth/code-expired') {
      friendlyError = 'OTP has expired. Please click "Resend OTP".';
    }
    return { success: false, error: friendlyError, rawError: error };
  }
}
