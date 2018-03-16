import { Component, OnInit } from '@angular/core';

import { NgForm, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material';
import { MaterialModule } from '../../material.module';

import { EnrollToken } from '../../token';
import { TokenService } from '../../token.service';


export interface EnrollPushToken extends EnrollToken {
  type: 'push';
  description: string;
}

@Component({
  selector: 'app-enroll-push',
  templateUrl: './enroll-push.component.html',
  styleUrls: ['./enroll-push.component.scss']
})
export class EnrollPushComponent implements OnInit {

  public enrollData: EnrollPushToken = {
    type: 'push',
    description: '',
  };

  public enrolledToken: { serial: string, url: string };

  constructor(
    private tokenService: TokenService,
  ) { }

  ngOnInit() {
  }

  enroll(stepper: MatStepper) {
    this.tokenService.enroll(this.enrollData).subscribe(response => {
      if (response.result && response.result.value === true) {
        this.enrolledToken = {
          url: response.detail.lse_qr_url.value,
          serial: response.detail.serial
        };
        stepper.next();
      }
    });
  }
}
