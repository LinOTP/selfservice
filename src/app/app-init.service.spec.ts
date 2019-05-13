import { TestBed } from '@angular/core/testing';
import { spyOnClass } from '../testing/spyOnClass';

import { NgxPermissionsService } from 'ngx-permissions';
import { Permission } from './common/permissions';
import { AppInitService } from './app-init.service';

describe('AppInitService', () => {
  let appInitService: AppInitService;

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
    appInitService = TestBed.get(AppInitService);
  });

  it('should be created', () => {
    expect(appInitService).toBeTruthy();
  });

  it('should load previously stored permissions', () => {
    spyOn(localStorage, 'getItem').and.returnValue(
      JSON.stringify([Permission.ENROLLHOTP, Permission.SETPIN])
    );

    appInitService.init();

    expect(TestBed.get(NgxPermissionsService).loadPermissions)
      .toHaveBeenCalledWith([Permission.ENROLLHOTP, Permission.SETPIN]);
  });

  it('should load an empty permission set without previously stored permissions', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);

    appInitService.init();

    expect(TestBed.get(NgxPermissionsService).loadPermissions)
      .toHaveBeenCalledWith([]);
  });
});
