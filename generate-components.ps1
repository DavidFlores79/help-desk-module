# PowerShell script to generate all Angular components
Write-Host "Generating Angular components..." -ForegroundColor Green

# Feature components
ng generate component features/ticketing/components/ticket-list --standalone --skip-tests
ng generate component features/ticketing/components/ticket-detail --standalone --skip-tests
ng generate component features/ticketing/components/ticket-form --standalone --skip-tests
ng generate component features/ticketing/components/ticket-card --standalone --skip-tests
ng generate component features/ticketing/components/response-list --standalone --skip-tests
ng generate component features/ticketing/pages/tickets-page --standalone --skip-tests
ng generate component features/ticketing/pages/ticket-detail-page --standalone --skip-tests
ng generate component features/ticketing/pages/new-ticket-page --standalone --skip-tests

# Admin components
ng generate component features/admin/components/admin-dashboard --standalone --skip-tests
ng generate component features/admin/components/ticket-table --standalone --skip-tests
ng generate component features/admin/components/assign-panel --standalone --skip-tests
ng generate component features/admin/pages/admin-page --standalone --skip-tests

# Auth components
ng generate component features/auth/components/login-form --standalone --skip-tests
ng generate component features/auth/pages/login-page --standalone --skip-tests

# Shared components
ng generate component shared/components/spinner --standalone --skip-tests
ng generate component shared/components/search-bar --standalone --skip-tests
ng generate component shared/components/filters --standalone --skip-tests
ng generate component shared/components/ticket-modal --standalone --skip-tests

Write-Host "Components generated successfully!" -ForegroundColor Green
