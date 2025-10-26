# Visual Responsive Design Guide

## Header Navigation

### Desktop View (≥1024px)
```
┌──────────────────────────────────────────────────────────────┐
│ [Logo] App Title    My Tickets  Admin▾        [Avatar] User ▾│
└──────────────────────────────────────────────────────────────┘
```

### Mobile View (<1024px)
```
┌────────────────────────────────────┐
│ [☰] [Logo]              [Avatar]  │
├────────────────────────────────────┤  ← Menu opens when ☰ clicked
│  My Tickets                        │
│  Admin                             │
│    Dashboard                       │
│    Ticket Categories               │
└────────────────────────────────────┘
```

## Tickets Page Layout

### Mobile (1 column)
```
┌──────────────────────┐
│  My Tickets      [+] │
├──────────────────────┤
│ Filters              │
│ ┌──────────────────┐ │
│ │ Status: [____]   │ │
│ │ Priority: [____] │ │
│ │ [Clear Filters]  │ │
│ └──────────────────┘ │
├──────────────────────┤
│ ┌──────────────────┐ │
│ │ Ticket Card #1   │ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ Ticket Card #2   │ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ Ticket Card #3   │ │
│ └──────────────────┘ │
└──────────────────────┘
```

### Tablet (2 columns)
```
┌────────────────────────────────────┐
│  My Tickets          [+ New]       │
├────────────────────────────────────┤
│ Filters                            │
│ ┌──────────────┬─────────────────┐ │
│ │ Status [___] │ Priority [____] │ │
│ │ [Clear Filters]                │ │
│ └──────────────┴─────────────────┘ │
├────────────────────────────────────┤
│ ┌────────────┐  ┌────────────┐    │
│ │ Ticket #1  │  │ Ticket #2  │    │
│ └────────────┘  └────────────┘    │
│ ┌────────────┐  ┌────────────┐    │
│ │ Ticket #3  │  │ Ticket #4  │    │
│ └────────────┘  └────────────┘    │
└────────────────────────────────────┘
```

### Desktop (3 columns)
```
┌──────────────────────────────────────────────────────┐
│  My Tickets                    [+ New Ticket]        │
├──────────────────────────────────────────────────────┤
│ Filters                                              │
│ ┌────────┬─────────┬─────────┬───────────────────┐  │
│ │Status  │Priority │Category │ [Clear Filters]   │  │
│ │[_____] │[______] │[______] │                   │  │
│ └────────┴─────────┴─────────┴───────────────────┘  │
├──────────────────────────────────────────────────────┤
│ ┌──────┐  ┌──────┐  ┌──────┐                        │
│ │Ticket│  │Ticket│  │Ticket│                        │
│ │  #1  │  │  #2  │  │  #3  │                        │
│ └──────┘  └──────┘  └──────┘                        │
│ ┌──────┐  ┌──────┐  ┌──────┐                        │
│ │Ticket│  │Ticket│  │Ticket│                        │
│ │  #4  │  │  #5  │  │  #6  │                        │
│ └──────┘  └──────┘  └──────┘                        │
└──────────────────────────────────────────────────────┘
```

## New Ticket Form

