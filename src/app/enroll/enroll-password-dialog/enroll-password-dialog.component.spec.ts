import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

import { NgxPermissionsService } from 'ngx-permissions';
import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { spyOnClass } from '../../../testing/spyOnClass';
import { I18nMock } from '../../../testing/i18n-mock-provider';

import { MaterialModule } from '../../material.module';
import { TokenType } from '../../api/token';
import { EnrollmentService } from '../../api/enrollment.service';
import { NotificationService } from '../../common/notification.service';

import { EnrollPasswordDialogComponent } from './enroll-password-dialog.component';
import { LinOTPResponse } from '../../api/token.service';
import { MatButton } from '@angular/material/button';


describe('The EnrollOATHDialogComponent', () => {
  let component: EnrollPasswordDialogComponent;
  let fixture: ComponentFixture<EnrollPasswordDialogComponent>;
  let notificationService: NotificationService;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let permissionsService: jasmine.SpyObj<NgxPermissionsService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollPasswordDialogComponent>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollPasswordDialogComponent,
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
          useValue: { tokenTypeDetails: Fixtures.tokenTypeDetails[TokenType.HOTP], closeLabel: null },
        },
        I18nMock,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollPasswordDialogComponent);
    component = fixture.componentInstance;

    notificationService = TestBed.get(NotificationService);
    enrollmentService = TestBed.get(EnrollmentService);
    permissionsService = TestBed.get(NgxPermissionsService);
    dialogRef = TestBed.get(MatDialogRef);

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(component.data.tokenTypeDetails.type).toEqual(TokenType.HOTP);
  });

  it('should not allow enrollment if the passwords differ', fakeAsync(() => {
    const button: MatButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    component.data.tokenTypeDetails = Fixtures.tokenTypeDetails[TokenType.PASSWORD];
    component.enrollmentStep.controls.password.setValue('111111');
    component.enrollmentStep.controls.confirmation.setValue('222222');

    fixture.detectChanges();

    tick();
    expect(button.disabled).toEqual(true);
  }));

  describe('enrollToken', () => {
    it('should enroll a password token with a default description', fakeAsync(() => {
      spyOn(component.stepper, 'next');

      enrollmentService.enroll.and.returnValue(of(Fixtures.PasswordEnrollmentResponse));
      const serial = Fixtures.PasswordEnrollmentResponse.detail.serial;

      component.data.tokenTypeDetails = Fixtures.tokenTypeDetails[TokenType.PASSWORD];
      component.enrollmentStep.controls.password.setValue('111111');
      component.enrollmentStep.controls.confirmation.setValue('111111');

      fixture.detectChanges();
      component.enrollToken();
      tick();

      expect(enrollmentService.enroll).toHaveBeenCalledWith({
        type: TokenType.PASSWORD,
        description: 'Created via SelfService',
        otpkey: '111111'
      });

      expect(component.serial).toEqual(serial);
      expect(component.stepper.next).toHaveBeenCalledTimes(1);
    }));

    it('should enroll a password token with a custom description', fakeAsync(() => {
      spyOn(component.stepper, 'next');

      enrollmentService.enroll.and.returnValue(of(Fixtures.PasswordEnrollmentResponse));
      const serial = Fixtures.PasswordEnrollmentResponse.detail.serial;

      component.data.tokenTypeDetails = Fixtures.tokenTypeDetails[TokenType.PASSWORD];
      component.enrollmentStep.controls.description.setValue('custom description');
      component.enrollmentStep.controls.password.setValue('111111');
      component.enrollmentStep.controls.confirmation.setValue('111111');

      fixture.detectChanges();
      component.enrollToken();
      tick();

      expect(enrollmentService.enroll).toHaveBeenCalledWith({
        type: TokenType.PASSWORD,
        description: 'custom description',
        otpkey: '111111'
      });

      expect(component.serial).toEqual(serial);
      expect(component.stepper.next).toHaveBeenCalledTimes(1);
    }));

    it('should notify user if enrollment failed', fakeAsync(() => {
      component.data.tokenTypeDetails = Fixtures.tokenTypeDetails[TokenType.PASSWORD];
      component.enrollmentStep.controls.password.setValue('111111');

      const mockEnrollmentResponse: LinOTPResponse<boolean, { serial: string }> = Fixtures.PasswordEnrollmentResponse;
      mockEnrollmentResponse.result.value = false;
      enrollmentService.enroll.and.returnValue(of(mockEnrollmentResponse));

      fixture.detectChanges();
      component.enrollToken();
      tick();

      expect(component.serial).toEqual(undefined);
      expect(notificationService.message).toHaveBeenCalledTimes(1);
    }));
  });

  describe('close', () => {
    it('should return token serial', fakeAsync(() => {
      component.serial = 'serial';
      fixture.detectChanges();

      component.closeDialog();
      expect(dialogRef.close).toHaveBeenCalledWith(component.serial);
    }));
  });

  describe('cancel', () => {
    it('should close dialog with false', fakeAsync(() => {
      fixture.detectChanges();

      component.cancelDialog();
      tick();

      expect(dialogRef.close).toHaveBeenCalledWith(false);
    }));
  });
});
