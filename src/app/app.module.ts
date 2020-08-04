import { NgModule, APP_INITIALIZER, TRANSLATIONS, LOCALE_ID, TRANSLATIONS_FORMAT } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CookieModule } from 'ngx-cookie';
import { NgxPermissionsModule } from 'ngx-permissions';
import { CustomFormsModule } from 'ng2-validation';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { QRCodeModule } from 'angularx-qrcode';

import { NgSelfServiceCommonModule } from './common/common.module';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material.module';
import { AuthModule } from './auth/auth.module';

import { AppComponent } from './app.component';
import { TokenListComponent } from './token-list/token-list.component';
import { LoginComponent } from './login/login.component';
import { EnrollOATHDialogComponent } from './enroll/enroll-oath-dialog/enroll-oath-dialog.component';
import { EnrollEmailDialogComponent } from './enroll/enroll-email-dialog/enroll-email-dialog.component';
import { EnrollMOTPDialogComponent } from './enroll/enroll-motp-dialog/enroll-motp-dialog.component';
import { EnrollSMSDialogComponent } from './enroll/enroll-sms-dialog/enroll-sms-dialog.component';
import { EnrollPushQRDialogComponent } from './enroll/enroll-push-qr-dialog/enroll-push-qr-dialog.component';
import { TokenCardComponent } from './token-card/token-card.component';
import { EnrollmentGridComponent } from './enrollment-grid/enrollment-grid.component';
import { AppInitService } from './app-init.service';
import { TestDialogComponent } from './test/test-dialog.component';
import { ActivateDialogComponent } from './activate/activate-dialog.component';
import { AssignTokenDialogComponent } from './enroll/assign-token-dialog/assign-token-dialog.component';
import { EnrollYubicoDialogComponent } from './enroll/enroll-yubico/enroll-yubico-dialog.component';
import { EnrollPasswordDialogComponent } from './enroll/enroll-password-dialog/enroll-password-dialog.component';
import { LanguagePickerComponent } from './language-picker/language-picker.component';

declare const require;

@NgModule({
  declarations: [
    AppComponent,
    TokenListComponent,
    LoginComponent,
    TokenCardComponent,
    EnrollmentGridComponent,
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
  ],
  entryComponents: [
    ActivateDialogComponent,
    EnrollOATHDialogComponent,
    EnrollPasswordDialogComponent,
    EnrollEmailDialogComponent,
    EnrollSMSDialogComponent,
    EnrollMOTPDialogComponent,
    EnrollPushQRDialogComponent,
    EnrollYubicoDialogComponent,
    AssignTokenDialogComponent,
    TestDialogComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CookieModule.forRoot(),
    CustomFormsModule,
    QRCodeModule,
    AppRoutingModule,
    MaterialModule,
    NgSelfServiceCommonModule,
    AuthModule,
    NgxPermissionsModule.forRoot(),
  ],
  providers: [
    AppInitService,
    {
      provide: APP_INITIALIZER,
      useFactory: (appInit: AppInitService) => () => appInit.init(),
      deps: [AppInitService],
      multi: true
    },
    {
      provide: TRANSLATIONS,
      useFactory: (locale) => {
        return require(`raw-loader!locale/messages.${locale}.xlf`).default;
      },
      deps: [LOCALE_ID]
    },
    { provide: TRANSLATIONS_FORMAT, useValue: 'xlf' },
    I18n,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
