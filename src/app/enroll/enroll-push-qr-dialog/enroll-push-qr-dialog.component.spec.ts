import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { of } from 'rxjs/internal/observable/of';

import { MockComponent } from '../../../testing/mock-component';
import { spyOnClass, getInjectedStub } from '../../../testing/spyOnClass';
import { Fixtures } from '../../../testing/fixtures';

import { OperationsService } from '../../api/operations.service';
import { EnrollmentService } from '../../api/enrollment.service';
import { MaterialModule } from '../../material.module';
import { NotificationService } from '../../common/notification.service';
import { DialogComponent } from '../../common/dialog/dialog.component';

import { EnrollPushQRDialogComponent } from './enroll-push-qr-dialog.component';
import { TokenType } from '../../api/token';
import { NgxPermissionsService, NgxPermissionsAllowStubDirective } from 'ngx-permissions';

let component: EnrollPushQRDialogComponent;
let fixture: ComponentFixture<EnrollPushQRDialogComponent>;
let operationsService: jasmine.SpyObj<OperationsService>;
let enrollmentService: jasmine.SpyObj<EnrollmentService>;
let notificationService: jasmine.SpyObj<NotificationService>;
let permissionsService: jasmine.SpyObj<NgxPermissionsService>;
let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollPushQRDialogComponent>>;
let matDialog: jasmine.SpyObj<MatDialog>;

describe('EnrollPushDialogComponent', () => {

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollPushQRDialogComponent,
        NgxPermissionsAllowStubDirective,
        MockComponent({ selector: 'qrcode', inputs: ['qrdata', 'width', 'errorCorrectionLevel'] }),
        MockComponent({ selector: 'app-button-wait-indicator', inputs: ['show'] }),
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
          provide: NgxPermissionsService,
          useValue: spyOnClass(NgxPermissionsService),
        },
        {
          provide: MatDialog,
          useValue: spyOnClass(MatDialog)
        },
        {
          provide: MatDialogRef,
          useValue: spyOnClass(MatDialogRef)
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { tokenTypeDetails: Fixtures.tokenTypeDetails[TokenType.PUSH], closeLabel: null },
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollPushQRDialogComponent);
    component = fixture.componentInstance;
    operationsService = getInjectedStub(OperationsService);
    enrollmentService = getInjectedStub(EnrollmentService);
    notificationService = getInjectedStub(NotificationService);
    permissionsService = getInjectedStub(NgxPermissionsService);
    dialogRef = getInjectedStub<MatDialogRef<EnrollPushQRDialogComponent>>(MatDialogRef);
    matDialog = getInjectedStub(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start at initial step of 1', () => {
    expect(component.stepper.selectedIndex).toEqual(0);
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

    component.enrollmentStep.controls.description.setValue('descr');
    fixture.detectChanges();

    const result = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    expect(component.stepper.selectedIndex).toEqual(0);
    result.click();
    tick();

    expect(component.enrolledToken).toEqual(expectedToken);
    expect(component.stepper.selectedIndex).toEqual(2);
    expect(notificationService.message).not.toHaveBeenCalled();
  }));

  it('should output a message when the push enrollment failed', fakeAsync(() => {
    const mockedEnrollResponse = Fixtures.enrollmentResponse;
    mockedEnrollResponse.result.value = false;

    enrollmentService.enroll.and.returnValue(of(mockedEnrollResponse));

    component.enrollmentStep.controls.description.setValue('descr');
    fixture.detectChanges();

    const result = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    expect(component.stepper.selectedIndex).toEqual(0);
    result.click();
    tick();

    expect(component.enrolledToken).toEqual(undefined);
    expect(component.stepper.selectedIndex).toEqual(0);
    expect(notificationService.message).toHaveBeenCalledTimes(1);
    expect(notificationService.message).toHaveBeenCalledWith('There was a problem while creating the new token.' +
      ' Please try again.');
  }));

  it('should let the user close the dialog', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  describe('cancel', () => {

    it('should inform the users that the token will be deleted when they have the right permissions', fakeAsync(() => {
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
      permissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(true)));

      component.enrolledToken = Fixtures.enrolledToken;
      component.cancel();
      tick();
      expect(matDialog.open).toHaveBeenCalledWith(DialogComponent, expectedDialogConfig);
    }));

    it('should inform the users that the token will be unusable when they do not have the right permissions', fakeAsync(() => {
      const expectedDialogConfig = {
        width: '25em',
        autoFocus: false,
        disableClose: true,
        data: {
          title: 'Stop setting up your new token?',
          text: 'The incomplete token will not be ready for use. ' +
            'You will have to restart the setup process in order to use this type of token.',
          confirmationLabel: 'Confirm',
        }
      };

      matDialog.open.and.returnValue({ afterClosed: () => of(false) });
      permissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(false)));

      fixture.detectChanges();

      component.enrolledToken = Fixtures.enrolledToken;
      component.cancel();
      tick();
      expect(matDialog.open).toHaveBeenCalledWith(DialogComponent, expectedDialogConfig);
    }));

    it('should notify the user on confirmed enrollment cancelation', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });
      operationsService.deleteToken.and.returnValue(of(true));
      permissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(true)));

      component.enrolledToken = Fixtures.enrolledToken;
      component.cancel();
      tick();

      expect(operationsService.deleteToken).toHaveBeenCalledWith(component.enrolledToken.serial);
      expect(notificationService.message).toHaveBeenCalledWith('Incomplete token was deleted');
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
    }));

    it('should not try to delete the token if the user has no permissions to delete', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });
      permissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(false)));

      component.enrolledToken = Fixtures.enrolledToken;
      component.cancel();
      tick();
      expect(operationsService.deleteToken).not.toHaveBeenCalled();
      expect(notificationService.message).not.toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalled();
    }));

    it('should do nothing on rejected enrollment cancelation', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) });
      permissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(false)));

      component.cancel();
      tick();

      expect(notificationService.message).not.toHaveBeenCalled();
      expect(dialogRef.close).not.toHaveBeenCalled();
    }));

    it('should open the activation dialog with the right token and configuration', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of({}) });

      component.enrolledToken = Fixtures.enrolledToken;
      component.closeAndReturnSerial();
      tick();
      expect(matDialog.open).not.toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
    }));
  });
});
