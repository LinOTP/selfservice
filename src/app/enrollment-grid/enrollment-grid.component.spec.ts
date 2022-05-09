import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';

import { BehaviorSubject, Subscription } from 'rxjs';
import { of } from 'rxjs';

import { spyOnClass, getInjectedStub } from '../../testing/spyOnClass';
import { Fixtures } from '../../testing/fixtures';

import { MaterialModule } from '../material.module';
import { NotificationService } from '../common/notification.service';
import { CapitalizePipe } from '../common/pipes/capitalize.pipe';
import { TokenDisplayData } from '../api/token';
import { TokenType } from '@linotp/data-models';

import { TokenService } from '../api/token.service';

import { EnrollmentGridComponent } from './enrollment-grid.component';
import { AssignTokenDialogComponent } from '../enroll/assign-token-dialog/assign-token-dialog.component';
import { EnrollOATHDialogComponent } from '../enroll/enroll-oath-dialog/enroll-oath-dialog.component';
import { EnrollPushQRDialogComponent } from '../enroll/enroll-push-qr-dialog/enroll-push-qr-dialog.component';
import { ActivateDialogComponent } from '../activate/activate-dialog.component';
import { TestDialogComponent } from '../test/test-dialog.component';
import { EnrollEmailDialogComponent } from '../enroll/enroll-email-dialog/enroll-email-dialog.component';
import { EnrollSMSDialogComponent } from '../enroll/enroll-sms-dialog/enroll-sms-dialog.component';
import { EnrollMOTPDialogComponent } from '../enroll/enroll-motp-dialog/enroll-motp-dialog.component';
import { EnrollYubicoDialogComponent } from '../enroll/enroll-yubico/enroll-yubico-dialog.component';
import { EnrollPasswordDialogComponent } from '../enroll/enroll-password-dialog/enroll-password-dialog.component';
import { LoginService } from '../login/login.service';


