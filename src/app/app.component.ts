import { Component, OnInit } from '@angular/core';

import { SessionService } from './auth/session.service';
import { LoginService } from './login/login.service';
import { NotificationService } from './common/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'Self Service';
  public navLinks = [
    { 'label': $localize`Your tokens`, 'path': 'tokens/' },
  ];

  public isLoggedIn: boolean;


  constructor(
    private sessionService: SessionService,
    private loginService: LoginService,
    private notificationService: NotificationService,
  ) {
  }

  ngOnInit() {
    this.isLoggedIn = this.sessionService.isLoggedIn();
    this.loginService.loginChangeEmitter
      .subscribe((isLoggedIn) => this.isLoggedIn = isLoggedIn);
  }

  logout() {
    this.loginService.logout().subscribe(logoutSuccess => {
      const message = (logoutSuccess ? $localize`Logout successful` : $localize`Logout failed`);
      this.notificationService.message(message);
    });
  }

}
