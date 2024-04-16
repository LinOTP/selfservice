import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { TestOptions, TestService, TransactionDetail } from "@app/api/test.service";
import { NotificationService } from "@app/common/notification.service";
import { EnrolledToken } from "@app/enroll/enroll-dialog-base.component";

@Component({
	selector: 'app-verify-token',
	templateUrl: './verify-token.component.html',
	styleUrls: ['./verify-token.component.scss']
})
export class VerifyTokenComponent {
	@Output() tokenVerified = new EventEmitter<boolean>();
	@Input() form: FormGroup;

	@Input()
	public get token(): EnrolledToken {
		return this._token;
	}
	public set token(value: EnrolledToken) {
		this._token = value;
		this.startVerifyProcess();
	}
	private _token: EnrolledToken;

	public awaitingResponse = false;
	public verifyStarted = false

	public transactionDetail: TransactionDetail;
	public verifyResult: 'FAILURE' | 'SUCCESS' | null = null;

	get serial() {
		return this.token.serial;
	}

	constructor(private testService: TestService, private notificationsService: NotificationService) { }

	startVerifyProcess() {
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
}

