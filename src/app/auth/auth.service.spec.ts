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

  it('should login on successful request', async(
    inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
      authService.login({ username: 'user', password: 'pass' }).subscribe(response => {
        expect(response).toEqual(true);
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
        expect(response).toEqual(true);
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
        expect(response).toEqual(false);
      });

      const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');

      loginRequest.flush({ result: { value: false } });
      backend.verify();
    })
  ));

  it('should not fetch the permissions on failed login', async(
    inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

      authService.login({ username: 'user', password: 'pass' }).subscribe(response => {
        expect(response).toEqual(false);
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
