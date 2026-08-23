// Live SMS Telephony Gateway for sending real physical SMS to mobile numbers in India & Globally

export const SMS_PROVIDERS = {
  FAST2SMS: 'fast2sms',
  TWILIO: 'twilio',
  CUSTOM: 'custom'
};

// Send real SMS over telecom carrier networks
export async function sendRealSmsToPhone(phoneNumber, otpCode) {
  const cleanNumber = phoneNumber.replace(/\D/g, '').slice(-10);

  const fast2smsKey = localStorage.getItem('krishi_fast2sms_api_key');
  const twilioConfig = localStorage.getItem('krishi_twilio_config');

  // 1. If Fast2SMS API Key is present (Instant Delivery to Indian numbers)
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
      console.warn('Fast2SMS gateway error:', err);
    }
  }

  // 2. If Twilio credentials are saved
  if (twilioConfig) {
    try {
      const { accountSid, authToken, fromNumber } = JSON.parse(twilioConfig);
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const formData = new URLSearchParams();
      formData.append('To', `+91${cleanNumber}`);
      formData.append('From', fromNumber);
      formData.append('Body', `Your KrishiSeva verification OTP is ${otpCode}. Valid for 5 minutes.`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });
      const data = await response.json();
      return { success: response.ok, provider: 'Twilio', data };
    } catch (err) {
      console.warn('Twilio gateway error:', err);
    }
  }

  // 3. Fallback: Free Textbelt SMS Relay attempt
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

