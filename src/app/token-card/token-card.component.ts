import { Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { map, Observable, of, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { MatMenuItem } from "@angular/material/menu";
import { OperationsService } from '@api/operations.service';
import { EnrollmentStatus, SelfserviceToken, TokenType } from '@api/token';
import { ActivateDialogComponent } from '@app/activate/activate-dialog.component';
import { TokenService } from '@app/api/token.service';
import { BootstrapBreakpointService } from '@app/bootstrap-breakpoints.service';
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

@Component({
  selector: 'app-token-card',
  templateUrl: './token-card.component.html',
  styleUrls: ['./token-card.component.scss'],
  providers: [LockableTokenActionsService],
  standalone: false
})
export class TokenCardComponent implements OnInit, OnDestroy {
 @ViewChild('menuBtn', { read: ElementRef }) menuBtn!: ElementRef<HTMLButtonElement>
  @Input() public token: SelfserviceToken;
  public EnrollmentStatus = EnrollmentStatus;
  public menuLabel: string = $localize`:@@tokenCard.menuLabel:Open token menu`;
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
    private tokenService: TokenService,
    private operationsService: OperationsService,
    private loginService: LoginService,
    private lockableTokenActionsService: LockableTokenActionsService,
    private tokenVerifyCheck: TokenVerifyCheckService,
    private breakpointService: BootstrapBreakpointService
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
      .subscribe((res) => {
        if(res) this.notificationService.message($localize`PIN set`);
        this.menuBtn?.nativeElement.focus()
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
      .subscribe((res) => {
        if(res) this.notificationService.message($localize`mOTP PIN set`);
        this.menuBtn?.nativeElement.focus()
      });
  }

  public delete(): void {
    const dialog$ = this.lockableTokenActionsService.getDeleteConfirmation(this.token);

    dialog$.subscribe((res) => {
      if(res){
        this.notificationService.message($localize`Token deleted`);
        this.tokenService.updateTokenList();
      }
        this.menuBtn?.nativeElement.focus()
    });
  }

  public enable(): void {
    this.operationsService.enable(this.token)
      .subscribe(res => {
        if(res) {
          this.notificationService.message($localize`Token enabled`);
          this.tokenService.updateTokenList(this.token.serial);
        }
        this.menuBtn?.nativeElement.focus()
      });
  }

  public disable(): void {
    const confirmationObservable = this.lockableTokenActionsService.getDisableConfirmation(this.token, this.canEnable);

    confirmationObservable.subscribe((res) => {
      if(res){
        this.notificationService.message($localize`Token disabled`);
        this.tokenService.updateTokenList(this.token.serial);
      }
      this.menuBtn?.nativeElement.focus()
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

  public verifyToken(triggerElement?: HTMLButtonElement): void {
    // we use test dialog for verification for now
    this._openTestDialog().afterClosed().subscribe((res) => {
      if(res) this.tokenService.updateTokenList(this.token.serial);
      triggerElement? triggerElement.focus() : this.menuBtn?.nativeElement.focus()
    });
  }

  public activate(): void {
    let dialogConfig: MatDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { serial: this.token.serial, type: this.token.typeDetails.type, token: this.token }
    };

    const currentBreakpoint = this.breakpointService.currentBreakpoint;
    if (currentBreakpoint < 2) {
      dialogConfig.width = "100%";
      dialogConfig.maxWidth = "100vh";
      dialogConfig.height = "100%";
      dialogConfig.maxHeight = "100vh";
    } else {
      dialogConfig.width = '850px';
      dialogConfig.minWidth = '770px';
      dialogConfig.maxHeight = "100vh";
    }

    this.dialog.open(ActivateDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe();
  }

  public unassign(): void {
    const dialog$ = this.lockableTokenActionsService.getUnassignConfirmation(this.token);
    dialog$
      .subscribe((res) => {
        if(res){
          this.notificationService.message($localize`Token unassigned`);
          this.tokenService.updateTokenList();
        }
        this.menuBtn?.nativeElement.focus()
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
      .subscribe((res) => {
        if(res) this.notificationService.message($localize`Failcounter reset`);
        this.menuBtn?.nativeElement.focus()
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
      .subscribe((res) => {
        if(res) this.notificationService.message($localize`Token synchronized`);
        this.menuBtn?.nativeElement.focus()
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
      .subscribe((res) => {
        if(res){
          this.notificationService.message($localize`Description changed`);
          this.tokenService.updateTokenList(this.token.serial);
        }
        this.menuBtn?.nativeElement.focus()
      });
  }
}

