import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { NgSelfServiceCommonModule } from '@common/common.module';
import { AuthGuard } from './auth-guard.service';
import { AuthInterceptor } from './auth-interceptor.service';
import { SessionService } from './session.service';
import { UnauthenticatedGuard } from './unauthenticated-guard.service';

@NgModule({
  imports: [
    NgSelfServiceCommonModule,
    HttpClientModule,
  ],
  declarations: [
  ],
  providers: [
    SessionService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    UnauthenticatedGuard
  ],
})
export class AuthModule { }
