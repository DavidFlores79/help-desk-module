import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { RegistrationSettings } from '../../../../core/models/registration-settings.model';

const MAX_DOMAINS = 20;
const MAX_DOMAIN_LENGTH = 255;
// A domain name with at least one dot, e.g. uady.mx (same rule as the API)
const DOMAIN_PATTERN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

/**
 * Splits "uady.mx, @Correo.UADY.mx" (commas, semicolons, spaces or new lines)
 * into clean, lowercase domains without "@", blanks or repeats.
 */
export function parseDomainList(text: string): string[] {
  const domains = text
    .split(/[\s,;]+/)
    .map((domain) => domain.replace(/^@+/, '').toLowerCase())
    .filter((domain) => domain !== '');

  return [...new Set(domains)];
}

function domainsValidator(control: AbstractControl): ValidationErrors | null {
  const domains = parseDomainList(control.value ?? '');

  if (domains.length > MAX_DOMAINS) {
    return { tooMany: true };
  }
  if (
    !domains.every((domain) => domain.length <= MAX_DOMAIN_LENGTH && DOMAIN_PATTERN.test(domain))
  ) {
    return { invalidDomain: true };
  }
  return null;
}

/**
 * Form for who may create their own account. The settings page loads and
 * saves the settings; this component only edits them and emits what changed.
 */
@Component({
  selector: 'app-registration-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6 ml-4">
      @if (!editable) {
        <p class="text-sm text-amber-600">
          {{ 'settings.registrationSettings.onlySuperusers' | translate }}
        </p>
      }

      <div [class.opacity-50]="form.controls.registration_allow_public_emails.value">
        <label for="allowed-domains" class="block font-medium text-gray-900 mb-1">
          {{ 'settings.registrationSettings.allowedDomains' | translate }}
        </label>
        <p class="text-sm text-gray-600 mb-2">
          {{ 'settings.registrationSettings.allowedDomainsDescription' | translate }}
        </p>
        <textarea
          id="allowed-domains"
          rows="2"
          class="input-field"
          formControlName="registration_allowed_domains"
          placeholder="uady.mx"
        ></textarea>
        @if (form.controls.registration_allowed_domains.hasError('invalidDomain')) {
          <p class="mt-1 text-sm text-red-600">
            {{ 'settings.registrationSettings.invalidDomain' | translate }}
          </p>
        }
        @if (form.controls.registration_allowed_domains.hasError('tooMany')) {
          <p class="mt-1 text-sm text-red-600">
            {{ 'settings.registrationSettings.tooManyDomains' | translate }}
          </p>
        }
      </div>

      <div class="flex items-start justify-between gap-4 pt-4 border-t border-gray-100">
        <div>
          <p id="allow-public-emails-label" class="font-medium text-gray-900">
            {{ 'settings.registrationSettings.allowPublicEmails' | translate }}
          </p>
          <p class="text-sm text-gray-600">
            {{ 'settings.registrationSettings.allowPublicEmailsDescription' | translate }}
          </p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            class="sr-only peer"
            formControlName="registration_allow_public_emails"
            aria-labelledby="allow-public-emails-label"
          />
          <div [class]="switchClasses"></div>
        </label>
      </div>

      @if (isSignUpClosed()) {
        <p class="text-sm text-amber-600">
          {{ 'settings.registrationSettings.signUpClosed' | translate }}
        </p>
      }

      <p class="text-xs text-gray-500 pt-4 border-t border-gray-100">
        {{ 'settings.registrationSettings.verificationAlwaysOn' | translate }}
      </p>

      @if (editable) {
        <div class="flex items-center gap-4">
          <button
            type="submit"
            class="btn-primary"
            [disabled]="isSaving || form.pristine || form.invalid"
          >
            {{ (isSaving ? 'app.saving' : 'app.save') | translate }}
          </button>
          <!-- "Saved" only while nothing has been edited since -->
          @if (successMessageKey && form.pristine) {
            <span class="text-sm text-green-700">{{ successMessageKey | translate }}</span>
          }
          @if (errorMessageKey) {
            <span class="text-sm text-red-700">{{ errorMessageKey | translate }}</span>
          }
        </div>
      }
    </form>
  `,
})
export class RegistrationSettingsComponent {
  private fb = inject(FormBuilder);

  /** Settings as last loaded or saved; edits are compared against these. */
  private savedSettings: RegistrationSettings | null = null;

  editable = false;
  isSaving = false;

  @Input({ required: true }) set settings(settings: RegistrationSettings) {
    this.savedSettings = settings;
    // reset() also marks the form as pristine
    this.form.reset({
      registration_allowed_domains: settings.registration_allowed_domains.join(', '),
      registration_allow_public_emails: settings.registration_allow_public_emails,
    });
  }

  @Input() set canEdit(canEdit: boolean) {
    this.editable = canEdit;
    this.updateFormLock();
  }

  /** The form is locked while saving, so no edit is lost when the saved settings come back. */
  @Input() set saving(saving: boolean) {
    this.isSaving = saving;
    this.updateFormLock();
  }

  /** Translation keys, so the text follows a language change. */
  @Input() successMessageKey = '';
  @Input() errorMessageKey = '';

  /** Emits only the settings that changed, so two people editing don't overwrite each other. */
  @Output() saveSettings = new EventEmitter<Partial<RegistrationSettings>>();

  readonly switchClasses =
    "w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 peer-disabled:opacity-50 after:content-[''] " +
    'after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 ' +
    'after:transition-all peer-checked:after:translate-x-full';

  form = this.fb.nonNullable.group({
    registration_allowed_domains: ['', domainsValidator],
    registration_allow_public_emails: false,
  });

  /** No domain and no public emails: nobody can sign up (allowed, but worth a warning). */
  isSignUpClosed(): boolean {
    const value = this.form.getRawValue();

    return (
      !value.registration_allow_public_emails &&
      parseDomainList(value.registration_allowed_domains).length === 0
    );
  }

  onSubmit(): void {
    if (!this.editable || this.form.invalid || !this.savedSettings) {
      return;
    }

    const value = this.form.getRawValue();
    const edited: RegistrationSettings = {
      registration_allowed_domains: parseDomainList(value.registration_allowed_domains),
      registration_allow_public_emails: value.registration_allow_public_emails,
    };

    const changes: Partial<RegistrationSettings> = {};
    for (const key of Object.keys(edited) as (keyof RegistrationSettings)[]) {
      if (JSON.stringify(edited[key]) !== JSON.stringify(this.savedSettings[key])) {
        Object.assign(changes, { [key]: edited[key] });
      }
    }

    // Only spacing, case or repeats changed: show the saved values again, nothing to send
    if (Object.keys(changes).length === 0) {
      this.settings = this.savedSettings;
      return;
    }

    this.saveSettings.emit(changes);
  }

  private updateFormLock(): void {
    if (this.editable && !this.isSaving) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }
}
