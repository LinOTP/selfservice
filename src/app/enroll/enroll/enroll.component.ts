import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { filter, map, switchMap, take, tap } from 'rxjs/operators';

import { TokenType } from '@linotp/data-models';

import { NotificationService } from '../../common/notification.service';
import { LoginService } from '../../login/login.service';
import { TokenDisplayData, tokenDisplayData } from '../../api/token';

import { AssignTokenDialogComponent } from '../assign-token-dialog/assign-token-dialog.component';
import { EnrollEmailDialogComponent } from '../enroll-email-dialog/enroll-email-dialog.component';
import { EnrollMOTPDialogComponent } from '../enroll-motp-dialog/enroll-motp-dialog.component';
import { EnrollOATHDialogComponent } from '../enroll-oath-dialog/enroll-oath-dialog.component';
import { EnrollPasswordDialogComponent } from '../enroll-password-dialog/enroll-password-dialog.component';
import { EnrollPushQRDialogComponent } from '../enroll-push-qr-dialog/enroll-push-qr-dialog.component';
import { EnrollSMSDialogComponent } from '../enroll-sms-dialog/enroll-sms-dialog.component';
import { EnrollYubicoDialogComponent } from '../enroll-yubico/enroll-yubico-dialog.component';
import { TokenService } from '../../api/token.service';

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
    private tokenService: TokenService,
  ) {
    this.route.params.pipe(
      take(1),
      map(params => params['type']),
      tap(type => this.displayData = tokenDisplayData.find(d => d.type === type))
    ).subscribe(type => {
      if (!this.displayData) {
        this.notificationService.message($localize`Error: Cannot enroll token of unknown type "${type}".`);
      }
    });
  }

  ngOnInit() {
    if (!this.displayData) {
      this.leave();
      return;
    }

    this.loginService.hasPermission$(this.displayData.enrollmentPermission).pipe(
      take(1),
      tap(hasPermission => {
        if (!hasPermission) {
          this.notificationService.message($localize`Error: You are not allowed to enroll tokens of type ${this.displayData.type}.`);
          this.leave();
        }
      }),
      filter(hasPermission => hasPermission),
      switchMap(() => this.openDialog()),
    ).subscribe(() => {
      this.tokenService.updateTokenList();
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
        this.notificationService.message($localize`The selected token type cannot be added at the moment.`);
        return;
    }

    return this.dialog
      .open(enrollmentDialog, enrollmentConfig).afterClosed();
  }

  leave() {
    this.router.navigate(['/tokens']);
  }
}
