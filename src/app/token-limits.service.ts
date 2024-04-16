import { Injectable } from "@angular/core";
import { SelfserviceToken, TokenType } from "./api/token";
import { TokenLimitResponse } from "./system.service";

@Injectable()
export class TokenLimitsService {
  private tokenTypeLimits: TokenTypeLimitInfo[] = [];

  private _allTokensLimit: TokenLimitInfo | undefined;

  get allTokensLimit() {
    return this._allTokensLimit;
  }

  get maxTokenLimitReached() {
    if (!this.allTokensLimit || this.allTokensLimit.maxTokens === null) return false;
    return this.allTokensLimit.count >= this.allTokensLimit.maxTokens;
  }

  get isMaxTokenLimitSet() {
    if (!this.allTokensLimit) return false;
    return this.allTokensLimit.maxTokens !== null;
  }

  canEnrollToken(type: TokenType) {
    return !this.maxTokenLimitReached && !this.isLimitForTokenTypeReached(type);
  }

  getLimitsForTokenType(type: TokenType) {
    const result: TokenLimitInfo | undefined = this.tokenTypeLimits.find((t) => t.type === type);
    return result;
  }

  setTokenLimits(data: { tokenLimits: TokenLimitResponse, tokens: SelfserviceToken[]; }) {
    const tokenLimits = data.tokenLimits;
    const tokens = data.tokens;

    // Fallback when backend version does not return token limits
    if (!tokenLimits) {
      this._allTokensLimit = undefined;
      this.tokenTypeLimits = [];
      return;
    }

    const tokenCount = tokens.length;
    const maxTokens = tokenLimits.all_token;
    this._allTokensLimit = {
      maxTokens,
      count: tokenCount,
    };

    const tokenTypeLimits = tokenLimits.token_types.map((t) => {
      const tokenType = t.token_type as TokenType;
      const limit: TokenTypeLimitInfo = {
        type: tokenType,
        maxTokens: t.max_token,
        count: data.tokens.filter((token) => token.typeDetails.type === tokenType).length,
      };
      return limit;
    });

    this.tokenTypeLimits = tokenTypeLimits;
  }

  private isLimitForTokenTypeReached(type: TokenType) {
    const limit = this.getLimitsForTokenType(type);

    if (!limit) return false;
    return limit.count >= limit.maxTokens;
  }
}

type TokenTypeLimitInfo = {
  type: TokenType;
  maxTokens: number;
  count: number;
};

type TokenLimitInfo = {
  maxTokens: number;
  count: number;
}



