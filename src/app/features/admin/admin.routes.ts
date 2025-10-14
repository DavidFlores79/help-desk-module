import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/admin-page/admin-page.component').then(m => m.AdminPageComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/ticket-categories-page/ticket-categories-page.component').then(m => m.TicketCategoriesPageComponent)
  }
];
