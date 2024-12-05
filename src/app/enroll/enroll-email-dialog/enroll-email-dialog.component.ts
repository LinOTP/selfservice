import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

import { EnrollmentOptions, TokenType } from '@api/token';
import { EnrollDialogBaseComponent } from '@app/enroll/enroll-dialog-base.component';
import { UserInfo, UserSystemInfo } from '@app/system.service';
import { Permission } from "@common/permissions";
import { from, map } from "rxjs";
import { $localize } from "@angular/localize/init";


@Component({
  selector: 'app-enroll-email',
  templateUrl: './enroll-email-dialog.component.html',
  styleUrls: ['./enroll-email-dialog.component.scss']
})
export class EnrollEmailDialogComponent extends EnrollDialogBaseComponent implements OnInit {
  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: UntypedFormGroup;
  public canEditEmail: boolean;
  public userEmail: string;
  private _verifyPolicyEnabled: boolean;
  private _setOtpPinPolicyEnabled: boolean;
  protected isTokenVerified: boolean = false;

  public ngOnInit() {
    const userData: UserInfo = JSON.parse(localStorage.getItem('user'));
    const settings: UserSystemInfo['settings'] = JSON.parse(localStorage.getItem('settings'));
    this.canEditEmail = settings.edit_email === undefined || Boolean(settings.edit_email);
    this.userEmail = userData.email;

    this.enrollmentStep = this.formBuilder.group({
      'description': [$localize`Created via SelfService`, Validators.required],
    });
    if (this.canEditEmail) {
      this.enrollmentStep.addControl('emailAddress', this.formBuilder.control(this.userEmail, [Validators.required, Validators.email]));
    }
    this._getPermissions().subscribe((hasPermissions) => {
      this._verifyPolicyEnabled = hasPermissions.verify;
      this._setOtpPinPolicyEnabled = hasPermissions.setPin;
    })
    super.ngOnInit();
  }

  public enrollToken() {
    this.enrollmentStep.disable();
    const description = this.enrollmentStep.get('description').value;
    const emailAddress = this.canEditEmail ? this.enrollmentStep.get('emailAddress').value : this.userEmail;
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: `${description} - ${emailAddress}`,
      email_address: emailAddress,
    };

    this.enrollmentService.enroll(body).subscribe(token => {
      if (token?.serial) {
        this.enrolledToken = { serial: token.serial, type: TokenType.EMAIL };
        this.stepper.steps.get(0).completed = true;
        this.stepper.next();
      } else {
        this.enrollmentStep.enable();
      }
    });
  }

  private _getPermissions() {
    const verify = this.permissionsService.hasPermission(Permission.VERIFY)
    const setPin = this.permissionsService.hasPermission(Permission.SETPIN)
    return from(Promise.all([verify, setPin])).pipe(
      map(([verify, setPin]) => ({ verify, setPin }))
    )
  }

  get verifyPolicyEnabled(): boolean {
    return this._verifyPolicyEnabled;
  }

  get setOtpPinPolicyEnabled(): boolean {
    return this._setOtpPinPolicyEnabled;
  }

}
