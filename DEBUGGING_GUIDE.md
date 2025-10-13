# 🔍 Debugging Guide - Comprehensive Logging System

## Overview

The application now has **comprehensive logging** throughout all layers. This guide explains how to use the logs to diagnose issues.

## 🚀 Application Status

**Current Status**: Application is running with full logging enabled

- **URL**: http://localhost:50397/
- **Environment**: Development
- **API Endpoint**: http://bitacora-mantenimiento.test.com/api/v1
- **Log Level**: Debug (all logs enabled)

## 📊 How to View Logs

### Opening Browser Console

1. **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
3. **Safari**: Press `Cmd+Option+C`

### Console Tab

Click on the **Console** tab in Developer Tools to see all logs.

## 🎯 What You'll See in the Console

### 1. Application Startup Logs

When the app loads, you'll see:

```
🚀 Help Desk Application Started
📋 Configuration:
┌──────────────┬────────────────────────────────────────────┐
│ Environment  │ Development                                │
│ API URL      │ http://bitacora-mantenimiento.test.com... │
│ API Timeout  │ 30000ms                                    │
│ Retry Attempts│ 3                                         │
│ Log Level    │ debug                                      │
└──────────────┴────────────────────────────────────────────┘
💡 Tip: All HTTP requests will be logged in the console
```

### 2. Auth Service Initialization

```
🔧 [AUTH] Initializing auth service...
🔧 [AUTH] Auth state: { hasToken: false, hasUser: false, user: null }
ℹ️ [AUTH] No existing session found
```

### 3. Login Form Initialization

```
🎯 [LOGIN FORM] Component initialized
  apiUrl: "http://bitacora-mantenimiento.test.com/api/v1/login"
  environment: { production: false, apiUrl: "...", ... }
```

### 4. Login Attempt Logs

When you click "Sign In", you'll see:

```
📋 [LOGIN FORM] Form submitted
  email: "test@example.com"
  hasPassword: true

🔐 [AUTH] Attempting login...
  url: "http://bitacora-mantenimiento.test.com/api/v1/login"
  email: "test@example.com"
  environment: "development"

🚀 HTTP Request: POST http://bitacora-mantenimiento.test.com/api/v1/login
  Headers: ["Content-Type: application/json", ...]
  Body: { email: "test@example.com", password: "..." }
```

### 5. Success Response

If login succeeds:

```
✅ HTTP Response: POST http://...login (234ms)
  Status: 200
  Response: { success: true, data: { token: "...", user: {...} } }

✅ [AUTH] Login response received: { success: true, ... }
✅ [AUTH] Login successful, setting session...
✅ [AUTH] Session set, user authenticated
✅ [LOGIN FORM] Login successful, navigating to /tickets
🏁 [LOGIN FORM] Login request completed
```

### 6. Error Response

If login fails, you'll see detailed error information:

#### Network Error (Status 0)
```
❌ HTTP Error: POST http://...login (1234ms)
  Status: 0
  Status Text: "Unknown Error"
  Error: null
  Message: "..."

🔴 [ERROR INTERCEPTOR] HTTP Error Caught
  URL: http://bitacora-mantenimiento.test.com/api/v1/login
  Method: POST
  Status: 0
  Status Text: "Unknown Error"
  Possible Causes:
    - Server is not running
    - CORS is blocking the request
    - Network connection lost
    - Invalid URL
```

#### 404 Not Found
```
❌ HTTP Error: POST http://...login (123ms)
  Status: 404
  Status Text: "Not Found"

🔴 [ERROR INTERCEPTOR] HTTP Error Caught
  Status: 404
🔍 404 Not Found:
  url: "http://bitacora-mantenimiento.test.com/api/v1/login"
  suggestion: "Check if the API endpoint exists and the URL is correct"

Error Message: Resource not found.
Error Details: The endpoint http://...login does not exist on the server
```

#### 401 Unauthorized
```
❌ HTTP Error: POST http://...login (456ms)
  Status: 401
  Status Text: "Unauthorized"

🔴 [ERROR INTERCEPTOR] HTTP Error Caught
  Status: 401
🔒 401 Unauthorized - Logging out user
```

## 🔍 Common Issues and What to Look For

### Issue 1: "Resource not found" (404 Error)

**Symptoms:**
- Login button shows error: "Resource not found"
- Console shows: `Status: 404`

**Diagnosis:**
1. Check the API URL in the blue info box on login page
2. Look for `404 Not Found` in console
3. Verify the endpoint exists

**Solution:**
```typescript
// Update src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://YOUR_ACTUAL_API_URL/api/v1',  // ← Change this
  ...
};
```

**Common Causes:**
- ✗ API server not running
- ✗ Wrong API URL
- ✗ Login endpoint doesn't exist on server
- ✗ CORS not configured on server

### Issue 2: Network Error (Status 0)

**Symptoms:**
- Error message: "Cannot connect to server"
- Console shows: `Status: 0`
- Lots of CORS-related errors

**Diagnosis:**
Look for in console:
```
Status: 0
Possible Causes:
  - Server is not running
  - CORS is blocking the request
  - Network connection lost
  - Invalid URL
```

**Solutions:**

1. **Server Not Running**
   ```bash
   # Start your Laravel/PHP server
   php artisan serve
   # or
   cd /path/to/api && php -S localhost:8000
   ```

2. **CORS Issues**
   Add to your API's `config/cors.php`:
   ```php
   'allowed_origins' => ['http://localhost:50397'],
   'allowed_methods' => ['*'],
   'allowed_headers' => ['*'],
   ```

3. **Wrong URL**
   Check if you can access: `http://bitacora-mantenimiento.test.com/api/v1` in your browser

### Issue 3: 401 Unauthorized

