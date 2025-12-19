import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';

import { EnrollmentOptions, TokenType } from '@api/token';
import { EnrollDialogBase } from '@app/enroll/enroll-dialog-base.directive';
import { PlatformProviderService } from "@common/platform-provider.service";

export interface OATHEnrolledToken {
  serial: string
  type: TokenType;
  description: string;
  url: string;
  seed: string;
}

@Component({
    selector: 'app-enroll-oath',
    templateUrl: './enroll-oath-dialog.component.html',
    styleUrls: ['./enroll-oath-dialog.component.scss'],
    providers: [PlatformProviderService],
    standalone: false
})
export class EnrollOATHDialogComponent extends EnrollDialogBase implements OnInit {

  public enrolledToken: OATHEnrolledToken;

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public get tokenVerified() {
    return this._tokenVerified;
  }
  public set tokenVerified(value) {
    this._tokenVerified = value;

    if (value && this.stepper.selectedIndex === 2 && this.verifyPolicyEnabled) {
      setTimeout(() => {
        this.stepper.next();
      }, 100)
    }
  }
  private _tokenVerified = false;
  protected platformProvider = inject(PlatformProviderService)

  public enrollOATHToken() {
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: this.createTokenForm.get('description').value,
    };
    this.enrollToken(body, this.stepper).subscribe(token => {
      this.enrolledToken = {
        url: token.googleurl.value,
        serial: token.serial,
        seed: token.otpkey.value,
        type: token.type,
        description: body.description,
        };
    });
  }
}
