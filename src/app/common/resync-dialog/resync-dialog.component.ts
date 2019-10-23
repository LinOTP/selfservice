import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, RequiredValidator, Validators } from '@angular/forms';

import { I18n } from '@ngx-translate/i18n-polyfill';

import { Token } from '../../api/token';
import { TokenService } from '../../api/token.service';
import { NotificationService } from '../notification.service';

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
    private tokenService: TokenService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private i18n: I18n,
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
      this.tokenService.resync(this.token.serial, this.form.controls.otp1.value, this.form.controls.otp2.value).subscribe((result) => {
        if (result) {
          this.dialogRef.close(true);
        } else {
          this.awaitingResponse = false;
          this.notificationService.message(this.i18n('Token could not be synchronized. Please try again.'));
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
