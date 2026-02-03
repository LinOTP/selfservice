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
import { NgSelfServiceCommonModule } from "@common/common.module";
import { EnrollOATHDialogComponent } from './enroll-oath-dialog.component';


[TokenType.HOTP, TokenType.TOTP].forEach(inputType =>
  describe('The EnrollOATHDialogComponent', () => {
    let component: EnrollOATHDialogComponent;
    let fixture: ComponentFixture<EnrollOATHDialogComponent>;
    let enrollmentService: jasmine.SpyObj<EnrollmentService>;
    let loginService: jasmine.SpyObj<LoginService>;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        declarations: [
          EnrollOATHDialogComponent,
        ],
        imports: [
          RouterTestingModule,
          FormsModule,
          ReactiveFormsModule,
          MaterialModule,
          NoopAnimationsModule,
          NgxPermissionsAllowStubDirective,
          NgSelfServiceCommonModule,
          MockComponent({ selector: 'qrcode', inputs: ['qrdata', 'width', 'errorCorrectionLevel'] }),
          MockComponent({ selector: 'app-authenticator-links', inputs: ['platform', 'tokenType'] }),
          MockComponent({ selector: 'app-import-token-step', inputs: ['enrolledToken', 'verifyFlowEnabled'] }),
          MockComponent({ selector: 'app-create-token-step', inputs: ['form'] }),
          MockComponent({ selector: 'app-done-step', inputs: ['token'] }),
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
            useValue: { tokenType: inputType },
          },
        ],
      })
        .compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(EnrollOATHDialogComponent);
      component = fixture.componentInstance;

      enrollmentService = getInjectedStub(EnrollmentService);
      loginService = getInjectedStub(LoginService);

      loginService.hasPermission$.and.returnValue(of(true));
      (component as any)._getPermissions = () => of({ verify: true, setPin: true });
      fixture.detectChanges();
    });

    it('should be created', () => {
      expect(component).toBeTruthy();
      expect(component.data.tokenType).toEqual(inputType);
    });

    it(`should enroll a ${inputType} token with a default description`, fakeAsync(() => {
      spyOn(component.stepper, 'next');

      enrollmentService.enroll.and.returnValue(of(Fixtures.OATHEnrollmentResponse));
      const expectedToken = { ...Fixtures.enrolledToken, type: inputType, description: 'Created via self-service' };

      fixture.detectChanges();
      component.enrollOATHToken();
      tick(100);

      expect(enrollmentService.enroll).toHaveBeenCalledWith({
        type: inputType,
        description: 'Created via self-service',
        pin: ''
      });
      expect(component.enrolledToken).toEqual(expectedToken);
      expect(component.stepper.next).toHaveBeenCalledTimes(1);
      expect(component.createTokenForm.disabled).toEqual(false);
    }));

    it('should enroll a ${inputType} token with a custom description', fakeAsync(() => {
      spyOn(component.stepper, 'next');

      enrollmentService.enroll.and.returnValue(of(Fixtures.OATHEnrollmentResponse));
      const expectedToken = { ...Fixtures.enrolledToken, type: inputType, description: 'custom description' };
      expect(component.createTokenForm.get('pinForm').enabled).toEqual(true);

      component.createTokenForm.get("description").setValue('custom description');
      fixture.detectChanges();
      component.enrollOATHToken();
      tick(100);

      expect(enrollmentService.enroll).toHaveBeenCalledWith({
        type: inputType,
        description: 'custom description',
        pin: '',
      });
      expect(component.enrolledToken).toEqual(expectedToken);
      expect(component.stepper.next).toHaveBeenCalledTimes(1);
      expect(component.createTokenForm.disabled).toEqual(false);
    }));

    it('should enroll a ${inputType} token without pin', fakeAsync(() => {
      spyOn(component.stepper, 'next');
      component.setOtpPinPolicyEnabled = false;
      expect(component.createTokenForm.get('pinForm').enabled).toEqual(false);
      enrollmentService.enroll.and.returnValue(of(Fixtures.OATHEnrollmentResponse));

      component.createTokenForm.get("description").setValue('custom description');
      fixture.detectChanges();
      component.enrollOATHToken();
      tick(100);

      expect(enrollmentService.enroll).toHaveBeenCalledWith({
        type: inputType,
        description: 'custom description',
      });
    }));
  })
);
