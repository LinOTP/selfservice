import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TokenListComponent } from './token-list/token-list.component';
import { TokenComponent } from './token/token.component';

const routes: Routes = [
  { path: '', component: TokenListComponent },
  { path: 'tokens/:id', component: TokenComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
