# Help Desk Module - AI Agent Instructions

## Project Overview
Enterprise help desk ticketing system built with **Angular 20 (standalone components)** and **TailwindCSS**. Uses Clean Architecture with feature-based organization and functional route guards/interceptors.

## Key Architecture Patterns

### 1. Standalone Components Architecture
- **No NgModules** - All components are standalone with explicit imports
- Feature routes use `loadChildren` with exported `Routes` arrays (e.g., `ticketingRoutes`, `adminRoutes`)
- Example feature route pattern:
  ```typescript
  export const ticketingRoutes: Routes = [
    { path: '', loadComponent: () => import('./pages/...).then(m => m.Component) }
  ];
  ```

### 2. Functional Interceptors & Guards
- Use **HttpInterceptorFn** (not class-based): `(req, next) => { ... }`
- Use **CanActivateFn** (not class-based): `(route, state) => { ... }`
- Interceptor chain order in `app.config.ts`: `loggingInterceptor → authInterceptor → retryInterceptor → errorInterceptor`
- Guards: `authGuard` checks authentication, `adminGuard` checks admin role via user profile

### 3. Service Layer with inject()
- All services use `inject()` instead of constructor DI:
  ```typescript
  private http = inject(HttpClient);
  private router = inject(Router);
  ```
- Services in `core/services/` handle all API communication
- API base URL: `http://bitacora-mantenimiento.test.com/api` (dev)
- Auth token stored in localStorage as `auth_token`, user as `auth_user`

### 4. File Upload Pattern (Critical!)
When creating/updating tickets or responses with attachments:
- Use `FormData` for multipart requests with files
- Check `TicketService.createTicket()` and `addResponse()` for reference implementation
- Handle both JSON and FormData payloads conditionally
- FilePond wrapper component: `shared/components/file-upload/` implements `ControlValueAccessor`
- Attachment model has both `filename` (API) and `name` (display) properties

## Data Flow & Models

### Ticket Model Structure
Located in `core/models/ticket.model.ts`:
- Status types: `'open' | 'assigned' | 'in_progress' | 'awaiting_user' | 'resolved' | 'closed'`
- Priority types: `'low' | 'medium' | 'high' | 'urgent'`
- User has `my_profile` or `profile` with role info (e.g., "Administrador", "Usuario")
- Attachments have `filename`, `original_name`, and display alias `name`

### API Response Wrapper
All API responses use `ApiResponse<T>` wrapper with pagination support:
```typescript
{ success: boolean, message: string, data: T }
PaginatedResponse<T> = { current_page, data: T[], per_page, total, ... }
```

## Critical Components

### Smart vs. Dumb Pattern
- **Pages** (`features/*/pages/`): Smart components that inject services, manage state
- **Components** (`features/*/components/` & `shared/components/`): Dumb components using `@Input()` and `@Output()`

### Shared Components Library
- `file-upload`: FilePond integration with `ControlValueAccessor` for reactive forms
- `header`: Responsive header with hamburger menu (toggle at `lg` breakpoint 1024px)
- `attachment-viewer`: Displays file attachments with download links
- `responses-modal`: Modal for viewing/adding ticket responses
- `language-selector`: i18n language switcher (es-MX default, en available)

### Responsive Design
- Mobile-first with Tailwind breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- Hamburger menu active below `lg` breakpoint
- Mobile menu prevents body scroll: `document.body.style.overflow = 'hidden'`
- Grid layouts: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- See `docs/features/RESPONSIVE_DESIGN.md` for full specification

## Development Workflow

### Running the App
```bash
npm start              # Dev server on localhost:4200
npm run build:prod     # Production build with environment.prod.ts
npm test               # Karma/Jasmine unit tests
npm run test:coverage  # Tests with coverage report
```

### Environment Configuration
- `environments/environment.ts` (dev): API at `bitacora-mantenimiento.test.com`
- `environments/environment.prod.ts` (prod): API at `bitacoraenf.enlacetecnologias.mx`
- File replacements configured in `angular.json` build configurations

