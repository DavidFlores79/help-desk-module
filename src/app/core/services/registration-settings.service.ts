import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { RegistrationSettings } from '../models/registration-settings.model';

@Injectable({
  providedIn: 'root',
})
export class RegistrationSettingsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/settings/registration`;

  getSettings(): Observable<ApiResponse<RegistrationSettings>> {
    return this.http.get<ApiResponse<RegistrationSettings>>(this.apiUrl);
  }

  /** Superusers only. Fields not sent keep their current value. */
  updateSettings(
    settings: Partial<RegistrationSettings>,
  ): Observable<ApiResponse<RegistrationSettings>> {
    return this.http.put<ApiResponse<RegistrationSettings>>(this.apiUrl, settings);
  }
}
