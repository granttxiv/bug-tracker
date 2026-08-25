# TrackMe: Backend Development Plan

## Overview

**TrackMe** is a centralized automated bug tracking and client support portal backend. This plan focuses on **backend work only** (API routes, database, auth, business logic). The frontend team builds the UI separately.

**Stack**: Next.js 16.3.1 + TypeScript + PostgreSQL + Redis  
**Deployment**: Vercel

---

## Architecture

```
Frontend (separate project/team)
         ↓
   [HTTP REST API]
         ↓
Next.js API Routes (app/api/*)
         ↓
   [Business Logic Layer]
         ↓
PostgreSQL + Redis + S3
```

---

## Data Model (PostgreSQL)

### Users & Auth

```sql
users
  ├── id (UUID, PK)
  ├── email (unique)
  ├── password_hash
  ├── role (admin | agent | client)
  ├── name
  ├── company (for clients)
  ├── created_at
  └── updated_at

user_sessions
  ├── id (UUID, PK)
  ├── user_id (FK)
  ├── token (JWT)
  ├── expires_at
  └── created_at
```

### Tickets (Core)

```sql
tickets
  ├── id (UUID, PK)
  ├── client_id (FK → users)
  ├── assigned_to (FK → users, agent)
  ├── title
  ├── description
  ├── type (bug | feature_request | support)
  ├── priority (critical | high | medium | low)
  ├── status (new | acknowledged | triaged | in_progress | resolved | closed)
  ├── version (product version affected)
  ├── environment (production | staging | development)
  ├── steps_to_reproduce (text)
  ├── expected_behavior (text)
  ├── actual_behavior (text)
  ├── resolved_at (timestamp, nullable)
  ├── closed_at (timestamp, nullable)
  ├── created_at
  ├── updated_at
  └── (indices on: client_id, assigned_to, status, priority, created_at)

ticket_comments
  ├── id (UUID, PK)
  ├── ticket_id (FK)
  ├── user_id (FK)
  ├── body (text)
  ├── type (public_reply | internal_note)
  ├── created_at
  └── updated_at

ticket_activities
  ├── id (UUID, PK)
  ├── ticket_id (FK)
  ├── user_id (FK)
  ├── action (created | status_changed | assigned | commented | attachment_added)
  ├── old_value (jsonb)
  ├── new_value (jsonb)
  ├── created_at
  └── (index on: ticket_id, created_at)

ticket_attachments
  ├── id (UUID, PK)
  ├── ticket_id (FK)
  ├── uploaded_by (FK → users)
  ├── file_name
  ├── s3_key
  ├── file_size (bytes)
  ├── mime_type
  ├── created_at
  └── (index on: ticket_id)
```

### Automation & SLA

```sql
automation_rules
  ├── id (UUID, PK)
  ├── name
  ├── description
  ├── is_active (boolean)
  ├── conditions (jsonb) -- e.g., {priority: "critical", type: "bug"}
  ├── actions (jsonb) -- e.g., {assign_to: "user_id", notify: ["email"]}
  ├── execution_order (int)
  ├── created_at
  └── updated_at

sla_policies
  ├── id (UUID, PK)
  ├── name
  ├── type (first_response | resolution)
  ├── priority (critical | high | medium | low)
  ├── ticket_type (bug | feature_request | support, nullable)
  ├── response_time_hours (int)
  ├── resolution_time_hours (int)
  ├── created_at
  └── updated_at

sla_breaches
  ├── id (UUID, PK)
  ├── ticket_id (FK)
  ├── policy_id (FK)
  ├── breach_type (first_response | resolution)
  ├── breached_at (timestamp)
  └── created_at
```

### Knowledge Base

```sql
kb_articles
  ├── id (UUID, PK)
  ├── title
  ├── content (markdown)
  ├── category (string, for grouping)
  ├── tags (text array)
  ├── is_published (boolean)
  ├── view_count (int)
  ├── created_at
  ├── updated_at
  └── (full-text index on: title, content, tags)
```

### Notifications

