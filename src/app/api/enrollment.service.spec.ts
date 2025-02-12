import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';


import { Fixtures, getSelfserviceTokenFixture } from '@testing/fixtures';
import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { SessionService } from '@app/auth/session.service';
import { NotificationService } from '@common/notification.service';

import { EnrollmentService } from './enrollment.service';
import { EnrollmentStatus, TokenType } from './token';
import { TokenService } from './token.service';
import { NgxPermissionsService } from "ngx-permissions";

const session = '';

const mockReadyEnabledToken = getSelfserviceTokenFixture(1, 'serial', Fixtures.tokenDisplayData[TokenType.UNKNOWN], true, 'desc');
mockReadyEnabledToken.enrollmentStatus = EnrollmentStatus.COMPLETED;

const mockReadyDisabledToken = getSelfserviceTokenFixture(2, 'serial2', Fixtures.tokenDisplayData[TokenType.UNKNOWN], false, 'desc');
mockReadyDisabledToken.enrollmentStatus = EnrollmentStatus.COMPLETED;

const mockUnreadyDisabledToken = getSelfserviceTokenFixture(3, 'serial3', Fixtures.tokenDisplayData[TokenType.UNKNOWN], false, 'desc');
mockUnreadyDisabledToken.enrollmentStatus = EnrollmentStatus.UNPAIRED;


