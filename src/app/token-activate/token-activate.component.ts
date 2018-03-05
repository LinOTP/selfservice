import { Component, OnInit, AfterViewInit, ViewChild, ComponentFactoryResolver, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TokenActivateTypeDirective } from './token-activate-type.directive';
import { TokenActivatePushComponent } from './token-activate-push/token-activate-push.component';
import { Token } from '../token';

@Component({
  selector: 'app-token-activate',
  templateUrl: './token-activate.component.html',
  styleUrls: ['./token-activate.component.scss']
})
export class TokenActivateComponent implements OnInit, AfterViewInit {
  token: any;
  @ViewChild(TokenActivateTypeDirective) tokenActivateType: TokenActivateTypeDirective;

  private tokenTypes: { [type: string]: Type<any> } = {
    'push': TokenActivatePushComponent
  };


  constructor(private route: ActivatedRoute, private componentFactoryResolver: ComponentFactoryResolver) { }

  loadDynamicComponent(token: Token) {
    const component = this.tokenTypes[token.type];
    if (component) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
      this.tokenActivateType.viewContainerRef.clear();
      this.tokenActivateType.viewContainerRef.createComponent(componentFactory);
      this.token = token;
    } else {
      alert('token has no activation phase');
    }
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.route.data
      .subscribe((data: { token: Token }) => {
        this.loadDynamicComponent(data.token);
      });
  }

}
