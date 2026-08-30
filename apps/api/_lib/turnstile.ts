export interface TurnstileVerifyResult {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export interface TurnstileVerifyError {
  code: string;
  message: string;
}

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verify a Turnstile token with Cloudflare.
 * Returns true if the token is valid, false otherwise.
 */
export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  remoteIp?: string,
): Promise<{ success: boolean; error?: TurnstileVerifyError }> {
  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(5000),
    });

    const result: TurnstileVerifyResult = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: {
          code: result['error-codes']?.[0] || 'invalid-token',
          message: 'CAPTCHA verification failed',
        },
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'verification-failed',
        message: 'Failed to verify CAPTCHA',
      },
    };
  }
}
