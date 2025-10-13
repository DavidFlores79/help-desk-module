# Testing Guide - Help Desk Module

## 🧪 Quick Testing Checklist

### Before Testing
1. ✅ Backend API running at `http://bitacora-mantenimiento.test.com`
2. ✅ Frontend running at `http://localhost:4200`
3. ✅ Valid user credentials (both regular user and admin)

---

## 1. Authentication

### Test Login
1. Navigate to `http://localhost:4200`
2. Should redirect to `/login`
3. Enter credentials:
   - **Regular User:** `user@example.com` / `password`
   - **Admin:** `admin@example.com` / `password`
4. Click "Sign In"
5. Should redirect to `/tickets`

**Expected Console Logs:**
```
✅ [LOGIN FORM] Login successful, navigating to /tickets
✅ [AUTH] User role detected: Usuario (or Administrador)
✅ [AUTH] Admin status: false (or true)
```

### Test Logout
1. Click profile icon in header
2. Click "Logout"
3. Should redirect to `/login`
4. Token should be cleared

---

## 2. User Features

### A. View Tickets
1. After login, you'll see `/tickets` page
2. Should display your tickets in a grid
3. Each ticket shows:
   - Title
   - Status badge
   - Priority badge
   - Description preview
   - Creation time

**Console Logs:**
```
🔄 [TICKETS PAGE] Loading tickets
✅ [TICKETS PAGE] Tickets loaded: X tickets
```

### B. Create Ticket (Simple)
1. Click "Create New Ticket" button
2. Fill in:
   - **Title:** "Test ticket"
   - **Description:** "Testing ticket creation"
   - **Priority:** Select "High"
3. Click "Create Ticket"
4. Should redirect to ticket detail page

**Console Logs:**
```
📤 [NEW TICKET] Creating ticket
✅ [NEW TICKET] Ticket created successfully
```

### C. Create Ticket with Files
1. Click "Create New Ticket"
2. Fill in title and description
3. Drag & drop files into FilePond area (or click to browse)
4. Should see file previews
5. Click "Create Ticket"

**Console Logs:**
```
📎 [FILE UPLOAD] File added: filename.jpg (12345 bytes)
📤 [NEW TICKET] Creating ticket with attachments
✉️ Payload type: FormData (with attachments)
```

### D. View Ticket Details
1. Click on any ticket card
2. Should navigate to `/tickets/:id`
3. See complete ticket information:
   - Title, description
   - Status, priority badges
   - Category, item
   - Assigned to (if any)
   - Responses thread
   - Attachments

**Console Logs:**
```
🔄 [TICKET DETAIL] Loading ticket: X
✅ [TICKET DETAIL] Ticket loaded: {...}
```

### E. Add Response (Text Only)
1. On ticket detail page
2. Type message in "Add Response" textarea
3. Click "Submit Response"
4. Response should appear in thread

**Expected Request:**
```
POST /api/v1/tickets/X/responses
Content-Type: application/json
{
  "body": "Your message here"
}
```

**Console Logs:**
```
📤 [TICKET DETAIL] Preparing response submission
   Body text: Your message here
   Has files: false
   Sending as JSON (no attachments)
📤 [TICKET SERVICE] Adding response to ticket: X
✅ [TICKET DETAIL] Response added successfully
```

### F. Add Response with Files
1. Type message
2. Drag files into FilePond area
3. Click "Submit Response"

**Expected Request:**
```
POST /api/v1/tickets/X/responses
Content-Type: multipart/form-data
FormData:
  body: "Your message"
  attachments[]: [File]
```

**Console Logs:**
```
📎 [FILE UPLOAD] File added: screenshot.png (45678 bytes)
   Building FormData with attachments
📋 [TICKET DETAIL] FormData contents:
   body: "Your message"
   attachments[]: [File] screenshot.png (45678 bytes)
```

### G. Reopen Ticket
1. Admin must first resolve/close the ticket
2. "Reopen Ticket" button should appear
3. Click it
4. Confirm dialog
5. Ticket status changes to "Open"

**Console Logs:**
```
🔄 [TICKET DETAIL] Reopening ticket: X
✅ [TICKET DETAIL] Ticket reopened successfully
```

### H. Delete Ticket
1. "Delete Ticket" button appears for ticket owner
2. Click it
3. Confirm dialog
4. Should redirect to `/tickets`

**Console Logs:**
```
🗑️ [TICKET DETAIL] Deleting ticket: X
✅ [TICKET DETAIL] Ticket deleted successfully
```

---

## 3. Admin Features

### A. Admin Dashboard
1. Login as admin
2. Navigate to `/admin`
3. See statistics cards:
   - Total Tickets
   - Open
   - In Progress
   - Resolved
4. See all tickets (not just yours)

**Console Logs:**
```
✅ [AUTH] Admin status: true
🔄 [ADMIN PAGE] Loading tickets
✅ [ADMIN PAGE] Tickets loaded: X tickets
```

### B. Filter Tickets
1. On admin dashboard
2. Use filter dropdowns:
   - Status
   - Priority
   - Assigned To
3. Tickets should update

**Console Logs:**
```
🔍 [ADMIN PAGE] Filtering tickets: {...}
✅ [ADMIN PAGE] Filtered tickets loaded
```

### C. Change Ticket Status
1. Open any ticket detail page as admin
2. In header, see status dropdown
3. Select new status (e.g., "In Progress")
4. Should update immediately without reload

**Expected Request:**
```
PUT /api/v1/tickets/X
{
  "status": "in_progress"
}
```

