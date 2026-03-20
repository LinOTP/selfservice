import { Pipe, PipeTransform } from '@angular/core';
import { EnrolledToken } from '@app/enroll/enroll-dialog-base.directive';
import { Fido2EnrolledToken } from '@app/enroll/enroll-fido2-dialog/enroll-fido2-dialog.component';
import { TokenInfo } from '@app/enroll/enroll-oath-dialog/oath-enrollment/token-info.component';

@Pipe({
    name: 'enrolledTokenToTokenInfo',
    standalone: true
})
export class EnrolledTokenToTokenInfoPipe implements PipeTransform {
    transform(token: EnrolledToken): TokenInfo | null {
        if (!token) {
            return null;
        }

        if (token.type !== 'fido2') {
          return token as TokenInfo;
        }

        const fido2Token = token as Fido2EnrolledToken;
        const rpName = fido2Token.registerrequest?.rp?.name;
        const rpId = fido2Token.registerrequest?.rp?.id;

        return {
            ...token,
            rpName: rpName,
            rpId: rpId,
        } as TokenInfo;
    }
}
