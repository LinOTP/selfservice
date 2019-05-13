import { Component, OnInit, Type } from '@angular/core';
import { EnrollHotpDialogComponent } from '../enroll/enroll-hotp-dialog/enroll-hotp-dialog.component';
import { EnrollTotpComponent } from './enroll-totp/enroll-totp.component';
import { EnrollPushDialogComponent } from './enroll-push-dialog/enroll-push-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSelectChange } from '@angular/material';
import { TokenService } from '../api/token.service';
import { tokenTypes } from '../api/token';

@Component({
  selector: 'app-enroll',
  templateUrl: './enroll.component.html',
  styleUrls: ['./enroll.component.scss']
})
export class EnrollComponent implements OnInit {

  public tokentypes = tokenTypes;
  public selectedType: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService,
  ) { }

  ngOnInit() {
    if (this.route.children.length > 0) { // set the selector to the route defined token type
      this.route.children[0].url.subscribe(segment => this.selectedType = segment[0].path);
    }
  }

  onSelectChange(event: MatSelectChange) {
    this.router.navigate(['enroll', event.value]);
  }

}
