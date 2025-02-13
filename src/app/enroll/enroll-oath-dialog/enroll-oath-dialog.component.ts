import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';

import { EnrollmentOptions } from '@api/token';
import { EnrollDialogBase, EnrolledToken } from '@app/enroll/enroll-dialog-base.directive';
import { CurrentPlatform, PlatformProviderService } from '../../common/platform-provider.service';

export interface OATHEnrolledToken extends EnrolledToken {
  url: string;
  seed: string;
}

@Component({
  selector: 'app-enroll-oath',
  templateUrl: './enroll-oath-dialog.component.html',
  styleUrls: ['./enroll-oath-dialog.component.scss'],
  providers: [PlatformProviderService]
})
export class EnrollOATHDialogComponent extends EnrollDialogBase implements OnInit {

  public enrolledToken: OATHEnrolledToken;

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public get tokenVerified() {
    return this._tokenVerified;
  }
  public set tokenVerified(value) {
    this._tokenVerified = value;

    if (value && this.selectedStep === 2 && this.verifyPolicyEnabled) {
      setTimeout(() => {
        this.stepper.next();
      }, 100)
    }
  }
  private _tokenVerified = false;
  private platformProvider = inject(PlatformProviderService)
  currentPlatform: CurrentPlatform = null
  selectedStep = 0

  public ngOnInit() {
    this.currentPlatform = this.platformProvider.platform
    this.subscriptions.push(this.stepper.selectionChange.subscribe((step) => {
      this.selectedStep = step.selectedIndex;
    }));
    super.ngOnInit();
  }

  public enrollOATHToken() {
    if (this.createTokenForm.invalid) {
      return;
    }
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: this.createTokenForm.get('description').value,
    };
    if (this.setOtpPinPolicyEnabled) {
      body.otppin = this.createTokenForm.get('otpPin').get('pin').value;
    }

    this.createTokenForm.disable();

    this.awaitingResponse = true;
    this.enrollmentService.enroll(body).subscribe(token => {
      this.awaitingResponse = false;
      this.createTokenForm.enable();
      if (token) {
        this.enrolledToken = {
          url: token.googleurl.value,
          serial: token.serial,
          seed: token.otpkey.value,
          type: this.tokenDisplayData.type,
          description: body.description,
        };

        // need to wait for the step complete state to be updated and then move to the next step
        // using 100 ms make animation smoother
        setTimeout(() => {
          this.stepper.next();
        }, 100)
      }
    });
  }
}
