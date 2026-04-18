# Frontend Redesign: Recreating the Reference App's UI in Aether

## Reference App Visual Language

The reference project is a **Vite + React + TailwindCSS 4** web app that renders inside a phone-shell mockup. It showcases a polished, light-mode campus management UI with these defining traits:

````carousel
![Landing Page](C:/Users/asus/.gemini/antigravity/brain/79569370-9ca1-4c5a-968a-a75e1225aee8/ref_landing.png)
<!-- slide -->
![Login Page](C:/Users/asus/.gemini/antigravity/brain/79569370-9ca1-4c5a-968a-a75e1225aee8/ref_login.png)
````

### Design System Analysis

| Token | Reference Value | Aether Current |
|---|---|---|
| **Background** | Light lavender (`oklch 0.985`) | Dark navy `#0F172A` |
| **Cards** | White with soft purple shadows | Dark `#1E293B` |
| **Primary Gradient** | `blue → violet → pink` (135°) | Solid `#38BDF8` |
| **Typography** | Plus Jakarta Sans + Inter | System default |
| **Border Radius** | 3xl (28px) everywhere | 12-16px |
| **Shadows** | Purple-tinted `shadow-glow`, `shadow-card` | Standard elevation |
| **Animations** | `fade-up`, `float`, `blob`, `pulse-glow`, `shimmer` | Minimal |

### Key Design Patterns

1. **Glassmorphism cards** — `glass-strong` class: white/55% + 24px blur + saturate(180%)
2. **Gradient-accent pills** — Role selectors, CTAs, icon circles all use the tri-color gradient
3. **Micro-label typography** — `text-[10px] tracking-widest font-bold text-muted-foreground` for section headers
4. **Welcome card → Hero gradient → Quick action grid → Content cards** layout pattern on every dashboard
5. **Bottom nav** with centered floating Copilot orb
6. **Modal sheets** that slide up from bottom with backdrop blur

---

## Screens to Recreate (13 Total)

| Screen | Reference File | Aether Target | Complexity |
|---|---|---|---|
| Landing/Splash | `routes/index.tsx` | `app/index.tsx` | Medium |
| Login | `routes/login.tsx` | `app/index.tsx` (merge with landing) | Medium |
| Student Dashboard | `routes/dashboard.tsx` | `components/dashboard/StudentDashboard.tsx` | High |
| Faculty Dashboard | `DashboardFaculty.tsx` | `components/dashboard/FacultyDashboard.tsx` | Very High |
| Admin Dashboard | `DashboardAdmin.tsx` | `components/dashboard/AdminDashboardComponent.tsx` | Very High |
| Schedule | `routes/schedule.tsx` | NEW `app/(tabs)/schedule.tsx` | High |
| Copilot | `routes/copilot.tsx` | `app/(tabs)/ai.tsx` (rewrite) | High |
| Approvals | `routes/approvals.tsx` | `app/(tabs)/approvals.tsx` (rewrite) | Very High |
| Issues | `routes/issues.tsx` | `app/(tabs)/report.tsx` (rewrite) | High |
| Alerts | `routes/alerts.tsx` | NEW `app/(tabs)/notifications.tsx` | Medium |
| Payments | `routes/pay.tsx` | `app/finance.tsx` (rewrite) | Medium |
| Profile | `routes/profile.tsx` | `app/(tabs)/profile.tsx` (rewrite) | Medium |
| Super App | `routes/super-app.tsx` | NEW `app/(tabs)/explore.tsx` (rewrite) | Medium |

---

## Proposed Changes

> [!IMPORTANT]
> The current Aether frontend uses React Native (`StyleSheet.create`) with Expo Router, while the reference uses Tailwind CSS for web. **Every design must be hand-translated** to React Native `StyleSheet` objects — no CSS classes, no TailwindCSS, no NativeWind (which has caused crashes). This is the most critical constraint.

### Component 1: Design System Foundation

> [!NOTE]
> Create a centralized design tokens file that captures the reference app's entire visual language in React Native-compatible form.

#### [NEW] [designTokens.ts](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/constants/designTokens.ts)
- Color palette: primary gradient stops, aether-blue, aether-violet, aether-pink, card bg, muted text
- Shadow presets: `shadowCard`, `shadowSoft`, `shadowGlow`
- Typography presets: section headers, card titles, body text
- Spacing/radius presets
- Common component styles: `glassMorphic`, `gradientCard`, `quickTile`

---

### Component 2: Shared UI Components

#### [NEW] [GradientCard.tsx](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/components/ui/GradientCard.tsx)
- Reusable gradient background card with decorative blur circles
- Used in every dashboard hero section

#### [NEW] [QuickTile.tsx](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/components/ui/QuickTile.tsx)
- 4-column quick action grid item with icon circle + label
- Used in dashboards for navigation shortcuts

#### [NEW] [SectionHeader.tsx](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/components/ui/SectionHeader.tsx)
- Tiny uppercase tracking label + title + optional "→ All" link

#### [NEW] [BottomSheet.tsx](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/components/ui/BottomSheet.tsx)
- Modal overlay with backdrop blur, slide-up content
- Replaces the reference's absolute-positioned modal pattern

#### [NEW] [StatBadge.tsx](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/components/ui/StatBadge.tsx)
- Stats display (value + label) used in dashboards and profile

---

### Component 3: Data Store

