import { Link } from "@tanstack/react-router";
import {
  Bell,
  LogOut,
  Users,
  ShieldCheck,
  Activity,
  ChevronRight,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  Lock,
  CheckCircle2,
  UserPlus,
  BarChart3,
  Flame,
  Zap,
  Layers,
} from "lucide-react";
import { useStore, analyticsSummary } from "@/lib/store";

const stats = [
  { k: "Students", v: "2,418", icon: GraduationCap },
  { k: "Faculty", v: "184", icon: BookOpen },
  { k: "Active", v: "1.2k", icon: Activity },
];

export function DashboardAdmin({ user }: { user: string }) {
  const initial = user[0]?.toUpperCase() ?? "A";
  // subscribe so the dashboard is reactive
  const approvals = useStore((s) => s.approvals);
  const tickets = useStore((s) => s.tickets);
  const notifications = useStore((s) => s.notifications);
  const summary = analyticsSummary();

  const ticketsByLoc = new Map<string, number>();
  tickets.forEach((t) => ticketsByLoc.set(t.location, (ticketsByLoc.get(t.location) ?? 0) + 1));
  const heat = Array.from(ticketsByLoc.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4 space-y-4">
      {/* Welcome */}
      <div className="rounded-3xl bg-card shadow-card p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white font-bold shadow-glow">
          {initial}
        </div>
        <div className="flex-1">
          <p className="text-[10px] tracking-widest font-bold text-muted-foreground">ADMINISTRATOR</p>
          <p className="text-base font-bold leading-tight">{user}</p>
        </div>
        <Link to="/alerts" className="relative w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <Bell className="w-4 h-4" />
          {notifications.some((n) => !n.read) && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-aether-pink" />
          )}
        </Link>
        <Link to="/" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <LogOut className="w-4 h-4" />
        </Link>
      </div>

      {/* Hero */}
      <div className="relative rounded-3xl shadow-card p-5 overflow-hidden gradient-primary text-white">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-aether-pink/30 blur-3xl" />
        <div className="relative">
          <p className="text-[10px] tracking-widest font-bold text-white/80">CONTROL CENTER</p>
          <h2 className="mt-1 text-2xl font-extrabold leading-tight">System Overview</h2>
          <p className="text-xs text-white/80 mt-1">All nodes synced · 99.98% uptime</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {stats.map(({ k, v, icon: Icon }) => (
              <div key={k} className="rounded-2xl bg-white/15 backdrop-blur p-2.5 border border-white/20">
                <Icon className="w-4 h-4" />
                <p className="text-[10px] tracking-wider font-bold text-white/70 mt-1">{k.toUpperCase()}</p>
                <p className="text-sm font-bold">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2">
        <Link to="/analytics" className="rounded-2xl glass-strong shadow-soft p-3 flex flex-col items-center gap-2 card-hover">
          <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-glow">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold">Analytics</span>
        </Link>
        <Link to="/approvals" className="rounded-2xl glass-strong shadow-soft p-3 flex flex-col items-center gap-2 card-hover">
          <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-glow">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold">Approvals</span>
        </Link>
        <Link to="/issues" className="rounded-2xl glass-strong shadow-soft p-3 flex flex-col items-center gap-2 card-hover">
          <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-glow">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold">Issues</span>
        </Link>
        <Link to="/super-app" className="rounded-2xl glass-strong shadow-soft p-3 flex flex-col items-center gap-2 card-hover">
          <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-glow">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold">Apps</span>
        </Link>
      </div>

      {/* Live KPI strip */}
      <div className="rounded-3xl bg-card shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-bold">Live Operations</h3>
          </div>
          <Link to="/analytics" className="text-xs font-semibold text-gradient">Detailed →</Link>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { k: "PENDING", v: summary.pending },
            { k: "OPEN TICKETS", v: summary.openTickets },
            { k: "HIGH-PRI", v: summary.highPri },
          ].map((s) => (
            <div key={s.k} className="rounded-2xl bg-secondary/40 p-2.5 text-center">
              <p className="text-base font-extrabold text-gradient">{s.v}</p>
              <p className="text-[9px] tracking-widest font-bold text-muted-foreground">{s.k}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[
            { name: "Approvals", val: Math.min(100, summary.approved * 12 + 40), tag: summary.pending > 5 ? "Backlog" : "OK" },
            { name: "Tickets", val: Math.max(20, 100 - summary.openTickets * 12), tag: summary.highPri > 0 ? "Hot" : "OK" },
            { name: "Payments", val: Math.min(100, summary.totalPaid / 50), tag: "OK" },
          ].map((b) => (
            <div key={b.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold">{b.name}</span>
                <span className={`font-bold ${b.tag === "Backlog" ? "text-aether-pink" : b.tag === "Hot" ? "text-destructive" : "text-primary"}`}>
                  {b.tag}
                </span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full gradient-primary" style={{ width: `${b.val}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Faculty permissions */}
      <div className="rounded-3xl bg-card shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <h3 className="font-bold">Faculty Permissions</h3>
          </div>
          <Link to="/profile" className="text-xs font-semibold text-gradient">Edit →</Link>
        </div>
        <div className="space-y-2">
          {[
            { name: "M. Rao", role: "CSE", on: true },
            { name: "S. Khanna", role: "ECE", on: true },
            { name: "P. Verma", role: "MECH", on: false },
          ].map((f) => (
            <div key={f.name} className="flex items-center gap-3 rounded-2xl bg-secondary/40 p-2.5">
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                {f.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.role} · Approvals & Notify</p>
              </div>
              <span className={`text-[10px] tracking-widest font-bold px-2 py-1 rounded-full ${f.on ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                {f.on ? "ACTIVE" : "RESTRICTED"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent system activity (live) */}
      <div className="rounded-3xl bg-card shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">System Activity</h3>
          <Link to="/alerts" className="text-xs font-semibold text-gradient">All →</Link>
        </div>
        <ul className="space-y-3">
          {notifications.slice(0, 4).map((a) => (
            <li key={a.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{a.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{a.body}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </li>
          ))}
        </ul>
      </div>

      {/* Heatmap (live from tickets) */}
      <div className="rounded-3xl bg-card shadow-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-aether-pink" />
          <h3 className="font-bold">Support Heatmap</h3>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 28 }).map((_, i) => {
            const intensity = [0.1, 0.25, 0.4, 0.6, 0.8, 1][Math.floor(Math.abs(Math.sin(i * 1.7 + tickets.length)) * 6)];
            return (
              <div
                key={i}
                className="aspect-square rounded-md"
                style={{ background: `color-mix(in oklab, var(--primary) ${intensity * 100}%, transparent)` }}
              />
            );
          })}
        </div>
        <div className="mt-3 space-y-1.5">
          {heat.slice(0, 3).map(([loc, count]) => (
            <div key={loc} className="flex items-center justify-between text-xs">
              <span className="font-semibold flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-aether-pink" />
                {loc}
              </span>
              <span className="text-muted-foreground">{count} reports</span>
            </div>
          ))}
        </div>
      </div>

      {/* Create account */}
      <div className="rounded-3xl bg-card shadow-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="w-4 h-4 text-primary" />
          <h3 className="font-bold">Create Account</h3>
        </div>
        <input placeholder="Full name" className="w-full bg-secondary/40 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary mb-2" />
        <input placeholder="Email / ID" className="w-full bg-secondary/40 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary mb-2" />
        <div className="grid grid-cols-3 gap-2 mb-3">
          {(["Student", "Faculty", "Admin"] as const).map((r) => (
            <button key={r} className="rounded-xl bg-secondary py-2 text-xs font-bold text-muted-foreground hover:gradient-primary hover:text-white hover:shadow-glow transition">
              {r}
            </button>
          ))}
        </div>
        <button className="w-full rounded-full gradient-primary text-white text-xs font-bold py-2.5 shadow-glow active:scale-95">
          <CheckCircle2 className="w-4 h-4 inline -mt-0.5 mr-1" /> Provision in DB
        </button>
      </div>

      {/* Proactive alert */}
      {summary.bottleneck && (
        <div className="rounded-3xl gradient-primary text-white shadow-glow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4" />
            <h3 className="font-bold text-sm">Decision Intelligence</h3>
          </div>
          <p className="text-xs opacity-90">
            Bottleneck detected at <strong>"{summary.bottleneck.stage}"</strong> with {summary.bottleneck.count} pending request{summary.bottleneck.count === 1 ? "" : "s"}.
          </p>
          <Link to="/analytics" className="mt-3 inline-block rounded-full bg-white/20 backdrop-blur text-white text-xs font-bold px-4 py-1.5">
            Investigate <Users className="w-3 h-3 inline ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
}
