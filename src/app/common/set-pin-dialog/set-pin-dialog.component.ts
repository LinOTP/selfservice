import { Component, Inject } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { OperationsService } from '@api/operations.service';
import { SelfserviceToken } from '@api/token';
import { EnrolledToken } from '@app/enroll/enroll-dialog-base.directive';
import { ErrorStateRootMatcher } from '@common/form-helpers/error-state-root-matcher';

@Component({
  selector: 'app-set-pin-dialog',
  templateUrl: './set-pin-dialog.component.html',
  styleUrls: ['./set-pin-dialog.component.scss']
})
export class SetPinDialogComponent {

  awaitingResponse = false;
  public matcher = new ErrorStateRootMatcher();
  public form: UntypedFormGroup;

  public newPinPlaceholder = $localize`New PIN`;
  public confirmPinPlaceholder = $localize`Confirm your new PIN`;

  get token() {
    if (this._token instanceof SelfserviceToken) {
      return this._token;
    } else {
      return null
    }
  }

  constructor(
    private dialogRef: MatDialogRef<SetPinDialogComponent>,
    private operationsService: OperationsService,
    @Inject(MAT_DIALOG_DATA) private _token: SelfserviceToken | EnrolledToken,
  ) {
    this.form = new UntypedFormGroup(
      {
        newPin: new UntypedFormControl(''),
        confirmPin: new UntypedFormControl(''),
      },
      this.checkPins
    );
  }

  /**
   * Validator that checks whether the two pins entered in the referenced form group are equal.
   *
   * @param group form group containing a `newPin` and a `confirmPin` control.
   */
  private checkPins(group: UntypedFormGroup): (ValidationErrors | null) {
    const newPin: string = group.get('newPin')?.value;
    const confirmPin: string = group.get('confirmPin')?.value;

    return newPin === confirmPin ? null : { pinsDoNotMatch: true };
  }

  /**
   * Handles the submission of a new pin: the form with the pins must be valid, and there must not be a pending set pin request.
   *
   * On successful request to the backend, the current dialog is closed.
   * Otherwise, the user receives a notification and the dialog stays open.
   */
  public submit() {
    if (!this.awaitingResponse && this.form.valid) {
      this.awaitingResponse = true;
      this.operationsService.setPin(this._token, this.form.controls.newPin.value).subscribe((result) => {
        if (result) {
          this.dialogRef.close(true);
        } else {
          this.awaitingResponse = false;
        }
      });
    }
  }

  /**
   * Helper function used to disable the submit button.
   */
  public preventSubmit() {
    return this.form.invalid || this.awaitingResponse;
  }
}
