import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { SelfserviceToken } from '../../api/token';
import { OperationsService } from '../../api/operations.service';

@Component({
  selector: 'app-resync-dialog',
  templateUrl: './resync-dialog.component.html',
  styleUrls: ['./resync-dialog.component.scss']
})
export class ResyncDialogComponent {

  private awaitingResponse = false;
  public form: UntypedFormGroup;

  constructor(
    private dialogRef: MatDialogRef<ResyncDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private token: SelfserviceToken,
    private operationsService: OperationsService,
    private formBuilder: UntypedFormBuilder,
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
