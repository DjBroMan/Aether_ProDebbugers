import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Wallet,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useStore, analyticsSummary } from "@/lib/store";

export const Route = createFileRoute("/analytics")({ component: Analytics });

function Analytics() {
  const approvals = useStore((s) => s.approvals);
  const tickets = useStore((s) => s.tickets);
  const payments = useStore((s) => s.payments);
  const summary = analyticsSummary();

  // approval kind distribution
  const byKind = new Map<string, number>();
  approvals.forEach((a) => byKind.set(a.kind, (byKind.get(a.kind) ?? 0) + 1));
  const maxKind = Math.max(1, ...Array.from(byKind.values()));

  // ticket priority breakdown
  const priCounts = { High: 0, Medium: 0, Low: 0 };
  tickets.forEach((t) => priCounts[t.priority]++);

  // recurring locations
  const locTally = new Map<string, number>();
  tickets.forEach((t) => locTally.set(t.location, (locTally.get(t.location) ?? 0) + 1));
  const recurring = Array.from(locTally.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <PhoneShell>
      <StatusBar />
      <ScreenHeader title="Analytics" subtitle="Decision Intelligence" />

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {/* Top KPIs */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { i: Clock, k: "AVG RESP", v: summary.avgResp, tone: "text-aether-blue" },
            { i: CheckCircle2, k: "SLA MET", v: `${summary.slaMet}%`, tone: "text-primary" },
            { i: AlertTriangle, k: "OPEN ISSUES", v: summary.openTickets, tone: "text-aether-pink" },
            { i: Wallet, k: "COLLECTED", v: `₹${summary.totalPaid}`, tone: "text-primary" },
          ].map(({ i: Icon, k, v, tone }) => (
            <div key={k} className="rounded-2xl bg-card shadow-soft p-4">
              <Icon className={`w-4 h-4 ${tone}`} />
              <p className="text-2xl font-extrabold mt-2 text-gradient">{v}</p>
              <p className="text-[10px] tracking-widest font-bold text-muted-foreground">{k}</p>
            </div>
          ))}
        </div>

        {/* Bottleneck */}
        {summary.bottleneck && (
          <div className="rounded-3xl gradient-primary text-white shadow-glow p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4" />
              <h3 className="font-bold text-sm">Bottleneck Detected</h3>
            </div>
            <p className="text-xs opacity-90">
              Stage <strong>"{summary.bottleneck.stage}"</strong> currently holds {summary.bottleneck.count} pending
              request{summary.bottleneck.count === 1 ? "" : "s"}. Consider redistributing approver load.
            </p>
          </div>
        )}

        {/* Approvals by kind */}
        <div className="rounded-3xl bg-card shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="font-bold">Requests by Type</h3>
            </div>
            <span className="text-xs font-semibold text-gradient">{approvals.length} total</span>
          </div>
          <div className="space-y-2">
            {Array.from(byKind.entries()).map(([kind, count]) => (
              <div key={kind}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold">{kind}</span>
                  <span className="font-bold text-muted-foreground">{count}</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full gradient-primary" style={{ width: `${(count / maxKind) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket priority */}
        <div className="rounded-3xl bg-card shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-aether-pink" />
              <h3 className="font-bold">Issue Priority Mix</h3>
            </div>
            <span className="text-xs font-semibold text-gradient">{tickets.length} tickets</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["High", "Medium", "Low"] as const).map((p) => (
              <div
                key={p}
                className={`rounded-2xl p-3 text-center ${
                  p === "High" ? "bg-destructive/10 text-destructive" : p === "Medium" ? "bg-aether-blue/10 text-aether-blue" : "bg-primary/10 text-primary"
                }`}
              >
                <p className="text-2xl font-extrabold">{priCounts[p]}</p>
                <p className="text-[10px] tracking-widest font-bold">{p.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recurring hotspots */}
        <div className="rounded-3xl bg-card shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-aether-pink" />
            <h3 className="font-bold">Recurring Hotspots</h3>
          </div>
          <div className="space-y-2">
            {recurring.length === 0 && <p className="text-xs text-muted-foreground py-3 text-center">No data yet.</p>}
            {recurring.map(([loc, count]) => (
              <Link key={loc} to="/issues" className="flex items-center gap-3 rounded-2xl bg-secondary/40 p-2.5 active:scale-[0.98]">
                <div className="w-9 h-9 rounded-full bg-aether-pink/15 text-aether-pink flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{loc}</p>
                  <p className="text-[11px] text-muted-foreground">{count} report{count === 1 ? "" : "s"}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>

        {/* Payments timeline */}
        {payments.length > 0 && (
          <div className="rounded-3xl bg-card shadow-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-bold">Recent Settlements</h3>
            </div>
            <div className="space-y-2">
              {payments.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-2xl bg-secondary/40 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold">{p.txn}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {p.method} · {new Date(p.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <p className="font-bold text-gradient">₹{p.amount}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </PhoneShell>
  );
}
