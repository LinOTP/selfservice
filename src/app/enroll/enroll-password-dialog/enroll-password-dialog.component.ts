import { Component } from '@angular/core';
import { FormGroupDirective, NgForm, UntypedFormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { EnrollmentOptions, TokenType } from '@api/token';
import { EnrollDialogBase } from '@app/enroll/enroll-dialog-base.directive';
import { getCreatePasswordTokenForm } from './form';

@Component({
  selector: 'app-enroll-password',
  templateUrl: './enroll-password-dialog.component.html',
  styleUrls: ['./enroll-password-dialog.component.scss']
})
export class EnrollPasswordDialogComponent extends EnrollDialogBase {
  public matcher = new ConfirmPasswordErrorStateMatcher();
  public createTokenForm = getCreatePasswordTokenForm();

  public enrollPWToken() {
    if (this.createTokenForm.invalid) return

    this.createTokenForm.disable();
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: this.createTokenForm.get('description').value,
      otpkey: this.createTokenForm.get('password').value,
    };

    if (this.setOtpPinPolicyEnabled) {
      body.otppin = this.createTokenForm.get('otpPin').get('pin').value
    }

    this.enrollmentService.enroll(body).subscribe(token => {
      if (token?.serial) {
        this.enrolledToken = { serial: token.serial, type: TokenType.PASSWORD };
        this.close();
        this.notificationService.message($localize`Token enrolled successfully.`);
      } else {
        this.createTokenForm.enable();
      }
    });
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
