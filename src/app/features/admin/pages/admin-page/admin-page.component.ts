import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../../core/services/ticket.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Ticket } from '../../../../core/models/ticket.model';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { StatusBadgePipe } from '../../../../shared/pipes/status-badge.pipe';
import { PriorityBadgePipe } from '../../../../shared/pipes/priority-badge.pipe';

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
    PriorityBadgePipe
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header></app-header>

      <main class="max-w-7xl mx-auto px-4 py-8">
        <!-- Page Header -->
        <div class="mb-6">
          <h2 class="text-3xl font-heading font-bold text-gray-900">Admin Dashboard</h2>
          <p class="text-gray-600 mt-1">Manage all support tickets</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="card bg-blue-50 border-blue-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-blue-600 font-medium">Total Tickets</p>
                <p class="text-2xl font-bold text-blue-900">{{ stats.total }}</p>
              </div>
              <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <div class="card bg-yellow-50 border-yellow-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-yellow-600 font-medium">Open</p>
                <p class="text-2xl font-bold text-yellow-900">{{ stats.open }}</p>
              </div>
              <svg class="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div class="card bg-purple-50 border-purple-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-purple-600 font-medium">In Progress</p>
                <p class="text-2xl font-bold text-purple-900">{{ stats.inProgress }}</p>
              </div>
              <svg class="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          <div class="card bg-green-50 border-green-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-green-600 font-medium">Resolved</p>
                <p class="text-2xl font-bold text-green-900">{{ stats.resolved }}</p>
              </div>
              <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
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

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <select [(ngModel)]="filters.assigned_to" (change)="loadTickets()" class="input-field">
                <option value="">All Technicians</option>
                <option value="unassigned">Unassigned</option>
                @for (tech of technicians; track tech.id) {
                  <option [value]="tech.id">{{ tech.name }}</option>
                }
              </select>
            </div>

            <div class="flex items-end">
              <button (click)="clearFilters()" class="btn-secondary">Clear Filters</button>
            </div>
          </div>
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
                      Ticket
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @if (tickets.length === 0) {
                    <tr>
                      <td colspan="6" class="px-6 py-8 text-center text-gray-500">
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
                            <p class="text-sm text-gray-500">#{{ ticket.id }} - {{ ticket.createdBy?.name }}</p>
                          </div>
                        </div>
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
                        @if (!ticket.assignedTo) {
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
                            <span class="text-sm text-gray-900">{{ ticket.assignedTo.name }}</span>
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
                        <a [routerLink]="['/tickets', ticket.id]" 
                           class="text-primary-600 hover:text-primary-700 mr-4">
                          View
                        </a>
                        @if (ticket.status !== 'closed') {
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
  private userService = inject(UserService);
  authService = inject(AuthService);

  tickets: Ticket[] = [];
  technicians: any[] = [];
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
    this.loadTickets();
  }

  loadTechnicians(): void {
    this.userService.getTechnicians().subscribe({
      next: (response) => {
        this.technicians = response.data || [];
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
  }

  updateStatus(ticket: Ticket): void {
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

  clearFilters(): void {
    this.filters = {
      status: '',
      priority: '',
      assigned_to: ''
    };
    this.loadTickets();
  }
}
