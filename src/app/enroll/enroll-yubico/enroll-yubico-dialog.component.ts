import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { TokenType } from '../../api/token';
import { EnrollDialogBaseComponent } from '../enroll-dialog-base.component';

@Component({
  selector: 'app-enroll-yubico',
  templateUrl: './enroll-yubico-dialog.component.html',
  styleUrls: ['./enroll-yubico-dialog.component.scss']
})
export class EnrollYubicoDialogComponent extends EnrollDialogBaseComponent implements OnInit {

  public registrationForm: FormGroup;
  @ViewChild(MatStepper) public stepper: MatStepper;

  public success = false;

  ngOnInit() {
    this.registrationForm = this.formBuilder.group({
      'publicId': ['', Validators.required],
      'description': [$localize`Registered via SelfService`, Validators.required],
    });
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
      const serial = response?.result?.value && response?.detail?.serial;
      if (serial) {
        this.enrolledToken = { serial: serial };
        this.success = true;
        this.stepper.next();
      } else {
        this.registrationForm.enable();
        this.notificationService.message($localize`Token registration failed.`);
      }
    });
  }
}
