import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { NgxPermissionsAllowStubDirective, NgxPermissionsService } from 'ngx-permissions';
import { of } from 'rxjs';

import { Fixtures } from '@testing/fixtures';
import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { EnrollmentService } from '@api/enrollment.service';
import { OperationsService } from '@api/operations.service';
import { TokenService } from '@api/token.service';
import { LoginService } from '@app/login/login.service';
import { MaterialModule } from '@app/material.module';
import { UserSystemInfo } from '@app/system.service';
import { NotificationService } from '@common/notification.service';

import { TokenType } from '@app/api/token';
import { EnrollSMSDialogComponent } from './enroll-sms-dialog.component';
import { TokenPinFormLayoutComponent } from "@app/enroll/token-pin-form-layout/token-pin-form-layout.component";
import { NgSelfServiceCommonModule } from "@common/common.module";
import { CreateTokenStepComponent } from "@app/enroll/create-token-step/create-token-step.component";
import { DoneStepComponent } from "@app/enroll/done-step/done-step.component";
import { VerifyTokenComponent } from "@app/enroll/verify-token/verify-token.component";

describe('The EnrollSMSDialogComponent', () => {
  let component: EnrollSMSDialogComponent;
  let fixture: ComponentFixture<EnrollSMSDialogComponent>;

  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let loginService: jasmine.SpyObj<LoginService>;
  let localStorageSpy: jasmine.Spy;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollSMSDialogComponent,
        CreateTokenStepComponent,
        DoneStepComponent,
        VerifyTokenComponent
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
          useValue: { tokenType: TokenType.SMS },
        },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollSMSDialogComponent);
    component = fixture.componentInstance;

    enrollmentService = getInjectedStub(EnrollmentService);
    loginService = getInjectedStub(LoginService);

    loginService.hasPermission$.and.returnValue(of(true));

    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(
      JSON.stringify({ mobile: Fixtures.userSystemInfo.user.mobile })
    );
  });

  it('should be created', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.data.tokenType).toEqual(TokenType.SMS);
  });

  it('should enroll an sms token with a default description', fakeAsync(() => {
    spyOn(component.stepper, 'next');

    enrollmentService.enroll.and.returnValue(of(Fixtures.smsEnrollmentResponse));

    fixture.detectChanges();

    component.enrollSMSToken();
    tick(100);
    expect(enrollmentService.enroll).toHaveBeenCalledWith({
      type: TokenType.SMS,
      description: `Created via SelfService - ${Fixtures.userSystemInfo.user.mobile}`,
      phone: Fixtures.userSystemInfo.user.mobile,
    });
    expect(component.enrolledToken.serial).toEqual(Fixtures.smsEnrollmentResponse.serial);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
  }));

  it('should enroll an sms token with a custom description', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(component.stepper, 'next');

    enrollmentService.enroll.and.returnValue(of(Fixtures.smsEnrollmentResponse));

    component.data.tokenType = TokenType.SMS;
    component.createTokenForm.controls.description.setValue('custom description');
    fixture.detectChanges();
    component.enrollSMSToken();
    tick(100);

    expect(enrollmentService.enroll).toHaveBeenCalledWith({
      type: TokenType.SMS,
      description: `custom description - ${Fixtures.userSystemInfo.user.mobile}`,
      phone: Fixtures.userSystemInfo.user.mobile,
    });
    expect(component.enrolledToken.serial).toEqual(Fixtures.smsEnrollmentResponse.serial);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
  }));

  describe('edit_sms policy', () => {
    [
      {
        description: 'should have an phone number input if edit_sms is enabled',
        setting: 1,
        canEditPhone: true,
        formItems: ['otpPin', 'description', 'phoneNumber']
      },
      {
        description: 'should have an phone number input if edit_sms is not set',
        setting: undefined,
        canEditPhone: true,
        formItems: ['otpPin', 'description', 'phoneNumber']
      },
      {
        description: 'should not allow to change the token phone number if edit_sms is disabled',
        setting: 0,
        canEditPhone: false,
        formItems: ['otpPin', 'description']
      }
    ].forEach(params => {
      it(params.description, fakeAsync(() => {
        localStorageSpy.and.callFake(key => {
          switch (key) {
            case 'user':
              return JSON.stringify({ mobile: Fixtures.userSystemInfo.user.mobile });
            case 'settings':
              return JSON.stringify(<UserSystemInfo['settings']>{ edit_sms: params.setting });
          }
        });
        enrollmentService.enroll.and.returnValue(of(Fixtures.smsEnrollmentResponse));

        fixture.detectChanges();

        expect(component.canEditPhone).toBe(params.canEditPhone);
        expect(Object.keys(component.createTokenForm.controls)).toEqual(params.formItems);
        expect(component.createTokenForm.valid).toBeTrue()
        component.enrollSMSToken();
        tick(100);

        expect(enrollmentService.enroll).toHaveBeenCalledWith({
          type: TokenType.SMS,
          description: `Created via SelfService - ${Fixtures.userSystemInfo.user.mobile}`,
          phone: Fixtures.userSystemInfo.user.mobile,
        });
      }));
    });
  });
});
