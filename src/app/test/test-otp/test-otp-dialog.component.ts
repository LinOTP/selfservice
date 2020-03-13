import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormBuilder, NgForm } from '@angular/forms';

import { tap, map } from 'rxjs/operators';
import { I18n } from '@ngx-translate/i18n-polyfill';

import { Token } from '../../api/token';
import { TestService, TransactionDetail, TestOptions } from '../../api/test.service';

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

  public state: TestState;
  public testResult: boolean;
  public errorMessage: string;

  public formGroup: FormGroup;

  private transactionDetail: TransactionDetail;

  @ViewChild('formDirective', { static: true })
  public formDirective: NgForm;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { token: Token },
    private testService: TestService,
    private formBuilder: FormBuilder,
    private i18n: I18n,
  ) {
    this.formGroup = this.formBuilder.group({
      otp: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.triggerTest();
  }

  private triggerTest() {
    this.state = TestState.LOADING;

    this.testService.testToken({ serial: this.data.token.serial }).subscribe(response => {
      if (response === null || typeof response !== 'object') {
        const message1 = this.i18n('There was a problem starting your token test.');
        const message2 = this.i18n('Please wait some time and try again later, or contact an administrator.');
        this.errorMessage = message1 + ' ' + message2;
        this.state = TestState.FAILURE;
      } else {
        this.transactionDetail = response;
        this.state = TestState.UNTESTED;
      }
    });
  }

  /**
   * Submit the OTP and set the component state to success or failure depending on the response.
   */
  public submit() {
    if (this.formGroup.valid) {
      const controls = this.formGroup.controls;
      const options: TestOptions = {
        serial: this.data.token.serial,
        otp: controls.otp.value,
        transactionid: this.transactionDetail.transactionid,
      };
      const message = this.i18n(' The test failed. Check if the OTP is correct or try again.');
      this.errorMessage = message;

      this.testService.testToken(options)
        .subscribe(result => {
          this.testResult = result === true;
          this.state = result ? TestState.SUCCESS : TestState.FAILURE;
        });
    }
  }

  /**
   * Returns the user to the empty input form, by setting the component state to untested and resetting the NgForm.
   *
   * @memberof TestOTPDialogComponent
   */
  public reset() {
    this.formDirective.resetForm({ otp: '', pin: '' });
    this.triggerTest();
  }
}
