import { Component, OnInit, Inject } from '@angular/core';
import { TokenService } from '../../api/token.service';
import { Token, EnrollmentStatus, TokenType } from '../../api/token';
import { MAT_DIALOG_DATA, MatDialogRef, MatStepper } from '@angular/material';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs/index';

@Component({
  selector: 'app-test-push',
  templateUrl: './test-challenge-response-dialog.component.html',
  styleUrls: ['./test-challenge-response-dialog.component.scss']
})
export class TestChallengeResponseDialogComponent implements OnInit {
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
    private tokenService: TokenService,
    private dialogRef: MatDialogRef<TestChallengeResponseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { token: Token },
  ) {
    if (data.token.enrollmentStatus !== EnrollmentStatus.COMPLETED) {
      this.isActivation = true;
    }
    if (data.token.type === TokenType.PUSH) {
      this.isPush = true;
    }
    if (data.token.type === TokenType.QR) {
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

    this.tokenService.activate(this.data.token.serial, this.pin).pipe(
      map(response => response.detail),
      tap(detail => {
        this.transactionId = detail.transactionid.toString().slice(0, 6);
        if (this.data.token.type === TokenType.QR) {
          this.tokenQRUrl = detail.message;
        }
      }),
      switchMap(detail => this.tokenService.challengePoll(detail.transactionid, this.pin, this.data.token.serial)),
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