import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SelfserviceToken } from '../../api/token';
import { OperationsService } from '../../api/operations.service';

@Component({
  selector: 'app-set-description-dialog',
  templateUrl: './set-description-dialog.component.html',
  styleUrls: ['./set-description-dialog.component.scss']
})
export class SetDescriptionDialogComponent {

  private awaitingResponse = false;
  public form: UntypedFormGroup;

  constructor(
    private dialogRef: MatDialogRef<SetDescriptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private token: SelfserviceToken,
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
    return this.form.invalid || this.awaitingResponse;
  }
}
