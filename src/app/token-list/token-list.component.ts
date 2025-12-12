import { Component, OnDestroy, OnInit } from '@angular/core';

import { filter, tap } from 'rxjs/operators';

import { EnrollmentStatus, SelfserviceToken, tokenDisplayData } from '@api/token';
import { TokenService } from '@api/token.service';
import { AuthLockedEvaluatorContextInfo, AuthLockedStatusEvaluator } from '@app/common/auth-locked-status-evaluator';
import { LoginService } from '@app/login/login.service';
import { SelfServiceContextService } from '@app/selfservice-context.service';
import { TokenLimitsService } from '@app/token-limits.service';
import { Permission } from '@common/permissions';
import { combineLatest, Subscription } from 'rxjs';
import { TokenVerifyCheckService } from './token-verify-check.service';

@Component({
    selector: 'app-token-list',
    templateUrl: './token-list.component.html',
    styleUrls: ['./token-list.component.scss'],
    providers: [TokenLimitsService, TokenVerifyCheckService],
    standalone: false
})

export class TokenListComponent implements OnInit, OnDestroy {
  public EnrollmentStatus = EnrollmentStatus;
  public enrollmentPermissions: Permission[] = tokenDisplayData.map(tt => tt.enrollmentPermission).filter(p => !!p);

  public tokens: SelfserviceToken[];
  private subscription = new Subscription();
  loaded = false
  criticalError = false

  isUserLocked: boolean = false
  warnTokensNotVerified = false

  constructor(
    private tokenService: TokenService,
    private loginService: LoginService,
    public tokenLimitsService: TokenLimitsService,
    private selfServiceContextService: SelfServiceContextService,
    private tokenVerifyCheck: TokenVerifyCheckService,
  ) { }

  ngOnInit() {

    const permissionLoadFailureSub = this.loginService.permissionLoadError$.pipe(
      filter(err => err),
    ).subscribe( () => {
      this.criticalError = true;
    });
    this.subscription.add(permissionLoadFailureSub);

    const loginSub = this.loginService.permissionLoad$.pipe(
      filter(permissionsLoaded => permissionsLoaded),
    ).subscribe(() => {
      this.loadTokens()
      this.tokenVerifyCheck.init();
    });

    this.subscription.add(loginSub);

    const tokenUpdateSub = this.tokenService.tokenUpdateEmitted$.subscribe(() => {
        this.loadTokens();
      });
    this.subscription.add(tokenUpdateSub);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadTokens() {
    this.loaded = false;
    const tokens$ = this.tokenService.getSelfserviceTokens().pipe(tap(tokens => {
      this.tokens = tokens;
    }));
    const tokenLimitsReady$ = combineLatest([tokens$, this.selfServiceContextService.tokenLimits$])
    this.subscription.add(tokenLimitsReady$.subscribe(([tokens, limits]) => {
      this.tokenLimitsService.setTokenLimits({ tokenLimits: limits, tokens });
      this.loaded = true
      const context = new AuthLockedEvaluatorContextInfo(this.selfServiceContextService.context)
      const rules = new AuthLockedStatusEvaluator(this.tokens, context)
      this.isUserLocked = rules.isUsersAuthLocked()
      this.warnTokensNotVerified = this.tokenVerifyCheck.shouldWarnAboutNotVerifiedTokens(this.tokens)
    }))

  }
}
