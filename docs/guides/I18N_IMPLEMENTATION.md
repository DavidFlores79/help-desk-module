# Internationalization (i18n) Implementation

## Overview
Implemented full internationalization support for the Help Desk application with Spanish (Mexico) as the default language and English as an alternative. Language selection is restricted to administrators and superusers only.

## Languages Supported

| Language | Code | Default | Status |
|----------|------|---------|--------|
| Spanish (Mexico) | es-MX | ✅ Yes | ✅ Complete |
| English | en | ❌ No | ✅ Complete |

## Implementation Details

### 1. Dependencies Installed

```bash
npm install @ngx-translate/core@17.0.0 @ngx-translate/http-loader@17.0.0
```

### 2. Translation Files

**Location:** `src/assets/i18n/`

- **es-MX.json** - Spanish (Mexico) translations (default)
- **en.json** - English translations

**Total Translation Keys:** 150+ keys organized in categories:
- app (general UI elements)
- auth (authentication)
- nav (navigation)
- ticket (ticketing system)
- status & priority (ticket states)
- response (ticket responses)
- attachment (file management)
- assignment (ticket assignment)
- filter (filtering options)
- admin (administration)
- settings (user preferences)
- validation (form validation)
- error (error messages)
- time (relative time display)
- pagination (table pagination)

### 3. Core Services

#### TranslationService
**Location:** `src/app/core/services/translation.service.ts`

**Features:**
- Initializes translation system on app start
- Manages language preference in localStorage
- Provides helper methods for translations
- Detects browser language with fallback
- Handles language switching

**Key Methods:**
```typescript
getCurrentLanguage(): string
getAvailableLanguages(): string[]
changeLanguage(lang: string): void
instant(key: string, params?: any): string
get(key: string, params?: any): Observable<string>
getLanguageName(lang: string): string
isRTL(): boolean
```

### 4. Components

#### LanguageSelectorComponent
**Location:** `src/app/shared/components/language-selector/language-selector.component.ts`

**Features:**
- Dropdown selector for available languages
- Permission check (admin/superuser only)
- Success/error message display
- Disabled state for non-admin users
- Auto-reset on unauthorized change attempt

**Usage:**
```html
<app-language-selector></app-language-selector>
```

**Permissions:**
- ✅ Admins can change language
- ✅ Superusers can change language
- ❌ Regular users cannot change language

#### SettingsPageComponent
**Location:** `src/app/features/settings/pages/settings-page/settings-page.component.ts`

**Features:**
- Settings page with language selector
- General, Notifications, and Security sections
- Protected by admin guard
- Only accessible to admins/superusers

**Route:** `/settings`

### 5. Configuration

#### app.config.ts
Added translation module configuration:

```typescript
provideTranslateService({
  defaultLanguage: 'es-MX',
  loader: {
    provide: TranslateLoader,
    useClass: TranslateHttpLoader
  }
})
```

#### angular.json
Added assets configuration to include translation files:

```json
"assets": [
  {
    "glob": "**/*",
    "input": "public"
  },
  {
    "glob": "**/*",
    "input": "src/assets"
  }
]
```

### 6. Updated Components

#### HeaderComponent
- Added TranslateModule import
- Translated all navigation links
- Added Settings link (admin-only)
- Translated logout button

**Changes:**
```html
<!-- Before -->
<h1>Help Desk</h1>
<a>My Tickets</a>
<button>Logout</button>

<!-- After -->
<h1>{{ 'app.title' | translate }}</h1>
<a>{{ 'nav.myTickets' | translate }}</a>
<button>{{ 'auth.logout' | translate }}</button>
```

#### App Component
- Initialized TranslationService
- Added language to console startup info

### 7. Routing

Added settings route:

```typescript
{
  path: 'settings',
  canActivate: [authGuard, adminGuard],
  loadChildren: () => import('./features/settings/settings.routes')
}
```

## Usage Examples

### In Templates

```html
<!-- Simple translation -->
<h1>{{ 'app.title' | translate }}</h1>

<!-- Translation with parameters -->
<p>{{ 'filter.showing' | translate: {count: 5, total: 20} }}</p>

<!-- Async translation -->
<p>{{ 'ticket.title' | translate | async }}</p>

<!-- Attribute translation -->
<button [title]="'app.save' | translate">
  {{ 'app.save' | translate }}
</button>
```

### In TypeScript

```typescript
import { TranslationService } from './core/services/translation.service';

export class MyComponent {
  private translationService = inject(TranslationService);
  
  // Instant translation
  getMessage(): string {
    return this.translationService.instant('app.success');
  }
  
  // With parameters
  getCount(count: number): string {
    return this.translationService.instant('time.minutesAgo', { count });
  }
  
  // Observable translation
  getMessage$(): Observable<string> {
    return this.translationService.get('app.loading');
  }
  
  // Change language
  switchLanguage(lang: string): void {
    this.translationService.changeLanguage(lang);
  }
}
```

## Translation Keys Structure

### Example Keys

```json
{
  "app": {
    "title": "Sistema de Mesa de Ayuda",
    "save": "Guardar",
    "cancel": "Cancelar"
  },
  "ticket": {
    "status": "Estado",
    "priority": "Prioridad"
  },
  "validation": {
    "required": "Este campo es obligatorio",
    "minLength": "Debe tener al menos {{min}} caracteres"
  }
}
```

