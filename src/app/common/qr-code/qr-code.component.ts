import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss']
})
export class QRCodeComponent implements OnInit {
  @Input() public qrUrl: string;

  constructor() {}

  public ngOnInit() {}

}
