import { Pipe, PipeTransform } from '@angular/core';

import { EnrollmentStatus, SelfserviceToken } from '@api/token';

@Pipe({
  name: 'unreadyTokens',
  pure: true,
})
export class UnreadyTokensPipe implements PipeTransform {

  transform(value: SelfserviceToken[]): any {
    return value.filter(t => t.enrollmentStatus !== EnrollmentStatus.COMPLETED);
  }

}
