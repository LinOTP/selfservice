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

import { EnrollPushQRDialogComponent } from './enroll-push-qr-dialog.component';
import { TokenType } from '@linotp/data-models';
import { NgxPermissionsService, NgxPermissionsAllowStubDirective } from 'ngx-permissions';
import { Subscription } from 'rxjs';

let component: EnrollPushQRDialogComponent;
let fixture: ComponentFixture<EnrollPushQRDialogComponent>;
let enrollmentService: jasmine.SpyObj<EnrollmentService>;

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
          useValue: { tokenDisplayData: Fixtures.tokenDisplayData[TokenType.PUSH], closeLabel: null },
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollPushQRDialogComponent);
    component = fixture.componentInstance;
    enrollmentService = getInjectedStub(EnrollmentService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should unsubscribe from polling on destroy if there is a subscription', () => {
    component['pairingSubscription'] = new Subscription();
    const componentSpy = spyOn(component['pairingSubscription'], 'unsubscribe');

    component.ngOnDestroy();
    expect(componentSpy).toHaveBeenCalledTimes(1);
  });

  it('should not attempt to unsubscribe from polling on destroy if there was no subscription', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    component.ngOnDestroy();
    expect(Subscription.prototype.unsubscribe).not.toHaveBeenCalled();
  });

  it('should start at initial step of 1', () => {
    expect(component.stepper.selectedIndex).toEqual(0);
  });

  it('should enroll the push token without failure', fakeAsync(() => {
    const mockedEnrollResponse = Fixtures.enrollmentResponse;
    const expectedToken = {
      serial: mockedEnrollResponse.serial,
      url: mockedEnrollResponse.lse_qr_url.value
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
    expect(component.enrollmentStep.disabled).toEqual(true);
  }));

  it('should stay on the first step and allow retrying if enrollment fails', fakeAsync(() => {
    enrollmentService.enroll.and.returnValue(of(null));

    component.enrollmentStep.controls.description.setValue('descr');
    fixture.detectChanges();

    const result = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    expect(component.stepper.selectedIndex).toEqual(0);
    result.click();
    tick();

    expect(component.enrolledToken).toEqual(undefined);
    expect(component.stepper.selectedIndex).toEqual(0);
    expect(component.enrollmentStep.disabled).toEqual(false);
  }));
});
