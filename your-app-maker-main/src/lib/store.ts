// Central in-memory reactive store for the AETHER mock backend.
// Simulates a real-time backend: every mutation notifies subscribers,
// background timers periodically inject new events to feel "live".

import { useSyncExternalStore } from "react";
import { toast } from "sonner";

// Safe toast wrapper — never crash on SSR or before mount
function notifyToast(opts: { title: string; body?: string; tone?: "default" | "success" | "error" | "warning" | "info" }) {
  if (typeof window === "undefined") return;
  const { title, body, tone = "default" } = opts;
  const fn =
    tone === "success" ? toast.success :
    tone === "error" ? toast.error :
    tone === "warning" ? toast.warning :
    tone === "info" ? toast.info :
    toast;
  try { fn(title, { description: body }); } catch { /* noop */ }
}

// ---------- Types ----------
export type Role = "Student" | "Faculty" | "Admin";
export type FacultyTier = "Teacher" | "HOD" | "Principal";

export type ApprovalStage = {
  label: string;
  by: FacultyTier | "Office" | "Student";
  status: "done" | "current" | "pending" | "rejected";
  at?: string;
  note?: string;
};

export type ApprovalKind =
  | "Leave"
  | "Room Booking"
  | "Bonafide"
  | "Event"
  | "Fee Waiver"
  | "Reschedule";


export type ApprovalReply = {
  by: string;
  role: "Requester" | FacultyTier | "Office";
  message: string;
  at: number;
};

export type Approval = {
  id: string;
  title: string;
  kind: ApprovalKind;
  by: string; // requester
  createdAt: number;
  resolvedAt?: number;
  status: "Pending" | "In Review" | "Approved" | "Rejected";
  chain: ApprovalStage[];
  details?: Record<string, string>;
  thread?: ApprovalReply[];
};

export type Ticket = {
  id: string;
  title: string;
  description?: string;
  location: string;
  category: "IT" | "Maintenance" | "Facilities";
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Resolved";
  createdAt: number;
  resolvedAt?: number;
  by: string;
  photos: string[];
};

export type ScheduleEvent = {
  id: string;
  title: string;
  room: string;
  day: number; // 0-6 (Mon-Sun)
  startHour: number; // 8..18
  span: number; // hours
  kind: "class" | "event" | "lab";
};

export type Payment = {
  id: string;
  amount: number;
  method: "UPI" | "Card";
  txn: string;
  at: number;
  items: { label: string; amount: number }[];
};

export type Department = "All" | "CSE" | "ECE" | "MECH";
export type Year = "All" | "FY" | "SY" | "TY" | "BE";

export type Notice = {
  id: string;
  by: string;
  title: string;
  body: string;
  at: number;
  audience: Department;
  year: Year;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  at: number;
  to: string;
  kind: "approval" | "ticket" | "schedule" | "payment" | "notice";
  read: boolean;
};

export type MiniApp = {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide name
  installed: boolean;
  permissions: string[];
};

type State = {
  approvals: Approval[];
  tickets: Ticket[];
  schedule: ScheduleEvent[];
  payments: Payment[];
  notices: Notice[];
  notifications: Notification[];
  miniApps: MiniApp[];
};

// ---------- Helpers ----------
const id = () => Math.random().toString(36).slice(2, 9);
const now = () => Date.now();
const fmt = (t: number) => {
  const d = new Date(t);
  return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
};