```sql
notifications
  ├── id (UUID, PK)
  ├── user_id (FK)
  ├── ticket_id (FK, nullable)
  ├── type (status_change | comment | assigned | sla_alert | mention)
  ├── title
  ├── message
  ├── is_read (boolean)
  ├── read_at (timestamp, nullable)
  ├── created_at
  └── (index on: user_id, is_read, created_at)

notification_preferences
  ├── id (UUID, PK)
  ├── user_id (FK)
  ├── channel (email | slack | teams | in_app)
  ├── event_type (status_change | comment | assigned | sla_alert)
  ├── is_enabled (boolean)
  └── updated_at
```

---

## API Endpoints (REST)

### Authentication

```
POST   /api/auth/register          → Create client account
POST   /api/auth/login             → Login, get JWT
POST   /api/auth/logout            → Logout
POST   /api/auth/refresh           → Refresh JWT token
GET    /api/auth/me                → Get current user
```

### Tickets (Client View)

```
GET    /api/tickets                → List my tickets (paginated, filters)
POST   /api/tickets                → Create new ticket
GET    /api/tickets/:id            → Get ticket details
PATCH  /api/tickets/:id            → Update ticket (client can only update certain fields)
POST   /api/tickets/:id/comments   → Add comment/reply
GET    /api/tickets/:id/comments   → Get comments
GET    /api/tickets/:id/activities → Get activity audit log
POST   /api/tickets/:id/attachments → Upload file
DELETE /api/tickets/:id/attachments/:attachment_id → Remove attachment
```

### Agent Dashboard

```
GET    /api/agent/dashboard        → Summary: open tickets, SLA status, etc.
GET    /api/agent/tickets          → List tickets (advanced filters)
GET    /api/agent/tickets/:id      → Get ticket full details
PATCH  /api/agent/tickets/:id      → Update ticket (status, priority, assign, etc.)
POST   /api/agent/tickets/:id/comments → Add internal note or reply
GET    /api/agent/stats            → Agent performance metrics
```

### Admin & Configuration

```
GET    /api/admin/users            → List users
POST   /api/admin/users            → Create user
PATCH  /api/admin/users/:id        → Update user (role, status)

GET    /api/admin/automation-rules → List automation rules
POST   /api/admin/automation-rules → Create rule
PATCH  /api/admin/automation-rules/:id → Update rule
DELETE /api/admin/automation-rules/:id → Delete rule

GET    /api/admin/sla-policies     → List SLA policies
POST   /api/admin/sla-policies     → Create SLA policy
PATCH  /api/admin/sla-policies/:id → Update policy
DELETE /api/admin/sla-policies/:id → Delete policy

GET    /api/admin/reports/volume   → Ticket volume by date, status, type
GET    /api/admin/reports/resolution-time → Avg resolution time
GET    /api/admin/reports/agent-performance → Agent metrics
```

### Knowledge Base

```
GET    /api/kb/articles            → List published articles (paginated)
GET    /api/kb/articles/search     → Full-text search
GET    /api/kb/articles/:id        → Get article
POST   /api/admin/kb/articles      → Create article (admin)
PATCH  /api/admin/kb/articles/:id  → Update article
DELETE /api/admin/kb/articles/:id  → Delete article
```

### WebSocket (Real-time, optional Phase 3)

```
WS     /api/ws                     → Subscribe to: ticket updates, SLA alerts, notifications
       Events: ticket_updated, comment_added, assigned, sla_breach, etc.
```

---

## Development Phases

### Phase 1: Foundation & Auth (Days 1–5)

**Goal**: Scaffold DB, auth system, basic user CRUD.

#### 1.1 Database Setup

- [x] Set up PostgreSQL locally (Docker recommended)
  - Create `track_me_dev` database
  - Install `pg` or `postgres` client
- [x] Create initial schema migrations (use a migration tool: `drizzle-kit` or raw SQL)
  - `users` table with hashed passwords
  - `user_sessions` table for JWT tracking
- [x] Set up environment variables: `DATABASE_URL`, `JWT_SECRET`, etc. in `.env.local`

#### 1.2 Dependencies

