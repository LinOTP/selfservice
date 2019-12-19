import { Component, OnInit } from '@angular/core';
import { SessionService } from './auth/session.service';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { NotificationService } from './common/notification.service';
import { LoginService } from './login/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'Self Service';
  public navLinks = [
    { 'label': this.i18n('Your tokens'), 'path': 'tokens/' },
  ];

  public isLoggedIn: boolean;


  constructor(
    private sessionService: SessionService,
    private loginService: LoginService,
    private notificationService: NotificationService,
    private i18n: I18n,
  ) {
  }

  ngOnInit() {
    this.isLoggedIn = this.sessionService.isLoggedIn();
    this.loginService.loginChangeEmitter
      .subscribe((isLoggedIn) => this.isLoggedIn = isLoggedIn);
  }

  logout() {
    this.loginService.logout().subscribe(logoutSuccess => {
      const message = (logoutSuccess ? 'Logout successful' : 'Logout failed');
      this.notificationService.message(message);
    });
  }

}
