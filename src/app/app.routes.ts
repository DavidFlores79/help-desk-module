import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { RedirectWithParamsComponent } from './core/components/redirect-with-params.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tickets',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'tickets',
    canActivate: [authGuard],
    loadChildren: () => import('./features/ticketing/ticketing.routes').then(m => m.ticketingRoutes)
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: 'settings',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/settings/settings.routes').then(m => m.settingsRoutes)
  },
  {
    path: 'reset-password',
    component: RedirectWithParamsComponent,
    data: { redirectTo: '/auth/reset-password' }
  },
  {
    path: '**',
    redirectTo: '/tickets'
  }
];
