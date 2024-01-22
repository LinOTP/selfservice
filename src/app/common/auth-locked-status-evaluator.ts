import { SelfserviceToken } from "@app/api/token"
import { UserSystemInfo } from "@app/system.service"

// Class is used to evaluate if user lockable actions(delete, unassign, disable)
// will lock them out of the authentication to selfservice
export class AuthLockedStatusEvaluator {
  constructor(private tokens: SelfserviceToken[], private context: AuthLockedEvaluatorContextInfo) { }

  checkDeleteWillLockAuth(token: SelfserviceToken) {
    if (!this.context.mfaEnabled) return false
    const activeTokens = this.getActiveTokens()
    if (this.context.passOnNoToken && this.tokens.length === 1) return false
    if (activeTokens.length === 1 && token.enabled) return true

    return false
  }

  checkUnassignWillLockAuth(token: SelfserviceToken) {
    // same logic as for delete action
    return this.checkDeleteWillLockAuth(token)
  }

  checkDisableWillLockAuth(token: SelfserviceToken) {
    const activeTokens = this.getActiveTokens()
    if (this.context.passOnNoToken && activeTokens.length === 1 && token.enabled) return true

    return this.checkDeleteWillLockAuth(token)
  }

  isUsersAuthLocked() {
    if (!this.context.mfaEnabled) return false
    if (this.context.passOnNoToken && this.tokens.length === 0) return false
    const activeTokens = this.getActiveTokens()
    if (activeTokens.length === 0) return true

    return false
  }

  private getActiveTokens() {
    const result = this.tokens.filter(t => {
      // not fully activated tokens are also not enabled
      if (!t.enabled) return false
      return true
    })

    return result
  }
}

export class AuthLockedEvaluatorContextInfo {
  constructor(private context: UserSystemInfo) { }

  get mfaEnabled() {
    return this.context.settings.mfa_login
  }

  get passOnNoToken() {
    return this.context.actions.includes('mfa_passOnNoToken')
  }
}