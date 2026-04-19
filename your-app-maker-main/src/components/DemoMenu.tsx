import { Link } from "@tanstack/react-router";
import { Menu, X, Home, LogIn, LayoutDashboard, Calendar, FileText, TriangleAlert, CreditCard, Layers, Sparkles, Bell, User, BarChart3 } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Landing", icon: Home },
  { to: "/login", label: "Login", icon: LogIn },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/schedule", label: "Schedule", icon: Calendar },
  { to: "/approvals", label: "Approvals", icon: FileText },
  { to: "/issues", label: "Issues", icon: TriangleAlert },
  { to: "/pay", label: "Pay Dues", icon: CreditCard },
  { to: "/super-app", label: "Super App", icon: Layers },
  { to: "/copilot", label: "AI Copilot", icon: Sparkles },
  { to: "/alerts", label: "Notifications", icon: Bell },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function DemoMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute top-9 right-3 z-40 w-9 h-9 rounded-full glass-strong shadow-soft border border-white/60 flex items-center justify-center text-primary hover:scale-105 transition"
        aria-label="Demo menu"
        title="Jump to any screen"
      >
        <Menu className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex flex-col" onClick={() => setOpen(false)}>
          <div
            className="mt-auto bg-card rounded-t-3xl p-5 shadow-glow animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] tracking-widest font-bold text-muted-foreground">DEMO NAVIGATOR</p>
                <h3 className="font-bold">Jump to any screen</h3>
              </div>
              <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
              {links.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl bg-secondary/60 p-3 flex flex-col items-center gap-1.5 active:scale-95 transition"
                >
                  <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white shadow-glow">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-center leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
