import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Token } from '../../api/token';
import { OperationsService } from '../../api/operations.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-set-description-dialog',
  templateUrl: './set-description-dialog.component.html',
  styleUrls: ['./set-description-dialog.component.scss']
})
export class SetDescriptionDialogComponent {

  private awaitingResponse = false;
  public form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<SetDescriptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private token: Token,
    private operationsService: OperationsService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
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
        if (result && result.success) {
          this.dialogRef.close(true);
        } else {
          this.awaitingResponse = false;
          this.notificationService.message($localize`Token description could not be changed. Please try again.`);
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
