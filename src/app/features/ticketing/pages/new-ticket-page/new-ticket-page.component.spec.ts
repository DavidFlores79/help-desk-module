import { Component, NO_ERRORS_SCHEMA, forwardRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NewTicketPageComponent } from './new-ticket-page.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { TicketService } from '../../../../core/services/ticket.service';
import { TicketCategoryService } from '../../../../core/services/ticket-category.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';

/** Stands in for the FilePond upload, which is not under test here. */
@Component({
  selector: 'app-file-upload',
  standalone: true,
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadStubComponent),
      multi: true,
    },
  ],
})
class FileUploadStubComponent implements ControlValueAccessor {
  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
}

describe('NewTicketPageComponent - quick ticket for regular users', () => {
  let ticketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<NewTicketPageComponent>;

  function createPage(isAdmin: boolean): NewTicketPageComponent {
    ticketService = jasmine.createSpyObj('TicketService', ['createTicket']);
    const categoryService = jasmine.createSpyObj('TicketCategoryService', ['getTicketCategories']);
    categoryService.getTicketCategories.and.returnValue(
      of({
        data: [
          { id: 1, name: 'Red e internet' },
          { id: 2, name: 'Impresoras' },
        ],
      }),
    );

    TestBed.configureTestingModule({
      imports: [NewTicketPageComponent],
      providers: [
        provideRouter([]),
        { provide: TicketService, useValue: ticketService },
        { provide: TicketCategoryService, useValue: categoryService },
        { provide: UserService, useValue: {} },
        { provide: AuthService, useValue: { isAdmin: () => isAdmin } },
        { provide: TranslationService, useValue: { instant: (key: string) => key } },
      ],
    });
    TestBed.overrideComponent(NewTicketPageComponent, {
      remove: { imports: [HeaderComponent, FileUploadComponent] },
      add: { imports: [FileUploadStubComponent], schemas: [NO_ERRORS_SCHEMA] },
    });
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    fixture = TestBed.createComponent(NewTicketPageComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  function page(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the short form: no priority, categories as chips', () => {
    createPage(false);

    expect(page().textContent).toContain('ticket.quick.title');
    expect(page().querySelector('#priority')).toBeNull();
    expect(page().querySelector('#ticket_category_id')).toBeNull();
    expect(page().querySelectorAll('button[aria-pressed]').length).toBe(2);
  });

  it('tapping a chip picks the category, tapping it again clears it', () => {
    const component = createPage(false);

    component.toggleCategory(2);
    expect(component.isCategorySelected(2)).toBeTrue();
    expect(component.ticketForm.value.ticket_category_id).toBe('2');

    component.toggleCategory(2);
    expect(component.ticketForm.value.ticket_category_id).toBe('');
  });

  it('sends the report with medium priority and the chosen category', () => {
    const component = createPage(false);
    ticketService.createTicket.and.returnValue(of({ data: { id: 41 } }) as never);
    component.ticketForm.patchValue({ title: 'Sin internet', description: 'Salón 3 desde ayer' });
    component.toggleCategory(1);

    component.onSubmit();

    const sent = ticketService.createTicket.calls.mostRecent().args[0] as FormData;
    expect(sent.get('priority')).toBe('medium');
    expect(sent.get('ticket_category_id')).toBe('1');
    expect(sent.has('user_id')).toBeFalse();
  });

  it('admins keep the full form', () => {
    createPage(true);

    expect(page().textContent).toContain('ticket.createNewTicket');
    expect(page().querySelector('#priority')).not.toBeNull();
    expect(page().querySelector('#ticket_category_id')).not.toBeNull();
  });
});
