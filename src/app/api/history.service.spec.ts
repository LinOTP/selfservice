import { TestBed, inject } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { HistoryFixtures } from '@testing/fixtures';

import { SessionService } from '@app/auth/session.service';
import { HistoryService } from './history.service';
import { NotificationService } from '@common/notification.service';
import { spyOnClass, getInjectedStub } from '@testing/spyOnClass';

const session = '';

describe('HistoryService', () => {
  let historyService: HistoryService;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HistoryService,
        {
          provide: SessionService,
          useValue: {
            getSession: jasmine.createSpy('getSession').and.returnValue(session),
          }
        },
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService),
        }
      ],
    });

    historyService = TestBed.inject(HistoryService);
    notificationService = getInjectedStub(NotificationService);
  });

  it('should be created', inject([HistoryService], (service: HistoryService) => {
    expect(service).toBeTruthy();
  }));

  describe('getTokens', () => {
    it('should request tokens from the server', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        historyService.getHistory(HistoryFixtures.mockRequestOptions).subscribe(response => {
          expect(response).toEqual(HistoryFixtures.mockPage);
        });

        const historyRequest = backend.expectOne((req) =>
          req.url === '/userservice/history' &&
          req.method === 'GET');

        historyRequest.flush(HistoryFixtures.mockResponse);
        backend.verify();
      }
    ));

    it('should call the error handler on request failure', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        historyService.getHistory(HistoryFixtures.mockRequestOptions).subscribe(response => {
          expect(response).toEqual(null);
        });

        const historyRequest = backend.expectOne((req) => req.url === '/userservice/history' && req.method === 'GET');

        historyRequest.error(new ErrorEvent('Error loading history'));
        backend.verify();

        expect(notificationService.message).toHaveBeenCalledWith('Error: fetching history failed. Please try again');
      }
    ));

  });

});
