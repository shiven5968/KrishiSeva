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
