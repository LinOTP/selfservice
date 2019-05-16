import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, ValidationErrors, AbstractControl } from '@angular/forms';

import { Token } from '../../api/token';
import { TokenService } from '../../api/token.service';
import { ErrorStateRootMatcher } from '../form-helpers/error-state-root-matcher';

@Component({
  selector: 'app-set-pin-dialog',
  templateUrl: './set-pin-dialog.component.html',
  styleUrls: ['./set-pin-dialog.component.scss']
})
export class SetPinDialogComponent {

  private awaitingResponse = false;
  public matcher = new ErrorStateRootMatcher();
  public form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<SetPinDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private token: Token,
    private tokenService: TokenService,
    private formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group(
      {
        newPin: ['', [Validators.required]],
        confirmPin: ['', [Validators.required]]
      },
      {
        validator: this.checkPins
      }
    );
  }

  /**
   * Validator that checks whether the two pins entered in the referenced form group are equal.
   *
   * @param group form group containing a `newPin` and a `confirmPin` control.
   */
  private checkPins(group: FormGroup): (ValidationErrors | null) {
    const newPinControl: AbstractControl = group.get('newPin');
    const confirmPinControl: AbstractControl = group.get('confirmPin');

    return newPinControl && confirmPinControl && newPinControl.value === confirmPinControl.value ?
      null : { pinsDoNotMatch: true };
  }

  /**
   * Handles the submission of a new pin as long as the form with the pins is valid.
   *
   * On successful request to the backend, the current dialog is closed.
   * Otherwise, the user receives a notification and the dialog stays open.
   */
  public submit() {
    if (this.form.valid) {
      this.tokenService.setPin(this.token, this.form.controls.newPin.value).subscribe((result) => {
        if (result) {
          this.dialogRef.close(true);
        }
      });
    }
  }
}
