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
import { TokenService } from '../../api/token.service';
import { NotificationService } from '../../common/notification.service';

import { EnrollHotpDialogComponent } from './enroll-hotp-dialog.component';
import { TestOTPDialogComponent } from '../../test/test-otp/test-otp-dialog.component';

describe('The EnrollHotpDialogComponent', () => {
  let component: EnrollHotpDialogComponent;
  let fixture: ComponentFixture<EnrollHotpDialogComponent>;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let notificationService: NotificationService;
  let tokenService: jasmine.SpyObj<TokenService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollHotpDialogComponent>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollHotpDialogComponent,
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
        { provide: MatDialog, useValue: spyOnClass(MatDialog) },
        { provide: MatDialogRef, useValue: spyOnClass(MatDialogRef) },
        { provide: MAT_DIALOG_DATA, useValue: { closeLabel: null } },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollHotpDialogComponent);
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

  it('should have an initial step of 1 and max hotp step of 3', () => {
    expect(component.maxSteps).toEqual(3);
    expect(component.currentStep).toEqual(1);
  });

  it('should set pin of token and output message', fakeAsync(() => {
    matDialog.open.and.returnValue({ afterClosed: () => of(true) });

    component.enrolledToken = { serial: 'testSerial', url: 'testUrl' };
    component.setPin();
    tick();

    expect(matDialog.open).toHaveBeenCalledTimes(1);
    expect(component.pinSet).toEqual(true);
    expect(notificationService.message).toHaveBeenCalledWith('PIN set');
  }));

  it('should enroll the hotp token', fakeAsync(() => {
    const mockEnrollmentResponse = Fixtures.enrollmentResponse;
    mockEnrollmentResponse.result.value = true;

    tokenService.enroll.and.returnValue(of(mockEnrollmentResponse));
    const expectedToken = { serial: 'testSerial', url: 'testUrl' };
    component.enrollmentForm.controls.description.setValue('descr');
    fixture.detectChanges();
    const result = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    expect(component.currentStep).toEqual(1);
    result.click();
    tick();

    expect(component.enrolledToken).toEqual(expectedToken);
    expect(component.enrollmentStep.controls.tokenEnrolled.value).toEqual(true);
    expect(component.enrollmentForm.controls.description.disabled).toEqual(true);
    expect(component.currentStep).toEqual(2);
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
    expect(component.currentStep).toEqual(1);
    expect(notificationService.message).toHaveBeenCalledTimes(1);
  }));

  it('close should return token serial', fakeAsync(() => {
    component.enrolledToken = { serial: 'testSerial', url: 'testUrl' };
    fixture.detectChanges();

    component.closeDialog();
    expect(dialogRef.close).toHaveBeenCalledWith(component.enrolledToken.serial);
  }));

});