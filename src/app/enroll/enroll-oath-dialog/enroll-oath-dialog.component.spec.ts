import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

import { NgxPermissionsAllowStubDirective, NgxPermissionsService } from 'ngx-permissions';
import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { MockComponent } from '../../../testing/mock-component';
import { spyOnClass, getInjectedStub } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { TokenType } from '../../api/token';
import { OperationsService } from '../../api/operations.service';
import { EnrollmentService } from '../../api/enrollment.service';
import { NotificationService } from '../../common/notification.service';

import { EnrollOATHDialogComponent } from './enroll-oath-dialog.component';


describe('The EnrollOATHDialogComponent', () => {
  let component: EnrollOATHDialogComponent;
  let fixture: ComponentFixture<EnrollOATHDialogComponent>;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let operationsService: jasmine.SpyObj<OperationsService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let permissionsService: jasmine.SpyObj<NgxPermissionsService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollOATHDialogComponent>>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollOATHDialogComponent,
        MockComponent({ selector: 'qrcode', inputs: ['qrdata', 'width', 'errorCorrectionLevel'] }),
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
    fixture = TestBed.createComponent(EnrollOATHDialogComponent);
    component = fixture.componentInstance;

    matDialog = getInjectedStub(MatDialog);
    notificationService = getInjectedStub(NotificationService);
    operationsService = getInjectedStub(OperationsService);
    enrollmentService = getInjectedStub(EnrollmentService);
    permissionsService = getInjectedStub(NgxPermissionsService);
    dialogRef = getInjectedStub<MatDialogRef<EnrollOATHDialogComponent>>(MatDialogRef);

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(component.data.tokenTypeDetails.type).toEqual(TokenType.HOTP);
  });

  describe('setPin', () => {
    it('should set pin of token and output message', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });

      component.enrolledToken = Fixtures.enrolledToken;
      component.setPin();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(component.pinSet).toEqual(true);
      expect(notificationService.message).toHaveBeenCalledWith('PIN set');
    }));

    it('should not do anything if the user closes the dialog', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) });

      component.enrolledToken = Fixtures.enrolledToken;
      component.setPin();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(notificationService.message).not.toHaveBeenCalled();
    }));
  });

  it('should enroll an HOTP token with a default description', fakeAsync(() => {
    spyOn(component.stepper, 'next');

    enrollmentService.enroll.and.returnValue(of(Fixtures.OATHEnrollmentResponse));
    const expectedToken = Fixtures.enrolledToken;

    fixture.detectChanges();

    component.enrollToken();
    tick();

    expect(enrollmentService.enroll).toHaveBeenCalledWith({
      type: TokenType.HOTP,
      description: 'Created via SelfService'
    });
    expect(component.enrolledToken).toEqual(expectedToken);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
  }));

  it('should enroll a TOTP token with a custom description', fakeAsync(() => {
    spyOn(component.stepper, 'next');

    enrollmentService.enroll.and.returnValue(of(Fixtures.OATHEnrollmentResponse));
    const expectedToken = Fixtures.enrolledToken;

    component.data.tokenTypeDetails = Fixtures.tokenTypeDetails[TokenType.TOTP];
    component.enrollmentStep.controls.description.setValue('custom description');
    fixture.detectChanges();
    component.enrollToken();
    tick();

    expect(enrollmentService.enroll).toHaveBeenCalledWith({
      type: TokenType.TOTP,
      description: 'custom description'
    });
    expect(component.enrolledToken).toEqual(expectedToken);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
  }));

  it('should not notify user if enrollment failed', fakeAsync(() => {
    // the enrollment service does the notification now, instead of the enrollment dialog

    enrollmentService.enroll.and.returnValue(of({ result: { value: false } }));
    fixture.detectChanges();
    const result = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    result.click();
    tick();

    expect(component.enrolledToken).toEqual(undefined);
    expect(notificationService.message).not.toHaveBeenCalled();
  }));

  it('close should return token serial', fakeAsync(() => {
    component.enrolledToken = Fixtures.enrolledToken;
    fixture.detectChanges();

    component.closeDialog();
    expect(dialogRef.close).toHaveBeenCalledWith(component.enrolledToken.serial);
  }));

  describe('cancel', () => {
    it('should delete enrolled token if the user has permissions and close dialog with false', fakeAsync(() => {
      component.enrolledToken = Fixtures.enrolledToken;
      fixture.detectChanges();

      permissionsService.hasPermission.and.returnValue(true);
      operationsService.deleteToken.and.returnValue(of());
      component.cancelDialog();
      tick();

      expect(operationsService.deleteToken).toHaveBeenCalledWith('testSerial');
      expect(dialogRef.close).toHaveBeenCalledWith(false);
    }));

    it('should not delete enrolled token if the user has no permissions and close dialog with false', fakeAsync(() => {
      component.enrolledToken = Fixtures.enrolledToken;
      fixture.detectChanges();

      permissionsService.hasPermission.and.returnValue(false);
      component.cancelDialog();
      tick();

      expect(operationsService.deleteToken).not.toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalledWith(false);
    }));

    it('should not call delete token if no token was enrolled', fakeAsync(() => {
      component.cancelDialog();
      permissionsService.hasPermission.and.returnValue(true);
      tick();

      expect(operationsService.deleteToken).not.toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalledWith(false);
    }));
  });

  describe('copyInputMessage', () => {
    let element: HTMLInputElement;

    beforeEach(() => {
      element = document.createElement('input');
      element.value = 'thing to copy';
      document.body.appendChild(element);
    });

    afterEach(() => {
      element.remove();
    });

    it('should copy the content of the input element and notify the user', () => {
      spyOn(document, 'execCommand');
      component.copyInputMessage(element);

      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(notificationService.message).toHaveBeenCalledWith('Copied');

      expect(window.getSelection().toString()).toEqual('thing to copy');
    });
  });
});
