import { TestBed, inject } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AuthService } from './auth.service';

import { AuthGuard } from './auth-guard.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, RouterStateSnapshot } from '@angular/router';

class AuthServiceMock {
  isLoggedIn = jasmine.createSpy('isLoggedIn')
}

let mockSnapshot: any = jasmine.createSpyObj<RouterStateSnapshot>("RouterStateSnapshot", ['toString']);

describe('AuthService', () => {

  let authService: AuthServiceMock;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useClass: AuthServiceMock
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

  it('should be able to load route if user is logged in', inject([AuthGuard], (service: AuthGuard) => {
    authService.isLoggedIn.and.returnValue(true);
    const routerNavigateSpy = spyOn(router, 'navigate');

    const result = service.canActivate(null, mockSnapshot);

    expect(result).toBe(true);
    expect(routerNavigateSpy).not.toHaveBeenCalled();
  }));

  it('should prevent loading the route if user is not logged in', inject([AuthGuard], (service: AuthGuard) => {
    authService.isLoggedIn.and.returnValue(false);

    const result = service.canActivate(null, mockSnapshot);

    expect(result).toBe(false);
  }));

  it('should redirect the user to login if not logged in', inject([AuthGuard], (service: AuthGuard) => {
    authService.isLoggedIn.and.returnValue(false);
    const routerNavigateSpy = spyOn(router, 'navigate');

    service.canActivate(null, mockSnapshot);

    expect(routerNavigateSpy).toHaveBeenCalled();
  }));
});
