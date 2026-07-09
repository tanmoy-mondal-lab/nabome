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
    RATE_LIMIT_STORE?: {
        get: (key: string) => Promise<string | null>;
        put: (key: string, value: string, opts?: {
            expirationTtl?: number;
        }) => Promise<void>;
    };
    FEATURE_FLAGS_KV?: {
        get: (key: string) => Promise<string | null>;
        put: (key: string, value: string) => Promise<void>;
    };
    HYPERDRIVE?: {
        connectionString: string;
    };
    CACHE?: {
        get: (key: string) => Promise<string | null>;
        put: (key: string, value: string, opts?: {
            expirationTtl?: number;
            metadata?: {
                tags?: string[];
            };
        }) => Promise<void>;
        delete: (key: string) => Promise<void>;
        list: (opts?: {
            prefix?: string;
        }) => Promise<{
            keys: {
                name: string;
            }[];
        }>;
        getMetadata: (key: string) => Promise<{
            tags?: string[];
        } | null>;
    };
}
export declare function getEnv(): Env;
