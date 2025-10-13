import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../../core/services/ticket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Ticket } from '../../../../core/models/ticket.model';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { StatusBadgePipe } from '../../../../shared/pipes/status-badge.pipe';
import { PriorityBadgePipe } from '../../../../shared/pipes/priority-badge.pipe';

@Component({
  selector: 'app-tickets-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    HeaderComponent,
    TimeAgoPipe,
    StatusBadgePipe,
    PriorityBadgePipe
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header></app-header>

      <main class="max-w-7xl mx-auto px-4 py-8">
        <!-- Page Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-3xl font-heading font-bold text-gray-900">My Tickets</h2>
            <p class="text-gray-600 mt-1">Manage and track your support requests</p>
          </div>
          <a routerLink="/tickets/new" class="btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </a>
        </div>

        <!-- Filters -->
        <div class="card mb-6">
          <div class="flex flex-wrap gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select [(ngModel)]="filters.status" (change)="loadTickets()" class="input-field">
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="awaiting_user">Awaiting User</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select [(ngModel)]="filters.priority" (change)="loadTickets()" class="input-field">
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div class="flex items-end">
              <button (click)="clearFilters()" class="btn-secondary">Clear Filters</button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        }

        <!-- Tickets Grid -->
        @if (!isLoading && tickets.length > 0) {
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            @for (ticket of tickets; track ticket.id) {
              <div class="card hover:shadow-monday-lg transition-shadow duration-200 cursor-pointer"
                   [routerLink]="['/tickets', ticket.id]">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h3 class="text-lg font-heading font-semibold text-gray-900 mb-1">
                      {{ ticket.title }}
                    </h3>
                    <p class="text-sm text-gray-600 line-clamp-2">
                      {{ ticket.description }}
                    </p>
                  </div>
                  <span class="ml-4 text-xs text-gray-500">#{{ ticket.id }}</span>
                </div>

                <div class="flex items-center gap-2 mb-3">
                  <span [class]="ticket.status | statusBadge">
                    {{ ticket.status_label }}
                  </span>
                  <span [class]="ticket.priority | priorityBadge">
                    {{ ticket.priority_label }}
                  </span>
                  @if (ticket.category) {
                    <span class="badge badge-gray">
                      {{ ticket.category.name }}
                    </span>
                  }
                </div>

                <div class="flex items-center justify-between text-sm text-gray-500">
                  <div class="flex items-center gap-4">
                    @if (ticket.assignedTo) {
                      <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {{ ticket.assignedTo.name }}
                      </span>
                    }
                  </div>
                  <span>{{ ticket.created_at | timeAgo }}</span>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @if (!isLoading && tickets.length === 0) {
          <div class="card text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by creating a new support ticket.</p>
            <div class="mt-6">
              <a routerLink="/tickets/new" class="btn-primary">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create New Ticket
              </a>
            </div>
          </div>
        }

        <!-- Error State -->
        @if (errorMessage) {
          <div class="card bg-danger-50 border-danger-200">
            <p class="text-danger-700">{{ errorMessage }}</p>
            <button (click)="loadTickets()" class="btn-primary mt-4">Retry</button>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class TicketsPageComponent implements OnInit {
  private ticketService = inject(TicketService);
  private authService = inject(AuthService);

  tickets: Ticket[] = [];
  filters: any = {
    status: '',
    priority: ''
  };
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    console.log('📋 [TICKETS PAGE] Component initialized');
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filters = {
      ...(this.filters.status && { status: this.filters.status }),
      ...(this.filters.priority && { priority: this.filters.priority })
    };

    console.log('🔄 [TICKETS PAGE] Loading tickets with filters:', filters);

    this.ticketService.getTickets(filters).subscribe({
      next: (response) => {
        console.log('✅ [TICKETS PAGE] Tickets loaded:', response);
        this.tickets = response.data.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ [TICKETS PAGE] Failed to load tickets:', error);
        this.errorMessage = error.message || 'Failed to load tickets';
        this.isLoading = false;
      }
    });
  }

  clearFilters(): void {
    this.filters = {
      status: '',
      priority: ''
    };
    this.loadTickets();
  }
}
