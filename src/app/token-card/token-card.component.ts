import { Component, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { map, Observable, of, Subject, Subscription } from 'rxjs';
import { filter, startWith } from 'rxjs/operators';

import { OperationsService } from '@api/operations.service';
import { EnrollmentStatus, SelfserviceToken, TokenType } from '@api/token';
import { ActivateDialogComponent } from '@app/activate/activate-dialog.component';
import { LockableTokenActionsService } from '@app/common/lockable-token-dialogs.service';
import { LoginService } from '@app/login/login.service';
import { TestDialogComponent } from '@app/test/test-dialog.component';
import { NotificationService } from '@common/notification.service';
import { ModifyTokenPermissions, ModifyUnreadyTokenPermissions, Permission } from '@common/permissions';
import { ResyncDialogComponent } from '@common/resync-dialog/resync-dialog.component';
import { SetDescriptionDialogComponent } from '@common/set-description-dialog/set-description-dialog.component';
import { SetMOTPPinDialogComponent } from '@common/set-motp-pin-dialog/set-motp-pin-dialog.component';
import { SetPinDialogComponent } from '@common/set-pin-dialog/set-pin-dialog.component';
import { TokenVerifyCheckService } from '../token-list/token-verify-check.service';
import { MatMenuItem } from "@angular/material/menu";

@Component({
  selector: 'app-token-card',
  templateUrl: './token-card.component.html',
  styleUrls: ['./token-card.component.scss'],
  providers: [LockableTokenActionsService]
})
export class TokenCardComponent implements OnInit, OnDestroy {

  @Input() public token: SelfserviceToken;
  @Output() public tokenUpdate: Subject<void> = new Subject();

  public EnrollmentStatus = EnrollmentStatus;
  public TokenType = TokenType;
  public Permission = Permission;
  public ModifyTokenPermissions = ModifyTokenPermissions;
  public ModifyUnreadyTokenPermissions = ModifyUnreadyTokenPermissions;
  public isSynchronizeable: boolean;
  public isMOTP: boolean;
  public canEnable: boolean;
  public canActivate: boolean;
  public menuHasItems: Observable<boolean> = of(false);
  private subscriptions: Subscription[] = [];

  @ViewChildren(MatMenuItem) set menuItems(menuItems: QueryList<MatMenuItem>) {
    if (!menuItems) return;
    setTimeout(() => {
      this.menuHasItems = menuItems.changes.pipe(
          startWith(menuItems),
          map((items: QueryList<MatMenuItem>) => items.length > 0)
      )
    })
  }


  constructor(
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private operationsService: OperationsService,
    private loginService: LoginService,
    private lockableTokenActionsService: LockableTokenActionsService,
    private tokenVerifyCheck: TokenVerifyCheckService
  ) { }

  public ngOnInit() {
    const synchronizeableTokenTypes = [TokenType.HOTP, TokenType.TOTP];
    if (synchronizeableTokenTypes.find(t => t === this.token.typeDetails.type)) {
      this.isSynchronizeable = true;
    }
    if (this.token.typeDetails.type === TokenType.MOTP) {
      this.isMOTP = true;
    }

    this.subscriptions.push(
      this.loginService
        .hasPermission$(Permission.ENABLE)
        .subscribe(canEnable => this.canEnable = canEnable)
    );

    if (this.token.typeDetails.activationPermission) {
      this.subscriptions.push(
        this.loginService
          .hasPermission$(this.token.typeDetails.activationPermission)
          .subscribe(canActivate => this.canActivate = canActivate)
      );
    }
  }

  public ngOnDestroy() {
    while (this.subscriptions.length) {
      this.subscriptions.pop().unsubscribe();
    }
  }

  public setPin(): void {
    const config = {
      width: '35em',
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
      width: '35em',
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
    const dialog$ = this.lockableTokenActionsService.getDeleteConfirmation(this.token);

    dialog$.pipe(
      filter(result => !!result),
    ).subscribe(() => {
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
    const confirmationObservable = this.lockableTokenActionsService.getDisableConfirmation(this.token, this.canEnable);

    confirmationObservable.pipe(
      filter(success => !!success)
    ).subscribe(() => {
      this.notificationService.message($localize`Token disabled`);
      this.tokenUpdate.next();
    });
  }

  private _openTestDialog() {
    const dialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { serial: this.token.serial, type: this.token.typeDetails.type, token: this.token }
    };

    return this.dialog.open(TestDialogComponent, dialogConfig)
  }

  public testToken(): void {
    this._openTestDialog();
  }

  public verifyToken(): void {
    // we use test dialog for verification for now
    this._openTestDialog().afterClosed().subscribe(() => {
      this.tokenUpdate.next();
    });
  }

  public activate(): void {
    const dialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { serial: this.token.serial, type: this.token.typeDetails.type, token: this.token }
    };

    this.dialog.open(ActivateDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe();
  }

  public unassign(): void {
    const dialog$ = this.lockableTokenActionsService.getUnassignConfirmation(this.token);

    dialog$
      .pipe(
        filter(result => !!result)
      )
      .subscribe(() => {
        this.notificationService.message($localize`Token unassigned`);
        this.tokenUpdate.next();
      });
  }

  public pendingActions(): boolean {
    return this.pendingActivate() || this.verifyRequired();
  }

  public pendingActivate(): boolean {
    return this.canActivate && this.token.enrollmentStatus === EnrollmentStatus.PAIRING_RESPONSE_RECEIVED;
  }

  public verifyRequired(): boolean {
    return this.tokenVerifyCheck.isVerificationRequiredForToken(this.token);
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
      width: '35em',
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
      width: '35em',
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

