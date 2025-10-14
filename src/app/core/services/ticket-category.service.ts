import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TicketCategory } from '../models/ticket.model';
import { ApiResponse } from '../models/api-response.model';

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
}
