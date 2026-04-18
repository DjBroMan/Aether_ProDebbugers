# Aether Super App - Master Project Document

This document serves as the central hub for our ideation phase, capturing our rules of engagement, system architecture, proposed workflows, and open questions.

## Rules of Engagement

1. **No Premature Coding:** We will not write any functional codebase software until the workflow and core architecture are explicitly finalized and approved. 
2. **Build-and-Test Methodology:** Once implementation begins, we will employ a test-driven approach using testing frameworks (`pytest` / `Jest`) to verify build success, catch errors, and ensure all systems are in order.
3. **Documentation Driven:** All major decisions, data structures, and rules are tracked here.

---

## System Architecture & Tech Stack (Confirmed)

*   **Frontend (Layer 1 & 2):** React Native + Expo, Expo Router (file-based routing), Zustand (state), NativeWind (styling), `react-native-chart-kit`, and Expo native SDKs (camera, av, file-system).
*   **Backend (Layer 3):** Node.js + Express (TypeScript), Socket.io (WebSocket transports only), PDFKit.
*   **Database & Storage (Layer 4):** PostgreSQL, Prisma ORM, Cloudinary.
*   **External Integrations (Layer 5):** Google OAuth (Expo AuthSession), Gemini Multimodal API (AI Copilot), Custom Mock Payment Gateway.

---

## Proposed Phased Development Strategy

### Phase 1: Repository Scaffolding & Setup (Next Immediate Step)
- Initialize the backend: Express, TypeScript, Prisma, basic folder structure.
- Initialize the frontend: Expo (with Expo Router), configure NativeWind, configure Zustand stores.
- Confirm local development scripts (e.g., `npm run dev`) work without errors.
- **Proposed Structure:** Two sibling folders (`aether-backend/` and `aether-frontend/`) inside `d:\Aether_ProDebbugers\`.

### Phase 2: Database Schema & Authentication
- Define the `schema.prisma` mapping out Users, Roles, Events, and Tasks.
- Implement the Google OAuth flow bridging Expo and the Express backend.
- Issue JWTs and implement Role-Based Access Control (RBAC) in the frontend using Expo Router.

### Phase 3: Core API & Real-time Integration
- Build out REST endpoints for data ingestion and retrieval.
- Integrate Socket.io for zero-latency dashboard syncing when actions/approvals occur.

### Phase 4: Native Features & AI Capabilities
- Integrate Expo Camera for the photo upload flow and connect it to Cloudinary.
- Integrate Expo AV and the Gemini API for the voice-to-action AI Campus Copilot.

---

## Open Questions for the User (Action Required)

To proceed to **Phase 1**, please clarify the following:

1. **Project Structure:** Are you comfortable with two separate sibling folders (`aether-backend/` and `aether-frontend/`) in this directory, or do you prefer a formal Monorepo tool like Turborepo? 
2. **PostgreSQL Environment:** For local testing, do you already have Postgres installed locally, do you want me to set up a `docker-compose.yml` file, or will we connect directly to your hosted Render.com Postgres database?
3. **API Keys Availability:** Do you already have access to the Gemini API, Cloudinary, and Google OAuth credentials, or should we build with mock placeholders first?
