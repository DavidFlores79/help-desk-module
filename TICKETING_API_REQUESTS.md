# Ticketing API - Request Examples with JSON

This document provides explicit JSON request bodies for every endpoint in the Ticketing Module.

## Base URL
- **Development:** `http://bitacora-mantenimiento.test.com/api`
- **Production:** `https://bitacoraenf.enlacetecnologias.mx/api`

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Note:** Auth endpoints are at `/api/login` and `/api/register`. 
Ticket endpoints are at `/api/v1/tickets`.

---

## 1. List Tickets
**Endpoint:** `GET /v1/tickets`

**Query Parameters (all optional):**
```
?status=open&priority=high&assigned_to=3
```

**Available Filters:**
- `status`: open, assigned, in_progress, awaiting_user, resolved, closed
- `priority`: low, medium, high, urgent
- `assigned_to`: User ID (integer)

**No Request Body Required**

**Example Request:**
```bash
curl -X GET "http://bitacora-mantenimiento.test.com/api/v1/tickets?status=open&priority=high" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Response Example:**
```json
{
  "success": true,
  "message": "Tickets retrieved successfully",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "user_id": 2,
        "item_id": 5,
        "category_id": 3,
        "assigned_to": null,
        "title": "Printer not working",
        "description": "The office printer is not responding",
        "status": "open",
        "priority": "high",
        "status_label": "Abierto",
        "priority_label": "Alta",
        "last_response_at": null,
        "due_at": null,
        "reopens": 0,
        "created_at": "2025-10-11T12:00:00.000000Z",
        "updated_at": "2025-10-11T12:00:00.000000Z",
        "deleted_at": null,
        "user": {
          "id": 2,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "item": {
          "id": 5,
          "name": "HP LaserJet Pro",
          "code": "PRINT-001"
        },
        "category": {
          "id": 3,
          "name": "Impresoras"
        },
        "assignedTo": null
      }
    ],
    "total": 1,
    "per_page": 15,
    "last_page": 1
  }
}
```

---

## 2. Create Ticket (Minimal)
**Endpoint:** `POST /tickets`

**Required Fields:**
- `title` (string, max 255)
- `description` (text)

**Request Body:**
```json
{
  "title": "Computer screen is flickering",
  "description": "My computer monitor has been flickering constantly for the past hour. It's making it difficult to work."
}
```

**cURL Example:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Computer screen is flickering",
    "description": "My computer monitor has been flickering constantly for the past hour. It'\''s making it difficult to work."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "id": 1,
    "user_id": 2,
    "item_id": null,
    "category_id": null,
    "assigned_to": null,
    "title": "Computer screen is flickering",
    "description": "My computer monitor has been flickering constantly for the past hour. It's making it difficult to work.",
    "status": "open",
    "priority": "medium",
    "status_label": "Abierto",
    "priority_label": "Media",
    "last_response_at": null,
    "due_at": null,
    "reopens": 0,
    "created_at": "2025-10-11T12:05:00.000000Z",
    "updated_at": "2025-10-11T12:05:00.000000Z",
    "user": { ... },
    "item": null,
    "category": null,
    "attachments": []
  }
}
```

---

## 3. Create Ticket (Complete)
**Endpoint:** `POST /tickets`

**All Available Fields:**
```json
{
  "title": "Laptop keyboard not working",
  "description": "Several keys on my laptop keyboard are not responding. Specifically the 'A', 'S', and 'D' keys. This started after I spilled some coffee on it yesterday.",
  "item_id": 12,
  "category_id": 2,
  "priority": "high"
}
```

**Field Options:**
- `priority`: "low" | "medium" | "high" | "urgent" (default: "medium")
- `item_id`: Integer (must exist in items table)
- `category_id`: Integer (must exist in item_categories table)

**cURL Example:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Laptop keyboard not working",
    "description": "Several keys on my laptop keyboard are not responding. Specifically the '\''A'\'', '\''S'\'', and '\''D'\'' keys. This started after I spilled some coffee on it yesterday.",
    "item_id": 12,
    "category_id": 2,
    "priority": "high"
  }'
