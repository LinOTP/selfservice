import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { TokenService } from '../token.service';
import { Token } from '../token';

@Component({
  selector: 'app-token-list',
  templateUrl: './token-list.component.html',
  styleUrls: ['./token-list.component.scss']
})

export class TokenListComponent implements OnInit {
  tokens: Token[];

  constructor(private tokenService: TokenService) {
  }

  getTokens(): void {
    this.tokenService.getTokens().subscribe(tokens => this.tokens = tokens);
  }

  ngOnInit() {
    this.getTokens();
  }

}
