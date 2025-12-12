import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CookieService } from 'ngx-cookie';

import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { SessionService } from './session.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SessionService', () => {
  let sessionService: SessionService;
  let cookieService: jasmine.SpyObj<CookieService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [
        SessionService,
        {
            provide: CookieService,
            useValue: spyOnClass(CookieService),
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
  });

  beforeEach(() => {
    sessionService = TestBed.inject(SessionService);
    cookieService = getInjectedStub(CookieService);
  });

  it('should be created', () => {
    expect(sessionService).toBeTruthy();
  });

  it('reports users as logged in only if user data was written after login was finalized', () => {
    const localStorageSpy = spyOn(localStorage, 'getItem');
    const cases: [string, string, boolean][] = [
      [null, undefined, false],
      [null, 'session', false],
      [JSON.stringify(true), undefined, false],
      [JSON.stringify(true), 'session', true],
    ];

    cases.forEach(([userInfo, sessionCookie, expected]) => {
      localStorageSpy.and.returnValue(userInfo);
      cookieService.get.and.returnValue(sessionCookie);
      //
      expect(sessionService.isLoggedIn()).toBe(expected);
    });

  });
});
