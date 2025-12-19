import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NotificationService } from "@app/common/notification.service";
import { MaterialModule } from "@app/material.module";
import { MockComponent } from "@testing/mock-component";
import { spyOnClass } from "@testing/spyOnClass";
import { ImportTokenStepComponent } from "./import-token-step.component";

describe("ImportTokenStepComponent", () => {
  let component: ImportTokenStepComponent;
  let fixture: ComponentFixture<ImportTokenStepComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CommonModule, MaterialModule,
        MockComponent({ selector: 'qrcode', inputs: ['qrdata', 'width', 'errorCorrectionLevel', 'margin'] }),
        MockComponent({ selector: 'app-verify-token', inputs: ['token', 'form'], outputs: ['tokenVerified'] }),
      ],
      declarations: [
        ImportTokenStepComponent,
      ],
      providers: [
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService),
        },
      ]

    }).compileComponents();
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportTokenStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });


  it("should show correct layout and info when verify process is enabled", () => {
    component.verifyFlowEnabled = true;
    component.enrolledToken = {} as any;

    fixture.detectChanges();
    const verifyTokenComponent = fixture.nativeElement.querySelector('.verify-container');
    const noVerifyTokenComponent = fixture.nativeElement.querySelector('.no-verify-container');
    const statusInfo = fixture.nativeElement.querySelector('.status-info');

    expect(verifyTokenComponent).toBeTruthy();
    expect(noVerifyTokenComponent).toBeFalsy();
    expect(statusInfo).toBeTruthy();
  })

  it("should show correct layout and info when verify process is disabled", () => {
    component.verifyFlowEnabled = false;
    component.enrolledToken = {} as any;

    fixture.detectChanges();
    const verifyTokenComponent = fixture.nativeElement.querySelector('.verify-container');
    const noVerifyTokenComponent = fixture.nativeElement.querySelector('.no-verify-container');
    const statusInfo = fixture.nativeElement.querySelector('.status-info');

    expect(verifyTokenComponent).toBeFalsy();
    expect(noVerifyTokenComponent).toBeTruthy();
    expect(statusInfo).toBeFalsy();
  })

  it("should show correct status info", () => {
    component.verifyFlowEnabled = true;
    component.enrolledToken = {} as any;

    fixture.detectChanges();
    expect(component.verified).toBeFalse();
    let statusInfoVerified = fixture.nativeElement.querySelector('[data-test="info-verified"]');
    let statusInfoNotVerified = fixture.nativeElement.querySelector("[data-test='info-non-verified']");
    expect(statusInfoVerified).toBeFalsy();
    expect(statusInfoNotVerified).toBeTruthy();

    component.verified = true;
    fixture.detectChanges();
    statusInfoVerified = fixture.nativeElement.querySelector('[data-test="info-verified"]');
    statusInfoNotVerified = fixture.nativeElement.querySelector("[data-test='info-non-verified']");
    expect(statusInfoVerified).toBeTruthy();
    expect(statusInfoNotVerified).toBeFalsy();
  })
})