import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { spyOnClass } from '../../testing/spyOnClass';

import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptor } from './auth-interceptor.service';
import { SessionService } from './session.service';

describe('AuthInterceptor', () => {

  let http: HttpTestingController;
  let httpClient: HttpClient;

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
          provide: SessionService,
          useValue: spyOnClass(SessionService)
        }
      ],
    });
  });

  beforeEach(() => {
    http = TestBed.get(HttpTestingController);
    httpClient = TestBed.get(HttpClient);

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

    expect(TestBed.get(SessionService).handleLogout).toHaveBeenCalledTimes(1);
  });

  it(`should not intercept nor redirect successful api requests`, () => {

    const successCallback = jasmine.createSpy('successCallback');
    const errorCallback = jasmine.createSpy('errorCallback');


    httpClient.get('/api').subscribe(successCallback, errorCallback);
    http.expectOne('/api').flush('');

    expect(successCallback).toHaveBeenCalled();
    expect(errorCallback).not.toHaveBeenCalled();

    expect(TestBed.get(SessionService).handleLogout).not.toHaveBeenCalled();

    http.verify();
  });

  it(`should not intercept nor redirect differently failing api requests`, () => {

    const successCallback = jasmine.createSpy('successCallback');
    const errorCallback = jasmine.createSpy('errorCallback');

    httpClient.get('/api').subscribe(successCallback, errorCallback);
    http.expectOne('/api').error(new ErrorEvent('Internal server error'), { status: 500 });

    expect(successCallback).not.toHaveBeenCalled();
    expect(errorCallback).toHaveBeenCalled();

    expect(TestBed.get(SessionService).handleLogout).not.toHaveBeenCalled();

    http.verify();
  });
});
