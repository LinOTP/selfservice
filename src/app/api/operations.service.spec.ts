import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';


import { Fixtures } from '@testing/fixtures';
import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { SessionService } from '@app/auth/session.service';
import { NotificationService } from '@common/notification.service';

import { OperationsService } from './operations.service';
import { EnrollmentStatus, SelfserviceToken, TokenType } from './token';

const session = '';

const mockReadyEnabledToken = new SelfserviceToken(1, 'serial', Fixtures.tokenDisplayData[TokenType.UNKNOWN], true, 'desc');
mockReadyEnabledToken.enrollmentStatus = EnrollmentStatus.COMPLETED;

const mockReadyDisabledToken = new SelfserviceToken(2, 'serial2', Fixtures.tokenDisplayData[TokenType.UNKNOWN], false, 'desc');
mockReadyDisabledToken.enrollmentStatus = EnrollmentStatus.COMPLETED;

const mockUnreadyDisabledToken = new SelfserviceToken(3, 'serial3', Fixtures.tokenDisplayData[TokenType.UNKNOWN], false, 'desc');
mockUnreadyDisabledToken.enrollmentStatus = EnrollmentStatus.UNPAIRED;

const mockReadyEnabledMOTPToken = new SelfserviceToken(4, 'serial', Fixtures.tokenDisplayData[TokenType.MOTP], true, 'desc');
mockReadyEnabledToken.enrollmentStatus = EnrollmentStatus.COMPLETED;


