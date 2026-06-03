import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_ANON_KEY;

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$';
  let pw = '';
  for (let i = 0; i < 12; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  return pw;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { identifier, otp } = req.body || {};
  if (!identifier || !otp) {
    return res.status(400).json({ error: 'Identifier and OTP are required' });
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Fetch valid OTP for this identifier
    const { data: otpRows, error: otpError } = await supabase
      .from('login_otps')
      .select('*')
      .eq('identifier', identifier)
      .eq('otp', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (otpError) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!otpRows || otpRows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await supabase.from('login_otps').update({ used: true }).eq('id', otpRows[0].id);

    // Look up user in profiles by email or phone
    const cleanId = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId);

    let emailForAuth = null;
    let user = null;

    if (isEmail) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', cleanId)
        .single();
      user = profile;
      emailForAuth = cleanId;
    } else {
      // Look up by phone
      const digits = cleanId.replace(/\D/g, '');
      const phoneFormats = [digits, `+91${digits}`, `91${digits}`];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email, phone')
        .in('phone', phoneFormats)
        .limit(1);

      if (profiles && profiles.length > 0) {
        user = profiles[0];
        emailForAuth = profiles[0].email;
      }
    }

    // If user not found, tell client to register
    if (!user || !emailForAuth) {
      return res.status(200).json({
        verified: true,
        notRegistered: true,
        identifier: cleanId,
      });
    }

    // Generate new password and update auth user
    const newPassword = generatePassword();
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find((u) => u.email === emailForAuth);

    if (!authUser) {
      // User has profile but no auth account — create one
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: emailForAuth,
        password: newPassword,
        email_confirm: true,
      });
      if (createErr || !newUser?.user) {
        return res.status(500).json({ error: 'Failed to create auth user' });
      }
    } else {
      const { error: updateErr } = await supabase.auth.admin.updateUserById(
        authUser.id,
        { password: newPassword }
      );
      if (updateErr) {
        return res.status(500).json({ error: 'Failed to update password' });
      }
    }

    return res.status(200).json({
      verified: true,
      notRegistered: false,
      email: emailForAuth,
      password: newPassword,
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
