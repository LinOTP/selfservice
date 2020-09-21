import { Component, OnInit } from '@angular/core';

import { Token, EnrollmentStatus } from '../api/token';
import { TokenService } from '../api/token.service';
import { EnrollmentPermissions } from '../common/permissions';
import { AppInitService } from '../app-init.service';

@Component({
  selector: 'app-token-list',
  templateUrl: './token-list.component.html',
  styleUrls: ['./token-list.component.scss']
})

export class TokenListComponent implements OnInit {
  public EnrollmentStatus = EnrollmentStatus;
  public EnrollmentPermissions = EnrollmentPermissions;

  public tokens: Token[];
  public permissionsLoaded: boolean;

  constructor(
    private tokenService: TokenService,
    private appInitService: AppInitService,
  ) { }

  ngOnInit() {
    this.loadTokens();

    this.appInitService.getPermissionLoad$().subscribe(permissionsLoaded => {
      this.permissionsLoaded = permissionsLoaded;
    });
  }

  loadTokens() {
    this.tokenService.getTokens().subscribe(tokens => {
      this.tokens = tokens;
    });
  }

}
