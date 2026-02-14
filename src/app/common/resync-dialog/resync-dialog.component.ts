import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { OperationsService } from '@api/operations.service';
import { SelfserviceToken } from '@api/token';

@Component({
  selector: 'app-resync-dialog',
  templateUrl: './resync-dialog.component.html',
  styleUrls: ['./resync-dialog.component.scss'],
  standalone: false
})
export class ResyncDialogComponent {

  awaitingResponse = false;
  public form: UntypedFormGroup;

  constructor(
    private dialogRef: MatDialogRef<ResyncDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public token: SelfserviceToken,
    private operationsService: OperationsService,
    private formBuilder: UntypedFormBuilder,
    private liveAnnouncer: LiveAnnouncer,
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
    if (this.form.invalid) {
      this.liveAnnouncer.announce($localize`Form contains errors. Please check all required fields.`);
      // hack to force screen readers to re-announce the error state after button click
      setTimeout(() => {
        this.liveAnnouncer.announce('\u200B');
      }, 300);
      this.form.markAllAsTouched();
      return;
    }
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
    return this.awaitingResponse;
  }
}
