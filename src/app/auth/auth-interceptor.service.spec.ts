import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';

import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { LoginService } from '@app/login/login.service';
import { NotificationService } from '@common/notification.service';
import { AuthInterceptor } from './auth-interceptor.service';

describe('AuthInterceptor', () => {

  let http: HttpTestingController;
  let httpClient: HttpClient;
  let loginService: jasmine.SpyObj<LoginService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        AuthInterceptor,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        {
            provide: LoginService,
            useValue: spyOnClass(LoginService)
        },
        {
            provide: NotificationService,
            useValue: spyOnClass(NotificationService)
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
  });

  beforeEach(() => {
    http = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    loginService = getInjectedStub(LoginService);
  });

  it('should be created', inject([AuthInterceptor], (service: AuthInterceptor) => {
    expect(service).toBeTruthy();
  }));

  it(`should intercept unauthorized api requests`, () => {

    (loginService as any).hasEverLoggedIn = false
    const successCallback = jasmine.createSpy('successCallback');
    const errorCallback = jasmine.createSpy('errorCallback');

    httpClient.get('/api').subscribe(successCallback, errorCallback);

    http.expectOne('/api').error(new ErrorEvent('Unauthorized error'), {
      status: 401
    });
    http.verify();

    expect(successCallback).not.toHaveBeenCalled();
    // if user was not authenticated and response code will be 401 then request observable will complete(emit EMPTY)
    expect(errorCallback).not.toHaveBeenCalled();

    expect(TestBed.inject(NotificationService).errorMessage).not.toHaveBeenCalled();

    expect(loginService.handleLogout).toHaveBeenCalledTimes(1);
  });

  it(`should should notification error when user previously logged in`, () => {

    (loginService as any).hasEverLoggedIn = true
    const successCallback = jasmine.createSpy('successCallback');
    const errorCallback = jasmine.createSpy('errorCallback');

    httpClient.get('/api').subscribe(successCallback, errorCallback);

    http.expectOne('/api').error(new ErrorEvent('Unauthorized error'), {
      status: 401
    });
    http.verify();

    expect(TestBed.inject(NotificationService).errorMessage).toHaveBeenCalled();
  });


  it(`should not intercept nor redirect successful api requests`, () => {

    const successCallback = jasmine.createSpy('successCallback');
    const errorCallback = jasmine.createSpy('errorCallback');


    httpClient.get('/api').subscribe(successCallback, errorCallback);
    http.expectOne('/api').flush('');

    expect(successCallback).toHaveBeenCalled();
    expect(errorCallback).not.toHaveBeenCalled();

    expect(loginService.handleLogout).not.toHaveBeenCalled();
    expect(TestBed.inject(NotificationService).errorMessage).not.toHaveBeenCalled();

    http.verify();
  });

  it(`should inform user of server side errors during requests`, () => {
    const successCallback = jasmine.createSpy('successCallback');
    const errorCallback = jasmine.createSpy('errorCallback');

    httpClient.get('/api').subscribe(successCallback, errorCallback);
    http.expectOne('/api').error(new ErrorEvent('Internal server error'), { status: 500 });

    expect(successCallback).not.toHaveBeenCalled();
    expect(errorCallback).toHaveBeenCalled();

    expect(loginService.handleLogout).not.toHaveBeenCalled();
    expect(TestBed.inject(NotificationService).errorMessage).toHaveBeenCalled();

    http.verify();
  });

  it(`should not intercept nor redirect differently failing api requests`, () => {

    const successCallback = jasmine.createSpy('successCallback');
    const errorCallback = jasmine.createSpy('errorCallback');

    httpClient.get('/api').subscribe(successCallback, errorCallback);
    http.expectOne('/api').error(new ErrorEvent('I\’m a teapot'), { status: 418 });

    expect(successCallback).not.toHaveBeenCalled();
    expect(errorCallback).toHaveBeenCalled();

    expect(loginService.handleLogout).not.toHaveBeenCalled();
    expect(TestBed.inject(NotificationService).errorMessage).not.toHaveBeenCalled();

    http.verify();
  });
});
