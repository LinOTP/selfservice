import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CookieModule } from 'ngx-cookie';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';
import { TokenListComponent } from './token-list/token-list.component';
import { TokenComponent } from './token/token.component';
import { LoginComponent } from './login/login.component';


@NgModule({
  declarations: [
    AppComponent,
    TokenListComponent,
    TokenComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CookieModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    TokenService,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
