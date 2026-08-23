# TrackMe API Testing Guide

## Phase 1: Auth Testing

Use Postman, curl, or any HTTP client to test these endpoints.

### 1. Register a New Client

**Endpoint**: `POST http://localhost:3000/api/auth/register`

**Request Body**:

```json
{
  "email": "client@example.com",
  "password": "password123",
  "name": "John Client",
  "company": "Acme Corp"
}
```

**Expected Response** (201):

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "email": "client@example.com",
    "name": "John Client",
    "role": "client"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Login

**Endpoint**: `POST http://localhost:3000/api/auth/login`

**Request Body**:

```json
{
  "email": "client@example.com",
  "password": "password123"
}
```

**Expected Response** (200):

```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "client@example.com",
    "name": "John Client",
    "role": "client"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Get Current User (Authenticated)

**Endpoint**: `GET http://localhost:3000/api/auth/me`

**Headers**:

```
Authorization: Bearer <token-from-login>
```

**Expected Response** (200):

```json
{
  "user": {
    "id": "uuid-here",
    "email": "client@example.com",
    "name": "John Client",
    "role": "client",
    "company": "Acme Corp"
  }
}
```

---

### 4. Logout

**Endpoint**: `POST http://localhost:3000/api/auth/logout`

**Headers**:

```
Authorization: Bearer <token-from-login>
```

**Expected Response** (200):

```json
{
  "message": "Logout successful"
}
```

---

### 5. Health Check

**Endpoint**: `GET http://localhost:3000/api/health`

**Expected Response** (200):

```json
{
  "status": "ok",
  "message": "TrackMe backend is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Handling

### Missing Token

```
GET /api/auth/me (without Authorization header)
→ 401 { "error": "Unauthorized: Missing or invalid token" }
```

### Invalid Token

```
GET /api/auth/me (with expired/malformed token)
→ 401 { "error": "Unauthorized: Invalid or expired token" }
```

### Validation Errors

```
POST /api/auth/register with email="invalid"
→ 400 { "error": "Validation failed", "details": [...] }
```

### User Already Exists

```
POST /api/auth/register with existing email
→ 400 { "error": "User with this email already exists" }
```

---

## Curl Examples

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "company": "Test Corp"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Me (replace TOKEN with actual token)

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Health Check

```bash
curl -X GET http://localhost:3000/api/health
```

---

## Database Verification

After registering a user, verify in PostgreSQL:

```sql
SELECT * FROM users;
SELECT * FROM user_sessions;
```

You should see the new user with hashed password (not plain text).

---

## Next: Phase 2 Testing

Once Phase 2 (Ticket CRUD) is complete, we'll add tests for:

- POST /api/tickets
- GET /api/tickets
- PATCH /api/tickets/:id
- Attachments
- Activity audit log
