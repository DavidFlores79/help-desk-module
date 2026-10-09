import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NotificationSettingsService } from './notification-settings.service';
import { environment } from '../../../environments/environment';

describe('NotificationSettingsService', () => {
  const url = `${environment.apiUrl}/v1/settings/notifications`;
  let service: NotificationSettingsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NotificationSettingsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the settings with GET', () => {
    service.getSettings().subscribe();

    expect(http.expectOne(url).request.method).toBe('GET');
  });

  it('saves only the fields it is given with PUT', () => {
    service.updateSettings({ status_change_notify_owner: true }).subscribe();

    const request = http.expectOne(url).request;
    expect(request.method).toBe('PUT');
    expect(request.body).toEqual({ status_change_notify_owner: true });
  });
});
