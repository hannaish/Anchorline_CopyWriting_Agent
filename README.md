# Viral Copywriter AI — Proprietary Content Intelligence Suite

Viral Copywriter AI is a production-quality full-stack web application designed to engineer high-converting, platform-tailored, and emotionally resonant copy using the Google Gemini API.

Instead of acting like a generic chatbot, the application implements a multi-stage cognitive pipeline backed by an embedded SQLite intelligence layer, semantic knowledge ingestion, dedicated hook & angle generators, 11-dimension critique evaluation, and automated quality benchmarking.

---

## System Architecture

```
User Input (12 Parameters)
    ↓
1. Request Analyzer & Intent Extraction
    ↓
2. Audience Psychology & Belief Tension Mapping
    ↓
3. Knowledge Intelligence Layer (SQLite FTS5 + Principle Extraction)
    ↓
4. Hook Engine (10+ Scored Hooks, Top 3 Selection)
    ↓
5. Angle Engine (10 Angles Scored)
    ↓
6. 5-Version Content Generation:
   - Version 1: Clear + Educational
   - Version 2: Bold + Contrarian
   - Version 3: Story-driven
   - Version 4: Curiosity-driven
   - Version 5: High-emotion
    ↓
7. Content Critic & 11-Dimension Diagnostic Scoring (0–100)
    ↓
8. Automated Improvement Loop (Max 3 cycles or Score >= 90)
    ↓
9. Originality Guard (N-gram comparison with source swipe chunks)
    ↓
Final Optimized Multi-Platform Copy
```

---

## Key Features & Modules

- **Core Creation Suite**: 12 comprehensive inputs (topic, niche, audience, platform, tone, emotion, offer, key message, personal story, CTA, format) with 5 distinct psychological outputs and live 11-dimension critique rubrics.
- **Viral Hook Engine**: Generates 10+ categorized hooks (Contrarian, Educational, Story, Bold Claim, etc.) scored across 7 engagement dimensions with top-3 picks, plus a browseable archive of 56+ seeded viral hook formulas.
- **Idea Generator Matrix**: Generates 20 high-converting ideas with specific angles, hooks, emotional triggers, formats, and CTAs.
- **Content Rewriter**: Audits weak drafts, calculates score deltas, diagnoses structural flaws, and eliminates corporate fluff.
- **Omnichannel Repurposer**: Transforms 1 piece of long-form thought leadership into 10 LinkedIn posts, 10 X posts, 5 Instagram captions, 5 Threads, 5 Video concepts, 10 Hooks, and 5 Carousel concepts.
- **Knowledge Library Dashboard**: Manages document uploads (PDF, DOCX, TXT, MD, CSV, JSON), semantic chunking, and generalized copywriting principle extraction (`SPECIFICITY → CREDIBILITY`).
- **Voice Profile Studio**: Analyzes human writing samples (sentence length, cadence, vocabulary, rhythm, questions, humor) and generates reusable voice archetypes.
- **Automated Quality Testing (Test Mode)**: 20 predefined industry benchmark test cases with automated evaluation, latency tracking, and score regression detection.
- **Enterprise Security**: Server-side secret isolation. `GEMINI_API_KEY` is never exposed to the frontend.

---

## Quick Start

### 1. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and configure your `GEMINI_API_KEY`:
```env
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_QUALITY_MODEL=gemini-3.7-flash
GEMINI_FAST_MODEL=gemini-3.5-flash-lite
DATABASE_PATH=./server/db/viral_copywriter.db
UPLOAD_DIR=./uploads
```

### 2. Run Database Seed
Seed the database with the initial 56+ viral hook formulas:
```bash
npm run seed
```

### 3. Launch Development Server
Starts both the Express backend (port 3001) and Vite React frontend (port 5173):
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.
