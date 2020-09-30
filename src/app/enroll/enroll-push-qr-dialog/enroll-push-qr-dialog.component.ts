import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

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

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: FormGroup;

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
  ) { }

  public ngOnInit() {
    this.enrollmentStep = this.formBuilder.group({
      'description': [$localize`Created via SelfService`, Validators.required],
      'type': this.data.tokenTypeDetails.type,
    });
  }

  /**
   * Enroll the push token and proceed to the next step
   */
  enrollToken() {
    this.enrollmentStep.disable();
    this.enrollmentService.enroll<QRCodeEnrollmentDetail>(this.enrollmentStep.value).subscribe(response => {
      if (response.result && response.result.value === true) {
        this.enrolledToken = {
          url: response.detail.lse_qr_url.value,
          serial: response.detail.serial
        };

        this.enrollmentService.pairingPoll(this.enrolledToken.serial).subscribe(data => {
          this.stepper.next();
        });

        this.stepper.next();

      } else {
        this.notificationService.message($localize`There was a problem while creating the new token. Please try again.`);
      }
      this.enrollmentStep.enable();
    });
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
    const deletionText = $localize`The incomplete token will be deleted.`;

    const unusableTokenText = $localize`The incomplete token will not be ready for use.`;

    const restartText = $localize`You will have to restart the setup process in order to use this type of token.`;

    let canDelete: boolean;

    from(this.permissionsService.hasPermission(Permission.DELETE)).pipe(
      tap(res => canDelete = res),
      switchMap(() => {
        const dialogConfig = {
          width: '25em',
          autoFocus: false,
          disableClose: true,
          data: {
            title: $localize`Stop setting up your new token?`,
            text: `${canDelete ? deletionText : unusableTokenText} ${restartText}`,
            confirmationLabel: $localize`Confirm`,
          }
        };
        return this.dialog.open(DialogComponent, dialogConfig).afterClosed();
      }),
      switchMap((confirmed) => {
        if (confirmed && canDelete) {
          return this.operationsService.deleteToken(this.enrolledToken.serial).pipe(
            tap(response => {
              if (response) {
                this.notificationService.message($localize`Incomplete token was deleted`);
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
