# Response Submission Test Scripts

Use these scripts in the browser console to test response submission independently.

## Prerequisites
1. Open browser DevTools (F12)
2. Go to Console tab
3. Make sure you're logged in to the application
4. Have the console open while running these tests

## Test 1: Simple JSON Response (No Attachments)

```javascript
// Get the token from localStorage
const token = localStorage.getItem('token');
if (!token) {
    console.error('❌ No token found. Please log in first.');
} else {
    console.log('✅ Token found:', token.substring(0, 20) + '...');
}

// Test ticket ID (change this to a valid ticket ID)
const ticketId = 5;

// Test payload (simple text response)
const payload = {
    body: 'Test response from browser console - ' + new Date().toISOString()
};

console.log('📤 Testing response submission...');
console.log('Ticket ID:', ticketId);
console.log('Payload:', payload);

fetch(`http://bitacora-mantenimiento.test.com/api/v1/tickets/${ticketId}/responses`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
})
.then(response => {
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', {
        contentType: response.headers.get('content-type'),
        server: response.headers.get('server')
    });
    return response.text().then(text => ({
        status: response.status,
        statusText: response.statusText,
        text: text,
        json: text ? JSON.parse(text) : null
    }));
})
.then(result => {
    if (result.status >= 200 && result.status < 300) {
        console.log('✅ Success:', result.json);
    } else {
        console.error('❌ Error:', result);
    }
})
.catch(error => {
    console.error('❌ Network error:', error);
});
```

## Test 2: FormData Response (With Text File Attachment)

```javascript
const token = localStorage.getItem('token');
const ticketId = 5;

// Create a simple text file
const fileContent = 'This is a test file created in the browser console.\nLine 2 of the test file.\n';
const blob = new Blob([fileContent], { type: 'text/plain' });
const file = new File([blob], 'test-file.txt', { type: 'text/plain' });

// Create FormData
const formData = new FormData();
formData.append('body', 'Test response with attachment from console - ' + new Date().toISOString());
formData.append('attachments[]', file);

console.log('📤 Testing response with attachment...');
console.log('Ticket ID:', ticketId);
console.log('File:', file.name, file.size, 'bytes');

// Log FormData contents
console.log('📋 FormData contents:');
for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
        console.log(`  ${key}:`, value.name, value.size, 'bytes', value.type);
    } else {
        console.log(`  ${key}:`, value);
    }
}

fetch(`http://bitacora-mantenimiento.test.com/api/v1/tickets/${ticketId}/responses`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
        // Note: Do NOT set Content-Type for FormData - browser sets it automatically with boundary
    },
    body: formData
})
.then(response => {
    console.log('📥 Response status:', response.status);
    return response.text().then(text => ({
        status: response.status,
        statusText: response.statusText,
        text: text,
        json: text ? JSON.parse(text) : null
    }));
})
.then(result => {
    if (result.status >= 200 && result.status < 300) {
        console.log('✅ Success:', result.json);
    } else {
        console.error('❌ Error:', result);
    }
})
.catch(error => {
    console.error('❌ Network error:', error);
});
```

## Test 3: Check Backend Endpoint with OPTIONS Request

```javascript
const ticketId = 5;
const url = `http://bitacora-mantenimiento.test.com/api/v1/tickets/${ticketId}/responses`;

console.log('🔍 Checking endpoint:', url);

fetch(url, {
    method: 'OPTIONS',
})
.then(response => {
    console.log('📥 OPTIONS response:');
    console.log('  Status:', response.status);
    console.log('  Allow:', response.headers.get('allow'));
    console.log('  Access-Control-Allow-Methods:', response.headers.get('access-control-allow-methods'));
    console.log('  Access-Control-Allow-Headers:', response.headers.get('access-control-allow-headers'));
    console.log('  Access-Control-Allow-Origin:', response.headers.get('access-control-allow-origin'));
})
.catch(error => {
    console.error('❌ Error:', error);
});
```

## Test 4: Verify Token and User Info

```javascript
const token = localStorage.getItem('token');
if (!token) {
    console.error('❌ No token found');
} else {
    console.log('✅ Token found');
    
    // Try to decode JWT (note: this is just to inspect, not validate)
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        console.log('📋 Token payload:', decoded);
        console.log('   User ID:', decoded.sub);
        console.log('   Issued at:', new Date(decoded.iat * 1000).toLocaleString());
        console.log('   Expires at:', new Date(decoded.exp * 1000).toLocaleString());
        
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
            console.warn('⚠️ Token has expired!');
        } else {
            console.log('✅ Token is valid for', Math.round((decoded.exp - now) / 60), 'more minutes');
        }
    } catch (e) {
        console.log('ℹ️ Could not decode token (might be encrypted)');
    }
}

