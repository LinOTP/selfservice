import { Injectable } from "@angular/core";
import { LinOtpTokenType, SelfserviceToken } from "@app/api/token";
import { Permission } from "@app/common/permissions";
import { SelfServiceContextService } from "@app/selfservice-context.service";
import { NgxPermissionsService } from "ngx-permissions";

@Injectable()
export class TokenVerifyCheckService {
  private verifyPolicyEnabled = false;

  constructor(private selfServiceContextService: SelfServiceContextService,
    private permissionsService: NgxPermissionsService
  ) { }

  init() {
    this.permissionsService.hasPermission(Permission.VERIFY).then((hasPermission) => {
      this.verifyPolicyEnabled = hasPermission;
    });
  }

  isVerificationRequiredForToken(token: SelfserviceToken) {
    if (!this.verifyPolicyEnabled) return false;
    if (!this.selfServiceContextService.tokenTimestampsEnabled) return false;

    // verify is not relevant for disabled tokens
    if (!token.enabled) return false;

    const tokenVerified = this._isTokenVerified(token);

    return !tokenVerified;
  }

  shouldWarnAboutNotVerifiedTokens(tokens: SelfserviceToken[]) {
    if (!this.verifyPolicyEnabled) return false;
    if (!this.selfServiceContextService.tokenTimestampsEnabled) return false;

    if (tokens.length === 0) return false

    const enabledTokens = tokens.filter(t => t.enabled);
    if (enabledTokens.length === 0) return false

    const allEnabledTokensUnverified = enabledTokens.every(t => !this._isTokenVerified(t));

    return allEnabledTokensUnverified;
  }

  private _isTokenVerified(token: SelfserviceToken) {
    // token types that we always consider verified. they are not relevant for verify process
    const alwaysVerifiedTypes: LinOtpTokenType[] = ['pw', 'qr', 'push']
    if (alwaysVerifiedTypes.includes(token.tokenType)) return true

    return token.verified;
  }
}