# TrackMe Backend Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- yarn or npm

## Installation

### 1. Install Dependencies

```bash
yarn install
```

### 3. Database Setup

```bash
# Generate migrations from Drizzle schema
yarn db:generate

# Run migrations
yarn db:migrate
```

This will create all tables in `track_me_dev` database.

### 4. Start Development Server

```bash
yarn dev
```

The backend is now running at `http://localhost:3000`

## Available Scripts

```bash
# Development
yarn dev              # Start dev server with hot reload

# Production
yarn build            # Build for production
yarn start            # Start production server

# Database
yarn db:generate      # Generate Drizzle migrations
yarn db:migrate       # Apply migrations to database
yarn db:drop          # Drop all tables (⚠️ careful!)

# Code Quality
yarn lint             # Run ESLint

# Testing
yarn test             # Run Jest tests
yarn test:watch       # Run tests in watch mode
```

## Database Schema (10 Tables)

**Phase 1 - Auth:**

- `users` - User accounts (admin, agent, client)
- `user_sessions` - JWT session tracking

**Phase 2 - Tickets:**

- `tickets` - Core ticket data (title, description, status, priority, type, etc.)
- `ticket_comments` - Public replies and internal notes
- `ticket_activities` - Audit log of all ticket changes with old/new values
- `ticket_attachments` - File attachment metadata

**Phase 3 - Automation & SLA:**

- `automation_rules` - Rule definitions (type, priority conditions → actions)
- `sla_policies` - SLA timers by priority (response_time_hours, resolution_time_hours)
- `sla_breaches` - Breach records (first_response, resolution)

**Phase 4 - Knowledge Base:**

- `kb_articles` - Published articles (title, content, category, tags, full-text searchable)

**Phase 5 - Notifications:**

- `notifications` - In-app notification records (user_id, type, read status)
- `notification_preferences` - Per-user email/in-app opt-in flags

Full schema with types in: `lib/db/schema.ts`

## Project Structure

```
track_me/
├── app/api/
│   ├── auth/                      # Authentication
│   │   ├── register/
│   │   ├── login/
│   │   ├── logout/
│   │   └── me/
│   ├── tickets/                   # Ticket CRUD
│   │   ├── [id]/
│   │   │   ├── comments/
│   │   │   └── activities/
│   │   └── route.ts
│   ├── admin/
│   │   ├── automation-rules/      # Rule management
│   │   ├── sla-policies/          # SLA policy management
│   │   ├── kb/                    # Knowledge base admin
│   │   └── reports/               # Reporting endpoints
│   │       ├── volume/
│   │       ├── resolution-time/
│   │       ├── agent-performance/
│   │       └── sla-compliance/
│   ├── kb/articles/               # Public KB search & retrieve
│   ├── notifications/             # In-app notifications & preferences
│   └── health/
├── lib/
│   ├── db/
│   │   ├── client.ts              # Database connection
│   │   ├── schema.ts              # 10 tables with TypeScript types
│   │   ├── tickets.ts             # Ticket queries (CRUD + activities)
│   │   ├── automation.ts           # Automation rule/SLA queries
│   │   ├── kb.ts                  # Knowledge base queries
│   │   └── notifications.ts       # Notification queries
│   ├── auth/
│   │   ├── password.ts            # bcryptjs hashing
│   │   ├── jwt.ts                 # JWT tokens
│   │   └── middleware.ts          # withAuth, withRole HOF
│   ├── services/
│   │   ├── automationEngine.ts    # Rule evaluation & SLA application
│   │   ├── emailService.ts        # Email templates (console logs)
│   │   └── metricsService.ts      # Aggregation queries
│   └── types/
├── __tests__/                     # Jest unit tests
│   ├── auth.test.ts
│   ├── automation.test.ts
│   └── metrics.test.ts
├── jest.config.js                 # Jest configuration
├── drizzle/                       # Generated migrations
├── plan.md                        # Full development plan
├── BACKEND_SETUP.md               # This file
├── TESTING.md                     # Testing guide
└── package.json
```

