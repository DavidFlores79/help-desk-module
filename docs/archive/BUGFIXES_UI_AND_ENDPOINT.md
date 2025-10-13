# Bug Fixes - UI and API Endpoint

## Fixed Issues

### 1. "Create New Ticket" Button Display Fix
**Problem:** The "Create New Ticket" button in `/tickets` was not displaying properly (not showing in one piece) and lacked proper translation.

**Files Modified:**
- `src/app/features/ticketing/pages/tickets-page/tickets-page.component.ts`
- `src/assets/i18n/en.json`
- `src/assets/i18n/es-MX.json`

**Changes Made:**
1. Added `inline-flex items-center` classes to the button to ensure proper layout
2. Applied translation pipe to hardcoded text in the empty state section
3. Added missing translation key `ticket.getStartedMessage` in both English and Spanish

**Before:**
```html
<a routerLink="/tickets/new" class="btn-primary">
  ...
  {{ 'ticket.newTicket' | translate }}
</a>

<!-- Empty state had hardcoded text -->
<h3>No tickets found</h3>
<p>Get started by creating a new support ticket.</p>
<a routerLink="/tickets/new" class="btn-primary">
  Create New Ticket
</a>
```

**After:**
```html
<a routerLink="/tickets/new" class="btn-primary inline-flex items-center">
  ...
  {{ 'ticket.newTicket' | translate }}
</a>

<!-- Empty state with translations -->
<h3>{{ 'ticket.noTickets' | translate }}</h3>
<p>{{ 'ticket.getStartedMessage' | translate }}</p>
<a routerLink="/tickets/new" class="btn-primary inline-flex items-center">
  {{ 'ticket.createNewTicket' | translate }}
</a>
```

### 2. Admin Page Technicians Endpoint Fix
**Problem:** The admin page at `/admin` was calling a deprecated endpoint `/api/v1/users/technicians` that doesn't exist. The correct endpoint is `/api/v1/users/?profile_id=X` where profile_id can be:
- 1 = Admin
- 2 = SuperUser
- 3 = User

**Files Modified:**
- `src/app/features/admin/pages/admin-page/admin-page.component.ts`

**Changes Made:**
1. Replaced deprecated `getTechnicians()` method call with `getAdminsAndSuperUsers()`
2. Added client-side filtering to ensure only users with `profile_id === 1` (Admin) or `profile_id === 2` (SuperUser) are shown
3. Fixed data extraction to properly handle the nested response structure

**Before:**
```typescript
loadTechnicians(): void {
  this.userService.getTechnicians().subscribe({
    next: (response) => {
      this.technicians = response.data || [];
      console.log('✅ [ADMIN] Technicians loaded:', this.technicians);
    },
    error: (error) => {
      console.error('❌ [ADMIN] Failed to load technicians:', error);
    }
  });
}
```

**After:**
```typescript
loadTechnicians(): void {
  this.userService.getAdminsAndSuperUsers().subscribe({
    next: (response) => {
      // Filter to get only admins (profile_id=1) and superusers (profile_id=2)
      const allUsers = response.data?.data || [];
      this.technicians = allUsers.filter(user => 
        user.profile_id === 1 || user.profile_id === 2
      );
      console.log('✅ [ADMIN] Technicians loaded:', this.technicians);
    },
    error: (error) => {
      console.error('❌ [ADMIN] Failed to load technicians:', error);
    }
  });
}
```

## Translation Keys Added

### English (en.json)
```json
{
  "ticket": {
    "getStartedMessage": "Get started by creating a new support ticket."
  }
}
```

### Spanish (es-MX.json)
```json
{
  "ticket": {
    "getStartedMessage": "Comienza creando un nuevo ticket de soporte."
  }
}
```

## Technical Details

### UserService Methods
The `UserService` now properly uses:
- `getAdminsAndSuperUsers()` - Fetches all active users and allows client-side filtering
- `getAdminUsers()` - Fetches only users with `profile_id=1`
- `getSuperUsers()` - Fetches only users with `profile_id=2`

The deprecated `getTechnicians()` method still exists but is marked as deprecated and should not be used.

## Testing

To verify these fixes:

1. **Button Display Fix:**
   - Navigate to `/tickets`
   - Verify the "Create New Ticket" button displays properly as one cohesive element
   - Check that translations work in both English and Spanish
   - When there are no tickets, verify the empty state shows translated text

2. **Admin Endpoint Fix:**
   - Navigate to `/admin` (requires admin role)
   - Open browser DevTools Network tab
   - Verify that the request goes to `/api/v1/users/` with query parameters instead of `/api/v1/users/technicians`
   - Verify that only Admin and SuperUser profiles appear in the assignment dropdown
   - Test ticket assignment functionality

## Notes

- All JSON translation files are valid and properly formatted
- The changes maintain backward compatibility with existing functionality
- No breaking changes to the API contract
- The UserService properly handles the nested response structure from the API
