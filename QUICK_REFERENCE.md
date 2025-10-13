# Quick Reference - Help Desk Module

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Access application
http://localhost:4200
```

## 🔑 Default Credentials

**Regular User:**
- Email: `user@example.com`
- Password: `password`

**Admin:**
- Email: `admin@example.com`
- Password: `password`

## 📍 Key Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Login page |
| `/tickets` | User | Ticket list |
| `/tickets/new` | User | Create ticket |
| `/tickets/:id` | User | Ticket details |
| `/admin` | Admin | Admin dashboard |

## 🎯 Common Tasks

### Create Ticket
1. Navigate to `/tickets`
2. Click "Create New Ticket"
3. Fill form
4. (Optional) Drag files to FilePond
5. Click "Create Ticket"

### Add Response
1. Open ticket detail
2. Type message in textarea
3. (Optional) Add files
4. Click "Submit Response"

### Change Status (Admin)
1. Open ticket detail
2. Use status dropdown in header
3. Select new status
4. Auto-saves

### Reopen Ticket
1. Open resolved/closed ticket
2. Click "Reopen Ticket"
3. Confirm

## 🐛 Troubleshooting

**Can't login?**
- Check backend is running
- Verify credentials
- Check console for errors

**FilePond broken?**
- Hard refresh (Ctrl+Shift+R)
- Check browser console
- Verify CSS loaded

**500 Error on response?**
- Check backend logs
- Verify payload in Network tab
- Ensure `body` field present

**Can't see admin features?**
- Verify logged in as admin
- Check `my_profile.name` = "Administrador"
- Check console for role detection logs

## 📊 Console Log Prefixes

| Prefix | Component/Service |
|--------|------------------|
| `[LOGIN FORM]` | Login component |
| `[AUTH]` | Auth service |
| `[TICKETS PAGE]` | Tickets list |
| `[TICKET DETAIL]` | Ticket detail |
| `[TICKET SERVICE]` | Ticket API service |
| `[FILE UPLOAD]` | File upload component |
| `[ADMIN PAGE]` | Admin dashboard |

## 🔧 Important Files

| File | Purpose |
|------|---------|
| `TICKETING_API_REQUESTS.md` | **Single source of truth for API** |
| `IMPLEMENTATION_COMPLETE.md` | Feature implementation details |
| `TESTING_GUIDE.md` | Manual testing instructions |
| `FINAL_SUMMARY.md` | Project completion summary |
| `README.md` | Full documentation |

## 📦 Key Features Status

- ✅ Authentication & Authorization
- ✅ Ticket CRUD operations
- ✅ File upload (FilePond)
- ✅ Response system
- ✅ Status management
- ✅ Priority management
- ✅ Admin dashboard
- ✅ Role-based access
- ✅ Responsive design

## 🎨 UI Components

**Status Badges:**
- 🔓 Open (yellow)
- 👤 Assigned (blue)
- ⏳ In Progress (purple)
- ⏸️ Awaiting User (orange)
- ✅ Resolved (green)
- 🔒 Closed (gray)

**Priority Badges:**
- Low (gray)
- Medium (blue)
- High (orange)
- Urgent (red)

## 🔐 Permissions

| Action | User | Admin |
|--------|------|-------|
| View own tickets | ✅ | ✅ |
| View all tickets | ❌ | ✅ |
| Create ticket | ✅ | ✅ |
| Update ticket | ✅ (own) | ✅ (all) |
| Delete ticket | ✅ (own) | ✅ (all) |
| Add response | ✅ | ✅ |
| Add internal note | ❌ | ✅ |
| Change status | ❌ | ✅ |
| Change priority | ❌ | ✅ |
| Assign ticket | ❌ | ✅ |
| Reopen ticket | ✅ (own) | ✅ (all) |

## 📱 Responsive Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+
- **Large:** 1440px+

## 🎯 API Endpoints Quick Reference

```
POST   /api/login                      # Login
GET    /api/v1/tickets                 # List tickets
POST   /api/v1/tickets                 # Create ticket
GET    /api/v1/tickets/:id             # Get ticket
PUT    /api/v1/tickets/:id             # Update ticket
DELETE /api/v1/tickets/:id             # Delete ticket
POST   /api/v1/tickets/:id/responses   # Add response
POST   /api/v1/tickets/:id/assign      # Assign ticket
POST   /api/v1/tickets/:id/reopen      # Reopen ticket
```

## 💡 Pro Tips

1. **Use console logs** - All actions are logged with prefixes
2. **Check Network tab** - Verify API requests/responses
3. **Hard refresh** - Ctrl+Shift+R to clear cache
4. **Check backend** - Ensure API is running
5. **Verify role** - Admin features only for admins

## 🚨 Common Errors

**401 Unauthorized**
→ Token expired or invalid. Re-login.

**403 Forbidden**
→ Insufficient permissions. Check role.

**404 Not Found**
→ Resource doesn't exist or wrong route.

**500 Internal Server Error**
→ Backend issue. Check server logs.

**Resource not found (on login)**
→ Wrong endpoint. Use `/api/login` not `/api/v1/login`

## 📞 Getting Help

1. Check `TESTING_GUIDE.md` for detailed testing instructions
2. Review `IMPLEMENTATION_COMPLETE.md` for feature details
3. Consult `TICKETING_API_REQUESTS.md` for API reference
4. Check browser console logs (with prefixes)
5. Inspect Network tab for API calls

---

**Quick Links:**
- [Full Documentation](README.md)
- [API Reference](TICKETING_API_REQUESTS.md)
- [Testing Guide](TESTING_GUIDE.md)
- [Implementation Details](IMPLEMENTATION_COMPLETE.md)
- [Final Summary](FINAL_SUMMARY.md)

---

**Application Status:** ✅ PRODUCTION READY
**All Features:** ✅ IMPLEMENTED
**Documentation:** ✅ COMPLETE

🎉 **Ready to use!**
