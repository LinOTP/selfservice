import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { EnrollToken } from '../../api/token';
import { Permission } from '../../common/permissions';
import { SetPinDialogComponent } from '../../common/set-pin-dialog/set-pin-dialog.component';
import { EnrollDialogBaseComponent, EnrolledToken } from '../enroll-dialog-base.component';

interface OATHEnrolledToken extends EnrolledToken {
  url: string;
  seed: string;
}

@Component({
  selector: 'app-enroll-oath',
  templateUrl: './enroll-oath-dialog.component.html',
  styleUrls: ['./enroll-oath-dialog.component.scss']
})
export class EnrollOATHDialogComponent extends EnrollDialogBaseComponent implements OnInit {

  public Permission = Permission;
  public enrolledToken: OATHEnrolledToken;

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: FormGroup;
  public testStep: FormGroup;

  public pinSet: boolean;
  public showDetails = false;

  public ngOnInit() {
    this.enrollmentStep = this.formBuilder.group({
      'description': [$localize`Created via SelfService`, Validators.required],
    });
    this.testStep = this.formBuilder.group({
      'otp': ['', Validators.required],
      'pin': ''
    });
  }

  public enrollToken() {
    this.enrollmentStep.disable();
    const body: EnrollToken = {
      type: this.data.tokenTypeDetails.type,
      description: this.enrollmentStep.get('description').value,
    };

    this.enrollmentService.enroll<{ serial: string, otpkey: { value: string }, googleurl: { value: string } }>(body).subscribe(response => {
      const token = response?.detail;
      if (token) {
        this.enrolledToken = {
          url: token.googleurl.value,
          serial: token.serial,
          seed: token.otpkey.value,
        };
        this.stepper.next();
      }
      this.enrollmentStep.enable();
    });
  }

  public setPin() {
    const config = {
      width: '25em',
      data: this.enrolledToken
    };
    this.dialog
      .open(SetPinDialogComponent, config)
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.pinSet = true;
          this.notificationService.message($localize`PIN set`);
        }
      });
  }

  copyInputMessage(inputElement: HTMLInputElement) {
    inputElement.select();
    document.execCommand('copy');
    this.notificationService.message($localize`Copied`);
  }

}
