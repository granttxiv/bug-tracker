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

The schema includes (Phase 1):

- **users**: User accounts (admin, agent, client)
- **user_sessions**: JWT session tracking

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
│   │   └── health/            # Health check endpoint
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── db/
│   │   ├── client.ts          # Database connection
│   │   └── schema.ts          # Drizzle schema
│   ├── auth/
│   │   ├── password.ts        # Password hashing/verification
│   │   ├── jwt.ts             # JWT token generation/verification
│   │   └── middleware.ts      # Auth middleware for endpoints
│   └── types/                 # Type definitions
├── drizzle/                   # Generated migrations
├── .env.local                 # Environment variables
├── drizzle.config.ts          # Drizzle configuration
├── tsconfig.json
├── package.json
├── BACKEND_SETUP.md          # This file
└── TESTING.md                # Testing guide

```

## API Endpoints (Phase 1)

### Auth

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout (client-side token deletion)

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

## Next Steps

- Phase 2: Ticket CRUD, comments, attachments
- Phase 3: Agent dashboard
- Phase 4: Automation & SLA
- ... (see plan.md for full roadmap)

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

## Contact & Docs

- Full Plan: `plan.md`
- Testing Guide: `TESTING.md`
- Drizzle Docs: https://orm.drizzle.team
- Next.js Docs: https://nextjs.org/docs
