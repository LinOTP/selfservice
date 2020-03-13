import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormBuilder, NgForm } from '@angular/forms';

import { I18n } from '@ngx-translate/i18n-polyfill';

import { Token } from '../../api/token';
import { TestService } from '../../api/test.service';

enum TestState {
  UNTESTED = 'untested',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

@Component({
  selector: 'app-test-oath-dialog',
  templateUrl: './test-oath-dialog.component.html',
  styleUrls: ['./test-oath-dialog.component.scss']
})
export class TestOATHDialogComponent {

  public TestState = TestState;

  public state: TestState = TestState.UNTESTED;
  public testResult: boolean;
  public formGroup: FormGroup;

  @ViewChild('formDirective', { static: true })
  public formDirective: NgForm;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { token: Token },
    private testService: TestService,
    private formBuilder: FormBuilder,
  ) {
    this.formGroup = this.formBuilder.group({
      otp: ['', Validators.required],
    });
  }

  /**
   * Submit the OTP and set the component state to success or failure depending on the response.
   */
  public submit() {
    if (this.formGroup.valid) {
      const controls = this.formGroup.controls;
      this.testService.testToken(this.data.token.serial, controls.otp.value)
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
    this.state = TestState.UNTESTED;
  }
}
