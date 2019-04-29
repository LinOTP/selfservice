import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from '../../../testing/mock-component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../../material.module';
import { TokenService } from '../../token.service';

import { EnrollHotpDialogComponent } from './enroll-hotp-dialog.component';

import { of } from 'rxjs';
import { NotificationService } from '../../core/notification.service';
import { spyOnClass } from '../../../testing/spyOnClass';
import { MatDialog, MatDialogRef } from '@angular/material';
import { By } from '@angular/platform-browser';
import { Fixtures } from '../../../testing/fixtures';

describe('The EnrollHotpDialogComponent', () => {
  let component: EnrollHotpDialogComponent;
  let fixture: ComponentFixture<EnrollHotpDialogComponent>;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let notificationService: NotificationService;
  let tokenService: jasmine.SpyObj<TokenService>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollHotpDialogComponent,
        MockComponent({selector: 'ngx-qrcode', inputs: ['qrc-value', 'qrc-element-type']}),
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
        {provide: MatDialog, useValue: spyOnClass(MatDialog)},
        {provide: MatDialogRef, useValue: spyOnClass(MatDialogRef)},

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
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initial step of 1 and max hotp step of 4', () => {
    expect(component.maxSteps).toEqual(4);
    expect(component.currentStep).toEqual(1);
  });

  it('should set pin of token and output message', fakeAsync(() => {
    matDialog.open.and.returnValue({afterClosed: () => of(true)});

    component.enrolledToken = {serial: 'testSerial', url: 'testUrl'};
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
    const expectedToken = {serial: 'testSerial', url: 'testUrl'};
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

  it('should change component view values after testing the token was successfull', fakeAsync(() => {
    const mockEnrollmentResponse = Fixtures.enrollmentResponse;
    mockEnrollmentResponse.result.value = true;

    component.enrolledToken = {serial: 'testSerial', url: 'testUrl'};
    component.testStep.controls.pin.setValue('testPin');
    component.testStep.controls.otp.setValue('testOTP');
    tokenService.testToken.and.returnValue(of(mockEnrollmentResponse));
    component.testToken();
    tick();

    expect(component.testSuccessful).toEqual(true);
    expect(component.testFailed).toEqual(false);
  }));

  it('should change component view values after testing the token failed', fakeAsync(() => {
    const mockEnrollmentResponse = Fixtures.enrollmentResponse;
    mockEnrollmentResponse.result.value = false;

    component.enrolledToken = {serial: 'testSerial', url: 'testUrl'};
    component.testStep.controls.pin.setValue('testPin');
    component.testStep.controls.otp.setValue('testOTP');
    tokenService.testToken.and.returnValue(of(mockEnrollmentResponse));
    component.testToken();
    tick();

    expect(component.testSuccessful).toEqual(false);
    expect(component.testFailed).toEqual(true);
  }));

});
