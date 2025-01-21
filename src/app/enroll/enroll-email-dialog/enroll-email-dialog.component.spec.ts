import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { UserSystemInfo } from '@app/system.service';
import { NotificationService } from '@common/notification.service';

import { TokenType } from '@app/api/token';
import { EnrollEmailDialogComponent } from './enroll-email-dialog.component';
import { DoneStepComponent } from "@app/enroll/enroll-oath-dialog/oath-enrollment/done-step.component";
import { TokenInfoComponent } from "@app/enroll/enroll-oath-dialog/oath-enrollment/token-info.component";
import { CreateTokenStepComponent } from "@app/enroll/enroll-oath-dialog/oath-enrollment/create-token-step.component";
import { TokenPinFormLayoutComponent } from "@app/enroll/token-pin-form-layout/token-pin-form-layout.component";

describe('The EnrollEmailDialogComponent', () => {
  let component: EnrollEmailDialogComponent;
  let fixture: ComponentFixture<EnrollEmailDialogComponent>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let loginService: jasmine.SpyObj<LoginService>;
  let localStorageSpy: jasmine.Spy;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollEmailDialogComponent,
        CreateTokenStepComponent,
        DoneStepComponent,
        TokenInfoComponent,
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
          useValue: { tokenType: TokenType.EMAIL },
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollEmailDialogComponent);
    component = fixture.componentInstance;

    enrollmentService = getInjectedStub(EnrollmentService);
    loginService = getInjectedStub(LoginService);

    loginService.hasPermission$.and.returnValue(of(true));

    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(
      JSON.stringify({ email: Fixtures.userSystemInfo.user.email })
    );
  });

  it('should be created', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.data.tokenType).toEqual(TokenType.EMAIL);
  });

  it('should enroll an email token with a default description', fakeAsync(() => {
    spyOn(component.stepper, 'next');

    enrollmentService.enroll.and.returnValue(of(Fixtures.emailEnrollmentResponse));

    fixture.detectChanges();

    component.enrollEmailToken();
    tick(100);

    expect(enrollmentService.enroll).toHaveBeenCalledWith({
      type: TokenType.EMAIL,
      description: `Created via SelfService - ${Fixtures.userSystemInfo.user.email}`,
      email_address: Fixtures.userSystemInfo.user.email,
    });
    expect(component.enrolledToken.serial).toEqual(Fixtures.emailEnrollmentResponse.serial);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
  }));

  it('should enroll an email token with a custom description', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(component.stepper, 'next');

    enrollmentService.enroll.and.returnValue(of(Fixtures.emailEnrollmentResponse));

    component.data.tokenType = TokenType.EMAIL;
    component.createTokenForm.controls.description.setValue('custom description');
    fixture.detectChanges();
    component.enrollEmailToken();
    tick(100);

    expect(enrollmentService.enroll).toHaveBeenCalledWith({
      type: TokenType.EMAIL,
      description: `custom description - ${Fixtures.userSystemInfo.user.email}`,
      email_address: Fixtures.userSystemInfo.user.email,
    });
    expect(component.enrolledToken.serial).toEqual(Fixtures.emailEnrollmentResponse.serial);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
  }));

  describe('edit_email policy', () => {
    [
      {
        description: 'should have an email address input if edit_email is enabled',
        setting: 1,
        canEditEmail: true,
        formItems: ['otpPin', 'description', 'emailAddress']
      },
      {
        description: 'should have an email address input if edit_email is not set',
        setting: undefined,
        canEditEmail: true,
        formItems: ['otpPin', 'description', 'emailAddress']
      },
      {
        description: 'should not allow to change the token email address if edit_email is disabled',
        setting: 0,
        canEditEmail: false,
        formItems: ['otpPin', 'description']
      }
    ].forEach(params => {
      it(params.description, fakeAsync(() => {
        localStorageSpy.and.callFake(key => {
          switch (key) {
            case 'user':
              return JSON.stringify({ email: Fixtures.userSystemInfo.user.email });
            case 'settings':
              return JSON.stringify(<UserSystemInfo['settings']>{ edit_email: params.setting });
          }
        });
        enrollmentService.enroll.and.returnValue(of(Fixtures.emailEnrollmentResponse));

        fixture.detectChanges();

        expect(component.canEditEmail).toBe(params.canEditEmail);
        expect(Object.keys(component.createTokenForm.controls)).toEqual(params.formItems);

        component.enrollEmailToken();
        tick(100);

        expect(enrollmentService.enroll).toHaveBeenCalledWith({
          type: TokenType.EMAIL,
          description: `Created via SelfService - ${Fixtures.userSystemInfo.user.email}`,
          email_address: Fixtures.userSystemInfo.user.email,
        });
      }));
    });
  });

  it('should allow retrying if enrollment failed', fakeAsync(() => {
    enrollmentService.enroll.and.returnValue(of(null));
    fixture.detectChanges();
    const result = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    result.click();
    tick(100);

    expect(component.enrolledToken).toEqual(undefined);
  }));
});
