import { Component, OnInit, Inject } from '@angular/core';
import { TokenService } from '../../api/token.service';
import { Token } from '../../api/token';
import { MAT_DIALOG_DATA, MatDialogRef, MatStepper } from '@angular/material';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs/index';

@Component({
  selector: 'app-test-push',
  templateUrl: './test-push-dialog.component.html',
  styleUrls: ['./test-push-dialog.component.scss']
})
export class TestPushDialogComponent implements OnInit {
  public waitingForResponse: boolean;
  public readonly maxSteps: number = 2;
  public currentStep: number;
  public restartDialog: boolean;
  public isActivation: boolean = false;
  public transactionId: string = null;

  constructor(
    private tokenService: TokenService,
    private dialogRef: MatDialogRef<TestPushDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { token: Token, activate?: boolean },
  ) {
    if (data.activate) {
      this.isActivation = true;
    }
  }

  public ngOnInit() {
    this.waitingForResponse = false;
    this.currentStep = 1;
  }

  public activateToken(stepper: MatStepper): void {
    const pin = '';

    this.restartDialog = false;
    this.waitingForResponse = true;
    this.incrementStep(stepper);

    this.tokenService.activate(this.data.token.serial, pin).pipe(
      map(response => response.detail.transactionid),
      tap(transactionId => this.transactionId = transactionId.toString().slice(0, 6)),
      switchMap(transactionId => this.tokenService.challengePoll(transactionId, pin, this.data.token.serial)),
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