- [x] Add: `drizzle-orm` (ORM choice TBD)
- [x] Add: `bcryptjs` (password hashing)
- [x] Add: `jsonwebtoken` (JWT)
- [x] Add: `zod` (schema validation)
- [ ] Add: `axios` (HTTP client for external APIs)

#### 1.3 Auth API

- [x] `POST /api/auth/register` – Create client account
- [x] `POST /api/auth/login` – Return JWT
- [x] `POST /api/auth/logout` – Invalidate session
- [x] `GET /api/auth/me` – Get current user (middleware checks JWT)
- [x] Auth middleware: check JWT on protected routes

#### 1.4 Testing

- [x] Manual test auth flow with Postman/curl
- [x] Verify passwords are hashed
- [x] Verify JWT expiration works

---

### Phase 2: Ticket CRUD & Core Model (Days 6–12)

**Goal**: Full ticket lifecycle, comments, attachments.

#### 2.1 Database Schema Expansion

- [x] Create `tickets` table
- [x] Create `ticket_comments` table
- [x] Create `ticket_activities` table
- [x] Create `ticket_attachments` table (metadata only, files in S3)
- [x] Add indices on common queries (client_id, status, created_at)

#### 2.2 Ticket API (Client View)

- [x] `GET /api/tickets` – List user's tickets (pagination, filters by status)
- [x] `POST /api/tickets` – Create ticket
  - Validate fields: title, description, type, priority, version, environment
  - Auto-set status = "new"
  - Log in `ticket_activities`
- [x] `GET /api/tickets/:id` – Get ticket + comments + attachments
- [x] `PATCH /api/tickets/:id` – Update (client can only change: description, steps_to_reproduce)
- [x] `POST /api/tickets/:id/comments` – Add public reply
- [x] `GET /api/tickets/:id/comments` – Implicit in GET /:id endpoint

#### 2.3 Attachments (S3 Integration)

- [ ] Add S3 client (AWS SDK or MinIO for local dev)
- [ ] `POST /api/tickets/:id/attachments` – Upload file
  - Validate file size, type
  - Store in S3, record metadata in DB
- [ ] `GET /api/tickets/:id/attachments` – List files with download URLs
- [ ] `DELETE /api/tickets/:id/attachments/:id` – Remove file from S3 and DB

#### 2.4 Activity Audit Log

- [x] Auto-logging: all ticket changes logged to `ticket_activities`
  - Ticket creation → logs title, status, priority
  - Ticket updates → logs old/new values
  - Comments added → logs comment type
  - More actions ready: status_changed, assigned, attachment_added
- [x] `GET /api/tickets/:id/activities` – Return audit trail with user + action

#### 2.5 Testing

- [x] Create ticket, verify in DB
- [ ] Upload attachment, verify in S3 + DB (deferred)
- [x] Update ticket, verify activity logged
- [x] Test pagination, filters
- [x] Manual testing guide (TESTING.md)
- [x] Quick test reference (QUICK_TEST.md)
- [x] Automated test script (test-phase2.sh)

### Phase 4: Knowledge Base & Search (Days 26–30)

**Goal**: Self-service content to deflect common tickets.

#### 4.1 Database Schema

- [x] Create `kb_articles` table with full-text index

#### 4.2 Knowledge Base API

- [x] `GET /api/kb/articles` – List published articles (paginated, by category)
- [x] `GET /api/kb/articles/search?q=...` – Full-text search
  - Search in: title, content, tags
  - Return ranked results
- [x] `GET /api/kb/articles/:id` – Get single article
- [x] `POST /api/admin/kb/articles` – Create article (admin)
- [x] `PATCH /api/admin/kb/articles/:id` – Update (admin)
- [x] `DELETE /api/admin/kb/articles/:id` – Delete (admin)

#### 4.3 Optional: KB Suggestions

- [x] On `POST /api/tickets`, call KB search with ticket title/description
- [x] Return suggested articles in response (help deflect)
- [x] Frontend can show "Before creating a ticket, check these articles..."

#### 4.4 Testing

