import { async, ComponentFixture, TestBed, tick } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginService } from './login.service';
import { MaterialModule } from '../material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationService } from '../common/notification.service';
import { I18nMock } from '../../testing/i18n-mock-provider';
import { spyOnClass } from '../../testing/spyOnClass';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { SystemService } from '../system.service';
import { Fixtures } from '../../testing/fixtures';
import { MockPipe } from '../../testing/mock-pipe';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginService: jasmine.SpyObj<LoginService>;
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
        MockPipe({ 'name': 'capitalize' }),
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
        I18nMock,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    loginService = TestBed.get(LoginService);
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
      loginService.login.and.returnValue(of({ needsSecondFactor: false, success: true }));
      fixture.detectChanges();

      component.login();

      expect(loginService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
      expect(notificationService.message).toHaveBeenCalledWith('Login successful');
      expect(component.redirect).toHaveBeenCalledTimes(1);
    });

    it('should keep the user on the login page on failed login', () => {
      spyOn(component, 'redirect');
      component.loginFormGroup.value.username = 'user';
      component.loginFormGroup.value.password = 'pass';
      loginService.login.and.returnValue(of({ needsSecondFactor: false, success: false }));
      fixture.detectChanges();

      component.login();

      expect(loginService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
      expect(notificationService.message).toHaveBeenCalledWith('Login failed');
      expect(component.redirect).not.toHaveBeenCalled();
    });

    it('should store tokens and preselect the first valid token if second factor is needed and user has tokens', () => {
      const tokens = [Fixtures.completedPushToken, Fixtures.completedQRToken];
      loginService.login.and.returnValue(of({ needsSecondFactor: true, success: false, tokens: tokens }));
      spyOn(component, 'redirect');

      component.loginFormGroup.value.username = 'user';
      component.loginFormGroup.value.password = 'pass';
      fixture.detectChanges();

      expect(component.factors).toEqual([]);
      expect(component.selectedToken).toBeFalsy();

      component.login();

      expect(loginService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
      expect(notificationService.message).not.toHaveBeenCalledWith('Login failed');
      expect(component.redirect).not.toHaveBeenCalled();

      expect(component.factors).toEqual(tokens);
      expect(component.selectedToken).toEqual(tokens[0]);
      expect(component.loginStage).toEqual(2);
    });

    it('should display error notification if second factor is needed but user has no tokens', () => {
      const noTokensMessage = 'Login failed: you do not have a second factor set up. Please contact an admin.';
      spyOn(component, 'redirect');

      component.loginFormGroup.value.username = 'user';
      component.loginFormGroup.value.password = 'pass';
      loginService.login.and.returnValue(of({ needsSecondFactor: true, success: false, tokens: [] }));
      fixture.detectChanges();

      component.login();

      expect(loginService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
      expect(notificationService.message).toHaveBeenCalledWith(noTokensMessage, 20000);
      expect(component.redirect).not.toHaveBeenCalled();
      expect(component.loginStage).toEqual(1);
    });

  });

  describe('chooseSecondFactor', () => {
    it('should go to the third login stage if factor was chosen successfully', () => {
      spyOn(component, 'redirect');
      loginService.requestSecondFactorTransaction.and.returnValue(of(true));
      const token = Fixtures.activeHotpToken;

      component.loginFormGroup.value.username = 'user';
      component.loginStage = 2;
      fixture.detectChanges();

      component.chooseSecondFactor(token);

      expect(loginService.requestSecondFactorTransaction).toHaveBeenCalledWith('user', token.serial);
      expect(component.redirect).not.toHaveBeenCalled();
      expect(component.loginStage).toEqual(3);
    });

    it('should notify the user if there was a problem starting the transaction', () => {
      spyOn(component, 'redirect');
      loginService.requestSecondFactorTransaction.and.returnValue(of(false));
      const token = Fixtures.activeHotpToken;
      const problemMessage = 'There was a problem selecting the token. Please try again or contact an admin.';

      component.loginFormGroup.value.username = 'user';
      component.loginStage = 2;
      fixture.detectChanges();

      component.chooseSecondFactor(token);

      expect(loginService.requestSecondFactorTransaction).toHaveBeenCalledWith('user', token.serial);
      expect(component.redirect).not.toHaveBeenCalled();
      expect(notificationService.message).toHaveBeenCalledWith(problemMessage, 20000);
      expect(component.loginStage).toEqual(2);
    });
  });

  describe('submitSecondFactor', () => {
    it('should submit the OTP to the LoginService for the 2nd login step and return true on success', () => {
      spyOn(component, 'finalAuthenticationHandling');
      loginService.loginSecondStep.and.returnValue(of(true));
      component.secondFactorFormGroup.value.otp = 'otp';
      fixture.detectChanges();

      component.submitSecondFactor();

      expect(loginService.loginSecondStep).toHaveBeenCalledWith('otp');
      expect(component.finalAuthenticationHandling).toHaveBeenCalledWith(true);
    });

    it('should submit the OTP to the LoginService for the 2nd login step and return false on failure', () => {
      spyOn(component, 'finalAuthenticationHandling');
      loginService.loginSecondStep.and.returnValue(of(false));
      component.secondFactorFormGroup.value.otp = 'otp';
      fixture.detectChanges();

      component.submitSecondFactor();

      expect(loginService.loginSecondStep).toHaveBeenCalledWith('otp');
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
      component.loginStage = 3;
      fixture.detectChanges();

      component.resetAuthForm();

      expect(component.loginFormGroup.value.username).toBeNull();
      expect(component.loginFormGroup.value.password).toBeNull();
      expect(component.secondFactorFormGroup.value.otp).toBeNull();
      expect(component.loginStage).toEqual(1);
    });
  });
});
