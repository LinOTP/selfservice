import { Component } from '@angular/core';
import { FormGroupDirective, NgForm, UntypedFormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { EnrollmentOptions, TokenType } from '@api/token';
import { EnrollDialogBaseComponent } from '@app/enroll/enroll-dialog-base.component';
import { getCreatePasswordTokenForm } from './form';

@Component({
  selector: 'app-enroll-password',
  templateUrl: './enroll-password-dialog.component.html',
  styleUrls: ['./enroll-password-dialog.component.scss']
})
export class EnrollPasswordDialogComponent extends EnrollDialogBaseComponent {
  public matcher = new ConfirmPasswordErrorStateMatcher();
  public enrollmentStep = getCreatePasswordTokenForm();

  public enrollToken() {
    if (this.enrollmentStep.invalid) return

    this.enrollmentStep.disable();
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: this.enrollmentStep.get('description').value,
      otpkey: this.enrollmentStep.get('password').value,
    };

    if (this.setOtpPinPolicyEnabled) {
      body.otppin = this.enrollmentStep.get('otpPin').get('pin').value
    }

    this.enrollmentService.enroll(body).subscribe(token => {
      if (token?.serial) {
        this.enrolledToken = { serial: token.serial, type: TokenType.PASSWORD };
        this.finalizeEnrollment();
        this.notificationService.message($localize`Token enrolled successfully.`);
      } else {
        this.enrollmentStep.enable();
      }
    });
  }

  public finalizeEnrollment() {
    this.dialogRef.close(true);
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
