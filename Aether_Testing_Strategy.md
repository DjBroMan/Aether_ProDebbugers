# Aether Unit Testing & Execution Strategy

Since our technology stack is **TypeScript / Node.js** (Backend) and **React Native** (Frontend), we won't be using Python's `pytest`. Instead, we will use the industry standard equivalents for JavaScript: **Jest**, **Supertest** (for API routes), and **React Native Testing Library**.

Before writing any complex UI or data logic, we run tests to verify data flows correctly backward and forward.

---

## 🧪 1. Backend Testing Units (Node.js/Express)

*Toolchain: `jest`, `ts-jest`, `supertest`*

I will break the backend into 3 distinct testing layers:

1. **Database Models (Prisma):** 
   - *Unit:* I will test the `Prisma` schemas using an in-memory SQLite or isolated Test Postgres DB to ensure "Clash Detection" logic and relations hold up (e.g., ensuring a User can be an Admin or a Student).
2. **REST API Endpoints (Controllers):** 
   - *Unit:* Using `supertest`, I will artificially ping the backend with mock HTTP requests (e.g., `POST /api/pay`). The tests verify we get `200 OK` (success) or `401 Unauthorized` (if no JWT is provided).
3. **Socket.io (Real-time Sync):**
   - *Unit:* I will spin up mock WebSocket clients locally and assert that when an "Approval" event is fired, the correct payload is received on the listening client with zero latency.

---

## 🧪 2. Frontend Testing Units (React Native/Expo)

*Toolchain: `jest`, `@testing-library/react-native`*

1. **State Management (Zustand):**
   - *Unit:* I will instantiate the Zustand stores and inject fake user payloads to test if the store updates instantly.
2. **Component Rendering:**
   - *Unit:* I will render specific components (like the Copilot Chat UI or the Mock Payment Pad) dynamically in memory to ensure they don't crash under stress.
3. **Routing Hooks:**
   - *Unit:* I will test the Expo Router bounds to mathematically prove that a user with a `STUDENT` JWT is physically blocked from loading the `ADMIN` Dashboard components.

---

## 🚀 The Execution Loop

As I execute the actual code starting in Phase 1:
1. I will write the Boilerplate/Config.
2. I will write an empty `*.test.ts` file. 
3. I will implement the feature logic in the main file.
4. I will autonomously run `npm run test` using my terminal capabilities.
5. If it glow's green (passes), I move to the next unit. If it glow's red, I debug recursively.
