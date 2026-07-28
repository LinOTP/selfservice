import { Component, OnInit } from '@angular/core';

import { LoginService } from '@app/login/login.service';
import { SystemService, UserSystemInfo } from '@app/system.service';
import { NotificationService } from '@common/notification.service';
import { Permission } from '@common/permissions';
import { ThemeService } from './theme.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { CustomContentService } from './custom-content/custom-content.service';
import { take } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {
  public title = 'Self Service';
  public navLinks = [
    { 'label': $localize`Your tokens`, 'path': 'tokens/' },
  ];

  public userData: UserSystemInfo['user'];

  public copyright: string;
  public footerText: string;
  public imprintUrl: string;
  public privacyNoticeUrl: string;
  public totalNavItems = 1


  constructor(
    private permissionService: NgxPermissionsService,
    private loginService: LoginService,
    private notificationService: NotificationService,
    private systemService: SystemService,
    public themeService: ThemeService,
    private customizationService: CustomContentService
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

    this.loginService.permissionLoad$.subscribe(()=> {
      if(this.permissionService.getPermission(Permission.HISTORY) && !this.navLinks.some(link => link.path === 'history/')){
        this.navLinks.push({'label': $localize`History`, 'path': 'history/'})
        this.totalNavItems = this.navLinks.length
      }
    })

    this.customizationService.page$.pipe(take(1)).subscribe(page => {
      this.totalNavItems += page?.content ? 1 : 0
    })

  }

  logout() {
    this.loginService.logout().subscribe(logoutSuccess => {
      const message = (logoutSuccess ? $localize`Logout successful` : $localize`Logout failed`);
      this.notificationService.message(message);
    });
  }

}
