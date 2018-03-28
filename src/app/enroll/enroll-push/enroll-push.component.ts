import { Component, OnInit } from '@angular/core';

import { NgForm, FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatStepper, MatSnackBar } from '@angular/material';
import { MaterialModule } from '../../material.module';

import { EnrollToken, Token } from '../../token';
import { TokenService } from '../../token.service';
import { NotificationService } from '../../core/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enroll-push',
  templateUrl: './enroll-push.component.html',
  styleUrls: ['./enroll-push.component.scss']
})
export class EnrollPushComponent implements OnInit {

  enrollmentForm: FormGroup;
  enrollmentStep: FormGroup;

  isPaired: boolean;

  public enrolledToken: { serial: string, url: string };

  constructor(
    private tokenService: TokenService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.enrollmentForm = this.formBuilder.group({
      'description': ['', Validators.required],
      'type': 'push',
    });
    this.enrollmentStep = this.formBuilder.group({
      'tokenEnrolled': ['', Validators.required],
    });
  }

  goToTokenInfo(stepper: MatStepper) {
    if (!this.enrolledToken) {
      this.tokenService.enroll(this.enrollmentForm.value).subscribe(response => {
        if (response.result && response.result.value === true) {
          this.enrolledToken = {
            url: response.detail.lse_qr_url.value,
            serial: response.detail.serial
          };

          this.enrollmentForm.controls.description.disable();
          this.enrollmentStep.controls.tokenEnrolled.setValue(true);

          this.tokenService.pairingPoll(this.enrolledToken.serial).subscribe(data => {
            this.isPaired = true;
            stepper.selectedIndex = 2;
          });

          stepper.next();

        } else {
          this.notificationService.message('There was a problem while enrolling the new token. Please try again.');
        }
      });
    } else {
      stepper.next();
    }
  }

  goToActivation() {
    this.router.navigate(['/tokens', this.enrolledToken.serial, 'activate']);
  }
}
