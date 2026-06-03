// Vercel serverless function — sends emails via Brevo API
// Frontend sends { to, subject, htmlContent, textContent } via POST
// Server uses server-side BREVO_API_KEY environment variable

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_NAME = process.env.BREVO_SENDER_NAME || "নবME";
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "hello@nabome.online";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!BREVO_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const { to, subject, htmlContent, textContent, tags = [] } = req.body || {};

  if (!to || !subject) {
    return res.status(400).json({ error: 'To and subject are required' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: SENDER_NAME,
          email: SENDER_EMAIL,
        },
        to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
        subject,
        htmlContent,
        textContent,
        tags,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brevo API error:', errorText);
      return res.status(500).json({ error: 'Failed to send email', details: errorText });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, messageId: data.messageId });
  } catch (err) {
    console.error('send-email error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
