import { Component, ViewChild } from '@angular/core';
import { FormGroupDirective, NgForm, UntypedFormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { EnrollmentOptions } from '@api/token';
import { EnrollDialogBase, EnrolledToken } from '@app/enroll/enroll-dialog-base.directive';
import { getCreatePasswordTokenForm } from './form';
import { MatStepper } from "@angular/material/stepper";

@Component({
    selector: 'app-enroll-password',
    templateUrl: './enroll-password-dialog.component.html',
    styleUrls: ['./enroll-password-dialog.component.scss'],
    standalone: false
})
export class EnrollPasswordDialogComponent extends EnrollDialogBase {
  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;

  public matcher = new ConfirmPasswordErrorStateMatcher();
  public createTokenForm = getCreatePasswordTokenForm();

  public enrollPWToken() {
    if (this.createTokenForm.invalid) return
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: this.createTokenForm.get('description').value,
      otpkey: this.createTokenForm.get('password').value,
    };
    this.enrollToken(body, this.stepper).subscribe((token: EnrolledToken) => {
      this.enrolledToken = token;
    })
  }

}

class ConfirmPasswordErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const passwordsDoNotMatch = form?.hasError('passwordsDoNotMatch');
    return control?.touched && (control.invalid || passwordsDoNotMatch);
  }
}
