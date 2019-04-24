import { Component, OnInit } from '@angular/core';
import { TokenService } from '../token.service';
import { Router } from '@angular/router';
import { TokenType } from '../token';

@Component({
  selector: 'app-enrollment-grid',
  templateUrl: './enrollment-grid.component.html',
  styleUrls: ['./enrollment-grid.component.scss']
})
export class EnrollmentGridComponent implements OnInit {

  public tokenTypes: TokenType[];

  constructor(
    private tokenService: TokenService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.tokenTypes = this.tokenService.tokenTypes;
  }

  startEnrollment(tokentype: TokenType) {
    this.router.navigate(['/enroll', tokentype.type]);
  }

}
