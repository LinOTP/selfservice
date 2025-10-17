import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { NgxPermissionsAllowStubDirective, NgxPermissionsService } from 'ngx-permissions';

import { of } from 'rxjs';

import { MockComponent } from '@testing/mock-component';
import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { EnrollmentService } from '@api/enrollment.service';
import { OperationsService } from '@api/operations.service';
import { TokenService } from '@api/token.service';
import { LoginService } from '@app/login/login.service';
import { MaterialModule } from '@app/material.module';
import { GetSerialDialogComponent } from '@common/get-serial-dialog/get-serial-dialog.component';
import { NotificationService } from '@common/notification.service';

import { AssignTokenDialogComponent } from './assign-token-dialog.component';
import { TestService } from "@api/test.service";
import { SelfserviceToken, TokenType } from "@api/token";
import { CreateTokenStepComponent } from "@app/enroll/create-token-step/create-token-step.component";
import { DoneStepComponent } from "@app/enroll/done-step/done-step.component";
import { VerifyTokenComponent } from "@app/enroll/verify-token/verify-token.component";
import { NgSelfServiceCommonModule } from "@common/common.module";
import { TokenPinFormLayoutComponent } from "@app/enroll/token-pin-form-layout/token-pin-form-layout.component";

describe('AssignTokenDialogComponent', () => {
  let component: AssignTokenDialogComponent;
  let fixture: ComponentFixture<AssignTokenDialogComponent>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let testService: jasmine.SpyObj<TestService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let loginService: jasmine.SpyObj<LoginService>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        AssignTokenDialogComponent,
        CreateTokenStepComponent,
        DoneStepComponent,
        VerifyTokenComponent,
        MockComponent({ selector: 'app-button-wait-indicator', inputs: ['show'] }),
      ],
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        TokenPinFormLayoutComponent,
        NgxPermissionsAllowStubDirective,
        NgSelfServiceCommonModule,
      ],
      providers: [
        {
          provide: EnrollmentService,
          useValue: spyOnClass(EnrollmentService)
        }, {
          provide: TokenService,
          useValue: spyOnClass(TokenService)
        }, {
          provide: TestService,
          useValue: spyOnClass(TestService)
        },
        {
          provide: OperationsService,
          useValue: spyOnClass(OperationsService)
        },
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService)
        },
        {
          provide: LoginService,
          useValue: spyOnClass(LoginService)
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
          provide: NgxPermissionsService,
          useValue: spyOnClass(NgxPermissionsService)
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { tokenType: 'assign' },
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignTokenDialogComponent);
    component = fixture.componentInstance;

    dialog = getInjectedStub(MatDialog);

    enrollmentService = getInjectedStub(EnrollmentService);
    notificationService = getInjectedStub(NotificationService);
    loginService = getInjectedStub(LoginService);
    tokenService = getInjectedStub(TokenService);
    testService = getInjectedStub(TestService);
    loginService.hasPermission$.and.returnValue(of(true));
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ otp_pin_minlength: 0 }));

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should set description to "Assigned via self-service" on initialization', () => {
    expect(component.createTokenForm.get('description').value).toBe('Assigned via self-service');
  });

  describe('assignToken', () => {

    it('should be successful when assignment is successful', fakeAsync(() => {
      const mockTokenResponse = {
        serial: 'abc123',
        tokenType: TokenType.TOTP,
        description: 'Test Token'
      };

      // Mock die getToken Methode
      tokenService.getToken.and.returnValue(of(mockTokenResponse as unknown as SelfserviceToken));
      testService.testToken.and.returnValue(of(true));
      enrollmentService.assign.and.returnValue(of({ success: true }));

      component.stepper.selectedIndex = 0;
      component.createTokenForm.patchValue({ serial: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.assignToken();

      expect(tokenService.getToken).toHaveBeenCalledWith('abc123');
      expect(component.stepper.selectedIndex).toEqual(1);
    }));


    it('should fail when assignment request returns and display an error message on failure', fakeAsync(() => {
      enrollmentService.assign.and.returnValue(of({ success: false, message: 'an error occurred' }));

      component.stepper.selectedIndex = 0;
      component.createTokenForm.patchValue({ serial: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.assignToken();
      tick();

      expect(component.stepper.selectedIndex).toEqual(0);
      expect(notificationService.errorMessage).toHaveBeenCalledWith('Token assignment failed.');
    }));
  });

  describe('getSerial', () => {
    it('should open the getSerial dialog and assign the return value to the serial control', () => {

      dialog.open.and.returnValue({ afterClosed: () => of('serial') } as MatDialogRef<GetSerialDialogComponent>);

      expect(component.createTokenForm.controls.serial.value).toEqual('');

      component.getSerial();
      fixture.detectChanges();

      expect(dialog.open).toHaveBeenCalledWith(GetSerialDialogComponent);
      expect(component.createTokenForm.controls.serial.value).toEqual('serial');
    });

    it('should open the getSerial dialog and keep the serial unchanged if the return value is not truthy', () => {

      dialog.open.and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<GetSerialDialogComponent>);

      component.createTokenForm.controls.serial.setValue('some value');

      component.getSerial();
      fixture.detectChanges();

      expect(dialog.open).toHaveBeenCalledWith(GetSerialDialogComponent);
      expect(component.createTokenForm.controls.serial.value).toEqual('some value');
    });

  });

});
