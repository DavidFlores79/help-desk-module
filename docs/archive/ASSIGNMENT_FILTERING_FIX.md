# Assignment Filtering & Display Fixes

## Changes Made

### 1. User Service Enhancement (`src/app/core/services/user.service.ts`)

**Added support for new API filtering parameters:**

```typescript
export interface UserFilters {
  name?: string;
  email?: string;
  department?: string;
  employee_id?: string;
  profile_id?: number; // 1=Admin, 2=SuperUser, 3=User
  status?: 0 | 1; // 0=inactive, 1=active
  phone?: string;
  per_page?: number;
  page?: number;
  sort_by?: 'name' | 'email' | 'created_at' | 'employee_id' | 'department';
  sort_order?: 'asc' | 'desc';
}
```

**New Methods:**
- `getUsers(filters?: UserFilters)` - Fetch users with optional filtering
- `getAdminsAndSuperUsers()` - Specifically fetch admin and superuser accounts for assignment

**API Integration:**
- Properly constructs query parameters using HttpParams
- Filters out undefined/null/empty values
- Supports all 7 filter parameters from the API spec

### 2. Ticket Detail Component (`ticket-detail-page.component.ts`)

#### Fixed loadUsers Method

**Before:**
```typescript
this.userService.getUsers().subscribe({
  next: (response) => {
    this.availableUsers = response.data;
  }
});
```

**After:**
```typescript
this.userService.getAdminsAndSuperUsers().subscribe({
  next: (response) => {
    const allUsers = response.data.data || [];
    // Filter for admins and superusers by profile name
    this.availableUsers = allUsers.filter((user: any) => {
      const profile = user.my_profile || user.profile;
      if (!profile) return false;
      
      const profileName = profile.name?.toLowerCase();
      return profileName === 'administrador' || 
             profileName === 'admin' || 
             profileName === 'superuser';
    });
    
    console.log('✅ Admins/SuperUsers loaded:', this.availableUsers.length);
  }
});
```

**Key Improvements:**
- Fetches all users (API excludes current user by default)
- Client-side filtering for admin/superuser profiles
- Handles both `my_profile` and `profile` field names
- Supports Spanish ('Administrador') and English names
- Logs warning if no assignable users found

#### Fixed Assignment History Display

**Before:**
```typescript
{{ assignment.assignedTo.name }}
{{ assignment.assignedBy.name }}
```

**After:**
```typescript
{{ assignment.assignedTo?.name || 'Unknown' }}
{{ assignment.assignedBy?.name || 'Unknown' }}
```

**Key Improvements:**
- Safe navigation operators prevent undefined errors
- Fallback to 'Unknown' if user data missing
- Prevents console errors when assignment objects incomplete

#### Enhanced Response Submission

**Improvements:**
- Better form validation with detailed logging
- Marks all fields as touched on validation failure
- Improved error messages
- Proper form reset after successful submission
- Clearer console logs for debugging

### 3. API Filtering Parameters Supported

According to TICKETING_API_REQUESTS.md, the `/api/v1/users` endpoint now supports:

#### Filter Parameters:
1. `name` - Partial match search
2. `email` - Partial match search
3. `department` - Partial match search
4. `employee_id` - Exact match
5. `profile_id` - Filter by role (1=Admin, 2=SuperUser, 3=User)
6. `status` - 0 for inactive, 1 for active
7. `phone` - Partial match search

#### Pagination:
- `per_page` - 1 to 100 items (default: 15)
- `page` - Page number (default: 1)

#### Sorting:
- `sort_by` - name, email, created_at, employee_id, department
- `sort_order` - asc or desc (default: desc)

#### Default Behavior:
- Returns only active users
- Excludes the authenticated user
- Sorted by created_at descending
- 15 items per page

## Expected Behavior

### Assignment Modal
1. When admin clicks "Assign" or "Change" button
2. Modal opens showing only admin and superuser accounts
3. Users are filtered by profile name checking for:
   - 'Administrador' (Spanish)
   - 'Admin' (English)
   - 'SuperUser' (English)
4. Current authenticated user automatically excluded by API
5. Only active users shown

### Assignment History
1. Displays in ticket detail when assignments exist
2. Shows who assigned ticket to whom
3. Displays timestamp of assignment
4. No console errors even if user data missing

### Response Submission
1. Form validates before submission
2. Detailed logging shows validation state
3. All fields marked as touched on error
4. Clear error messages displayed
5. Form resets properly after success

## Testing Checklist

- [ ] Open ticket detail as admin
- [ ] Click "Assign" button
- [ ] Verify modal shows only admins/superusers
- [ ] Verify current user not in list
- [ ] Assign ticket to a user
- [ ] Verify assignment saved successfully
- [ ] Verify "Assigned To" field updates
- [ ] Verify "Assignment History" displays correctly
- [ ] No console errors related to assignments
- [ ] Try submitting response (should work now)
- [ ] Check browser console for detailed logs

## Debugging

All operations now have enhanced logging:

```
🔄 [TICKET DETAIL] Loading admins and superusers for assignment
✅ [TICKET DETAIL] Admins/SuperUsers loaded: 5 of 23 total
⚠️ [TICKET DETAIL] No admin/superuser users found for assignment
🔄 [TICKET DETAIL] submitResponse called
   Form valid: true
   Form value: { body: '...', attachments: [], internal: false }
🔄 [TICKET DETAIL] Assigning ticket to user: 5
✅ [TICKET DETAIL] Ticket assigned successfully
```

## Known Issues

### Backend May Need Updates
If the API doesn't properly support `profile_id` filtering yet, the client-side filtering in `loadUsers()` serves as a fallback. Consider adding this to the backend:

```php
// In UsersController
if ($request->has('profile_id')) {
    $query->where('profile_id', $request->profile_id);
}
```

### Profile Field Variance
The code handles both `my_profile` and `profile` field names from the API response to ensure compatibility with different API versions.

## Future Enhancements

1. **Server-side filtering**: Use `profile_id` query parameter once API supports it
2. **Role codes**: Add numeric role codes (1,2,3) for more reliable filtering
3. **Caching**: Cache user list to reduce API calls
4. **Search**: Add search box in assignment modal for large user lists
5. **Pagination**: Support paginated user lists in assignment modal
