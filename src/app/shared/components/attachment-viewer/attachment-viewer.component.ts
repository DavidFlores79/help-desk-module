import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Attachment } from '../../../core/models/ticket.model';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-attachment-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap gap-2">
      @for (attachment of attachments; track attachment.id) {
        <div class="group relative flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all">
          <!-- File Icon -->
          <div class="flex-shrink-0">
            @if (isImage(getMimeType(attachment))) {
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            } @else if (isPdf(getMimeType(attachment))) {
              <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            } @else {
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            }
          </div>

          <!-- File Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate max-w-xs" [title]="attachment.name || attachment.original_name">
              {{ attachment.name || attachment.original_name }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatFileSize(attachment.size) }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <!-- View Button (for images and PDFs) -->
            @if (canView(getMimeType(attachment))) {
              <button
                (click)="viewAttachment(attachment)"
                class="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                title="View in browser"
                [disabled]="isProcessing[attachment.id]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            }

            <!-- Download Button -->
            <button
              (click)="downloadAttachment(attachment)"
              class="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
              title="Download"
              [disabled]="isProcessing[attachment.id]">
              @if (isProcessing[attachment.id]) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            </button>

            <!-- Delete Button (if allowed) -->
            @if (canDelete) {
              <button
                (click)="deleteAttachment(attachment)"
                class="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Delete"
                [disabled]="isProcessing[attachment.id]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            }
          </div>
        </div>
      }
    </div>

    @if (errorMessage) {
      <div class="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
        {{ errorMessage }}
      </div>
    }
  `
})
export class AttachmentViewerComponent {
  @Input() attachments: Attachment[] = [];
  @Input() canDelete = false;
  @Output() attachmentDeleted = new EventEmitter<number>();

  private ticketService = inject(TicketService);
  private authService = inject(AuthService);

  isProcessing: { [key: number]: boolean } = {};
  errorMessage = '';

  /**
   * Get mime type from attachment, with fallback to guessing from filename
   */
  getMimeType(attachment: Attachment): string {
    if (attachment.mime_type) {
      return attachment.mime_type;
    }
    
    // Fallback: guess from filename extension
    const filename = attachment.original_name || attachment.name || '';
    const ext = filename.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'svg':
        return 'image/svg+xml';
      case 'pdf':
        return 'application/pdf';
      case 'doc':
      case 'docx':
        return 'application/msword';
      case 'xls':
      case 'xlsx':
        return 'application/vnd.ms-excel';
      case 'zip':
        return 'application/zip';
      case 'txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }

  isImage(mimeType: string | undefined): boolean {
    return this.ticketService.isImageAttachment(mimeType);
  }

  isPdf(mimeType: string | undefined): boolean {
    return this.ticketService.isPdfAttachment(mimeType);
  }

  canView(mimeType: string | undefined): boolean {
    return this.ticketService.canViewInBrowser(mimeType);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  viewAttachment(attachment: Attachment): void {
    console.log('👁️ [ATTACHMENT] Viewing attachment:', attachment.id);
    const viewUrl = this.ticketService.getAttachmentViewUrl(attachment.id);
    window.open(viewUrl, '_blank');
  }

  downloadAttachment(attachment: Attachment): void {
    this.isProcessing[attachment.id] = true;
    this.errorMessage = '';
    console.log('📥 [ATTACHMENT] Downloading attachment:', attachment.id);

    this.ticketService.downloadAttachment(attachment.id).subscribe({
      next: (blob) => {
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary anchor element and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.original_name || attachment.name || `attachment-${attachment.id}`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        this.isProcessing[attachment.id] = false;
        console.log('✅ [ATTACHMENT] Download completed');
      },
      error: (error) => {
        console.error('❌ [ATTACHMENT] Download failed:', error);
        this.errorMessage = 'Failed to download attachment. Please try again.';
        this.isProcessing[attachment.id] = false;
      }
    });
  }

  deleteAttachment(attachment: Attachment): void {
    if (!confirm(`Are you sure you want to delete "${attachment.original_name || attachment.name}"? This action cannot be undone.`)) {
      return;
    }

    this.isProcessing[attachment.id] = true;
    this.errorMessage = '';
    console.log('🗑️ [ATTACHMENT] Deleting attachment:', attachment.id);

    this.ticketService.deleteAttachment(attachment.id).subscribe({
      next: () => {
        console.log('✅ [ATTACHMENT] Attachment deleted successfully');
        this.isProcessing[attachment.id] = false;
        this.attachmentDeleted.emit(attachment.id);
      },
      error: (error) => {
        console.error('❌ [ATTACHMENT] Delete failed:', error);
        this.errorMessage = error.message || 'Failed to delete attachment. You may not have permission.';
        this.isProcessing[attachment.id] = false;
      }
    });
  }
}
