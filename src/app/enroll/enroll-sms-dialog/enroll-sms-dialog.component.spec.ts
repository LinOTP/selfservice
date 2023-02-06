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

import { EnrollSMSDialogComponent } from './enroll-sms-dialog.component';
import { UserSystemInfo } from '../../system.service';
import { MockComponent } from '../../../testing/mock-component';
import { LoginService } from '../../login/login.service';
import { TokenService } from '../../api/token.service';

describe('The EnrollSMSDialogComponent', () => {
  let component: EnrollSMSDialogComponent;
  let fixture: ComponentFixture<EnrollSMSDialogComponent>;

  let tokenService: jasmine.SpyObj<TokenService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let loginService: jasmine.SpyObj<LoginService>;
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
          provide: TokenService,
          useValue: spyOnClass(TokenService)
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
          provide: LoginService,
          useValue: spyOnClass(LoginService),
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
          useValue: { tokenType: TokenType.SMS },
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollSMSDialogComponent);
    component = fixture.componentInstance;

    tokenService = getInjectedStub(TokenService);
    enrollmentService = getInjectedStub(EnrollmentService);
    loginService = getInjectedStub(LoginService);

    loginService.hasPermission$.and.returnValue(of(true));

    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(
      JSON.stringify({ mobile: Fixtures.userSystemInfo.user.mobile })
    );
  });

  it('should be created', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.data.tokenType).toEqual(TokenType.SMS);
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
    expect(component.enrolledToken.serial).toEqual(Fixtures.smsEnrollmentResponse.serial);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
    expect(component.enrollmentStep.disabled).toEqual(true);
    expect(tokenService.updateTokenList).toHaveBeenCalledTimes(1);
  }));

  it('should enroll an sms token with a custom description', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(component.stepper, 'next');

    enrollmentService.enroll.and.returnValue(of(Fixtures.smsEnrollmentResponse));

    component.data.tokenType = TokenType.SMS;
    component.enrollmentStep.controls.description.setValue('custom description');
    fixture.detectChanges();
    component.enrollToken();
    tick();

    expect(enrollmentService.enroll).toHaveBeenCalledWith({
      type: TokenType.SMS,
      description: `custom description - ${Fixtures.userSystemInfo.user.mobile}`,
      phone: Fixtures.userSystemInfo.user.mobile,
    });
    expect(component.enrolledToken.serial).toEqual(Fixtures.smsEnrollmentResponse.serial);
    expect(component.stepper.next).toHaveBeenCalledTimes(1);
    expect(component.enrollmentStep.disabled).toEqual(true);
    expect(tokenService.updateTokenList).toHaveBeenCalledTimes(1);
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
    expect(tokenService.updateTokenList).not.toHaveBeenCalled();
  }));
});
