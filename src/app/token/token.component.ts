import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Token } from '../token';
import { MatDialog } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';
import { TokenService } from '../token.service';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss']
})
export class TokenComponent implements OnInit {
  token: Token;

  constructor(private router: Router, private route: ActivatedRoute, public tokenService: TokenService, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.route.data.subscribe((data: { token: Token }) => {
      this.token = data.token;
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
