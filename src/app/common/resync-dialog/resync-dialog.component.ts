import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Token } from '../../api/token';
import { OperationsService } from '../../api/operations.service';

@Component({
  selector: 'app-resync-dialog',
  templateUrl: './resync-dialog.component.html',
  styleUrls: ['./resync-dialog.component.scss']
})
export class ResyncDialogComponent {

  private awaitingResponse = false;
  public form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<ResyncDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private token: Token,
    private operationsService: OperationsService,
    private formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group(
      {
        otp1: ['', Validators.required],
        otp2: ['', Validators.required],
      }
    );
  }

  /**
   * Handles the submission of two OTPs for resync: both values must have been entered, and there must not be a pending set pin request.
   *
   * On successful request to the backend, the current dialog is closed.
   * Otherwise, the user receives a notification and the dialog stays open.
   */
  public submit() {
    if (!this.awaitingResponse && this.form.valid) {
      this.awaitingResponse = true;
      this.operationsService.resync(this.token.serial, this.form.controls.otp1.value, this.form.controls.otp2.value).subscribe((result) => {
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
