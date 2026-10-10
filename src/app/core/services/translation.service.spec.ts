import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  const spanish = JSON.stringify({ app: { save: 'Guardar' } });
  let service: TranslationService;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    localStorage.removeItem('app_language');
    service = TestBed.inject(TranslationService);
    fetchSpy = spyOn(window, 'fetch').and.callFake(() => Promise.resolve(new Response(spanish)));
  });

  afterEach(() => localStorage.removeItem('app_language'));

  it('checks with the server for new texts instead of reusing a cached copy', async () => {
    await service.init();

    expect(fetchSpy).toHaveBeenCalledWith('/assets/i18n/es-MX.json', { cache: 'no-cache' });
    expect(service.instant('app.save')).toBe('Guardar');
  });

  it('also skips the cached copy for other languages and for the fallback', async () => {
    localStorage.setItem('app_language', 'en');
    fetchSpy.and.callFake((url: string) =>
      Promise.resolve(
        url.endsWith('/en.json') ? new Response('', { status: 404 }) : new Response(spanish),
      ),
    );

    await service.init();

    expect(fetchSpy).toHaveBeenCalledWith('/assets/i18n/en.json', { cache: 'no-cache' });
    expect(fetchSpy).toHaveBeenCalledWith('/assets/i18n/es-MX.json', { cache: 'no-cache' });
    expect(service.getCurrentLanguage()).toBe('es-MX');
    expect(service.instant('app.save')).toBe('Guardar');
  });

  it('shows the keys rather than failing when no texts can be loaded', async () => {
    fetchSpy.and.callFake(() => Promise.reject(new TypeError('offline')));

    await service.init();

    expect(service.instant('app.save')).toBe('app.save');
  });
});
