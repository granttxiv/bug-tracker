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

---

## Phase 2: Ticket CRUD Testing

### Prerequisites

1. Register a client user (see Phase 1 above)
2. Save the JWT token from registration/login
3. Note the client's user ID from the response

### 1. Create a Ticket

**Endpoint**: `POST http://localhost:3000/api/tickets`

**Headers**:

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "title": "Login button not working on mobile",
  "description": "The login button is unresponsive when using mobile devices. It works fine on desktop.",
  "type": "bug",
  "priority": "high",
  "version": "2.1.0",
  "environment": "production",
  "stepsToReproduce": "1. Go to app on mobile\n2. Click login button\n3. Nothing happens",
  "expectedBehavior": "Login form should appear",
  "actualBehavior": "Button is unresponsive"
}
```

**Expected Response** (201):

```json
{
  "id": "uuid-here",
  "clientId": "uuid-of-logged-in-user",
  "title": "Login button not working on mobile",
  "description": "The login button is unresponsive...",
  "type": "bug",
  "priority": "high",
  "status": "new",
  "version": "2.1.0",
  "environment": "production",
  "stepsToReproduce": "1. Go to app on mobile...",
  "expectedBehavior": "Login form should appear",
  "actualBehavior": "Button is unresponsive",
  "assignedTo": null,
  "resolvedAt": null,
  "closedAt": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Save the ticket ID** for next tests.

---

### 2. List All Tickets for Client

**Endpoint**: `GET http://localhost:3000/api/tickets`

**Headers**:

```
Authorization: Bearer <your-jwt-token>
```

**Optional Query Parameters**:

```
?status=new&priority=high&limit=20&offset=0
```

**Expected Response** (200):

```json
{
  "tickets": [
    {
      "id": "ticket-uuid",
      "clientId": "uuid-of-logged-in-user",
      "title": "Login button not working on mobile",
      "status": "new",
      "priority": "high",
      "createdAt": "2024-01-15T10:30:00.000Z",
      ...
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

---

### 3. Get Ticket Details

**Endpoint**: `GET http://localhost:3000/api/tickets/{ticket-id}`

**Headers**:

```
Authorization: Bearer <your-jwt-token>
```

**Expected Response** (200):

```json
{
  "id": "ticket-uuid",
  "clientId": "uuid-of-logged-in-user",
  "title": "Login button not working on mobile",
  "description": "The login button is unresponsive...",
  "type": "bug",
  "priority": "high",
  "status": "new",
  "version": "2.1.0",
  "environment": "production",
  "stepsToReproduce": "1. Go to app on mobile...",
  "expectedBehavior": "Login form should appear",
  "actualBehavior": "Button is unresponsive",
  "assignedTo": null,
  "resolvedAt": null,
  "closedAt": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "comments": [],
  "attachments": [],
  "assignedUser": null
}
```

---

### 4. Update Ticket (Client can only update description & steps)

**Endpoint**: `PATCH http://localhost:3000/api/tickets/{ticket-id}`

**Headers**:

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "description": "Updated: The login button appears to be frozen on all mobile browsers.",
  "stepsToReproduce": "1. Go to app on iOS Safari\n2. Click login button\n3. No response"
}
```

**Expected Response** (200):

```json
{
  "id": "ticket-uuid",
  "description": "Updated: The login button appears to be frozen on all mobile browsers.",
  "stepsToReproduce": "1. Go to app on iOS Safari...",
  "updatedAt": "2024-01-15T10:35:00.000Z",
  ...
}
```

---

### 5. Add Comment to Ticket

**Endpoint**: `POST http://localhost:3000/api/tickets/{ticket-id}/comments`

**Headers**:

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "body": "I've also experienced this issue on Android. The button is completely unresponsive.",
  "type": "public_reply"
}
```

**Expected Response** (201):

```json
{
  "id": "comment-uuid",
  "ticketId": "ticket-uuid",
  "userId": "uuid-of-logged-in-user",
  "body": "I've also experienced this issue on Android...",
  "type": "public_reply",
  "createdAt": "2024-01-15T10:40:00.000Z",
  "updatedAt": "2024-01-15T10:40:00.000Z"
}
```

---

### 6. Get Ticket Activities (Audit Trail)

**Endpoint**: `GET http://localhost:3000/api/tickets/{ticket-id}/activities`

