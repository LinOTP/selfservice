import { Component, OnInit, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Subject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { Permission, ModifyTokenPermissions, ModifyUnreadyTokenPermissions } from '../common/permissions';
import { Token, EnrollmentStatus, TokenType } from '../api/token';
import { NotificationService } from '../common/notification.service';
import { OperationsService } from '../api/operations.service';

import { DialogComponent } from '../common/dialog/dialog.component';
import { SetPinDialogComponent } from '../common/set-pin-dialog/set-pin-dialog.component';
import { SetMOTPPinDialogComponent } from '../common/set-motp-pin-dialog/set-motp-pin-dialog.component';
import { ResyncDialogComponent } from '../common/resync-dialog/resync-dialog.component';
import { TestDialogComponent } from '../test/test-dialog.component';
import { ActivateDialogComponent } from '../activate/activate-dialog.component';
import { SetDescriptionDialogComponent } from '../common/set-description-dialog/set-description-dialog.component';

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
  public ModifyUnreadyTokenPermissions = ModifyUnreadyTokenPermissions;
  public isSynchronizeable: boolean;
  public isMOTP: boolean;

  constructor(
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private operationsService: OperationsService,
  ) { }

  public ngOnInit() {
    const synchronizeableTokenTypes = [TokenType.HOTP, TokenType.TOTP];
    if (synchronizeableTokenTypes.find(t => t === this.token.typeDetails.type)) {
      this.isSynchronizeable = true;
    }
    if (this.token.typeDetails.type === TokenType.MOTP) {
      this.isMOTP = true;
    }
  }

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
        this.notificationService.message($localize`PIN set`);
      });
  }

  public setMOTPPin(): void {
    const config = {
      width: '25em',
      data: this.token
    };

    this.dialog
      .open(SetMOTPPinDialogComponent, config)
      .afterClosed()
      .pipe(
        filter(result => !!result)
      )
      .subscribe(() => {
        this.notificationService.message($localize`mOTP PIN set`);
      });
  }

  public delete(): void {
    const config = {
      width: '25em',
      data:
      {
        title: $localize`Delete token?`,
        text: $localize`You won\'t be able to use it to authenticate yourself anymore.`,
        confirmationLabel: $localize`delete`
      }
    };

    this.dialog
      .open(DialogComponent, config)
      .afterClosed()
      .pipe(
        filter((confirmed: boolean) => !!confirmed),
        switchMap(() => this.operationsService.deleteToken(this.token.serial)),
      )
      .subscribe(response => {
        if (response) {
          this.notificationService.message($localize`Token deleted`);
          this.tokenUpdate.next();
        }
      });
  }

  public enable(): void {
    this.operationsService.enable(this.token).subscribe(isSuccessful => {
      if (isSuccessful) {
        this.notificationService.message($localize`Token enabled`);
        this.tokenUpdate.next();
      } else {
        this.notificationService.message($localize`Error: Could not enable token`);
      }
    });
  }

  public disable(): void {
    this.operationsService.disable(this.token).subscribe(isSuccessful => {
      if (isSuccessful) {
        this.notificationService.message($localize`Token disabled`);
        this.tokenUpdate.next();
      } else {
        this.notificationService.message($localize`Error: Could not disable token`);
      }
    });
  }

  public testToken(): void {
    const dialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { token: this.token }
    };

    this.dialog.open(TestDialogComponent, dialogConfig)
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
      data: { token: this.token, activate: true }
    };

    this.dialog.open(ActivateDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe(() => {
        this.notificationService.message($localize`Token activated`);
        this.tokenUpdate.next();
      });
  }

  public unassign(): void {
    const config = {
      width: '35em',
      data:
      {
        title: $localize`Unassign token?`,
        text: $localize`You won\'t be able to use this token to authenticate yourself anymore.`,
        confirmationLabel: $localize`unassign`
      }
    };

    this.dialog
      .open(DialogComponent, config)
      .afterClosed()
      .pipe(
        filter((confirmed: boolean) => !!confirmed),
        switchMap(() => this.operationsService.unassignToken(this.token.serial)),
      )
      .subscribe(success => {
        if (success) {
          this.notificationService.message($localize`Token unassigned`);
        } else {
          this.notificationService.message($localize`Error: could not unassign token`);
        }
        this.tokenUpdate.next();
      });
  }

  public pendingActions(): boolean {
    return this.pendingDelete() || this.pendingActivate();
  }

  public pendingDelete(): boolean {
    let deletePending = false;
    if (this.token.enrollmentStatus === EnrollmentStatus.UNPAIRED) {
      deletePending = this.token.typeDetails.type === TokenType.PUSH || this.token.typeDetails.type === TokenType.QR;
    }
    return deletePending;
  }

  public pendingActivate(): boolean {
    let activatePending = false;
    if (this.token.enrollmentStatus === EnrollmentStatus.PAIRING_RESPONSE_RECEIVED) {
      activatePending = this.token.typeDetails.type === TokenType.PUSH || this.token.typeDetails.type === TokenType.QR;
    }
    return activatePending;
  }

  public isPush(): boolean {
    return this.token.typeDetails.type === TokenType.PUSH;
  }

  public resetFailcounter() {
    this.operationsService.resetFailcounter(this.token.serial).subscribe(success => {
      let message: String;
      if (success) {
        message = $localize`Failcounter successfully reset`;
      } else {
        message = $localize`Error: could not reset failcounter. Please try again or contact your administrator.`;
      }
      this.notificationService.message(message);
    });
  }

  public resync(): void {
    const config = {
      width: '25em',
      data: this.token
    };

    this.dialog
      .open(ResyncDialogComponent, config)
      .afterClosed()
      .pipe(
        filter(result => !!result)
      )
      .subscribe(() => {
        this.notificationService.message($localize`Token synchronized`);
      });
  }

  public setDescription(): void {
    const config = {
      width: '25em',
      data: this.token
    };

    this.dialog
      .open(SetDescriptionDialogComponent, config)
      .afterClosed()
      .pipe(
        filter(result => !!result)
      )
      .subscribe(() => {
        this.notificationService.message($localize`Description changed`);
        this.tokenUpdate.next();
      });
  }

}
