import { SignRequest } from "@app/login/login.service";
import { AttestationResponse, Fido2RegisterRequest, Fido2RegistrationCredential } from "./enroll-fido2-dialog.component";

export function getOrigin(): string {
  return window.location.origin;
}

export const invalidOriginForRpIdErrMsg = (rpId: string) => {
  return $localize `Relying party mismatch. This FIDO2 token is registered for "${rpId}" and cannot be used from "${window.location.hostname}".`
}

export function isOriginValidForRpId(origin: string, rpId: string): boolean{
  if (!origin || !rpId) {
    return false;
  }

  let hostname: string;
  try {
    hostname = new URL(origin).hostname;
  } catch {
    return false;
  }

  const normalizedHostname = hostname.toLowerCase();
  const normalizedRpId = rpId.toLowerCase();

  if (normalizedHostname === normalizedRpId) {
    return true;
  }

  // rpId must be a suffix of the hostname separated by a dot,
  // and must contain at least one dot itself (not a bare TLD like "com")
  if (!normalizedRpId.includes('.')) {
    return false;
  }

  return normalizedHostname.endsWith('.' + normalizedRpId);
}

//https://github.com/github/webauthn-json/blob/main/src/webauthn-json/base64url.ts
export function base64urlToBuffer(baseurl64String: string): ArrayBuffer {
  // Base64url to Base64
  const padding = "==".slice(0, (4 - (baseurl64String.length % 4)) % 4);
  const base64String =
    baseurl64String.replace(/-/g, "+").replace(/_/g, "/") + padding;

  // Base64 to binary string
  const str = atob(base64String);

  // Binary string to buffer
  const buffer = new ArrayBuffer(str.length);
  const byteView = new Uint8Array(buffer);
  for (let i = 0; i < str.length; i++) {
    byteView[i] = str.charCodeAt(i);
  }
  return buffer;
}

export function bufferToBase64url(buffer: ArrayBuffer): string {
  // Buffer to binary string
  const byteView = new Uint8Array(buffer);
  let str = "";
  for (const charCode of byteView) {
    str += String.fromCharCode(charCode);
  }

  // Binary string to base64
  const base64String = btoa(str);

  // Base64 to base64url
  // We assume that the base64url string is well-formed.
  const base64urlString = base64String
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return base64urlString;
}

export function isFido2Supported(): boolean {
  return !!(
    navigator.credentials &&
    navigator.credentials.get &&
    navigator.credentials.create &&
    window.PublicKeyCredential
  );
}

export function mapAssertionResponseToJson(assertion: PublicKeyCredential): string {
  const assertionResponse = assertion.response as AuthenticatorAssertionResponse;
  const assertionJSON = JSON.stringify({
    id: assertion.id,
    rawId: bufferToBase64url(assertion.rawId),
    response: {
      authenticatorData: bufferToBase64url(assertionResponse.authenticatorData),
      clientDataJSON: bufferToBase64url(assertionResponse.clientDataJSON),
      signature: bufferToBase64url(assertionResponse.signature),
    },
    type: assertion.type,
  });
  return assertionJSON;
}

export function mapSignRequestToPublicKeyOptions(signrequest: SignRequest): PublicKeyCredentialRequestOptions {
  const publicKeyOptions: PublicKeyCredentialRequestOptions = {
    ...signrequest,
    challenge: base64urlToBuffer(signrequest.challenge),
    allowCredentials: signrequest.allowCredentials?.map((cred) => ({
      ...cred,
      id: base64urlToBuffer(cred.id),
    }))
  };
  return publicKeyOptions;
}

export function mapCredentialToAttestationResponse(
  creds: Fido2RegistrationCredential
): AttestationResponse {
  return {
    id: creds.id,
    rawId: bufferToBase64url(creds.rawId),
    authenticatorAttachment: creds.authenticatorAttachment ?? null,
    type: creds.type,
    response: {
      clientDataJSON: bufferToBase64url(
        creds.response.clientDataJSON
      ),
      attestationObject: bufferToBase64url(
        creds.response.attestationObject
      ),
    },
    transports: creds.response.getTransports ? creds.response.getTransports() as AuthenticatorTransport[] : null,
    clientExtensionResults: creds.getClientExtensionResults ? creds.getClientExtensionResults() : null,
  };
}



export function convertToWebAuthnOptions(
    req: Fido2RegisterRequest,
  ): PublicKeyCredentialCreationOptions {
    return {
      ...req,
      user: {
        ...req.user,
        id: base64urlToBuffer(req.user.id),
      },
      excludeCredentials: req.excludeCredentials?.map((cred) => ({
        ...cred,
        id: base64urlToBuffer(cred.id),
      })),
      challenge: base64urlToBuffer(req.challenge),
      attestation: req.attestation ?? "none",
    };
  }
