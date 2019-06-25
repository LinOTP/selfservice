import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { EnrollmentGridComponent } from './enrollment-grid.component';
import { MaterialModule } from '../material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs/internal/observable/of';
import { NotificationService } from '../common/notification.service';
import { spyOnClass } from '../../testing/spyOnClass';
import { MatDialog } from '@angular/material';
import { TokenTypeDetails, TokenType } from '../api/token';
import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';
import { Fixtures } from '../../testing/fixtures';
import { CapitalizePipe } from '../common/pipes/capitalize.pipe';
import { TokenService } from '../api/token.service';
import { EnrollOtpDialogComponent } from '../enroll/enroll-otp-dialog/enroll-otp-dialog.component';
import { TestOTPDialogComponent } from '../test/test-otp/test-otp-dialog.component';
import { EnrollPushDialogComponent } from '../enroll/enroll-push-dialog/enroll-push-dialog.component';
import { TestPushDialogComponent } from '../test/test-push/test-push-dialog.component';

describe('EnrollmentGridComponent', () => {
  let component: EnrollmentGridComponent;
  let fixture: ComponentFixture<EnrollmentGridComponent>;
  let notificationService: NotificationService;
  let tokenService: jasmine.SpyObj<TokenService>;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let tokenUpdateSpy;

  beforeEach(async(() => {
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
        { provide: MatDialog, useValue: spyOnClass(MatDialog) }

      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollmentGridComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.get(NotificationService);
    tokenService = TestBed.get(TokenService);
    matDialog = TestBed.get(MatDialog);
    tokenUpdateSpy = spyOn(component.tokenUpdate, 'next');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the HOTP dialog and update the token list when completed', fakeAsync(() => {
    const token = Fixtures.activeHotpToken;
    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { type: TokenType.HOTP, closeLabel: 'Test Token' },
    };
    const expectedTestDialogConfig = {
      width: '650px',
      data: { token: token },
    };

    const testToken: TokenTypeDetails = Fixtures.hmacTokenType;

    matDialog.open.and.returnValues({ afterClosed: () => of(token.serial) }, { afterClosed: () => of(true) });
    tokenService.getToken.and.returnValue(of(token));
    component.runEnrollmentWorkflow(testToken);
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(EnrollOtpDialogComponent, expectedEnrollDialogConfig);
    expect(tokenService.getToken).toHaveBeenCalledWith(token.serial);
    expect(matDialog.open).toHaveBeenCalledWith(TestOTPDialogComponent, expectedTestDialogConfig);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(2);
  }));

  it('should notify the user if there was an issue retrieving the token before the test', fakeAsync(() => {
    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { type: TokenType.HOTP, closeLabel: 'Test Token' },
    };

    const testToken: TokenTypeDetails = Fixtures.hmacTokenType;

    matDialog.open.and.returnValue({ afterClosed: () => of('serial') });
    tokenService.getToken.and.returnValue(of(null));
    component.runEnrollmentWorkflow(testToken);
    tick();

    expect(matDialog.open).toHaveBeenCalledTimes(1);
    expect(matDialog.open).toHaveBeenCalledWith(EnrollOtpDialogComponent, expectedEnrollDialogConfig);
    expect(notificationService.message).toHaveBeenCalledWith('There was a problem starting the token test, please try manually later.');
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
  }));

  it('should not notify the user if the enrollment was cancelled', fakeAsync(() => {
    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { type: TokenType.HOTP, closeLabel: 'Test Token' },
    };

    const testToken: TokenTypeDetails = Fixtures.hmacTokenType;

    matDialog.open.and.returnValue({ afterClosed: () => of(null) });
    component.runEnrollmentWorkflow(testToken);
    tick();

    expect(matDialog.open).toHaveBeenCalledTimes(1);
    expect(matDialog.open).toHaveBeenCalledWith(EnrollOtpDialogComponent, expectedEnrollDialogConfig);
    expect(notificationService.message).not.toHaveBeenCalled();
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
  }));

  it('should open the TOTP dialog and update the token list when completed', fakeAsync(() => {
    const token = Fixtures.activeTotpToken;
    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { type: TokenType.TOTP, closeLabel: 'Test Token' },
    };
    const expectedTestDialogConfig = {
      width: '650px',
      data: { token: token },
    };

    const testToken: TokenTypeDetails = Fixtures.totpTokenType;

    matDialog.open.and.returnValues({ afterClosed: () => of(token.serial) }, { afterClosed: () => of(true) });
    tokenService.getToken.and.returnValue(of(token));
    component.runEnrollmentWorkflow(testToken);
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(EnrollOtpDialogComponent, expectedEnrollDialogConfig);
    expect(tokenService.getToken).toHaveBeenCalledWith(token.serial);
    expect(matDialog.open).toHaveBeenCalledWith(TestOTPDialogComponent, expectedTestDialogConfig);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(2);
  }));

  it('should open the Push dialog and trigger the token list updater', fakeAsync(() => {
    const token = Fixtures.unpairedPushToken;
    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { closeLabel: 'Activate Token' },
    };

    const testToken: TokenTypeDetails = Fixtures.pushTokenType;

    const expectedTestDialogConfig = {
      width: '650px',
      data: { token: token, activate: true },
    };

    matDialog.open.and.returnValues({ afterClosed: () => of(token.serial) }, { afterClosed: () => of(true) });
    tokenService.getToken.and.returnValue(of(token));
    component.runEnrollmentWorkflow(testToken);
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(EnrollPushDialogComponent, expectedEnrollDialogConfig);
    expect(tokenService.getToken).toHaveBeenCalledWith(token.serial);
    expect(matDialog.open).toHaveBeenCalledWith(TestPushDialogComponent, expectedTestDialogConfig);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(2);
    expect(notificationService.message).not.toHaveBeenCalled();
  }));

  it('should notify the user if the token cannot be enrolled', fakeAsync(() => {

    const testToken: TokenTypeDetails = Fixtures.unknownTokenType;
    component.runEnrollmentWorkflow(testToken);
    tick();

    expect(matDialog.open).toHaveBeenCalledTimes(0);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(0);
    expect(notificationService.message).toHaveBeenCalledTimes(1);
    expect(notificationService.message).toHaveBeenCalledWith('The selected token type cannot be enrolled at the moment.');
  }));

});
