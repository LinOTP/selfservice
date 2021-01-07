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
import { EnrollmentService } from '../../api/enrollment.service';
import { NotificationService } from '../../common/notification.service';

import { EnrollPasswordDialogComponent } from './enroll-password-dialog.component';
import { MatButton } from '@angular/material/button';
import { MockComponent } from '../../../testing/mock-component';
import { OperationsService } from '../../api/operations.service';


describe('The EnrollPasswordDialogComponent', () => {
  let component: EnrollPasswordDialogComponent;
  let fixture: ComponentFixture<EnrollPasswordDialogComponent>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollPasswordDialogComponent,
        MockComponent({ selector: 'app-button-wait-indicator', inputs: ['show'] }),
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
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollPasswordDialogComponent);
    component = fixture.componentInstance;

    enrollmentService = getInjectedStub(EnrollmentService);

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
    expect(component.enrollmentStep.disabled).toEqual(false);
  }));

  describe('enrollToken', () => {
    it('should enroll a password token with a default description', fakeAsync(() => {
      spyOn(component.stepper, 'next');

      enrollmentService.enroll.and.returnValue(of(Fixtures.PasswordEnrollmentResponse));
      const serial = Fixtures.PasswordEnrollmentResponse.serial;

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

      expect(component.enrolledToken.serial).toEqual(serial);
      expect(component.stepper.next).toHaveBeenCalledTimes(1);
      expect(component.enrollmentStep.disabled).toEqual(true);
    }));

    it('should enroll a password token with a custom description', fakeAsync(() => {
      spyOn(component.stepper, 'next');

      enrollmentService.enroll.and.returnValue(of(Fixtures.PasswordEnrollmentResponse));
      const serial = Fixtures.PasswordEnrollmentResponse.serial;

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

      expect(component.enrolledToken.serial).toEqual(serial);
      expect(component.stepper.next).toHaveBeenCalledTimes(1);
      expect(component.enrollmentStep.disabled).toEqual(true);
    }));

    it('should allow retrying if enrollment failed', fakeAsync(() => {
      component.data.tokenTypeDetails = Fixtures.tokenTypeDetails[TokenType.PASSWORD];
      component.enrollmentStep.controls.password.setValue('111111');

      enrollmentService.enroll.and.returnValue(of(null));

      fixture.detectChanges();
      component.enrollToken();
      tick();

      expect(component.enrolledToken).toEqual(undefined);
      expect(component.enrollmentStep.disabled).toEqual(false);
    }));
  });
});