- [ ] Create KB article, publish
- [ ] Search for it, verify returned
- [ ] Create ticket, verify KB suggestions in response

---

### Phase 5: Notifications & Integrations (Days 31–37)

**Goal**: Email, Slack/Teams, in-app notifications.

#### 5.1 Database Schema

- [x] Create `notifications` table
- [x] Create `notification_preferences` table

#### 5.2 Email Notifications

- [ ] Add SendGrid or SES SDK
- [x] Build `services/emailService.ts`
- [x] Trigger on:
  - Ticket created: send confirmation to client
  - Ticket assigned: notify assigned agent
  - Comment added: notify watchers
  - SLA breach: notify agent/manager
- [ ] Template-based emails (HTML templates in `templates/`)

#### 5.3 In-App Notifications

- [x] `POST /api/notifications` – Create notification record
- [x] `GET /api/notifications` – List user's notifications
- [x] `PATCH /api/notifications/:id` – Mark as read

#### 5.4 Notification Preferences

- [x] `GET /api/notifications/preferences` – Get user's preferences
- [x] `PATCH /api/notifications/preferences` – User can opt-in/out by channel

#### 5.5 Optional: Slack/Teams Integration

- [ ] Register webhook URLs in admin panel
- [ ] On ticket events, POST to Slack/Teams
  - Format: rich message with ticket summary, CTA
- [ ] Bidirectional: Slack commands to update tickets (future)

#### 5.6 Testing

- [ ] Create ticket, verify email sent
- [ ] Assign ticket, verify notification in `/api/notifications`
- [ ] Update notification preferences, verify respected

---

### Phase 6: Reporting & Analytics (Days 38–42)

**Goal**: Admin dashboards with key metrics.

#### 6.1 Admin Reporting Endpoints

- [x] `GET /api/admin/reports/volume` – Tickets by status, type, priority; supports `?startDate=ISO&endDate=ISO`
- [x] `GET /api/admin/reports/resolution-time` – Avg hours to resolve; supports date filters
- [x] `GET /api/admin/reports/agent-performance` – Tickets assigned/resolved per agent
- [x] `GET /api/admin/reports/sla-compliance` – SLA breaches by type; supports date filters
- [x] All endpoints: admin-only auth, Zod validation

#### 6.2 Metrics Service

- [x] `lib/services/metricsService.ts` – 5 functions (volume, resolution time, agent perf, SLA compliance, total count)
  - PostgreSQL grouping, aggregates, EXTRACT for time calculations
  - Redis caching deferred (not yet needed)

#### 6.3 Testing

- [x] Endpoints created in `/app/api/admin/reports/{volume,resolution-time,agent-performance,sla-compliance}/route.ts`
- [x] Test with: `curl -H "Authorization: Bearer <token>" http://localhost:3000/api/admin/reports/volume`

- [ ] Create 10 tickets, some resolved
- [ ] Query volume report, verify counts
- [ ] Query agent performance, verify correct

---

### Phase 7: WebSocket & Real-time Updates (Days 43–45)

**Goal**: Real-time notifications and live dashboard updates.

#### 7.1 WebSocket Setup

- [ ] Use Next.js API routes with WebSocket upgrade (Node.js native or library like `ws`)
- [ ] `WS /api/ws` – Client connects with JWT
  - Subscribe to: my tickets, assigned tickets, all tickets (admin)
  - Receive events on: ticket_created, status_changed, comment_added, etc.

#### 7.2 Event Broadcasting

- [ ] On ticket update, broadcast to all connected clients
- [ ] Use Redis Pub/Sub to scale across multiple server instances

#### 7.3 Testing

- [ ] Connect WebSocket, create ticket, verify event received in another connection
- [ ] Disconnect/reconnect, verify no message loss

---

### Phase 8: Testing, Security, Polish (Days 46–50)

**Goal**: Hardened, tested, production-ready backend.

#### 8.1 Security Audit

