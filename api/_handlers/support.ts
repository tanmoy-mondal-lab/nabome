import type { Env } from "../_lib/env";
import { getPrisma } from "../_lib/prisma";
import { success, badRequest, notFound, unauthorized, serverError, created } from "../_lib/response";
import { requireAdmin } from "../_lib/auth-middleware";
import type { RequestContext } from "../_lib/types";

export async function handleSupportRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action?: string
): Promise<Response> {
  const method = req.method;

  // Defense-in-depth: verify admin role for admin actions
  const adminActions = ["adminList", "adminDetail", "adminUpdateStatus", "adminAssign", "adminReply", "adminFaqList", "adminFaqCreate", "adminFaqUpdate", "adminFaqDelete"];
  if (action && adminActions.includes(action)) {
    const adminGuard = requireAdmin(ctx);
    if (adminGuard) return adminGuard;
  }

  // Public
  if (action === "createTicket") {
    if (method === "POST") return handleCreateTicket(ctx, req, ctx.env!);
  }
  if (action === "faq") {
    if (method === "GET") return handleListFAQs(ctx.env!);
  }

  // Customer
  if (action === "listTickets") {
    if (method === "GET") return handleListTickets(ctx, ctx.env!);
  }
  if (action === "ticketDetail") {
    if (method === "GET") return handleTicketDetail(ctx, params[0], ctx.env!);
  }
  if (action === "ticketReply") {
    if (method === "POST") return handleTicketReply(ctx, params[0], req, ctx.env!);
  }

  // Admin support
  if (action === "adminList") {
    if (method === "GET") return handleAdminList(req, ctx.env!);
  }
  if (action === "adminDetail") {
    if (method === "GET") return handleAdminDetail(params[0], ctx.env!);
  }
  if (action === "adminUpdateStatus") {
    if (method === "PUT") return handleAdminUpdateStatus(ctx, params[0], req, ctx.env!);
  }
  if (action === "adminAssign") {
    if (method === "PUT") return handleAdminAssign(ctx, params[0], req, ctx.env!);
  }
  if (action === "adminReply") {
    if (method === "POST") return handleAdminReply(ctx, params[0], req, ctx.env!);
  }

  // Admin FAQ
  if (action === "adminFaqList") {
    if (method === "GET") return handleAdminFaqList(ctx.env!);
  }
  if (action === "adminFaqCreate") {
    if (method === "POST") return handleAdminFaqCreate(req, ctx.env!);
  }
  if (action === "adminFaqUpdate") {
    if (method === "PUT") return handleAdminFaqUpdate(params[0], req, ctx.env!);
  }
  if (action === "adminFaqDelete") {
    if (method === "DELETE") return handleAdminFaqDelete(params[0], ctx.env!);
  }

  return notFound();
}

async function handleCreateTicket(ctx: RequestContext, req: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { subject, message, orderId } = body;

  if (!subject || !message) {
    return badRequest("Subject and message are required");
  }

  try {
    const prisma = getPrisma(env);
    const profile = ctx.userId
      ? await prisma.profiles.findUnique({ where: { id: ctx.userId }, select: { firstName: true, lastName: true, email: true } })
      : null;

    const ticket = await prisma.support_tickets.create({
      data: {
        profileId: ctx.userId ?? null,
        orderId: orderId as string | null,
        name: profile ? `${profile.firstName} ${profile.lastName ?? ""}`.trim() : (body.name as string | undefined) ?? "Anonymous",
        email: profile?.email ?? (body.email as string | undefined) ?? "unknown@example.com",
        subject: subject as string,
        message: message as string,
        status: "open",
      },
    });

    return created({ ticket });
  } catch (err) {
    return serverError(err);
  }
}

async function handleListFAQs(env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const faqs = await prisma.faqs.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });

    const grouped: Record<string, typeof faqs> = {};
    for (const faq of faqs) {
      const cat = faq.category ?? "General";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(faq);
    }

    return success({ faqs: grouped });
  } catch (err) {
    return serverError(err);
  }
}

async function handleListTickets(ctx: RequestContext, env: Env): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  try {
    const prisma = getPrisma(env);
    const tickets = await prisma.support_tickets.findMany({
      where: { profileId: ctx.userId },
      include: {
        replies: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return success({ tickets });
  } catch (err) {
    return serverError(err);
  }
}

async function handleTicketDetail(ctx: RequestContext, ticketId: string, env: Env): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  try {
    const prisma = getPrisma(env);
    const ticket = await prisma.support_tickets.findFirst({
      where: { id: ticketId, profileId: ctx.userId },
      include: {
        replies: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { firstName: true, lastName: true } } },
        },
        order: { select: { orderNumber: true } },
      },
    });

    if (!ticket) return notFound("Ticket not found");

    return success({ ticket });
  } catch (err) {
    return serverError(err);
  }
}