#### [NEW] [campusStore.ts](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/store/campusStore.ts)
- Port the entire `lib/store.ts` from the reference to a Zustand store
- Types: `Approval`, `Ticket`, `ScheduleEvent`, `Payment`, `Notice`, `Notification`, `MiniApp`
- Seed data: identical to reference for demo consistency
- Mutations: `createApproval`, `actOnApproval`, `createTicket`, `updateTicketStatus`, `createPayment`, `createNotice`, `toggleMiniApp`, `markAllRead`
- Derived: `analyticsSummary`, `detectClashes`, `suggestFreeSlot`, `roomAvailability`

#### [MODIFY] [authStore.ts](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/store/authStore.ts)
- Keep existing auth flow
- Remove debug `console.log` statements

---

### Component 4: Screen Rewrites

#### [MODIFY] [app/index.tsx](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/app/index.tsx)
- Complete visual rewrite to match reference landing + login combined
- Role selector (Student/Faculty/Admin) with gradient highlight
- Pre-filled demo credentials
- "GET STARTED" gradient CTA button
- Keep existing auth store integration and demo login logic

#### [MODIFY] [StudentDashboard.tsx](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/components/dashboard/StudentDashboard.tsx)
- Welcome bar with avatar initial + notification bell
- Hero gradient card with "Good morning" + stats (Next class, Tasks, Dues)
- 4-column quick action grid
- Next class card
- Today's schedule list
- Copilot CTA card
- Recent notifications list

#### [MODIFY] [FacultyDashboard.tsx](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/components/dashboard/FacultyDashboard.tsx)
- Authority level selector (Teacher/HOD/Principal)
- Hero gradient card with faculty stats (Students, Queue, Att%)
- Quick actions: Notice, Attendance, Requests, Insights
- Attendance trend bar chart
- Live approval queue with approve/reject buttons
- Recent notices section
- Advising & follow-ups
- Notice/Attendance bottom sheet modals

#### [MODIFY] [AdminDashboardComponent.tsx](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/components/dashboard/AdminDashboardComponent.tsx)
- Hero "Control Center" gradient card
- Quick actions grid
- Live operations KPI strip with progress bars
- Faculty permissions list
- System activity feed
- Support heatmap visualization
- Create account form
- Bottleneck detection alert card

#### [MODIFY] [ai.tsx](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/app/(tabs)/ai.tsx)
- Chat interface with bot avatar + gradient bubbles
- Typing indicator with animated dots
- Quick-suggestion chips
- Mic + text input bar
- Context-aware mock responses

#### [MODIFY] [approvals.tsx](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/app/(tabs)/approvals.tsx)
- Stats cards (Pending/Approved/Total)
- Faculty "Acting As" tier selector
- Filter tabs (All/Pending/Approved/Rejected)
- Approval cards with timeline view
- Create request bottom sheet with type selector
- Detail modal with approval chain visualization

#### [MODIFY] [report.tsx](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/app/(tabs)/report.tsx)
- Repurpose as Issues screen
- Report form with photo capture
- Stats cards (Open/Resolved/Hotspot)
- Filter tabs
- Issue cards with priority coloring and admin actions

#### [MODIFY] [profile.tsx](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/app/(tabs)/profile.tsx)
- Avatar + name + role badge
- Stats grid (Attendance/GPA/Rank)
- Settings menu list (Document Vault, Notifications, Privacy, Appearance, Help)
- Logout button with gradient styling

#### [MODIFY] [explore.tsx](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/app/(tabs)/explore.tsx)
- Repurpose as Super App / Ecosystem screen
- Hero card "One shell. Endless mini-apps."
- Install/uninstall grid
- "Build your own" dev card

---

### Component 5: Tab Bar Redesign

#### [MODIFY] [(tabs)/_layout.tsx](file:///c:/Users/asus/Desktop/Prodebugger/Aether_ProDebbugers/aether-frontend/app/(tabs)/_layout.tsx)
- Restyle tab bar to match reference: glass background, gradient center icon
- Update tab names: Dashboard, Schedule, Copilot (center), Alerts, Profile
- Keep auth guard with `CommonActions.reset`

---

## Open Questions

> [!IMPORTANT]
> **Light vs Dark Mode:** The reference app uses a **light lavender theme**. The current Aether project uses a **dark navy theme**. Which should we go with?
> - Option A: Fully adopt the light theme (matches reference exactly)
> - Option B: Adapt the reference design to dark mode (current Aether style)
> - Option C: Support both with a toggle

> [!IMPORTANT]
> **Tab structure:** The reference has 5 bottom tabs (Home, Schedule, Copilot, Alerts, Me) + standalone screens for Approvals, Issues, Pay, Analytics, Super App. The current Aether has 6 tabs. Should we:
> - Option A: Match reference exactly (5 tabs, rest accessible from dashboard)
> - Option B: Keep current 6-tab structure but restyle everything

---

## Verification Plan

### Automated Tests
- Update `tests/test_auth_flow.py` to verify new component existence and structure
- Add visual regression tests for key screens

### Manual Verification
- Browser testing via dev tools at `localhost:8081`
- Login → Dashboard → navigate to each tab → logout flow
- Test all 3 roles: Student, Faculty (Teacher/HOD/Principal), Admin
- Verify bottom sheet modals open and close properly
- Test approval create → approve → PDF download flow

### Build Verification
```bash
cd aether-frontend && npx expo export --platform web
```
