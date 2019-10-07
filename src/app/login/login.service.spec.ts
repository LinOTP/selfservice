import { TestBed, async, inject } from '@angular/core/testing';

import { LoginService } from './login.service';
import { SessionService } from '../auth/session.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { spyOnClass } from '../../testing/spyOnClass';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

describe('LoginService', () => {
  let loginService: LoginService;
  let sessionService: jasmine.SpyObj<SessionService>;

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
      ],
    });
  });

  beforeEach(() => {
    loginService = TestBed.get(LoginService);
    sessionService = TestBed.get(SessionService);
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

  describe('MFA login when the user has tokens', () => {

    it('should send a request to fetch a list of tokens for the user and another to tell the serial of the chosen token', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        const secondFactorMessage = 'credential verified - additional authentication parameter required';

        loginService.login({ username: 'user', password: 'pass' }).subscribe(response => {
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
