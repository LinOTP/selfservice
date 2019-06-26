import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { By } from '@angular/platform-browser';

import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { MockComponent } from '../../../testing/mock-component';
import { spyOnClass } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { TokenType } from '../../api/token';
import { TokenService } from '../../api/token.service';
import { NotificationService } from '../../common/notification.service';

import { EnrollOtpDialogComponent } from './enroll-otp-dialog.component';

describe('The EnrollOtpDialogComponent', () => {
  let component: EnrollOtpDialogComponent;
  let fixture: ComponentFixture<EnrollOtpDialogComponent>;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let notificationService: NotificationService;
  let tokenService: jasmine.SpyObj<TokenService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollOtpDialogComponent>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollOtpDialogComponent,
        MockComponent({ selector: 'ngx-qrcode', inputs: ['qrc-value', 'qrc-element-type'] }),
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
          provide: TokenService,
          useValue: spyOnClass(TokenService)
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
          useValue: { type: TokenType.HOTP, closeLabel: null },
        },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollOtpDialogComponent);
    component = fixture.componentInstance;
    matDialog = TestBed.get(MatDialog);
    notificationService = TestBed.get(NotificationService);
    tokenService = TestBed.get(TokenService);
    dialogRef = TestBed.get(MatDialogRef);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('setPin', () => {
    it('should set pin of token and output message', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });

      component.enrolledToken = { serial: 'testSerial', url: 'testUrl' };
      component.setPin();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(component.pinSet).toEqual(true);
      expect(notificationService.message).toHaveBeenCalledWith('PIN set');
    }));

    it('should inform the user if pin could not be set', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) });
      const oldPinSetValue = component.pinSet;

      component.enrolledToken = { serial: 'testSerial', url: 'testUrl' };
      component.setPin();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(component.pinSet).toEqual(oldPinSetValue);
      expect(notificationService.message).toHaveBeenCalledWith('There was an error and the new PIN could not be set. Please try again.');
    }));

  });

  it('should enroll the hotp token', fakeAsync(() => {
    const mockEnrollmentResponse = Fixtures.enrollmentResponse;
    mockEnrollmentResponse.result.value = true;

    tokenService.enroll.and.returnValue(of(mockEnrollmentResponse));
    const expectedToken = { serial: 'testSerial', url: 'testUrl' };
    component.enrollmentForm.controls.description.setValue('descr');
    fixture.detectChanges();
    const result = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    result.click();
    tick();

    expect(component.enrolledToken).toEqual(expectedToken);
    expect(component.enrollmentStep.controls.tokenEnrolled.value).toEqual(true);
    expect(component.enrollmentForm.controls.description.disabled).toEqual(true);
  }));

  it('should output message if enrollment failed', fakeAsync(() => {
    const mockEnrollmentResponse = Fixtures.enrollmentResponse;
    mockEnrollmentResponse.result.value = false;

    tokenService.enroll.and.returnValue(of(mockEnrollmentResponse));
    component.enrollmentForm.controls.description.setValue('descr');
    fixture.detectChanges();
    const result = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    result.click();
    tick();

    expect(component.enrolledToken).toEqual(undefined);
    expect(notificationService.message).toHaveBeenCalledTimes(1);
  }));

  it('close should return token serial', fakeAsync(() => {
    component.enrolledToken = { serial: 'testSerial', url: 'testUrl' };
    fixture.detectChanges();

    component.closeDialog();
    expect(dialogRef.close).toHaveBeenCalledWith(component.enrolledToken.serial);
  }));

  describe('cancel', () => {
    it('should delete enrolled token and close dialog with false', fakeAsync(() => {
      component.enrolledToken = { serial: 'testSerial', url: 'testUrl' };
      fixture.detectChanges();

      tokenService.deleteToken.and.returnValue(of());
      component.cancelDialog();
      tick();

      expect(tokenService.deleteToken).toHaveBeenCalledWith('testSerial');
      expect(dialogRef.close).toHaveBeenCalledWith(false);
    }));

    it('should not call delete token if no token was enrolled', fakeAsync(() => {
      component.cancelDialog();
      tick();

      expect(tokenService.deleteToken).not.toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalledWith(false);
    }));
  });

});
