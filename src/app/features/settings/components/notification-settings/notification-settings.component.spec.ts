import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationSettingsComponent, parseEmailList } from './notification-settings.component';
import { TranslationService } from '../../../../core/services/translation.service';
import { NotificationSettings } from '../../../../core/models/notification-settings.model';

describe('NotificationSettingsComponent', () => {
  const storedSettings: NotificationSettings = {
    ticket_created_enabled: true,
    ticket_created_notify_all_admins: false,
    ticket_created_notify_creator: true,
    ticket_created_extra_emails: ['soporte@empresa.com', 'ti@empresa.com'],
    response_notify_owner: true,
    owner_reply_notify_support: true,
    status_change_notify_owner: false,
  };

  function createComponent(canEdit: boolean): ComponentFixture<NotificationSettingsComponent> {
    TestBed.configureTestingModule({
      imports: [NotificationSettingsComponent],
      providers: [{ provide: TranslationService, useValue: { instant: (key: string) => key } }],
    });

    const fixture = TestBed.createComponent(NotificationSettingsComponent);
    fixture.componentRef.setInput('settings', storedSettings);
    fixture.componentRef.setInput('canEdit', canEdit);
    fixture.detectChanges();
    return fixture;
  }

  function emitted(component: NotificationSettingsComponent): jasmine.Spy {
    const spy = jasmine.createSpy('saveSettings');
    component.saveSettings.subscribe(spy);
    return spy;
  }

  it('shows the stored settings, with extra emails as one editable line', () => {
    const component = createComponent(true).componentInstance;

    expect(component.form.controls.ticket_created_notify_all_admins.value).toBeFalse();
    expect(component.form.controls.ticket_created_extra_emails.value).toBe(
      'soporte@empresa.com, ti@empresa.com',
    );
  });

  it('is read-only for admins who are not superusers', () => {
    const fixture = createComponent(false);
    const element = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance.form.disabled).toBeTrue();
    expect(element.querySelector('button[type="submit"]')).toBeNull();
    expect(element.textContent).toContain('settings.notificationSettings.onlySuperusers');
  });

  it('emits only the settings that changed', () => {
    const component = createComponent(true).componentInstance;
    const saveSettings = emitted(component);
    component.form.controls.status_change_notify_owner.setValue(true);

    component.onSubmit();

    expect(saveSettings).toHaveBeenCalledWith({ status_change_notify_owner: true });
  });

  it('emits the extra emails as a clean list', () => {
    const component = createComponent(true).componentInstance;
    const saveSettings = emitted(component);
    component.form.controls.ticket_created_extra_emails.setValue('a@x.com,  b@y.com\nA@x.com');

    component.onSubmit();

    expect(saveSettings).toHaveBeenCalledWith({
      ticket_created_extra_emails: ['a@x.com', 'b@y.com'],
    });
  });

  it('sends no fields when only the spacing of the addresses changed', () => {
    const component = createComponent(true).componentInstance;
    const saveSettings = emitted(component);
    component.form.controls.ticket_created_extra_emails.setValue(
      'soporte@empresa.com,ti@empresa.com',
    );

    component.onSubmit();

    expect(saveSettings).toHaveBeenCalledWith({});
  });

  it('keeps Save disabled until something is edited', () => {
    const fixture = createComponent(true);
    const button = (fixture.nativeElement as HTMLElement).querySelector('button[type="submit"]');
    expect((button as HTMLButtonElement).disabled).toBeTrue();

    fixture.componentInstance.form.controls.response_notify_owner.setValue(false);
    fixture.componentInstance.form.markAsDirty();
    fixture.detectChanges();

    expect((button as HTMLButtonElement).disabled).toBeFalse();
  });

  it('locks the form while saving and unlocks it afterwards', () => {
    const fixture = createComponent(true);

    fixture.componentRef.setInput('saving', true);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.disabled).toBeTrue();

    fixture.componentRef.setInput('saving', false);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.enabled).toBeTrue();
  });

  it('rejects an invalid email address', () => {
    const component = createComponent(true).componentInstance;
    const saveSettings = emitted(component);
    component.form.controls.ticket_created_extra_emails.setValue('not-an-email');

    component.onSubmit();

    expect(component.form.controls.ticket_created_extra_emails.hasError('invalidEmail')).toBeTrue();
    expect(saveSettings).not.toHaveBeenCalled();
  });

  it('rejects more than 10 extra addresses', () => {
    const component = createComponent(true).componentInstance;
    const saveSettings = emitted(component);
    const elevenEmails = Array.from({ length: 11 }, (_, i) => `user${i}@x.com`).join(',');
    component.form.controls.ticket_created_extra_emails.setValue(elevenEmails);

    component.onSubmit();

    expect(component.form.controls.ticket_created_extra_emails.hasError('tooMany')).toBeTrue();
    expect(saveSettings).not.toHaveBeenCalled();
  });

  it('warns, without blocking the save, when the new-ticket alert has no recipients', () => {
    const component = createComponent(true).componentInstance;
    const saveSettings = emitted(component);
    component.form.controls.ticket_created_notify_creator.setValue(false);
    component.form.controls.ticket_created_extra_emails.setValue('');

    expect(component.hasNoRecipients()).toBeTrue();

    component.onSubmit();

    expect(saveSettings).toHaveBeenCalled();
  });

  it('does not warn about recipients once the new-ticket alert is turned off', () => {
    const component = createComponent(true).componentInstance;
    component.form.controls.ticket_created_enabled.setValue(false);
    component.form.controls.ticket_created_notify_creator.setValue(false);
    component.form.controls.ticket_created_extra_emails.setValue('');

    expect(component.hasNoRecipients()).toBeFalse();
  });

  it('hides the "saved" message as soon as the form is edited again', () => {
    const fixture = createComponent(true);
    fixture.componentRef.setInput('successMessageKey', 'saved!');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('saved!');

    fixture.componentInstance.form.controls.response_notify_owner.markAsDirty();
    fixture.detectChanges();

    expect(element.textContent).not.toContain('saved!');
  });
});

describe('parseEmailList', () => {
  it('splits on commas, semicolons, spaces and new lines, dropping blanks and repeats', () => {
    expect(parseEmailList(' a@x.com, b@y.com;c@z.com\n\n A@X.com ')).toEqual([
      'a@x.com',
      'b@y.com',
      'c@z.com',
    ]);
  });

  it('keeps addresses as typed', () => {
    expect(parseEmailList('Soporte@Empresa.com')).toEqual(['Soporte@Empresa.com']);
  });

  it('returns an empty list for empty text', () => {
    expect(parseEmailList('')).toEqual([]);
  });
});
