import { Component, OnDestroy, OnInit } from '@angular/core';

import { take, tap } from 'rxjs/operators';

import { EnrollmentStatus, SelfserviceToken, tokenDisplayData } from '@api/token';
import { TokenService } from '@api/token.service';
import { LoginService } from '@app/login/login.service';
import { SelfServiceContextService } from '@app/selfservice-context.service';
import { TokenLimitsService } from '@app/token-limits.service';
import { Permission } from '@common/permissions';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-token-list',
  templateUrl: './token-list.component.html',
  styleUrls: ['./token-list.component.scss'],
  providers: [TokenLimitsService]
})

export class TokenListComponent implements OnInit, OnDestroy {
  public EnrollmentStatus = EnrollmentStatus;
  public enrollmentPermissions: Permission[] = tokenDisplayData.map(tt => tt.enrollmentPermission).filter(p => !!p);

  public tokens: SelfserviceToken[];
  public permissionsLoaded: boolean;
  private subscription = new Subscription();
  tokenLimitsLoaded: boolean = false

  constructor(
    private tokenService: TokenService,
    private loginService: LoginService,
    public tokenLimitsService: TokenLimitsService,
    private selfServiceContextService: SelfServiceContextService,
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadTokens() {
    const tokens$ = this.tokenService.getTokens().pipe(tap(tokens => {
      this.tokens = tokens;
    }));

    const tokenLimitsReady$ = combineLatest([tokens$, this.selfServiceContextService.tokenLimits$])

    this.subscription.add(tokenLimitsReady$.subscribe(([tokens, limits]) => {
      this.tokenLimitsService.setTokenLimits({ tokenLimits: limits, tokens });
      this.tokenLimitsLoaded = true
    }))

  }

}
