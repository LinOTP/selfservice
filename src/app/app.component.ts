import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from './core/notification.service';

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
    private notificationService: NotificationService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.authService.loginChangeEmitter
      .subscribe((isLoggedIn) => this.isLoggedIn = isLoggedIn);
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
        this.notificationService.message(message);
      }
    );
  }

}
