# Ticket Resolution Time Tracking - Quick Guide

## Summary
Simple solution to track ticket resolution time excluding weekends (Saturdays and Sundays).

## What It Does

✅ **Calculates business hours** (Monday-Friday only)  
✅ **Handles reopened tickets** (tracks from last reopen)  
✅ **Simple to use** (just 2 new database columns)

## Database Changes

Run the migration:
```bash
cd bitacoracore
php artisan migrate
```

**New columns added to `tickets` table:**
- `resolution_hours` - Business hours to resolve (decimal, e.g., 24.5)
- `last_reopened_at` - Timestamp of last reopen

## Controller Usage

### When resolving a ticket:
```php
use App\Services\TicketResolutionCalculator;

$ticket->status = 'resolved';
$ticket->resolved_at = now();

// Calculate resolution hours (excludes weekends)
$calculator = app(TicketResolutionCalculator::class);
$ticket->resolution_hours = $calculator->calculateForTicket($ticket);

$ticket->save();
```

### When reopening a ticket:
```php
$ticket->reopens += 1;
$ticket->last_reopened_at = now();
$ticket->status = 'open';
$ticket->resolved_at = null;
$ticket->resolution_hours = null; // Reset
$ticket->save();
```

## How Weekends Are Handled

**Example 1: Weekend in between**
```
Created: Friday 2:00 PM
Resolved: Monday 10:00 AM
Result: 20 hours (Fri: 10h + Mon: 10h)
Saturday/Sunday excluded ✅
```

**Example 2: Created on weekend**
```
Created: Saturday 9:00 AM  
Resolved: Monday 5:00 PM
Result: 17 hours (only Monday counted)
Weekend excluded ✅
```

## How Reopens Work

Each time a ticket is reopened, the timer resets:

```
Created: Monday 9 AM
Resolved: Tuesday 5 PM = 32 hours ✅

Reopened: Wednesday 10 AM (timer resets here)
Resolved: Thursday 2 PM = 28 hours ✅ (replaces previous)
```

The `resolution_hours` field shows the **most recent resolution time**, not cumulative.

## API Response Example

```json
{
  "id": 123,
  "title": "Laptop not charging",
  "status": "resolved",
  "created_at": "2025-01-20 09:00:00",
  "resolved_at": "2025-01-22 15:30:00",
  "reopens": 0,
  "resolution_hours": 54.5,
  "resolution_hours_formatted": "2 días, 6.5 horas"
}
```

## Reporting Examples

### Average resolution time by priority:
```php
$stats = Ticket::select('priority')
    ->selectRaw('AVG(resolution_hours) as avg_hours')
    ->whereNotNull('resolution_hours')
    ->groupBy('priority')
    ->get();
```

### Slowest tickets:
```php
$slowest = Ticket::whereNotNull('resolution_hours')
    ->orderBy('resolution_hours', 'desc')
    ->limit(10)
    ->get();
```

## What About Holidays?

The simple solution **only excludes weekends** (Sat/Sun). 

If you need to also exclude company holidays, see the comprehensive solution files that were created which include:
- `CompanyHoliday` model
- `BusinessHoursCalculator` with holiday support
- `TicketSlaTracker` for full SLA management

## Notes

- **Timezone**: Uses your app's default timezone (`config/app.php`)
- **Calculation**: Counts full 24-hour days (not 9am-6pm business hours)
- **Weekends**: Saturday and Sunday are excluded
- **Holidays**: NOT excluded in this simple version
