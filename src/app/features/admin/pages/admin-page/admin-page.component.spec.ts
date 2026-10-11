import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { TicketService } from '../../../../core/services/ticket.service';
import { TicketCategoryService } from '../../../../core/services/ticket-category.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { Ticket } from '../../../../core/models/ticket.model';
import { ApiResponse, PaginatedResponse } from '../../../../core/models/api-response.model';

const openTicket = {
  id: 14,
  title: 'Printer offline',
  status: 'open',
  status_label: 'Open',
  priority: 'medium',
  priority_label: 'Medium',
  user: { name: 'Ana' },
  created_at: '2026-10-10T10:00:00Z',
} as unknown as Ticket;

describe('AdminPageComponent - status update', () => {
  let ticketService: jasmine.SpyObj<TicketService>;

  function createPage() {
    ticketService = jasmine.createSpyObj<TicketService>('TicketService', [
      'getTickets',
      'changeStatus',
      'updateTicket',
      'assignTicket',
      'exportTicketsPdf',
    ]);
    ticketService.getTickets.and.returnValue(
      of({
        success: true,
        message: '',
        data: { data: [openTicket] } as PaginatedResponse<Ticket>,
      }),
    );

    TestBed.configureTestingModule({
      imports: [AdminPageComponent],
      providers: [
        provideRouter([]),
        { provide: TicketService, useValue: ticketService },
        {
          provide: TicketCategoryService,
          useValue: { getTicketCategories: () => of({ success: true, message: '', data: [] }) },
        },
        {
          provide: UserService,
          useValue: { getAdminsAndSuperUsers: () => of({ data: { data: [] } }) },
        },
        { provide: AuthService, useValue: {} },
        { provide: TranslationService, useValue: { instant: (key: string) => key } },
      ],
    });
    // The header is not under test here
    TestBed.overrideComponent(AdminPageComponent, {
      remove: { imports: [HeaderComponent] },
      add: { schemas: [NO_ERRORS_SCHEMA] },
    });

    const fixture = TestBed.createComponent(AdminPageComponent);
    fixture.detectChanges();
    return { fixture, page: fixture.componentInstance };
  }

  it('opens an in-page status dialog instead of a browser prompt', () => {
    const promptSpy = spyOn(window, 'prompt');
    const { fixture, page } = createPage();

    page.openStatusModal(openTicket);
    fixture.detectChanges();

    expect(promptSpy).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();
    expect(page.selectedStatus).toBe('open');
  });

  it('does not open the dialog for resolved or closed tickets', () => {
    const { page } = createPage();

    page.openStatusModal({ ...openTicket, status: 'closed' } as Ticket);

    expect(page.statusTicket).toBeNull();
  });

  it('saves the chosen status, closes the dialog and reloads the list', () => {
    const { page } = createPage();
    ticketService.changeStatus.and.returnValue(
      of({ success: true, message: '', data: openTicket }),
    );
    ticketService.getTickets.calls.reset();

    page.openStatusModal(openTicket);
    page.selectedStatus = 'in_progress';
    page.saveStatus();

    expect(ticketService.changeStatus).toHaveBeenCalledOnceWith(14, 'in_progress');
    expect(page.statusTicket).toBeNull();
    expect(ticketService.getTickets).toHaveBeenCalledTimes(1);
  });

  it('does not call the API when the status is unchanged', () => {
    const { page } = createPage();

    page.openStatusModal(openTicket);
    page.saveStatus();

    expect(ticketService.changeStatus).not.toHaveBeenCalled();
  });

  it('ignores a second save while the first is in flight', () => {
    const { page } = createPage();
    ticketService.changeStatus.and.returnValue(new Subject<ApiResponse<Ticket>>());

    page.openStatusModal(openTicket);
    page.selectedStatus = 'in_progress';
    page.saveStatus();
    page.saveStatus();

    expect(ticketService.changeStatus).toHaveBeenCalledTimes(1);
  });

  it('keeps the dialog open with the error when saving fails', () => {
    const { page } = createPage();
    ticketService.changeStatus.and.returnValue(throwError(() => ({ message: 'Server said no' })));

    page.openStatusModal(openTicket);
    page.selectedStatus = 'awaiting_user';
    page.saveStatus();

    expect(page.statusTicket).toBe(openTicket);
    expect(page.statusError).toBe('Server said no');
    expect(page.isUpdatingStatus).toBeFalse();
  });

  it('closes the dialog on Escape, but not while saving', () => {
    const { page } = createPage();
    ticketService.changeStatus.and.returnValue(new Subject<ApiResponse<Ticket>>());

    page.openStatusModal(openTicket);
    page.selectedStatus = 'in_progress';
    page.saveStatus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(page.statusTicket).toBe(openTicket);

    page.isUpdatingStatus = false;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(page.statusTicket).toBeNull();
  });

  it('shows a dismissible error instead of an alert when assigning fails', () => {
    const alertSpy = spyOn(window, 'alert');
    const { page } = createPage();
    ticketService.assignTicket.and.returnValue(throwError(() => ({ message: 'Assign failed' })));
    ticketService.getTickets.calls.reset();

    const select = document.createElement('select');
    select.innerHTML = '<option value="7" selected>Tech</option>';
    page.assignTicket(openTicket, { target: select } as unknown as Event);

    expect(alertSpy).not.toHaveBeenCalled();
    expect(page.errorMessage).toBe('Assign failed');
    expect(ticketService.getTickets).toHaveBeenCalledTimes(1);
  });
});
