import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TicketService } from '../../../../core/services/ticket.service';
import { TicketCategoryService } from '../../../../core/services/ticket-category.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { User } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-new-ticket-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    FileUploadComponent,
    TranslatePipe
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header></app-header>

      <main class="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div class="mb-4 sm:mb-6">
          <a routerLink="/tickets" class="text-primary-600 hover:text-primary-700 flex items-center gap-2 text-sm sm:text-base">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ 'ticket.backToTickets' | translate }}
          </a>
        </div>

        <div class="card">
          <h1 class="text-xl sm:text-2xl font-heading font-bold text-gray-900 mb-4 sm:mb-6">{{ 'ticket.createNewTicket' | translate }}</h1>

          <form [formGroup]="ticketForm" (ngSubmit)="onSubmit()">
            <!-- User Selection (Admins Only) -->
            @if (isAdmin) {
              <div class="mb-4">
                <label for="user_id" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ 'ticket.ticketOwner' | translate }} <span class="text-danger-600">*</span>
                </label>
                <div class="relative">
                  <div class="relative">
                    <input
                      id="user-search"
                      type="text"
                      [(ngModel)]="userSearchTerm"
                      [ngModelOptions]="{standalone: true}"
                      (input)="onUserSearch()"
                      (focus)="onUserSearchFocus()"
                      class="input-field"
                      [class.border-danger-500]="ticketForm.get('user_id')?.invalid && ticketForm.get('user_id')?.touched"
                      [placeholder]="'ticket.searchUsers' | translate"
                    />
                    @if (isSearchingUsers) {
                      <div class="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg class="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    }
                  </div>
                  @if (userSearchTerm && userSearchTerm.trim().length > 0 && userSearchTerm.trim().length < 2) {
                    <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg px-4 py-3">
                      <p class="text-sm text-gray-500">{{ 'ticket.typeMoreCharacters' | translate }}</p>
                    </div>
                  }
                  @if (showUserDropdown && filteredUsers.length > 0) {
                    <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      @for (user of filteredUsers; track user.id) {
                        <button
                          type="button"
                          (click)="selectUser(user)"
                          class="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          <div class="font-medium">{{ user.name }}</div>
                          <div class="text-sm text-gray-500">{{ user.email }}</div>
                          @if (user.department) {
                            <div class="text-xs text-gray-400">{{ user.department }}</div>
                          }
                        </button>
                      }
                    </div>
                  }
                  @if (userSearchTerm && userSearchTerm.trim().length >= 2 && !isSearchingUsers && filteredUsers.length === 0 && showUserDropdown === false) {
                    <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg px-4 py-3">
                      <p class="text-sm text-gray-500">{{ 'ticket.noUsersFound' | translate }}</p>
                    </div>
                  }
                  @if (selectedUser) {
                    <div class="mt-2 p-3 bg-primary-50 border border-primary-200 rounded-md flex items-center justify-between">
                      <div>
                        <div class="font-medium text-primary-900">{{ selectedUser.name }}</div>
                        <div class="text-sm text-primary-700">{{ selectedUser.email }}</div>
                      </div>
                      <button
                        type="button"
                        (click)="clearUserSelection()"
                        class="text-primary-600 hover:text-primary-800"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  }
                </div>
                @if (ticketForm.get('user_id')?.invalid && ticketForm.get('user_id')?.touched) {
                  <p class="mt-1 text-sm text-danger-600">{{ 'ticket.userRequired' | translate }}</p>
                }
              </div>
            }

            <!-- Title -->
            <div class="mb-4">
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                {{ 'ticket.title' | translate }} <span class="text-danger-600">*</span>
              </label>
              <input
                id="title"
                type="text"
                formControlName="title"
                class="input-field"
                [class.border-danger-500]="ticketForm.get('title')?.invalid && ticketForm.get('title')?.touched"
                [placeholder]="'ticket.briefDescription' | translate"
              />
              @if (ticketForm.get('title')?.invalid && ticketForm.get('title')?.touched) {
                <p class="mt-1 text-sm text-danger-600">{{ 'ticket.titleRequired' | translate }}</p>
              }
            </div>

            <!-- Description -->
            <div class="mb-4">
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                {{ 'ticket.description' | translate }} <span class="text-danger-600">*</span>
              </label>
              <textarea
                id="description"
                formControlName="description"
                rows="5"
                class="input-field resize-y"
                [class.border-danger-500]="ticketForm.get('description')?.invalid && ticketForm.get('description')?.touched"
                [placeholder]="'ticket.detailedInfo' | translate"
              ></textarea>
              @if (ticketForm.get('description')?.invalid && ticketForm.get('description')?.touched) {
                <p class="mt-1 text-sm text-danger-600">{{ 'ticket.descriptionRequired' | translate }}</p>
              }
            </div>

            <!-- Priority and Category Grid on larger screens -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <!-- Priority -->
              <div>
                <label for="priority" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ 'ticket.priority' | translate }} <span class="text-danger-600">*</span>
                </label>
                <select id="priority" formControlName="priority" class="input-field">
                  <option value="">{{ 'ticket.selectPriority' | translate }}</option>
                  <option value="low">{{ 'priority.low' | translate }}</option>
                  <option value="medium">{{ 'priority.medium' | translate }}</option>
                  <option value="high">{{ 'priority.high' | translate }}</option>
                  <option value="urgent">{{ 'priority.urgent' | translate }}</option>
                </select>
                @if (ticketForm.get('priority')?.invalid && ticketForm.get('priority')?.touched) {
                  <p class="mt-1 text-sm text-danger-600">{{ 'ticket.priorityRequired' | translate }}</p>
                }
              </div>

              <!-- Category -->
              <div>
                <label for="ticket_category_id" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ 'ticket.category' | translate }}
                </label>
                <select 
                  id="ticket_category_id" 
                  formControlName="ticket_category_id" 
                  class="input-field">
                  <option value="">{{ 'ticket.selectCategory' | translate }}</option>
                  @for (category of ticketCategories; track category.id) {
                    <option [value]="category.id">{{ category.name }}</option>
                  }
                </select>
              </div>
            </div>

            <!-- File Upload -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ 'ticket.attachments' | translate }}
              </label>
              <app-file-upload
                formControlName="attachments"
                [maxFiles]="5"
                [maxFileSize]="'10MB'"
                [acceptedFileTypes]="['image/*', 'application/pdf', '.doc', '.docx']"
              ></app-file-upload>
              <p class="mt-1 text-xs text-gray-500">
                {{ 'fileUpload.fileRestrictions' | translate }}
              </p>
            </div>

            <!-- Error Message -->
            @if (errorMessage) {
              <div class="mb-4 p-3 sm:p-4 bg-danger-50 border border-danger-200 rounded-lg">
                <p class="text-sm text-danger-700">{{ errorMessage }}</p>
              </div>
            }

            <!-- Actions -->
            <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 relative z-50">
              <button 
                type="button" 
                (click)="cancel()"
                class="btn-secondary relative z-50 pointer-events-auto w-full sm:w-auto"
                style="pointer-events: auto !important; position: relative; z-index: 9999;"
                [disabled]="isSubmitting">
                {{ 'app.cancel' | translate }}
              </button>
              <button 
                type="submit" 
                class="btn-primary relative z-50 pointer-events-auto w-full sm:w-auto"
                style="pointer-events: auto !important; position: relative; z-index: 9999;"
                [disabled]="ticketForm.invalid || isSubmitting">
                {{ isSubmitting ? ('ticket.creating' | translate) : ('ticket.createTicket' | translate) }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `
})
export class NewTicketPageComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private ticketCategoryService = inject(TicketCategoryService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ticketForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    priority: ['medium', Validators.required],
    ticket_category_id: [''],
    attachments: [[]],
    user_id: ['']
  });

  ticketCategories: any[] = [];
  isSubmitting = false;
  errorMessage = '';

  // Admin user selection
  isAdmin = false;
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  userSearchTerm = '';
  showUserDropdown = false;
  isSearchingUsers = false;

  // Search subject for debouncing
  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    // Set user_id as required for admins
    if (this.isAdmin) {
      this.ticketForm.get('user_id')?.setValidators([Validators.required]);
      this.setupUserSearch();
    }

    this.loadTicketCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTicketCategories(): void {
    this.ticketCategoryService.getTicketCategories(true).subscribe({
      next: (response) => {
        this.ticketCategories = response.data || [];
      },
      error: () => {}
    });
  }

  setupUserSearch(): void {
    // Setup debounced search with server-side filtering
    this.searchSubject$.pipe(
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(), // Only emit if value has changed
      switchMap(searchTerm => {
        const trimmedTerm = searchTerm.trim();

        if (!trimmedTerm || trimmedTerm.length < 2) {
          this.filteredUsers = [];
          this.showUserDropdown = false;
          this.isSearchingUsers = false;
          return [];
        }

        this.isSearchingUsers = true;
        return this.userService.searchUsers(trimmedTerm, 15);
      })
    ).subscribe({
      next: (response) => {
        this.filteredUsers = response.data?.data || [];
        this.showUserDropdown = this.filteredUsers.length > 0;
        this.isSearchingUsers = false;
      },
      error: (error) => {
        console.error('Failed to search users:', error);
        this.filteredUsers = [];
        this.showUserDropdown = false;
        this.isSearchingUsers = false;
      }
    });
  }

  onUserSearch(): void {
    // Emit search term to the debounced subject
    this.searchSubject$.next(this.userSearchTerm);
  }

  onUserSearchFocus(): void {
    // Show dropdown if there are already filtered users
    if (this.filteredUsers.length > 0) {
      this.showUserDropdown = true;
    }
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    this.userSearchTerm = user.name;
    this.ticketForm.patchValue({ user_id: user.id.toString() });
    this.showUserDropdown = false;
    this.filteredUsers = [];
  }

  clearUserSelection(): void {
    this.selectedUser = null;
    this.userSearchTerm = '';
    this.ticketForm.patchValue({ user_id: '' });
    this.filteredUsers = [];
    this.showUserDropdown = false;
  }

  onSubmit(): void {
    if (this.ticketForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formData = new FormData();
      const formValue = this.ticketForm.value;

      formData.append('title', formValue.title!);
      formData.append('description', formValue.description!);
      formData.append('priority', formValue.priority!);

      if (formValue.ticket_category_id) {
        formData.append('ticket_category_id', formValue.ticket_category_id);
      }

      // Add user_id if admin is creating ticket for another user
      if (this.isAdmin && formValue.user_id) {
        formData.append('user_id', formValue.user_id);
      }

      const files = formValue.attachments as any;
      if (files && Array.isArray(files) && files.length > 0) {
        (files as File[]).forEach((file: File, index: number) => {
          formData.append(`attachments[${index}]`, file);
        });
      }

      this.ticketService.createTicket(formData).subscribe({
        next: (response) => {
          this.router.navigate(['/tickets', response.data.id]);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to create ticket';
          this.isSubmitting = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/tickets']);
  }
}
