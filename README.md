<div align="center">

<img width="1200" height="475" alt="KURAL Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />

# KURAL
### *Every voice builds a better city.*

**An AI Operating System for Cities** — not a complaint portal.

[![Built with Gemini](https://img.shields.io/badge/Built%20with-Gemini%202.0%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20PostGIS-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Deployed on Cloud Run](https://img.shields.io/badge/Deployed%20on-Google%20Cloud%20Run-4285F4?style=flat-square&logo=google-cloud&logoColor=white)](https://cloud.google.com/run)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Live App](https://ai.studio/apps/aeed6496-b874-4958-a9ef-e25def04ab5f) · [Problem Statement](#problem-statement) · [Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started)

</div>

---

## Problem Statement

Communities face daily challenges — potholes, water leakages, broken streetlights, waste management failures. Current reporting is fragmented, lacks transparency, and rarely leads to resolution.

**KURAL changes that.** Citizens report once. AI agents do the rest.

> Built for the **Vibe2Ship Hackathon** · Problem Statement 2: Community Hero — Hyperlocal Problem Solver

---

## What Makes KURAL Different

| What others build | What KURAL builds |
|---|---|
| Upload photo → classify → pin on map | 5-step AI intake pipeline with duplicate detection |
| Status: Open / Closed | 6-stage AI + community-verified lifecycle |
| Admin dashboard | Autonomous agent that drafts government escalation letters |
| Manual resolution | Gemini visual comparison of before/after photos |
| No accountability | Transparent AI Incident Timeline on every issue |
| Weekly manual report | AI-authored ward digest with Citizen Hero recognition |

---

## Features

### 🤖 Four Autonomous AI Agents

**1. Vision Intake Agent**
Analyzes every submitted photo end-to-end: classifies issue type, scores severity (1–10), reverse geocodes the location, checks for duplicates within 50m, generates tags, and pre-fills the entire report form. The citizen just confirms.

**2. CivicMind Pattern Agent**
Monitors the city's issue stream, clusters related reports by location and type, scores cluster urgency, and autonomously drafts official escalation letters addressed to the correct municipal department (PWD, BWSSB, BBMP, etc.).

**3. Resolution Verifier Agent**
When a worker claims an issue is fixed, Gemini multimodally compares the before and after photos. If repair is incomplete, status reverts automatically. Confidence score and reasoning are shown to the citizen.

**4. Weekly Digest Agent**
Every week, an AI agent aggregates all ward-level issues, computes statistics, writes a natural-language civic health report, and identifies the Citizen Hero — entirely without human authoring.

### 🗺️ Map Intelligence
- Google Maps dark-themed base with real-time issue pins
- Severity-colored custom markers with clustering
- HeatmapLayer for issue density and risk zones
- Supabase Realtime — new pins appear without refresh

### 📊 City Health Score
A live 0–100 metric computed from open issues, critical severity, and resolution rate. Displayed as the **KURAL Pulse Ring** — an animated SVG that pulses faster as the score drops.

### 🏘️ Community Verification Engine
6-stage issue lifecycle: `reported → ai_verified → community_confirmed → in_progress → resolved → closed`. Five citizen confirmations auto-upgrade severity and trigger escalation. No gaming — one confirmation per user enforced at the database level.

### 🕐 AI Incident Timeline
Every issue page shows a transparent, timestamped log of every AI and citizen action — from "Vision Agent detected pothole" to "Community threshold reached" to "Resolution confirmed — 91% confidence."

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, TypeScript strict) |
| **Styling** | Tailwind CSS + shadcn/ui (dark mode only) |
| **Animation** | Framer Motion |
| **State** | Zustand + TanStack React Query |
| **Database** | Supabase — PostgreSQL + PostGIS |
| **Auth** | Supabase Auth + Google OAuth |
| **Storage** | Supabase Storage |
| **AI** | Gemini 2.0 Flash (multimodal, function calling, structured outputs) |
| **Maps** | Google Maps JS API via @vis.gl/react-google-maps |
| **Charts** | Recharts |
| **Deployment** | Google Cloud Run (containerized via Docker) |

---

## Google Technologies Used

| Technology | Usage |
|---|---|
| **Gemini 2.0 Flash** | All 4 AI agents — vision, pattern clustering, resolution verification, digest generation |
| **Google Maps JS API** | Interactive map, custom markers, issue clustering |
| **Google Maps HeatmapLayer** | Risk density visualization |
| **Google Maps Geocoding API** | Reverse geocoding GPS coordinates to addresses |
| **Google Cloud Run** | Production deployment |
| **Google OAuth** | User authentication via Supabase Auth |

---

## Getting Started

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) project with PostGIS enabled
- A [Gemini API key](https://aistudio.google.com/apikey)
- A [Google Maps API key](https://console.cloud.google.com/) with Maps JS API + Geocoding enabled

### 1. Clone the repository
```bash
git clone https://github.com/your-username/kural.git
cd kural
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create `.env.local` from the example:
```bash
cp .env.example .env.local
```

Fill in your values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the database
In your Supabase project's SQL Editor, run the schema file:
```bash
# Copy contents of docs/03-database-schema.md SQL blocks and run in Supabase SQL Editor
```

Enable Realtime on the `issues` and `issue_timeline` tables in Supabase Dashboard → Database → Replication.

### 5. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/                    # Next.js App Router (pages + API routes)
│   ├── (auth)/auth/        # Sign-in page
│   ├── (app)/              # Authenticated layout + all app pages
│   └── api/                # Backend API routes + AI agent endpoints
├── features/               # Feature modules
│   ├── issues/             # Issue cards, list, filters, types
│   ├── report/             # Multi-step report wizard
│   ├── map/                # Google Maps components
│   ├── agents/             # CivicMind panel, escalation cards, digest
│   ├── dashboard/          # Analytics, charts, health score ring
│   └── auth/               # Auth form and hooks
├── shared/                 # Sidebar, BottomNav, PageHeader, shared UI
├── ai/                     # All Gemini logic — agents, prompts, schemas
├── lib/                    # Config, Supabase clients, animations, utils
├── store/                  # Zustand stores (map, filter, UI)
└── types/                  # Global TypeScript types
```

---

## Deployment

KURAL is deployed on **Google Cloud Run** via Docker.

```bash
# Build Docker image
docker build -t kural .

# Push to Google Artifact Registry
docker tag kural gcr.io/YOUR_PROJECT_ID/kural:latest
docker push gcr.io/YOUR_PROJECT_ID/kural:latest

# Deploy to Cloud Run
gcloud run deploy kural \
  --image gcr.io/YOUR_PROJECT_ID/kural:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --min-instances 1
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          KURAL                               │
├──────────────────┬──────────────────┬───────────────────────┤
│  CITIZEN LAYER   │  AUTHORITY LAYER │    AI AGENT LAYER     │
│  Report issues   │  Ward heatmap    │  Vision Intake Agent  │
│  Track status    │  Analytics       │  CivicMind Agent      │
│  Verify others   │  Escalation mgmt │  Resolution Verifier  │
│  Earn karma      │  AI briefings    │  Weekly Digest Agent  │
└──────────────────┴──────────────────┴───────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │         Supabase           │
              │  PostgreSQL + PostGIS      │
              │  Realtime subscriptions    │
              │  Storage + Auth            │
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
