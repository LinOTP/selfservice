import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CookieModule } from 'ngx-cookie';
import { NgxPermissionsModule } from 'ngx-permissions';
import { CustomFormsModule } from 'ng2-validation';
import { NgxQRCodeModule } from 'ngx-qrcode2';

import { NgSelfServiceCommonModule } from './common/common.module';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material.module';
import { AuthModule } from './auth/auth.module';
import { APIModule } from './api/api.module';

import { AppComponent } from './app.component';
import { TokenListComponent } from './token-list/token-list.component';
import { LoginComponent } from './login/login.component';
import { ActivatePushDialogComponent } from './activate/activate-push/activate-push-dialog.component';
import { EnrollTotpComponent } from './enroll/enroll-totp/enroll-totp.component';
import { EnrollHotpDialogComponent } from './enroll/enroll-hotp-dialog/enroll-hotp-dialog.component';
import { EnrollPushDialogComponent } from './enroll/enroll-push-dialog/enroll-push-dialog.component';
import { TokenCardComponent } from './token-card/token-card.component';
import { EnrollmentGridComponent } from './enrollment-grid/enrollment-grid.component';
import { AppInitService } from './app-init.service';
import { ActivateQrDialogComponent } from './activate/activate-qr/activate-qr-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    TokenListComponent,
    LoginComponent,
    ActivateQrDialogComponent,
    ActivatePushDialogComponent,
    EnrollHotpDialogComponent,
    EnrollTotpComponent,
    EnrollPushDialogComponent,
    TokenCardComponent,
    EnrollmentGridComponent,
  ],
  entryComponents: [
    ActivateQrDialogComponent,
    ActivatePushDialogComponent,
    EnrollHotpDialogComponent,
    EnrollPushDialogComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CookieModule.forRoot(),
    CustomFormsModule,
    NgxQRCodeModule,
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
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
