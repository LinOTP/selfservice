import { TestBed, async, inject } from '@angular/core/testing';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { I18nMock } from '../../testing/i18n-mock-provider';

import { SessionService } from '../auth/session.service';
import { TestService, ReplyMode } from './test.service';

const session = '';

describe('TestService', () => {
  let testService: TestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TestService,
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

    testService = TestBed.inject(TestService);
  });

  it('should be created', inject([TestService], (service: TestService) => {
    expect(service).toBeTruthy();
  }));

  describe('testToken', () => {
    it('should catch an API error', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        const otp_options = { serial: 'serial', otp: 'otp' };

        testService.testToken(otp_options).subscribe(result => {
          expect(result).toEqual(null);
        });

        const req = backend.expectOne({
          url: '/userservice/verify',
          method: 'POST'
        });

        req.flush({
          result: {
            status: false,
            value: false,
          }
        });

        backend.verify();
      })
    ));
  });

  describe('testToken verifying OTP', () => {
    const testRequestBody = { serial: 'serial', otp: 'otp', session: session };

    it('should send a verify request', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        const otp_options = { serial: 'serial', otp: 'otp' };

        testService.testToken(otp_options).subscribe(result => {
          expect(result).toEqual(true);
        });

        const req = backend.expectOne({
          url: '/userservice/verify',
          method: 'POST'
        });

        req.flush({
          result: {
            status: true,
            value: true,
          }
        });

        expect(req.request.body).toEqual(testRequestBody);
        backend.verify();
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        spyOn(console, 'error');

        const otp_options = { serial: 'serial', otp: 'otp' };

        testService.testToken(otp_options).subscribe();
        const testRequest = backend.expectOne({
          url: '/userservice/verify',
          method: 'POST'
        });

        testRequest.error(new ErrorEvent('Error testing token'));
        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));
  });

  describe('testToken triggering a transaction', () => {
    const testRequestBody = { serial: 'serial', session: session };

    it('should send a verify request', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        const otp_options = { serial: 'serial' };

        testService.testToken(otp_options).subscribe(result => {
          expect(result).toEqual({ replyMode: [ReplyMode.ONLINE], transactionId: 'txid' });
        });

        const req = backend.expectOne({
          url: '/userservice/verify',
          method: 'POST'
        });

        req.flush({
          result: {
            status: true,
            value: false,
          },
          detail: {
            replyMode: ['online'],
            transactionId: 'txid',
          }
        });

        expect(req.request.body).toEqual(testRequestBody);
        backend.verify();
      })
    ));
  });

  describe('testToken verifying OTP in transaction mode', () => {
    const testRequestBody = { serial: 'serial', otp: 'otp', transactionid: 'txid', session: session };

    it('should send a verify request', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        const otp_options = { serial: 'serial', otp: 'otp', transactionid: 'txid' };

        testService.testToken(otp_options).subscribe(result => {
          expect(result).toEqual(true);
        });

        const req = backend.expectOne({
          url: '/userservice/verify',
          method: 'POST'
        });

        req.flush({
          result: {
            status: true,
            value: true,
          }
        });

        expect(req.request.body).toEqual(testRequestBody);
        backend.verify();
      })
    ));
  });

});
