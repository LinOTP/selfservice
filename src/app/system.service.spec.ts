import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';

import { ExampleAPIResponses, Fixtures } from '@testing/fixtures';
import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { SessionService } from './auth/session.service';
import { SystemService } from './system.service';

describe('SystemService', () => {
  let service: SystemService;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [],
    providers: [
        SystemService,
        { provide: SessionService, useValue: spyOnClass(SessionService) },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}));

  beforeEach(() => {
    service = TestBed.inject(SystemService);
    getInjectedStub(SessionService).getSession.and.returnValue('');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSystemInfo', () => {
    it('should fetch the /userservice/pre_context from backend', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        service.getSystemInfo$().subscribe((response) => { });
        const permissionsRequest = backend.expectOne((req) => req.url === '/userservice/pre_context' && req.method === 'GET');
        permissionsRequest.flush(ExampleAPIResponses.userservice_pre_context);
      }
    ));

    it('should parse the realms list', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        service.getSystemInfo$().subscribe((systemInfo) => {
          expect(typeof systemInfo.realms).toEqual('object');
          expect(systemInfo.realms.ExampleRealm).toEqual(
            jasmine.objectContaining({
              default: false,
              realmname: 'exampleRealm',
            })
          );
        });
        const permissionsRequest = backend.expectOne((req) => req.url === '/userservice/pre_context' && req.method === 'GET');
        permissionsRequest.flush(ExampleAPIResponses.userservice_pre_context);
      }
    ));
  });

  describe('getUserSystemInfo', () => {
    it('should fetch the /userservice/context from backend', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        service.getUserSystemInfo().subscribe((response) => { });
        const permissionsRequest = backend.expectOne((req) => req.url === '/userservice/context' && req.method === 'GET');
        permissionsRequest.flush(ExampleAPIResponses.userservice_context);
      }
    ));

    it('should parse the realms list', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        service.getUserSystemInfo().subscribe((systemInfo) => {
          expect(typeof systemInfo.realms).toEqual('object');
          expect(systemInfo.realms.ExampleRealm).toEqual(
            jasmine.objectContaining({
              default: false,
              realmname: 'exampleRealm',
            })
          );
        });
        const permissionsRequest = backend.expectOne((req) => req.url === '/userservice/context' && req.method === 'GET');
        permissionsRequest.flush(ExampleAPIResponses.userservice_context);
      }
    ));

    it('should map policy actions to permissions', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {
        service.getUserSystemInfo().subscribe((systemInfo) => {
          expect(systemInfo.permissions).toEqual(Fixtures.permissionList);
        });
        const permissionsRequest = backend.expectOne((req) => req.url === '/userservice/context' && req.method === 'GET');
        permissionsRequest.flush(ExampleAPIResponses.userservice_context);
      }
    ));

    it('should not map unrecognized policies to permissions', inject(
      [HttpClient, HttpTestingController],
      (http: HttpClient, backend: HttpTestingController) => {

        service.getUserSystemInfo().subscribe(systemInfo => {
          expect(systemInfo.permissions).toEqual([]);
        });

        const userserviceContextRequest = backend.expectOne((req) => req.url === '/userservice/context' && req.method === 'GET');
        const context = ExampleAPIResponses.userservice_context;
        context.detail.actions = ['fake policy'];
        userserviceContextRequest.flush(context);
      }
    ));
  });

  it('should provide a list of available locales', () => {
    expect(service.getLocales()).toEqual([
      { id: 'en', name: 'English', shortName: 'EN' },
      { id: 'de', name: 'Deutsch', shortName: 'DE' },
    ]);
  });

});
