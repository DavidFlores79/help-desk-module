import { Pipe, PipeTransform } from '@angular/core';
import { TicketPriority } from '../../core/models/ticket.model';

@Pipe({
  name: 'priorityBadge',
  standalone: true
})
export class PriorityBadgePipe implements PipeTransform {
  transform(priority: TicketPriority): string {
    const badges: Record<TicketPriority, string> = {
      'low': 'badge-gray',
      'medium': 'badge-info',
      'high': 'badge-warning',
      'urgent': 'badge-danger'
    };
    return badges[priority] || 'badge-gray';
  }
}
