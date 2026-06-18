import { prisma } from "../_lib/prisma";
import { success, badRequest, serverError, created } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleContactRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "contact":
      return handleContact(req);
    case "newsletter":
      return handleNewsletter(req);
    default:
      return badRequest("Unknown action");
  }
}

async function handleContact(req: Request): Promise<Response> {
  const body = await req.json();
  const { name, email, phone, subject, message } = body;

  if (!name || !email || !message) {
    return badRequest("Name, email, and message are required");
  }

  try {
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        phone: phone ?? null,
        subject: subject ?? null,
        message,
      },
    });

    // In production, send email notification here via Resend or similar

    return created({ message: "Message received. We'll get back to you soon." });
  } catch (err) {
    return serverError(err);
  }
}

async function handleNewsletter(req: Request): Promise<Response> {
  const body = await req.json();
  const { email } = body;

  if (!email) return badRequest("Email is required");

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (!existing.isActive) {
        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
      }
      return success({ message: "You are already subscribed!" });
    }

    await prisma.newsletterSubscriber.create({
      data: { email },
    });

    return created({ message: "Successfully subscribed to our newsletter!" });
  } catch (err) {
    return serverError(err);
  }
}
