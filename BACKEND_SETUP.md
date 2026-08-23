# TrackMe Backend Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create `.env.local` in the project root:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/track_me_dev

# JWT & Auth
JWT_SECRET=your-super-secret-key-min-32-chars-change-in-prod
JWT_EXPIRATION=24h

# Node environment
NODE_ENV=development
```

### 3. Database Setup

```bash
# Generate migrations from Drizzle schema
npm run db:generate

# Run migrations
npm run db:migrate
```

This will create all tables in `track_me_dev` database.

### 4. Start Development Server

```bash
npm run dev
```

The backend is now running at `http://localhost:3000`

## Available Scripts

```bash
# Development
npm run dev           # Start dev server with hot reload

# Production
npm run build         # Build for production
npm run start         # Start production server

# Database
npm run db:generate   # Generate Drizzle migrations
npm run db:migrate    # Apply migrations to database
npm run db:drop       # Drop all tables (⚠️ careful!)

# Code Quality
npm run lint          # Run ESLint
```

## Database Schema

The schema includes:

**Phase 1 (Complete):**

- **users**: User accounts (admin, agent, client)
- **user_sessions**: JWT session tracking

**Phase 2 (Complete):**

- **tickets**: Core ticket data (title, description, status, priority, etc.)
- **ticket_comments**: Public replies and internal notes
- **ticket_activities**: Audit log of all ticket changes
- **ticket_attachments**: Metadata for file attachments (S3 integration planned for Phase 2.3)

Full schema in: `lib/db/schema.ts`

## Project Structure

```
track_me/
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── register/
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   └── me/
│   │   ├── tickets/           # Ticket CRUD endpoints
│   │   │   ├── [id]/
│   │   │   │   ├── comments/
│   │   │   │   └── activities/
│   │   │   └── route.ts       # List & create tickets
│   │   └── health/            # Health check endpoint
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── db/
│   │   ├── client.ts          # Database connection
│   │   ├── schema.ts          # Drizzle schema
│   │   └── tickets.ts         # Ticket queries & operations
│   ├── auth/
│   │   ├── password.ts        # Password hashing/verification
│   │   ├── jwt.ts             # JWT token generation/verification
│   │   └── middleware.ts      # Auth middleware for endpoints
│   ├── types/
│   │   ├── ticket.ts          # Ticket validation schemas
│   │   └── attachment.ts      # File attachment schemas
│   └── s3/                    # S3 utilities (for Phase 2.3)
├── drizzle/                   # Generated migrations
├── .env.local                 # Environment variables
├── drizzle.config.ts          # Drizzle configuration
├── tsconfig.json
├── package.json
├── BACKEND_SETUP.md          # This file
└── TESTING.md                # Testing guide

```

## API Endpoints

### Auth (Phase 1)

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout (client-side token deletion)

### Tickets (Phase 2)

- `POST /api/tickets` - Create new ticket (clients only)
- `GET /api/tickets` - List user's tickets (with filtering & pagination)
  - Query params: `status`, `priority`, `limit`, `offset`
- `GET /api/tickets/:id` - Get ticket details with comments & attachments
- `PATCH /api/tickets/:id` - Update ticket (clients can only edit description & reproduction steps)
- `POST /api/tickets/:id/comments` - Add comment to ticket
- `GET /api/tickets/:id/activities` - Get audit trail of ticket changes

### Health

- `GET /api/health` - Check API status

## Authentication

All authenticated endpoints require:

```
Authorization: Bearer <jwt-token>
```

Token is returned from `/api/auth/register` or `/api/auth/login`.

## Error Handling

All API responses follow this format:

**Success** (2xx):

```json
{
  "data": {/* response data */}
  // OR specific response structure per endpoint
}
```

**Error** (4xx, 5xx):

```json
{
  "error": "Error message",
  "details": {/* validation details if applicable */},
  "statusCode": 400
}
```

## Testing

See `TESTING.md` for detailed testing instructions with curl/Postman examples.

Quick test:

```bash
curl http://localhost:3000/api/health
```

## Roadmap (Phases 3-8)

**Phase 3: Automation & SLA**

- Rules engine (auto-assign, priority changes based on conditions)
- SLA tracking & breach detection
- Admin endpoints for rule/policy management

**Phase 4: Knowledge Base**

- Full-text search articles
- Admin CRUD for articles
- Optional KB suggestions on ticket creation

**Phase 5: Notifications**

- Email (SendGrid/SES)
- In-app notifications with user preferences
- Optional Slack/Teams webhooks

**Phase 6: Reporting**

- Admin dashboards: volume, resolution time, agent performance, SLA
- Date filters & CSV export
- Metrics service with Redis caching

**Phase 7: Real-time**

- WebSocket for live updates
- Event broadcasting with Redis Pub/Sub

**Phase 8: Security & Polish**

- Rate limiting, CORS, secure headers
- Unit/integration tests
- Structured logging
- Structured logging (Winston/Pino)
- Performance optimization (query logging, Redis caching)

See `plan.md` for full details.

## Activity Logging

All ticket changes are automatically logged to `ticket_activities`:

- Ticket creation
- Status changes
- Assignments
- Comments added
- Attachment uploads

Retrieve activity via: `GET /api/tickets/:id/activities`

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

→ Ensure PostgreSQL is running and DATABASE_URL is correct

### Migration Error

```
Error: column does not exist
```

→ Run `npm run db:drop` then `npm run db:generate` and `npm run db:migrate` again (⚠️ loses data)

### JWT Secret Error

```
Error: JWT_SECRET is not set
```

→ Add JWT_SECRET to .env.local

## Dependencies

- **next**: 16.3.1 - React framework
- **drizzle-orm**: PostgreSQL ORM
- **drizzle-kit**: Migration tool
- **pg**: PostgreSQL driver
- **jsonwebtoken**: JWT auth
- **bcryptjs**: Password hashing
- **zod**: Runtime schema validation
- **@aws-sdk/client-s3**: S3 client (for future file uploads)

## Contact & Docs

- Full Plan: `plan.md`
- Testing Guide: `TESTING.md`
- Drizzle Docs: https://orm.drizzle.team
- Next.js Docs: https://nextjs.org/docs
