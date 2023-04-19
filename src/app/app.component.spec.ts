import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { of, ReplaySubject, Subject } from 'rxjs';

import { spyOnClass, getInjectedStub } from '@testing/spyOnClass';

import { AppComponent } from './app.component';
import { MaterialModule } from '@app/material.module';
import { NotificationService } from '@common/notification.service';
import { LoginService } from '@app/login/login.service';
import { MockComponent } from '@testing/mock-component';
import { SystemService, UserSystemInfo } from '@app/system.service';
import { Fixtures } from '@testing/fixtures';
import { TestingPage } from '@testing/page-helper';
import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';

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
  let systemService: jasmine.SpyObj<SystemService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MaterialModule,
      ],
      declarations: [
        AppComponent,
        MockComponent({ selector: 'app-language-picker' }),
        NgxPermissionsAllowStubDirective,
      ],
      providers: [
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
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    loginService = getInjectedStub(LoginService);
    systemService = getInjectedStub(SystemService);
    notificationService = getInjectedStub(NotificationService);

    loginService.logout.and.returnValue(of(null));
    systemService.getSystemInfo$.and.returnValue(of(Fixtures.systemInfo));

    loginChangeSubject = new ReplaySubject();
    (loginService as any).loginChange$ = loginChangeSubject.asObservable();

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

    expect(page.getNavigation()).toBeTruthy();
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
