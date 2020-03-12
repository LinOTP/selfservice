import { TestBed, async, inject } from '@angular/core/testing';
import { Fixtures } from '../../testing/fixtures';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TestService } from './test.service';
import { SessionService } from '../auth/session.service';
import { I18nMock } from '../../testing/i18n-mock-provider';

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

    testService = TestBed.get(TestService);
  });

  it('should be created', inject([TestService], (service: TestService) => {
    expect(service).toBeTruthy();
  }));

  describe('testToken', () => {
    const testRequestBody = { serial: 'serial', otp: 'otp', session: session };
    it('should send a verify request', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        testService.testToken('serial', 'otp').subscribe();

        const req = backend.expectOne({
          url: '/userservice/verify',
          method: 'POST'
        });

        expect(req.request.body).toEqual(testRequestBody);
        backend.verify();
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        testService.testToken('serial', 'otp').subscribe();
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

});