**Console Logs:**
```
🔄 [TICKET DETAIL] Changing status from open to in_progress
📤 [TICKET SERVICE] Changing ticket status: X to in_progress
✅ [TICKET DETAIL] Status changed successfully
```

### D. Change Ticket Priority
1. See priority dropdown in header
2. Select new priority (e.g., "Urgent")
3. Should update immediately

**Console Logs:**
```
🔄 [TICKET DETAIL] Changing priority from medium to urgent
📤 [TICKET SERVICE] Changing ticket priority: X to urgent
✅ [TICKET DETAIL] Priority changed successfully
```

### E. Add Internal Note
1. On ticket detail page
2. Check "Internal Note" checkbox
3. Type message
4. Click "Submit Response"
5. Response should have 🔒 badge
6. Regular users won't see it

**Expected Request:**
```
POST /api/v1/tickets/X/responses
{
  "body": "Internal note text",
  "internal": true
}
```

**Console Logs:**
```
   Body text: Internal note
   Internal: true
```

### F. Assign Ticket
1. Navigate to admin dashboard
2. Click on unassigned ticket
3. Use assign dropdown/button
4. Select user
5. Ticket status changes to "Assigned"

---

## 4. Edge Cases & Error Testing

### A. Test 500 Error (Response Creation)
If you still get 500 errors:

1. Check backend logs
2. Verify payload format in Network tab
3. Check console logs for payload inspection
4. Ensure `body` field is present (not `message`)

**Debug Logs to Check:**
```
📋 [TICKET SERVICE] Built FormData:
   body: "..."
   attachments[]: [File] ...
```

### B. Test Unauthorized Access
1. As regular user, try to access `/admin`
2. Should redirect to `/tickets`

### C. Test Token Expiration
1. Wait for token to expire (or manually clear it)
2. Make any API request
3. Should redirect to `/login`

### D. Test Validation
1. Try to create ticket without title
2. Try to create ticket without description
3. Should show validation errors

---

## 5. FilePond Visual Check

### Expected Appearance
✅ Drag & drop area with dashed border
✅ Gray background
✅ "Drag & Drop your files or Browse" text
✅ File previews after adding
✅ Remove button (X) on each file
✅ No broken layout

### If FilePond looks broken:
1. Check browser console for CSS errors
2. Verify `angular.json` has FilePond CSS imports
3. Check Network tab to ensure CSS files load
4. Hard refresh (Ctrl+Shift+R)

---

## 6. Network Tab Inspection

### Response Creation - Text Only
```
POST http://bitacora-mantenimiento.test.com/api/v1/tickets/5/responses
Request Headers:
  Content-Type: application/json
  Authorization: Bearer eyJ0eXAi...
Request Payload:
  {
    "body": "This is my response"
  }
```

### Response Creation - With Files
```
POST http://bitacora-mantenimiento.test.com/api/v1/tickets/5/responses
Request Headers:
  Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
  Authorization: Bearer eyJ0eXAi...
Request Payload (FormData):
  body: "Message text"
  attachments[]: (binary)
  attachments[]: (binary)
```

---

## 7. Backend Verification

After each action, verify in backend:

### Check Tickets Table
```sql
SELECT id, title, status, priority, assigned_to FROM tickets ORDER BY created_at DESC LIMIT 10;
```

### Check Responses Table
```sql
SELECT tr.id, tr.ticket_id, tr.body, tr.internal, u.name 
FROM ticket_responses tr 
JOIN users u ON tr.user_id = u.id 
ORDER BY tr.created_at DESC LIMIT 10;
```

### Check Attachments Table
```sql
SELECT * FROM ticket_attachments ORDER BY created_at DESC LIMIT 10;
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Resource not found" on login
**Solution:** Verify login endpoint is `/api/login` (not `/api/v1/login`)

### Issue 2: FilePond not styled properly
**Solution:** Check `angular.json` for CSS imports, clear cache, rebuild

### Issue 3: 500 error when adding response
**Solution:** Verify payload has `body` field (not `message`). Check backend logs.

### Issue 4: Can't determine admin status
**Solution:** Check `user.my_profile.name` field. Should be "Administrador" for admins.

### Issue 5: Status/Priority dropdowns not showing
**Solution:** Ensure logged in as admin. Check `authService.isAdmin()` returns true.

---

## ✅ Success Indicators

### Application is working if:
1. ✅ Login works and redirects to `/tickets`
2. ✅ Can create tickets (with and without files)
3. ✅ Can view ticket details
4. ✅ Can add responses (text and files)
5. ✅ FilePond looks styled (not broken)
6. ✅ Admin can see status/priority dropdowns
7. ✅ Admin can change status/priority
8. ✅ Admin can add internal notes
9. ✅ Can reopen resolved tickets
10. ✅ Can delete own tickets
11. ✅ All console logs show ✅ (not ❌)

---

## 📞 Debugging Help

If something doesn't work:

1. **Check Console Logs** - Look for ❌ errors
2. **Check Network Tab** - Verify request/response
3. **Check Backend Logs** - Laravel error messages
4. **Check Auth Token** - Verify not expired
5. **Check User Role** - Verify admin status if needed

All console logs are prefixed with component names for easy tracking:
- `[LOGIN FORM]`
- `[TICKETS PAGE]`
- `[TICKET DETAIL]`
- `[TICKET SERVICE]`
- `[FILE UPLOAD]`
- `[AUTH]`

---

**Happy Testing!** 🧪