**Headers**:

```
Authorization: Bearer <your-jwt-token>
```

**Expected Response** (200):

```json
[
  {
    "id": "activity-uuid-3",
    "ticketId": "ticket-uuid",
    "userId": "uuid-of-logged-in-user",
    "action": "commented",
    "oldValue": null,
    "newValue": {
      "commentType": "public_reply",
      "commentId": "comment-uuid"
    },
    "createdAt": "2024-01-15T10:40:00.000Z"
  },
  {
    "id": "activity-uuid-2",
    "ticketId": "ticket-uuid",
    "userId": "uuid-of-logged-in-user",
    "action": "status_changed",
    "oldValue": {
      "description": "The login button is unresponsive...",
      "stepsToReproduce": "1. Go to app on mobile\n2. Click login button\n3. Nothing happens"
    },
    "newValue": {
      "description": "Updated: The login button appears to be frozen on all mobile browsers.",
      "stepsToReproduce": "1. Go to app on iOS Safari..."
    },
    "createdAt": "2024-01-15T10:35:00.000Z"
  },
  {
    "id": "activity-uuid-1",
    "ticketId": "ticket-uuid",
    "userId": "uuid-of-logged-in-user",
    "action": "created",
    "oldValue": null,
    "newValue": {
      "title": "Login button not working on mobile",
      "status": "new",
      "priority": "high"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

## Error Scenarios

### Unauthorized Access (Client tries to view another client's ticket)

```
GET /api/tickets/{other-clients-ticket-id}
→ 403 { "error": "You don't have access to this ticket" }
```

### Ticket Not Found

```
GET /api/tickets/invalid-uuid
→ 404 { "error": "Ticket not found" }
```

### Invalid Input (Missing required fields)

```
POST /api/tickets with missing "title"
→ 400 { "error": "Invalid input", "details": [...] }
```

### Validation Errors

```
POST /api/tickets with title="short"
→ 400 { "error": "Invalid input", "details": [{ "path": ["title"], "message": "String must contain at least 5 character(s)" }] }
```

---

## Curl Examples (Phase 2)

### Create Ticket

```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login button not working",
    "description": "The login button is unresponsive on mobile devices.",
    "type": "bug",
    "priority": "high",
    "version": "2.1.0",
    "environment": "production"
  }'
```

### List Tickets

```bash
curl -X GET "http://localhost:3000/api/tickets?status=new&limit=10" \
  -H "Authorization: Bearer TOKEN"
```

### Get Ticket Details

```bash
curl -X GET http://localhost:3000/api/tickets/TICKET_ID \
  -H "Authorization: Bearer TOKEN"
```

### Update Ticket

```bash
curl -X PATCH http://localhost:3000/api/tickets/TICKET_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description here",
    "stepsToReproduce": "Updated steps here"
  }'
```

### Add Comment

```bash
curl -X POST http://localhost:3000/api/tickets/TICKET_ID/comments \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "This is my comment",
    "type": "public_reply"
  }'
```

### Get Activities

```bash
curl -X GET http://localhost:3000/api/tickets/TICKET_ID/activities \
  -H "Authorization: Bearer TOKEN"
```

---

## Database Verification (Phase 2)

After testing, verify data in PostgreSQL:

```sql
-- View all tickets
SELECT * FROM tickets;

-- View comments for a ticket
SELECT * FROM ticket_comments WHERE ticket_id = 'your-ticket-uuid';

-- View activity log for a ticket
SELECT * FROM ticket_activities WHERE ticket_id = 'your-ticket-uuid' ORDER BY created_at DESC;

-- View all users
SELECT id, email, name, role FROM users;
```

---

## Next Steps

- Phase 2.3: S3/MinIO file attachments (stubbed, not yet implemented)
- Phase 3: Agent dashboard (view all tickets, assign, change status)
- Phase
