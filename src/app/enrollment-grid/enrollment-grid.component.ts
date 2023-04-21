import { Component } from '@angular/core';

import { TokenDisplayData } from '@api/token';
import { TokenService } from '@api/token.service';

@Component({
  selector: 'app-enrollment-grid',
  templateUrl: './enrollment-grid.component.html',
  styleUrls: ['./enrollment-grid.component.scss']
})
export class EnrollmentGridComponent {

  public tokenTypes: TokenDisplayData[] = this.tokenService.getEnrollableTypes();


  constructor(
    private tokenService: TokenService,
  ) { }
}