```

---

## 4. Create Ticket with Attachments
**Endpoint:** `POST /tickets`

**Note:** When uploading files, use `multipart/form-data` instead of JSON.

**Form Data:**
```
title: "Network cable damaged"
description: "The network cable under my desk appears to be damaged. Photos attached."
priority: "medium"
category_id: 5
attachments[]: [file1.jpg]
attachments[]: [file2.jpg]
```

**cURL Example:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Network cable damaged" \
  -F "description=The network cable under my desk appears to be damaged. Photos attached." \
  -F "priority=medium" \
  -F "category_id=5" \
  -F "attachments[]=@/path/to/photo1.jpg" \
  -F "attachments[]=@/path/to/photo2.jpg"
```

**File Constraints:**
- Maximum file size: 10MB per file
- Multiple files allowed
- All file types accepted

---

## 5. Get Ticket Details
**Endpoint:** `GET /tickets/{id}`

**No Request Body Required**

**URL Example:**
```
GET /tickets/1
```

**cURL Example:**
```bash
curl -X GET http://bitacora-mantenimiento.test.com/api/v1/tickets/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket retrieved successfully",
  "data": {
    "id": 1,
    "title": "Computer screen is flickering",
    "description": "My computer monitor has been flickering constantly...",
    "status": "assigned",
    "priority": "medium",
    "status_label": "Asignado",
    "priority_label": "Media",
    "user": { ... },
    "item": { ... },
    "category": { ... },
    "assignedTo": {
      "id": 3,
      "name": "Tech Support",
      "email": "support@example.com"
    },
    "responses": [
      {
        "id": 1,
        "ticket_id": 1,
        "user_id": 2,
        "body": "I also noticed the power cable might be loose",
        "internal": false,
        "created_at": "2025-10-11T12:10:00.000000Z",
        "user": {
          "id": 2,
          "name": "John Doe"
        },
        "attachments": []
      }
    ],
    "assignments": [
      {
        "id": 1,
        "ticket_id": 1,
        "assigned_by": 1,
        "assigned_to": 3,
        "created_at": "2025-10-11T12:15:00.000000Z",
        "assignedBy": {
          "id": 1,
          "name": "Admin User"
        },
        "assignedTo": {
          "id": 3,
          "name": "Tech Support"
        }
      }
    ],
    "attachments": []
  }
}
```

---

## 6. Update Ticket (User - Basic Fields)
**Endpoint:** `PUT /tickets/{id}` or `PATCH /tickets/{id}`

**Regular users can only update:**
- `title`
- `description`
- `item_id`
- `category_id`

**Request Body:**
```json
{
  "title": "Computer screen is flickering - URGENT",
  "description": "My computer monitor has been flickering constantly for the past hour. It's making it difficult to work. UPDATE: Now the screen is completely black."
}
```

**cURL Example:**
```bash
curl -X PUT http://bitacora-mantenimiento.test.com/api/v1/tickets/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Computer screen is flickering - URGENT",
    "description": "My computer monitor has been flickering constantly for the past hour. It'\''s making it difficult to work. UPDATE: Now the screen is completely black."
  }'
```

---

## 7. Update Ticket (Admin - All Fields)
**Endpoint:** `PUT /tickets/{id}` or `PATCH /tickets/{id}`

**Admins can additionally update:**
- `status`
- `priority`

**Request Body (Update Status):**
```json
{
  "status": "in_progress"
}
```

**Request Body (Update Priority):**
```json
{
  "priority": "urgent"
}
```

**Request Body (Update Multiple Fields):**
```json
{
  "title": "Computer screen replacement needed",
  "status": "in_progress",
  "priority": "high",
  "item_id": 12,
  "category_id": 2
}
```

