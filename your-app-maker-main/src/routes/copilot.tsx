import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Sparkles, Mic, Send, Calendar, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import orb from "@/assets/copilot-orb.png";

export const Route = createFileRoute("/copilot")({ component: Copilot });

type Msg = { role: "user" | "bot"; text: string; cta?: { label: string; to: string; icon: any } };

const seed: Msg[] = [
  { role: "bot", text: "Hi Priyank! I'm your Campus Copilot. Ask me about your schedule, dues, or approvals." },
];

function Copilot() {
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const lower = q.toLowerCase();
      let reply: Msg = { role: "bot", text: "I can help with schedule, dues, approvals or rooms. Try one of those!" };
      if (lower.includes("schedule") || lower.includes("class")) {
        reply = {
          role: "bot",
          text: "You have 3 classes today: Calculus II at 9:00 (B-201), Quantum Physics at 10:30 (A-104), and Lab — Circuits at 13:00 (Lab-3). One clash detected.",
          cta: { label: "Open Schedule", to: "/schedule", icon: Calendar },
        };
      } else if (lower.includes("due") || lower.includes("pay") || lower.includes("fee")) {
        reply = { role: "bot", text: "You have ₹1,250 in pending dues across 3 items. Want to settle now?", cta: { label: "Pay Dues", to: "/pay", icon: FileText } };
      } else if (lower.includes("leave") || lower.includes("approval")) {
        reply = { role: "bot", text: "Your leave from Apr 16 was approved. 1 request still in review.", cta: { label: "View Approvals", to: "/approvals", icon: FileText } };
      }
      setMsgs((m) => [...m, reply]);
      setTyping(false);
    }, 900);
  };

  return (
    <PhoneShell>
      <StatusBar />
      <ScreenHeader title="Campus Copilot" subtitle="Powered by AETHER AI" />

      {/* hero orb (only when conversation is short) */}
      {msgs.length <= 1 && (
        <div className="flex flex-col items-center mb-2 animate-fade-up">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-aether-pink/40 blur-2xl animate-pulse-glow" />
            <img src={orb} alt="Copilot" width={140} height={140} className="relative w-24 h-24 animate-float" loading="lazy" />
          </div>
          <p className="mt-1 text-[10px] tracking-widest font-bold text-muted-foreground">YOUR PERSONAL AI</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 animate-fade-up ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "bot" && (
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white shrink-0 shadow-glow">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === "user" ? "gradient-primary text-white rounded-br-md shadow-glow" : "bg-card shadow-soft rounded-bl-md"
            }`}>
              <p>{m.text}</p>
              {m.cta && (
                <Link to={m.cta.to} className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
                  <m.cta.icon className="w-3.5 h-3.5"/> {m.cta.label}
                </Link>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white shrink-0 shadow-glow">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-card rounded-2xl rounded-bl-md shadow-soft px-4 py-3 flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["What's my schedule today?", "Any pending dues?", "Status of my leave?"].map((q) => (
            <button key={q} onClick={() => send(q)} className="px-3 py-1.5 rounded-full bg-card shadow-soft text-xs font-semibold whitespace-nowrap text-foreground/80">
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full bg-card shadow-card px-2 py-2">
          <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-primary"><Mic className="w-4 h-4"/></button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask Copilot anything…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button onClick={() => send()} className="w-9 h-9 rounded-full gradient-primary text-white flex items-center justify-center shadow-glow">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      <BottomNav />
    </PhoneShell>
  );
}
