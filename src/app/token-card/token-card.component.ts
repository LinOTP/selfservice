import { Component, OnInit, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Subject, from, of } from 'rxjs';
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
import { NgxPermissionsService } from 'ngx-permissions';

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
  public canEnable: boolean;

  constructor(
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private operationsService: OperationsService,
    private permissionsService: NgxPermissionsService,
  ) { }

  public ngOnInit() {
    const synchronizeableTokenTypes = [TokenType.HOTP, TokenType.TOTP];
    if (synchronizeableTokenTypes.find(t => t === this.token.typeDetails.type)) {
      this.isSynchronizeable = true;
    }
    if (this.token.typeDetails.type === TokenType.MOTP) {
      this.isMOTP = true;
    }
    this.permissionsService.hasPermission(Permission.ENABLE).then(
      canEnable => this.canEnable = canEnable
    );
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
        filter(result => !!result),
      )
      .subscribe(() => {
        this.notificationService.message($localize`Token deleted`);
        this.tokenUpdate.next();
      });
  }

  public enable(): void {
    this.operationsService.enable(this.token)
      .pipe(
        filter(result => !!result)
      )
      .subscribe(isSuccessful => {
        this.notificationService.message($localize`Token enabled`);
        this.tokenUpdate.next();
      });
  }

  public disable(): void {
    from(this.permissionsService.hasPermission(Permission.ENABLE)).pipe(
      switchMap(canEnable => {
        if (canEnable) {
          return of(true);
        } else {
          const config = {
            width: '25em',
            data:
            {
              title: $localize`Disable token?`,
              text: $localize`You will not be able to use it to authenticate yourself anymore, as you cannot enable it on your own.`,
              confirmationLabel: $localize`disable`
            }
          }; return this.dialog.open(DialogComponent, config).afterClosed();
        }
      }),
      filter(canDisable => !!canDisable),
      switchMap(() => this.operationsService.disable(this.token)),
      filter(result => !!result)
    ).subscribe(() => {
      this.notificationService.message($localize`Token disabled`);
      this.tokenUpdate.next();
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
        filter(result => !!result)
      )
      .subscribe(() => {
        this.notificationService.message($localize`Token unassigned`);
        this.tokenUpdate.next();
      });
  }

  public pendingActions(): boolean {
    return this.pendingActivate();
  }

  public pendingActivate(): boolean {
    return this.token.enrollmentStatus === EnrollmentStatus.PAIRING_RESPONSE_RECEIVED;
  }

  public isPush(): boolean {
    return this.token.typeDetails.type === TokenType.PUSH;
  }

  public resetFailcounter() {
    this.operationsService.resetFailcounter(this.token.serial)
      .pipe(
        filter(result => !!result)
      )
      .subscribe(() => {
        this.notificationService.message($localize`Failcounter reset`);
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
