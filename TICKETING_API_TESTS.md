# Ticketing API Tests

This document provides test cases for the Ticketing Module API endpoints.

## Prerequisites

1. Set up authentication token:
```bash
# Login to get a token
curl -X POST http://bitacora-mantenimiento.test.com/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'

# Save the token from response
export TOKEN="your_token_here"
```

## Test Cases

### 1. Create a Ticket (Regular User)

**Request:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Computer not booting",
    "description": "My workstation computer does not turn on. I have checked the power cable and it is properly connected.",
    "priority": "high",
    "item_id": 1,
    "category_id": 1
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "id": 1,
    "user_id": 2,
    "item_id": 1,
    "category_id": 1,
    "assigned_to": null,
    "title": "Computer not booting",
    "description": "My workstation computer does not turn on...",
    "status": "open",
    "priority": "high",
    "status_label": "Abierto",
    "priority_label": "Alta",
    "last_response_at": null,
    "due_at": null,
    "reopens": 0,
    "created_at": "2025-10-11T10:30:00.000000Z",
    "updated_at": "2025-10-11T10:30:00.000000Z",
    "user": { ... },
    "item": { ... },
    "category": { ... },
    "attachments": []
  }
}
```

### 2. Create Ticket with Attachments

**Request:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Printer paper jam" \
  -F "description=The printer has a paper jam in tray 2" \
  -F "priority=medium" \
  -F "category_id=3" \
  -F "attachments[]=@/path/to/photo1.jpg" \
  -F "attachments[]=@/path/to/photo2.jpg"
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "id": 2,
    "title": "Printer paper jam",
    "description": "The printer has a paper jam in tray 2",
    "status": "open",
    "priority": "medium",
    "attachments": [
      {
        "id": 1,
        "ticket_id": 2,
        "filename": "photo1.jpg",
        "path": "tickets/2/xyz.jpg",
        "mime": "image/jpeg",
        "size": 245678,
        "url": "/storage/tickets/2/xyz.jpg",
        "created_at": "2025-10-11T10:35:00.000000Z"
      },
      {
        "id": 2,
        "ticket_id": 2,
        "filename": "photo2.jpg",
        "path": "tickets/2/abc.jpg",
        "mime": "image/jpeg",
        "size": 198234,
        "url": "/storage/tickets/2/abc.jpg",
        "created_at": "2025-10-11T10:35:00.000000Z"
      }
    ]
  }
}
```

### 3. List All Tickets (User sees only their tickets)

**Request:**
```bash
curl -X GET http://bitacora-mantenimiento.test.com/api/v1/tickets \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Tickets retrieved successfully",
  "data": {
    "current_page": 1,
    "data": [
      { "id": 2, "title": "Printer paper jam", ... },
      { "id": 1, "title": "Computer not booting", ... }
    ],
    "total": 2,
    "per_page": 15
  }
}
```

### 4. List Tickets with Filters (Admin)

**Request:**
```bash
# Filter by status
curl -X GET "http://bitacora-mantenimiento.test.com/api/v1/tickets?status=open" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Filter by priority
curl -X GET "http://bitacora-mantenimiento.test.com/api/v1/tickets?priority=high" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Filter by assigned user
curl -X GET "http://bitacora-mantenimiento.test.com/api/v1/tickets?assigned_to=3" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Combined filters
curl -X GET "http://bitacora-mantenimiento.test.com/api/v1/tickets?status=in_progress&priority=urgent" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 5. Get Ticket Details

**Request:**
```bash
curl -X GET http://bitacora-mantenimiento.test.com/api/v1/tickets/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Ticket retrieved successfully",
  "data": {
    "id": 1,
    "title": "Computer not booting",
    "description": "My workstation computer does not turn on...",
    "status": "open",
    "priority": "high",
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "item": { ... },
    "category": { ... },
    "assignedTo": null,
    "responses": [],
    "assignments": [],
    "attachments": [],
    "created_at": "2025-10-11T10:30:00.000000Z"
  }
}
```

### 6. Update Ticket (User)

**Request:**
```bash
curl -X PUT http://bitacora-mantenimiento.test.com/api/v1/tickets/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Computer not booting - Urgent",
    "description": "My workstation computer does not turn on. I have an important presentation today!"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Ticket updated successfully",
  "data": {
    "id": 1,
    "title": "Computer not booting - Urgent",
    "description": "My workstation computer does not turn on. I have an important presentation today!",
    "status": "open",
    "priority": "high"
  }
}
```

### 7. Add Response to Ticket

**Request:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets/1/responses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "I also noticed that the monitor light is blinking amber."
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Response added successfully",
  "data": {
    "id": 1,
    "ticket_id": 1,
    "user_id": 2,
    "body": "I also noticed that the monitor light is blinking amber.",
    "internal": false,
    "created_at": "2025-10-11T11:00:00.000000Z",
    "user": {
      "id": 2,
      "name": "John Doe"
    },
    "attachments": []
  }
}
```

### 8. Add Response with Attachments

**Request:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets/1/responses \
  -H "Authorization: Bearer $TOKEN" \
  -F "body=Here is a photo showing the error message" \
  -F "attachments[]=@/path/to/error_screenshot.png"
