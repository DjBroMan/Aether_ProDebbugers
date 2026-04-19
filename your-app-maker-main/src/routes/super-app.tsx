import { createFileRoute } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Coffee, FlaskConical, Library, Bus, Heart, Users, Sparkles, CheckCircle2, Plus, ShieldCheck } from "lucide-react";
import { useStore, toggleMiniApp } from "@/lib/store";

export const Route = createFileRoute("/super-app")({ component: SuperApp });

const ICONS: Record<string, any> = {
  Coffee,
  FlaskConical,
  Library,
  Bus,
  Heart,
  Users,
};

function SuperApp() {
  const apps = useStore((s) => s.miniApps);
  const installedCount = apps.filter((a) => a.installed).length;

  return (
    <PhoneShell>
      <StatusBar />
      <ScreenHeader title="AETHER Ecosystem" subtitle="Plugin-ready Super App" />

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <div className="rounded-3xl gradient-primary text-white shadow-glow p-5">
          <p className="inline-flex items-center gap-1 text-[10px] tracking-widest font-bold opacity-90">
            <Sparkles className="w-3 h-3" />API-FIRST
          </p>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight">One shell.<br />Endless mini-apps.</h2>
          <p className="text-xs opacity-90 mt-2">{installedCount} of {apps.length} installed · Sandboxed permissions</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {apps.map((app) => {
            const Icon = ICONS[app.icon] ?? Sparkles;
            return (
              <div key={app.id} className="rounded-2xl bg-card shadow-soft p-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white shadow-glow">
                    <Icon className="w-5 h-5" />
                  </div>
                  {app.installed && (
                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> ON
                    </span>
                  )}
                </div>
                <p className="font-bold mt-3 text-sm">{app.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex-1">{app.description}</p>
                <div className="mt-2 flex items-center gap-1 text-[9px] text-muted-foreground">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span className="truncate">{app.permissions.join(" · ")}</span>
                </div>
                <button
                  onClick={() => toggleMiniApp(app.id)}
                  className={`mt-3 rounded-full text-xs font-bold py-2 ${
                    app.installed ? "bg-secondary text-muted-foreground" : "gradient-primary text-white shadow-glow"
                  }`}
                >
                  {app.installed ? "Uninstall" : "Install"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl bg-card shadow-card p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white shadow-glow">
            <Plus className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">Build your own mini-app</p>
            <p className="text-[11px] text-muted-foreground">REST + webhook bridge · Manifest v1</p>
          </div>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">DEV</span>
        </div>
      </div>
      <BottomNav />
    </PhoneShell>
  );
}
