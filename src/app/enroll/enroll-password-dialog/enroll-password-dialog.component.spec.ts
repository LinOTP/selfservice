import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { NgxPermissionsAllowStubDirective, NgxPermissionsService } from 'ngx-permissions';
import { of } from 'rxjs';


import { Fixtures } from '@testing/fixtures';
import { MockComponent } from '@testing/mock-component';
import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { EnrollmentService } from '@api/enrollment.service';
import { OperationsService } from '@api/operations.service';
import { TokenService } from '@api/token.service';
import { LoginService } from '@app/login/login.service';
import { MaterialModule } from '@app/material.module';
import { NotificationService } from '@common/notification.service';

import { TokenType } from '@app/api/token';
import { TokenPinFormLayoutComponent } from '../token-pin-form-layout/token-pin-form-layout.component';
import { EnrollPasswordDialogComponent } from './enroll-password-dialog.component';


describe('The EnrollPasswordDialogComponent', () => {
  let component: EnrollPasswordDialogComponent;
  let fixture: ComponentFixture<EnrollPasswordDialogComponent>;

  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let loginService: jasmine.SpyObj<LoginService>;

  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollPasswordDialogComponent>>;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollPasswordDialogComponent,
        MockComponent({ selector: 'app-button-wait-indicator', inputs: ['show'] }),
      ],
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        NoopAnimationsModule,
        NgxPermissionsAllowStubDirective,
        TokenPinFormLayoutComponent
      ],
      providers: [
        {
          provide: OperationsService,
          useValue: spyOnClass(OperationsService)
        },
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService)
        },
        {
          provide: EnrollmentService,
          useValue: spyOnClass(EnrollmentService)
        },
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService),
        },
        {
          provide: LoginService,
          useValue: spyOnClass(LoginService),
        },
        {
          provide: NgxPermissionsService,
          useValue: spyOnClass(NgxPermissionsService),
        },
        {
          provide: MatDialog,
          useValue: spyOnClass(MatDialog),
        },
        {
          provide: MatDialogRef,
          useValue: spyOnClass(MatDialogRef),
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { tokenType: TokenType.PASSWORD },
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollPasswordDialogComponent);
    component = fixture.componentInstance;

    enrollmentService = getInjectedStub(EnrollmentService);
    loginService = getInjectedStub(LoginService);

    dialogRef = getInjectedStub<MatDialogRef<EnrollPasswordDialogComponent>>(MatDialogRef);
    dialog = getInjectedStub(MatDialog);

    loginService.hasPermission$.and.returnValue(of(true));
    (component as any)._getPermissions = () => of(false);

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(component.data.tokenType).toEqual(TokenType.PASSWORD);
  });

  it('should not allow enrollment if the passwords differ', fakeAsync(() => {
    const button: MatButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    component.data.tokenType = TokenType.PASSWORD;
    component.createTokenForm.controls.password.setValue('111111');
    component.createTokenForm.controls.confirmation.setValue('222222');

    fixture.detectChanges();

    tick();
    expect(button.disabled).toEqual(true);
    expect(component.createTokenForm.disabled).toEqual(false);

  }));

  describe('enrollPWToken', () => {
    it('should enroll a password token with a default description', fakeAsync(() => {

      enrollmentService.enroll.and.returnValue(of(Fixtures.PasswordEnrollmentResponse));
      const serial = Fixtures.PasswordEnrollmentResponse.serial;

      component.data.tokenType = TokenType.PASSWORD;
      component.createTokenForm.controls.password.setValue('111111');
      component.createTokenForm.controls.confirmation.setValue('111111');
      component.setOtpPinPolicyEnabled = false;
      expect(component.createTokenForm.controls.otpPin.enabled).toEqual(false);


      fixture.detectChanges();
      component.enrollPWToken();
      tick();

      expect(enrollmentService.enroll).toHaveBeenCalledWith({
        type: TokenType.PASSWORD,
        description: 'Created via SelfService',
        otpkey: '111111'
      });

      expect(component.enrolledToken.serial).toEqual(serial);
      expect(component.createTokenForm.disabled).toEqual(true);
    }));

    it('should enroll a password token with otppin', fakeAsync(() => {
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ otp_pin_minlength: 1 }));
      (component as any).setOtpPinPolicyEnabled = true;
      enrollmentService.enroll.and.returnValue(of(Fixtures.PasswordEnrollmentResponse));

      component.data.tokenType = TokenType.PASSWORD;
      component.createTokenForm.controls.password.setValue('111111');
      component.createTokenForm.controls.confirmation.setValue('111111');
      component.createTokenForm.controls.otpPin.get('pin').setValue('1234');
      component.createTokenForm.controls.otpPin.get('confirmPin').setValue('1234');

      expect(component.createTokenForm.controls.otpPin.enabled).toEqual(true);

      fixture.detectChanges();
      component.enrollPWToken();
      tick();

      expect(enrollmentService.enroll).toHaveBeenCalledWith({
        type: TokenType.PASSWORD,
        description: 'Created via SelfService',
        otpkey: '111111',
        otppin: '1234'
      });
    }));


    it('should enroll a password token with a custom description', fakeAsync(() => {
      enrollmentService.enroll.and.returnValue(of(Fixtures.PasswordEnrollmentResponse));
      const serial = Fixtures.PasswordEnrollmentResponse.serial;

      component.data.tokenType = TokenType.PASSWORD;
      component.createTokenForm.controls.description.setValue('custom description');
      component.createTokenForm.controls.password.setValue('111111');
      component.createTokenForm.controls.confirmation.setValue('111111');

      fixture.detectChanges();
      component.enrollPWToken();
      tick();

      expect(enrollmentService.enroll).toHaveBeenCalledWith({
        type: TokenType.PASSWORD,
        description: 'custom description',
        otpkey: '111111'
      });

      expect(component.enrolledToken.serial).toEqual(serial);
      expect(component.createTokenForm.disabled).toEqual(true);
    }));

    it('should allow retrying if enrollment failed', fakeAsync(() => {
      component.data.tokenType = TokenType.PASSWORD;
      component.createTokenForm.controls.password.setValue('111111');

      enrollmentService.enroll.and.returnValue(of(null));

      fixture.detectChanges();
      component.enrollPWToken();
      tick();

      expect(component.enrolledToken).toEqual(undefined);
      expect(component.createTokenForm.disabled).toEqual(false);
    }));
  });

  describe('finalizeEnrollment', () => {
    it(`should not open the TestDialog even if the user has permissions to test a token`, () => {
      component.testAfterEnrollment = true;
      fixture.detectChanges();

      component.enrolledToken = { serial: 'serial', type: TokenType.PASSWORD };
      fixture.detectChanges();

      component.finalizeEnrollment();
      expect(dialog.open).not.toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });
  });
});
