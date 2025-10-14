# Ticket Categories Refactor

## Overview
This document describes the refactoring of the ticketing system to use dedicated ticket categories instead of item categories, and to add optional assignment relationships.

## Changes Made

### Database Structure

#### 1. New Table: `ticket_categories`
```sql
- id (bigint, primary key)
- name (varchar)
- description (varchar, nullable)
- active (boolean, default: true)
- created_at (timestamp)
- updated_at (timestamp)
- deleted_at (timestamp, nullable)
```

#### 2. Updated Table: `tickets`
**Removed fields:**
- `item_id` - Tickets are no longer directly related to items
- `category_id` - No longer using item_categories

**Added fields:**
- `ticket_category_id` (bigint, foreign key to ticket_categories, nullable)
- `assignment_id` (bigint, foreign key to assignments, nullable)

### Initial Ticket Categories
The system includes five predefined ticket categories:
1. **Internet** - Problemas relacionados con conectividad a internet
2. **Correo** - Problemas relacionados con correo electrónico
3. **UADY Virtual** - Problemas relacionados con la plataforma UADY Virtual
4. **Telefonía** - Problemas relacionados con telefonía
5. **Soporte Técnico** - Soporte técnico general

### Models

#### TicketCategory Model
- **Location:** `app/Models/TicketCategory.php`
- **Fillable:** name, description, active
- **Relationships:**
  - `tickets()` - hasMany relationship with Ticket model
- **Scopes:**
  - `active()` - Filter only active categories

#### Updated Ticket Model
- **Updated Fillable:** Removed `item_id`, `category_id`; Added `ticket_category_id`, `assignment_id`
- **Updated Relationships:**
  - Removed: `item()`, `category()`
  - Added: `ticketCategory()`, `assignment()`

### Controllers

#### TicketCategoryController
- **Location:** `app/Http/Controllers/Api/V1/TicketCategoryController.php`
- **Endpoints:**
  - `GET /api/v1/ticket-categories` - List all ticket categories (with optional active_only filter)
  - `POST /api/v1/ticket-categories` - Create new category (admin only)
  - `GET /api/v1/ticket-categories/{id}` - Get category details
  - `PUT /api/v1/ticket-categories/{id}` - Update category (admin only)
  - `DELETE /api/v1/ticket-categories/{id}` - Soft delete category (admin only)

#### Updated TicketController
- Updated to use `ticket_category_id` instead of `category_id`
- Added support for `assignment_id` field
- Updated validation rules
- Updated eager loading to include `ticketCategory` and `assignment` relationships

### API Routes
Added to `routes/api.php`:
```php
Route::apiResource('ticket-categories', App\Http\Controllers\Api\V1\TicketCategoryController::class);
```

### Migrations
1. **2025_10_13_205808_create_ticket_categories_table.php**
   - Creates the ticket_categories table

2. **2025_10_13_205919_update_tickets_table_for_ticket_categories.php**
   - Drops foreign keys and columns: `item_id`, `category_id`
   - Adds `ticket_category_id` foreign key

3. **2025_10_13_210736_add_assignment_id_to_tickets_table.php**
   - Adds `assignment_id` foreign key to tickets table

### Seeder
**TicketCategoriesSeeder** - Seeds the initial five ticket categories

## Relationships

### Tickets can now be related to:
1. **User** (required) - The user who created the ticket
2. **Ticket Category** (optional) - The category of the ticket
3. **Assignment** (optional) - Related assignment if the ticket is about an assigned item
4. **Assigned To User** (optional) - The user assigned to resolve the ticket

### Tickets are NOT related to:
- Items directly
- Item Categories

## Migration Instructions

### To apply these changes to your database:

1. **Run migrations:**
   ```bash
   php artisan migrate
   ```

2. **Seed ticket categories:**
   ```bash
   php artisan db:seed --class=TicketCategoriesSeeder
   ```

### Rollback (if needed):
```bash
php artisan migrate:rollback --step=3
```

## API Usage Examples

### List Active Ticket Categories
```http
GET /api/v1/ticket-categories?active_only=true
Authorization: Bearer {token}
```

### Create a Ticket with Category
```http
POST /api/v1/tickets
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Cannot access email",
  "description": "I'm getting authentication errors when trying to login",
  "ticket_category_id": 2,
  "priority": "high"
}
```

### Create a Ticket Related to an Assignment
```http
POST /api/v1/tickets
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Laptop battery not charging",
  "description": "The assigned laptop battery is not charging properly",
  "ticket_category_id": 5,
  "assignment_id": 10,
  "priority": "medium"
}
```

### Create a New Ticket Category (Admin only)
```http
POST /api/v1/ticket-categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Software",
  "description": "Problemas relacionados con software",
  "active": true
}
```

## Breaking Changes

⚠️ **Important:** This refactor introduces breaking changes:

1. Existing tickets that reference `item_id` or `category_id` will lose these references
2. API endpoints that relied on `item` or `category` relationships will need updating
3. Frontend applications must be updated to:
   - Use `ticket_category_id` instead of `category_id`
   - Remove references to `item_id` in ticket creation
   - Fetch ticket categories from `/api/v1/ticket-categories` endpoint
   - Optionally include `assignment_id` when creating tickets

## Benefits

1. **Clearer Separation:** Tickets now have their own category system independent of items
2. **More Flexible:** Can create tickets without requiring an item
3. **Better Organization:** Categories specifically designed for ticket types
4. **Maintained Traceability:** Can still link tickets to assignments when relevant
5. **Easier Management:** Categories can be managed independently

## Notes

- The `assignments` table remains unchanged and represents item assignments to users
- The `ticket_assignments` table is separate and tracks ticket assignment history
- All ticket categories support soft deletes
- Only admin users can create, update, or delete ticket categories
- All users can view ticket categories
