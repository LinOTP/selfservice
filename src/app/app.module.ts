import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CookieModule } from 'ngx-cookie';

import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material.module';

import { AppComponent } from './app.component';
import { TokenService, TokenListResolver, TokenDetailResolver } from './token.service';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth-guard.service';
import { TokenListComponent } from './token-list/token-list.component';
import { TokenComponent } from './token/token.component';
import { LoginComponent } from './login/login.component';
import { TokenActivateComponent } from './token-activate/token-activate.component';
import { TokenActivateTypeDirective } from './token-activate/token-activate-type.directive';
import { TokenActivatePushComponent } from './token-activate/token-activate-push/token-activate-push.component';
import { DialogComponent } from './dialog/dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    TokenListComponent,
    TokenComponent,
    LoginComponent,
    TokenActivateComponent,
    TokenActivateTypeDirective,
    TokenActivatePushComponent,
    DialogComponent
  ],
  entryComponents: [
    TokenActivatePushComponent,
    DialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CookieModule.forRoot(),
    AppRoutingModule,
    MaterialModule
  ],
  providers: [
    TokenService,
    AuthService,
    AuthGuard,
    TokenDetailResolver,
    TokenListResolver,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
