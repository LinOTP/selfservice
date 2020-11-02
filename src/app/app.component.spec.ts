import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

import { spyOnClass, getInjectedStub } from '../testing/spyOnClass';

import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { NotificationService } from './common/notification.service';
import { LoginService } from './login/login.service';
import { MockComponent } from '../testing/mock-component';
import { SystemService } from './system.service';
import { Fixtures } from '../testing/fixtures';


const navLinks = [
  { 'label': 'label', 'path': 'path/' },
];

describe('AppComponent', () => {
  let loginService: jasmine.SpyObj<LoginService>;
  let systemService: jasmine.SpyObj<SystemService>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MaterialModule,
      ],
      declarations: [
        AppComponent,
        MockComponent({ selector: 'app-language-picker' }),
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

    loginService.logout.and.returnValue(of(null));
    systemService.getSystemInfo$.and.returnValue(of(Fixtures.systemInfo));
    (loginService as any).loginChange$ = of();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Self Service'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Self Service');
  });

  it('should render title in a mat-toolbar tag', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('mat-toolbar').textContent).toContain('Self Service');
  });

  it('should render navigation list and user info if user is logged in', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const compiled = fixture.debugElement.nativeElement;

    fixture.detectChanges();

    component.userData = Fixtures.userSystemInfo.user;
    component.navLinks = navLinks;

    fixture.detectChanges();

    expect(compiled.querySelector('nav').textContent).toContain(navLinks[0].label);
    expect(compiled.querySelector('.user-info .name').textContent.trim()).toEqual(
      `${Fixtures.userSystemInfo.user.givenname} ${Fixtures.userSystemInfo.user.surname}`
    );
    expect(compiled.querySelector('.user-info .realm').textContent.trim()).toEqual(
      Fixtures.userSystemInfo.user.realm
    );
  });

  it('should not render navigation list nor user info if user is logged out', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const compiled = fixture.debugElement.nativeElement;

    fixture.detectChanges();

    component.userData = undefined;
    component.navLinks = navLinks;

    fixture.detectChanges();

    expect(compiled.querySelector('nav').textContent).not.toContain(navLinks[0].label);
    expect(compiled.querySelector('.user-info .name')).toBeFalsy();
    expect(compiled.querySelector('.user-info .realm')).toBeFalsy();
  });

  it('should show the username in user info if user has no given or surname', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const compiled = fixture.debugElement.nativeElement;
    component.userData = Fixtures.userSystemInfo.user;
    component.navLinks = navLinks;

    fixture.detectChanges();

    expect(compiled.querySelector('.user-info .name').textContent.trim()).toEqual(
      `${Fixtures.userSystemInfo.user.givenname} ${Fixtures.userSystemInfo.user.surname}`
    );

    delete component.userData.surname;

    fixture.detectChanges();

    expect(compiled.querySelector('.user-info .name').textContent.trim()).toEqual(
      Fixtures.userSystemInfo.user.givenname
    );

    delete component.userData.givenname;

    fixture.detectChanges();

    expect(compiled.querySelector('.user-info .name').textContent.trim()).toEqual(
      Fixtures.userSystemInfo.user.username
    );
  });
});
