import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TokenListComponent } from './token-list/token-list.component';
import { LoginComponent } from './login/login.component';
import { TokenDetailResolver } from './token.service';
import { TokenActivateComponent } from './token-activate/token-activate.component';
import { AuthGuard } from './auth/auth-guard.service';
import { EnrollComponent } from './enroll/enroll.component';
import { EnrollTotpComponent } from './enroll/enroll-totp/enroll-totp.component';
import { EnrollPushComponent } from './enroll/enroll-push/enroll-push.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/tokens',
    pathMatch: 'full'
  },
  {
    path: 'enroll',
    component: EnrollComponent,
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'totp',
        component: EnrollTotpComponent,
      },
      {
        path: 'push',
        component: EnrollPushComponent,
      },
    ]
  },
  {
    path: 'tokens',
    component: TokenListComponent,
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
  },
  {
    path: 'tokens/:serial/activate',
    component: TokenActivateComponent,
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
    resolve: {
      token: TokenDetailResolver,
    }
  },
  {
    path: 'login',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    {
      onSameUrlNavigation: 'reload',
      // enableTracing: true,
    }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
