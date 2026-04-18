# Role-Based Dynamic Dashboard Implementation

This plan outlines the architecture for converting the current single-role Aether dashboard into a scalable, dynamic role-based platform. For the sake of speed and hackathon constraints, we will utilize local mock data for the quick-switch demo login, bypassing the need to alter the backend Prisma database immediately.

## 1. Roles & Hierarchy Definition

We will extend the `AuthUser` interface in `store/authStore.ts` to include an `authorityLevel` property.

* **Roles Defined:** `STUDENT`, `FACULTY`, `ADMIN`.
* **Faculty Hierarchy (`authorityLevel`):**
  * `1` = Teacher
  * `2` = HOD
  * `3` = Principal

### Feature Mapping
* **Student:** Timetable, pending tasks, Copilot (AI), issue reporting.
* **Faculty (Teacher - L1):** Notice board, student tracking, basic class approvals.
* **Faculty (HOD - L2):** Higher-level departmental approvals, department notice board.
* **Faculty (Principal - L3):** Final campus-wide approvals, top-level overview analytics.
* **Admin:** User management, system-wide infrastructure analytics.

## 2. Database Structure (Prisma / Mock Strategy)
While the prompt references Firestore, Aether uses **Prisma/PostgreSQL**. 
* **Target Schema (Future/Backend):** `User` model gets `role (Enum)` and `authorityLevel (Int?)`. `Request` model gets `status`, `currentLevel`, `currentApprover`.
* **Hackathon Strategy (Current Plan):** We will use **local mock data** in the frontend store for rapid demo switching. The `enterDevMode` will be replaced with explicit mock profiles.

## 3. Proposed Changes

### Core Store Updates
#### [MODIFY] `store/authStore.ts`
- Add `authorityLevel?: number` to the `AuthUser` interface.
- Update `UserRole` type to explicitly just use `'STUDENT' | 'FACULTY' | 'ADMIN'`.

### Demo Login & Quick Switching
#### [MODIFY] `app/index.tsx` (LandingScreen)
- Remove the single "Enter Developer Mode" button.
- Add a "Demo Quick Login" section with buttons for:
  - 🎓 Login as Student
  - 👨‍🏫 Login as Teacher (L1)
  - 🏢 Login as HOD (L2)
  - 🏛️ Login as Principal (L3)
  - ⚙️ Login as Admin
- Each button sets the respective mock user profile in `authStore` and routes to `/(tabs)`.

### Dynamic Dashboard Architecture
#### [MODIFY] `app/(tabs)/index.tsx` (Dashboard Wrapper)
- Convert this file into a routing wrapper.
- `if (user.role === 'STUDENT') return <StudentDashboard />`
- `if (user.role === 'FACULTY') return <FacultyDashboard authorityLevel={user.authorityLevel} />`
- `if (user.role === 'ADMIN') return <AdminDashboardComponent />`

#### [NEW] `components/dashboard/StudentDashboard.tsx`
- Move the existing student-specific UI (Classes Today, Pending Tasks, Up Next) from the old `index.tsx` here. No rewrite needed, just abstraction.

#### [NEW] `components/dashboard/FacultyDashboard.tsx`
- Conditional rendering inside based on `authorityLevel`.
- **Level 1:** Render `<NoticeBoard />` and `<ApprovalList level={1} />`.
- **Level 2:** Render `<ApprovalList level={2} />` and department analytics.
- **Level 3:** Render `<ApprovalList level={3} />` and campus-wide `<AnalyticsWidget />`.

#### [NEW] `components/dashboard/AdminDashboardComponent.tsx`
- Render system-level analytics (similar to the existing `admin.tsx` tab).

### Shared Reusable Components
#### [NEW] `components/dashboard/ApprovalList.tsx`
- Fetches/displays pending requests matching the provided `level`.
#### [NEW] `components/dashboard/NoticeBoard.tsx`
- Simple list of recent campus notices.
#### [NEW] `components/dashboard/AnalyticsWidget.tsx`
- Small widget displaying high-level statistics (e.g., active issues, attendance rate).
