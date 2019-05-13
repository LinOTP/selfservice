import { Component, OnInit } from '@angular/core';

import { Token, EnrollmentStatus } from '../api/token';
import { TokenService } from '../api/token.service';
import { EnrollmentPermissions } from '../permissions';

@Component({
  selector: 'app-token-list',
  templateUrl: './token-list.component.html',
  styleUrls: ['./token-list.component.scss']
})

export class TokenListComponent implements OnInit {
  public tokens: Token[];
  public EnrollmentStatus = EnrollmentStatus;
  public EnrollmentPermissions = EnrollmentPermissions;

  constructor(
    private tokenService: TokenService,
  ) { }

  ngOnInit() {
    this.loadTokens();
  }

  loadTokens() {
    this.tokenService.getTokens().subscribe(tokens => {
      this.tokens = tokens;
    });
  }

}