**Status Options:**
- `"open"`
- `"assigned"`
- `"in_progress"`
- `"awaiting_user"`
- `"resolved"`
- `"closed"`

**Priority Options:**
- `"low"`
- `"medium"`
- `"high"`
- `"urgent"`

**cURL Example:**
```bash
curl -X PUT http://bitacora-mantenimiento.test.com/api/v1/tickets/1 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "priority": "urgent"
  }'
```

---

## 8. Add Response to Ticket (User)
**Endpoint:** `POST /tickets/{id}/responses`

**Request Body:**
```json
{
  "body": "I tried restarting the computer but the issue persists. The screen is still flickering."
}
```

**cURL Example:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets/1/responses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "I tried restarting the computer but the issue persists. The screen is still flickering."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Response added successfully",
  "data": {
    "id": 2,
    "ticket_id": 1,
    "user_id": 2,
    "body": "I tried restarting the computer but the issue persists. The screen is still flickering.",
    "internal": false,
    "created_at": "2025-10-11T12:30:00.000000Z",
    "updated_at": "2025-10-11T12:30:00.000000Z",
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "attachments": []
  }
}
```

---

## 9. Add Internal Note (Admin Only)
**Endpoint:** `POST /tickets/{id}/responses`

**Request Body:**
```json
{
  "body": "Checked the monitor hardware. The backlight inverter is failing. Ordered replacement part #MON-12345. ETA 2 business days.",
  "internal": true
}
```

**Note:** Regular users cannot see internal notes. Only admins and superusers can create and view them.

**cURL Example:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets/1/responses \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Checked the monitor hardware. The backlight inverter is failing. Ordered replacement part #MON-12345. ETA 2 business days.",
    "internal": true
  }'
```

---

## 10. Add Response with Attachments
**Endpoint:** `POST /tickets/{id}/responses`

**Form Data:**
```
body: "Here are the error logs from the system"
attachments[]: [error_log.txt]
attachments[]: [screenshot.png]
```

**cURL Example:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets/1/responses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "body=Here are the error logs from the system" \
  -F "attachments[]=@/path/to/error_log.txt" \
  -F "attachments[]=@/path/to/screenshot.png"
```

---

## 11. Assign Ticket (Admin Only)
**Endpoint:** `POST /tickets/{id}/assign`

**Required Field:**
- `assigned_to` (integer, user ID)

**Request Body:**
```json
{
  "assigned_to": 3
}
```

**cURL Example:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets/1/assign \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assigned_to": 3
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket assigned successfully",
  "data": {
    "id": 1,
    "title": "Computer screen is flickering",
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
        "created_at": "2025-10-11T12:45:00.000000Z",
        "assignedBy": {
          "id": 1,
          "name": "Admin User"
        },
        "assignedTo": {
          "id": 3,
          "name": "Tech Support"
        }
      }
    ]
  }
}
```

**Behavior:**
- Creates assignment record in `ticket_assignments`
- Updates `tickets.assigned_to` field
- Changes `tickets.status` to "assigned"

---

## 12. Reassign Ticket (Admin Only)
**Endpoint:** `POST /tickets/{id}/assign`

**To reassign, simply assign to a different user:**

**Request Body:**
```json
{
  "assigned_to": 5
}
```

**cURL Example:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets/1/assign \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assigned_to": 5
  }'
```

**Note:** Each assignment is logged, so you'll have a complete history of who the ticket was assigned to.

---

## 13. Reopen Ticket
**Endpoint:** `POST /tickets/{id}/reopen`

**No Request Body Required**

**cURL Example:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/v1/tickets/1/reopen \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket reopened successfully",
  "data": {
    "id": 1,
    "title": "Computer screen is flickering",
    "status": "open",
    "status_label": "Abierto",
    "reopens": 1,
    "created_at": "2025-10-11T12:00:00.000000Z",
    "updated_at": "2025-10-11T13:00:00.000000Z"
  }
}
```

