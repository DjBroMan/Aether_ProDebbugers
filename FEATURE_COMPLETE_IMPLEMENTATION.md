# AETHER — Feature Complete Implementation Blueprint

> **Last Updated**: April 19, 2026  
> **Platform**: React Native (Expo) + Express.js + PostgreSQL + Gemini AI  
> **Reference Designs**: `your-app-maker-main/src/routes/` (TanStack Router web app)  
> **Authors**: Priyank & Harshav (ProDebbugers)

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Core Features (Problem Statement)](#core-features)
3. [Advanced Feature Modules (10 Unique USPs)](#advanced-modules)
4. [Backend API Reference](#backend-api)
5. [Frontend Screen Map](#frontend-screen-map)
6. [Testing & Verification](#testing)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   EXPO MOBILE CLIENT                     │
│  ┌──────┐ ┌──────────┐ ┌──────┐ ┌──────┐ ┌──────────┐  │
│  │ Home │ │Approvals │ │Copilot│ │Report│ │ Profile  │  │
│  │(tabs)│ │(tabs)    │ │(tabs) │ │(tabs)│ │ (tabs)   │  │
│  └──┬───┘ └────┬─────┘ └──┬───┘ └──┬───┘ └────┬─────┘  │
│     │          │           │        │           │        │
│  ┌──┴──────────┴───────────┴────────┴───────────┴──┐    │
│  │              Zustand State (campusStore)          │    │
│  │  approvals│tickets│schedule│payments│notices│...  │    │
│  └──────────────────────────┬───────────────────────┘    │
│                             │                            │
│  ┌──────────────────────────┴───────────────────────┐    │
│  │              Socket.io Client                     │    │
│  │  Real-time: approval:*, ticket:*, schedule:*      │    │
│  └──────────────────────────┬───────────────────────┘    │
└─────────────────────────────┼────────────────────────────┘
                              │ HTTP + WebSocket
┌─────────────────────────────┼────────────────────────────┐
│                    EXPRESS BACKEND                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ auth │ │ dash │ │  ai  │ │ticket│ │ sched│ │ pay  │ │
│  │route │ │route │ │route │ │route │ │route │ │route │ │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ │
│     │        │        │        │        │        │      │
│  ┌──┴────────┴────────┴────────┴────────┴────────┴──┐   │
│  │          Prisma ORM + PostgreSQL (Render)         │   │
│  │  User│Ticket│Task│Approval│Event│Announcement     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────┐  ┌─────────────────┐   │
│  │ Gemini 2.0 Flash → xAI    │  │   Cloudinary     │   │
│  │ Grok → Groq Llama3         │  │   Image Store    │   │
│  │ (Triple AI Fallback)        │  │                  │   │
│  └─────────────────────────────┘  └─────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## Core Features

### F1: Unified Campus Command Interface (Role-Adaptive Dashboard)
**Status**: ✅ Complete  
**Files**: `StudentDashboard.tsx`, `FacultyDashboard.tsx`, `AdminDashboardComponent.tsx`  
**How it works**:
- `(tabs)/index.tsx` reads `user.role` from `useAuthStore`
- Renders `StudentDashboard` (STUDENT), `FacultyDashboard` (FACULTY/PROFESSOR/HOD), or `AdminDashboardComponent` (ADMIN)
- Each dashboard shows role-specific widgets: students see classes + dues, faculty sees approval queues + attendance, admin sees system KPIs
- All dashboards use consistent light theme (`#F8F5FF`) with Aether gradient branding
- Real-time sync via Socket.io (`initRealTimeSync` in `_layout.tsx`)

### F2: Smart Approval Chain Routing Engine
**Status**: ✅ Complete  
**Files**: `(tabs)/approvals.tsx`, `campusStore.ts`  
**How it works**:
- **Chain of Responsibility pattern**: Each approval type has a predefined chain (e.g., Leave: Student → Teacher → HOD → Office)
- `createApproval()` generates the chain via `defaultChain(kind)` and pushes notification
- `actOnApproval(id, 'approve'|'reject', actorTier)` advances the chain stage-by-stage
- Faculty selects their tier (Teacher/HOD/Principal) and can only act on stages matching their tier
- Students create new requests via BottomSheet modal with 6 request types
- Filter tabs: All / Pending / Approved / Rejected with live counts

### F3: Context-Aware AI Campus Copilot
**Status**: ✅ Complete (with RAG-style context injection)  
**Files**: `(tabs)/ai.tsx`, `backend/routes/ai.ts`  
**How it works**:
- **Frontend** (`ai.tsx`): `buildLocalContext()` serializes the entire Zustand store into compact JSON:
  - User schedule, approvals, tickets, notifications, payments, notices, pending dues, current date/time
- **Backend** (`ai.ts`): `buildServerContext()` queries Prisma for server-side data:
  - Tasks, approvals (by user), events, announcements (with author)
- Both contexts are merged into a single prompt with a `SYSTEM_PROMPT` instructing the AI to be specific, personalized, and actionable
- **Triple AI fallback**: Gemini 2.0 Flash → xAI Grok 3 Mini → Groq Llama 3.1
- **Local offline fallback**: `generateLocalFallback()` uses the Zustand store directly for keyword-based responses when all APIs fail
- **Contextual CTAs**: If the query relates to schedule/approvals/issues, a tappable action button appears in the response

### F4: Faculty Coordination Workspace
**Status**: ✅ Complete  
**Files**: `FacultyDashboard.tsx`  
**How it works**:
- Approval queue with pending count and one-tap approve/reject
- Notice publishing via backend `/api/announcements` POST
- Attendance trends visualization (bar charts)
- Class management through schedule integration
- Student advising via approval chain (Faculty sees requests from their students)

### F5: Conflict-Aware Scheduling Intelligence Layer
**Status**: ✅ Complete  
**Files**: `backend/routes/schedule.ts`, `campusStore.ts`  
**How it works**:
- **Clash Detection Algorithm**: `POST /api/schedule` checks for room double-booking using Prisma query:
  ```sql
  WHERE location = $room AND startTime < $end AND endTime > $start
  ```
- Returns `409 Conflict` with `clashWith` details if overlap detected
- **Smart Suggestions**: `suggestFreeSlot(day, room, span)` scans hours 8–18 for the first conflict-free window
- **Room Availability**: `roomAvailability()` returns live status (Free/Occupied) for all campus rooms
- **Cross-calendar sync**: Socket.io events `schedule:new` and `schedule:deleted` push updates to all connected clients
- The web reference (`your-app-maker-main/src/routes/schedule.tsx`) has full week view, day selector, clash banners, and live room status grid — all ported to the Student dashboard's "Today" section

### F6: Analytics & Decision Intelligence (Predictive Insight)
**Status**: ✅ Complete  
**Files**: `AdminDashboardComponent.tsx`, `campusStore.ts → analyticsSummary()`  
**How it works**:
- `analyticsSummary()` computes: pending/approved counts, open tickets, high-priority issues, total payments, SLA met %, avg response time
- **Bottleneck Detection**: Tallies which approval stage has the most "current" entries — surfaces as "Stage X currently holds Y pending requests"
- **Recurring Hotspots**: Aggregates ticket locations, ranks by frequency for heatmap visualization
- Admin dashboard displays: Live Operations KPIs, Approval/Ticket/Payment progress bars, bottleneck alerts, support heatmap

### F7: Integrated Issue Intelligence & Priority System
**Status**: ✅ Complete  
**Files**: `(tabs)/report.tsx`, `backend/routes/tickets.ts`  
**How it works**:
- **Camera capture**: `expo-camera` CameraView for photo evidence, rendered as sibling overlay (CameraView v17 compliance)
- **Auto-priority detection**: Backend regex scans title/location for keywords:
  - `outage|fire|leak|emergency` → High
  - `slow|broken|flicker` → Medium
  - Everything else → Low
- **Cloudinary upload**: `multer` + `cloudinary.uploader.upload_stream()` stores hi-res evidence
- **Admin ticket management**: Status updates (Open → In Progress → Resolved) with Socket.io broadcast
- **Heatmap**: Admin dashboard aggregates ticket locations for recurring hotspot visualization

### F8: Modular Super-App Plugin Architecture
**Status**: ✅ Complete  
**Files**: `(tabs)/explore.tsx`, `campusStore.ts`  
**How it works**:
- 6 pre-built mini-apps: Canteen Tracker, Research Portal, Library System, Transport, Health Desk, Alumni Network
- Each mini-app has: name, description, icon, permissions array, installed state
- `toggleMiniApp(id)` installs/uninstalls with sandboxed permissions display
- "Build your own" developer CTA with REST + webhook bridge + Manifest v1
- Grid layout with install/uninstall buttons and permission badges

### F9: Financial Settlement Gateway
**Status**: ✅ Complete  
**Files**: `backend/routes/pay.ts`, Student dashboard "Pay Dues" tile  
**How it works**:
- `POST /api/pay` accepts `{amount, description, method, items}` and returns transaction receipt
- Transaction ID format: `AE-{timestamp}`
- Supports UPI and Card methods
- Student dashboard shows ₹1,250 pending dues with "Pay Dues" quick action

---

## Advanced Feature Modules (10 Unique USPs)

These features are built INTO the existing codebase, not as separate modules. They enhance the core features with intelligence and efficiency.

### USP 1: Digital Accountability Layer
**Status**: ✅ Built into Approvals Engine  
**Implementation**: Every `actOnApproval()` call logs:
- `who`: The `actorTier` (Teacher/HOD/Principal)
- `when`: `fmt(now())` timestamp on each chain stage
- `how long`: Time delta between `createdAt` and each stage's `at` timestamp
- `note`: Optional rejection/approval reason
- Admin can trace: "Leave application was approved by Teacher at Apr 19 2:30, HOD at Apr 19 3:00"

### USP 2: Workflow Bottleneck Detection Engine
**Status**: ✅ Built into `analyticsSummary()`  
**Implementation**:
- Scans all approvals for stages with `status: 'current'`
- Tallies stage labels → returns highest-count stage as bottleneck
- Admin dashboard renders: "Stage 'Faculty review' currently holds 3 pending requests — consider redistributing approver load"

### USP 3: Micro-Interaction Command System (MICS)
**Status**: ✅ Built into Approvals & Issues screens  
**Implementation**:
- **Inline actions**: Approve/Reject buttons embedded directly in each approval card — no page transition
- **One-tap execution**: `actOnApproval(id, 'approve', tier)` fires immediately
- **Instant feedback**: State updates optimistically via Zustand, notification pushed
- **Context menus**: "View timeline" button for non-actionable items
- Future enhancement: Swipe gestures via `react-native-gesture-handler`

### USP 4: Contextual Decision Assistant (Copilot Extension)
**Status**: ✅ Built into AI Copilot  
**Implementation**:
- The `buildLocalContext()` function in `ai.tsx` sends live approval/ticket/schedule state
- AI responds with proactive suggestions: "2 pending approvals require attention"
- Contextual CTAs appear based on query topic (schedule → Open Schedule, approvals → View Approvals)

### USP 5: Dynamic Priority Adjustment System
**Status**: ✅ Built into Ticket system  
**Implementation**:
- `createTicket()` auto-detects priority from title keywords via regex
- Backend `POST /api/tickets` creates with auto-priority
- Admin can `PATCH /api/tickets/:id` to escalate/de-escalate
- High-priority tickets appear first in admin heatmap

### USP 6: Multi-Role Perspective Switching (Demo Mode)
**Status**: ✅ Built into Login screen  
**Implementation**:
- Landing page (`app/index.tsx`) has 3 demo role pills: Student, Faculty, Admin
- One-tap role switching → instant dashboard change
- `setUser()` stores role in Zustand, `_layout.tsx` auth guard redirects to `(tabs)/index`
- Each role sees completely different widgets, actions, and data

### USP 7: Temporal Activity Replay System
**Status**: ✅ Built into Notifications + Approvals  
**Implementation**:
- Every action pushes to `notifications[]` in campusStore with timestamp
- Approval chains record `at` timestamp for each stage → full audit trail
- "Recent" section on Student dashboard shows chronological activity feed
- Notifications can be marked as read via `markAllRead()`

### USP 8: Resource Utilization Monitor
**Status**: ✅ Built into Schedule system  
**Implementation**:
- `roomAvailability()` returns live status for 8 campus rooms
- Each room shows: Free/Occupied status, next event, free-at time
- Schedule screen (web reference) has full "Live Room Status" grid
- Backend tracks room usage via Event model

### USP 9: Intelligent Notification Prioritization System (INPS)
**Status**: ✅ Built into notification system  
**Implementation**:
- Notifications have: `kind` (approval/ticket/schedule/payment/notice), `read` state, `at` timestamp
- Sorted by recency — most recent first
- Unread indicator (pink dot) on bell icon in WelcomeBar
- `markAllRead()` bulk action
- Capped at 30 items (`slice(0, 30)`)

### USP 10: Modular Capability Expansion Framework (MCEF)
**Status**: ✅ Built into Super App Architecture  
**Implementation**:
- `miniApps[]` in campusStore acts as the module registry
- Each module has: `id, name, description, icon, installed, permissions[]`
- `toggleMiniApp(id)` controls installation state
- Role-based visibility controlled by permissions array
- "Build your own" CTA for developer extensibility

---

## Backend API Reference

All endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint                  | Role        | Description                          | Status |
|--------|---------------------------|-------------|--------------------------------------|--------|
| GET    | `/health`                 | Public      | Health check                         | ✅ 200 |
| GET    | `/api/dashboard/student`  | STUDENT     | Student dashboard data               | ✅ 200 |
| GET    | `/api/dashboard/faculty`  | FACULTY+    | Faculty dashboard data               | ✅ 200 |
| GET    | `/api/schedule`           | Any         | All events                           | ✅ 200 |
| POST   | `/api/schedule`           | Any         | Create event (with clash detection)  | ✅ 201/409 |
| DELETE | `/api/schedule/:id`       | Any         | Delete event                         | ✅ 200 |
| GET    | `/api/tickets`            | Any         | List tickets (role-filtered)         | ✅ 200 |
| POST   | `/api/tickets`            | Any         | Create ticket + Cloudinary upload    | ✅ 201 |
| PATCH  | `/api/tickets/:id`        | Any         | Update ticket status                 | ✅ 200 |
| POST   | `/api/ai/query`           | Any         | Context-aware AI query               | ✅ 200 |
| POST   | `/api/pay`                | Any         | Process payment                      | ✅ 200 |
| GET    | `/api/announcements`      | Any         | List announcements                   | ✅ 200 |
| POST   | `/api/announcements`      | FACULTY+    | Create announcement                  | ✅ 201 |
| GET    | `/api/users`              | ADMIN       | List all users                       | ✅ 200 |
| PATCH  | `/api/users/:id/role`     | ADMIN       | Assign role                          | ✅ 200 |
| GET    | `/api/users/me`           | Any         | Current user profile                 | ✅ 200 |
| GET    | `/api/tasks`              | Any         | User tasks                           | ✅ 200 |
| POST   | `/api/auth/google`        | Public      | Google OAuth login                   | ✅ 200 |

---

## Frontend Screen Map

| Tab        | Screen          | File                   | Key Features                                                |
|------------|-----------------|------------------------|-------------------------------------------------------------|
| Home       | Dashboard       | `(tabs)/index.tsx`     | Role-based rendering, welcome bar, hero card, quick actions  |
| Schedule   | Approvals       | `(tabs)/approvals.tsx` | Chain of Responsibility, create/approve/reject, filter tabs  |
| Copilot    | AI Chat         | `(tabs)/ai.tsx`        | Context-aware Gemini AI, triple fallback, offline mode       |
| Alerts     | Camera Report   | `(tabs)/report.tsx`    | Camera capture, Cloudinary upload, issue tickets             |
| Me         | Profile         | `(tabs)/profile.tsx`   | User info, stats, document vault, logout                     |
| (hidden)   | Super App       | `(tabs)/explore.tsx`   | Mini-app plugin grid, install/uninstall                      |
| (hidden)   | Admin           | `(tabs)/admin.tsx`     | Placeholder (admin rendered via Home tab)                    |

---

## Testing & Verification

### Automated Endpoint Tests (All Passing)
```
✅ GET  /health                    → 200
✅ GET  /api/dashboard/student     → 200
✅ GET  /api/dashboard/faculty     → 200 (with FACULTY role)
✅ GET  /api/schedule              → 200
✅ GET  /api/tickets               → 200
✅ GET  /api/announcements         → 200
✅ GET  /api/users                 → 200 (with ADMIN role)
✅ GET  /api/tasks                 → 200
✅ POST /api/ai/query              → 200 (Gemini/Groq responding)
✅ POST /api/pay                   → 200 (transaction receipt)
```

### Manual Verification Checklist
- [ ] Scan QR with Expo Go → app loads
- [ ] Student dashboard renders with light purple theme
- [ ] Faculty dashboard matches Student theme
- [ ] Admin dashboard matches Student theme
- [ ] Logout button navigates to login screen without crash
- [ ] Camera capture takes photo and shows preview
- [ ] Photo upload to Cloudinary succeeds
- [ ] AI Copilot returns context-aware responses
- [ ] Approval create → chain starts → faculty can approve
- [ ] Socket.io real-time notifications appear
- [ ] Super App explore screen shows mini-app grid
- [ ] Pay Dues quick action is accessible from dashboard