describe('EnrollmentGridComponent', () => {
  let component: EnrollmentGridComponent;
  let fixture: ComponentFixture<EnrollmentGridComponent>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let tokenUpdateSpy;
  let loginService: jasmine.SpyObj<LoginService>;
  const hasPermissionSubject = new BehaviorSubject(true);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        RouterTestingModule,
      ],
      declarations: [
        EnrollmentGridComponent,
        NgxPermissionsAllowStubDirective,
        CapitalizePipe,
      ],
      providers: [
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService),
        },
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService),
        },
        {
          provide: MatDialog,
          useValue: spyOnClass(MatDialog)
        },
        {
          provide: LoginService,
          useValue: spyOnClass(LoginService)
        },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollmentGridComponent);
    component = fixture.componentInstance;
    tokenUpdateSpy = spyOn(component.tokenUpdate, 'next');
    notificationService = getInjectedStub(NotificationService);
    tokenService = getInjectedStub(TokenService);
    matDialog = getInjectedStub(MatDialog);
    loginService = getInjectedStub(LoginService);
    loginService.hasPermission$.and.returnValue(hasPermissionSubject.asObservable());

    (<any>tokenService).tokenDisplayData = [Fixtures.tokenDisplayData.hmac, Fixtures.tokenDisplayData.push];

    component.testAfterEnrollment = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should unsubscribe from permission subscriptions on component destroy', () => {
    expect((component as any).subscriptions.length).toEqual(1);
    const activeSubscription: Subscription = (component as any).subscriptions[0];
    expect(activeSubscription.closed).toEqual(false);

    component.ngOnDestroy();

    expect((component as any).subscriptions.length).toEqual(0);
    expect(activeSubscription.closed).toEqual(true);
  });

  it('should open the HOTP dialog and update the token list when completed', fakeAsync(() => {
    const token = Fixtures.activeHotpToken;
    const tokenDisplayData: TokenDisplayData = token.typeDetails;

    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: {
        tokenDisplayData: tokenDisplayData,
        closeLabel: 'Test',
      },
    };
    const expectedTestDialogConfig = {
      width: '650px',
      data: { token: token },
    };

    matDialog.open.and.returnValues(
      { afterClosed: () => of(token.serial) } as MatDialogRef<EnrollOATHDialogComponent>,
      { afterClosed: () => of(true) } as MatDialogRef<TestDialogComponent>
    );
    tokenService.getToken.and.returnValue(of(token));
    component.runEnrollmentWorkflow(tokenDisplayData);
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(EnrollOATHDialogComponent, expectedEnrollDialogConfig);
    expect(tokenService.getToken).toHaveBeenCalledWith(token.serial);

    expect(matDialog.open).toHaveBeenCalledWith(TestDialogComponent, expectedTestDialogConfig);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(2);
  }));

  it('should notify the user if there was an issue retrieving the token before the test', fakeAsync(() => {
    const tokenDisplayData: TokenDisplayData = Fixtures.tokenDisplayData[TokenType.HOTP];

    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: {
        tokenDisplayData: tokenDisplayData,
        closeLabel: 'Test',
      },
    };

    matDialog.open.and.returnValue({ afterClosed: () => of('serial') } as MatDialogRef<EnrollOATHDialogComponent>);
    tokenService.getToken.and.returnValue(of(null));
    component.runEnrollmentWorkflow(tokenDisplayData);
    tick();

    expect(matDialog.open).toHaveBeenCalledTimes(1);
    expect(matDialog.open).toHaveBeenCalledWith(EnrollOATHDialogComponent, expectedEnrollDialogConfig);
    expect(notificationService.message).toHaveBeenCalledWith('There was a problem starting the token test, please try again later.');
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
  }));

  it('should not notify the user if the enrollment was cancelled', fakeAsync(() => {
    const tokenDisplayData: TokenDisplayData = Fixtures.tokenDisplayData[TokenType.HOTP];

    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: {
        tokenDisplayData: tokenDisplayData,
        closeLabel: 'Test',
      },
    };

    matDialog.open.and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<EnrollOATHDialogComponent>);
    component.runEnrollmentWorkflow(tokenDisplayData);
    tick();

    expect(matDialog.open).toHaveBeenCalledTimes(1);
    expect(matDialog.open).toHaveBeenCalledWith(EnrollOATHDialogComponent, expectedEnrollDialogConfig);
    expect(notificationService.message).not.toHaveBeenCalled();
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
  }));

  it('should open the TOTP dialog and update the token list when completed', fakeAsync(() => {
    const token = Fixtures.activeTotpToken;
    const tokenDisplayData: TokenDisplayData = token.typeDetails;

    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: {
        tokenDisplayData: tokenDisplayData,
        closeLabel: 'Test',
      },
    };
    const expectedTestDialogConfig = {
      width: '650px',
      data: { token: token },
    };

    matDialog.open.and.returnValues(
      { afterClosed: () => of(token.serial) } as MatDialogRef<EnrollOATHDialogComponent>,
      { afterClosed: () => of(true) } as MatDialogRef<TestDialogComponent>
    );
    tokenService.getToken.and.returnValue(of(token));
    component.runEnrollmentWorkflow(tokenDisplayData);
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(EnrollOATHDialogComponent, expectedEnrollDialogConfig);
    expect(tokenService.getToken).toHaveBeenCalledWith(token.serial);

    expect(matDialog.open).toHaveBeenCalledWith(TestDialogComponent, expectedTestDialogConfig);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(2);
  }));

  it('should open the Password dialog and update the token list when completed', fakeAsync(() => {
    const token = Fixtures.activePasswordToken;
    const tokenDisplayData: TokenDisplayData = token.typeDetails;

    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: {
        tokenDisplayData: tokenDisplayData,
        closeLabel: 'Close',
      },
    };

    matDialog.open.and.returnValues({ afterClosed: () => of(token.serial) } as MatDialogRef<EnrollPasswordDialogComponent>);
    tokenService.getToken.and.returnValue(of(token));
    component.runEnrollmentWorkflow(tokenDisplayData);
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(EnrollPasswordDialogComponent, expectedEnrollDialogConfig);
    expect(tokenService.getToken).toHaveBeenCalledWith(token.serial);

    expect(matDialog.open).toHaveBeenCalledTimes(1);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
  }));

  it('should open the Email Token dialog and update the token list when completed', fakeAsync(() => {
    const token = Fixtures.activeEmailToken;
    const tokenDisplayData: TokenDisplayData = token.typeDetails;

    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: {
        tokenDisplayData: tokenDisplayData,
        closeLabel: 'Test',
      },
    };
    const expectedTestDialogConfig = {
      width: '650px',
      data: { token: token },
    };

    matDialog.open.and.returnValues(
      { afterClosed: () => of(token.serial) } as MatDialogRef<EnrollEmailDialogComponent>,
      { afterClosed: () => of(true) } as MatDialogRef<TestDialogComponent>
    );
    tokenService.getToken.and.returnValue(of(token));
    component.runEnrollmentWorkflow(tokenDisplayData);
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(EnrollEmailDialogComponent, expectedEnrollDialogConfig);
    expect(tokenService.getToken).toHaveBeenCalledWith(token.serial);

    expect(matDialog.open).toHaveBeenCalledWith(TestDialogComponent, expectedTestDialogConfig);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(2);
  }));

  it('should open the SMS dialog and update the token list when completed', fakeAsync(() => {
    const token = Fixtures.activeSMSToken;
    const tokenDisplayData: TokenDisplayData = token.typeDetails;

    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: {
        tokenDisplayData: tokenDisplayData,
        closeLabel: 'Test',
      },
    };
    const expectedTestDialogConfig = {
      width: '650px',
      data: { token: token },
    };

    matDialog.open.and.returnValues(
      { afterClosed: () => of(token.serial) } as MatDialogRef<EnrollSMSDialogComponent>,
      { afterClosed: () => of(true) } as MatDialogRef<TestDialogComponent>
    );
    tokenService.getToken.and.returnValue(of(token));
    component.runEnrollmentWorkflow(tokenDisplayData);
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(EnrollSMSDialogComponent, expectedEnrollDialogConfig);
    expect(tokenService.getToken).toHaveBeenCalledWith(token.serial);

    expect(matDialog.open).toHaveBeenCalledWith(TestDialogComponent, expectedTestDialogConfig);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(2);
  }));

  it('should open the MOTP dialog and update the token list when completed', fakeAsync(() => {
    const token = Fixtures.activeMotpToken;
    const tokenDisplayData: TokenDisplayData = token.typeDetails;

    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: {
        tokenDisplayData: tokenDisplayData,
        closeLabel: 'Test',
      },
    };
    const expectedTestDialogConfig = {
      width: '650px',
      data: { token: token },
    };

    matDialog.open.and.returnValues(
      { afterClosed: () => of(token.serial) } as MatDialogRef<EnrollMOTPDialogComponent>,
      { afterClosed: () => of(true) } as MatDialogRef<TestDialogComponent>
    );
    tokenService.getToken.and.returnValue(of(token));
    component.runEnrollmentWorkflow(tokenDisplayData);
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(EnrollMOTPDialogComponent, expectedEnrollDialogConfig);
    expect(tokenService.getToken).toHaveBeenCalledWith(token.serial);

    expect(matDialog.open).toHaveBeenCalledWith(TestDialogComponent, expectedTestDialogConfig);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(2);
  }));

  it('should open the Push dialog and trigger the token list updater', fakeAsync(() => {
    const token = Fixtures.unpairedPushToken;
    const tokenDisplayData: TokenDisplayData = token.typeDetails;

    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: {
        tokenDisplayData: token.typeDetails,
      },
    };

    const expectedTestDialogConfig = {
      width: '650px',
      data: { token: token },
    };

    matDialog.open.and.returnValues(
      { afterClosed: () => of(token.serial) } as MatDialogRef<EnrollPushQRDialogComponent>,
      { afterClosed: () => of(true) } as MatDialogRef<TestDialogComponent>
    );
    tokenService.getToken.and.returnValue(of(token));
    component.runEnrollmentWorkflow(tokenDisplayData);
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(EnrollPushQRDialogComponent, expectedEnrollDialogConfig);
    expect(tokenService.getToken).toHaveBeenCalledWith(token.serial);
    expect(matDialog.open).toHaveBeenCalledWith(ActivateDialogComponent, expectedTestDialogConfig);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(2);
    expect(notificationService.message).not.toHaveBeenCalled();
  }));

  it('should open the Yubico registration dialog and update the token list when completed', fakeAsync(() => {
    const token = Fixtures.activeYubicoToken;
    const tokenDisplayData: TokenDisplayData = token.typeDetails;

    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: {
        tokenDisplayData: tokenDisplayData,
        closeLabel: 'Test',
      },
    };
    const expectedTestDialogConfig = {
      width: '650px',
      data: { token: token },
    };

    matDialog.open.and.returnValues(
      { afterClosed: () => of(token.serial) } as MatDialogRef<EnrollYubicoDialogComponent>,
      { afterClosed: () => of(true) } as MatDialogRef<TestDialogComponent>
    );
    tokenService.getToken.and.returnValue(of(token));
    component.runEnrollmentWorkflow(tokenDisplayData);
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(EnrollYubicoDialogComponent, expectedEnrollDialogConfig);
    expect(tokenService.getToken).toHaveBeenCalledWith(token.serial);

    expect(matDialog.open).toHaveBeenCalledWith(TestDialogComponent, expectedTestDialogConfig);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(2);
  }));

  it('should open the assignment dialog and update the token list when completed', fakeAsync(() => {
    const token = Fixtures.activeTotpToken;
    const tokenDisplayData = Fixtures.tokenDisplayData['assign'];

    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: {
        tokenDisplayData: tokenDisplayData,
        closeLabel: 'Test',
      },
    };
    const expectedTestDialogConfig = {
      width: '650px',
      data: { token: token },
    };

    matDialog.open.and.returnValues(
      { afterClosed: () => of(token.serial) } as MatDialogRef<AssignTokenDialogComponent>,
      { afterClosed: () => of(true) } as MatDialogRef<TestDialogComponent>
    );
    tokenService.getToken.and.returnValue(of(token));
    component.runEnrollmentWorkflow(tokenDisplayData);
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(AssignTokenDialogComponent, expectedEnrollDialogConfig);
    expect(tokenService.getToken).toHaveBeenCalledWith(token.serial);

    expect(matDialog.open).toHaveBeenCalledWith(TestDialogComponent, expectedTestDialogConfig);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(2);
  }));

  it('should test a password token after assignment like any other assigned token', fakeAsync(() => {
    const token = Fixtures.activePasswordToken;
    const tokenDisplayData = Fixtures.tokenDisplayData['assign'];

    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: {
        tokenDisplayData: tokenDisplayData,
        closeLabel: 'Test',
      },
    };
    const expectedTestDialogConfig = {
      width: '650px',
      data: { token: token },
    };

    matDialog.open.and.returnValues(
      { afterClosed: () => of(token.serial) } as MatDialogRef<AssignTokenDialogComponent>,
      { afterClosed: () => of(true) } as MatDialogRef<TestDialogComponent>
    );
    tokenService.getToken.and.returnValue(of(token));
    component.runEnrollmentWorkflow(tokenDisplayData);
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(AssignTokenDialogComponent, expectedEnrollDialogConfig);
    expect(tokenService.getToken).toHaveBeenCalledWith(token.serial);

    expect(matDialog.open).toHaveBeenCalledWith(TestDialogComponent, expectedTestDialogConfig);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(2);
  }));

  it('should notify the user if the token cannot be enrolled', fakeAsync(() => {
    const tokenDisplayData: TokenDisplayData = Fixtures.tokenDisplayData[TokenType.UNKNOWN];
    component.runEnrollmentWorkflow(tokenDisplayData);
    tick();

    expect(matDialog.open).toHaveBeenCalledTimes(0);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(0);
    expect(notificationService.message).toHaveBeenCalledTimes(1);
    expect(notificationService.message).toHaveBeenCalledWith('The selected token type cannot be added at the moment.');
  }));

  it('should label the final enrollment button with Close and not open the testing dialog if user has no permissions to test',
    fakeAsync(() => {
      component.testAfterEnrollment = false;
      fixture.detectChanges();

      const token = Fixtures.activeTotpToken;
      const tokenDisplayData: TokenDisplayData = Fixtures.tokenDisplayData[TokenType.HOTP];

      const expectedEnrollDialogConfig = {
        width: '850px',
        autoFocus: false,
        disableClose: true,
        data: {
          tokenDisplayData: tokenDisplayData,
          closeLabel: 'Close',
        },
      };

      matDialog.open.and.returnValue({ afterClosed: () => of(token.serial) } as MatDialogRef<TestDialogComponent>);
      component.runEnrollmentWorkflow(tokenDisplayData);
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(matDialog.open).toHaveBeenCalledWith(EnrollOATHDialogComponent, expectedEnrollDialogConfig);
    }));
});
