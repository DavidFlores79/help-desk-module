# Responsive Design Quick Reference

## Tailwind CSS Breakpoints

| Breakpoint | Min Width | Target Devices           | Prefix |
|------------|-----------|--------------------------|--------|
| Mobile     | 0px       | Phones                   | (none) |
| Small      | 640px     | Large phones / tablets   | `sm:`  |
| Medium     | 768px     | Tablets                  | `md:`  |
| Large      | 1024px    | Desktops                 | `lg:`  |
| XL         | 1280px    | Large desktops           | `xl:`  |

## Common Responsive Patterns

### Layout Grids
```html
<!-- 1 → 2 → 3 columns -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

<!-- 1 → 2 → 4 columns -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

<!-- 2 → 4 columns (for stats) -->
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
```

### Flexbox Direction
```html
<!-- Stack on mobile, row on desktop -->
<div class="flex flex-col sm:flex-row gap-4">

<!-- Reverse on mobile -->
<div class="flex flex-col-reverse sm:flex-row gap-4">
```

### Spacing
```html
<!-- Responsive padding -->
<div class="px-4 sm:px-6 lg:px-8">
<div class="py-4 sm:py-6 lg:py-8">

<!-- Responsive gap -->
<div class="gap-3 sm:gap-4 lg:gap-6">
```

### Typography
```html
<!-- Responsive text size -->
<h1 class="text-xl sm:text-2xl lg:text-3xl">
<p class="text-sm sm:text-base">

<!-- Responsive font weight -->
<span class="font-normal sm:font-medium lg:font-bold">
```

### Visibility
```html
<!-- Show on mobile only -->
<div class="block lg:hidden">

<!-- Hide on mobile -->
<div class="hidden lg:block">

<!-- Show on tablet and up -->
<div class="hidden sm:block">
```

### Width & Height
```html
<!-- Full width on mobile, auto on desktop -->
<button class="w-full sm:w-auto">

<!-- Responsive max width -->
<div class="max-w-full sm:max-w-md lg:max-w-2xl">

<!-- Responsive height -->
<div class="h-32 sm:h-40 lg:h-48">
```

## Component-Specific Patterns

### Header Navigation
```html
<!-- Hamburger (mobile only) -->
<button class="lg:hidden">☰</button>

<!-- Desktop nav (desktop only) -->
<nav class="hidden lg:flex">

<!-- Mobile menu (conditional) -->
<div class="lg:hidden" *ngIf="showMobileMenu">
```

### Buttons
```html
<!-- Responsive button -->
<button class="btn-primary w-full sm:w-auto">

<!-- Responsive padding -->
<button class="px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base">
```

### Cards
```html
<!-- Responsive card -->
<div class="card p-4 sm:p-6">

<!-- Card with responsive content -->
<div class="card">
  <h3 class="text-base sm:text-lg mb-2 sm:mb-3">
  <p class="text-sm sm:text-base">
</div>
```

### Forms
```html
<!-- Stacked on mobile, side-by-side on desktop -->
<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div><!-- Field 1 --></div>
  <div><!-- Field 2 --></div>
</div>

<!-- Full width input -->
<input class="input-field w-full">
```

### Images
```html
<!-- Responsive image size -->
<img class="h-8 sm:h-10 lg:h-12 w-auto">

<!-- Responsive avatar -->
<div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full">
```

## Custom Utility Classes

### Text Truncation
```html
<p class="line-clamp-1">  <!-- Single line -->
<p class="line-clamp-2">  <!-- Two lines -->
<p class="line-clamp-3">  <!-- Three lines -->
<p class="truncate">       <!-- Single line with ... -->
```

### Touch Targets
```html
<!-- Ensure minimum 44x44px touch target -->
<button class="tap-target">
<!-- Equivalent to: min-h-[44px] min-w-[44px] -->
```

## Hamburger Menu Implementation

### Template
```typescript
// Component
showMobileMenu = false;

toggleMobileMenu(): void {
  this.showMobileMenu = !this.showMobileMenu;
  document.body.style.overflow = this.showMobileMenu ? 'hidden' : '';
}

closeMobileMenu(): void {
  this.showMobileMenu = false;
  document.body.style.overflow = '';
}
```

