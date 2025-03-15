import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TestOptions, TestService, TransactionDetail } from "@api/test.service";
import { NotificationService } from "@common/notification.service";
import { EnrolledToken } from "@app/enroll/enroll-dialog-base.directive";
import { TokenType } from "@api/token";
import { EmailEnrolledToken } from "@app/enroll/enroll-email-dialog/enroll-email-dialog.component";
import { SMSEnrolledToken } from "@app/enroll/enroll-sms-dialog/enroll-sms-dialog.component";

@Component({
	selector: 'app-verify-token',
	templateUrl: './verify-token.component.html',
	styleUrls: ['./verify-token.component.scss']
})
export class VerifyTokenComponent {
	@Output() tokenVerified = new EventEmitter<boolean>();
  /**
   * In case this component is used for the assign token process, we need to alter text accordingly.
   */
  @Input() isAssignProcess = false;
  private _mustContainDigitsOnly = true;
  @Input()
  set mustContainDigitsOnly(value: boolean) {
    this._mustContainDigitsOnly = value;
    this.updateOtpValidators();
  }

  get mustContainDigitsOnly(): boolean {
    return this._mustContainDigitsOnly;
  }
	@Input()
	public get token(): EnrolledToken {
		return this._token;
	}
	public set token(value: EnrolledToken) {
		this._token = value;
		this.startVerifyProcess();
	}
	private _token: EnrolledToken;
  form: FormGroup = this.formBuilder.group({
    otp: ['', Validators.required],
  });

  public awaitingResponse = false;
	public verifyStarted = false

	public transactionDetail: TransactionDetail;
	public verifyResult: 'FAILURE' | 'SUCCESS' | null = null;

	get serial() {
    return this.token?.serial;
	}

  constructor(
    private testService: TestService,
    private notificationsService: NotificationService,
    private formBuilder: FormBuilder) {
    this.updateOtpValidators();
  }

  private updateOtpValidators(): void {
    if (!this.form) return;
    if (this.mustContainDigitsOnly) {
      this.form.get("otp").setValidators([
        Validators.required,
        Validators.pattern("^[0-9]*$")
      ]);
    } else {
      this.form.get("otp").setValidators([Validators.required]);
    }
    this.form.updateValueAndValidity();
  }

  startVerifyProcess() {
    if (!this.serial) return;
    this.testService.testToken({ serial: this.serial }).subscribe(response => {
			if (response === null || typeof response !== 'object') {
				const message1 = $localize`There was a problem starting your token test.`;
				const message2 = $localize`Please wait some time and try again later, or contact an administrator.`;
				const errorMessage = message1 + ' ' + message2;
				this.verifyResult = "FAILURE";
				this.notificationsService.errorMessage(errorMessage);
			} else {
				this.transactionDetail = response;
			}
			this.verifyStarted = true;
		});
	}

	public verifyToken() {
		if (this.preventSubmit()) return
		const otp = this.form.get('otp').value;
		const options: TestOptions = {
			serial: this.serial,
			otp,
			transactionid: this.transactionDetail.transactionId,
		};
		this.awaitingResponse = true;
		this.testService.testToken(options).subscribe(result => {
			if (result) {
				this.verifyResult = "SUCCESS"
				this.notificationsService.message("Token verification successful");
				this.form.get('otp').disable();
				this.tokenVerified.emit(true);

			} else {
				const errorMessage = $localize`Token verification failed. Please try again or contact an administrator.`;
				this.notificationsService.errorMessage(errorMessage);
				this.verifyResult = "FAILURE"
			}
			this.awaitingResponse = false;
		});
	}

	public preventSubmit() {
    return this.form.invalid || this.awaitingResponse;
  }

  get verificationMessage(): string {
    if (!this.token) return '';
    const createdText = $localize`:@@createdText:created`;
    const assignedText = $localize`:@@assignedText:assigned`;
    const registeredText = $localize`:@@registeredText:registered`;
    let action: string = createdText;
    if (this.token.type == TokenType.YUBIKEY) {
      action = registeredText;
    }
    if (this.isAssignProcess) {
      action = assignedText;
    }
    switch (this.token.type) {
      case TokenType.EMAIL: {
        const t = this.token as EmailEnrolledToken;
        return $localize`:@@emailVerifyInstruction:An email token with the serial number ${this.token.serial} has been ${action} for ${t.email}. Please check your email inbox for the first one-time password.`;
      }
      case TokenType.HOTP:
      case TokenType.TOTP:
        return $localize`:@@oathVerifyInstruction:A token with the serial number ${this.token.serial} has been ${action}. Please add the token by scanning the QR code in the Authenticator app.`;
      case TokenType.MOTP:
        return $localize`:@@motpVerifyInstruction:An MOTP token with the serial number ${this.token.serial} has been ${action}. Please check your mobile device for the first one-time password.`;
      case TokenType.YUBICO:
        return $localize`:@@yubikeyVerifyInstruction:A yubikey with the serial number ${this.token.serial} has been ${action}. Please press its button to enter your one-time password.`;
      case TokenType.SMS: {
        const t = this.token as SMSEnrolledToken;
        return $localize`:@@smsVerifyInstruction:An SMS token with the serial number ${this.token.serial} has been ${action} for the phone number ${t.phone}. Please check your SMS messages for the first one-time password.`;
      }
      default:
        return $localize`:@@assignVerifyInstruction:A token with the serial number ${this.token.serial} was successfully assigned to your user account.`;
    }
  }


}

