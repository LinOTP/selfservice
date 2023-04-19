import { Component, OnInit } from '@angular/core';

import { take, tap } from 'rxjs/operators';

import { EnrollmentStatus, SelfserviceToken, tokenDisplayData } from '@api/token';
import { TokenService } from '@api/token.service';
import { LoginService } from '@app/login/login.service';
import { Permission } from '@common/permissions';

@Component({
  selector: 'app-token-list',
  templateUrl: './token-list.component.html',
  styleUrls: ['./token-list.component.scss']
})

export class TokenListComponent implements OnInit {
  public EnrollmentStatus = EnrollmentStatus;
  public enrollmentPermissions: Permission[] = tokenDisplayData.map(tt => tt.enrollmentPermission).filter(p => !!p);

  public tokens: SelfserviceToken[];
  public permissionsLoaded: boolean;

  constructor(
    private tokenService: TokenService,
    private loginService: LoginService,
  ) { }

  ngOnInit() {
    this.loginService.permissionLoad$.pipe(
      take(1),
      tap(permissionsLoaded => this.permissionsLoaded = permissionsLoaded),
    ).subscribe(() => this.loadTokens());

    this.tokenService.tokenUpdateEmitted$.subscribe(() => {
      this.loadTokens();
    });
  }

  loadTokens() {
    this.tokenService.getTokens().subscribe(tokens => {
      this.tokens = tokens;
    });
  }

}
