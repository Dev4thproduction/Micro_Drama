# Micro_Drama Frontend (Next.js)

## Overview
Next.js + Tailwind frontend for the Micro-Drama platform. Includes a cinematic landing page, authentication (login/register), admin dashboard, and a CMS console for managing landing/announcement content. Auth and data flow through the backend API (`NEXT_PUBLIC_API_URL`).

## Getting Started
1) Install dependencies:
   ```sh
   cd frontend
   npm install
   ```
2) Set environment:
   - `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3000`)
3) Run dev server:
   ```sh
   npm run dev
   ```
4) Open http://localhost:3000

## Key Screens
- `/` Landing experience with hero, trending/new sections, and newsletter CTA.
- `/login`, `/register` Auth flows backed by JWT from the API.
- `/dashboard` Admin-only overview with quick access to CMS.
- `/dashboard/cms` CMS control center (admin/creator view; admin required to publish/archive).
- `/dashboard/studio` Creator Studio (creator/admin) for uploading videos, creating series, and episodes.

## CMS Usage
1) Authenticate as an admin (creators can draft/review/schedule but cannot publish).
2) Navigate to `/dashboard/cms`.
3) Create or edit entries (types: page, collection, announcement, banner). Set visibility (public/authenticated/subscribers/internal), workflow state, tags, summary/body, and optional `publishAt`.
4) Admin can publish immediately or schedule via the Publish action; every change bumps the version and logs an audit entry.
5) Public surfaces can consume `GET /cms/public` or `/cms/public/:slug` from the backend.

## Creator Studio Usage
1) Log in as `creator` or `admin`, go to `/dashboard/studio`.
2) Upload a video (uses `/uploads/presign` + S3 PUT + `/creator/videos`).
3) Create a series (`/creator/series`), then create episodes for a selected series (`/creator/series/:id/episodes`) and attach uploaded videos.
4) Episodes remain pending until an admin approves them via `/admin/episodes/:episodeId/approve`.

## Scripts
- `npm run dev` - start Next dev server
- `npm run build` - production build
- `npm run start` - serve production build

## Notes
- Auth context stores the JWT/user in `localStorage` and injects the token on API requests.
- CMS UI mirrors backend workflows: draft/review/scheduled/published/archived with audit visibility.
- Tailwind is used globally (see `src/app/globals.css` and `tailwind.config.ts`).
