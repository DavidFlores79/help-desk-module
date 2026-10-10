import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationSettingsComponent, parseDomainList } from './registration-settings.component';
import { TranslationService } from '../../../../core/services/translation.service';
import { RegistrationSettings } from '../../../../core/models/registration-settings.model';

describe('RegistrationSettingsComponent', () => {
  const storedSettings: RegistrationSettings = {
    registration_allowed_domains: ['uady.mx', 'example.edu'],
    registration_allow_public_emails: false,
  };

  function createComponent(canEdit: boolean): ComponentFixture<RegistrationSettingsComponent> {
    TestBed.configureTestingModule({
      imports: [RegistrationSettingsComponent],
      providers: [{ provide: TranslationService, useValue: { instant: (key: string) => key } }],
    });

    const fixture = TestBed.createComponent(RegistrationSettingsComponent);
    fixture.componentRef.setInput('settings', storedSettings);
    fixture.componentRef.setInput('canEdit', canEdit);
    fixture.detectChanges();
    return fixture;
  }

  function emitted(component: RegistrationSettingsComponent): jasmine.Spy {
    const spy = jasmine.createSpy('saveSettings');
    component.saveSettings.subscribe(spy);
    return spy;
  }

  it('shows the stored domains as one editable line', () => {
    const component = createComponent(true).componentInstance;

    expect(component.form.controls.registration_allowed_domains.value).toBe('uady.mx, example.edu');
    expect(component.form.controls.registration_allow_public_emails.value).toBeFalse();
  });

  it('is read-only for admins who are not superusers', () => {
    const fixture = createComponent(false);
    const element = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance.form.disabled).toBeTrue();
    expect(element.querySelector('button[type="submit"]')).toBeNull();
    expect(element.textContent).toContain('settings.registrationSettings.onlySuperusers');
  });

  it('emits only the settings that changed', () => {
    const component = createComponent(true).componentInstance;
    const saveSettings = emitted(component);
    component.form.controls.registration_allow_public_emails.setValue(true);

    component.onSubmit();

    expect(saveSettings).toHaveBeenCalledWith({ registration_allow_public_emails: true });
  });

  it('emits the domains as a clean list', () => {
    const component = createComponent(true).componentInstance;
    const saveSettings = emitted(component);
    component.form.controls.registration_allowed_domains.setValue(
      '@UADY.mx;  correo.uady.mx\nuady.mx',
    );

    component.onSubmit();

    expect(saveSettings).toHaveBeenCalledWith({
      registration_allowed_domains: ['uady.mx', 'correo.uady.mx'],
    });
  });

  it('sends nothing when only case, spacing or repeats changed', () => {
    const component = createComponent(true).componentInstance;
    const saveSettings = emitted(component);
    component.form.controls.registration_allowed_domains.setValue('@UADY.mx,example.edu, uady.mx');
    component.form.markAsDirty();

    component.onSubmit();

    expect(saveSettings).not.toHaveBeenCalled();
    expect(component.form.controls.registration_allowed_domains.value).toBe('uady.mx, example.edu');
    expect(component.form.pristine).toBeTrue();
  });

  it('rejects text that is not a domain', () => {
    const component = createComponent(true).componentInstance;

    for (const text of ['uady', 'https://uady.mx', 'ana@uady.mx', 'a'.repeat(250) + '.uady.mx']) {
      component.form.controls.registration_allowed_domains.setValue(text);
      expect(component.form.controls.registration_allowed_domains.hasError('invalidDomain'))
        .withContext(text)
        .toBeTrue();
    }
  });

  it('warns when nobody could sign up', () => {
    const fixture = createComponent(true);
    fixture.componentInstance.form.controls.registration_allowed_domains.setValue('');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'settings.registrationSettings.signUpClosed',
    );
  });

  it('parses a domain list without "@", blanks or repeats', () => {
    expect(parseDomainList(' @uady.mx, ,UADY.MX  example.edu ')).toEqual([
      'uady.mx',
      'example.edu',
    ]);
  });
});
