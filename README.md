# Help Desk Module - Production-Ready Angular Application

A comprehensive, enterprise-grade help desk ticketing system built with Angular 20 (LTS), TailwindCSS, and following Clean Architecture principles.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Code Quality](#code-quality)
- [Additional Documentation](#additional-documentation)

## ✨ Features

### User Features
- **Ticket Management**: Create, view, update, and delete support tickets
- **File Uploads**: Drag-and-drop file attachments with FilePond integration
- **Real-time Status**: Track ticket status and priority
- **Response System**: Add responses and view conversation history
- **Filtering & Search**: Advanced filtering by status, priority, and assignee
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Admin Features
- **Ticket Assignment**: Assign tickets to support staff
- **Status Management**: Update ticket status and priority
- **Internal Notes**: Add internal notes invisible to users
- **Dashboard**: Overview of tickets and metrics
- **Bulk Operations**: Manage multiple tickets efficiently

### Technical Features
- **TypeScript Strict Mode**: Full type safety across the application
- **Reactive Forms**: Form validation with reactive patterns
- **HTTP Interceptors**: Authentication, error handling, retry logic, and logging
- **Route Guards**: Role-based access control
- **RxJS**: Async data flows with observables
- **Clean Architecture**: Separation of concerns across layers
- **SOLID Principles**: Maintainable and scalable code

## 🏗️ Architecture

The application follows Clean Architecture with clear separation of concerns:

```
src/app/
├── core/                    # Core business logic and services
│   ├── models/             # Domain models and interfaces
│   ├── services/           # Business logic services
│   ├── interceptors/       # HTTP interceptors
│   └── guards/             # Route guards
├── features/               # Feature modules
│   ├── ticketing/         # User ticketing feature
│   ├── admin/             # Admin management feature
│   └── auth/              # Authentication feature
└── shared/                 # Shared components and utilities
    ├── components/        # Reusable UI components
    ├── pipes/             # Custom pipes
    └── directives/        # Custom directives
```

### Layers

1. **Presentation Layer** (`features/*/pages` & `features/*/components`)
   - Smart components (pages) manage state
   - Dumb components (UI components) receive data via inputs

2. **Domain Layer** (`core/models`)
   - TypeScript interfaces for domain entities
   - DTOs for API communication

3. **Business Logic Layer** (`core/services`)
   - Services encapsulate business logic
   - Dependency injection for testability

4. **Data Layer** (`core/services` with HttpClient)
   - API communication
   - Data transformation and mapping

## 🛠️ Tech Stack

### Core
- **Angular**: 20.3.0 (LTS)
- **TypeScript**: 5.9.2
- **RxJS**: 7.8.0

### Styling
- **Tailwind CSS**: 3.x
- **PostCSS & Autoprefixer**
- **Custom Design System**: Monday-like visual language
- **Google Fonts**: Poppins (headings), Inter (body)

### Forms & Validation
- **Reactive Forms**
- **FilePond**: File upload with chunking support
- **Custom Validators**

### Testing (To be implemented)
- **Karma & Jasmine**: Unit testing
- **Cypress**: End-to-end testing
- **Jest**: Alternative test runner

### Code Quality
- **ESLint**: TypeScript linting
- **Prettier**: Code formatting
- **Strict TypeScript**: Maximum type safety

## 📁 Project Structure

```
help-desk-module/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── admin.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── error.interceptor.ts
│   │   │   │   ├── retry.interceptor.ts
│   │   │   │   └── logging.interceptor.ts
│   │   │   ├── models/
│   │   │   │   ├── ticket.model.ts
│   │   │   │   ├── auth.model.ts
│   │   │   │   └── api-response.model.ts
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── ticket.service.ts
│   │   │       ├── user.service.ts
│   │   │       └── category.service.ts
│   │   ├── features/
│   │   │   ├── ticketing/
│   │   │   │   ├── components/
│   │   │   │   ├── pages/
│   │   │   │   └── ticketing.routes.ts
│   │   │   ├── admin/
│   │   │   │   ├── components/
│   │   │   │   ├── pages/
│   │   │   │   └── admin.routes.ts
│   │   │   └── auth/
│   │   │       ├── components/
│   │   │       ├── pages/
│   │   │       └── auth.routes.ts
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── file-upload/
│   │   │   │   ├── ticket-card/
│   │   │   │   ├── filters/
│   │   │   │   └── search-bar/
│   │   │   └── pipes/
│   │   │       ├── time-ago.pipe.ts
│   │   │       ├── status-badge.pipe.ts
│   │   │       └── priority-badge.pipe.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles.css
│   └── index.html
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── angular.json
├── package.json
├── .eslintrc.json
├── .prettierrc.json
├── TICKETING_API_REQUESTS.md
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Angular CLI >= 20.x

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd help-desk-module
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
# Update src/environments/environment.ts with your API URL
```

4. Start development server:
```bash
npm start
# or
ng serve
```

5. Open your browser and navigate to `http://localhost:4200/`

## 📚 API Documentation

The application integrates with the Ticketing API documented in `TICKETING_API_REQUESTS.md`.

### Base URLs
- **Development**: `http://bitacora-mantenimiento.test.com/api/v1`
- **Production**: `https://bitacoraenf.enlacetecnologias.mx/api/v1`

### Authentication
All requests require Bearer token authentication:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Key Endpoints

#### Tickets
- `GET /tickets` - List all tickets (with filters)
- `GET /tickets/{id}` - Get ticket details
- `POST /tickets` - Create new ticket
- `PUT /tickets/{id}` - Update ticket
- `DELETE /tickets/{id}` - Delete ticket (soft delete)

#### Responses
- `POST /tickets/{id}/responses` - Add response to ticket

#### Assignment (Admin only)
- `POST /tickets/{id}/assign` - Assign ticket to user

#### Reopen
- `POST /tickets/{id}/reopen` - Reopen closed ticket

For detailed request/response examples, see `TICKETING_API_REQUESTS.md`.

## 💻 Development

### Code Generation

Generate new components:
```bash
ng generate component features/ticketing/components/my-component --standalone
```

Generate services:
```bash
ng generate service core/services/my-service
```

### Development Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes following coding standards
3. Run linter: `npm run lint`
4. Format code: `npm run format`
5. Run tests: `npm test`
6. Commit changes with descriptive message
7. Push and create pull request

### Environment Configuration

Update `src/environments/environment.ts` for development:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
  // ... other config
};
```

Update `src/environments/environment.prod.ts` for production.

## 🧪 Testing

### Unit Tests

Run unit tests with Karma:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

### E2E Tests

Run end-to-end tests with Cypress:
```bash
npm run e2e
```

### Testing Guidelines

- Test components in isolation
- Mock dependencies and services
- Test user interactions
- Achieve >80% code coverage
- Test error scenarios

## 📦 Building

### Development Build
```bash
ng build
```

### Production Build
```bash
ng build --configuration production
```

Build artifacts will be stored in the `dist/` directory.

### Build Optimization
- AOT compilation
- Tree shaking
- Minification
- Lazy loading modules
- Asset optimization

## 🚀 Deployment

### Environment Setup

1. Build for production:
```bash
npm run build:prod
```

2. Deploy `dist/` directory to your hosting service

### Deployment Options

#### Static Hosting (Netlify, Vercel, AWS S3)
```bash
# Build
npm run build:prod

# Deploy dist folder
netlify deploy --prod --dir=dist/help-desk-module/browser
```

#### Docker
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

FROM nginx:alpine
COPY --from=build /app/dist/help-desk-module/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Server Configuration

For Angular routing to work, configure your server to redirect all requests to `index.html`:

**Nginx**:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache** (.htaccess):
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## 🎨 Code Quality

### Linting

Run ESLint:
```bash
npm run lint
```

Fix lint issues:
```bash
npm run lint:fix
```

### Formatting

Run Prettier:
```bash
npm run format
```

Check formatting:
```bash
npm run format:check
```

### Commit Standards

Follow conventional commits:
```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Code style changes
refactor: Code refactoring
test: Test changes
chore: Build process or auxiliary tool changes
```

## 📖 Component Documentation

### Ticket Card Component

```typescript
@Component({
  selector: 'app-ticket-card',
  standalone: true,
  // ...
})
export class TicketCardComponent {
  @Input({ required: true }) ticket!: Ticket;
  @Output() cardClick = new EventEmitter<Ticket>();
}
```

### File Upload Component

FilePond wrapper integrated with Reactive Forms:
```typescript
<app-file-upload
  formControlName="attachments"
  [maxFiles]="5"
  [maxFileSize]="'10MB'"
  [acceptedFileTypes]="['image/*', 'application/pdf']"
></app-file-upload>
```

## 🔒 Security

- Token-based authentication
- HTTP-only cookies (if implemented)
- XSS protection via Angular sanitization
- CSRF protection
- Role-based access control
- Secure HTTP interceptors

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Authors

- Development Team

## 📞 Support

For support, contact the development team or create an issue in the repository.

## 📚 Additional Documentation

More detailed guides and documentation can be found in the `/docs` directory:
- **Development Guides**: `/docs/guides/` - Testing, debugging, implementation guides
- **API Documentation**: `TICKETING_API_REQUESTS.md` - Complete API reference
- **Historical Records**: `/docs/archive/` - Past fixes and feature implementations

See `/docs/README.md` for a complete documentation index.

---

Built with ❤️ using Angular and TailwindCSS