## Language Selection Flow

```
User visits Settings page
        ↓
Check if Admin/Superuser
        ↓
   [Yes]              [No]
    ↓                  ↓
Show language      Show language
selector           selector
(enabled)          (disabled)
    ↓                  ↓
Select language    Message:
    ↓              "Only admins can
Save to            change language"
localStorage
    ↓
Apply new language
    ↓
Show success message
```

## Features

✅ **Default Spanish (Mexico)** - Application starts in Spanish  
✅ **English Alternative** - Full English translation available  
✅ **Browser Language Detection** - Detects user's browser language  
✅ **LocalStorage Persistence** - Remembers language preference  
✅ **Admin-Only Control** - Only admins/superusers can change language  
✅ **Permission Validation** - Frontend and backend checks  
✅ **Success Feedback** - Visual confirmation on language change  
✅ **Error Handling** - Clear messages for unauthorized attempts  
✅ **Fallback Support** - Defaults to Spanish if preference not found  
✅ **Translation Pipe** - Easy-to-use template syntax  
✅ **TypeScript Support** - Programmatic translation access  
✅ **Parameter Support** - Dynamic values in translations  
✅ **RTL Ready** - Infrastructure for RTL languages (if needed)  

## Permission Matrix

| Role | View Settings | Change Language | Effect |
|------|--------------|-----------------|--------|
| Admin | ✅ Yes | ✅ Yes | Full access |
| Superuser | ✅ Yes | ✅ Yes | Full access |
| Regular User | ❌ No | ❌ No | No access to settings page |

## Adding New Languages

### Step 1: Create Translation File
```bash
# Create new language file
src/assets/i18n/fr.json
```

### Step 2: Add Translations
Copy structure from es-MX.json or en.json and translate all keys.

### Step 3: Update Service
```typescript
// translation.service.ts
private readonly AVAILABLE_LANGUAGES = ['es-MX', 'en', 'fr'];
```

### Step 4: Add Language Name
```typescript
getLanguageName(lang: string): string {
  const names: { [key: string]: string } = {
    'es-MX': 'Español (México)',
    'en': 'English',
    'fr': 'Français'  // Add new language
  };
  return names[lang] || lang;
}
```

## Testing

### Manual Testing

1. **Default Language:**
   - Clear localStorage
   - Refresh app
   - ✅ Should display in Spanish (es-MX)

2. **Language Switch (as Admin):**
   - Login as admin
   - Go to `/settings`
   - Change language to English
   - ✅ UI should update immediately
   - ✅ Preference saved in localStorage
   - ✅ Success message displayed

3. **Permission Check (as Regular User):**
   - Login as regular user
   - Try to access `/settings`
   - ✅ Should be redirected
   - ❌ Cannot access settings page

4. **Persistence:**
   - Change language to English
   - Refresh page
   - ✅ Should remain in English
   - ✅ Language persists across sessions

5. **Browser Language:**
   - Clear localStorage
   - Set browser to English
   - Refresh app
   - ✅ Should use English if available
   - ✅ Should fallback to Spanish otherwise

## Files Created

```
src/
├── assets/
│   └── i18n/
│       ├── es-MX.json          # Spanish translations
│       └── en.json             # English translations
├── app/
│   ├── core/
│   │   └── services/
│   │       └── translation.service.ts  # Translation service
│   ├── features/
│   │   └── settings/
│   │       ├── pages/
│   │       │   └── settings-page/
│   │       │       └── settings-page.component.ts  # Settings page
│   │       └── settings.routes.ts  # Settings routes
│   └── shared/
│       └── components/
│           └── language-selector/
│               └── language-selector.component.ts  # Language selector
```

## Files Modified

```
src/app/
├── app.config.ts               # Added translate configuration
├── app.routes.ts              # Added settings route
├── app.ts                     # Initialize translation service
├── shared/components/
│   └── header/
│       └── header.component.ts  # Added translations
└── angular.json               # Added assets configuration
```

## Best Practices

1. **Always use translation keys** - Never hardcode text in templates
2. **Organize keys logically** - Group by feature/section
3. **Use meaningful key names** - Make keys self-explanatory
4. **Include context** - Add parameters for dynamic content
5. **Test all languages** - Verify translations display correctly
6. **Keep files synchronized** - Ensure all languages have same keys
7. **Use proper locale codes** - Follow BCP 47 standard (es-MX, en-US)

## Troubleshooting

### Translations Not Loading
- Check browser console for errors
- Verify translation files are in `src/assets/i18n/`
- Ensure Angular assets configuration includes `src/assets`

### Language Not Changing
- Verify user has admin permissions
- Check localStorage for `app_language` key
- Clear browser cache and localStorage

### Missing Translations
- Check translation key exists in JSON file
- Verify key path is correct (e.g., 'app.title' not 'appTitle')
- Ensure both language files have the same keys

## Future Enhancements

1. **More Languages** - Add French, German, Portuguese, etc.
2. **Regional Variants** - Add es-ES, en-GB, etc.
3. **RTL Support** - Implement right-to-left languages
4. **Translation Management** - Admin UI to manage translations
5. **Pluralization** - Advanced plural forms handling
6. **Date/Number Formatting** - Locale-specific formatting
7. **Lazy Loading** - Load translation files on demand
8. **Translation Memory** - Reuse common translations

## Date
January 13, 2025
