import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule, inject, provideAppInitializer } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { QRCodeComponent } from 'angularx-qrcode';
import { CookieModule } from 'ngx-cookie';
import { NgxPermissionsModule } from 'ngx-permissions';

import { ActivateDialogComponent } from '@app/activate/activate-dialog.component';
import { AppInitService } from '@app/app-init.service';
import { AppRoutingModule } from '@app/app-routing.module';
import { AppComponent } from '@app/app.component';
import { AuthModule } from '@app/auth/auth.module';
import { AssignTokenDialogComponent } from '@app/enroll/assign-token-dialog/assign-token-dialog.component';
import { CreateTokenStepComponent } from "@app/enroll/create-token-step/create-token-step.component";
import { DoneStepComponent } from "@app/enroll/done-step/done-step.component";
import { EnrollEmailDialogComponent } from '@app/enroll/enroll-email-dialog/enroll-email-dialog.component';
import { EnrollMOTPDialogComponent } from '@app/enroll/enroll-motp-dialog/enroll-motp-dialog.component';
import { EnrollOATHDialogComponent } from '@app/enroll/enroll-oath-dialog/enroll-oath-dialog.component';
import { ImportTokenStepComponent } from "@app/enroll/enroll-oath-dialog/oath-enrollment/import-token-step/import-token-step.component";
import { EnrollPasswordDialogComponent } from '@app/enroll/enroll-password-dialog/enroll-password-dialog.component';
import { EnrollPushQRDialogComponent } from '@app/enroll/enroll-push-qr-dialog/enroll-push-qr-dialog.component';
import { EnrollSMSDialogComponent } from '@app/enroll/enroll-sms-dialog/enroll-sms-dialog.component';
import { EnrollYubicoDialogComponent } from '@app/enroll/enroll-yubico/enroll-yubico-dialog.component';
import { EnrollComponent } from '@app/enroll/enroll/enroll.component';
import { VerifyTokenComponent } from "@app/enroll/verify-token/verify-token.component";
import { EnrollmentGridComponent } from '@app/enrollment-grid/enrollment-grid.component';
import { HistoryComponent } from '@app/history/history.component';
import { KeyboardKeyComponent } from '@app/keyboard-key/keyboard-key.component';
import { LanguagePickerComponent } from '@app/language-picker/language-picker.component';
import { LoginComponent } from '@app/login/login.component';
import { MaterialModule } from '@app/material.module';
import { QrCodeInputComponent } from '@app/qr-code-input/qr-code-input.component';
import { TestDialogComponent } from '@app/test/test-dialog.component';
import { TokenCardComponent } from '@app/token-card/token-card.component';
import { TokenListComponent } from '@app/token-list/token-list.component';
import { NgSelfServiceCommonModule } from '@common/common.module';
import { MarkdownModule } from 'ngx-markdown';
import { AuthenticatorLinksComponent } from './common/authenticator-links/authenticator-links.component';
import { CustomContentModule } from './custom-content/custom-content.module';
import { TokenPinFormLayoutComponent } from './enroll/token-pin-form-layout/token-pin-form-layout.component';
import { FromBreakpointPipe } from './from-breakpoint.pipe';
import { ResponsiveStepperDirective } from './responsive-stepper.directive';
import { ThemePickerComponent } from './theme-picker/theme-picker.component';

@NgModule({
  declarations: [
    AppComponent,
    TokenListComponent,
    HistoryComponent,
    LoginComponent,
    TokenCardComponent,
    EnrollmentGridComponent,
    EnrollComponent,
    EnrollOATHDialogComponent,
    EnrollPasswordDialogComponent,
    EnrollEmailDialogComponent,
    EnrollSMSDialogComponent,
    EnrollMOTPDialogComponent,
    EnrollPushQRDialogComponent,
    EnrollYubicoDialogComponent,
    AssignTokenDialogComponent,
    TestDialogComponent,
    ActivateDialogComponent,
    LanguagePickerComponent,
    KeyboardKeyComponent,
    ThemePickerComponent,
    CreateTokenStepComponent,
    VerifyTokenComponent,
    DoneStepComponent,
    ImportTokenStepComponent,
    QrCodeInputComponent,
  ],
  bootstrap: [AppComponent], imports: [BrowserModule,
    FormsModule,
    TokenPinFormLayoutComponent,
    ReactiveFormsModule,
    CookieModule.forRoot(),
    QRCodeComponent,
    AppRoutingModule,
    MaterialModule,
    NgSelfServiceCommonModule,
    AuthModule,
    NgxPermissionsModule.forRoot(),
    AuthenticatorLinksComponent,
    MarkdownModule.forRoot(),
    FromBreakpointPipe,
    ResponsiveStepperDirective,
    CustomContentModule], providers: [
      AppInitService,
      provideAppInitializer(() => {
        const initializerFn = ((appInit: AppInitService) => () => appInit.init())(inject(AppInitService));
        return initializerFn();
      }),
      provideHttpClient(withInterceptorsFromDi()),
    ]
})
export class AppModule { }
