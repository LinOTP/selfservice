import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { MatDialog } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';
import { SetPinDialogComponent } from '../set-pin-dialog/set-pin-dialog.component';

import { Token } from '../token';
import { TokenService } from '../token.service';
import { NotificationService } from '../core/notification.service';

@Component({
  selector: 'app-token-list',
  templateUrl: './token-list.component.html',
  styleUrls: ['./token-list.component.scss']
})

export class TokenListComponent implements OnInit {
  public tokens: Token[];
  private tokenTypes = this.tokenService.tokenTypes;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public tokenService: TokenService,
    public dialog: MatDialog,
    public notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.route.data.subscribe((data: { tokens: Token[] }) => {
      this.tokens = data.tokens;
    });
  }

  setPin(token: Token) {
    const config = {
      width: '25em',
      data: token
    };
    const dialogRef = this.dialog.open(SetPinDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.message('PIN set');
      }
    });
  }

  deleteToken(token: Token) {
    const config = {
      width: '25em',
      data:
        {
          title: 'Delete token?',
          text: 'You won\'t be able to use it to confirm transactions anymore.',
          confirmationLabel: 'delete'
        }
    };
    const dialogRef = this.dialog.open(DialogComponent, config);

    dialogRef.afterClosed().subscribe(deleteConfirmed => {
      if (deleteConfirmed) {
        this.tokenService.deleteToken(token.serial).subscribe(
          _ => this.router.navigate(['/tokens'])
        );
      }
    });
  }

  tokenName(type: string) {
    type = type.toLowerCase();
    const tokenType = this.tokenTypes.find(tt => tt.type === type);
    return tokenType ? tokenType.name : 'Unknown token';
  }

}
