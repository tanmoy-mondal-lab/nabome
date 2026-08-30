/**
 * Email service using Resend API.
 * Handles email verification, password reset, and notifications.
 * Config is passed from the Cloudflare Env binding — never reads process.env directly.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';

export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email via Resend API.
 */
export async function sendEmail(
  config: EmailConfig,
  options: SendEmailOptions,
): Promise<void> {
  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
}

/**
 * Send email verification email.
 */
export async function sendVerificationEmail(
  config: EmailConfig,
  email: string,
  verificationToken: string,
  appUrl?: string,
): Promise<void> {
  if (!appUrl)
    throw new Error('APP_URL not configured — email links would be broken');
  const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #007bff; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for registering with Nabome. Please verify your email address by clicking the button below:</p>
          <a href="${verifyUrl}" class="button">Verify Email</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${verifyUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <div class="footer">
            <p>If you didn't create an account with Nabome, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(config, {
    to: email,
    subject: 'Verify Your Email Address - Nabome',
    html,
    text: `Verify your email address by visiting: ${verifyUrl}`,
  });
}

/**
 * Send password reset email.
 */
export async function sendPasswordResetEmail(
  config: EmailConfig,
  email: string,
  resetToken: string,
  appUrl?: string,
): Promise<void> {
  if (!appUrl)
    throw new Error('APP_URL not configured — email links would be broken');
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #007bff; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password for your Nabome account. Click the button below to reset it:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <div class="footer">
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(config, {
    to: email,
    subject: 'Reset Your Password - Nabome',
    html,
    text: `Reset your password by visiting: ${resetUrl}`,
  });
}

/**
 * Get email config — passed from Env binding, never reads process.env.
 * Use this factory when you need to build an EmailConfig from Env.
 */
export function buildEmailConfig(env: {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
}): EmailConfig {
  const apiKey = env.RESEND_API_KEY ?? '';
  const fromEmail = env.RESEND_FROM_EMAIL ?? 'noreply@nabome.online';

  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  return { apiKey, fromEmail };
}
