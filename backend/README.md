# Micro_Drama Backend

## Overview
Node.js + Express + MongoDB backend for the Vertical Micro-Drama MVP. Features authentication (JWT), role-based access (viewer/creator/admin), content creation, admin moderation, subscription gating for playback, S3 presigned uploads/playback, watch history tracking, and a CMS module for landing/announcement content with workflow, audit logs, and scheduled publishing. Responses are standardized for frontend integration.

## Project Structure
```
backend/
  app.js               # Express app setup
  server.js            # Server bootstrap + graceful shutdown
  package.json         # Scripts and dependencies
  .env.example         # Environment template
  src/
    config/            # env validation, DB connect
    controllers/       # Route handlers
    middleware/        # auth, roles, logging, error handler
    models/            # Mongoose schemas
    routes/            # Express routes
    utils/             # S3 presign, pagination, responses, logger
```

## Setup
1) Install dependencies:
   ```sh
   cd backend
   npm install
   ```
2) Configure environment:
   - Copy `.env.example` to `.env` and set real values.
   - Required: `MONGODB_URI`, `JWT_SECRET`, `AWS_REGION`, `AWS_S3_BUCKET`
   - Optional: `PORT` (default 3000), `CORS_ORIGINS` (comma list or `*`), `NODE_ENV`
   - AWS credentials if not using IAM role: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`
3) Run:
   ```sh
   npm start
   ```
4) Health check: `GET /health`

## Tests
- Run creator flow tests (uses in-memory MongoDB, test JWT secret, and stubbed AWS env):
  ```sh
  npm test
  ```

## API Summary (protected routes require `Authorization: Bearer <JWT>`)
- Auth: `POST /auth/register` (no admin self-signup), `POST /auth/login`
- Uploads (creator/admin): `POST /uploads/presign` -> `{ data: { s3Key, uploadUrl } }`
- Creator (creator/admin, own content only):
  - `POST /creator/series`, `GET /creator/series`
  - `POST /creator/series/:seriesId/episodes`, `GET /creator/series/:seriesId/episodes`
  - `POST /creator/videos`, `GET /creator/videos`
- Admin (admin-only):
  - `GET /admin/series/pending`, `GET /admin/episodes/pending`
  - `POST /admin/episodes/:episodeId/approve` (pending -> published; auto-publishes series if pending/draft)
  - `POST /admin/users/:userId/subscription` (toggle active/canceled)
- CMS (admin/creator; admin owns publish/archive):
  - `GET /cms/entries` list with filters; `POST /cms/entries` create (draft/review/scheduled)
  - `GET /cms/entries/:entryId` (use `?includeLogs=true` for last 15 audit events), `PUT /cms/entries/:entryId` update (version bumps)
  - `POST /cms/entries/:entryId/publish` (immediate or scheduled), `POST /cms/entries/:entryId/archive`
  - Public: `GET /cms/public` (published + live scheduled), `GET /cms/public/:slug`
- Published content (auth required): `GET /content/series`, `GET /content/series/:seriesId/episodes`, `GET /content/episodes/:episodeId`
- Playback: `GET /video/play/:episodeId` (requires published + subscription), `POST /video/progress`
- Webhooks (simulated processing): `POST /webhook/processing` with `{ s3Key, status: processing|ready|failed, durationSeconds?, note? }` (auto-updates video status; if ready, pending/draft episodes with that video remain pending for admin approval)

### Response Format
- Success: `{ data: ... }` or `{ data: [...], meta: { total, page?, limit?, totalPages? } }`
- Error: `{ error: { message, status } }`
- Lists support `page`, `limit`, `sort=field:asc|desc` (per-endpoint allowed fields).

## Data Flow (Upload -> Playback)
1) Creator: `/uploads/presign` -> upload to S3 with `uploadUrl`.
2) Save video metadata: `/creator/videos` with `s3Key` (pending).
3) Create series and episodes (pending) referencing the video.
4) Admin approves episode (pending -> published, series promoted to published if needed).
5) Viewer fetches published lists (`/content/*`), requests play URL (`/video/play/:episodeId`) -> receives signed GET URL (S3 key hidden), tracks progress via `/video/progress`.

## CMS Workflow Cheatsheet
- Roles: creators and admins can create/edit drafts/review/scheduled entries; only admins can publish or archive.
- States: `draft` (editable), `review` (ready for approval), `scheduled` (has `publishAt` in the future), `published`, `archived`.
- Versioning & audit: every update bumps `version` and emits an audit log; `includeLogs=true` returns the latest 15 logs for an entry.
- Public feed: `/cms/public` returns published content plus scheduled items whose `publishAt` is in the past; `/cms/public/:slug` fetches a single entry by slug.

## What's Done
- Auth with JWT/bcrypt; role gates for creator/admin; ownership checks.
- Standardized success/error responses; request logging; error logging.
- S3 presigned PUT/GET; no secrets in code; env validation at startup.
- Creator flows for series/episodes/videos; admin moderation; subscription gating on playback.
- CMS entries with workflows, audit logging, scheduled publishing, and public retrieval.
- Pagination/sorting on list endpoints; watch history tracking.
- Graceful shutdown; CORS configurable; `.gitignore` in place.
- Request IDs on all requests; lightweight rate limiting on uploads and video creation; simulated processing webhook.

## What's Left / MVP Limitations
- No billing/payments or automated renewals (admin toggles subscription).
- No email verification, password reset, or MFA; minimal password policy.
- No rate limiting, audit logs, or structured logging beyond basics.
- No video processing pipeline/webhooks; videos remain pending until external handling.
- Limited search/filtering; no pagination on watch history.
- No automated tests included.

## Enterprise Readiness Plan
- **Security & Compliance:** Add MFA, password reset, session revocation, rate limiting, IP allow/deny lists, audit trails, input validation middleware, secrets management (vault), regular dependency scanning, and compliance logging (PII handling).
- **Identity & Authorization:** Integrate SSO (OIDC/SAML), fine-grained RBAC/ABAC, scoped API tokens, and delegated admin tooling.
- **Reliability & SLOs:** Define SLOs/SLAs; add health/readiness probes, graceful draining, retries/circuit breakers on outbound calls, and multi-AZ Mongo with backups + PITR.
- **Scalability & Performance:** CDN in front of media; async job queue for video processing; caching (Redis) for reads; pagination everywhere; back-pressure and upload size limits; horizontal autoscaling.
- **Observability:** Structured logging, distributed tracing, metrics (RED/USE), alerting dashboards, and request IDs correlated across services/jobs.
- **Data & Media Pipeline:** Formal video processing workflow (transcode, thumbnails), DRM/tokenized playback, content lifecycle/status transitions, and storage lifecycle policies.
- **Payments & Subscriptions:** Billing provider integration (Stripe/etc.), plans/entitlements, webhooks for status updates, dunning flows, receipts/invoices.
- **QA & Release:** Automated tests (unit/integration/e2e), contract tests for APIs, CI/CD with lint/format/type checks, feature flags, blue/green or canary deploys.
