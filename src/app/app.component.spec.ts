import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { BehaviorSubject, of, ReplaySubject, Subject } from 'rxjs';

import { Fixtures } from '@testing/fixtures';
import { MockComponent } from '@testing/mock-component';
import { TestingPage } from '@testing/page-helper';
import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { LoginService } from '@app/login/login.service';
import { MaterialModule } from '@app/material.module';
import { SystemService, UserSystemInfo } from '@app/system.service';
import { NotificationService } from '@common/notification.service';
import { NgxPermissionsAllowStubDirective, NgxPermissionsService } from 'ngx-permissions';

import { CustomContentService } from './custom-content/custom-content.service';
import { SelfServiceContextService } from './selfservice-context.service';

import { AppComponent } from './app.component';
import { BootstrapBreakpointService } from './bootstrap-breakpoints.service';
import { HasCustomContentMockDirective } from './custom-content/has-custom-content.directive.mock';
import { FromBreakpointPipe } from './from-breakpoint.pipe';

class Page extends TestingPage<AppComponent> {
  public getToolbar() {
    return this.query('mat-toolbar');
  }

  public getNavigation() {
    return this.query('nav');
  }

  public getUserNameValue() {
    return this.query('.user-info .name')?.textContent?.trim();
  }

  public getUserRealmValue() {
    return this.query('.user-info .realm')?.textContent?.trim();
  }
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let page: Page;

