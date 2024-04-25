import { Component, OnInit } from '@angular/core';
import { FormGroupDirective, NgForm, UntypedFormControl } from '@angular/forms';


import { ErrorStateMatcher } from '@angular/material/core';
import { EnrollmentOptions, TokenType } from '@api/token';
import { Permission } from '@app/common/permissions';
import { EnrollDialogBaseComponent } from '@app/enroll/enroll-dialog-base.component';
import { from } from 'rxjs';
import { getCreatePasswordTokenForm } from './form';

@Component({
  selector: 'app-enroll-password',
  templateUrl: './enroll-password-dialog.component.html',
  styleUrls: ['./enroll-password-dialog.component.scss']
})
export class EnrollPasswordDialogComponent extends EnrollDialogBaseComponent implements OnInit {
  public matcher = new ConfirmPasswordErrorStateMatcher();
  public enrollmentStep = getCreatePasswordTokenForm();
  public get setOtpPinPolicyEnabled() {
    return this._setOtpPinPolicyEnabled;
  }
  public set setOtpPinPolicyEnabled(value) {
    this._setOtpPinPolicyEnabled = value;
    if (!value) {
      this.enrollmentStep.get('otpPin').disable();
    } else {
      this.enrollmentStep.get('otpPin').enable();
    }
  }
  private _setOtpPinPolicyEnabled = true;

  public ngOnInit(): void {
    super.ngOnInit();
    this._getPermissions().subscribe((hasPermission) => {
      this.setOtpPinPolicyEnabled = hasPermission;
    });
  }

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

  private _getPermissions() {
    return from(this.permissionsService.hasPermission(Permission.SETPIN))
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