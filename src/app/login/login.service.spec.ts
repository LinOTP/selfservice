import { TestBed, async, inject } from '@angular/core/testing';

import { LoginService } from './login.service';
import { SessionService } from '../auth/session.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { spyOnClass } from '../../testing/spyOnClass';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { TokenService } from '../api/token.service';
import { Fixtures } from '../../testing/fixtures';

describe('LoginService', () => {
  let loginService: LoginService;
  let sessionService: jasmine.SpyObj<SessionService>;
  let tokenService: jasmine.SpyObj<TokenService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
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
      ],
    });
  });

  beforeEach(() => {
    loginService = TestBed.get(LoginService);
    sessionService = TestBed.get(SessionService);
    tokenService = TestBed.get(TokenService);
  });

  it('should be created', () => {
    expect(loginService).toBeTruthy();
  });

  describe('password login', () => {
    it('should be successful on successful request', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        loginService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ needsSecondFactor: false, success: true });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ result: { value: true } });

        backend.verify();
      })
    ));

    it('should refresh the permissions on successful login', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        loginService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ needsSecondFactor: false, success: true });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ result: { value: true } });

        expect(sessionService.handleLogin).toHaveBeenCalledWith(true);
      })
    ));

    it('should not log in on failed request', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        loginService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ needsSecondFactor: false, success: false });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');

        loginRequest.flush({ result: { value: false } });
        backend.verify();
      })
    ));

    it('should not fetch the permissions on failed login', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        loginService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ needsSecondFactor: false, success: false });
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ result: { value: false } });

        expect(sessionService.handleLogin).toHaveBeenCalledWith(false);
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        loginService.login({ username: 'user', password: 'pass' }).subscribe(response => {
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

  describe('requestSecondFactorTransaction', () => {

    it('should request a challenge transaction for the first token and return its status', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        loginService.requestSecondFactorTransaction('user', Fixtures.completedPushToken.serial).subscribe(response => {
          expect(response).toEqual(true);
        });

        const tokenValidationRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        tokenValidationRequest.flush({ result: { status: true } });

        backend.verify();
      })
    ));
  });

  describe('MFA login when the user has tokens', () => {

    it('should request a list of completed tokens for the user and return them', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        const secondFactorMessage = 'credential verified - additional authentication parameter required';
        const tokens = [Fixtures.completedPushToken, Fixtures.completedQRToken];
        tokenService.getTokens.and.returnValue(of(tokens));

        loginService.login({ username: 'user', password: 'pass' }).subscribe(response => {
          expect(response).toEqual({ needsSecondFactor: true, success: false, tokens: tokens });
          expect(tokenService.getTokens).toHaveBeenCalled();
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ detail: { message: secondFactorMessage }, result: { value: false } });

        backend.verify();
      })
    ));

    it('loginSecondStep should authenticate the user on correct OTP', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        loginService.loginSecondStep('otp').subscribe(response => {
          expect(response).toEqual(true);
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ result: { value: true } });

        backend.verify();
      })
    ));

    it('loginSecondStep should fail to authenticate the user on wwrong OTP', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        loginService.loginSecondStep('otp').subscribe(response => {
          expect(response).toEqual(false);
        });

        const loginRequest = backend.expectOne((req) => req.url === '/userservice/login' && req.method === 'POST');
        loginRequest.flush({ result: { value: false } });

        backend.verify();
      })
    ));

  });

  describe('logout', () => {

    it('should call AuthService.handleLogout if the response is successful', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        loginService.logout().subscribe();

        const logoutRequest = backend.expectOne((req) => req.url === '/userservice/logout' && req.method === 'GET');
        logoutRequest.flush({ result: { value: true } });

        backend.verify();

        expect(sessionService.handleLogout).toHaveBeenCalled();
      })
    ));

    it('should not call AuthService.handleLogout if the response fails', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        loginService.logout().subscribe();

        const logoutRequest = backend.expectOne((req) => req.url === '/userservice/logout' && req.method === 'GET');
        logoutRequest.flush({ result: { value: false } });

        backend.verify();

        expect(sessionService.handleLogout).not.toHaveBeenCalled();
      })
    ));

    it('should handle logout errors', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        loginService.logout().subscribe();

        const logoutRequest = backend.expectOne((req) => req.url === '/userservice/logout' && req.method === 'GET');
        logoutRequest.error(new ErrorEvent('Error logging out'));

        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));

  });

});
