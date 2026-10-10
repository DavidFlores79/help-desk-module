import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { TranslationService } from './core/services/translation.service';

describe('App', () => {
  let finishLoadingTranslations: () => void;

  beforeEach(async () => {
    const translationService = {
      init: () =>
        new Promise<void>((resolve) => {
          finishLoadingTranslations = resolve;
        }),
      getCurrentLanguage: () => 'es-MX',
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), { provide: TranslationService, useValue: translationService }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('shows a loader until the translations are ready, then the routed page', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).toBeNull();
    expect(compiled.textContent).toContain('Loading...');

    finishLoadingTranslations();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });
});
