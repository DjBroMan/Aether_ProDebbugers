# Aether Super App - Project Ideation & Roadmap

This document serves as the master roadmap and active query file for the Aether system.

---

## 🗺️ THE AETHER MASTER ROADMAP

### 🎓 STUDENT (Priyank & Harshav)
*   **Role-Aware Dashboard:** View next class location, club alerts, and instant push notifications via WebSocket.
*   **AI Campus Copilot:** Ask natural language questions (via text or voice microphone) about pending tasks and schedules.
*   **Smart Scheduling:** View unified academic/event timetable and use "Smart Suggestions" to find the best available time slots.
*   **Approvals Engine:** Submit requests (leave, certificates, room booking) and track real-time status.
*   **Resolution Protocol:** Report campus issues (IT/maintenance) by taking a high-resolution photo with the device camera.
*   **Document Vault:** Instantly download generated PDFs (e.g., approved certificates).

### 👨‍🏫 FACULTY (Teacher / HOD / Principal)
*   **Role-Aware Dashboard:** View real-time attendance trends and immediate alerts for pending approvals.
*   **Coordination Workspace:** Manage student advising, publish notices, and handle student follow-ups directly from the phone.
*   **Approvals Engine:** Receive prioritized push notifications based on authority level for "one-tap approval" of student requests.
*   **Unified Calendar:** View departmental schedules and avoid double-booking using the clash detection layer.

### 🛠️ ADMIN / LEADERSHIP
*   **Decision Intelligence Dashboard:** High-level mobile view surfacing operational trends.
*   **Approval Analytics:** View bottlenecks in service response times and approval rates.
*   **Support Heatmap:** View visual maps/charts of recurring hotspot issues (e.g., repeating IT failures in specific labs).
*   **Proactive Alerts:** Receive push notifications to shift from reactive fixing to proactive management.
*   **System Admin:** Create accounts, assign database roles (Student/Faculty/Admin), and manage global resource data.

### 🤖 AI CAMPUS COPILOT (Shared Feature)
*   **Context-Aware Processing:** Uses live workflow data to guide users.
*   **Multimodal Input:** Accepts both typed text and raw voice audio (via `expo-av`).
*   **Actionable Output:** Provides specific steps derived from the user's database role.

### 📅 SCHEDULING SYSTEM (Conflict-Aware Layer)
*   **Unified Calendar:** Merges academic timetables with operational events.
*   **Clash Detection Algorithm:** PostgreSQL backend logic preventing double-booking.
*   **Cross-Calendar Sync:** Zero-latency updates via Socket.io.

### 🧾 WORKFLOW / APPROVAL SYSTEM (Chain of Responsibility)
*   **Multi-Stage Routing:** Automatically routes requests (Student → HOD → Principal).
*   **Zero-Latency Alerts:** Instant push notification to the next-in-line approver.
*   **Automated PDF Generation:** Backend compiles via PDFKit upon chain completion.

### 🧰 SUPPORT / ISSUE SYSTEM (Resolution Protocol)
*   **Hardware Integration:** `expo-camera` upload.
*   **Cloud Routing:** Stores high-res images in Cloudinary.
*   **Prioritized Ticketing:** Dynamic support dashboard.

### 💰 FINANCIAL SETTLEMENT GATEWAY (Brownie Point 1)
*   **Mock Clearinghouse & Instant Flow:** Secure digital UI for simulating instant UPI/Card transactions via `/api/pay`.

### 🧩 EXTENSIBLE "SUPER APP" ARCHITECTURE (Brownie Point 2)
*   **API-First Design Shell:** Modular UI designed for growth.
*   **Plugin UI Placeholder:** "Plugin-Ready" component section for mock mini-apps (Canteen Tracker, Research Portal).

---

## 📋 ACTIVE QUERIES (MCQs)

Please place an `x` inside the brackets `[x]` of your chosen option. I will read this file when you're ready to proceed.

### Q1. What is the preferred repository structure?
- [x] A. Two separate sibling folders (`aether-backend/` and `aether-frontend/`) in this root directory. (Recommended for fast iterations)
- [ ] B. A formal Monorepo (using Turborepo or Yarn Workspaces).

### Q2. How should we set up the PostgreSQL database right now?
- [ ] A. Let's create a local Docker container (`docker-compose.yml`) for offline development.
- [x] B. Connect directly to the hosted Render.com Postgres database.
- [ ] C. I already have a local instance running natively, I'll just use that connection string.

### Q3. How should we handle API Keys initially (Gemini, Cloudinary, OAuth)?
- [x] A. I have the actual keys; we will put them in `.env` immediately.
- [ ] B. Use mock placeholders/mock services for now, and integrate real keys later.
