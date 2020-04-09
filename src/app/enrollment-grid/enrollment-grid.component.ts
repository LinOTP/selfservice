import { Component, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { I18n } from '@ngx-translate/i18n-polyfill';

import { NgxPermissionsService } from 'ngx-permissions';
import { Subject, Observable } from 'rxjs';
import { switchMap, filter, tap } from 'rxjs/operators';

import { Permission } from '../common/permissions';
import { NotificationService } from '../common/notification.service';
import { TokenType, Token, TokenTypeDetails } from '../api/token';
import { TokenService } from '../api/token.service';

import { AssignTokenDialogComponent } from '../enroll/assign-token-dialog/assign-token-dialog.component';
import { EnrollOATHDialogComponent } from '../enroll/enroll-oath-dialog/enroll-oath-dialog.component';
import { EnrollPushDialogComponent } from '../enroll/enroll-push-dialog/enroll-push-dialog.component';
import { ActivateDialogComponent } from '../activate/activate-dialog.component';
import { TestDialogComponent } from '../test/test-dialog.component';

@Component({
  selector: 'app-enrollment-grid',
  templateUrl: './enrollment-grid.component.html',
  styleUrls: ['./enrollment-grid.component.scss']
})
export class EnrollmentGridComponent implements OnInit {

  public tokenTypes: TokenTypeDetails[] = this.tokenService.getEnrollableTypes();
  @Output() public tokenUpdate: Subject<null> = new Subject();
  public testAfterEnrollment: boolean;

  constructor(
    public dialog: MatDialog,
    private tokenService: TokenService,
    private notificationService: NotificationService,
    private permissionService: NgxPermissionsService,
    private i18n: I18n,
  ) { }

  public ngOnInit() {
    this.permissionService.hasPermission(Permission.VERIFY)
      .then(hasPermission => this.testAfterEnrollment = hasPermission);
  }

  public runEnrollmentWorkflow(tokenType: TokenTypeDetails) {
    if (![TokenType.HOTP, TokenType.TOTP, TokenType.PUSH, TokenType.ASSIGN, TokenType.QR].includes(tokenType.type)) {
      this.notificationService.message(this.i18n('The selected token type cannot be added at the moment.'));
      return;
    }

    this.openEnrollmentDialog(tokenType)
      .pipe(
        tap(() => this.tokenUpdate.next()),
        filter(() => this.testAfterEnrollment),
        filter(serial => !!serial),
        switchMap(serial => this.tokenService.getToken(serial)),
        tap(token => {
          if (!token) {
            this.notificationService.message(this.i18n('There was a problem starting the token test, please try again later.'));
          }
        }),
        filter(token => !!token),
        switchMap(token => this.openTestDialog(token)),
        tap(() => this.tokenUpdate.next()),
      ).subscribe();
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
      data: {
        tokenTypeDetails: typeDetails,
      },
    };

    switch (typeDetails.type) {
      case TokenType.HOTP:
      case TokenType.TOTP:
        enrollmentConfig.data.closeLabel = this.testAfterEnrollment ? this.i18n('Test') : this.i18n('Close');
        return this.dialog.open(EnrollOATHDialogComponent, enrollmentConfig).afterClosed();
      case TokenType.PUSH:
      case TokenType.QR:
        return this.dialog.open(EnrollPushDialogComponent, enrollmentConfig).afterClosed();
      case TokenType.ASSIGN:
        enrollmentConfig.data = {
          closeLabel: this.testAfterEnrollment ? this.i18n('Test') : this.i18n('Close')
        };
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
      case (TokenType.PUSH):
      case (TokenType.QR):
        return this.dialog.open(ActivateDialogComponent, testConfig).afterClosed();
      default:
        return this.dialog.open(TestDialogComponent, testConfig).afterClosed();
    }
  }

}
