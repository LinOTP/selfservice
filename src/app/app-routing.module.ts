import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TokenListComponent } from '@app/token-list/token-list.component';
import { LoginComponent } from '@app/login/login.component';
import { AuthGuard } from '@app/auth/auth-guard.service';
import { HistoryComponent } from '@app/history/history.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { Permission } from '@common/permissions';
import { EnrollComponent } from '@app/enroll/enroll/enroll.component';

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
    children: [
      {
        path: `enroll/:type`,
        component: EnrollComponent,
      }
    ]
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
