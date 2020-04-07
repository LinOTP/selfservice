import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { of } from 'rxjs/internal/observable/of';

import { MockComponent } from '../../../testing/mock-component';
import { spyOnClass } from '../../../testing/spyOnClass';
import { I18nMock } from '../../../testing/i18n-mock-provider';
import { Fixtures } from '../../../testing/fixtures';

import { OperationsService } from '../../api/operations.service';
import { EnrollmentService } from '../../api/enrollment.service';
import { MaterialModule } from '../../material.module';
import { NotificationService } from '../../common/notification.service';
import { DialogComponent } from '../../common/dialog/dialog.component';

import { EnrollPushDialogComponent } from './enroll-push-dialog.component';

describe('EnrollPushDialogComponent', () => {
  let component: EnrollPushDialogComponent;
  let fixture: ComponentFixture<EnrollPushDialogComponent>;
  let operationsService: jasmine.SpyObj<OperationsService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let notificationService: NotificationService;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollPushDialogComponent>>;
  let matDialog: jasmine.SpyObj<MatDialog>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollPushDialogComponent,
        MockComponent({ selector: 'qrcode', inputs: ['qrdata', 'width', 'errorCorrectionLevel'] }),
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
          useValue: spyOnClass(OperationsService),
        }, {
          provide: EnrollmentService,
          useValue: spyOnClass(EnrollmentService),
        },
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService)
        },
        {
          provide: MatDialog,
          useValue: spyOnClass(MatDialog)
        },
        {
          provide: MatDialogRef,
          useValue: spyOnClass(MatDialogRef)
        },
        I18nMock,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollPushDialogComponent);
    component = fixture.componentInstance;
    operationsService = TestBed.get(OperationsService);
    enrollmentService = TestBed.get(EnrollmentService);
    notificationService = TestBed.get(NotificationService);
    dialogRef = TestBed.get(MatDialogRef);
    matDialog = TestBed.get(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initial step of 1 and max. push steps of 3', () => {
    expect(component.maxSteps).toEqual(3);
    expect(component.currentStep).toEqual(1);
  });

  it('should enroll the push token without failure', fakeAsync(() => {
    const mockedEnrollResponse = Fixtures.enrollmentResponse;
    mockedEnrollResponse.result.value = true;
    const expectedToken = {
      serial: mockedEnrollResponse.detail.serial,
      url: mockedEnrollResponse.detail.lse_qr_url.value
    };

    enrollmentService.enroll.and.returnValue(of(mockedEnrollResponse));
    enrollmentService.pairingPoll.and.returnValue(of(Fixtures.activePushToken));

    component.enrollmentForm.controls.description.setValue('descr');
    fixture.detectChanges();

    const result = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    expect(component.currentStep).toEqual(1);
    result.click();
    tick();

    expect(component.enrolledToken).toEqual(expectedToken);
    expect(component.isPaired).toEqual(true);
    expect(component.enrollmentForm.controls.description.disabled).toEqual(true);
    expect(component.currentStep).toEqual(3);
    expect(notificationService.message).not.toHaveBeenCalled();
  }));

  it('should output a message when the push enrollment failed', fakeAsync(() => {
    const mockedEnrollResponse = Fixtures.enrollmentResponse;
    mockedEnrollResponse.result.value = false;

    enrollmentService.enroll.and.returnValue(of(mockedEnrollResponse));

    component.enrollmentForm.controls.description.setValue('descr');
    fixture.detectChanges();

    const result = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    expect(component.currentStep).toEqual(1);
    result.click();
    tick();

    expect(component.enrolledToken).toEqual(undefined);
    expect(component.currentStep).toEqual(1);
    expect(notificationService.message).toHaveBeenCalledTimes(1);
    expect(notificationService.message).toHaveBeenCalledWith('There was a problem while creating the new token.' +
      ' Please try again.');
  }));

  it('should let the user close the dialog', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('should let the user cancel the enrollment', fakeAsync(() => {
    const expectedDialogConfig = {
      width: '25em',
      autoFocus: false,
      disableClose: true,
      data: {
        title: 'Stop setting up your new token?',
        text: 'The incomplete token will be deleted. ' +
          'You will have to restart the setup process in order to use this type of token.',
        confirmationLabel: 'Confirm',
      }
    };

    matDialog.open.and.returnValue({ afterClosed: () => of(false) });
    component.enrolledToken = Fixtures.enrolledToken;
    component.cancel();
    tick();
    expect(matDialog.open).toHaveBeenCalledWith(DialogComponent, expectedDialogConfig);
  }));

  it('should notify the user on confirmed enrollment cancelation', fakeAsync(() => {
    matDialog.open.and.returnValue({ afterClosed: () => of(true) });
    operationsService.deleteToken.and.returnValue(of({}));
    component.enrolledToken = Fixtures.enrolledToken;
    component.cancel();
    tick();

    expect(notificationService.message).toHaveBeenCalledWith('Incomplete Push token was deleted');
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  }));

  it('should do nothing on rejected enrollment cancelation', fakeAsync(() => {
    matDialog.open.and.returnValue({ afterClosed: () => of(false) });
    component.cancel();
    tick();

    expect(notificationService.message).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  }));

  it('should open the activation dialog with the right token and configuration', fakeAsync(() => {
    matDialog.open.and.returnValue({ afterClosed: () => of({}) });

    const expectedDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: Fixtures.enrolledToken.serial
    };
    component.enrolledToken = Fixtures.enrolledToken;
    component.closeAndReturnSerial();
    tick();
    expect(matDialog.open).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  }));
});
