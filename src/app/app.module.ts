import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { QRCodeModule } from 'angularx-qrcode';
import { CookieModule } from 'ngx-cookie';
import { NgxPermissionsModule } from 'ngx-permissions';

import { ActivateDialogComponent } from '@app/activate/activate-dialog.component';
import { AppInitService } from '@app/app-init.service';
import { AppRoutingModule } from '@app/app-routing.module';
import { AppComponent } from '@app/app.component';
import { AuthModule } from '@app/auth/auth.module';
import { AssignTokenDialogComponent } from '@app/enroll/assign-token-dialog/assign-token-dialog.component';
import { EnrollEmailDialogComponent } from '@app/enroll/enroll-email-dialog/enroll-email-dialog.component';
import { EnrollMOTPDialogComponent } from '@app/enroll/enroll-motp-dialog/enroll-motp-dialog.component';
import { EnrollOATHDialogComponent } from '@app/enroll/enroll-oath-dialog/enroll-oath-dialog.component';
import { EnrollPasswordDialogComponent } from '@app/enroll/enroll-password-dialog/enroll-password-dialog.component';
import { EnrollPushQRDialogComponent } from '@app/enroll/enroll-push-qr-dialog/enroll-push-qr-dialog.component';
import { EnrollSMSDialogComponent } from '@app/enroll/enroll-sms-dialog/enroll-sms-dialog.component';
import { EnrollYubicoDialogComponent } from '@app/enroll/enroll-yubico/enroll-yubico-dialog.component';
import { EnrollComponent } from '@app/enroll/enroll/enroll.component';
import { EnrollmentGridComponent } from '@app/enrollment-grid/enrollment-grid.component';
import { HistoryComponent } from '@app/history/history.component';
import { KeyboardKeyComponent } from '@app/keyboard-key/keyboard-key.component';
import { LanguagePickerComponent } from '@app/language-picker/language-picker.component';
import { LoginComponent } from '@app/login/login.component';
import { MaterialModule } from '@app/material.module';
import { TestDialogComponent } from '@app/test/test-dialog.component';
import { TokenCardComponent } from '@app/token-card/token-card.component';
import { TokenListComponent } from '@app/token-list/token-list.component';
import { NgSelfServiceCommonModule } from '@common/common.module';
import { AuthenticatorLinksComponent } from './common/authenticator-links/authenticator-links.component';
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
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CookieModule.forRoot(),
    QRCodeModule,
    AppRoutingModule,
    MaterialModule,
    NgSelfServiceCommonModule,
    AuthModule,
    NgxPermissionsModule.forRoot(),
    AuthenticatorLinksComponent
  ],
  providers: [
    AppInitService,
    {
      provide: APP_INITIALIZER,
      useFactory: (appInit: AppInitService) => () => appInit.init(),
      deps: [AppInitService],
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
