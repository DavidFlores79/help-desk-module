import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Ticket,
  CreateTicketDto,
  UpdateTicketDto,
  CreateResponseDto,
  AssignTicketDto,
  TicketFilters,
  TicketResponse
} from '../models/ticket.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/tickets`;

  getTickets(filters?: TicketFilters): Observable<ApiResponse<PaginatedResponse<Ticket>>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedResponse<Ticket>>>(this.apiUrl, { params });
  }

  getTicket(id: number): Observable<ApiResponse<Ticket>> {
    return this.http.get<ApiResponse<Ticket>>(`${this.apiUrl}/${id}`);
  }

  createTicket(data: CreateTicketDto | FormData): Observable<ApiResponse<Ticket>> {
    console.log('📤 [TICKET SERVICE] Creating ticket');
    
    // If already FormData, send directly
    if (data instanceof FormData) {
      return this.http.post<ApiResponse<Ticket>>(this.apiUrl, data);
    }
    
    // Otherwise, check if we need to build FormData for attachments
    if (data.attachments && data.attachments.length > 0) {
      const formData = this.buildFormData(data);
      return this.http.post<ApiResponse<Ticket>>(this.apiUrl, formData);
    }
    
    return this.http.post<ApiResponse<Ticket>>(this.apiUrl, data);
  }

  updateTicket(id: number, data: UpdateTicketDto | any): Observable<ApiResponse<Ticket>> {
    console.log('📤 [TICKET SERVICE] Updating ticket:', id);
    return this.http.put<ApiResponse<Ticket>>(`${this.apiUrl}/${id}`, data);
  }

  deleteTicket(id: number): Observable<ApiResponse<null>> {
    console.log('📤 [TICKET SERVICE] Deleting ticket:', id);
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

  addResponse(ticketId: number, data: CreateResponseDto | FormData | any): Observable<ApiResponse<TicketResponse>> {
    const endpoint = `${this.apiUrl}/${ticketId}/responses`;
    console.log('📤 [TICKET SERVICE] Adding response to ticket:', ticketId);
    console.log('   Endpoint:', endpoint);
    
    // If already FormData, send directly
    if (data instanceof FormData) {
      console.log('   ✉️ Payload type: FormData (with attachments)');
      console.log('   ⚙️ FormData details:');
      let hasBody = false;
      let hasAttachments = false;
      let fieldCount = 0;
      
      data.forEach((value, key) => {
        fieldCount++;
        if (key === 'body') hasBody = true;
        if (key.startsWith('attachments')) hasAttachments = true;
        
        if (value instanceof File) {
          console.log(`     ✓ ${key}: [File] ${value.name} (${value.size} bytes, type: ${value.type})`);
        } else {
          console.log(`     ✓ ${key}: "${value}"`);
        }
      });
      
      console.log(`   📊 Summary: ${fieldCount} fields total`);
      console.log(`      - Body field present: ${hasBody ? '✅' : '❌'}`);
      console.log(`      - Attachments present: ${hasAttachments ? '✅' : '❌'}`);
      
      if (!hasBody) {
        console.error('   ❌ ERROR: Missing required "body" field!');
      }
      
      return this.http.post<ApiResponse<TicketResponse>>(endpoint, data);
    }
    
    // If it's a plain object with just 'body' field, send as JSON (API spec line 391-404)
    if (typeof data === 'object' && 'body' in data && !data.attachments) {
      console.log('   ✉️ Payload type: JSON (no attachments)');
      console.log('   📋 JSON payload:', JSON.stringify(data, null, 2));
      return this.http.post<ApiResponse<TicketResponse>>(endpoint, data);
    }
    
    // Otherwise, check if we need to build FormData for attachments
    if (data.attachments && data.attachments.length > 0) {
      console.log('   ✉️ Building FormData for attachments');
      const formData = this.buildResponseFormData(data);
      return this.http.post<ApiResponse<TicketResponse>>(endpoint, formData);
    }
    
    // Fallback: send as JSON
    console.log('   ✉️ Payload type: JSON (fallback)');
    console.log('   📋 JSON payload:', JSON.stringify(data, null, 2));
    return this.http.post<ApiResponse<TicketResponse>>(endpoint, data);
  }

  assignTicket(ticketId: number, data: AssignTicketDto): Observable<ApiResponse<Ticket>> {
    return this.http.post<ApiResponse<Ticket>>(
      `${this.apiUrl}/${ticketId}/assign`,
      data
    );
  }

  reopenTicket(ticketId: number): Observable<ApiResponse<Ticket>> {
    console.log('📤 [TICKET SERVICE] Reopening ticket:', ticketId);
    return this.http.post<ApiResponse<Ticket>>(
      `${this.apiUrl}/${ticketId}/reopen`,
      {}
    );
  }

  changeStatus(ticketId: number, status: string): Observable<ApiResponse<Ticket>> {
    console.log('📤 [TICKET SERVICE] Changing ticket status:', ticketId, 'to', status);
    return this.http.put<ApiResponse<Ticket>>(
      `${this.apiUrl}/${ticketId}`,
      { status }
    );
  }

  changePriority(ticketId: number, priority: string): Observable<ApiResponse<Ticket>> {
    console.log('📤 [TICKET SERVICE] Changing ticket priority:', ticketId, 'to', priority);
    return this.http.put<ApiResponse<Ticket>>(
      `${this.apiUrl}/${ticketId}`,
      { priority }
    );
  }

  // Export Methods

  /**
   * Export tickets to PDF with optional filters
   * Applies the same filters as getTickets (status, priority, assigned_to)
   */
  exportTicketsPdf(filters?: TicketFilters): Observable<Blob> {
    console.log('📥 [TICKET SERVICE] Exporting tickets to PDF with filters:', filters);
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get(
      `${this.apiUrl}/export/pdf`,
      { params, responseType: 'blob' }
    );
  }

  // Attachment Management Methods

  /**
   * Download attachment with original filename
   * Forces browser to download the file
   */
  downloadAttachment(attachmentId: number): Observable<Blob> {
    console.log('📥 [TICKET SERVICE] Downloading attachment:', attachmentId);
    return this.http.get(
      `${this.apiUrl}/attachments/${attachmentId}`,
      { responseType: 'blob' }
    );
  }

  /**
   * View attachment in browser (for images, PDFs, etc.)
   * Displays file inline without downloading
   */
  viewAttachment(attachmentId: number): Observable<Blob> {
    console.log('👁️ [TICKET SERVICE] Viewing attachment:', attachmentId);
    return this.http.get(
      `${this.apiUrl}/attachments/${attachmentId}/view`,
      { responseType: 'blob' }
    );
  }

  /**
   * Delete attachment from ticket
   * Removes file from server and database
   */
  deleteAttachment(attachmentId: number): Observable<ApiResponse<null>> {
    console.log('🗑️ [TICKET SERVICE] Deleting attachment:', attachmentId);
    return this.http.delete<ApiResponse<null>>(
      `${this.apiUrl}/attachments/${attachmentId}`
    );
  }

  /**
   * Get download URL for attachment
   */
  getAttachmentDownloadUrl(attachmentId: number): string {
    return `${this.apiUrl}/attachments/${attachmentId}`;
  }

  /**
   * Get view URL for attachment (to display in browser)
   */
  getAttachmentViewUrl(attachmentId: number): string {
    return `${this.apiUrl}/attachments/${attachmentId}/view`;
  }

  /**
   * Helper to determine if attachment is an image
   */
  isImageAttachment(mimeType: string | undefined): boolean {
    return mimeType ? mimeType.startsWith('image/') : false;
  }

  /**
   * Helper to determine if attachment is a PDF
   */
  isPdfAttachment(mimeType: string | undefined): boolean {
    return mimeType === 'application/pdf';
  }

  /**
   * Helper to determine if attachment can be viewed in browser
   */
  canViewInBrowser(mimeType: string | undefined): boolean {
    if (!mimeType) return false;
    return this.isImageAttachment(mimeType) || 
           this.isPdfAttachment(mimeType) ||
           mimeType.startsWith('text/') ||
           mimeType === 'application/json';
  }

  private buildFormData(data: CreateTicketDto): FormData {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    
    if (data.priority) formData.append('priority', data.priority);
    if (data.ticket_category_id) formData.append('ticket_category_id', data.ticket_category_id.toString());
    if (data.assignment_id) formData.append('assignment_id', data.assignment_id.toString());
    
    if (data.attachments) {
      data.attachments.forEach(file => {
        formData.append('attachments[]', file);
      });
    }
    
    return formData;
  }

  private buildResponseFormData(data: CreateResponseDto): FormData {
    const formData = new FormData();
    
    // API spec requires 'body' field (TICKETING_API_REQUESTS.md line 393)
    formData.append('body', data.body);
    
    // internal is optional and admin-only (line 439)
    if (data.internal !== undefined) {
      formData.append('internal', data.internal ? '1' : '0');
    }
    
    // Attachments should use 'attachments[]' format (line 464-465)
    if (data.attachments) {
      data.attachments.forEach(file => {
        formData.append('attachments[]', file, file.name);
      });
    }
    
    console.log('📋 [TICKET SERVICE] Built FormData:');
    formData.forEach((value, key) => {
      if (value instanceof File) {
        console.log(`   ${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`   ${key}:`, value);
      }
    });
    
    return formData;
  }
}
