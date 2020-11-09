import { OnDestroy, Inject, Component } from '@angular/core';

import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { switchMap, tap, map, filter } from 'rxjs/operators';
import { from, of, Subscription } from 'rxjs';

import { NgxPermissionsService } from 'ngx-permissions';
import { Permission } from '../common/permissions';
import { EnrollmentService } from '../api/enrollment.service';
import { FormBuilder } from '@angular/forms';
import { NotificationService } from '../common/notification.service';
import { TokenTypeDetails } from '../api/token';
import { DialogComponent } from '../common/dialog/dialog.component';
import { OperationsService } from '../api/operations.service';
import { SetPinDialogComponent } from '../common/set-pin-dialog/set-pin-dialog.component';


export interface EnrolledToken {
  serial: string;
}
@Component({
  template: '',
})
export abstract class EnrollDialogBaseComponent implements OnDestroy {
  protected pairingSubscription: Subscription;
  public enrolledToken: EnrolledToken;

  constructor(
    protected dialogRef: MatDialogRef<ThisType<EnrollDialogBaseComponent>>,
    protected permissionsService: NgxPermissionsService,
    protected enrollmentService: EnrollmentService,
    protected formBuilder: FormBuilder,
    protected notificationService: NotificationService,
    protected operationsService: OperationsService,
    protected dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { tokenTypeDetails: TokenTypeDetails, closeLabel?: String }
  ) { }

  public ngOnDestroy() {
    if (this.pairingSubscription) {
      this.pairingSubscription.unsubscribe();
    }
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
        if (this.enrolledToken && confirmed && canDelete) {
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

  public setPin() {
    const config = {
      width: '25em',
      data: this.enrolledToken
    };
    this.dialog
      .open(SetPinDialogComponent, config)
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.notificationService.message($localize`PIN set`);
        }
      });
  }

}