```html
<!-- Hamburger Button -->
<button 
  (click)="toggleMobileMenu()"
  class="lg:hidden">
  @if (!showMobileMenu) {
    <!-- Hamburger icon -->
  } @else {
    <!-- X icon -->
  }
</button>

<!-- Mobile Menu -->
@if (showMobileMenu) {
  <div class="lg:hidden">
    <nav (click)="closeMobileMenu()">
      <!-- Navigation items -->
    </nav>
  </div>
}
```

## Testing Commands

### Development Server
```bash
ng serve
# Then test at: http://localhost:4200
```

### Build
```bash
# Development build
ng build --configuration=development

# Production build
ng build --configuration=production
```

### Browser DevTools
1. Press F12 (Chrome/Firefox)
2. Click device icon or Ctrl+Shift+M
3. Select device or set custom dimensions

### Recommended Test Sizes
- **Mobile**: 375px, 390px, 414px, 428px
- **Tablet**: 768px, 834px, 1024px
- **Desktop**: 1280px, 1440px, 1920px

## Common Issues & Solutions

### Issue: Layout breaks on small screens
```html
<!-- ❌ Bad: Fixed widths -->
<div class="w-64">

<!-- ✅ Good: Responsive widths -->
<div class="w-full sm:w-64">
```

### Issue: Text overflow
```html
<!-- ❌ Bad: No overflow handling -->
<p>{{ longText }}</p>

<!-- ✅ Good: Truncate or wrap -->
<p class="truncate">{{ longText }}</p>
<p class="break-words">{{ longText }}</p>
```

### Issue: Tiny tap targets on mobile
```html
<!-- ❌ Bad: Small buttons -->
<button class="p-1 text-xs">

<!-- ✅ Good: Touch-friendly -->
<button class="p-2 sm:p-3 text-sm sm:text-base tap-target">
```

### Issue: Horizontal scroll on mobile
```html
<!-- ❌ Bad: Fixed widths exceed viewport -->
<div class="w-[500px]">

<!-- ✅ Good: Max width with constraints -->
<div class="max-w-full">
```

## Performance Tips

1. **Use CSS over JS**: Prefer Tailwind responsive classes over JavaScript media queries
2. **Mobile-first**: Write base styles for mobile, add larger breakpoints
3. **Test early**: Check mobile layout as you develop
4. **Minimize reflows**: Group responsive class changes
5. **Optimize images**: Use appropriate sizes for different breakpoints

## Accessibility Notes

1. **Touch targets**: Minimum 44x44px for interactive elements
2. **Contrast**: Maintain WCAG AA standards at all sizes
3. **Font sizes**: Minimum 16px for body text
4. **Focus states**: Visible on all breakpoints
5. **Screen readers**: Test navigation with mobile screen readers

## Quick Checklist

Before considering a page responsive:

- [ ] Tested on mobile (< 640px)
- [ ] Tested on tablet (640px - 1024px)
- [ ] Tested on desktop (> 1024px)
- [ ] No horizontal scrolling
- [ ] Text is readable at all sizes
- [ ] Buttons are touch-friendly
- [ ] Forms are usable on mobile
- [ ] Images scale appropriately
- [ ] Navigation works on all devices
- [ ] Tested both portrait and landscape
- [ ] Content doesn't overflow
- [ ] Loading states work on all sizes

## Resources

- **Tailwind Docs**: https://tailwindcss.com/docs/responsive-design
- **Angular Docs**: https://angular.dev/
- **MDN Responsive**: https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design
- **Can I Use**: https://caniuse.com/ (Check browser support)

---

## Emergency Fixes

### Quick hide on mobile
```html
class="hidden sm:block"
```

### Quick show on mobile only
```html
class="sm:hidden"
```

### Quick full width on mobile
```html
class="w-full sm:w-auto"
```

### Quick stack on mobile
```html
class="flex flex-col sm:flex-row"
```
