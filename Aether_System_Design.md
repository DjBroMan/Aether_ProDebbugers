# Aether Super App - Master System Design & Workflows

## 🏗️ 1. Environmental Infrastructure

### Repository Structure
- **Design Pattern:** Sibling Directories
- **Paths:** `d:\Aether_ProDebbugers\aether-backend\` and `d:\Aether_ProDebbugers\aether-frontend\`

### External Services & Environment Vault
The `.env` vault will inject the following verified keys:
1. `DATABASE_URL`: Hosted Render.com PostgreSQL
2. `GEMINI_API_KEY`: Primary AI Processing
3. `FIRST_FALLBACK_API_KEY`: xAI Fallback (Grok)
4. `SECOND_FALLBACK_API_KEY`: Groq Fallback (Llama 3)
5. `CLOUDINARY_*`: Cloud storage for images
6. `GOOGLE_WEB_CLIENT_ID`: Web Client proxy for Expo AuthSession

---

## ⚙️ 2. Core Operational Workflows

### W1: Intelligent Role-Based Authentication
1. **Trigger:** User taps "Login with Google".
2. **Process:** Expo AuthSession requests token -> Backend verifies Google JWT -> Backend cross-references DB for Role (STUDENT, PROFESSOR, HOD, PRINCIPAL, ADMIN).
3. **Response:** Backend issues custom JWT. Expo Router unconditionally shields unauthorized screens.

### W2: Conflict-Aware Scheduling
1. **Trigger:** Admin / Teacher schedules a new lab or class.
2. **Process:** Prisma validates relations across Class, Room, Professor, Student. "Clash Detection" throws error if booking overlaps.
3. **Sync:** Upon successful commit, `Socket.io` pushes the newly formed event to all affected student/faculty apps instantly.

### W3: Chain of Responsibility (Approvals & PDFGen)
1. **Trigger:** Student submits a Leave/Certificate request.
2. **Stage 1:** Status: `PENDING_PROFESSOR`. Professor receives `Socket.io` push. Professor clicks "Approve". 
3. **Stage 2:** Status: `PENDING_HOD`. HOD receives `Socket.io` push. HOD clicks "Approve".
4. **Resolution:** Status: `COMPLETED`. Backend invokes `PDFKit` -> uploads to Cloudinary -> fires completion alert to Student with download link (`expo-file-system`).

### W4: The Resolution Protocol (Hardware Issue Tracking)
1. **Trigger:** Student takes a photo of an issue using `expo-camera`.
2. **Process:** Image streams to Backend -> Uploads to Cloudinary -> Cloud URL and metadata mapped to a Ticket in Postgres.
3. **Sync:** Admin Dashboard instantly redraws the `react-native-chart-kit` Heatmap via WebSocket to plot the new incident.

### W5: AI Campus Copilot (Triple-Fallback Engine)
1. **Trigger:** Student sends Voice (`expo-av`) or Text query (e.g., "Where is my next class?").
2. **Context Builder:** Backend pulls current schedule and pending tasks for that specific Student.
3. **LLM Mesh:** 
   - *Attempt 1:* Route to Google Gemini 1.5 Flash.
   - *Attempt 2 (Catch):* Fallback to Grok via Axios using `FIRST_FALLBACK_API_KEY`.
   - *Attempt 3 (Catch):* Fallback to Llama 3 via Axios using `SECOND_FALLBACK_API_KEY`.
4. **Response:** Actionable insights routed back to frontend.

### W6: Financial Mock Clearinghouse
1. **Trigger:** User opens "Pay Dues".
2. **Process:** User enters mock PIN on UPI-like UI.
3. **Resolution:** Hits POST `/api/pay`, directly updates Prisma `Ledger` or `Fee` tables, resolving the debt instantly without Stripe/Razorpay SDK overhead.

---

## 🚦 3. Next Steps (Phase 1 Scaffolding)
*The detailed execution strategy is mapped in our Implementation Plan artifact.*
