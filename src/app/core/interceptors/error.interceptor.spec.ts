import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';
import { TranslationService } from '../services/translation.service';

interface InterceptedError {
  status: number;
  message: string;
}

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated', 'logout']);
    authService.isAuthenticated.and.returnValue(true);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
        {
          provide: LoggerService,
          useValue: jasmine.createSpyObj('LoggerService', [
            'group',
            'groupEnd',
            'debug',
            'info',
            'warn',
            'error',
          ]),
        },
        {
          provide: TranslationService,
          useValue: {
            instant: (key: string, params?: Record<string, unknown>) =>
              params ? `${key}(${JSON.stringify(params)})` : `translated:${key}`,
          },
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  function failWith(
    status: number,
    body: { message: string } | null,
    url = '/api/v1/tickets',
  ): InterceptedError {
    let caught: InterceptedError | undefined;
    http.get(url).subscribe({ error: (error) => (caught = error) });
    httpTesting.expectOne(url).flush(body, { status, statusText: 'Error' });
    return caught!;
  }

  function failWithNetwork(sendError: (request: TestRequest) => void): InterceptedError {
    let caught: InterceptedError | undefined;
    http.get('/api/v1/tickets').subscribe({ error: (error) => (caught = error) });
    sendError(httpTesting.expectOne('/api/v1/tickets'));
    return caught!;
  }

  it('keeps the message the API sent', () => {
    const error = failWith(500, { message: 'El ticket está cerrado' });

    expect(error.message).toBe('El ticket está cerrado');
  });

  it('translates the fallback when the API sends no message', () => {
    expect(failWith(500, null).message).toBe('translated:error.serverErrorRetry');
    expect(failWith(403, null).message).toBe('translated:error.noPermission');
    expect(failWith(404, null).message).toBe('translated:error.notFound');
    expect(failWith(422, null).message).toBe('translated:error.validation');
  });

  it('includes the status code in the fallback for other errors', () => {
    expect(failWith(418, null).message).toBe('error.httpStatus({"status":418})');
  });

  it('reports invalid credentials for a 401 on login without logging out', () => {
    const error = failWith(401, null, '/api/login');

    expect(error.message).toBe('translated:auth.invalidCredentials');
    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('logs out on a 401 elsewhere without blaming the credentials', () => {
    const error = failWith(401, null);

    expect(error.message).toBe('translated:error.unauthorized');
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('translates the message when the server cannot be reached', () => {
    const error = failWithNetwork((request) =>
      request.error(new ProgressEvent('error'), { status: 0 }),
    );

    expect(error.message).toBe('translated:error.cannotConnect');
  });

  it('shows a translated network error instead of the browser text', () => {
    const error = failWithNetwork((request) =>
      request.error(new ErrorEvent('error', { message: 'Failed to fetch' }), { status: 0 }),
    );

    expect(error.message).toBe('translated:error.networkError');
  });
});
