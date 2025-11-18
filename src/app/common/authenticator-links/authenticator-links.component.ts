import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { QRCodeModule } from "angularx-qrcode";
import { PlatformProviderService } from "../platform-provider.service";

@Component({
  selector: 'app-authenticator-links',
  templateUrl: './authenticator-links.component.html',
  styleUrls: ['./authenticator-links.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, QRCodeModule, MatCardModule]
})
export class AuthenticatorLinksComponent {
  platform: string
  readonly iosUrl = "https://apps.apple.com/de/app/linotp-authenticator/id6450118468"
  readonly androidUrl = "https://play.google.com/store/apps/details?id=de.linotp.authenticator"
  get platformUrl() {
    return this.platform === 'ios' ? this.iosUrl : this.androidUrl
  }
  showDetails = false

  constructor(platformProvider: PlatformProviderService){
    this.platform = platformProvider.platform;
  }
}