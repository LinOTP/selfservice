import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TokenListComponent } from './token-list/token-list.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth/auth-guard.service';
import { HistoryComponent } from './history/history.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { Permission } from './common/permissions';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/tokens',
    pathMatch: 'full',
  },
  {
    path: 'tokens',
    component: TokenListComponent,
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
  },
  {
    path: 'history',
    component: HistoryComponent,
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard, NgxPermissionsGuard],
    data: {
      permissions: {
        only: Permission.HISTORY,
        redirectTo: '/tokens',
      }
    }
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '**',
    redirectTo: '/tokens'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    {
      onSameUrlNavigation: 'reload',
    }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
