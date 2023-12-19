import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of, Subject } from 'rxjs';

import { Fixtures } from '@testing/fixtures';
import { MockComponent } from '@testing/mock-component';
import { MockPipe } from '@testing/mock-pipe';
import { TestingPage } from '@testing/page-helper';
import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { SelfserviceToken } from '@api/token';
import { MaterialModule } from '@app/material.module';
import { SystemService } from '@app/system.service';
import { DialogComponent } from '@common/dialog/dialog.component';
import { Duration, NotificationService } from '@common/notification.service';

import { LoginComponent, LoginStage } from './login.component';
import { LoginService } from './login.service';

class Page extends TestingPage<LoginComponent> {

  public getLoginForm() {
    return this.query('#loginFormStage1');
  }

  public getTokenSelection() {
    return this.query('#loginStage2');
  }

  public getTokenListItems() {
    const items = this.getTokenSelection().querySelectorAll('.token-list .token-list-item') as NodeListOf<HTMLElement>;
    items.forEach(i => {
      // make sure that the forced type cast is correct for each item
      if (!(i instanceof HTMLElement)) {
        throw new Error('Expected tokenList element to be of type HTMLElement with click() and focus() methods');
      }
    });
    return items;
  }

  public clickTokenListItem(index: number) {
    this.getTokenListItems()[index].click();
  }

