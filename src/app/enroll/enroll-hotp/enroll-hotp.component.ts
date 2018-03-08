import { Component, OnInit } from '@angular/core';
import { EnrollToken } from '../../token';

export interface EnrollHotpToken extends EnrollToken {
  type: 'hotp';
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

  public enrollData: EnrollHotpToken = {
    type: 'hotp',
    description: '',
    otplen: 6,
    hashlib: 'sha1',
    genkey: 1,
  };

  constructor() { }

  ngOnInit() {
  }

}
