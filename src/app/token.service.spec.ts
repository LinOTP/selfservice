import { TestBed, async, inject } from '@angular/core/testing';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TokenService } from './token.service';
import { Token, EnrollmentStatus } from './token';
import { AuthService } from './auth/auth.service';

const session = '';

const mockReadyEnabledToken = new Token(1, 'serial', 'foo', true, 'desc');
mockReadyEnabledToken.enrollmentStatus = EnrollmentStatus.completed;

const mockReadyDisabledToken = new Token(2, 'serial2', 'foo', false, 'desc');
mockReadyDisabledToken.enrollmentStatus = EnrollmentStatus.completed;

const mockUnreadyDisabledToken = new Token(3, 'serial3', 'foo', false, 'desc');
mockUnreadyDisabledToken.enrollmentStatus = EnrollmentStatus.unpaired;

const mockTokens: Token[] = [mockReadyEnabledToken, mockReadyDisabledToken, mockUnreadyDisabledToken];

const mockResponse = {
  result: {
    value: [
      {
        'LinOtp.TokenId': mockReadyEnabledToken.id,
        'LinOtp.TokenSerialnumber': mockReadyEnabledToken.serial,
        'LinOtp.TokenType': mockReadyEnabledToken.type,
        'LinOtp.TokenDesc': mockReadyEnabledToken.description,
        'LinOtp.Isactive': mockReadyEnabledToken.enabled,
        'Enrollment': { 'status': mockReadyEnabledToken.enrollmentStatus }
      },
      {
        'LinOtp.TokenId': mockReadyDisabledToken.id,
        'LinOtp.TokenSerialnumber': mockReadyDisabledToken.serial,
        'LinOtp.TokenType': mockReadyDisabledToken.type,
        'LinOtp.TokenDesc': mockReadyDisabledToken.description,
        'LinOtp.Isactive': mockReadyDisabledToken.enabled,
        'Enrollment': { 'status': mockReadyDisabledToken.enrollmentStatus }
      },
      {
        'LinOtp.TokenId': mockUnreadyDisabledToken.id,
        'LinOtp.TokenSerialnumber': mockUnreadyDisabledToken.serial,
        'LinOtp.TokenType': mockUnreadyDisabledToken.type,
        'LinOtp.TokenDesc': mockUnreadyDisabledToken.description,
        'LinOtp.Isactive': mockUnreadyDisabledToken.enabled,
        'Enrollment': { 'status': 'not completed', 'detail': mockUnreadyDisabledToken.enrollmentStatus }
      }
    ]
  }
};

describe('TokenService', () => {
  let tokenService: TokenService;
  let httpClient: HttpClientTestingModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TokenService,
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: jasmine.createSpy('isLoggedIn'),
            login: jasmine.createSpy('login'),
            logout: jasmine.createSpy('logout'),
            getSession: jasmine.createSpy('getSession').and.returnValue(session),
          }
        }
      ],
    });

    tokenService = TestBed.get(TokenService);
    httpClient = TestBed.get(HttpTestingController);
  });

  it('should be created', inject([TokenService], (service: TokenService) => {
    expect(service).toBeTruthy();
  }));

  describe('getTokens', () => {
    it('should request tokens from the server', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        tokenService.getTokens().subscribe(response => {
          expect(response).toEqual(mockTokens);
        });

        const tokenListRequest = backend.expectOne((req) => req.url === '/userservice/usertokenlist' && req.method === 'GET');

        tokenListRequest.flush(mockResponse);
        backend.verify();
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        tokenService.getTokens().subscribe(response => {
          expect(response).toEqual([]);
        });

        const tokenListRequest = backend.expectOne((req) => req.url === '/userservice/usertokenlist' && req.method === 'GET');

        tokenListRequest.error(new ErrorEvent('Error loading token list'));
        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));

  });

  describe('getToken', () => {
    const token = mockReadyEnabledToken;
    it('should request a token from the server', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        tokenService.getToken(token.serial).subscribe(response => {
          expect(response).toEqual(token);
        });

        const tokenListRequest = backend.expectOne((req) => req.url === '/userservice/usertokenlist' && req.method === 'GET');

        tokenListRequest.flush(mockResponse);
        backend.verify();
      })
    ));
  });

  describe('set token pin', () => {
    const setPinRequestBody = { userpin: '01234', serial: 'serial', session: session };
    it('should send a pin request', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        tokenService.setPin(mockReadyEnabledToken, '01234').subscribe();
        const req = backend.expectOne({
          url: '/userservice/setpin',
          method: 'POST'
        });

        expect(req.request.body).toEqual(setPinRequestBody);
        backend.verify();
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        tokenService.setPin(mockReadyEnabledToken, '01234').subscribe(response => {
          expect(response).toEqual(false);
        });
        const setPinRequest = backend.expectOne({
          url: '/userservice/setpin',
          method: 'POST'
        });

        setPinRequest.error(new ErrorEvent('Error setting token pin'));
        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));
  });
});
