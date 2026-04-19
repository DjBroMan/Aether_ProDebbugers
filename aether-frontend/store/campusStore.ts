/**
 * AETHER Campus Store — Zustand-based reactive store.
 * Ported from the reference project's useSyncExternalStore pattern
 * into Zustand for React Native compatibility.
 */
import { create } from 'zustand';
import { useAuthStore } from './authStore';

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
  activePopup: CampusNotification | null;
  miniApps: MiniApp[];

  // Actions
  createApproval: (input: { title: string; kind: ApprovalKind; by: string; details?: Record<string, string> }) => Promise<string>;
  actOnApproval: (approvalId: string, action: 'approve' | 'reject', actor: FacultyTier, note?: string) => Promise<void>;
  createTicket: (input: { title: string; location: string; category: Ticket['category']; by: string; photos: string[] }) => Promise<string>;
  updateTicketStatus: (id: string, status: Ticket['status']) => void;
  createPayment: (input: { amount: number; method: Payment['method']; items: Payment['items'] }) => Payment;
  createNotice: (input: { title: string; body: string; audience: Notice['audience']; by: string }) => void;
  pushNotification: (input: { title: string; body: string; to: string; kind: CampusNotification['kind'] }) => void;
  setActivePopup: (n: CampusNotification | null) => void;
  markAllRead: () => void;
  addScheduleEvent: (input: Omit<ScheduleEvent, 'id'>) => ScheduleEvent;
  toggleMiniApp: (appId: string) => void;
  detectClashes: (day: number) => Set<string>;
  suggestFreeSlot: (day: number, room: string, span?: number) => number | null;
  roomAvailability: () => { room: string; status: 'Free' | 'Occupied'; until: string; freeAt: string; by: string }[];
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
  notifications: [],
  activePopup: null,
  miniApps: [
    { id: 'canteen', name: 'Canteen Tracker', description: 'Live menu, queue & pre-order.', icon: 'coffee', installed: false, permissions: ['wallet:read'] },
    { id: 'research', name: 'Research Portal', description: 'Browse & submit papers.', icon: 'flask-conical', installed: true, permissions: ['profile:read'] },
    { id: 'library', name: 'Library System', description: 'Borrow, renew, reserve.', icon: 'library', installed: true, permissions: ['profile:read'] },
    { id: 'transport', name: 'Transport', description: 'Bus routes & live tracking.', icon: 'bus', installed: false, permissions: ['location:read'] },
    { id: 'health', name: 'Health Desk', description: 'Book infirmary, MediCare.', icon: 'heart-pulse', installed: false, permissions: ['profile:read'] },
    { id: 'alumni', name: 'Alumni Network', description: 'Mentorship & job board.', icon: 'users', installed: false, permissions: ['profile:read'] },
  ],

  // ─── Actions ────────────────────────────────────────────
  createApproval: async (input) => {
    try {
      const { user } = useAuthStore.getState();
      const res = await axios.post(`${API_BASE_URL}/api/approvals`, {
        type: input.kind,
        content: JSON.stringify(input.details || { reason: input.title })
      }, {
        headers: { Authorization: `Bearer ${user?.token}`, 'x-mock-role': user?.role }
      });
      // Immediately add to local state so the student sees it without waiting for socket
      const a = res.data;
      let chain = defaultChain(a.type as ApprovalKind);
      chain = chain.map((c, i) => i === 0 ? { ...c, status: 'done' } : i === 1 ? { ...c, status: 'current' } : c);
      const frontendApproval: Approval = {
        id: a.id,
        title: `${a.type} Request`,
        kind: a.type as ApprovalKind,
        by: a.requester?.name || user?.name || 'Student',
        createdAt: new Date(a.createdAt).getTime(),
        status: 'Pending',
        chain: chain,
        details: { details: a.content }
      };
      set((s) => ({ approvals: [frontendApproval, ...s.approvals] }));
      return res.data.id;
    } catch (err) {
      console.error('[CampusStore] Failed to create approval', err);
      return '';
    }
  },

  actOnApproval: async (approvalId, action, actor, note) => {
    try {
      const endpoint = action === 'approve' ? `/api/approvals/${approvalId}/advance` : `/api/approvals/${approvalId}/reject`;
      const { user } = useAuthStore.getState();
      await axios.patch(`${API_BASE_URL}${endpoint}`, { note }, {
        headers: { Authorization: `Bearer ${user?.token}`, 'x-mock-role': user?.role }
      });
      // Socket listeners 'approval:updated' and 'notification:new' handle the rest.
    } catch (err) {
      console.error('[CampusStore] Failed to act on approval', err);
    }
  },

  createTicket: async (input) => {
    const lower = `${input.title} ${input.location}`.toLowerCase();
    const priority: Ticket['priority'] = /(outage|fire|leak|down|emergency|urgent|crash|electric)/.test(lower) ? 'High' : /(slow|broken|flicker|noise|stuck)/.test(lower) ? 'Medium' : 'Low';
    try {
      const { user } = useAuthStore.getState();
      const formData = new FormData();
      formData.append('title', input.title);
      formData.append('description', input.title);
      formData.append('location', input.location);
      // If photos were provided as base64/URIs, we skip file upload for web compatibility
      const res = await axios.post(`${API_BASE_URL}/api/tickets`, { title: input.title, description: input.title, location: input.location }, {
        headers: { Authorization: `Bearer ${user?.token}`, 'x-mock-role': user?.role || 'STUDENT' }
      });
      const t = res.data;
      const ticket: Ticket = {
        id: t.id, title: t.title, location: t.location || input.location, category: input.category,
        priority, status: 'Open', createdAt: new Date(t.createdAt).getTime(), by: t.author?.name || input.by, photos: t.imageUrl ? [t.imageUrl] : []
      };
      set((s) => ({ tickets: [ticket, ...s.tickets] }));
      get().pushNotification({ title: `Issue logged · ${priority} priority`, body: `${input.title} (${input.location})`, to: input.by, kind: 'ticket' });
      return ticket.id;
    } catch (err) {
      console.warn('[CampusStore] Ticket API failed, using local fallback', (err as Error).message);
      const id = uid();
      const ticket: Ticket = { id, title: input.title, location: input.location, category: input.category, priority, status: 'Open', createdAt: now(), by: input.by, photos: input.photos };
      set((s) => ({ tickets: [ticket, ...s.tickets] }));
      get().pushNotification({ title: `Issue logged · ${priority} priority`, body: `${input.title} (${input.location})`, to: input.by, kind: 'ticket' });
      return id;
    }
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
    set((s) => ({ notifications: [n, ...s.notifications].slice(0, 30), activePopup: n }));
  },

  setActivePopup: (n) => set({ activePopup: n }),

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

  detectClashes: (day) => {
    const events = get().schedule.filter((e) => e.day === day);
    const clashes = new Set<string>();
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const a = events[i], b = events[j];
        const aEnd = a.startHour + a.span;
        const bEnd = b.startHour + b.span;
        if (a.startHour < bEnd && b.startHour < aEnd && a.room === b.room) {
          clashes.add(a.id); clashes.add(b.id);
        }
      }
    }
    return clashes;
  },

  suggestFreeSlot: (day, room, span = 1) => {
    const events = get().schedule.filter((e) => e.day === day && e.room === room);
    for (let h = 8; h <= 18 - span; h++) {
      const conflict = events.some((e) => h < e.startHour + e.span && e.startHour < h + span);
      if (!conflict) return h;
    }
    return null;
  },

  roomAvailability: () => {
    const rooms = ['A-104', 'A-201', 'B-105', 'B-201', 'Lab-2', 'Lab-3', 'C-310', 'Auditorium'];
    const schedule = get().schedule;
    return rooms.map((room) => {
      const events = schedule.filter((e) => e.day === 0 && e.room === room);
      const currentHour = new Date().getHours() || 11;
      const occupied = events.find((e) => currentHour >= e.startHour && currentHour < e.startHour + e.span);
      if (occupied) {
        const freeAt = occupied.startHour + occupied.span;
        return { room, status: 'Occupied' as const, freeAt: `${freeAt}:00`, by: occupied.title, until: '' };
      }
      const next = events.find((e) => e.startHour > currentHour);
      return { room, status: 'Free' as const, until: next ? `${next.startHour}:00` : 'End of day', freeAt: '', by: '' };
    });
  },

  // ─── Backend Integration ────────────────────────────────
  fetchDashboardData: async (token, role) => {
    const headers = { Authorization: `Bearer ${token}`, 'x-mock-role': role };

    // 1. Dashboard data
    try {
      const endpoint = role === 'STUDENT' ? '/api/dashboard/student' : '/api/dashboard/faculty';
      const res = await axios.get(`${API_BASE_URL}${endpoint}`, { headers });
      const data = res.data;
      if (Array.isArray(data?.announcements)) {
        const mappedNotices = data.announcements.map((a: any) => ({
          id: a.id, by: a.author?.name || 'System', title: a.title, body: a.body,
          at: new Date(a.createdAt).getTime(), audience: a.audience || 'All'
        }));
        set({ notices: mappedNotices });
      }
    } catch (e) { console.warn('[CampusStore] Dashboard fetch failed', (e as Error).message); }

    // 2. Notifications
    try {
      const notifRes = await axios.get(`${API_BASE_URL}/api/notifications`, { headers });
      if (Array.isArray(notifRes.data)) {
        set({ notifications: notifRes.data.map((n: any) => ({
          id: n.id, title: n.type, body: n.message, at: new Date(n.createdAt).getTime(),
          to: 'me', kind: n.type === 'TICKET_RESOLVED' ? 'ticket' as const : 'approval' as const, read: n.isRead
        })) });
      }
    } catch (e) { console.warn('[CampusStore] Notifications fetch failed', (e as Error).message); }

    // 3. Tickets
    try {
      const ticketRes = await axios.get(`${API_BASE_URL}/api/tickets`, { headers });
      if (Array.isArray(ticketRes.data)) {
        const mapped = ticketRes.data.map((t: any) => ({
          id: t.id, title: t.title, location: t.location || 'Campus', category: 'IT' as const,
          priority: 'Medium' as const, status: t.status === 'OPEN' ? 'Open' as const : t.status === 'IN_PROGRESS' ? 'In Progress' as const : 'Resolved' as const,
          createdAt: new Date(t.createdAt).getTime(), by: t.author?.name || 'User', photos: t.imageUrl ? [t.imageUrl] : []
        }));
        set({ tickets: mapped });
      }
    } catch (e) { console.warn('[CampusStore] Tickets fetch failed', (e as Error).message); }

    // 4. Approvals
    try {
      const appRes = await axios.get(`${API_BASE_URL}/api/approvals`, { headers });
      if (Array.isArray(appRes.data)) {
        const mapped = appRes.data.map((a: any) => {
          let chain = defaultChain((a.type || 'Leave') as ApprovalKind);
          if (a.status === 'PENDING_HOD') chain = chain.map((c, i) => i <= 1 ? { ...c, status: 'done' as const } : i === 2 ? { ...c, status: 'current' as const } : c);
          else if (a.status === 'PENDING_PRINCIPAL') chain = chain.map((c, i) => i <= 2 ? { ...c, status: 'done' as const } : i === 3 ? { ...c, status: 'current' as const } : c);
          else if (a.status === 'COMPLETED') chain = chain.map(c => ({ ...c, status: 'done' as const }));
          else if (a.status === 'REJECTED') chain = chain.map((c, i) => i === 0 ? { ...c, status: 'done' as const } : { ...c, status: 'rejected' as const });
          else chain = chain.map((c, i) => i === 0 ? { ...c, status: 'done' as const } : i === 1 ? { ...c, status: 'current' as const } : c);
          let frontendStatus: Approval['status'] = 'Pending';
          if (a.status === 'COMPLETED') frontendStatus = 'Approved';
          if (a.status === 'REJECTED') frontendStatus = 'Rejected';
          if (a.status?.startsWith?.('PENDING_') && a.status !== 'PENDING_PROFESSOR') frontendStatus = 'In Review';
          return { id: a.id, title: `${a.type} Request`, kind: (a.type || 'Leave') as ApprovalKind,
            by: a.requester?.name || 'Student', createdAt: new Date(a.createdAt).getTime(),
            status: frontendStatus, chain, details: a.content ? { details: a.content } : undefined };
        });
        set({ approvals: mapped });
      }
    } catch (e) { console.warn('[CampusStore] Approvals fetch failed', (e as Error).message); }
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

    socket.on('approval:new', (a) => {
       console.log('[Socket] New approval pending!', a);
       let chain = defaultChain(a.type as ApprovalKind);
       // adjust chain based on status (since it's new, it's PENDING_PROFESSOR)
       chain = chain.map((c, i) => i === 0 ? { ...c, status: 'done' } : i === 1 ? { ...c, status: 'current' } : c);
       const frontendApproval: Approval = {
         id: a.id,
         title: `${a.type} Request`,
         kind: a.type as ApprovalKind,
         by: a.requester?.name || 'Student',
         createdAt: new Date(a.createdAt).getTime(),
         status: 'In Review',
         chain: chain,
         details: { details: a.content }
       };
       set((s) => {
         // Prevent duplicate key error if we already added it locally
         if (s.approvals.some(existing => existing.id === a.id)) return s;
         return { approvals: [frontendApproval, ...s.approvals] };
       });
       
       // Only faculty should get a notification for this
       const { user } = useAuthStore.getState();
       if (user?.role !== 'STUDENT') {
         get().pushNotification({ title: `New Request`, body: a.type, to: 'faculty', kind: 'approval' });
       }
    });

     socket.on('approval:updated', (a) => {
        console.log('[Socket] Approval updated!', a);
        let chain = defaultChain(a.type as ApprovalKind);
        if (a.status === 'PENDING_HOD') {
          chain = chain.map((c, i) => i === 0 ? { ...c, status: 'done' } : i === 1 ? { ...c, status: 'done' } : i === 2 ? { ...c, status: 'current' } : c);
        } else if (a.status === 'PENDING_PRINCIPAL') {
           chain = chain.map((c, i) => i <= 2 ? { ...c, status: 'done' } : i === 3 ? { ...c, status: 'current' } : c);
        } else if (a.status === 'COMPLETED') {
           chain = chain.map(c => ({ ...c, status: 'done' }));
        } else if (a.status === 'REJECTED') {
           chain = chain.map((c, i) => i === 0 ? { ...c, status: 'done' } : { ...c, status: 'rejected' });
        } else {
           chain = chain.map((c, i) => i === 0 ? { ...c, status: 'done' } : i === 1 ? { ...c, status: 'current' } : c);
        }
        let frontendStatus: Approval['status'] = 'Pending';
        if (a.status === 'COMPLETED') frontendStatus = 'Approved';
        if (a.status === 'REJECTED') frontendStatus = 'Rejected';
        if (a.status.startsWith('PENDING_') && a.status !== 'PENDING_PROFESSOR') frontendStatus = 'In Review';
        
        set((s) => ({
          approvals: s.approvals.map(existing => existing.id === a.id ? { 
            ...existing, 
            status: frontendStatus,
            chain: chain
          } : existing)
        }));
     });

     socket.on('notification:new', (notification) => {
        console.log('[Socket] New DB Notification received!', notification);
        // Build a user-friendly title
        let friendlyTitle = 'Notification';
        if (notification.type === 'APPROVAL') friendlyTitle = '✅ Request Update';
        if (notification.type === 'REJECTION') friendlyTitle = '❌ Request Rejected';
        if (notification.type === 'TICKET_RESOLVED') friendlyTitle = '🔧 Issue Resolved';
        if (notification.type === 'ANNOUNCEMENT') friendlyTitle = '📢 Announcement';

        const newNotif: CampusNotification = {
          id: notification.id,
          title: friendlyTitle,
          body: notification.message,
          at: new Date(notification.createdAt).getTime(),
          to: 'me',
          kind: notification.type === 'TICKET_RESOLVED' ? 'ticket' : 'approval',
          read: false
        };
        set((s) => {
          if (s.notifications.some(existing => existing.id === newNotif.id)) return s;
          return {
            notifications: [newNotif, ...s.notifications].slice(0, 30),
            activePopup: newNotif
          };
        });
     });

     socket.on('ticket:new', (ticket) => {
       console.log('[Socket] New Ticket!', ticket);
       const t: Ticket = {
          id: ticket.id,
          title: ticket.title,
          location: ticket.location || 'Campus',
          category: 'IT',
          priority: 'High',
          status: ticket.status,
          createdAt: new Date(ticket.createdAt).getTime(),
          by: ticket.author?.name || 'User',
          photos: ticket.imageUrl ? [ticket.imageUrl] : []
       };
       set((s) => {
         if (s.tickets.some(existing => existing.id === t.id)) return s;
         return { tickets: [t, ...s.tickets] };
       });
       
       const { user } = useAuthStore.getState();
       if (user && ['ADMIN', 'HOD', 'PRINCIPAL'].includes(user.role)) {
         get().pushNotification({
           title: '⚠️ New Issue Reported',
           body: ticket.title,
           to: 'admin',
           kind: 'ticket'
         });
       }
     });

     socket.on('ticket:updated', (ticket) => {
       console.log('[Socket] Ticket updated!', ticket);
       set((s) => ({
         tickets: s.tickets.map(t => t.id === ticket.id ? { ...t, status: ticket.status } : t)
       }));
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
