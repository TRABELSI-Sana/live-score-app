# Repository Guidelines

## Project Structure & Module Organization

This repository contains a real-time football scores application. The backend is a Kotlin/Spring Boot service in `backend/`, with source in `backend/src/main/kotlin`, tests in `backend/src/test/kotlin`, and configuration in `backend/src/main/resources`. The frontend is a React 19 + TypeScript + Vite app in `frontend/`, with UI code in `frontend/src`, assets in `frontend/public`, and SEO/content data in `frontend/src/content`. Docker, nginx, and deployment files are at the root, `nginx/`, and `frontend-image/`.

## Build, Test, and Development Commands

- `./deploy-local.sh`: run the full local Docker stack.
- `cd backend && ./mvnw spring-boot:run`: start the backend on port `8099` with Redis available.
- `cd backend && ./mvnw test`: run all backend tests.
- `cd backend && ./mvnw -DskipTests clean package`: build the backend JAR.
- `cd frontend && npm install`: install frontend dependencies.
- `cd frontend && npm run dev`: start the Vite dev server.
- `cd frontend && npm run build`: type-check and build the frontend.
- `cd frontend && npm run build:seo`: build and prerender SEO pages.
- `cd frontend && npm run lint`: run ESLint.

## Coding Style & Naming Conventions

Use Kotlin idioms in the backend: services in `service/`, controllers in `web/`, schedulers in `scheduler/`, and provider code in `provider/`. Keep domain names in English and UI copy in French. Frontend components use PascalCase filenames, hooks use `useX.ts`, and utility modules use camelCase. Follow two-space TypeScript and four-space Kotlin indentation. Reuse helpers for match status, sorting, events, and lineups.

## Testing Guidelines

Backend tests use Spring Boot Test and Kotlin/JUnit 5. Name tests after the class or behavior under test, for example `EventDeduplicatorTest` or `MatchStatusTest`. Add focused tests when changing normalization, polling mappings, event deduplication, or time parsing. Run `cd backend && ./mvnw test` before submitting backend changes. Frontend checks are `npm run lint` and `npm run build`.

## Commit & Pull Request Guidelines

Recent commits mostly use short Conventional Commit-style prefixes such as `fix:`, `feat:`, `ci:`, and `refactor:`. Prefer that style with a concise imperative summary, for example `fix: deduplicate live board matches`. Pull requests should describe the change, list verification commands, link related issues, and include screenshots for UI changes.

## Security & Configuration Tips

Do not commit real API keys or secrets. `APIFOOTBALL_KEY`, Redis, and Ollama settings use environment variables and Spring properties. Preserve API-Football quota safeguards when changing polling or caches.