// ---------- Default approval chains ----------
function defaultChain(kind: ApprovalKind): ApprovalStage[] {
  const t = fmt(now());
  switch (kind) {
    case "Leave":
      return [
        { label: "Submitted", by: "Student", status: "done", at: t },
        { label: "Faculty review", by: "Teacher", status: "current" },
        { label: "HOD approval", by: "HOD", status: "pending" },
        { label: "Office issue", by: "Office", status: "pending" },
      ];
    case "Room Booking":
      return [
        { label: "Submitted", by: "Student", status: "done", at: t },
        { label: "Event Head", by: "Teacher", status: "current" },
        { label: "HOD approval", by: "HOD", status: "pending" },
      ];
    case "Bonafide":
      return [
        { label: "Submitted", by: "Student", status: "done", at: t },
        { label: "Class Teacher", by: "Teacher", status: "current" },
        { label: "Office issue", by: "Office", status: "pending" },
      ];
    case "Event":
      return [
        { label: "Submitted", by: "Student", status: "done", at: t },
        { label: "Event Head", by: "Teacher", status: "current" },
        { label: "HOD approval", by: "HOD", status: "pending" },
        { label: "Principal sign-off", by: "Principal", status: "pending" },
      ];
    case "Fee Waiver":
      return [
        { label: "Submitted", by: "Student", status: "done", at: t },
        { label: "HOD review", by: "HOD", status: "current" },
        { label: "Principal sign-off", by: "Principal", status: "pending" },
      ];
    case "Reschedule":
      return [
        { label: "Submitted", by: "Student", status: "done", at: t },
        { label: "Faculty review", by: "Teacher", status: "current" },
      ];
  }
}

// ---------- Seed data ----------
const t = fmt(now() - 86_400_000);
const seed: State = {
  approvals: [
    {
      id: id(),
      title: "Leave application",
      kind: "Leave",
      by: "priyank.s",
      createdAt: now() - 7200_000,
      status: "Approved",
      chain: [
        { label: "Submitted", by: "Student", status: "done", at: t },
        { label: "Faculty review", by: "Teacher", status: "done", at: t, note: "OK" },
        { label: "HOD approval", by: "HOD", status: "done", at: fmt(now() - 3600_000) },
        { label: "Office issue", by: "Office", status: "done", at: fmt(now() - 1800_000) },
      ],
      details: { from: "Apr 16", to: "Apr 17", reason: "Family function" },
    },
    {
      id: id(),
      title: "Room booking · A-104",
      kind: "Room Booking",
      by: "priyank.s",
      createdAt: now() - 3600_000,
      status: "Pending",
      chain: defaultChain("Room Booking"),
      details: { room: "A-104", date: "Apr 22", slot: "16:00–17:00" },
    },
    {
      id: id(),
      title: "Bonafide certificate",
      kind: "Bonafide",
      by: "priyank.s",
      createdAt: now() - 1800_000,
      status: "In Review",
      chain: defaultChain("Bonafide"),
      details: { purpose: "Passport application" },
    },
    {
      id: id(),
      title: "Tech Symposium 2026",
      kind: "Event",
      by: "events.cse",
      createdAt: now() - 60_000 * 50,
      status: "Pending",
      chain: defaultChain("Event"),
      details: { venue: "Auditorium", date: "May 04", attendees: "300" },
    },
  ],
  tickets: [
    { id: id(), title: "Projector flicker in B-201", location: "B-201", category: "IT", priority: "High", status: "Open", createdAt: now() - 1800_000, by: "priyank.s", photos: [] },
    { id: id(), title: "WiFi outage · Library", location: "Library", category: "IT", priority: "High", status: "In Progress", createdAt: now() - 7200_000, by: "sara.i", photos: [] },
    { id: id(), title: "Broken chair · Lab-3", location: "Lab-3", category: "Maintenance", priority: "Low", status: "Resolved", createdAt: now() - 86_400_000, by: "rohit.k", photos: [] },
    { id: id(), title: "AC not cooling · A-104", location: "A-104", category: "Facilities", priority: "Medium", status: "Resolved", createdAt: now() - 86_400_000 * 2, by: "priyank.s", photos: [] },
  ],
  schedule: [
    { id: id(), title: "Calculus II", room: "B-201", day: 0, startHour: 9, span: 1, kind: "class" },
    { id: id(), title: "Quantum Physics", room: "A-104", day: 0, startHour: 10, span: 1, kind: "class" },
    { id: id(), title: "Lab — Circuits", room: "Lab-3", day: 0, startHour: 13, span: 2, kind: "lab" },
    { id: id(), title: "Robotics Workshop", room: "Lab-3", day: 0, startHour: 14, span: 1, kind: "event" },
    { id: id(), title: "Data Structures", room: "A-204", day: 1, startHour: 11, span: 1, kind: "class" },
    { id: id(), title: "ML Seminar", room: "Auditorium", day: 2, startHour: 15, span: 2, kind: "event" },
  ],
  payments: [],
  notices: [
    { id: id(), by: "Prof. M. Rao", title: "Mid-sem schedule released", body: "Check the academic portal for the full schedule.", at: now() - 7200_000, audience: "CSE", year: "SY" },
  ],
  notifications: [
    { id: id(), title: "Assignment due tomorrow", body: "Quantum Physics · 11:59 PM", at: now() - 7200_000, to: "priyank.s", kind: "schedule", read: false },
    { id: id(), title: "Leave request approved", body: "Apr 16 · HOD signed", at: now() - 18000_000, to: "priyank.s", kind: "approval", read: false },
    { id: id(), title: "Lab venue changed", body: "Now Lab-3 · was Lab-1", at: now() - 86_400_000, to: "all", kind: "schedule", read: true },
  ],
  miniApps: [
    { id: "canteen", name: "Canteen Tracker", description: "Live menu, queue & pre-order.", icon: "Coffee", installed: false, permissions: ["wallet:read"] },
    { id: "research", name: "Research Portal", description: "Browse & submit papers.", icon: "FlaskConical", installed: true, permissions: ["profile:read"] },
    { id: "library", name: "Library System", description: "Borrow, renew, reserve.", icon: "Library", installed: true, permissions: ["profile:read"] },
    { id: "transport", name: "Transport", description: "Bus routes & live tracking.", icon: "Bus", installed: false, permissions: ["location:read"] },
    { id: "health", name: "Health Desk", description: "Book infirmary, MediCare.", icon: "Heart", installed: false, permissions: ["profile:read"] },
    { id: "alumni", name: "Alumni Network", description: "Mentorship & job board.", icon: "Users", installed: false, permissions: ["profile:read"] },
  ],
};

