import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  LogOut,
  Users,
  ClipboardCheck,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  BellPlus,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  GraduationCap,
  ShieldCheck,
  Crown,
  UserCheck,
  Send,
  CheckSquare,
  Square,
  X,
  BarChart3,
} from "lucide-react";
import { useStore, actOnApproval, createNotice, type FacultyTier, type Department, type Year } from "@/lib/store";

const advisees = [
  { id: "a1", name: "Aarav Mehta", note: "Below 75% attendance", tone: "warn" },
  { id: "a2", name: "Sara Iyer", note: "Project review pending", tone: "info" },
  { id: "a3", name: "Rohit K.", note: "Follow-up: lab safety", tone: "info" },
];

const trend = [62, 70, 65, 78, 74, 82, 88];

const baseRoles = [
  { k: "Teacher" as FacultyTier, icon: GraduationCap },
  { k: "HOD" as FacultyTier, icon: ShieldCheck },
  { k: "Principal" as FacultyTier, icon: Crown },
];

const classRoster = [
  "Aarav Mehta",
  "Sara Iyer",
  "Rohit K.",
  "Neha P.",
  "Vikram S.",
  "Ananya G.",
];

export function DashboardFaculty({ user }: { user: string }) {
  const initial = user[0]?.toUpperCase() ?? "F";
  const [base, setBase] = useState<FacultyTier>("Teacher");
  const approvals = useStore((s) => s.approvals);
  const notices = useStore((s) => s.notices);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);

  const myQueue = approvals.filter((a) => {
    const cur = a.chain.find((c) => c.status === "current");
    return cur?.by === base;
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4 space-y-4">
      {/* Welcome */}
      <div className="rounded-3xl bg-card shadow-card p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white font-bold shadow-glow">
          {initial}
        </div>
        <div className="flex-1">
          <p className="text-[10px] tracking-widest font-bold text-muted-foreground">
            FACULTY · {base.toUpperCase()}
          </p>
          <p className="text-base font-bold leading-tight">Prof. {user}</p>
        </div>
        <Link to="/alerts" className="relative w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-aether-pink" />
        </Link>
        <Link to="/" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <LogOut className="w-4 h-4" />
        </Link>
      </div>

      {/* Authority level */}
      <div className="rounded-3xl bg-card shadow-card p-3">
        <p className="text-[10px] tracking-widest font-bold text-muted-foreground mb-2 px-1">AUTHORITY LEVEL</p>
        <div className="grid grid-cols-3 gap-2">
          {baseRoles.map(({ k, icon: Icon }) => (
            <button
              key={k}
              onClick={() => setBase(k)}
              className={`rounded-2xl py-2.5 flex flex-col items-center gap-1 transition active:scale-95 ${
                base === k ? "gradient-primary text-white shadow-glow" : "bg-secondary text-muted-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[11px] font-bold">{k}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Greeting */}
      <div className="relative rounded-3xl shadow-card p-5 overflow-hidden gradient-primary text-white">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-aether-pink/30 blur-3xl" />
        <div className="relative">
          <p className="text-[10px] tracking-widest font-bold text-white/80">DEPT · COMPUTER SCIENCE</p>
          <h2 className="mt-1 text-2xl font-extrabold leading-tight">
            Good morning, <span className="underline decoration-white/40">{user}</span>
          </h2>
          <p className="text-xs text-white/80 mt-1">3 lectures today · {myQueue.length} requests in your queue</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/15 backdrop-blur p-2.5 border border-white/20">
              <Users className="w-4 h-4" />
              <p className="text-[10px] tracking-wider font-bold text-white/70 mt-1">STUDENTS</p>
              <p className="text-sm font-bold">128</p>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur p-2.5 border border-white/20">
              <ClipboardCheck className="w-4 h-4" />
              <p className="text-[10px] tracking-wider font-bold text-white/70 mt-1">QUEUE</p>
              <p className="text-sm font-bold">{myQueue.length}</p>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur p-2.5 border border-white/20">
              <TrendingUp className="w-4 h-4" />
              <p className="text-[10px] tracking-wider font-bold text-white/70 mt-1">ATT %</p>
              <p className="text-sm font-bold">88</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2">
        <button onClick={() => setNoticeOpen(true)} className="rounded-2xl glass-strong shadow-soft p-3 flex flex-col items-center gap-2 card-hover">
          <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-glow">
            <BellPlus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold">Notice</span>
        </button>
        <button onClick={() => setAttendanceOpen(true)} className="rounded-2xl glass-strong shadow-soft p-3 flex flex-col items-center gap-2 card-hover">
          <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-glow">
            <CheckSquare className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold">Attendance</span>
        </button>
        <Link to="/approvals" className="rounded-2xl glass-strong shadow-soft p-3 flex flex-col items-center gap-2 card-hover">
          <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-glow">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold">Requests</span>
        </Link>
        <Link to="/analytics" className="rounded-2xl glass-strong shadow-soft p-3 flex flex-col items-center gap-2 card-hover">
          <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-glow">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold">Insights</span>
        </Link>
      </div>

      {/* Attendance trend */}
      <div className="rounded-3xl bg-card shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-bold">Attendance Trend</h3>
          </div>
          <span className="text-xs font-semibold text-gradient">7d</span>
        </div>
        <div className="flex items-end gap-2 h-24">
          {trend.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-lg gradient-primary shadow-glow" style={{ height: `${v}%` }} />
              <span className="text-[9px] text-muted-foreground font-semibold">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Approval queue (live) */}
      <div className="rounded-3xl bg-card shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">My Queue · {base}</h3>
          <Link to="/approvals" className="text-xs font-semibold text-gradient">All →</Link>
        </div>
        {myQueue.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">All clear. Nothing waiting on you.</p>
        ) : (
          <div className="space-y-2">
            {myQueue.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-secondary/40 p-2.5">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                  {r.by[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {r.kind} · by {r.by}
                  </p>
                </div>
                <button
                  onClick={() => actOnApproval(r.id, "approve", base)}
                  className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => actOnApproval(r.id, "reject", base)}
                  className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center text-destructive active:scale-95"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent notices */}
      <div className="rounded-3xl bg-card shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="font-bold">My Notices</h3>
          </div>
          <button onClick={() => setNoticeOpen(true)} className="text-xs font-semibold text-gradient">+ New</button>
        </div>
        {notices.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No notices yet.</p>
        ) : (
          <div className="space-y-2">
            {notices.slice(0, 3).map((n) => (
              <div key={n.id} className="rounded-2xl bg-secondary/40 p-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{n.title}</p>
                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    {n.audience}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{n.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advising */}
      <div className="rounded-3xl bg-card shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary" />
            <h3 className="font-bold">Advising & Follow-ups</h3>
          </div>
          <span className="text-xs font-semibold text-gradient">{advisees.length}</span>
        </div>
        <div className="space-y-2">
          {advisees.map((a) => (
            <div key={a.name} className="flex items-center gap-3 rounded-2xl bg-secondary/40 p-2.5">
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                {a.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{a.name}</p>
                <p className={`text-xs truncate ${a.tone === "warn" ? "text-aether-pink" : "text-muted-foreground"}`}>{a.note}</p>
              </div>
              <Link to="/copilot" className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary active:scale-95">
                <MessageSquare className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <Link to="/schedule" className="block rounded-3xl bg-card shadow-card p-4">
        <p className="text-[10px] tracking-widest font-bold text-primary">NEXT LECTURE</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-glow">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold">Data Structures · 11:00</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Room A-204 · 42 students
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </Link>

      {noticeOpen && <NoticeModal onClose={() => setNoticeOpen(false)} author={`Prof. ${user}`} />}
      {attendanceOpen && <AttendanceModal onClose={() => setAttendanceOpen(false)} />}
    </div>
  );
}

function NoticeModal({ onClose, author }: { onClose: () => void; author: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Department>("CSE");
  const [year, setYear] = useState<Year>("All");

  const submit = () => {
    if (!title.trim()) return;
    createNotice({ title: title.trim(), body: body.trim(), audience, year, by: author });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex flex-col" onClick={onClose}>
      <div className="mt-auto bg-card rounded-t-3xl p-5 shadow-glow animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] tracking-widest font-bold text-muted-foreground">PUBLISH NOTICE</p>
            <h3 className="font-bold">Broadcast to students</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-secondary/40 rounded-2xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary mb-2"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Notice body"
          className="w-full bg-secondary/40 rounded-2xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary resize-none mb-3"
        />
        <p className="text-[10px] tracking-widest font-bold text-muted-foreground mb-2">DEPARTMENT</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {(["All", "CSE", "ECE", "MECH"] as Department[]).map((a) => (
            <button
              key={a}
              onClick={() => setAudience(a)}
              className={`rounded-xl py-1.5 text-xs font-bold ${
                audience === a ? "gradient-primary text-white shadow-glow" : "bg-secondary text-muted-foreground"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        <p className="text-[10px] tracking-widest font-bold text-muted-foreground mb-2">YEAR</p>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {(["All", "FY", "SY", "TY", "BE"] as Year[]).map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`rounded-xl py-1.5 text-xs font-bold ${
                year === y ? "gradient-primary text-white shadow-glow" : "bg-secondary text-muted-foreground"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
        <button
          onClick={submit}
          className="w-full rounded-full gradient-primary text-white font-bold py-3 shadow-glow tracking-widest text-sm flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" /> PUBLISH
        </button>
      </div>
    </div>
  );
}

function AttendanceModal({ onClose }: { onClose: () => void }) {
  const [present, setPresent] = useState<Set<string>>(new Set(classRoster));
  const [saved, setSaved] = useState(false);

  return (
    <div className="absolute inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex flex-col" onClick={onClose}>
      <div className="mt-auto bg-card rounded-t-3xl p-5 shadow-glow animate-fade-up max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] tracking-widest font-bold text-muted-foreground">ATTENDANCE · DATA STRUCTURES</p>
            <h3 className="font-bold">Mark present / absent</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {present.size} / {classRoster.length} present
        </p>
        <div className="space-y-2 mb-4">
          {classRoster.map((name) => {
            const here = present.has(name);
            return (
              <button
                key={name}
                onClick={() =>
                  setPresent((p) => {
                    const next = new Set(p);
                    if (here) next.delete(name);
                    else next.add(name);
                    return next;
                  })
                }
                className="w-full flex items-center gap-3 rounded-2xl bg-secondary/40 p-2.5 active:scale-[0.98]"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${here ? "gradient-primary shadow-glow" : "bg-muted-foreground"}`}>
                  {name[0]}
                </div>
                <p className="flex-1 text-left text-sm font-semibold">{name}</p>
                {here ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-muted-foreground" />}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => {
            setSaved(true);
            setTimeout(onClose, 800);
          }}
          className="w-full rounded-full gradient-primary text-white font-bold py-3 shadow-glow tracking-widest text-sm flex items-center justify-center gap-2"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          {saved ? "SAVED" : "SAVE"}
        </button>
      </div>
    </div>
  );
}
