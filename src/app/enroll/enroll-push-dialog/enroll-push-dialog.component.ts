import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

import { I18n } from '@ngx-translate/i18n-polyfill';

import { switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

import { EnrollmentService, PushEnrollmentDetail } from '../../api/enrollment.service';
import { TokenType } from '../../api/token';
import { NotificationService } from '../../common/notification.service';
import { TextResources } from '../../common/static-resources';
import { DialogComponent } from '../../common/dialog/dialog.component';
import { OperationsService } from '../../api/operations.service';

@Component({
  selector: 'app-enroll-push',
  templateUrl: './enroll-push-dialog.component.html',
  styleUrls: ['./enroll-push-dialog.component.scss']
})
export class EnrollPushDialogComponent implements OnInit {

  public TextResources = TextResources;

  public enrollmentForm: FormGroup;
  public enrollmentStep: FormGroup;

  public isPaired: boolean;
  public readonly maxSteps: number = 3;
  public currentStep: number;

  public enrolledToken: { serial: string, url: string };

  constructor(
    private enrollmentService: EnrollmentService,
    private operationsService: OperationsService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private dialogRef: MatDialogRef<EnrollPushDialogComponent>,
    private dialog: MatDialog,
    private i18n: I18n,
  ) {
  }

  public ngOnInit() {
    this.currentStep = 1;
    this.enrollmentForm = this.formBuilder.group({
      'description': ['', Validators.required],
      'type': TokenType.PUSH,
    });
    this.enrollmentStep = this.formBuilder.group({
      'tokenEnrolled': ['', Validators.required],
    });
  }

  /**
   * Enroll the push token and proceed to the next step
   */
  goToTokenInfo(stepper: MatStepper) {
    this.enrollmentService.enroll<PushEnrollmentDetail>(this.enrollmentForm.value).subscribe(response => {
      if (response.result && response.result.value === true) {
        this.enrolledToken = {
          url: response.detail.lse_qr_url.value,
          serial: response.detail.serial
        };

        this.enrollmentForm.controls.description.disable();
        this.enrollmentStep.controls.tokenEnrolled.setValue(true);

        this.enrollmentService.pairingPoll(this.enrolledToken.serial).subscribe(data => {
          this.isPaired = true;
          this.currentStep++;
          stepper.selectedIndex = 2;
        });

        this.incrementStep(stepper);

      } else {
        this.notificationService.message(this.i18n('There was a problem while enrolling the new token. Please try again.'));
      }
    });
  }

  /**
   * Increment the current step of the dialog for the view
   */
  public incrementStep(stepper: MatStepper) {
    stepper.next();
    this.currentStep++;
  }

  /**
  * Close the enrollment dialog without further action.
  */
  public close() {
    this.dialogRef.close();
  }

  /**
  * Close the enrollment dialog and return the serial of the enrolled token.
  */
  public closeAndReturnSerial() {
    this.dialogRef.close(this.enrolledToken.serial);
  }

  /**
   *  Show the user a confirmation dialog for canceling the enrollment of the push token.
   *
   *  If the user confirms it, the enrolled token is deleted, a notification is shown and the
   *  enrollment dialog is closed.
   */
  public cancel() {
    const dialogConfig = {
      width: '25em',
      autoFocus: false,
      disableClose: true,
      data: {
        title: this.i18n('Stop enrollment?'),
        text: this.i18n('The incomplete token will be deleted.') + ' ' +
          this.i18n('You will have to restart the enrollment process in order to use this type of token.'),
        confirmationLabel: this.i18n('Confirm'),
      }
    };
    this.dialog.open(DialogComponent, dialogConfig)
      .afterClosed()
      .pipe(
        switchMap(result => {
          if (result) {
            return this.operationsService.deleteToken(this.enrolledToken.serial);
          } else {
            return EMPTY;
          }
        })
      ).subscribe(() => {
        this.notificationService.message(this.i18n('Incomplete Push token was deleted'));
        this.dialogRef.close();
      });
  }
}
