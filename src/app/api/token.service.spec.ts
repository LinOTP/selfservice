import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TokenListFixtures } from '../../testing/fixtures';

import { SessionService } from '../auth/session.service';
import { TokenService } from './token.service';

const session = '';

describe('TokenService', () => {
  let tokenService: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TokenService,
        {
          provide: SessionService,
          useValue: {
            isLoggedIn: jasmine.createSpy('isLoggedIn'),
            login: jasmine.createSpy('login'),
            logout: jasmine.createSpy('logout'),
            getSession: jasmine.createSpy('getSession').and.returnValue(session),
          }
        },
      ],
    });

    tokenService = TestBed.inject(TokenService);
  });

  it('should be created', inject([TokenService], (service: TokenService) => {
    expect(service).toBeTruthy();
  }));

  describe('getTokens', () => {
    it('should request tokens from the server', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        tokenService.getTokens().subscribe(response => {
          expect(response).toEqual(TokenListFixtures.mockTokenList);
        });

        const tokenListRequest = backend.expectOne((req) => req.url === '/userservice/usertokenlist' && req.method === 'GET');

        tokenListRequest.flush(TokenListFixtures.mockGetTokensResponse);
        backend.verify();
      }
    ));

    it('should call the error handler on request failure', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        tokenService.getTokens().subscribe(response => {
          expect(response).toEqual([]);
        });

        const tokenListRequest = backend.expectOne((req) => req.url === '/userservice/usertokenlist' && req.method === 'GET');

        tokenListRequest.error(new ErrorEvent('Error loading token list'));
        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      }
    ));

  });

  describe('getToken', () => {
    const token = TokenListFixtures.mockReadyEnabledToken;
    it('should request a token from the server', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        tokenService.getToken(token.serial).subscribe(response => {
          expect(response).toEqual(token);
        });

        const tokenListRequest = backend.expectOne((req) => req.url === '/userservice/usertokenlist' && req.method === 'GET');

        tokenListRequest.flush({ result: { value: [TokenListFixtures.mockTokenListFromBackend[0]] } });
        backend.verify();
      }
    ));
  });

  describe('getSerialByOTP', () => {
    it('should request the token serial given an otp', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        const mockSerialResponse = {
          result: {
            value: {
              serial: 'serial'
            }
          }
        };

        tokenService.getSerialByOTP('1234').subscribe(response => {
          expect(response).toEqual('serial');
        });

        const tokenSerialRequest = backend.expectOne((req) => req.url === '/userservice/getSerialByOtp' && req.method === 'GET');

        tokenSerialRequest.flush(mockSerialResponse);
        backend.verify();
      }
    ));

    it('should call the error handler on request failure', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        tokenService.getSerialByOTP('1234').subscribe(response => {
          expect(response).toBe(null);
        });

        const tokenListRequest = backend.expectOne((req) => req.url === '/userservice/getSerialByOtp' && req.method === 'GET');

        tokenListRequest.error(new ErrorEvent('Error getting token serial by OTP'));
        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      }
    ));
  });

});
