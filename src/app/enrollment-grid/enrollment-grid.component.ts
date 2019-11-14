import { Component, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';

import { I18n } from '@ngx-translate/i18n-polyfill';

import { Subject, Observable, EMPTY } from 'rxjs';
import { switchMap, filter, tap } from 'rxjs/operators';

import { TokenTypeDetails, TokenType, Token } from '../api/token';
import { TokenService } from '../api/token.service';

import { NotificationService } from '../common/notification.service';

import { EnrollOATHDialogComponent } from '../enroll/enroll-oath-dialog/enroll-oath-dialog.component';
import { EnrollPushDialogComponent } from '../enroll/enroll-push-dialog/enroll-push-dialog.component';
import { AssignTokenDialogComponent } from '../enroll/assign-token-dialog/assign-token-dialog.component';
import { TestOATHDialogComponent } from '../test/test-oath/test-oath-dialog.component';
import { TestChallengeResponseDialogComponent } from '../test/test-challenge-response/test-challenge-response-dialog.component';

@Component({
  selector: 'app-enrollment-grid',
  templateUrl: './enrollment-grid.component.html',
  styleUrls: ['./enrollment-grid.component.scss']
})
export class EnrollmentGridComponent implements OnInit {

  public tokenTypes: TokenTypeDetails[];
  @Output() public tokenUpdate: Subject<null> = new Subject();

  constructor(
    public dialog: MatDialog,
    private tokenService: TokenService,
    private notificationService: NotificationService,
    private i18n: I18n,
  ) { }

  public ngOnInit() {
    this.tokenTypes = this.tokenService.tokenTypeDetails.filter(t => t.enrollmentPermission);
  }

  public runEnrollmentWorkflow(tokenType: TokenTypeDetails) {
    if (![TokenType.HOTP, TokenType.TOTP, TokenType.PUSH, TokenType.ASSIGN].includes(tokenType.type)) {
      this.notificationService.message(this.i18n('The selected token type cannot be enrolled at the moment.'));
      return;
    }

    this.openEnrollmentDialog(tokenType)
      .pipe(
        tap(() => this.tokenUpdate.next()),
        filter(serial => !!serial),
        switchMap(serial => this.tokenService.getToken(serial)),
        tap(token => {
          if (!token) {
            this.notificationService.message(this.i18n('There was a problem starting the token test, please try again later.'));
          }
        }),
        filter(token => !!token),
        switchMap(token => this.openTestDialog(token))
      ).subscribe(() => this.tokenUpdate.next());
  }

  /**
   * opens the correct enrollment dialog for the given token type and returns
   * an observable to the dialog close event
   *
   * @private
   * @param {TokenTypeDetails} typeDetails
   * @returns {Observable<string>}
   * @memberof EnrollmentGridComponent
   */
  private openEnrollmentDialog(typeDetails: TokenTypeDetails): Observable<string> {
    const enrollmentConfig: MatDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
    };

    switch (typeDetails.type) {
      case TokenType.HOTP:
      case TokenType.TOTP:
        enrollmentConfig.data = { tokenTypeDetails: typeDetails };
        return this.dialog.open(EnrollOATHDialogComponent, enrollmentConfig).afterClosed();
      case TokenType.PUSH:
        return this.dialog.open(EnrollPushDialogComponent, enrollmentConfig).afterClosed();
      case TokenType.ASSIGN:
        return this.dialog.open(AssignTokenDialogComponent, enrollmentConfig).afterClosed();
    }
  }

  /**
   * opens the correct testing / activation dialog for the given token type
   * and returns an observable to the dialog close event
   *
   * @private
   * @param {Token} token
   * @returns {Observable<any>}
   * @memberof EnrollmentGridComponent
   */
  private openTestDialog(token: Token): Observable<boolean> {
    const testConfig: MatDialogConfig = {
      width: '650px',
      data: { token: token }
    };

    switch (token.typeDetails.type) {
      case TokenType.HOTP:
      case TokenType.TOTP:
        return EMPTY; // this decativates the token test for tokens that don't need the activation.
        return this.dialog.open(TestOATHDialogComponent, testConfig).afterClosed();
      case (TokenType.PUSH):
        return this.dialog.open(TestChallengeResponseDialogComponent, testConfig).afterClosed();
    }
  }

}
