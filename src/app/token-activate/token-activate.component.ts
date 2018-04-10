import { Component, OnInit, Type, ReflectiveInjector, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TokenActivatePushComponent } from './token-activate-push/token-activate-push.component';
import { Token } from '../token';

@Component({
  selector: 'app-token-activate',
  templateUrl: './token-activate.component.html',
  styleUrls: ['./token-activate.component.scss']
})
export class TokenActivateComponent implements OnInit {
  token: Token;
  typeSpecificComponent: any;
  tokenInjector: Injector;

  private tokenTypes: { [type: string]: Type<any> } = {
    'push': TokenActivatePushComponent
  };

  constructor(
    private route: ActivatedRoute,
    private injector: Injector,
  ) { }

  loadDynamicComponent(token: Token) {
    const component = this.tokenTypes[token.type];
    if (component) {
      this.token = token;
      this.tokenInjector = ReflectiveInjector.resolveAndCreate([{ provide: Token, useValue: token }], this.injector);
      this.typeSpecificComponent = TokenActivatePushComponent;
    } else {
      alert('token has no activation phase');
    }
  }

  ngOnInit() {
    this.route.data
      .subscribe((data: { token: Token }) => {
        this.loadDynamicComponent(data.token);
      });
  }
}
