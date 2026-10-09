import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { NotificationSettings } from '../models/notification-settings.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationSettingsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/settings/notifications`;

  getSettings(): Observable<ApiResponse<NotificationSettings>> {
    return this.http.get<ApiResponse<NotificationSettings>>(this.apiUrl);
  }

  /** Superusers only. Fields not sent keep their current value. */
  updateSettings(
    settings: Partial<NotificationSettings>,
  ): Observable<ApiResponse<NotificationSettings>> {
    return this.http.put<ApiResponse<NotificationSettings>>(this.apiUrl, settings);
  }
}