- [ ] [ ] Rate limiting on auth endpoints (prevent brute force)
- [ ] [ ] CORS configuration (allow frontend origin only)
- [ ] [ ] Input validation on all endpoints (use `zod`)
- [ ] [ ] SQL injection prevention (use ORM, parameterized queries)
- [ ] [ ] XSS prevention (sanitize rich text in comments)
- [ ] [ ] CSRF tokens if needed
- [ ] [ ] Secure headers (Helmet.js)

#### 8.2 Unit & Integration Tests

- [ ] Create test database (`track_me_test`)
- [ ] Test auth flows (register, login, token refresh)
- [ ] Test ticket CRUD
- [ ] Test automation engine logic
- [ ] Test SLA calculations
- [ ] Use `jest` + `@testing-library`

#### 8.3 Error Handling & Logging

- [ ] Consistent error response format
  - `{ error: string, code: string, statusCode: number }`
- [ ] Structured logging (Winston or Pino)
  - Log all API requests, database queries (in debug), errors
- [ ] Error boundaries: catch unhandled exceptions, log, return 500

#### 8.4 Documentation

- [ ] Update README with setup instructions
- [ ] Document API endpoints (OpenAPI/Swagger spec, optional)
- [ ] Document environment variables
- [ ] Document database schema

#### 8.5 Performance

- [ ] Add database query logging, identify N+1 queries
- [ ] Optimize slow queries with indices
- [ ] Cache KB articles in Redis
- [ ] Paginate all list endpoints

---

## Environment Variables

Create `.env.local`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/track_me_dev

# JWT & Auth
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRATION=24h

# Redis (optional, for Phase 6+)
REDIS_URL=redis://localhost:6379

# S3 / File Storage
S3_BUCKET=track-me-uploads
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

# Email
SENDGRID_API_KEY=...
EMAIL_FROM=noreply@trackme.io

# External Integrations (optional)
SLACK_WEBHOOK_URL=...
TEAMS_WEBHOOK_URL=...

# Node environment
NODE_ENV=development
```

---

## Tech Choices (Decisions Made)

| Area               | Choice            | Reason                                |
| ------------------ | ----------------- | ------------------------------------- |
| **ORM**            | Prisma or Drizzle | Type-safe, migrations, great DX       |
| **Validation**     | Zod               | Runtime type checking, error messages |
| **Database**       | PostgreSQL        | Relational, full-text search, JSONB   |
| **File Storage**   | S3/MinIO          | Scalable, decoupled from API          |
| **Authentication** | JWT               | Stateless, scales horizontally        |
| **Cache**          | Redis             | Session store, pub/sub for real-time  |
| **Email**          | SendGrid/SES      | Reliable, good deliverability         |

---

## Testing Checklist

Before marking each phase complete:

- [ ] Manual test with Postman or curl
- [ ] Check database for expected records
- [ ] Verify error responses are meaningful
- [ ] Check logs for errors or warnings
- [ ] Ensure role-based access is enforced
- [ ] Write unit tests for critical business logic

---

## Notes for Frontend Team

- All endpoints return JSON
- Timestamps are ISO 8601 (UTC)
- Pagination: `?page=1&limit=20` (default limit 20)
- Filter example: `?status=open&priority=critical`
- Files are accessed via pre-signed S3 URLs (expires in 1 hour)
- WebSocket URL: `wss://domain/api/ws` (after Phase 8)
- See `BACKEND_API.md` for detailed endpoint specs (to be created)

---

## Quick Start (for any agent picking this up)

1. **Identify current phase**: Look at Phase checklist above, find first unchecked item
2. **Read the phase goal & description**
3. **Follow the checklist items in order**
4. **Test each feature** before moving to next
5. **Update this file** with actual progress (dates, blockers, decisions)
6. **Handoff notes**: If pausing work, summarize what's done, what's next, any blockers

---

## Links & Resources

- [Next.js App Router API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma ORM](https://www.prisma.io/docs) or [Drizzle ORM](https://orm.drizzle.team)
- [JWT.io](https://jwt.io)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Redis Pub/Sub](https://redis.io/docs/manual/pubsub)
- [SendGrid API](https://sendgrid.com/docs)
- [AWS S3](https://docs.aws.amazon.com/s3) or [MinIO](https://min.io/docs)
