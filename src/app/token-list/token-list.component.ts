import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Token, EnrollmentStatus } from '../token';
import { TokenService } from '../token.service';

@Component({
  selector: 'app-token-list',
  templateUrl: './token-list.component.html',
  styleUrls: ['./token-list.component.scss']
})

export class TokenListComponent implements OnInit {
  public tokens: Token[];
  public EnrollmentStatus = EnrollmentStatus;

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
