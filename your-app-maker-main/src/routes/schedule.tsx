import { createFileRoute } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ChevronLeft, ChevronRight, MapPin, TriangleAlert, Sparkles, Plus, X, Send, CircleDot, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useStore,
  addScheduleEvent,
  detectClashes,
  suggestFreeSlot,
  roomAvailability,
  roomConflict,
  freeRoomsForSlot,
} from "@/lib/store";

export const Route = createFileRoute("/schedule")({ component: Schedule });

const days = [
  { d: "MON", n: 18 },
  { d: "TUE", n: 19 },
  { d: "WED", n: 20 },
  { d: "THU", n: 21 },
  { d: "FRI", n: 22 },
  { d: "SAT", n: 23 },
];

const hours = Array.from({ length: 11 }, (_, i) => 8 + i);

function Schedule() {
  const [view, setView] = useState<"Week" | "Month">("Week");
  const [active, setActive] = useState(0);
  const [creating, setCreating] = useState(false);
  const allEvents = useStore((s) => s.schedule);
  const tickets = useStore((s) => s.tickets);
  const approvals = useStore((s) => s.approvals);
  const events = useMemo(() => allEvents.filter((e) => e.day === active), [allEvents, active]);
  const clashes = useMemo(() => detectClashes(active), [allEvents, active]);
  const rooms = useMemo(() => roomAvailability(), [allEvents]);

  const firstClash = events.find((e) => clashes.has(e.id));
  const suggestion = firstClash ? suggestFreeSlot(active, firstClash.room, firstClash.span) : null;

  const openIssues = tickets.filter((t) => t.status !== "Resolved").slice(0, 4);
  const recentBookings = approvals
    .filter((a) => a.kind === "Room Booking" || a.kind === "Event")
    .slice(0, 4);

  return (
    <PhoneShell>
      <StatusBar />
      <ScreenHeader
        title="Schedule"
        subtitle="Conflict-aware timetable"
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreating(true)}
              className="w-9 h-9 rounded-full gradient-primary text-white shadow-glow flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="bg-secondary rounded-full p-1 flex text-xs font-semibold">
              {(["Week", "Month"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-full ${view === v ? "gradient-primary text-white shadow-glow" : "text-muted-foreground"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {/* Day selector */}
        <div className="rounded-3xl bg-card shadow-card px-2 py-3 flex items-center gap-1">
          <button className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
          {days.map((d, i) => (
            <button
              key={d.d}
              onClick={() => setActive(i)}
              className={`flex-1 flex flex-col items-center py-1.5 rounded-2xl ${active === i ? "gradient-primary text-white shadow-glow" : "text-foreground/70"}`}
            >
              <span className="text-[10px] font-bold tracking-wider">{d.d}</span>
              <span className="text-sm font-bold">{d.n}</span>
            </button>
          ))}
          <button className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground"><ChevronRight className="w-4 h-4" /></button>
        </div>

        {/* Clash banner */}
        {clashes.size > 0 && (
          <div className="rounded-2xl bg-aether-pink/15 border border-aether-pink/30 p-3 flex gap-3">
            <TriangleAlert className="w-5 h-5 text-aether-pink shrink-0" />
            <div className="text-xs">
              <p className="font-bold">{clashes.size} clash{clashes.size === 1 ? "" : "es"} detected</p>
              <p className="text-muted-foreground">Same room is booked in overlapping slots. Smart suggestion below.</p>
            </div>
          </div>
        )}

        {/* Timetable */}
        <div className="rounded-3xl bg-card shadow-card p-3">
          <div className="relative">
            {hours.map((h) => (
              <div key={h} className="flex items-start h-14 border-t first:border-t-0 border-border/60">
                <span className="w-12 -mt-2 text-[11px] text-muted-foreground font-semibold">{h}:00</span>
                <div className="flex-1" />
              </div>
            ))}
            {events.map((e) => {
              const isClash = clashes.has(e.id);
              return (
                <div
                  key={e.id}
                  className={`${isClash ? "gradient-clash" : "gradient-primary"} absolute left-12 right-2 rounded-2xl text-white px-4 py-2.5 shadow-glow`}
                  style={{ top: `${(e.startHour - 8 + 1) * 56 - 4}px`, height: `${e.span * 56 - 8}px` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-sm leading-tight">{e.title}</p>
                      <p className="text-[11px] flex items-center gap-1 opacity-90 mt-0.5"><MapPin className="w-3 h-3" />{e.room}</p>
                    </div>
                    {isClash && <span className="text-[9px] font-bold bg-white/25 px-2 py-0.5 rounded-full">CLASH</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Suggestion */}
        {firstClash && (
          <div className="w-full rounded-3xl bg-card shadow-card p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white shadow-glow"><Sparkles className="w-5 h-5" /></div>
            <div className="flex-1 text-left">
              <p className="font-bold text-sm">Suggested resolution</p>
              <p className="text-xs text-muted-foreground">
                Move <span className="font-semibold">{firstClash.title}</span> to {suggestion ? `${suggestion}:00` : "another room"} ·
                {suggestion ? " zero conflicts." : " try a different room."}
              </p>
            </div>
          </div>
        )}

        {/* Available rooms (live) */}
        <div className="rounded-3xl bg-card shadow-card p-4">
          <h3 className="font-bold mb-3">Live Room Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {rooms.map((x) => (
              <div key={x.room} className="rounded-2xl bg-secondary/50 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{x.room}</p>
                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${x.status === "Free" ? "bg-primary/15 text-primary" : "bg-aether-pink/15 text-aether-pink"}`}>
                    <CircleDot className="w-2 h-2" /> {x.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {x.status === "Occupied" ? `Free at ${x.freeAt}` : `Until ${x.until}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />

      {creating && <NewEventModal day={active} onClose={() => setCreating(false)} />}
    </PhoneShell>
  );
}

function NewEventModal({ day, onClose }: { day: number; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [room, setRoom] = useState("A-104");
  const [startHour, setStartHour] = useState(14);
  const [span, setSpan] = useState(1);

  // Live conflict preview — recomputes as user changes inputs
  const conflict = useMemo(() => roomConflict(day, room, startHour, span), [day, room, startHour, span]);
  const freeRooms = useMemo(() => freeRoomsForSlot(day, startHour, span), [day, startHour, span]);
  const nextSlot = useMemo(() => suggestFreeSlot(day, room, span), [day, room, span]);

  const submit = () => {
    if (!title.trim()) return;
    addScheduleEvent({ title: title.trim(), room, day, startHour, span, kind: "event" });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex flex-col" onClick={onClose}>
      <div className="mt-auto bg-card rounded-t-3xl p-5 shadow-glow animate-fade-up max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] tracking-widest font-bold text-muted-foreground">NEW EVENT</p>
            <h3 className="font-bold">Book a room / add to timetable</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" className="w-full bg-secondary/40 rounded-2xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary mb-2" />
        <div className="grid grid-cols-3 gap-2 mb-3">
          <select value={room} onChange={(e) => setRoom(e.target.value)} className="bg-secondary/40 rounded-xl px-2 py-2 text-sm font-semibold outline-none">
            {["A-104", "A-201", "B-105", "B-201", "Lab-2", "Lab-3", "C-310", "Auditorium"].map((r) => <option key={r}>{r}</option>)}
          </select>
          <select value={startHour} onChange={(e) => setStartHour(Number(e.target.value))} className="bg-secondary/40 rounded-xl px-2 py-2 text-sm font-semibold outline-none">
            {hours.map((h) => <option key={h} value={h}>{h}:00</option>)}
          </select>
          <select value={span} onChange={(e) => setSpan(Number(e.target.value))} className="bg-secondary/40 rounded-xl px-2 py-2 text-sm font-semibold outline-none">
            {[1, 2, 3].map((h) => <option key={h} value={h}>{h}h</option>)}
          </select>
        </div>

        {/* Live conflict warning */}
        {conflict ? (
          <div className="rounded-2xl bg-aether-pink/15 border border-aether-pink/30 p-3 mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-aether-pink" />
              <p className="text-xs font-bold text-aether-pink">Room {room} is booked</p>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">
              Overlaps "{conflict.title}" at {conflict.startHour}:00 (free at {conflict.startHour + conflict.span}:00).
            </p>
            <div className="space-y-1">
              {nextSlot != null && (
                <p className="text-[11px]">
                  <span className="font-bold text-primary">Next free in {room}:</span>{" "}
                  <button onClick={() => setStartHour(nextSlot)} className="underline font-semibold">
                    {nextSlot}:00
                  </button>
                </p>
              )}
              <p className="text-[11px]">
                <span className="font-bold text-primary">Free now:</span>{" "}
                {freeRooms.length === 0 ? (
                  <span className="text-muted-foreground">no rooms available this slot</span>
                ) : (
                  freeRooms.slice(0, 5).map((r, i) => (
                    <button
                      key={r}
                      onClick={() => setRoom(r)}
                      className="underline font-semibold mr-1"
                    >
                      {r}{i < Math.min(freeRooms.length, 5) - 1 ? "," : ""}
                    </button>
                  ))
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-3 mb-3 flex items-center gap-2">
            <CircleDot className="w-3 h-3 text-primary" />
            <p className="text-[11px] text-primary font-semibold">{room} is free at {startHour}:00 for {span}h.</p>
          </div>
        )}

        <button
          onClick={submit}
          className={`w-full rounded-full font-bold py-3 tracking-widest text-sm flex items-center justify-center gap-2 ${
            conflict ? "bg-aether-pink/20 text-aether-pink border border-aether-pink/40" : "gradient-primary text-white shadow-glow"
          }`}
        >
          <Send className="w-4 h-4" /> {conflict ? "BOOK ANYWAY" : "ADD EVENT"}
        </button>
      </div>
    </div>
  );
}
