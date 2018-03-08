import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { MatDialog, MatSnackBarConfig, MatSnackBar } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';
import { SetPinDialogComponent } from '../set-pin-dialog/set-pin-dialog.component';

import { Token } from '../token';
import { TokenService } from '../token.service';

@Component({
  selector: 'app-token-list',
  templateUrl: './token-list.component.html',
  styleUrls: ['./token-list.component.scss']
})

export class TokenListComponent implements OnInit {
  tokens: Token[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public tokenService: TokenService,
    public dialog: MatDialog,
    public snackbar: MatSnackBar) {
  }

  ngOnInit() {
    this.route.data.subscribe((data: { tokens: Token[] }) => {
      this.tokens = data.tokens;
    });
  }

  notifyMessage(message: string, duration: number) {
    const snackbarConfig = new MatSnackBarConfig();
    snackbarConfig.duration = duration;
    this.snackbar.open(message, '', snackbarConfig);
  }

  setPin(token: Token) {
    const config = {
      width: '25em',
      data: token
    };
    const dialogRef = this.dialog.open(SetPinDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notifyMessage('PIN set', 2000);
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

}
