import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

import { I18n } from '@ngx-translate/i18n-polyfill';

import { switchMap, tap, map, filter } from 'rxjs/operators';
import { from, of } from 'rxjs';

import { EnrollmentService, QRCodeEnrollmentDetail } from '../../api/enrollment.service';
import { TokenTypeDetails } from '../../api/token';
import { NotificationService } from '../../common/notification.service';
import { TextResources } from '../../common/static-resources';
import { DialogComponent } from '../../common/dialog/dialog.component';
import { OperationsService } from '../../api/operations.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Permission } from '../../common/permissions';

@Component({
  selector: 'app-enroll-push',
  templateUrl: './enroll-push-qr-dialog.component.html',
  styleUrls: ['./enroll-push-qr-dialog.component.scss']
})
export class EnrollPushQRDialogComponent implements OnInit {

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
    public permissionsService: NgxPermissionsService,
    private dialogRef: MatDialogRef<EnrollPushQRDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { tokenTypeDetails: TokenTypeDetails },
    private i18n: I18n,
  ) { }

  public ngOnInit() {
    this.currentStep = 1;
    this.enrollmentForm = this.formBuilder.group({
      'description': [this.i18n('Created via SelfService'), Validators.required],
      'type': this.data.tokenTypeDetails.type,
    });
    this.enrollmentStep = this.formBuilder.group({
      'tokenEnrolled': ['', Validators.required],
    });
  }

  /**
   * Enroll the push token and proceed to the next step
   */
  goToTokenInfo(stepper: MatStepper) {
    this.enrollmentService.enroll<QRCodeEnrollmentDetail>(this.enrollmentForm.value).subscribe(response => {
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
        this.notificationService.message(this.i18n('There was a problem while creating the new token. Please try again.'));
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
    const deletionText = this.i18n('The incomplete token will be deleted.');

    const unusableTokenText = this.i18n('The incomplete token will not be ready for use.');

    const restartText = this.i18n('You will have to restart the setup process in order to use this type of token.');

    let canDelete: boolean;

    from(this.permissionsService.hasPermission(Permission.DELETE)).pipe(
      tap(res => canDelete = res),
      switchMap(() => {
        const dialogConfig = {
          width: '25em',
          autoFocus: false,
          disableClose: true,
          data: {
            title: this.i18n('Stop setting up your new token?'),
            text: `${canDelete ? deletionText : unusableTokenText} ${restartText}`,
            confirmationLabel: this.i18n('Confirm'),
          }
        };
        return this.dialog.open(DialogComponent, dialogConfig).afterClosed();
      }),
      switchMap((confirmed) => {
        if (confirmed && canDelete) {
          return this.operationsService.deleteToken(this.enrolledToken.serial).pipe(
            tap(response => {
              if (response) {
                this.notificationService.message(this.i18n('Incomplete token was deleted'));
              }
            }),
            map(() => true), // we just want to pass along whether the user confirmed the cancelation
          );
        } else {
          return of(!!confirmed);
        }
      }),
      filter(confirmed => confirmed),
    ).subscribe(() => {
      this.dialogRef.close();
    });
  }
}
