import { Component, OnInit } from '@angular/core';

import { SessionService } from './auth/session.service';
import { LoginService } from './login/login.service';
import { NotificationService } from './common/notification.service';
import { SystemService } from './system.service';

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

  public copyright: string;
  public footerText: string;
  public imprintUrl: string;
  public privacyNoticeUrl: string;


  constructor(
    private sessionService: SessionService,
    private loginService: LoginService,
    private notificationService: NotificationService,
    private systemService: SystemService,
  ) {
  }

  ngOnInit() {
    this.isLoggedIn = this.sessionService.isLoggedIn();
    this.loginService.loginChangeEmitter
      .subscribe((isLoggedIn) => this.isLoggedIn = isLoggedIn);

    this.systemService.getSystemInfo$().subscribe(systemInfo => {
      this.copyright = systemInfo.copyright;
      this.footerText = systemInfo.settings.footer_text;
      this.imprintUrl = systemInfo.settings.imprint_url;
      this.privacyNoticeUrl = systemInfo.settings.privacy_notice_url;
    });
  }

  logout() {
    this.loginService.logout().subscribe(logoutSuccess => {
      const message = (logoutSuccess ? $localize`Logout successful` : $localize`Logout failed`);
      this.notificationService.message(message);
    });
  }

}
