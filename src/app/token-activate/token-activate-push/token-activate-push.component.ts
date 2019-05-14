import { Component, Input, AfterViewInit, OnInit, Inject } from '@angular/core';
import { TokenService } from '../../api/token.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Token } from '../../api/token';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NotificationService } from '../../common/notification.service';

@Component({
  selector: 'app-token-activate-push',
  templateUrl: './token-activate-push.component.html',
  styleUrls: ['./token-activate-push.component.scss']
})
export class TokenActivatePushComponent implements /* AfterViewInit, */ OnInit {
  @Input() public token: Token;

  public activationForm: FormGroup;
  public waiting: boolean;

  constructor(
    private tokenService: TokenService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    @Inject(Token) tokenInjected: Token,
  ) {
    this.token = this.token || tokenInjected;
  }

  ngOnInit() {
    this.resetForm();
  }

  activate(): void {
    this.waiting = true;

    const serial = this.token.serial,
      pin = this.activationForm.get('pin').value;

    this.tokenService.activate(serial, pin).subscribe(response => {
      if (response.detail) {
        this.tokenService.challengePoll(response.detail.transactionid, pin, this.token.serial)
          .subscribe(res => {
            this.waiting = false;
            if (res) {
              this.notificationService.message('Token successfully activated');
              this.router.navigate(['/tokens']);
            } else {
              this.notificationService.message('Token activation failed');
              this.resetForm();
            }
          });
        this.notificationService.message('Challenge sent');
      } else {
        this.notificationService.message('Token activation failed');
        this.resetForm();
      }
    });
  }

  private resetForm(): void {
    this.waiting = false;
    this.activationForm = this.formBuilder.group({
      pin: ['']
    });
  }
}
