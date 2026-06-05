# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack Vietnamese story/novel reading platform ("Tàng Thư Các") with three sub-projects:
- `story-reader/` — Frontend monorepo (web + mobile + shared)
- `story-reader-api/` — Backend REST API

---

## Frontend: story-reader

**Package manager:** npm workspaces (run commands from `story-reader/`)

### Workspaces
| Package | Path | Purpose |
|---|---|---|
| `@story-reader/web` | `packages/web/` | React 18 SPA (Vite, port 4444) |
| `@story-reader/mobile` | `packages/mobile/` | React Native + Expo 56 |
| `@story-reader/shared` | `packages/shared/` | Shared types, utils, mock data |

### Commands

```bash
cd story-reader

# Run individual apps
npm run web          # Start web dev server (http://localhost:4444)
npm run mobile       # Start Expo dev server

# Build shared package first when types change
npm run build:shared

# Web-specific (from packages/web/)
cd packages/web
npm run dev          # Dev server
npm run build        # tsc + vite build
npm run test         # Vitest (run once)
npm run preview      # Preview production build

# Mobile-specific (from packages/mobile/)
cd packages/mobile
npx expo start       # Expo dev server
npx expo run:android
npx expo run:ios
npx eas build --profile preview --platform ios   # EAS iOS build
```

### Run a single test (web)
```bash
cd story-reader/packages/web
npx vitest run src/path/to/file.test.ts
```

### Tech Stack
- **Web:** React 18, Vite, TypeScript, Tailwind CSS, React Router DOM 6, Zustand
- **Mobile:** React Native 0.81, Expo 56, NativeWind, React Navigation (native-stack + bottom-tabs), Zustand, Async Storage
- **Auth:** Google OAuth via `@react-oauth/google` (web) and `expo-auth-session` (mobile)
- **Testing:** Vitest + jsdom (web)

---

## Backend: story-reader-api

**Runtime:** Node.js, NestJS 11 on Fastify 5

### Commands

```bash
cd story-reader-api

npm run start:dev    # Dev with ts-node watch
npm run build        # Compile to dist/
npm run start        # Run compiled app
npm run test         # Jest

# Prisma
npx prisma generate          # Regenerate client after schema changes
npx prisma migrate dev        # Run migrations in dev
npx prisma studio             # GUI for the database
npx prisma db seed            # Seed the database
```

### Run a single test
```bash
cd story-reader-api
npx jest src/path/to/file.spec.ts
```

### Tech Stack
- **Framework:** NestJS + Fastify
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT (access + refresh token rotation) + Google OAuth 2.0 (passport-jwt, passport-google-oauth20)
- **Validation:** class-validator + class-transformer (global ValidationPipe)
- **Rate limiting:** @nestjs/throttler (120 req/min)
- **API docs:** Swagger at `http://localhost:<port>/api/docs`
- **API prefix:** `/api`

### Module Structure

```
src/
  auth/         # JWT + Google OAuth strategy, token refresh, guards
  users/        # User CRUD, profile management
  stories/      # Story catalog, search, genre filtering
  shelf/        # Personal reading shelf (reading/completed/want_to_read)
  bookmarks/    # Saved/favorited stories
  progress/     # Per-user reading progress per story
  ratings/      # 1–5 star ratings
  comments/     # Comments with 1-level nested replies (parentId)
  prisma/       # PrismaService (shared database client)
  config/       # App configuration module
  common/       # Shared filters, interceptors, decorators
```

### Database Schema Key Entities
- **User** — multi-provider auth (EMAIL, GOOGLE), hashed passwords, refresh token
- **Story** — Vietnamese genres: `tien-hiep`, `ngon-tinh`, `do-thi`, `kiem-hiep`, `di-gioi`, `trong-sinh`, `huyen-huyen`, `khoa-hoc-vien-tuong`
- **Chapter** — belongs to Story, has word count
- **ShelfEntry** — user × story with status enum
- **ReadingProgress** — user × story, tracks current chapter/position
- **Comment** — optional `parentId` for replies (max 1 level deep)

---

## Architecture: Shared Package

`packages/shared/` exports:
- **Types:** `Story`, `Chapter`, `User`, `Genre`, `StoryStatus`, `ShelfEntry`, `ReadingProgress`, `ReaderSettings`, `SearchResult`
- **Utils:** `formatNumber`, `formatDate`, `truncateText`, `generateSlug`, `statusLabel`, `statusColor`
- **Mock data:** categories, mock stories, mock chapters (for dev/test without API)

Both `web` and `mobile` import from `@story-reader/shared`. Rebuild shared (`npm run build:shared`) after type changes before running the apps.

---

## State Management

Both web and mobile use **Zustand** for global state. Services call the backend API and update the store. There is no Redux or Context API for app state.

## Path Aliases

Web (`packages/web/vite.config.ts`) has `@/` aliased to `src/`. Mobile uses standard Expo module resolution.
