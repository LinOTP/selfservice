import { TokenType } from "@linotp/data-models";
import { SelfserviceToken } from "./api/token";
import { TokenLimitResponse } from "./system.service";
import { TokenLimitsService } from "./token-limits.service";

describe("TokenLimitsService", () => {
  it("should correctly return set values", () => {
    const cut = new TokenLimitsService();
    cut.setTokenLimits({ tokenLimits: getTokenLimitsMock(), tokens: getTokensMock() });
    const allTokensLimit = cut.allTokensLimit;
    expect(allTokensLimit.maxTokens).toBe(10);
    expect(cut.isMaxTokenLimitSet).toBe(true);

    const tokenTypeLimit = cut.getLimitsForTokenType(TokenType.HOTP);
    expect(tokenTypeLimit?.maxTokens).toBe(4);
  });

  it("should correctly return maxTokenLimitReached", () => {
    const cut = new TokenLimitsService();
    cut.setTokenLimits({ tokenLimits: getTokenLimitsMock(), tokens: getTokensMock() });
    expect(cut.maxTokenLimitReached).toBe(false);

    const tokenLimits = getTokenLimitsMock();
    tokenLimits.all_token = 3;
    cut.setTokenLimits({ tokenLimits, tokens: getTokensMock() });
    expect(cut.maxTokenLimitReached).toBe(true);
  });

  it("should be able to enroll token when token type limits are not reached", () => {
    const cut = new TokenLimitsService();
    cut.setTokenLimits({ tokenLimits: getTokenLimitsMock(), tokens: getTokensMock() });
    const canEnroll = cut.canEnrollToken(TokenType.HOTP);
    expect(canEnroll).toBe(true);
  });

  it("should not be able to enroll token when token type limits are reached", () => {
    const tokenLimits = getTokenLimitsMock();
    const tokens = getTokensMock();
    tokenLimits.token_types[0].max_token = 2;
    const cut = new TokenLimitsService();
    cut.setTokenLimits({ tokenLimits, tokens });
    const canEnroll = cut.canEnrollToken(TokenType.HOTP);
    expect(canEnroll).toBe(false);
  });

  it("should handle missing token limits in response", () => {
    const cut = new TokenLimitsService();
    cut.setTokenLimits({ tokenLimits: null, tokens: getTokensMock() });
    expect(cut.allTokensLimit).toBeUndefined();
    expect(cut.isMaxTokenLimitSet).toEqual(false);
    expect(cut.maxTokenLimitReached).toEqual(false);
  });
});

function getTokenLimitsMock() {
  const tokenLimits: TokenLimitResponse = {
    all_token: 10,
    token_types: [
      {
        token_type: TokenType.HOTP,
        max_token: 4,
      },
    ],
  };
  return tokenLimits;
}

function getTokensMock() {
  const tokens: SelfserviceToken[] = [
    {
      typeDetails: {
        type: TokenType.HOTP,
      },
    },
    {
      typeDetails: {
        type: TokenType.HOTP,
      },
    },
    {
      typeDetails: {
        type: TokenType.HOTP,
      },
    },
  ] as any;

  return tokens;
}
