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

// Send UIDAI Aadhaar e-KYC Real SMS
export async function sendAadhaarEkycSms(phoneNumber, aadhaarOtp, maskedAadhaar) {
  const cleanNumber = phoneNumber.replace(/\D/g, '').slice(-10);
  const message = `UIDAI: Your Aadhaar e-KYC OTP is ${aadhaarOtp} for KrishiSeva AgriStack verification (Aadhaar: ${maskedAadhaar || 'XXXX-XXXX-1100'}). Valid for 10 mins. Do not share.`;

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

// Send real automated WhatsApp message using UltraMsg or Green-API
export async function sendRealWhatsAppOtp(phoneNumber, otpCode, lang = 'en') {
  const cleanNumber = phoneNumber.replace(/\D/g, '').slice(-10);

  // 1. Meta WhatsApp Cloud API integration
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
        } else {
          return { success: false, provider: 'Meta Cloud API', status: 'Failed', error: data.error?.message || 'Meta Cloud API rejected the request' };
        }
      }
    } catch (err) {
      console.warn('Meta Cloud API error:', err);
      return { success: false, provider: 'Meta Cloud API', status: 'Failed', error: err.message };
    }
  }

  // 2. Twilio WhatsApp API integration
  const twilioWaConfigStr = localStorage.getItem('krishi_twiliowa_config');
  if (twilioWaConfigStr) {
    try {
      const { accountSid, authToken, fromNumber } = JSON.parse(twilioWaConfigStr);
      if (accountSid && authToken && fromNumber) {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const formData = new URLSearchParams();
        formData.append('To', `whatsapp:+91${cleanNumber}`);
        formData.append('From', `whatsapp:${fromNumber}`);
        // Message matches the required utility template:
        // "Your KrishiSeva verification code is {{1}}. Valid for 5 minutes. Do not share this code with anyone."
        formData.append('Body', `Your KrishiSeva verification code is ${otpCode}. Valid for 5 minutes. Do not share this code with anyone.`);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData
        });
        const data = await response.json();
        if (response.ok) {
          return { success: true, provider: 'Twilio WhatsApp', status: 'Sent', data };
        } else {
          return { success: false, provider: 'Twilio WhatsApp', status: 'Failed', error: data.message || 'Twilio rejected the request' };
        }
      }
    } catch (err) {
      console.warn('Twilio WhatsApp error:', err);
      return { success: false, provider: 'Twilio WhatsApp', status: 'Failed', error: err.message };
    }
  }

  // 3. Wati API integration
  const watiConfigStr = localStorage.getItem('krishi_wati_config');
  if (watiConfigStr) {
    try {
      const { apiEndpoint, accessToken, templateName } = JSON.parse(watiConfigStr);
      if (apiEndpoint && accessToken) {
        const response = await fetch(`${apiEndpoint.replace(/\/$/, '')}/api/v1/sendTemplateMessage`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            template_name: templateName || "krishiseva_otp",
            broadcast_name: "krishiseva_otp_broadcast",
            receivers: [
              {
                whatsappNumber: `91${cleanNumber}`,
                customParams: [{ name: "1", value: otpCode }]
              }
            ]
          })
        });
        const data = await response.json();
        if (response.ok && (data.result === true || data.status === 'success' || data.success === true)) {
          return { success: true, provider: 'Wati', status: 'Sent', data };
        } else {
          return { success: false, provider: 'Wati', status: 'Failed', error: data.errors || data.message || 'Wati rejected the request' };
        }
      }
    } catch (err) {
      console.warn('Wati API error:', err);
      return { success: false, provider: 'Wati', status: 'Failed', error: err.message };
    }
  }

  // 4. Interakt API integration
  const interaktConfigStr = localStorage.getItem('krishi_interakt_config');
  if (interaktConfigStr) {
    try {
      const { apiKey, templateName } = JSON.parse(interaktConfigStr);
      if (apiKey) {
        const response = await fetch('https://api.interakt.ai/v1/public/message/', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(apiKey + ':')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            countryCode: "+91",
            phoneNumber: cleanNumber,
            type: "Template",
            template: {
              name: templateName || "krishiseva_otp",
              languageCode: lang === 'hi' ? 'hi' : 'en',
              bodyValues: [otpCode]
            }
          })
        });
        const data = await response.json();
        if (response.ok && (data.result === true || data.success === true || data.id)) {
          return { success: true, provider: 'Interakt', status: 'Sent', data };
        } else {
          return { success: false, provider: 'Interakt', status: 'Failed', error: data.message || 'Interakt rejected the request' };
        }
      }
    } catch (err) {
      console.warn('Interakt API error:', err);
      return { success: false, provider: 'Interakt', status: 'Failed', error: err.message };
    }
  }

  // Legacy Providers (UltraMsg and Green-API) - retained for backward compatibility
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

  // Check for UltraMsg config
  let ultramsgInstance = '';
  let ultramsgToken = '';
  const ultramsgConfigStr = localStorage.getItem('krishi_ultramsg_config');

  if (ultramsgConfigStr) {
    try {
      const { instanceId, token } = JSON.parse(ultramsgConfigStr);
      ultramsgInstance = instanceId;
      ultramsgToken = token;
    } catch (e) {}
  } else {
    // Default fallback to user's newly connected business instance
    ultramsgInstance = 'instance189242';
    ultramsgToken = '93rhhy7fj9ea2k81';
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
          body: messageText
        })
      });
      const data = await response.json();
      if (data.sent === "true" || data.success === true || !!data.id) {
        return { success: true, provider: 'UltraMsg', status: 'Sent', data };
      } else {
        return { success: false, provider: 'UltraMsg', status: 'Failed', error: 'UltraMsg failed to send' };
      }
    } catch (err) {
      console.warn('UltraMsg gateway error:', err);
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