  let loginService: jasmine.SpyObj<LoginService>;
  let loginChangeSubject: Subject<UserSystemInfo['user']>;
  let permissionLoadSubject: Subject<boolean>;
  let systemService: jasmine.SpyObj<SystemService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let selfServiceContextService: SelfServiceContextService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MaterialModule,
        NgxPermissionsAllowStubDirective,
        HasCustomContentMockDirective,
        MockComponent({ selector: 'app-language-picker' }),
        MockComponent({ selector: 'app-theme-picker' }),
        FromBreakpointPipe
      ],
      declarations: [
        AppComponent,
      ],
      providers: [
        {
            provide: NgxPermissionsService,
            useValue: spyOnClass(NgxPermissionsService),
        },
        {
          provide: LoginService,
          useValue: spyOnClass(LoginService),
        },
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService),
        },
        {
          provide: SystemService,
          useValue: spyOnClass(SystemService),
        },
        {
          provide: CustomContentService,
          useValue: spyOnClass(CustomContentService),
        },
        {
          provide: BootstrapBreakpointService,
          useValue: {
            breakpoint$: of(5),
            currentBreakpoint: 5
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    loginService = getInjectedStub(LoginService);
    systemService = getInjectedStub(SystemService);
    notificationService = getInjectedStub(NotificationService);
    selfServiceContextService = TestBed.inject(SelfServiceContextService);

    loginService.logout.and.returnValue(of(null));
    systemService.getSystemInfo$.and.returnValue(of(Fixtures.systemInfo));

    loginChangeSubject = new ReplaySubject();
    (loginService as any).loginChange$ = loginChangeSubject.asObservable();

    permissionLoadSubject = new BehaviorSubject(false);
    (loginService as any).permissionLoad$ = permissionLoadSubject.asObservable();

    const customContentService = getInjectedStub(CustomContentService);
    (customContentService as any).page$ = of(null);

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.debugElement.componentInstance;

    page = new Page(fixture);
  });

  it('should create the app', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it(`should have as title 'Self Service'`, () => {
    fixture.detectChanges();
    expect(component.title).toEqual('Self Service');
  });

  it('should render title in the toolbar', () => {
    fixture.detectChanges();
    expect(page.getToolbar().textContent).toContain('Self Service');
  });

  it('should render navigation list and user info while user is logged in', () => {
    fixture.detectChanges();

    expect(page.getNavigation()).toBeFalsy();
    expect(page.getUserNameValue()).toBeFalsy();
    expect(page.getUserRealmValue()).toBeFalsy();

    loginChangeSubject.next(Fixtures.userSystemInfo.user);
    fixture.detectChanges();

    expect(page.getUserNameValue())
      .toEqual(`${Fixtures.userSystemInfo.user.givenname} ${Fixtures.userSystemInfo.user.surname}`);
    expect(page.getUserRealmValue())
      .toEqual(Fixtures.userSystemInfo.user.realm);

    loginChangeSubject.next(undefined);
    fixture.detectChanges();

    expect(page.getNavigation()).toBeFalsy();
    expect(page.getUserNameValue()).toBeFalsy();
    expect(page.getUserRealmValue()).toBeFalsy();
  });

  it('should show the username in user info if user has no given or surname', () => {
    const user = Fixtures.userSystemInfo.user;
    loginChangeSubject.next(user);
    fixture.detectChanges();

    expect(page.getUserNameValue())
      .toEqual(`${user.givenname} ${user.surname}`);

    delete user.surname;
    loginChangeSubject.next(user);
    fixture.detectChanges();

    expect(page.getUserNameValue()).toEqual(user.givenname);

    delete user.givenname;
    loginChangeSubject.next(user);
    fixture.detectChanges();

    expect(page.getUserNameValue()).toEqual(user.username);
  });

  describe('imprint link (LINSELF-280)', () => {
    function getImprintLink(): HTMLAnchorElement {
      return fixture.debugElement.nativeElement
        .querySelector('footer a[href="http://realm-imprint"]');
    }

    it('should show the imprint from pre_context (global policy), even before login', () => {
      const preContext = Fixtures.systemInfo;
      preContext.settings.imprint_url = 'http://realm-imprint';
      systemService.getSystemInfo$.and.returnValue(of(preContext));

      fixture.detectChanges();

      expect(getImprintLink()).toBeTruthy();
    });

    it('should show the imprint of the user realm when only the user context provides it', () => {
      // pre_context has no imprint_url, because the policy is realm specific
      const preContext = Fixtures.systemInfo;
      delete preContext.settings.imprint_url;
      systemService.getSystemInfo$.and.returnValue(of(preContext));

      fixture.detectChanges();
      expect(getImprintLink()).toBeFalsy();

      // the user logs in, /userservice/context carries the realm imprint
      const userSystemInfo = Fixtures.userSystemInfo;
      userSystemInfo.settings.imprint_url = 'http://realm-imprint';
      selfServiceContextService.setContext(userSystemInfo);
      loginChangeSubject.next(userSystemInfo.user);
      fixture.detectChanges();

      expect(getImprintLink()).toBeTruthy();
    });

    it('should fall back to the pre_context imprint after logout', () => {
      // global policy, so pre_context carries an imprint of its own
      const preContext = Fixtures.systemInfo;
      preContext.settings.imprint_url = 'http://global-imprint';
      systemService.getSystemInfo$.and.returnValue(of(preContext));

      const userSystemInfo = Fixtures.userSystemInfo;
      userSystemInfo.settings.imprint_url = 'http://realm-imprint';
      selfServiceContextService.setContext(userSystemInfo);
      loginChangeSubject.next(userSystemInfo.user);
      fixture.detectChanges();

      expect(getImprintLink()).toBeTruthy();

      // on logout the LoginService clears the user context, see its own spec
      selfServiceContextService.setContext(null);
      loginChangeSubject.next(undefined);
      fixture.detectChanges();

      expect(component.imprintUrl).toEqual('http://global-imprint');
    });
  });

  describe('logout', () => {
    it('should display a success message on successful logout', () => {
      loginService.logout.and.returnValue(of(true));
      component.logout();
      expect(notificationService.message).toHaveBeenCalledWith('Logout successful');
    });
    it('should display a failure message on failed logout', () => {
      loginService.logout.and.returnValue(of(false));
      component.logout();
      expect(notificationService.message).toHaveBeenCalledWith('Logout failed');
    });
  });
});
