import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TicketCategory } from '../models/ticket.model';
import { ApiResponse } from '../models/api-response.model';

export interface CreateTicketCategoryDto {
  name: string;
  description?: string;
  active?: boolean;
}

export interface UpdateTicketCategoryDto {
  name?: string;
  description?: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TicketCategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/ticket-categories`;

  getTicketCategories(activeOnly: boolean = true): Observable<ApiResponse<TicketCategory[]>> {
    let params = new HttpParams();
    if (activeOnly) {
      params = params.set('active_only', 'true');
    }
    return this.http.get<ApiResponse<TicketCategory[]>>(this.apiUrl, { params });
  }

  getTicketCategory(id: number): Observable<ApiResponse<TicketCategory>> {
    return this.http.get<ApiResponse<TicketCategory>>(`${this.apiUrl}/${id}`);
  }

  createTicketCategory(data: CreateTicketCategoryDto): Observable<ApiResponse<TicketCategory>> {
    return this.http.post<ApiResponse<TicketCategory>>(this.apiUrl, data);
  }

  updateTicketCategory(id: number, data: UpdateTicketCategoryDto): Observable<ApiResponse<TicketCategory>> {
    return this.http.put<ApiResponse<TicketCategory>>(`${this.apiUrl}/${id}`, data);
  }

  deleteTicketCategory(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
