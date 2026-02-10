import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { LiveAnnouncer } from '@angular/cdk/a11y';
import { NgxPermissionsAllowStubDirective, NgxPermissionsService } from 'ngx-permissions';
import { of } from 'rxjs';

import { MockComponent } from '@testing/mock-component';
import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { EnrollmentService } from '@api/enrollment.service';
import { MaterialModule } from '@app/material.module';

import { OperationsService } from '@api/operations.service';
import { TokenService } from '@api/token.service';
import { LoginService } from '@app/login/login.service';
import { NotificationService } from '@common/notification.service';

import { EnrollYubicoDialogComponent } from './enroll-yubico-dialog.component';
import { CreateTokenStepComponent } from "@app/enroll/create-token-step/create-token-step.component";
import { DoneStepComponent } from "@app/enroll/done-step/done-step.component";
import { TokenInfoComponent } from "@app/enroll/enroll-oath-dialog/oath-enrollment/token-info.component";
import { StepActionsComponent } from "@app/enroll/step-actions/step-actions.component";
import { NgSelfServiceCommonModule } from "@common/common.module";
import { TokenPinFormLayoutComponent } from "@app/enroll/token-pin-form-layout/token-pin-form-layout.component";

describe('EnrollYubicoDialogComponent', () => {
  let component: EnrollYubicoDialogComponent;
  let fixture: ComponentFixture<EnrollYubicoDialogComponent>;

  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let loginService: jasmine.SpyObj<LoginService>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollYubicoDialogComponent,
        CreateTokenStepComponent,
        DoneStepComponent,
        TokenInfoComponent,
        StepActionsComponent,
      ],
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        NgxPermissionsAllowStubDirective,
        TokenPinFormLayoutComponent,
        NgSelfServiceCommonModule,
        MockComponent({ selector: 'app-button-wait-indicator', inputs: ['show'] }),
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
          useValue: spyOnClass(NotificationService)
        },
        {
          provide: LoginService,
          useValue: spyOnClass(LoginService),
        },
        {
          provide: MatDialogRef,
          useValue: spyOnClass(MatDialogRef),
        },
        {
          provide: NgxPermissionsService,
          useValue: spyOnClass(NgxPermissionsService)
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { closeLabel: null },
        },        { provide: LiveAnnouncer, useValue: spyOnClass(LiveAnnouncer) },      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollYubicoDialogComponent);
    component = fixture.componentInstance;

    enrollmentService = getInjectedStub(EnrollmentService);
    loginService = getInjectedStub(LoginService);

    loginService.hasPermission$.and.returnValue(of(true));
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ otp_pin_minlength: 0 }));

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('registerToken', () => {

    it('should be successful when registration is successful', fakeAsync(() => {
      enrollmentService.enroll.and.returnValue(of({ serial: 'serial' }));

      component.stepper.selectedIndex = 0;
      component.createTokenForm.patchValue({ publicId: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.registerToken();

      tick(500)
      expect(component.stepper.selectedIndex).toEqual(1);
    }));

    it('should fail when registration request returns and stay on the same step', () => {
      enrollmentService.enroll.and.returnValue(of(null));

      component.stepper.selectedIndex = 0;
      component.createTokenForm.patchValue({ publicId: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.registerToken();
      expect(component.stepper.selectedIndex).toEqual(0);
    });
  });
});
