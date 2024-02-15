import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

import { EnrollmentOptions } from '@api/token';
import { EnrollDialogBaseComponent, EnrolledToken } from '@app/enroll/enroll-dialog-base.component';
import { CurrentPlatform, PlatformProviderService } from '../../common/platform-provider.service';

interface OATHEnrolledToken extends EnrolledToken {
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
  public enrollmentStep: UntypedFormGroup;

  public showDetails = false;
  private platformProvider = inject(PlatformProviderService)
  currentPlatform: CurrentPlatform = null

  public ngOnInit() {
    this.enrollmentStep = this.formBuilder.group({
      'description': [$localize`Created via SelfService`, Validators.required],
    });
    this.currentPlatform = this.platformProvider.platform
    super.ngOnInit();
  }

  public enrollToken() {
    this.enrollmentStep.disable();
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: this.enrollmentStep.get('description').value,
    };

    this.enrollmentService.enroll(body).subscribe(token => {
      if (token) {
        this.enrolledToken = {
          url: token.googleurl.value,
          serial: token.serial,
          seed: token.otpkey.value,
          type: this.tokenDisplayData.type,
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
