import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Fixtures } from '../../testing/fixtures';

import { SessionService } from '../auth/session.service';
import { OperationsService } from './operations.service';
import { Token, EnrollmentStatus, TokenType } from './token';

const session = '';

const mockReadyEnabledToken = new Token(1, 'serial', Fixtures.tokenTypeDetails[TokenType.UNKNOWN], true, 'desc');
mockReadyEnabledToken.enrollmentStatus = EnrollmentStatus.COMPLETED;

const mockReadyDisabledToken = new Token(2, 'serial2', Fixtures.tokenTypeDetails[TokenType.UNKNOWN], false, 'desc');
mockReadyDisabledToken.enrollmentStatus = EnrollmentStatus.COMPLETED;

const mockUnreadyDisabledToken = new Token(3, 'serial3', Fixtures.tokenTypeDetails[TokenType.UNKNOWN], false, 'desc');
mockUnreadyDisabledToken.enrollmentStatus = EnrollmentStatus.UNPAIRED;

const mockReadyEnabledMOTPToken = new Token(4, 'serial', Fixtures.tokenTypeDetails[TokenType.MOTP], true, 'desc');
mockReadyEnabledToken.enrollmentStatus = EnrollmentStatus.COMPLETED;


describe('OperationsService', () => {
  let operationsService: OperationsService;

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
      ],
    });

    operationsService = TestBed.inject(OperationsService);
  });

  it('should be created', inject([OperationsService], (service: OperationsService) => {
    expect(service).toBeTruthy();
  }));

  describe('set token pin', () => {
    const setPinRequestBody = { userpin: '01234', serial: 'serial', session: session };
    it('should send a pin request', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        operationsService.setPin(mockReadyEnabledToken, '01234').subscribe(res => {
          expect(res).toEqual(true);
        });

        const req = backend.expectOne({
          url: '/userservice/setpin',
          method: 'POST'
        });

        expect(req.request.body).toEqual(setPinRequestBody);
        req.flush({ result: { value: { 'set userpin': 1 } } });

        backend.verify();
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

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

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));
  });

  describe('set mOTP pin', () => {
    const setPinRequestBody = { pin: '01234', serial: 'serial', session: session };
    it('should send a mOTP pin request', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        operationsService.setMOTPPin(mockReadyEnabledMOTPToken, '01234').subscribe(res => {
          expect(res).toEqual(true);
        });

        const req = backend.expectOne({
          url: '/userservice/setmpin',
          method: 'POST'
        });

        expect(req.request.body).toEqual(setPinRequestBody);
        req.flush({ result: { value: { 'set userpin': 1 } } });

        backend.verify();
      })
    ));

    it('should not call the backend if the token is not an mOTP token', async(
      inject([HttpClient], (http: HttpClient) => {
        spyOn(http, 'post');

        operationsService.setMOTPPin(mockReadyEnabledToken, '01234').subscribe(response => {
          expect(response).toEqual(false);
          expect(http.post).not.toHaveBeenCalled();
        });
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

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

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));
  });

  describe('delete token', () => {
    const deleteRequestBody = { serial: 'serial', session: session };
    it('should send a delete request', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        operationsService.deleteToken('serial').subscribe();

        const req = backend.expectOne({
          url: '/userservice/delete',
          method: 'POST'
        });

        expect(req.request.body).toEqual(deleteRequestBody);
        backend.verify();
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        operationsService.deleteToken('serial').subscribe();
        const deleteRequest = backend.expectOne({
          url: '/userservice/delete',
          method: 'POST'
        });

        deleteRequest.error(new ErrorEvent('Error deleting token'));
        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));
  });

  describe('unassign token', () => {
    const unassignRequestBody = { serial: 'serial', session: session };

    it('should send an unassign request and return observable of true on success', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        operationsService.unassignToken('serial').subscribe(res => {
          expect(res).toEqual(true);
        });

        const req = backend.expectOne({
          url: '/userservice/unassign',
          method: 'POST'
        });

        req.flush({ result: { value: { 'unassign token': true } } });

        expect(req.request.body).toEqual(unassignRequestBody);
        backend.verify();
      })
    ));

    it('should send an unassign request and return observable of false on failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        operationsService.unassignToken('serial').subscribe(res => {
          expect(res).toEqual(false);
        });

        const req = backend.expectOne({
          url: '/userservice/unassign',
          method: 'POST'
        });

        req.flush({ result: { value: { 'unassign token': false } } });

        expect(req.request.body).toEqual(unassignRequestBody);
        backend.verify();
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

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

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));
  });

  describe('enable token', () => {
    const enableRequestBody = { serial: mockReadyDisabledToken.serial, session: session };
    it('should send a enable token request', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        operationsService.enable(mockReadyDisabledToken).subscribe(res => {
          expect(res).toEqual(true);
        });

        const req = backend.expectOne({
          url: '/userservice/enable',
          method: 'POST'
        });

        expect(req.request.body).toEqual(enableRequestBody);
        req.flush({ result: { value: { 'enable token': 1 } } });

        backend.verify();
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        operationsService.enable(mockReadyDisabledToken).subscribe();
        const enableRequest = backend.expectOne({
          url: '/userservice/enable',
          method: 'POST'
        });

        enableRequest.error(new ErrorEvent('Error enabling token'));
        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));
  });

  describe('disable token', () => {
    const disableRequestBody = { serial: mockReadyEnabledToken.serial, session: session };
    it('should send a disable token request', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        operationsService.disable(mockReadyEnabledToken).subscribe(res => {
          expect(res).toEqual(true);
        });

        const req = backend.expectOne({
          url: '/userservice/disable',
          method: 'POST'
        });

        expect(req.request.body).toEqual(disableRequestBody);
        req.flush({ result: { value: { 'disable token': 1 } } });

        backend.verify();
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        operationsService.disable(mockReadyEnabledToken).subscribe();
        const disableRequest = backend.expectOne({
          url: '/userservice/disable',
          method: 'POST'
        });

        disableRequest.error(new ErrorEvent('Error disabling token'));
        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));
  });

  describe('resetFailcounter', () => {
    it('should request a failcounter reset from the server', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        operationsService.resetFailcounter('serial').subscribe(response => {
          expect(response).toEqual(true);
        });

        const request = backend.expectOne((req) => req.url === '/userservice/reset' && req.method === 'POST');

        request.flush({ result: { status: true, value: { 'reset Failcounter': 1 } } });
        backend.verify();
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        operationsService.resetFailcounter('serial').subscribe(response => {
          expect(response).toEqual(false);
        });

        const request = backend.expectOne((req) => req.url === '/userservice/reset' && req.method === 'POST');

        request.error(new ErrorEvent('Error resetting failcounter'));
        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));

  });

  describe('resync', () => {
    it('should request a token resync from the server', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        operationsService.resync('serial', 'otp1', 'otp2').subscribe(response => {
          expect(response).toEqual(true);
        });

        const request = backend.expectOne((req) => req.url === '/userservice/resync' && req.method === 'POST');

        request.flush({ result: { status: true, value: { 'resync Token': true } } });
        backend.verify();
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        operationsService.resync('serial', 'otp1', 'otp2').subscribe(response => {
          expect(response).toEqual(false);
        });

        const request = backend.expectOne((req) => req.url === '/userservice/resync' && req.method === 'POST');

        request.error(new ErrorEvent('Error resyncing token'));
        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));
  });

  describe('setDescription', () => {
    it('should request setting a token description from the server', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        operationsService.setDescription('serial', 'description').subscribe(response => {
          expect(response).toEqual({ success: true });
        });

        const request = backend.expectOne((req) => req.url === '/userservice/setdescription' && req.method === 'POST');

        request.flush({ result: { status: true, value: { 'set description': true } } });
        backend.verify();
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        operationsService.setDescription('serial', 'description').subscribe(response => {
          expect(response).toEqual({ success: false });
        });

        const request = backend.expectOne((req) => req.url === '/userservice/setdescription' && req.method === 'POST');

        request.error(new ErrorEvent('Error setting token description'));
        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));
  });


});
