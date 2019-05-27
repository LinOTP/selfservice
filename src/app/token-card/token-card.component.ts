import { Component, OnInit, Input, Output } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material';

import { Subject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { DialogComponent } from '../common/dialog/dialog.component';
import { SetPinDialogComponent } from '../common/set-pin-dialog/set-pin-dialog.component';
import { NotificationService } from '../common/notification.service';
import { Permission, ModifyTokenPermissions } from '../common/permissions';

import { Token, EnrollmentStatus, TokenType } from '../api/token';
import { TokenService } from '../api/token.service';

import { ActivatePushDialogComponent } from '../activate/activate-push/activate-push-dialog.component';
import { ActivateQrDialogComponent } from '../activate/activate-qr/activate-qr-dialog.component';
import { TestOTPDialogComponent } from '../test/test-otp/test-otp-dialog.component';

@Component({
  selector: 'app-token-card',
  templateUrl: './token-card.component.html',
  styleUrls: ['./token-card.component.scss']
})
export class TokenCardComponent implements OnInit {

  @Input() public token: Token;
  @Output() public tokenUpdate: Subject<null> = new Subject();

  public EnrollmentStatus = EnrollmentStatus;
  public TokenType = TokenType;
  public Permission = Permission;
  public ModifyTokenPermissions = ModifyTokenPermissions;

  constructor(
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private tokenService: TokenService,
  ) { }

  public ngOnInit() { }

  public setPin(): void {
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

  public delete(): void {
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

  public enable(): void {
    this.tokenService.enable(this.token).subscribe(isSuccessful => {
      if (isSuccessful) {
        this.notificationService.message('Token enabled');
        this.tokenUpdate.next();
      } else {
        this.notificationService.message('Error: Could not enable token');
      }
    });
  }

  public disable(): void {
    this.tokenService.disable(this.token).subscribe(isSuccessful => {
      if (isSuccessful) {
        this.notificationService.message('Token disabled');
        this.tokenUpdate.next();
      } else {
        this.notificationService.message('Error: Could not disable token');
      }
    });
  }

  public testToken(): void {
    let testDialog;
    const dialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: this.token
    };

    switch (this.token.type) {
      case TokenType.HOTP:
      case TokenType.TOTP:
        testDialog = TestOTPDialogComponent;
        break;
      default:
        this.notificationService.message('This token type cannot be tested yet.');
        return;
    }
    this.dialog.open(testDialog, dialogConfig)
      .afterClosed()
      .subscribe(() => {
        this.tokenUpdate.next();
      });
  }

  public activate(): void {
    const dialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: this.token.serial
    };

    this.dialog.open(this.chooseActivationDialog(), dialogConfig)
      .afterClosed()
      .subscribe(() => {
        this.notificationService.message('Token activated');
        this.tokenUpdate.next();
      });
  }

  public pendingActions(): boolean {
    return this.pendingDelete() || this.pendingActivate();
  }

  public pendingDelete(): boolean {
    let deletePending = false;
    if (this.token.enrollmentStatus === EnrollmentStatus.UNPAIRED) {
      deletePending = this.token.type === TokenType.PUSH || this.token.type === TokenType.QR;
    }
    return deletePending;
  }

  public pendingActivate(): boolean {
    let activatePending = false;
    if (this.token.enrollmentStatus === EnrollmentStatus.PAIRING_RESPONSE_RECEIVED) {
      activatePending = this.token.type === TokenType.PUSH || this.token.type === TokenType.QR;
    }
    return activatePending;
  }

  public isPush(): boolean {
    return this.token.type === TokenType.PUSH;
  }

  private chooseActivationDialog(): ComponentType<any> {
    if (this.token.type === TokenType.PUSH) {
      return ActivatePushDialogComponent;
    }
    if (this.token.type === TokenType.QR) {
      return ActivateQrDialogComponent;
    }
  }
}
