import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_ANON_KEY;
const WHATSAPP_SENDER = process.env.WHATSAPP_SENDER || '+919163854706';

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

    // Send via email or WhatsApp
    if (isEmail(clean)) {
      if (!BREVO_API_KEY) {
        return res.status(200).json({ success: true, message: 'OTP stored (email sending not configured)' });
      }
      // Send via Brevo email
      const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'নবME', email: SENDER_EMAIL },
          to: [{ email: clean }],
          subject: 'Your নবME Login OTP',
          htmlContent: `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;color:#e8e8e8;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
<tr><td align="center">
<table width="400" cellpadding="0" cellspacing="0" style="background:#121212;border:1px solid #2a2a2a;">
<tr><td style="background:#050505;padding:30px;text-align:center;border-bottom:1px solid #d4af37;">
<div style="font-size:28px;font-weight:700;color:#d4af37;">নবME</div>
</td></tr>
<tr><td style="padding:30px;text-align:center;">
<h2 style="color:#fff;font-size:18px;font-weight:300;margin:0 0 16px;">Your Login OTP</h2>
<div style="background:#1a1a1a;border:1px solid #d4af37;padding:16px 32px;display:inline-block;font-size:32px;font-weight:700;color:#d4af37;letter-spacing:6px;">${otp}</div>
<p style="color:#888;font-size:13px;margin:16px 0 0;">This code expires in 5 minutes.</p>
</td></tr>
<tr><td style="background:#050505;padding:20px;text-align:center;">
<p style="color:#444;font-size:11px;margin:0;">© 2026 নবME. All rights reserved.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
          textContent: `Your নবME login OTP is: ${otp}\n\nThis code expires in 5 minutes.`,
          tags: ['login-otp'],
        }),
      });
      if (!emailRes.ok) {
        const text = await emailRes.text();
        console.error('Brevo email error:', text);
      }
    } else {
      // Send OTP via WhatsApp (Brevo WhatsApp API)
      const phone = formatPhone(clean);
      const waRes = await fetch('https://api.brevo.com/v3/whatsapp/sendMessage', {
        method: 'POST',
        headers: { 'api-key': BREVO_API_KEY || '', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderNumber: WHATSAPP_SENDER,
          contactNumber: phone,
          content: { text: `নবME Login OTP: ${otp}\n\nUse this code to log in. Expires in 5 minutes.\n\n— নবME` },
        }),
      });
      if (!waRes.ok) {
        const text = await waRes.text();
        console.error('Brevo WhatsApp error:', text);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('send-otp error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
