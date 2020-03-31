import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Fixtures } from '../../testing/fixtures';
import { I18nMock } from '../../testing/i18n-mock-provider';

import { SessionService } from '../auth/session.service';
import { TokenService } from './token.service';
import { Token, EnrollmentStatus, TokenType } from './token';

const session = '';

const mockReadyEnabledToken = new Token(1, 'serial', Fixtures.tokenTypeDetails[TokenType.UNKNOWN], true, 'desc');
mockReadyEnabledToken.enrollmentStatus = EnrollmentStatus.COMPLETED;

const mockReadyDisabledToken = new Token(2, 'serial2', Fixtures.tokenTypeDetails[TokenType.UNKNOWN], false, 'desc');
mockReadyDisabledToken.enrollmentStatus = EnrollmentStatus.COMPLETED;

const mockUnreadyDisabledToken = new Token(3, 'serial3', Fixtures.tokenTypeDetails[TokenType.UNKNOWN], false, 'desc');
mockUnreadyDisabledToken.enrollmentStatus = EnrollmentStatus.UNPAIRED;

const mockTokens: Token[] = [mockReadyEnabledToken, mockReadyDisabledToken, mockUnreadyDisabledToken];

const mockResponse = {
  result: {
    value: [
      {
        'LinOtp.TokenId': mockReadyEnabledToken.id,
        'LinOtp.TokenSerialnumber': mockReadyEnabledToken.serial,
        'LinOtp.TokenType': mockReadyEnabledToken.typeDetails.type,
        'LinOtp.TokenDesc': mockReadyEnabledToken.description,
        'LinOtp.Isactive': mockReadyEnabledToken.enabled,
        'Enrollment': { 'status': mockReadyEnabledToken.enrollmentStatus }
      },
      {
        'LinOtp.TokenId': mockReadyDisabledToken.id,
        'LinOtp.TokenSerialnumber': mockReadyDisabledToken.serial,
        'LinOtp.TokenType': mockReadyDisabledToken.typeDetails.type,
        'LinOtp.TokenDesc': mockReadyDisabledToken.description,
        'LinOtp.Isactive': mockReadyDisabledToken.enabled,
        'Enrollment': { 'status': mockReadyDisabledToken.enrollmentStatus }
      },
      {
        'LinOtp.TokenId': mockUnreadyDisabledToken.id,
        'LinOtp.TokenSerialnumber': mockUnreadyDisabledToken.serial,
        'LinOtp.TokenType': mockUnreadyDisabledToken.typeDetails.type,
        'LinOtp.TokenDesc': mockUnreadyDisabledToken.description,
        'LinOtp.Isactive': mockUnreadyDisabledToken.enabled,
        'Enrollment': { 'status': 'not completed', 'detail': mockUnreadyDisabledToken.enrollmentStatus }
      }
    ]
  }
};

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
        I18nMock,
      ],
    });

    tokenService = TestBed.get(TokenService);
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

});
