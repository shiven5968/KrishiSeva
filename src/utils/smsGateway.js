// Live WhatsApp Telephony Gateway for KrishiSeva
// Provider: UltraMsg WhatsApp Business Gateway (Instance #191614)

export const ULTRAMSG_CONFIG = {
  INSTANCE_ID: 'instance191614',
  TOKEN: 'g2ohdgy9do3n1tj8',
  ENDPOINT: 'https://api.ultramsg.com/instance191614/messages/chat',
  RESEND_ENDPOINT: 'https://api.ultramsg.com/instance191614/messages/resendByStatus'
};

// ─────────────────────────────────────────────────────────────
// Phone Number Sanitization & Formatting Helper (e.g. 919876543210)
// ─────────────────────────────────────────────────────────────
export function formatIndianPhoneNumber(rawPhone) {
  let cleaned = String(rawPhone || '').replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }
  return cleaned.slice(-10);
}

// ─────────────────────────────────────────────────────────────
// Dynamic WhatsApp OTP Dispatch via UltraMsg
// ─────────────────────────────────────────────────────────────
export async function sendRealWhatsAppOtp(phoneNumber, otpCode, lang = 'en') {
  // 1. Sanitize & extract 10-digit mobile number
  const cleanNumber = formatIndianPhoneNumber(phoneNumber);

  if (!cleanNumber || cleanNumber.length !== 10) {
    console.error(`[UltraMsg Gateway] Invalid 10-digit phone number: "${phoneNumber}"`);
    return { 
      success: false, 
      error: 'Please enter a valid 10-digit mobile number' 
    };
  }

  // 2. Format to country code without '+' (e.g. 919876543210)
  const formattedRecipient = `91${cleanNumber}`;
  console.info(`[UltraMsg Gateway] Sending WhatsApp OTP ${otpCode} to ${formattedRecipient}`);

  // 3. Message Body
  const messageBody = lang === 'hi' ?
`🚜 *कृषि सेवा (KrishiSeva)* 🌾

नमस्ते!
आपका कृषि सेवा सत्यापन ओटीपी है: *${otpCode}*

⚡ 5 मिनट के लिए मान्य।
🔒 कृपया यह सुरक्षा कोड किसी के साथ साझा न करें।

खेत आपका, तकनीक हमारी — 1-क्लिक में मशीन खेत पर तैयार!`
:
`Your KrishiSeva verification code is ${otpCode}. Valid for 5 minutes. Do not share this code.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const response = await fetch(ULTRAMSG_CONFIG.ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        token: ULTRAMSG_CONFIG.TOKEN,
        to: formattedRecipient,
        body: messageBody,
        priority: '10'
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    console.info(`[UltraMsg Gateway] Response for ${formattedRecipient}:`, data);

    const isUnauthenticated = data.message && (
      data.message.toLowerCase().includes('not authenticated') ||
      data.message.toLowerCase().includes('not connected') ||
      data.message.toLowerCase().includes('qr')
    );

    const isTemporaryBlock = data.message && (
      data.message.toLowerCase().includes('temporary_block') ||
      data.message.toLowerCase().includes('block')
    );

    if ((data.sent === "true" || data.success === true || !!data.id) && !isUnauthenticated && !isTemporaryBlock) {
      // Auto-flush unsent queue immediately
      fetch(ULTRAMSG_CONFIG.RESEND_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: ULTRAMSG_CONFIG.TOKEN, status: 'unsent' })
      }).catch(() => {});

      return { 
        success: true, 
        provider: 'UltraMsg WhatsApp API', 
        status: 'Sent', 
        recipient: formattedRecipient,
        messageId: data.id, 
        data 
      };
    } else {
      const errorMsg = isUnauthenticated 
        ? 'UltraMsg WhatsApp instance is not paired yet. Please scan QR on UltraMsg.' 
        : isTemporaryBlock 
          ? 'WhatsApp temporary block on new contact. Use fallback code.'
          : (data.message || data.error || 'WhatsApp message dispatch delayed.');

      console.warn(`[UltraMsg Gateway] Delivery warning for ${formattedRecipient}: ${errorMsg}`, data);

      return { 
        success: false, 
        isDelayed: true, 
        provider: 'UltraMsg', 
        status: 'Delayed', 
        recipient: formattedRecipient, 
        error: errorMsg, 
        data 
      };
    }
  } catch (err) {
    console.error(`[UltraMsg Gateway] Network error dispatching to ${formattedRecipient}:`, err);
    return { 
      success: false, 
      isDelayed: true, 
      provider: 'UltraMsg', 
      status: 'Failed', 
      recipient: formattedRecipient, 
      error: 'WhatsApp delivery timed out. Please check network.' 
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Aadhaar e-KYC Notification via WhatsApp
// ─────────────────────────────────────────────────────────────
export async function sendAadhaarEkycSms(phoneNumber, aadhaarOtp, maskedAadhaar) {
  const cleanNumber = formatIndianPhoneNumber(phoneNumber);
  sendRealWhatsAppOtp(cleanNumber, aadhaarOtp).catch(() => {});
  return { success: true };
}
