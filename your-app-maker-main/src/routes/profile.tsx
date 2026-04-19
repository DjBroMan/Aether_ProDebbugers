import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FileText, Shield, Bell, Moon, HelpCircle, LogOut, ChevronRight, Award } from "lucide-react";

export const Route = createFileRoute("/profile")({ component: Profile });

function Profile() {
  return (
    <PhoneShell>
      <StatusBar />
      <ScreenHeader title="Profile" subtitle="Your AETHER identity" />

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <div className="rounded-3xl bg-card shadow-card p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-extrabold shadow-glow">P</div>
          <div className="flex-1">
            <p className="text-base font-bold">Priyank Sharma</p>
            <p className="text-xs text-muted-foreground">priyank.s · B.Tech FY-A</p>
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <Award className="w-3 h-3"/> Student
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { k: "ATTEND.", v: "92%" },
            { k: "GPA", v: "8.7" },
            { k: "RANK", v: "#12" },
          ].map((s) => (
            <div key={s.k} className="rounded-2xl bg-card shadow-soft py-3 text-center">
              <p className="text-base font-extrabold text-gradient">{s.v}</p>
              <p className="text-[10px] tracking-widest font-bold text-muted-foreground">{s.k}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-card shadow-card divide-y divide-border/60">
          {[
            { i: FileText, t: "Document Vault", d: "Marksheets, ID, certs", to: "/approvals" },
            { i: Bell, t: "Notifications", d: "Alerts & reminders", to: "/alerts" },
            { i: Shield, t: "Privacy & Security", d: "Sessions, devices", to: "/profile" },
            { i: Moon, t: "Appearance", d: "Theme & accent", to: "/profile" },
            { i: HelpCircle, t: "Help & Support", d: "FAQ, contact", to: "/issues" },
          ].map(({ i: Icon, t, d, to }) => (
            <Link to={to} key={t} className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-xl bg-accent text-primary flex items-center justify-center"><Icon className="w-4 h-4"/></div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{t}</p>
                <p className="text-[11px] text-muted-foreground">{d}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          ))}
        </div>

        <Link to="/" className="w-full rounded-full bg-card shadow-card text-destructive font-bold py-3.5 flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4"/> Log out
        </Link>

        <p className="text-center text-[10px] tracking-widest text-muted-foreground font-semibold">AETHER · v1.0 · Atmospheric Precision</p>
      </div>
      <BottomNav />
    </PhoneShell>
  );
}