### Mobile
```
┌─────────────────────────┐
│ ← Back to Tickets       │
├─────────────────────────┤
│ Create New Ticket       │
│                         │
│ Title *                 │
│ ┌─────────────────────┐ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ Description *           │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ Priority *              │
│ ┌─────────────────────┐ │
│ │ [Select]          ▾ │ │
│ └─────────────────────┘ │
│                         │
│ Category                │
│ ┌─────────────────────┐ │
│ │ [Select]          ▾ │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ [Create Ticket]     │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ [Cancel]            │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### Tablet/Desktop
```
┌──────────────────────────────────────┐
│ ← Back to Tickets                    │
├──────────────────────────────────────┤
│ Create New Ticket                    │
│                                      │
│ Title *                              │
│ ┌──────────────────────────────────┐ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Description *                        │
│ ┌──────────────────────────────────┐ │
│ │                                  │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌─────────────┬──────────────────┐  │
│ │ Priority *  │ Category         │  │
│ │ [Select]  ▾ │ [Select]       ▾ │  │
│ └─────────────┴──────────────────┘  │
│                                      │
│         [Cancel]  [Create Ticket]    │
└──────────────────────────────────────┘
```

## Admin Dashboard

### Mobile (2x2 Stats Grid)
```
┌──────────────────────┐
│ Admin Dashboard      │
├──────────────────────┤
│ ┌────────┬─────────┐ │
│ │ Total  │  Open   │ │
│ │  125   │   45    │ │
│ ├────────┼─────────┤ │
│ │Progress│Resolved │ │
│ │   30   │   50    │ │
│ └────────┴─────────┘ │
├──────────────────────┤
│ Filters              │
│ Status: [________]   │
│ Priority: [______]   │
│ Category: [______]   │
│ [Clear Filters]      │
└──────────────────────┘
```

### Desktop (4 Stats in Row)
```
┌────────────────────────────────────────────────┐
│ Admin Dashboard                                │
├────────────────────────────────────────────────┤
│ ┌────────┬────────┬──────────┬──────────┐     │
│ │ Total  │ Open   │ Progress │ Resolved │     │
│ │  125   │  45    │   30     │   50     │     │
│ └────────┴────────┴──────────┴──────────┘     │
├────────────────────────────────────────────────┤
│ Filters                                        │
│ ┌───────┬────────┬────────┬──────────────┐    │
│ │Status │Priority│Category│[Clear Filters]│   │
│ │[____] │[_____] │[_____] │              │    │
│ └───────┴────────┴────────┴──────────────┘    │
└────────────────────────────────────────────────┘
```

## Ticket Detail Page

### Mobile (Stacked Layout)
```
┌──────────────────────┐
│ ← Back               │
├──────────────────────┤
│ #123 [Open] [High]   │
│                      │
│ Ticket Title Here    │
│ Description text...  │
│ Created by John Doe  │
├──────────────────────┤
│ Status              │
│ [Select Status]   ▾ │
│                      │
│ Priority            │
│ [Select Priority] ▾ │
├──────────────────────┤
│ Created             │
│ 2 hours ago         │
│                      │
│ Category            │
│ Technical Support   │
│                      │
│ Assignment          │
│ #456                │
│                      │
│ Assigned To         │
│ Jane Smith [Change] │
└──────────────────────┘
```

### Desktop (Side-by-Side Layout)
```
┌──────────────────────────────────────────────┐
│ ← Back to Tickets                            │
├──────────────────────────────────────────────┤
│ #123 [Open] [High] [Technical]               │
│                                              │
│ Ticket Title Here           [Status]     ▾  │
│ Description text...         [Priority]   ▾  │
│ Created by John Doe                          │
├──────────────────────────────────────────────┤
│ ┌────────┬─────────┬────────┬─────────────┐ │
│ │Created │Category │Assign. │ Assigned To │ │
│ │2h ago  │Technical│  #456  │ Jane [Edit] │ │
│ └────────┴─────────┴────────┴─────────────┘ │
└──────────────────────────────────────────────┘
```

## Key Responsive Behaviors

### Breakpoint Transitions

**< 640px (Mobile)**
- Hamburger menu visible
- Single column layouts
- Full-width buttons
- Stacked form fields
- Compact spacing
- Smaller typography

**640px - 1024px (Tablet)**
- Hamburger menu still visible
- 2-column grids where appropriate
- Side-by-side form fields
- Medium spacing
- Standard typography

**≥ 1024px (Desktop)**
- Full horizontal navigation
- 3-4 column grids
- Inline form layouts
- Generous spacing
- Full-size typography

### Interactive Elements

**Mobile Touch Targets**
```
All buttons: min 44px height
All taps:    min 44px × 44px
Spacing:     min 8px between elements
```

**Desktop Click Targets**
```
Buttons:     Standard size
Hover:       Visual feedback
Cursor:      Pointer on interactive
```

## Animation Behaviors

### Hamburger Menu
```
Closed → Open:   Slide down (300ms)
Open → Closed:   Slide up (300ms)
Icon:            Rotate transition (200ms)
```

### Dropdowns
```
Closed → Open:   Fade in (150ms)
Open → Closed:   Fade out (150ms)
```

### Cards
```
Hover:           Shadow increase (200ms)
Active:          Scale slightly (100ms)
```

## Typography Scale

### Mobile
- H1: 24px (1.5rem)
- H2: 20px (1.25rem)
- H3: 18px (1.125rem)
- Body: 14px (0.875rem)
- Small: 12px (0.75rem)

### Desktop
- H1: 32px (2rem)
- H2: 28px (1.75rem)
- H3: 24px (1.5rem)
- Body: 16px (1rem)
- Small: 14px (0.875rem)

## Spacing Scale

### Mobile
- Page margin: 16px (1rem)
- Card padding: 16px (1rem)
- Element gap: 12px (0.75rem)

### Desktop
- Page margin: 32px (2rem)
- Card padding: 24px (1.5rem)
- Element gap: 16px (1rem)

---

**Note**: All dimensions are approximate and may vary slightly based on content and context. The visual representations above are simplified for clarity.
