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
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { FormatResolutionTimePipe } from '../../../../shared/pipes/format-resolution-time-pipe';

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
    PriorityBadgePipe,
    TranslatePipe,
    FormatResolutionTimePipe
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header></app-header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 class="text-2xl sm:text-3xl font-heading font-bold text-gray-900">{{ 'ticket.myTickets' | translate }}</h2>
            <p class="text-sm sm:text-base text-gray-600 mt-1">{{ 'ticket.manageTickets' | translate }}</p>
          </div>
          <a routerLink="/tickets/new" class="btn-primary inline-flex items-center justify-center whitespace-nowrap">
            <svg class="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden sm:inline">{{ 'ticket.newTicket' | translate }}</span>
          </a>
        </div>

        <!-- Filters -->
        <div class="card mb-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'filter.status' | translate }}</label>
              <select [(ngModel)]="filters.status" (change)="loadTickets()" class="input-field text-sm">
                <option value="">{{ 'filter.allStatus' | translate }}</option>
                <option value="open">{{ 'status.open' | translate }}</option>
                <option value="assigned">{{ 'status.assigned' | translate }}</option>
                <option value="in_progress">{{ 'status.in_progress' | translate }}</option>
                <option value="awaiting_user">{{ 'status.pending' | translate }}</option>
                <option value="resolved">{{ 'status.resolved' | translate }}</option>
                <option value="closed">{{ 'status.closed' | translate }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'filter.priority' | translate }}</label>
              <select [(ngModel)]="filters.priority" (change)="loadTickets()" class="input-field text-sm">
                <option value="">{{ 'filter.allPriorities' | translate }}</option>
                <option value="low">{{ 'priority.low' | translate }}</option>
                <option value="medium">{{ 'priority.medium' | translate }}</option>
                <option value="high">{{ 'priority.high' | translate }}</option>
                <option value="urgent">{{ 'priority.urgent' | translate }}</option>
              </select>
            </div>

            <div class="flex items-end sm:col-span-2 lg:col-span-1">
              <button (click)="clearFilters()" class="btn-secondary w-full sm:w-auto">{{ 'filter.clearFilters' | translate }}</button>
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
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (ticket of tickets; track ticket.id) {
              <div class="card hover:shadow-monday-lg transition-shadow duration-200 cursor-pointer"
                   [routerLink]="['/tickets', ticket.id]">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-base sm:text-lg font-heading font-semibold text-gray-900 mb-1 truncate">
                      {{ ticket.title }}
                    </h3>
                    <p class="text-sm text-gray-600 line-clamp-2">
                      {{ ticket.description }}
                    </p>
                  </div>
                  <span class="ml-2 text-xs text-gray-500 flex-shrink-0">#{{ ticket.id }}</span>
                </div>

                <div class="flex flex-wrap items-center gap-2 mb-3">
                  <span [class]="ticket.status | statusBadge" class="text-xs">
                    {{ ticket.status_label }}
                  </span>
                  <span [class]="ticket.priority | priorityBadge" class="text-xs">
                    {{ ticket.priority_label }}
                  </span>
                  @if (ticket.ticketCategory || ticket.ticket_category) {
                    <span class="badge badge-gray text-xs">
                      {{ (ticket.ticketCategory || ticket.ticket_category)?.name }}
                    </span>
                  }
                </div>

                <div class="flex flex-col gap-2 text-xs sm:text-sm text-gray-500">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-3 flex-wrap">
                      <span class="flex items-center gap-1 truncate">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span class="truncate">{{ ticket.user.name || 'Unknown' }}</span>
                      </span>
                      @if (ticket.assignedTo) {
                        <span class="flex items-center gap-1 text-primary-600 truncate">
                          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span class="truncate">{{ ticket.assignedTo.name }}</span>
                        </span>
                      }
                    </div>
                    <span class="whitespace-nowrap">{{ ticket.created_at | timeAgo }}</span>
                  </div>

                  @if (ticket.status === 'resolved' || ticket.status === 'closed') {
                    <div class="flex flex-col gap-1 border-t border-gray-200 pt-2">
                      @if (ticket.resolution_hours) {
                        <div class="flex items-center justify-between">
                          <span class="text-xs text-gray-600">Tiempo Resolución:</span>
                          <span class="text-xs font-medium text-blue-600">{{ ticket.resolution_hours | formatResolutionTime }}</span>
                        </div>
                      }
                      @if (ticket.reopens && ticket.reopens > 0) {
                        <div class="flex items-center justify-between">
                          <span class="text-xs text-gray-600">Reaperturas:</span>
                          <span class="text-xs font-medium text-orange-600">🔄 {{ ticket.reopens }} {{ ticket.reopens === 1 ? 'vez' : 'veces' }}</span>
                        </div>
                      }
                    </div>
                  }
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
            <h3 class="mt-2 text-sm font-medium text-gray-900">{{ 'ticket.noTickets' | translate }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ 'ticket.getStartedMessage' | translate }}</p>
            <div class="mt-6">
              <a routerLink="/tickets/new" class="btn-primary inline-flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                {{ 'ticket.createNewTicket' | translate }}
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
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filters = {
      ...(this.filters.status && { status: this.filters.status }),
      ...(this.filters.priority && { priority: this.filters.priority })
    };

    this.ticketService.getTickets(filters).subscribe({
      next: (response) => {
        this.tickets = response.data.data || [];
        this.isLoading = false;
      },
      error: (error) => {
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
