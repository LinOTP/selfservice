import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { EnrollToken } from '../../api/token';
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
  public enrollmentStep: FormGroup;

  public ngOnInit() {
    this.enrollmentStep = this.formBuilder.group(
      {
        'password': ['', Validators.required],
        'confirmation': ['', Validators.required],
        'description': [$localize`Created via SelfService`, Validators.required],
      },
      {
        validator: this.checkPasswords
      }
    );
  }

  private checkPasswords(group: FormGroup): (ValidationErrors | null) {
    const password: string = group.get('password')?.value;
    const passwordConfirmation: string = group.get('confirmation')?.value;

    return password === passwordConfirmation ? null : { passwordsDoNotMatch: true };
  }

  public enrollToken() {
    this.enrollmentStep.disable();
    const body: EnrollToken = {
      type: this.data.tokenTypeDetails.type,
      description: this.enrollmentStep.get('description').value,
      otpkey: this.enrollmentStep.get('password').value,
    };

    this.enrollmentService.enroll(body).subscribe(response => {
      if (response?.result?.value) {
        this.enrolledToken = { serial: response.detail.serial };
        this.stepper.next();
      }
      this.enrollmentStep.enable();
    });
  }

}
