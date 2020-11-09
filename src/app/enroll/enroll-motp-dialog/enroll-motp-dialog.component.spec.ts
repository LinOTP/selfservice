import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

import { NgxPermissionsAllowStubDirective, NgxPermissionsService } from 'ngx-permissions';
import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { spyOnClass, getInjectedStub } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { TokenType } from '../../api/token';
import { OperationsService } from '../../api/operations.service';
import { EnrollmentService } from '../../api/enrollment.service';
import { NotificationService } from '../../common/notification.service';

import { EnrollMOTPDialogComponent } from './enroll-motp-dialog.component';
import { MockComponent } from '../../../testing/mock-component';

const enrolledToken = {
  serial: Fixtures.mOTPEnrollmentResponse.detail.serial,
};

describe('EnrollMOTPDialogComponent', () => {
  let component: EnrollMOTPDialogComponent;
  let fixture: ComponentFixture<EnrollMOTPDialogComponent>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollMOTPDialogComponent,
        NgxPermissionsAllowStubDirective,
        MockComponent({ selector: 'app-button-wait-indicator', inputs: ['show'] }),
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
          useValue: { tokenTypeDetails: Fixtures.tokenTypeDetails[TokenType.MOTP], closeLabel: null },
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollMOTPDialogComponent);
    component = fixture.componentInstance;

    notificationService = getInjectedStub(NotificationService);
    enrollmentService = getInjectedStub(EnrollmentService);

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(component.data.tokenTypeDetails.type).toEqual(TokenType.MOTP);
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

    it('should not notify user if enrollment failed', fakeAsync(() => {
      // the enrollment service does the notification now

      const mockEnrollmentResponse = Fixtures.mOTPEnrollmentResponse;
      mockEnrollmentResponse.result.value = false;

      enrollmentService.enroll.and.returnValue(of(mockEnrollmentResponse));
      fixture.detectChanges();

      component.enrollToken();
      tick();

      expect(component.enrolledToken).toEqual(undefined);
      expect(notificationService.message).not.toHaveBeenCalled();
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
});