async function handleTicketReply(ctx: RequestContext, ticketId: string, req: Request, env: Env): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { message } = body;

  if (!message) return badRequest("Message is required");

  try {
    const prisma = getPrisma(env);
    const ticket = await prisma.support_tickets.findFirst({
      where: { id: ticketId, profileId: ctx.userId },
    });
    if (!ticket) return notFound("Ticket not found");

    const reply = await prisma.support_ticket_replies.create({
      data: {
        ticketId,
        profileId: ctx.userId,
        message: message as string,
        isStaff: false,
      },
    });

    return created({ reply });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminList(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const search = url.searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (search) {
    where.OR = [
      { subject: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  try {
    const prisma = getPrisma(env);
    const [tickets, total] = await Promise.all([
      prisma.support_tickets.findMany({
        where: where as never,
        include: {
          profile: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.support_tickets.count({ where: where as never }),
    ]);

    return success({
      tickets,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminDetail(ticketId: string, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const ticket = await prisma.support_tickets.findUnique({
      where: { id: ticketId },
      include: {
        profile: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
        order: { select: { orderNumber: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    if (!ticket) return notFound("Ticket not found");

    return success({ ticket });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminUpdateStatus(_ctx: RequestContext, ticketId: string, req: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { status } = body;

  if (!status) return badRequest("Status is required");

  const validStatuses = ["open", "in_progress", "resolved", "closed"];
  if (!validStatuses.includes(status as string)) {
    return badRequest(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  try {
    const prisma = getPrisma(env);
    const ticket = await prisma.support_tickets.findUnique({ where: { id: ticketId } });
    if (!ticket) return notFound("Ticket not found");

    const updated = await prisma.support_tickets.update({
      where: { id: ticketId },
      data: {
        status: status as "open" | "in_progress" | "resolved" | "closed",
        resolvedAt: status === "resolved" || status === "closed" ? new Date() : null,
      },
    });

    return success({ ticket: updated });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminAssign(_ctx: RequestContext, ticketId: string, req: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { assignedTo } = body;

  if (!assignedTo) return badRequest("assignedTo is required");

  try {
    const prisma = getPrisma(env);
    const ticket = await prisma.support_tickets.findUnique({ where: { id: ticketId } });
    if (!ticket) return notFound("Ticket not found");

    const assignee = await prisma.profiles.findUnique({ where: { id: assignedTo as string } });
    if (!assignee) return badRequest("Assignee not found");

    const updated = await prisma.support_tickets.update({
      where: { id: ticketId },
      data: { assignedTo: assignedTo as string },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return success({ ticket: updated });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminReply(ctx: RequestContext, ticketId: string, req: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { message } = body;

  if (!message) return badRequest("Message is required");

  try {
    const prisma = getPrisma(env);
    const ticket = await prisma.support_tickets.findUnique({ where: { id: ticketId } });
    if (!ticket) return notFound("Ticket not found");

    const reply = await prisma.support_ticket_replies.create({
      data: {
        ticketId,
        profileId: ctx.userId,
        message: message as string,
        isStaff: true,
      },
    });

    return created({ reply });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminFaqList(env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const faqs = await prisma.faqs.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });
    return success({ faqs });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminFaqCreate(req: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { question, answer, category, sortOrder } = body;

  if (!question || !answer) {
    return badRequest("Question and answer are required");
  }

  try {
    const prisma = getPrisma(env);
    const faq = await prisma.faqs.create({
      data: {
        question: question as string,
        answer: answer as string,
        category: category as string | null,
        sortOrder: sortOrder as number | undefined,
      },
    });

    return created({ faq });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminFaqUpdate(faqId: string, req: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const allowedFields = ["question", "answer", "category", "sortOrder", "isActive"];
  const updateData: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return badRequest("No valid fields to update");
  }

  try {
    const prisma = getPrisma(env);
    const existing = await prisma.faqs.findUnique({ where: { id: faqId } });
    if (!existing) return notFound("FAQ not found");

    const updated = await prisma.faqs.update({
      where: { id: faqId },
      data: updateData as never,
    });

    return success({ faq: updated });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminFaqDelete(faqId: string, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.faqs.findUnique({ where: { id: faqId } });
    if (!existing) return notFound("FAQ not found");

    await prisma.faqs.delete({ where: { id: faqId } });

    return success({ message: "FAQ deleted" });
  } catch (err) {
    return serverError(err);
  }
}
