import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TokenListComponent } from './token-list/token-list.component';
import { TokenComponent } from './token/token.component';
import { LoginComponent } from './login/login.component';
import { TokenDetailResolver, TokenListResolver } from './token.service';
import { TokenActivateComponent } from './token-activate/token-activate.component';
import { AuthGuard } from './auth-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/tokens',
    pathMatch: 'full'
  },
  {
    path: 'tokens',
    component: TokenListComponent,
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
    resolve: {
      tokens: TokenListResolver
    },
    children: [
      {
        path: ':id',
        component: TokenComponent,
        runGuardsAndResolvers: 'always',
        canActivate: [AuthGuard],
        resolve: {
          token: TokenDetailResolver,
        }
      },
      {
        path: ':id/activate',
        component: TokenActivateComponent,
        canActivate: [AuthGuard],
        runGuardsAndResolvers: 'always',
        resolve: {
          token: TokenDetailResolver,
        }
      },
    ]
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
    }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
