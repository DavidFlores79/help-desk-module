# Comprehensive script to create all application files
Write-Host "Creating comprehensive Help Desk application structure..." -ForegroundColor Cyan

# Create all TypeScript component files with implementations
$components = @{
    "src/app/features/ticketing/components/ticket-card/ticket-card.component.ts" = @"
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Ticket } from '../../../../core/models/ticket.model';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { StatusBadgePipe } from '../../../../shared/pipes/status-badge.pipe';
import { PriorityBadgePipe } from '../../../../shared/pipes/priority-badge.pipe';

@Component({
  selector: 'app-ticket-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeAgoPipe, StatusBadgePipe, PriorityBadgePipe],
  templateUrl: './ticket-card.component.html',
  styleUrls: ['./ticket-card.component.css']
})
export class TicketCardComponent {
  @Input({ required: true }) ticket!: Ticket;
}
"@

    "src/app/features/ticketing/components/ticket-card/ticket-card.component.html" = @"
<div class='card hover:shadow-monday-lg transition-shadow duration-200 cursor-pointer'
     [routerLink]='[`"/tickets`", ticket.id]'>
  <div class='flex items-start justify-between mb-3'>
    <div class='flex-1'>
      <h3 class='text-lg font-heading font-semibold text-gray-900 mb-1'>
        {{ ticket.title }}
      </h3>
      <p class='text-sm text-gray-600 line-clamp-2'>
        {{ ticket.description }}
      </p>
    </div>
    <span class='ml-4 text-xs text-gray-500'>#{{ ticket.id }}</span>
  </div>

  <div class='flex items-center gap-2 mb-3'>
    <span [class]='ticket.status | statusBadge'>
      {{ ticket.status_label }}
    </span>
    <span [class]='ticket.priority | priorityBadge'>
      {{ ticket.priority_label }}
    </span>
    @if (ticket.category) {
      <span class='badge badge-gray'>
        {{ ticket.category.name }}
      </span>
    }
  </div>

  <div class='flex items-center justify-between text-sm text-gray-500'>
    <div class='flex items-center gap-4'>
      <span>{{ ticket.user.name }}</span>
      @if (ticket.assignedTo) {
        <span class='flex items-center gap-1'>
          <svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' 
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
          </svg>
          {{ ticket.assignedTo.name }}
        </span>
      }
    </div>
    <span>{{ ticket.created_at | timeAgo }}</span>
  </div>
</div>
"@

    "src/app/features/ticketing/components/ticket-card/ticket-card.component.css" = @"
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
"@
}

# Write all component files
foreach ($file in $components.Keys) {
    $content = $components[$file]
    Set-Content -Path $file -Value $content -Encoding UTF8
    Write-Host "Created: $file" -ForegroundColor Green
}

Write-Host "`nApplication structure created successfully!" -ForegroundColor Green
"@
