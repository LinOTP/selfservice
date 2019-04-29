import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CookieModule } from 'ngx-cookie';
import { CustomFormsModule } from 'ng2-validation';
import { NgxQRCodeModule } from 'ngx-qrcode2';

import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material.module';
import { AuthModule } from './auth/auth.module';

import { AppComponent } from './app.component';
import { TokenService, TokenListResolver, TokenDetailResolver } from './token.service';
import { TokenListComponent } from './token-list/token-list.component';
import { LoginComponent } from './login/login.component';
import { TokenActivateComponent } from './token-activate/token-activate.component';
import { TokenActivateTypeDirective } from './token-activate/token-activate-type.directive';
import { TokenActivatePushComponent } from './token-activate/token-activate-push/token-activate-push.component';
import { DialogComponent } from './dialog/dialog.component';
import { SetPinDialogComponent } from './set-pin-dialog/set-pin-dialog.component';
import { EnrollComponent } from './enroll/enroll.component';
import { EnrollTotpComponent } from './enroll/enroll-totp/enroll-totp.component';
import { EnrollHotpDialogComponent } from './enroll/enroll-hotp-dialog/enroll-hotp-dialog.component';
import { EnrollPushComponent } from './enroll/enroll-push/enroll-push.component';
import { NonActiveTokensPipe } from './non-active-tokens.pipe';
import { ActiveTokensPipe } from './active-tokens.pipe';
import { ArrayNotEmptyPipe } from './array-not-empty.pipe';
import { SortTokensByStatePipe } from './sort-tokens-by-state.pipe';
import { TokenCardComponent } from './token-card/token-card.component';
import { EnrollmentGridComponent } from './enrollment-grid/enrollment-grid.component';


@NgModule({
  declarations: [
    AppComponent,
    TokenListComponent,
    LoginComponent,
    TokenActivateComponent,
    TokenActivateTypeDirective,
    TokenActivatePushComponent,
    DialogComponent,
    SetPinDialogComponent,
    EnrollComponent,
    EnrollHotpDialogComponent,
    EnrollTotpComponent,
    EnrollPushComponent,
    NonActiveTokensPipe,
    ActiveTokensPipe,
    ArrayNotEmptyPipe,
    SortTokensByStatePipe,
    TokenCardComponent,
    EnrollmentGridComponent,
  ],
  entryComponents: [
    TokenActivatePushComponent,
    DialogComponent,
    SetPinDialogComponent,
    EnrollHotpDialogComponent
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
    CoreModule,
    AuthModule,
  ],
  providers: [
    TokenService,
    TokenDetailResolver,
    TokenListResolver,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
