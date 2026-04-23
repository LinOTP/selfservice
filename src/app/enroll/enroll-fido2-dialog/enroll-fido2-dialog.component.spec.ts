import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from "@angular/core/testing";
import { EnrollFIDO2DialogComponent } from "./enroll-fido2-dialog.component";

import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { EnrollmentService } from "@app/api/enrollment.service";

import { of } from "rxjs";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";

import { MaterialModule } from "@app/material.module";
import { NgxPermissionsAllowStubDirective, NgxPermissionsService } from "ngx-permissions";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { LoginService } from "@app/login/login.service";
import { NgSelfServiceCommonModule } from "@app/common/common.module";
import { getInjectedStub, spyOnClass } from "@testing/spyOnClass";
import { StepActionsComponent } from "../step-actions/step-actions.component";
import { ImportTokenStepComponent } from "../enroll-oath-dialog/oath-enrollment/import-token-step/import-token-step.component";
import { CreateTokenStepComponent } from "../create-token-step/create-token-step.component";
import { AuthenticatorLinksComponent } from "@app/common/authenticator-links/authenticator-links.component";
import { TokenPinFormLayoutComponent } from "../token-pin-form-layout/token-pin-form-layout.component";
import { AppModule } from "@app/app.module";
import { TokenService } from "@app/api/token.service";
import { NotificationService } from "@app/common/notification.service";
import { OperationsService } from "@app/api/operations.service";
import { TokenType } from "@app/api/token";
import { convertToWebAuthnOptions } from "./fido2-utils";

describe("EnrollFIDO2DialogComponent", () => {
  let component: EnrollFIDO2DialogComponent;
  let fixture: ComponentFixture<EnrollFIDO2DialogComponent>;

  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let loginService: jasmine.SpyObj<LoginService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        EnrollFIDO2DialogComponent,
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
        AppModule,
        MatDialogModule
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
      { provide: MAT_DIALOG_DATA, useValue: { type: TokenType.FIDO2 } },
      { provide: LiveAnnouncer, useValue: spyOnClass(LiveAnnouncer) },
    ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollFIDO2DialogComponent);
    component = fixture.componentInstance;

        enrollmentService = getInjectedStub(EnrollmentService);
        loginService = getInjectedStub(LoginService);
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
        component.tokenDisplayData = {type: TokenType.FIDO2} as any
  });

  // Utility stubs
  const mockWebAuthnSuccess = () => {
    const creds = {
      id: "cred-id-123",
      rawId: new Uint8Array([11, 22, 33]).buffer,
      response: {
        clientDataJSON: new Uint8Array([1, 2, 3]).buffer,
        attestationObject: new Uint8Array([4, 5, 6]).buffer,
      },
    };

    Object.defineProperty(navigator.credentials, "create", {
      value: jasmine.createSpy().and.callFake(() => Promise.resolve(creds)),
      configurable: true,
    });
  };

  const mockWebAuthnReject = () => {
    Object.defineProperty(navigator.credentials, "create", {
      value: jasmine.createSpy().and.callFake(() => Promise.reject(new Error("NotAllowedError"))),
      configurable: true,
    });
  };


  it("should create", () => {
    expect(component).toBeTruthy();
  });


  it("should run full activation flow successfully", fakeAsync(() => {
    const token = { serial: "S123", type: "fido2", registerrequest: {rp: {id: "localhost"}} } as any;

    spyOn(component as any, "enrollToken").and.returnValue(of(token));
    component.enrolledToken = token;

    enrollmentService.fido2_activate_begin.and.returnValue(
      of({
        rp: { id: "localhost", name: "Example" },
        user: {
          id: "AQID",
          name: "user",
          displayName: "User D",
        },
        challenge: "AAAA",
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      })
    );

    enrollmentService.fido2_activate_finish.and.returnValue(of({ activated: true }) as any);

    mockWebAuthnSuccess();

    component.createToken();
    tick(2000);
    flushMicrotasks();

    expect(enrollmentService.fido2_activate_begin).toHaveBeenCalled();
    expect(enrollmentService.fido2_activate_finish).toHaveBeenCalled();
  }));


  it("should show error when WebAuthn rejects", fakeAsync(() => {
    const token = { serial: "S555", type: "fido2" } as any;
    spyOn(component as any, "enrollToken").and.returnValue(of(token));
    component.enrolledToken = token;

    enrollmentService.fido2_activate_begin.and.returnValue(of({
      rp: { id: "ex.com", name: "Example" },
      user: { id: "AQID", name: "u", displayName: "U" },
      challenge: "AAAA",
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
    }));

    mockWebAuthnReject();
    const errSpy = spyOn(component, "handleError").and.callThrough();

    component.createToken();
    tick(2000);
    flushMicrotasks();

    expect(errSpy).toHaveBeenCalled();
    expect(component.activationFailed).toBeTrue();
    expect(component.errMsg).toBeTruthy();
  }));


  it("convertToWebAuthnOptions should decode base64url fields", () => {
    const req: any = {
      rp: { id: "a.com", name: "A" },
      user: {
        id: "AQID", // base64url for [1,2,3]
        name: "u",
        displayName: "U",
      },
      challenge: "BAUG", // base64url for [4,5,6]
      pubKeyCredParams: [],
      authenticatorSelection: {},
    };

    const result = convertToWebAuthnOptions(req);
    expect(result.user.id instanceof ArrayBuffer).toBeTrue();
    expect(result.challenge instanceof ArrayBuffer).toBeTrue();
  });


  it("isSupported should return true when navigator.credentials.create exists", () => {
    Object.defineProperty(navigator.credentials, "create", {
      value: () => {},
      configurable: true,
    });

    expect(component.isSupported()).toBeTrue();
  });

});