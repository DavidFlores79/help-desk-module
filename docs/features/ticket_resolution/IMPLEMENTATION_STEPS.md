# Implementation Guide: Ticket Resolution Time Tracking

## Step-by-Step Implementation

### BACKEND (Laravel API)

#### Step 1: Run the Migration
```bash
cd bitacoracore
php artisan migrate
```

This adds:
- `resolution_hours` column
- `last_reopened_at` column

#### Step 2: Update TicketController

Add these imports at the top of `TicketController.php`:
```php
use App\Services\TicketResolutionCalculator;
use Carbon\Carbon;
```

##### A) When Ticket is Resolved (update() method)

Find where status changes to 'resolved' (around line 304) and modify:

```php
// BEFORE:
if ($newStatus === 'resolved' && $oldStatus !== 'resolved') {
    $data['resolved_at'] = now();
}

// AFTER:
if ($newStatus === 'resolved' && $oldStatus !== 'resolved') {
    $data['resolved_at'] = now();
    
    // Calculate resolution hours (excluding weekends)
    $calculator = app(TicketResolutionCalculator::class);
    $data['resolution_hours'] = $calculator->calculateForTicket($ticket);
}
```

##### B) When Ticket is Reopened (update() method)

Add this logic when status changes FROM 'resolved':

```php
// BEFORE:
elseif ($oldStatus === 'resolved' && $newStatus !== 'resolved') {
    $data['resolved_at'] = null;
}

// AFTER:
elseif ($oldStatus === 'resolved' && $newStatus !== 'resolved') {
    $data['resolved_at'] = null;
    $data['last_reopened_at'] = now();
    $data['resolution_hours'] = null; // Reset timer
    $data['reopens'] = $ticket->reopens + 1; // Increment counter
}
```

##### C) Add a Dedicated Reopen Endpoint (Optional but Recommended)

Add this new method to `TicketController.php`:

```php
/**
 * Reopen a closed/resolved ticket
 *
 * @OA\Post(
 *     path="/api/v1/tickets/{id}/reopen",
 *     summary="Reopen a resolved/closed ticket",
 *     tags={"Tickets"},
 *     security={{"sanctum":{}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="reason", type="string", example="Issue still persists")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Ticket reopened successfully")
 * )
 */
public function reopen(Request $request, $id)
{
    try {
        $user = $request->user()->load('myProfile');
        $ticket = Ticket::findOrFail($id);

        // Check if ticket can be reopened
        if (!in_array($ticket->status, ['resolved', 'closed'])) {
            return ApiResponse::error('Ticket is not resolved or closed', 400);
        }

        // Check permissions (owner or admin)
        $isAdmin = $this->isAdmin($user);
        $isOwner = $ticket->user_id === $user->id;

        if (!$isAdmin && !$isOwner) {
            return ApiResponse::error('Unauthorized access', 403);
        }

        // Reopen logic
        $ticket->status = 'open';
        $ticket->reopens += 1;
        $ticket->last_reopened_at = now();
        $ticket->resolved_at = null;
        $ticket->resolution_hours = null;
        $ticket->save();

        // Log the reason if provided
        if ($request->has('reason')) {
            TicketResponse::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'body' => "Ticket reabierto. Razón: " . $request->reason,
                'internal' => true,
            ]);
        }

        $ticket->load(['user', 'ticketCategory', 'assignment', 'assignedTo']);

        $this->saveApiEvent($user, "Ticket reopened", "Ticket #" . $ticket->id . " reopened", "Ticket-" . $ticket->id, true);

        return ApiResponse::success($ticket, 'Ticket reopened successfully');
    } catch (\Exception $e) {
        $this->saveApiEvent($request->user(), "Error reopening ticket", $e->getMessage(), "Tickets", false);
        return ApiResponse::error('Error reopening ticket', 500);
    }
}
```

##### D) Add Route (routes/api.php)

Add this route in the tickets group:

```php
Route::post('tickets/{id}/reopen', [TicketController::class, 'reopen']);
```

---

### FRONTEND (AngularJS)

You don't need to create a new file. Just add these components to your existing ticket display.

