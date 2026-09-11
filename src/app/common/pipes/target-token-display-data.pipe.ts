import { Pipe, PipeTransform } from '@angular/core';

import { SelfserviceToken, TokenDisplayData, tokenDisplayData } from '@api/token';
import { TokenInfo } from '@app/enroll/enroll-oath-dialog/oath-enrollment/token-info.component';

@Pipe({
    name: 'targetTokenDisplayData',
    standalone: true
})
export class TargetTokenDisplayDataPipe implements PipeTransform {
    transform(token: SelfserviceToken | TokenInfo): TokenDisplayData | undefined {
        return tokenDisplayData.find(t => t.type === token.targetTokenInfo?.type?.toLowerCase());
    }
}
