import { Pipe, PipeTransform } from '@angular/core';

import { EnrollmentStatus, SelfserviceToken } from '@api/token';

@Pipe({
    name: 'activeTokens',
    pure: true,
    standalone: false
})
export class ActiveTokensPipe implements PipeTransform {

  transform(value: SelfserviceToken[]): any {
    return value.filter(t => t.enrollmentStatus === EnrollmentStatus.COMPLETED && t.enabled);
  }

}
