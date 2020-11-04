import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

import { EnrollmentService } from '../../api/enrollment.service';
import { TokenType } from '../../api/token';
import { NotificationService } from '../../common/notification.service';

@Component({
  selector: 'app-enroll-yubico',
  templateUrl: './enroll-yubico-dialog.component.html',
  styleUrls: ['./enroll-yubico-dialog.component.scss']
})
export class EnrollYubicoDialogComponent implements OnInit {

  public registrationForm: FormGroup;
  @ViewChild(MatStepper) public stepper: MatStepper;

  public success = false;
  public closeLabel = $localize`Close`;
  public serial: string;

  constructor(
    private dialogRef: MatDialogRef<EnrollYubicoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { closeLabel: string },
    private formBuilder: FormBuilder,
    private enrollmentService: EnrollmentService,
    private notificationService: NotificationService,
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
   * Submit token serial to token service for registration. If successful,
   * go to next step, otherwise display an error notification toast and remain
   * on the same step.
   */
  public registerToken() {
    this.registrationForm.disable();
    const body = {
      type: TokenType.YUBICO,
      'yubico.tokenid': this.registrationForm.get('publicId').value,
      description: this.registrationForm.get('description').value,
      otplen: 44,
    };
    this.enrollmentService.enroll<{ serial: string }>(body).subscribe(response => {
      this.serial = response?.result?.value && response?.detail?.serial;
      if (this.serial) {
        this.success = true;
        this.stepper.next();
      } else {
        this.registrationForm.enable();
        this.notificationService.message($localize`Token registration failed.`);
      }
    });
  }
}
