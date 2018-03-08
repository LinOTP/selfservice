import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { DoCheck } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements DoCheck {
  title = 'LinOTP Selfservice';
  isLoggedIn: boolean;
  navLinks = [
    { 'label': 'Your tokens', 'path': 'tokens/' },
    { 'label': 'Create new token', 'path': 'enroll/' },
  ];

  constructor(private authService: AuthService, public snackbar: MatSnackBar, private router: Router) {
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  ngDoCheck() {
    this.isLoggedIn = this.authService.isLoggedIn();
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
