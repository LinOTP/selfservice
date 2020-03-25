import { NgModule } from '@angular/core';
import { NgSelfServiceCommonModule } from '../common/common.module';
import { SessionService } from './session.service';
import { AuthGuard } from './auth-guard.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth-interceptor.service';

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
  ],
})
export class AuthModule { }
