import { TestBed, inject, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { spyOnClass } from '../../testing/spyOnClass';

import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie';
import { NgxPermissionsService } from 'ngx-permissions';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Permission } from '../common/permissions';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let authService: AuthService;
  let permissionsService: NgxPermissionsService;

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
      ],
    });

    authService = TestBed.get(AuthService);
    permissionsService = TestBed.get(NgxPermissionsService);
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  it('should login on successful request', async(
    inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

      authService.login('user', 'pass').subscribe(response => {
        expect(response).toEqual(true);
      });

      const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
      loginRequest.flush({ result: { value: true } });

      const permissionsRequest = backend.expectOne((req) => req.url === '/userservice/context' && req.method === 'GET');
      permissionsRequest.flush({ actions: [] });

      backend.verify();
    })
  ));

  it('should fetch the permissions on successful login', async(
    inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
      spyOn(localStorage, 'setItem');

      const permissionSet = [
        Permission.ENROLLPASSWORD,
        Permission.ENROLLPUSH,
        Permission.ACTIVATEPUSH,
        Permission.ENROLLQR,
        Permission.ACTIVATEQR,
        Permission.ENROLLHOTP,
        Permission.ENROLLTOTP,
        Permission.DELETE,
        Permission.SETPIN,
        Permission.ENABLE,
        Permission.DISABLE,
      ];
      const policyActions = [
        'enrollPW',
        'enrollPUSH',
        'activate_PushToken',
        'enrollQR',
        'activateQR',
        'enrollHMAC',
        'enrollTOTP',
        'delete',
        'setOTPPIN',
        'enable',
        'disable',
      ];

      authService.login('user', 'pass').subscribe(response => {
        expect(response).toEqual(true);
      });


      const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
      loginRequest.flush({ result: { value: true } });

      const permissionsRequest = backend.expectOne((req) => req.url === '/userservice/context' && req.method === 'GET');
      permissionsRequest.flush({
        actions: policyActions
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('permissions', JSON.stringify(permissionSet));
      expect(permissionsService.loadPermissions).toHaveBeenCalledWith(permissionSet);
    })
  ));

  it('should not log in on failed request', async(
    inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

      authService.login('user', 'pass').subscribe(response => {
        expect(response).toEqual(false);
      });

      const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');

      loginRequest.flush({ result: { value: false } });
      backend.verify();
    })
  ));

  it('should not fetch the permissions on failed login', async(
    inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

      authService.login('user', 'pass').subscribe(response => {
        expect(response).toEqual(false);
      });

      const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');

      loginRequest.flush({ result: { value: false } });

      expect(permissionsService.loadPermissions).not.toHaveBeenCalled();
    })
  ));

  it('should not map unrecognized policies to permissions', async(
    inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

      authService.login('user', 'pass').subscribe(response => {
        expect(response).toEqual(true);
      });

      const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
      loginRequest.flush({ result: { value: true } });

      const permissionsRequest = backend.expectOne((req) => req.url === '/userservice/context' && req.method === 'GET');
      permissionsRequest.flush({ actions: ['fake policy'] });

      expect(permissionsService.loadPermissions).toHaveBeenCalledWith([]);
    })
  ));

  it('should call the error handler on request failure', async(
    inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

      spyOn(console, 'error');

      authService.login('user', 'pass').subscribe(response => {
        expect(response).toEqual(false);
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
