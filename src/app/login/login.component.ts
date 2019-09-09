import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { map } from 'rxjs/operators';
import { I18n } from '@ngx-translate/i18n-polyfill';

import { NotificationService } from '../common/notification.service';
import { AuthService } from '../auth/auth.service';
import { SystemService, SystemInfo } from '../system.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  message: string;

  loginFormGroup: FormGroup;
  secondFactorFormGroup: FormGroup;

  redirectUrl: string;

  systemInfo: SystemInfo;

  displaySecondFactor = false;

  constructor(
    private authService: AuthService,
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
    });
  }

  login() {
    this.message = this.i18n('Waiting for response');

    const loginOptions = {
      username: this.loginFormGroup.value.username,
      password: this.loginFormGroup.value.password,
      realm: this.loginFormGroup.value.realm,
    };

    if (loginOptions.realm === undefined) {
      delete loginOptions.realm;
    }

    this.authService.login(loginOptions).subscribe(result => {

      if (!result.needsSecondFactor) {
        this.finalAuthenticationHandling(result.success);
      } else if (!result.hasTokens) {
        this.notificationService.message('Login failed: you do not have a second factor set up. Please contact an admin.', 20000);
      } else {
        this.displaySecondFactor = true;
      }
    });
  }

  submitSecondFactor() {
    this.authService.loginSecondStep(this.secondFactorFormGroup.value.otp)
      .subscribe(result => this.finalAuthenticationHandling(result));
  }

  finalAuthenticationHandling(success: boolean) {
    const message = success ? this.i18n('Login successful') : this.i18n('Login failed');
    this.notificationService.message(message);
    if (success) {
      this.redirect();
    } else {
      this.displaySecondFactor = false;
    }
  }

  redirect() {
    const target = this.redirectUrl || '/';
    this.router.navigate([target]);
  }

  resetAuthForm() {
    this.loginFormGroup.reset();
    this.secondFactorFormGroup.reset();
    this.displaySecondFactor = false;
  }
}
