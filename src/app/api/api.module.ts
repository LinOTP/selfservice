import { NgModule } from '@angular/core';
import { TokenService, TokenDetailResolver, TokenListResolver } from './token.service';


@NgModule({
  imports: [
  ],
  declarations: [
  ],
  entryComponents: [
  ],
  providers: [
    TokenService,
    TokenDetailResolver,
    TokenListResolver,
  ],
  exports: [
  ]
})
export class APIModule { }
