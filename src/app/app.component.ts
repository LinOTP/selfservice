import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'LinOTP Selfservice';
  public navLinks = [
    { 'label': 'Your tokens', 'path': 'tokens/' },
    { 'label': 'Create new token', 'path': 'enroll/' },
  ];

  public isLoggedIn: boolean;


  constructor(
    private authService: AuthService,
    private snackbar: MatSnackBar,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.authService.loginChangeEmitter
      .subscribe((isLoggedIn) => this.isLoggedIn = isLoggedIn);
  }

  notifyMessage(message: string, duration: number) {
    const snackbarConfig = new MatSnackBarConfig();
    snackbarConfig.duration = duration;
    this.snackbar.open(message, '', snackbarConfig);
  }

  logout() {
    this.authService.logout().subscribe(
      response => {
        const logoutSuccess = response && response.result && response.result.value === true;
        if (logoutSuccess) {
          this.isLoggedIn = false;
          this.router.navigate(['/']);
        }
        const message = (logoutSuccess ? 'Logout successful' : 'Logout failed');
        this.notifyMessage(message, 2000);
      }
    );
  }

}
