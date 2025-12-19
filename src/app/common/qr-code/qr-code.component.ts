import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-qr-code',
    templateUrl: './qr-code.component.html',
    styleUrls: ['./qr-code.component.scss'],
    standalone: false
})
export class CustomQRCodeComponent {
  @Input() public qrUrl: string;

  constructor() { }

}
