import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { EnrollToken } from '../../api/token';
import { UserInfo, UserSystemInfo } from '../../system.service';
import { EnrollDialogBaseComponent } from '../enroll-dialog-base.component';

@Component({
  selector: 'app-enroll-sms',
  templateUrl: './enroll-sms-dialog.component.html',
  styleUrls: ['./enroll-sms-dialog.component.scss']
})
export class EnrollSMSDialogComponent extends EnrollDialogBaseComponent implements OnInit {

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: FormGroup;

  public showDetails = false;

  public canEditPhone: boolean;
  public userPhone: string;

  public ngOnInit() {
    const userData: UserInfo = JSON.parse(localStorage.getItem('user'));
    const settings: UserSystemInfo['settings'] = JSON.parse(localStorage.getItem('settings'));
    this.canEditPhone = settings.edit_sms === undefined || Boolean(settings.edit_sms);
    this.userPhone = userData.mobile;

    this.enrollmentStep = this.formBuilder.group({
      'description': [$localize`Created via SelfService`, Validators.required],
    });
    if (this.canEditPhone) {
      this.enrollmentStep.addControl('phoneNumber', this.formBuilder.control(this.userPhone, Validators.required));
    }
  }

  public enrollToken() {
    this.enrollmentStep.disable();
    const description = this.enrollmentStep.get('description').value;
    const phoneNumber = this.canEditPhone ? this.enrollmentStep.get('phoneNumber').value : this.userPhone;
    const body: EnrollToken = {
      type: this.data.tokenTypeDetails.type,
      description: `${description} - ${phoneNumber}`,
      phone: phoneNumber,
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
}
