import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '@app/auth/auth-guard.service';
import { mapToCanActivate, runGuardsSerially } from '@app/auth/run-guards-serially';
import { EnrollComponent } from '@app/enroll/enroll/enroll.component';
import { HistoryComponent } from '@app/history/history.component';
import { LoginComponent } from '@app/login/login.component';
import { TokenListComponent } from '@app/token-list/token-list.component';
import { Permission } from '@common/permissions';
import { UnauthenticatedGuard } from './auth/unauthenticated-guard.service';


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
    canActivate: [runGuardsSerially(mapToCanActivate([AuthGuard, NgxPermissionsGuard]))],
    data: {
      permissions: {
        only: Permission.HISTORY,
        redirectTo: '/tokens',
      }
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    runGuardsAndResolvers: 'always',
    canActivate: [UnauthenticatedGuard],
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
