import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Look up user by email via admin API
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return res.status(500).json({ error: listError.message });
    }

    const user = users?.users?.find((u) => u.email === email);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    // Generate and set new password
    const newPassword = generatePassword();
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ password: newPassword });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
