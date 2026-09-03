import { Component, Input } from "@angular/core";
import { EnrollmentStatus, getTokenDisplayData, SelfserviceToken, TokenDisplayData, TokenType } from "@app/api/token";


@Component({
  selector: 'app-token-info',
  template: `
    <mat-card  appearance="outlined" *ngIf="token">
      <mat-card-content>
        <div class="top-row">
          <div class="token-icon">
            <mat-icon [ngClass]="statusClass">{{tokenDisplayData.icon}}</mat-icon>
          </div>
          <div>
            <span class="token-title">{{tokenDisplayData.name | capitalize}}</span>
               <mat-chip *ngIf="token.type === 'fido2' && (token.rpName || token.rpId)"
                  class="rp-chip ms-1"
                  role="text"
                  aria-label="Relying party"
                  i18n-aria-label="@@dialogHeaderRelyingPartyAriaLabel"
                  [matTooltip]="token | rpTooltip"
                  i18n="@@dialogHeaderRelyingParty">{{ token.rpName || token.rpId }}</mat-chip>
            <div class="desc">
              <span>{{token.description}}</span>
            </div>
          </div>
        </div>
        <div class="serial-desc" i18n>Serial: {{token.serial}}</div>

        @if (token.type === TokenType.FORWARD && selfServiceToken?.targetTokenInfo; as targetTokenInfo) {
          <p class="forward-label" i18n>Forwarding authentication to:</p>
          <mat-card appearance="outlined" class="forward-target-card">
            <mat-card-content>
              <div class="top-row">
                <div class="token-icon">
                  <mat-icon [ngClass]="statusClass">{{(selfServiceToken | targetTokenDisplayData).icon}}</mat-icon>
                </div>
                <div>
                  <span class="token-title">{{(selfServiceToken | targetTokenDisplayData).name}}</span>
                  <div class="desc">
                    <span>{{targetTokenInfo.description}}</span>
                  </div>
                </div>
              </div>
              <div class="serial-desc" i18n>Serial: {{targetTokenInfo.serial}}</div>
            </mat-card-content>
          </mat-card>
        }
      </mat-card-content>
    </mat-card>
    `,
  styles: [`
    mat-card {
      font-size:14px;
      letter-spacing: 0.25px;
      line-height: 20px;
      color:var(--default-text-color);
      background: var(--mat-sys-surface-container-highest);
    }
    mat-icon {
      height: 37px;
      width: 40px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .token-title {
      font-weight: 500;
      font-size: 16px;
    }
    .top-row {
      display: flex;
      align-items: center;
    }

    .token-icon {
      margin-right: 16px;
    }

    .desc {
      color: var(--mat-card-subtitle-text-color);
    }

    .serial-desc {
      margin-top: 5px;
    }

    .forward-label {
      margin-top: 10px;
      margin-bottom: 5px;
    }

    .forward-target-card {
      background: var(--mat-sys-surface);
      --mdc-outlined-card-outline-width: 1px;
      --mdc-outlined-card-outline-color: var(--mat-sys-outline-variant);
    }
  `],
  standalone: false
})
export class TokenInfoComponent {
  protected readonly TokenType = TokenType;
  tokenDisplayData: TokenDisplayData;
  @Input() selfServiceToken: SelfserviceToken | null= null

  @Input()
  public get token(): TokenInfo {
    return this._token;
  }
  public set token(value: TokenInfo) {
    this._token = value;
    if (value) {
      this.tokenDisplayData = getTokenDisplayData(value.type as TokenType);
    }
  }
  private _token: TokenInfo;

  public get statusClass(): 'unready' | 'active' | 'inactive' | '' {
    if(!this.selfServiceToken) return '';
    if (this.selfServiceToken.enrollmentStatus !== EnrollmentStatus.COMPLETED) return 'unready';
    return this.selfServiceToken.enabled ? 'active' : 'inactive';
  }
}

export type TokenInfo = {
  serial: string;
  type: TokenType | 'assign';
  description: string;
  rpName?: string;
  rpId?: string;
}
