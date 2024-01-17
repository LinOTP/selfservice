import { SelfserviceToken } from "@app/api/token";
import { AuthLockedEvaluatorContextInfo, AuthLockedStatusEvaluator } from "./auth-locked-status-evaluator";

describe(("AuthLockedStatusEvaluator"), () => {
  describe("is user locked", () => {
    it("should evaluate as non blocked if mfa is disabled", () => {
      const contextInfo = {
        mfaEnabled: false,
        passOnNoToken: false
      } as AuthLockedEvaluatorContextInfo

      const evaluator = new AuthLockedStatusEvaluator([], contextInfo)
      const result = evaluator.isUsersAuthLocked()
      expect(result).toBeFalse()
    })

    it("should evaluate as non blocked if passOnNoToken is true and there are no tokens", () => {
      const contextInfo = {
        mfaEnabled: true,
        passOnNoToken: true
      } as AuthLockedEvaluatorContextInfo

      const evaluator = new AuthLockedStatusEvaluator([], contextInfo)
      const result = evaluator.isUsersAuthLocked()
      expect(result).toBeFalse()
    })

    it("should evaluate as blocked if passOnNoToken is true and there is disabled token", () => {
      const contextInfo = {
        mfaEnabled: true,
        passOnNoToken: true
      } as AuthLockedEvaluatorContextInfo

      const tokens = [
        {
          enabled: false
        } as SelfserviceToken
      ]

      const evaluator = new AuthLockedStatusEvaluator(tokens, contextInfo)
      const result = evaluator.isUsersAuthLocked()
      expect(result).toBeTrue()
    })

    it("should evaluate as non blocked if there is at least one active token", () => {
      const contextInfo = {
        mfaEnabled: true,
        passOnNoToken: true
      } as AuthLockedEvaluatorContextInfo

      const tokens = [
        {
          enabled: true
        } as SelfserviceToken
      ]

      const evaluator = new AuthLockedStatusEvaluator(tokens, contextInfo)
      const result = evaluator.isUsersAuthLocked()
      expect(result).toBeFalse()
    })
  })

  describe("check delete/unassign will lock user", () => {
    it("should not require confirmation if there more than one active token", () => {
      const contextInfo = {
        mfaEnabled: true,
        passOnNoToken: false
      } as AuthLockedEvaluatorContextInfo

      const tokens = [
        {
          enabled: true
        } as SelfserviceToken,
        {
          enabled: true
        } as SelfserviceToken
      ]

      const evaluator = new AuthLockedStatusEvaluator(tokens, contextInfo)
      const result = evaluator.checkDeleteWillLockAuth({ enabled: true } as any)
      expect(result).toBeFalse()
    })

    it("should not require confirmation if mfa is disabled", () => {
      const contextInfo = {
        mfaEnabled: false,
        passOnNoToken: false
      } as AuthLockedEvaluatorContextInfo

      const tokens = [
        {
          enabled: true
        } as SelfserviceToken
      ]

      const evaluator = new AuthLockedStatusEvaluator(tokens, contextInfo)
      const result = evaluator.checkDeleteWillLockAuth({ enabled: true } as any)
      expect(result).toBeFalse()
    })

    it("should not require confirmation if passOnNoToken is true and there are is one active token", () => {
      const contextInfo = {
        mfaEnabled: true,
        passOnNoToken: true
      } as AuthLockedEvaluatorContextInfo

      const tokens = [
        {
          enabled: true
        } as SelfserviceToken
      ]

      const evaluator = new AuthLockedStatusEvaluator(tokens, contextInfo)
      const result = evaluator.checkDeleteWillLockAuth({ enabled: true } as any)
      expect(result).toBeFalse()
    })

    it("should require confirmation if passOnNoToken is true and there is one enabled token and there are disabled tokens", () => {
      const contextInfo = {
        mfaEnabled: true,
        passOnNoToken: true
      } as AuthLockedEvaluatorContextInfo

      const tokens = [
        {
          enabled: false
        } as SelfserviceToken,
        {
          enabled: true
        } as SelfserviceToken
      ]

      const evaluator = new AuthLockedStatusEvaluator(tokens, contextInfo)
      const result = evaluator.checkDeleteWillLockAuth({ enabled: true } as any)
      expect(result).toBeTrue()
    })


    it("should not require confirmation if passOnNoToken is true and there are only disabled tokens", () => {
      const contextInfo = {
        mfaEnabled: true,
        passOnNoToken: true
      } as AuthLockedEvaluatorContextInfo

      const tokens = [
        {
          enabled: false
        } as SelfserviceToken,
        {
          enabled: false
        } as SelfserviceToken
      ]

      const evaluator = new AuthLockedStatusEvaluator(tokens, contextInfo)
      const result = evaluator.checkDeleteWillLockAuth({ enabled: false } as any)
      expect(result).toBeFalse()
    })

    it("should not require confirmation if action occurs on disabled token", () => {
      const contextInfo = {
        mfaEnabled: true,
        passOnNoToken: true
      } as AuthLockedEvaluatorContextInfo

      const tokens = [
        {
          enabled: false
        } as SelfserviceToken,
        {
          enabled: true
        } as SelfserviceToken
      ]

      const evaluator = new AuthLockedStatusEvaluator(tokens, contextInfo)
      let result = evaluator.checkDeleteWillLockAuth({ enabled: false } as any)
      expect(result).toBeFalse()

      result = evaluator.checkDeleteWillLockAuth({ enabled: true } as any)
      expect(result).toBeTrue()
    })
  })


  describe("check disable will lock user", () => {
    it("should require confirmation if there one active token and passOnNoToken is false", () => {
      const contextInfo = {
        mfaEnabled: true,
        passOnNoToken: false
      } as AuthLockedEvaluatorContextInfo

      const tokens = [
        {
          enabled: true
        } as SelfserviceToken,
      ]

      const evaluator = new AuthLockedStatusEvaluator(tokens, contextInfo)
      const result = evaluator.checkDisableWillLockAuth({ enabled: true } as any)
      expect(result).toBeTrue()
    })

    it("should require confirmation if there is one active token and passOnNoToken is on", () => {
      const contextInfo = {
        mfaEnabled: true,
        passOnNoToken: true
      } as AuthLockedEvaluatorContextInfo

      const tokens = [
        {
          enabled: true
        } as SelfserviceToken,
      ]

      const evaluator = new AuthLockedStatusEvaluator(tokens, contextInfo)
      const result = evaluator.checkDisableWillLockAuth({ enabled: true } as any)
      expect(result).toBeTrue()
    })
  })
});