import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TokenListComponent } from './token-list/token-list.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth/auth-guard.service';
import { EnrollComponent } from './enroll/enroll.component';

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
    canActivate: [AuthGuard]
  },
  {
    path: 'tokens',
    component: TokenListComponent,
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
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