// ---------- Pub/sub ----------
let state: State = seed;
const subs = new Set<() => void>();
function notify() {
  subs.forEach((fn) => fn());
}
function setState(updater: (s: State) => State) {
  state = updater(state);
  notify();
}

export function subscribe(fn: () => void) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export function getState() {
  return state;
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

// ---------- Mutations ----------
export function createApproval(input: {
  title: string;
  kind: ApprovalKind;
  by: string;
  details?: Record<string, string>;
}) {
  const a: Approval = {
    id: id(),
    title: input.title,
    kind: input.kind,
    by: input.by,
    createdAt: now(),
    status: "Pending",
    chain: defaultChain(input.kind),
    details: input.details,
    thread: [],
  };
  setState((s) => ({ ...s, approvals: [a, ...s.approvals] }));
  pushNotification({
    title: `Request submitted: ${input.title}`,
    body: `Routed to ${a.chain[1]?.by ?? "approver"}`,
    to: input.by,
    kind: "approval",
  });
  notifyToast({ title: "Request submitted", body: `Routed to ${a.chain[1]?.by ?? "approver"}`, tone: "success" });
  return a.id;
}

export function actOnApproval(approvalId: string, action: "approve" | "reject", actor: FacultyTier, note?: string) {
  setState((s) => ({
    ...s,
    approvals: s.approvals.map((a) => {
      if (a.id !== approvalId) return a;
      const idx = a.chain.findIndex((c) => c.status === "current");
      if (idx === -1) return a;
      const newChain = a.chain.slice();
      const stage = newChain[idx];
      if (stage.by !== actor && stage.by !== "Office") return a;
      newChain[idx] = {
        ...stage,
        status: action === "approve" ? "done" : "rejected",
        at: fmt(now()),
        note,
      };
      let status: Approval["status"] = a.status;
      let resolvedAt = a.resolvedAt;
      if (action === "reject") {
        status = "Rejected";
        resolvedAt = now();
      } else {
        const next = newChain[idx + 1];
        if (next) {
          newChain[idx + 1] = { ...next, status: "current" };
          status = "In Review";
        } else {
          status = "Approved";
          resolvedAt = now();
        }
      }
      return { ...a, chain: newChain, status, resolvedAt };
    }),
  }));
  const updated = state.approvals.find((a) => a.id === approvalId);
  if (updated) {
    pushNotification({
      title: `${updated.title} · ${updated.status}`,
      body: action === "approve" ? `Cleared by ${actor}` : `Rejected by ${actor}`,
      to: updated.by,
      kind: "approval",
    });
    notifyToast({
      title: `${updated.title}`,
      body: action === "approve" ? `${actor} approved` : `${actor} rejected`,
      tone: action === "approve" ? "success" : "error",
    });
  }
}

export function respondToApproval(approvalId: string, message: string, by: string, role: ApprovalReply["role"]) {
  if (!message.trim()) return;
  const reply: ApprovalReply = { by, role, message: message.trim(), at: now() };
  setState((s) => ({
    ...s,
    approvals: s.approvals.map((a) => (a.id === approvalId ? { ...a, thread: [...(a.thread ?? []), reply] } : a)),
  }));
  const a = state.approvals.find((x) => x.id === approvalId);
  if (a) {
    const recipient = role === "Requester" ? "all" : a.by;
    pushNotification({
      title: `New message · ${a.title}`,
      body: `${by}: ${message.slice(0, 60)}`,
      to: recipient,
      kind: "approval",
    });
    notifyToast({ title: `Reply on ${a.title}`, body: message.slice(0, 80), tone: "info" });
  }
}

export function createTicket(input: {
  title: string;
  description?: string;
  location: string;
  category: Ticket["category"];
  by: string;
  photos: string[];
}) {
  // heuristic priority
  const lower = `${input.title} ${input.description ?? ""} ${input.location}`.toLowerCase();
  const priority: Ticket["priority"] =
    /(outage|fire|leak|down|emergency|urgent|crash|electric)/.test(lower)
      ? "High"
      : /(slow|broken|flicker|noise|stuck)/.test(lower)
        ? "Medium"
        : "Low";
  const t: Ticket = {
    id: id(),
    title: input.title,
    description: input.description,
    location: input.location,
    category: input.category,
    priority,
    status: "Open",
    createdAt: now(),
    by: input.by,
    photos: input.photos,
  };
  setState((s) => ({ ...s, tickets: [t, ...s.tickets] }));
  pushNotification({
    title: `Issue logged · ${priority} priority`,
    body: `${input.title} (${input.location})`,
    to: input.by,
    kind: "ticket",
  });
  notifyToast({
    title: `Issue logged · ${priority}`,
    body: `${input.title} — ${input.location}`,
    tone: priority === "High" ? "warning" : "success",
  });
  return t.id;
}

export function updateTicketStatus(id: string, status: Ticket["status"]) {
  setState((s) => ({
    ...s,
    tickets: s.tickets.map((t) =>
      t.id === id ? { ...t, status, resolvedAt: status === "Resolved" ? now() : t.resolvedAt } : t,
    ),
  }));
  const t = state.tickets.find((x) => x.id === id);
  if (t) {
    pushNotification({
      title: `Ticket ${status.toLowerCase()}`,
      body: t.title,
      to: t.by,
      kind: "ticket",
    });
    notifyToast({ title: `Ticket ${status.toLowerCase()}`, body: t.title, tone: status === "Resolved" ? "success" : "info" });
  }
}

export function createPayment(input: { amount: number; method: Payment["method"]; items: Payment["items"] }) {
  const p: Payment = {
    id: id(),
    amount: input.amount,
    method: input.method,
    txn: `AET-${Date.now().toString().slice(-6)}`,
    at: now(),
    items: input.items,
  };
  setState((s) => ({ ...s, payments: [p, ...s.payments] }));
  pushNotification({
    title: "Payment successful",
    body: `₹${p.amount} via ${p.method}`,
    to: "priyank.s",
    kind: "payment",
  });
  notifyToast({ title: "Payment successful", body: `₹${p.amount} via ${p.method}`, tone: "success" });
  return p;
}

export function createNotice(input: Omit<Notice, "id" | "at">) {
  const n: Notice = { ...input, id: id(), at: now() };
  setState((s) => ({ ...s, notices: [n, ...s.notices] }));
  pushNotification({
    title: `Notice · ${n.title}`,
    body: `${n.by} → ${n.audience} · ${n.year}`,
    to: "all",
    kind: "notice",
  });
  notifyToast({ title: `Notice published`, body: `${n.title} → ${n.audience}/${n.year}`, tone: "info" });
}

export function pushNotification(input: { title: string; body: string; to: string; kind: Notification["kind"] }) {
  const n: Notification = { ...input, id: id(), at: now(), read: false };
  setState((s) => ({ ...s, notifications: [n, ...s.notifications].slice(0, 30) }));
}

export function markAllRead() {
  setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
}

/** Returns the first conflicting event in the requested room/slot, or null. */
export function roomConflict(day: number, room: string, startHour: number, span: number): ScheduleEvent | null {
  const events = state.schedule.filter((e) => e.day === day && e.room === room);
  return events.find((e) => startHour < e.startHour + e.span && e.startHour < startHour + span) ?? null;
}

/** Lists rooms that are entirely free for the requested slot. */
export function freeRoomsForSlot(day: number, startHour: number, span: number): string[] {
  const rooms = ["A-104", "A-201", "B-105", "B-201", "Lab-2", "Lab-3", "C-310", "Auditorium"];
  return rooms.filter((r) => roomConflict(day, r, startHour, span) === null);
}

export function addScheduleEvent(input: Omit<ScheduleEvent, "id">) {
  const conflict = roomConflict(input.day, input.room, input.startHour, input.span);
  const e: ScheduleEvent = { ...input, id: id() };
  setState((s) => ({ ...s, schedule: [...s.schedule, e] }));
  if (conflict) {
    const free = freeRoomsForSlot(input.day, input.startHour, input.span);
    const nextSlot = suggestFreeSlot(input.day, input.room, input.span);
    pushNotification({
      title: `Room clash · ${input.room}`,
      body: `Overlaps "${conflict.title}". Free now: ${free.slice(0, 3).join(", ") || "none"}.`,
      to: "all",
      kind: "schedule",
    });
    notifyToast({
      title: `Conflict booked into ${input.room}`,
      body: nextSlot != null
        ? `Try ${nextSlot}:00 in ${input.room}, or rooms: ${free.slice(0, 3).join(", ") || "none free"}.`
        : `Free rooms now: ${free.slice(0, 3).join(", ") || "none"}.`,
      tone: "warning",
    });
  } else {
    pushNotification({
      title: `Booked · ${input.room}`,
      body: `${input.title} at ${input.startHour}:00`,
      to: "all",
      kind: "schedule",
    });
    notifyToast({ title: `Room booked`, body: `${input.room} · ${input.startHour}:00`, tone: "success" });
  }
  return { event: e, conflict };
}

export function detectClashes(day: number) {
  const events = state.schedule.filter((e) => e.day === day);
  const clashes = new Set<string>();
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i], b = events[j];
      const aEnd = a.startHour + a.span;
      const bEnd = b.startHour + b.span;
      const overlap = a.startHour < bEnd && b.startHour < aEnd;
      if (overlap && a.room === b.room) {
        clashes.add(a.id); clashes.add(b.id);
      }
    }
  }
  return clashes;
}

