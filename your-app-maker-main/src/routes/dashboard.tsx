import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { Bell, LogOut, Clock, ListChecks, Wallet, FileText, TriangleAlert, CreditCard, Layers, MapPin, Calendar, ChevronRight, Sparkles } from "lucide-react";
import { useRole } from "@/hooks/use-role";
import { DashboardFaculty } from "@/components/DashboardFaculty";
import { DashboardAdmin } from "@/components/DashboardAdmin";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

const classes = [
  { time: "09:00", name: "Calculus II", room: "B-201" },
  { time: "10:30", name: "Quantum Physics", room: "A-104" },
  { time: "13:00", name: "Lab — Circuits", room: "Lab-3" },
];

function QuickTile({ icon: Icon, label, to, delay = 0 }: { icon: any; label: string; to: string; delay?: number }) {
  return (
    <Link
      to={to}
      className="rounded-2xl glass-strong shadow-soft p-3 flex flex-col items-center gap-2 card-hover animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-glow">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[11px] font-semibold">{label}</span>
    </Link>
  );
}

function Dashboard() {
  const { role, user } = useRole();

  if (role === "Faculty") {
    return (
      <PhoneShell>
        <StatusBar />
        <DashboardFaculty user={user} />
        <BottomNav />
      </PhoneShell>
    );
  }

  if (role === "Admin") {
    return (
      <PhoneShell>
        <StatusBar />
        <DashboardAdmin user={user} />
        <BottomNav />
      </PhoneShell>
    );
  }

  const displayName = user.split(".")[0].replace(/^\w/, (c) => c.toUpperCase());
  const initial = displayName[0]?.toUpperCase() ?? "S";

  return (
    <PhoneShell>
      <StatusBar />
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4 space-y-4">
        {/* Welcome */}
        <div className="rounded-3xl bg-card shadow-card p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white font-bold shadow-glow">{initial}</div>
          <div className="flex-1">
            <p className="text-[10px] tracking-widest font-bold text-muted-foreground">WELCOME</p>
            <p className="text-base font-bold leading-tight">{displayName}</p>
          </div>
          <Link to="/alerts" className="relative w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-aether-pink" />
          </Link>
          <Link to="/" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"><LogOut className="w-4 h-4" /></Link>
        </div>

        {/* Greeting card */}
        <div className="relative rounded-3xl shadow-card p-5 overflow-hidden gradient-primary text-white">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-aether-pink/30 blur-3xl pointer-events-none" />
          <div className="relative">
            <p className="text-[10px] tracking-widest font-bold text-white/80">B.TECH FY-A</p>
            <h2 className="mt-1 text-2xl font-extrabold leading-tight">
              Good morning, <span className="underline decoration-white/40">{displayName}</span>
            </h2>
            <p className="text-xs text-white/80 mt-1">4 classes today · 2 pending tasks</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-white/15 backdrop-blur p-2.5 border border-white/20">
                <Clock className="w-4 h-4" />
                <p className="text-[10px] tracking-wider font-bold text-white/70 mt-1">NEXT</p>
                <p className="text-sm font-bold">10:30</p>
              </div>
              <div className="rounded-2xl bg-white/15 backdrop-blur p-2.5 border border-white/20">
                <ListChecks className="w-4 h-4" />
                <p className="text-[10px] tracking-wider font-bold text-white/70 mt-1">TASKS</p>
                <p className="text-sm font-bold">2</p>
              </div>
              <div className="rounded-2xl bg-white/15 backdrop-blur p-2.5 border border-white/20">
                <Wallet className="w-4 h-4" />
                <p className="text-[10px] tracking-wider font-bold text-white/70 mt-1">DUES</p>
                <p className="text-sm font-bold">₹1,250</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2">
          <QuickTile icon={FileText} label="Approvals" to="/approvals" delay={0} />
          <QuickTile icon={TriangleAlert} label="Issues" to="/issues" delay={60} />
          <QuickTile icon={CreditCard} label="Pay Dues" to="/pay" delay={120} />
          <QuickTile icon={Layers} label="Super App" to="/super-app" delay={180} />
        </div>

        {/* Next class */}
        <Link to="/schedule" className="block rounded-3xl bg-card shadow-card p-4">
          <p className="text-[10px] tracking-widest font-bold text-primary">NEXT CLASS</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-glow">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold">Quantum Physics · 10:30</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3"/>A-104</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>

        {/* Today */}
        <div className="rounded-3xl bg-card shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="font-bold">Today</h3>
            </div>
            <Link to="/schedule" className="text-xs font-semibold text-gradient">Week →</Link>
          </div>
          <div className="space-y-2">
            {classes.map((c) => (
              <Link to="/schedule" key={c.time} className="flex items-center gap-3 rounded-2xl bg-secondary/40 p-2.5 active:scale-[0.98] transition">
                <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white text-[11px] font-bold">{c.time}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3"/>{c.room}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>

        {/* Copilot CTA */}
        <Link to="/copilot" className="block rounded-3xl bg-card shadow-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Ask Campus Copilot</p>
              <p className="text-xs text-muted-foreground">"What's my schedule today?"</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>

        {/* Recent */}
        <div className="rounded-3xl bg-card shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Recent</h3>
            <Link to="/alerts" className="text-xs font-semibold text-gradient">All →</Link>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center"><Bell className="w-4 h-4 text-primary" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Assignment due tomorrow</p>
                <p className="text-[11px] text-muted-foreground">2h ago</p>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center"><Clock className="w-4 h-4 text-primary" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Leave request approved</p>
                <p className="text-[11px] text-muted-foreground">5h ago</p>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center"><TriangleAlert className="w-4 h-4 text-primary" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Lab venue → Lab-3</p>
                <p className="text-[11px] text-muted-foreground">1d ago</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <BottomNav />
    </PhoneShell>
  );
}
