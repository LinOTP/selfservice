import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';
import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { spyOnClass } from '../../../testing/spyOnClass';
import { I18nMock } from '../../../testing/i18n-mock-provider';

import { MaterialModule } from '../../material.module';
import { TokenType } from '../../api/token';
import { OperationsService } from '../../api/operations.service';
import { EnrollmentService } from '../../api/enrollment.service';
import { NotificationService } from '../../common/notification.service';

import { EnrollMOTPDialogComponent } from './enroll-motp-dialog.component';

const enrolledToken = {
  serial: Fixtures.mOTPEnrollmentResponse.detail.serial,
};

describe('EnrollMOTPDialogComponent', () => {
  let component: EnrollMOTPDialogComponent;
  let fixture: ComponentFixture<EnrollMOTPDialogComponent>;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let notificationService: NotificationService;
  let operationsService: jasmine.SpyObj<OperationsService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollMOTPDialogComponent>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollMOTPDialogComponent,
        NgxPermissionsAllowStubDirective,
      ],
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: OperationsService,
          useValue: spyOnClass(OperationsService)
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
          provide: MatDialog,
          useValue: spyOnClass(MatDialog),
        },
        {
          provide: MatDialogRef,
          useValue: spyOnClass(MatDialogRef),
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { tokenTypeDetails: Fixtures.tokenTypeDetails[TokenType.MOTP], closeLabel: null },
        },
        I18nMock,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollMOTPDialogComponent);
    component = fixture.componentInstance;

    matDialog = TestBed.get(MatDialog);
    notificationService = TestBed.get(NotificationService);
    operationsService = TestBed.get(OperationsService);
    enrollmentService = TestBed.get(EnrollmentService);
    dialogRef = TestBed.get(MatDialogRef);

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(component.data.tokenTypeDetails.type).toEqual(TokenType.MOTP);
  });

  describe('setPin', () => {
    it('should set pin of token and output message', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });

      component.enrolledToken = enrolledToken;
      component.setPin();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(component.pinSet).toEqual(true);
      expect(notificationService.message).toHaveBeenCalledWith('PIN set');
    }));

    it('should not do anything if the user closes the dialog', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) });

      component.enrolledToken = enrolledToken;
      component.setPin();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(notificationService.message).not.toHaveBeenCalled();
    }));
  });

  describe('enrollToken', () => {
    it('should enroll an mOTP token with a default description', fakeAsync(() => {
      spyOn(component.stepper, 'next');

      enrollmentService.enroll.and.returnValue(of(Fixtures.mOTPEnrollmentResponse));
      const expectedToken = enrolledToken;
      component.enrollmentStep.controls.password.setValue('0123456789ABCDEF');
      component.enrollmentStep.controls.mOTPPin.setValue('1234');

      fixture.detectChanges();

      component.enrollToken();
      tick();

      expect(enrollmentService.enroll).toHaveBeenCalledWith({
        type: TokenType.MOTP,
        otpkey: '0123456789ABCDEF',
        otppin: '1234',
        description: `Created via SelfService`,
      });
      expect(component.enrolledToken).toEqual(expectedToken);
      expect(component.stepper.next).toHaveBeenCalledTimes(1);
    }));

    it('should enroll an mOTP token with a custom description', fakeAsync(() => {
      spyOn(component.stepper, 'next');

      const expectedToken = enrolledToken;
      enrollmentService.enroll.and.returnValue(of(Fixtures.mOTPEnrollmentResponse));
      component.enrollmentStep.controls.password.setValue('0123456789ABCDEF');
      component.enrollmentStep.controls.mOTPPin.setValue('1234');
      component.enrollmentStep.controls.description.setValue('custom description');

      fixture.detectChanges();
      component.enrollToken();
      tick();

      expect(enrollmentService.enroll).toHaveBeenCalledWith({
        type: TokenType.MOTP,
        otpkey: '0123456789ABCDEF',
        otppin: '1234',
        description: `custom description`,
      });
      expect(component.enrolledToken).toEqual(expectedToken);
      expect(component.stepper.next).toHaveBeenCalledTimes(1);
    }));

    it('should notify user if enrollment failed', fakeAsync(() => {
      const mockEnrollmentResponse = Fixtures.mOTPEnrollmentResponse;
      mockEnrollmentResponse.result.value = false;

      enrollmentService.enroll.and.returnValue(of(mockEnrollmentResponse));
      fixture.detectChanges();

      component.enrollToken();
      tick();

      expect(component.enrolledToken).toEqual(undefined);
      expect(notificationService.message).toHaveBeenCalledTimes(1);
    }));

    it('should not be called on button click if form is invalid', fakeAsync(() => {
      spyOn(component.stepper, 'next');

      const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;

      enrollmentService.enroll.and.returnValue(of(Fixtures.mOTPEnrollmentResponse));
      component.enrollmentStep.controls.password.setValue('J');
      component.enrollmentStep.controls.mOTPPin.setValue('1234');

      fixture.detectChanges();

      nextButton.click();
      tick();

      expect(enrollmentService.enroll).not.toHaveBeenCalled();
      expect(component.stepper.next).not.toHaveBeenCalled();

      component.enrollmentStep.controls.password.setValue('ABCDEF');
      component.enrollmentStep.controls.mOTPPin.setValue('1234');

      fixture.detectChanges();

      nextButton.click();
      tick();

      expect(enrollmentService.enroll).not.toHaveBeenCalled();
      expect(component.stepper.next).not.toHaveBeenCalled();

      component.enrollmentStep.controls.password.setValue('0123456789ABCDEF');
      component.enrollmentStep.controls.mOTPPin.setValue('');

      fixture.detectChanges();

      nextButton.click();
      tick();

      expect(enrollmentService.enroll).not.toHaveBeenCalled();
      expect(component.stepper.next).not.toHaveBeenCalled();

    }));

  });

  it('close should return token serial', fakeAsync(() => {
    component.enrolledToken = enrolledToken;
    fixture.detectChanges();

    component.closeDialog();
    expect(dialogRef.close).toHaveBeenCalledWith(component.enrolledToken.serial);
  }));

  describe('cancel', () => {
    it('should delete enrolled token and close dialog with false', fakeAsync(() => {
      component.enrolledToken = enrolledToken;
      fixture.detectChanges();

      operationsService.deleteToken.and.returnValue(of());
      component.cancelDialog();
      tick();

      expect(operationsService.deleteToken).toHaveBeenCalledWith(enrolledToken.serial);
      expect(dialogRef.close).toHaveBeenCalledWith(false);
    }));

    it('should not call delete token if no token was enrolled', fakeAsync(() => {
      component.cancelDialog();
      tick();

      expect(operationsService.deleteToken).not.toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalledWith(false);
    }));
  });
});
