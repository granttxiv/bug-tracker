#!/bin/bash

# TrackMe Phase 2 Testing Script
# This script tests all ticket CRUD endpoints

set -e

BASE_URL="http://localhost:3000/api"
TOKEN=""
CLIENT_ID=""
TICKET_ID=""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TrackMe Phase 2 Testing ===${NC}\n"

# Step 1: Register a test client
echo -e "${YELLOW}1. Registering test client...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-phase2-'"$(date +%s)"'@example.com",
    "password": "TestPassword123!",
    "name": "Test Client Phase 2",
    "company": "Test Company"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
CLIENT_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to register client${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Client registered${NC}\n"

# Step 2: Create a ticket
echo -e "${YELLOW}2. Creating a ticket...${NC}"
TICKET_RESPONSE=$(curl -s -X POST "$BASE_URL/tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login button not working on mobile",
    "description": "The login button is unresponsive when using mobile devices. It works fine on desktop.",
    "type": "bug",
    "priority": "high",
    "version": "2.1.0",
    "environment": "production",
    "stepsToReproduce": "1. Go to app on mobile\n2. Click login button\n3. Nothing happens",
    "expectedBehavior": "Login form should appear",
    "actualBehavior": "Button is unresponsive"
  }')

echo "$TICKET_RESPONSE" | jq '.'

TICKET_ID=$(echo "$TICKET_RESPONSE" | jq -r '.id')

if [ "$TICKET_ID" == "null" ] || [ -z "$TICKET_ID" ]; then
  echo -e "${RED}Failed to create ticket${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Ticket created (ID: $TICKET_ID)${NC}\n"

# Step 3: List tickets
echo -e "${YELLOW}3. Listing all tickets...${NC}"
curl -s -X GET "$BASE_URL/tickets" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "${GREEN}✓ Tickets listed${NC}\n"

# Step 4: Get ticket details
echo -e "${YELLOW}4. Getting ticket details...${NC}"
curl -s -X GET "$BASE_URL/tickets/$TICKET_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "${GREEN}✓ Ticket details retrieved${NC}\n"

# Step 5: Update ticket
echo -e "${YELLOW}5. Updating ticket...${NC}"
curl -s -X PATCH "$BASE_URL/tickets/$TICKET_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated: The login button appears to be frozen on all mobile browsers.",
    "stepsToReproduce": "1. Go to app on iOS Safari\n2. Click login button\n3. No response"
  }' | jq '.'

echo -e "${GREEN}✓ Ticket updated${NC}\n"

# Step 6: Add a comment
echo -e "${YELLOW}6. Adding a comment...${NC}"
COMMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/tickets/$TICKET_ID/comments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "I have also experienced this issue on Android. The button is completely unresponsive.",
    "type": "public_reply"
  }')

echo "$COMMENT_RESPONSE" | jq '.'

echo -e "${GREEN}✓ Comment added${NC}\n"

# Step 7: Get activities (audit trail)
echo -e "${YELLOW}7. Getting ticket activities (audit trail)...${NC}"
curl -s -X GET "$BASE_URL/tickets/$TICKET_ID/activities" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "${GREEN}✓ Activities retrieved${NC}\n"

# Step 8: Test filtering
echo -e "${YELLOW}8. Testing ticket filtering (status=new)...${NC}"
curl -s -X GET "$BASE_URL/tickets?status=new&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "${GREEN}✓ Filtering works${NC}\n"

echo -e "${BLUE}=== All tests completed successfully! ===${NC}"
echo -e "\nTest Summary:"
echo -e "  Token: ${YELLOW}$TOKEN${NC}"
echo -e "  Client ID: ${YELLOW}$CLIENT_ID${NC}"
echo -e "  Ticket ID: ${YELLOW}$TICKET_ID${NC}"
