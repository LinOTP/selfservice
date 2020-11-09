import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { EnrollToken } from '../../api/token';
import { Permission } from '../../common/permissions';
import { SetPinDialogComponent } from '../../common/set-pin-dialog/set-pin-dialog.component';
import { UserInfo, UserSystemInfo } from '../../system.service';
import { EnrollDialogBaseComponent } from '../enroll-dialog-base.component';


@Component({
  selector: 'app-enroll-email',
  templateUrl: './enroll-email-dialog.component.html',
  styleUrls: ['./enroll-email-dialog.component.scss']
})
export class EnrollEmailDialogComponent extends EnrollDialogBaseComponent implements OnInit {

  public Permission = Permission;

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: FormGroup;
  public testStep: FormGroup;

  public pinSet: boolean;
  public showDetails = false;

  public canEditEmail: boolean;
  public userEmail: string;

  public ngOnInit() {
    const userData: UserInfo = JSON.parse(localStorage.getItem('user'));
    const settings: UserSystemInfo['settings'] = JSON.parse(localStorage.getItem('settings'));
    this.canEditEmail = settings.edit_email === undefined || Boolean(settings.edit_email);
    this.userEmail = userData.email;

    this.enrollmentStep = this.formBuilder.group({
      'description': [$localize`Created via SelfService`, Validators.required],
    });
    if (this.canEditEmail) {
      this.enrollmentStep.addControl('emailAddress', this.formBuilder.control(this.userEmail, Validators.required));
    }
    this.testStep = this.formBuilder.group({
      'otp': ['', Validators.required],
      'pin': ''
    });
  }

  public enrollToken() {
    this.enrollmentStep.disable();
    const description = this.enrollmentStep.get('description').value;
    const emailAddress = this.canEditEmail ? this.enrollmentStep.get('emailAddress').value : this.userEmail;
    const body: EnrollToken = {
      type: this.data.tokenTypeDetails.type,
      description: `${description} - ${emailAddress}`,
      email_address: emailAddress,
    };

    this.enrollmentService.enroll(body).subscribe(response => {
      const serial = response?.result?.value && response?.detail?.serial;
      if (serial) {
        this.enrolledToken = { serial: serial };
        this.stepper.next();
      }
      this.enrollmentStep.enable();
    });
  }

  public setPin() {
    const config = {
      width: '25em',
      data: { serial: this.enrolledToken.serial },
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
}
