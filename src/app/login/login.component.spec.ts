import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

import { I18nMock } from '../../testing/i18n-mock-provider';
import { spyOnClass } from '../../testing/spyOnClass';
import { Fixtures } from '../../testing/fixtures';
import { MockPipe } from '../../testing/mock-pipe';
import { TestingPage } from '../../testing/page-helper';

import { MaterialModule } from '../material.module';
import { NotificationService } from '../common/notification.service';
import { SystemService } from '../system.service';

import { LoginComponent, LoginStage } from './login.component';
import { LoginService } from './login.service';
import { MockComponent } from '../../testing/mock-component';

class Page extends TestingPage<LoginComponent> {

  public getLoginForm() {
    return this.query('#loginFormStage1');
  }

  public getTokenSelection() {
    return this.query('#loginStage2');
  }
  public getTokenListItems() {
    return this.getTokenSelection().querySelectorAll('.token-list .token-list-item');
  }

  public getOTPForm() {
    return this.query('#loginFormStage3');
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let page: Page;

  let fixture: ComponentFixture<LoginComponent>;
  let loginService: jasmine.SpyObj<LoginService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let systemService: jasmine.SpyObj<SystemService>;

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
        MockComponent({ selector: 'app-keyboard-key', inputs: ['icon', 'symbol'] }),
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
    systemService = TestBed.get(SystemService);
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    systemService.getSystemInfo.and.returnValue(of(Fixtures.systemInfo));

    page = new Page(fixture);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('login', () => {
    it('should render first stage login form on component init', () => {
      expect(page.getLoginForm()).toBeFalsy();
      expect(page.getTokenSelection()).toBeFalsy();
      expect(page.getOTPForm()).toBeFalsy();

      fixture.detectChanges();

      expect(page.getLoginForm()).toBeTruthy();
      expect(page.getTokenSelection()).toBeFalsy();
      expect(page.getOTPForm()).toBeFalsy();
    });

    it('should NOT include realm select in login stage if disabled in systemInfo', () => {
      systemService.getSystemInfo.and.returnValue(of({
        ...Fixtures.systemInfo,
        settings: {
          ...Fixtures.systemInfo.settings,
          realm_box: false,
        },
      }));
      fixture.detectChanges();

      expect(page.getLoginForm().querySelector('mat-select[name="realm"]')).toBeFalsy();
    });

    it('should include realm select if enabled in systemInfo', () => {
      systemService.getSystemInfo.and.returnValue(of({
        ...Fixtures.systemInfo,
        settings: {
          ...Fixtures.systemInfo.settings,
          realm_box: true,
        },
      }));
      fixture.detectChanges();

      expect(page.getLoginForm().querySelector('mat-select[name="realm"]')).toBeTruthy();
    });

    it('should NOT include otp field in login stage if disabled in systemInfo', () => {
      systemService.getSystemInfo.and.returnValue(of({ ...Fixtures.systemInfo, mfa_3_fields: false }));
      fixture.detectChanges();

      expect(page.getLoginForm().querySelector('input[name="otp"]')).toBeFalsy();
    });

    it('should include otp field in login stage if enabled in systemInfo', () => {
      const sysInfo = Fixtures.systemInfo;
      sysInfo.settings.mfa_3_fields = true;
      systemService.getSystemInfo.and.returnValue(of(sysInfo));
      fixture.detectChanges();

      expect(page.getLoginForm().querySelector('input[name="otp"]')).toBeTruthy();
    });

    it('should redirect the user on successful login', () => {
      fixture.detectChanges();

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
      fixture.detectChanges();

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

    it('should request OTP of the user\'s token if second factor is needed and user has exactly one token', () => {
      fixture.detectChanges();

      const tokens = [Fixtures.completedPushToken];
      loginService.login.and.returnValue(of({ needsSecondFactor: true, success: false, tokens: tokens }));
      loginService.requestSecondFactorTransaction.and.returnValue(of(true));
      spyOn(component, 'redirect');
      spyOn(component, 'chooseSecondFactor').and.callThrough();

      component.loginFormGroup.value.username = 'user';
      component.loginFormGroup.value.password = 'pass';
      fixture.detectChanges();

      component.login();

      fixture.detectChanges();

      expect(loginService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
      expect(component.chooseSecondFactor).toHaveBeenCalledWith(tokens[0]);
      expect(notificationService.message).not.toHaveBeenCalledWith('Login failed');
      expect(component.redirect).not.toHaveBeenCalled();

      expect(component.selectedToken).toEqual(tokens[0]);
    });

    it(
      'should store tokens and select a token on mouse click if second factor is needed and user has more than one token',
      fakeAsync(() => {
        fixture.detectChanges();

        expect(page.getLoginForm()).toBeTruthy();
        expect(page.getTokenSelection()).toBeFalsy();

        const tokens = [Fixtures.completedPushToken, Fixtures.completedQRToken];
        loginService.login.and.returnValue(of({ needsSecondFactor: true, success: false, tokens: tokens }));
        loginService.requestSecondFactorTransaction.and.returnValue(of(true));
        spyOn(component, 'redirect');

        component.loginFormGroup.value.username = 'user';
        component.loginFormGroup.value.password = 'pass';
        fixture.detectChanges();

        expect(component.factors).toEqual([]);
        expect(component.selectedToken).toBeFalsy();

        component.login();

        fixture.detectChanges();
        tick();

        expect(page.getLoginForm()).toBeFalsy();
        expect(page.getTokenSelection()).toBeTruthy();

        expect(loginService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
        expect(notificationService.message).not.toHaveBeenCalledWith('Login failed');
        expect(component.redirect).not.toHaveBeenCalled();

        expect(component.factors).toEqual(tokens);
        expect(component.selectedToken).toBeUndefined();
        expect(component.loginStage).toEqual(LoginStage.TOKEN_CHOICE);

        const tokenList = page.getTokenListItems();

        expect(tokenList.length).toBe(tokens.length + 1); // lists all tokens and a cancel button
        if ((tokenList[1] as HTMLElement).click) {
          (tokenList[1] as HTMLElement).click();
        } else {
          throw new Error('Expected tokenList element to be of type HTMLElement with click() method');

        }

        fixture.detectChanges();

        expect(component.selectedToken).toEqual(tokens[1]);
        expect(component.loginStage).toEqual(LoginStage.OTP_INPUT);
      })
    );

    it('should display error notification if second factor is needed but user has no tokens', () => {
      fixture.detectChanges();

      const noTokensMessage = 'Login failed: you do not have a second factor set up. Please contact an admin.';
      spyOn(component, 'redirect');

      component.loginFormGroup.value.username = 'user';
      component.loginFormGroup.value.password = 'pass';
      loginService.login.and.returnValue(of({ needsSecondFactor: true, success: false, tokens: [] }));
      fixture.detectChanges();

      expect(page.getLoginForm()).toBeTruthy();

      component.login();
      fixture.detectChanges();

      expect(loginService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
      expect(notificationService.message).toHaveBeenCalledWith(noTokensMessage, 20000);
      expect(component.redirect).not.toHaveBeenCalled();
      expect(page.getLoginForm()).toBeTruthy();
    });

  });

  describe('chooseSecondFactor', () => {

    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should go to the third login stage if factor was chosen successfully', () => {
      spyOn(component, 'redirect');
      loginService.requestSecondFactorTransaction.and.returnValue(of(true));
      const token = Fixtures.activeHotpToken;

      component.loginFormGroup.value.username = 'user';
      component.loginStage = LoginStage.TOKEN_CHOICE;
      component.selectedToken = token;
      fixture.detectChanges();

      component.chooseSecondFactor(token);
      fixture.detectChanges();

      expect(loginService.requestSecondFactorTransaction).toHaveBeenCalledWith('user', token.serial);
      expect(component.redirect).not.toHaveBeenCalled();
      expect(page.getOTPForm()).toBeTruthy();
    });

    it('should notify the user if there was a problem starting the transaction', () => {
      spyOn(component, 'redirect');
      loginService.requestSecondFactorTransaction.and.returnValue(of(false));
      const token = Fixtures.activeHotpToken;
      const problemMessage = 'There was a problem selecting the token. Please try again or contact an admin.';

      component.loginFormGroup.value.username = 'user';
      component.loginStage = LoginStage.TOKEN_CHOICE;
      fixture.detectChanges();

      component.chooseSecondFactor(token);

      expect(loginService.requestSecondFactorTransaction).toHaveBeenCalledWith('user', token.serial);
      expect(component.redirect).not.toHaveBeenCalled();
      expect(notificationService.message).toHaveBeenCalledWith(problemMessage, 20000);
      expect(page.getTokenSelection()).toBeTruthy();
    });
  });

  describe('submitSecondFactor', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

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
    beforeEach(() => {
      fixture.detectChanges();
    });

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
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should empty both forms and return to the first step form', () => {
      component.selectedToken = Fixtures.activeHotpToken;
      component.loginFormGroup.value.username = 'user';
      component.loginFormGroup.value.password = 'pass';
      component.secondFactorFormGroup.value.otp = 'otp';
      component.loginStage = LoginStage.OTP_INPUT;
      fixture.detectChanges();

      expect(page.getOTPForm()).toBeTruthy();

      component.resetAuthForm();
      fixture.detectChanges();

      expect(component.loginFormGroup.value.username).toBeNull();
      expect(component.loginFormGroup.value.password).toBeNull();
      expect(component.secondFactorFormGroup.value.otp).toBeNull();
      expect(page.getLoginForm()).toBeTruthy();
    });
  });
});