// Check stored user
const userStr = localStorage.getItem('user');
if (userStr) {
    try {
        const user = JSON.parse(userStr);
        console.log('📋 Stored user:', user);
    } catch (e) {
        console.error('❌ Could not parse stored user');
    }
} else {
    console.log('ℹ️ No user info in localStorage');
}
```

## Test 5: Test Direct Backend Call (cURL equivalent)

```javascript
// This mimics exactly what Angular HttpClient does
const token = localStorage.getItem('token');
const ticketId = 5;

const xhr = new XMLHttpRequest();
xhr.open('POST', `http://bitacora-mantenimiento.test.com/api/v1/tickets/${ticketId}/responses`);

// Set headers
xhr.setRequestHeader('Authorization', `Bearer ${token}`);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.setRequestHeader('Accept', 'application/json');

// Track progress
xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
        console.log(`📤 Upload: ${e.loaded}/${e.total} bytes (${Math.round(e.loaded/e.total*100)}%)`);
    }
});

xhr.addEventListener('load', () => {
    console.log('📥 Response received');
    console.log('   Status:', xhr.status);
    console.log('   Status text:', xhr.statusText);
    console.log('   Response:', xhr.responseText);
    
    try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
            console.log('✅ Success:', json);
        } else {
            console.error('❌ Error:', json);
        }
    } catch (e) {
        console.error('❌ Could not parse response as JSON');
    }
});

xhr.addEventListener('error', () => {
    console.error('❌ Network error');
});

// Send request
const payload = JSON.stringify({
    body: 'Test via XMLHttpRequest - ' + new Date().toISOString()
});

console.log('📤 Sending XMLHttpRequest...');
console.log('   Method: POST');
console.log('   URL:', `http://bitacora-mantenimiento.test.com/api/v1/tickets/${ticketId}/responses`);
console.log('   Payload:', payload);

xhr.send(payload);
```

## Interpreting Results

### Success Response (Status 200-299)
```json
{
  "success": true,
  "message": "Response added successfully",
  "data": {
    "id": 123,
    "ticket_id": 5,
    "user_id": 4,
    "body": "Test response...",
    "internal": false,
    "created_at": "2025-01-...",
    "user": {...},
    "attachments": []
  }
}
```

### Server Error (Status 500)
If you see the Symfony TypeError, the backend code needs to be fixed (see RESPONSE_500_DEBUG.md).

### Validation Error (Status 422)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "body": ["The body field is required."]
  }
}
```

### Unauthorized (Status 401)
Token is missing or expired. Log in again.

### Not Found (Status 404)
The ticket ID doesn't exist or the endpoint URL is wrong.

## Next Steps

1. **If Test 1 fails with 500 error:** The backend controller has a bug (see RESPONSE_500_DEBUG.md)
2. **If Test 1 succeeds but Angular app fails:** Issue is in Angular app (unlikely given current implementation)
3. **If Test 2 fails but Test 1 succeeds:** Backend has issue handling file uploads
4. **If all tests fail with 401:** Authentication issue
5. **If all tests fail with 404:** Endpoint doesn't exist or routing issue

## Compare with Working Endpoints

Test a known working endpoint to verify connectivity:

```javascript
const token = localStorage.getItem('token');

fetch('http://bitacora-mantenimiento.test.com/api/v1/tickets', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    }
})
.then(r => r.json())
.then(data => {
    console.log('✅ Ticket list endpoint works:', data);
})
.catch(error => {
    console.error('❌ Ticket list endpoint failed:', error);
});
```
