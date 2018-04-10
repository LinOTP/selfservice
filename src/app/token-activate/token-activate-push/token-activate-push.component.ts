import { Component, Input, AfterViewInit, OnInit, Inject } from '@angular/core';
import { TokenService } from '../../token.service';
import { ActivatedRoute } from '@angular/router';
import { Token } from '../../token';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-token-activate-push',
  templateUrl: './token-activate-push.component.html',
  styleUrls: ['./token-activate-push.component.scss']
})
export class TokenActivatePushComponent implements /* AfterViewInit, */ OnInit {
  @Input() public token: Token;

  public activationForm: FormGroup;

  constructor(
    private tokenService: TokenService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    @Inject(Token) tokenInjected: Token,
  ) {
    this.token = this.token || tokenInjected
  }

  ngOnInit() {
    console.log('ngOnInit');
    console.log(this.token);

    this.activationForm = this.formBuilder.group({
      pin: ['']
    })
  }

  /*  ngAfterViewInit() {
     console.log('ngAfterViewInit');
     console.log(this.token);
     this.route.data.subscribe((data: { token: Token }) => {
       this.token = data.token;
     });
  // this.activate();
} */

  activate() {
    console.log('activate()');
    console.log(this.token);
    this.tokenService.activate(this.token.serial, '1234').subscribe(response => {
      if (response.detail) {
        this.tokenService.challengePoll(response.detail.transactionid, '1234')
          .subscribe(res => console.log(res));
      }
    });
  }

}
