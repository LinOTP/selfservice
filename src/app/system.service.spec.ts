import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExampleAPIResponses, Fixtures } from '../testing/fixtures';
import { spyOnClass } from '../testing/spyOnClass';

import { HttpClient } from '@angular/common/http';

import { SystemService } from './system.service';
import { SessionService } from './auth/session.service';

describe('SystemService', () => {
  let service: SystemService;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
    ],
    providers: [
      SystemService,
      { provide: SessionService, useValue: spyOnClass(SessionService) },
    ]
  }));

  beforeEach(() => {
    service = TestBed.get(SystemService);
    TestBed.get(SessionService).getSession.and.returnValue('');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSystemInfo', () => {
    it('should fetch the /userservice/pre_context from backend', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        service.getSystemInfo().subscribe((response) => { });
        const permissionsRequest = backend.expectOne((req) => req.url === '/userservice/pre_context' && req.method === 'GET');
        permissionsRequest.flush(ExampleAPIResponses.userservice_pre_context);
      })
    ));

    it('should parse the realms list', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        service.getSystemInfo().subscribe((systemInfo) => {
          expect(typeof systemInfo.realms).toEqual('object');
          expect(systemInfo.realms.ExampleRealm).toEqual(
            jasmine.objectContaining({
              default: false,
              realmname: 'exampleRealm',
              useridresolver: ['example-resolver'],
              entry: ''
            })
          );
        });
        const permissionsRequest = backend.expectOne((req) => req.url === '/userservice/pre_context' && req.method === 'GET');
        permissionsRequest.flush(ExampleAPIResponses.userservice_pre_context);
      })
    ));
  });

  describe('getUserSystemInfo', () => {
    it('should fetch the /userservice/context from backend', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        service.getUserSystemInfo().subscribe((response) => { });
        const permissionsRequest = backend.expectOne((req) => req.url === '/userservice/context' && req.method === 'GET');
        permissionsRequest.flush(ExampleAPIResponses.userservice_context);
      })
    ));

    it('should parse the realms list', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        service.getUserSystemInfo().subscribe((systemInfo) => {
          expect(typeof systemInfo.realms).toEqual('object');
          expect(systemInfo.realms.ExampleRealm).toEqual(
            jasmine.objectContaining({
              default: false,
              realmname: 'exampleRealm',
              useridresolver: ['example-resolver'],
              entry: ''
            })
          );
        });
        const permissionsRequest = backend.expectOne((req) => req.url === '/userservice/context' && req.method === 'GET');
        permissionsRequest.flush(ExampleAPIResponses.userservice_context);
      })
    ));

    it('should map policy actions to permissions', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        service.getUserSystemInfo().subscribe((systemInfo) => {
          expect(systemInfo.permissions).toEqual(Fixtures.permissionList);
        });
        const permissionsRequest = backend.expectOne((req) => req.url === '/userservice/context' && req.method === 'GET');
        permissionsRequest.flush(ExampleAPIResponses.userservice_context);
      })
    ));

    it('should not map unrecognized policies to permissions', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {

        service.getUserSystemInfo().subscribe(systemInfo => {
          expect(systemInfo.permissions).toEqual([]);
        });

        const userserviceContextRequest = backend.expectOne((req) => req.url === '/userservice/context' && req.method === 'GET');
        userserviceContextRequest.flush(
          { ...ExampleAPIResponses.userservice_context, actions: ['fake policy'] }
        );
      })
    ));
  });

});
