import { Component, OnInit, Type, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TokenActivatePushComponent } from './token-activate-push/token-activate-push.component';
import { Token, EnrollmentStatus } from '../token';
import { NotificationService } from '../common/notification.service';

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
    private router: Router,
    private injector: Injector,
    private notificationService: NotificationService
  ) { }

  loadDynamicComponent(token: Token) {
    const component = this.tokenTypes[token.type];
    if (component) {
      this.token = token;
      this.tokenInjector = Injector.create({ providers: [{ provide: Token, useValue: token }], parent: this.injector });
      this.typeSpecificComponent = TokenActivatePushComponent;

    } else {
      this.notificationService.message('The selected token has no activation phase');
      this.router.navigate(['/tokens']);
      return;
    }

    if (token.enrollmentStatus !== EnrollmentStatus.pairing_response_received) {
      this.notificationService.message('The token is not in activation phase.');
      this.router.navigate(['/tokens']);
      return;
    }
  }

  ngOnInit() {
    this.route.data
      .subscribe((data: { token: Token }) => {
        this.loadDynamicComponent(data.token);
      });
  }
}
