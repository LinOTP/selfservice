import { LinOtpToken, SelfserviceToken } from "@app/api/token";
import { TokenVerifyCheckService } from "./token-verify-check.service";

describe("TokenVerifyCheckService", () => {
  let selfServiceContextService: SelfServiceContextServiceMock;
  let permissionsService: NgxPermissionsServiceMock;
  let cut: TokenVerifyCheckService
  beforeEach(() => {
    selfServiceContextService = new SelfServiceContextServiceMock()
    permissionsService = new NgxPermissionsServiceMock();
    cut = new TokenVerifyCheckService(selfServiceContextService as any, permissionsService as any);
  })

  it("it should require verification when token is not verified", () => {
    (cut as any).verifyPolicyEnabled = true

    const result = cut.isVerificationRequiredForToken(getMockSelfserviceTokens()[0])
    expect(result).toBe(true)
  })
  it("it should not require verification when token is verified", () => {
    (cut as any).verifyPolicyEnabled = true
    const token = new SelfserviceToken({
      'LinOtp.Isactive': true,
      'LinOtp.TokenType': 'hmac',
      'LinOtp.LastAuthSuccess': '2000',
      "Enrollment": {
        "status": "completed"
      }
    } as any)
    const result = cut.isVerificationRequiredForToken(token)
    expect(result).toBe(false)
  })

  it("it should not consider token verification required when verify policy is not enabled", () => {
    (cut as any).verifyPolicyEnabled = false

    const result = cut.isVerificationRequiredForToken(getMockSelfserviceTokens()[0])
    expect(result).toBe(false)
  })

  it("it should not consider token verification required when token timestamps are not enabled", () => {
    (cut as any).verifyPolicyEnabled = true
    selfServiceContextService.tokenTimestampsEnabled = false

    const result = cut.isVerificationRequiredForToken(getMockSelfserviceTokens()[0])
    expect(result).toBe(false)
  })

  it("it should not require verification when token is disabled", () => {
    (cut as any).verifyPolicyEnabled = true
    const token = new SelfserviceToken({
      'LinOtp.Isactive': false,
      'LinOtp.TokenType': 'hmac',
      'LinOtp.LastAuthSuccess': '',
      "Enrollment": {
        "status": "completed"
      }
    } as any)
    const result = cut.isVerificationRequiredForToken(token)
    expect(result).toBe(false)
  });

  it("should warn about unverified tokens when all are not verified", () => {
    (cut as any).verifyPolicyEnabled = true
    const tokens = getMockSelfserviceTokens()
    const result = cut.shouldWarnAboutNotVerifiedTokens(tokens)
    expect(result).toBe(true)
  })

  it("should not warn about unverified tokens when timestamps are not enabled", () => {
    (cut as any).verifyPolicyEnabled = true
    selfServiceContextService.tokenTimestampsEnabled = false
    const tokens = getMockSelfserviceTokens()
    const result = cut.shouldWarnAboutNotVerifiedTokens(tokens)
    expect(result).toBe(false)
  })

  it("should not warn about unverified tokens when verify policy is not enabled", () => {
    (cut as any).verifyPolicyEnabled = false
    const tokens = getMockSelfserviceTokens()
    const result = cut.shouldWarnAboutNotVerifiedTokens(tokens)
    expect(result).toBe(false)
  })

  it("should not warn about unverified tokens when there are no tokens", () => {
    (cut as any).verifyPolicyEnabled = true
    const tokens = []
    const result = cut.shouldWarnAboutNotVerifiedTokens(tokens)
    expect(result).toBe(false)
  })

  it("should not warn about unverified tokens when all non verified tokens are disabled", () => {
    (cut as any).verifyPolicyEnabled = true
    const tokens = getMockTokens().map(t => {
      t['LinOtp.Isactive'] = false
      return t
    })
    const selfserviceTokens = tokens.map(t => new SelfserviceToken(t as any))
    const result = cut.shouldWarnAboutNotVerifiedTokens(selfserviceTokens)
    expect(result).toBe(false)
  })

  it("should not warn when at least one token is verified", () => {
    (cut as any).verifyPolicyEnabled = true
    const tokens = getMockTokens()
    tokens[0]['LinOtp.LastAuthSuccess'] = '2000'
    const result = cut.shouldWarnAboutNotVerifiedTokens(tokens.map(t => new SelfserviceToken(t as any)))
    expect(result).toBe(false)
  })
})



class SelfServiceContextServiceMock {
  tokenTimestampsEnabled = true
}

class NgxPermissionsServiceMock {
  hasPermission() {
    return Promise.resolve(true)
  }
}


function getMockTokens() {
  const tokens: Partial<LinOtpToken>[] = [
    {
      'LinOtp.Isactive': true,
      'LinOtp.TokenType': 'hmac',
      'LinOtp.LastAuthSuccess': '',
      "Enrollment": {
        "status": "completed"
      }
    },
    {
      'LinOtp.Isactive': true,
      'LinOtp.TokenType': 'totp',
      'LinOtp.LastAuthSuccess': '',
      "Enrollment": {
        "status": "completed"
      }
    },
  ]

  return tokens
}

function getMockSelfserviceTokens() {
  return getMockTokens().map(t => new SelfserviceToken(t as any))
}