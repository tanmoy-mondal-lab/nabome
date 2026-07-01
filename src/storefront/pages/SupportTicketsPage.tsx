import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HelpCircle, Plus, MessageSquare, ChevronRight, ArrowLeft, Send, Clock } from "lucide-react";
import { customerApi } from "../../lib/api/customer";
import { formatDate } from "../../lib/utils/format";
import { cn } from "../../lib/utils/cn";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { Helmet } from "react-helmet-async";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useFocusTrap } from "../../hooks/useFocusTrap";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface Reply {
  id: string;
  message: string;
  createdAt: string;
  isAdmin: boolean;
  authorName: string;
}

const statusStyles: Record<string, string> = {
  open: "status-confirmed",
  pending: "status-pending",
  resolved: "bg-blue-100 text-blue-700",
  closed: "bg-neutral-100 text-neutral-500",
};

const priorityStyles: Record<string, string> = {
  low: "text-neutral-400",
  normal: "text-neutral-600",
  high: "text-amber-600",
  urgent: "text-red-600",
};

export default function SupportTicketsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ subject: "", message: "", orderId: "" });
  const [replyText, setReplyText] = useState("");

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ["customer", "support-tickets"],
    queryFn: () => customerApi.getSupportTickets(),
  });

  const { data: ticketDetail } = useQuery({
    queryKey: ["customer", "support-ticket", selectedTicket],
    queryFn: () => customerApi.getSupportTicket(selectedTicket!),
    enabled: !!selectedTicket,
  });

  const tickets = ((ticketsData as unknown as { tickets: Ticket[] })?.tickets ?? []) as Ticket[];
  const ticket = (ticketDetail as unknown as { ticket: { replies: Reply[] } & Ticket })?.ticket;

  const createMutation = useMutation({
    mutationFn: () => customerApi.createSupportTicket({
      subject: createForm.subject,
      message: createForm.message,
      orderId: createForm.orderId || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "support-tickets"] });
      setShowCreate(false);
      setCreateForm({ subject: "", message: "", orderId: "" });
    },
  });

  function closeCreateModal() {
    setShowCreate(false);
  }

  const createModalRef = useFocusTrap<HTMLDivElement>(showCreate, closeCreateModal);

  const replyMutation = useMutation({
    mutationFn: () => customerApi.addSupportReply(selectedTicket!, { message: replyText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "support-ticket", selectedTicket] });
      setReplyText("");
    },
  });

  if (selectedTicket && ticket) {
    return (
      <div className="container-page py-8">
        <Helmet>
          <title>Support — নবME</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <h1 className="text-2xl md:text-3xl font-display text-neutral-900 mb-8 tracking-fashion">Support</h1>
        <div className="grid lg:grid-cols-4 gap-8">
          <DashboardSidebar />
          <div className="lg:col-span-3 space-y-6">
            <button onClick={() => setSelectedTicket(null)} className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back to Tickets
            </button>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-display text-neutral-900">{ticket.subject}</h2>
                <p className="text-xs text-neutral-400 mt-1">Created {formatDate(ticket.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded ${statusStyles[ticket.status] || "bg-neutral-100 text-neutral-600"}`}>
                  {ticket.status}
                </span>
                <span className={cn("text-[10px] uppercase", priorityStyles[ticket.priority] || "text-neutral-400")}>
                  {ticket.priority}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {(ticket.replies || []).map((reply) => (
                <div key={reply.id} className={cn("flex gap-3", reply.isAdmin ? "" : "flex-row-reverse")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0", reply.isAdmin ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600")}>
                    {reply.authorName?.[0] || "U"}
                  </div>
                  <div className={cn("max-w-[75%]", reply.isAdmin ? "" : "text-right")}>
                    <div className={cn("px-4 py-3 text-sm", reply.isAdmin ? "bg-neutral-100" : "bg-neutral-900 text-white")}>
                      {reply.message}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">{formatDate(reply.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 border-t pt-4">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="input-field flex-1"
                onKeyDown={(e) => { if (e.key === "Enter" && replyText.trim()) replyMutation.mutate(); }}
              />
              <button
                onClick={() => replyMutation.mutate()}
                disabled={replyMutation.isPending || !replyText.trim()}
                className="btn-primary flex items-center gap-1"
              >
                <Send className="w-3 h-3" /> Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <Helmet>
        <title>Support — নবME</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <h1 className="text-2xl md:text-3xl font-display text-neutral-900 mb-8 tracking-fashion">Support</h1>
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardSidebar />
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">{tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-3 h-3" /> Create Ticket
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-neutral-100 animate-pulse rounded" />)}
            </div>
          ) : tickets.length === 0 ? (
            <div className="premium-card p-12 text-center shadow-subtle">
              <HelpCircle className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-neutral-900 mb-2">No support tickets</h3>
              <p className="text-xs text-neutral-500 mb-4">Need help? Create a ticket and our team will get back to you.</p>
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                Create Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket.id)}
                  className="w-full text-left premium-card p-4 shadow-subtle hover:shadow-card transition-shadow flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-neutral-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{ticket.subject}</p>
                      <p className="text-xs text-neutral-400">{formatDate(ticket.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-[10px] uppercase tracking-wider px-2 py-0.5 rounded", statusStyles[ticket.status] || "bg-neutral-100 text-neutral-600")}>
                      {ticket.status}
                    </span>
                    <span className={cn("text-[10px] uppercase", priorityStyles[ticket.priority] || "")}>{ticket.priority}</span>
                    <ChevronRight className="w-4 h-4 text-neutral-300" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeCreateModal} role="dialog" aria-modal="true" aria-label="Create support ticket">
          <div ref={createModalRef} tabIndex={-1} className="bg-white w-full max-w-lg mx-4 premium-card" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-widest font-medium">Create Support Ticket</h3>
              <button onClick={closeCreateModal} aria-label="Close support ticket form" className="text-neutral-400 hover:text-neutral-900 text-lg leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">Subject *</label>
                <input value={createForm.subject} onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })} className="input-field w-full" placeholder="Brief summary of your issue" />
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">Message *</label>
                <textarea value={createForm.message} onChange={(e) => setCreateForm({ ...createForm, message: e.target.value })} rows={4} className="textarea-field w-full" placeholder="Describe your issue in detail..." />
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">Order Reference (optional)</label>
                <input value={createForm.orderId} onChange={(e) => setCreateForm({ ...createForm, orderId: e.target.value })} className="input-field w-full" placeholder="Order ID if related to an order" />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={closeCreateModal} className="btn-ghost">Cancel</button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !createForm.subject || !createForm.message}
                className="btn-primary"
              >
                {createMutation.isPending ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
