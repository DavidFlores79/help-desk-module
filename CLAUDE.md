# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Enterprise help desk ticketing system frontend built with **Angular 20 (standalone components)** and **TailwindCSS**. Connects to a Laravel REST API backend.

## Commands

```bash
npm start              # Dev server on localhost:4200
npm run build          # Development build
npm run build:prod     # Production build (uses environment.prod.ts)
npm test               # Karma/Jasmine unit tests
npm run test:coverage  # Tests with coverage report
npm run lint           # ESLint check
npm run lint:fix       # ESLint auto-fix
npm run format         # Prettier format all source files
npm run format:check   # Prettier format check
```

Run a single spec file:
```bash
npx ng test --include='**/ticket.service.spec.ts'
```

`npm run lint` is currently broken: ESLint 9 finds no flat config, and the legacy `.eslintrc.json` points at the solution-style `tsconfig.json`, which includes no files. Until that is migrated, lint files with the legacy config and the real tsconfig:
```bash
ESLINT_USE_FLAT_CONFIG=false npx eslint --fix --parser-options=project:./tsconfig.app.json <files>   # app code
ESLINT_USE_FLAT_CONFIG=false npx eslint --fix --parser-options=project:./tsconfig.spec.json <files>  # specs
```

## Commit & PR Rules

> **STRICTLY FORBIDDEN**: Any commit message, PR title, PR description, or code comment must **never** reference AI tools, AI assistants, or AI companies. This includes but is not limited to:
> - Anthropic, Claude, Claude Code, or any Claude product
> - GitHub Copilot, ChatGPT, OpenAI, Gemini, or any other AI assistant
> - Phrases like "Generated with...", "AI-assisted", "Co-authored by AI"
> - `Co-Authored-By:` trailer lines pointing to any AI
>
> Keep all commit messages and PRs clean, professional, and written as if authored entirely by a human developer.

## Development Workflow (Custom Slash Commands)

This project uses a structured workflow with custom Claude commands defined in `.claude/commands/`:

```bash
# 1. Plan a feature (creates .claude/doc/{feature}/angular-frontend.md — NO code written)
/explore-plan "Feature description"

# 2. Create the branch manually
git checkout -b feat/feature-name develop

# 3. Start implementation (reads session plan, writes code, creates PR)
/start-working-on-branch-new feat/feature-name

# 4. Run tests
/run-tests              # all tests
/run-tests unit         # unit only
/run-tests coverage     # with coverage

# 5. Handle PR review feedback iteratively until merged
/update-feedback <pr-number>

# Bug investigation
/analyze_bug "Bug description"
```

**Branch strategy**: feature branches cut from `main`, PRs target `main`. (`develop` exists but `main` is the active integration branch.)
**Naming**: `feat/`, `fix/`, `refactor/`, `chore/` prefixes.

### Available Agents

The `angular-frontend-developer` agent (`.claude/agents/`) is used during `/explore-plan` for Angular planning. It:
- Proposes detailed implementation plans following Clean Architecture (UI → Domain → Business → Data layers)
- Saves plans to `.claude/doc/{feature_name}/angular-frontend.md`
- **Never writes actual code** — it produces plans only, consumed by `/start-working-on-branch-new`

## Architecture

### Feature-Based Structure

```
src/app/
├── core/              # Singleton services, models, guards, interceptors
│   ├── guards/        # authGuard, adminGuard (functional CanActivateFn)
│   ├── interceptors/  # Functional HttpInterceptorFn chain
│   ├── models/        # TypeScript interfaces (ticket.model.ts, auth.model.ts, api-response.model.ts)
│   └── services/      # All API communication (TicketService, AuthService, etc.)
├── core/
│   └── components/    # Non-feature components (e.g. RedirectWithParamsComponent for email links)
├── features/          # Feature areas with isolated routes
│   ├── auth/          # Login, register, forgot-password, reset-password
│   ├── ticketing/     # Ticket list, detail, new ticket (requires authGuard)
│   ├── admin/         # Admin dashboard, categories (requires authGuard + adminGuard)
│   └── settings/      # App settings (requires authGuard + adminGuard)
└── shared/            # Reusable UI: pipes, components (file-upload, header, attachment-viewer, responses-modal, confirmation-modal, language-selector)
```

### Key Patterns

**No NgModules** — all components are standalone with explicit imports. New features follow:
1. Create `features/{name}/` with `{name}.routes.ts` exporting `const {name}Routes: Routes`
2. Add lazy-loaded entry in `app.routes.ts` with appropriate guards
3. Pages (`pages/`) are smart components that inject services; components (`components/`) are dumb with `@Input()`/`@Output()`

**Service injection** — use `inject()`, not constructor DI:
```typescript
private http = inject(HttpClient);
```

**Interceptor chain** (order matters, configured in `app.config.ts`):
`loggingInterceptor → authInterceptor → retryInterceptor → errorInterceptor`

**Functional guards** — `authGuard` checks `AuthService.isAuthenticated()` signal; `adminGuard` checks role via `AuthService.isAdmin()`.

### Authentication & Roles

