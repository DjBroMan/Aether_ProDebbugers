/**
 * AETHER Campus Store — Zustand-based reactive store.
 * Ported from the reference project's useSyncExternalStore pattern
 * into Zustand for React Native compatibility.
 */
import { create } from 'zustand';

// ─── Types ──────────────────────────────────────────────────
export type FacultyTier = 'Teacher' | 'HOD' | 'Principal';

export type ApprovalStage = {
  label: string;
  by: FacultyTier | 'Office' | 'Student';
  status: 'done' | 'current' | 'pending' | 'rejected';
  at?: string;
  note?: string;
};

export type ApprovalKind =
  | 'Leave'
  | 'Room Booking'
  | 'Bonafide'
  | 'Event'
  | 'Fee Waiver'
  | 'Reschedule';

export type Approval = {
  id: string;
  title: string;
  kind: ApprovalKind;
  by: string;
  createdAt: number;
  status: 'Pending' | 'In Review' | 'Approved' | 'Rejected';
  chain: ApprovalStage[];
  details?: Record<string, string>;
};

export type Ticket = {
  id: string;
  title: string;
  location: string;
  category: 'IT' | 'Maintenance' | 'Facilities';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: number;
  by: string;
  photos: string[];
};

export type ScheduleEvent = {
  id: string;
  title: string;
  room: string;
  day: number;
  startHour: number;
  span: number;
  kind: 'class' | 'event' | 'lab';
};

export type Payment = {
  id: string;
  amount: number;
  method: 'UPI' | 'Card';
  txn: string;
  at: number;
  items: { label: string; amount: number }[];
};

export type Notice = {
  id: string;
  by: string;
  title: string;
  body: string;
  at: number;
  audience: 'All' | 'CSE' | 'ECE' | 'MECH';
};

export type CampusNotification = {
  id: string;
  title: string;
  body: string;
  at: number;
  to: string;
  kind: 'approval' | 'ticket' | 'schedule' | 'payment' | 'notice';
  read: boolean;
};

export type MiniApp = {
  id: string;
  name: string;
  description: string;
  icon: string;
  installed: boolean;
  permissions: string[];
};

// ─── Helpers ────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const now = () => Date.now();
const fmt = (t: number) => {
  const d = new Date(t);
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
};

function defaultChain(kind: ApprovalKind): ApprovalStage[] {
  const t = fmt(now());
  switch (kind) {
    case 'Leave':
      return [
        { label: 'Submitted', by: 'Student', status: 'done', at: t },
        { label: 'Faculty review', by: 'Teacher', status: 'current' },
        { label: 'HOD approval', by: 'HOD', status: 'pending' },
        { label: 'Office issue', by: 'Office', status: 'pending' },
      ];
    case 'Room Booking':
      return [
        { label: 'Submitted', by: 'Student', status: 'done', at: t },
        { label: 'Event Head', by: 'Teacher', status: 'current' },
        { label: 'HOD approval', by: 'HOD', status: 'pending' },
      ];
    case 'Bonafide':
      return [
        { label: 'Submitted', by: 'Student', status: 'done', at: t },
        { label: 'Class Teacher', by: 'Teacher', status: 'current' },
        { label: 'Office issue', by: 'Office', status: 'pending' },
      ];
    case 'Event':
      return [
        { label: 'Submitted', by: 'Student', status: 'done', at: t },
        { label: 'Event Head', by: 'Teacher', status: 'current' },
        { label: 'HOD approval', by: 'HOD', status: 'pending' },
        { label: 'Principal sign-off', by: 'Principal', status: 'pending' },
      ];
    case 'Fee Waiver':
      return [
        { label: 'Submitted', by: 'Student', status: 'done', at: t },
        { label: 'HOD review', by: 'HOD', status: 'current' },
        { label: 'Principal sign-off', by: 'Principal', status: 'pending' },
      ];
    case 'Reschedule':
      return [
        { label: 'Submitted', by: 'Student', status: 'done', at: t },
        { label: 'Faculty review', by: 'Teacher', status: 'current' },
      ];
  }
}

// ─── Seed Data ──────────────────────────────────────────────
const t0 = fmt(now() - 86_400_000);

interface CampusState {
  approvals: Approval[];
  tickets: Ticket[];
  schedule: ScheduleEvent[];
  payments: Payment[];
  notices: Notice[];
  notifications: CampusNotification[];
  miniApps: MiniApp[];

