import { TestBed, async, inject } from '@angular/core/testing';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { TokenService } from './token.service';
import { Token, EnrollmentStatus } from './token';
import { AuthService } from './auth.service';

const session = '';
const mockToken = new Token(123, 'serial', 'foo', 'desc');
const mockData: Token[] = [mockToken];
mockToken.enrollmentStatus = EnrollmentStatus.completed;

const mockResponse = {
  result: {
    value: [
      {
        'LinOtp.TokenId': mockToken.id,
        'LinOtp.TokenSerialnumber': mockToken.serial,
        'LinOtp.TokenType': mockToken.type,
        'LinOtp.TokenDesc': mockToken.description,
        'Enrollment': { 'status': mockToken.enrollmentStatus }
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
          expect(response).toEqual(mockData);
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
    const token = mockToken;
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
        tokenService.setPin(mockToken, '01234').subscribe();

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

        tokenService.setPin(mockToken, '01234').subscribe(response => {
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
