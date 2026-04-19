import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Wallet, Smartphone, CreditCard, CheckCircle2, Download } from "lucide-react";
import { useState } from "react";
import { createPayment, type Payment } from "@/lib/store";
import { downloadReceiptPdf } from "@/lib/pdf";

export const Route = createFileRoute("/pay")({ component: Pay });

const breakdown = [
  { label: "Library fine", amount: 250 },
  { label: "Lab fee", amount: 800 },
  { label: "Canteen tab", amount: 200 },
];

function Pay() {
  const [method, setMethod] = useState<"UPI" | "Card">("UPI");
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const nav = useNavigate();

  const total = breakdown.reduce((s, b) => s + b.amount, 0);

  const onPay = () => {
    const p = createPayment({ amount: total, method, items: breakdown });
    setReceipt(p);
  };

  if (receipt) {
    return (
      <PhoneShell>
        <StatusBar />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-white shadow-glow animate-pulse-glow">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold">Payment Successful</h2>
          <p className="text-sm text-muted-foreground mt-2">₹{receipt.amount} paid via {receipt.method}</p>
          <p className="text-xs text-muted-foreground mt-1">Txn · {receipt.txn}</p>

          <button
            onClick={() => downloadReceiptPdf(receipt)}
            className="mt-6 rounded-full bg-card shadow-card text-foreground font-semibold py-3 px-6 inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Receipt (PDF)
          </button>

          <button onClick={() => nav({ to: "/dashboard" })} className="mt-3 rounded-full gradient-primary text-white font-bold py-3 px-8 shadow-glow">
            Back to Home
          </button>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <StatusBar />
      <ScreenHeader title="Payments" subtitle="Settle your dues instantly" />

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <div className="rounded-3xl gradient-primary text-white shadow-glow p-5">
          <p className="text-[10px] tracking-widest font-bold opacity-80">TOTAL DUES</p>
          <p className="text-4xl font-extrabold mt-1">₹{total}</p>
          <p className="text-xs opacity-80 mt-1">{breakdown.length} outstanding items</p>
          <div className="mt-4 rounded-2xl bg-white/20 backdrop-blur p-3 flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-2"><Wallet className="w-4 h-4" />AETHER Wallet</span>
            <span className="opacity-80">Mock Clearinghouse</span>
          </div>
        </div>

        <div className="rounded-3xl bg-card shadow-card p-4">
          <h3 className="font-bold mb-3">Breakdown</h3>
          {breakdown.map((b) => (
            <div key={b.label} className="flex items-center justify-between rounded-2xl bg-secondary/50 px-3 py-2.5 mb-2 last:mb-0">
              <span className="text-sm font-semibold">{b.label}</span>
              <span className="text-sm font-bold">₹{b.amount}</span>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-card shadow-card p-4">
          <h3 className="font-bold mb-3">Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            {(["UPI", "Card"] as const).map((m) => {
              const Icon = m === "UPI" ? Smartphone : CreditCard;
              return (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`rounded-2xl py-4 flex flex-col items-center gap-1 ${
                    method === m ? "gradient-primary text-white shadow-glow" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-bold">{m}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={onPay} className="w-full rounded-full gradient-primary text-white font-bold py-4 shadow-glow tracking-widest">
          PAY ₹{total}
        </button>
      </div>
      <BottomNav />
    </PhoneShell>
  );
}
