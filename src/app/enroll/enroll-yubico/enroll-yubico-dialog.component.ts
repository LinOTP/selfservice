import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

import { EnrollmentService } from '../../api/enrollment.service';
import { TokenType } from '../../api/token';

@Component({
  selector: 'app-enroll-yubico',
  templateUrl: './enroll-yubico-dialog.component.html',
  styleUrls: ['./enroll-yubico-dialog.component.scss']
})
export class EnrollYubicoDialogComponent implements OnInit {

  public registrationForm: FormGroup;
  @ViewChild(MatStepper) public stepper: MatStepper;

  public success: boolean;
  public errorTypeMessage = '';
  public errorMessage = '';

  public closeLabel = $localize`Close`;

  public serial: string;

  constructor(
    private dialogRef: MatDialogRef<EnrollYubicoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { closeLabel: string },
    private formBuilder: FormBuilder,
    private enrollmentService: EnrollmentService,
  ) {
    this.closeLabel = data.closeLabel;
  }

  ngOnInit() {
    this.registrationForm = this.formBuilder.group({
      'publicId': ['', Validators.required],
      'description': [$localize`Registered via SelfService`, Validators.required],
    });
  }

  /**
  * Close the enrollment dialog without further action.
  */
  public close() {
    if (this.success) {
      this.dialogRef.close(this.serial);
    } else {
      this.dialogRef.close();
    }
  }

  /**
   * Return the user to the first step of the assignment process and reset the form.
   */
  public retry() {
    this.errorMessage = '';
    this.stepper.selectedIndex = 0;
  }

  /**
   * Submit token serial to token service for self-assignment. If successful,
   * display a success message, otherwise display an error message and the possibility
   * to retry the assignment process without leaving the dialog.
   */
  public registerToken() {
    this.registrationForm.disable();
    const body = {
      type: TokenType.YUBICO,
      'yubico.tokenid': this.registrationForm.get('publicId').value,
      description: this.registrationForm.get('description').value,
      otplen: 44,
    };
    this.errorMessage = '';
    this.enrollmentService.enroll<{ serial: string }>(body).subscribe(response => {
      if (!response || !response.result || !response.result.value) {
        this.errorTypeMessage = $localize`The token assignment failed.`;
      }
      if (response && response.result && response.result.error && response.result.error.message) {
        this.errorMessage = response.result.error.message;
      }
      this.success = false;
      if (response && response.result && response.result.value && response.detail && response.detail.serial) {
        this.success = response.result.value;
        this.serial = response.detail.serial;
      }
      this.stepper.next();
      this.registrationForm.enable();
    });
  }
}
