import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { of } from 'rxjs';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';


import { TokenDisplayData, TokenType, tokenDisplayData } from '@api/token';
import { LoginService } from '@app/login/login.service';
import { NotificationService } from '@common/notification.service';

import { AssignTokenDialogComponent } from '@app/enroll/assign-token-dialog/assign-token-dialog.component';
import { EnrollEmailDialogComponent } from '@app/enroll/enroll-email-dialog/enroll-email-dialog.component';
import { EnrollMOTPDialogComponent } from '@app/enroll/enroll-motp-dialog/enroll-motp-dialog.component';
import { EnrollOATHDialogComponent } from '@app/enroll/enroll-oath-dialog/enroll-oath-dialog.component';
import { EnrollPasswordDialogComponent } from '@app/enroll/enroll-password-dialog/enroll-password-dialog.component';
import { EnrollPushQRDialogComponent } from '@app/enroll/enroll-push-qr-dialog/enroll-push-qr-dialog.component';
import { EnrollSMSDialogComponent } from '@app/enroll/enroll-sms-dialog/enroll-sms-dialog.component';
import { EnrollYubicoDialogComponent } from '@app/enroll/enroll-yubico/enroll-yubico-dialog.component';

@Component({
  selector: 'app-enroll',
  template: ''
})
export class EnrollComponent implements OnInit {

  private displayData: TokenDisplayData;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private loginService: LoginService,
  ) { }

  ngOnInit() {
    this.route.params.pipe(
      take(1),
      map(params => params['type']),
      tap(type => {
        this.displayData = tokenDisplayData.find(d => d.type === type);
        if (!this.displayData) {
          throw new Error($localize`Cannot enroll token of unknown type "${type}".`);
        }
      }),
      switchMap(() => this.loginService.hasPermission$(this.displayData.enrollmentPermission)),
      take(1),
      tap(hasPermission => {
        if (!hasPermission) {
          throw new Error($localize`You are not allowed to enroll tokens of type "${this.displayData.type}".`);
        }
      }),
      filter(hasPermission => hasPermission),
      switchMap(() => this.openDialog()),
      catchError((err, _) => {
        this.notificationService.errorMessage($localize`Error: ${err.message}`);
        return of(null);
      })
    ).subscribe(() => {
      this.leave();
    });
  }

  openDialog() {
    const enrollmentConfig: MatDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { tokenType: this.displayData.type },
    };

    let enrollmentDialog;

    switch (this.displayData.type) {
      case TokenType.HOTP:
      case TokenType.TOTP:
        enrollmentDialog = EnrollOATHDialogComponent;
        break;
      case TokenType.PASSWORD:
        enrollmentDialog = EnrollPasswordDialogComponent;
        break;
      case TokenType.EMAIL:
        enrollmentDialog = EnrollEmailDialogComponent;
        break;
      case TokenType.SMS:
        enrollmentDialog = EnrollSMSDialogComponent;
        break;
      case TokenType.MOTP:
        enrollmentDialog = EnrollMOTPDialogComponent;
        break;
      case TokenType.PUSH:
      case TokenType.QR:
        enrollmentDialog = EnrollPushQRDialogComponent;
        break;
      case TokenType.YUBICO:
        enrollmentDialog = EnrollYubicoDialogComponent;
        break;
      case 'assign':
        enrollmentDialog = AssignTokenDialogComponent;
        break;
      default:
        throw new Error($localize`The selected token type cannot be added at the moment.`);
    }

    return this.dialog
      .open(enrollmentDialog, enrollmentConfig).afterClosed();
  }

  leave() {
    this.router.navigate(['/tokens']);
  }
}
