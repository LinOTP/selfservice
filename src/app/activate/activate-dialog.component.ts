import { Component, OnInit, Inject } from '@angular/core';
import { EnrollmentService } from '../api/enrollment.service';
import { Token, EnrollmentStatus, TokenType } from '../api/token';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-activate-dialog',
  templateUrl: './activate-dialog.component.html',
  styleUrls: ['./activate-dialog.component.scss']
})
export class ActivateDialogComponent implements OnInit {
  public waitingForResponse: boolean;
  public restartDialog: boolean;

  public isActivation = false;
  public isQR = false;
  public isPush = false;

  public transactionId: string = null;
  public tokenQRUrl: string = null;
  public pin = '';

  public result = null;

  constructor(
    private enrollmentService: EnrollmentService,
    private i18n: I18n,
    private dialogRef: MatDialogRef<ActivateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { token: Token },
  ) {
    if (data.token.enrollmentStatus !== EnrollmentStatus.COMPLETED) {
      this.isActivation = true;
    }
    if (data.token.typeDetails.type === TokenType.PUSH) {
      this.isPush = true;
    }
    if (data.token.typeDetails.type === TokenType.QR) {
      this.isQR = true;
    }
  }

  public ngOnInit() {
    this.waitingForResponse = false;
  }

  public activateToken(stepper: MatStepper): void {

    this.restartDialog = false;
    this.waitingForResponse = true;
    this.result = null;

    stepper.next();

    this.enrollmentService.activate(this.data.token.serial, this.pin).pipe(
      map(response => response.detail),
      tap(detail => {
        this.transactionId = detail.transactionid.toString().slice(0, 6);
        if (this.data.token.typeDetails.type === TokenType.QR) {
          this.tokenQRUrl = detail.message;
        }
      }),
      switchMap(detail => this.enrollmentService.challengePoll(detail.transactionid, this.pin, this.data.token.serial)),
      catchError(this.handleError('token activation', false)),
    ).subscribe((res: { accept?: boolean, reject?: boolean, valid_tan?: boolean }) => {
      this.waitingForResponse = false;
      if (res.accept === true || res.reject === true || res.valid_tan === true) {
        this.result = res;
        this.restartDialog = false;
      } else {
        this.restartDialog = true;
      }
    });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      return of(result as T);
    };
  }

  public cancelDialog() {
    this.dialogRef.close(false);
  }

  public closeDialog() {
    this.dialogRef.close(true);
  }

  /**
   * Resets the dialog to the initial state and
   * alows to restart the activation process
   */
  public resetDialogToInitial(stepper: MatStepper) {
    stepper.reset();
  }

}
