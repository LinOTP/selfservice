import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CookieModule } from 'ngx-cookie';
import { NgxPermissionsModule } from 'ngx-permissions';
import { QRCodeModule } from 'angularx-qrcode';

import { NgSelfServiceCommonModule } from '@common/common.module';
import { AppRoutingModule } from '@app/app-routing.module';
import { MaterialModule } from '@app/material.module';
import { AuthModule } from '@app/auth/auth.module';

import { AppComponent } from '@app/app.component';
import { TokenListComponent } from '@app/token-list/token-list.component';
import { LoginComponent } from '@app/login/login.component';
import { HistoryComponent } from '@app/history/history.component';
import { EnrollOATHDialogComponent } from '@app/enroll/enroll-oath-dialog/enroll-oath-dialog.component';
import { EnrollEmailDialogComponent } from '@app/enroll/enroll-email-dialog/enroll-email-dialog.component';
import { EnrollMOTPDialogComponent } from '@app/enroll/enroll-motp-dialog/enroll-motp-dialog.component';
import { EnrollSMSDialogComponent } from '@app/enroll/enroll-sms-dialog/enroll-sms-dialog.component';
import { EnrollPushQRDialogComponent } from '@app/enroll/enroll-push-qr-dialog/enroll-push-qr-dialog.component';
import { TokenCardComponent } from '@app/token-card/token-card.component';
import { EnrollmentGridComponent } from '@app/enrollment-grid/enrollment-grid.component';
import { AppInitService } from '@app/app-init.service';
import { TestDialogComponent } from '@app/test/test-dialog.component';
import { ActivateDialogComponent } from '@app/activate/activate-dialog.component';
import { AssignTokenDialogComponent } from '@app/enroll/assign-token-dialog/assign-token-dialog.component';
import { EnrollYubicoDialogComponent } from '@app/enroll/enroll-yubico/enroll-yubico-dialog.component';
import { EnrollPasswordDialogComponent } from '@app/enroll/enroll-password-dialog/enroll-password-dialog.component';
import { LanguagePickerComponent } from '@app/language-picker/language-picker.component';
import { KeyboardKeyComponent } from '@app/keyboard-key/keyboard-key.component';
import { EnrollComponent } from '@app/enroll/enroll/enroll.component';

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