  public focusTokenListItem(index: number) {
    this.getTokenListItems()[index].focus();
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
  let matDialog: jasmine.SpyObj<MatDialog>;

  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
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
        MockComponent({ selector: 'app-qr-code', inputs: ['qrUrl'] }),
        MockComponent({ selector: 'app-button-wait-indicator', inputs: ['show'] }),
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
        {
          provide: MatDialog,
          useValue: spyOnClass(MatDialog)
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    loginService = getInjectedStub(LoginService);
    notificationService = getInjectedStub(NotificationService);
    systemService = getInjectedStub(SystemService);
    router = getInjectedStub(Router);
    matDialog = getInjectedStub(MatDialog);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    systemService.getSystemInfo$.and.returnValue(of(Fixtures.systemInfo));

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

    it('should display warning dialog if backend version is too old', () => {
      systemService.getSystemInfo$.and.returnValue(of(Fixtures.outdatedSystemInfo));
      fixture.detectChanges();

      const config = {
        width: '35em',
        disableClose: true,
        autoFocus: true,
        data: {
          title: `Incompatible server version`,
          text: `The LinOTP server version is too old for the Self Service version you are using. Please contact an administrator.`,
          nonDismissible: true,
        }
      };

      expect(matDialog.open).toHaveBeenCalledWith(DialogComponent, config);
    });

    it('should display warning dialog if backend version is so old that the SystemInfo could not even be created', () => {
      systemService.getSystemInfo$.and.returnValue(of(undefined));
      fixture.detectChanges();

      const config = {
        width: '35em',
        disableClose: true,
        autoFocus: true,
        data: {
          title: `Incompatible server version`,
          text: `The LinOTP server version is too old for the Self Service version you are using. Please contact an administrator.`,
          nonDismissible: true,
        }
      };

      expect(matDialog.open).toHaveBeenCalledWith(DialogComponent, config);
    });

    it('should NOT include realm select in login stage if disabled in systemInfo', () => {
      systemService.getSystemInfo$.and.returnValue(of({
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
      loginService.login.and.returnValue(of({ needsSecondFactor: false, success: true }));

      const sysInfo = Fixtures.systemInfo;
      sysInfo.settings.realm_box = true;
      systemService.getSystemInfo$.and.returnValue(of(sysInfo));

      fixture.detectChanges();

      expect(page.getLoginForm().querySelector('mat-select[name="realm"]')).toBeTruthy();

      component.loginFormGroup.patchValue({ username: 'user', password: 'pass', realm: 'realm' });
      fixture.detectChanges();

      component.login();
      expect(loginService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass', realm: 'realm' });
    });

    it('should NOT include otp field in login stage if mfa_login disabled in systemInfo', () => {
      systemService.getSystemInfo$.and.returnValue(of({ ...Fixtures.systemInfo, mfa_3_fields: true, mfa_login: false }));
      fixture.detectChanges();

      expect(page.getLoginForm().querySelector('input[name="otp"]')).toBeFalsy();
    });

    it('should NOT include otp field in login stage if 3 fields disabled in systemInfo', () => {
      systemService.getSystemInfo$.and.returnValue(of({ ...Fixtures.systemInfo, mfa_3_fields: false }));
      fixture.detectChanges();

      expect(page.getLoginForm().querySelector('input[name="otp"]')).toBeFalsy();
    });

    it('should include otp field in login stage if enabled in systemInfo', () => {
      loginService.login.and.returnValue(of({ needsSecondFactor: false, success: true }));

      const sysInfo = Fixtures.systemInfo;
      sysInfo.settings.mfa_3_fields = true;
      sysInfo.settings.mfa_login = true;
      systemService.getSystemInfo$.and.returnValue(of(sysInfo));

      fixture.detectChanges();

      expect(page.getLoginForm().querySelector('input[name="otp"]')).toBeTruthy();

      component.loginFormGroup.patchValue({ username: 'user', password: 'pass', otp: 'otp' });
      fixture.detectChanges();

      component.login();
      expect(loginService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass', otp: 'otp' });
    });

    it('should redirect the user on successful login', () => {
      fixture.detectChanges();

      spyOn(component, 'redirect');
      component.loginFormGroup.patchValue({ username: 'user', password: 'pass' });
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
      component.loginFormGroup.patchValue({ username: 'user', password: 'pass' });
      loginService.login.and.returnValue(of({ needsSecondFactor: false, success: false }));
      fixture.detectChanges();

      component.login();

      expect(loginService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
      expect(notificationService.errorMessage).toHaveBeenCalledWith('Login failed');
      expect(component.redirect).not.toHaveBeenCalled();
    });

    it('should store tokens and select a token on mouse click if second factor is needed and user has more than one token',
      fakeAsync(() => {
        fixture.detectChanges();

        expect(page.getLoginForm()).toBeTruthy();
        expect(page.getTokenSelection()).toBeFalsy();

        const tokens = [Fixtures.completedPushToken, Fixtures.completedQRToken];
        loginService.login.and.returnValues(
          of({ success: false, tokens: tokens }),
          of({ success: false, challengedata: Fixtures.transactionDetail })
        );
        spyOn(component, 'redirect');
        spyOn(component, 'chooseSecondFactor').and.callThrough();

        component.loginFormGroup.patchValue({ username: 'user', password: 'pass' });
        fixture.detectChanges();

        expect(component.factors).toEqual([]);
        expect(component.selectedToken).toBeFalsy();

        component.login();

        fixture.detectChanges();
        tick();

        expect(page.getLoginForm()).toBeFalsy();
        expect(page.getTokenSelection()).toBeTruthy();

        expect(loginService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
        expect(notificationService.errorMessage).not.toHaveBeenCalledWith('Login failed');
        expect(component.redirect).not.toHaveBeenCalled();

        expect(component.factors).toEqual(tokens);
        expect(component.selectedToken).toBeUndefined();
        expect(component.loginStage).toEqual(LoginStage.TOKEN_CHOICE);

        expect(page.getTokenListItems().length).toBe(tokens.length + 1); // lists all tokens and a cancel button
        page.clickTokenListItem(1);

        fixture.detectChanges();
        tick();

        expect(component.selectedToken).toEqual(tokens[1]);
        expect(component.chooseSecondFactor).toHaveBeenCalledWith(tokens[1]);
        expect(loginService.login).toHaveBeenCalledWith({ serial: tokens[1].serial });
        expect(component.loginStage).toEqual(LoginStage.OTP_INPUT);
      })
    );

    it('should display error notification if second factor is needed but user has no tokens', () => {
      fixture.detectChanges();

      const noTokensMessage = 'Login failed: you do not have a second factor set up. Please contact an admin.';
      spyOn(component, 'redirect');

      component.loginFormGroup.patchValue({ username: 'user', password: 'pass' });
      loginService.login.and.returnValue(of({ needsSecondFactor: true, success: false, tokens: [] }));
      fixture.detectChanges();

      expect(page.getLoginForm()).toBeTruthy();

      component.login();
      fixture.detectChanges();

      expect(loginService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
      expect(notificationService.errorMessage).toHaveBeenCalledWith(noTokensMessage, Duration.LONG);
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
      loginService.login.and.returnValue(of({ success: true }));
      const token = Fixtures.activeHotpToken;

      component.loginStage = LoginStage.TOKEN_CHOICE;
      component.transactionDetail = Fixtures.transactionDetail;
      component.selectedToken = token;
      fixture.detectChanges();

      component.chooseSecondFactor(token);
      fixture.detectChanges();

      expect(loginService.login).toHaveBeenCalledWith({ serial: token.serial });
      expect(component.redirect).not.toHaveBeenCalled();
      expect(page.getOTPForm()).toBeTruthy();
    });

    describe('keyboard support', () => {
      let tokens: SelfserviceToken[];
      let tokenListItems: NodeListOf<HTMLElement>;

      beforeEach(() => {
        tokens = [Fixtures.completedPushToken, Fixtures.completedQRToken];
        component.factors = tokens;
        component.loginStage = LoginStage.TOKEN_CHOICE;
        fixture.detectChanges();
        tokenListItems = page.getTokenListItems();
      });

      it('should loop through token list items arrow down and arrow right key', () => {
        page.focusTokenListItem(0);
        for (let i = 0; i < tokenListItems.length; i++) {
          expect(document.activeElement).toEqual(tokenListItems[i]);
          page.sendKeyboardEvent('ArrowDown');
        }
        for (let i = 0; i < tokenListItems.length; i++) {
          expect(document.activeElement).toEqual(tokenListItems[i]);
          page.sendKeyboardEvent('ArrowRight');
        }
        expect(document.activeElement).toEqual(tokenListItems[0]);
      });

      it('should loop through token list items arrow up and arrow left key', () => {
        page.focusTokenListItem(0);
        for (let i = tokenListItems.length; i > 0; i--) {
          expect(document.activeElement).toEqual(tokenListItems[i % tokenListItems.length]);
          page.sendKeyboardEvent('ArrowUp');
        }
        for (let i = tokenListItems.length; i > 0; i--) {
          expect(document.activeElement).toEqual(tokenListItems[i % tokenListItems.length]);
          page.sendKeyboardEvent('ArrowLeft');
        }
        expect(document.activeElement).toEqual(tokenListItems[0]);
      });

      it('should focus first token if no token was focused and down arrow is pressed', () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        } else {
          throw new Error('Expected document.activeElement to be of type HTMLElement');
        }
        page.sendKeyboardEvent('ArrowDown');
        expect(document.activeElement).toEqual(tokenListItems[0]);
      });

      it('should focus last token if no token was focused and up arrow is pressed', () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        } else {
          throw new Error('Expected document.activeElement to be of type HTMLElement');
        }
        page.sendKeyboardEvent('ArrowUp');
        expect(document.activeElement).toEqual(tokenListItems[tokenListItems.length - 1]);
      });

      it('should ignore key presses other than the registered keys', () => {
        expect(component.moveSelection(new KeyboardEvent('keydown', { key: 'a' }))).toBe(undefined);
      });

      it('should ignore key presses on login stages other than token selection', () => {
        component.loginStage = LoginStage.USER_PW_INPUT;

        expect(component.moveSelection(new KeyboardEvent('keydown', { key: 'ArrowDown' }))).toBe(undefined);
      });
    });
  });

  describe('submitSecondFactor', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should submit the OTP to the LoginService for the 2nd login step and return true on success', () => {
      spyOn(component, 'finalAuthenticationHandling');
      loginService.login.and.returnValue(of({ success: true }));
      component.secondFactorFormGroup.patchValue({ otp: 'otp' });
      fixture.detectChanges();

      component.submitSecondFactor();

      expect(loginService.login).toHaveBeenCalledWith({ otp: 'otp' });
      expect(component.finalAuthenticationHandling).toHaveBeenCalledWith(true);
    });

    it('should submit the OTP to the LoginService for the 2nd login step and return false on failure', () => {
      spyOn(component, 'finalAuthenticationHandling');
      loginService.login.and.returnValue(of({ success: false }));
      component.secondFactorFormGroup.patchValue({ otp: 'otp' });
      fixture.detectChanges();

      component.submitSecondFactor();

      expect(loginService.login).toHaveBeenCalledWith({ otp: 'otp' });
      expect(component.finalAuthenticationHandling).toHaveBeenCalledWith(false);
    });

    it('should have token-appropriate message for Yubico tokens', () => {
      component.loginStage = LoginStage.OTP_INPUT;
      component.selectedToken = Fixtures.activeYubicoToken;
      component.transactionDetail = Fixtures.transactionDetail;

      fixture.detectChanges();

      expect(page.getOTPForm().textContent).toContain('Please connect your Yubikey and press its button.');
    });

    it('should have token-appropriate message for Yubikey tokens', () => {
      component.loginStage = LoginStage.OTP_INPUT;
      component.selectedToken = Fixtures.activeYubikeyToken;
      component.transactionDetail = Fixtures.transactionDetail;

      fixture.detectChanges();

      expect(page.getOTPForm().textContent).toContain('Please connect your Yubikey and press its button.');
    });

    it('should have token-appropriate message for Password tokens', () => {
      component.loginStage = LoginStage.OTP_INPUT;
      component.selectedToken = Fixtures.activePasswordToken;
      component.transactionDetail = Fixtures.transactionDetail;

      fixture.detectChanges();

      expect(page.getOTPForm().textContent).toContain('Please enter the password of the selected token:');
    });

    it('should have token-appropriate message for remaining offline-only OTP tokens', () => {
      component.loginStage = LoginStage.OTP_INPUT;
      component.transactionDetail = Fixtures.transactionDetail;

      [
        Fixtures.activeTotpToken,
        Fixtures.activeHotpToken,
        Fixtures.activeMotpToken,
        Fixtures.activeSMSToken,
        Fixtures.activeEmailToken
      ].forEach(token => {
        component.selectedToken = token;
        fixture.detectChanges();
        expect(page.getOTPForm().textContent).toContain('Please enter the current OTP for the selected token:');
      });
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
      spyOn(component, 'stopSubscription');
      component.selectedToken = Fixtures.activeHotpToken;
      component.loginFormGroup.value.username = 'user';
      component.loginFormGroup.value.password = 'pass';
      component.secondFactorFormGroup.value.otp = 'otp';
      component.loginStage = LoginStage.OTP_INPUT;
      component.transactionDetail = Fixtures.transactionDetail;

      fixture.detectChanges();

      expect(page.getOTPForm()).toBeTruthy();

      component.resetAuthForm();
      fixture.detectChanges();

      expect(component.loginFormGroup.value.username).toBeNull();
      expect(component.loginFormGroup.value.password).toBeNull();
      expect(component.secondFactorFormGroup.value.otp).toBeNull();
      expect(component.transactionDetail).toBeNull();
      expect(page.getLoginForm()).toBeTruthy();
      expect(component.stopSubscription).toHaveBeenCalled();
    });
  });

  it('stopSubscription should stop a running polling subscription', () => {
    loginService.statusPoll.and.returnValue(new Subject<boolean>().asObservable());
    fixture.detectChanges();

    expect(component['pollingSubscription']).toBeFalsy();

    component.transactionDetail = Fixtures.transactionDetailOnline;
    component.checkTransactionState();

    expect(component['pollingSubscription']).toBeTruthy();
    expect(component['pollingSubscription'].closed).toBe(false);

    component.stopSubscription();
    expect(component['pollingSubscription'].closed).toBe(true);
  });
});
