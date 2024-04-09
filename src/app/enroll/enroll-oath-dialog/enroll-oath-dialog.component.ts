import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';

import { EnrollmentOptions } from '@api/token';
import { Permission } from '@app/common/permissions';
import { EnrollDialogBaseComponent, EnrolledToken } from '@app/enroll/enroll-dialog-base.component';
import { CurrentPlatform, PlatformProviderService } from '../../common/platform-provider.service';
import { getCreateTokenStepForm } from './oath-enrollment/create-token-step.component';

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
export class EnrollOATHDialogComponent extends EnrollDialogBaseComponent implements OnInit {

  public enrolledToken: OATHEnrolledToken;

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public createTokenForm = getCreateTokenStepForm();
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
  awaitingResponse = false
  verifyPolicyEnabled = false

  public ngOnInit() {
    this.permissionsService.hasPermission(Permission.VERIFY).then((hasPermission) => {
      this.verifyPolicyEnabled = hasPermission;
    });
    this.currentPlatform = this.platformProvider.platform
    this.subscriptions.push(this.stepper.selectionChange.subscribe((step) => {
      this.selectedStep = step.selectedIndex;
    }));
    super.ngOnInit();
  }

  public enrollToken() {
    if (this.createTokenForm.invalid) {
      return;
    }
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: this.createTokenForm.get('description').value,
      otppin: this.createTokenForm.get('pin').value,
    };
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
