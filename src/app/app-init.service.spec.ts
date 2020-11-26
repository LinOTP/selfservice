import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { NgxPermissionsService } from 'ngx-permissions';

import { spyOnClass, getInjectedStub } from '../testing/spyOnClass';

import { Permission } from './common/permissions';
import { AppInitService } from './app-init.service';

describe('AppInitService', () => {
  let appInitService: AppInitService;
  let ngxPermissionsService: jasmine.SpyObj<NgxPermissionsService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: NgxPermissionsService,
          useValue: spyOnClass(NgxPermissionsService)
        }
      ],
    });
  });

  beforeEach(() => {
    appInitService = TestBed.inject(AppInitService);
    ngxPermissionsService = getInjectedStub(NgxPermissionsService);
  });

  it('should be created', () => {
    expect(appInitService).toBeTruthy();
  });

  it('should load previously stored permissions', () => {
    spyOn(localStorage, 'getItem').and.returnValue(
      JSON.stringify([Permission.ENROLLHOTP, Permission.SETPIN])
    );

    appInitService.init();

    expect(ngxPermissionsService.loadPermissions).toHaveBeenCalledWith([Permission.ENROLLHOTP, Permission.SETPIN]);
  });

  it('should load an empty permission set without previously stored permissions', () => {
    spyOn(localStorage, 'getItem').and.returnValue('[]');

    appInitService.init();

    expect(ngxPermissionsService.loadPermissions).toHaveBeenCalledWith([]);
  });

  describe('clearPermissions', () => {
    it('should clear the list of permissions and set the permissions as not loaded', fakeAsync(() => {
      appInitService.clearPermissions();
      tick();
      appInitService.getPermissionLoad$().subscribe(res => {
        expect(res).toEqual(false);
      });
      expect(ngxPermissionsService.flushPermissions).toHaveBeenCalled();
    }));
  });
});
