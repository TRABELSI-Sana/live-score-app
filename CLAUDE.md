# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LiveFoot (livefoot.online / livefoot.tn) — a real-time football scores application. Backend polls API-Football every 60s, stores state in Redis, and pushes updates to the browser via SSE. An Ollama-based AI module generates match summaries.

## Build & Run Commands

### Full local deploy (Docker Compose: backend + frontend + Redis + Ollama + Nginx)
```bash
./deploy-local.sh
```

### Backend only
```bash
cd backend
./mvnw spring-boot:run          # requires Redis on localhost:6379
./mvnw -DskipTests clean package  # build JAR
./mvnw test                       # run all tests
./mvnw test -Dtest=EventDeduplicatorTest  # single test class
```

### Frontend only
```bash
cd frontend
npm install
npm run dev      # Vite dev server with HMR, proxies /api to localhost:8099
npm run build    # production build → dist/
npm run lint     # ESLint
```

### Production deploy (to VPS via rsync + docker compose)
```bash
./deploy.sh
```

## Architecture

### Data Flow
```
API-Football (v3) → LiveScorePoller (60s) → MatchService → Redis (state)
                                                         → SseHub → SSE push to browsers
```

### Backend (Kotlin/Spring Boot 3.5, port 8099)

- **Schedulers** (`scheduler/`): `LiveScorePoller` polls live matches every 60s; `FixturesPoller` loads today's fixtures; `StartupSeeder` hydrates on boot.
- **MatchService** (`service/MatchService.kt`): central orchestrator — upserts matches, merges events (via `EventDeduplicator`), publishes SSE board updates.
- **SseHub** (`sse/SseHub.kt`): in-memory pub/sub for Server-Sent Events. Channels: `LIVE_BOARD`. Clients subscribe via `/api/stream/lives`.
- **Redis stores** (`repository/redis/`): `MatchStateStore` (full match state), `LiveMatchesStore` (keys of live matches), `BoardMatchesStore` (keys shown on board), `EventDedupStore`.
- **AI module** (`ai/`): calls Ollama (Mistral model) via Spring AI to generate match summaries. Exposed at `/api/ai/insights/stream` (SSE).
- **REST endpoints** (`web/LiveStreamController`): `/api/stream/board` (snapshot), `/api/stream/lives` (SSE), `/api/stream/competitions/{id}/table`, `/api/stream/matches/{id}/lineups`.

### Frontend (React 19 + TypeScript + Vite)

- **Entry**: `src/main.tsx` → `RouterApp.tsx` (react-router-dom).
- **Live board** (`App.tsx`): main page — connects to SSE via `useLiveBoard` hook, displays matches grouped by competition (live / upcoming / finished), classement modals, lineup modals, AI summary sidebar.
- **SEO pages** (`pages/`): static content pages for guides, articles, teams, competitions.
- **SSE hook** (`hooks/useLiveBoard.ts`): fetches initial snapshot from `/api/stream/board`, then subscribes to `/api/stream/live` EventSource for real-time updates.

### Infrastructure

- **Nginx**: reverse proxy — serves SPA static files, proxies `/api/*` to `backend:8099` with SSE-friendly settings (no buffering, 1h timeout).
- **Redis 7**: stores all match state (no SQL database).
- **Ollama**: local LLM inference (Mistral), CPU-only on VPS (6 cores, 10GB RAM cap).
- **Docker Compose**: 4 services (redis, backend, web, ollama).

## Key Conventions

- Language: French for UI strings, variable/class names in English.
- Backend uses `matchKey` (string) as the canonical identifier for matches across Redis stores.
- Match statuses are normalized via `MatchStatus.normalize()` — always use the constants in `MatchStatus.kt`.
- Frontend normalizes statuses independently in `normalizeMatchStatus()` in `App.tsx`.
- Events are deduplicated on merge (not on display) via `EventDeduplicator`.
- The frontend deduplicates/compacts goal events for display using player name + minute bucket (3-min window).
- API-Football quota is 7500 requests/day. The poller disables itself for 8h on quota exceeded, 24h on auth error, 5min on transient errors.

## Environment Variables

| Variable | Used by | Default |
|----------|---------|---------|
| `APIFOOTBALL_KEY` | backend | hardcoded dev key |
| `SPRING_DATA_REDIS_HOST` | backend | localhost |
| `SPRING_DATA_REDIS_PORT` | backend | 6379 |
| `SPRING_AI_OLLAMA_BASE_URL` | backend | http://ollama:11434 |
| `APP_AI_TIMEOUT_SECONDS` | backend | 420 (prod), 120 (local) |
| `APP_AI_MAX_CONCURRENT_REQUESTS` | backend | 1 |
