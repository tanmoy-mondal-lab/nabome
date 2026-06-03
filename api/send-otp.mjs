import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isEmail(input) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('0')) return `+91${digits.slice(1)}`;
  return `+91${digits}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { identifier } = req.body || {};
  if (!identifier || !identifier.trim()) {
    return res.status(400).json({ error: 'Email or phone number is required' });
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const clean = identifier.trim();
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Store OTP in database
    const { error: dbError } = await supabase.from('login_otps').insert({
      identifier: clean,
      otp,
      expires_at: expiresAt,
    });
    if (dbError) {
      return res.status(500).json({ error: 'Failed to store OTP' });
    }

    // Email/WhatsApp sending not configured - Brevo removed
    // OTP is stored in database for verification
    console.log(`[send-otp] OTP generated for ${clean}: ${otp} (email/WhatsApp sending not configured)`);

    return res.status(200).json({ 
      success: true, 
      message: 'OTP stored successfully (email/WhatsApp sending not configured - Brevo removed)' 
    });
  } catch (err) {
    console.error('send-otp error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
