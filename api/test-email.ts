import { testEmail } from "./_lib/email";
import type { Env } from "./_lib/env";

export async function GET(req: Request, opts?: { env?: Env }): Promise<Response> {
  const env = opts?.env;

  if (!env?.RESEND_API_KEY) {
    return Response.json(
      { success: false, error: "RESEND_API_KEY not set in environment" },
      { status: 500 }
    );
  }

  const result = await testEmail(env, "nabome.official@gmail.com");

  return Response.json(
    {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      config: {
        from: env.EMAIL_FROM || "noreply@nabome.online",
        adminEmails: env.ADMIN_EMAILS || "not set",
        resendApiKey: env.RESEND_API_KEY ? `re_...${env.RESEND_API_KEY.slice(-4)}` : "not set",
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
