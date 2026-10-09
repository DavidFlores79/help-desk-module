import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SettingsPageComponent } from './settings-page.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { LanguageSelectorComponent } from '../../../../shared/components/language-selector/language-selector.component';
import { NotificationSettingsService } from '../../../../core/services/notification-settings.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { NotificationSettings } from '../../../../core/models/notification-settings.model';

describe('SettingsPageComponent - notification settings', () => {
  const storedSettings: NotificationSettings = {
    ticket_created_enabled: true,
    ticket_created_notify_all_admins: true,
    ticket_created_notify_creator: true,
    ticket_created_extra_emails: [],
    response_notify_owner: true,
    owner_reply_notify_support: true,
    status_change_notify_owner: false,
  };

  let settingsService: jasmine.SpyObj<NotificationSettingsService>;

  function createPage(
    getSettingsResult = of({ success: true, message: '', data: storedSettings }),
  ) {
    settingsService = jasmine.createSpyObj('NotificationSettingsService', [
      'getSettings',
      'updateSettings',
    ]);
    settingsService.getSettings.and.returnValue(getSettingsResult);

    TestBed.configureTestingModule({
      imports: [SettingsPageComponent],
      providers: [
        { provide: NotificationSettingsService, useValue: settingsService },
        { provide: AuthService, useValue: { isSuperUser: () => true } },
        { provide: TranslationService, useValue: { instant: (key: string) => key } },
      ],
    });
    // The header and language selector are not under test here
    TestBed.overrideComponent(SettingsPageComponent, {
      remove: { imports: [HeaderComponent, LanguageSelectorComponent] },
      add: { schemas: [NO_ERRORS_SCHEMA] },
    });

    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('loads the settings on start', () => {
    const page = createPage();

    expect(page.notificationSettings).toEqual(storedSettings);
    expect(page.canEditNotifications).toBeTrue();
  });

  it('shows an error when the settings cannot be loaded', () => {
    const page = createPage(throwError(() => ({ status: 500 })));

    expect(page.notificationSettings).toBeNull();
    expect(page.notificationsErrorKey).toBe('settings.notificationSettings.loadError');
  });

  it('saves the changes and shows the stored result', () => {
    const page = createPage();
    const saved = { ...storedSettings, status_change_notify_owner: true };
    settingsService.updateSettings.and.returnValue(of({ success: true, message: '', data: saved }));

    page.saveNotificationSettings({ status_change_notify_owner: true });

    expect(settingsService.updateSettings).toHaveBeenCalledWith({
      status_change_notify_owner: true,
    });
    expect(page.notificationSettings).toEqual(saved);
    expect(page.notificationsSuccessKey).toBe('settings.notificationSettings.saved');
    expect(page.savingNotifications).toBeFalse();
  });

  it('explains a 403 as missing superuser rights', () => {
    const page = createPage();
    settingsService.updateSettings.and.returnValue(throwError(() => ({ status: 403 })));

    page.saveNotificationSettings({ response_notify_owner: false });

    expect(page.notificationsErrorKey).toBe('settings.notificationSettings.onlySuperusers');
    expect(page.savingNotifications).toBeFalse();
    expect(page.canEditNotifications).toBeFalse();
  });

  it('explains a 422 on the extra addresses as an invalid address', () => {
    const page = createPage();
    settingsService.updateSettings.and.returnValue(
      throwError(() => ({
        status: 422,
        error: { errors: { 'ticket_created_extra_emails.0': ['invalid'] } },
      })),
    );

    page.saveNotificationSettings({ ticket_created_extra_emails: ['x@y'] });

    expect(page.notificationsErrorKey).toBe('settings.notificationSettings.invalidEmail');
  });

  it('shows the generic error for a 422 on other fields', () => {
    const page = createPage();
    settingsService.updateSettings.and.returnValue(
      throwError(() => ({
        status: 422,
        error: { errors: { response_notify_owner: ['invalid'] } },
      })),
    );

    page.saveNotificationSettings({ response_notify_owner: false });

    expect(page.notificationsErrorKey).toBe('settings.notificationSettings.saveError');
  });

  it('shows a generic error for anything else', () => {
    const page = createPage();
    settingsService.updateSettings.and.returnValue(throwError(() => ({ status: 500 })));

    page.saveNotificationSettings({ response_notify_owner: false });

    expect(page.notificationsErrorKey).toBe('settings.notificationSettings.saveError');
  });
});
