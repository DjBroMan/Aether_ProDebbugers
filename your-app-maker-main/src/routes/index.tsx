import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { StatusBar } from "@/components/StatusBar";
import { ArrowRight, Calendar, Sparkles, CircleCheck, TriangleAlert, Bell, ShieldCheck, Star } from "lucide-react";
import college from "@/assets/college-purple.jpg";

export const Route = createFileRoute("/")({ component: Landing });

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex-1 rounded-2xl glass-strong py-2.5 text-center">
      <div className="text-sm font-bold text-gradient">{v}</div>
      <div className="text-[10px] tracking-widest text-muted-foreground font-semibold">{k}</div>
    </div>
  );
}

function Tile({ icon: Icon, label, delay = 0 }: { icon: any; label: string; delay?: number }) {
  return (
    <div
      className="rounded-2xl glass-strong p-3 flex flex-col items-center gap-2 card-hover animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-glow">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[11px] font-semibold text-foreground/80">{label}</span>
    </div>
  );
}

function Landing() {
  return (
    <PhoneShell>
      <StatusBar />

      {/* Hero image — compact, breathing room from notch */}
      <div className="relative mx-4 mt-1 rounded-[1.75rem] overflow-hidden h-32 shadow-glow">
        <img
          src={college}
          alt="AETHER campus"
          width={1280}
          height={512}
          className="w-full h-full object-cover scale-110 animate-float"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-white bg-white/20 backdrop-blur px-2 py-1 rounded-full">
            <Star className="w-3 h-3 fill-white" /> HACKATHON 2026
          </span>
          <span className="text-[10px] font-bold tracking-widest text-white/90">v1.0</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-6 flex flex-col">
        <div className="text-center animate-fade-up">
          <h1 className="text-3xl font-extrabold tracking-[0.3em] text-gradient">AETHER</h1>
          <p className="mt-0.5 text-[10px] tracking-[0.3em] text-muted-foreground font-semibold">YOUR CAMPUS. ONE INTERFACE.</p>
        </div>

        <div className="mt-4 rounded-3xl glass-strong shadow-card p-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-primary">
            <Sparkles className="w-3 h-3" />NEW
          </span>
          <h2 className="mt-1 text-xl font-extrabold leading-tight">
            Transforming <span className="text-gradient">Academic Journeys</span>
          </h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Simplify your day through <span className="font-semibold text-foreground">Atmospheric Precision</span>.
          </p>
          <div className="mt-3 flex gap-2">
            <Stat k="ATTENDANCE" v="10M+" />
            <Stat k="APPROVALS" v="1M+" />
            <Stat k="EXCELLENCE" v="10y" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {[
            { icon: Calendar, label: "Smart Schedule" },
            { icon: Sparkles, label: "AI Copilot" },
            { icon: CircleCheck, label: "Approvals" },
            { icon: TriangleAlert, label: "Issues" },
            { icon: Bell, label: "Alerts" },
            { icon: ShieldCheck, label: "Roles" },
          ].map((t, i) => (
            <Tile key={t.label} {...t} delay={150 + i * 60} />
          ))}
        </div>

        <Link
          to="/login"
          className="mt-5 rounded-full gradient-primary text-white font-bold py-3.5 px-6 flex items-center justify-between shadow-glow active:scale-[0.98] transition animate-pulse-glow"
        >
          <span className="tracking-widest text-sm">GET STARTED</span>
          <span className="w-9 h-9 rounded-full bg-white text-primary flex items-center justify-center">
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Already onboard? <Link to="/login" className="text-primary font-semibold">Sign in</Link>
        </p>
      </div>
    </PhoneShell>
  );
}
