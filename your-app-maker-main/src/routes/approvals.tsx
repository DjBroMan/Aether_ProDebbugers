import { createFileRoute } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  Plus,
  Clock,
  CheckCircle2,
  FileText,
  ChevronRight,
  Download,
  X,
  CircleDashed,
  CircleCheck,
  CircleX,
  Send,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { useRole } from "@/hooks/use-role";
import {
  useStore,
  createApproval,
  actOnApproval,
  respondToApproval,
  type Approval,
  type ApprovalKind,
  type FacultyTier,
} from "@/lib/store";
import { downloadApprovalPdf } from "@/lib/pdf";

export const Route = createFileRoute("/approvals")({ component: Approvals });

const tabs = ["All", "Pending", "Approved", "Rejected"] as const;

const KINDS: { kind: ApprovalKind; titlePlaceholder: string }[] = [
  { kind: "Leave", titlePlaceholder: "Leave application" },
  { kind: "Room Booking", titlePlaceholder: "Room booking · A-201" },
  { kind: "Bonafide", titlePlaceholder: "Bonafide certificate" },
  { kind: "Event", titlePlaceholder: "Tech Symposium 2026" },
  { kind: "Fee Waiver", titlePlaceholder: "Fee waiver request" },
  { kind: "Reschedule", titlePlaceholder: "Lab reschedule" },
];

function statusColor(s: Approval["status"]) {
  switch (s) {
    case "Approved":
      return "text-primary bg-primary/10";
    case "Pending":
      return "text-aether-blue bg-aether-blue/10";
    case "In Review":
      return "text-aether-pink bg-aether-pink/10";
    case "Rejected":
      return "text-destructive bg-destructive/10";
  }
}

