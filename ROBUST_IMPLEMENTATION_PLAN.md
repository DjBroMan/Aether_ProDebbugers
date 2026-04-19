# ROBUST IMPLEMENTATION PLAN: Aether Super App

**Objective:** This document serves as the absolute, ground-truth architectural map and implementation guide for AI agents and human developers working on the Aether project. It specifies EXACTLY how to implement, connect, and finalize every feature completely to achieve a production-ready, frictionless campus operating system.

---

## PART 1: THE ARCHITECTURAL STACK
Every implementation must strictly adhere to the following layers. Do not deviate from these technologies.

### LAYER 1: THE FRONTEND (MOBILE SHELL)
- **Core Framework:** React Native + Expo. Enables universal mobile app deployment and provides the "Plugin-Ready" modular foundation for the Super App.
- **Navigation:** Expo Router (file-based routing in the `app/` directory conditionally rendering based on user role).
- **State Management:** Zustand (`store/campusStore.ts`). Maintains global app state and ensures dashboard widgets sync instantly across screens without prop drilling.
- **Styling:** NativeWind (Tailwind CSS) integrated into customized React Native tokens (`designTokens.ts`).
- **Data Visualization:** `react-native-chart-kit`. Deployed in the Admin portal to render operational trends and heatmap analytics.

### LAYER 2: NATIVE CAPABILITIES & HARDWARE
- **Camera & Image Capture:** `expo-camera` & `expo-image-picker` for Issue Reporting evidence.
- **Audio Capture:** `expo-av` for capturing raw microphone audio to interact with the AI Campus Copilot.
- **Document Handling:** `expo-file-system` & `expo-sharing` for downloading/viewing autonomously generated PDF certificates.

### LAYER 3: THE BACKEND (API ENGINE)
- **Core Framework:** Node.js with Express (TypeScript) in `src/`.
- **Hosting:** Render.com Web Service (CI/CD connected).
- **Real-Time Sync:** Socket.io integrated on both backend and frontend. **CRITICAL CONSTANT:** Configured strictly to use `transports: ['websocket']` to prevent RN polling collisions.
- **Document Generation:** PDFKit running on the Node server (generates PDFs upon Chain of Responsibility completion).

### LAYER 4: DATABASE & CLOUD STORAGE
- **Relational Database:** PostgreSQL. Required for strict relational mapping allowing "Clash Detection" algorithms across schedules.
- **ORM:** Prisma (`prisma/schema.prisma`). Auto-generates type-safe queries.
- **Object Storage:** Cloudinary. Backend routes heavy camera uploads here and stores only the optimized URL string in PostgreSQL.

### LAYER 5: EXTERNAL INTEGRATIONS & FEATURES
- **Authentication:** Google OAuth (Expo AuthSession). Backend secures routes via JWT and assigns Roles (STUDENT, PROFESSOR, HOD, PRINCIPAL, ADMIN). *Currently mocked for development via `x-mock-role`.*
- **AI Engine:** Gemini API. Powers the Copilot. Requires mapping user database context (tasks/schedule) + prompt to Gemini.
- **Financial Settlement:** Custom Mock Gateway mimicking a secure UPI pin pad UI, tied to `/api/pay` to update the ledger.

---

## PART 2: DATA FLOW & INTEGRATION MECHANISMS
When writing code for any feature, implement the following exact data flows:

1. **Authentication Flow:** User logs in → Backend issues JWT & assigns Role → Expo Router pushes user to their specific UI portal.
2. **Real-Time Dashboard Sync:** On login, establish Socket.io connection. When a state changes (e.g., Professor approves a leave), Backend updates Prisma → Emits Socket event → Frontend Zustand catches event → UI updates instantly.
3. **AI Voice Query Flow:** Tap microphone (`expo-av`) → Send audio/text to Backend → Backend fetches pending tasks from Postgres → Sends context + audio/text to Gemini API → Parsed answer returned to RN app UI.
4. **Photo Upload Flow:** Take string photo (`expo-camera`) → POST to Backend → Upload to Cloudinary → Save URL to Postgres via Prisma → Alert Admin heatmap via Socket.io.

