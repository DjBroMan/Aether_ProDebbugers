import { Link, useLocation } from "@tanstack/react-router";
import { Home, Calendar, Sparkles, Bell, User } from "lucide-react";

const items = [
  { to: "/dashboard", icon: Home, label: "Home", center: false },
  { to: "/schedule", icon: Calendar, label: "Schedule", center: false },
  { to: "/copilot", icon: Sparkles, label: "Copilot", center: true },
  { to: "/alerts", icon: Bell, label: "Alerts", center: false },
  { to: "/profile", icon: User, label: "Me", center: false },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <div className="sticky bottom-0 left-0 right-0 glass-strong border-t border-white/40 px-4 pt-2 pb-3">
      <div className="flex items-end justify-between">
        {items.map((it) => {
          const active = pathname.startsWith(it.to);
          const Icon = it.icon;
          if (it.center) {
            return (
              <Link key={it.to} to={it.to} className="flex flex-col items-center -mt-7 active:scale-95 transition">
                <div className="w-16 h-16 rounded-full gradient-primary shadow-glow flex items-center justify-center text-white animate-pulse-glow ring-4 ring-background">
                  <Icon className="w-7 h-7" />
                </div>
              </Link>
            );
          }
          return (
            <Link key={it.to} to={it.to} className="flex flex-col items-center gap-0.5 px-3 py-1 group">
              <div className={`p-1.5 rounded-xl transition ${active ? "bg-accent" : ""}`}>
                <Icon className={`w-5 h-5 transition ${active ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground"}`} />
              </div>
              <span className={`text-[10px] font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