#### Step 1: Add Filter for Formatting Hours

Add this to your main app file or create `public_html/js/filters.js`:

```javascript
// Add this to your existing Angular app
app.filter('formatResolutionTime', function() {
    return function(hours) {
        if (!hours || hours === null) {
            return 'N/A';
        }
        
        hours = parseFloat(hours);
        
        if (hours < 1) {
            var minutes = Math.round(hours * 60);
            return minutes + ' minutos';
        }
        
        if (hours < 24) {
            return hours.toFixed(1) + ' horas';
        }
        
        var days = Math.floor(hours / 24);
        var remainingHours = (hours % 24).toFixed(1);
        
        if (parseFloat(remainingHours) === 0) {
            return days + (days === 1 ? ' día' : ' días');
        }
        
        return days + (days === 1 ? ' día' : ' días') + ', ' + remainingHours + ' horas';
    };
});

app.filter('reopenBadge', function() {
    return function(reopens) {
        if (!reopens || reopens === 0) {
            return '';
        }
        return reopens + (reopens === 1 ? ' vez' : ' veces');
    };
});
```

#### Step 2: Display in HTML Templates

##### In Ticket List View:

```html
<!-- Add these columns to your ticket table -->
<table class="table">
    <thead>
        <tr>
            <th>#</th>
            <th>Título</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Tiempo Resolución</th>
            <th>Reaperturas</th>
            <th>Acciones</th>
        </tr>
    </thead>
    <tbody>
        <tr ng-repeat="ticket in tickets">
            <td>{{ticket.id}}</td>
            <td>{{ticket.title}}</td>
            <td>
                <span class="badge" ng-class="{
                    'badge-success': ticket.status === 'resolved' || ticket.status === 'closed',
                    'badge-warning': ticket.status === 'in_progress',
                    'badge-info': ticket.status === 'assigned',
                    'badge-danger': ticket.status === 'open'
                }">
                    {{ticket.status_label}}
                </span>
            </td>
            <td>
                <span class="badge" ng-class="{
                    'badge-danger': ticket.priority === 'urgent',
                    'badge-warning': ticket.priority === 'high',
                    'badge-info': ticket.priority === 'medium',
                    'badge-secondary': ticket.priority === 'low'
                }">
                    {{ticket.priority_label}}
                </span>
            </td>
            <td>
                <span ng-if="ticket.resolution_hours">
                    {{ticket.resolution_hours | formatResolutionTime}}
                </span>
                <span ng-if="!ticket.resolution_hours && (ticket.status === 'resolved' || ticket.status === 'closed')" 
                      class="text-muted">
                    No registrado
                </span>
                <span ng-if="!ticket.resolution_hours && ticket.status !== 'resolved' && ticket.status !== 'closed'" 
                      class="text-muted">
                    En proceso...
                </span>
            </td>
            <td>
                <span ng-if="ticket.reopens > 0" class="badge badge-warning">
                    🔄 {{ticket.reopens | reopenBadge}}
                </span>
                <span ng-if="!ticket.reopens || ticket.reopens === 0" class="text-muted">
                    -
                </span>
            </td>
            <td>
                <!-- Your existing actions -->
                <button ng-if="ticket.status === 'resolved' || ticket.status === 'closed'" 
                        ng-click="reopenTicket(ticket)" 
                        class="btn btn-sm btn-warning">
                    Reabrir
                </button>
            </td>
        </tr>
    </tbody>
</table>
```

##### In Ticket Detail View:

