import { Component, OnInit, Type } from '@angular/core';
import { EnrollHotpComponent } from './enroll-hotp/enroll-hotp.component';
import { EnrollTotpComponent } from './enroll-totp/enroll-totp.component';
import { EnrollPushComponent } from './enroll-push/enroll-push.component';
import { Router } from '@angular/router';
import { MatSelectChange } from '@angular/material';

@Component({
  selector: 'app-enroll',
  templateUrl: './enroll.component.html',
  styleUrls: ['./enroll.component.scss']
})
export class EnrollComponent implements OnInit {

  public tokentypes: { type: string, description: string }[] = [
    {
      type: 'hotp',
      description: 'Event-based soft token (HOTP)'
    },
    {
      type: 'totp',
      description: 'Time-based soft token (TOTP)'
    },
    {
      type: 'push',
      description: 'KeyIdentity Push Token'
    },
  ];

  constructor(private router: Router) { }

  ngOnInit() {
  }

  onSelectChange(event: MatSelectChange) {
    this.router.navigate(['tokens/enroll', event.value]);
  }


}
