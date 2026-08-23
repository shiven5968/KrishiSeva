// Vercel Serverless Function to reliably dispatch WhatsApp OTPs via UltraMsg
export default async function handler(req, res) {
  // Allow CORS for local dev and production
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { phone, otp, lang } = req.body || {};
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    const cleanNumber = phone.replace(/\D/g, '').slice(-10);
    const instance = 'instance189242';
    const token = '93rhhy7fj9ea2k81';

    const messageText = lang === 'hi' ?
`🚜 *कृषि सेवा (KrishiSeva)* 🌾

नमस्ते!
आपका कृषि सेवा सत्यापन ओटीपी है: *${otp}*

⚡ 5 मिनट के लिए मान्य।
🔒 कृपया यह सुरक्षा कोड किसी के साथ साझा न करें।

खेत आपका, तकनीक हमारी — 1-क्लिक में मशीन खेत पर तैयार!`
:
`🚜 *KrishiSeva* 🌾

Hello!
Your KrishiSeva verification OTP is: *${otp}*

⚡ Valid for 5 minutes.
🔒 Please do not share this security code with anyone.

Your Field, Our Power — On-demand farm machinery dispatched in 1 click!`;

    const response = await fetch(`https://api.ultramsg.com/${instance}/messages/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        token: token,
        to: `+91${cleanNumber}`,
        body: messageText,
        priority: '10'
      })
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Serverless WhatsApp dispatch error:', err);
    return res.status(500).json({ error: err.message });
  }
}
