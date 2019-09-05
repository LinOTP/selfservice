import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { MaterialModule } from '../material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationService } from '../common/notification.service';
import { I18NMock } from '../../testing/i18n-mock-provider';
import { spyOnClass } from '../../testing/spyOnClass';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { SystemService } from '../system.service';
import { Fixtures } from '../../testing/fixtures';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        RouterTestingModule,
      ],
      declarations: [
        LoginComponent,
      ],
      providers: [
        {
          provide: AuthService,
          useValue: spyOnClass(AuthService),
        },
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService),
        },
        {
          provide: SystemService,
          useValue: spyOnClass(SystemService),
        },
        I18NMock,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    authService = TestBed.get(AuthService);
    notificationService = TestBed.get(NotificationService);
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    TestBed.get(SystemService).getSystemInfo.and.returnValue(of(Fixtures.systemInfo));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('login', () => {

    it('should redirect the user on successful login', () => {
      spyOn(component, 'redirect');
      component.loginFormGroup.value.username = 'user';
      component.loginFormGroup.value.password = 'pass';
      authService.login.and.returnValue(of(true));
      fixture.detectChanges();

      component.login();

      expect(authService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
      expect(notificationService.message).toHaveBeenCalledWith('Login successful');
      expect(component.redirect).toHaveBeenCalledTimes(1);
    });

    it('should keep the user on the login page on failed login', () => {
      spyOn(component, 'redirect');
      component.loginFormGroup.value.username = 'user';
      component.loginFormGroup.value.password = 'pass';
      authService.login.and.returnValue(of(false));
      fixture.detectChanges();

      component.login();

      expect(authService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
      expect(notificationService.message).toHaveBeenCalledWith('Login failed');
      expect(component.redirect).not.toHaveBeenCalled();
    });
  });

  describe('redirect', () => {
    it('should navigate to the target page if specified', () => {
      component.redirectUrl = 'somePage';
      fixture.detectChanges();

      spyOn(router, 'navigate');
      component.redirect();

      expect(router.navigate).toHaveBeenCalledWith(['somePage']);
    });

    it('should navigate to root page if no target page specified', () => {
      component.redirectUrl = null;
      fixture.detectChanges();

      spyOn(router, 'navigate');
      component.redirect();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