- End users (people who sign up and file tickets) are UADY students, teachers and staff, with emails on `uady.mx` or one of its subdomains. Which email domains may sign up (including whether public emails like Gmail are allowed) must stay configurable from Settings, never hardcoded. Domain rules apply to sign-up only, not login, since admin accounts may use other domains.
- JWT stored in `localStorage` as `auth_token`; user object as `auth_user`
- `AuthInterceptor` auto-attaches `Bearer {token}` header to all requests
- `401` responses auto-logout via `errorInterceptor` **only when not on an auth endpoint** (`/login`, `/register`, `/auth/*`) — prevents redirect loops during login
- Role is computed from the profile flags `user.my_profile.is_superuser` / `is_admin` → internal `UserRole` type: `'user' | 'admin' | 'superuser'`
- Auth routes: `login`, `register`, `verify-email`, `forgot-password`, `reset-password` (all public, no guard)
- **Sign-up never logs in.** `register` returns no token; the user confirms a 6-digit emailed code at `/auth/verify-email`, which sends email + password + code (the password stops someone else confirming an account they squatted). Login answers `403` with `email_verification_required: true` for an unconfirmed account, and the login form redirects to the same screen. The credentials travel between screens only in memory (`AuthService.setPendingVerification`), never in storage or the URL; after a reload the screen asks for them again.
- `/reportar` is printed on the help desk QR code: **never remove or rename it** (change only where it redirects). It leads to `/tickets/new`; logged-out visitors go to login with `?returnUrl=`, and login returns there (`safeReturnUrl` in `auth.guard.ts` only accepts in-app paths).
- Regular users get a short "Report a problem" ticket form (no priority, categories as chips) and land on it right after confirming their email; admins keep the full form.
- `RedirectWithParamsComponent` at `/reset-password` forwards email reset links from the backend to `/auth/reset-password` preserving query params

### API Response Shape

All API responses are wrapped:
```typescript
ApiResponse<T> = { success: boolean, message: string, data: T }
PaginatedResponse<T> = { current_page, data: T[], per_page, total, last_page }
```

API base URLs:
- Dev: `http://bitacora-mantenimiento.test.com/api` (`environment.ts`)
- Prod: configured in `environment.prod.ts`

Ticket endpoints under `/v1/tickets`:
- `GET /v1/tickets` — paginated list (filters: status, priority, assigned_to, page)
- `GET /v1/tickets/:id` — detail with responses and attachments
- `POST /v1/tickets` — create (JSON or FormData when attaching files)
- `PUT /v1/tickets/:id` — update
- `POST /v1/tickets/:id/responses` — add response (JSON or FormData)
- `POST /v1/tickets/:id/assign` — assign to user
- `POST /v1/tickets/:id/reopen` — reopen closed ticket

### File Upload Pattern

When sending tickets or responses with attachments, use `FormData`:
- Files go in `attachments[]` array fields
- Response body field must be named `body`
- `TicketService.createTicket()` and `addResponse()` handle JSON/FormData conditionally
- `shared/components/file-upload/` wraps FilePond and implements `ControlValueAccessor` for reactive forms

### Internationalization

- `TranslationService` loads JSON files from `assets/i18n/` via `fetch()` (bypasses HTTP interceptors)
- Initialized via `APP_INITIALIZER` before bootstrap; default language `es-MX`, also supports `en`
- Language preference stored in `localStorage` as `app_language`
- Use the `TranslatePipe` in templates: `{{ 'key.path' | translate }}`
- Translation keys use dot notation matching the JSON structure

### Design System (Tailwind)

- Fonts: Poppins (headings), Inter (body) via Google Fonts
- Custom color scales: primary (blue), success, danger, warning
- Utility classes: `.btn-primary`, `.btn-secondary`, `.card`, `.badge`, `.badge-{status}`, `.badge-{priority}`
- Breakpoints: `sm:640px`, `md:768px`, `lg:1024px` (hamburger menu below `lg`)
- Animations: `fadeIn`, `slideIn` defined in `styles.css`

## Code Style

- **Prettier**: 100 char line width, single quotes, Angular HTML parser for `.html` files
- **ESLint**: TypeScript strict rules
- TypeScript strict mode enabled (`tsconfig.json`)
- Run `npm run format` before committing

## Debugging

Services use `LoggerService` (not raw `console.*`) for structured, level-controlled logging:
- Level set in `environment.logLevel` (`'debug'` in dev, respects `'none'`/`'info'`/`'warn'`/`'error'` in prod)
- `logger.debug()` / `logger.info()` / `logger.warn()` / `logger.error()` / `logger.log(emoji, msg)`
- Logs are suppressed in production

Common issues:
- **Auth broken**: check `localStorage.getItem('auth_token')` and `auth_user`
- **File uploads failing**: verify payload is `FormData`, not JSON; check `attachments[]` field naming
- **Lazy route not loading**: ensure exported route array name matches the `then(m => m.{name}Routes)` import

## Documentation

Additional docs in `docs/`:
- `docs/guides/API_DOCUMENTATION.md` — complete API request/response examples
- `docs/guides/IMPLEMENTATION_GUIDE.md` — patterns and what has been built
- `docs/features/RESPONSIVE_DESIGN.md` — mobile/responsive details
- `docs/guides/TESTING_GUIDE.md` — manual testing procedures
- `docs/features/PDF_EXPORT_SUMMARY.md` — PDF export implementation
- `docs/features/ticket_resolution/` — ticket resolution flow implementation details
