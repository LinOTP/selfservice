import { Component, Input, AfterViewInit } from '@angular/core';
import { TokenService } from '../../token.service';
import { ActivatedRoute } from '@angular/router';
import { Token } from '../../token';

@Component({
  selector: 'app-token-activate-push',
  templateUrl: './token-activate-push.component.html',
  styleUrls: ['./token-activate-push.component.scss']
})
export class TokenActivatePushComponent implements AfterViewInit {
  @Input() private token: Token;

  constructor(
    private tokenService: TokenService,
    private route: ActivatedRoute
  ) { }

  ngAfterViewInit() {
    /* this.route.data.subscribe((data: { token: Token }) => {
      this.token = data.token;
    }); */
    console.log("I'm here");
    //this.activate();
  }

  activate() {
    this.tokenService.activate(this.token.serial, '1234').subscribe(response => {
      if (response.detail) {
        this.tokenService.challengePoll(response.detail.transactionid, '1234')
          .subscribe(res => console.log(res));
      }
    });
  }

}
