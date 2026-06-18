import { prisma } from "../_lib/prisma";
import { success, badRequest, notFound, unauthorized, serverError, created } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleSupportRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action?: string
): Promise<Response> {
  const method = req.method;

  // Public
  if (action === "createTicket") {
    if (method === "POST") return handleCreateTicket(ctx, req);
  }
  if (action === "faq") {
    if (method === "GET") return handleListFAQs();
  }

  // Customer
  if (action === "listTickets") {
    if (method === "GET") return handleListTickets(ctx);
  }
  if (action === "ticketDetail") {
    if (method === "GET") return handleTicketDetail(ctx, params[0]);
  }
  if (action === "ticketReply") {
    if (method === "POST") return handleTicketReply(ctx, params[0], req);
  }

  // Admin support
  if (action === "adminList") {
    if (method === "GET") return handleAdminList(req);
  }
  if (action === "adminDetail") {
    if (method === "GET") return handleAdminDetail(params[0]);
  }
  if (action === "adminUpdateStatus") {
    if (method === "PUT") return handleAdminUpdateStatus(ctx, params[0], req);
  }
  if (action === "adminAssign") {
    if (method === "PUT") return handleAdminAssign(ctx, params[0], req);
  }
  if (action === "adminReply") {
    if (method === "POST") return handleAdminReply(ctx, params[0], req);
  }

  // Admin FAQ
  if (action === "adminFaqList") {
    if (method === "GET") return handleAdminFaqList();
  }
  if (action === "adminFaqCreate") {
    if (method === "POST") return handleAdminFaqCreate(req);
  }
  if (action === "adminFaqUpdate") {
    if (method === "PUT") return handleAdminFaqUpdate(params[0], req);
  }
  if (action === "adminFaqDelete") {
    if (method === "DELETE") return handleAdminFaqDelete(params[0]);
  }

  return notFound();
}

async function handleCreateTicket(ctx: RequestContext, req: Request): Promise<Response> {
  const body = await req.json();
  const { subject, message, orderId } = body;

  if (!subject || !message) {
    return badRequest("Subject and message are required");
  }

  const name = ctx.userId
    ? (await prisma.profile.findUnique({ where: { id: ctx.userId }, select: { firstName: true, lastName: true, email: true } }))
    : null;

  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        profileId: ctx.userId ?? null,
        orderId: orderId ?? null,
        name: name ? `${name.firstName} ${name.lastName ?? ""}`.trim() : body.name ?? "Anonymous",
        email: name?.email ?? body.email ?? "unknown@example.com",
        subject,
        message,
        status: "open",
      },
    });

    return created({ ticket });
  } catch (err) {
    return serverError(err);
  }
}

async function handleListFAQs(): Promise<Response> {
  try {
    const faqs = await prisma.fAQ.findMany({
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

async function handleListTickets(ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  try {
    const tickets = await prisma.supportTicket.findMany({
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

async function handleTicketDetail(ctx: RequestContext, ticketId: string): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  try {
    const ticket = await prisma.supportTicket.findFirst({
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

async function handleTicketReply(ctx: RequestContext, ticketId: string, req: Request): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  const body = await req.json();
  const { message } = body;

  if (!message) return badRequest("Message is required");

  try {
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: ticketId, profileId: ctx.userId },
    });
    if (!ticket) return notFound("Ticket not found");

    const reply = await prisma.supportTicketReply.create({
      data: {
        ticketId,
        profileId: ctx.userId,
        message,
        isStaff: false,
      },
    });

    return created({ reply });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminList(req: Request): Promise<Response> {
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
    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
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
      prisma.supportTicket.count({ where: where as never }),
    ]);

    return success({
      tickets,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminDetail(ticketId: string): Promise<Response> {
  try {
    const ticket = await prisma.supportTicket.findUnique({
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

async function handleAdminUpdateStatus(ctx: RequestContext, ticketId: string, req: Request): Promise<Response> {
  const body = await req.json();
  const { status } = body;

  if (!status) return badRequest("Status is required");

  const validStatuses = ["open", "in_progress", "resolved", "closed"];
  if (!validStatuses.includes(status)) {
    return badRequest(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  try {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return notFound("Ticket not found");

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        resolvedAt: status === "resolved" || status === "closed" ? new Date() : null,
      },
    });

    return success({ ticket: updated });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminAssign(ctx: RequestContext, ticketId: string, req: Request): Promise<Response> {
  const body = await req.json();
  const { assignedTo } = body;

  if (!assignedTo) return badRequest("assignedTo is required");

  try {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return notFound("Ticket not found");

    const assignee = await prisma.profile.findUnique({ where: { id: assignedTo } });
    if (!assignee) return badRequest("Assignee not found");

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { assignedTo },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return success({ ticket: updated });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminReply(ctx: RequestContext, ticketId: string, req: Request): Promise<Response> {
  const body = await req.json();
  const { message } = body;

  if (!message) return badRequest("Message is required");

  try {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return notFound("Ticket not found");

    const reply = await prisma.supportTicketReply.create({
      data: {
        ticketId,
        profileId: ctx.userId,
        message,
        isStaff: true,
      },
    });

    return created({ reply });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminFaqList(): Promise<Response> {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });
    return success({ faqs });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminFaqCreate(req: Request): Promise<Response> {
  const body = await req.json();
  const { question, answer, category, sortOrder } = body;

  if (!question || !answer) {
    return badRequest("Question and answer are required");
  }

  try {
    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category: category ?? null,
        sortOrder: sortOrder ?? 0,
      },
    });

    return created({ faq });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminFaqUpdate(faqId: string, req: Request): Promise<Response> {
  const body = await req.json();
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
    const existing = await prisma.fAQ.findUnique({ where: { id: faqId } });
    if (!existing) return notFound("FAQ not found");

    const updated = await prisma.fAQ.update({
      where: { id: faqId },
      data: updateData as never,
    });

    return success({ faq: updated });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminFaqDelete(faqId: string): Promise<Response> {
  try {
    const existing = await prisma.fAQ.findUnique({ where: { id: faqId } });
    if (!existing) return notFound("FAQ not found");

    await prisma.fAQ.delete({ where: { id: faqId } });

    return success({ message: "FAQ deleted" });
  } catch (err) {
    return serverError(err);
  }
}
