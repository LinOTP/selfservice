import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, Inject, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SelfserviceToken } from '@api/token';

import { OperationsService } from '@api/operations.service';

@Component({
  selector: 'app-set-description-dialog',
  templateUrl: './set-description-dialog.component.html',
  styleUrls: ['./set-description-dialog.component.scss'],
  standalone: false
})
export class SetDescriptionDialogComponent {

  awaitingResponse = false;
  public form: UntypedFormGroup;
  private liveAnnouncer = inject(LiveAnnouncer);

  constructor(
    private dialogRef: MatDialogRef<SetDescriptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public token: SelfserviceToken,
    private operationsService: OperationsService,
    private formBuilder: UntypedFormBuilder,
  ) {
    this.form = this.formBuilder.group(
      {
        description: [token.description, Validators.required],
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
      this.operationsService.setDescription(this.token.serial, this.form.controls.description.value).subscribe((result) => {
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
