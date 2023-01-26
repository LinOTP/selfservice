import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { By } from '@angular/platform-browser';

import { NgxPermissionsAllowStubDirective, NgxPermissionsService } from 'ngx-permissions';
import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { MockComponent } from '../../../testing/mock-component';
import { spyOnClass, getInjectedStub } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { TokenType } from '@linotp/data-models';
import { OperationsService } from '../../api/operations.service';
import { EnrollmentService } from '../../api/enrollment.service';
import { NotificationService } from '../../common/notification.service';

import { EnrollOATHDialogComponent } from './enroll-oath-dialog.component';
import { LoginService } from '../../login/login.service';
import { TokenService } from '../../api/token.service';


[TokenType.HOTP, TokenType.TOTP].forEach(inputType =>
  describe('The EnrollOATHDialogComponent', () => {
    let component: EnrollOATHDialogComponent;
    let fixture: ComponentFixture<EnrollOATHDialogComponent>;
    let tokenService: jasmine.SpyObj<TokenService>;
    let notificationService: jasmine.SpyObj<NotificationService>;
    let enrollmentService: jasmine.SpyObj<EnrollmentService>;
    let loginService: jasmine.SpyObj<LoginService>;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        declarations: [
          EnrollOATHDialogComponent,
          MockComponent({ selector: 'qrcode', inputs: ['qrdata', 'width', 'errorCorrectionLevel'] }),
          MockComponent({ selector: 'app-button-wait-indicator', inputs: ['show'] }),
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
            useValue: { tokenType: inputType },
          },
        ],
      })
        .compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(EnrollOATHDialogComponent);
      component = fixture.componentInstance;

      tokenService = getInjectedStub(TokenService);
      notificationService = getInjectedStub(NotificationService);
      enrollmentService = getInjectedStub(EnrollmentService);
      loginService = getInjectedStub(LoginService);

      loginService.hasPermission$.and.returnValue(of(true));

      fixture.detectChanges();
    });

    it('should be created', () => {
      expect(component).toBeTruthy();
      expect(component.data.tokenType).toEqual(inputType);
    });

    it(`should enroll a ${inputType} token with a default description`, fakeAsync(() => {
      spyOn(component.stepper, 'next');

      enrollmentService.enroll.and.returnValue(of(Fixtures.OATHEnrollmentResponse));
      const expectedToken = { ...Fixtures.enrolledToken, type: inputType };

      fixture.detectChanges();

      component.enrollToken();
      tick();

      expect(enrollmentService.enroll).toHaveBeenCalledWith({
        type: inputType,
        description: 'Created via SelfService'
      });
      expect(component.enrolledToken).toEqual(expectedToken);
      expect(component.stepper.next).toHaveBeenCalledTimes(1);
      expect(component.enrollmentStep.disabled).toEqual(true);
      expect(tokenService.updateTokenList).toHaveBeenCalledTimes(1);
    }));

    it('should enroll a ${inputType} token with a custom description', fakeAsync(() => {
      spyOn(component.stepper, 'next');

      enrollmentService.enroll.and.returnValue(of(Fixtures.OATHEnrollmentResponse));
      const expectedToken = { ...Fixtures.enrolledToken, type: inputType };

      component.enrollmentStep.controls.description.setValue('custom description');
      fixture.detectChanges();
      component.enrollToken();
      tick();

      expect(enrollmentService.enroll).toHaveBeenCalledWith({
        type: inputType,
        description: 'custom description'
      });
      expect(component.enrolledToken).toEqual(expectedToken);
      expect(component.stepper.next).toHaveBeenCalledTimes(1);
      expect(component.enrollmentStep.disabled).toEqual(true);
      expect(tokenService.updateTokenList).toHaveBeenCalledTimes(1);
    }));

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

    describe('copyInputMessage', () => {
      let element: HTMLInputElement;

      beforeEach(() => {
        element = document.createElement('input');
        element.value = 'thing to copy';
        document.body.appendChild(element);
      });

      afterEach(() => {
        element.remove();
      });

      it('should copy the content of the input element and notify the user', () => {
        spyOn(document, 'execCommand');
        component.copyInputMessage(element);

        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(notificationService.message).toHaveBeenCalledWith('Copied');

        expect(window.getSelection().toString()).toEqual('thing to copy');
      });
    });
  })
);
