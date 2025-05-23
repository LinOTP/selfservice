import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';


import { ReplyMode, StatusDetail, TransactionDetail } from '@api/test.service';
import { SelfserviceToken, TokenDisplayData, TokenType } from '@api/token';
import { SystemInfo, SystemService } from '@app/system.service';
import { DialogComponent } from '@common/dialog/dialog.component';
import { Duration, NotificationService } from '@common/notification.service';

import { LoginOptions, LoginService } from './login.service';

export enum LoginStage {
  USER_PW_INPUT = 1,
  TOKEN_CHOICE = 2,
  OTP_INPUT = 3
}

const MIN_BACKEND_MAJOR_VERSION = 3;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  TokenType = TokenType;

  message: string;

  loginFormGroup: UntypedFormGroup;
  secondFactorFormGroup: UntypedFormGroup;

  redirectUrl: string;

  systemInfo: SystemInfo;

  factors: SelfserviceToken[] = [];
  selectedToken: { serial: string; typeDetails: TokenDisplayData; };

  loginStage = LoginStage.USER_PW_INPUT;

  awaitingResponse = false;

  public transactionDetail: TransactionDetail;
  public shortTransactionId: string;
  public challengeResult: StatusDetail;
  public showInputField = false;
  private pollingSubscription: Subscription;
  public handledTokenType: TokenDisplayData["type"];

  @ViewChildren('tokenListItem', { read: ElementRef }) tokenChoiceItems: QueryList<ElementRef>;
  showKeyboardTip: boolean;

  private incompatibleServerDialog: MatDialogRef<DialogComponent>;

  constructor(
    private loginService: LoginService,
    public notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private systemService: SystemService,
    private formBuilder: UntypedFormBuilder,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.loginFormGroup = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.secondFactorFormGroup = this.formBuilder.group({
      otp: ['', Validators.required],
    });

    this.route.queryParamMap
      .pipe(
        map(params => params.get('redirect')),
      )
      .subscribe(url => this.redirectUrl = url);

    this.systemService.getSystemInfo$().subscribe(systemInfo => {
      this.systemInfo = systemInfo;

      const majorVersion = Number(systemInfo?.version?.match(/LinOTP (\d*?)\./)[1]) || 0;
      if (majorVersion < MIN_BACKEND_MAJOR_VERSION && !this.incompatibleServerDialog) {
        const config = {
          width: '35em',
          disableClose: true,
          autoFocus: true,
          data: {
            title: $localize`Incompatible server version`,
            text: $localize`The LinOTP server version is too old for the Self Service version you are using. Please contact an administrator.`,
            nonDismissible: true,
          }
        };
        this.incompatibleServerDialog = this.dialog.open(DialogComponent, config);
      } else if (this.incompatibleServerDialog) {
        this.incompatibleServerDialog.close();
        this.incompatibleServerDialog = null;
      }

      if (systemInfo?.settings.realm_box && !this.loginFormGroup.contains('realm')) {
        this.loginFormGroup.addControl(
          'realm',
          this.formBuilder.control(systemInfo.settings.default_realm, Validators.required)
        );
      } else if (!systemInfo?.settings.realm_box && this.loginFormGroup.contains('realm')) {
        this.loginFormGroup.removeControl('realm');
      }

      if (systemInfo?.settings.mfa_3_fields && !this.loginFormGroup.contains('otp')) {
        this.loginFormGroup.addControl(
          'otp',
          this.formBuilder.control('')
        );
      } else if (!systemInfo?.settings.mfa_3_fields && this.loginFormGroup.contains('otp')) {
        this.loginFormGroup.removeControl('otp');
      }
    });

    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
    ]).subscribe(result => {
      this.showKeyboardTip = !result.matches;
    });

  }

  login() {
    if (!this.loginFormGroup.valid) {
      this.loginFormGroup.markAllAsTouched();
      return;
    }

    if (this.awaitingResponse) {
      return;
    }
    this.awaitingResponse = true;
    this.message = $localize`Waiting for response`;

    const loginOptions: LoginOptions = {
      username: this.loginFormGroup.value.username,
      password: this.loginFormGroup.value.password,
      realm: this.loginFormGroup.value.realm,
      otp: this.loginFormGroup.value.otp,
    };

    if (loginOptions.realm === undefined) {
      delete loginOptions.realm;
    }
    if (loginOptions.otp === undefined) {
      delete loginOptions.otp;
    }

    this.loginService.login(loginOptions).subscribe(result => {
      this.awaitingResponse = false;
      if (!result.tokens) {
        this.finalAuthenticationHandling(result.success);
      } else if (result.tokens.length === 0) {
        this.notificationService.errorMessage(
          $localize`Login failed: you do not have a second factor set up. Please contact an admin.`,
          Duration.LONG
        );
      } else if (result.tokens.length === 1) {
        this.chooseSecondFactor(result.tokens[0]);
      } else {
        this.factors = result.tokens;
        this.loginStage = LoginStage.TOKEN_CHOICE;
        setTimeout(() => {
          this.tokenChoiceItems.first.nativeElement.focus();
        });
      }
    });
  }

  @HostListener('body:keydown', ['$event']) moveSelection(event: KeyboardEvent) {
    if (this.loginStage !== LoginStage.TOKEN_CHOICE) {
      return;
    }

    const eventElement = event.target as HTMLElement;
    const isTokenListItem = eventElement?.classList?.contains('token-list-item');

    let targetElement: HTMLElement;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        targetElement = isTokenListItem && eventElement.nextElementSibling || this.tokenChoiceItems?.first.nativeElement;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        targetElement = isTokenListItem && eventElement.previousElementSibling || this.tokenChoiceItems?.last.nativeElement;
        break;
    }

    if (targetElement) {
      targetElement.focus();
      return false;
    }
  }

  chooseSecondFactor(token: SelfserviceToken) {
    if (this.awaitingResponse) {
      return;
    }
    this.awaitingResponse = true;
    this.selectedToken = token;
    this.loginService.login({ serial: token.serial })
      .subscribe(result => {
        this.awaitingResponse = false;

        this.handledTokenType = this.selectedToken.typeDetails.type;
        if (result.targetToken) {
          this.handledTokenType = <TokenType>result.targetToken.type;
        }

        if (result.challengedata) {
          this.transactionDetail = result.challengedata;
          this.checkTransactionState();
        }
        this.loginStage = LoginStage.OTP_INPUT;
      });
  }

  submitSecondFactor() {
    if (!this.secondFactorFormGroup.valid) {
      this.secondFactorFormGroup.markAllAsTouched();
      return;
    }

    if (this.awaitingResponse) {
      return;
    }
    this.awaitingResponse = true;
    this.loginService.login({ otp: this.secondFactorFormGroup.value.otp })
      .subscribe(result => {
        this.awaitingResponse = false;
        this.finalAuthenticationHandling(result.success);
      });
  }

  public checkTransactionState() {
    const txId = this.transactionDetail.transactionId;
    if (this.hasOnlineMode) {
      this.pollingSubscription = this.loginService.statusPoll(txId).subscribe(response => {
        this.finalAuthenticationHandling(response);
      });
    }
  }

  public get hasOnlineMode(): boolean {
    return this.transactionDetail.replyMode.includes(ReplyMode.ONLINE);
  }

  public get hasOfflineMode(): boolean {
    return this.transactionDetail.replyMode.includes(ReplyMode.OFFLINE);
  }

  public get qrCodeData(): string {
    return this.transactionDetail.transactionData;
  }

  public showInput() {
    this.showInputField = true;
  }

  finalAuthenticationHandling(success: boolean) {
    this.stopSubscription();

    if (success) {
      this.notificationService.message($localize`Login successful`);
      this.redirect();
    } else {
      this.notificationService.errorMessage($localize`Login failed`);
      this.loginStage = LoginStage.USER_PW_INPUT;
      this.factors = [];
      this.secondFactorFormGroup.reset();
      this.selectedToken = null;
    }
  }

  redirect() {
    const target = this.redirectUrl || '/';
    this.router.navigate([target]);
  }

  resetAuthForm() {
    this.loginFormGroup.reset();
    this.secondFactorFormGroup.reset();
    this.loginStage = LoginStage.USER_PW_INPUT;
    this.factors = [];
    this.selectedToken = null;
    this.showInputField = false;
    this.transactionDetail = null;
    this.stopSubscription();
  }

  stopSubscription() {
    if (this.pollingSubscription?.closed === false) {
      this.pollingSubscription.unsubscribe();
    }
  }
}
