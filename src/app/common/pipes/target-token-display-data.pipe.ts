import { Pipe, PipeTransform } from '@angular/core';

import { SelfserviceToken, TokenDisplayData, tokenDisplayData } from '@api/token';

@Pipe({
    name: 'targetTokenDisplayData',
    standalone: true
})
export class TargetTokenDisplayDataPipe implements PipeTransform {
    transform(token: SelfserviceToken): TokenDisplayData | undefined {
        return tokenDisplayData.find(t => t.type === token.targetTokenInfo?.type?.toLowerCase());
    }
}
