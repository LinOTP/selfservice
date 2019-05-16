import { Component, OnInit, Inject } from '@angular/core';
import { TokenService } from '../../api/token.service';
import { Token } from '../../api/token';
import { MAT_DIALOG_DATA, MatDialogRef, MatStepper } from '@angular/material';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs/index';

@Component({
  selector: 'app-token-activate-push',
  templateUrl: './token-activate-push-dialog.component.html',
  styleUrls: ['./token-activate-push-dialog.component.scss']
})
export class TokenActivatePushDialogComponent implements OnInit {
  public waitingForResponse: boolean;
  public readonly maxSteps: number = 2;
  public currentStep: number;
  public restartDialog: boolean;
  public token: Token;

  constructor(
    private tokenService: TokenService,
    private dialogRef: MatDialogRef<TokenActivatePushDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public tokenSerial: string,
  ) {
  }

  public ngOnInit() {
    this.waitingForResponse = false;
    this.currentStep = 1;
    this.tokenService.getToken(this.tokenSerial).subscribe((nonActivatedPushToken: Token) => {
      this.token = nonActivatedPushToken;
    });
  }

  public activateToken(stepper: MatStepper): void {
    const pin = '';

    this.restartDialog = false;
    this.waitingForResponse = true;
    this.incrementStep(stepper);

    this.tokenService.activate(this.token.serial, pin).pipe(
      map(response => response.detail.transactionId),
      switchMap(transactionId => this.tokenService.challengePoll(transactionId, pin, this.token.serial)
      ),
      catchError(this.handleError('token activation', false)),
    ).subscribe((res: boolean) => {
      if (res) {
        this.waitingForResponse = false;
      } else {
        this.waitingForResponse = false;
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
    this.dialogRef.close();
  }

  /**
   * Increment the current step of the dialog for the view
   */
  public incrementStep(stepper: MatStepper) {
    stepper.next();
    this.currentStep++;
  }

  /**
   * Resets the dialog to the initial state and
   * alows to restart the activation process
   */
  public resetDialogToInitial(stepper: MatStepper) {
    stepper.reset();
    this.currentStep = 1;
  }

}
