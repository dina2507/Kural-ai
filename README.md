# KURAL - Smart Civic Management Platform

A modern civic platform to report, track, and resolve community issues seamlessly. KURAL bridges the gap between citizens and local authorities using AI.

## Tech Stack
*   **Frontend**: React 19, Vite, Tailwind CSS, shadcn/ui
*   **Backend**: Node.js + Express (server.ts)
*   **Database**: Firebase Firestore
*   **Authentication**: Firebase Authentication
*   **AI Engine**: Gemini 2.5 Flash
*   **Maps**: Google Maps Platform (Maps JavaScript API, Places API, Geocoding API)
*   **Hosting**: Google AI Studio (Cloud Run)

## Setup
1. Define `GEMINI_API_KEY` and `VITE_GOOGLE_MAPS_API_KEY` in the AI Studio Secrets panel.
2. The `VITE_APP_URL` is automatically injected at deploy time.
3. Use the AI Studio Deploy functionality to publish to Cloud Run.
