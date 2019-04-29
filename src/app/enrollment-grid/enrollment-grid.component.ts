import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenType, tokenTypes } from '../token';

@Component({
  selector: 'app-enrollment-grid',
  templateUrl: './enrollment-grid.component.html',
  styleUrls: ['./enrollment-grid.component.scss']
})
export class EnrollmentGridComponent implements OnInit {

  public tokenTypes: TokenType[] = tokenTypes;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() { }

  startEnrollment(tokentype: TokenType) {
    this.router.navigate(['/enroll', tokentype.type]);
  }

}
