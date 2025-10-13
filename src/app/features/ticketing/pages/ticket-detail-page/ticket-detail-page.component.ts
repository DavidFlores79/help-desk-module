import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketService } from '../../../../core/services/ticket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { Ticket, TicketResponse, User } from '../../../../core/models/ticket.model';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { StatusBadgePipe } from '../../../../shared/pipes/status-badge.pipe';
import { PriorityBadgePipe } from '../../../../shared/pipes/priority-badge.pipe';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-ticket-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HeaderComponent,
    TimeAgoPipe,
    StatusBadgePipe,
    PriorityBadgePipe,
    FileUploadComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header></app-header>

      <main class="max-w-5xl mx-auto px-4 py-8">
        <div class="mb-6">
          <a routerLink="/tickets" class="text-primary-600 hover:text-primary-700 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tickets
          </a>
        </div>

        @if (isLoading) {
          <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        }

        @if (ticket && !isLoading) {
          <!-- Ticket Header -->
          <div class="card mb-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm text-gray-500">#{{ ticket.id }}</span>
                  <span [class]="ticket.status | statusBadge">{{ ticket.status_label }}</span>
                  <span [class]="ticket.priority | priorityBadge">{{ ticket.priority_label }}</span>
                </div>
                <h1 class="text-2xl font-heading font-bold text-gray-900 mb-2">{{ ticket.title }}</h1>
                <p class="text-gray-600">{{ ticket.description }}</p>
              </div>

              <!-- Admin Quick Actions -->
              @if (authService.isAdmin()) {
                <div class="flex-shrink-0 ml-4">
                  <div class="flex flex-col gap-2">
                    <!-- Status Change Dropdown -->
                    <select 
                      [value]="ticket.status"
                      (change)="changeTicketStatus($event)"
                      class="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="open">🔓 Open</option>
                      <option value="assigned">👤 Assigned</option>
                      <option value="in_progress">⏳ In Progress</option>
                      <option value="awaiting_user">⏸️ Awaiting User</option>
                      <option value="resolved">✅ Resolved</option>
                      <option value="closed">🔒 Closed</option>
                    </select>

                    <!-- Priority Change Dropdown -->
                    <select 
                      [value]="ticket.priority"
                      (change)="changeTicketPriority($event)"
                      class="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              }
            </div>

            <!-- Metadata -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p class="text-sm text-gray-500">Created</p>
                <p class="text-sm font-medium">{{ ticket.created_at | timeAgo }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Category</p>
                <p class="text-sm font-medium">{{ ticket.category?.name || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Item</p>
                <p class="text-sm font-medium">{{ ticket.item?.name || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Assigned To</p>
                <div class="flex items-center gap-2">
                  <p class="text-sm font-medium">
                    {{ getAssignedToName() }}
                  </p>
                  @if (authService.isAdmin()) {
                    <button 
                      (click)="openAssignModal()"
                      class="text-xs text-primary-600 hover:text-primary-700 underline"
                      title="Assign or reassign ticket">
                      {{ ticket.assignedTo || ticket.assigned_to ? 'Change' : 'Assign' }}
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Assignment History -->
            @if (ticket.assignments && ticket.assignments.length > 0) {
              <div class="pt-4 border-t border-gray-200 mt-4">
                <p class="text-sm font-medium text-gray-700 mb-2">Assignment History:</p>
                <div class="space-y-2">
                  @for (assignment of ticket.assignments; track assignment.id) {
                    <div class="text-sm text-gray-600 flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>
                        Assigned to 
                        <strong>
                          {{ getAssignmentUserName(assignment, 'to') }}
                        </strong> 
                        by 
                        <strong>
                          {{ getAssignmentUserName(assignment, 'by') }}
                        </strong>
                        <span class="text-gray-400 ml-1">{{ assignment.created_at | timeAgo }}</span>
                      </span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Attachments -->
            @if (ticket.attachments && ticket.attachments.length > 0) {
              <div class="pt-4 border-t border-gray-200 mt-4">
                <p class="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                <div class="flex flex-wrap gap-2">
                  @for (attachment of ticket.attachments; track attachment.id) {
                    <a [href]="attachment.url" target="_blank" 
                       class="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span class="text-sm text-gray-700">{{ attachment.name || attachment.original_name }}</span>
                    </a>
                  }
                </div>
              </div>
            }

            <!-- Ticket Actions -->
            <div class="pt-4 border-t border-gray-200 mt-4 flex gap-3">
              @if (canReopenTicket()) {
                <button 
                  (click)="reopenTicket()"
                  [disabled]="isReopening"
                  class="btn-secondary">
                  <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {{ isReopening ? 'Reopening...' : 'Reopen Ticket' }}
                </button>
              }
              @if (canDeleteTicket()) {
                <button 
                  (click)="deleteTicket()"
                  [disabled]="isDeleting"
                  class="btn-danger">
                  <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {{ isDeleting ? 'Deleting...' : 'Delete Ticket' }}
                </button>
              }
            </div>
          </div>

          <!-- Responses -->
          <div class="space-y-4 mb-6">
            <h2 class="text-xl font-heading font-semibold text-gray-900">Responses</h2>
            
            @if (ticket.responses && ticket.responses.length > 0) {
              @for (response of ticket.responses; track response.id) {
                <!-- Only show internal notes to admins -->
                @if (!response.is_internal || (response.is_internal && authService.isAdmin())) {
                  <div class="card" [class.bg-blue-50]="response.is_internal">
                    <div class="flex items-start gap-4">
                      <div class="flex-shrink-0">
                        <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span class="text-primary-700 font-semibold text-sm">
                            {{ response.user.name.charAt(0).toUpperCase() }}
                          </span>
                        </div>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center justify-between mb-2">
                          <div>
                            <p class="font-medium text-gray-900">{{ response.user.name }}</p>
                            <p class="text-sm text-gray-500">{{ response.created_at | timeAgo }}</p>
                          </div>
                          @if (response.is_internal) {
                            <span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              🔒 Internal Note
                            </span>
                          }
                        </div>
                        <p class="text-gray-700">{{ response.message || response.body }}</p>
                      
                      @if (response.attachments && response.attachments.length > 0) {
                        <div class="mt-3 flex flex-wrap gap-2">
                          @for (attachment of response.attachments; track attachment.id) {
                            <a [href]="attachment.url" target="_blank" 
                               class="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              {{ attachment.name || attachment.original_name }}
                            </a>
                          }
                        </div>
                      }
                    </div>
                  </div>
                </div>
                }
              }
            } @else {
              <p class="text-gray-500 text-center py-8">No responses yet</p>
            }
          </div>

          <!-- Add Response Form -->
          @if (ticket.status !== 'closed') {
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Add Response</h3>
              
              <form [formGroup]="responseForm" (ngSubmit)="submitResponse()">
                <div class="mb-4">
                  <textarea
                    formControlName="body"
                    rows="4"
                    class="input-field"
                    placeholder="Type your response here..."
                    [class.border-danger-500]="responseForm.get('body')?.invalid && responseForm.get('body')?.touched"
                  ></textarea>
                  @if (responseForm.get('body')?.invalid && responseForm.get('body')?.touched) {
                    <p class="mt-1 text-sm text-danger-600">Response body is required</p>
                  }
                </div>

                <!-- Internal Note Checkbox (Admin Only) -->
                @if (authService.isAdmin()) {
                  <div class="mb-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        formControlName="internal"
                        class="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span class="text-sm font-medium text-gray-700">
                        🔒 Mark as internal note (only visible to admins)
                      </span>
                    </label>
                  </div>
                }

                <div class="mb-4">
                  <app-file-upload
                    formControlName="attachments"
                    [maxFiles]="5"
                    [maxFileSize]="'10MB'"
                  ></app-file-upload>
                </div>

                @if (responseError) {
                  <div class="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                    <p class="text-sm text-danger-700">{{ responseError }}</p>
                  </div>
                }

                <div class="flex items-center gap-4">
                  <button
                    type="submit"
                    class="btn-primary flex-shrink-0"
                    [disabled]="responseForm.invalid || isSubmittingResponse">
                    {{ isSubmittingResponse ? 'Sending...' : 'Send Response' }}
                  </button>
                  
                  <div class="text-xs text-gray-500">
                    @if (responseForm.invalid) {
                      <span class="text-danger-600">⚠️ Please fill in required fields</span>
                    } @else {
                      <span class="text-success-600">✓ Ready to send</span>
                    }
                  </div>
                </div>
                
                <!-- Debug info (remove in production) -->
                @if (false) {
                  <div class="mt-2 p-2 bg-gray-100 rounded text-xs">
                    <div>Form valid: {{ responseForm.valid }}</div>
                    <div>Body valid: {{ responseForm.get('body')?.valid }}</div>
                    <div>Body value: {{ responseForm.get('body')?.value }}</div>
                  </div>
                }
              </form>
            </div>
          }
        }

        @if (errorMessage) {
          <div class="card bg-danger-50 border-danger-200">
            <p class="text-danger-700">{{ errorMessage }}</p>
          </div>
        }

        <!-- Assignment Modal -->
        @if (showAssignModal) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeAssignModal()">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" (click)="$event.stopPropagation()">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Assign Ticket</h3>
              
              <form [formGroup]="assignForm" (ngSubmit)="assignTicket()">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Assign to User
                  </label>
                  <select 
                    formControlName="assigned_to"
                    class="input-field"
                    [class.border-danger-500]="assignForm.get('assigned_to')?.invalid && assignForm.get('assigned_to')?.touched">
                    <option [value]="null">Select a user...</option>
                    @for (user of availableUsers; track user.id) {
                      <option [value]="user.id">{{ user.name }} ({{ user.email }})</option>
                    }
                  </select>
                  @if (assignForm.get('assigned_to')?.invalid && assignForm.get('assigned_to')?.touched) {
                    <p class="mt-1 text-sm text-danger-600">Please select a user</p>
                  }
                </div>

                <div class="flex gap-3 justify-end">
                  <button 
                    type="button"
                    (click)="closeAssignModal()"
                    class="btn-secondary">
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    class="btn-primary"
                    [disabled]="assignForm.invalid || isAssigning">
                    {{ isAssigning ? 'Assigning...' : 'Assign' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </main>
    </div>
  `
})
export class TicketDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private userService = inject(UserService);
  authService = inject(AuthService);

  ticket: Ticket | null = null;
  availableUsers: User[] = [];
  isLoading = false;
  isLoadingUsers = false;
  errorMessage = '';
  responseError = '';
  isSubmittingResponse = false;
  isReopening = false;
  isDeleting = false;
  isChangingStatus = false;
  isChangingPriority = false;
  isAssigning = false;
  showAssignModal = false;

  responseForm = this.fb.group({
    body: ['', Validators.required], // API expects 'body' not 'message'
    attachments: [[]],
    internal: [false] // Admin-only internal note checkbox
  });

  assignForm = this.fb.group({
    assigned_to: [null as number | null, Validators.required]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTicket(+id);
      // Load available users for assignment if admin
      if (this.authService.isAdmin()) {
        this.loadUsers();
      }
    }
    
    // Log form initialization
    console.log('📝 [TICKET DETAIL] Response form initialized:', {
      valid: this.responseForm.valid,
      value: this.responseForm.value,
      controls: Object.keys(this.responseForm.controls)
    });
  }
  
  onFormSubmit(event: Event): void {
    console.log('🔄 [TICKET DETAIL] Form submit event fired', event);
  }
  
  onButtonClick(event: MouseEvent): void {
    console.log('🖱️ [TICKET DETAIL] Button clicked', {
      event,
      formValid: this.responseForm.valid,
      formValue: this.responseForm.value,
      isSubmitting: this.isSubmittingResponse,
      buttonDisabled: this.responseForm.invalid || this.isSubmittingResponse
    });
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    console.log('🔄 [TICKET DETAIL] Loading admins and superusers for assignment');

    // Get all users and filter for admins/superusers on the client side
    // API returns only active users excluding current user by default
    this.userService.getAdminsAndSuperUsers().subscribe({
      next: (response) => {
        // Filter for admins (profile_id: 1) and superusers (profile_id: 2)
        // The API should handle this filtering, but we filter client-side as backup
        const allUsers = response.data.data || [];
        this.availableUsers = allUsers.filter((user: any) => {
          const profile = user.my_profile || user.profile;
          if (!profile) return false;
          
          const profileName = profile.name?.toLowerCase();
          // Accept Admin, SuperUser, or Administrador
          return profileName === 'administrador' || 
                 profileName === 'admin' || 
                 profileName === 'superuser';
        });
        
        this.isLoadingUsers = false;
        console.log('✅ [TICKET DETAIL] Admins/SuperUsers loaded:', this.availableUsers.length, 'of', allUsers.length, 'total');
        
        if (this.availableUsers.length === 0) {
          console.warn('⚠️ [TICKET DETAIL] No admin/superuser users found for assignment');
        }
      },
      error: (error) => {
        console.error('❌ [TICKET DETAIL] Failed to load users:', error);
        this.isLoadingUsers = false;
      }
    });
  }

  loadTicket(id: number): void {
    this.isLoading = true;
    console.log('🔄 [TICKET DETAIL] Loading ticket:', id);

    this.ticketService.getTicket(id).subscribe({
      next: (response) => {
        this.ticket = response.data;
        this.isLoading = false;
        console.log('✅ [TICKET DETAIL] Ticket loaded successfully');
        console.log('   Ticket ID:', this.ticket.id);
        console.log('   Title:', this.ticket.title);
        console.log('   Assigned To:', this.ticket.assigned_to);
        console.log('   AssignedTo Object:', this.ticket.assignedTo);
        
        if (this.ticket.assignments && this.ticket.assignments.length > 0) {
          console.log('   Assignment History Count:', this.ticket.assignments.length);
          this.ticket.assignments.forEach((assignment, index) => {
            console.log(`   Assignment ${index + 1}:`, assignment);
            console.log(`   Assignment ${index + 1} details:`, {
              id: assignment.id,
              assigned_by: assignment.assigned_by,
              assigned_to: assignment.assigned_to,
              assignedBy: assignment.assignedBy,
              assignedByType: typeof assignment.assignedBy,
              assignedByName: assignment.assignedBy?.name,
              assignedTo: assignment.assignedTo,
              assignedToType: typeof assignment.assignedTo,
              assignedToName: assignment.assignedTo?.name,
              created_at: assignment.created_at
            });
          });
        } else {
          console.log('   No assignment history found');
        }
      },
      error: (error) => {
        console.error('❌ [TICKET DETAIL] Failed to load ticket:', error);
        this.errorMessage = error.message || 'Failed to load ticket';
        this.isLoading = false;
      }
    });
  }

  submitResponse(): void {
    console.log('🔄 [TICKET DETAIL] submitResponse called');
    console.log('   Form valid:', this.responseForm.valid);
    console.log('   Form value:', this.responseForm.value);
    console.log('   Form status:', this.responseForm.status);
    console.log('   Ticket exists:', !!this.ticket);
    console.log('   Ticket ID:', this.ticket?.id);
    
    // Log all form control states
    Object.keys(this.responseForm.controls).forEach(key => {
      const control = this.responseForm.get(key);
      console.log(`   Form control '${key}':`, {
        valid: control?.valid,
        invalid: control?.invalid,
        value: control?.value,
        errors: control?.errors,
        touched: control?.touched,
        dirty: control?.dirty
      });
    });
    
    if (this.responseForm.invalid) {
      console.error('❌ [TICKET DETAIL] Form is invalid, marking all as touched');
      Object.keys(this.responseForm.controls).forEach(key => {
        const control = this.responseForm.get(key);
        if (control?.invalid) {
          console.error(`   - ${key} is invalid:`, control.errors);
        }
      });
      this.responseForm.markAllAsTouched();
      return;
    }
    
    if (!this.ticket) {
      console.error('❌ [TICKET DETAIL] No ticket loaded');
      return;
    }

    this.isSubmittingResponse = true;
    this.responseError = '';

    const bodyText = this.responseForm.value.body!;
    const files = this.responseForm.value.attachments as any;
    const internal = this.responseForm.value.internal || false;
    const hasFiles = files && Array.isArray(files) && files.length > 0;

    console.log('📤 [TICKET DETAIL] Preparing response submission');
    console.log('   Body text:', bodyText);
    console.log('   Internal:', internal);
    console.log('   Has files:', hasFiles);

    let payload: any;

    // If we have files, use FormData
    if (hasFiles) {
      console.log('   Building FormData with attachments');
      const formData = new FormData();
      formData.append('body', bodyText);
      
      if (internal) {
        formData.append('internal', '1');
      }
      
      (files as File[]).forEach((file: File, index: number) => {
        console.log(`   - File ${index}:`, file.name, file.size, 'bytes');
        formData.append('attachments[]', file, file.name);
      });

      console.log('📋 [TICKET DETAIL] FormData contents:');
      formData.forEach((value, key) => {
        if (value instanceof File) {
          console.log(`   ${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`   ${key}:`, value);
        }
      });

      payload = formData;
    } else {
      console.log('   Sending as JSON (no attachments)');
      payload = { body: bodyText };
      if (internal) {
        payload.internal = true;
      }
      console.log('📋 [TICKET DETAIL] JSON payload:', payload);
    }

    console.log('📤 [TICKET DETAIL] Submitting to ticket ID:', this.ticket.id);

    this.ticketService.addResponse(this.ticket.id, payload).subscribe({
      next: (response) => {
        console.log('✅ [TICKET DETAIL] Response added successfully:', response);
        this.responseForm.reset({ body: '', attachments: null, internal: false });
        this.loadTicket(this.ticket!.id);
        this.isSubmittingResponse = false;
      },
      error: (error) => {
        console.error('❌ [TICKET DETAIL] Failed to add response:', error);
        this.responseError = error.message || 'Failed to add response';
        this.isSubmittingResponse = false;
      }
    });
  }

  canReopenTicket(): boolean {
    if (!this.ticket) return false;
    // Can reopen if ticket is resolved or closed (API spec line 605-608)
    return this.ticket.status === 'resolved' || this.ticket.status === 'closed';
  }

  canDeleteTicket(): boolean {
    if (!this.ticket) return false;
    // Users can delete their own tickets, admins can delete any ticket (API spec line 632-634)
    const currentUser = this.authService.getCurrentUser();
    if (this.authService.isAdmin()) return true;
    return currentUser?.id === this.ticket.user_id;
  }

  reopenTicket(): void {
    if (!this.ticket || !this.canReopenTicket()) return;

    if (!confirm('Are you sure you want to reopen this ticket?')) {
      return;
    }

    this.isReopening = true;
    console.log('🔄 [TICKET DETAIL] Reopening ticket:', this.ticket.id);

    this.ticketService.reopenTicket(this.ticket.id).subscribe({
      next: (response) => {
        console.log('✅ [TICKET DETAIL] Ticket reopened successfully:', response);
        this.loadTicket(this.ticket!.id);
        this.isReopening = false;
      },
      error: (error) => {
        console.error('❌ [TICKET DETAIL] Failed to reopen ticket:', error);
        this.errorMessage = error.message || 'Failed to reopen ticket';
        this.isReopening = false;
      }
    });
  }

  deleteTicket(): void {
    if (!this.ticket || !this.canDeleteTicket()) return;

    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }

    this.isDeleting = true;
    console.log('🗑️ [TICKET DETAIL] Deleting ticket:', this.ticket.id);

    this.ticketService.deleteTicket(this.ticket.id).subscribe({
      next: (response) => {
        console.log('✅ [TICKET DETAIL] Ticket deleted successfully');
        // Redirect to tickets list
        this.router.navigate(['/tickets']);
      },
      error: (error) => {
        console.error('❌ [TICKET DETAIL] Failed to delete ticket:', error);
        this.errorMessage = error.message || 'Failed to delete ticket';
        this.isDeleting = false;
      }
    });
  }

  changeTicketStatus(event: Event): void {
    if (!this.ticket || !this.authService.isAdmin()) return;

    const newStatus = (event.target as HTMLSelectElement).value;
    
    // Don't do anything if status hasn't changed
    if (newStatus === this.ticket.status) return;

    this.isChangingStatus = true;
    console.log('🔄 [TICKET DETAIL] Changing status from', this.ticket.status, 'to', newStatus);

    this.ticketService.changeStatus(this.ticket.id, newStatus).subscribe({
      next: (response) => {
        console.log('✅ [TICKET DETAIL] Status changed successfully:', response);
        this.ticket = response.data;
        this.isChangingStatus = false;
      },
      error: (error) => {
        console.error('❌ [TICKET DETAIL] Failed to change status:', error);
        this.errorMessage = error.message || 'Failed to change status';
        this.isChangingStatus = false;
        // Reload to revert the dropdown
        this.loadTicket(this.ticket!.id);
      }
    });
  }

  changeTicketPriority(event: Event): void {
    if (!this.ticket || !this.authService.isAdmin()) return;

    const newPriority = (event.target as HTMLSelectElement).value;
    
    // Don't do anything if priority hasn't changed
    if (newPriority === this.ticket.priority) return;

    this.isChangingPriority = true;
    console.log('🔄 [TICKET DETAIL] Changing priority from', this.ticket.priority, 'to', newPriority);

    this.ticketService.changePriority(this.ticket.id, newPriority).subscribe({
      next: (response) => {
        console.log('✅ [TICKET DETAIL] Priority changed successfully:', response);
        this.ticket = response.data;
        this.isChangingPriority = false;
      },
      error: (error) => {
        console.error('❌ [TICKET DETAIL] Failed to change priority:', error);
        this.errorMessage = error.message || 'Failed to change priority';
        this.isChangingPriority = false;
        // Reload to revert the dropdown
        this.loadTicket(this.ticket!.id);
      }
    });
  }

  openAssignModal(): void {
    if (!this.authService.isAdmin()) return;
    this.showAssignModal = true;
    // Pre-select current assigned user if exists
    if (this.ticket?.assigned_to) {
      this.assignForm.patchValue({ assigned_to: this.ticket.assigned_to });
    }
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.assignForm.reset();
  }

  assignTicket(): void {
    if (!this.ticket || !this.assignForm.valid || !this.authService.isAdmin()) return;

    const assignedToId = this.assignForm.value.assigned_to;
    if (!assignedToId) return;

    this.isAssigning = true;
    console.log('🔄 [TICKET DETAIL] Assigning ticket to user:', assignedToId);

    this.ticketService.assignTicket(this.ticket.id, { assigned_to: assignedToId }).subscribe({
      next: (response) => {
        console.log('✅ [TICKET DETAIL] Ticket assigned successfully:', response);
        this.ticket = response.data;
        this.isAssigning = false;
        this.closeAssignModal();
        this.loadTicket(this.ticket.id); // Reload to show assignment history
      },
      error: (error) => {
        console.error('❌ [TICKET DETAIL] Failed to assign ticket:', error);
        this.errorMessage = error.message || 'Failed to assign ticket';
        this.isAssigning = false;
      }
    });
  }

  /**
   * Helper method to get user name by ID from available users list
   * This is a fallback when the API doesn't return the full user object in assignments
   */
  getUserNameById(userId: number): string | null {
    if (!userId) return null;
    
    // Check in available users list (loaded for assignment)
    const user = this.availableUsers.find(u => u.id === userId);
    if (user) return user.name;
    
    // Check if it's the current ticket owner
    if (this.ticket?.user && this.ticket.user.id === userId) {
      return this.ticket.user.name;
    }
    
    // Check if it's the assigned user
    if (this.ticket?.assignedTo && this.ticket.assignedTo.id === userId) {
      return this.ticket.assignedTo.name;
    }
    
    return null;
  }

  /**
   * Extract string name from a user object that might have nested structures
   */
  private extractUserName(userObj: any): string | null {
    if (!userObj) return null;
    
    // If it's already a string, return it
    if (typeof userObj === 'string') return userObj;
    
    // If it's an object, try various name properties
    if (typeof userObj === 'object') {
      // Try direct name property
      if (typeof userObj.name === 'string') return userObj.name;
      
      // Try nested name (in case of double nesting)
      if (userObj.name && typeof userObj.name === 'object' && userObj.name.name) {
        return String(userObj.name.name);
      }
      
      // Try full_name
      if (typeof userObj.full_name === 'string') return userObj.full_name;
      
      // Try username
      if (typeof userObj.username === 'string') return userObj.username;
      
      // Try email as last resort
      if (typeof userObj.email === 'string') return userObj.email;
    }
    
    return null;
  }

  /**
   * Get assignment user name for display in assignment history
   * Handles both 'to' (assignedTo) and 'by' (assignedBy) user names
   */
  getAssignmentUserName(assignment: any, type: 'to' | 'by'): string {
    // The API returns assigned_to and assigned_by as objects with user data
    const userObject = type === 'to' ? assignment.assigned_to : assignment.assigned_by;
    
    console.log(`🔍 [ASSIGNMENT] Getting ${type} user name for assignment #${assignment.id}:`, {
      userObject,
      userObjectType: typeof userObject,
      isObject: typeof userObject === 'object',
      hasName: !!userObject?.name,
      fullAssignment: assignment
    });
    
    // Extract name from the user object
    if (userObject && typeof userObject === 'object') {
      const extractedName = this.extractUserName(userObject);
      if (extractedName) {
        console.log(`✅ [ASSIGNMENT] Extracted ${type} user name from object:`, extractedName);
        return extractedName;
      }
    }
    
    // Fallback if userObject has an id, try to find in available users
    const userId = userObject?.id;
    if (userId) {
      const foundUser = this.availableUsers.find(u => u.id === userId);
      if (foundUser) {
        const userName = this.extractUserName(foundUser);
        if (userName) {
          console.log(`✅ [ASSIGNMENT] Found ${type} user in available users:`, userName);
          return userName;
        }
      }
      
      // Fallback to user ID
      console.warn(`⚠️ [ASSIGNMENT] Could not resolve ${type} user name, using ID:`, userId);
      return `User #${userId}`;
    }
    
    // Ultimate fallback
    console.error(`❌ [ASSIGNMENT] No user information available for ${type}`);
    return 'Unknown User';
  }

  /**
   * Get the name of the user the ticket is assigned to
   */
  getAssignedToName(): string {
    if (!this.ticket) return 'Unassigned';
    
    // Check if assigned_to is an object with user data
    if (this.ticket.assigned_to && typeof this.ticket.assigned_to === 'object') {
      const extractedName = this.extractUserName(this.ticket.assigned_to);
      if (extractedName) {
        return extractedName;
      }
    }
    
    // Try assignedTo object (camelCase version)
    if (this.ticket.assignedTo) {
      const extractedName = this.extractUserName(this.ticket.assignedTo);
      if (extractedName) {
        return extractedName;
      }
    }
    
    // If assigned_to is an ID, look it up
    if (this.ticket.assigned_to && typeof this.ticket.assigned_to === 'number') {
      const userName = this.getUserNameById(this.ticket.assigned_to);
      if (userName) return userName;
      return `User #${this.ticket.assigned_to}`;
    }
    
    return 'Unassigned';
  }
}
