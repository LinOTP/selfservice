import { Component, OnInit } from '@angular/core';

import { LoginService } from '@app/login/login.service';
import { SystemService, UserSystemInfo } from '@app/system.service';
import { NotificationService } from '@common/notification.service';
import { Permission } from '@common/permissions';
import { CustomContentService } from './custom-content/custom-content.service';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'Self Service';
  public navLinks = [
    { 'label': $localize`Your tokens`, 'path': 'tokens/' },
    { 'label': $localize`History`, 'path': 'history/', permission: Permission.HISTORY }
  ];

  public userData: UserSystemInfo['user'];

  public copyright: string;
  public footerText: string;
  public imprintUrl: string;
  public privacyNoticeUrl: string;


  constructor(
    private loginService: LoginService,
    private notificationService: NotificationService,
    private systemService: SystemService,
    public themeService: ThemeService,
    private customContentService: CustomContentService
  ) { }

  ngOnInit() {
    this.loginService.loginChange$
      .subscribe(userData => this.userData = userData);

    this.systemService.getSystemInfo$().subscribe(systemInfo => {
      this.copyright = systemInfo.copyright;
      this.footerText = systemInfo.settings.footer_text;
      this.imprintUrl = systemInfo.settings.imprint_url;
      this.privacyNoticeUrl = systemInfo.settings.privacy_notice_url;
    });

    this.customContentService.loadContent();
  }

  logout() {
    this.loginService.logout().subscribe(logoutSuccess => {
      const message = (logoutSuccess ? $localize`Logout successful` : $localize`Logout failed`);
      this.notificationService.message(message);
    });
  }

}