describe('EnrollmentService', () => {
  let enrollmentService: EnrollmentService;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let tokenService: jasmine.SpyObj<TokenService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EnrollmentService,
        {
          provide: NgxPermissionsService,
          useValue: spyOnClass(NgxPermissionsService),
        },
        {
          provide: SessionService,
          useValue: {
            isLoggedIn: jasmine.createSpy('isLoggedIn'),
            login: jasmine.createSpy('login'),
            logout: jasmine.createSpy('logout'),
            getSession: jasmine.createSpy('getSession').and.returnValue(session),
          }
        },
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService),
        },
        {
          provide: TokenService,
          useValue: {
            updateTokenList: jasmine.createSpy('updateTokenList'),
            getTypeDetails: jasmine.createSpy('getTypeDetails').and.returnValue("some_data"),
          }
        },
      ],
    });

    tokenService = getInjectedStub(TokenService);

    enrollmentService = TestBed.inject(EnrollmentService);
    notificationService = getInjectedStub(NotificationService);

  });

  it('should be created', inject([EnrollmentService], (service: EnrollmentService) => {
    expect(service).toBeTruthy();
  }));

  describe('enrollChallenge', () => {
    [
      { type: TokenType.TOTP, enrollmentType: TokenType.TOTP },
      { type: TokenType.HOTP, enrollmentType: TokenType.HOTP },
      { type: TokenType.PUSH, enrollmentType: null },
    ].forEach(({ type, enrollmentType }) => {
      it(`should use the enrollmentType for ${type}`, inject(
        [HttpClient, HttpTestingController],
        (http: HttpClient, backend: HttpTestingController) => {
          enrollmentService.enroll({
            type: type,
          }).subscribe(response => {
            expect(response).toEqual(null);
          });

          const expectedType = enrollmentType ? enrollmentType : type;
          const enrollRequest = backend.expectOne((req) => req.body.type === expectedType);

          enrollRequest.flush(null);
          backend.verify();
        }
      ));
    });
  });

  describe('enroll', () => {
    it('should notify the user of an error if the response status is not a success', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        enrollmentService.enroll({ type: TokenType.HOTP }).subscribe(res => {
          expect(notificationService.errorMessage).toHaveBeenCalledWith('Token registration failed: Please try again.');
        });

        const request = backend.expectOne((req) => req.body.type === TokenType.HOTP);
        request.flush({ result: { status: false } });

        backend.verify();
      }));
  });

  describe('assign', () => {
    it('should request a token assignment from the server', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        enrollmentService.assign('serial', 'description').subscribe(response => {
          expect(response).toEqual({ success: true });
        });

        const request = backend.expectOne((req) => req.url === '/userservice/assign' && req.method === 'POST');

        request.flush({ result: { status: true, value: { 'assign token': true } } });
        backend.verify();
      }
    ));

    it('should return an error message if the token is already assigned', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        const returnedMessage = 'The token is already assigned to you or to another user. Please contact an administrator.';

        enrollmentService.assign('serial', 'description').subscribe(response => {
          expect(response).toEqual({ success: false, message: returnedMessage });
        });

        const request = backend.expectOne((req) => req.url === '/userservice/assign' && req.method === 'POST');
        const receivedMessage = 'The token is already assigned to another user.';

        request.flush({ result: { status: true, error: { message: receivedMessage } } });
        backend.verify();

      }
    ));

    it('should return an error message if the token is in another realm', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        const returnedMessage = 'The token you want to assign is not valid (wrong realm). Please contact an administrator.';

        enrollmentService.assign('serial', 'description').subscribe(response => {
          expect(response).toEqual({ success: false, message: returnedMessage });
        });

        const request = backend.expectOne((req) => req.url === '/userservice/assign' && req.method === 'POST');
        const receivedMessage = 'The token you want to assign is  not contained in your realm!';

        request.flush({ result: { status: true, error: { message: receivedMessage } } });
        backend.verify();
      }
    ));

    it('should return a generic error message if an unknown error is received', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        const returnedMessage = 'Please try again or contact an administrator.';

        enrollmentService.assign('serial', 'description').subscribe(response => {
          expect(response).toEqual({ success: false, message: returnedMessage });
        });

        const request = backend.expectOne((req) => req.url === '/userservice/assign' && req.method === 'POST');
        const receivedMessage = 'some error message';

        request.flush({ result: { status: true, error: { message: receivedMessage } } });
        backend.verify();
      }
    ));

    it('should return a generic error message if neither error nor success is received', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        const returnedMessage = 'Please try again or contact an administrator.';

        enrollmentService.assign('serial', 'description').subscribe(response => {
          expect(response).toEqual({ success: false, message: returnedMessage });
        });

        const request = backend.expectOne((req) => req.url === '/userservice/assign' && req.method === 'POST');

        request.flush({ result: { status: false } });
        backend.verify();
      }
    ));

    it('should call the error handler on request failure', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        enrollmentService.assign('serial', 'description').subscribe(response => {
          expect(notificationService.errorMessage).toHaveBeenCalledWith('assign failed: Please try again.');
          expect(response).toEqual({ success: false });
        });

        const request = backend.expectOne((req) => req.url === '/userservice/assign' && req.method === 'POST');

        request.error(new ErrorEvent('Error assigning token'));
        backend.verify();
      }
    ));
  });

  describe('activate', () => {

    [
      { result: { status: true, value: false }, detail: { transactionid: 'id', message: 'ok' } },
      { result: { status: true, value: true }, detail: { transactionid: 'id', message: 'ok' } },
      { result: { status: true, value: false }, detail: { transactionid: 'id', message: '' } },
      { result: { status: true, value: false }, detail: { transactionid: 'id' } },
    ].forEach(serverResponse => {
      it('should request a token activation from the server', inject(
        [HttpClient, HttpTestingController],
        (http: HttpClient, backend: HttpTestingController) => {
          const body = {
            serial: 'serial',
            data: 'serial',
            pass: 'pin',
            user: 'name',
            realm: 'realm1',
          };

          spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ username: 'name', realm: 'realm1' }));

          enrollmentService.activate('serial', 'pin').subscribe(response => {
            expect(response).toEqual(serverResponse.detail);
          });

          const request = backend.expectOne((req) =>
            req.url === '/validate/check' &&
            req.method === 'POST' &&
            req.body.serial === body.serial &&
            req.body.data === body.data &&
            req.body.pass === body.pass &&
            req.body.user === body.user &&
            req.body.realm === body.realm
          );

          request.flush(serverResponse);
          backend.verify();
        }
      ));
    });

    [
      { result: { status: false } },
      { result: { status: true, value: false } },
      { result: { status: true, value: true } },
    ].forEach(serverResponse => {
      it('should return an error message if there was a backend error', inject(
        [HttpClient, HttpTestingController],
        (http: HttpClient, backend: HttpTestingController) => {

          spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ username: 'name', realm: 'realm1' }));

          enrollmentService.activate('serial', 'pin').subscribe(response => {
            expect(response).toEqual(null);
            expect(notificationService.errorMessage).toHaveBeenCalledWith('Token activation failed: Please try again.');
            expect(tokenService.updateTokenList).toHaveBeenCalledTimes(1);
          });

          const request = backend.expectOne((req) => req.url === '/validate/check' && req.method === 'POST');

          request.flush(serverResponse);
          backend.verify();
        }
      ));
    });
  });


  describe('getChallengeStatus', () => {
    it('should request a challenge status check from the server', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        const body = {
          transactionid: 'txid',
          pass: 'pin',
          user: 'name',
          realm: 'realm1',
        };

        const serverResponse = {
          result: { status: true, value: true },
          detail: {
            transactions: {
              'txid': { status: 'ok' }
            }
          }
        };

        spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ username: 'name', realm: 'realm1' }));

        enrollmentService.getChallengeStatus('txid', 'pin', 'serial').subscribe(response => {
          expect(response).toEqual(serverResponse);
        });

        const request = backend.expectOne((req) =>
          req.url === '/validate/check_status' &&
          req.method === 'POST' &&
          req.body.transactionid === body.transactionid &&
          req.body.pass === body.pass &&
          req.body.user === body.user &&
          req.body.user === body.user
        );

        request.flush(serverResponse);
        backend.verify();
      }
    ));

    it('should return an error message if there was a backend error', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ username: 'name' }));

        enrollmentService.getChallengeStatus('txid', 'pin', 'serial').subscribe(response => {
          expect(response).toEqual(null);
          expect(notificationService.errorMessage).toHaveBeenCalledWith('Challenge status request failed: Please try again.');
        });

        const request = backend.expectOne((req) => req.url === '/validate/check_status' && req.method === 'POST');

        request.error(new ErrorEvent('Error checking challenge status'));
        backend.verify();
      }
    ));
  });
});