**Conditions:**
- Can only reopen tickets with status "resolved" or "closed"
- Increments the `reopens` counter
- Changes status back to "open"

**Permissions:**
- Regular users: Can reopen their own tickets
- Admins: Can reopen any ticket

---

## 14. Delete Ticket (Soft Delete)
**Endpoint:** `DELETE /tickets/{id}`

**No Request Body Required**

**cURL Example:**
```bash
curl -X DELETE http://bitacora-mantenimiento.test.com/api/v1/tickets/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket deleted successfully",
  "data": null
}
```

**Permissions:**
- Regular users: Can delete their own tickets
- Admins: Can delete any ticket

**Note:** This is a soft delete. The ticket is not permanently removed from the database, just marked as deleted.

---

## Complete Workflow Example

### Step 1: User Creates Ticket
```json
POST /tickets
{
  "title": "Mouse not working",
  "description": "My wireless mouse stopped responding this morning",
  "priority": "medium",
  "category_id": 4
}
```

### Step 2: User Adds More Information
```json
POST /tickets/1/responses
{
  "body": "I've tried changing the batteries but it still doesn't work"
}
```

### Step 3: Admin Assigns Ticket
```json
POST /tickets/1/assign
{
  "assigned_to": 3
}
```

### Step 4: Admin Updates Status
```json
PUT /tickets/1
{
  "status": "in_progress"
}
```

### Step 5: Technician Adds Internal Note
```json
POST /tickets/1/responses
{
  "body": "USB receiver is damaged. Requesting new mouse from inventory.",
  "internal": true
}
```

### Step 6: Technician Responds to User
```json
POST /tickets/1/responses
{
  "body": "We've identified the issue. A replacement mouse will be delivered to your desk within the hour."
}
```

### Step 7: Admin Resolves Ticket
```json
PUT /tickets/1
{
  "status": "resolved"
}
```

### Step 8: User Confirms (or Reopens if Issue Persists)
```json
POST /tickets/1/reopen
```

### Step 9: Admin Closes Ticket
```json
PUT /tickets/1
{
  "status": "closed"
}
```

---

## Error Response Examples

### 401 Unauthorized (No token)
```json
{
  "message": "Unauthenticated."
}
```

### 403 Forbidden (Insufficient permissions)
```json
{
  "success": false,
  "message": "Unauthorized access",
  "errors": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Error retrieving ticket",
  "errors": null
}
```

### 422 Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "title": ["The title field is required."],
    "description": ["The description field is required."],
    "priority": ["The selected priority is invalid."]
  }
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Error creating ticket",
  "errors": null
}
```

---

## Tips for Testing

1. **Get Auth Token First:**
```bash
curl -X POST http://bitacora-mantenimiento.test.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

2. **Save Token to Environment Variable:**
```bash
export TOKEN="your_token_here"
```

3. **Use Token in Requests:**
```bash
curl -H "Authorization: Bearer $TOKEN" ...
```

4. **Test with Postman:**
- Import collection
- Set `{{base_url}}` variable
- Set `{{token}}` variable
- Run tests

5. **Check Swagger Documentation:**
```
http://bitacora-mantenimiento.test.com/api/documentation
```

---

## Quick Reference: Required Fields Summary

| Endpoint | Required Fields | Optional Fields |
|----------|----------------|-----------------|
| Create Ticket | title, description | item_id, category_id, priority, attachments[] |
| Update Ticket | (none - at least one field) | title, description, item_id, category_id, status*, priority* |
| Add Response | body | internal*, attachments[] |
| Assign Ticket | assigned_to | (none) |
| Reopen Ticket | (none) | (none) |

*Admin only

---

## Postman Collection Variables

```json
{
  "base_url": "http://bitacora-mantenimiento.test.com/api/v1",
  "token": "YOUR_TOKEN_HERE",
  "user_id": "2",
  "admin_user_id": "1",
  "ticket_id": "1"
}
```

Use these in Postman as `{{base_url}}`, `{{token}}`, etc.
