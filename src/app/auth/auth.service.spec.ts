import { TestBed, inject, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { spyOnClass } from '../../testing/spyOnClass';
import { Fixtures } from '../../testing/fixtures';

import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie';
import { NgxPermissionsService } from 'ngx-permissions';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SystemService } from '../system.service';
import { of } from 'rxjs';

describe('AuthService', () => {
  let authService: AuthService;
  let permissionsService: NgxPermissionsService;
  let systemService: jasmine.SpyObj<SystemService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        AuthService,
        {
          provide: NgxPermissionsService,
          useValue: spyOnClass(NgxPermissionsService),
        },
        {
          provide: CookieService,
          useValue: spyOnClass(CookieService),
        },
        {
          provide: SystemService,
          useValue: spyOnClass(SystemService),
        },
      ],
    });
  });

  beforeEach(() => {
    authService = TestBed.get(AuthService);
    permissionsService = TestBed.get(NgxPermissionsService);

    systemService = TestBed.get(SystemService);
    systemService.getUserSystemInfo.and.returnValue(of(Fixtures.userSystemInfo));
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  describe('password login', () => {
    it('should be successful on successful request', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        authService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ needsSecondFactor: false, success: true });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ result: { value: true } });

        backend.verify();
      })
    ));

    it('should fetch the permissions on successful login', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        spyOn(localStorage, 'setItem');

        authService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ needsSecondFactor: false, success: true });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ result: { value: true } });

        expect(systemService.getUserSystemInfo).toHaveBeenCalledTimes(1);

        expect(localStorage.setItem).toHaveBeenCalledWith('permissions', JSON.stringify(Fixtures.permissionList));
        expect(permissionsService.loadPermissions).toHaveBeenCalledWith(Fixtures.permissionList);
      })
    ));

    it('should not log in on failed request', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        authService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ needsSecondFactor: false, success: false });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');

        loginRequest.flush({ result: { value: false } });
        backend.verify();
      })
    ));

    it('should not fetch the permissions on failed login', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        authService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ needsSecondFactor: false, success: false });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ result: { value: false } });

        expect(systemService.getUserSystemInfo).not.toHaveBeenCalled();
        expect(permissionsService.loadPermissions).not.toHaveBeenCalled();
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        authService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ needsSecondFactor: null, success: false });
        });

        const loginRequest = backend.expectOne({
          url: '/userservice/login',
          method: 'POST'
        });

        loginRequest.error(new ErrorEvent('Error logging in'));
        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));
  });

  describe('MFA login when the user has tokens', () => {

    it('should send a request to fetch a list of tokens for the user and another to tell the serial of the chosen token', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        const secondFactorMessage = 'credential verified - additional authentication parameter required';

        authService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ needsSecondFactor: true, success: false, hasTokens: true });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ detail: { message: secondFactorMessage }, result: { value: false } });


        const tokenListRequest = backend.expectOne((req) => req.url === '/userservice/usertokenlist' && req.method === 'POST');
        tokenListRequest.flush({ result: { value: [{ 'LinOTP.TokenSerialnumber': 'serial' }] } });

        const tokenValidationRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        tokenValidationRequest.flush({});

        backend.verify();
      })
    ));

    it('loginSecondStep should authenticate the user on correct OTP', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        authService.loginSecondStep('otp').subscribe(response => {
          expect(response).toEqual(true);
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ result: { value: true } });

        backend.verify();
      })
    ));

    it('loginSecondStep should fail to authenticate the user on wwrong OTP', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        authService.loginSecondStep('otp').subscribe(response => {
          expect(response).toEqual(false);
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ result: { value: false } });

        backend.verify();
      })
    ));

  });

  describe('logout', () => {

    it('should flush permissions', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        spyOn(localStorage, 'removeItem');
        spyOn(TestBed.get(Router), 'navigate');

        authService.logout().subscribe();

        const logoutRequest = backend.expectOne((req) => req.url === '/userservice/logout' && req.method === 'GET');
        logoutRequest.flush({ result: { value: true } });

        backend.verify();

        expect(permissionsService.flushPermissions).toHaveBeenCalled();
        expect(localStorage.removeItem).toHaveBeenCalledWith('permissions');
      })
    ));

    it('should not set redirect param for the login route', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        const routerSpy = spyOn(TestBed.get(Router), 'navigate');

        authService.logout().subscribe();

        const logoutRequest = backend.expectOne((req) => req.url === '/userservice/logout' && req.method === 'GET');
        logoutRequest.flush({ result: { value: true } });

        backend.verify();

        expect(routerSpy).toHaveBeenCalledWith(['/login'], {});
      })
    ));

    it('should emit a loginChange event during logout', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        spyOn(TestBed.get(Router), 'navigate');
        authService.loginChangeEmitter.subscribe(change => {
          expect(change).toEqual(false);
        });

        authService.logout().subscribe();

        const logoutRequest = backend.expectOne((req) => req.url === '/userservice/logout' && req.method === 'GET');
        logoutRequest.flush({ result: { value: true } });

        backend.verify();
      })
    ));

    it('should handle logout errors', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        authService.logout().subscribe();

        const logoutRequest = backend.expectOne((req) => req.url === '/userservice/logout' && req.method === 'GET');
        logoutRequest.error(new ErrorEvent('Error logging out'));

        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));

  });
});
