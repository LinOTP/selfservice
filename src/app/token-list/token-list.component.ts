import { Component, OnInit } from '@angular/core';

import { Token, EnrollmentStatus, tokenTypeDetails } from '../api/token';
import { TokenService } from '../api/token.service';
import { Permission } from '../common/permissions';
import { AppInitService } from '../app-init.service';

@Component({
  selector: 'app-token-list',
  templateUrl: './token-list.component.html',
  styleUrls: ['./token-list.component.scss']
})

export class TokenListComponent implements OnInit {
  public EnrollmentStatus = EnrollmentStatus;
  public enrollmentPermissions: Permission[] = tokenTypeDetails.map(tt => tt.enrollmentPermission).filter(p => !!p);

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
