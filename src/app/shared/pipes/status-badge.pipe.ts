import { Pipe, PipeTransform } from '@angular/core';
import { TicketStatus } from '../../core/models/ticket.model';

@Pipe({
  name: 'statusBadge',
  standalone: true
})
export class StatusBadgePipe implements PipeTransform {
  transform(status: TicketStatus): string {
    const badges: Record<TicketStatus, string> = {
      'open': 'badge-info',
      'assigned': 'badge-warning',
      'in_progress': 'badge-warning',
      'awaiting_user': 'badge-info',
      'resolved': 'badge-success',
      'closed': 'badge-gray'
    };
    return badges[status] || 'badge-gray';
  }
}
