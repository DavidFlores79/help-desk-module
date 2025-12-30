import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketService } from '../../../../core/services/ticket.service';
import { TicketCategoryService } from '../../../../core/services/ticket-category.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-new-ticket-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule,
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
export class NewTicketPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private ticketCategoryService = inject(TicketCategoryService);
  private router = inject(Router);

  ticketForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    priority: ['medium', Validators.required],
    ticket_category_id: [''],
    attachments: [[]]
  });

  ticketCategories: any[] = [];
  isSubmitting = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadTicketCategories();
  }

  loadTicketCategories(): void {
    this.ticketCategoryService.getTicketCategories(true).subscribe({
      next: (response) => {
        this.ticketCategories = response.data || [];
      },
      error: () => {}
    });
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
