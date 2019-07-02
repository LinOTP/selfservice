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
import { EnrollOATHDialogComponent } from './enroll/enroll-oath-dialog/enroll-oath-dialog.component';
import { EnrollPushDialogComponent } from './enroll/enroll-push-dialog/enroll-push-dialog.component';
import { TokenCardComponent } from './token-card/token-card.component';
import { EnrollmentGridComponent } from './enrollment-grid/enrollment-grid.component';
import { AppInitService } from './app-init.service';
import { TestOATHDialogComponent } from './test/test-oath/test-oath-dialog.component';
import { TestChallengeResponseDialogComponent } from './test/test-challenge-response/test-challenge-response-dialog.component';


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
