import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { TokenService } from '@api/token.service';

@Component({
  selector: 'app-get-serial-dialog',
  templateUrl: './get-serial-dialog.component.html',
  styleUrls: ['./get-serial-dialog.component.scss']
})
export class GetSerialDialogComponent {

  awaitingResponse = false;
  public form: UntypedFormGroup;


  constructor(
    private dialogRef: MatDialogRef<GetSerialDialogComponent>,
    private tokenService: TokenService,
    private formBuilder: UntypedFormBuilder,
  ) {
    this.form = this.formBuilder.group(
      {
        otp: ['', Validators.required],
      }
    );
  }

  /**
   * Handles the submission of description change request.
   *
   * On successful request to the backend, the current dialog is closed.
   * Otherwise, the user receives a notification and the dialog stays open.
   */
  public submit() {
    if (!this.awaitingResponse && this.form.valid) {
      this.awaitingResponse = true;
      this.tokenService.getSerialByOTP(this.form.controls.otp.value).subscribe((result) => {
        if (result) {
          this.dialogRef.close(result);
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
