import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

import { NgxPermissionsAllowStubDirective, NgxPermissionsService } from 'ngx-permissions';
import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { spyOnClass, getInjectedStub } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { TokenType } from '../../api/token';
import { OperationsService } from '../../api/operations.service';
import { EnrollmentService } from '../../api/enrollment.service';
import { NotificationService } from '../../common/notification.service';

import { EnrollSMSDialogComponent } from './enroll-sms-dialog.component';
import { UserSystemInfo } from '../../system.service';
import { MockComponent } from '../../../testing/mock-component';

describe('The EnrollSMSDialogComponent', () => {
  let component: EnrollSMSDialogComponent;
  let fixture: ComponentFixture<EnrollSMSDialogComponent>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let localStorageSpy: jasmine.Spy;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollSMSDialogComponent,
        NgxPermissionsAllowStubDirective,
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
          useValue: { tokenTypeDetails: Fixtures.tokenTypeDetails[TokenType.SMS], closeLabel: null },
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollSMSDialogComponent);
    component = fixture.componentInstance;

    notificationService = getInjectedStub(NotificationService);
    enrollmentService = getInjectedStub(EnrollmentService);

    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(
      JSON.stringify({ mobile: Fixtures.userSystemInfo.user.mobile })
    );
  });

  it('should be created', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.data.tokenTypeDetails.type).toEqual(TokenType.SMS);
  });

  it('should enroll an sms token with a default description', fakeAsync(() => {
    spyOn(component.stepper, 'next');

    enrollmentService.enroll.and.returnValue(of(Fixtures.smsEnrollmentResponse));

    fixture.detectChanges();

    component.enrollToken();
    tick();

    expect(enrollmentService.enroll).toHaveBeenCalledWith({
      type: TokenType.SMS,
      description: `Created via SelfService - ${Fixtures.userSystemInfo.user.mobile}`,
      phone: Fixtures.userSystemInfo.user.mobile,
    });
    expect(component.enrolledToken.serial).toEqual(Fixtures.smsEnrollmentResponse.detail.serial);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
  }));

  it('should enroll an sms token with a custom description', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(component.stepper, 'next');

    enrollmentService.enroll.and.returnValue(of(Fixtures.smsEnrollmentResponse));

    component.data.tokenTypeDetails = Fixtures.tokenTypeDetails[TokenType.SMS];
    component.enrollmentStep.controls.description.setValue('custom description');
    fixture.detectChanges();
    component.enrollToken();
    tick();

    expect(enrollmentService.enroll).toHaveBeenCalledWith({
      type: TokenType.SMS,
      description: `custom description - ${Fixtures.userSystemInfo.user.mobile}`,
      phone: Fixtures.userSystemInfo.user.mobile,
    });
    expect(component.enrolledToken.serial).toEqual(Fixtures.smsEnrollmentResponse.detail.serial);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
  }));

  describe('edit_sms policy', () => {
    [
      {
        description: 'should have an phone number input if edit_sms is enabled',
        setting: 1,
        canEditPhone: true,
        formItems: ['description', 'phoneNumber']
      },
      {
        description: 'should have an phone number input if edit_sms is not set',
        setting: undefined,
        canEditPhone: true,
        formItems: ['description', 'phoneNumber']
      },
      {
        description: 'should not allow to change the token phone number if edit_sms is disabled',
        setting: 0,
        canEditPhone: false,
        formItems: ['description']
      }
    ].forEach(params => {
      it(params.description, fakeAsync(() => {
        localStorageSpy.and.callFake(key => {
          switch (key) {
            case 'user':
              return JSON.stringify({ mobile: Fixtures.userSystemInfo.user.mobile });
            case 'settings':
              return JSON.stringify(<UserSystemInfo['settings']>{ edit_sms: params.setting });
          }
        });
        enrollmentService.enroll.and.returnValue(of(Fixtures.smsEnrollmentResponse));

        fixture.detectChanges();

        expect(component.canEditPhone).toBe(params.canEditPhone);
        expect(Object.keys(component.enrollmentStep.controls)).toEqual(params.formItems);

        component.enrollToken();
        tick();

        expect(enrollmentService.enroll).toHaveBeenCalledWith({
          type: TokenType.SMS,
          description: `Created via SelfService - ${Fixtures.userSystemInfo.user.mobile}`,
          phone: Fixtures.userSystemInfo.user.mobile,
        });
      }));
    });
  });

  it('should not notify user if enrollment failed', fakeAsync(() => {
    // the enrollment service does the notification
    const mockEnrollmentResponse = Fixtures.smsEnrollmentResponse;
    mockEnrollmentResponse.result.value = false;

    enrollmentService.enroll.and.returnValue(of(mockEnrollmentResponse));
    fixture.detectChanges();
    const result = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    result.click();
    tick();

    expect(component.enrolledToken).toEqual(undefined);
    expect(notificationService.message).not.toHaveBeenCalled();
  }));
});
