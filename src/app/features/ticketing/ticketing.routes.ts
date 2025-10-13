import { Routes } from '@angular/router';

export const ticketingRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/tickets-page/tickets-page.component').then(m => m.TicketsPageComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/new-ticket-page/new-ticket-page.component').then(m => m.NewTicketPageComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/ticket-detail-page/ticket-detail-page.component').then(m => m.TicketDetailPageComponent)
  }
];
