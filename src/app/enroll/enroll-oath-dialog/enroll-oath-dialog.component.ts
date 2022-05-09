import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { EnrollmentOptions } from '../../api/token';
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

  public enrolledToken: OATHEnrolledToken;

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: FormGroup;

  public showDetails = false;

  public ngOnInit() {
    this.enrollmentStep = this.formBuilder.group({
      'description': [$localize`Created via SelfService`, Validators.required],
    });
  }

  public enrollToken() {
    this.enrollmentStep.disable();
    const body: EnrollmentOptions = {
      type: this.data.tokenDisplayData.type,
      description: this.enrollmentStep.get('description').value,
    };

    this.enrollmentService.enroll(body).subscribe(token => {
      if (token) {
        this.enrolledToken = {
          url: token.googleurl.value,
          serial: token.serial,
          seed: token.otpkey.value,
        };
        this.stepper.next();
      } else {
        this.enrollmentStep.enable();
      }
    });
  }

  copyInputMessage(inputElement: HTMLInputElement) {
    inputElement.select();
    document.execCommand('copy');
    this.notificationService.message($localize`Copied`);
  }

}