function Approvals() {
  const { role, user } = useRole();
  const approvals = useStore((s) => s.approvals);
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [actorTier, setActorTier] = useState<FacultyTier>("Teacher");

  const filtered =
    tab === "All"
      ? approvals
      : approvals.filter((a) => (tab === "Pending" ? a.status === "Pending" || a.status === "In Review" : a.status === tab));

  const detail = selected ? approvals.find((a) => a.id === selected) ?? null : null;
  const stats = {
    pending: approvals.filter((a) => a.status === "Pending" || a.status === "In Review").length,
    approved: approvals.filter((a) => a.status === "Approved").length,
    total: approvals.length,
  };

  return (
    <PhoneShell>
      <StatusBar />
      <ScreenHeader
        title="Approvals"
        subtitle={role === "Faculty" ? "Chain of Responsibility queue" : "Track your requests"}
        right={
          role === "Student" && (
            <button
              onClick={() => setCreating(true)}
              className="w-9 h-9 rounded-full gradient-primary text-white shadow-glow flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          )
        }
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { i: Clock, k: "PENDING", v: stats.pending },
            { i: CheckCircle2, k: "APPROVED", v: stats.approved },
            { i: FileText, k: "TOTAL", v: stats.total },
          ].map(({ i: Icon, k, v }) => (
            <div key={k} className="rounded-2xl bg-card shadow-soft p-3">
              <Icon className="w-4 h-4 text-primary" />
              <p className="text-xl font-extrabold mt-1">{v}</p>
              <p className="text-[10px] tracking-widest font-bold text-muted-foreground">{k}</p>
            </div>
          ))}
        </div>

        {role === "Faculty" && (
          <div className="rounded-2xl bg-card shadow-soft p-3">
            <p className="text-[10px] tracking-widest font-bold text-muted-foreground mb-2">ACTING AS</p>
            <div className="grid grid-cols-3 gap-2">
              {(["Teacher", "HOD", "Principal"] as FacultyTier[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setActorTier(t)}
                  className={`rounded-xl py-1.5 text-xs font-bold transition ${
                    actorTier === t ? "gradient-primary text-white shadow-glow" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                tab === t ? "gradient-primary text-white shadow-glow" : "bg-card text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-8">No requests in this view.</p>
          )}
          {filtered.map((it) => {
            const stage = it.chain.find((c) => c.status === "current");
            const canAct = role === "Faculty" && stage && stage.by === actorTier;
            return (
              <div key={it.id} className="rounded-2xl bg-card shadow-soft p-3">
                <button onClick={() => setSelected(it.id)} className="w-full flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{it.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {it.kind} · applied {new Date(it.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {stage ? ` · awaits ${stage.by}` : ""}
                      {it.resolvedAt ? ` · ${it.status.toLowerCase()} ${new Date(it.resolvedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}` : ""}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${statusColor(it.status)}`}>
                    ● {it.status}
                  </span>
                </button>
                <div className="mt-3 flex items-center gap-2">
                  {it.status === "Approved" && (
                    <button
                      onClick={() => downloadApprovalPdf(it)}
                      className="flex-1 rounded-full gradient-primary text-white text-xs font-bold py-2 shadow-glow flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  )}
                  {canAct && (
                    <>
                      <button
                        onClick={() => actOnApproval(it.id, "approve", actorTier)}
                        className="flex-1 rounded-full gradient-primary text-white text-xs font-bold py-2 shadow-glow flex items-center justify-center gap-1.5"
                      >
                        <CircleCheck className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => actOnApproval(it.id, "reject", actorTier)}
                        className="flex-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold py-2 flex items-center justify-center gap-1.5"
                      >
                        <CircleX className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  )}
                  {!canAct && it.status !== "Approved" && (
                    <button
                      onClick={() => setSelected(it.id)}
                      className="flex-1 rounded-full bg-secondary text-muted-foreground text-xs font-bold py-2 flex items-center justify-center gap-1.5"
                    >
                      View timeline <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav />

      {creating && <CreateModal onClose={() => setCreating(false)} requester={user} />}
      {detail && <DetailModal approval={detail} onClose={() => setSelected(null)} />}
    </PhoneShell>
  );
}

function CreateModal({ onClose, requester }: { onClose: () => void; requester: string }) {
  const [kind, setKind] = useState<ApprovalKind>("Leave");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const submit = () => {
    const finalTitle = title.trim() || KINDS.find((k) => k.kind === kind)?.titlePlaceholder || kind;
    createApproval({
      title: finalTitle,
      kind,
      by: requester,
      details: details.trim() ? { reason: details.trim() } : undefined,
    });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex flex-col" onClick={onClose}>
      <div
        className="mt-auto bg-card rounded-t-3xl p-5 shadow-glow animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] tracking-widest font-bold text-muted-foreground">NEW REQUEST</p>
            <h3 className="font-bold">Smart Workflow</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] tracking-widest font-bold text-muted-foreground mb-2">TYPE</p>
        <div className="grid grid-cols-3 gap-2">
          {KINDS.map(({ kind: k }) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded-xl py-2 text-[11px] font-bold transition ${
                kind === k ? "gradient-primary text-white shadow-glow" : "bg-secondary text-muted-foreground"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <p className="text-[10px] tracking-widest font-bold text-muted-foreground mt-4 mb-2">TITLE</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={KINDS.find((k) => k.kind === kind)?.titlePlaceholder}
          className="w-full bg-secondary/40 rounded-2xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        />

        <p className="text-[10px] tracking-widest font-bold text-muted-foreground mt-4 mb-2">REASON / DETAILS</p>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Brief context (optional)"
          rows={3}
          className="w-full bg-secondary/40 rounded-2xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
        />

        <button
          onClick={submit}
          className="mt-4 w-full rounded-full gradient-primary text-white font-bold py-3 shadow-glow tracking-widest text-sm flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" /> SUBMIT TO CHAIN
        </button>
      </div>
    </div>
  );
}

function DetailModal({ approval, onClose }: { approval: Approval; onClose: () => void }) {
  const { role, user } = useRole();
  const [reply, setReply] = useState("");
  const thread = approval.thread ?? [];
  const fmtTs = (t: number) =>
    new Date(t).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const send = () => {
    if (!reply.trim()) return;
    const replyRole: "Requester" | FacultyTier = role === "Student" ? "Requester" : "Teacher";
    respondToApproval(approval.id, reply, user, replyRole);
    setReply("");
  };

  return (
    <div className="absolute inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex flex-col" onClick={onClose}>
      <div
        className="mt-auto bg-card rounded-t-3xl p-5 shadow-glow animate-fade-up max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] tracking-widest font-bold text-muted-foreground">{approval.kind.toUpperCase()}</p>
            <h3 className="font-bold text-base">{approval.title}</h3>
            <p className="text-[11px] text-muted-foreground">Ref · AET-{approval.id.toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-2xl bg-secondary/40 p-2.5">
            <p className="text-[9px] tracking-widest font-bold text-muted-foreground">APPLIED</p>
            <p className="text-xs font-semibold">{fmtTs(approval.createdAt)}</p>
          </div>
          <div className="rounded-2xl bg-secondary/40 p-2.5">
            <p className="text-[9px] tracking-widest font-bold text-muted-foreground">
              {approval.status === "Approved" ? "CONFIRMED" : approval.status === "Rejected" ? "REJECTED" : "STATUS"}
            </p>
            <p className={`text-xs font-semibold ${approval.status === "Rejected" ? "text-destructive" : "text-primary"}`}>
              {approval.resolvedAt ? fmtTs(approval.resolvedAt) : approval.status}
            </p>
          </div>
        </div>

        {approval.details && (
          <div className="rounded-2xl bg-secondary/40 p-3 mb-4 space-y-1">
            {Object.entries(approval.details).map(([k, v]) => (
              <p key={k} className="text-xs">
                <span className="text-muted-foreground capitalize">{k}: </span>
                <span className="font-semibold">{v}</span>
              </p>
            ))}
          </div>
        )}

        <h4 className="font-bold text-sm mb-3">Status timeline</h4>
        <ol className="relative pl-5 mb-4">
          <span className="absolute left-1.5 top-1 bottom-1 w-px bg-border" />
          {approval.chain.map((s, i) => (
            <li key={i} className="relative pb-3 last:pb-0">
              <span
                className={`absolute -left-[16px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                  s.status === "done"
                    ? "gradient-primary text-white"
                    : s.status === "current"
                      ? "bg-aether-pink text-white animate-pulse"
                      : s.status === "rejected"
                        ? "bg-destructive text-white"
                        : "bg-border"
                }`}
              >
                {s.status === "done" && <CircleCheck className="w-2.5 h-2.5" />}
                {s.status === "rejected" && <CircleX className="w-2.5 h-2.5" />}
                {s.status === "current" && <CircleDashed className="w-2.5 h-2.5" />}
              </span>
              <p className="text-sm font-semibold">{s.label}</p>
              <p className="text-[11px] text-muted-foreground">
                {s.by} · {s.at ?? "Pending"}
              </p>
              {s.note && <p className="text-[11px] italic text-muted-foreground">"{s.note}"</p>}
            </li>
          ))}
        </ol>

        {/* Conversation thread */}
        <h4 className="font-bold text-sm mb-2 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-primary" /> Conversation
        </h4>
        {thread.length === 0 ? (
          <p className="text-[11px] text-muted-foreground mb-3 px-1">
            {approval.status === "Approved" || approval.status === "Rejected"
              ? "Reply with a follow-up message — the requester will be notified."
              : "No messages yet. Use this to clarify before approval."}
          </p>
        ) : (
          <div className="space-y-2 mb-3">
            {thread.map((r, i) => {
              const mine = r.by === user;
              return (
                <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                      mine ? "gradient-primary text-white shadow-glow" : "bg-secondary/60"
                    }`}
                  >
                    <p className="text-[10px] font-bold opacity-80">
                      {r.by} · {r.role}
                    </p>
                    <p className="text-xs">{r.message}</p>
                    <p className="text-[9px] opacity-70 mt-0.5">{fmtTs(r.at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Write a message…"
            className="flex-1 bg-secondary/40 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={send}
            className="w-10 h-10 rounded-full gradient-primary text-white shadow-glow flex items-center justify-center active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {approval.status === "Approved" && (
          <button
            onClick={() => downloadApprovalPdf(approval)}
            className="w-full rounded-full gradient-primary text-white font-bold py-3 shadow-glow flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" /> Download Certificate (PDF)
          </button>
        )}
      </div>
    </div>
  );
}
