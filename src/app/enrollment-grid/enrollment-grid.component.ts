import { Component, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';

import { Subject } from 'rxjs';
import { switchMap, filter, tap } from 'rxjs/operators';

import { TokenTypeDetails, tokenTypeDetails, TokenType, Token } from '../api/token';
import { TokenService } from '../api/token.service';

import { NotificationService } from '../common/notification.service';

import { EnrollOATHDialogComponent } from '../enroll/enroll-oath-dialog/enroll-oath-dialog.component';
import { EnrollPushDialogComponent } from '../enroll/enroll-push-dialog/enroll-push-dialog.component';
import { TestOATHDialogComponent } from '../test/test-oath/test-oath-dialog.component';
import { TestChallengeResponseDialogComponent } from '../test/test-challenge-response/test-challenge-response-dialog.component';

@Component({
  selector: 'app-enrollment-grid',
  templateUrl: './enrollment-grid.component.html',
  styleUrls: ['./enrollment-grid.component.scss']
})
export class EnrollmentGridComponent implements OnInit {

  public tokenTypes: TokenTypeDetails[] = tokenTypeDetails.filter(t => t.enrollmentPermission);
  @Output() public tokenUpdate: Subject<null> = new Subject();

  constructor(
    public dialog: MatDialog,
    private tokenService: TokenService,
    private notificationService: NotificationService,
  ) { }

  public ngOnInit() { }

  public runEnrollmentWorkflow(tokenType: TokenTypeDetails) {
    if (![TokenType.HOTP, TokenType.TOTP, TokenType.PUSH].includes(tokenType.type)) {
      this.notificationService.message('The selected token type cannot be enrolled at the moment.');
      return;
    }

    this.openEnrollmentDialog(tokenType).afterClosed()
      .pipe(
        tap(() => this.tokenUpdate.next()),
        filter(serial => !!serial),
        switchMap(serial => this.tokenService.getToken(serial)),
        tap(token => {
          if (!token) {
            this.notificationService.message('There was a problem starting the token test, please try manually later.');
          }
        }),
        filter(token => !!token),
        switchMap(token => this.openTestDialog(token).afterClosed())
      ).subscribe(() => this.tokenUpdate.next());
  }

  private openEnrollmentDialog(typeDetails: TokenTypeDetails): MatDialogRef<EnrollOATHDialogComponent | EnrollPushDialogComponent> {
    const enrollmentConfig: MatDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
    };

    switch (typeDetails.type) {
      case TokenType.HOTP:
      case TokenType.TOTP:
        enrollmentConfig.data = { tokenTypeDetails: typeDetails };
        return this.dialog.open(EnrollOATHDialogComponent, enrollmentConfig);
      case (TokenType.PUSH):
        return this.dialog.open(EnrollPushDialogComponent, enrollmentConfig);
    }
  }

  private openTestDialog(token: Token): MatDialogRef<TestOATHDialogComponent | TestChallengeResponseDialogComponent> {
    const testConfig: MatDialogConfig = {
      width: '650px',
      data: { token: token }
    };

    switch (token.type) {
      case TokenType.HOTP:
      case TokenType.TOTP:
        return this.dialog.open(TestOATHDialogComponent, testConfig);
      case (TokenType.PUSH):
        return this.dialog.open(TestChallengeResponseDialogComponent, testConfig);
    }
  }

}
