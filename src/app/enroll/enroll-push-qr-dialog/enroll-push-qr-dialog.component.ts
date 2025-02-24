import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

import { switchMap } from 'rxjs/operators';

import { ActivateDialogComponent } from '@app/activate/activate-dialog.component';
import { EnrollDialogBase, EnrolledToken } from '@app/enroll/enroll-dialog-base.directive';
import { TextResources } from '@common/static-resources';


interface PushQrEnrolledToken extends EnrolledToken {
  url: string;
}
@Component({
  selector: 'app-enroll-push',
  templateUrl: './enroll-push-qr-dialog.component.html',
  styleUrls: ['./enroll-push-qr-dialog.component.scss']
})
export class EnrollPushQRDialogComponent extends EnrollDialogBase implements OnInit {

  public TextResources = TextResources;
  public enrolledToken: PushQrEnrolledToken;

  public closeLabel = $localize`Activate`;

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: UntypedFormGroup;

  public ngOnInit() {
    this.enrollmentStep = this.formBuilder.group({
      'description': [$localize`Created via SelfService`, Validators.required],
      'type': this.tokenDisplayData.type,
    });
    super.ngOnInit();
  }

  /**
   * Enroll the token and proceed to the next step
   */
  enrollQRToken() {
    this.enrollmentStep.disable();
    this.enrollmentService.enroll(this.enrollmentStep.value).subscribe(token => {
      if (token) {
        this.enrolledToken = {
          url: token.lse_qr_url.value,
          serial: token.serial,
          type: this.tokenDisplayData.type
        };
        this.subscriptions.push(this.enrollmentService.pairingPoll(this.enrolledToken.serial).subscribe(() => {
          this.stepper.next();
        }));
        this.stepper.next();
      } else {
        this.enrollmentStep.enable();
      }
    });
  }

  public finalizeEnrollment() {
    const testConfig: MatDialogConfig = {
      width: '650px',
      data: { serial: this.enrolledToken.serial, type: this.enrolledToken.type }
    };
    this.dialogRef.afterClosed().pipe(
      switchMap(() => this.dialog.open(ActivateDialogComponent, testConfig).afterClosed())
    ).subscribe();
    this.close();
  }
}
