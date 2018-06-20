import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { spyOnClass } from '../../testing/spyOnClass';

import { Router, RouterStateSnapshot, Route } from '@angular/router';

import { AuthService } from './auth.service';

import { AuthGuard } from './auth-guard.service';

describe('AuthService', () => {

  const routeSnapshot = spyOnClass(RouterStateSnapshot);

  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;
  let routerNavigateSpy: jasmine.Spy;

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
    routerNavigateSpy = spyOn(router, 'navigate');
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
        expect(routerNavigateSpy).not.toHaveBeenCalled();
      }));

      it('should prevent loading the route if user is not logged in', inject([AuthGuard], (service: AuthGuard) => {
        authService.isLoggedIn.and.returnValue(false);

        const result = service[method](null, routeSnapshot);

        expect(result).toBe(false);
      }));

      it('should redirect the user to /login if not logged in', inject([AuthGuard], (service: AuthGuard) => {
        authService.isLoggedIn.and.returnValue(false);

        service[method](null, routeSnapshot);

        expect(routerNavigateSpy).toHaveBeenCalledTimes(1);
        expect(routerNavigateSpy.calls.argsFor(0)).toContain(['/login']);
      }));

    });
  }

});
