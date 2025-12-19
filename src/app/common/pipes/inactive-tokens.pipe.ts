import { Pipe, PipeTransform } from '@angular/core';

import { EnrollmentStatus, SelfserviceToken } from '@api/token';

@Pipe({
    name: 'inactiveTokens',
    pure: true,
    standalone: false
})
export class InactiveTokensPipe implements PipeTransform {

  transform(value: SelfserviceToken[]): any {
    return value.filter(t => t.enrollmentStatus === EnrollmentStatus.COMPLETED && !t.enabled);
  }

}
