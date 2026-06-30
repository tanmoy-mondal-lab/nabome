export interface Env {
  DATABASE_URL?: string;
  DATABASE_URL_POOLED?: string;
  NODE_ENV?: string;
  SUPABASE_URL?: string;
  VITE_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  CLOUDINARY_UPLOAD_PRESET?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  ADMIN_EMAILS?: string;
  ADMIN_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  SITE_URL?: string;
  VITE_SITE_URL?: string;
  CF_PAGES?: string;
}

export function getEnv(): Env {
  if (typeof process !== "undefined" && process.env) {
    return {
      DATABASE_URL: process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED,
      DATABASE_URL_POOLED: process.env.DATABASE_URL_POOLED,
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET,
      CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || process.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
      RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      EMAIL_FROM: process.env.EMAIL_FROM,
      ADMIN_EMAILS: process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
      SITE_URL: process.env.SITE_URL || process.env.VITE_SITE_URL,
      VITE_SITE_URL: process.env.VITE_SITE_URL,
      CF_PAGES: process.env.CF_PAGES,
    };
  }
  return {};
}
