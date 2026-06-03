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

function isEmail(input) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, email, name, address, city, district, state, pincode } = req.body || {};
  if (!phone || !name || !address || !city || !state || !pincode) {
    return res.status(400).json({ error: 'Phone, name, address, city, state, and pincode are required' });
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const digits = phone.replace(/\D/g, '');
    const cleanPhone = digits.startsWith('91') ? `+${digits}` : `+91${digits}`;

    const emailForAuth = email && isEmail(email)
      ? email.trim()
      : `user_${digits}@nabome.user`;

    const password = generatePassword();

    // Create or update auth user
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u) => u.email === emailForAuth);
    let authUserId;

    if (existing) {
      authUserId = existing.id;
      await supabase.auth.admin.updateUserById(authUserId, { password });
    } else {
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: emailForAuth, password, email_confirm: true,
      });
      if (createErr || !newUser?.user) {
        return res.status(500).json({ error: createErr?.message || 'Failed to create user' });
      }
      authUserId = newUser.user.id;
    }

    // Upsert profile by auth user ID
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: authUserId,
      email: emailForAuth,
      name,
      phone: cleanPhone,
      address,
      city,
      district: district || null,
      state,
      pincode,
      role: 'customer',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (profileErr) {
      console.error('Profile upsert error:', profileErr);
      return res.status(500).json({ error: 'Failed to save profile' });
    }

    return res.status(200).json({ success: true, email: emailForAuth, password });
  } catch (err) {
    console.error('register-user error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
