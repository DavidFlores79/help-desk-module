# Profile Role Mapping Implementation

## Overview
Updated the authentication system to properly handle the `my_profile` object returned by the API and map profile names to internal roles.

## Changes Made

### 1. Updated Auth Model (`auth.model.ts`)
Added support for the `my_profile` object structure:

```typescript
export interface ProfileType {
  id: number;
  name: string; // 'Administrador', 'Usuario', 'SuperUser'
  description?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  my_profile?: ProfileType;  // Profile object from API
  role?: UserRole;           // Computed role for internal use
  permissions?: string[];
}
```

### 2. Enhanced Auth Service (`auth.service.ts`)

#### New Method: `normalizeUser()`
- Automatically maps API profile names to internal role codes
- Mapping logic:
  - `"SuperUser"` → `'superuser'`
  - `"Administrador"` or `"Admin"` → `'admin'`
  - Default → `'user'`

#### Updated `login()` Method
- Now calls `normalizeUser()` before storing user data
- Logs the computed role for debugging

#### Enhanced Role Detection Methods

**`isAdmin()`**
Now checks in this order:
1. Computed `role` field (fastest)
2. `my_profile.name` directly (fallback)
3. `permissions` array (legacy support)
4. Logs detailed information for debugging

**`isSuperUser()`**
- Checks computed role first
- Falls back to my_profile.name
- Supports permissions array

**`hasRole()`**
- Supports checking computed roles
- Handles profile name mapping (e.g., 'admin' matches 'Administrador')
- Backward compatible with permissions array

## Profile Name Mappings

| API Profile Name | Internal Role | Access Level |
|-----------------|---------------|--------------|
| Usuario         | `user`        | Standard user permissions |
| Administrador   | `admin`       | Admin dashboard access |
| SuperUser       | `superuser`   | Full system access |

## Logging Enhancement

All role detection methods now include detailed console logging:
- User information during checks
- Profile data inspection
- Role computation results
- Warnings when role cannot be determined

## Example Login Response Handling

```typescript
// API Response
{
  success: true,
  jwt: "eyJ0eXAi...",
  user: {
    id: 4,
    name: "Admin User",
    email: "admin@example.com",
    my_profile: {
      id: 2,
      name: "Administrador"
    }
  }
}

// After normalizeUser()
{
  id: 4,
  name: "Admin User",
  email: "admin@example.com",
  my_profile: {
    id: 2,
    name: "Administrador"
  },
  role: "admin"  // ← Computed from my_profile.name
}
```

## Benefits

1. **Type Safety**: TypeScript interfaces enforce correct data structure
2. **Flexibility**: Multiple fallback mechanisms for role detection
3. **Debugging**: Comprehensive logging for troubleshooting
4. **Performance**: Cached role computation (stored in user object)
5. **Backward Compatibility**: Still supports old `permissions` array
6. **Maintainability**: Centralized profile-to-role mapping logic

## Future Improvements (Optional)

If you want even more robust role handling, consider:

1. **Add a `code` field** to the API's profile table:
   ```json
   my_profile: {
     id: 2,
     code: "ADMIN",
     name: "Administrador"
   }
   ```
   This would allow role checking without string matching.

2. **Create a Role Service** to centralize all role/permission logic.

3. **Server-side validation** to ensure role consistency.

## Testing

After these changes:
- Login as different user types (Usuario, Administrador, SuperUser)
- Check browser console for detailed role logging
- Verify admin dashboard access control
- Confirm user-specific feature visibility

## Console Output Example

When logging in as admin:
```
🔐 [AUTH] Attempting login...
✅ [AUTH] Login response received: {...}
🔄 [AUTH] Normalizing user data: {...}
🔍 [AUTH] Profile name found: Administrador
✅ [AUTH] Mapped profile to role: admin
✅ [AUTH] Session set, user authenticated with role: admin
🔍 [AUTH] isAdmin check for user: {id: 4, name: "...", role: "admin", profile: {...}}
✅ [AUTH] Admin check result: true (role: admin)
```
