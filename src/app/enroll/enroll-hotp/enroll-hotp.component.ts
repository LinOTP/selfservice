import { Component, OnInit } from '@angular/core';
import { EnrollToken } from '../../token';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TokenService } from '../../token.service';
import { MatStepper } from '@angular/material';
import { Router } from '@angular/router';

export interface EnrollHotpToken extends EnrollToken {
  type: 'hmac';
  otplen: number;
  hashlib: string;
  genkey: number;
}

@Component({
  selector: 'app-enroll-hotp',
  templateUrl: './enroll-hotp.component.html',
  styleUrls: ['./enroll-hotp.component.scss']
})
export class EnrollHotpComponent implements OnInit {

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  public enrollData: EnrollHotpToken = {
    type: 'hmac',
    description: '',
    otplen: 6,
    hashlib: 'sha1',
    genkey: 1,
  };

  public enrolledToken: { serial: string, url: string }/*  = { serial: '', url: '' } */;

  constructor(
    private formBuilder: FormBuilder,
    private tokenService: TokenService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

  enroll(stepper: MatStepper) {
    this.tokenService.enroll(this.enrollData).subscribe(response => {
      if (response.result && response.result.value === true) {
        this.enrolledToken = {
          url: response.detail.googleurl.value,
          serial: response.detail.serial
        };
        stepper.next();
      }
    });
  }

  goToAppStep(stepper: MatStepper) {
    stepper.selectedIndex = 1;
  }

  cancel() {
    this.router.navigate(['../']);
  }
}