  // Actions
  createApproval: (input: { title: string; kind: ApprovalKind; by: string; details?: Record<string, string> }) => string;
  actOnApproval: (approvalId: string, action: 'approve' | 'reject', actor: FacultyTier, note?: string) => void;
  createTicket: (input: { title: string; location: string; category: Ticket['category']; by: string; photos: string[] }) => string;
  updateTicketStatus: (id: string, status: Ticket['status']) => void;
  createPayment: (input: { amount: number; method: Payment['method']; items: Payment['items'] }) => Payment;
  createNotice: (input: { title: string; body: string; audience: Notice['audience']; by: string }) => void;
  pushNotification: (input: { title: string; body: string; to: string; kind: CampusNotification['kind'] }) => void;
  markAllRead: () => void;
  addScheduleEvent: (input: Omit<ScheduleEvent, 'id'>) => ScheduleEvent;
  // Backend Integration
  fetchDashboardData: (token: string, role: string) => Promise<void>;
  initRealTimeSync: (role: string, userId: string) => void;
  stopRealTimeSync: () => void;
}

import axios from 'axios';
import { API_BASE_URL } from '../constants/api';
import { socketService } from '../services/socket';

export const useCampusStore = create<CampusState>((set, get) => ({
  approvals: [
    {
      id: uid(), title: 'Leave application', kind: 'Leave' as const, by: 'priyank.s',
      createdAt: now() - 7200_000, status: 'Approved' as const,
      chain: [
        { label: 'Submitted', by: 'Student' as const, status: 'done' as const, at: t0 },
        { label: 'Faculty review', by: 'Teacher' as const, status: 'done' as const, at: t0, note: 'OK' },
        { label: 'HOD approval', by: 'HOD' as const, status: 'done' as const, at: fmt(now() - 3600_000) },
        { label: 'Office issue', by: 'Office' as const, status: 'done' as const, at: fmt(now() - 1800_000) },
      ],
      details: { from: 'Apr 16', to: 'Apr 17', reason: 'Family function' } as Record<string, string>,
    },
    {
      id: uid(), title: 'Room booking · A-104', kind: 'Room Booking' as const, by: 'priyank.s',
      createdAt: now() - 3600_000, status: 'Pending' as const,
      chain: defaultChain('Room Booking'),
      details: { room: 'A-104', date: 'Apr 22', slot: '16:00–17:00' } as Record<string, string>,
    },
    {
      id: uid(), title: 'Bonafide certificate', kind: 'Bonafide' as const, by: 'priyank.s',
      createdAt: now() - 1800_000, status: 'In Review' as const,
      chain: defaultChain('Bonafide'),
      details: { purpose: 'Passport application' } as Record<string, string>,
    },
    {
      id: uid(), title: 'Tech Symposium 2026', kind: 'Event' as const, by: 'events.cse',
      createdAt: now() - 60_000 * 50, status: 'Pending' as const,
      chain: defaultChain('Event'),
      details: { venue: 'Auditorium', date: 'May 04', attendees: '300' } as Record<string, string>,
    },
  ] as Approval[],
  tickets: [
    { id: uid(), title: 'Projector flicker in B-201', location: 'B-201', category: 'IT', priority: 'High', status: 'Open', createdAt: now() - 1800_000, by: 'priyank.s', photos: [] },
    { id: uid(), title: 'WiFi outage · Library', location: 'Library', category: 'IT', priority: 'High', status: 'In Progress', createdAt: now() - 7200_000, by: 'sara.i', photos: [] },
    { id: uid(), title: 'Broken chair · Lab-3', location: 'Lab-3', category: 'Maintenance', priority: 'Low', status: 'Resolved', createdAt: now() - 86_400_000, by: 'rohit.k', photos: [] },
    { id: uid(), title: 'AC not cooling · A-104', location: 'A-104', category: 'Facilities', priority: 'Medium', status: 'Resolved', createdAt: now() - 86_400_000 * 2, by: 'priyank.s', photos: [] },
  ],
  schedule: [
    { id: uid(), title: 'Calculus II', room: 'B-201', day: 0, startHour: 9, span: 1, kind: 'class' },
    { id: uid(), title: 'Quantum Physics', room: 'A-104', day: 0, startHour: 10, span: 1, kind: 'class' },
    { id: uid(), title: 'Lab — Circuits', room: 'Lab-3', day: 0, startHour: 13, span: 2, kind: 'lab' },
    { id: uid(), title: 'Robotics Workshop', room: 'Lab-3', day: 0, startHour: 14, span: 1, kind: 'event' },
    { id: uid(), title: 'Data Structures', room: 'A-204', day: 1, startHour: 11, span: 1, kind: 'class' },
    { id: uid(), title: 'ML Seminar', room: 'Auditorium', day: 2, startHour: 15, span: 2, kind: 'event' },
  ],
  payments: [],
  notices: [
    { id: uid(), by: 'Prof. M. Rao', title: 'Mid-sem schedule released', body: 'Check the academic portal for the full schedule.', at: now() - 7200_000, audience: 'CSE' },
  ],
  notifications: [
    { id: uid(), title: 'Assignment due tomorrow', body: 'Quantum Physics · 11:59 PM', at: now() - 7200_000, to: 'priyank.s', kind: 'schedule', read: false },
    { id: uid(), title: 'Leave request approved', body: 'Apr 16 · HOD signed', at: now() - 18000_000, to: 'priyank.s', kind: 'approval', read: false },
    { id: uid(), title: 'Lab venue changed', body: 'Now Lab-3 · was Lab-1', at: now() - 86_400_000, to: 'all', kind: 'schedule', read: true },
  ],
  miniApps: [
    { id: 'canteen', name: 'Canteen Tracker', description: 'Live menu, queue & pre-order.', icon: 'coffee', installed: false, permissions: ['wallet:read'] },
    { id: 'research', name: 'Research Portal', description: 'Browse & submit papers.', icon: 'flask-conical', installed: true, permissions: ['profile:read'] },
    { id: 'library', name: 'Library System', description: 'Borrow, renew, reserve.', icon: 'library', installed: true, permissions: ['profile:read'] },
    { id: 'transport', name: 'Transport', description: 'Bus routes & live tracking.', icon: 'bus', installed: false, permissions: ['location:read'] },
    { id: 'health', name: 'Health Desk', description: 'Book infirmary, MediCare.', icon: 'heart-pulse', installed: false, permissions: ['profile:read'] },
    { id: 'alumni', name: 'Alumni Network', description: 'Mentorship & job board.', icon: 'users', installed: false, permissions: ['profile:read'] },
  ],

  // ─── Actions ────────────────────────────────────────────
  createApproval: (input) => {
    const id = uid();
    const a: Approval = {
      id,
      title: input.title,
      kind: input.kind,
      by: input.by,
      createdAt: now(),
      status: 'Pending',
      chain: defaultChain(input.kind),
      details: input.details,
    };
    set((s) => ({ approvals: [a, ...s.approvals] }));
    get().pushNotification({ title: `Request submitted: ${input.title}`, body: `Routed to ${a.chain[1]?.by ?? 'approver'}`, to: input.by, kind: 'approval' });
    return id;
  },

  actOnApproval: (approvalId, action, actor, note) => {
    set((s) => ({
      approvals: s.approvals.map((a) => {
        if (a.id !== approvalId) return a;
        const idx = a.chain.findIndex((c) => c.status === 'current');
        if (idx === -1) return a;
        const newChain = a.chain.slice();
        const stage = newChain[idx];
        if (stage.by !== actor && stage.by !== 'Office') return a;
        newChain[idx] = { ...stage, status: action === 'approve' ? 'done' : 'rejected', at: fmt(now()), note };
        let status: Approval['status'] = a.status;
        if (action === 'reject') {
          status = 'Rejected';
        } else {
          const next = newChain[idx + 1];
          if (next) { newChain[idx + 1] = { ...next, status: 'current' }; status = 'In Review'; }
          else { status = 'Approved'; }
        }
        return { ...a, chain: newChain, status };
      }),
    }));
    const updated = get().approvals.find((a) => a.id === approvalId);
    if (updated) {
      get().pushNotification({ title: `${updated.title} · ${updated.status}`, body: action === 'approve' ? `Cleared by ${actor}` : `Rejected by ${actor}`, to: updated.by, kind: 'approval' });
    }
  },

  createTicket: (input) => {
    const lower = `${input.title} ${input.location}`.toLowerCase();
    const priority: Ticket['priority'] = /(outage|fire|leak|down|emergency|urgent|crash|electric)/.test(lower) ? 'High' : /(slow|broken|flicker|noise|stuck)/.test(lower) ? 'Medium' : 'Low';
    const id = uid();
    const ticket: Ticket = { id, title: input.title, location: input.location, category: input.category, priority, status: 'Open', createdAt: now(), by: input.by, photos: input.photos };
    set((s) => ({ tickets: [ticket, ...s.tickets] }));
    get().pushNotification({ title: `Issue logged · ${priority} priority`, body: `${input.title} (${input.location})`, to: input.by, kind: 'ticket' });
    return id;
  },

  updateTicketStatus: (id, status) => {
    set((s) => ({ tickets: s.tickets.map((t) => (t.id === id ? { ...t, status } : t)) }));
  },

  createPayment: (input) => {
    const p: Payment = { id: uid(), amount: input.amount, method: input.method, txn: `AET-${Date.now().toString().slice(-6)}`, at: now(), items: input.items };
    set((s) => ({ payments: [p, ...s.payments] }));
    get().pushNotification({ title: 'Payment successful', body: `₹${p.amount} via ${p.method}`, to: 'priyank.s', kind: 'payment' });
    return p;
  },

  createNotice: (input) => {
    const n: Notice = { ...input, id: uid(), at: now() };
    set((s) => ({ notices: [n, ...s.notices] }));
    get().pushNotification({ title: `Notice · ${n.title}`, body: `${n.by} → ${n.audience}`, to: 'all', kind: 'notice' });
  },

  pushNotification: (input) => {
    const n: CampusNotification = { ...input, id: uid(), at: now(), read: false };
    set((s) => ({ notifications: [n, ...s.notifications].slice(0, 30) }));
  },

  markAllRead: () => {
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  },

  addScheduleEvent: (input) => {
    const e: ScheduleEvent = { ...input, id: uid() };
    set((s) => ({ schedule: [...s.schedule, e] }));
    return e;
  },

  toggleMiniApp: (appId) => {
    set((s) => ({ miniApps: s.miniApps.map((m) => (m.id === appId ? { ...m, installed: !m.installed } : m)) }));
  },

  // ─── Backend Integration ────────────────────────────────
  fetchDashboardData: async (token, role) => {
    try {
      const endpoint = role === 'STUDENT' ? '/api/dashboard/student' : '/api/dashboard/faculty';
      const res = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'x-mock-role': role 
        }
      });
      const data = res.data;
      
      // Map API notices to store notices
      if (data.announcements) {
        const mappedNotices = data.announcements.map((a: any) => ({
          id: a.id,
          by: a.author.name,
          title: a.title,
          body: a.body,
          at: new Date(a.createdAt).getTime(),
          audience: a.audience
        }));
        set({ notices: mappedNotices });
      }
    } catch (err) {
      console.error('[CampusStore] Failed to fetch dashboard', err);
    }
  },

  initRealTimeSync: (role, userId) => {
    const socket = socketService.connect(role, userId);
    
    socket.on('announcement:new', (announcement) => {
      console.log('[Socket] New announcement received!', announcement);
      const newNotice: Notice = {
        id: announcement.id,
        by: announcement.author?.name || 'System',
        title: announcement.title,
        body: announcement.body,
        at: new Date(announcement.createdAt).getTime(),
        audience: announcement.audience
      };
      
      set((s) => ({ notices: [newNotice, ...s.notices] }));
      get().pushNotification({ title: `Notice: ${newNotice.title}`, body: newNotice.body, to: 'all', kind: 'notice' });
    });

    socket.on('approval:new', (approval) => {
       console.log('[Socket] New approval pending!', approval);
       // In a full implementation, you'd merge this into state.approvals
       get().pushNotification({ title: `New Request`, body: approval.type, to: 'faculty', kind: 'approval' });
    });

    socket.on('approval:updated', (approval) => {
       console.log('[Socket] Approval updated!', approval);
       set((s) => ({
         approvals: s.approvals.map(a => a.id === approval.id ? { ...a, status: approval.status } : a)
       }));
       get().pushNotification({ title: `Approval Updated`, body: `${approval.type} is now ${approval.status}`, to: 'all', kind: 'approval' });
    });
  },

  stopRealTimeSync: () => {
    socketService.disconnect();
  }
}));

