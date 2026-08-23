// Firebase Phone Authentication Service for KrishiSeva
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAKA0aYELgi7U4lNy8qPdsKU4Id6pYCiSM",
  authDomain: "krishiseva-95318.firebaseapp.com",
  projectId: "krishiseva-95318",
  storageBucket: "krishiseva-95318.firebasestorage.app",
  messagingSenderId: "99454088088"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure invisible reCAPTCHA verifier
export function setupRecaptcha(containerId = 'recaptcha-container') {
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
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired. Resetting verifier.');
    }
  });

  return window.recaptchaVerifier;
}

// Send OTP via Firebase Phone Auth to +91XXXXXXXXXX
export async function sendFirebasePhoneOtp(phoneNumber, containerId = 'recaptcha-container') {
  const cleanNumber = String(phoneNumber || '').replace(/\D/g, '').slice(-10);
  if (cleanNumber.length !== 10) {
    return { success: false, error: 'Please enter a valid 10-digit mobile number' };
  }

  const formattedPhone = `+91${cleanNumber}`;
  console.log(`[Firebase Auth] Initiating signInWithPhoneNumber to: ${formattedPhone}`);

  try {
    const appVerifier = setupRecaptcha(containerId);
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
      friendlyError = 'Invalid phone number format.';
    } else if (error.code === 'auth/too-many-requests') {
      friendlyError = 'Too many requests. Please try again in a few minutes.';
    } else if (error.code === 'auth/captcha-check-failed') {
      friendlyError = 'reCAPTCHA verification failed. Please refresh and try again.';
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
      friendlyError = 'Invalid verification code. Please check the SMS and re-enter.';
    } else if (error.code === 'auth/code-expired') {
      friendlyError = 'OTP has expired. Please request a new verification code.';
    }
    return { success: false, error: friendlyError, rawError: error };
  }
}
