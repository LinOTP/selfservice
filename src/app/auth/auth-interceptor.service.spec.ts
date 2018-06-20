import { TestBed, inject } from '@angular/core/testing';

import { AuthInterceptor } from './auth-interceptor.service';
import { AuthService } from './auth.service';
import { spyOnClass } from '../../testing/spyOnClass';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClient, HttpHandler, HttpRequest, HttpBackend } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AuthInterceptor', () => {

  let router: Router;
  let routerNavigateSpy: jasmine.Spy;

  let http: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        AuthInterceptor,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        },
        {
          provide: AuthService,
          useValue: spyOnClass(AuthService)
        }
      ],
    });
  });

  beforeEach(() => {
    router = TestBed.get(Router);
    routerNavigateSpy = spyOn(router, 'navigate');

    http = TestBed.get(HttpTestingController);
    httpClient = TestBed.get(HttpClient);

  });

  it('should be created', inject([AuthInterceptor], (service: AuthInterceptor) => {
    expect(service).toBeTruthy();
  }));

  it(`should intercept and redirect unauthorized api requests`, () => {

    const successCallback = jasmine.createSpy('successCallback');
    const errorCallback = jasmine.createSpy('errorCallback');

    httpClient.get('/api').subscribe(successCallback, errorCallback);

    http.expectOne('/api').error(new ErrorEvent('Unauthorized error'), {
      status: 401
    });
    http.verify();

    expect(successCallback).not.toHaveBeenCalled();
    expect(errorCallback).toHaveBeenCalled();

    expect(routerNavigateSpy).toHaveBeenCalledTimes(1);
    expect(routerNavigateSpy.calls.argsFor(0)).toContain(['/login']);
  });

  it(`should not intercept nor redirect successful api requests`, () => {

    const successCallback = jasmine.createSpy('successCallback');
    const errorCallback = jasmine.createSpy('errorCallback');


    httpClient.get('/api').subscribe(successCallback, errorCallback);
    http.expectOne('/api').flush('');

    expect(successCallback).toHaveBeenCalled();
    expect(errorCallback).not.toHaveBeenCalled();

    expect(routerNavigateSpy).not.toHaveBeenCalled();

    http.verify();
  });

  it(`should not intercept nor redirect differently failing api requests`, () => {

    const successCallback = jasmine.createSpy('successCallback');
    const errorCallback = jasmine.createSpy('errorCallback');

    httpClient.get('/api').subscribe(successCallback, errorCallback);
    http.expectOne('/api').error(new ErrorEvent('Unauthorized error'), { status: 500 });

    expect(successCallback).not.toHaveBeenCalled();
    expect(errorCallback).toHaveBeenCalled();

    expect(routerNavigateSpy).not.toHaveBeenCalled();

    http.verify();
  });
});
