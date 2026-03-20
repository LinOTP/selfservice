import { Component, Input } from "@angular/core";
import { getTokenDisplayData, TokenDisplayData, TokenType } from "@app/api/token";


@Component({
  selector: 'app-token-info',
  template: `
    <mat-card  appearance="outlined" *ngIf="token">
      <mat-card-content>
        <div class="top-row">
          <div class="token-icon">
            <mat-icon>{{tokenDisplayData.icon}}</mat-icon>
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
      </mat-card-content>
    </mat-card>
    `,
  styles: [`
    mat-card {
      font-size:14px;
      letter-spacing: 0.25px;
      line-height: 20px;
      color:var(--default-text-color);
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
  `],
  standalone: false
})
export class TokenInfoComponent {
  tokenDisplayData: TokenDisplayData;

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
}

export type TokenInfo = {
  serial: string;
  type: TokenType | 'assign';
  description: string;
  rpName?: string;
  rpId?: string;
}
