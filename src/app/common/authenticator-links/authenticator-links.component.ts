import { CommonModule, NgIf } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { TokenType } from "@app/api/token";
import {
  AppRecommendation,
  AppRecommendationService
} from "@app/custom-content/app-recommendation/app-recommendation.service";
import { QRCodeComponent } from "angularx-qrcode";
import { PlatformProviderService } from "../platform-provider.service";

@Component({
    selector: 'app-authenticator-links',
    templateUrl: './authenticator-links.component.html',
    styleUrls: ['./authenticator-links.component.scss'],
    imports: [CommonModule, MatButtonModule, MatIconModule, QRCodeComponent, MatCardModule, NgIf]
})
export class AuthenticatorLinksComponent implements OnInit {
  @Input({required: true}) tokenType: TokenType
  platform: string
  appRec: AppRecommendation
  get platformUrl() {
    return this.platform === 'ios' ? this.appRec.ios.url : this.appRec.android.url
  }
  showDetails = false

  constructor(platformProvider: PlatformProviderService, private appRecService: AppRecommendationService){
    this.platform = platformProvider.platform;
  }

  ngOnInit(): void {
    this.appRec = this.appRecService.getAppRecommendationFor(this.tokenType);
  }
}