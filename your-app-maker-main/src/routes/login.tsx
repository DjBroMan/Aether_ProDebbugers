import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { StatusBar } from "@/components/StatusBar";
import { ArrowLeft, ArrowRight, Eye, EyeOff, GraduationCap, BookOpen, ShieldCheck } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [role, setRole] = useState<"Student" | "Faculty" | "Admin">("Student");
  const [show, setShow] = useState(false);
  const [id, setId] = useState("priyank.s");
  const [pw, setPw] = useState("aether");
  const nav = useNavigate();

  const roles = [
    { k: "Student", icon: GraduationCap },
    { k: "Faculty", icon: BookOpen },
    { k: "Admin", icon: ShieldCheck },
  ] as const;

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!id || !pw) return;
    try {
      localStorage.setItem("aether.role", role);
      localStorage.setItem("aether.user", id);
    } catch {}
    nav({ to: "/dashboard" });
  };

  return (
    <PhoneShell>
      <StatusBar />
      <form onSubmit={submit} className="flex-1 px-5 pt-4 pb-6 flex flex-col relative">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-aether-pink/30 blur-3xl animate-blob pointer-events-none" />
        <div className="absolute top-40 -left-10 w-40 h-40 rounded-full bg-aether-blue/30 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "2s" }} />

        <Link to="/" className="w-10 h-10 rounded-full glass-strong shadow-soft flex items-center justify-center z-10">
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="text-center mt-4 z-10 animate-fade-up">
          <div className="mx-auto w-16 h-16 rounded-3xl gradient-primary shadow-glow flex items-center justify-center text-white mb-3 animate-float">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-[0.3em] text-gradient">AETHER</h1>
          <p className="mt-1 text-[11px] tracking-[0.3em] text-muted-foreground font-semibold">YOUR CAMPUS. ONE INTERFACE.</p>
        </div>

        <div className="mt-5 rounded-3xl glass-strong shadow-card p-5 z-10 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <p className="text-[10px] tracking-widest font-bold text-muted-foreground">SIGN IN AS</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {roles.map(({ k, icon: Icon }) => (
              <button
                type="button"
                key={k}
                onClick={() => setRole(k)}
                className={`rounded-2xl py-3 flex flex-col items-center gap-1 transition active:scale-95 ${
                  role === k ? "gradient-primary text-white shadow-glow" : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-semibold">{k}</span>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <label className="text-[10px] tracking-widest font-bold text-muted-foreground">ID</label>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="mt-1 w-full bg-transparent border-b border-border py-2 outline-none focus:border-primary text-sm font-medium transition-colors"
              autoComplete="username"
            />
          </div>
          <div className="mt-4">
            <label className="text-[10px] tracking-widest font-bold text-muted-foreground">PASSWORD</label>
            <div className="flex items-center border-b border-border focus-within:border-primary transition-colors">
              <input
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="flex-1 bg-transparent py-2 outline-none text-sm font-medium"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="text-muted-foreground p-1">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="mt-3 text-right">
            <button type="button" className="text-xs font-semibold text-gradient">Forgot Credentials?</button>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] tracking-widest font-semibold text-primary/80 z-10">
          SIMPLIFY YOUR ACADEMIC JOURNEY THROUGH
        </p>
        <p className="text-center text-lg font-bold mt-1 z-10">Atmospheric Precision</p>

        <div className="flex-1" />

        <button
          type="submit"
          className="mt-6 rounded-full gradient-primary text-white font-bold py-4 px-6 flex items-center justify-between shadow-glow active:scale-[0.98] transition z-10"
        >
          <span className="tracking-widest">GET STARTED</span>
          <span className="w-9 h-9 rounded-full bg-white text-primary flex items-center justify-center">
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </form>
    </PhoneShell>
  );
}
