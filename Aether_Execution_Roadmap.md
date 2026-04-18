# 🗺️ AETHER: Master Execution & Testing Roadmap

This document serves as the absolute blueprint for developing Aether from an empty folder into a fully functional, production-ready "Super App". It divides the development into **Atomic Units**. 

**The Golden Rule:** We do not move to Unit *N+1* until Unit *N* has automated tests written, executed, and verified as successful (glowing "green" in our test suite).

---

## 🛠️ Unit 1: Environment & Scaffolding
**Goal:** Establish the foundational backend and frontend environments.
*   **Action 1:** Initialize `aether-backend` (Node, Express, TypeScript, Socket.io).
*   **Action 2:** Initialize `aether-frontend` (React Native Expo, NativeWind).
*   **Action 3:** Initialize Prisma ORM in the backend and link the `.env`.
*   **Testing Strategy:** Run `npm run build` and start the server instances. Verify the database connection authenticates successfully.

## 🗄️ Unit 2: The Data Layer (PostgreSQL)
**Goal:** Define the rigid multi-role relational tables.
*   **Action 1:** Map Prisma Schema (Users, Roles, Tasks, Tickets, Timetables).
*   **Action 2:** Generate Prisma Client and run the initial migration (`npx prisma migrate dev`).
*   **Testing Strategy:** Run Jest unit tests that perform CRUD operations on a sandboxed test database instance to verify referential integrity (e.g., ensuring "Clash Detection" logic fails cleanly when double-booked).

## 🔐 Unit 3: Authentication & Role Assignment
**Goal:** Implement Google OAuth and strict role verification.
*   **Action 1:** Backend `/api/auth/google` endpoint to verify tokens.
*   **Action 2:** JWT creation and injection of roles (`STUDENT`, `ADMIN`, etc.).
*   **Testing Strategy:** Use `supertest` to fire mock Google tokens at the backend and assert that the correct JWT and DB User are created.

## 🧠 Unit 4: The Core Express APIs
**Goal:** Build the specific REST routes supporting the roadmap.
*   **Action 1:** Resolution Protocol endpoints (Image upload mapping).
*   **Action 2:** Chain of Responsibility routing (Approval multi-stages).
*   **Action 3:** Mock Financial Gateway (`POST /api/pay`).
*   **Testing Strategy:** `supertest` covering all CRUD operations. Assert HTTP 200 outputs and 401 Unauthorized protections.

## 🤖 Unit 5: AI Campus Copilot (Triple-Fallback)
**Goal:** Integrate the Gemini -> xAI -> Groq pipeline.
*   **Action 1:** Build the LLM Router Service.
*   **Action 2:** Inject PostgreSQL context into the prompt schema.
*   **Testing Strategy:** Inject mocked failing HTTP requests to Gemini and verify that the system securely catches and routes to the xAI fallback without crashing.

## ⚡ Unit 6: Real-Time Event Sync (Sockets)
**Goal:** Ensure zero-latency sync for approvals and chats.
*   **Action 1:** Configure `Socket.io` singletons in Express.
*   **Action 2:** Hook database mutation functions to trigger Socket blasts.
*   **Testing Strategy:** Spin up two isolated mock Node websocket clients and assert that action from Client A triggers an immediate push to Client B.

## 📱 Unit 7: Frontend Shell & Navigation (Expo Router)
**Goal:** Build the React Native container and conditional routing.
*   **Action 1:** Setup Expo Router structure logic (`/student/(tabs)`, `/admin/(tabs)`).
*   **Action 2:** Create the Zustand global store for Auth and Themes.
*   **Testing Strategy:** Use `Jest` and `@testing-library/react-native` to assert that rendering the `<App />` redirects unauthorized users immediately to the unauthenticated layout.

## 🎨 Unit 8: Frontend Pages & Business Logic
**Goal:** Implement the raw UI pages.
*   **Action 1:** Build Student, Faculty, and Admin specific dashboards using NativeWind.
*   **Action 2:** Implement `react-native-chart-kit` for the Admin Heatmap.
*   **Action 3:** Connect React components to backend APIs via hooks (Axios).
*   **Testing Strategy:** Component tests to verify inputs, button taps, and conditional JSX rendering.

## 📷 Unit 9: Native Hardware Hooks
**Goal:** Tie into the device sensors.
*   **Action 1:** Setup `expo-camera` for issue reporting.
*   **Action 2:** Setup `expo-av` for Voice Copilot parsing.
*   **Action 3:** Integrate Cloudinary Cloud uploads.
*   **Testing Strategy:** Verify permissions flags logically. Mock the camera hardware output in tests to verify the image payload structure before it hits the backend.

## 🏆 Unit 10: End-to-End (E2E) Master Test
**Goal:** Verify the system performs as a complete Super App.
*   **Action:** We will perform manual and automated integration testing simulating the full workflow: User A creates a ticket -> User B approves it -> Dashboard updates instantly -> Socket sends notification. 
