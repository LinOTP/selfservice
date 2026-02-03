import { Component, Input } from "@angular/core";
import { getTokenDisplayData, TokenDisplayData, TokenType } from "@app/api/token";
import { EnrolledToken } from "@app/enroll/enroll-dialog-base.directive";


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
  public get token(): EnrolledToken {
    return this._token;
  }
  public set token(value: EnrolledToken) {
    this._token = value;
    if (value) {
      this.tokenDisplayData = getTokenDisplayData(value.type as TokenType);
    }
  }
  private _token: EnrolledToken;
}