describe('OperationsService', () => {
  let operationsService: OperationsService;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OperationsService,
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
          useValue: spyOnClass(NotificationService)
        }
      ],
    });

    operationsService = TestBed.inject(OperationsService);
    notificationService = getInjectedStub(NotificationService);
  });

  it('should be created', inject([OperationsService], (service: OperationsService) => {
    expect(service).toBeTruthy();
  }));

  describe('set token pin', () => {
    const setPinRequestBody = { userpin: '01234', serial: 'serial', session: session };
    it('should send a pin request and return true on success', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        operationsService.setPin(mockReadyEnabledToken, '01234').subscribe(res => {
          expect(res).toEqual(true);
        });

        const req = backend.expectOne({
          url: '/userservice/setpin',
          method: 'POST'
        });

        expect(req.request.body).toEqual(setPinRequestBody);
        req.flush({ result: { status: true, value: { 'set userpin': 1 } } });

        backend.verify();
      }
    ));

    [
      { result: { status: false } },
      { result: { status: true, value: { 'set userpin': 0 } } },
      { result: { status: true, value: null } },
      { result: null },
      null
    ].forEach(response => {
      it('should send a pin request and return false on failure', inject(
        [HttpClient, HttpTestingController],
        (http: HttpClient, backend: HttpTestingController) => {
          operationsService.setPin(mockReadyEnabledToken, '01234').subscribe(res => {
            expect(res).toEqual(false);
          });

          const req = backend.expectOne({
            url: '/userservice/setpin',
            method: 'POST'
          });

          expect(req.request.body).toEqual(setPinRequestBody);
          req.flush(response);

          backend.verify();
        }
      ));
    });

    it('should show a notification on request failure', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        operationsService.setPin(mockReadyEnabledToken, '01234').subscribe(response => {
          expect(response).toEqual(false);
        });
        const setPinRequest = backend.expectOne({
          url: '/userservice/setpin',
          method: 'POST'
        });

        setPinRequest.error(new ErrorEvent('Error setting token pin'));
        backend.verify();

        expect(notificationService.errorMessage).toHaveBeenCalledWith('Error: Could not set token PIN. Please try again or contact an administrator');
      }
    ));
  });

  describe('set mOTP pin', () => {
    const setPinRequestBody = { pin: '01234', serial: 'serial', session: session };
    it('should send a mOTP pin request and return true on success', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        operationsService.setMOTPPin(mockReadyEnabledMOTPToken, '01234').subscribe(res => {
          expect(res).toEqual(true);
        });

        const req = backend.expectOne({
          url: '/userservice/setmpin',
          method: 'POST'
        });

        expect(req.request.body).toEqual(setPinRequestBody);
        req.flush({ result: { status: true, value: { 'set userpin': 1 } } });

        backend.verify();
      }
    ));

    [
      { result: { status: false } },
      { result: { status: true, value: { 'set userpin': 0 } } },
      { result: { status: true, value: null } },
      { result: null },
      null
    ].forEach(response => {
      it('should send a mOTP pin request and return false on failure', inject(
        [HttpClient, HttpTestingController],
        (http: HttpClient, backend: HttpTestingController) => {
          operationsService.setMOTPPin(mockReadyEnabledMOTPToken, '01234').subscribe(res => {
            expect(res).toEqual(false);
          });

          const req = backend.expectOne({
            url: '/userservice/setmpin',
            method: 'POST'
          });

          expect(req.request.body).toEqual(setPinRequestBody);
          req.flush(response);

          backend.verify();
        }
      ));
    });

    it('should not call the backend if the token is not an mOTP token', inject(
      [HttpClient], (http:
        HttpClient) => {
      spyOn(http, 'post');

      operationsService.setMOTPPin(mockReadyEnabledToken, '01234').subscribe(response => {
        expect(response).toEqual(false);
        expect(http.post).not.toHaveBeenCalled();
      });
    }
    ));

    it('should show a notification on request failure', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        operationsService.setMOTPPin(mockReadyEnabledMOTPToken, '01234').subscribe(response => {
          expect(response).toEqual(false);
        });
        const setPinRequest = backend.expectOne({
          url: '/userservice/setmpin',
          method: 'POST'
        });

        setPinRequest.error(new ErrorEvent('Error setting token pin'));
        backend.verify();

        expect(notificationService.errorMessage).toHaveBeenCalledWith('Error: Could not set MOTP PIN. Please try again or contact an administrator');
      }
    ));
  });

  describe('delete token', () => {
    const deleteRequestBody = { serial: 'serial', session: session };
    it('should send a delete request and return true on success', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        operationsService.deleteToken('serial').subscribe(response => {
          expect(response).toBe(true);
        });

        const req = backend.expectOne({
          url: '/userservice/delete',
          method: 'POST'
        });

        expect(req.request.body).toEqual(deleteRequestBody);
        req.flush({ result: { status: true, value: { 'delete token': 1 } } });
        backend.verify();
      }
    ));

    [
      { result: { status: false } },
      { result: { status: true, value: { 'delete token': 0 } } },
      { result: { status: true, value: null } },
      { result: null },
      null
    ].forEach(response => {
      it('should send a delete request and return false on failure', inject(
        [HttpClient, HttpTestingController],
        (http: HttpClient, backend: HttpTestingController) => {
          operationsService.deleteToken('serial').subscribe(res => {
            expect(res).toBe(false);
          });

          const req = backend.expectOne({
            url: '/userservice/delete',
            method: 'POST'
          });

          expect(req.request.body).toEqual(deleteRequestBody);
          req.flush(response);
          backend.verify();
        }
      ));
    });

    it('should show a notification on request failure', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        operationsService.deleteToken('serial').subscribe(response => {
          expect(response).toBe(false);
        });
        const deleteRequest = backend.expectOne({
          url: '/userservice/delete',
          method: 'POST'
        });

        deleteRequest.error(new ErrorEvent('Error deleting token'));
        backend.verify();

        expect(notificationService.errorMessage).toHaveBeenCalledWith('Error: Could not delete token. Please try again or contact an administrator');
      }
    ));
  });

  describe('unassign token', () => {
    const unassignRequestBody = { serial: 'serial', session: session };

    it('should send an unassign request and return true on success', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        operationsService.unassignToken('serial').subscribe(res => {
          expect(res).toEqual(true);
        });

        const req = backend.expectOne({
          url: '/userservice/unassign',
          method: 'POST'
        });

        req.flush({ result: { status: true, value: { 'unassign token': true } } });

        expect(req.request.body).toEqual(unassignRequestBody);
        backend.verify();
      }
    ));

    [
      { result: { status: false } },
      { result: { status: true, value: { 'unassign token': false } } },
      { result: { status: true, value: null } },
      { result: null },
      null
    ].forEach(response => {
      it('should send an unassign request and return false on failure', inject(
        [HttpClient, HttpTestingController],
        (http: HttpClient, backend: HttpTestingController) => {
          operationsService.unassignToken('serial').subscribe(res => {
            expect(res).toEqual(false);
          });

          const req = backend.expectOne({
            url: '/userservice/unassign',
            method: 'POST'
          });

          req.flush(response);

          expect(req.request.body).toEqual(unassignRequestBody);
          backend.verify();
        }
      ));
    });

    it('should show a notification on request failure', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        operationsService.unassignToken('serial').subscribe(res => {
          expect(res).toEqual(false);
        });

        const deleteRequest = backend.expectOne({
          url: '/userservice/unassign',
          method: 'POST'
        });

        deleteRequest.error(new ErrorEvent('Error unassigning token'));
        backend.verify();

        expect(notificationService.errorMessage).toHaveBeenCalledWith('Error: Could not unassign token. Please try again or contact an administrator');
      }
    ));
  });

  describe('enable token', () => {
    const enableRequestBody = { serial: mockReadyDisabledToken.serial, session: session };
    it('should send a enable token request and return true on success', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        operationsService.enable(mockReadyDisabledToken).subscribe(res => {
          expect(res).toEqual(true);
        });

        const req = backend.expectOne({
          url: '/userservice/enable',
          method: 'POST'
        });

        expect(req.request.body).toEqual(enableRequestBody);
        req.flush({ result: { status: true, value: { 'enable token': 1 } } });

        backend.verify();
      }
    ));

    [
      { result: { status: false } },
      { result: { status: true, value: { 'enable token': 0 } } },
      { result: { status: true, value: null } },
      { result: null },
      null
    ].forEach(response => {
      it('should send a enable token request and return false on failure', inject(
        [HttpClient, HttpTestingController],
        (http: HttpClient, backend: HttpTestingController) => {
          operationsService.enable(mockReadyDisabledToken).subscribe(res => {
            expect(res).toEqual(false);
          });

          const req = backend.expectOne({
            url: '/userservice/enable',
            method: 'POST'
          });

          expect(req.request.body).toEqual(enableRequestBody);
          req.flush(response);

          backend.verify();
        }
      ));
    });

    it('should show a notification on request failure', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        operationsService.enable(mockReadyDisabledToken).subscribe();
        const enableRequest = backend.expectOne({
          url: '/userservice/enable',
          method: 'POST'
        });

        enableRequest.error(new ErrorEvent('Error enabling token'));
        backend.verify();

        expect(notificationService.errorMessage).toHaveBeenCalledWith('Error: Could not enable token. Please try again or contact an administrator');
      }
    ));
  });

  describe('disable token', () => {
    const disableRequestBody = { serial: mockReadyEnabledToken.serial, session: session };
    it('should send a disable token request and return true on success', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        operationsService.disable(mockReadyEnabledToken).subscribe(res => {
          expect(res).toEqual(true);
        });

        const req = backend.expectOne({
          url: '/userservice/disable',
          method: 'POST'
        });

        expect(req.request.body).toEqual(disableRequestBody);
        req.flush({ result: { status: true, value: { 'disable token': 1 } } });

        backend.verify();
      }
    ));

    [
      { result: { status: false } },
      { result: { status: true, value: { 'disable token': 0 } } },
      { result: { status: true, value: null } },
      { result: null },
      null
    ].forEach(response => {
      it('should send a disable token request and return false on failure', inject(
        [HttpClient, HttpTestingController],
        (http: HttpClient, backend: HttpTestingController) => {
          operationsService.disable(mockReadyEnabledToken).subscribe(res => {
            expect(res).toEqual(false);
          });

          const req = backend.expectOne({
            url: '/userservice/disable',
            method: 'POST'
          });

          expect(req.request.body).toEqual(disableRequestBody);
          req.flush(response);

          backend.verify();
        }
      ));
    });

    it('should show a notification on request failure', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        operationsService.disable(mockReadyEnabledToken).subscribe();
        const disableRequest = backend.expectOne({
          url: '/userservice/disable',
          method: 'POST'
        });

        disableRequest.error(new ErrorEvent('Error disabling token'));
        backend.verify();

        expect(notificationService.errorMessage).toHaveBeenCalledWith('Error: Could not disable token. Please try again or contact an administrator');
      }
    ));
  });

  describe('resetFailcounter', () => {
    it('should request a failcounter reset from the server and return true on success', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        operationsService.resetFailcounter('serial').subscribe(response => {
          expect(response).toEqual(true);
        });

        const request = backend.expectOne((req) => req.url === '/userservice/reset' && req.method === 'POST');

        request.flush({ result: { status: true, value: { 'reset Failcounter': 1 } } });
        backend.verify();
      }
    ));

    [
      { result: { status: false } },
      { result: { status: true, value: { 'reset Failcounter': 0 } } },
      { result: { status: true, value: null } },
      { result: null },
      null
    ].forEach(response => {
      it('should request a failcounter reset from the server and return false on failure', inject(
        [HttpClient, HttpTestingController],
        (http: HttpClient, backend: HttpTestingController) => {

          operationsService.resetFailcounter('serial').subscribe(res => {
            expect(res).toEqual(false);
          });

          const request = backend.expectOne((req) => req.url === '/userservice/reset' && req.method === 'POST');

          request.flush(response);
          backend.verify();
        }
      ));
    });

    it('should show a notification on request failure', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        operationsService.resetFailcounter('serial').subscribe(response => {
          expect(response).toEqual(false);
        });

        const request = backend.expectOne((req) => req.url === '/userservice/reset' && req.method === 'POST');

        request.error(new ErrorEvent('Error resetting failcounter'));
        backend.verify();

        expect(notificationService.errorMessage).toHaveBeenCalledWith('Error: Could not reset failcounter. Please try again or contact an administrator');
      }
    ));

  });

  describe('resync', () => {
    it('should request a token resync from the server and return true on success', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        operationsService.resync('serial', 'otp1', 'otp2').subscribe(response => {
          expect(response).toEqual(true);
        });

        const request = backend.expectOne((req) => req.url === '/userservice/resync' && req.method === 'POST');

        request.flush({ result: { status: true, value: { 'resync Token': true } } });
        backend.verify();
      }
    ));

    [
      { result: { status: false } },
      { result: { status: true, value: { 'resync Token': false } } },
      { result: { status: true, value: null } },
      { result: null },
      null
    ].forEach(response => {
      it('should request a token resync from the server and return false on failure', inject(
        [HttpClient, HttpTestingController],
        (http: HttpClient, backend: HttpTestingController) => {

          operationsService.resync('serial', 'otp1', 'otp2').subscribe(res => {
            expect(res).toEqual(false);
          });

          const request = backend.expectOne((req) => req.url === '/userservice/resync' && req.method === 'POST');

          request.flush(response);
          backend.verify();
        }
      ));
    });

    it('should show a notification on request failure', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        operationsService.resync('serial', 'otp1', 'otp2').subscribe(response => {
          expect(response).toEqual(false);
        });

        const request = backend.expectOne((req) => req.url === '/userservice/resync' && req.method === 'POST');

        request.error(new ErrorEvent('Error resyncing token'));
        backend.verify();

        expect(notificationService.errorMessage).toHaveBeenCalledWith('Error: Could not synchronize token. Please try again or contact an administrator');
      }
    ));
  });

  describe('setDescription', () => {
    it('should request setting a token description from the server and return true on success', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        operationsService.setDescription('serial', 'description').subscribe(response => {
          expect(response).toEqual(true);
        });

        const request = backend.expectOne((req) => req.url === '/userservice/setdescription' && req.method === 'POST');

        request.flush({ result: { status: true, value: { 'set description': 1 } } });
        backend.verify();
      }
    ));

    [
      { result: { status: false } },
      { result: { status: true, value: { 'set description': 0 } } },
      { result: { status: true, value: null } },
      { result: null },
      null
    ].forEach(response => {
      it('should request setting a token description from the server and return false on failure', inject(
        [HttpClient, HttpTestingController],
        (http: HttpClient, backend: HttpTestingController) => {

          operationsService.setDescription('serial', 'description').subscribe(res => {
            expect(res).toEqual(false);
          });

          const request = backend.expectOne((req) => req.url === '/userservice/setdescription' && req.method === 'POST');

          request.flush(response);
          backend.verify();
        }
      ));
    });

    it('should show a notification on request failure', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        operationsService.setDescription('serial', 'description').subscribe(response => {
          expect(response).toEqual(false);
        });

        const request = backend.expectOne((req) => req.url === '/userservice/setdescription' && req.method === 'POST');

        request.error(new ErrorEvent('Error setting token description'));
        backend.verify();

        expect(notificationService.errorMessage).toHaveBeenCalledWith('Error: Could not set token description. Please try again or contact an administrator');
      }
    ));
  });
});
