import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';

import { spyOnClass, getInjectedStub } from '../../testing/spyOnClass';

import { LoginService } from '../login/login.service';
import { AuthInterceptor } from './auth-interceptor.service';
import { NotificationService } from '../common/notification.service';

describe('AuthInterceptor', () => {

  let http: HttpTestingController;
  let httpClient: HttpClient;
  let loginService: jasmine.SpyObj<LoginService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
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
      ],
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

    const successCallback = jasmine.createSpy('successCallback');
    const errorCallback = jasmine.createSpy('errorCallback');

    httpClient.get('/api').subscribe(successCallback, errorCallback);

    http.expectOne('/api').error(new ErrorEvent('Unauthorized error'), {
      status: 401
    });
    http.verify();

    expect(successCallback).not.toHaveBeenCalled();
    expect(errorCallback).toHaveBeenCalled();

    expect(TestBed.inject(NotificationService).message).toHaveBeenCalled();

    expect(loginService.handleLogout).toHaveBeenCalledTimes(1);
  });

  it(`should not intercept nor redirect successful api requests`, () => {

    const successCallback = jasmine.createSpy('successCallback');
    const errorCallback = jasmine.createSpy('errorCallback');


    httpClient.get('/api').subscribe(successCallback, errorCallback);
    http.expectOne('/api').flush('');

    expect(successCallback).toHaveBeenCalled();
    expect(errorCallback).not.toHaveBeenCalled();

    expect(loginService.handleLogout).not.toHaveBeenCalled();
    expect(TestBed.inject(NotificationService).message).not.toHaveBeenCalled();

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
    expect(TestBed.inject(NotificationService).message).toHaveBeenCalled();

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
    expect(TestBed.inject(NotificationService).message).not.toHaveBeenCalled();

    http.verify();
  });
});
