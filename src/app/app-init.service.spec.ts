import { TestBed } from '@angular/core/testing';


import { spyOnClass, getInjectedStub } from '../testing/spyOnClass';

import { AppInitService } from './app-init.service';
import { LoginService } from './login/login.service';

describe('AppInitService', () => {
  let appInitService: AppInitService;
  let loginService: jasmine.SpyObj<LoginService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LoginService,
          useValue: spyOnClass(LoginService)
        },
      ],
    });
  });

  beforeEach(() => {
    appInitService = TestBed.inject(AppInitService);
    loginService = getInjectedStub(LoginService);
  });

  it('should be created', () => {
    expect(appInitService).toBeTruthy();
  });

  it('should load previously stored permissions', () => {
    appInitService.init();

    expect(loginService.loadStoredPermissions).toHaveBeenCalled();
  });
});
