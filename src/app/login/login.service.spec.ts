import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { Type } from '@angular/core';

import { of } from 'rxjs';

import { spyOnClass, getInjectedStub } from '../../testing/spyOnClass';
import { Fixtures, TokenListFixtures } from '../../testing/fixtures';

import { MaterialModule } from '../material.module';
import { SessionService } from '../auth/session.service';
import { SystemService } from '../system.service';
import { TokenService } from '../api/token.service';

import { LoginService } from './login.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Permission } from '../common/permissions';

describe('LoginService', () => {
  let loginService: LoginService;
  let tokenService: jasmine.SpyObj<TokenService>;
  let systemService: jasmine.SpyObj<SystemService>;
  let ngxPermissionsService: jasmine.SpyObj<NgxPermissionsService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'login', component: {} as Type<any> },
        ]),
        MaterialModule,
      ],
      providers: [
        LoginService,
        {
          provide: SessionService,
          useValue: spyOnClass(SessionService),
        },
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService),
        },
        {
          provide: SystemService,
          useValue: spyOnClass(SystemService),
        },
        {
          provide: NgxPermissionsService,
          useValue: spyOnClass(NgxPermissionsService)
        },
      ],
    });
  });

  beforeEach(() => {
    loginService = TestBed.inject(LoginService);
    tokenService = getInjectedStub(TokenService);
    systemService = getInjectedStub(SystemService);
    ngxPermissionsService = getInjectedStub(NgxPermissionsService);

    systemService.getUserSystemInfo.and.returnValue(of(Fixtures.userSystemInfo));
  });

  it('should be created', () => {
    expect(loginService).toBeTruthy();
  });

  describe('password login', () => {
    it('should be successful on successful request', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        loginService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ success: true });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ result: { value: true } });

        backend.verify();
      }
    ));

    it('allows to select a realm and submit an OTP value directly with the first request', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        loginService.login({ username: 'user', password: 'pass', realm: 'myrealm', otp: 'myotp' })
          .subscribe(response => {
            expect(response).toEqual({ success: true });
          });

        const loginRequest = backend.expectOne('/userservice/login');
        expect(loginRequest.request.url).toBe('/userservice/login');
        expect(loginRequest.request.method).toBe('POST');
        expect(Object.keys(loginRequest.request.body).sort()).toEqual(
          ['username', 'password', 'realm', 'otp'].sort()
        );
        expect(loginRequest.request.body.realm).toBe('myrealm');
        expect(loginRequest.request.body.otp).toBe('myotp');

        loginRequest.flush({ result: { value: true } });

        backend.verify();
      }
    ));

    it('should refresh the permissions on successful login', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        spyOn(loginService, 'handleLogin');

        loginService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ success: true });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ result: { value: true } });

        expect(loginService.handleLogin).toHaveBeenCalledWith(true);
      }
    ));

    it('should not log in on failed request', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        loginService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ success: false });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');

        loginRequest.flush({ result: { value: false } });
        backend.verify();
      }
    ));

    it('should not fetch the permissions on failed login', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        spyOn(loginService, 'handleLogin');

        loginService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ success: false });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ result: { value: false } });

        expect(loginService.handleLogin).toHaveBeenCalledWith(false);
      }
    ));

    it('should call the error handler on request failure', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        loginService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ success: false });
        });

        const loginRequest = backend.expectOne({
          url: '/userservice/login',
          method: 'POST'
        });

        loginRequest.error(new ErrorEvent('Error logging in'));
        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      }
    ));
  });

  describe('requestSecondFactorTransaction', () => {

    it('should request a challenge transaction', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        loginService.login({ serial: Fixtures.completedPushToken.serial }).subscribe(response => {
          expect(response).toEqual({ success: false });
        });

        const tokenValidationRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        tokenValidationRequest.flush({ result: { status: true, value: false } });

        backend.verify();
      }
    ));
  });

  describe('MFA login when the user has tokens', () => {

    it('should request a list of completed tokens for the user and return them', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        tokenService.mapBackendToken.and.returnValues(...TokenListFixtures.mockTokenList);

        loginService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ success: false, tokens: TokenListFixtures.mockTokenList });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ detail: { tokenList: TokenListFixtures.mockTokenListFromBackend }, result: { status: true, value: false } });

        backend.verify();
      }
    ));

    it('loginSecondStep should authenticate the user on correct OTP', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        loginService.login({ otp: 'otp' }).subscribe(response => {
          expect(response).toEqual({ success: true });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ result: { value: true } });

        backend.verify();
      }
    ));

    it('loginSecondStep should fail to authenticate the user on wwrong OTP', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        loginService.login({ otp: 'otp' }).subscribe(response => {
          expect(response).toEqual({ success: false });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ result: { value: false } });

        backend.verify();
      }
    ));

  });

  describe('logout', () => {

    it('should call LoginService.handleLogout if the response is successful', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        spyOn(loginService, 'handleLogout');

        loginService.logout().subscribe();

        const logoutRequest = backend.expectOne((req) => req.url === '/userservice/logout' && req.method === 'GET');
        logoutRequest.flush({ result: { value: true } });

        backend.verify();

        expect(loginService.handleLogout).toHaveBeenCalled();
      }
    ));

    it('should not call LoginService.handleLogout if the response fails', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        spyOn(loginService, 'handleLogout');

        loginService.logout().subscribe();

        const logoutRequest = backend.expectOne((req) => req.url === '/userservice/logout' && req.method === 'GET');
        logoutRequest.flush({ result: { value: false } });

        backend.verify();

        expect(loginService.handleLogout).not.toHaveBeenCalled();
      }
    ));

    it('should handle logout errors', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        loginService.logout().subscribe();

        const logoutRequest = backend.expectOne((req) => req.url === '/userservice/logout' && req.method === 'GET');
        logoutRequest.error(new ErrorEvent('Error logging out'));

        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      }
    ));
  });

  describe('refreshUserSystemInfo', () => {
    it('should set the permissions in local storage', () => {
      spyOn(localStorage, 'setItem');
      spyOn(loginService, 'loadStoredPermissions');
      const usersysInfo = Fixtures.userSystemInfo;
      usersysInfo.permissions = Fixtures.permissionList;
      systemService.getUserSystemInfo.and.returnValue(of(usersysInfo));

      loginService.refreshUserSystemInfo().subscribe(() => {
        expect(loginService.loadStoredPermissions).toHaveBeenCalled();
        expect(localStorage.setItem).toHaveBeenCalledWith('permissions', JSON.stringify(Fixtures.permissionList));
      });
    });
  });

  describe('clearPermissions', () => {
    it('should clear the list of permissions and set the permissions as not loaded', fakeAsync(() => {
      loginService.clearPermissions();
      tick();
      loginService.permissionLoad$.subscribe(res => {
        expect(res).toEqual(false);
      });
      expect(ngxPermissionsService.flushPermissions).toHaveBeenCalled();
    }));
  });

  describe('hasPermission$', () => {
    it('should directly return the current permission state', fakeAsync(() => {
      const subscriptionSpy = jasmine.createSpy('permission subscription');
      ngxPermissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(false)));

      loginService.hasPermission$(Permission.DISABLE).subscribe(subscriptionSpy);
      tick();

      expect(subscriptionSpy).toHaveBeenCalledWith(false);
    }));

    it('should push changed state on permission flush and update', fakeAsync(() => {
      const subscriptionSpy = jasmine.createSpy('permission subscription');
      ngxPermissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(true)));

      loginService.hasPermission$(Permission.DISABLE).subscribe(subscriptionSpy);
      tick();

      subscriptionSpy.calls.reset();
      ngxPermissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(false)));
      loginService.clearPermissions();
      tick();

      expect(subscriptionSpy).toHaveBeenCalledWith(false);

      subscriptionSpy.calls.reset();
      ngxPermissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(true)));
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(Fixtures.permissionList));
      loginService.loadStoredPermissions();
      tick();

      expect(subscriptionSpy).toHaveBeenCalledWith(true);
    }));
  });

  describe('handleLogout', () => {
    let router: Router;

    beforeEach(() => {
      router = TestBed.inject(Router);
    });

    it('should flush permissions and clear all local storage items', () => {
      spyOn(localStorage, 'clear');
      spyOn(loginService, 'clearPermissions');

      loginService.handleLogout(false);

      expect(localStorage.clear).toHaveBeenCalled();
      expect(loginService.clearPermissions).toHaveBeenCalled();
    });

    it('should emit a loginChange event', () => {
      const subscriptionSpy = jasmine.createSpy('loginChange$ subscription');

      loginService.loginChange$.subscribe(subscriptionSpy);
      subscriptionSpy.calls.reset();

      loginService.handleLogout(false);
      expect(subscriptionSpy).toHaveBeenCalledWith(undefined);
    });

    it('should not set redirect param if disabled', () => {
      const routerSpy = spyOn(router, 'navigate');

      loginService.handleLogout(false);

      expect(routerSpy).toHaveBeenCalledWith(['/login'], {});
    });

    it('should set redirect param if enabled', () => {
      const routerSpy = spyOn(router, 'navigate');

      loginService.handleLogout(true);

      const navExtras = { queryParams: { redirect: router.url } };
      expect(routerSpy).toHaveBeenCalledWith(['/login'], navExtras);
    });
  });

});
