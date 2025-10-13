import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/admin.guard';

export const settingsRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/settings-page/settings-page.component').then(m => m.SettingsPageComponent)
  }
];
