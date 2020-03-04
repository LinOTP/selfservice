import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { map } from 'rxjs/operators';
import { I18n } from '@ngx-translate/i18n-polyfill';

import { NotificationService } from '../common/notification.service';
import { LoginService, LoginOptions } from './login.service';
import { SystemService, SystemInfo } from '../system.service';
import { Token } from '../api/token';

export enum LoginStage {
  USER_PW_INPUT = 1,
  TOKEN_CHOICE = 2,
  OTP_INPUT = 3
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  message: string;

  loginFormGroup: FormGroup;
  secondFactorFormGroup: FormGroup;

  redirectUrl: string;

  systemInfo: SystemInfo;

  factors: Token[] = [];
  selectedToken: Token;

  loginStage = LoginStage.USER_PW_INPUT;

  constructor(
    private loginService: LoginService,
    public notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private i18n: I18n,
    private systemService: SystemService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.loginFormGroup = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.secondFactorFormGroup = this.formBuilder.group({
      otp: ['', Validators.required],
    });

    this.route.queryParamMap
      .pipe(
        map(params => params.get('redirect')),
      )
      .subscribe(url => this.redirectUrl = url);

    this.systemService.getSystemInfo().subscribe(systemInfo => {
      this.systemInfo = systemInfo;
      if (systemInfo.realm_box) {
        this.loginFormGroup.addControl(
          'realm',
          this.formBuilder.control(systemInfo.default_realm, Validators.required)
        );
      }
      if (systemInfo.mfa_3_fields) {
        this.loginFormGroup.addControl(
          'otp',
          this.formBuilder.control('')
        );
      }
    });
  }

  login() {
    this.message = this.i18n('Waiting for response');

    const loginOptions: LoginOptions = {
      username: this.loginFormGroup.value.username,
      password: this.loginFormGroup.value.password,
      realm: this.loginFormGroup.value.realm,
      otp: this.loginFormGroup.value.otp,
    };

    if (loginOptions.realm === undefined) {
      delete loginOptions.realm;
    }
    if (loginOptions.otp === undefined) {
      delete loginOptions.otp;
    }

    this.loginService.login(loginOptions).subscribe(result => {

      if (!result.needsSecondFactor) {
        this.finalAuthenticationHandling(result.success);
      } else if (result.tokens.length === 0) {
        this.notificationService.message(
          this.i18n('Login failed: you do not have a second factor set up. Please contact an admin.'),
          20000
        );
      } else if (result.tokens.length === 1) {
        this.chooseSecondFactor(result.tokens[0]);
      } else {
        this.factors = result.tokens;
        this.selectedToken = this.factors[0];
        this.loginStage = LoginStage.TOKEN_CHOICE;
      }
    });
  }

  chooseSecondFactor(token: Token) {
    const user = this.loginFormGroup.value.username;
    this.loginService.requestSecondFactorTransaction(user, token.serial)
      .subscribe(requestOK => {
        if (requestOK) {
          this.loginStage = LoginStage.OTP_INPUT;
        } else {
          this.notificationService.message(
            this.i18n('There was a problem selecting the token. Please try again or contact an admin.'),
            20000
          );
        }
      });
  }

  submitSecondFactor() {
    this.loginService.loginSecondStep(this.secondFactorFormGroup.value.otp)
      .subscribe(result => this.finalAuthenticationHandling(result));
  }

  finalAuthenticationHandling(success: boolean) {
    const message = success ? this.i18n('Login successful') : this.i18n('Login failed');
    this.notificationService.message(message);
    if (success) {
      this.redirect();
    } else {
      this.loginStage = LoginStage.USER_PW_INPUT;
      this.selectedToken = null;
    }
  }

  redirect() {
    const target = this.redirectUrl || '/';
    this.router.navigate([target]);
  }

  resetAuthForm() {
    this.loginFormGroup.reset();
    this.secondFactorFormGroup.reset();
    this.loginStage = LoginStage.USER_PW_INPUT;
    this.factors = [];
    this.selectedToken = null;
  }
}
