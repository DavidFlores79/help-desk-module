import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../../core/services/ticket.service';
import { TicketCategoryService } from '../../../../core/services/ticket-category.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { Ticket, TicketCategory, TicketStatus } from '../../../../core/models/ticket.model';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { StatusBadgePipe } from '../../../../shared/pipes/status-badge.pipe';
import { PriorityBadgePipe } from '../../../../shared/pipes/priority-badge.pipe';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HeaderComponent,
    TimeAgoPipe,
    StatusBadgePipe,
    PriorityBadgePipe,
    TranslatePipe
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header></app-header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <!-- Page Header -->
        <div class="mb-4 sm:mb-6">
          <h2 class="text-2xl sm:text-3xl font-heading font-bold text-gray-900">{{ 'admin.dashboard' | translate }}</h2>
          <p class="text-sm sm:text-base text-gray-600 mt-1">{{ 'admin.manageAllTickets' | translate }}</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div class="card bg-blue-50 border-blue-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm text-blue-600 font-medium">{{ 'admin.totalTickets' | translate }}</p>
                <p class="text-xl sm:text-2xl font-bold text-blue-900">{{ stats.total }}</p>
              </div>
              <svg class="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <div class="card bg-yellow-50 border-yellow-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm text-yellow-600 font-medium">{{ 'admin.open' | translate }}</p>
                <p class="text-xl sm:text-2xl font-bold text-yellow-900">{{ stats.open }}</p>
              </div>
              <svg class="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div class="card bg-purple-50 border-purple-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm text-purple-600 font-medium">{{ 'admin.inProgress' | translate }}</p>
                <p class="text-xl sm:text-2xl font-bold text-purple-900">{{ stats.inProgress }}</p>
              </div>
              <svg class="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          <div class="card bg-green-50 border-green-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm text-green-600 font-medium">{{ 'admin.resolved' | translate }}</p>
                <p class="text-xl sm:text-2xl font-bold text-green-900">{{ stats.resolved }}</p>
              </div>
              <svg class="w-8 h-8 sm:w-10 sm:h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="card mb-4 sm:mb-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <select [(ngModel)]="filters.priority" (change)="loadTickets()" class="input-field">
                <option value="">{{ 'filter.allPriorities' | translate }}</option>
                <option value="low">{{ 'priority.low' | translate }}</option>
                <option value="medium">{{ 'priority.medium' | translate }}</option>
                <option value="high">{{ 'priority.high' | translate }}</option>
                <option value="urgent">{{ 'priority.urgent' | translate }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'filter.assignedTo' | translate }}</label>
              <select [(ngModel)]="filters.assigned_to" (change)="loadTickets()" class="input-field">
                <option value="">{{ 'filter.allTechnicians' | translate }}</option>
                <option value="unassigned">{{ 'assignment.unassigned' | translate }}</option>
                @for (tech of technicians; track tech.id) {
                  <option [value]="tech.id">{{ tech.name }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'filter.period' | translate }}</label>
              <select [(ngModel)]="filters.period" (change)="onPeriodChange()" class="input-field text-sm">
                <option value="">{{ 'filter.allTime' | translate }}</option>
                <option value="this_month">{{ 'filter.thisMonth' | translate }}</option>
                <option value="last_month">{{ 'filter.lastMonth' | translate }}</option>
                <option value="this_semester">{{ 'filter.thisSemester' | translate }}</option>
                <option value="last_semester">{{ 'filter.lastSemester' | translate }}</option>
                <option value="custom">{{ 'filter.customRange' | translate }}</option>
              </select>
            </div>

            <div class="flex items-end">
              <button (click)="clearFilters()" class="btn-secondary w-full">{{ 'filter.clearFilters' | translate }}</button>
            </div>
          </div>

          @if (filters.period === 'custom') {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'filter.dateFrom' | translate }}</label>
                <input type="date" [(ngModel)]="filters.date_from" (change)="loadTickets()" class="input-field text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'filter.dateTo' | translate }}</label>
                <input type="date" [(ngModel)]="filters.date_to" (change)="loadTickets()" class="input-field text-sm" />
              </div>
            </div>
          }
        </div>

        <!-- Export Button -->
        <div class="mb-4 sm:mb-6 flex justify-end">
          <button
            (click)="exportPdf()"
            [disabled]="isLoading"
            class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ 'admin.exportPdf' | translate }}
          </button>
        </div>

        <!-- Tickets Table -->
        <div class="card overflow-hidden">
          @if (isLoading) {
            <div class="flex items-center justify-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ 'admin.ticket' | translate }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resolved
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @if (tickets.length === 0) {
                    <tr>
                      <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                        No tickets found
                      </td>
                    </tr>
                  }
                  @for (ticket of tickets; track ticket.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4">
                        <div class="flex items-start">
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{ ticket.title }}</p>
                            <p class="text-sm text-gray-500">#{{ ticket.id }} - {{ ticket.user.name || ticket.createdBy?.name || 'Unknown' }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <select
                          (change)="onCategoryChangeEvent(ticket, $event)"
                          class="text-xs px-2 py-1 border border-gray-300 rounded bg-white">
                          <option [value]="''" [selected]="!getSelectedCategoryId(ticket.id)">No category</option>
                          @for (cat of ticketCategories; track cat.id) {
                            <option [value]="String(cat.id)" [selected]="getSelectedCategoryId(ticket.id) === String(cat.id)">{{ cat.name }}</option>
                          }
                        </select>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span [class]="ticket.status | statusBadge">
                          {{ ticket.status_label }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span [class]="ticket.priority | priorityBadge">
                          {{ ticket.priority_label }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        @if (!ticket.assignedTo && !ticket.assigned_to) {
                          <select
                            (change)="assignTicket(ticket, $event)"
                            class="text-sm border-gray-300 rounded-md">
                            <option value="">Assign to...</option>
                            @for (tech of technicians; track tech.id) {
                              <option [value]="tech.id">{{ tech.name }}</option>
                            }
                          </select>
                        } @else {
                          <div class="flex items-center gap-2">
                            <span class="text-sm text-gray-900">{{ getAssignedUserName(ticket) }}</span>
                            <button
                              (click)="reassignTicket(ticket)"
                              class="text-xs text-primary-600 hover:text-primary-700"
                              title="Reassign">
                              Change
                            </button>
                          </div>
                        }
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ ticket.created_at | timeAgo }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        @if (ticket.resolved_at && (ticket.status === 'resolved' || ticket.status === 'closed')) {
                          <span class="text-green-600 font-medium">{{ ticket.resolved_at | timeAgo }}</span>
                        } @else {
                          <span class="text-gray-400">—</span>
                        }
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <a [routerLink]="['/tickets', ticket.id]"
                           class="text-primary-600 hover:text-primary-700 mr-4">
                          View
                        </a>
                        @if (ticket.status !== 'closed' && ticket.status !== 'resolved') {
                          <button
                            (click)="openStatusModal(ticket)"
                            class="text-gray-600 hover:text-gray-700">
                            Update
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </main>
    </div>

    <!-- Status Modal -->
    @if (statusTicket) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closeStatusModal()">
        <div
          class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-status-title"
          (click)="$event.stopPropagation()">
          <h3 id="admin-status-title" class="text-lg font-semibold text-gray-900">{{ 'ticket.updateStatus' | translate }}</h3>
          <p class="text-sm text-gray-500 mb-4 break-words">#{{ statusTicket.id }} - {{ statusTicket.title }}</p>

          <label for="admin-ticket-status" class="block text-sm font-medium text-gray-700 mb-2">
            {{ 'ticket.status' | translate }}
          </label>
          <select #statusSelect id="admin-ticket-status" [(ngModel)]="selectedStatus" class="input-field">
            @for (status of statusOptions; track status) {
              <option [value]="status">{{ 'status.' + status | translate }}</option>
            }
          </select>

          @if (selectedStatus === 'closed') {
            <p class="mt-3 p-3 text-sm text-warning-700 bg-warning-50 border border-warning-200 rounded-lg">
              {{ 'ticket.confirmClose' | translate }}
            </p>
          }

          @if (statusError) {
            <p class="mt-3 p-3 text-sm text-danger-700 bg-danger-50 border border-danger-200 rounded-lg">{{ statusError }}</p>
          }

          <div class="flex gap-3 justify-end mt-6">
            <button type="button" (click)="closeStatusModal()" class="btn-secondary" [disabled]="isUpdatingStatus">
              {{ 'app.cancel' | translate }}
            </button>
            <button
              type="button"
              (click)="saveStatus()"
              class="btn-primary"
              [disabled]="isUpdatingStatus || selectedStatus === statusTicket.status">
              {{ isUpdatingStatus ? ('app.saving' | translate) : ('app.save' | translate) }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Error Toast -->
    @if (errorMessage) {
      <div class="fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-md z-50 flex items-start gap-3 p-4 bg-danger-50 border border-danger-200 rounded-lg shadow-lg" role="alert">
        <p class="flex-1 text-sm text-danger-700">{{ errorMessage }}</p>
        <button
          type="button"
          (click)="errorMessage = ''"
          class="text-danger-700 hover:text-danger-900"
          [attr.aria-label]="'app.close' | translate">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    }
  `
})
export class AdminPageComponent implements OnInit {
  private ticketService = inject(TicketService);
  private ticketCategoryService = inject(TicketCategoryService);
  private userService = inject(UserService);
  private translationService = inject(TranslationService);
  authService = inject(AuthService);

  // Make String available in template
  String = String;

  tickets: Ticket[] = [];
  technicians: any[] = [];
  ticketCategories: TicketCategory[] = [];
  selectedCategories: Map<number, string> = new Map();
  filters: any = {
    status: '',
    priority: '',
    assigned_to: '',
    period: '',
    date_from: '',
    date_to: ''
  };
  stats = {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  };
  isLoading = false;
  errorMessage = '';

  readonly statusOptions: TicketStatus[] = [
    'open',
    'assigned',
    'in_progress',
    'awaiting_user',
    'resolved',
    'closed'
  ];
  statusTicket: Ticket | null = null;
  selectedStatus: TicketStatus = 'open';
  statusError = '';
  isUpdatingStatus = false;

  // Focus the status picker as soon as the modal renders
  @ViewChild('statusSelect') set statusSelect(select: ElementRef<HTMLSelectElement> | undefined) {
    select?.nativeElement.focus();
  }

  ngOnInit(): void {
    this.loadTechnicians();
    this.loadTicketCategories();
    this.loadTickets();
  }

  loadTicketCategories(): void {
    this.ticketCategoryService.getTicketCategories(false).subscribe({
      next: (response) => {
        this.ticketCategories = response.data || [];
      },
      error: () => {}
    });
  }

  loadTechnicians(): void {
    this.userService.getAdminsAndSuperUsers().subscribe({
      next: (response) => {
        const allUsers = response.data?.data || [];
        this.technicians = allUsers.filter(user =>
          user.profile_id === 1 || user.profile_id === 2
        );
      },
      error: () => {}
    });
  }

  loadTickets(): void {
    this.isLoading = true;

    const filters = {
      ...(this.filters.status && { status: this.filters.status }),
      ...(this.filters.priority && { priority: this.filters.priority }),
      ...(this.filters.assigned_to && { assigned_to: this.filters.assigned_to }),
      ...(this.filters.date_from && { date_from: this.filters.date_from }),
      ...(this.filters.date_to && { date_to: this.filters.date_to })
    };

    this.ticketService.getTickets(filters).subscribe({
      next: (response) => {
        this.tickets = response.data.data || [];

        this.selectedCategories.clear();
        this.tickets.forEach(ticket => {
          const category = ticket.ticketCategory || ticket.ticket_category;
          const categoryId = category ? String(category.id) : '';
          this.selectedCategories.set(ticket.id, categoryId);
        });

        this.calculateStats();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.tickets.length;
    this.stats.open = this.tickets.filter(t => t.status === 'open' || t.status === 'assigned').length;
    this.stats.inProgress = this.tickets.filter(t => t.status === 'in_progress').length;
    this.stats.resolved = this.tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  }

  assignTicket(ticket: Ticket, event: Event): void {
    const userId = (event.target as HTMLSelectElement).value;
    if (!userId) return;

    this.errorMessage = '';

    this.ticketService.assignTicket(ticket.id, { assigned_to: +userId }).subscribe({
      next: () => {
        this.loadTickets();
      },
      error: (error) => {
        this.errorMessage = error.message || this.translationService.instant('assignment.assignmentError');
        // Reload so the row shows the assignment the server still has
        this.loadTickets();
      }
    });
  }

  reassignTicket(ticket: Ticket): void {
    // Clear assignment and show dropdown again
    ticket.assignedTo = null;
    ticket.assigned_to = null;
  }

  getAssignedUserName(ticket: Ticket): string {
    // Try to get the name from assignedTo object
    if (ticket.assignedTo && typeof ticket.assignedTo === 'object') {
      return ticket.assignedTo.name || 'Unknown';
    }

    // If assigned_to is a number (ID), try to find the user in technicians list
    if (ticket.assigned_to && typeof ticket.assigned_to === 'number') {
      const tech = this.technicians.find(t => t.id === ticket.assigned_to);
      if (tech) return tech.name;
      return `User #${ticket.assigned_to}`;
    }

    // If assigned_to is an object (API snake_case)
    if (ticket.assigned_to && typeof ticket.assigned_to === 'object') {
      return (ticket.assigned_to as any).name || 'Unknown';
    }

    return 'Unassigned';
  }

  openStatusModal(ticket: Ticket): void {
    // Resolved and closed tickets are reopened from the ticket detail page
    if (ticket.status === 'resolved' || ticket.status === 'closed') return;

    this.statusTicket = ticket;
    this.selectedStatus = ticket.status;
    this.statusError = '';
  }

  @HostListener('document:keydown.escape')
  closeStatusModal(): void {
    if (!this.statusTicket || this.isUpdatingStatus) return;
    this.statusTicket = null;
  }

  saveStatus(): void {
    const ticket = this.statusTicket;
    if (!ticket || this.isUpdatingStatus || this.selectedStatus === ticket.status) return;

    this.isUpdatingStatus = true;
    this.statusError = '';
    this.errorMessage = '';

    this.ticketService.changeStatus(ticket.id, this.selectedStatus).subscribe({
      next: () => {
        this.isUpdatingStatus = false;
        this.statusTicket = null;
        this.loadTickets();
      },
      error: (error) => {
        this.isUpdatingStatus = false;
        this.statusError = error.message || this.translationService.instant('ticket.statusUpdateError');
      }
    });
  }

  getSelectedCategoryId(ticketId: number): string {
    return String(this.selectedCategories.get(ticketId) || '');
  }

  onCategoryChangeEvent(ticket: Ticket, event: Event): void {
    const newCategoryId = (event.target as HTMLSelectElement).value;
    this.onCategoryChange(ticket, newCategoryId);
  }

  onCategoryChange(ticket: Ticket, newCategoryId: string): void {
    this.errorMessage = '';

    this.ticketService.updateTicket(ticket.id, {
      ticket_category_id: newCategoryId ? +newCategoryId : null
    }).subscribe({
      next: () => {
        this.loadTickets();
      },
      error: (error) => {
        this.errorMessage = error.message || this.translationService.instant('ticket.categoryUpdateError');
        // Reload so the dropdown shows the category the server still has
        this.loadTickets();
      }
    });
  }

  clearFilters(): void {
    this.filters = {
      status: '',
      priority: '',
      assigned_to: '',
      period: '',
      date_from: '',
      date_to: ''
    };
    this.loadTickets();
  }

  onPeriodChange(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed

    switch (this.filters.period) {
      case 'this_month':
        this.filters.date_from = this.formatDate(new Date(year, month, 1));
        this.filters.date_to = this.formatDate(now);
        break;
      case 'last_month': {
        const lastMonthYear = month === 0 ? year - 1 : year;
        const lastMonth = month === 0 ? 11 : month - 1;
        this.filters.date_from = this.formatDate(new Date(lastMonthYear, lastMonth, 1));
        this.filters.date_to = this.formatDate(new Date(year, month, 0));
        break;
      }
      case 'this_semester':
        if (month < 6) {
          this.filters.date_from = `${year}-01-01`;
          this.filters.date_to = `${year}-06-30`;
        } else {
          this.filters.date_from = `${year}-07-01`;
          this.filters.date_to = `${year}-12-31`;
        }
        break;
      case 'last_semester':
        if (month < 6) {
          this.filters.date_from = `${year - 1}-07-01`;
          this.filters.date_to = `${year - 1}-12-31`;
        } else {
          this.filters.date_from = `${year}-01-01`;
          this.filters.date_to = `${year}-06-30`;
        }
        break;
      default:
        this.filters.date_from = '';
        this.filters.date_to = '';
    }

    if (this.filters.period !== 'custom') {
      this.loadTickets();
    }
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Export tickets to PDF with current filters
   */
  exportPdf(): void {
    console.log('📥 [ADMIN] Exporting tickets to PDF with filters:', this.filters);
    this.isLoading = true;
    this.errorMessage = '';

    const filters = {
      ...(this.filters.status && { status: this.filters.status }),
      ...(this.filters.priority && { priority: this.filters.priority }),
      ...(this.filters.assigned_to && { assigned_to: this.filters.assigned_to }),
      ...(this.filters.date_from && { date_from: this.filters.date_from }),
      ...(this.filters.date_to && { date_to: this.filters.date_to })
    };

    this.ticketService.exportTicketsPdf(filters).subscribe({
      next: (blob) => {
        console.log('✅ [ADMIN] PDF export successful, creating download');

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Generate filename with timestamp and filters
        const timestamp = new Date().getTime();
        let filename = `tickets-report-${timestamp}`;

        // Add filter info to filename
        if (filters.status) filename += `-${filters.status}`;
        if (filters.priority) filename += `-${filters.priority}`;
        if (filters.assigned_to) filename += `-user${filters.assigned_to}`;
        if (this.filters.period && this.filters.period !== 'custom') filename += `-${this.filters.period}`;
        if (filters.date_from) filename += `-from${filters.date_from}`;
        if (filters.date_to) filename += `-to${filters.date_to}`;

        link.download = `${filename}.pdf`;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        this.isLoading = false;
        console.log('✅ [ADMIN] PDF downloaded successfully');
      },
      error: (error) => {
        console.error('❌ [ADMIN] PDF export failed:', error);
        this.errorMessage = this.translationService.instant('admin.exportPdfError');
        this.isLoading = false;
      }
    });
  }

  /**
   * Get current category ID as string for dropdown binding
   */
  getCurrentCategoryId(ticket: Ticket): string {
    const category = ticket.ticketCategory || ticket.ticket_category;
    return category ? String(category.id) : '';
  }
}
