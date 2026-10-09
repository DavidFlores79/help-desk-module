import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { NotificationSettings } from '../../../../core/models/notification-settings.model';

const MAX_EXTRA_EMAILS = 10;
const MAX_EMAIL_LENGTH = 255;

/**
 * Splits "a@x.com, b@y.com" (commas, semicolons, spaces or new lines) into a
 * clean list without blanks. Repeats are dropped ignoring case; the first
 * spelling is kept as typed.
 */
export function parseEmailList(text: string): string[] {
  const seen = new Set<string>();

  return text
    .split(/[\s,;]+/)
    .filter((email) => email !== '')
    .filter((email) => {
      const key = email.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function isValidEmail(email: string): boolean {
  // Same rule the login and register forms use
  return email.length <= MAX_EMAIL_LENGTH && Validators.email(new FormControl(email)) === null;
}

function extraEmailsValidator(control: AbstractControl): ValidationErrors | null {
  const emails = parseEmailList(control.value ?? '');

  if (emails.length > MAX_EXTRA_EMAILS) {
    return { tooMany: true };
  }
  if (!emails.every(isValidEmail)) {
    return { invalidEmail: true };
  }
  return null;
}

/** Text for each on/off switch, keyed by its form control. */
interface NotificationToggle {
  control: 'response_notify_owner' | 'owner_reply_notify_support' | 'status_change_notify_owner';
  label: string;
  description: string;
}

/**
 * Form for the ticket email notification settings. The settings page loads
 * and saves them; this component only edits them and emits what changed.
 */
@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6 ml-4">
      @if (!editable) {
        <p class="text-sm text-amber-600">
          {{ 'settings.notificationSettings.onlySuperusers' | translate }}
        </p>
      }

      <!-- New ticket: alert support -->
      <div class="space-y-3">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p id="ticket-created-label" class="font-medium text-gray-900">
              {{ 'settings.notificationSettings.ticketCreated' | translate }}
            </p>
            <p class="text-sm text-gray-600">
              {{ 'settings.notificationSettings.ticketCreatedDescription' | translate }}
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              class="sr-only peer"
              formControlName="ticket_created_enabled"
              aria-labelledby="ticket-created-label"
            />
            <div [class]="switchClasses"></div>
          </label>
        </div>

        <div
          class="pl-4 border-l-2 border-gray-200 space-y-2"
          [class.opacity-50]="!form.controls.ticket_created_enabled.value"
        >
          <p class="text-sm font-medium text-gray-700">
            {{ 'settings.notificationSettings.recipients' | translate }}
          </p>
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" formControlName="ticket_created_notify_all_admins" />
            {{ 'settings.notificationSettings.allAdmins' | translate }}
          </label>
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" formControlName="ticket_created_notify_creator" />
            {{ 'settings.notificationSettings.creator' | translate }}
          </label>
          <div>
            <label for="extra-emails" class="block text-sm text-gray-700 mb-1">
              {{ 'settings.notificationSettings.extraEmails' | translate }}
            </label>
            <textarea
              id="extra-emails"
              rows="2"
              class="input-field"
              formControlName="ticket_created_extra_emails"
              placeholder="soporte@empresa.com, sistemas@empresa.com"
            ></textarea>
            @if (form.controls.ticket_created_extra_emails.hasError('invalidEmail')) {
              <p class="mt-1 text-sm text-red-600">
                {{ 'settings.notificationSettings.invalidEmail' | translate }}
              </p>
            }
            @if (form.controls.ticket_created_extra_emails.hasError('tooMany')) {
              <p class="mt-1 text-sm text-red-600">
                {{ 'settings.notificationSettings.tooManyEmails' | translate }}
              </p>
            }
          </div>
          @if (hasNoRecipients()) {
            <p class="text-sm text-amber-600">
              {{ 'settings.notificationSettings.noRecipients' | translate }}
            </p>
          }
          <p class="text-xs text-gray-500">
            {{ 'settings.notificationSettings.ownerExcluded' | translate }}
          </p>
        </div>
      </div>

      <!-- Other notifications: simple on/off switches -->
      @for (toggle of toggles; track toggle.control) {
        <div class="flex items-start justify-between gap-4 pt-4 border-t border-gray-100">
          <div>
            <p [id]="toggle.control + '-label'" class="font-medium text-gray-900">
              {{ toggle.label | translate }}
            </p>
            <p class="text-sm text-gray-600">{{ toggle.description | translate }}</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              class="sr-only peer"
              [formControlName]="toggle.control"
              [attr.aria-labelledby]="toggle.control + '-label'"
            />
            <div [class]="switchClasses"></div>
          </label>
        </div>
      }

      <p class="text-xs text-gray-500 pt-4 border-t border-gray-100">
        {{ 'settings.notificationSettings.alwaysSent' | translate }}
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
export class NotificationSettingsComponent {
  private fb = inject(FormBuilder);

  /** Settings as last loaded or saved; edits are compared against these. */
  private savedSettings: NotificationSettings | null = null;

  editable = false;
  isSaving = false;

  @Input({ required: true }) set settings(settings: NotificationSettings) {
    this.savedSettings = settings;
    // reset() also marks the form as pristine
    this.form.reset({
      ...settings,
      ticket_created_extra_emails: settings.ticket_created_extra_emails.join(', '),
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
  @Output() saveSettings = new EventEmitter<Partial<NotificationSettings>>();

  readonly switchClasses =
    "w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 peer-disabled:opacity-50 after:content-[''] " +
    'after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 ' +
    'after:transition-all peer-checked:after:translate-x-full';

  readonly toggles: NotificationToggle[] = [
    {
      control: 'response_notify_owner',
      label: 'settings.notificationSettings.responseNotifyOwner',
      description: 'settings.notificationSettings.responseNotifyOwnerDescription',
    },
    {
      control: 'owner_reply_notify_support',
      label: 'settings.notificationSettings.ownerReplyNotifySupport',
      description: 'settings.notificationSettings.ownerReplyNotifySupportDescription',
    },
    {
      control: 'status_change_notify_owner',
      label: 'settings.notificationSettings.statusChangeNotifyOwner',
      description: 'settings.notificationSettings.statusChangeNotifyOwnerDescription',
    },
  ];

  form = this.fb.nonNullable.group({
    ticket_created_enabled: true,
    ticket_created_notify_all_admins: true,
    ticket_created_notify_creator: true,
    ticket_created_extra_emails: ['', extraEmailsValidator],
    response_notify_owner: true,
    owner_reply_notify_support: true,
    status_change_notify_owner: false,
  });

  /** The new-ticket alert is on, but nobody would receive it (a warning, not an error). */
  hasNoRecipients(): boolean {
    const value = this.form.getRawValue();

    return (
      value.ticket_created_enabled &&
      !value.ticket_created_notify_all_admins &&
      !value.ticket_created_notify_creator &&
      parseEmailList(value.ticket_created_extra_emails).length === 0
    );
  }

  /** Always emits, even with no changes (the save then just confirms the current settings). */
  onSubmit(): void {
    if (!this.editable || this.form.invalid || !this.savedSettings) {
      return;
    }

    const value = this.form.getRawValue();
    const edited: NotificationSettings = {
      ...value,
      ticket_created_extra_emails: parseEmailList(value.ticket_created_extra_emails),
    };

    const changes: Partial<NotificationSettings> = {};
    for (const key of Object.keys(edited) as (keyof NotificationSettings)[]) {
      if (JSON.stringify(edited[key]) !== JSON.stringify(this.savedSettings[key])) {
        Object.assign(changes, { [key]: edited[key] });
      }
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
