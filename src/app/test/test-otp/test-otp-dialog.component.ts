import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormBuilder, NgForm } from '@angular/forms';

import { I18n } from '@ngx-translate/i18n-polyfill';

import { Token, TokenType } from '../../api/token';
import { TestService, TransactionDetail, TestOptions, ReplyMode } from '../../api/test.service';
import { EnrollmentService } from '../../api/enrollment.service';
import { Subscription } from 'rxjs';

enum TestState {
  UNTESTED = 'untested',
  SUCCESS = 'success',
  FAILURE = 'failure',
  LOADING = 'loading',
}

@Component({
  selector: 'app-test-otp-dialog',
  templateUrl: './test-otp-dialog.component.html',
  styleUrls: ['./test-otp-dialog.component.scss']
})
export class TestOTPDialogComponent implements OnInit {

  public TestState = TestState;
  public ReplyMode = ReplyMode;

  public state: TestState;
  public testResult: boolean;
  public errorMessage: string;

  public formGroup: FormGroup;

  public serial: string;
  public transactionDetail: TransactionDetail;

  public showInputField = false;

  private pollingSubscription: Subscription;

  @ViewChild('formDirective', { static: true })
  public formDirective: NgForm;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { token: Token },
    private testService: TestService,
    private enrollmentService: EnrollmentService,
    private formBuilder: FormBuilder,
    private i18n: I18n,
  ) {
    this.formGroup = this.formBuilder.group({
      otp: ['', Validators.required],
    });
    this.serial = data.token.serial;
  }

  ngOnInit() {
    this.triggerTest();
  }

  private triggerTest() {
    this.state = TestState.LOADING;

    this.testService.testToken({ serial: this.serial }).subscribe(response => {
      if (response === null || typeof response !== 'object') {
        const message1 = this.i18n('There was a problem starting your token test.');
        const message2 = this.i18n('Please wait some time and try again later, or contact an administrator.');
        this.errorMessage = message1 + ' ' + message2;
        this.state = TestState.FAILURE;
      } else {
        this.transactionDetail = response;
        this.state = TestState.UNTESTED;
        if (this.hasOnlineMode) {
          this.checkTransactionState();
        }
      }
    });
  }

  public checkTransactionState() {
    const txId = this.transactionDetail.transactionid;
    this.pollingSubscription = this.enrollmentService.challengePoll(txId, '1234', this.serial).subscribe(data => {
      this.pollingSubscription.unsubscribe();
      if (data.accept || data.reject || data.valid_tan) {
        this.goToSuccess();
      } else {
        this.goToFailure();
      }
    });
  }

  /**
   * Submit the OTP and set the component state to success or failure depending on the response.
   */
  public submit() {
    if (this.formGroup.valid) {
      if (this.pollingSubscription) {
        this.pollingSubscription.unsubscribe();
      }
      const controls = this.formGroup.controls;
      const options: TestOptions = {
        serial: this.data.token.serial,
        otp: controls.otp.value,
        transactionid: this.transactionDetail.transactionid,
      };
      this.testService.testToken(options)
        .subscribe(result => {
          this.testResult = result === true;
          result ? this.goToSuccess() : this.goToFailure();
        });
    }
  }

  /**
   * Returns the user to the empty input form, by setting the component state to untested and resetting the NgForm.
   *
   * @memberof TestOTPDialogComponent
   */
  public reset() {
    this.showInputField = false;
    this.formDirective.resetForm({ otp: '', pin: '' });
    this.triggerTest();
  }

  public goToFailure() {
    this.errorMessage = this.i18n('The test failed. Check if the OTP is correct or try again.');
    this.state = TestState.FAILURE;
  }

  public goToSuccess() {
    this.state = TestState.SUCCESS;
  }

  public get hasOnlineMode(): boolean {
    return this.transactionDetail.reply_mode.includes(ReplyMode.ONLINE);
  }

  public get hasOfflineMode(): boolean {
    return this.transactionDetail.reply_mode.includes(ReplyMode.OFFLINE);
  }

  public get qrCodeData(): string {
    return this.transactionDetail.transactiondata;
  }

  public showInput() {
    this.showInputField = true;
  }
}
