import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../../core/services/ticket.service';
import { TicketCategoryService } from '../../../../core/services/ticket-category.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Ticket, TicketCategory } from '../../../../core/models/ticket.model';
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
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <div class="flex items-end">
              <button (click)="clearFilters()" class="btn-secondary">{{ 'filter.clearFilters' | translate }}</button>
            </div>
          </div>
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
                            (click)="updateStatus(ticket)"
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
  `
})
export class AdminPageComponent implements OnInit {
  private ticketService = inject(TicketService);
  private ticketCategoryService = inject(TicketCategoryService);
  private userService = inject(UserService);
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
    assigned_to: ''
  };
  stats = {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  };
  isLoading = false;

  ngOnInit(): void {
    console.log('👨‍💼 [ADMIN] Dashboard initialized');
    this.loadTechnicians();
    this.loadTicketCategories();
    this.loadTickets();
  }

  loadTicketCategories(): void {
    // Load all categories (active and inactive) so we can show existing selections
    this.ticketCategoryService.getTicketCategories(false).subscribe({
      next: (response) => {
        this.ticketCategories = response.data || [];
        console.log('✅ [ADMIN] Categories loaded:', this.ticketCategories.length);
        console.log('🔍 [ADMIN] Category IDs:', this.ticketCategories.map(c => ({ id: c.id, name: c.name })));
      },
      error: (error) => {
        console.error('❌ [ADMIN] Failed to load categories:', error);
      }
    });
  }

  loadTechnicians(): void {
    this.userService.getAdminsAndSuperUsers().subscribe({
      next: (response) => {
        // Filter to get only admins (profile_id=1) and superusers (profile_id=2)
        const allUsers = response.data?.data || [];
        this.technicians = allUsers.filter(user =>
          user.profile_id === 1 || user.profile_id === 2
        );
        console.log('✅ [ADMIN] Technicians loaded:', this.technicians);
      },
      error: (error) => {
        console.error('❌ [ADMIN] Failed to load technicians:', error);
      }
    });
  }

  loadTickets(): void {
    this.isLoading = true;

    const filters = {
      ...(this.filters.status && { status: this.filters.status }),
      ...(this.filters.priority && { priority: this.filters.priority }),
      ...(this.filters.assigned_to && { assigned_to: this.filters.assigned_to })
    };

    this.ticketService.getTickets(filters).subscribe({
      next: (response) => {
        this.tickets = response.data.data || [];

        // Initialize selected categories map
        this.selectedCategories.clear();
        this.tickets.forEach(ticket => {
          const category = ticket.ticketCategory || ticket.ticket_category;
          const categoryId = category ? String(category.id) : '';
          this.selectedCategories.set(ticket.id, categoryId);
          console.log('🔍 [ADMIN] Set category for ticket', ticket.id, ':', categoryId, 'Category:', category);
        });

        console.log('🔍 [ADMIN] All selected categories:', Array.from(this.selectedCategories.entries()));

        this.calculateStats();
        this.isLoading = false;
        console.log('✅ [ADMIN] Tickets loaded:', this.tickets.length);
      },
      error: (error) => {
        console.error('❌ [ADMIN] Failed to load tickets:', error);
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

    console.log('📌 [ADMIN] Assigning ticket', ticket.id, 'to user', userId);

    this.ticketService.assignTicket(ticket.id, { user_id: +userId }).subscribe({
      next: () => {
        console.log('✅ [ADMIN] Ticket assigned successfully');
        this.loadTickets();
      },
      error: (error) => {
        console.error('❌ [ADMIN] Failed to assign ticket:', error);
        alert('Failed to assign ticket: ' + error.message);
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

  updateStatus(ticket: Ticket): void {
    // Prevent status changes on resolved or closed tickets
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      alert('Cannot change status of resolved or closed tickets. Please reopen the ticket first from the ticket detail page.');
      return;
    }

    const newStatus = prompt(
      'Update ticket status:\nopen, assigned, in_progress, awaiting_user, resolved, closed',
      ticket.status
    );

    if (newStatus && newStatus !== ticket.status) {
      this.ticketService.updateTicket(ticket.id, { status: newStatus }).subscribe({
        next: () => {
          console.log('✅ [ADMIN] Ticket status updated');
          this.loadTickets();
        },
        error: (error) => {
          console.error('❌ [ADMIN] Failed to update status:', error);
          alert('Failed to update status: ' + error.message);
        }
      });
    }
  }

  getSelectedCategoryId(ticketId: number): string {
    const categoryId = String(this.selectedCategories.get(ticketId) || '');
    console.log('🔍 [ADMIN] Getting category for ticket', ticketId, ':', categoryId);
    return categoryId;
  }

  onCategoryChangeEvent(ticket: Ticket, event: Event): void {
    const newCategoryId = (event.target as HTMLSelectElement).value;
    this.onCategoryChange(ticket, newCategoryId);
  }

  onCategoryChange(ticket: Ticket, newCategoryId: string): void {
    console.log('🔄 [ADMIN] Changing category for ticket', ticket.id, 'to', newCategoryId);

    this.ticketService.updateTicket(ticket.id, {
      ticket_category_id: newCategoryId ? +newCategoryId : null
    }).subscribe({
      next: () => {
        console.log('✅ [ADMIN] Category changed successfully');
        this.loadTickets();
      },
      error: (error) => {
        console.error('❌ [ADMIN] Failed to change category:', error);
        alert('Failed to change category: ' + error.message);
        // Reset to original value
        const category = ticket.ticketCategory || ticket.ticket_category;
        this.selectedCategories.set(ticket.id, category ? String(category.id) : '');
      }
    });
  }

  clearFilters(): void {
    this.filters = {
      status: '',
      priority: '',
      assigned_to: ''
    };
    this.loadTickets();
  }

  /**
   * Export tickets to PDF with current filters
   */
  exportPdf(): void {
    console.log('📥 [ADMIN] Exporting tickets to PDF with filters:', this.filters);
    this.isLoading = true;

    const filters = {
      ...(this.filters.status && { status: this.filters.status }),
      ...(this.filters.priority && { priority: this.filters.priority }),
      ...(this.filters.assigned_to && { assigned_to: this.filters.assigned_to })
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
        alert('Failed to export PDF. Please try again.');
        this.isLoading = false;
      }
    });
  }

  /**
   * Get current category ID as string for dropdown binding
   */
  getCurrentCategoryId(ticket: Ticket): string {
    const category = ticket.ticketCategory || ticket.ticket_category;
    if (!category) {
      return '';
    }
    const categoryId = String(category.id);

    // Check if this ID exists in loaded categories
    const exists = this.ticketCategories.some(c => String(c.id) === categoryId);
    if (!exists) {
      console.warn('⚠️ [ADMIN] Category ID', categoryId, 'not found in loaded categories for ticket', ticket.id);
    }

    return categoryId;
  }
}