// Send UIDAI Aadhaar e-KYC Real SMS & WhatsApp
export async function sendAadhaarEkycSms(phoneNumber, aadhaarOtp, maskedAadhaar) {
  const cleanNumber = phoneNumber.replace(/\D/g, '').slice(-10);
  const message = `UIDAI / AgriStack: Your Aadhaar e-KYC OTP is *${aadhaarOtp}* for KrishiSeva land verification (Aadhaar: ${maskedAadhaar || 'XXXX-XXXX-1100'}). Valid for 10 mins. Do not share.`;

  // Also send via UltraMsg WhatsApp if available
  try {
    const ultramsgConfigStr = localStorage.getItem('krishi_ultramsg_config');
    let instance = 'instance189242';
    let token = '93rhhy7fj9ea2k81';
    if (ultramsgConfigStr) {
      const parsed = JSON.parse(ultramsgConfigStr);
      instance = parsed.instanceId || instance;
      token = parsed.token || token;
    }
    fetch(`https://api.ultramsg.com/${instance}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: token,
        to: `+91${cleanNumber}`,
        body: `🇮🇳 *UIDAI & AgriStack Land Registry* 🌾\n\nYour Aadhaar e-KYC Verification OTP is: *${aadhaarOtp}*\n\n(Aadhaar: ${maskedAadhaar || 'XXXX-XXXX-1100'})\n⚡ Valid for 10 minutes.`,
        priority: '10'
      })
    }).catch(() => {});
  } catch (e) {}

  const fast2smsKey = localStorage.getItem('krishi_fast2sms_api_key');
  if (fast2smsKey) {
    try {
      await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2smsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          numbers: cleanNumber
        })
      });
    } catch (e) {}
  }

  return { success: true, message };
}

// Send real automated WhatsApp message using UltraMsg WhatsApp Business Gateway
export async function sendRealWhatsAppOtp(phoneNumber, otpCode, lang = 'en') {
  const cleanNumber = phoneNumber.replace(/\D/g, '').slice(-10);

  const messageText = lang === 'hi' ?
`🚜 *कृषि सेवा (KrishiSeva)* 🌾

नमस्ते!
आपका कृषि सेवा सत्यापन ओटीपी है: *${otpCode}*

⚡ 5 मिनट के लिए मान्य।
🔒 कृपया यह सुरक्षा कोड किसी के साथ साझा न करें।

खेत आपका, तकनीक हमारी — 1-क्लिक में मशीन खेत पर तैयार!`
:
`🚜 *KrishiSeva* 🌾

Hello!
Your KrishiSeva verification OTP is: *${otpCode}*

⚡ Valid for 5 minutes.
🔒 Please do not share this security code with anyone.

Your Field, Our Power — On-demand farm machinery dispatched in 1 click!`;

  // 1. PRIMARY: UltraMsg WhatsApp Business Gateway (Instance #189242)
  let ultramsgInstance = 'instance189242';
  let ultramsgToken = '93rhhy7fj9ea2k81';
  const ultramsgConfigStr = localStorage.getItem('krishi_ultramsg_config');

  if (ultramsgConfigStr) {
    try {
      const { instanceId, token } = JSON.parse(ultramsgConfigStr);
      if (instanceId) ultramsgInstance = instanceId;
      if (token) ultramsgToken = token;
    } catch (e) {}
  }

  // A. Try internal serverless proxy first (bypasses browser adblockers and CORS)
  try {
    const proxyRes = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanNumber, otp: otpCode, lang })
    });
    if (proxyRes.ok) {
      const proxyData = await proxyRes.json();
      if (proxyData.success && proxyData.data?.sent === "true") {
        return { success: true, provider: 'UltraMsg (Vercel Proxy)', status: 'Sent', data: proxyData.data };
      }
    }
  } catch (err) {
    // Fallback to direct browser fetch
  }

  // B. Direct browser fetch to UltraMsg
  if (ultramsgInstance && ultramsgToken) {
    try {
      const response = await fetch(`https://api.ultramsg.com/${ultramsgInstance}/messages/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          token: ultramsgToken,
          to: `+91${cleanNumber}`,
          body: messageText,
          priority: '10'
        })
      });
      const data = await response.json();
      const isUnauthenticated = data.message && (
        data.message.toLowerCase().includes('not authenticated') ||
        data.message.toLowerCase().includes('not connected') ||
        data.message.toLowerCase().includes('qr')
      );
      if ((data.sent === "true" || data.success === true || !!data.id) && !isUnauthenticated) {
        return { success: true, provider: 'UltraMsg', status: 'Sent', data };
      } else {
        const errorMsg = isUnauthenticated 
          ? 'UltraMsg WhatsApp instance is not paired/authenticated with WhatsApp yet.' 
          : (data.message || data.error || 'UltraMsg failed to send');
        return { success: false, provider: 'UltraMsg', status: 'Failed', error: errorMsg, data };
      }
    } catch (err) {
      console.warn('UltraMsg gateway error:', err);
    }
  }

  // 2. Secondary: Meta WhatsApp Cloud API integration
  const metaConfigStr = localStorage.getItem('krishi_meta_config');
  if (metaConfigStr) {
    try {
      const { phoneId, accessToken, templateName } = JSON.parse(metaConfigStr);
      if (phoneId && accessToken) {
        const response = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: `91${cleanNumber}`,
            type: "template",
            template: {
              name: templateName || "krishiseva_otp",
              language: { code: lang === 'hi' ? 'hi' : 'en_US' },
              components: [
                {
                  type: "body",
                  parameters: [{ type: "text", text: otpCode }]
                }
              ]
            }
          })
        });
        const data = await response.json();
        if (response.ok && data.messages && data.messages.length > 0) {
          return { success: true, provider: 'Meta Cloud API', status: 'Sent', data };
        }
      }
    } catch (err) {
      console.warn('Meta Cloud API error:', err);
    }
  }

  // Check for Green-API config
  const greenapiConfigStr = localStorage.getItem('krishi_greenapi_config');
  if (greenapiConfigStr) {
    try {
      const { instanceId, token } = JSON.parse(greenapiConfigStr);
      if (instanceId && token) {
        const response = await fetch(`https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chatId: `91${cleanNumber}@c.us`,
            message: messageText
          })
        });
        const data = await response.json();
        if (data.idMessage) {
          return { success: true, provider: 'Green-API', status: 'Sent', data };
        } else {
          return { success: false, provider: 'Green-API', status: 'Failed', error: 'Green-API failed to send' };
        }
      }
    } catch (err) {
      console.warn('Green-API gateway error:', err);
    }
  }

  return { success: false, error: 'No automated WhatsApp Gateway configured', status: 'Failed' };
}
