import { Component, OnInit, Input, Output } from '@angular/core';
import { Token, EnrollmentStatus } from '../token';
import { MatDialog } from '@angular/material';
import { SetPinDialogComponent } from '../set-pin-dialog/set-pin-dialog.component';
import { NotificationService } from '../core/notification.service';
import { DialogComponent } from '../dialog/dialog.component';
import { TokenService } from '../token.service';
import { filter, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-token-card',
  templateUrl: './token-card.component.html',
  styleUrls: ['./token-card.component.scss']
})
export class TokenCardComponent implements OnInit {

  @Input() public token: Token;
  @Output() public tokenUpdate: Subject<null> = new Subject();

  public EnrollmentStatus = EnrollmentStatus;

  constructor(
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private tokenService: TokenService,
  ) { }

  ngOnInit() { }

  setPin() {
    const config = {
      width: '25em',
      data: this.token
    };

    this.dialog
      .open(SetPinDialogComponent, config)
      .afterClosed()
      .pipe(
        filter(result => !!result)
      )
      .subscribe(() => {
        this.notificationService.message('PIN set');
      });
  }

  delete() {
    const config = {
      width: '25em',
      data:
      {
        title: 'Delete token?',
        text: 'You won\'t be able to use it to authenticate yourself anymore.',
        confirmationLabel: 'delete'
      }
    };

    this.dialog
      .open(DialogComponent, config)
      .afterClosed()
      .pipe(
        filter((confirmed: boolean) => !!confirmed),
        switchMap(() => this.tokenService.deleteToken(this.token.serial)),
      )
      .subscribe(() => {
        this.notificationService.message('Token deleted');
        this.tokenUpdate.next();
      });
  }

  tokenName(type: string) {
    type = type.toLowerCase();
    const tokenType = this.tokenService.tokenTypes.find(tt => tt.type === type);
    return tokenType ? tokenType.name : 'Unknown token';
  }

}
