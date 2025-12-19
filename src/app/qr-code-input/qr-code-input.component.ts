import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReplyMode, TransactionDetail } from "@api/test.service";

@Component({
    selector: 'app-qr-code-input',
    templateUrl: './qr-code-input.component.html',
    styleUrls: ['./qr-code-input.component.scss'],
    standalone: false
})
export class QrCodeInputComponent {
  @Input({ required: true }) transactionDetail: TransactionDetail;

  @Output() otpValueChanged = new EventEmitter<string>();

  protected showInputField = false;


  public get hasOnlineMode(): boolean {
    return this.transactionDetail?.replyMode.includes(ReplyMode.ONLINE);
  }

  public get hasOfflineMode(): boolean {
    return this.transactionDetail?.replyMode.includes(ReplyMode.OFFLINE);
  }

  public get qrCodeData(): string {
    return this.transactionDetail?.transactionData;
  }

  onOtpChange($event: Event) {
    this.otpValueChanged.emit(($event.currentTarget as HTMLInputElement).value);
  }

}