### Code Style
- **Prettier** configured with 100 char line width, single quotes, Angular HTML parser
- **ESLint** with TypeScript rules enabled
- Run `npm run format` before committing, `npm run lint:fix` for auto-fixes
- TypeScript strict mode enabled in `tsconfig.json`

## Testing & Debugging

### Test Credentials (from docs)
- Regular user: `user@example.com` / `password`
- Admin: `admin@example.com` / `password`

### Console Logging Strategy
Services use structured console logs for debugging:
- `📤 [SERVICE NAME]` for outgoing requests
- `✅` for success, `❌` for errors
- Check `LoggingInterceptor` for HTTP request/response logs
- Example: `console.log('📤 [TICKET SERVICE] Creating ticket')`

### Common Issues
- **Auth issues**: Check `localStorage.getItem('auth_token')` and `auth_user`
- **File uploads failing**: Verify payload is `FormData`, not JSON
- **Routes not loading**: Check lazy-loaded route exports match naming convention
- **Interceptor not firing**: Verify order in `app.config.ts` providers array

## Internationalization (i18n)

### Translation Service Pattern
- `TranslationService` loads JSON from `assets/i18n/` using `fetch()` (bypasses interceptors)
- Default language: `es-MX`, available: `en`
- Initialized via `APP_INITIALIZER` in `app.config.ts` before app bootstrap
- Custom `TranslatePipe` for template translations: `{{ 'key.path' | translate }}`
- Language stored in localStorage as `app_language`

### Translation File Structure
Keys follow dot notation (e.g., `"tickets.list.title": "My Tickets"`)
Located in `src/assets/i18n/{lang}.json`

## API Integration Notes

### Authentication Flow
1. POST to `/api/login` with credentials
2. Receive `{ token, user }` response
3. Store in localStorage via `AuthService.login()`
4. `AuthInterceptor` auto-attaches `Bearer {token}` to all requests
5. `AuthGuard` checks token presence, redirects to `/auth/login` if missing

### Ticket Endpoints (REST API v1)
- `GET /v1/tickets` - List with filters (status, priority, assigned_to)
- `GET /v1/tickets/:id` - Single ticket details
- `POST /v1/tickets` - Create (supports FormData for attachments)
- `PUT /v1/tickets/:id` - Update ticket
- `POST /v1/tickets/:id/responses` - Add response (supports FormData)
- See `docs/guides/API_DOCUMENTATION.md` for complete request/response examples

## Custom Tailwind Configuration

### Design System
- **Fonts**: Poppins (headings), Inter (body text) via Google Fonts
- **Colors**: Custom primary (blue), success (green), danger (red), warning (yellow) with 50-900 scales
- **Utility Classes**: `.btn-primary`, `.btn-secondary`, `.card`, `.badge`, `.badge-{status/priority}`
- **Animations**: `fadeIn`, `slideIn` defined in `styles.css`

### Mobile Optimizations
- Touch targets minimum 44px for tap actions
- Text scales from `text-sm` (mobile) to `text-base` (desktop)
- Form inputs full-width on mobile, constrained on desktop
- Modals slide up on mobile, center on desktop

## File Structure Conventions

```
src/app/
├── core/              # Singleton services, models, guards, interceptors (app-wide)
├── features/          # Feature modules with isolated routes/components
│   └── {feature}/
│       ├── {feature}.routes.ts
│       ├── pages/     # Smart components with routing
│       └── components/ # Feature-specific dumb components
└── shared/            # Reusable UI components, pipes, directives
```

When creating new features:
1. Create feature folder in `features/`
2. Define route array as `export const {feature}Routes: Routes = [...]`
3. Add lazy-loaded route in `app.routes.ts`
4. Add guards to route if authentication/authorization needed

## Documentation Resources

- `docs/guides/QUICK_START.md` - New developer onboarding
- `docs/guides/API_DOCUMENTATION.md` - Complete API request/response examples
- `docs/guides/IMPLEMENTATION_GUIDE.md` - What's been built and patterns used
- `docs/features/RESPONSIVE_DESIGN.md` - Mobile/responsive implementation details
- `docs/guides/TESTING_GUIDE.md` - Manual testing procedures and expected behaviors
