import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Token } from '../token';
import { TokenService } from '../token.service';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss']
})
export class TokenComponent implements OnInit {
  token: Token;

  constructor(private route: ActivatedRoute, private tokenService: TokenService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.getToken(params.id);
    });
  }

  getToken(id): void {
    this.tokenService.getToken(id).subscribe(token => this.token = token);
  }
}
