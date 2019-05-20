import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs/internal/observable/of';

import { MockComponent } from '../../../testing/mock-component';
import { MaterialModule } from '../../material.module';
import { TokenService } from '../../api/token.service';
import { EnrollPushDialogComponent } from './enroll-push-dialog.component';
import { NotificationService } from '../../common/notification.service';
import { spyOnClass } from '../../../testing/spyOnClass';
import { Fixtures } from '../../../testing/fixtures';
import { ActivatePushDialogComponent } from '../../activate/activate-push/activate-push-dialog.component';

describe('EnrollPushDialogComponent', () => {
  let component: EnrollPushDialogComponent;
  let fixture: ComponentFixture<EnrollPushDialogComponent>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let notificationService: NotificationService;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollPushDialogComponent>>;
  let matDialog: jasmine.SpyObj<MatDialog>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollPushDialogComponent,
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
          useValue: spyOnClass(TokenService),
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
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollPushDialogComponent);
    component = fixture.componentInstance;
    tokenService = TestBed.get(TokenService);
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

    tokenService.enroll.and.returnValue(of(mockedEnrollResponse));
    tokenService.pairingPoll.and.returnValue(of(Fixtures.activePushToken));

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

  it('should output an message when the push enrollment failed', fakeAsync(() => {
    const mockedEnrollResponse = Fixtures.enrollmentResponse;
    mockedEnrollResponse.result.value = false;

    tokenService.enroll.and.returnValue(of(mockedEnrollResponse));

    component.enrollmentForm.controls.description.setValue('descr');
    fixture.detectChanges();

    const result = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    expect(component.currentStep).toEqual(1);
    result.click();
    tick();

    expect(component.enrolledToken).toEqual(undefined);
    expect(component.currentStep).toEqual(1);
    expect(notificationService.message).toHaveBeenCalledTimes(1);
    expect(notificationService.message).toHaveBeenCalledWith('There was a problem while enrolling the new token.' +
      ' Please try again.');
  }));

  it('should let the user close the dialog', () => {
    component.cancelDialog();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('should open the activation dialog with the right token and configuration', fakeAsync(() => {
    matDialog.open.and.returnValue({ afterClosed: () => of({}) });

    const expectedDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: Fixtures.enrolledToken.serial
    };
    component.enrolledToken = Fixtures.enrolledToken;
    component.goToActivation();
    tick();
    expect(matDialog.open).toHaveBeenCalledTimes(1);
    expect(matDialog.open).toHaveBeenCalledWith(ActivatePushDialogComponent, expectedDialogConfig);
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  }));
});
