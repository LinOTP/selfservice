import { Component, OnInit, Type } from '@angular/core';
import { EnrollHotpComponent } from './enroll-hotp/enroll-hotp.component';
import { EnrollTotpComponent } from './enroll-totp/enroll-totp.component';
import { EnrollPushComponent } from './enroll-push/enroll-push.component';
import { Router } from '@angular/router';
import { MatSelectChange } from '@angular/material';
import { TokenService } from '../token.service';

@Component({
  selector: 'app-enroll',
  templateUrl: './enroll.component.html',
  styleUrls: ['./enroll.component.scss']
})
export class EnrollComponent implements OnInit {

  public tokentypes = this.tokenService.tokenTypes;

  constructor(
    private router: Router,
    private tokenService: TokenService,
  ) { }

  ngOnInit() {
  }

  onSelectChange(event: MatSelectChange) {
    this.router.navigate(['enroll', event.value]);
  }

}