## API Endpoints (35+ total)

### Auth (Phase 1 - Complete)

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/me` - Get current user (auth required)
- `POST /api/auth/logout` - Client-side token deletion

### Tickets (Phase 2 - Complete)

- `POST /api/tickets` - Create ticket (clients only)
- `GET /api/tickets` - List with filtering/pagination (query: `status`, `priority`, `limit`, `offset`)
- `GET /api/tickets/:id` - Get ticket + comments + attachments
- `PATCH /api/tickets/:id` - Update ticket (clients: description/reproduction; agents: all fields)
- `POST /api/tickets/:id/comments` - Add comment
- `GET /api/tickets/:id/activities` - Audit trail

### Automation & SLA (Phase 3 - Complete)

- `GET /api/admin/automation-rules` - List rules
- `POST /api/admin/automation-rules` - Create rule
- `PATCH /api/admin/automation-rules/:id` - Update rule
- `DELETE /api/admin/automation-rules/:id` - Delete rule
- `GET /api/admin/sla-policies` - List policies
- `POST /api/admin/sla-policies` - Create policy
- `PATCH /api/admin/sla-policies/:id` - Update policy
- `DELETE /api/admin/sla-policies/:id` - Delete policy
- Automatic rule evaluation on ticket creation/update
- Automatic SLA policy application on ticket creation

### Knowledge Base (Phase 4 - Complete)

- `GET /api/kb/articles` - List published articles (paginated, by category)
- `GET /api/kb/articles/search?q=...` - Full-text search (ILIKE)
- `GET /api/kb/articles/:id` - Get single article
- `POST /api/admin/kb/articles` - Create article (admin)
- `PATCH /api/admin/kb/articles/:id` - Update article (admin)
- `DELETE /api/admin/kb/articles/:id` - Delete article (admin)
- Auto KB suggestions on ticket creation

### Notifications (Phase 5 - Complete)

- `POST /api/notifications` - Create notification
- `GET /api/notifications` - List user's notifications
- `PATCH /api/notifications/:id` - Mark as read
- `GET /api/notifications/preferences` - Get user preferences
- `PATCH /api/notifications/preferences` - Update preferences
- Email notifications on: ticket created, assigned, comment added, SLA breach
- In-app notifications with opt-in/out

### Reporting (Phase 6 - Complete)

- `GET /api/admin/reports/volume` - Tickets by status/type/priority (query: `startDate`, `endDate`)
- `GET /api/admin/reports/resolution-time` - Avg hours to resolve (with date filters)
- `GET /api/admin/reports/agent-performance` - Assigned/resolved per agent
- `GET /api/admin/reports/sla-compliance` - SLA breaches by type (with date filters)
- All admin endpoints require `admin` role

### Health

- `GET /api/health` - API status check

## Authentication

All authenticated endpoints require:

```
Authorization: Bearer <jwt-token>
```

JWT includes `userId`, `role` (admin/agent/client), issued & expiration timestamps.

## Routing & Permissions

| Role       | Access                                                    |
| ---------- | --------------------------------------------------------- |
| **client** | Create tickets, view own, add comments, KB articles       |
| **agent**  | Update tickets, list all, add comments, reports (limited) |
| **admin**  | Full CRUD on rules, policies, KB articles; full reporting |

## Error Handling

Consistent error format:

```json
{
  "error": "Error description",
  "statusCode": 400,
  "details": {/* validation errors if applicable */}
}
```

All endpoints validate input with Zod and return 400 on invalid data.

## Activity Logging

All ticket mutations logged to `ticket_activities`:

- Creation, status/priority/assignment changes
- Comments added
- Attachments uploaded
- Old/new values recorded for auditing

Retrieve: `GET /api/tickets/:id/activities`

## Automation Engine

On ticket creation/update:

1. Load active rules from `automation_rules`
2. Evaluate conditions (type, priority, status)
3. Execute actions (auto-assign, change priority, send notification)
4. Apply matching SLA policy from `sla_policies`
5. Log to console

Logs: `[Automation]`, `[SLA]` prefixed messages

## Email Service

Triggered on:

- Ticket created → confirmation to client
- Ticket assigned → notification to agent
- Comment added → notification to watchers
- SLA breach → alert to agent/manager

Current: Template-based, logs to console (stub for SendGrid/SES integration)

## Knowledge Base Search

Uses PostgreSQL ILIKE for substring matching across title, content, tags. Results ranked by relevance.

## Reporting Metrics

- **Volume**: Count by status, type, priority within date range
- **Resolution Time**: Average hours from created to resolved
- **Agent Performance**: Tickets assigned and resolved per agent
- **SLA Compliance**: Total breaches and breakdown by type (first_response, resolution)

## Testing

Unit tests in `__tests__/`:

- **auth.test.ts**: Password hashing, JWT creation/verification
- **automation.test.ts**: Engine functions exist
- **metrics.test.ts**: Metrics service functions exist

Run: `yarn test` or `yarn test:watch`

## Troubleshooting

| Issue                     | Solution                                                              |
| ------------------------- | --------------------------------------------------------------------- |
| Database connection error | Ensure PostgreSQL running, check DATABASE_URL                         |
| Migration error           | Run `yarn db:drop && yarn db:generate && yarn db:migrate` (data loss) |
| JWT secret missing        | Add JWT_SECRET to .env.local (min 32 chars)                           |
| Port 3000 in use          | Change in next.config.ts or kill process on port 3000                 |

## Key Features

✅ **Complete Auth Flow** - Register, login, JWT tokens, role-based access  
✅ **Full Ticket Lifecycle** - Create, update, comment, track history  
✅ **Automation Rules** - Conditional auto-assignment & priority changes  
✅ **SLA Tracking** - Per-priority timers, breach detection  
✅ **Knowledge Base** - Searchable articles with admin CRUD  
✅ **Notifications** - In-app + email with user preferences  
✅ **Reporting** - Volume, resolution time, agent perf, SLA metrics  
✅ **Audit Logging** - All changes tracked with old/new values  
✅ **Input Validation** - Zod schemas on all routes  
✅ **Unit Tests** - Auth, automation, metrics

## Not Implemented

- ⏸ WebSocket real-time updates (Phase 7 skipped)
- ⏸ Rate limiting (Phase 8 - security audit skipped)
- ⏸ CORS & secure headers (skipped)
- ⏸ Structured logging (Winston/Pino) (skipped)
- ⏸ S3 file uploads (stubbed, dependencies added)
- ⏸ Slack/Teams webhooks (optional, not implemented)

## Next Steps

1. Integrate with frontend (REST API ready)
2. Add SendGrid/SES for email
3. Deploy to production (build + start scripts ready)
4. Add WebSocket for real-time (if needed)

## Dependencies

| Package      | Version | Purpose            |
| ------------ | ------- | ------------------ |
| next         | 16.3.1  | React framework    |
| drizzle-orm  | 0.45.2  | PostgreSQL ORM     |
| pg           | 8.23.0  | PostgreSQL driver  |
| jsonwebtoken | 9.0.3   | JWT auth           |
| bcryptjs     | 3.0.3   | Password hashing   |
| zod          | 4.4.3   | Runtime validation |
| jest         | 29      | Testing            |

See `package.json` for full list.

## Documentation

- `plan.md` - Detailed 8-phase development plan
- `TESTING.md` - Curl/Postman testing examples
- `lib/db/schema.ts` - Database types & relationships
- `lib/auth/middleware.ts` - Middleware examples

## Contact

For issues or questions, refer to the plan.md or check the API implementation in `app/api/`.
