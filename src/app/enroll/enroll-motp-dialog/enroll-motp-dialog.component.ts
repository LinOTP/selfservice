import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { TokenType } from '@linotp/data-models';
import { EnrollmentOptions } from '../../api/token';
import { EnrollDialogBaseComponent } from '../enroll-dialog-base.component';

@Component({
  selector: 'app-enroll-motp',
  templateUrl: './enroll-motp-dialog.component.html',
  styleUrls: ['./enroll-motp-dialog.component.scss']
})
export class EnrollMOTPDialogComponent extends EnrollDialogBaseComponent implements OnInit {

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: UntypedFormGroup;

  public ngOnInit() {
    this.enrollmentStep = this.formBuilder.group({
      'password': ['', [Validators.required, Validators.pattern(/^[0-9A-Fa-f]{16}$/)]],
      'mOTPPin': ['', Validators.required],
      'description': [$localize`Created via SelfService`, Validators.required],
    });
    super.ngOnInit();
  }

  public enrollToken() {
    this.enrollmentStep.disable();
    const description = this.enrollmentStep.get('description').value;
    const password = this.enrollmentStep.get('password').value;
    const mOTPPin = this.enrollmentStep.get('mOTPPin').value;

    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description,
      otpkey: password,
      otppin: mOTPPin,
    };

    this.enrollmentService.enroll(body).subscribe(token => {
      if (token?.serial) {
        this.enrolledToken = {
          serial: token.serial,
          type: TokenType.MOTP
        };
        this.tokenService.updateTokenList();
        this.stepper.next();
      } else {
        this.enrollmentStep.enable();
      }
    });
  }
}
