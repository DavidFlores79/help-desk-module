# Fix: Button Display and Admin Endpoint Issues

## Summary
This PR fixes two critical bugs in the help desk module:
1. "Create New Ticket" button display issue on `/tickets` page
2. Admin page using incorrect/non-existent API endpoint for fetching technicians

## Changes Made

### 🎨 UI Fix - Create New Ticket Button
- **Problem**: Button was not displaying properly (not showing in one piece)
- **Solution**: Added `inline-flex items-center` CSS classes to ensure proper layout
- **Files**: `tickets-page.component.ts`

### 🌍 Translation Improvements
- **Problem**: Hardcoded text in empty state section
- **Solution**: Applied translation pipes to all text
- **Added Keys**:
  - `ticket.getStartedMessage` (EN: "Get started by creating a new support ticket.")
  - `ticket.getStartedMessage` (ES: "Comienza creando un nuevo ticket de soporte.")
- **Files**: `en.json`, `es-MX.json`

### 🔧 API Endpoint Fix - Admin Technicians
- **Problem**: Admin page calling non-existent endpoint `/api/v1/users/technicians`
- **Solution**: Updated to use correct endpoint `/api/v1/users/?profile_id=X` with client-side filtering
- **Details**: 
  - Replaced deprecated `getTechnicians()` with `getAdminsAndSuperUsers()`
  - Added filtering for `profile_id === 1` (Admin) and `profile_id === 2` (SuperUser)
  - Properly handles nested response structure
- **Files**: `admin-page.component.ts`

## Files Modified
- `src/app/features/ticketing/pages/tickets-page/tickets-page.component.ts`
- `src/app/features/admin/pages/admin-page/admin-page.component.ts`
- `src/assets/i18n/en.json`
- `src/assets/i18n/es-MX.json`
- `BUGFIXES_UI_AND_ENDPOINT.md` (documentation)

## Testing Checklist
- [ ] Navigate to `/tickets` and verify button displays correctly
- [ ] Check translations work in both English and Spanish
- [ ] Verify empty state shows translated messages when no tickets exist
- [ ] Navigate to `/admin` and verify technicians list loads without errors
- [ ] Check Network tab shows correct API endpoint being called
- [ ] Test ticket assignment functionality works properly
- [ ] Verify only Admin and SuperUser profiles appear in dropdown

## Screenshots
**Before**: Button not displaying in one piece, hardcoded text
**After**: Button displays correctly with proper translations

## Related Issues
Fixes issues with:
- Button layout on tickets page
- Incorrect API endpoint usage in admin dashboard
- Missing translations in empty states

## API Changes
No breaking changes. Uses existing UserService methods with proper filtering.

## Notes
- All JSON translation files validated
- Changes are backward compatible
- Follows existing codebase patterns
- Minimal, surgical changes only
