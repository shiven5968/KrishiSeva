// Live WhatsApp & SMS Telephony Gateway for KrishiSeva
// Supports Official Meta WhatsApp Cloud API, Twilio WhatsApp, UltraMsg, Wati, Interakt, Fast2SMS

export const SMS_PROVIDERS = {
  META_WHATSAPP: 'meta',
  TWILIO_WHATSAPP: 'twiliowa',
  ULTRAMSG: 'ultramsg',
  WATI: 'wati',
  INTERAKT: 'interakt',
  GREENAPI: 'greenapi',
  FAST2SMS: 'fast2sms',
  TWILIO_SMS: 'twilio'
};

// ─────────────────────────────────────────────────────────────
// 1. WhatsApp API Dispatch (Meta Cloud API, Twilio, UltraMsg, etc.)
// ─────────────────────────────────────────────────────────────
export async function sendRealWhatsAppOtp(phoneNumber, otpCode, lang = 'en') {
  const cleanNumber = phoneNumber.replace(/\D/g, '').slice(-10);

  const metaConfigStr = localStorage.getItem('krishi_meta_config');
  const twilioWaConfigStr = localStorage.getItem('krishi_twiliowa_config');
  const ultramsgConfigStr = localStorage.getItem('krishi_ultramsg_config');
  const watiConfigStr = localStorage.getItem('krishi_wati_config');
  const interaktConfigStr = localStorage.getItem('krishi_interakt_config');
  const greenapiConfigStr = localStorage.getItem('krishi_greenapi_config');

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

  // ──── A. Primary: Meta WhatsApp Cloud API (Official Business API) ────
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
          return { success: true, provider: 'Meta WhatsApp Cloud API', status: 'Sent', data };
        } else {
          return { 
            success: false, 
            provider: 'Meta WhatsApp Cloud API', 
            status: 'Failed', 
            error: data.error?.message || 'Meta Cloud API delivery failed', 
            data 
          };
        }
      }
    } catch (err) {
      console.warn('Meta WhatsApp Cloud API error:', err);
    }
  }

  // ──── B. Twilio WhatsApp API ────
  if (twilioWaConfigStr) {
    try {
      const { accountSid, authToken, fromNumber } = JSON.parse(twilioWaConfigStr);
      if (accountSid && authToken) {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const formData = new URLSearchParams();
        formData.append('To', `whatsapp:+91${cleanNumber}`);
        formData.append('From', fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`);
        formData.append('Body', messageText);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData
        });
        const data = await response.json();
        if (response.ok && data.sid) {
          return { success: true, provider: 'Twilio WhatsApp', status: 'Sent', data };
        }
      }
    } catch (err) {
      console.warn('Twilio WhatsApp error:', err);
    }
  }

  // ──── C. UltraMsg WhatsApp Gateway (Default #189242 or Custom) ────
  let ultramsgInstance = 'instance189242';
  let ultramsgToken = '93rhhy7fj9ea2k81';

  if (ultramsgConfigStr) {
    try {
      const parsed = JSON.parse(ultramsgConfigStr);
      if (parsed.instanceId) ultramsgInstance = parsed.instanceId;
      if (parsed.token) ultramsgToken = parsed.token;
    } catch (e) {}
  }

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
        // Auto-flush queue
        fetch(`https://api.ultramsg.com/${ultramsgInstance}/messages/resendByStatus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ token: ultramsgToken, status: 'unsent' })
        }).catch(() => {});
        return { success: true, provider: 'UltraMsg', status: 'Sent', data };
      } else {
        const errorMsg = isUnauthenticated 
          ? 'UltraMsg WhatsApp instance is not paired yet.' 
          : (data.message || data.error || 'UltraMsg failed to send');
        return { success: false, provider: 'UltraMsg', status: 'Failed', error: errorMsg, data };
      }
    } catch (err) {
      console.warn('UltraMsg gateway error:', err);
    }
  }

  // ──── D. Wati WhatsApp Partner API ────
  if (watiConfigStr) {
    try {
      const { endpoint, token, templateName } = JSON.parse(watiConfigStr);
      if (endpoint && token) {
        const response = await fetch(`${endpoint}/api/v1/sendTemplateMessage?whatsappNumber=91${cleanNumber}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            template_name: templateName || "krishiseva_otp",
            broadcast_name: "KrishiSeva_OTP",
            parameters: [{ name: "1", value: otpCode }]
          })
        });
        const data = await response.json();
        if (data.result === 'success' || data.result === true) {
          return { success: true, provider: 'Wati WhatsApp', status: 'Sent', data };
        }
      }
    } catch (e) {}
  }

  // ──── E. Green-API ────
  if (greenapiConfigStr) {
    try {
      const { instanceId, token } = JSON.parse(greenapiConfigStr);
      if (instanceId && token) {
        const response = await fetch(`https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: `91${cleanNumber}@c.us`,
            message: messageText
          })
        });
        const data = await response.json();
        if (data.idMessage) {
          return { success: true, provider: 'Green-API', status: 'Sent', data };
        }
      }
    } catch (e) {}
  }

  return { 
    success: false, 
    error: 'WhatsApp Gateway could not deliver message. Please use SMS fallback.', 
    status: 'Failed' 
  };
}

// ─────────────────────────────────────────────────────────────
// 2. Regular SMS Gateway Fallback (Fast2SMS, Twilio SMS, Textbelt)
// ─────────────────────────────────────────────────────────────
export async function sendRealSmsToPhone(phoneNumber, otpCode) {
  const cleanNumber = phoneNumber.replace(/\D/g, '').slice(-10);

  const fast2smsKey = localStorage.getItem('krishi_fast2sms_api_key');
  const twilioConfig = localStorage.getItem('krishi_twilio_config');

  // Fast2SMS (Direct Indian Telecom SMS)
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

  // Twilio Carrier SMS
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
      return { success: response.ok, provider: 'Twilio SMS', data };
    } catch (err) {
      console.warn('Twilio SMS error:', err);
    }
  }

  // Fallback: Textbelt SMS Relay
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
// 3. Aadhaar e-KYC SMS & WhatsApp Notification
// ─────────────────────────────────────────────────────────────
export async function sendAadhaarEkycSms(phoneNumber, aadhaarOtp, maskedAadhaar) {
  const cleanNumber = phoneNumber.replace(/\D/g, '').slice(-10);
  const message = `UIDAI / AgriStack: Your Aadhaar e-KYC OTP is *${aadhaarOtp}* for KrishiSeva land verification (Aadhaar: ${maskedAadhaar || 'XXXX-XXXX-1100'}). Valid for 10 mins. Do not share.`;

  sendRealWhatsAppOtp(cleanNumber, aadhaarOtp).catch(() => {});
  sendRealSmsToPhone(cleanNumber, aadhaarOtp).catch(() => {});

  return { success: true, message };
}
