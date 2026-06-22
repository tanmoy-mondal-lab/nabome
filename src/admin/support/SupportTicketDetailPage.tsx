import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import { StatusBadge } from "../common/StatusBadge";
import { ArrowLeft, Send } from "lucide-react";

interface Reply {
  id: string;
  message: string;
  isStaff: boolean;
  createdAt: string;
  author?: { firstName: string; lastName: string };
}

interface TicketDetail {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  name: string;
  email: string;
  createdAt: string;
  profile?: { id: string; firstName: string; lastName: string; email: string; phone?: string };
  assignee?: { id: string; firstName: string; lastName: string };
  order?: { orderNumber: string };
  replies: Reply[];
}

export default function SupportTicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    if (!id) return;
    adminApi.getSupportTicket(id).then((res) => {
      const t = (res as unknown as { ticket: TicketDetail }).ticket;
      setTicket(t);
      setNewStatus(t.status);
    }).catch(() => navigate("/admin/support")).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSendReply = async () => {
    if (!id || !replyText.trim()) return;
    setSending(true);
    try {
      await adminApi.replySupportTicket(id, { message: replyText });
      setReplyText("");
      const res = await adminApi.getSupportTicket(id);
      setTicket((res as unknown as { ticket: TicketDetail }).ticket);
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await adminApi.updateSupportTicketStatus(id, { status });
      setNewStatus(status);
      const res = await adminApi.getSupportTicket(id);
      setTicket((res as unknown as { ticket: TicketDetail }).ticket);
    } catch { /* ignore */ }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!ticket) return null;

  return (
    <div>
      <button onClick={() => navigate("/admin/support")} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-4">
        <ArrowLeft size={14} /> Back to Tickets
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">{ticket.subject}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {ticket.name} &lt;{ticket.email}&gt; · {new Date(ticket.createdAt).toLocaleString()}
            {ticket.order && <> · Order #{ticket.order.orderNumber}</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={newStatus} onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded">
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-neutral-200 rounded p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-medium text-neutral-600 shrink-0">
                {ticket.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">{ticket.name}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{new Date(ticket.createdAt).toLocaleString()}</p>
                <p className="text-sm text-neutral-700 mt-2 whitespace-pre-wrap">{ticket.message}</p>
              </div>
            </div>
          </div>

          {ticket.replies.map((reply) => (
            <div key={reply.id} className={`bg-white border border-neutral-200 rounded p-6 ${reply.isStaff ? "border-brand-200 bg-brand-50/30" : ""}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${reply.isStaff ? "bg-brand-100 text-brand-700" : "bg-neutral-100 text-neutral-600"}`}>
                  {reply.isStaff ? "S" : ticket.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">
                    {reply.isStaff ? "Staff" : ticket.name}
                    {reply.isStaff && <span className="ml-2 text-xs px-1.5 py-0.5 bg-brand-100 text-brand-700 rounded">Staff</span>}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">{new Date(reply.createdAt).toLocaleString()}</p>
                  <p className="text-sm text-neutral-700 mt-2 whitespace-pre-wrap">{reply.message}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-white border border-neutral-200 rounded p-4">
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
              rows={3} placeholder="Type your reply..."
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none" />
            <div className="flex justify-end mt-2">
              <button onClick={handleSendReply} disabled={sending || !replyText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50">
                <Send size={14} /> {sending ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Priority</span>
                <span className={`capitalize ${ticket.priority === "urgent" ? "text-red-600 font-medium" : ""}`}>{ticket.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Replies</span>
                <span>{ticket.replies.length}</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-3">Customer</h3>
            <p className="text-sm text-neutral-900">{ticket.name}</p>
            <p className="text-xs text-neutral-400">{ticket.email}</p>
          </div>
          {ticket.order && (
            <div className="bg-white border border-neutral-200 rounded p-6">
              <h3 className="font-medium text-sm text-neutral-900 mb-2">Order</h3>
              <button onClick={() => navigate(`/admin/orders/${ticket.order?.orderNumber}`)}
                className="text-sm text-brand-600 hover:underline">View Order #{ticket.order.orderNumber} →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
