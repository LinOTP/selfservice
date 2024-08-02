import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { of } from 'rxjs';

import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { SessionService } from '@app/auth/session.service';
import { LoginService } from '@app/login/login.service';

import { AppInitService } from './app-init.service';
import { CustomContentService } from './custom-content/custom-content.service';

describe('AppInitService', () => {
  let appInitService: AppInitService;
  let loginService: jasmine.SpyObj<LoginService>;
  let sessionService: jasmine.SpyObj<SessionService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LoginService,
          useValue: spyOnClass(LoginService)
        },
        {
          provide: SessionService,
          useValue: spyOnClass(SessionService)
        },
        {
          provide: CustomContentService,
          useClass: CustomContentServiceStub
        }
      ],
    });
  });

  beforeEach(() => {
    appInitService = TestBed.inject(AppInitService);
    loginService = getInjectedStub(LoginService);
    sessionService = getInjectedStub(SessionService);

    loginService.refreshUserSystemInfo.and.returnValue(of());
  });

  it('should be created', () => {
    expect(appInitService).toBeTruthy();
  });

  it('should load previously stored permissions and request new permissions if user is logged in', fakeAsync(() => {
    sessionService.isLoggedIn.and.returnValue(true);
    appInitService.init();

    expect(loginService.loadStoredPermissions).toHaveBeenCalled();
    expect(loginService.refreshUserSystemInfo).not.toHaveBeenCalled();
    tick();
    expect(loginService.refreshUserSystemInfo).toHaveBeenCalled();
  }));

  it('should not load permissions if user is not logged in', fakeAsync(() => {
    sessionService.isLoggedIn.and.returnValue(false);
    appInitService.init();

    expect(loginService.loadStoredPermissions).not.toHaveBeenCalled();
    tick();
    expect(loginService.refreshUserSystemInfo).not.toHaveBeenCalled();
  }));
});

class CustomContentServiceStub {
  customContentLoaded$ = of(true);
  page$ = of({ route: 'test-route' });

  loadContent() {}
}