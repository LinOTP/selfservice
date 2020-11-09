import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { EnrollToken } from '../../api/token';
import { EnrollDialogBaseComponent } from '../enroll-dialog-base.component';

@Component({
  selector: 'app-enroll-motp',
  templateUrl: './enroll-motp-dialog.component.html',
  styleUrls: ['./enroll-motp-dialog.component.scss']
})
export class EnrollMOTPDialogComponent extends EnrollDialogBaseComponent implements OnInit {

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: FormGroup;

  public showDetails = false;

  public ngOnInit() {

    this.enrollmentStep = this.formBuilder.group({
      'password': ['', [Validators.required, Validators.pattern(/^[0-9A-Fa-f]{16}$/)]],
      'mOTPPin': ['', Validators.required],
      'description': [$localize`Created via SelfService`, Validators.required],
    });
  }

  public enrollToken() {
    this.enrollmentStep.disable();
    const description = this.enrollmentStep.get('description').value;
    const password = this.enrollmentStep.get('password').value;
    const mOTPPin = this.enrollmentStep.get('mOTPPin').value;

    const body: EnrollToken = {
      type: this.data.tokenTypeDetails.type,
      description,
      otpkey: password,
      otppin: mOTPPin,
    };

    this.enrollmentService.enroll(body).subscribe(response => {
      const serial = response?.result?.value && response?.detail?.serial;
      if (serial) {
        this.enrolledToken = {
          serial: serial,
        };
        this.stepper.next();
      }
      this.enrollmentStep.enable();
    });
  }
}
