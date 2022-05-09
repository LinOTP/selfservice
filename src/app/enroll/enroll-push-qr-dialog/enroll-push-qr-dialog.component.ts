import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { TextResources } from '../../common/static-resources';
import { EnrollDialogBaseComponent, EnrolledToken } from '../enroll-dialog-base.component';


interface PushQrEnrolledToken extends EnrolledToken {
  url: string;
}
@Component({
  selector: 'app-enroll-push',
  templateUrl: './enroll-push-qr-dialog.component.html',
  styleUrls: ['./enroll-push-qr-dialog.component.scss']
})
export class EnrollPushQRDialogComponent extends EnrollDialogBaseComponent implements OnInit {

  public TextResources = TextResources;
  public enrolledToken: PushQrEnrolledToken;

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: FormGroup;

  public ngOnInit() {
    this.enrollmentStep = this.formBuilder.group({
      'description': [$localize`Created via SelfService`, Validators.required],
      'type': this.data.tokenDisplayData.type,
    });
  }

  /**
   * Enroll the token and proceed to the next step
   */
  enrollToken() {
    this.enrollmentStep.disable();
    this.enrollmentService.enroll(this.enrollmentStep.value).subscribe(token => {
      if (token) {
        this.enrolledToken = {
          url: token.lse_qr_url.value,
          serial: token.serial
        };
        this.pairingSubscription = this.enrollmentService.pairingPoll(this.enrolledToken.serial).subscribe(() => {
          this.stepper.next();
        });
        this.stepper.next();
      } else {
        this.enrollmentStep.enable();
      }
    });
  }

}