**Symptoms:**
- "Invalid credentials" message
- Console shows: `Status: 401`

**Diagnosis:**
```
Status: 401
Error Message: Unauthorized
```

**Solutions:**
- Verify username/password are correct
- Check if user exists in database
- Verify API authentication logic

### Issue 4: 422 Validation Error

**Symptoms:**
- Form validation error
- Console shows: `Status: 422`

**Diagnosis:**
```
📝 422 Validation Error:
  errors: {
    email: ["The email field is required."],
    password: ["The password field is required."]
  }
```

**Solutions:**
- Fix form validation
- Ensure required fields are filled
- Check API validation rules

## 🛠️ Testing the Login Flow

### Step 1: Open the Application

Navigate to: http://localhost:50397/

### Step 2: Open Browser Console

Press `F12` to open Developer Tools

### Step 3: Check Initial Logs

You should see:
- ✅ Application started message
- ✅ Configuration table
- ✅ Auth service initialization
- ✅ Login form initialization

### Step 4: Check API Configuration

Look at the blue info box on the login page:
```
API Configuration:
Endpoint: http://bitacora-mantenimiento.test.com/api/v1/login
```

**Is this URL correct?** If not, update `src/environments/environment.ts`

### Step 5: Try to Login

1. Enter email: `test@example.com`
2. Enter password: `password`
3. Click "Sign In"
4. Watch the console

### Step 6: Analyze the Logs

Look for these key log entries:

1. **Form Submission**
   ```
   📋 [LOGIN FORM] Form submitted
   ```

2. **HTTP Request**
   ```
   🚀 HTTP Request: POST http://...
   ```

3. **Response or Error**
   - Success: `✅ HTTP Response`
   - Error: `❌ HTTP Error`

4. **Error Details**
   ```
   🔴 [ERROR INTERCEPTOR] HTTP Error Caught
   ```

## 📝 Log Prefixes Explanation

- 🚀 = Application/Component initialization
- 🔐 = Authentication operations
- 🎯 = Component lifecycle events
- 📋 = Form submissions
- ✅ = Success operations
- ❌ = Error operations
- 🔴 = Error interceptor (detailed error info)
- 🔍 = Diagnostic information
- 🔧 = Configuration/setup
- ⏱️ = Performance timing
- 💡 = Tips and suggestions
- ⚠️ = Warnings

## 🎨 UI Diagnostic Features

### Login Page Shows:

1. **Blue Info Box** - Shows API endpoint being used
2. **Error Box (Red)** - Shows detailed error when login fails
3. **Test Credentials Box** - Sample credentials to try

### What the Error Box Shows:

```
Error:
[Detailed error message]

Check the browser console (F12) for detailed logs
```

## 🔧 Configuration Check

### Verify Your Environment

1. Open `src/environments/environment.ts`
2. Verify:
   ```typescript
   apiUrl: 'http://YOUR_API_URL/api/v1',  // ← Correct URL?
   ```

3. If you change this, the app will auto-reload

### Test API Accessibility

Open a new browser tab and try:
```
http://bitacora-mantenimiento.test.com/api/v1
```

Expected responses:
- ✅ JSON response or API welcome message
- ✗ Cannot connect / CORS error → Server not accessible
- ✗ 404 → Wrong URL

## 📊 Network Tab Inspection

In addition to Console logs, check the **Network** tab:

1. Open Developer Tools (F12)
2. Click **Network** tab
3. Try to login
4. Look for the request to `/login`
5. Click on it to see:
   - Request Headers
   - Request Payload
   - Response Headers
   - Response Body
   - Timing

### What to Look For:

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | Success | ✅ Login worked |
| 401 | Unauthorized | Check credentials |
| 404 | Not Found | Check API URL |
| 422 | Validation Error | Check form data |
| 500 | Server Error | Check API logs |
| (canceled) | CORS/Network | Check CORS config |

## 🚨 Quick Troubleshooting Checklist

### When Login Fails:

- [ ] Is the API server running?
- [ ] Can you access the API URL in browser?
- [ ] Is the API URL correct in `environment.ts`?
- [ ] Are CORS headers configured on the API?
- [ ] Do the test credentials exist in the database?
- [ ] Check browser console for errors
- [ ] Check Network tab for request details
- [ ] Check API server logs

### Common Fixes:

1. **Update API URL**
   ```typescript
   // src/environments/environment.ts
   apiUrl: 'http://localhost:8000/api/v1',  // Your actual URL
   ```

2. **Start API Server**
   ```bash
   cd /path/to/api
   php artisan serve
   ```

3. **Enable CORS**
   ```php
   // config/cors.php
   'allowed_origins' => ['http://localhost:50397'],
   ```

## 📚 Additional Resources

- **README.md** - Project documentation
- **IMPLEMENTATION_GUIDE.md** - Component templates
- **TICKETING_API_REQUESTS.md** - Complete API specification
- **RUNNING_SUCCESSFULLY.md** - Current status

## 💡 Pro Tips

1. **Keep Console Open** - Always have F12 open during development
2. **Clear Console** - Click the clear icon (🚫) to start fresh
3. **Filter Logs** - Use the filter box to search for specific tags like `[AUTH]`
4. **Preserve Log** - Enable "Preserve log" to keep logs across page reloads
5. **Copy Logs** - Right-click any log entry to copy for reporting issues

---

## 🎯 Current Status

✅ **All logging systems active**
✅ **Detailed error messages**
✅ **UI diagnostic info**
✅ **Console logging enabled**
✅ **Network request tracking**
✅ **Authentication flow logging**

**You now have complete visibility into what's happening with your login attempts!**

Access the application at: **http://localhost:50397/**

Check the browser console (F12) and you'll see exactly what's happening with each request.
