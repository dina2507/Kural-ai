<div align="center">

# KURAL AI
### *Every voice builds a better city.*

**An AI Operating System for Cities** — not a complaint portal.

[![Built with Gemini](https://img.shields.io/badge/Built%20with-Gemini%202.5%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth%20%2B%20Storage-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Hosted on AI Studio](https://img.shields.io/badge/Hosted%20on-Google%20AI%20Studio-4285F4?style=flat-square&logo=google-cloud&logoColor=white)](https://aistudio.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Live App](https://ai.studio/apps/aeed6496-b874-4958-a9ef-e25def04ab5f) · [Problem Statement](#problem-statement) · [Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started)

</div>

---

## Problem Statement

Communities face daily challenges — potholes, water leakages, broken streetlights, waste management failures. Current reporting is fragmented, lacks transparency, and rarely leads to resolution.

**KURAL changes that.** Citizens report once. AI agents do the rest.

> Built for the **Vibe2Ship Hackathon 2026** · Problem Statement 2: Community Hero — Hyperlocal Problem Solver

---

## What Makes KURAL Different

| What others build | What KURAL builds |
|---|---|
| Upload photo → classify → pin on map | AI intake pipeline with duplicate detection within 50m |
| Status: Open / Closed | 6-stage AI + community-verified lifecycle |
| Admin dashboard | Autonomous agent that drafts and sends government escalation, with the correct authority auto-identified by location |
| Manual resolution | Gemini visual comparison of before/after repair photos |
| No accountability | Transparent AI Incident Timeline on every issue |
| Weekly manual report | AI-authored ward digest with Citizen Hero recognition |

---

## Features

### 🤖 Five Autonomous AI Agents (Gemini 2.5 Flash)

**1. Vision Intake Agent**
Analyzes every submitted photo end-to-end: classifies issue type, scores severity (1–10), reverse geocodes the location, checks for duplicates within 50m, generates tags, and pre-fills the entire report form. The citizen just confirms.

**2. CivicMind Pattern Agent**
Monitors the city's issue stream, clusters related reports by location and type, scores cluster urgency, and autonomously drafts official escalation letters.

**3. Authority Router Agent**
Given a geocoded location anywhere in India and an issue category, identifies the specific government body responsible (PWD, BWSSB, BBMP, or the correct local corporation/panchayat) and its verified helpline — it's instructed to return `null` rather than invent a contact it isn't sure about.

**4. Resolution Verifier Agent**
When a worker claims an issue is fixed, Gemini multimodally compares the before and after photos. If repair is incomplete, status reverts automatically. Confidence score and reasoning are shown to the citizen.

**5. Weekly Digest Agent**
Every week, an AI agent aggregates all ward-level issues, computes statistics, writes a natural-language civic health report, and identifies the Citizen Hero — entirely without human authoring.

### 📲 One-Tap Authority Escalation
A curated, city-by-city directory of verified civic authority contacts powers a pre-filled WhatsApp message straight to the right department — no hunting for a complaint number.

### 🗺️ Map Intelligence
- Google Maps base with real-time issue pins
- Severity-colored custom markers with clustering (`@googlemaps/markerclusterer`)
- Heatmap layer for issue density and risk zones
- Firestore realtime listeners — new pins appear without a refresh

### 📊 City Health Score
A live 0–100 metric computed from open issues, critical severity, and resolution rate. Displayed as an animated **Pulse Ring** SVG that pulses faster as the score drops.

### 🏘️ Community Verification Engine
6-stage issue lifecycle: `reported → ai_verified → community_confirmed → in_progress → resolved → closed`. Five citizen confirmations auto-upgrade severity and trigger escalation. One confirmation per user is enforced at the database level.

### 🕐 AI Incident Timeline
Every issue page shows a transparent, timestamped log of every AI and citizen action — from "Vision Agent detected pothole" to "Community threshold reached" to "Resolution confirmed — 91% confidence."

### 🔒 Production-Minded Security
Firebase ID tokens are verified server-side against Google's public JWKS (`jose`) rather than trusting a client-supplied header, every AI endpoint is rate-limited (`express-rate-limit`), and the API is hardened with `helmet` + `cors`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Vite 6 + React 19 (TypeScript, strict) |
| **Styling** | Tailwind CSS v4 + shadcn/ui (Radix primitives), dark mode |
| **Animation** | Motion (Framer Motion) |
| **State** | Zustand + TanStack React Query (with persistence) |
| **Forms** | React Hook Form + Zod |
| **Backend** | Node.js + Express (single `server.ts`), `tsx` / `esbuild` |
| **Database** | Firebase Firestore (realtime listeners) |
| **Auth** | Firebase Authentication, server-verified via JWKS (`jose`) |
| **Storage** | Firebase Storage |
| **AI** | Gemini 2.5 Flash via `@google/genai` (multimodal, structured JSON outputs) |
| **Maps** | Google Maps JS API via `@vis.gl/react-google-maps`, Geocoding API |
| **Charts** | Recharts |
| **PWA** | `vite-plugin-pwa` (Workbox), `idb-keyval` |
| **Security** | `helmet`, `cors`, `express-rate-limit` |
| **Deployment** | Google AI Studio applet → Google Cloud Run (Docker) |

---

## Google Technologies Used

| Technology | Usage |
|---|---|
| **Gemini 2.5 Flash** | All 5 AI agents — vision intake, pattern clustering, authority routing, resolution verification, digest generation |
| **Google AI Studio** | Development environment, secrets management, and applet host |
| **Google Cloud Run** | Production deployment target |
| **Google Maps JS API** | Interactive map, custom markers, issue clustering |
| **Google Maps Geocoding API** | Reverse geocoding GPS coordinates to ward/locality/city/district |
| **Firebase** | Firestore (DB + realtime), Firebase Auth, Firebase Storage |
| **Google OAuth** | User authentication via Firebase Auth |

---

## Getting Started

### Prerequisites
- Node.js 20+
- A [Firebase](https://firebase.google.com) project with Firestore, Authentication, and Storage enabled
- A [Gemini API key](https://aistudio.google.com/apikey)
- A [Google Maps API key](https://console.cloud.google.com/) with Maps JS API + Geocoding API enabled

### 1. Clone the repository
```bash
git clone https://github.com/dina2507/Kural-ai.git
cd Kural-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file based on `.env.example`:
```env
GEMINI_API_KEY="your-gemini-api-key"
VITE_APP_URL="http://localhost:3000"
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```
> On Google AI Studio, `GEMINI_API_KEY` and `VITE_APP_URL` are injected automatically via the Secrets panel and deploy pipeline — you only need to set them yourself for local development.

### 4. Set up Firebase
Configure your Firebase project (Firestore, Auth, Storage) and update `firebase-applet-config.json` with your project's web config. Deploy `firestore.rules` and `storage.rules` to your project before going beyond local testing.

### 5. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── pages/                  # Top-level routed pages
├── features/               # Feature modules
│   ├── issues/             # Issue cards, list, filters, types
│   ├── report/             # Multi-step report wizard
│   ├── map/                # Google Maps components
│   ├── agent/              # CivicMind panel, escalation cards, digest
│   ├── dashboard/          # Analytics, charts, health score ring
│   ├── leaderboard/        # Karma leaderboard
│   └── profile/            # Profile + reporter stats
├── shared/                 # Sidebar, BottomNav, PageHeader, shared UI
├── ai/                     # All Gemini logic — agents, prompts, schemas
│   ├── agents/             # visionAgent, civicMindAgent, authorityRouterAgent, resolutionAgent, digestAgent
│   ├── prompts/            # Per-agent system + user prompts
│   └── schemas/            # Zod-validated structured outputs
├── lib/                    # Config, Firebase clients, geocoding, WhatsApp links, authorities directory
├── store/                  # Zustand stores (map, filter, UI)
└── types/                  # Global TypeScript types
server.ts                   # Express API + AI agent endpoints (single file)
```

---

## Deployment

KURAL is built as a Google AI Studio applet and deployed to **Google Cloud Run**.

```bash
# Build
npm run build

# Deploy via AI Studio's built-in Deploy flow to Cloud Run,
# or build/push the container manually:
docker build -t kural .
docker tag kural gcr.io/YOUR_PROJECT_ID/kural:latest
docker push gcr.io/YOUR_PROJECT_ID/kural:latest
gcloud run deploy kural \
  --image gcr.io/YOUR_PROJECT_ID/kural:latest \
  --platform managed \
  --allow-unauthenticated
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          KURAL                               │
├──────────────────┬──────────────────┬───────────────────────┤
│  CITIZEN LAYER   │  AUTHORITY LAYER │    AI AGENT LAYER     │
│  Report issues   │  Status updates  │  Vision Intake Agent  │
│  Track status    │  Escalation mgmt │  CivicMind Agent      │
│  Verify others   │  AI briefings    │  Authority Router     │
│  Earn karma       │                  │  Resolution Verifier  │
│                  │                  │  Weekly Digest Agent  │
└──────────────────┴──────────────────┴───────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │          Firebase          │
              │  Firestore + Realtime      │
              │  Authentication + Storage  │
              └───────────────────────────┘
```

---

## Hackathon Submission

- **Event:** Vibe2Ship Hackathon 2026
- **Problem Statement:** 2 — Community Hero: Hyperlocal Problem Solver
- **Submission Deadline:** 29 June 2026, 2:00 PM
- **Live App:** [View on AI Studio](https://ai.studio/apps/aeed6496-b874-4958-a9ef-e25def04ab5f)

---

<div align="center">

Built with ❤️ for communities everywhere.

**KURAL — Every voice builds a better city.**

</div>