export function suggestFreeSlot(day: number, room: string, span = 1): number | null {
  const events = state.schedule.filter((e) => e.day === day && e.room === room);
  for (let h = 8; h <= 18 - span; h++) {
    const conflict = events.some((e) => h < e.startHour + e.span && e.startHour < h + span);
    if (!conflict) return h;
  }
  return null;
}

export function roomAvailability() {
  const rooms = ["A-104", "A-201", "B-105", "B-201", "Lab-2", "Lab-3", "C-310", "Auditorium"];
  return rooms.map((room) => {
    const events = state.schedule.filter((e) => e.day === 0 && e.room === room);
    const currentHour = 11; // mock "now"
    const occupied = events.find((e) => currentHour >= e.startHour && currentHour < e.startHour + e.span);
    if (occupied) {
      const freeAt = occupied.startHour + occupied.span;
      return { room, status: "Occupied" as const, freeAt: `${freeAt}:00`, by: occupied.title };
    }
    const next = events.find((e) => e.startHour > currentHour);
    return { room, status: "Free" as const, until: next ? `${next.startHour}:00` : "End of day", nextEvent: next?.title };
  });
}

export function toggleMiniApp(appId: string) {
  setState((s) => ({
    ...s,
    miniApps: s.miniApps.map((m) => (m.id === appId ? { ...m, installed: !m.installed } : m)),
  }));
}

