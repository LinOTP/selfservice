import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

import { EnrollmentOptions } from '@api/token';
import { EnrollDialogBase, EnrolledToken } from '@app/enroll/enroll-dialog-base.directive';

@Component({
  selector: 'app-enroll-motp',
  templateUrl: './enroll-motp-dialog.component.html',
  styleUrls: ['./enroll-motp-dialog.component.scss']
})
export class EnrollMOTPDialogComponent extends EnrollDialogBase implements OnInit {

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;

  public ngOnInit() {
    this.createTokenForm.addControl('password',
      this.formBuilder.control('', [Validators.required, Validators.pattern(/^[0-9A-Fa-f]{16}$/)]));
    this.createTokenForm.addControl('mOTPPin',
      this.formBuilder.control('', [Validators.required]));
    super.ngOnInit();
  }

  public enrollMOTPToken() {
    const description = this.createTokenForm.get('description').value;
    const password = this.createTokenForm.get('password').value;
    const mOTPPin = this.createTokenForm.get('mOTPPin').value;
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description,
      otpkey: password,
      otppin: mOTPPin,
    };
    this.enrollToken(body, this.stepper).subscribe((token: EnrolledToken) => {
      this.enrolledToken = token;
    })
  }
}
