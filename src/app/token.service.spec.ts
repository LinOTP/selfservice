import { TestBed, async, inject } from '@angular/core/testing';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { TokenService } from './token.service';
import { Token } from './token';

describe('TokenService', () => {
  let tokenService: TokenService;
  let httpClient: HttpClientTestingModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TokenService]
    });

    tokenService = TestBed.get(TokenService);
    httpClient = TestBed.get(HttpTestingController);
  });

  it('should be created', inject([TokenService], (service: TokenService) => {
    expect(service).toBeTruthy();
  }));

  describe('getTokens', () => {
    const mockData = [{ 'id': 'abc', 'type': 'foo' }];
    it('should request tokens from the server', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        tokenService.getTokens().subscribe(response => {
          expect(response).toEqual(mockData);
        });
        const tokenListRequest = backend.expectOne({
          url: '/api/tokens/',
          method: 'GET'
        });

        tokenListRequest.flush(mockData);
        backend.verify();
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        tokenService.getTokens().subscribe(response => {
          expect(response).toEqual([]);
        });
        const tokenListRequest = backend.expectOne({
          url: '/api/tokens/',
          method: 'GET'
        });

        tokenListRequest.error(new ErrorEvent('Error loading token list'));
        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));

  });

  describe('getToken', () => {
    const mockData = new Token('testId', 'testType');
    it('should request a token from the server', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        tokenService.getToken(mockData.id).subscribe(response => {
          expect(response).toBe(mockData);
        });
        const tokenListRequest = backend.expectOne({
          url: `/api/tokens/${mockData.id}`,
          method: 'GET'
        });

        tokenListRequest.flush(mockData);
        backend.verify();
      })
    ));
  });

  describe('set token pin', () => {
    const pinObject = {
      'pin': {
        'currentValue': null,
        'newValue': '01234'
      }
    };
    it('should send a pin request', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        tokenService.setPin(1, null, '01234').subscribe();
        const req = backend.expectOne({
          url: '/api/tokens/1/pin',
          method: 'PUT'
        });
        expect(req.request.body).toEqual(pinObject);
        backend.verify();
      })
    ));

    it('should call the error handler on request failure', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        spyOn(console, 'error');

        tokenService.setPin(1, null, '01234').subscribe(response => {
          expect(response).toEqual(null);
        });
        const setPinRequest = backend.expectOne({
          url: '/api/tokens/1/pin',
          method: 'PUT'
        });

        setPinRequest.error(new ErrorEvent('Error setting token pin'));
        backend.verify();

        expect(console.error).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
      })
    ));
  });
});