// ---------- Simulated real-time ----------
// Periodically inject system-level events to make the app feel alive.
let started = false;
export function startRealtimeSimulator() {
  if (started || typeof window === "undefined") return;
  started = true;
  const samples = [
    { title: "New ticket nearby", body: "Projector flicker in C-310", kind: "ticket" as const },
    { title: "Schedule synced", body: "Tomorrow's timetable updated", kind: "schedule" as const },
    { title: "Notice published", body: "Library hours extended", kind: "notice" as const },
  ];
  let i = 0;
  setInterval(() => {
    const s = samples[i++ % samples.length];
    pushNotification({ ...s, to: "all" });
  }, 25_000);
}

// ---------- Derived analytics ----------
export function analyticsSummary() {
  const s = state;
  const pending = s.approvals.filter((a) => a.status !== "Approved" && a.status !== "Rejected").length;
  const approved = s.approvals.filter((a) => a.status === "Approved").length;
  const rejected = s.approvals.filter((a) => a.status === "Rejected").length;
  const openTickets = s.tickets.filter((t) => t.status !== "Resolved").length;
  const highPri = s.tickets.filter((t) => t.priority === "High" && t.status !== "Resolved").length;
  const totalPaid = s.payments.reduce((sum, p) => sum + p.amount, 0);
  // bottleneck = stage with most "current" entries
  const stageTally = new Map<string, number>();
  s.approvals.forEach((a) => {
    const cur = a.chain.find((c) => c.status === "current");
    if (cur) stageTally.set(cur.label, (stageTally.get(cur.label) ?? 0) + 1);
  });
  const bottleneck = Array.from(stageTally.entries()).sort((a, b) => b[1] - a[1])[0];
  // hotspot location
  const locTally = new Map<string, number>();
  s.tickets.forEach((t) => locTally.set(t.location, (locTally.get(t.location) ?? 0) + 1));
  const hotspot = Array.from(locTally.entries()).sort((a, b) => b[1] - a[1])[0];

  return {
    pending,
    approved,
    rejected,
    openTickets,
    highPri,
    totalPaid,
    bottleneck: bottleneck ? { stage: bottleneck[0], count: bottleneck[1] } : null,
    hotspot: hotspot ? { location: hotspot[0], count: hotspot[1] } : null,
    avgResp: "2.4h",
    slaMet: 94,
  };
}
