import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TokenListComponent } from './token-list/token-list.component';
import { TokenComponent } from './token/token.component';
import { LoginComponent } from './login/login.component';
import { TokenDetailResolver, TokenListResolver } from './token.service';
import { TokenActivateComponent } from './token-activate/token-activate.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/tokens',
    pathMatch: 'full'
  },
  {
    path: 'tokens',
    component: TokenListComponent,
    resolve: {
      tokens: TokenListResolver
    }
  },
  {
    path: 'tokens/:id',
    component: TokenComponent,
    resolve: {
      token: TokenDetailResolver,
    }
  },
  {
    path: 'tokens/:id/activate',
    component: TokenActivateComponent,
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
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
