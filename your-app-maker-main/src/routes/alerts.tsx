import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Bell, ChevronRight, FileText, TriangleAlert, Calendar, Wallet, Megaphone, CheckCheck } from "lucide-react";
import { useStore, markAllRead, type Notification } from "@/lib/store";

export const Route = createFileRoute("/alerts")({ component: Alerts });

const ICON: Record<Notification["kind"], any> = {
  approval: FileText,
  ticket: TriangleAlert,
  schedule: Calendar,
  payment: Wallet,
  notice: Megaphone,
};

const ROUTE: Record<Notification["kind"], string> = {
  approval: "/approvals",
  ticket: "/issues",
  schedule: "/schedule",
  payment: "/pay",
  notice: "/alerts",
};

function Alerts() {
  const notifs = useStore((s) => s.notifications);
  const today = notifs.filter((n) => Date.now() - n.at < 86_400_000);
  const earlier = notifs.filter((n) => Date.now() - n.at >= 86_400_000);

  const fmt = (at: number) => {
    const m = Math.round((Date.now() - at) / 60000);
    if (m < 60) return `${m}m`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.round(h / 24)}d`;
  };

  const Group = ({ label, items }: { label: string; items: Notification[] }) =>
    items.length === 0 ? null : (
      <div>
        <p className="text-[10px] tracking-widest font-bold text-muted-foreground mb-2 px-1">{label.toUpperCase()}</p>
        <div className="rounded-3xl bg-card shadow-card divide-y divide-border/60">
          {items.map((n) => {
            const Icon = ICON[n.kind] ?? Bell;
            return (
              <Link to={ROUTE[n.kind]} key={n.id} className="flex items-center gap-3 px-4 py-3 active:bg-secondary/40 transition">
                <div className="relative w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                  {!n.read && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-aether-pink" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{n.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{n.body}</p>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{fmt(n.at)}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      </div>
    );

  return (
    <PhoneShell>
      <StatusBar />
      <ScreenHeader
        title="Notifications"
        subtitle="Real-time campus events"
        right={
          <button onClick={markAllRead} className="w-9 h-9 rounded-full gradient-primary text-white shadow-glow flex items-center justify-center" title="Mark all read">
            <CheckCheck className="w-4 h-4" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
        {notifs.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-12">You're all caught up.</p>
        )}
        <Group label="Today" items={today} />
        <Group label="Earlier" items={earlier} />
      </div>
      <BottomNav />
    </PhoneShell>
  );
}
