import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { EMPTY, from, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';


import { ReplyMode, StatusDetail, TestOptions, TestService, TransactionDetail } from '@api/test.service';
import { SelfserviceToken, TokenDisplayData, tokenDisplayData, TokenType } from '@api/token';
import { isFido2Supported, mapAssertionResponseToJson, mapSignRequestToPublicKeyOptions } from '@app/enroll/enroll-fido2-dialog/fido2-utils';
import { NotificationService } from '@common/notification.service';

enum TestState {
  UNTESTED = 'untested',
  SUCCESS = 'success',
  FAILURE = 'failure',
  LOADING = 'loading',
}

@Component({
  selector: 'app-test-dialog',
  templateUrl: './test-dialog.component.html',
  styleUrls: ['./test-dialog.component.scss'],
  standalone: false
})
export class TestDialogComponent implements OnInit, OnDestroy {

  public TokenType = TokenType;
  public typeDetails: TokenDisplayData = undefined;
  public TargetToken: {
    serial: string;
    type: TokenType;
    description: string;
  };

  public TestState = TestState;
  public ReplyMode = ReplyMode;

  public state: TestState;
  public testResult: boolean;
  public challResult: StatusDetail;
  public errorMessage: string;
  public awaitingResponse = false;

  public formGroup: UntypedFormGroup;

  public serial: string;
  public transactionDetail: TransactionDetail;
  public shortTransactionId: string;

  public showInputField = false;
  public offlineOtpValue: string = "";
  private pollingSubscription: Subscription;

  @ViewChild('formDirective', { static: true })
  public formDirective: NgForm;

  get token(): SelfserviceToken {
    return this.data.token || null;
  }

  get isFido2(): boolean {
    return this.typeDetails?.type === TokenType.FIDO2 || (this.transactionDetail?.linotp_forward_tokentype === TokenType.FIDO2);
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { serial: string, type: TokenType, token: SelfserviceToken | undefined; },
    private testService: TestService,
    private formBuilder: UntypedFormBuilder,
    private liveAnnouncer: LiveAnnouncer,
    private notificationService: NotificationService,
  ) {
    this.formGroup = this.formBuilder.group({
      otp: ['', Validators.required],
    });
    this.serial = data.serial;
    this.typeDetails = tokenDisplayData.find(d => d.type === data.type);
  }

  ngOnInit() {
    this.triggerTest();
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  private triggerTest() {
    const message1 = $localize`There was a problem starting your token test.`;
    const message2 = $localize`Please wait some time and try again later, or contact an administrator.`;

    if (this.isFido2 && !isFido2Supported()) {
      this.errorMessage = $localize`Your browser does not support FIDO2 authentication.`;
      this.state = TestState.FAILURE;
      return;
    }

    this.state = TestState.LOADING;
    this.testService.testToken({ serial: this.serial }).subscribe({
      next: response => {
        if (response === null || typeof response !== 'object') {
          this.errorMessage = message1 + ' ' + message2;
          this.state = TestState.FAILURE;
        } else {
          this.transactionDetail = response;

          if (response.transactionId) {
            this.shortTransactionId = response.transactionId.toString().slice(0, 6);
          }

          if (response.linotp_forward_tokentype) {
            this.TargetToken = {
              type: <TokenType>response.linotp_forward_tokentype,
              serial: response.linotp_forward_tokenserial,
              description: response.linotp_forward_tokendescription,
            };
          };

          // Detect FIDO2 token
          if (this.data.type === TokenType.FIDO2 && response.signrequest) {
            // Remove required validator from OTP field since FIDO2 doesn't use manual OTP input
            this.formGroup.controls.otp.clearValidators();
            this.formGroup.controls.otp.updateValueAndValidity();
          }

          this.state = TestState.UNTESTED;
          if (!this.isFido2 && this.hasOnlineMode) {
            this.checkTransactionState();
          }
        }
      },
      error: () => {
        this.errorMessage = message1 + ' ' + message2;
        this.state = TestState.FAILURE;
      }
    });
  }

  public checkTransactionState() {
    const txId = this.transactionDetail.transactionId;
    this.pollingSubscription = this.testService.statusPoll(txId).subscribe(data => {
      this.challResult = data;
      if (data.accept || data.reject || data.valid_tan) {
        this.goToSuccess();
      } else {
        this.goToFailure();
      }
    });
  }

  private announceFormErrors(): void {
    this.liveAnnouncer.announce($localize`Form contains errors. Please check all required fields.`);
    setTimeout(() => this.liveAnnouncer.announce('\u200B'), 300);
    this.formGroup.markAllAsTouched();
  }

  /**
   * Submit the OTP and set the component state to success or failure depending on the response.
   * For FIDO2 tokens, triggers navigator.credentials.get and builds OTP as pin + assertionJSON.
   */
  public submit() {
    if (this.isFido2) {
      this.submitFido2();
      return;
    }

    if (this.formGroup.invalid) {
      this.announceFormErrors();
      return;
    }
    if (!this.preventSubmit()) {
      if (this.pollingSubscription) {
        this.pollingSubscription.unsubscribe();
      }
      const controls = this.formGroup.controls;
      const options: TestOptions = {
        serial: this.data.serial,
        otp: controls.otp.value,
        transactionid: this.transactionDetail.transactionId,
      };
      this.awaitingResponse = true;
      this.testService.testToken(options)
        .subscribe(result => {
          this.testResult = result === true;
          this.testResult ? this.goToSuccess() : this.goToFailure();
          this.awaitingResponse = false;
        });
    }
  }

  private submitFido2() {
    const publicKeyOptions = mapSignRequestToPublicKeyOptions(this.transactionDetail.signrequest!);

    this.awaitingResponse = true;
    from(navigator.credentials.get({ publicKey: publicKeyOptions }))
      .pipe(
        catchError(err => {
          this.awaitingResponse = false;
          this.notificationService.errorMessage($localize`FIDO2 authentication failed: ${err.message}`);
          this.goToFailure();
          return EMPTY;
        }),
        switchMap((assertion: PublicKeyCredential) => {
          const assertionJSON = mapAssertionResponseToJson(assertion);

          const pin = this.formGroup.controls.otp.value || '';
          const options: TestOptions = {
            serial: this.data.serial,
            otp: pin + assertionJSON,
            transactionid: this.transactionDetail.transactionId,
          };

          return this.testService.testToken(options);
        }),
      ).subscribe({
        next: result => {
          this.awaitingResponse = false;
          this.testResult = result === true;
          this.testResult ? this.goToSuccess() : this.goToFailure();
        },
        error: () => {
          this.awaitingResponse = false;
          this.notificationService.errorMessage($localize`FIDO2 authentication failed`);
          this.goToFailure();
        }
      });
  }

  /**
   * Returns the user to the empty input form, by setting the component state to untested and resetting the NgForm.
   *
   * @memberof TestDialogComponent
   */
  public reset() {
    this.showInputField = false;
    this.formDirective.resetForm({ otp: '', pin: '' });
    this.triggerTest();
  }

  public goToFailure() {
    this.errorMessage = $localize`The test failed. Please try again or contact an administrator.`;
    this.state = TestState.FAILURE;
  }

  public goToSuccess() {
    this.state = TestState.SUCCESS;
  }

  public get hasOnlineMode(): boolean {
    return this.transactionDetail.replyMode.includes(ReplyMode.ONLINE);
  }

  public get hasOfflineMode(): boolean {
    return this.transactionDetail.replyMode.includes(ReplyMode.OFFLINE);
  }


  public showInput() {
    this.showInputField = true;
  }

  public preventSubmit() {
    return this.awaitingResponse && this.offlineOtpValue.length === 0;
  }
}
