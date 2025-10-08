import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { RouterTestingModule } from "@angular/router/testing";

import {
  NgxPermissionsAllowStubDirective,
  NgxPermissionsService,
} from "ngx-permissions";
import { Subscription } from "rxjs";
import { of } from "rxjs/internal/observable/of";

import { Fixtures } from "@testing/fixtures";
import { MockComponent } from "@testing/mock-component";
import { getInjectedStub, spyOnClass } from "@testing/spyOnClass";

import { EnrollmentService } from "@api/enrollment.service";
import { OperationsService } from "@api/operations.service";
import { TokenService } from "@api/token.service";
import { ActivateDialogComponent } from "@app/activate/activate-dialog.component";
import { LoginService } from "@app/login/login.service";
import { MaterialModule } from "@app/material.module";
import { NotificationService } from "@common/notification.service";

import { TokenType } from "@app/api/token";
import { CreateTokenStepComponent } from "@app/enroll/create-token-step/create-token-step.component";
import { ImportTokenStepComponent } from "@app/enroll/enroll-oath-dialog/oath-enrollment/import-token-step/import-token-step.component";
import { StepActionsComponent } from "@app/enroll/step-actions/step-actions.component";
import { TokenPinFormLayoutComponent } from "@app/enroll/token-pin-form-layout/token-pin-form-layout.component";
import { AuthenticatorLinksComponent } from "@common/authenticator-links/authenticator-links.component";
import { NgSelfServiceCommonModule } from "@common/common.module";
import { EnrollPushQRDialogComponent } from "./enroll-push-qr-dialog.component";

describe("EnrollPushDialogComponent", () => {
  let component: EnrollPushQRDialogComponent;
  let fixture: ComponentFixture<EnrollPushQRDialogComponent>;

  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let loginService: jasmine.SpyObj<LoginService>;

  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollPushQRDialogComponent>>;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        EnrollPushQRDialogComponent,
        StepActionsComponent,
        ImportTokenStepComponent,
        CreateTokenStepComponent,
        MockComponent({
          selector: "app-button-wait-indicator",
          inputs: ["show"],
        }),
      ],
      imports: [
        AuthenticatorLinksComponent,
        TokenPinFormLayoutComponent,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        NgxPermissionsAllowStubDirective,
        NgSelfServiceCommonModule,
      ],
      providers: [
        {
          provide: OperationsService,
          useValue: spyOnClass(OperationsService),
        },
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService),
        },
        {
          provide: EnrollmentService,
          useValue: spyOnClass(EnrollmentService),
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
          useValue: { tokenType: TokenType.PUSH },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollPushQRDialogComponent);
    component = fixture.componentInstance;

    enrollmentService = getInjectedStub(EnrollmentService);
    loginService = getInjectedStub(LoginService);

    dialogRef =
      getInjectedStub<MatDialogRef<EnrollPushQRDialogComponent>>(MatDialogRef);
    dialog = getInjectedStub(MatDialog);

    loginService.hasPermission$.and.returnValue(of(true));
    spyOn(localStorage, "getItem").and.returnValue(
      JSON.stringify({ otp_pin_minlength: 0 })
    );

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should unsubscribe from polling on destroy if there is a subscription", () => {
    component["subscriptions"] = [new Subscription()];
    const componentSpy = spyOn(component["subscriptions"][0], "unsubscribe");

    component.ngOnDestroy();
    expect(componentSpy).toHaveBeenCalledTimes(1);
  });

  it("should not attempt to unsubscribe from polling on destroy if there was no subscription", () => {
    spyOn(Subscription.prototype, "unsubscribe");
    component.ngOnDestroy();
    expect(Subscription.prototype.unsubscribe).not.toHaveBeenCalled();
  });

  it("should start at initial step of 1", () => {
    expect(component.stepper.selectedIndex).toEqual(0);
  });

  it("should enroll the push token without failure", fakeAsync(() => {
    const mockedEnrollResponse = Fixtures.enrollmentResponse;
    const expectedToken = {
      serial: mockedEnrollResponse.serial,
      url: mockedEnrollResponse.lse_qr_url.value,
      type: TokenType.PUSH,
      description: "descr",
    };

    enrollmentService.enroll.and.returnValue(of(mockedEnrollResponse));
    enrollmentService.pairingPoll.and.returnValue(of(Fixtures.activePushToken));

    component.createTokenForm.controls.description.setValue("descr");
    expect(component.createTokenForm.valid).toEqual(true);
    component.enrollPushQRToken();
    fixture.detectChanges();
    tick(500);
    expect(component.enrolledToken).toEqual(expectedToken);
    expect(component.stepper.selectedIndex).toEqual(2);
  }));

  describe("finalizeEnrollment", () => {
    it(`should open the ActivateDialog even if the user does not have permissions to test a token`, () => {
      component.testAfterEnrollment = false;
      fixture.detectChanges();

      component.enrolledToken = {
        serial: "serial",
        type: TokenType.PUSH,
        url: "url",
      };
      fixture.detectChanges();

      dialogRef.afterClosed.and.returnValue(of({}));
      dialog.open.and.returnValue({
        afterClosed: () => of({}),
      } as MatDialogRef<ActivateDialogComponent>);

      component.finalizeEnrollment();
      expect(dialogRef.close).toHaveBeenCalledWith();
      expect(dialog.open).toHaveBeenCalledTimes(1);
    });
  });
});
