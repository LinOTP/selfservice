import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'rpTooltip',
    standalone: true
})
export class RpTooltipPipe implements PipeTransform {
    transform(value: { rpName?: string; rpId?: string }): string {
        if (value?.rpName && value?.rpId) {
            return $localize`:@@relyingPartyIdTooltip:Relying party ID: ${value.rpId}:rpId:`;
        }
        return $localize`:@@relyingPartyTooltip:Relying party ID`;
    }
}
