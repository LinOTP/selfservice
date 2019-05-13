import { Component, OnInit, Input, Output } from '@angular/core';
import { Token, EnrollmentStatus } from '../token';
import { MatDialog } from '@angular/material';
import { SetPinDialogComponent } from '../set-pin-dialog/set-pin-dialog.component';
import { NotificationService } from '../common/notification.service';
import { TokenService } from '../token.service';
import { filter, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Permission, ModifyTokenPermissions } from '../permissions';
import { DialogComponent } from '../common/dialog/dialog.component';

@Component({
  selector: 'app-token-card',
  templateUrl: './token-card.component.html',
  styleUrls: ['./token-card.component.scss']
})
export class TokenCardComponent implements OnInit {

  @Input() public token: Token;
  @Output() public tokenUpdate: Subject<null> = new Subject();

  public EnrollmentStatus = EnrollmentStatus;
  public Permission = Permission;
  public ModifyTokenPermissions = ModifyTokenPermissions;

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

  enable(): void {
    this.tokenService.enable(this.token).subscribe(isSuccessful => {
      if (isSuccessful) {
        this.notificationService.message('Token enabled');
        this.tokenUpdate.next();
      } else {
        this.notificationService.message('Error: Could not enable token');
      }
    });
  }

  disable(): void {
    this.tokenService.disable(this.token).subscribe(isSuccessful => {
      if (isSuccessful) {
        this.notificationService.message('Token disabled');
        this.tokenUpdate.next();
      } else {
        this.notificationService.message('Error: Could not disable token');
      }
    });
  }
}