```html
<div class="card">
    <div class="card-header">
        <h4>Ticket #{{ticket.id}} - {{ticket.title}}</h4>
    </div>
    <div class="card-body">
        <!-- Existing ticket details -->
        
        <!-- Add Resolution Metrics Section -->
        <div class="row mt-3" ng-if="ticket.status === 'resolved' || ticket.status === 'closed'">
            <div class="col-md-12">
                <h5>📊 Métricas de Resolución</h5>
            </div>
            <div class="col-md-4">
                <div class="info-box">
                    <label>Tiempo de Resolución:</label>
                    <p class="font-weight-bold">
                        {{ticket.resolution_hours | formatResolutionTime}}
                    </p>
                    <small class="text-muted">
                        (Excluye fines de semana)
                    </small>
                </div>
            </div>
            <div class="col-md-4">
                <div class="info-box">
                    <label>Fecha Creación:</label>
                    <p>{{ticket.created_at | date:'dd/MM/yyyy HH:mm'}}</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="info-box">
                    <label>Fecha Resolución:</label>
                    <p>{{ticket.resolved_at | date:'dd/MM/yyyy HH:mm'}}</p>
                </div>
            </div>
            <div class="col-md-4" ng-if="ticket.reopens > 0">
                <div class="info-box">
                    <label>Reaperturas:</label>
                    <p class="font-weight-bold text-warning">
                        🔄 {{ticket.reopens | reopenBadge}}
                    </p>
                    <small class="text-muted" ng-if="ticket.last_reopened_at">
                        Última: {{ticket.last_reopened_at | date:'dd/MM/yyyy HH:mm'}}
                    </small>
                </div>
            </div>
        </div>
    </div>
</div>
```

#### Step 3: Add Controller Functions

Add to your AngularJS controller:

```javascript
// In your tickets controller
$scope.reopenTicket = function(ticket) {
    if (!confirm('¿Está seguro que desea reabrir este ticket?')) {
        return;
    }
    
    var reason = prompt('Razón de reapertura (opcional):');
    
    var data = {};
    if (reason) {
        data.reason = reason;
    }
    
    $http.post(API_URL + '/tickets/' + ticket.id + '/reopen', data)
        .then(function(response) {
            if (response.data.success) {
                swal('Éxito', 'Ticket reabierto correctamente', 'success');
                // Refresh ticket data
                ticket.status = 'open';
                ticket.reopens = response.data.data.reopens;
                ticket.last_reopened_at = response.data.data.last_reopened_at;
                ticket.resolution_hours = null;
                // Or reload the full list
                loadTickets();
            }
        })
        .catch(function(error) {
            swal('Error', 'No se pudo reabrir el ticket', 'error');
        });
};

// Optional: Show current elapsed time for open tickets
$scope.getCurrentElapsedTime = function(ticket) {
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
        return ticket.resolution_hours;
    }
    
    // Call API endpoint to get current elapsed time
    $http.get(API_URL + '/tickets/' + ticket.id + '/elapsed-time')
        .then(function(response) {
            ticket.current_elapsed = response.data.data.elapsed_hours;
        });
};
```

#### Step 4: Optional - Add Stats Dashboard

```html
<!-- Dashboard widget for resolution statistics -->
<div class="col-md-3">
    <div class="card">
        <div class="card-body">
            <h5>Tiempo Promedio Resolución</h5>
            <h3>{{stats.avgResolutionTime | formatResolutionTime}}</h3>
            <small class="text-muted">Últimos 30 días</small>
        </div>
    </div>
</div>

<div class="col-md-3">
    <div class="card">
        <div class="card-body">
            <h5>Tickets Reabiertos</h5>
            <h3>{{stats.reopenedTickets}}</h3>
            <small class="text-muted">Este mes</small>
        </div>
    </div>
</div>
```

And in controller:

```javascript
$scope.loadStats = function() {
    $http.get(API_URL + '/tickets/stats')
        .then(function(response) {
            $scope.stats = response.data.data;
        });
};
```

---

## Summary

### What You Need to Do:

**Backend (required):**
1. ✅ Run `php artisan migrate`
2. ✅ Update `TicketController::update()` method (2 changes)
3. ✅ Add `reopen()` method to TicketController
4. ✅ Add route for reopen endpoint

**Frontend (optional but recommended):**
1. ✅ Add filters to format hours
2. ✅ Add resolution time column to ticket list
3. ✅ Add reopens badge display
4. ✅ Add reopen button functionality
5. ✅ Add resolution metrics to detail view

The API already returns the new fields (`resolution_hours`, `last_reopened_at`, `reopens`) so you can display them immediately after running the migration!
