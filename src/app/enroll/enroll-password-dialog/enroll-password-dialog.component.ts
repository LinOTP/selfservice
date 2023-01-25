import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { TokenType } from '@linotp/data-models';
import { EnrollmentOptions } from '../../api/token';
import { ErrorStateRootMatcher } from '../../common/form-helpers/error-state-root-matcher';
import { EnrollDialogBaseComponent } from '../enroll-dialog-base.component';

@Component({
  selector: 'app-enroll-password',
  templateUrl: './enroll-password-dialog.component.html',
  styleUrls: ['./enroll-password-dialog.component.scss']
})
export class EnrollPasswordDialogComponent extends EnrollDialogBaseComponent implements OnInit {

  public matcher = new ErrorStateRootMatcher();

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: UntypedFormGroup;

  public ngOnInit() {
    this.enrollmentStep = new UntypedFormGroup(
      {
        'password': new UntypedFormControl('', [Validators.required]),
        'confirmation': new UntypedFormControl('', [Validators.required]),
        'description': new UntypedFormControl($localize`Created via SelfService`, [Validators.required]),
      },
      this.checkPasswords
    );
  }

  private checkPasswords(group: UntypedFormGroup): (ValidationErrors | null) {
    const password: string = group.get('password')?.value;
    const passwordConfirmation: string = group.get('confirmation')?.value;

    return password === passwordConfirmation ? null : { passwordsDoNotMatch: true };
  }

  public enrollToken() {
    this.enrollmentStep.disable();
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: this.enrollmentStep.get('description').value,
      otpkey: this.enrollmentStep.get('password').value,
    };

    this.enrollmentService.enroll(body).subscribe(token => {
      if (token?.serial) {
        this.enrolledToken = { serial: token.serial, type: TokenType.PASSWORD };
        this.tokenService.updateTokenList();
        this.stepper.next();
      } else {
        this.enrollmentStep.enable();
      }
    });
  }

  public finalizeEnrollment() {
    this.dialogRef.close(true);
  }

}
