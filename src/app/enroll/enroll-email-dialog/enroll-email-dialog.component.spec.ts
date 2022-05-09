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
import { TokenType } from '@linotp/data-models';
import { OperationsService } from '../../api/operations.service';
import { EnrollmentService } from '../../api/enrollment.service';
import { NotificationService } from '../../common/notification.service';

import { EnrollEmailDialogComponent } from './enroll-email-dialog.component';
import { UserSystemInfo } from '../../system.service';
import { MockComponent } from '../../../testing/mock-component';

describe('The EnrollEmailDialogComponent', () => {
  let component: EnrollEmailDialogComponent;
  let fixture: ComponentFixture<EnrollEmailDialogComponent>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let localStorageSpy: jasmine.Spy;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollEmailDialogComponent,
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
          useValue: { tokenDisplayData: Fixtures.tokenDisplayData[TokenType.EMAIL], closeLabel: null },
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollEmailDialogComponent);
    component = fixture.componentInstance;

    enrollmentService = getInjectedStub(EnrollmentService);

    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(
      JSON.stringify({ email: Fixtures.userSystemInfo.user.email })
    );
  });

  it('should be created', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.data.tokenDisplayData.type).toEqual(TokenType.EMAIL);
  });

  it('should enroll an email token with a default description', fakeAsync(() => {
    spyOn(component.stepper, 'next');

    enrollmentService.enroll.and.returnValue(of(Fixtures.emailEnrollmentResponse));

    fixture.detectChanges();

    component.enrollToken();
    tick();

    expect(enrollmentService.enroll).toHaveBeenCalledWith({
      type: TokenType.EMAIL,
      description: `Created via SelfService - ${Fixtures.userSystemInfo.user.email}`,
      email_address: Fixtures.userSystemInfo.user.email,
    });
    expect(component.enrolledToken.serial).toEqual(Fixtures.emailEnrollmentResponse.serial);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
    expect(component.enrollmentStep.disabled).toEqual(true);
  }));

  it('should enroll an email token with a custom description', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(component.stepper, 'next');

    enrollmentService.enroll.and.returnValue(of(Fixtures.emailEnrollmentResponse));

    component.data.tokenDisplayData = Fixtures.tokenDisplayData[TokenType.EMAIL];
    component.enrollmentStep.controls.description.setValue('custom description');
    fixture.detectChanges();
    component.enrollToken();
    tick();

    expect(enrollmentService.enroll).toHaveBeenCalledWith({
      type: TokenType.EMAIL,
      description: `custom description - ${Fixtures.userSystemInfo.user.email}`,
      email_address: Fixtures.userSystemInfo.user.email,
    });
    expect(component.enrolledToken.serial).toEqual(Fixtures.emailEnrollmentResponse.serial);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
    expect(component.enrollmentStep.disabled).toEqual(true);
  }));

  describe('edit_email policy', () => {
    [
      {
        description: 'should have an email address input if edit_email is enabled',
        setting: 1,
        canEditEmail: true,
        formItems: ['description', 'emailAddress']
      },
      {
        description: 'should have an email address input if edit_email is not set',
        setting: undefined,
        canEditEmail: true,
        formItems: ['description', 'emailAddress']
      },
      {
        description: 'should not allow to change the token email address if edit_email is disabled',
        setting: 0,
        canEditEmail: false,
        formItems: ['description']
      }
    ].forEach(params => {
      it(params.description, fakeAsync(() => {
        localStorageSpy.and.callFake(key => {
          switch (key) {
            case 'user':
              return JSON.stringify({ email: Fixtures.userSystemInfo.user.email });
            case 'settings':
              return JSON.stringify(<UserSystemInfo['settings']>{ edit_email: params.setting });
          }
        });
        enrollmentService.enroll.and.returnValue(of(Fixtures.emailEnrollmentResponse));

        fixture.detectChanges();

        expect(component.canEditEmail).toBe(params.canEditEmail);
        expect(Object.keys(component.enrollmentStep.controls)).toEqual(params.formItems);

        component.enrollToken();
        tick();

        expect(enrollmentService.enroll).toHaveBeenCalledWith({
          type: TokenType.EMAIL,
          description: `Created via SelfService - ${Fixtures.userSystemInfo.user.email}`,
          email_address: Fixtures.userSystemInfo.user.email,
        });
        expect(component.enrollmentStep.disabled).toEqual(true);
      }));
    });
  });

  it('should allow retrying if enrollment failed', fakeAsync(() => {
    enrollmentService.enroll.and.returnValue(of(null));
    fixture.detectChanges();
    const result = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    result.click();
    tick();

    expect(component.enrolledToken).toEqual(undefined);
    expect(component.enrollmentStep.disabled).toEqual(false);
  }));
});
