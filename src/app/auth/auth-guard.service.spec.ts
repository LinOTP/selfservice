import { RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TestBed, inject } from '@angular/core/testing';

import { spyOnClass, getInjectedStub } from '@testing/spyOnClass';

import { LoginService } from '@app/login/login.service';
import { SessionService } from './session.service';
import { AuthGuard } from './auth-guard.service';

describe('AuthGuard', () => {

  const routeSnapshot = spyOnClass(RouterStateSnapshot);

  let loginService: jasmine.SpyObj<LoginService>;
  let sessionService: jasmine.SpyObj<SessionService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      providers: [
        AuthGuard,
        {
          provide: LoginService,
          useValue: spyOnClass(LoginService)
        },
        {
          provide: SessionService,
          useValue: spyOnClass(SessionService)
        },
      ],
    });
  });

  beforeEach(() => {
    loginService = getInjectedStub(LoginService);
    sessionService = getInjectedStub(SessionService);
  });

  it('should be created', inject([AuthGuard], (service: AuthGuard) => {
    expect(service).toBeTruthy();
  }));

  // run tests for route and child route activator
  for (const method of ['canActivate', 'canActivateChild']) {
    describe(method, () => {

      it('should be able to load route if user is logged in', inject([AuthGuard], (service: AuthGuard) => {
        sessionService.isLoggedIn.and.returnValue(true);

        const result = service[method](null, routeSnapshot);

        expect(result).toBe(true);
        expect(loginService.handleLogout).not.toHaveBeenCalled();
      }));

      it('should prevent loading the route if user is not logged in', inject([AuthGuard], (service: AuthGuard) => {
        sessionService.isLoggedIn.and.returnValue(false);

        const result = service[method](null, routeSnapshot);

        expect(result).toBe(false);
      }));

      it('should let the authService handle the closed seesion if the user is not logged in',
        inject([AuthGuard], (service: AuthGuard) => {
          sessionService.isLoggedIn.and.returnValue(false);

          service[method](null, routeSnapshot);

          expect(loginService.handleLogout).toHaveBeenCalledTimes(1);
        }));

    });
  }

});
