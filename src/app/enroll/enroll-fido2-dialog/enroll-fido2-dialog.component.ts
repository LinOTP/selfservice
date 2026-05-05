import { Component, OnInit, ViewChild } from "@angular/core";
import { MatStepper } from "@angular/material/stepper";
import { ActivationDetail } from "@app/api/enrollment.service";
import {
  EnrollDialogBase,
  EnrolledToken,
} from "@app/enroll/enroll-dialog-base.directive";
import { catchError, delay, EMPTY, from, map, Observable, switchMap, tap } from "rxjs";
import { convertToWebAuthnOptions, getOrigin, invalidOriginForRpIdErrMsg, isFido2Supported, isOriginValidForRpId, mapCredentialToAttestationResponse } from "./fido2-utils";

interface RpEntity {
  id: string;
  name: string;
}

interface UserEntity {
  id: string;
  name: string;
  displayName: string;
}

interface PubKeyCredParam {
  type: "public-key";
  alg: number;
}

interface AuthenticatorSelection {
  userVerification?: "required" | "preferred" | "discouraged";
}

interface CredentialDescriptor {
  id: string;
  type: "public-key";
  transports?: AuthenticatorTransport[];
}

export interface Fido2RegisterRequest {
  rp: RpEntity;
  user: UserEntity;
  challenge: string;
  pubKeyCredParams: PubKeyCredParam[];
  excludeCredentials?: CredentialDescriptor[];
  timeout?: number;
  authenticatorSelection?: AuthenticatorSelection;
  attestation?: "none" | "indirect" | "direct";
}

export interface AttestationResponse {
  id: string;
  rawId: string;
  type: string;
  authenticatorAttachment: string,
  response: {
    clientDataJSON: string;
    attestationObject: string;
  };
  transports: AuthenticatorTransport[];
  clientExtensionResults: AuthenticationExtensionsClientOutputs
}
export interface Fido2EnrolledToken extends EnrolledToken {
  registerrequest: Fido2RegisterRequest;
}


export type Fido2RegistrationCredential = PublicKeyCredential & {
  response: AuthenticatorAttestationResponse;
}

@Component({
  selector: "app-enroll-fido2-dialog",
  templateUrl: "./enroll-fido2-dialog.component.html",
  styleUrl: "./enroll-fido2-dialog.component.scss",
  standalone: false,
})
export class EnrollFIDO2DialogComponent
  extends EnrollDialogBase
  implements OnInit
{
  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  activationFailed = false;
  errMsg: string | undefined
  allowActivationRetry = true

  public createToken(): void {
    if (this.createTokenForm.invalid) {
      this.announceFormErrors();
      return;
    }
    const body = {
      type: this.tokenDisplayData.type,
      description: this.createTokenForm.get("description")!.value,
    };
    this.subscriptions.push(
      this.enrollToken(body, this.stepper)
        .pipe(
          switchMap((token: Fido2EnrolledToken) => {
            this.enrolledToken = token;
            if (!isOriginValidForRpId(getOrigin(), token.registerrequest.rp.id)) {
                this.allowActivationRetry = false
              return this.handleError(invalidOriginForRpIdErrMsg(token.registerrequest.rp.id));
            }
            return this.activate();
          }),
          catchError((err) => this.handleError(err)),
        ).subscribe()
      );
  }

  activate(): Observable<ActivationDetail> {
    this.activationFailed = false
    return this.enrollmentService.fido2_activate_begin(this.enrolledToken!.serial, this.enrolledToken!.type).pipe(delay(1000))
      .pipe(
        switchMap((res) => from(navigator.credentials.create({publicKey: convertToWebAuthnOptions(res)}))),
        map((creds: Fido2RegistrationCredential) => mapCredentialToAttestationResponse(creds)),
        switchMap((attestationResponse) => this.enrollmentService.fido2_activate_finish( this.enrolledToken!.serial, attestationResponse)),
        tap((res) => res ? this.goToNextStep(this.stepper) : this.handleError()),
        catchError((err) => this.handleError(err)),
      )
  }

  isSupported() {
    return isFido2Supported();
  }

  handleError(errMsg?: string) {
    const genericError = $localize`Token activation failed: Please try again.`
    const notSupportedErr = $localize`Your browser does not support FIDO2 enrollment.`
    this.errMsg = !isFido2Supported() ? notSupportedErr : errMsg ?? genericError
    console.error(`${this.enrolledToken.serial}: ${this.errMsg}`)
    this.activationFailed = true;
    return EMPTY;
  }
}
