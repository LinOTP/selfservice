import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
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
import { EnrollMOTPDialogComponent } from './enroll-motp-dialog.component';
import { CreateTokenStepComponent } from "@app/enroll/create-token-step/create-token-step.component";
import { DoneStepComponent } from "@app/enroll/done-step/done-step.component";
import { VerifyTokenComponent } from "@app/enroll/verify-token/verify-token.component";
import { TokenPinFormLayoutComponent } from "@app/enroll/token-pin-form-layout/token-pin-form-layout.component";
import { NgSelfServiceCommonModule } from "@common/common.module";

const enrolledToken = {
  serial: Fixtures.mOTPEnrollmentResponse.serial,
  type: TokenType.MOTP,
  description: 'Created via self-service'
};

describe('EnrollMOTPDialogComponent', () => {
  let component: EnrollMOTPDialogComponent;
  let fixture: ComponentFixture<EnrollMOTPDialogComponent>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let loginService: jasmine.SpyObj<LoginService>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollMOTPDialogComponent,
        CreateTokenStepComponent,
        DoneStepComponent,
        VerifyTokenComponent,
        MockComponent({ selector: 'app-button-wait-indicator', inputs: ['show'] }),
      ],
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        NoopAnimationsModule,
        NgxPermissionsAllowStubDirective,
        TokenPinFormLayoutComponent,
        NgSelfServiceCommonModule,
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
          useValue: { tokenType: TokenType.MOTP },
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollMOTPDialogComponent);
    component = fixture.componentInstance;

    enrollmentService = getInjectedStub(EnrollmentService);
    loginService = getInjectedStub(LoginService);

    loginService.hasPermission$.and.returnValue(of(true));
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ otp_pin_minlength: 0 }));

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(component.data.tokenType).toEqual(TokenType.MOTP);
  });

  describe('enrollMOTPToken', () => {
    it('should enroll an mOTP token with a default description', fakeAsync(() => {
      spyOn(component.stepper, 'next');

      enrollmentService.enroll.and.returnValue(of(Fixtures.mOTPEnrollmentResponse));
      const expectedToken = enrolledToken;
      component.ngOnInit()
      fixture.detectChanges();

      component.createTokenForm.controls.password.setValue('0123456789ABCDEF');
      component.createTokenForm.controls.mOTPPin.setValue('1234');

      fixture.detectChanges();
      expect(component.createTokenForm.valid).toBeTrue()
      component.enrollMOTPToken();
      tick(500);

      expect(enrollmentService.enroll).toHaveBeenCalledWith({
        type: TokenType.MOTP,
        otpkey: '0123456789ABCDEF',
        otppin: '1234',
        description: `Created via self-service`,
      });
      expect(component.enrolledToken).toEqual(expectedToken);
      expect(component.stepper.next).toHaveBeenCalledTimes(1);
    }));

    it('should enroll an mOTP token with a custom description', fakeAsync(() => {
      spyOn(component.stepper, 'next');

      const expectedToken = enrolledToken;
      enrollmentService.enroll.and.returnValue(of(Fixtures.mOTPEnrollmentResponse));
      component.createTokenForm.controls.password.setValue('0123456789ABCDEF');
      component.createTokenForm.controls.mOTPPin.setValue('1234');
      component.createTokenForm.controls.description.setValue('custom description');

      fixture.detectChanges();
      expect(component.createTokenForm.valid).toBeTrue()
      component.enrollMOTPToken();
      tick(500);

      expect(enrollmentService.enroll).toHaveBeenCalledWith({
        type: TokenType.MOTP,
        otpkey: '0123456789ABCDEF',
        otppin: '1234',
        description: `custom description`,
      });

      expect(component.enrolledToken).toEqual({ ...expectedToken, description: "custom description" });
      expect(component.stepper.next).toHaveBeenCalledTimes(1);
    }));

    it('should allow retrying if enrollment failed', fakeAsync(() => {

      enrollmentService.enroll.and.returnValue(of(null));
      fixture.detectChanges();

      component.enrollMOTPToken();
      tick();

      expect(component.enrolledToken).toEqual(undefined);
      expect(component.createTokenForm.disabled).toEqual(false);
    }));

    it('should not be called if form is invalid', fakeAsync(() => {
      spyOn(component.stepper, 'next');

      enrollmentService.enroll.and.returnValue(of(Fixtures.mOTPEnrollmentResponse));
      // digits and A-F allowed
      component.createTokenForm.controls.password.setValue('J');
      component.createTokenForm.controls.mOTPPin.setValue('1234');
      fixture.detectChanges();
      tick();
      component.enrollMOTPToken();

      expect(enrollmentService.enroll).not.toHaveBeenCalled();
      expect(component.stepper.next).not.toHaveBeenCalled();

      // < 12 characters
      component.createTokenForm.controls.password.setValue('ABCDEF');
      component.createTokenForm.controls.mOTPPin.setValue('1234');

      fixture.detectChanges();

      component.enrollMOTPToken();
      tick();

      expect(enrollmentService.enroll).not.toHaveBeenCalled();
      expect(component.stepper.next).not.toHaveBeenCalled();

      //motppin empty
      component.createTokenForm.controls.password.setValue('0123456789ABCDEF');
      component.createTokenForm.controls.mOTPPin.setValue('');

      fixture.detectChanges();

      component.enrollMOTPToken();
      tick();

      expect(enrollmentService.enroll).not.toHaveBeenCalled();
      expect(component.stepper.next).not.toHaveBeenCalled();
      expect(component.createTokenForm.disabled).toEqual(false);
    }));

  });
});