---

## PART 3: DETAILED FEATURE IMPLEMENTATION CHECKS (HACKATHON VERSION)

Follow these EXACT rules for feature scopes. Do not overengineer. Build only what is specified under "What YOU Actually Build". 

### 1. Admin Dashboard (Analytics & Decision Intelligence)
**What YOU Actually Build:**
- Simple metric tiles that show data aggregations:
  1. Total Requests (e.g., 45)
  2. Pending Requests (e.g., 12)
  3. Approved Requests (e.g., 28)
  4. Complaints Count (Open Issues: e.g., 6)
  5. Average Response Time (Mocked or simple algorithm: e.g., 2 days)
- Actionable drill-downs: Clicking "12 pending approvals at Level 2" shows a "Show more" option breaking down which HOD has how many requests.
- Trend displays: E.g., "Avg resolution time: 3 days" or "WiFi complaints: 25 this week".

### 2. AI Campus Copilot
**What YOU Actually Build:**
- **A. Answer Campus FAQs:** Provide step-by-step instructions. (e.g., "How do I apply for leave?" -> "Open Request Form -> Select Leave...").
- **B. Guide Workflows (CRITICAL):** Connect directly to system actions. Trigger workflow directives based on queries like "I want to apply for leave".
- **C. Show User-Specific Info (Fake Smartness):** Check user DB context. (e.g., User: "Do I have pending requests?", Copilot: "You have 2 pending approvals").
- **D. Basic Querying:** E.g., "My next class?" -> "You have DBMS at 10 AM in Room 301".
- **E. Smart Suggestions:** "When can I book a room?" -> "Room 301 is free at 2 PM".
- **F. Notifications Summary:** "Any updates?" -> Lists 1 request approved, 2 pending, etc.

### 3. Faculty Coordination Workspace
**What YOU Actually Build (Keep it simple, clean, functional screen):**
- **A. Student Advising:** View student list with basic warnings (e.g., "Harshav - Leave Requested").
- **B. Attendance-Related Actions (Mock):** Simple stats view with action buttons like "Low attendance warning".
- **C. Notice Publishing (CRITICAL):** Create notice -> Send to students.
- **D. Student Follow-Ups:** Handle pending things (approve/respond directly from dashboard).
- **E. Department Collaboration:** Shared notices or simple messages.
- **F. Notifications:** Alerts for new requests, deadlines, and messages.

### 4. Conflict-Aware Scheduling Layer
**What YOU Actually Build:**
- **1. Calendar View:** Simple unified list showing your classes + events.
- **2. Booking System:** User selects time + room.
- **3. Conflict Check Algorithm (CRITICAL):** Logic: `if (newStart < existingEnd && newEnd > existingStart) -> conflict` -> "Conflict detected". Prevents double booking.
- **4. Availability Display:** Show free/occupied status per hour.
- **5. Smart Suggestion:** Return the first available slot or nearest free time.

### 5. Mobile Resolution and Support (Issues)
**What YOU Actually Build:**
- **User Side:** Submit issue (IT, Facility), Upload image via Camera (Cloudinary backend), and View status.
- **Admin/Support Side:** View list of tickets sorted by simple priority logic (High = urgent/wifi/down; Medium = normal; Low = minor). Change status from Open -> In Progress -> Resolved.
- **Analytics Heatmap:** Show where problems happen most (Visual grouping or simple chart, e.g., "Room 301 -> 5 issues").

---

## HOW TO USE THIS FILE:
When you (the AI Agent) begin a session:
1. Determine which of the 5 items in **Part 3** you are targeting.
2. Read **Part 1** to grab exactly which React Native / Node / Postgres package you are allowed to use.
3. Read **Part 2** to comprehend the synchronized data workflow.
4. Execute the code flawlessly based purely on the "What YOU Actually Build" directives, ignoring anything listed as "What You DON'T Build". Ensure `Zustand` updates immediately and the `Node` backend handles persistence. Execute cross-role verification to guarantee zero-latency synchronization.
