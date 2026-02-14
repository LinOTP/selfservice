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
import { Subscription, throwError } from "rxjs";
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

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { TokenType } from "@app/api/token";
import { CreateTokenStepComponent } from "@app/enroll/create-token-step/create-token-step.component";
import { ImportTokenStepComponent } from "@app/enroll/enroll-oath-dialog/oath-enrollment/import-token-step/import-token-step.component";
import { StepActionsComponent } from "@app/enroll/step-actions/step-actions.component";
import { TokenPinFormLayoutComponent } from "@app/enroll/token-pin-form-layout/token-pin-form-layout.component";
import { AuthenticatorLinksComponent } from "@common/authenticator-links/authenticator-links.component";
import { NgSelfServiceCommonModule } from "@common/common.module";
import { Permission } from "@common/permissions";
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
        MockComponent({
          selector: "app-button-wait-indicator",
          inputs: ["show"],
        }),
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
        { provide: LiveAnnouncer, useValue: spyOnClass(LiveAnnouncer) },
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

    // Set up default dialog.open mock
    dialog.open.and.returnValue({
      afterClosed: () => of(false),
    } as any);

    // Mock permissions service
    const permissionsService = TestBed.inject(
      NgxPermissionsService
    ) as jasmine.SpyObj<NgxPermissionsService>;
    permissionsService.hasPermission.and.returnValue(Promise.resolve(false));

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
    component["subscriptions"] = [];
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

  describe("activation integration", () => {
    beforeEach(() => {
      component.enrolledToken = {
        serial: "test-serial",
        type: TokenType.PUSH,
        url: "test-url",
      };
    });

    it("should check for activation permission on init", fakeAsync(() => {
      const permissionsService = TestBed.inject(
        NgxPermissionsService
      ) as jasmine.SpyObj<NgxPermissionsService>;
      permissionsService.hasPermission.and.returnValue(Promise.resolve(true));

      component.ngOnInit();
      tick();

      expect(permissionsService.hasPermission).toHaveBeenCalledWith(
        Permission.ACTIVATEPUSH
      );
      expect(component.hasActivationPermission).toBe(true);
    }));

    it("should start activation process when activateToken is called", fakeAsync(() => {
      const mockActivationDetail = {
        transactionid: "tx123",
        message: "test-message",
      };
      enrollmentService.activate.and.returnValue(of(mockActivationDetail));
      enrollmentService.challengePoll.and.returnValue(
        of({ accept: true, status: "closed" })
      );

      component.activateToken();
      tick();

      expect(enrollmentService.activate).toHaveBeenCalledWith("test-serial");
      expect(component.transactionId).toBe("tx123");
      // After successful completion, state should be COMPLETED
      expect(component.activationState).toBe(
        component.ActivationFlowState.COMPLETED
      );
    }));

    it("should handle activation failure and show retry option", fakeAsync(() => {
      enrollmentService.activate.and.returnValue(
        throwError("activation failed")
      );

      component.activateToken();
      tick();

      expect(component.activationState).toBe(
        component.ActivationFlowState.FAILED
      );
    }));

    it("should cancel activation subscription when dialog is cancelled", () => {
      component.activationSubscription = new Subscription();
      const unsubscribeSpy = spyOn(
        component.activationSubscription,
        "unsubscribe"
      );

      component.cancel();

      expect(unsubscribeSpy).toHaveBeenCalled();
      expect(component.activationSubscription).toBeNull();
    });

    it("should identify push token correctly", () => {
      component.tokenDisplayData = { type: TokenType.PUSH } as any;
      expect(component.isPush()).toBe(true);
      expect(component.isQR()).toBe(false);
    });

    it("should identify QR token correctly", () => {
      component.tokenDisplayData = { type: TokenType.QR } as any;
      expect(component.isPush()).toBe(false);
      expect(component.isQR()).toBe(true);
    });

    it("should return correct step type based on stepper index and activation permission", () => {
      component.hasActivationPermission = true;

      // Mock stepper selectedIndex
      Object.defineProperty(component.stepper, "selectedIndex", {
        value: 0,
        writable: true,
      });
      expect(component.currentStepType).toBe("install");

      Object.defineProperty(component.stepper, "selectedIndex", {
        value: 1,
        writable: true,
      });
      expect(component.currentStepType).toBe("create");

      Object.defineProperty(component.stepper, "selectedIndex", {
        value: 2,
        writable: true,
      });
      expect(component.currentStepType).toBe("scan");

      Object.defineProperty(component.stepper, "selectedIndex", {
        value: 3,
        writable: true,
      });
      expect(component.currentStepType).toBe("activate");

      Object.defineProperty(component.stepper, "selectedIndex", {
        value: 4,
        writable: true,
      });
      expect(component.currentStepType).toBe("done");
    });

    it("should return done step type when no activation permission", () => {
      component.hasActivationPermission = false;

      Object.defineProperty(component.stepper, "selectedIndex", {
        value: 3,
        writable: true,
      });
      expect(component.currentStepType).toBe("done");
    });

    it("should reset activation state when retrying", () => {
      component.activationState = component.ActivationFlowState.FAILED;
      component.enrolledToken = { serial: "test-serial" } as any;

      // Mock the activate call to prevent errors
      spyOn(component, "activateToken");

      component.retryActivation();

      expect(component.activationState).toBe(
        component.ActivationFlowState.NOT_STARTED
      );
      expect(component.activateToken).toHaveBeenCalled();
    });
  });
});
