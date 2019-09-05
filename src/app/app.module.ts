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
import { APIModule } from './api/api.module';

import { AppComponent } from './app.component';
import { TokenListComponent } from './token-list/token-list.component';
import { LoginComponent } from './login/login.component';
import { EnrollOATHDialogComponent } from './enroll/enroll-oath-dialog/enroll-oath-dialog.component';
import { EnrollPushDialogComponent } from './enroll/enroll-push-dialog/enroll-push-dialog.component';
import { TokenCardComponent } from './token-card/token-card.component';
import { EnrollmentGridComponent } from './enrollment-grid/enrollment-grid.component';
import { AppInitService } from './app-init.service';
import { TestOATHDialogComponent } from './test/test-oath/test-oath-dialog.component';
import { TestChallengeResponseDialogComponent } from './test/test-challenge-response/test-challenge-response-dialog.component';

declare const require;

@NgModule({
  declarations: [
    AppComponent,
    TokenListComponent,
    LoginComponent,
    EnrollOATHDialogComponent,
    EnrollPushDialogComponent,
    TokenCardComponent,
    EnrollmentGridComponent,
    TestOATHDialogComponent,
    TestChallengeResponseDialogComponent,
  ],
  entryComponents: [
    TestChallengeResponseDialogComponent,
    EnrollOATHDialogComponent,
    EnrollPushDialogComponent,
    TestOATHDialogComponent,
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
    APIModule,
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