```

### 9. Assign Ticket (Admin Only)

**Request:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets/1/assign \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assigned_to": 3
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Ticket assigned successfully",
  "data": {
    "id": 1,
    "title": "Computer not booting - Urgent",
    "status": "assigned",
    "assigned_to": 3,
    "assignedTo": {
      "id": 3,
      "name": "Tech Support",
      "email": "support@example.com"
    },
    "assignments": [
      {
        "id": 1,
        "ticket_id": 1,
        "assigned_by": 1,
        "assigned_to": 3,
        "assignedBy": {
          "id": 1,
          "name": "Admin User"
        },
        "assignedTo": {
          "id": 3,
          "name": "Tech Support"
        },
        "created_at": "2025-10-11T11:15:00.000000Z"
      }
    ]
  }
}
```

### 10. Update Ticket Status (Admin Only)

**Request:**
```bash
curl -X PUT http://bitacora-mantenimiento.test.com/api/v1/tickets/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Ticket updated successfully",
  "data": {
    "id": 1,
    "status": "in_progress",
    "status_label": "En Progreso"
  }
}
```

### 11. Add Internal Note (Admin Only)

**Request:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets/1/responses \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Checked the hardware. Motherboard needs replacement. Ordering part #12345.",
    "internal": true
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Response added successfully",
  "data": {
    "id": 2,
    "ticket_id": 1,
    "user_id": 1,
    "body": "Checked the hardware. Motherboard needs replacement. Ordering part #12345.",
    "internal": true,
    "created_at": "2025-10-11T11:30:00.000000Z",
    "user": {
      "id": 1,
      "name": "Admin User"
    }
  }
}
```

### 12. Resolve Ticket (Admin)

**Request:**
```bash
curl -X PUT http://bitacora-mantenimiento.test.com/api/v1/tickets/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Ticket updated successfully",
  "data": {
    "id": 1,
    "status": "resolved",
    "status_label": "Resuelto"
  }
}
```

### 13. Reopen Ticket

**Request:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets/1/reopen \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Ticket reopened successfully",
  "data": {
    "id": 1,
    "status": "open",
    "status_label": "Abierto",
    "reopens": 1
  }
}
```

### 14. Close Ticket (Admin)

**Request:**
```bash
curl -X PUT http://bitacora-mantenimiento.test.com/api/v1/tickets/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "closed"
  }'
```

### 15. Delete Ticket

**Request:**
```bash
curl -X DELETE http://bitacora-mantenimiento.test.com/api/v1/tickets/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Ticket deleted successfully",
  "data": null
}
```

## Error Cases

### 1. Unauthorized Access (Regular user trying to access another user's ticket)

**Request:**
```bash
curl -X GET http://bitacora-mantenimiento.test.com/api/v1/tickets/999 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Unauthorized access",
  "errors": null
}
```

### 2. Validation Error (Missing required fields)

**Request:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test"
  }'
```

**Expected Response (422 Unprocessable Entity):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "description": ["The description field is required."]
  }
}
```

### 3. Regular User Trying to Assign Ticket

**Request:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets/1/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assigned_to": 3
  }'
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Only admins can assign tickets",
  "errors": null
}
```

### 4. Trying to Reopen Non-closed Ticket

**Request:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets/1/reopen \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Only resolved or closed tickets can be reopened",
  "errors": null
}
```

### 5. Ticket Not Found

**Request:**
```bash
curl -X GET http://bitacora-mantenimiento.test.com/api/v1/tickets/9999 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Error retrieving ticket",
  "errors": null
}
```

## Testing with Postman

Import the following collection to test all endpoints:

1. Import the Postman collection from `bitacoracore/POSTMAN_COLLECTION.json`
2. Create an environment variable `base_url` = `http://bitacora-mantenimiento.test.com`
3. Create an environment variable `token` with your authentication token
4. Run the collection tests

## Database Verification

After creating tickets, verify the data in the database:

```sql
-- Check tickets
SELECT * FROM tickets ORDER BY created_at DESC LIMIT 10;

-- Check ticket responses
SELECT tr.*, u.name as user_name 
FROM ticket_responses tr 
JOIN users u ON tr.user_id = u.id 
ORDER BY tr.created_at DESC;

-- Check ticket assignments
SELECT ta.*, 
       u1.name as assigned_by_name, 
       u2.name as assigned_to_name
FROM ticket_assignments ta
LEFT JOIN users u1 ON ta.assigned_by = u1.id
LEFT JOIN users u2 ON ta.assigned_to = u2.id
ORDER BY ta.created_at DESC;

-- Check attachments
SELECT * FROM ticket_attachments ORDER BY created_at DESC;

-- Get ticket with all related data
SELECT 
    t.id,
    t.title,
    t.status,
    t.priority,
    u.name as creator,
    a.name as assigned_to,
    COUNT(DISTINCT tr.id) as responses_count,
    COUNT(DISTINCT ta.id) as attachments_count
FROM tickets t
LEFT JOIN users u ON t.user_id = u.id
LEFT JOIN users a ON t.assigned_to = a.id
LEFT JOIN ticket_responses tr ON t.id = tr.ticket_id
LEFT JOIN ticket_attachments ta ON t.id = ta.ticket_id
GROUP BY t.id
ORDER BY t.created_at DESC;
```
