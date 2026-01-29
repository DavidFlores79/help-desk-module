import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketResponse, Ticket } from '../../../core/models/ticket.model';
import { AuthService } from '../../../core/services/auth.service';
import { TicketService } from '../../../core/services/ticket.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { AttachmentViewerComponent } from '../attachment-viewer/attachment-viewer.component';

@Component({
  selector: 'app-responses-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TimeAgoPipe,
    FileUploadComponent,
    AttachmentViewerComponent
  ],
  template: `
    <!-- Backdrop -->
    @if (isOpen) {
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        (click)="close()"
      ></div>
    }

    <!-- Slide-in Panel -->
    <div 
      class="fixed top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
      [class.translate-x-0]="isOpen"
      [class.translate-x-full]="!isOpen"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div>
          <h2 class="text-2xl font-heading font-bold text-gray-900">{{ translationService.instant('response.responses') }}</h2>
          <p class="text-sm text-gray-600 mt-1">
            {{ responses.length }} {{ responses.length === 1 ? translationService.instant('response.response') : translationService.instant('response.responses') }}
          </p>
        </div>
        <button 
          (click)="close()"
          class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
          [title]="translationService.instant('app.close')">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Responses List -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        @if (responses.length === 0) {
          <div class="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-lg font-medium">{{ translationService.instant('response.noResponses') }}</p>
            <p class="text-sm mt-1">{{ translationService.instant('response.beFirst') }}</p>
          </div>
        }

        @for (response of responses; track response.id) {
          <!-- Only show internal notes to admins -->
          @if (!response.is_internal || (response.is_internal && authService.isAdmin())) {
            <div 
              class="rounded-lg border transition-shadow hover:shadow-md"
              [class.bg-blue-50]="response.is_internal"
              [class.border-blue-200]="response.is_internal"
              [class.bg-white]="!response.is_internal"
              [class.border-gray-200]="!response.is_internal"
            >
              <div class="p-4">
                <div class="flex items-start gap-3">
                  <!-- Avatar -->
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-primary-700 font-semibold text-sm">
                        {{ response.user.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-2">
                      <div>
                        <p class="font-semibold text-gray-900">{{ response.user.name }}</p>
                        <p class="text-xs text-gray-500">{{ response.created_at | timeAgo }}</p>
                      </div>
                      @if (response.is_internal) {
                        <span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          {{ translationService.instant('response.internalNote') }}
                        </span>
                      }
                    </div>
                    
                    <p class="text-gray-700 whitespace-pre-wrap break-words">{{ response.message || response.body }}</p>
                    
                    <!-- Attachments -->
                    @if (response.attachments && response.attachments.length > 0) {
                      <div class="mt-3">
                        <app-attachment-viewer
                          [attachments]="response.attachments"
                          [canDelete]="false"
                        ></app-attachment-viewer>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        }
      </div>

      <!-- Add Response Form (if ticket is not resolved or closed) -->
      @if (ticket && ticket.status !== 'closed' && ticket.status !== 'resolved') {
        <div class="border-t border-gray-200 bg-gray-50 p-6 relative z-50">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ translationService.instant('response.addResponse') }}</h3>
          
          <form [formGroup]="responseForm" (ngSubmit)="submitResponse()">
            <div class="mb-4">
              <textarea
                formControlName="body"
                rows="3"
                class="input-field resize-none"
                [placeholder]="translationService.instant('response.typeResponse')"
                [class.border-danger-500]="responseForm.get('body')?.invalid && responseForm.get('body')?.touched"
              ></textarea>
              @if (responseForm.get('body')?.invalid && responseForm.get('body')?.touched) {
                <p class="mt-1 text-sm text-danger-600">{{ translationService.instant('response.bodyRequired') }}</p>
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
                  <span class="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {{ translationService.instant('response.markAsInternal') }}
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

            <div class="flex items-center gap-3 relative z-50">
              <button
                type="button"
                (click)="submitResponse()"
                class="btn-primary relative z-50 pointer-events-auto"
                style="pointer-events: auto !important; position: relative; z-index: 9999;"
                [disabled]="responseForm.invalid || isSubmittingResponse">
                @if (isSubmittingResponse) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ translationService.instant('response.sending') }}
                } @else {
                  {{ translationService.instant('response.sendResponse') }}
                }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `
})
export class ResponsesModalComponent {
  @Input() isOpen = false;
  @Input() responses: TicketResponse[] = [];
  @Input() ticket: Ticket | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() responseAdded = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  authService = inject(AuthService);
  translationService = inject(TranslationService);

  responseError = '';
  isSubmittingResponse = false;

  responseForm = this.fb.group({
    body: ['', Validators.required],
    attachments: [[]],
    internal: [false]
  });

  close(): void {
    this.closeModal.emit();
  }

  submitResponse(): void {
    if (this.responseForm.invalid || !this.ticket) {
      this.responseForm.markAllAsTouched();
      return;
    }

    // Prevent responses on resolved or closed tickets
    if (this.ticket.status === 'closed' || this.ticket.status === 'resolved') {
      this.responseError = this.translationService.instant('response.cannotAddResponse');
      return;
    }

    this.isSubmittingResponse = true;
    this.responseError = '';

    const bodyText = this.responseForm.value.body!;
    const files = this.responseForm.value.attachments as any;
    const internal = this.responseForm.value.internal || false;
    const hasFiles = files && Array.isArray(files) && files.length > 0;

    let payload: any;

    if (hasFiles) {
      const formData = new FormData();
      formData.append('body', bodyText);
      
      if (internal) {
        formData.append('internal', '1');
      }
      
      (files as File[]).forEach((file: File) => {
        formData.append('attachments[]', file, file.name);
      });

      payload = formData;
    } else {
      payload = { body: bodyText };
      if (internal) {
        payload.internal = true;
      }
    }

    this.ticketService.addResponse(this.ticket.id, payload).subscribe({
      next: (response) => {
        // Reset form completely including file upload
        this.responseForm.reset({
          body: '',
          attachments: null,
          internal: false
        });
        this.isSubmittingResponse = false;
        this.responseAdded.emit();
      },
      error: (error) => {
        this.responseError = error.message || 'Failed to add response';
        this.isSubmittingResponse = false;
      }
    });
  }
}
