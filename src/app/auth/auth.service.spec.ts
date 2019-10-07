import { TestBed, inject, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { spyOnClass } from '../../testing/spyOnClass';
import { Fixtures } from '../../testing/fixtures';

import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie';
import { NgxPermissionsService } from 'ngx-permissions';
import { SystemService } from '../system.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let authService: AuthService;
  let permissionsService: NgxPermissionsService;
  let systemService: jasmine.SpyObj<SystemService>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        AuthService,
        {
          provide: NgxPermissionsService,
          useValue: spyOnClass(NgxPermissionsService),
        },
        {
          provide: CookieService,
          useValue: spyOnClass(CookieService),
        },
        {
          provide: SystemService,
          useValue: spyOnClass(SystemService),
        },
      ],
    });
  });

  beforeEach(() => {
    authService = TestBed.get(AuthService);
    permissionsService = TestBed.get(NgxPermissionsService);
    router = TestBed.get(Router);

    systemService = TestBed.get(SystemService);
    systemService.getUserSystemInfo.and.returnValue(of(Fixtures.userSystemInfo));
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  describe('refreshPermissions', () => {

    it('should set the permissions in local storage', () => {
      spyOn(localStorage, 'setItem');
      const permissions = Fixtures.permissionList;
      systemService.getUserSystemInfo.and.returnValue(of({ permissions: permissions }));

      authService.refreshPermissions().subscribe(() => {
        expect(permissionsService.loadPermissions).toHaveBeenCalledWith(permissions);
        expect(localStorage.setItem).toHaveBeenCalledWith('permissions', JSON.stringify(permissions));
      });
    });
  });

  describe('handleLogout', () => {

    it('should flush permissions and remove them from local storage', () => {
      spyOn(localStorage, 'removeItem');

      authService.handleLogout(false);

      expect(localStorage.removeItem).toHaveBeenCalledWith('permissions');
      expect(permissionsService.flushPermissions).toHaveBeenCalled();
    });

    it('should emit a loginChange event', () => {
      const emitterSpy = spyOn(authService._loginChangeEmitter, 'emit');
      authService.handleLogout(false);

      expect(emitterSpy).toHaveBeenCalledWith(false);
    });

    it('should not set redirect param for the login route', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        const routerSpy = spyOn(router, 'navigate');

        authService.handleLogout(false);

        expect(routerSpy).toHaveBeenCalledWith(['/login'], {});
      })
    ));

    it('should set redirect param for the login route', async(
      inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
        const routerSpy = spyOn(router, 'navigate');

        authService.handleLogout(true);

        const navExtras = { queryParams: { redirect: router.url } };
        expect(routerSpy).toHaveBeenCalledWith(['/login'], navExtras);
      })
    ));
  });
});