// ─── Derived Analytics ──────────────────────────────────────
export function analyticsSummary(state: CampusState) {
  const pending = state.approvals.filter((a) => a.status !== 'Approved' && a.status !== 'Rejected').length;
  const approved = state.approvals.filter((a) => a.status === 'Approved').length;
  const openTickets = state.tickets.filter((t) => t.status !== 'Resolved').length;
  const highPri = state.tickets.filter((t) => t.priority === 'High' && t.status !== 'Resolved').length;
  const totalPaid = state.payments.reduce((sum, p) => sum + p.amount, 0);
  const stageTally = new Map<string, number>();
  state.approvals.forEach((a) => {
    const cur = a.chain.find((c) => c.status === 'current');
    if (cur) stageTally.set(cur.label, (stageTally.get(cur.label) ?? 0) + 1);
  });
  const bottleneckArr = Array.from(stageTally.entries()).sort((a, b) => b[1] - a[1]);
  const bottleneck = bottleneckArr[0] ? { stage: bottleneckArr[0][0], count: bottleneckArr[0][1] } : null;
  return { pending, approved, openTickets, highPri, totalPaid, bottleneck, avgResp: '2.4h', slaMet: 94 };
}

export function detectClashes(schedule: ScheduleEvent[], day: number) {
  const events = schedule.filter((e) => e.day === day);
  const clashes = new Set<string>();
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i], b = events[j];
      const overlap = a.startHour < b.startHour + b.span && b.startHour < a.startHour + a.span;
      if (overlap && a.room === b.room) { clashes.add(a.id); clashes.add(b.id); }
    }
  }
  return clashes;
}

export function suggestFreeSlot(schedule: ScheduleEvent[], day: number, room: string, span = 1): number | null {
  const events = schedule.filter((e) => e.day === day && e.room === room);
  for (let h = 8; h <= 18 - span; h++) {
    const conflict = events.some((e) => h < e.startHour + e.span && e.startHour < h + span);
    if (!conflict) return h;
  }
  return null;
}
