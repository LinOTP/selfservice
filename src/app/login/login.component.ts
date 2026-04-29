import { LiveAnnouncer } from '@angular/cdk/a11y';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { EMPTY, from, Subscription } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';


import { ReplyMode, StatusDetail, TransactionDetail } from '@api/test.service';
import { SelfserviceToken, TokenDisplayData, TokenType } from '@api/token';
import { SystemInfo, SystemService } from '@app/system.service';
import { DialogComponent } from '@common/dialog/dialog.component';
import { Duration, NotificationService } from '@common/notification.service';

import { isFido2Supported, mapAssertionResponseToJson, mapSignRequestToPublicKeyOptions } from '@app/enroll/enroll-fido2-dialog/fido2-utils';
import { LoginOptions, LoginService, SignRequest } from './login.service';

export enum LoginStage {
  USER_PW_INPUT = 1,
  TOKEN_CHOICE = 2,
  OTP_INPUT = 3
}

const MIN_BACKEND_MAJOR_VERSION = 3;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
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
    private liveAnnouncer: LiveAnnouncer,
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
      this.liveAnnouncer.announce($localize`Form has errors. Please correct the highlighted fields.`);
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
        this.showError($localize`Login failed: you do not have a second factor set up. Please contact an admin.`)
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

    //If selected token is FIDO2, check if browser supports it before proceeding
    if (token.tokenType === TokenType.FIDO2 && !isFido2Supported()) {
      this.showError($localize`Your browser does not support FIDO2 authentication.`);
      this.awaitingResponse = false;
      return;
    }

    this.loginService.login({ serial: token.serial }).pipe(
    ).subscribe({
      next: result => {
        this.awaitingResponse = false;

        this.handledTokenType = this.selectedToken.typeDetails.type;
        if (result.targetToken) {
          this.handledTokenType = <TokenType>result.targetToken.type;
        }

        // FIDO2 handling: don't move to step 3, trigger WebAuthn authentication instead
        if (this.handledTokenType === TokenType.FIDO2 && result.signrequest) {
          this.handleFido2Authentication(result.signrequest);
          return;
        }

        if (result.challengedata) {
          this.transactionDetail = result.challengedata;
          this.checkTransactionState();
        }


        this.loginStage = LoginStage.OTP_INPUT;
      },
      error: err => {
        this.awaitingResponse = false;
        this.showError($localize`Error: ${err.message}`);
      }
    });
  }

  submitSecondFactor() {
    if (!this.secondFactorFormGroup.valid) {
      this.secondFactorFormGroup.markAllAsTouched();
      this.liveAnnouncer.announce($localize`Form has errors. Please correct the highlighted fields.`);
      return;
    }

    if (this.awaitingResponse) {
      return;
    }
    this.awaitingResponse = true;
    this.loginService.login({ otp: this.secondFactorFormGroup.value.otp })
    .subscribe({
      next: result => {
        this.awaitingResponse = false;
        this.finalAuthenticationHandling(result.success);
      },
      error: () => {
        this.awaitingResponse = false;
        this.showError();
        this.resetAuthForm();
      }
    });
  }

  private handleFido2Authentication(signrequest: SignRequest) {
    const publicKeyOptions = mapSignRequestToPublicKeyOptions(signrequest);

    this.awaitingResponse = true;
    from(navigator.credentials.get({ publicKey: publicKeyOptions }))
      .pipe(
        catchError(err => {
          // Error handling when something goes wrong during the WebAuthn process (e.g. user cancels, timeout, etc.)
          this.showError($localize`FIDO2 authentication failed: ${err.message}`);
          this.awaitingResponse = false;
          this.resetAuthForm();
          return EMPTY;
        }),
        switchMap((assertion: PublicKeyCredential) => {
          const assertionJSON = mapAssertionResponseToJson(assertion);
          return this.loginService.login({
            otp: assertionJSON,
          });
        }),
        tap(result => {
          this.awaitingResponse = false;
          this.finalAuthenticationHandling(result.success);
        })
      ).subscribe();
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
      this.showError();
      this.resetAuthForm()
    }
  }

  redirect() {
    const target = this.redirectUrl || '/';
    this.router.navigate([target]);
  }

  resetAuthForm() {
    const prefilledUsername: string | undefined = this.loginFormGroup.get("username")?.value;
    const prefilledRealm: string | undefined = this.loginFormGroup.get("realm")?.value;
    this.loginFormGroup.reset({ username: prefilledUsername, realm: prefilledRealm });
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

  isUsernameFilled() {
    return this.loginFormGroup.get("username").value?.length > 0
  }

  showError(errMsg = $localize`Login failed`){
    console.error(`${this.selectedToken?.serial}: ${errMsg}`)
    this.notificationService.errorMessage(errMsg, Duration.LONG);
  }
}
