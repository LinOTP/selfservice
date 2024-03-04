import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { QRCodeModule } from "angularx-qrcode";
import { CurrentPlatform } from "../platform-provider.service";

@Component({
  selector: 'app-authenticator-links',
  templateUrl: './authenticator-links.component.html',
  styleUrls: ['./authenticator-links.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, QRCodeModule, MatCardModule]
})
export class AuthenticatorLinksComponent {
  @Input() platform: CurrentPlatform
  readonly iosUrl = "https://apps.apple.com/de/app/linotp-authenticator/id6450118468"
  readonly androidUrl = "https://play.google.com/store/apps/details?id=de.linotp.authenticator" // TODO is it correct app - in others views we have links to keyidentity
  get platformUrl() {
    return this.platform === 'ios' ? this.iosUrl : this.androidUrl
  }
  showDetails = false
}