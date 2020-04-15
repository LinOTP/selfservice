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

import { EnrollSMSDialogComponent } from './enroll-sms-dialog.component';

const enrolledToken = {
  serial: Fixtures.smsEnrollmentResponse.detail.serial,
  phoneNumber: Fixtures.userSystemInfo.user.mobile
};

describe('The EnrollSMSDialogComponent', () => {
  let component: EnrollSMSDialogComponent;
  let fixture: ComponentFixture<EnrollSMSDialogComponent>;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let notificationService: NotificationService;
  let operationsService: jasmine.SpyObj<OperationsService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollSMSDialogComponent>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollSMSDialogComponent,
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
          useValue: { tokenTypeDetails: Fixtures.tokenTypeDetails[TokenType.SMS], closeLabel: null },
        },
        I18nMock,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollSMSDialogComponent);
    component = fixture.componentInstance;

    matDialog = TestBed.get(MatDialog);
    notificationService = TestBed.get(NotificationService);
    operationsService = TestBed.get(OperationsService);
    enrollmentService = TestBed.get(EnrollmentService);
    dialogRef = TestBed.get(MatDialogRef);

    spyOn(localStorage, 'getItem').and.returnValue(
      JSON.stringify({ mobile: Fixtures.userSystemInfo.user.mobile })
    );

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(component.data.tokenTypeDetails.type).toEqual(TokenType.SMS);
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

  it('should enroll an sms token with a default description', fakeAsync(() => {
    spyOn(component.stepper, 'next');

    enrollmentService.enroll.and.returnValue(of(Fixtures.smsEnrollmentResponse));
    const expectedToken = enrolledToken;

    fixture.detectChanges();

    component.enrollToken();
    tick();

    expect(enrollmentService.enroll).toHaveBeenCalledWith({
      type: TokenType.SMS,
      description: `Created via SelfService - ${expectedToken.phoneNumber}`,
      phone: expectedToken.phoneNumber,
    });
    expect(component.enrolledToken).toEqual(expectedToken);
    expect(component.enrollmentStep.controls.tokenEnrolled.value).toEqual(true);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
  }));

  it('should enroll an sms token with a custom description', fakeAsync(() => {
    spyOn(component.stepper, 'next');

    enrollmentService.enroll.and.returnValue(of(Fixtures.smsEnrollmentResponse));
    const expectedToken = enrolledToken;

    component.data.tokenTypeDetails = Fixtures.tokenTypeDetails[TokenType.SMS];
    component.enrollmentStep.controls.description.setValue('custom description');
    fixture.detectChanges();
    component.enrollToken();
    tick();

    expect(enrollmentService.enroll).toHaveBeenCalledWith({
      type: TokenType.SMS,
      description: `custom description - ${expectedToken.phoneNumber}`,
      phone: expectedToken.phoneNumber,
    });
    expect(component.enrolledToken).toEqual(expectedToken);
    expect(component.enrollmentStep.controls.tokenEnrolled.value).toEqual(true);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
  }));

  it('should notify user if enrollment failed', fakeAsync(() => {
    const mockEnrollmentResponse = Fixtures.smsEnrollmentResponse;
    mockEnrollmentResponse.result.value = false;

    enrollmentService.enroll.and.returnValue(of(mockEnrollmentResponse));
    fixture.detectChanges();
    const result = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    result.click();
    tick();

    expect(component.enrolledToken).toEqual(undefined);
    expect(notificationService.message).toHaveBeenCalledTimes(1);
  }));

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
