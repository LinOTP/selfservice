import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatStepper } from '@angular/material';
import { By } from '@angular/platform-browser';

import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';
import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { MockComponent } from '../../../testing/mock-component';
import { spyOnClass } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { TokenType, getTypeDetails } from '../../api/token';
import { TokenService } from '../../api/token.service';
import { NotificationService } from '../../common/notification.service';

import { EnrollOATHDialogComponent } from './enroll-oath-dialog.component';

describe('The EnrollOATHDialogComponent', () => {
  let component: EnrollOATHDialogComponent;
  let fixture: ComponentFixture<EnrollOATHDialogComponent>;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let notificationService: NotificationService;
  let tokenService: jasmine.SpyObj<TokenService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollOATHDialogComponent>>;
  let stepper: MatStepper;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollOATHDialogComponent,
        MockComponent({ selector: 'ngx-qrcode', inputs: ['qrc-value', 'qrc-element-type'] }),
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
          useValue: { tokenTypeDetails: getTypeDetails(TokenType.HOTP), closeLabel: null },
        },
        {
          provide: MatStepper,
          useValue: spyOnClass(MatStepper),
        },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollOATHDialogComponent);
    component = fixture.componentInstance;

    matDialog = TestBed.get(MatDialog);
    notificationService = TestBed.get(NotificationService);
    tokenService = TestBed.get(TokenService);
    dialogRef = TestBed.get(MatDialogRef);
    stepper = TestBed.get(MatStepper);

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(component.data.tokenTypeDetails.type).toEqual(TokenType.HOTP);
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

  it('should enroll an HOTP token', fakeAsync(() => {
    tokenService.enroll.and.returnValue(of(Fixtures.OATHEnrollmentResponse));
    const expectedToken = { serial: 'testSerial', url: 'testUrl' };

    fixture.detectChanges();

    component.enrollToken(stepper);
    tick();

    expect(tokenService.enroll).toHaveBeenCalledWith({ type: TokenType.HOTP });
    expect(component.enrolledToken).toEqual(expectedToken);
    expect(component.enrollmentStep.controls.tokenEnrolled.value).toEqual(true);
    expect(stepper.next).toHaveBeenCalledTimes(1);
  }));

  it('should enroll a TOTP token', fakeAsync(() => {
    tokenService.enroll.and.returnValue(of(Fixtures.OATHEnrollmentResponse));
    const expectedToken = { serial: 'testSerial', url: 'testUrl' };

    component.data.tokenTypeDetails = getTypeDetails(TokenType.TOTP);
    fixture.detectChanges();
    component.enrollToken(stepper);
    tick();

    expect(tokenService.enroll).toHaveBeenCalledWith({ type: TokenType.TOTP });
    expect(component.enrolledToken).toEqual(expectedToken);
    expect(component.enrollmentStep.controls.tokenEnrolled.value).toEqual(true);
    expect(stepper.next).toHaveBeenCalledTimes(1);
  }));

  it('should output message if enrollment failed', fakeAsync(() => {
    const mockEnrollmentResponse = Fixtures.OATHEnrollmentResponse;
    mockEnrollmentResponse.result.status = false;

    tokenService.enroll.and.returnValue(of(mockEnrollmentResponse));
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