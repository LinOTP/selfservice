import { A11yModule } from "@angular/cdk/a11y";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { NgSelfServiceCommonModule } from "@app/common/common.module";
import { TokenPinFormLayoutComponent } from "@app/enroll/token-pin-form-layout/token-pin-form-layout.component";
import { MaterialModule } from "@app/material.module";
import { QRCodeModule } from "angularx-qrcode";
import { NgxPermissionsModule } from "ngx-permissions";
import { CreateTokenStepComponent } from "../../create-token-step/create-token-step.component";
import { DoneStepComponent } from "../../done-step/done-step.component";
import { FocusOnStepperChangeDirective } from "./focus-on-stepper-change.directive";
import { ImportTokenStepComponent } from "./import-token-step/import-token-step.component";
import { TokenInfoComponent } from "./token-info.component";
import { VerifyTokenComponent } from "@app/enroll/verify-token/verify-token.component";

@NgModule({
    declarations: [CreateTokenStepComponent, FocusOnStepperChangeDirective, ImportTokenStepComponent, VerifyTokenComponent, DoneStepComponent, TokenInfoComponent],
    imports: [CommonModule, MaterialModule, ReactiveFormsModule, NgSelfServiceCommonModule, A11yModule, QRCodeModule, NgxPermissionsModule.forChild(), TokenPinFormLayoutComponent],
    exports: [CreateTokenStepComponent, FocusOnStepperChangeDirective, ImportTokenStepComponent, VerifyTokenComponent, DoneStepComponent],
    providers: [],
})
export class OathEnrollmentModule { }
