import { Component, OnInit, ViewChild } from "@angular/core";
import { MatStepper } from "@angular/material/stepper";
import { ActivationDetail } from "@app/api/enrollment.service";
import {
  EnrollDialogBase,
  EnrolledToken,
} from "@app/enroll/enroll-dialog-base.directive";
import { catchError, delay, EMPTY, from, map, Observable, switchMap, tap } from "rxjs";
import { base64urlToBuffer, bufferToBase64url } from "./fido2-utils";

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

export interface Fido2RegisterRequest {
  rp: RpEntity;
  user: UserEntity;
  challenge: string;
  pubKeyCredParams: PubKeyCredParam[];
  timeout?: number;
  authenticatorSelection?: AuthenticatorSelection;
  attestation?: "none" | "indirect" | "direct";
}

export interface AttestationResponse {
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
  };
}
export interface Fido2EnrolledToken extends EnrolledToken {
  registerrequest: Fido2RegisterRequest;
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
            return this.activate()
          }),
          catchError(() => this.handleError()),
        )
        .subscribe()
      );
  }

  activate(): Observable<ActivationDetail> {
    this.activationFailed = false
    return this.enrollmentService.fido2_activate_begin(this.enrolledToken!.serial, this.enrolledToken!.type).pipe(delay(1000))
      .pipe(
        switchMap((res) => from(navigator.credentials.create({publicKey: this.convertToWebAuthnOptions(res)}))),
        map((creds: any) => {
          return {
            id: creds.id,
            rawId: bufferToBase64url(creds.rawId),
            response: {
              clientDataJSON: bufferToBase64url(creds.response.clientDataJSON),
              attestationObject: bufferToBase64url(creds.response.attestationObject),
            },
            type: creds.type
          };
        }),
        switchMap((attestationResponse) => this.enrollmentService.fido2_activate_finish( this.enrolledToken!.serial, attestationResponse)),
        tap((res) => res ? this.goToNextStep(this.stepper) : this.handleError() ),
        catchError(() => this.handleError()),
      )
  }

  convertToWebAuthnOptions(
    req: Fido2RegisterRequest,
  ): PublicKeyCredentialCreationOptions {
    return {
      rp: {
        id: req.rp.id,
        name: req.rp.name,
      },
      user: {
        id: base64urlToBuffer(req.user.id),
        name: req.user.name,
        displayName: req.user.displayName,
      },
      challenge: base64urlToBuffer(req.challenge),
      pubKeyCredParams: req.pubKeyCredParams,
      timeout: req.timeout,
      authenticatorSelection: {
        ...req.authenticatorSelection,
      },
      attestation: req.attestation ?? "none",
    };
  }

  isSupported() {
    return !!(
      navigator.credentials &&
      navigator.credentials.get &&
      navigator.credentials.create &&
      window.PublicKeyCredential
    );
  }

  handleError() {
    const notSupportedErr = $localize`Your browser does not support FIDO2 enrollment.`
    const other = $localize`The operation either timed out or was not allowed.`
    this.errMsg = this.isSupported() ? other : notSupportedErr
    this.activationFailed = true;
    return EMPTY;
  }
}
