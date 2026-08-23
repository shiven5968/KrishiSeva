// Live WhatsApp & SMS Telephony Gateway for KrishiSeva
// Primary Provider: UltraMsg WhatsApp Business Gateway (Instance #189242)

export const SMS_PROVIDERS = {
  ULTRAMSG: 'ultramsg',
  META_WHATSAPP: 'meta',
  TWILIO_WHATSAPP: 'twiliowa',
  FAST2SMS: 'fast2sms',
  TWILIO_SMS: 'twilio'
};

// ─────────────────────────────────────────────────────────────
// Phone Number Sanitization & Formatting Helper
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
// 1. Dynamic WhatsApp OTP Dispatch via UltraMsg
// ─────────────────────────────────────────────────────────────
export async function sendRealWhatsAppOtp(phoneNumber, otpCode, lang = 'en') {
  // 1. Sanitize & clean input phone number
  const cleanNumber = formatIndianPhoneNumber(phoneNumber);

  if (!cleanNumber || cleanNumber.length !== 10) {
    console.error(`[UltraMsg Gateway] Invalid 10-digit phone number provided: "${phoneNumber}"`);
    return { success: false, error: 'Please enter a valid 10-digit mobile number' };
  }

  // 2. Dynamic Recipient Binding (+91XXXXXXXXXX)
  const formattedPhoneNumber = `+91${cleanNumber}`;
  console.log(`[UltraMsg Gateway] Sending OTP ${otpCode} dynamically to recipient: ${formattedPhoneNumber}`);

  // 3. Message Template Body
  const messageText = lang === 'hi' ?
`🚜 *कृषि सेवा (KrishiSeva)* 🌾

नमस्ते!
आपका कृषि सेवा सत्यापन ओटीपी है: *${otpCode}*

⚡ 5 मिनट के लिए मान्य।
🔒 कृपया यह सुरक्षा कोड किसी के साथ साझा न करें।

खेत आपका, तकनीक हमारी — 1-क्लिक में मशीन खेत पर तैयार!`
:
`Your KrishiSeva verification code is ${otpCode}. Valid for 5 minutes. Do not share this code.`;

  // 4. UltraMsg Endpoint & Dynamic Payload
  const instanceId = 'instance189242';
  const token = '93rhhy7fj9ea2k81';

  try {
    const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        token: token,
        to: formattedPhoneNumber, // Dynamically bound from user input
        body: messageText,
        priority: '10'
      })
    });

    const data = await response.json();
    console.log(`[UltraMsg Gateway] Delivery response for ${formattedPhoneNumber}:`, data);

    const isUnauthenticated = data.message && (
      data.message.toLowerCase().includes('not authenticated') ||
      data.message.toLowerCase().includes('not connected') ||
      data.message.toLowerCase().includes('qr')
    );

    if ((data.sent === "true" || data.success === true || !!data.id) && !isUnauthenticated) {
      // Auto-flush unsent queue immediately to prevent hold-ups
      fetch(`https://api.ultramsg.com/${instanceId}/messages/resendByStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: token, status: 'unsent' })
      }).catch(() => {});

      return { 
        success: true, 
        provider: 'UltraMsg WhatsApp API', 
        status: 'Sent', 
        recipient: formattedPhoneNumber,
        messageId: data.id, 
        data 
      };
    } else {
      const errorMsg = isUnauthenticated 
        ? 'UltraMsg WhatsApp instance is not paired yet. Please scan QR on UltraMsg.' 
        : (data.message || data.error || 'UltraMsg failed to deliver message');
      return { success: false, provider: 'UltraMsg', status: 'Failed', recipient: formattedPhoneNumber, error: errorMsg, data };
    }
  } catch (err) {
    console.error(`[UltraMsg Gateway] Network error dispatching to ${formattedPhoneNumber}:`, err);
    return { success: false, provider: 'UltraMsg', status: 'Failed', recipient: formattedPhoneNumber, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// 2. Regular Carrier SMS Fallback (Fast2SMS / Twilio)
// ─────────────────────────────────────────────────────────────
export async function sendRealSmsToPhone(phoneNumber, otpCode) {
  const cleanNumber = formatIndianPhoneNumber(phoneNumber);
  const fast2smsKey = localStorage.getItem('krishi_fast2sms_api_key');
  const twilioConfig = localStorage.getItem('krishi_twilio_config');

  if (fast2smsKey) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2smsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otpCode,
          numbers: cleanNumber
        })
      });
      const data = await response.json();
      return { success: data.return === true, provider: 'Fast2SMS', data };
    } catch (err) {
      console.warn('Fast2SMS error:', err);
    }
  }

  if (twilioConfig) {
    try {
      const { accountSid, authToken, fromNumber } = JSON.parse(twilioConfig);
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const formData = new URLSearchParams();
      formData.append('To', `+91${cleanNumber}`);
      formData.append('From', fromNumber);
      formData.append('Body', `Your KrishiSeva verification code is ${otpCode}. Valid for 5 minutes. Do not share this code.`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });
      const data = await response.json();
      return { success: response.ok, provider: 'Twilio SMS', data };
    } catch (err) {
      console.warn('Twilio SMS error:', err);
    }
  }

  try {
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: `+91${cleanNumber}`,
        message: `Your KrishiSeva OTP is ${otpCode}. Valid for 5 mins.`,
        key: 'textbelt'
      })
    });
    const result = await response.json();
    return { success: result.success === true, provider: 'Textbelt', data: result };
  } catch (e) {
    return { success: false, error: 'No SMS Gateway configured' };
  }
}

// ─────────────────────────────────────────────────────────────
// 3. Aadhaar e-KYC Notification
// ─────────────────────────────────────────────────────────────
export async function sendAadhaarEkycSms(phoneNumber, aadhaarOtp, maskedAadhaar) {
  const cleanNumber = formatIndianPhoneNumber(phoneNumber);
  sendRealWhatsAppOtp(cleanNumber, aadhaarOtp).catch(() => {});
  sendRealSmsToPhone(cleanNumber, aadhaarOtp).catch(() => {});
  return { success: true };
}
