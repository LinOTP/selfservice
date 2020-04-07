import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';
import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { MockComponent } from '../../../testing/mock-component';
import { spyOnClass } from '../../../testing/spyOnClass';
import { I18nMock } from '../../../testing/i18n-mock-provider';

import { MaterialModule } from '../../material.module';
import { TokenType } from '../../api/token';
import { OperationsService } from '../../api/operations.service';
import { EnrollmentService } from '../../api/enrollment.service';
import { NotificationService } from '../../common/notification.service';

import { EnrollOATHDialogComponent } from './enroll-oath-dialog.component';

const defaultDescription = 'Created via SelfService';

describe('The EnrollOATHDialogComponent', () => {
  let component: EnrollOATHDialogComponent;
  let fixture: ComponentFixture<EnrollOATHDialogComponent>;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let notificationService: NotificationService;
  let operationsService: jasmine.SpyObj<OperationsService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollOATHDialogComponent>>;

  beforeEach(async(() => {
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
    fixture = TestBed.createComponent(EnrollOATHDialogComponent);
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

  it('should enroll an HOTP token and then set a description', fakeAsync(() => {
    spyOn(component.stepper, 'next');

    enrollmentService.enrollOATH.and.returnValue(of(Fixtures.OATHEnrollmentResponse));
    operationsService.setDescription.and.returnValue(of({ success: true }));
    const expectedToken = Fixtures.enrolledToken;

    fixture.detectChanges();

    component.enrollToken();
    tick();

    expect(enrollmentService.enrollOATH).toHaveBeenCalledWith({ type: TokenType.HOTP });
    expect(operationsService.setDescription).toHaveBeenCalledWith(expectedToken.serial, defaultDescription);
    expect(component.enrolledToken).toEqual(expectedToken);
    expect(component.enrollmentStep.controls.tokenEnrolled.value).toEqual(true);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
  }));

  it('should enroll a TOTP token and then set a description', fakeAsync(() => {
    spyOn(component.stepper, 'next');

    enrollmentService.enrollOATH.and.returnValue(of(Fixtures.OATHEnrollmentResponse));
    operationsService.setDescription.and.returnValue(of({ success: true }));
    const expectedToken = Fixtures.enrolledToken;

    component.data.tokenTypeDetails = Fixtures.tokenTypeDetails[TokenType.TOTP];
    component.enrollmentStep.controls.description.setValue('descr');
    fixture.detectChanges();
    component.enrollToken();
    tick();

    expect(enrollmentService.enrollOATH).toHaveBeenCalledWith({ type: TokenType.TOTP });
    expect(component.enrolledToken).toEqual(expectedToken);
    expect(operationsService.setDescription).toHaveBeenCalledWith(expectedToken.serial, 'descr');
    expect(component.enrollmentStep.controls.tokenEnrolled.value).toEqual(true);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
  }));

  it('should notify user if enrollment failed', fakeAsync(() => {
    const mockEnrollmentResponse = Fixtures.OATHEnrollmentResponse;
    mockEnrollmentResponse.result.status = false;

    enrollmentService.enrollOATH.and.returnValue(of(mockEnrollmentResponse));
    fixture.detectChanges();
    const result = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    result.click();
    tick();

    expect(component.enrolledToken).toEqual(undefined);
    expect(notificationService.message).toHaveBeenCalledTimes(1);
  }));

  it('should notify user if setting description failed', fakeAsync(() => {
    spyOn(component.stepper, 'next');

    enrollmentService.enrollOATH.and.returnValue(of(Fixtures.OATHEnrollmentResponse));
    operationsService.setDescription.and.returnValue(of({ success: false }));
    const expectedToken = Fixtures.enrolledToken;

    component.data.tokenTypeDetails = Fixtures.tokenTypeDetails[TokenType.TOTP];
    fixture.detectChanges();
    component.enrollToken();
    tick();

    expect(enrollmentService.enrollOATH).toHaveBeenCalledWith({ type: TokenType.TOTP });
    expect(component.enrolledToken).toEqual(expectedToken);
    expect(operationsService.setDescription).toHaveBeenCalledWith(expectedToken.serial, defaultDescription);
    expect(component.enrollmentStep.controls.tokenEnrolled.value).toEqual(true);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);

    const errorMessage = 'The token was successfully created, but an error ocurred while setting the description.';
    expect(notificationService.message).toHaveBeenCalledWith(errorMessage);
  }));

  it('close should return token serial', fakeAsync(() => {
    component.enrolledToken = Fixtures.enrolledToken;
    fixture.detectChanges();

    component.closeDialog();
    expect(dialogRef.close).toHaveBeenCalledWith(component.enrolledToken.serial);
  }));

  describe('cancel', () => {
    it('should delete enrolled token and close dialog with false', fakeAsync(() => {
      component.enrolledToken = Fixtures.enrolledToken;
      fixture.detectChanges();

      operationsService.deleteToken.and.returnValue(of());
      component.cancelDialog();
      tick();

      expect(operationsService.deleteToken).toHaveBeenCalledWith('testSerial');
      expect(dialogRef.close).toHaveBeenCalledWith(false);
    }));

    it('should not call delete token if no token was enrolled', fakeAsync(() => {
      component.cancelDialog();
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
