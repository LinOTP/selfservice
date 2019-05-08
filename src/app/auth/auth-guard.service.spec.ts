import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { spyOnClass } from '../../testing/spyOnClass';

import { Router, RouterStateSnapshot } from '@angular/router';

import { AuthService } from './auth.service';

import { AuthGuard } from './auth-guard.service';

describe('AuthService', () => {

  const routeSnapshot = spyOnClass(RouterStateSnapshot);

  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: spyOnClass(AuthService)
        },
      ],
    });
  });

  beforeEach(() => {
    authService = TestBed.get(AuthService);
    router = TestBed.get(Router);
  });

  it('should be created', inject([AuthGuard], (service: AuthGuard) => {
    expect(service).toBeTruthy();
  }));

  // run tests for route and child route activator
  for (const method of ['canActivate', 'canActivateChild']) {
    describe(method, () => {

      it('should be able to load route if user is logged in', inject([AuthGuard], (service: AuthGuard) => {
        authService.isLoggedIn.and.returnValue(true);

        const result = service[method](null, routeSnapshot);

        expect(result).toBe(true);
        expect(authService.handleLogout).not.toHaveBeenCalled();
      }));

      it('should prevent loading the route if user is not logged in', inject([AuthGuard], (service: AuthGuard) => {
        authService.isLoggedIn.and.returnValue(false);

        const result = service[method](null, routeSnapshot);

        expect(result).toBe(false);
      }));

      it('should let the authService handle the closed seesion if the user is not logged in', inject([AuthGuard], (service: AuthGuard) => {
        authService.isLoggedIn.and.returnValue(false);

        service[method](null, routeSnapshot);

        expect(authService.handleLogout).toHaveBeenCalledTimes(1);
      }));

    });
  }

});
