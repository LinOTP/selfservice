import { async, ComponentFixture, TestBed, tick } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { MaterialModule } from '../material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationService } from '../common/notification.service';
import { I18nMock } from '../../testing/i18n-mock-provider';
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
        I18nMock,
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
      authService.login.and.returnValue(of({ needsSecondFactor: false, success: true }));
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
      authService.login.and.returnValue(of({ needsSecondFactor: false, success: false }));
      fixture.detectChanges();

      component.login();

      expect(authService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
      expect(notificationService.message).toHaveBeenCalledWith('Login failed');
      expect(component.redirect).not.toHaveBeenCalled();
    });

    it('should display OTP input if second factor is needed and user has tokens', () => {
      spyOn(component, 'redirect');
      component.loginFormGroup.value.username = 'user';
      component.loginFormGroup.value.password = 'pass';
      authService.login.and.returnValue(of({ needsSecondFactor: true, success: false, hasTokens: true }));
      fixture.detectChanges();

      component.login();

      expect(authService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
      expect(notificationService.message).not.toHaveBeenCalledWith('Login failed');
      expect(component.redirect).not.toHaveBeenCalled();
      expect(component.displaySecondFactor).toBeTruthy();
    });

    it('should display error notification if second factor is needed but user has no tokens', () => {
      const noTokensMessage = 'Login failed: you do not have a second factor set up. Please contact an admin.';
      spyOn(component, 'redirect');

      component.loginFormGroup.value.username = 'user';
      component.loginFormGroup.value.password = 'pass';
      authService.login.and.returnValue(of({ needsSecondFactor: true, success: false, hasTokens: false }));
      fixture.detectChanges();

      component.login();

      expect(authService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
      expect(notificationService.message).toHaveBeenCalledWith(noTokensMessage, 20000);
      expect(component.redirect).not.toHaveBeenCalled();
      expect(component.displaySecondFactor).toBeFalsy();
    });

  });

  describe('submitSecondFactor', () => {
    it('should submit the OTP to the AuthService for the 2nd login step and return true on success', () => {
      spyOn(component, 'finalAuthenticationHandling');
      authService.loginSecondStep.and.returnValue(of(true));
      component.secondFactorFormGroup.value.otp = 'otp';
      fixture.detectChanges();

      component.submitSecondFactor();

      expect(authService.loginSecondStep).toHaveBeenCalledWith('otp');
      expect(component.finalAuthenticationHandling).toHaveBeenCalledWith(true);
    });

    it('should submit the OTP to the AuthService for the 2nd login step and return false on failure', () => {
      spyOn(component, 'finalAuthenticationHandling');
      authService.loginSecondStep.and.returnValue(of(false));
      component.secondFactorFormGroup.value.otp = 'otp';
      fixture.detectChanges();

      component.submitSecondFactor();

      expect(authService.loginSecondStep).toHaveBeenCalledWith('otp');
      expect(component.finalAuthenticationHandling).toHaveBeenCalledWith(false);
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

  describe('resetAuthForm', () => {
    it('should empty both forms and return to the first step form', () => {
      component.loginFormGroup.value.username = 'user';
      component.loginFormGroup.value.password = 'pass';
      component.secondFactorFormGroup.value.otp = 'otp';
      component.displaySecondFactor = true;
      fixture.detectChanges();

      component.resetAuthForm();

      expect(component.loginFormGroup.value.username).toBeNull();
      expect(component.loginFormGroup.value.password).toBeNull();
      expect(component.secondFactorFormGroup.value.otp).toBeNull();
      expect(component.displaySecondFactor).toBe(false);
    });
  });
});
