import { Component, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';

import { Subject } from 'rxjs';
import { switchMap, filter, tap } from 'rxjs/operators';

import { TokenTypeDetails, tokenTypeDetails, TokenType } from '../api/token';
import { TokenService } from '../api/token.service';

import { NotificationService } from '../common/notification.service';

import { EnrollOtpDialogComponent } from '../enroll/enroll-otp-dialog/enroll-otp-dialog.component';
import { EnrollPushDialogComponent } from '../enroll/enroll-push-dialog/enroll-push-dialog.component';
import { TestOTPDialogComponent } from '../test/test-otp/test-otp-dialog.component';
import { TestPushDialogComponent } from '../test/test-push/test-push-dialog.component';

@Component({
  selector: 'app-enrollment-grid',
  templateUrl: './enrollment-grid.component.html',
  styleUrls: ['./enrollment-grid.component.scss']
})
export class EnrollmentGridComponent implements OnInit {

  public tokenTypes: TokenTypeDetails[] = tokenTypeDetails;
  @Output() public tokenUpdate: Subject<null> = new Subject();

  constructor(
    public dialog: MatDialog,
    private tokenService: TokenService,
    private notificationService: NotificationService,
  ) { }

  public ngOnInit() { }

  public runEnrollmentWorkflow(tokenType: TokenTypeDetails) {
    if (tokenType.type === TokenType.UNKNOWN) {
      this.notificationService.message('The selected token type cannot be enrolled at the moment.');
      return;
    }

    let testDialogRef: ((any) => MatDialogRef<TestOTPDialogComponent | TestPushDialogComponent>);

    switch (tokenType.type) {
      case TokenType.HOTP:
        testDialogRef = (token) => this.dialog.open(TestOTPDialogComponent, this.getTestConfig({ token: token }));
        break;
      case TokenType.TOTP:
        testDialogRef = (token) => this.dialog.open(TestOTPDialogComponent, this.getTestConfig({ token: token }));
        break;
      case TokenType.PUSH:
        testDialogRef = (token) => this.dialog.open(TestPushDialogComponent, this.getTestConfig({ token: token }));
        break;
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
        switchMap(token => testDialogRef(token).afterClosed())
      ).subscribe(() => this.tokenUpdate.next());
  }

  private openEnrollmentDialog(typeDetails: TokenTypeDetails): MatDialogRef<EnrollOtpDialogComponent | EnrollPushDialogComponent> {
    const enrollmentConfig: MatDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
    };

    switch (typeDetails.type) {
      case TokenType.HOTP:
      case TokenType.TOTP:
        enrollmentConfig.data = { tokenTypeDetails: typeDetails };
        return this.dialog.open(EnrollOtpDialogComponent, enrollmentConfig);
      case (TokenType.PUSH):
        return this.dialog.open(EnrollPushDialogComponent, enrollmentConfig);
    }
  }

  private getTestConfig(data: any): MatDialogConfig {
    return {
      width: '650px',
      data: data
    };
  }

}
